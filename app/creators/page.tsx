"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CreatorsPage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<any | null>(null);

  useEffect(() => {
    loadCreators();
  }, []);

  const loadCreators = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const productsSnapshot = await getDocs(collection(db, "products"));

      const productCounts: Record<string, number> = {};

      productsSnapshot.forEach((doc) => {
        const product = doc.data();
        const creatorId = product.userId;
        productCounts[creatorId] = (productCounts[creatorId] || 0) + 1;
      });

      const list: any[] = [];

      usersSnapshot.forEach((doc) => {
        const creator = doc.data();
        list.push({
          id: doc.id,
          ...creator,
          products: productCounts[doc.id] || 0,
        });
      });

      setCreators(list);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleToggleSuspend = async (creatorId: string, currentStatus: string) => {
    const newStatus = currentStatus === "suspended" ? "active" : "suspended";
    try {
      await updateDoc(doc(db, "users", creatorId), {
        status: newStatus,
      });
      setCreators((prev) =>
        prev.map((c) => (c.id === creatorId ? { ...c, status: newStatus } : c))
      );
      alert(`Creator successfully ${newStatus === "suspended" ? "suspended" : "activated"}.`);
    } catch (error: any) {
      alert("Error updating status: " + error.message);
    }
  };

  // Filter creators based on search query (name, email, or store name)
  const filteredCreators = creators.filter((creator) => {
    const query = searchQuery.toLowerCase();
    const name = (creator.name || "").toLowerCase();
    const email = (creator.email || "").toLowerCase();
    const storeName = (creator.storeName || "").toLowerCase();
    return name.includes(query) || email.includes(query) || storeName.includes(query);
  });

  if (loading) {
    return <h2 style={{ padding: "40px" }}>Loading creators...</h2>;
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "40px auto", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
        <h1 style={{ margin: 0 }}>👥 Creators</h1>

        {/* Search Bar Input */}
        <input
          type="text"
          placeholder="🔍 Search by name, email, or store..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: "10px 16px",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            width: "300px",
            fontSize: "14px",
            outline: "none",
            background: "#fff",
          }}
        />
      </div>

      <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", overflow: "visible" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ background: "#f8fafc", textAlign: "left" }}>
              <th style={{ padding: "16px" }}>👤 Creator</th>
              <th style={{ padding: "16px" }}>💰 Revenue</th>
              <th style={{ padding: "16px" }}>📦 Products</th>
              <th style={{ padding: "16px" }}>💳 Subscription</th>
              <th style={{ padding: "16px" }}>🌍 Country</th>
              <th style={{ padding: "16px" }}>🚦 Status</th>
              <th style={{ padding: "16px" }}>⚙ Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCreators.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#666" }}>
                  No creators found matching "{searchQuery}".
                </td>
              </tr>
            ) : (
              filteredCreators.map((creator, index) => {
                const isNearBottom = index >= filteredCreators.length - 2 && filteredCreators.length > 2;

                return (
                  <tr key={creator.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img
                          src={creator.profileImage || "/default-avatar.png"}
                          alt={creator.name}
                          style={{
                            width: "46px",
                            height: "46px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid #eee",
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "15px" }}>{creator.name}</div>
                          <div style={{ fontSize: "12px", color: "#888" }}>{creator.email} • @{creator.storeName}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "16px" }}>CA${Number(creator.totalRevenue || 0).toFixed(2)}</td>
                    <td style={{ padding: "16px" }}>{creator.products}</td>
                    <td style={{ padding: "16px" }}>
                      {creator.subscriptionStatus === "active"
                        ? "🟢 Active"
                        : creator.subscriptionStatus === "cancelled"
                        ? "🟡 Cancelled"
                        : "⚪ Free"}
                    </td>
                    <td style={{ padding: "16px" }}>{creator.country || "N/A"}</td>
                    <td style={{ padding: "16px" }}>
                      {creator.status === "suspended" ? "🔴 Suspended" : "🟢 Active"}
                    </td>

                    <td style={{ padding: "16px", position: "relative" }}>
                      <button
                        onClick={() => setOpenMenuId(openMenuId === creator.id ? null : creator.id)}
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

                      {openMenuId === creator.id && (
                        <div
                          style={{
                            position: "absolute",
                            right: "20px",
                            ...(isNearBottom ? { bottom: "100%", marginBottom: "8px" } : { top: "60px" }),
                            background: "white",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                            borderRadius: "12px",
                            overflow: "hidden",
                            zIndex: 999,
                            minWidth: "150px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <button
                            onClick={() => {
                              setSelectedCreator(creator);
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
                              color: "#1e293b",
                              borderBottom: "1px solid #f1f5f9",
                            }}
                          >
                            👁 View Details
                          </button>

                          <button
                            onClick={() => {
                              handleToggleSuspend(creator.id, creator.status);
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
                              color: creator.status === "suspended" ? "#16a34a" : "#dc2626",
                            }}
                          >
                            {creator.status === "suspended" ? "🟢 Activate" : "🚫 Suspend"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Creator Details Modal */}
      {selectedCreator && (
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
            <h2>Creator Details</h2>
            <p style={{ marginTop: "15px" }}><b>Name:</b> {selectedCreator.name}</p>
            <p><b>Email:</b> {selectedCreator.email}</p>
            <p><b>Store Name:</b> {selectedCreator.storeName || "N/A"}</p>
            <p><b>Country:</b> {selectedCreator.country || "N/A"}</p>
            <p><b>Total Revenue:</b> CA${Number(selectedCreator.totalRevenue || 0).toFixed(2)}</p>
            <p><b>Available Balance:</b> CA${Number(selectedCreator.availableBalance || 0).toFixed(2)}</p>
            <p><b>Pending Balance:</b> CA${Number(selectedCreator.pendingBalance || 0).toFixed(2)}</p>
            <p><b>Products Count:</b> {selectedCreator.products}</p>
            <p><b>Status:</b> {selectedCreator.status || "Active"}</p>
            
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={() => {
                  handleToggleSuspend(selectedCreator.id, selectedCreator.status);
                  setSelectedCreator({
                    ...selectedCreator,
                    status: selectedCreator.status === "suspended" ? "active" : "suspended"
                  });
                }}
                className="interactive-btn"
                style={{
                  padding: "10px 20px",
                  background: selectedCreator.status === "suspended" ? "#16a34a" : "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                {selectedCreator.status === "suspended" ? "🟢 Activate" : "🚫 Suspend"}
              </button>

              <button
                onClick={() => setSelectedCreator(null)}
                className="interactive-btn"
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