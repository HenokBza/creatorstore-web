"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";

import {
  FaTiktok,
  FaFacebook,
  FaYoutube,
  FaInstagram,
} from "react-icons/fa";

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

  // =========================================================
  // GET STORE NAME
  // =========================================================

  const rawStoreName =
    params?.storeName ??
    params?.storename;

  const storeName = Array.isArray(rawStoreName)
    ? rawStoreName[0]
    : rawStoreName;

  // =========================================================
  // STATE
  // =========================================================

  const [creator, setCreator] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState("");

  // =========================================================
  // DEBUG LOGS
  // =========================================================

  console.log(
    "🔎 CreatorPage params:",
    params
  );

  console.log(
    "🔎 CreatorPage storeName:",
    storeName
  );

  // =========================================================
  // LOAD CREATOR
  // =========================================================

  useEffect(() => {
    console.log(
      "🔄 CreatorPage useEffect running..."
    );

    console.log(
      "🔎 Current params:",
      params
    );

    console.log(
      "🔎 Current storeName:",
      storeName
    );

    if (!storeName) {
      console.error(
        "❌ CreatorPage: storeName is missing.",
        params
      );

      setError(
        "Creator store name is missing from the URL."
      );

      return;
    }

    loadCreator(storeName);
  }, [storeName]);

  // =========================================================
  // LOAD CREATOR FROM FIRESTORE
  // =========================================================

  const loadCreator = async (
    currentStoreName: string
  ) => {
    try {
      setError("");

      console.log(
        "=========================================="
      );

      console.log(
        "🚀 CreatorPage: Starting load..."
      );

      console.log(
        "🏪 Searching for store:",
        currentStoreName
      );

      console.log(
        "=========================================="
      );

      // ======================================================
      // FIND CREATOR
      // ======================================================

      const userQuery = query(
        collection(db, "users"),
        where(
          "storeName",
          "==",
          currentStoreName
        )
      );

      console.log(
        "🔎 Querying Firestore users collection..."
      );

      const userSnap =
        await getDocs(userQuery);

      console.log(
        "📊 Users found:",
        userSnap.size
      );

      // ======================================================
      // CREATOR NOT FOUND
      // ======================================================

      if (userSnap.empty) {
        console.error(
          "❌ No creator found for store:",
          currentStoreName
        );

        setError(
          `Creator store "${currentStoreName}" was not found.`
        );

        return;
      }

      // ======================================================
      // CREATOR DOCUMENT
      // ======================================================

      const creatorDoc =
        userSnap.docs[0];

      console.log(
        "✅ Creator document found:",
        creatorDoc.id
      );

      const creatorFirestoreData =
        creatorDoc.data();

      console.log(
        "📄 Creator Firestore data:",
        creatorFirestoreData
      );

      const creatorData = {
        id: creatorDoc.id,
        ...creatorFirestoreData,
      };

      setCreator(creatorData);

      console.log(
        "✅ Creator state loaded."
      );

      // ======================================================
      // COUNT STORE VISIT
      // ======================================================

      try {
        console.log(
          "👁️ Updating store visit..."
        );

        await updateDoc(
          doc(
            db,
            "users",
            creatorDoc.id
          ),
          {
            visits: increment(1),
          }
        );

        console.log(
          "✅ Store visit updated."
        );
      } catch (visitError) {
        console.error(
          "⚠️ Failed to count visit:",
          visitError
        );
      }

      // ======================================================
      // LOAD DIGITAL PRODUCTS
      // ======================================================

      console.log(
        "📦 Loading digital products..."
      );

      const productQuery = query(
        collection(db, "products"),
        where(
          "userId",
          "==",
          creatorDoc.id
        )
      );

      const productSnap =
        await getDocs(productQuery);

      console.log(
        "📦 Digital products found:",
        productSnap.size
      );

      const productList =
        productSnap.docs.map(
          (docSnap) => ({
            id: docSnap.id,
            type: "digital",
            ...docSnap.data(),
          })
        );

      // ======================================================
      // LOAD COACHING CALLS
      // ======================================================

      console.log(
        "🎯 Loading coaching calls..."
      );

      const coachingQuery = query(
        collection(db, "coachingCalls"),
        where(
          "creatorId",
          "==",
          creatorDoc.id
        )
      );

      const coachingSnap =
        await getDocs(coachingQuery);

      console.log(
        "🎯 Coaching calls found:",
        coachingSnap.size
      );

      const coachingList =
        coachingSnap.docs.map(
          (docSnap) => ({
            id: docSnap.id,
            type: "coaching",
            ...docSnap.data(),
          })
        );

      // ======================================================
      // COMBINE PRODUCTS + COACHING
      // ======================================================

      const allProducts = [
        ...productList,
        ...coachingList,
      ];

      console.log(
        "🛍️ Total store items:",
        allProducts.length
      );

      setProducts(allProducts);

      console.log(
        "=========================================="
      );

      console.log(
        "🎉 CreatorPage loaded successfully!"
      );

      console.log(
        "🏪 Store:",
        currentStoreName
      );

      console.log(
        "=========================================="
      );
    } catch (error) {
      console.error(
        "=========================================="
      );

      console.error(
        "❌ CreatorPage: Failed to load creator."
      );

      console.error(
        "🏪 Store:",
        currentStoreName
      );

      console.error(
        "❌ Error:",
        error
      );

      console.error(
        "=========================================="
      );

      setError(
        "Unable to load this creator store. Please try again."
      );
    }
  };

  // =========================================================
  // ERROR SCREEN
  // =========================================================

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "30px",
          textAlign: "center",
          background: "#f7f7f7",
          color: "#111",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "35px",
            borderRadius: "20px",
            maxWidth: "500px",
            width: "100%",
            boxShadow:
              "0 5px 20px rgba(0,0,0,0.10)",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              fontSize: "45px",
              marginBottom: "15px",
            }}
          >
            😕
          </div>

          <h1
            style={{
              margin: "0 0 10px",
              fontSize: "24px",
            }}
          >
            Store Not Available
          </h1>

          <p
            style={{
              margin: 0,
              color: "#666",
              lineHeight: 1.6,
            }}
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (!creator) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: "15px",
          fontSize: "20px",
          color: "#111",
          background: "#f7f7f7",
        }}
      >
        <div>
          Loading creator store...
        </div>

        <div
          style={{
            fontSize: "13px",
            color: "#777",
          }}
        >
          @{storeName || "store"}
        </div>
      </div>
    );
  }

  // =========================================================
  // DESIGN SETTINGS
  // =========================================================

  const design =
    creator.design || {};

  const backgroundColor =
    design.backgroundColor ||
    "#D4AF37";

  const textColor =
    design.textColor ||
    "#111111";

  const buttonColor =
    design.buttonColor ||
    "#14b3c5";

  const cardColor =
    design.cardColor ||
    "#ffffff";

  const cardStyle =
    design.cardStyle ||
    "rounded";

  // =========================================================
  // SOCIAL VISIBILITY
  // =========================================================

  const showTiktok =
    design.showTiktok ?? true;

  const showFacebook =
    design.showFacebook ?? true;

  const showYoutube =
    design.showYoutube ?? true;

  const showInstagram =
    design.showInstagram ?? true;

  // =========================================================
  // SOCIAL MEDIA URLS
  // =========================================================

  const tiktokURL =
    typeof design.tiktokURL === "string"
      ? design.tiktokURL.trim()
      : "";

  const facebookURL =
    typeof design.facebookURL === "string"
      ? design.facebookURL.trim()
      : "";

  const youtubeURL =
    typeof design.youtubeURL === "string"
      ? design.youtubeURL.trim()
      : "";

  const instagramURL =
    typeof design.instagramURL === "string"
      ? design.instagramURL.trim()
      : "";

  // =========================================================
  // CARD RADIUS
  // =========================================================

  const cardRadius =
    cardStyle === "square"
      ? "4px"
      : cardStyle === "soft"
      ? "12px"
      : "22px";

  // =========================================================
  // SOCIAL LINK CHECK
  // =========================================================

  const hasSocialLinks =
    Boolean(
      (showTiktok && tiktokURL) ||
      (showFacebook && facebookURL) ||
      (showYoutube && youtubeURL) ||
      (showInstagram && instagramURL)
    );

  // =========================================================
  // PUBLIC PAGE
  // =========================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: backgroundColor,
        display: "flex",
        justifyContent: "center",
        padding:
          "40px 20px 25px",
        color: textColor,
        transition: "all 0.2s ease",
        boxSizing: "border-box",
      }}
    >

      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}

      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >

        {/* ===================================================
            MAIN STORE CARD
        =================================================== */}

        <div
          style={{
            width: "100%",
            background: cardColor,
            borderRadius: "20px",
            padding: "30px",
            textAlign: "center",
            boxShadow:
              "0 5px 20px rgba(0,0,0,.1)",
            display: "flex",
            flexDirection: "column",
            gap: "25px",
            boxSizing: "border-box",
          }}
        >

          {/* =================================================
              PROFILE SECTION
          ================================================= */}

          <div>

            {/* PROFILE IMAGE */}

            <img
              src={
                creator.profileImage ||
                "/profile-placeholder.png"
              }
              alt={
                creator.name ||
                "Creator profile"
              }
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
                marginBottom: "20px",
                border:
                  `4px solid ${buttonColor}`,
              }}
            />

            {/* CREATOR NAME */}

            <h1
              style={{
                margin: 0,
                fontSize: "24px",
                color: textColor,
              }}
            >
              {creator.name ||
                "Creator"}
            </h1>

            {/* STORE NAME */}

            <p
              style={{
                color: textColor,
                opacity: 0.65,
                margin:
                  "5px 0 15px 0",
              }}
            >
              @{creator.storeName ||
                storeName}
            </p>

            {/* BIO */}

            {creator.bio && (
              <p
                style={{
                  margin:
                    "10px auto 20px",
                  maxWidth: "430px",
                  lineHeight: 1.6,
                  color: textColor,
                  opacity: 0.8,
                  fontSize: "15px",
                }}
              >
                {creator.bio}
              </p>
            )}

            {/* =================================================
                SOCIAL MEDIA ICONS
            ================================================= */}

            {hasSocialLinks && (
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "center",
                  alignItems:
                    "center",
                  gap: "20px",
                  marginTop: "15px",
                  marginBottom: "10px",
                }}
              >

                {/* TIKTOK */}

                {showTiktok &&
                  tiktokURL && (
                    <a
                      href={tiktokURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color:
                          textColor,
                        fontSize:
                          "28px",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        textDecoration:
                          "none",
                        cursor:
                          "pointer",
                      }}
                      aria-label="TikTok"
                      title="TikTok"
                    >
                      <FaTiktok />
                    </a>
                  )}

                {/* FACEBOOK */}

                {showFacebook &&
                  facebookURL && (
                    <a
                      href={facebookURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color:
                          "#1877F2",
                        fontSize:
                          "28px",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        textDecoration:
                          "none",
                        cursor:
                          "pointer",
                      }}
                      aria-label="Facebook"
                      title="Facebook"
                    >
                      <FaFacebook />
                    </a>
                  )}

                {/* YOUTUBE */}

                {showYoutube &&
                  youtubeURL && (
                    <a
                      href={youtubeURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color:
                          "#FF0000",
                        fontSize:
                          "28px",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        textDecoration:
                          "none",
                        cursor:
                          "pointer",
                      }}
                      aria-label="YouTube"
                      title="YouTube"
                    >
                      <FaYoutube />
                    </a>
                  )}

                {/* INSTAGRAM */}

                {showInstagram &&
                  instagramURL && (
                    <a
                      href={instagramURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color:
                          "#E4405F",
                        fontSize:
                          "28px",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        textDecoration:
                          "none",
                        cursor:
                          "pointer",
                      }}
                      aria-label="Instagram"
                      title="Instagram"
                    >
                      <FaInstagram />
                    </a>
                  )}

              </div>
            )}

          </div>

          {/* =================================================
              PRODUCTS + COACHING
              
              NEW DESIGN:
              THUMBNAIL ON TOP
              CONTENT BELOW
              
              Responsive on mobile + laptop.
          ================================================= */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr",
              gap: "18px",
              textAlign: "left",
            }}
          >

            {/* =================================================
                NO PRODUCTS
            ================================================= */}

            {products.length === 0 ? (
              <p
                style={{
                  textAlign:
                    "center",
                  color:
                    textColor,
                  opacity: 0.65,
                }}
              >
                No products available.
              </p>
            ) : (

              /* =================================================
                 PRODUCT CARDS
              ================================================= */

              products.map(
                (product) => (

                  <a
                    key={`${product.type}-${product.id}`}
                    href={
                      product.type ===
                      "coaching"
                        ? `/checkout/${product.id}?type=coaching`
                        : `/checkout/${product.id}`
                    }
                    style={{
                      display:
                        "block",
                      background:
                        cardColor,
                      border:
                        `1px solid ${textColor}22`,
                      borderRadius:
                        cardRadius,
                      padding:
                        "15px",
                      textDecoration:
                        "none",
                      color:
                        textColor,
                      boxShadow:
                        "0 5px 15px rgba(0,0,0,0.10)",
                      transition:
                        "all 0.2s ease",
                      boxSizing:
                        "border-box",
                      width:
                        "100%",
                    }}
                  >

                    {/* =================================================
                        THUMBNAIL ON TOP
                    ================================================= */}

                    <img
                      src={
                        product.thumbnail ||
                        "/product-placeholder.png"
                      }
                      alt={
                        product.title ||
                        "Product"
                      }
                      style={{
                        width:
                          "100%",
                        height:
                          "220px",
                        objectFit:
                          "cover",
                        borderRadius:
                          cardStyle ===
                          "square"
                            ? "4px"
                            : "12px",
                        display:
                          "block",
                        marginBottom:
                          "15px",
                      }}
                    />

                    {/* =================================================
                        CARD CONTENT
                    ================================================= */}

                    <div
                      style={{
                        width:
                          "100%",
                        boxSizing:
                          "border-box",
                      }}
                    >

                      {/* COACHING LABEL */}

                      {product.type ===
                        "coaching" && (
                        <div
                          style={{
                            display:
                              "inline-block",
                            background:
                              buttonColor,
                            color:
                              "white",
                            padding:
                              "5px 10px",
                            borderRadius:
                              "8px",
                            fontSize:
                              "12px",
                            fontWeight:
                              "bold",
                            marginBottom:
                              "10px",
                          }}
                        >
                          🎯 Coaching Call
                        </div>
                      )}

                      {/* TITLE */}

                      <h2
                        style={{
                          margin:
                            "0 0 7px",
                          fontSize:
                            "20px",
                          fontWeight:
                            "bold",
                          wordBreak:
                            "break-word",
                          color:
                            textColor,
                        }}
                      >
                        {
                          product.title
                        }
                      </h2>

                      {/* COACHING DURATION */}

                      {product.type ===
                        "coaching" && (
                        <p
                          style={{
                            margin:
                              "0 0 8px",
                            color:
                              textColor,
                            opacity:
                              0.65,
                            fontSize:
                              "14px",
                          }}
                        >
                          ⏱️{" "}
                          {product.duration ||
                            60}{" "}
                          minutes •
                          1-on-1 session
                        </p>
                      )}

                      {/* PRICE */}

                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap:
                            "10px",
                          marginBottom:
                            "8px",
                          flexWrap:
                            "wrap",
                        }}
                      >

                        {product.discountPrice ? (
                          <>
                            <span
                              style={{
                                color:
                                  buttonColor,
                                fontWeight:
                                  "bold",
                                fontSize:
                                  "18px",
                              }}
                            >
                              CA$
                              {Number(
                                product.discountPrice
                              ).toFixed(2)}
                            </span>

                            <span
                              style={{
                                textDecoration:
                                  "line-through",
                                color:
                                  textColor,
                                opacity:
                                  0.5,
                                fontSize:
                                  "14px",
                                fontWeight:
                                  "bold",
                              }}
                            >
                              CA$
                              {Number(
                                product.price
                              ).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span
                            style={{
                              color:
                                buttonColor,
                              fontWeight:
                                "bold",
                              fontSize:
                                "18px",
                            }}
                          >
                            CA$
                            {Number(
                              product.price ||
                                0
                            ).toFixed(2)}
                          </span>
                        )}

                      </div>

                      {/* DESCRIPTION */}

                      {product.description && (
                        <p
                          style={{
                            color:
                              textColor,
                            opacity:
                              0.75,
                            lineHeight:
                              1.5,
                            margin:
                              "0 0 12px",
                            fontSize:
                              "14px",
                            display:
                              "-webkit-box",
                            WebkitLineClamp:
                              3,
                            WebkitBoxOrient:
                              "vertical",
                            overflow:
                              "hidden",
                          }}
                        >
                          {
                            product.description
                          }
                        </p>
                      )}

                      {/* BUTTON */}

                      <div
                        style={{
                          marginTop:
                            "10px",
                          background:
                            buttonColor,
                          color:
                            "white",
                          padding:
                            "11px 18px",
                          borderRadius:
                            "10px",
                          fontWeight:
                            "bold",
                          textAlign:
                            "center",
                          width:
                            "100%",
                          boxSizing:
                            "border-box",
                          lineHeight:
                            1.4,
                        }}
                      >
                        {product.type ===
                        "coaching"
                          ? "See available days & Book Coaching Call"
                          : "Get Access Now"}
                      </div>

                    </div>

                  </a>
                )
              )
            )}

          </div>

        </div>

        {/* =====================================================
            CREATORSTORE FOOTER
        ===================================================== */}

        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            gap: "15px",
            padding:
              "5px 5px 10px",
            boxSizing:
              "border-box",
            flexWrap:
              "wrap",
          }}
        >

          {/* =================================================
              LEFT — CREATORSTORE LOGO
          ================================================= */}

          <a
            href="/"
            style={{
              display:
                "flex",
              alignItems:
                "center",
              textDecoration:
                "none",
              color:
                textColor,
              fontWeight:
                "bold",
            }}
          >
            <img
              src="/logo.png"
              alt="CreatorStore"
              style={{
                height:
                  "32px",
                width:
                  "auto",
                maxWidth:
                  "160px",
                objectFit:
                  "contain",
                display:
                  "block",
              }}
            />
          </a>

          {/* =================================================
              RIGHT — ETHIOPIA CTA
          ================================================= */}

          <a
            href="/"
            style={{
              color:
                textColor,
              fontSize:
                "13px",
              fontWeight:
                "600",
              textDecoration:
                "none",
              textAlign:
                "right",
              lineHeight:
                1.4,
              transition:
                "opacity 0.2s ease",
            }}
            title="Join CreatorStore for free"
          >
            Now live in Ethiopia —
            <br />
            <span
              style={{
                textDecoration:
                  "underline",
                fontWeight:
                  "bold",
              }}
            >
              Join for free
            </span>
          </a>

        </div>

      </div>

    </div>
  );
}