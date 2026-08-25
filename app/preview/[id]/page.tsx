"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function PreviewPage() {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    const productRef = doc(db, "products", params.id as string);
    const snapshot = await getDoc(productRef);

    if (snapshot.exists()) {
      setProduct({
        id: snapshot.id,
        ...snapshot.data(),
      });
    }
  };

  if (!product) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: "20px", fontWeight: "bold" }}>
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
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "white",
          borderRadius: "25px",
          overflow: "hidden",
          boxShadow: "0px 10px 30px rgba(0,0,0,0.12)",
        }}
      >
       {/* Full width product thumbnail with complete image visible */}
        <div style={{ width: "100%", height: "240px", background: "#f1f5f9", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img
            src={product.thumbnail || "/placeholder.png"}
            alt={product.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain", // Prevents cutting off parts of the image
            }}
          />
        </div>

        {/* Main padding wrapper containing all text, benefits, inputs, and button */}
        <div style={{ padding: "30px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
            {product.title}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "15px", flexWrap: "wrap" }}>
            {product.discountPrice ? (
              <>
                <h2 style={{ color: "#37b2d4", fontSize: "22px", fontWeight: "bold", margin: 0 }}>
                  CA${Number(product.discountPrice).toFixed(2)}
                </h2>
                <span
                  style={{
                    textDecoration: "line-through",
                    color: "#9b937b",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  CA${Number(product.price || 0).toFixed(2)}
                </span>
              </>
            ) : (
              <h2 style={{ color: "#9b937b", fontSize: "20px", margin: 0 }}>
                CA${Number(product.price || 0).toFixed(2)}
              </h2>
            )}
          </div>

          <p style={{ lineHeight: "1.6", color: "black", marginBottom: "20px" }}>
            {product.description}
          </p>

          {/* Benefits List */}
          {product?.benefits && product.benefits.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "25px" }}>
              {product.benefits.map((item: string, index: number) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "10px",
                    padding: "12px",
                    background: "#f8f9fa",
                    borderRadius: "10px",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    alignItems: "center"
                  }}
                >
                  <span>✅</span>
                  <span style={{ flex: 1, fontSize: "14px" }}>{item}</span>
                </div>
              ))}
            </div>
          )}

          {/* Checkout Form Inputs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              placeholder="Enter your name"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                fontSize: "15px",
                boxSizing: "border-box",
              }}
            />

            <input
              placeholder="Enter your email"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                fontSize: "15px",
                boxSizing: "border-box",
              }}
            />

            <button
              className="interactive-btn"
              style={{
                marginTop: "10px",
                width: "100%",
                background: "#e4af0f",
                color: "#000",
                padding: "16px",
                border: "none",
                borderRadius: "12px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              {product.buttonText || "Get Access Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}