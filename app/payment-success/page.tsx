"use client";

import {
  useEffect,
  useState,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";

// Helper function to format time (e.g., "11:00" -> "11:00 AM")
const formatDisplayTime = (timeStr: string) => {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  
  let hour = parseInt(parts[0], 10);
  const minuteStr = parts[1];
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minuteStr} ${ampm}`;
};

function PaymentSuccessContent() {
  const searchParams = useSearchParams();

  const sessionId =
    searchParams.get("session_id");

  const [loading, setLoading] =
    useState(true);

  const [paymentData, setPaymentData] =
    useState<any>(null);

  const [error, setError] =
    useState("");

  // ==========================================
  // VERIFY PAYMENT
  // ==========================================

  useEffect(() => {
    if (!sessionId) {
      setError("Missing payment session.");
      setLoading(false);
      return;
    }

    verifyPaymentWithRetry();
  }, [sessionId]);

  async function verifyPaymentWithRetry() {
    const maxAttempts = 15;

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt++
    ) {
      try {
        const response =
          await fetch(
            `/api/verify-payment?session_id=${encodeURIComponent(
              sessionId!
            )}`,
            {
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        console.log(
          `Payment verification attempt ${attempt}:`,
          data
        );

        // ========================================
        // REFUNDED / EXPIRED
        // ========================================

        if (
          data?.paymentStatus ===
            "refunded" &&
          data?.reservationExpired === true
        ) {
          setPaymentData(data);
          setLoading(false);
          return;
        }

        // ========================================
        // CONFIRMED / PAID
        // ========================================

        if (
          data?.paymentStatus ===
            "paid" &&
          data?.reservationExpired !== true
        ) {
          setPaymentData(data);
          setLoading(false);
          return;
        }

        // ========================================
        // STILL PROCESSING
        // ========================================

        if (
          data?.paymentStatus ===
          "processing"
        ) {
          if (
            attempt < maxAttempts
          ) {
            await new Promise(
              (resolve) =>
                setTimeout(
                  resolve,
                  1000
                )
            );

            continue;
          }

          setError(
            "Your payment is still being confirmed. Please wait a moment and refresh this page."
          );

          setLoading(false);
          return;
        }

        // ========================================
        // API ERROR
        // ========================================

        if (
          !response.ok
        ) {
          setError(
            data?.error ||
              "Payment verification failed."
          );

          setLoading(false);
          return;
        }

      } catch (err) {
        console.error(
          "Payment verification error:",
          err
        );

        if (
          attempt <
          maxAttempts
        ) {
          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                1000
              )
          );

          continue;
        }

        setError(
          "We could not verify your payment. Please try again."
        );

        setLoading(false);
        return;
      }
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div
        style={{
          maxWidth: 600,
          margin: "100px auto",
          padding: "40px",
          textAlign: "center",
          fontFamily:
            "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: "48px",
            marginBottom: "20px",
          }}
        >
          ⏳
        </div>

        <h1
          style={{
            fontSize: "28px",
            color: "#222",
            marginBottom: "12px",
          }}
        >
          Confirming your payment...
        </h1>

        <p
          style={{
            color: "#666",
            fontSize: "16px",
            lineHeight: 1.6,
          }}
        >
          Please wait while we confirm
          your payment and reservation.
        </p>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div
        style={{
          maxWidth: 600,
          margin: "80px auto",
          padding: "40px",
          background: "white",
          borderRadius: "24px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)",
          textAlign: "center",
          fontFamily:
            "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: "48px",
            marginBottom: "15px",
          }}
        >
          ⚠️
        </div>

        <h1
          style={{
            fontSize: "30px",
            color: "#333",
            marginBottom: "15px",
          }}
        >
          Payment Verification
        </h1>

        <p
          style={{
            color: "#666",
            fontSize: "16px",
            lineHeight: 1.6,
          }}
        >
          {error}
        </p>
      </div>
    );
  }

  // ==========================================
  // REFUNDED / RESERVATION EXPIRED
  // ==========================================

  if (
    paymentData?.paymentStatus ===
      "refunded" &&
    paymentData?.reservationExpired ===
      true
  ) {
    return (
      <div
        style={{
          maxWidth: 650,
          margin: "80px auto",
          padding: "40px",
          background: "white",
          borderRadius: "24px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)",
          textAlign: "center",
          fontFamily:
            "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: "55px",
            marginBottom: "15px",
          }}
        >
          ⚠️
        </div>

        <h1
          style={{
            color: "#d97706",
            fontSize: "32px",
            marginBottom: "15px",
          }}
        >
          Reservation Expired
        </h1>

        <p
          style={{
            color: "#555",
            fontSize: "17px",
            lineHeight: 1.7,
            marginBottom: "25px",
          }}
        >
          Sorry, your reservation has
          expired.
        </p>

        <div
          style={{
            background: "#fff7ed",
            border:
              "1px solid #fed7aa",
            borderRadius: "16px",
            padding: "22px",
            marginBottom: "25px",
            textAlign: "left",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#7c2d12",
              lineHeight: 1.7,
              fontSize: "16px",
            }}
          >
            Your payment was received
            after the 7-minute reservation
            period had expired.
            <br />
            <br />
            <strong>
              Your payment has been
              refunded.
            </strong>
          </p>
        </div>

        <div
          style={{
            background: "#f9fafb",
            borderRadius: "14px",
            padding: "18px",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              color: "#555",
              fontSize: "15px",
              marginBottom: "8px",
            }}
          >
            💳 Payment Status
          </div>

          <strong
            style={{
              color: "#16a34a",
              fontSize: "18px",
            }}
          >
            Refunded
          </strong>
        </div>

        {paymentData?.refundId && (
          <p
            style={{
              fontSize: "13px",
              color: "#888",
              marginBottom: "25px",
              wordBreak:
                "break-all",
            }}
          >
            Refund reference:{" "}
            {paymentData.refundId}
          </p>
        )}

        <p
          style={{
            color: "#666",
            fontSize: "15px",
            lineHeight: 1.6,
          }}
        >
          Please try again if this time
          slot is still available.
        </p>

        <button
          onClick={() => {
            window.history.back();
          }}
          style={{
            marginTop: "20px",
            padding:
              "14px 28px",
            borderRadius: "10px",
            border: "none",
            background:
              "#333",
            color: "white",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          OK
        </button>
      </div>
    );
  }

  // ==========================================
  // COACHING CONFIRMED
  // ==========================================

  const isCoaching =
    paymentData?.productType ===
    "coaching";

  const scheduledDate =
    paymentData?.scheduledDate ||
    "N/A";

  const scheduledTime =
    paymentData?.scheduledTime ||
    "N/A";

  const duration =
    paymentData?.duration ||
    "60";

  // ==========================================
  // SUCCESS
  // ==========================================
  console.log("🔥 PAYMENT DATA:", paymentData);
console.log("🔥 DOWNLOAD URL:", paymentData?.downloadUrl);
  return (
    <div
      style={{
        maxWidth: 700,
        margin: "60px auto",
        padding: "40px",
        background: "white",
        borderRadius: "24px",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.08)",
        textAlign: "center",
        fontFamily:
          "system-ui, sans-serif",
      }}
    >
      <h1
        style={{
          color: "#33a285",
          fontSize: "36px",
          marginBottom: "10px",
        }}
      >
        🎉 Payment Successful
      </h1>

      <p
        style={{
          color: "#666",
          fontSize: "16px",
          marginBottom: "30px",
        }}
      >
        Thank you for your purchase.
        Your transaction was completed
        successfully.
      </p>

      <h2
        style={{
          fontSize: "24px",
          color: "#222",
          marginBottom: "25px",
        }}
      >
        {paymentData?.title ||
          paymentData?.productTitle}
      </h2>

      {/* ================================
          DIGITAL PRODUCT
      ================================= */}

      {!isCoaching && (
        <div>
          <a
            href={
              paymentData?.downloadUrl
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            <button
              style={{
                marginTop: 10,
                padding:
                  "18px 40px",
                fontSize: 18,
                borderRadius: 12,
                border: "none",
                background:
                  "#D4AF37",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Download Product
            </button>
          </a>
        </div>
      )}

      {/* ================================
          COACHING
      ================================= */}

      {isCoaching && (
        <div
          style={{
            background:
              "#f9f9f9",
            borderRadius: "16px",
            padding: "25px",
            textAlign: "left",
            marginTop: "20px",
            border:
              "1px solid #eee",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom:
                "15px",
              color: "#333",
            }}
          >
            🎯 Booking Details
          </div>

          <div
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: "10px",
              fontSize: "16px",
              color: "#555",
              marginBottom:
                "20px",
            }}
          >
            <div>
              <strong>
                📅 Scheduled Date:
              </strong>{" "}
              {scheduledDate}
            </div>

            <div>
              <strong>
                🕐 Scheduled Time:
              </strong>{" "}
              {formatDisplayTime(scheduledTime)} (Ethiopia — Addis Ababa)
            </div>

            <div>
              <strong>
                ⏱️ Duration:
              </strong>{" "}
              {duration} minutes
            </div>

            <div>
              <strong>
                🔗 Meeting Link:
              </strong>{" "}

              {paymentData?.meetingLink ? (
                <a
                  href={
                    paymentData.meetingLink
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color:
                      "#33a285",
                    textDecoration:
                      "underline",
                  }}
                >
                  Join Meeting Room
                </a>
              ) : (
                <span
                  style={{
                    color: "#888",
                  }}
                >
                  Will be shared by
                  creator shortly
                </span>
              )}
            </div>

            <div>
              <strong>
                💳 Payment Received:
              </strong>{" "}
              <span
                style={{
                  color:
                    "#16a34a",
                  fontWeight:
                    "bold",
                }}
              >
                Success
              </span>
            </div>
          </div>

          <div
            style={{
              textAlign:
                "center",
              borderTop:
                "1px solid #ddd",
              paddingTop:
                "15px",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                color: "#666",
                fontWeight:
                  "500",
              }}
            >
              📸 Please take a
              screenshot of this
              confirmation for your
              records.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// PAGE
// ==========================================

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            textAlign:
              "center",
            marginTop:
              "100px",
            fontSize:
              "20px",
          }}
        >
          Loading...
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}