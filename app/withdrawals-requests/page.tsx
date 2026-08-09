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
const [openMenuId, setOpenMenuId] = useState<string | null>(null);
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
console.log("Withdrawals found:", snapshot.size);

snapshot.docs.forEach((d) => {
  console.log(d.id, d.data());
});
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

    // Calculate stats right here where 'items' is available
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
    filter === "all"
      ? true
      : item.status === filter;

  return matchesSearch && matchesStatus;

});
const approveWithdrawal = async (withdrawal: any) => {

  const confirmApprove = confirm(
    `Approve CA$${withdrawal.amount} withdrawal?`
  );

  if (!confirmApprove) return;

  try {

    // 1. Mark withdrawal approved

    await updateDoc(
      doc(db, "withdrawals", withdrawal.id),
      {
        status: "Approved",
        approvedAt: new Date(),
      }
    );

    // 2. Reduce creator pending balance

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

}};
const rejectWithdrawal = async (withdrawal: any) => {

  const confirmReject = confirm(
    `Reject CA$${withdrawal.amount} withdrawal?`
  );

  if (!confirmReject) return;

  try {

    // Mark request rejected

    await updateDoc(
      doc(db, "withdrawals", withdrawal.id),
      {
        status: "Rejected",
        rejectedAt: new Date(),
      }
    );

    // Return money to creator

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

      <h1>
        💰 Withdrawal Requests
      </h1>
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "20px",
    marginTop: "30px",
    marginBottom: "35px",
  }}
>

  <div
    style={{
      background: "white",
      borderRadius: "16px",
      padding: "25px",
      boxShadow: "0 4px 15px rgba(0,0,0,.08)",
    }}
  >
    <div style={{ color: "#777" }}>Pending</div>

    <h1 style={{ color: "#f59e0b" }}>
      {stats.pending}
    </h1>
  </div>

  <div
    style={{
      background: "white",
      borderRadius: "16px",
      padding: "25px",
      boxShadow: "0 4px 15px rgba(0,0,0,.08)",
    }}
  >
    <div style={{ color: "#777" }}>
      Approved
    </div>

    <h1 style={{ color: "#22c55e" }}>
      {stats.approved}
    </h1>
  </div>

  <div
    style={{
      background: "white",
      borderRadius: "16px",
      padding: "25px",
      boxShadow: "0 4px 15px rgba(0,0,0,.08)",
    }}
  >
    <div style={{ color: "#777" }}>
      Rejected
    </div>

    <h1 style={{ color: "#ef4444" }}>
      {stats.rejected}
    </h1>
  </div>

  <div
    style={{
      background: "white",
      borderRadius: "16px",
      padding: "25px",
      boxShadow: "0 4px 15px rgba(0,0,0,.08)",
    }}
  >
    <div style={{ color: "#777" }}>
      Total Paid
    </div>

    <h1 style={{ color: "#2563eb" }}>
      CA${stats.totalPaid.toFixed(2)}
    </h1>
  </div>

</div>
<div
style={{
display:"flex",
justifyContent:"space-between",
marginBottom:"30px",
gap:"20px",
}}
>

<input
placeholder="Search creator..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
style={{
flex:1,
padding:"14px",
borderRadius:"12px",
border:"1px solid #ddd",
fontSize:"15px"
}}
/>

<select
value={filter}
onChange={(e)=>setFilter(e.target.value)}
style={{
padding:"14px",
borderRadius:"12px",
border:"1px solid #ddd",
minWidth:"180px",
fontSize:"15px"
}}
>

<option value="all">
All Requests
</option>

<option value="Pending">Pending</option>

<option value="Approved">Approved</option>

<option value="Rejected">Rejected</option>
</select>
</div>
<table
style={{
width:"100%",
borderCollapse:"collapse",
background:"white",
borderRadius:"20px",
position: "relative", // <-- ADD THIS
overflow: "visible",
boxShadow:"0 6px 20px rgba(0,0,0,.08)"
}}
>
   <thead>
          <tr>

            <th>Creator</th>

            <th>Amount</th>

            <th>Method</th>

            <th>Details</th>

            <th>Status</th>

            <th>Date</th>

            <th> Actions</th>

          </tr>

        </thead>

        <tbody>

          {filteredWithdrawals.map((item)=>(

            <tr key={item.id}>

              <td>

  <div
    style={{
      fontWeight: "bold",
    }}
  >
    {item.creatorName}
  </div>

  <div
    style={{
      color: "#777",
      fontSize: "13px",
    }}
  >
    {item.creatorEmail}
  </div>

</td>

              <td>

<div
style={{
fontWeight:"300",
}}
>
Reque:CA${Number(item.requestedAmount || 0).toFixed(2)}
</div>

<div
style={{
fontSize:"13px",
color:"#16a34a",
marginTop:"4px",
}}
>
Payout:CA${Number(item.finalPayout || 0).toFixed(2)}
</div>

</td>

              <td>{item.withdrawMethod}</td>

              <td>

                {item.withdrawMethod === "telebirr"
                  ? item.telebirrNumber
                  : `${item.bankName} (${item.accountNumber})`}

              </td>

              <td>

<span
style={{
padding:"8px 16px",
borderRadius:"40px",
fontWeight:"bold",
fontSize:"14px",

background:
item.status==="Approved"
? "#DCFCE7"

: item.status==="Rejected"
? "#FEE2E2"

: "#FEF3C7",

color:
item.status==="Approved"
? "#15803D"

: item.status==="Rejected"
? "#B91C1C"

: "#B45309",

}}
>

{item.status.toUpperCase()}

</span>

</td>

              <td>

                {item.requestedAt?.toDate?.().toLocaleDateString()}

              </td>

<td 
style={{ position: "relative" }}>
                {item.status?.toLowerCase() === "pending" ? (
                  <>
                    <button
                      onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                      style={{
                        background: "#f1f5f9",
                        color: "#334155",
                        border: "1px solid #cbd5e1",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      ⚙ ▼
                    </button>

                    {openMenuId === item.id && (
                      <div
                        style={{
                          position: "absolute",
                          right: "0px",
                          top: "100px",
                          background: "white",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                          borderRadius: "12px",
                          overflow: "hidden",
                          zIndex: 100,
                          minWidth: "150px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <button
                          onClick={() => {
                            approveWithdrawal(item);
                            setOpenMenuId(null);
                          }} 
                          className="interactive-btn"
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            textAlign: "left",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#16a34a",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          ✅ Approve
                        </button>

                        <button
                          onClick={() => {
                            rejectWithdrawal(item);
                            setOpenMenuId(null);
                          }}
                          className="interactive-btn"
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            textAlign: "left",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#dc2626",
                          }}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    )}
                  </>
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