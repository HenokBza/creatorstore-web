"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { FaTiktok, FaFacebook, FaYoutube, FaInstagram } from "react-icons/fa";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function Dashboard() {
  const [userData, setUserData] = useState<any>(null);

  const [stats, setStats] = useState({
    visits: 0,
    revenue: 0,
    products: 0,
    coachingCalls: 0,
    customers: 0,
  });

  const [graphData, setGraphData] = useState([
    { month: "Jan", visits: 0, revenue: 0 },
    { month: "Feb", visits: 0, revenue: 0 },
    { month: "Mar", visits: 0, revenue: 0 },
    { month: "Apr", visits: 0, revenue: 0 },
    { month: "May", visits: 0, revenue: 0 },
    { month: "Jun", visits: 0, revenue: 0 },
    { month: "July", visits: 0, revenue: 0 },
    { month: "Aug", visits: 0, revenue: 0 },
    { month: "Sep", visits: 0, revenue: 0 },
    { month: "Oct", visits: 0, revenue: 0 },
    { month: "Nov", visits: 0, revenue: 0 },
    { month: "Dec", visits: 0, revenue: 0 },
  ]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribeUser = onSnapshot(userRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      setUserData(data);

      setStats((prev) => ({
        ...prev,
        visits: data.visits || 0,
      }));
    });

    const fetchStoreStats = async () => {
      try {
        const productsQuery = query(
          collection(db, "products"),
          where("userId", "==", user.uid)
        );
        const productsSnapshot = await getDocs(productsQuery);
        
        let productRevenue = 0;
        let productCustomers = 0;

        productsSnapshot.forEach((docSnap) => {
          const product = docSnap.data();
          productRevenue += Number(product.revenue || 0);
          productCustomers += Number(product.customers || 0);
        });

        const coachingSnapshot = await getDocs(
          collection(db, "coachingCalls")
        );

        let coachingRevenue = 0;
        let coachingCustomers = 0;
        let coachingCount = 0;

        coachingSnapshot.forEach((docSnap) => {
          const coaching = docSnap.data();
          const ownerId = coaching.creatorId || coaching.userId;

          if (ownerId === user.uid) {
            coachingCount += 1;
            coachingRevenue += Number(coaching.revenue || 0);
            coachingCustomers += Number(coaching.customers || 0);
          }
        });

        const ordersQuery = query(
          collection(db, "orders"),
          where("creatorId", "==", user.uid)
        );
        const ordersSnapshot = await getDocs(ordersQuery);

        const monthlyDataMap: { [key: string]: { visits: number; revenue: number } } = {
          "Jan": { visits: 0, revenue: 0 },
          "Feb": { visits: 0, revenue: 0 },
          "Mar": { visits: 0, revenue: 0 },
          "Apr": { visits: 0, revenue: 0 },
          "May": { visits: 0, revenue: 0 },
          "Jun": { visits: 0, revenue: 0 },
          "July": { visits: 0, revenue: 0 },
          "Aug": { visits: 0, revenue: 0 },
          "Sep": { visits: 0, revenue: 0 },
          "Oct": { visits: 0, revenue: 0 },
          "Nov": { visits: 0, revenue: 0 },
          "Dec": { visits: 0, revenue: 0 },
        };

        ordersSnapshot.forEach((docSnap) => {
          const order = docSnap.data();
          const amount = Number(order.amount || 0);

          if (order.createdAt) {
            const date = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const monthStr = monthNames[date.getMonth()];

            if (monthlyDataMap[monthStr]) {
              monthlyDataMap[monthStr].revenue += amount;
              monthlyDataMap[monthStr].visits += Number(order.visits || 1);
            }
          }
        });

        const formattedGraphData = Object.keys(monthlyDataMap).map((month) => ({
          month,
          visits: monthlyDataMap[month].visits,
          revenue: monthlyDataMap[month].revenue,
        }));

        setGraphData(formattedGraphData);

        const totalRevenue = productRevenue + coachingRevenue;
        const totalCustomers = productCustomers + coachingCustomers;

        setStats((prev) => ({
          ...prev,
          revenue: totalRevenue,
          products: productsSnapshot.size,
          coachingCalls: coachingCount,
          customers: totalCustomers,
        }));
      } catch (error) {
        console.error("Error fetching store stats:", error);
      }
    };

    fetchStoreStats();

    return () => {
      unsubscribeUser();
    };
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${userData?.storeURL}`);
    alert("Store link copied!");
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div
        style={{
          background: "#D4AF37",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "20px",
          fontWeight: "bold",
        }}
      >
        Welcome to CreatorStore 🚀
        <div>
          <h1>{userData?.name || "Creator"}</h1>
          <p style={{ color: "#f11329", margin: 0 }}>{userData?.storeURL}</p>
        </div>
      </div>

      <button
        onClick={copyLink}
        className="interactive-btn"
        style={{
          color: "blue",
          background: "white",
          border: "none",
          padding: "10px 16px",
          borderRadius: "10px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "12px",
          marginBottom: "20px",
        }}
      >
        copy Store 🔗
      </button>

      {/* Social Media Icons */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="interactive-btn" style={{ color: "black", fontSize: "28px" }}><FaTiktok /></a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="interactive-btn" style={{ color: "#1877F2", fontSize: "28px" }}><FaFacebook /></a>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="interactive-btn" style={{ color: "#FF0000", fontSize: "28px" }}><FaYoutube /></a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="interactive-btn" style={{ color: "#E4405F", fontSize: "28px" }}><FaInstagram /></a>
      </div>

      {/* LIVE STATS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        <div style={{ background: "white", padding: "20px", borderRadius: "12px" }}>
          <h3>💰 Revenue</h3>
          <h2>${stats.revenue}</h2>
        </div>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px" }}>
          <h3>👀 Store Visits</h3>
          <h2>{stats.visits}</h2>
        </div>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px" }}>
          <h3>📦 Products</h3>
          <h2>{stats.products}</h2>
        </div>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px" }}>
          <h3>🎯 Coaching Calls</h3>
          <h2>{stats.coachingCalls}</h2>
        </div>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px" }}>
          <h3>👥 Customers</h3>
          <h2>{stats.customers}</h2>
        </div>
      </div>

      {/* GRAPH */}
      <div
        style={{
          marginTop: "40px",
          background: "#D4AF37",
          padding: "25px",
          borderRadius: "15px",
        }}
      >
        <h2
          style={{
            marginBottom: "20px",
            color: "#000",
          }}
        >
          📈 Store Analytics (All Months)
        </h2>

        <div
          style={{
            width: "100%",
            overflowX: "auto",
          }}
        >
          <div
            style={{
              minWidth: "650px",
              height: "320px",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graphData}>
                <XAxis dataKey="month" stroke="#000" />
                <YAxis stroke="#000" />
                <Tooltip />
                <Bar dataKey="visits" fill="#3417d9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}