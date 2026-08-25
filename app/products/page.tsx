"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const productSnap = await getDocs(collection(db, "products"));
      const userSnap = await getDocs(collection(db, "users"));

      const creators: any = {};
      userSnap.forEach((doc) => {
        creators[doc.id] = doc.data();
      });

      const list: any = [];
      productSnap.forEach((doc) => {
        const product = doc.data();
        list.push({
          id: doc.id,
          ...product,
          creatorName: creators[product.userId]?.name || "Unknown",
        });
      });

      setProducts(list);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleToggleDisable = async (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === "disabled" ? "active" : "disabled";
    try {
      await updateDoc(doc(db, "products", productId), {
        status: newStatus,
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, status: newStatus } : p))
      );
      alert(`Product successfully ${newStatus === "disabled" ? "disabled" : "activated"}.`);
    } catch (error: any) {
      alert("Error updating product status: " + error.message);
    }
  };

  // Filter products based on search query (title, category, or creator name)
  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    const title = (product.title || "").toLowerCase();
    const category = (product.category || "").toLowerCase();
    const creatorName = (product.creatorName || "").toLowerCase();
    return title.includes(query) || category.includes(query) || creatorName.includes(query);
  });

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "15px" }}>
        <h1 style={{ margin: 0 }}>📦 Products</h1>

        {/* Search Bar Input */}
        <input
          type="text"
          placeholder="🔍 Search by product, category, or creator..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: "10px 16px",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            width: "320px",
            fontSize: "14px",
            outline: "none",
            background: "#fff",
          }}
        />
      </div>

      <table
        style={{
          width: "100%",
          marginTop: "20px",
          borderCollapse: "collapse",
          background: "white",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
        }}
      >
        <thead>
          <tr style={{ background: "#f8fafc", textAlign: "left" }}>
            <th style={{ padding: "16px" }}>📦 Product</th>
            <th style={{ padding: "16px" }}>👤 Creator</th>
            <th style={{ padding: "16px" }}>💰 Price</th>
            <th style={{ padding: "16px" }}>🛒 Sales</th>
            <th style={{ padding: "16px" }}>👁 Views</th>
            <th style={{ padding: "16px" }}>⚙ Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#666" }}>
                No products found matching "{searchQuery}".
              </td>
            </tr>
          ) : (
            filteredProducts.map((product) => (
              <tr key={product.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <img
                      src={product.thumbnail || "/placeholder-product.png"}
                      alt={product.title}
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
                        {product.title}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#888",
                          marginTop: "4px",
                        }}
                      >
                        {product.category || "Digital Product"}
                      </div>
                    </div>
                  </div>
                </td>

                <td style={{ padding: "16px" }}>{product.creatorName}</td>
                <td style={{ padding: "16px" }}>CA${product.price}</td>
                <td style={{ padding: "16px" }}>{product.customers || 0}</td>
                <td style={{ padding: "16px" }}>{product.visits || 0}</td>

                <td style={{ padding: "16px", position: "relative" }}>
                  <button
                    onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
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

                  {openMenuId === product.id && (
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
                          setSelectedProduct(product);
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
                          handleToggleDisable(product.id, product.status);
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
                          color: product.status === "disabled" ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {product.status === "disabled" ? "🟢 Activate" : "🚫 Disable"}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Product Details Modal */}
      {selectedProduct && (
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
            <h2>Product Details</h2>
            <p style={{ marginTop: "15px" }}><b>Title:</b> {selectedProduct.title}</p>
            <p><b>Creator:</b> {selectedProduct.creatorName}</p>
            <p><b>Price:</b> CA${selectedProduct.price}</p>
            <p><b>Category:</b> {selectedProduct.category || "Digital Product"}</p>
            <p><b>Sales Count:</b> {selectedProduct.customers || 0}</p>
            <p><b>Total Views:</b> {selectedProduct.visits || 0}</p>
            <p><b>Status:</b> {selectedProduct.status === "disabled" ? "Disabled" : "Active"}</p>
            
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={() => {
                  handleToggleDisable(selectedProduct.id, selectedProduct.status);
                  setSelectedProduct({
                    ...selectedProduct,
                    status: selectedProduct.status === "disabled" ? "active" : "disabled"
                  });
                }}
                style={{
                  padding: "10px 20px",
                  background: selectedProduct.status === "disabled" ? "#16a34a" : "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                {selectedProduct.status === "disabled" ? "🟢 Activate" : "🚫 Disable"}
              </button>

              <button
                onClick={() => setSelectedProduct(null)}
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