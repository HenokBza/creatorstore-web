"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import Link from "next/link";
import {
  collection, query, doc, Timestamp, getDoc, where, getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function EarningsPage() {
  const [stats, setStats] = useState({
    revenue: 0,
    available: 0,
    pending: 0,
    totalPaid: 0,
    sold: 0,
    visits: 0,
    productCount: 0,
  });

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [isStripeConnected, setIsStripeConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadData(user.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadData = async (uid: string) => {
    try {
      setLoading(true);

      // 1. Fetch user document to check stats and Stripe connection status
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();

        setIsStripeConnected(data.stripeConnected === true);

        setStats({
          revenue: Number(data.totalRevenue || 0),
          available: Number(data.availableBalance || 0),
          pending: Number(data.pendingBalance || 0),
          totalPaid: Number(data.totalWithdrawn || 0),
          sold: Number(data.totalSales || 0),
          visits: Number(data.totalVisits || 0),
          productCount: 0,
        });
      }

      // 2. Fetch products separately for the performance list
      const q = query(
        collection(db, "products"),
        where("userId", "==", uid)
      );
      const snapshot = await getDocs(q);
      const bestProducts: any[] = [];

      snapshot.forEach((docSnap) => {
        const product = docSnap.data();
        bestProducts.push({
          id: docSnap.id,
          title: product.title,
          revenue: Number(product.revenue || 0),
          customers: Number(product.customers || 0),
          visits: Number(product.visits || 0),
          thumbnail: product.thumbnail,
          createdAt: product.createdAt,
        });
      });

      // ==========================================
      // CALCULATE CURRENT MONTH REVENUE
      // ==========================================
      const now = new Date();
      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
        0,
        0,
        0,
        0
      );

      const monthlyOrdersQuery = query(
        collection(db, "orders"),
        where("creatorId", "==", uid)
      );

      const monthlyOrdersSnapshot = await getDocs(monthlyOrdersQuery);

      let currentMonthRevenue = 0;

      monthlyOrdersSnapshot.forEach((orderDoc) => {
        const order = orderDoc.data();
        if (!order.createdAt) return;

        let orderDate: Date;
        if (order.createdAt instanceof Timestamp) {
          orderDate = order.createdAt.toDate();
        } else if (order.createdAt?.toDate) {
          orderDate = order.createdAt.toDate();
        } else {
          orderDate = new Date(order.createdAt);
        }

        if (orderDate >= startOfMonth) {
          currentMonthRevenue += Number(order.amount || 0);
        }
      });

      setMonthlyRevenue(currentMonthRevenue);
      bestProducts.sort((a, b) => b.revenue - a.revenue);
      setProducts(bestProducts);
      
      setStats((prev) => ({ ...prev, productCount: bestProducts.length }));
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load earnings.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
          fontSize: "22px",
          fontWeight: "bold",
        }}
      >
        Loading earnings...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          color: "red",
          padding: "30px",
          fontSize: "18px",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1300px",
        margin: "auto",
        paddingBottom: "50px",
      }}
    >
      <h1
        style={{
          fontSize: "34px",
          marginBottom: "8px",
        }}
      >
        💰 Earnings
      </h1>

      <p
        style={{
          color: "#666",
          marginBottom: "35px",
        }}
      >
        Track your revenue, payouts and business growth.
      </p>

      {/* TOP CARDS - DYNAMICALLY RENDERED BASED ON STRIPE CONNECTION */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
          gap: "20px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "20px",
            boxShadow: "0 5px 20px rgba(0,0,0,.06)",
          }}
        >
          <p style={{ color: "#777", marginBottom: "10px" }}>💵 Total Revenue</p>
          <h1>CA${stats.revenue.toFixed(2)}</h1>
          <p style={{ color: "#16a34a", fontWeight: "bold" }}>+0% this month</p>
        </div>

        {!isStripeConnected && (
          <>
            <div
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "20px",
                boxShadow: "0 5px 20px rgba(0,0,0,.06)",
              }}
            >
              <p style={{ color: "#777", marginBottom: "10px" }}>💳 Available Balance</p>
              <h1>CA${stats.available.toFixed(2)}</h1>
              <p style={{ color: "#1b61b2fd", fontWeight: "bold" }}>Ready to withdraw.</p>
            </div>

            <div
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "20px",
                boxShadow: "0 5px 20px rgba(0,0,0,.06)",
              }}
            >
              <p style={{ color: "#777", marginBottom: "10px" }}>⏳ Pending</p>
              <h1>CA${stats.pending.toFixed(2)}</h1>
              <p style={{ color: "#f59e0b", fontWeight: "bold" }}>Processing</p>
            </div>

            <div
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "20px",
                boxShadow: "0 5px 20px rgba(0,0,0,.06)",
              }}
            >
              <p style={{ color: "#777", marginBottom: "10px" }}>💵 Total Paid</p>
              <h1>CA${stats.totalPaid.toFixed(2)}</h1>
              <p style={{ color: "#f59e0b", fontWeight: "bold" }}>Approved</p>
            </div>
          </>
        )}

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "20px",
            boxShadow: "0 5px 20px rgba(0,0,0,.06)",
          }}
        >
          <p style={{ color: "#777", marginBottom: "10px" }}>📦 Products/coaching Sold</p>
          <h1>{stats.sold}</h1>
          <p style={{ color: "#555" }}>Total sales</p>
        </div>
      </div>

      {/* CHART */}
      <div
        style={{
          marginTop: "35px",
          background: "white",
          padding: "30px",
          borderRadius: "20px",
          boxShadow: "0 5px 20px rgba(0,0,0,.06)",
        }}
      >
        <h2>📈 Revenue Overview</h2>
        <div
          style={{
            marginTop: "25px",
            height: "280px",
            borderRadius: "15px",
            background: "linear-gradient(to top,#f7f7f7,#ffffff)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: "50px",
              fontWeight: "bold",
              color: "#D4AF37",
            }}
          >
            CA${stats.revenue.toFixed(2)}
          </div>
        </div>
      </div>

      {/* TWO COLUMNS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "25px",
          marginTop: "35px",
        }}
      >
        {/* SALES */}
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "20px",
            boxShadow: "0 5px 20px rgba(0,0,0,.06)",
          }}
        >
          <h2>🛒 Recent Sales</h2>
          <div
            style={{
              marginTop: "20px",
              padding: "25px",
              background: "#fafafa",
              borderRadius: "15px",
              textAlign: "center",
              color: "#777",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
              }}
            >
              {products.length === 0 ? (
                <div>No sales yet</div>
              ) : (
                products
                  .filter((p) => p.customers > 0)
                  .map((p, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "15px",
                        background: "#fafafa",
                        borderRadius: "12px",
                      }}
                    >
                      <div>
                        <b>{p.title}</b>
                        <div style={{ color: "#666" }}>
                          {p.customers} customer(s)
                        </div>
                      </div>
                      <b>CA${p.revenue.toFixed(2)}</b>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* CONDITIONAL PAYOUT / WITHDRAW CARD */}
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "20px",
            boxShadow: "0 5px 20px rgba(0,0,0,.06)",
          }}
        >
          {isStripeConnected ? (
            <div>
              <h2>⚡ Direct Payouts Active</h2>
              <div
                style={{
                  marginTop: "25px",
                  padding: "20px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "14px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "10px" }}>🟢</div>
                <b style={{ color: "#166534", fontSize: "16px" }}>
                  Stripe Connected
                </b>
                <p
                  style={{
                    color: "#15803d",
                    fontSize: "14px",
                    marginTop: "8px",
                    lineHeight: 1.5,
                  }}
                >
                  Your sales funds are automatically and instantly transferred to your connected Stripe bank account. No manual withdrawal needed!
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h2>🏦 Withdraw Earnings</h2>
              <h1 style={{ marginTop: "20px" }}>
                CA${stats.available.toFixed(2)}
              </h1>
              <p style={{ color: "#777", marginTop: "10px" }}>
                Check availability for payout. Click withdraw.
              </p>

              <Link href="/dashboard/earnings/withdraw">
                <button
                  className="interactive-btn"
                  style={{
                    marginTop: "25px",
                    width: "100%",
                    padding: "16px",
                    background: "#5955a2",
                    color: "white",
                    border: "none",
                    borderRadius: "14px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  Withdraw Earnings
                </button>
              </Link>

              <p
                style={{
                  marginTop: "15px",
                  fontSize: "13px",
                  color: "#777",
                  textAlign: "center",
                }}
              >
                Connect a payment method to receive payouts. Go to settings → payment.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MONTHLY GOAL */}
      <div
        style={{
          marginTop: "35px",
          background: "white",
          padding: "25px",
          borderRadius: "20px",
          boxShadow: "0 5px 20px rgba(0,0,0,.06)",
        }}
      >
        <h2>🎯 Monthly Goal</h2>
        <h1 style={{ marginTop: "20px" }}>
          CA${monthlyRevenue.toFixed(2)} / CA$1000
        </h1>
        <div
          style={{
            marginTop: "20px",
            height: "16px",
            background: "#ececec",
            borderRadius: "50px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${Math.min((monthlyRevenue / 1000) * 100, 100)}%`,
              height: "100%",
              background: "#D4AF37",
            }}
          />
        </div>
        <p style={{ marginTop: "15px", color: "#777" }}>
          {monthlyRevenue >= 1000
            ? "🎉 Congratulations! Monthly goal achieved."
            : `Only CA$${(1000 - monthlyRevenue).toFixed(2)} left to reach your goal.`}
        </p>
      </div>
    </div>
  );
}