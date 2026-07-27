"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";

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

  const storeName =
    params.storeName as string;

  const [creator, setCreator] =
    useState<any>(null);

  const [products, setProducts] =
    useState<any[]>([]);

  useEffect(() => {

    if (!storeName) return;

    loadCreator();

  }, [storeName]);

  const loadCreator = async () => {

    try {

      // Find creator

      const userQuery = query(
        collection(db, "users"),
        where("storeName", "==", storeName)
      );

      const userSnap =
        await getDocs(userQuery);

      if (userSnap.empty) {

        return;

      }

      const creatorDoc =
        userSnap.docs[0];

      const creatorData = {
        id: creatorDoc.id,
        ...creatorDoc.data(),
      };

      setCreator(
        creatorData
      );
await updateDoc(
  doc(db, "users", creatorDoc.id),
  {
    visits: increment(1),
  }
);
      // Load creator products

      const productQuery = query(
        collection(db, "products"),
        where(
          "userId",
          "==",
          creatorDoc.id
        )
      );

      const productSnap =
        await getDocs(
          productQuery
        );

      const productList =
        productSnap.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

      setProducts(
        productList
      );

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

      <div
        style={{
          width: "520px",
          background: "white",
          borderRadius: "20px",
          padding: "30px",
          textAlign: "center",
          boxShadow:
            "0 5px 20px rgba(0,0,0,.1)",
        }}
      >

        <img
          src={
            creator.profileImage ||
            "/profile-placeholder.png"
          }
          alt="profile"
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: "20px",
          }}
        />

        <h1>
          {creator.name}
        </h1>

        <p
          style={{
            color: "#666",
            marginBottom: "30px",
          }}
        >
          @{creator.storeName}
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >

          {products.length === 0 ? (

            <p>
              No products available.
            </p>

          ) : (

          products.map((product) => (

  <a
    key={product.id}
    href={`/checkout/${product.id}`}
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
        src={
          product.thumbnail ||
          "/product-placeholder.png"
        }
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
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >

          <h2
            style={{
              margin: 0,
              fontSize: "24px",
            }}
          >
            {product.title}
          </h2>

          <div
            style={{
              color: "#40463f",
              fontWeight: "bold",
              fontSize: "15px",
            }}
          >
            CA${product.price}
          </div>

        </div>

        {/* Description */}

        <p
           style={{
    color: "#a74747",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    lineHeight: "1.5",
    minHeight: "72px"
          }}
        >
          {product.description}
        </p>

        {/* Button */}

        <button
          style={{
            marginTop: "18px",
            background: "#D4AF37",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "10px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Get Now
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