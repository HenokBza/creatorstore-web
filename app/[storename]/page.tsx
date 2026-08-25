"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { FaTiktok, FaFacebook, FaYoutube, FaInstagram } from "react-icons/fa";
import {
  doc,
  getDocs,
  query,
  collection,
  where,
  increment,
  updateDoc,
} from "firebase/firestore";

export default function CreatorPage() {
  const params = useParams();
  const storeName = params.storeName as string;

  const [creator, setCreator] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!storeName) return;
    loadCreator();
  }, [storeName]);

  const loadCreator = async () => {
    try {
      // ==========================================
      // FIND CREATOR
      // ==========================================
      const userQuery = query(
        collection(db, "users"),
        where("storeName", "==", storeName)
      );

      const userSnap = await getDocs(userQuery);

      if (userSnap.empty) {
        return;
      }

      const creatorDoc = userSnap.docs[0];
      const creatorData = {
        id: creatorDoc.id,
        ...creatorDoc.data(),
      };

      setCreator(creatorData);

      // ==========================================
      // COUNT STORE VISIT
      // ==========================================
      await updateDoc(doc(db, "users", creatorDoc.id), {
        visits: increment(1),
      });

      // ==========================================
      // LOAD DIGITAL PRODUCTS
      // ==========================================
      const productQuery = query(
        collection(db, "products"),
        where("userId", "==", creatorDoc.id)
      );

      const productSnap = await getDocs(productQuery);
      const productList = productSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        type: "digital",
        ...docSnap.data(),
      }));

      // ==========================================
      // LOAD COACHING CALLS
      // ==========================================
      const coachingQuery = query(
        collection(db, "coachingCalls"),
        where("creatorId", "==", creatorDoc.id)
      );

      const coachingSnap = await getDocs(coachingQuery);
      const coachingList = coachingSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        type: "coaching",
        ...docSnap.data(),
      }));

      // ==========================================
      // COMBINE EVERYTHING
      // ==========================================
      setProducts([...productList, ...coachingList]);
    } catch (error) {
      console.log(error);
    }
  };

  if (!creator) {
    return (
      <div
        style={{
          padding: "80px",
          textAlign: "center",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#D4AF37",
        display: "flex",
        justifyContent: "center",
        padding: "40px",
      }}
    >
      {/* MAIN CARD CONTAINER */}
      <div
        style={{
          width: "520px",
          background: "white",
          borderRadius: "20px",
          padding: "30px",
          textAlign: "center",
          boxShadow: "0 5px 20px rgba(0,0,0,.1)",
          display: "flex",
          flexDirection: "column",
          gap: "25px",
        }}
      >
        {/* PROFILE SECTION */}
        <div>
          <img
            src={creator.profileImage || "/profile-placeholder.png"}
            alt="profile"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "20px",
            }}
          />

          <h1 style={{ margin: 0, fontSize: "24px" }}>{creator.name}</h1>

          <p
            style={{
              color: "#666",
              margin: "5px 0 15px 0",
            }}
          >
            @{creator.storeName}
          </p>
{/* SOCIAL MEDIA ICONS ROW (Temporary static test) */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            marginTop: "10px",
            marginBottom: "30px",
          }}
        >
          <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="interactive-btn" style={{ color: "black", fontSize: "28px" }}><FaTiktok /></a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="interactive-btn" style={{ color: "#1877F2", fontSize: "28px" }}><FaFacebook /></a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="interactive-btn" style={{ color: "#FF0000", fontSize: "28px" }}><FaYoutube /></a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="interactive-btn" style={{ color: "#E4405F", fontSize: "28px" }}><FaInstagram /></a>
        </div>
          {/* SOCIAL MEDIA ICONS ROW (Dynamic using creator data) */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
            }}
          >
            {creator.tiktok && (
              <a
                href={creator.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="interactive-btn"
                style={{ color: "black", fontSize: "28px" }}
              >
                <FaTiktok />
              </a>
            )}
            {creator.facebook && (
              <a
                href={creator.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="interactive-btn"
                style={{ color: "#1877F2", fontSize: "28px" }}
              >
                <FaFacebook />
              </a>
            )}
            {creator.youtube && (
              <a
                href={creator.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="interactive-btn"
                style={{ color: "#FF0000", fontSize: "28px" }}
              >
                <FaYoutube />
              </a>
            )}
            {creator.instagram && (
              <a
                href={creator.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="interactive-btn"
                style={{ color: "#E4405F", fontSize: "28px" }}
              >
                <FaInstagram />
              </a>
            )}
          </div>
        </div>

        {/* PRODUCTS & COACHING LIST */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            textAlign: "left",
          }}
        >
          {products.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666" }}>
              No products available.
            </p>
          ) : (
            products.map((product) => (
              <a
                key={`${product.type}-${product.id}`}
                href={
                  product.type === "coaching"
                    ? `/checkout/${product.id}?type=coaching`
                    : `/checkout/${product.id}`
                }
                style={{
                  display: "block",
                  background: "white",
                  border: "1px solid #ddd",
                  borderRadius: "18px",
                  padding: "18px",
                  textDecoration: "none",
                  color: "#111",
                  boxShadow: "0 3px 10px rgba(0,0,0,.08)",
                }}
              >
                {/* TOP ROW */}
                <div
                  style={{
                    display: "flex",
                    gap: "18px",
                    alignItems: "flex-start",
                  }}
                >
                  {/* Thumbnail */}
                  <img
                    src={product.thumbnail || "/product-placeholder.png"}
                    alt={product.title}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "14px",
                      flexShrink: 0,
                    }}
                  />

                  {/* Right Side */}
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {product.type === "coaching" && (
                      <div
                        style={{
                          display: "inline-block",
                          background: "#50567b",
                          color: "white",
                          padding: "5px 10px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          marginBottom: "5px",
                          width: "fit-content",
                        }}
                      >
                        🎯 Coaching Call
                      </div>
                    )}

                    {/* Title */}
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "20px",
                        fontWeight: "bold",
                        wordBreak: "break-word",
                      }}
                    >
                      {product.title}
                    </h2>

                    {product.type === "coaching" && (
                      <p
                        style={{
                          margin: 0,
                          color: "#666",
                          fontSize: "16px",
                        }}
                      >
                        ⏱️ {product.duration} minutes • 1-on-1 session
                      </p>
                    )}

                    {/* Price */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      {product.discountPrice ? (
                        <>
                          <span
                            style={{
                              color: "#37b2d4",
                              fontWeight: "bold",
                              fontSize: "18px",
                            }}
                          >
                            CA${Number(product.discountPrice).toFixed(2)}
                          </span>
                          <span
                            style={{
                              textDecoration: "line-through",
                              color: "#888",
                              fontSize: "16px",
                              fontWeight: "bold",
                            }}
                          >
                            CA${Number(product.price).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span
                          style={{
                            color: "#40463f",
                            fontWeight: "bold",
                            fontSize: "18px",
                          }}
                        >
                          CA${Number(product.price).toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p
                      style={{
                        color: "#171616",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        lineHeight: "1.5",
                        margin: 0,
                        fontSize: "14px",
                      }}
                    >
                      {product.description}
                    </p>

                    {/* Button */}
                    <button
                      className="interactive-btn"
                      style={{
                        marginTop: "10px",
                        background: "#D4AF37",
                        color: "white",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: "10px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        width: "100%",
                      }}
                    >
                      {product.type === "coaching"
                        ? "See available days & Book Coaching Call"
                        : "Get Access Now"}
                    </button>
                  </div>
                </div>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 