"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { FaTiktok, FaFacebook, FaYoutube, FaInstagram } from "react-icons/fa";
import { db } from "@/lib/firebase";

import {
  doc,
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore";

interface Product {
  id: string;
  userId: string;
  creatorId?: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  discountPrice: number;
  buttonText: string;
  benefits: string[];
  isActive?: boolean;
  visits?: number;
  customers?: number;
  revenue?: number;
  duration?: number;
  meetingLink?: string;

  // Coaching Availability fields
  availableDays?: string[];
  availableTimes?: string[];
  availabilityTimeZone?: string;

  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

interface Creator {
  id: string;
  name: string;
  storeName: string;
  profileImage: string;
  email: string;
  currency?: string;
}

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const productId = params.productId as string;

  const type = searchParams.get("type") || "digital";
  const isCoaching = searchParams.get("type") === "coaching";

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [email, setEmail] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [reservationExpiresAt, setReservationExpiresAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [reservationExpired, setReservationExpired] = useState(false);

  // 1. Window resize effect
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener("resize", handleResize);
  }, []);

  // 2. Load product effect
  useEffect(() => {
    if (!productId) return;
    loadProduct();
  }, [productId, isCoaching]);

  // 3. Trigger 7-minute reservation timer as soon as both Date & Time are chosen for coaching
  useEffect(() => {
    if (isCoaching && scheduledDate && scheduledTime) {
      const expiresAt = Date.now() + 7 * 60 * 1000; // 7 minutes from now
      setReservationExpiresAt(expiresAt);
      setRemainingSeconds(7 * 60);
      setReservationExpired(false);
    }
  }, [scheduledDate, scheduledTime, isCoaching]);

  // 4. Timer countdown interval effect
  useEffect(() => {
    if (!reservationExpiresAt) return;

    const timer = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil(
          (reservationExpiresAt - Date.now()) / 1000
        )
      );

      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        setReservationExpired(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [reservationExpiresAt]);

  const loadProduct = async () => {
    try {
      const collectionName = isCoaching ? "coachingCalls" : "products";

      const productRef = doc(db, collectionName, productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        setLoading(false);
        return;
      }

      const productData = {
        id: productSnap.id,
        ...productSnap.data(),
      } as Product;

      if (productData.isActive === false) {
        alert("This product is currently unavailable.");
        window.location.href = "/";
        return;
      }

      setProduct(productData);

      await updateDoc(doc(db, collectionName, productId), {
        visits: increment(1),
      });

      const creatorId = productData.userId || productData.creatorId;

      if (!creatorId) {
        console.error("❌ Creator ID missing");
        setLoading(false);
        return;
      }

      const creatorRef = doc(db, "users", creatorId);
      const creatorSnap = await getDoc(creatorRef);

      if (creatorSnap.exists()) {
        const data = creatorSnap.data();

        setCreator({
          id: creatorSnap.id,
          name:
            data.name ||
            data.fullName ||
            data.displayName ||
            "Creator",
          storeName:
            data.storeName ||
            data.store ||
            data.shopName ||
            "Store",
          profileImage:
            data.profileImage ||
            data.photoURL ||
            "/profile-placeholder.png",
          email: data.email || "",
        } as Creator);
      }
    } catch (error) {
      console.error("❌ LOAD CHECKOUT ERROR:", error);
    }

    setLoading(false);
  };

  // ==========================================
  // BUY PRODUCT / COACHING
  // ==========================================

  const buyProduct = async () => {
    if (reservationExpired) {
      alert("Your reservation has expired. Please re-select your schedule.");
      return;
    }

    if (!email.trim()) {
      alert("Please enter your email");
      return;
    }

    if (isCoaching) {
      if (!scheduledDate) {
        alert("Please choose a date");
        return;
      }

      if (!scheduledTime) {
        alert("Please choose a time");
        return;
      }

      // Validate selected day against availableDays
      if (product?.availableDays && product.availableDays.length > 0) {
        const dateObj = new Date(scheduledDate + "T00:00:00");
        const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });

        if (!product.availableDays.includes(dayName)) {
          alert("Please choose an available schedule");
          return;
        }
      }

      // Validate selected time against availableTimes
      if (product?.availableTimes && product.availableTimes.length > 0) {
        const formattedTime = scheduledTime.slice(0, 5);
        if (!product.availableTimes.includes(formattedTime)) {
          alert("Please choose an available schedule");
          return;
        }
      }
    }

    try {
      const response = await fetch(
        "/api/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: product?.id,
            email: email.trim(),
            type: isCoaching ? "coaching" : "digital",
            scheduledDate: isCoaching ? scheduledDate : null,
            scheduledTime: isCoaching ? scheduledTime : null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed.");
      }

      if (!data.url) {
        throw new Error("Stripe checkout URL was not returned.");
      }

      window.location.href = data.url;

    } catch (error) {
      console.error("❌ CHECKOUT ERROR:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Checkout failed."
      );
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 22,
        }}
      >
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 24,
        }}
      >
        Product not found
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#33a285",
        display: "flex",
        justifyContent: "center",
        padding: isMobile ? "20px" : "40px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 420px",
          gap: isMobile ? "30px" : "60px",
          alignItems: "start",
        }}
      >
        {/* LEFT */}
        <div>
          <img
            src={product.thumbnail || "/product-placeholder.png"}
            alt={product.title}
            style={{
              width: "30%",
              height: isMobile ? "100px" : "200px",
              objectFit: "cover",
              borderRadius: "24px",
              boxShadow: "0 8px 25px rgba(0,0,0,.08)",
            }}
          />

          <h1
            style={{
              marginTop: "35px",
              fontSize: isMobile ? "30px" : "42px",
              fontWeight: "bold",
              lineHeight: 1.2,
            }}
          >
            {product.title}
          </h1>

          <p
            style={{
              marginTop: "20px",
              color: "black",
              fontSize: isMobile ? "16px" : "18px",
              lineHeight: 1.8,
              maxWidth: "760px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflowWrap: "break-word",
            }}
          >
            {product.description}
          </p>

          <h2
            style={{
              marginTop: "45px",
              marginBottom: "25px",
              fontSize: "28px",
            }}
          >
            What you'll get
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {product.benefits
              ?.filter((item) => item.trim() !== "")
              .map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: isMobile ? "15px" : "18px 22px",
                    background: "white",
                    borderRadius: "16px",
                    boxShadow: "0 5px 18px rgba(0,0,0,.05)",
                  }}
                >
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: "#D4AF37",
                      color: "white",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontWeight: "bold",
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </div>

                  <div
                    style={{
                      fontSize: "17px",
                      color: "#333",
                      lineHeight: 1.6,
                      wordBreak: "break-word",
                    }}
                  >
                    {item}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* RIGHT */}
        <div
          style={{
            background: "white",
            borderRadius: "28px",
            padding: "35px",
            height: "fit-content",
            position: isMobile ? "relative" : "sticky",
            top: isMobile ? "0" : "30px",
            boxShadow: "0 10px 35px rgba(0,0,0,.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <img
              src={creator?.profileImage || "/profile-placeholder.png"}
              alt="creator"
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #D4AF37",
              }}
            />

            <div>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "22px",
                }}
              >
                {creator?.name}
              </div>

              <div
                style={{
                  color: "#777",
                  fontSize: "16px",
                }}
              >
                @{creator?.storeName}
              </div>
            </div>
          </div>

          {/* SOCIAL MEDIA ICONS ROW */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              marginTop: "15px",
              marginBottom: "20px",
            }}
          >
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" style={{ color: "black", fontSize: "24px" }}><FaTiktok /></a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: "#1877F2", fontSize: "24px" }}><FaFacebook /></a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style={{ color: "#FF0000", fontSize: "24px" }}><FaYoutube /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: "#E4405F", fontSize: "24px" }}><FaInstagram /></a>
          </div>

          {/* ==========================================
              COACHING AVAILABILITY INFO (Under Socials)
          ========================================== */}
          {isCoaching && (
            <div
              style={{
                background: "#fdf8e2",
                border: "1px solid #f3e5ab",
                borderRadius: "14px",
                padding: "14px",
                marginBottom: "20px",
                fontSize: "13px",
                color: "#444",
                lineHeight: "1.5",
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>📅</span> Availability Schedule:
              </div>

              <div style={{ marginBottom: "4px" }}>
                <strong>Days:</strong> {product.availableDays && product.availableDays.length > 0 ? product.availableDays.join(", ") : "Flexible"}
              </div>

              <div style={{ marginBottom: "4px" }}>
                <strong>Timezone:</strong> Ethiopia — Addis Ababa
              </div>

              <div>
                <strong>Times:</strong>{" "}
                {product.availableTimes && product.availableTimes.length > 0 ? (
                  product.availableTimes.map((t, i) => {
                    const [hourStr, minuteStr] = t.split(":");
                    let hour = parseInt(hourStr, 10);
                    const ampm = hour >= 12 ? "pm" : "am";
                    hour = hour % 12 || 12;
                    const formattedDisplayTime = `${hour}:${minuteStr}${ampm}`;

                    return (
                      <span
                        key={i}
                        style={{
                          display: "inline-block",
                          background: "white",
                          padding: "2px 6px",
                          borderRadius: "6px",
                          border: "1px solid #e2d29b",
                          marginRight: "4px",
                          marginBottom: "4px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {formattedDisplayTime}
                      </span>
                    );
                  })
                ) : (
                  "Anytime"
                )}
              </div>
            </div>
          )}

          <hr
            style={{
              margin: "20px 0",
              border: "none",
              borderTop: "1px solid #eee",
            }}
          />

          <div
            style={{
              fontSize: "15px",
              color: "#777",
              marginBottom: "6px",
            }}
          >
            Price
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            {product.discountPrice ? (
              <>
                <div
                  style={{
                    fontSize: isMobile ? "18px" : "22px",
                    fontWeight: "bold",
                    color: "#37b4d4",
                  }}
                >
                  CA${product.discountPrice}
                </div>
                <div
                  style={{
                    fontSize: isMobile ? "16px" : "16px",
                    fontWeight: "bold",
                    color: "#888",
                    textDecoration: "line-through",
                  }}
                >
                  CA${product.price}
                </div>
              </>
            ) : (
              <div
                style={{
                  fontSize: isMobile ? "18px" : "22px",
                  fontWeight: "bold",
                  color: "#37c4d4",
                }}
              >
                CA${product.price}
              </div>
            )}
          </div>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid #ddd",
              fontSize: "15px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          {isCoaching && (
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "bold",
                    marginBottom: "6px",
                    fontSize: "14px",
                  }}
                >
                  📅 Choose your date
                </label>

                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => {
                    const selectedDateStr = e.target.value;
                    if (!selectedDateStr) {
                      setScheduledDate("");
                      return;
                    }

                    if (product?.availableDays && product.availableDays.length > 0) {
                      const dateObj = new Date(selectedDateStr + "T00:00:00");
                      const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });

                      if (!product.availableDays.includes(dayName)) {
                        alert("Please choose an available schedule");
                        setScheduledDate("");
                        return;
                      }
                    }

                    setScheduledDate(selectedDateStr);
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "12px",
                    border: "1px solid #ddd",
                    fontSize: "15px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "bold",
                    marginBottom: "6px",
                    fontSize: "14px",
                  }}
                >
                  🕐 Choose your time
                </label>

                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "12px",
                    border: "1px solid #ddd",
                    fontSize: "15px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div
                style={{
                  padding: "10px",
                  background: "#fff8e1",
                  borderRadius: "10px",
                  fontSize: "12px",
                  color: "#666",
                }}
              >
                🎯 Your selected date and time will be attached to your coaching booking.
              </div>
            </div>
          )}

          {isCoaching &&
            reservationExpiresAt && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "16px",
                  borderRadius: "12px",
                  background: reservationExpired ? "#fef2f2" : "#fff7ed",
                  border: `1px solid ${reservationExpired ? "#fecaca" : "#fed7aa"}`,
                  textAlign: "center",
                }}
              >
                {!reservationExpired ? (
                  <>
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        color: "#9a3412",
                      }}
                    >
                      ⏳ Your reservation is held for
                    </div>

                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: "bold",
                        marginTop: "6px",
                        color: "#dc2626",
                      }}
                    >
                      {String(
                        Math.floor(remainingSeconds / 60)
                      ).padStart(2, "0")}
                      :
                      {String(
                        remainingSeconds % 60
                      ).padStart(2, "0")}
                    </div>

                    <div
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        marginTop: "5px",
                      }}
                    >
                      Many clients waiting this reservation! Please complete your payment before the reservation expires.
                    </div>
                
          <button
            onClick={buyProduct}
            disabled={product.isActive === false || reservationExpired}
            className="interactive-btn"
            style={{
              marginTop: "20px",
              width: "100%",
              padding: isMobile ? "16px" : "18px",
              background: product.isActive === false || reservationExpired ? "#999" : "#D4AF37",
              color: "white",
              border: "none",
              borderRadius: "14px",
              fontWeight: "bold",
              fontSize: "18px",
              cursor: product.isActive === false || reservationExpired ? "not-allowed" : "pointer",
              opacity: product.isActive === false || reservationExpired ? 0.6 : 1,
            }}
          >
            {product.isActive === false
              ? "Unavailable"
              : reservationExpired
              ? "Reservation Expired"
              : product.buttonText || "Get Access Now"}
          </button>
                 </>
                ) : (
                
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: "bold",
                      color: "#dc2626",
                      lineHeight: 1.5,
                    }}
                  >
                    ❌ Your reservation expired. Please try again if this time slot is still available. or Choose a new date/time.
                  </div>
                )}
              </div>
            )}

          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              background: "#fafafa",
              borderRadius: "12px",
              fontSize: "13px",
              color: "#666",
              lineHeight: 1.6,
            }}
          >
            🔒 Secure checkout powered by <strong>CreatorStore</strong>

            {isCoaching ? (
              <>
                <br />
                📅 Your coaching session will be scheduled after purchase.
                <br />
                🎯 1-on-1 coaching session
                <br />
                ⏱️ {product.duration || 60} minute session
                <br />
                💳 Visa • Mastercard • Apple Pay • Google Pay
              </>
            ) : (
              <>
                <br /> You will get product immediately after purchase.
                <br />
                ⚡ Instant digital delivery
                <br />
                💳 Visa • Mastercard • Apple Pay • Google Pay
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}