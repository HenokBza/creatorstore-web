"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs, getDoc,
  orderBy,
  query, doc, updateDoc, increment,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

export default function WithdrawRequestsPage() {
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalPaid: 0,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          router.replace("/");
          return;
        }

        const userDoc = await getDoc(
          doc(db, "adminuser", user.uid)
        );

        if (!userDoc.exists()) {
          router.replace("/dashboard");
          return;
        }

        const userData = userDoc.data();

        if (userData.role !== "admin") {
          alert("Access denied.");
          router.replace("/dashboard");
          return;
        }

        loadWithdrawals();
      }
    );

    return () => unsubscribe();
  }, []);

  const loadWithdrawals = async () => {
    const q = query(
      collection(db, "withdrawals"),
      orderBy("requestedAt", "desc")
    );

    const snapshot = await getDocs(q);

    const items = await Promise.all(
      snapshot.docs.map(async (withdrawDoc) => {
        const withdrawal = withdrawDoc.data();

        let creatorName = "Unknown";
        let creatorEmail = "";

        const creatorSnap = await getDoc(
          doc(db, "users", withdrawal.creatorId)
        );

        if (creatorSnap.exists()) {
          const creator = creatorSnap.data();
          creatorName = creator.name || "";
          creatorEmail = creator.email || "";
        }

        return {
          id: withdrawDoc.id,
          ...withdrawal,
          creatorName,
          creatorEmail,
        };
      })
    );

    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let totalPaid = 0;

    items.forEach((item: any) => {
      if (item.status === "Pending") {
        pending++;
      } else if (item.status === "Approved") {
        approved++;
        totalPaid += Number(item.finalPayout || 0);
      } else if (item.status === "Rejected") {
        rejected++;
      }
    });

    setStats({
      pending,
      approved,
      rejected,
      totalPaid,
    });

    setWithdrawals(items);
  };

  const filteredWithdrawals = withdrawals.filter((item) => {
    const matchesSearch =
      item.creatorName
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      item.creatorEmail
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      filter === "all" ? true : item.status === filter;

    return matchesSearch && matchesStatus;
  });

  const approveWithdrawal = async (withdrawal: any) => {
    const confirmApprove = confirm(
      `Approve CA$${withdrawal.amount} withdrawal?`
    );

    if (!confirmApprove) return;

    try {
      await updateDoc(
        doc(db, "withdrawals", withdrawal.id),
        {
          status: "Approved",
          approvedAt: new Date(),
        }
      );

      await updateDoc(
        doc(db, "users", withdrawal.creatorId),
        {
          pendingBalance: increment(
            -Number(withdrawal.finalPayout)
          ),
          totalWithdrawn: increment(
            Number(withdrawal.finalPayout)
          ),
        }
      );
      alert("Withdrawal approved ✅");
      loadWithdrawals();
    } catch (error: any) {
      console.log(error);
      alert("Failed to approve withdrawal");
    }
  };

  const rejectWithdrawal = async (withdrawal: any) => {
    const confirmReject = confirm(
      `Reject CA$${withdrawal.amount} withdrawal?`
    );

    if (!confirmReject) return;

    try {
      await updateDoc(
        doc(db, "withdrawals", withdrawal.id),
        {
          status: "Rejected",
          rejectedAt: new Date(),
        }
      );

      await updateDoc(
        doc(db, "users", withdrawal.creatorId),
        {
          pendingBalance: increment(
            -Number(withdrawal.finalPayout)
          ),
          availableBalance: increment(
            Number(withdrawal.requestedAmount)
          ),
        }
      );

      alert("Withdrawal rejected.");
      loadWithdrawals();
    } catch (error) {
      console.log(error);
      alert("Failed to reject withdrawal.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <h1>💰 Withdrawal Requests</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "20px",
          marginTop: "30px",
          marginBottom: "35px",
        }}
      >
        <div style={{ background: "white", borderRadius: "16px", padding: "25px", boxShadow: "0 4px 15px rgba(0,0,0,.08)" }}>
          <div style={{ color: "#777" }}>Pending</div>
          <h1 style={{ color: "#f59e0b" }}>{stats.pending}</h1>
        </div>

        <div style={{ background: "white", borderRadius: "16px", padding: "25px", boxShadow: "0 4px 15px rgba(0,0,0,.08)" }}>
          <div style={{ color: "#777" }}>Approved</div>
          <h1 style={{ color: "#22c55e" }}>{stats.approved}</h1>
        </div>

        <div style={{ background: "white", borderRadius: "16px", padding: "25px", boxShadow: "0 4px 15px rgba(0,0,0,.08)" }}>
          <div style={{ color: "#777" }}>Rejected</div>
          <h1 style={{ color: "#ef4444" }}>{stats.rejected}</h1>
        </div>

        <div style={{ background: "white", borderRadius: "16px", padding: "25px", boxShadow: "0 4px 15px rgba(0,0,0,.08)" }}>
          <div style={{ color: "#777" }}>Total Paid</div>
          <h1 style={{ color: "#2563eb" }}>CA${stats.totalPaid.toFixed(2)}</h1>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "30px",
          gap: "20px",
        }}
      >
        <input
          placeholder="Search creator..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "14px",
            borderRadius: "12px",
            border: "1px solid #ddd",
            fontSize: "15px",
          }}
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: "14px",
            borderRadius: "12px",
            border: "1px solid #ddd",
            minWidth: "180px",
            fontSize: "15px",
          }}
        >
          <option value="all">All Requests</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "white",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 6px 20px rgba(0,0,0,.08)",
        }}
      >
        <thead>
          <tr style={{ background: "#f8fafc", textAlign: "left" }}>
            <th style={{ padding: "16px" }}>Creator</th>
            <th style={{ padding: "16px" }}>Amount</th>
            <th style={{ padding: "16px" }}>Method</th>
            <th style={{ padding: "16px" }}>Details</th>
            <th style={{ padding: "16px" }}>Status</th>
            <th style={{ padding: "16px" }}>Date</th>
            <th style={{ padding: "16px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredWithdrawals.map((item) => (
            <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "16px" }}>
                <div style={{ fontWeight: "bold" }}>{item.creatorName}</div>
                <div style={{ color: "#777", fontSize: "13px" }}>{item.creatorEmail}</div>
              </td>

              <td style={{ padding: "16px" }}>
                <div style={{ fontWeight: "300" }}>
                  Reque: CA${Number(item.requestedAmount || 0).toFixed(2)}
                </div>
                <div style={{ fontSize: "13px", color: "#16a34a", marginTop: "4px" }}>
                  Payout: CA${Number(item.finalPayout || 0).toFixed(2)}
                </div>
              </td>

              <td style={{ padding: "16px" }}>{item.withdrawMethod}</td>

              <td style={{ padding: "16px" }}>
                {item.withdrawMethod === "telebirr"
                  ? item.telebirrNumber
                  : `${item.bankName} (${item.accountNumber})`}
              </td>

              <td style={{ padding: "16px" }}>
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: "40px",
                    fontWeight: "bold",
                    fontSize: "13px",
                    background:
                      item.status === "Approved"
                        ? "#DCFCE7"
                        : item.status === "Rejected"
                        ? "#FEE2E2"
                        : "#FEF3C7",
                    color:
                      item.status === "Approved"
                        ? "#15803D"
                        : item.status === "Rejected"
                        ? "#B91C1C"
                        : "#B45309",
                  }}
                >
                  {item.status.toUpperCase()}
                </span>
              </td>

              <td style={{ padding: "16px" }}>
                {item.requestedAt?.toDate?.().toLocaleDateString()}
              </td>

              <td style={{ padding: "16px" }}>
                {item.status?.toLowerCase() === "pending" ? (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => approveWithdrawal(item)}
                      className="interactive-btn"
                      style={{
                        padding: "8px 12px",
                        background: "#dcfce7",
                        color: "#15803d",
                        border: "1px solid #bbf7d0",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "13px",
                      }}
                    >
                      ✅ Approve
                    </button>

                    <button
                      onClick={() => rejectWithdrawal(item)}
                      className="interactive-btn"
                      style={{
                        padding: "8px 12px",
                        background: "#fee2e2",
                        color: "#b91c1c",
                        border: "1px solid #fecaca",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "13px",
                      }}
                    >
                      ❌ Reject
                    </button>
                  </div>
                ) : (
                  <span style={{ color: "#888", fontStyle: "italic", fontSize: "14px" }}>
                    Completed
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}