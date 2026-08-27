"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  FaTiktok,
  FaFacebook,
  FaYoutube,
  FaInstagram,
} from "react-icons/fa";

export default function EditDesignPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [backgroundColor, setBackgroundColor] = useState("#D4AF37");
  const [textColor, setTextColor] = useState("#111111");
  const [buttonColor, setButtonColor] = useState("#14b3c5");
  const [cardColor, setCardColor] = useState("#ffffff");
  const [cardStyle, setCardStyle] = useState("rounded");
  const [bio, setBio] = useState("");

  // =========================
  // SOCIAL VISIBILITY
  // =========================
  const [showTiktok, setShowTiktok] = useState(true);
  const [showFacebook, setShowFacebook] = useState(true);
  const [showYoutube, setShowYoutube] = useState(true);
  const [showInstagram, setShowInstagram] = useState(true);

  // =========================
  // SOCIAL MEDIA URLS
  // =========================
  const [tiktokURL, setTiktokURL] = useState("");
  const [facebookURL, setFacebookURL] = useState("");
  const [youtubeURL, setYoutubeURL] = useState("");
  const [instagramURL, setInstagramURL] = useState("");

  const [creator, setCreator] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [coachingCalls, setCoachingCalls] = useState<any[]>([]);

  useEffect(() => {
    loadDesign();
  }, []);

  // =========================
  // LOAD DESIGN
  // =========================
  const loadDesign = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        router.push("/login");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();

        setCreator({
          id: userSnap.id,
          ...data,
        });

        const design = data.design || {};

        // Design settings
        setBackgroundColor(
          design.backgroundColor || "#D4AF37"
        );

        setTextColor(
          design.textColor || "#111111"
        );

        setButtonColor(
          design.buttonColor || "#14b3c5"
        );

        setCardColor(
          design.cardColor || "#ffffff"
        );

        setCardStyle(
          design.cardStyle || "rounded"
        );

        setBio(data.bio || "");

        // Social visibility
        setShowTiktok(
          design.showTiktok ?? true
        );

        setShowFacebook(
          design.showFacebook ?? true
        );

        setShowYoutube(
          design.showYoutube ?? true
        );

        setShowInstagram(
          design.showInstagram ?? true
        );

        // Social URLs
        setTiktokURL(
          design.tiktokURL || ""
        );

        setFacebookURL(
          design.facebookURL || ""
        );

        setYoutubeURL(
          design.youtubeURL || ""
        );

        setInstagramURL(
          design.instagramURL || ""
        );
      }

      // =========================
      // LOAD PRODUCTS
      // =========================
      const productsQuery = query(
        collection(db, "products"),
        where("userId", "==", user.uid)
      );

      const productsSnap = await getDocs(
        productsQuery
      );

      const productList =
        productsSnap.docs.map((item) => ({
          id: item.id,
          type: "digital",
          ...item.data(),
        }));

      setProducts(productList);

      // =========================
      // LOAD COACHING CALLS
      // =========================
      const coachingQuery = query(
        collection(db, "coachingCalls"),
        where("creatorId", "==", user.uid)
      );

      const coachingSnap = await getDocs(
        coachingQuery
      );

      const coachingList =
        coachingSnap.docs.map((item) => ({
          id: item.id,
          type: "coaching",
          ...item.data(),
        }));

      setCoachingCalls(coachingList);
    } catch (error) {
      console.error(
        "❌ Failed to load design/store:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SAVE DESIGN
  // =========================
  const saveDesign = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        router.push("/login");
        return;
      }

      setSaving(true);

      await updateDoc(
        doc(db, "users", user.uid),
        {
          bio: bio.trim(),

          design: {
            backgroundColor,
            textColor,
            buttonColor,
            cardColor,
            cardStyle,

            // Social visibility
            showTiktok,
            showFacebook,
            showYoutube,
            showInstagram,

            // Social URLs
            tiktokURL: tiktokURL.trim(),
            facebookURL: facebookURL.trim(),
            youtubeURL: youtubeURL.trim(),
            instagramURL: instagramURL.trim(),
          },

          designUpdatedAt: new Date(),
        }
      );

      alert(
        "Design and social links saved successfully 🚀"
      );
    } catch (error) {
      console.error(
        "❌ Failed to save design:",
        error
      );

      alert(
        "Failed to save your design."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          fontSize: "20px",
        }}
      >
        Loading design settings...
      </div>
    );
  }

  const cardRadius =
    cardStyle === "square"
      ? "4px"
      : cardStyle === "soft"
      ? "12px"
      : "22px";

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >
      {/* =========================
          HEADER
      ========================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
            }}
          >
            🎨 Edit Design
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#777",
            }}
          >
            Customize how your public CreatorStore looks.
          </p>
        </div>

        <button
          onClick={() =>
            router.push("/dashboard/store")
          }
          style={{
            padding: "12px 20px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            background: "white",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          ← Back to My Store
        </button>
      </div>

      {/* =========================
          MAIN GRID
      ========================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(280px, 1fr) minmax(300px, 1fr)",
          gap: "30px",
          alignItems: "start",
        }}
      >
        {/* =========================
            SETTINGS
        ========================= */}
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "25px",
            boxShadow:
              "0 8px 25px rgba(0,0,0,0.08)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "25px",
            }}
          >
            Store Appearance
          </h2>

          {/* BIO */}
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            Store Bio
          </label>

          <textarea
            value={bio}
            onChange={(e) =>
              setBio(e.target.value)
            }
            placeholder="Tell your audience what you do..."
            rows={4}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              boxSizing: "border-box",
              resize: "vertical",
              marginBottom: "25px",
              fontSize: "15px",
            }}
          />

          {/* COLORS */}
          <ColorSetting
            label="Background Color"
            value={backgroundColor}
            onChange={setBackgroundColor}
          />

          <ColorSetting
            label="Text Color"
            value={textColor}
            onChange={setTextColor}
          />

          <ColorSetting
            label="Button Color"
            value={buttonColor}
            onChange={setButtonColor}
          />

          <ColorSetting
            label="Card Color"
            value={cardColor}
            onChange={setCardColor}
          />

          {/* CARD STYLE */}
          <div
            style={{
              marginTop: "25px",
            }}
          >
            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              Product Card Style
            </label>

            <select
              value={cardStyle}
              onChange={(e) =>
                setCardStyle(e.target.value)
              }
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                fontSize: "15px",
                background: "white",
              }}
            >
              <option value="rounded">
                Rounded
              </option>

              <option value="soft">
                Soft Rounded
              </option>

              <option value="square">
                Square
              </option>
            </select>
          </div>

          {/* =========================
              SOCIAL MEDIA
          ========================= */}
          <div
            style={{
              marginTop: "30px",
            }}
          >
            <h3
              style={{
                marginBottom: "15px",
              }}
            >
              📱 Social Media
            </h3>

            <p
              style={{
                fontSize: "13px",
                color: "#777",
                marginBottom: "18px",
                lineHeight: 1.5,
              }}
            >
              Add your real social media URLs and
              choose which icons appear on your
              public store.
            </p>

            {/* TIKTOK */}
            <SocialURLSetting
              icon={<FaTiktok />}
              label="TikTok URL"
              placeholder="https://www.tiktok.com/@yourusername"
              value={tiktokURL}
              onChange={setTiktokURL}
              checked={showTiktok}
              onToggle={setShowTiktok}
            />

            {/* INSTAGRAM */}
            <SocialURLSetting
              icon={<FaInstagram />}
              label="Instagram URL"
              placeholder="https://www.instagram.com/yourusername"
              value={instagramURL}
              onChange={setInstagramURL}
              checked={showInstagram}
              onToggle={setShowInstagram}
            />

            {/* YOUTUBE */}
            <SocialURLSetting
              icon={<FaYoutube />}
              label="YouTube URL"
              placeholder="https://www.youtube.com/@yourchannel"
              value={youtubeURL}
              onChange={setYoutubeURL}
              checked={showYoutube}
              onToggle={setShowYoutube}
            />

            {/* FACEBOOK */}
            <SocialURLSetting
              icon={<FaFacebook />}
              label="Facebook URL"
              placeholder="https://www.facebook.com/yourusername"
              value={facebookURL}
              onChange={setFacebookURL}
              checked={showFacebook}
              onToggle={setShowFacebook}
            />
          </div>

          {/* SAVE */}
          <button
            onClick={saveDesign}
            disabled={saving}
            style={{
              width: "100%",
              marginTop: "30px",
              padding: "16px",
              borderRadius: "12px",
              border: "none",
              background: saving
                ? "#999"
                : buttonColor,
              color: "white",
              fontSize: "17px",
              fontWeight: "bold",
              cursor: saving
                ? "not-allowed"
                : "pointer",
            }}
          >
            {saving
              ? "Saving..."
              : "💾 Save Design"}
          </button>
        </div>

        {/* =========================
            LIVE PREVIEW
        ========================= */}
        <div
          style={{
            position: "sticky",
            top: "25px",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "15px",
            }}
          >
            Live Preview
          </h2>

          <div
            style={{
              background: backgroundColor,
              color: textColor,
              borderRadius: "24px",
              padding: "25px",
              maxHeight: "750px",
              overflowY: "auto",
              boxShadow:
                "0 15px 35px rgba(0,0,0,0.12)",
              transition:
                "all 0.2s ease",
            }}
          >
            {/* =========================
                CREATOR PROFILE
            ========================= */}
            <div
              style={{
                textAlign: "center",
                marginBottom: "25px",
              }}
            >
              <img
                src={
                  creator?.profileImage ||
                  "/profile-placeholder.png"
                }
                alt="Profile"
                style={{
                  width: "85px",
                  height: "85px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border:
                    `4px solid ${buttonColor}`,
                }}
              />

              <h2
                style={{
                  margin: "12px 0 5px",
                  color: textColor,
                }}
              >
                {creator?.name || "Creator"}
              </h2>

              <p
                style={{
                  margin: "0 0 10px",
                  color: textColor,
                  opacity: 0.7,
                }}
              >
                @{creator?.storeName || "store"}
              </p>

              {bio && (
                <p
                  style={{
                    margin:
                      "10px auto 0",
                    maxWidth: "450px",
                    color: textColor,
                    opacity: 0.8,
                    lineHeight: 1.5,
                    fontSize: "14px",
                  }}
                >
                  {bio}
                </p>
              )}

              {/* =========================
                  SOCIAL ICONS
              ========================= */}
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "center",
                  gap: "16px",
                  marginTop: "15px",
                }}
              >
                {/* TIKTOK */}
                {showTiktok &&
                  tiktokURL.trim() && (
                    <a
                      href={tiktokURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="TikTok"
                      style={{
                        fontSize: "20px",
                        color: textColor,
                        textDecoration:
                          "none",
                        cursor: "pointer",
                      }}
                    >
                      <FaTiktok />
                    </a>
                  )}

                {/* FACEBOOK */}
                {showFacebook &&
                  facebookURL.trim() && (
                    <a
                      href={facebookURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Facebook"
                      style={{
                        fontSize: "20px",
                        color: "#1877F2",
                        textDecoration:
                          "none",
                        cursor: "pointer",
                      }}
                    >
                      <FaFacebook />
                    </a>
                  )}

                {/* YOUTUBE */}
                {showYoutube &&
                  youtubeURL.trim() && (
                    <a
                      href={youtubeURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="YouTube"
                      style={{
                        fontSize: "20px",
                        color: "#FF0000",
                        textDecoration:
                          "none",
                        cursor: "pointer",
                      }}
                    >
                      <FaYoutube />
                    </a>
                  )}

                {/* INSTAGRAM */}
                {showInstagram &&
                  instagramURL.trim() && (
                    <a
                      href={instagramURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Instagram"
                      style={{
                        fontSize: "20px",
                        color: "#E4405F",
                        textDecoration:
                          "none",
                        cursor: "pointer",
                      }}
                    >
                      <FaInstagram />
                    </a>
                  )}
              </div>
            </div>

            {/* =========================
                PRODUCTS
            ========================= */}
            {products.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection:
                    "column",
                  gap: "15px",
                }}
              >
                {products.map(
                  (product) => (
                    <div
                      key={product.id}
                      style={{
                        background:
                          cardColor,
                        color:
                          textColor,
                        borderRadius:
                          cardRadius,
                        padding: "15px",
                        boxShadow:
                          "0 5px 15px rgba(0,0,0,0.10)",
                        transition:
                          "all 0.2s ease",
                      }}
                    >
                      <img
                        src={
                          product.thumbnail ||
                          "/product-placeholder.png"
                        }
                        alt={
                          product.title
                        }
                        style={{
                          width: "100%",
                          height: "140px",
                          objectFit:
                            "cover",
                          borderRadius:
                            "12px",
                          display:
                            "block",
                          marginBottom:
                            "12px",
                        }}
                      />

                      <h3
                        style={{
                          margin:
                            "0 0 6px",
                          color:
                            textColor,
                          fontSize:
                            "18px",
                        }}
                      >
                        {product.title}
                      </h3>

                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "8px",
                          marginBottom:
                            "8px",
                        }}
                      >
                        {product.discountPrice ? (
                          <>
                            <strong
                              style={{
                                color:
                                  buttonColor,
                                fontSize:
                                  "17px",
                              }}
                            >
                              CA$
                              {Number(
                                product.discountPrice
                              ).toFixed(2)}
                            </strong>

                            <span
                              style={{
                                color:
                                  "#888",
                                textDecoration:
                                  "line-through",
                                fontSize:
                                  "14px",
                              }}
                            >
                              CA$
                              {Number(
                                product.price
                              ).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <strong
                            style={{
                              color:
                                buttonColor,
                              fontSize:
                                "17px",
                            }}
                          >
                            CA$
                            {Number(
                              product.price ||
                                0
                            ).toFixed(2)}
                          </strong>
                        )}
                      </div>

                      <p
                        style={{
                          margin:
                            "0 0 12px",
                          color:
                            textColor,
                          opacity: 0.7,
                          fontSize:
                            "13px",
                          lineHeight:
                            1.5,
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

                      <button
                        style={{
                          width: "100%",
                          padding:
                            "11px",
                          borderRadius:
                            "10px",
                          border:
                            "none",
                          background:
                            buttonColor,
                          color: "white",
                          fontWeight:
                            "bold",
                          cursor:
                            "pointer",
                        }}
                      >
                        {product.buttonText ||
                          "Get Access Now"}
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            {/* =========================
                COACHING CALLS
            ========================= */}
            {coachingCalls.length >
              0 && (
              <div
                style={{
                  display:
                    "flex",
                  flexDirection:
                    "column",
                  gap: "15px",
                  marginTop:
                    "15px",
                }}
              >
                {coachingCalls.map(
                  (coaching) => (
                    <div
                      key={
                        coaching.id
                      }
                      style={{
                        background:
                          cardColor,
                        color:
                          textColor,
                        borderRadius:
                          cardRadius,
                        padding: "15px",
                        boxShadow:
                          "0 5px 15px rgba(0,0,0,0.10)",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "inline-block",
                          background:
                            buttonColor,
                          color:
                            "white",
                          padding:
                            "5px 9px",
                          borderRadius:
                            "7px",
                          fontSize:
                            "11px",
                          fontWeight:
                            "bold",
                          marginBottom:
                            "10px",
                        }}
                      >
                        🎯 Coaching Call
                      </div>

                      <img
                        src={
                          coaching.thumbnail ||
                          "/product-placeholder.png"
                        }
                        alt={
                          coaching.title
                        }
                        style={{
                          width: "100%",
                          height: "140px",
                          objectFit:
                            "cover",
                          borderRadius:
                            "12px",
                          display:
                            "block",
                          marginBottom:
                            "12px",
                        }}
                      />

                      <h3
                        style={{
                          margin:
                            "0 0 6px",
                          color:
                            textColor,
                        }}
                      >
                        {
                          coaching.title
                        }
                      </h3>

                      <div
                        style={{
                          color:
                            textColor,
                          opacity: 0.7,
                          fontSize:
                            "13px",
                          marginBottom:
                            "8px",
                        }}
                      >
                        ⏱️{" "}
                        {coaching.duration ||
                          60}{" "}
                        minutes • 1-on-1
                        session
                      </div>

                      <div
                        style={{
                          marginBottom:
                            "8px",
                        }}
                      >
                        {coaching.discountPrice ? (
                          <>
                            <strong
                              style={{
                                color:
                                  buttonColor,
                              }}
                            >
                              CA$
                              {Number(
                                coaching.discountPrice
                              ).toFixed(2)}
                            </strong>{" "}
                            <span
                              style={{
                                color:
                                  "#888",
                                textDecoration:
                                  "line-through",
                                fontSize:
                                  "13px",
                              }}
                            >
                              CA$
                              {Number(
                                coaching.price
                              ).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <strong
                            style={{
                              color:
                                buttonColor,
                            }}
                          >
                            CA$
                            {Number(
                              coaching.price ||
                                0
                            ).toFixed(2)}
                          </strong>
                        )}
                      </div>

                      <p
                        style={{
                          margin:
                            "0 0 12px",
                          color:
                            textColor,
                          opacity: 0.7,
                          fontSize:
                            "13px",
                          lineHeight:
                            1.5,
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
                          coaching.description
                        }
                      </p>

                      <button
                        style={{
                          width: "100%",
                          padding:
                            "11px",
                          borderRadius:
                            "10px",
                          border:
                            "none",
                          background:
                            buttonColor,
                          color:
                            "white",
                          fontWeight:
                            "bold",
                        }}
                      >
                        {coaching.buttonText ||
                          "Book Coaching Call"}
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            {/* =========================
                EMPTY STORE
            ========================= */}
            {products.length === 0 &&
              coachingCalls.length ===
                0 && (
                <div
                  style={{
                    background:
                      cardColor,
                    borderRadius:
                      cardRadius,
                    padding: "30px",
                    textAlign:
                      "center",
                    color:
                      textColor,
                  }}
                >
                  Your store has no
                  products yet.
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// COLOR SETTING COMPONENT
// =====================================================

function ColorSetting({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      style={{
        marginBottom: "18px",
      }}
    >
      <label
        style={{
          display: "block",
          fontWeight: "bold",
          marginBottom: "8px",
        }}
      >
        {label}
      </label>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          style={{
            width: "55px",
            height: "42px",
            border: "none",
            padding: 0,
            cursor: "pointer",
            background:
              "transparent",
          }}
        />

        <input
          type="text"
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          style={{
            flex: 1,
            padding: "11px",
            borderRadius: "9px",
            border:
              "1px solid #ddd",
            fontFamily:
              "monospace",
          }}
        />
      </div>
    </div>
  );
}

// =====================================================
// SOCIAL URL SETTING COMPONENT
// =====================================================

function SocialURLSetting({
  icon,
  label,
  placeholder,
  value,
  onChange,
  checked,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  checked: boolean;
  onToggle: (value: boolean) => void;
}) {
  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "15px",
        border:
          "1px solid #e5e5e5",
        borderRadius: "12px",
        background: "#fafafa",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom:
            "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: "bold",
          }}
        >
          <span
            style={{
              fontSize: "19px",
            }}
          >
            {icon}
          </span>

          {label}
        </div>

        <label
          style={{
            display: "flex",
            alignItems:
              "center",
            gap: "6px",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) =>
              onToggle(
                e.target.checked
              )
            }
          />

          Show
        </label>
      </div>

      <input
        type="url"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "11px",
          borderRadius: "9px",
          border:
            "1px solid #ddd",
          boxSizing:
            "border-box",
          fontSize: "14px",
          background: "white",
        }}
      />
    </div>
  );
}