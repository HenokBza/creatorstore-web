"use client";

import { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function StorePage() {
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [coachingCalls, setCoachingCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadStore();

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const loadStore = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const productsQuery = query(
        collection(db, "products"),
        where("userId", "==", user.uid)
      );
      const productsSnapshot = await getDocs(productsQuery);
      const productItems = productsSnapshot.docs.map((item) => ({
        id: item.id,
        type: "product",
        ...item.data(),
      }));
      setProducts(productItems);

      const coachingQuery = query(
        collection(db, "coachingCalls"),
        where("creatorId", "==", user.uid)
      );
      const coachingSnapshot = await getDocs(coachingQuery);
      const coachingItems = coachingSnapshot.docs.map((item) => ({
        id: item.id,
        type: "coaching",
        ...item.data(),
      }));
      setCoachingCalls(coachingItems);
    } catch (error) {
      console.error("❌ Failed to load store:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: any) => {
    localStorage.setItem("editingProductId", product.id);
    localStorage.setItem("productTitle", product.title || "");
    localStorage.setItem("productThumbnail", product.thumbnail || "");
    localStorage.setItem("productDescription", product.description || "");
    localStorage.setItem("productPrice", product.price || "");
    localStorage.setItem("productButtonText", product.buttonText || "");
    localStorage.setItem("benefit1", product.benefits?.[0] || "");
    localStorage.setItem("benefit2", product.benefits?.[1] || "");
    localStorage.setItem("benefit3", product.benefits?.[2] || "");

    router.push("/dashboard/products/publish");
  };

  const handlePreview = (product: any) => {
    setActiveMenuId(null);
    router.push(`/preview/${product.id}`);
  };

  const handleDuplicate = async (product: any) => {
    setActiveMenuId(null);
    try {
      const copy = {
        ...product,
        isDuplicate: true,
        createdAt: new Date(),
      };
      delete copy.id;
      delete copy.type;

      await addDoc(collection(db, "products"), copy);
      await loadStore();
      alert("Product duplicated 🚀");
    } catch (error) {
      console.error("❌ Duplicate error:", error);
      alert("Failed to duplicate product.");
    }
  };

  const handleDelete = async (id: string) => {
    setActiveMenuId(null);
    const confirmDelete = confirm("Delete this product?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "products", id));
      await loadStore();
    } catch (error) {
      console.error("❌ Delete error:", error);
      alert("Failed to delete product.");
    }
  };

  const handleEditCoaching = (coaching: any) => {
    localStorage.setItem("editingCoachingCallId", coaching.id);
    localStorage.setItem("coachingTitle", coaching.title || "");
    localStorage.setItem("coachingThumbnail", coaching.thumbnail || "");
    localStorage.setItem("coachingDescription", coaching.description || "");
    localStorage.setItem("coachingPrice", coaching.price || "");
    localStorage.setItem("coachingButtonText", coaching.buttonText || "");
    localStorage.setItem("benefit1", coaching.benefits?.[0] || "");
    localStorage.setItem("benefit2", coaching.benefits?.[1] || "");
    localStorage.setItem("benefit3", coaching.benefits?.[2] || "");
    router.push("/dashboard/products/coaching-call");
  };

  const handleDeleteCoaching = async (id: string) => {
    const confirmDelete = confirm("Delete this coaching call?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "coachingCalls", id));
      await loadStore();
    } catch (error) {
      console.error("❌ Coaching delete error:", error);
      alert("Failed to delete coaching call.");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "30px", textAlign: "center" }}>
        Loading your store...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "750px", margin: "0 auto", paddingBottom: "50px" }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          marginBottom: "25px",
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ margin: 0 }}>🏪 My Store</h1>

        <button
          onClick={() => router.push("/dashboard/store/edit-design")}
          className="interactive-btn"
          style={{
            padding: "12px 20px",
            borderRadius: "10px",
            border: "none",
            background: "#e38c13",
            color: "white",
            fontWeight: "bold",
            fontSize: "15px",
            cursor: "pointer",
            boxShadow: "0 5px 15px rgba(20,179,197,0.25)",
          }}
        >
          🎨 Edit Design customer front page
        </button>
      </div>

      {/* DIGITAL PRODUCTS */}
      <h2 style={{ marginBottom: "15px" }}>🛍️ Digital Products</h2>

      {products.length === 0 ? (
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "35px",
            color: "#777",
          }}
        >
          No digital products published yet.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            marginBottom: "40px",
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                background: "#3769d4",
                padding: "16px",
                borderRadius: "15px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                boxShadow: "0 4px 15px rgba(0,0,0,.08)",
                position: "relative",
              }}
            >
              {/* TOP ROW WITH 3 DOTS MENU */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  width: "100%",
                  position: "relative",
                }}
              >
                <button
                  onClick={() => handleEdit(product)}
                  className="interactive-btn"
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: "22px",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                  title="Edit Product"
                >
                  ✏️
                </button>

                <img
                  src={product.thumbnail || "/product-placeholder.png"}
                  alt="product"
                  style={{
                    width: "60px",
                    height: "70px",
                    borderRadius: "10px",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      marginBottom: "5px",
                      fontSize: "18px",
                      color: "white",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {product.title}
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    {product.discountPrice ? (
                      <>
                        <p
                          style={{
                            color: "#ffdf00",
                            fontWeight: "bold",
                            margin: 0,
                            fontSize: "18px",
                          }}
                        >
                          CA${Number(product.discountPrice).toFixed(2)}
                        </p>
                        <p
                          style={{
                            textDecoration: "line-through",
                            color: "#d0d0d0",
                            fontSize: "16px",
                            margin: 0,
                          }}
                        >
                          CA${Number(product.price).toFixed(2)}
                        </p>
                      </>
                    ) : (
                      <p
                        style={{
                          color: "white",
                          margin: 0,
                          fontSize: "18px",
                        }}
                      >
                        CA${Number(product.price).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                {/* 3 DOTS TRIGGER */}
                <div ref={activeMenuId === product.id ? menuRef : null} style={{ position: "relative" }}>
                  <button
                    onClick={() =>
                      setActiveMenuId(activeMenuId === product.id ? null : product.id)
                    }
                    className="interactive-btn"
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      border: "none",
                      color: "white",
                      width: "35px",
                      height: "35px",
                      borderRadius: "50%",
                      cursor: "pointer",
                      fontSize: "18px",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ⋮
                  </button>

                  {/* DROPDOWN MENU */}
                  {activeMenuId === product.id && (
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "42px",
                        background: "white",
                        color: "#111",
                        borderRadius: "10px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                        width: "140px",
                        padding: "6px",
                        zIndex: 50,
                      }}
                    >
                      <button
                        onClick={() => handlePreview(product)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 10px",
                          background: "transparent",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: "600",
                          display: "block",
                        }}
                      >
                        👀 Preview
                      </button>
                      <button
                        onClick={() => handleDuplicate(product)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 10px",
                          background: "transparent",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: "600",
                          display: "block",
                        }}
                      >
                        📋 Duplicate
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 10px",
                          background: "transparent",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#ff4d4d",
                          display: "block",
                        }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COACHING CALLS */}
      <h2 style={{ marginBottom: "15px" }}>🎓 Coaching Calls</h2>

      {coachingCalls.length === 0 ? (
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            color: "#777",
          }}
        >
          No coaching calls published yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {coachingCalls.map((coaching) => (
            <div
              key={coaching.id}
              style={{
                background: "#1eb5d7",
                padding: "16px",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                boxShadow: "0 4px 15px rgba(0,0,0,.08)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <button
                  onClick={() => handleEditCoaching(coaching)}
                  className="interactive-btn"
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: "20px",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  ✏️
                </button>

                <img
                  src={coaching.thumbnail || "/product-placeholder.png"}
                  alt="coaching"
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "10px",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: "0 0 6px 0", fontSize: "17px", wordBreak: "break-word" }}>
                    {coaching.title}
                  </h3>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                    {coaching.discountPrice ? (
                      <>
                        <strong style={{ color: "#8b0000", fontSize: "16px" }}>
                          CA${Number(coaching.discountPrice).toFixed(2)}
                        </strong>
                        <strong style={{ color: "#333", textDecoration: "line-through", fontSize: "14px" }}>
                          CA${Number(coaching.price).toFixed(2)}
                        </strong>
                      </>
                    ) : (
                      <strong style={{ fontSize: "16px" }}>
                        CA${Number(coaching.price).toFixed(2)}
                      </strong>
                    )}
                  </div>

                  <div style={{ marginTop: "4px", color: "#222", fontSize: "14px" }}>
                    ⏱️ {coaching.duration || 60} minutes
                  </div>
                </div>
              </div>

              <p style={{ margin: 0, color: "#101010", fontSize: "14px", wordBreak: "break-word" }}>
                {coaching.description}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  width: "100%",
                  borderTop: "1px solid rgba(0, 0, 0, 0.1)",
                  paddingTop: "10px",
                }}
              >
                <button
                  onClick={() => handleEditCoaching(coaching)}
                  className="interactive-btn"
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    background: "#f2f2f2",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  ✏️ Edit
                </button>

                <button
                  onClick={() => handleDeleteCoaching(coaching.id)}
                  className="interactive-btn"
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    background: "#ff4d4d",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}