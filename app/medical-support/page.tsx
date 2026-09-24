"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

type Campaign = {
  userId: string;
  title: string;
  description: string;
  images: string[];
  goalAmount: number;
  raisedAmount: number;
  currency: string;
  donors?: number;
  status?: string;
};

export default function MedicalSupportPublicPage() {
  const params = useParams();

  const campaignId = params?.campaignId as string;

  const [campaign, setCampaign] =
    useState<Campaign | null>(null);

  const [loading, setLoading] = useState(true);

  const [donationAmount, setDonationAmount] =
    useState("");

  const [donating, setDonating] =
    useState(false);

  // ==============================
  // LOAD CAMPAIGN
  // ==============================

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        if (!campaignId) return;

        const campaignRef = doc(
          db,
          "medicalSupport",
          campaignId
        );

        const campaignSnap =
          await getDoc(campaignRef);

        if (!campaignSnap.exists()) {
          setCampaign(null);
          return;
        }

        const data =
          campaignSnap.data() as Campaign;

        setCampaign(data);
      } catch (error) {
        console.error(
          "Error loading medical support:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadCampaign();
  }, [campaignId]);

  // ==============================
  // DONATION PRESETS
  // ==============================

  const selectDonation = (amount: number) => {
    setDonationAmount(amount.toString());
  };

  // ==============================
  // DONATE
  // ==============================

  const handleDonate = async () => {
    if (!campaign) return;

    const amount = Number(donationAmount);

    if (!amount || isNaN(amount)) {
      alert("Please enter a donation amount.");
      return;
    }

    if (amount < 1) {
      alert(
        "The minimum donation amount is CA$5."
      );
      return;
    }

    try {
      setDonating(true);

      const response = await fetch(
        "/api/create-checkout-session",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            campaignId,
            donationAmount: amount,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to create payment session."
        );
      }

      if (!data.url) {
        throw new Error(
          "Stripe Checkout URL was not returned."
        );
      }

      // Open Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error(
        "Donation checkout error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );

      setDonating(false);
    }
  };

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f7f7",
        }}
      >
        <p>Loading medical support...</p>
      </main>
    );
  }

  // ==============================
  // NOT FOUND
  // ==============================

  if (!campaign) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f7f7",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "18px",
            textAlign: "center",
            maxWidth: "500px",
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: "50px",
              marginBottom: "15px",
            }}
          >
            ❤️
          </div>

          <h1
            style={{
              marginBottom: "10px",
            }}
          >
            Medical Support Not Found
          </h1>

          <p
            style={{
              color: "#666",
            }}
          >
            This medical support campaign may no
            longer be available.
          </p>
        </div>
      </main>
    );
  }

  // ==============================
  // CALCULATIONS
  // ==============================

  const raised = Number(
    campaign.raisedAmount || 0
  );

  const goal = Number(
    campaign.goalAmount || 0
  );

  const percentage =
    goal > 0
      ? Math.min((raised / goal) * 100, 100)
      : 0;

  const formattedRaised =
    raised.toLocaleString("en-CA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formattedGoal =
    goal.toLocaleString("en-CA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // ==============================
  // PAGE
  // ==============================

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f7f7",
        padding: "40px 20px 60px",
      }}
    >
      <div
        style={{
          maxWidth: "950px",
          margin: "0 auto",
        }}
      >
        {/* ==========================
            TITLE
        ========================== */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 42px)",
              margin: 0,
              color: "#111",
              lineHeight: 1.2,
            }}
          >
            {campaign.title}
          </h1>
        </div>

        {/* ==========================
            PHOTOS
        ========================== */}

        {campaign.images &&
          campaign.images.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  campaign.images.length === 1
                    ? "1fr"
                    : "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "15px",
                marginBottom: "30px",
              }}
            >
              {campaign.images.map(
                (image, index) => (
                  <div
                    key={image}
                    style={{
                      background: "white",
                      borderRadius: "16px",
                      overflow: "hidden",
                      boxShadow:
                        "0 5px 20px rgba(0,0,0,0.06)",
                    }}
                  >
                    <img
                      src={image}
                      alt={`${campaign.title} ${
                        index + 1
                      }`}
                      style={{
                        width: "100%",
                        height:
                          campaign.images.length === 1
                            ? "450px"
                            : "280px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>
                )
              )}
            </div>
          )}

        {/* ==========================
            DESCRIPTION
        ========================== */}

        <div
          style={{
            background: "white",
            borderRadius: "18px",
            padding: "30px",
            marginBottom: "25px",
            boxShadow:
              "0 5px 20px rgba(0,0,0,0.06)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "15px",
              fontSize: "24px",
            }}
          >
            About This Medical Support
          </h2>

          <p
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.8,
              color: "#555",
              margin: 0,
              fontSize: "16px",
            }}
          >
            {campaign.description}
          </p>
        </div>

        {/* ==========================
            FUNDRAISING PROGRESS
        ========================== */}

        <div
          style={{
            background: "white",
            borderRadius: "18px",
            padding: "30px",
            marginBottom: "25px",
            boxShadow:
              "0 5px 20px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "20px",
              marginBottom: "12px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#111",
                }}
              >
                CA${formattedRaised}
              </div>

              <div
                style={{
                  color: "#777",
                  fontSize: "14px",
                }}
              >
                raised
              </div>
            </div>

            <div
              style={{
                textAlign: "right",
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                }}
              >
                CA${formattedGoal}
              </div>

              <div
                style={{
                  color: "#777",
                  fontSize: "14px",
                }}
              >
                goal
              </div>
            </div>
          </div>

          {/* Progress bar */}

          <div
            style={{
              width: "100%",
              height: "14px",
              background: "#e9e9e9",
              borderRadius: "20px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${percentage}%`,
                height: "100%",
                background: "#D4AF37",
                borderRadius: "20px",
                transition:
                  "width 0.3s ease",
              }}
            />
          </div>

          <div
            style={{
              marginTop: "10px",
              fontSize: "14px",
              color: "#666",
            }}
          >
            {percentage.toFixed(1)}% of the goal
          </div>

          {campaign.donors !== undefined && (
            <div
              style={{
                marginTop: "10px",
                fontSize: "14px",
                color: "#777",
              }}
            >
              {campaign.donors}{" "}
              {campaign.donors === 1
                ? "supporter"
                : "supporters"}
            </div>
          )}
        </div>

        {/* ==========================
            DONATION CARD
        ========================== */}

        <div
          style={{
            background: "white",
            borderRadius: "18px",
            padding: "30px",
            boxShadow:
              "0 5px 20px rgba(0,0,0,0.06)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            How much do you want to donate?
          </h2>

          <p
            style={{
              textAlign: "center",
              color: "#777",
              marginBottom: "25px",
            }}
          >
            Choose an amount or enter your own.
          </p>

          {/* Preset amounts */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, 1fr)",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            {[10, 25, 50, 100].map(
              (amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() =>
                    selectDonation(amount)
                  }
                  disabled={donating}
                  style={{
                    padding: "13px 8px",
                    borderRadius: "10px",
                    border:
                      donationAmount ===
                      amount.toString()
                        ? "2px solid #D4AF37"
                        : "1px solid #ddd",
                    background:
                      donationAmount ===
                      amount.toString()
                        ? "#fff9df"
                        : "white",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  CA${amount}
                </button>
              )
            )}
          </div>

          {/* Custom amount */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #ddd",
              borderRadius: "10px",
              overflow: "hidden",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                paddingLeft: "15px",
                fontWeight: 600,
                color: "#555",
              }}
            >
              CA$
            </span>

            <input
              type="number"
              min="1"
              step="0.01"
              value={donationAmount}
              onChange={(e) =>
                setDonationAmount(
                  e.target.value
                )
              }
              placeholder="Enter amount"
              disabled={donating}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                padding: "15px 10px",
                fontSize: "18px",
              }}
            />
          </div>

          {/* Donate button */}

          <button
            type="button"
            onClick={handleDonate}
            disabled={donating}
            style={{
              width: "100%",
              padding: "17px",
              border: "none",
              borderRadius: "10px",
              background: donating
                ? "#aaa"
                : "#D4AF37",
              color: "#111",
              fontSize: "18px",
              fontWeight: 700,
              cursor: donating
                ? "not-allowed"
                : "pointer",
            }}
          >
            {donating
              ? "Opening Stripe..."
              : "Donate Now"}
          </button>

          <p
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#888",
              marginTop: "15px",
              marginBottom: 0,
            }}
          >
            You will be securely redirected to
            Stripe to complete your donation.
          </p>
        </div>
      </div>
    </main>
  );
}