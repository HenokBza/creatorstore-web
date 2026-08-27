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

      try {
        await updateDoc(
          doc(db, "users", creatorDoc.id),
          {
            visits: increment(1),
          }
        );
      } catch (visitError) {
        console.error(
          "❌ Failed to count visit:",
          visitError
        );
      }

      // ==========================================
      // LOAD DIGITAL PRODUCTS
      // ==========================================

      const productQuery = query(
        collection(db, "products"),
        where("userId", "==", creatorDoc.id)
      );

      const productSnap = await getDocs(
        productQuery
      );

      const productList =
        productSnap.docs.map(
          (docSnap) => ({
            id: docSnap.id,
            type: "digital",
            ...docSnap.data(),
          })
        );

      // ==========================================
      // LOAD COACHING CALLS
      // ==========================================

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

      const coachingList =
        coachingSnap.docs.map(
          (docSnap) => ({
            id: docSnap.id,
            type: "coaching",
            ...docSnap.data(),
          })
        );

      // ==========================================
      // COMBINE PRODUCTS + COACHING
      // ==========================================

      setProducts([
        ...productList,
        ...coachingList,
      ]);

    } catch (error) {
      console.error(
        "❌ Failed to load creator:",
        error
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (!creator) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "20px",
        }}
      >
        Loading...
      </div>
    );
  }

  // ==========================================
  // DESIGN SETTINGS
  // ==========================================

  const design = creator.design || {};

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

  // ==========================================
  // SOCIAL VISIBILITY
  // ==========================================

  const showTiktok =
    design.showTiktok ?? true;

  const showFacebook =
    design.showFacebook ?? true;

  const showYoutube =
    design.showYoutube ?? true;

  const showInstagram =
    design.showInstagram ?? true;

  // ==========================================
  // SOCIAL MEDIA URLS
  //
  // IMPORTANT:
  // These now come from:
  //
  // creator.design.tiktokURL
  // creator.design.facebookURL
  // creator.design.youtubeURL
  // creator.design.instagramURL
  // ==========================================

  const tiktokURL =
    design.tiktokURL?.trim() || "";

  const facebookURL =
    design.facebookURL?.trim() || "";

  const youtubeURL =
    design.youtubeURL?.trim() || "";

  const instagramURL =
    design.instagramURL?.trim() || "";

  // ==========================================
  // CARD RADIUS
  // ==========================================

  const cardRadius =
    cardStyle === "square"
      ? "4px"
      : cardStyle === "soft"
      ? "12px"
      : "22px";

  // ==========================================
  // CHECK IF SOCIAL LINKS EXIST
  // ==========================================

  const hasSocialLinks =
    (showTiktok && tiktokURL) ||
    (showFacebook && facebookURL) ||
    (showYoutube && youtubeURL) ||
    (showInstagram && instagramURL);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: backgroundColor,
        display: "flex",
        justifyContent: "center",
        padding: "40px 20px",
        color: textColor,
        transition: "all 0.2s ease",
        boxSizing: "border-box",
      }}
    >
      {/* ======================================
          MAIN STORE CARD
      ====================================== */}

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
          flexDirection: "column",
          gap: "25px",
          boxSizing: "border-box",
        }}
      >

        {/* ======================================
            PROFILE SECTION
        ====================================== */}

        <div>

          {/* PROFILE IMAGE */}

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

          {/* CREATOR NAME */}

          <h1
            style={{
              margin: 0,
              fontSize: "24px",
              color: textColor,
            }}
          >
            {creator.name}
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
            @{creator.storeName}
          </p>

          {/* ==================================
              BIO
          ================================== */}

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

          {/* ==================================
              SOCIAL MEDIA ICONS
          ================================== */}

          {hasSocialLinks ? (
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

              {/* ==============================
                  TIKTOK
              ============================== */}

              {showTiktok &&
                tiktokURL && (
                  <a
                    href={tiktokURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="interactive-btn"
                    style={{
                      color: textColor,
                      fontSize: "28px",
                      display: "flex",
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

              {/* ==============================
                  FACEBOOK
              ============================== */}

              {showFacebook &&
                facebookURL && (
                  <a
                    href={facebookURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="interactive-btn"
                    style={{
                      color:
                        "#1877F2",
                      fontSize: "28px",
                      display: "flex",
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

              {/* ==============================
                  YOUTUBE
              ============================== */}

              {showYoutube &&
                youtubeURL && (
                  <a
                    href={youtubeURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="interactive-btn"
                    style={{
                      color:
                        "#FF0000",
                      fontSize: "28px",
                      display: "flex",
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

              {/* ==============================
                  INSTAGRAM
              ============================== */}

              {showInstagram &&
                instagramURL && (
                  <a
                    href={instagramURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="interactive-btn"
                    style={{
                      color:
                        "#E4405F",
                      fontSize: "28px",
                      display: "flex",
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
          ) : null}

        </div>

        {/* ======================================
            PRODUCTS + COACHING
        ====================================== */}

        <div
          style={{
            display: "flex",
            flexDirection:
              "column",
            gap: "15px",
            textAlign: "left",
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
                    padding: "18px",
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

                  {/* ==================================
                      TOP ROW
                  ================================== */}

                  <div
                    style={{
                      display:
                        "flex",
                      gap: "18px",
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
                        product.title
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
                        flexShrink:
                          0,
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
                        gap: "8px",
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
                              "5px",
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
                        {
                          product.title
                        }
                      </h2>

                      {/* COACHING DURATION */}

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
                          gap: "10px",
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
                              product.price
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