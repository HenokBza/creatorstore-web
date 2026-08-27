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
  getDocs,
  query,
  collection,
  where,
  increment,
  updateDoc,
  doc,
} from "firebase/firestore";

// ======================================================
// TYPES
// ======================================================

type Creator = {
  id: string;
  name?: string;
  storeName?: string;
  bio?: string;
  profileImage?: string;

  design?: {
    backgroundColor?: string;
    textColor?: string;
    buttonColor?: string;
    cardColor?: string;
    cardStyle?: string;

    showTiktok?: boolean;
    showFacebook?: boolean;
    showYoutube?: boolean;
    showInstagram?: boolean;

    tiktokURL?: string;
    facebookURL?: string;
    youtubeURL?: string;
    instagramURL?: string;
  };
};

type Product = {
  id: string;
  type: "digital" | "coaching";

  title?: string;
  thumbnail?: string;
  description?: string;

  price?: number;
  discountPrice?: number;

  buttonText?: string;
  duration?: number;
};

// ======================================================
// CREATOR PUBLIC PAGE
// ======================================================

export default function CreatorPage() {
  const params = useParams();

  // ======================================================
  // GET STORE NAME SAFELY
  // ======================================================

  const rawStoreName = params?.storeName;

  const storeName =
    typeof rawStoreName === "string"
      ? rawStoreName
      : Array.isArray(rawStoreName)
      ? rawStoreName[0]
      : "";

  // ======================================================
  // STATE
  // ======================================================

  const [creator, setCreator] =
    useState<Creator | null>(null);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  // ======================================================
  // LOAD CREATOR
  // ======================================================

  useEffect(() => {
    console.log(
      "🔎 CreatorPage params:",
      params
    );

    console.log(
      "🔎 CreatorPage storeName:",
      storeName
    );

    if (!storeName) {
      console.error(
        "❌ CreatorPage: storeName is missing.",
        params
      );

      setError(
        "Store name is missing from the URL."
      );

      setLoading(false);

      return;
    }

    loadCreator(storeName);
  }, [storeName]);

  // ======================================================
  // LOAD CREATOR FROM FIRESTORE
  // ======================================================

  const loadCreator = async (
    currentStoreName: string
  ) => {
    try {
      setLoading(true);
      setError("");

      console.log(
        "🔍 Searching Firestore for storeName:",
        currentStoreName
      );

      // ==================================================
      // FIND CREATOR
      // ==================================================

      const userQuery = query(
        collection(db, "users"),
        where(
          "storeName",
          "==",
          currentStoreName
        )
      );

      console.log(
        "📡 Sending users query..."
      );

      const userSnap =
        await getDocs(userQuery);

      console.log(
        "📦 Users found:",
        userSnap.size
      );

      // ==================================================
      // CREATOR NOT FOUND
      // ==================================================

      if (userSnap.empty) {
        console.error(
          "❌ No creator found for storeName:",
          currentStoreName
        );

        setError(
          `Creator store "${currentStoreName}" was not found.`
        );

        setLoading(false);

        return;
      }

      // ==================================================
      // CREATOR DATA
      // ==================================================

      const creatorDoc =
        userSnap.docs[0];

      const creatorData: Creator = {
        id: creatorDoc.id,
        ...creatorDoc.data(),
      };

      console.log(
        "✅ Creator found:",
        creatorData
      );

      console.log(
        "🎨 Creator design:",
        creatorData.design
      );

      setCreator(
        creatorData
      );

      // ==================================================
      // COUNT VISIT
      // ==================================================

      try {
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
          "✅ Store visit counted."
        );
      } catch (visitError) {
        console.error(
          "⚠️ Failed to count visit:",
          visitError
        );

        // Don't stop the public page
        // if visit counting fails.
      }

      // ==================================================
      // LOAD DIGITAL PRODUCTS
      // ==================================================

      console.log(
        "🔍 Loading digital products..."
      );

      const productQuery =
        query(
          collection(
            db,
            "products"
          ),
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

      console.log(
        "📦 Digital products:",
        productSnap.size
      );

      const productList: Product[] =
        productSnap.docs.map(
          (docSnap) => ({
            id: docSnap.id,
            type: "digital",
            ...docSnap.data(),
          })
        );

      // ==================================================
      // LOAD COACHING CALLS
      // ==================================================

      console.log(
        "🔍 Loading coaching calls..."
      );

      const coachingQuery =
        query(
          collection(
            db,
            "coachingCalls"
          ),
          where(
            "creatorId",
            "==",
            creatorDoc.id
          )
        );

      const coachingSnap =
        await getDocs(
          coachingQuery
        );

      console.log(
        "📦 Coaching calls:",
        coachingSnap.size
      );

      const coachingList: Product[] =
        coachingSnap.docs.map(
          (docSnap) => ({
            id: docSnap.id,
            type: "coaching",
            ...docSnap.data(),
          })
        );

      // ==================================================
      // COMBINE
      // ==================================================

      setProducts([
        ...productList,
        ...coachingList,
      ]);

      console.log(
        "✅ Creator public page loaded successfully."
      );

    } catch (error) {
      console.error(
        "❌ CreatorPage: failed to load creator:",
        error
      );

      setError(
        "Unable to load this creator store."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
          fontSize: "20px",
          padding: "20px",
        }}
      >
        <div>Loading creator store...</div>

        <div
          style={{
            fontSize: "13px",
            opacity: 0.6,
          }}
        >
          Store: {storeName || "not detected"}
        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error || !creator) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: "500px",
            padding: "30px",
            borderRadius: "20px",
            background: "#ffffff",
            boxShadow:
              "0 5px 20px rgba(0,0,0,0.1)",
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
            }}
          >
            Store Not Found
          </h1>

          <p
            style={{
              margin: 0,
              color: "#666",
            }}
          >
            {error ||
              "This creator store could not be found."}
          </p>

          <p
            style={{
              marginTop: "15px",
              fontSize: "13px",
              color: "#999",
            }}
          >
            URL store name:{" "}
            {storeName || "missing"}
          </p>
        </div>
      </div>
    );
  }

  // ======================================================
  // DESIGN SETTINGS
  // ======================================================

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

  // ======================================================
  // SOCIAL VISIBILITY
  // ======================================================

  const showTiktok =
    design.showTiktok ?? true;

  const showFacebook =
    design.showFacebook ?? true;

  const showYoutube =
    design.showYoutube ?? true;

  const showInstagram =
    design.showInstagram ?? true;

  // ======================================================
  // SOCIAL URLs
  // ======================================================

  const tiktokURL =
    design.tiktokURL?.trim() || "";

  const facebookURL =
    design.facebookURL?.trim() || "";

  const youtubeURL =
    design.youtubeURL?.trim() || "";

  const instagramURL =
    design.instagramURL?.trim() || "";

  // ======================================================
  // SOCIAL LINK CHECK
  // ======================================================

  const hasSocialLinks =
    Boolean(
      (showTiktok && tiktokURL) ||
      (showFacebook && facebookURL) ||
      (showYoutube && youtubeURL) ||
      (showInstagram && instagramURL)
    );

  // ======================================================
  // CARD RADIUS
  // ======================================================

  const cardRadius =
    cardStyle === "square"
      ? "4px"
      : cardStyle === "soft"
      ? "12px"
      : "22px";

  // ======================================================
  // PUBLIC PAGE
  // ======================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          backgroundColor,
        display: "flex",
        justifyContent:
          "center",
        padding:
          "40px 20px",
        color: textColor,
        transition:
          "all 0.2s ease",
        boxSizing: "border-box",
      }}
    >
      {/* ==========================================
          MAIN STORE CARD
      ========================================== */}

      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: cardColor,
          borderRadius: "20px",
          padding: "30px",
          textAlign: "center",
          boxShadow:
            "0 5px 20px rgba(0,0,0,.1)",
          display: "flex",
          flexDirection:
            "column",
          gap: "25px",
          boxSizing:
            "border-box",
        }}
      >
        {/* ==========================================
            PROFILE
        ========================================== */}

        <div>

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
              border:
                `4px solid ${buttonColor}`,
            }}
          />

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

          <p
            style={{
              color: textColor,
              opacity: 0.65,
              margin:
                "5px 0 15px",
            }}
          >
            @{creator.storeName}
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

          {/* ==========================================
              SOCIAL LINKS
          ========================================== */}

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
                marginBottom:
                  "10px",
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

        {/* ==========================================
            PRODUCTS + COACHING
        ========================================== */}

        <div
          style={{
            display: "flex",
            flexDirection:
              "column",
            gap: "15px",
            textAlign:
              "left",
          }}
        >

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
                    display: "block",
                    background:
                      cardColor,
                    border:
                      `1px solid ${textColor}22`,
                    borderRadius:
                      cardRadius,
                    padding:
                      "18px",
                    textDecoration:
                      "none",
                    color:
                      textColor,
                    boxShadow:
                      "0 3px 10px rgba(0,0,0,.08)",
                    transition:
                      "all 0.2s ease",
                  }}
                >

                  {/* TOP ROW */}

                  <div
                    style={{
                      display:
                        "flex",
                      gap:
                        "18px",
                      alignItems:
                        "flex-start",
                    }}
                  >

                    {/* THUMBNAIL */}

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
                          "100px",
                        height:
                          "100px",
                        objectFit:
                          "cover",
                        borderRadius:
                          cardStyle ===
                          "square"
                            ? "4px"
                            : "14px",
                        flexShrink: 0,
                      }}
                    />

                    {/* RIGHT SIDE */}

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        display:
                          "flex",
                        flexDirection:
                          "column",
                        gap:
                          "8px",
                      }}
                    >

                      {/* COACHING */}

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
                            width:
                              "fit-content",
                          }}
                        >
                          🎯 Coaching Call
                        </div>
                      )}

                      {/* TITLE */}

                      <h2
                        style={{
                          margin: 0,
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
                        {product.title}
                      </h2>

                      {/* DURATION */}

                      {product.type ===
                        "coaching" && (
                        <p
                          style={{
                            margin: 0,
                            color:
                              textColor,
                            opacity:
                              0.65,
                            fontSize:
                              "16px",
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
                                  "16px",
                                fontWeight:
                                  "bold",
                              }}
                            >
                              CA$
                              {Number(
                                product.price ||
                                  0
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

                      <p
                        style={{
                          color:
                            textColor,
                          opacity:
                            0.75,
                          overflow:
                            "hidden",
                          display:
                            "-webkit-box",
                          WebkitLineClamp:
                            3,
                          WebkitBoxOrient:
                            "vertical",
                          lineHeight:
                            1.5,
                          margin: 0,
                          fontSize:
                            "14px",
                        }}
                      >
                        {
                          product.description
                        }
                      </p>

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
                            "10px 18px",
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
                        }}
                      >
                        {product.type ===
                        "coaching"
                          ? "See available days & Book Coaching Call"
                          : "Get Access Now"}
                      </div>

                    </div>
                  </div>
                </a>
              )
            )
          )}

        </div>
      </div>
    </div>
  );
}