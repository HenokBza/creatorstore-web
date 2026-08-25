"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CoachingCallsAdminPage() {
  const [coachingCalls, setCoachingCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<any | null>(null);

  useEffect(() => {
    loadCoachingCalls();
  }, []);

  const loadCoachingCalls = async () => {
    try {
      const callSnap = await getDocs(collection(db, "coachingCalls"));
      const userSnap = await getDocs(collection(db, "users"));

      const creators: any = {};
      userSnap.forEach((doc) => {
        creators[doc.id] = doc.data();
      });

      const list: any = [];
      callSnap.forEach((doc) => {
        const call = doc.data();
        list.push({
          id: doc.id,
          ...call,
          creatorName: creators[call.creatorId]?.name || "Unknown",
        });
      });

      setCoachingCalls(list);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleToggleDisable = async (callId: string, currentStatus: string) => {
    const newStatus = currentStatus === "disabled" ? "active" : "disabled";
    try {
      await updateDoc(doc(db, "coachingCalls", callId), {
        status: newStatus,
      });
      setCoachingCalls((prev) =>
        prev.map((c) => (c.id === callId ? { ...c, status: newStatus } : c))
      );
      alert(`Coaching call successfully ${newStatus === "disabled" ? "disabled" : "activated"}.`);
    } catch (error: any) {
      alert("Error updating coaching status: " + error.message);
    }
  };

  if (loading) {
    return <h2 style={{ padding: "40px" }}>Loading...</h2>;
  }

  return (
    <div
      style={{
        maxWidth: "1500px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <h1>🎯 Coaching Calls</h1>

      <table
        style={{
          width: "100%",
          marginTop: "30px",
          borderCollapse: "collapse",
          background: "white",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
        }}
      >
        <thead>
          <tr style={{ background: "#f8fafc", textAlign: "left" }}>
            <th style={{ padding: "16px" }}>🎯 Coaching Call</th>
            <th style={{ padding: "16px" }}>👤 Creator</th>
            <th style={{ padding: "16px" }}>⏱️ Duration</th>
            <th style={{ padding: "16px" }}>💰 Price</th>
            <th style={{ padding: "16px" }}>🛒 Bookings</th>
            <th style={{ padding: "16px" }}>👁 Views</th>
            <th style={{ padding: "16px" }}>⚙ Actions</th>
          </tr>
        </thead>
        <tbody>
          {coachingCalls.map((call) => (
            <tr key={call.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <img
                    src={call.thumbnail || "/placeholder-product.png"}
                    alt={call.title}
                    style={{
                      width: "55px",
                      height: "55px",
                      borderRadius: "10px",
                      objectFit: "cover",
                      border: "1px solid #ddd",
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontWeight: "700",
                        fontSize: "15px",
                      }}
                    >
                      {call.title}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#888",
                        marginTop: "4px",
                      }}
                    >
                      1-on-1 Session
                    </div>
                  </div>
                </div>
              </td>

              <td style={{ padding: "16px" }}>{call.creatorName}</td>
              <td style={{ padding: "16px" }}>{call.duration || 60} mins</td>
              <td style={{ padding: "16px" }}>CA${call.price}</td>
              <td style={{ padding: "16px" }}>{call.customers || call.bookings || 0}</td>
              <td style={{ padding: "16px" }}>{call.visits || 0}</td>

              <td style={{ padding: "16px", position: "relative" }}>
                <button
                  onClick={() => setOpenMenuId(openMenuId === call.id ? null : call.id)}
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
                  ⚙ Actions ▼
                </button>

                {openMenuId === call.id && (
                  <div
                    style={{
                      position: "absolute",
                      right: "20px",
                      top: "60px",
                      background: "white",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      borderRadius: "12px",
                      overflow: "hidden",
                      zIndex: 50,
                      minWidth: "155px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <button
                      onClick={() => {
                        setSelectedCall(call);
                        setOpenMenuId(null);
                      }}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        textAlign: "left",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#1e293b",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      👁 View Details
                    </button>

                    <button
                      onClick={() => {
                        handleToggleDisable(call.id, call.status);
                        setOpenMenuId(null);
                      }}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        textAlign: "left",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: call.status === "disabled" ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {call.status === "disabled" ? "🟢 Activate" : "🚫 Disable"}
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Coaching Call Details Modal */}
      {selectedCall && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 100,
          }}
        >
          <div style={{ background: "white", padding: "30px", borderRadius: "16px", width: "500px", maxWidth: "90%" }}>
            <h2>Coaching Call Details</h2>
            <p style={{ marginTop: "15px" }}><b>Title:</b> {selectedCall.title}</p>
            <p><b>Creator:</b> {selectedCall.creatorName}</p>
            <p><b>Duration:</b> {selectedCall.duration || 60} minutes</p>
            <p><b>Price:</b> CA${selectedCall.price}</p>
            <p><b>Bookings Count:</b> {selectedCall.customers || selectedCall.bookings || 0}</p>
            <p><b>Total Views:</b> {selectedCall.visits || 0}</p>
            <p><b>Status:</b> {selectedCall.status === "disabled" ? "Disabled" : "Active"}</p>
            
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={() => {
                  handleToggleDisable(selectedCall.id, selectedCall.status);
                  setSelectedCall({
                    ...selectedCall,
                    status: selectedCall.status === "disabled" ? "active" : "disabled"
                  });
                }}
                style={{
                  padding: "10px 20px",
                  background: selectedCall.status === "disabled" ? "#16a34a" : "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                {selectedCall.status === "disabled" ? "🟢 Activate" : "🚫 Disable"}
              </button>

              <button
                onClick={() => setSelectedCall(null)}
                style={{
                  padding: "10px 20px",
                  background: "#333",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}