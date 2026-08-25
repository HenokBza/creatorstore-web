"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    loadStore();
  }, []);

  // ==========================================
  // LOAD DIGITAL PRODUCTS + COACHING CALLS
  // ==========================================

  const loadStore = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      // --------------------------------------
      // DIGITAL PRODUCTS
      // --------------------------------------

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

      // --------------------------------------
      // COACHING CALLS
      // --------------------------------------

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

      console.log("========== MY STORE ==========");
      console.log("Digital products:", productItems.length);
      console.log("Coaching calls:", coachingItems.length);
      console.log("==============================");
    } catch (error) {
      console.error("❌ Failed to load store:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // EDIT DIGITAL PRODUCT
  // ==========================================

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

  // ==========================================
  // PREVIEW DIGITAL PRODUCT
  // ==========================================

  const handlePreview = (product: any) => {
    router.push(`/preview/${product.id}`);
  };

  // ==========================================
  // DUPLICATE DIGITAL PRODUCT
  // ==========================================

  const handleDuplicate = async (product: any) => {
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
  // ==========================================
  // DUPLICATE COACHING CALL
  // ==========================================

  const handleDuplicateCoaching = async (coaching: any) => {
    try {
      const copy = {
        ...coaching,
        isDuplicate: true,
        createdAt: new Date(),
      };

      delete copy.id;
      delete copy.type;

      await addDoc(collection(db, "coachingCalls"), copy);

      await loadStore();

      alert("Coaching call duplicated 🚀");
    } catch (error) {
      console.error("❌ Coaching duplicate error:", error);
      alert("Failed to duplicate coaching call.");
    }
  };

  // ==========================================
  // DELETE DIGITAL PRODUCT
  // ==========================================

  const handleDelete = async (id: string) => {
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

  // ==========================================
  // EDIT COACHING CALL
  // ==========================================

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

  // ==========================================
  // DELETE COACHING CALL
  // ==========================================

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

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div
        style={{
          padding: "30px",
          textAlign: "center",
        }}
      >
        Loading your store...
      </div>
    );
  }

  return (
    <div>
      {/* ======================================
          HEADER
      ====================================== */}

      <h1
        style={{
          marginBottom: "25px",
        }}
      >
        🏪 My Store
      </h1>

      {/* ======================================
          DIGITAL PRODUCTS
      ====================================== */}

      <h2
        style={{
          marginBottom: "15px",
        }}
      >
        🛍️ Digital Products
      </h2>

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
                padding: "15px",
                borderRadius: "15px",
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                boxShadow: "0 4px 15px rgba(0,0,0,.08)",
              }}
            >
              {/* TOP ROW */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  width: "100%",
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
                >
                  ✏️
                </button>

                <img
                  src={product.thumbnail || "/product-placeholder.png"}
                  alt="product"
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "10px",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <h3
                    style={{
                      marginBottom: "5px",
                      fontSize: "18px",
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
                            color: "#ff4d4d",
                            fontWeight: "bold",
                            margin: 0,
                            fontSize: "20px",
                          }}
                        >
                          CA${Number(product.discountPrice).toFixed(2)}
                        </p>

                        <p
                          style={{
                            textDecoration: "line-through",
                            color: "#171616",
                            fontSize: "20px",
                            margin: 0,
                          }}
                        >
                          CA${Number(product.price).toFixed(2)}
                        </p>
                      </>
                    ) : (
                      <p
                        style={{
                          color: "#131313",
                          margin: 0,
                          fontSize: "18px",
                        }}
                      >
                        CA${Number(product.price).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* DIGITAL PRODUCT BUTTONS */}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  width: "100%",
                  borderTop: "1px solid #f0f0f0",
                  paddingTop: "12px",
                }}
              >
                <button
                  onClick={() => handlePreview(product)}
                  className="interactive-btn"
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    background: "#f2f2f2",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  👀 Preview
                </button>

                <button
                  onClick={() => handleDuplicate(product)}
                  className="interactive-btn"
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    background: "#D4AF37",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  📋 Duplicate
                </button>

                <button
                  onClick={() => handleDelete(product.id)}
                  className="interactive-btn"
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    background: "#ff4d4d",
                    color: "white",
                    fontSize: "10px",
                  }}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================
          COACHING CALLS
      ====================================== */}

<h2
  style={{
    marginBottom: "15px",
  }}
>
  🎓 Coaching Calls
</h2>

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
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "15px",
    }}
  >
    {coachingCalls.map((coaching) => (
      <div
        key={coaching.id}
        style={{
          background: "#1eb5d7",
          padding: "15px",
          borderRadius: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,.08)",
        }}
      >
        {/* COACHING TOP ROW */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
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

          <div
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <h3
              style={{
                margin: "0 0 6px 0",
                fontSize: "17px",
                wordBreak: "break-word",
              }}
            >
              {coaching.title}
            </h3>

            {/* RESPONSIVE PRICE SECTION */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                alignItems: "center",
              }}
            >
              {coaching.discountPrice ? (
                <>
                  <strong
                    style={{
                      color: "#d41b11",
                      fontSize: "16px",
                    }}
                  >
                    CA${Number(coaching.discountPrice).toFixed(2)}
                  </strong>

                  <strong
                    style={{
                      color: "#0e0d0d",
                      textDecoration: "line-through",
                      fontSize: "14px",
                    }}
                  >
                    CA${Number(coaching.price).toFixed(2)}
                  </strong>
                </>
              ) : (
                <strong style={{ fontSize: "16px" }}>
                  CA${Number(coaching.price).toFixed(2)}
                </strong>
              )}
            </div>

            {/* DURATION */}
            <div
              style={{
                marginTop: "4px",
                color: "#111111",
                fontSize: "15px",
              }}
            >
              ⏱️ {coaching.duration || 60} minutes
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}
        <p
          style={{
            margin: 0,
            color: "#101010",
            fontSize: "15px",
            wordBreak: "break-word",
          }}
        >
          {coaching.description}
        </p>

        {/* STATUS */}
        <div
          style={{
            fontSize: "15px",
            fontWeight: "600",
            color: coaching.isActive ? "green" : "#555",
          }}
        >
          {coaching.isActive ? "🟢 Active" : "⚪ Inactive"}
        </div>

        {/* COACHING BUTTONS */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            width: "100%",
            borderTop: "1px solid rgba(0, 0, 0, 0.1)",
            paddingTop: "12px",
          }}
        >
          <button
            onClick={() => handleEditCoaching(coaching)}
            className="interactive-btn"
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              background: "#f2f2f2",
              fontWeight: "600",
            }}
          >
            ✏️ Edit
          </button>

          <button
            onClick={() => handleDeleteCoaching(coaching.id)}
            className="interactive-btn"
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              background: "#ff4d4d",
              color: "white",
              fontWeight: "600",
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