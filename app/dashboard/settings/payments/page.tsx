"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const ETHIOPIAN_BANKS = [
  "Commercial Bank of Ethiopia (CBE)",
  "Dashen Bank",
  "Cooperative Bank of Oromia",
  "Hibret Bank",
  "Awash Bank",
  "Wegagen Bank",
  "Abay Bank",
  "Bunna Bank",
  "Lion International Bank",
  "Berhan Bank",
  "Addis International Bank",
  "Enat Bank",
  "Nib International Bank",
  "Global Bank Ethiopia",
  "Beroj Bank",
  "Tsehay Bank",
  "ZamZam Bank",
  "Hijra Bank",
  "Shabelle Bank",
  "Siinqee Bank",
  "Goh Betoch Bank",
  "Ahadu Bank",
];

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [connectingStripe, setConnectingStripe] = useState(false);

  const [currency, setCurrency] = useState("CAD");
  const [isEthiopianCreator, setIsEthiopianCreator] = useState(false);

  const [telebirrPhone, setTelebirrPhone] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");

  const [stripeConnected, setStripeConnected] = useState(false);
  const [telebirrConnected, setTelebirrConnected] = useState(false);
  const [bankConnected, setBankConnected] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists()) {
        const data = snap.data();

        setTelebirrPhone(data.telebirrPhone || "");
        setSelectedBank(data.selectedBank || "");
        setBankAccountNumber(data.bankAccountNumber || "");
        setBankAccountName(data.bankAccountName || "");

        // Check if creator is Ethiopian based on saved profile country or settings
        setIsEthiopianCreator(data.country === "Ethiopia" || data.isEthiopian === true);

        setStripeConnected(data.stripeConnected || false);
        setTelebirrConnected(data.telebirrConnected || false);
        setBankConnected(data.bankConnected || false);
        setCurrency(data.currency || (data.country === "Ethiopia" ? "ETB" : "CAD"));
      }
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  const handleConnectStripe = async () => {
    try {
      setConnectingStripe(true);
      const user = auth.currentUser;

      if (!user) {
        alert("Please login first");
        setConnectingStripe(false);
        return;
      }

      const response = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, email: user.email }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to connect Stripe");
        setConnectingStripe(false);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong connecting Stripe.");
      setConnectingStripe(false);
    }
  };

  const savePayments = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Please login");
        return;
      }

      await setDoc(
        doc(db, "users", user.uid),
        {
          telebirrPhone,
          selectedBank,
          bankAccountNumber,
          bankAccountName,
          telebirrConnected: telebirrPhone.trim() !== "",
          bankConnected: selectedBank !== "" && bankAccountNumber.trim() !== "",
          currency,
          isEthiopian: isEthiopianCreator,
        },
        { merge: true }
      );

      setTelebirrConnected(telebirrPhone.trim() !== "");
      setBankConnected(selectedBank !== "" && bankAccountNumber.trim() !== "");

      alert("Payment settings updated ✅");
    } catch (error) {
      console.log(error);
      alert("Failed to save.");
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "900px",
        margin: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <h1 style={{ margin: 0 }}>💳 Payment Methods</h1>

      
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "25px",
        }}
      >
        {/* ================= STRIPE (Hidden for Ethiopian Creators) ================= */}
        {!isEthiopianCreator && (
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "20px",
              boxShadow: "0 5px 20px rgba(0,0,0,.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <img
                  src="https://cdn-icons-png.flaticon.com/512/5968/5968382.png"
                  style={{ width: "45px" }}
                  alt="Stripe"
                />
                <div>
                  <h2 style={{ margin: 0 }}>Stripe</h2>
                  <p style={{ margin: 0, color: "#777" }}>
                    Connect your Stripe account to receive payouts directly.
                  </p>
                </div>
              </div>

              <div
                style={{
                  padding: "8px 16px",
                  borderRadius: "50px",
                  background: stripeConnected ? "#dcfce7" : "#fee2e2",
                  color: stripeConnected ? "#166534" : "#991b1b",
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                {stripeConnected ? "Connected" : "Not Connected"}
              </div>
            </div>

            <div style={{ display: "flex", gap: "15px", marginTop: "25px" }}>
              <button
                onClick={handleConnectStripe}
                disabled={connectingStripe}
                className="interactive-btn"
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "#635BFF",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: connectingStripe ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                }}
              >
                {connectingStripe ? "Connecting..." : "Connect with Stripe"}
              </button>
            </div>
          </div>
        )}

        {/* ================= TELEBIRR (Shown for Ethiopian Creators) ================= */}
        {isEthiopianCreator && (
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "20px",
              boxShadow: "0 5px 20px rgba(0,0,0,.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
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
    src="/telebirr.png"
    alt="Telebirr"
    style={{
      width: "55px",
      height: "55px",
      objectFit: "contain",
      borderRadius: "12px",
    }}
  />

  <div>
    <h2 style={{ margin: 0 }}>Telebirr</h2>

    <p style={{ margin: 0, color: "#777" }}>
      Receive payouts into your Telebirr wallet.
    </p>
  </div>
</div>

              <div
                style={{
                  padding: "8px 16px",
                  borderRadius: "50px",
                  background: telebirrConnected ? "#dcfce7" : "#fee2e2",
                  color: telebirrConnected ? "#166534" : "#991b1b",
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                {telebirrConnected ? "Connected" : "Not Connected"}
              </div>
            </div>

            <input
              placeholder="Telebirr Phone Number (e.g. 09xxxxxxxx)"
              value={telebirrPhone}
              onChange={(e) => setTelebirrPhone(e.target.value)}
              style={{
                width: "100%",
                padding: "15px",
                marginTop: "25px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}

        {/* ================= LOCAL ETHIOPIAN BANK ACCOUNT ================= */}
        {isEthiopianCreator && (
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "20px",
              boxShadow: "0 5px 20px rgba(0,0,0,.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>Ethiopian Bank Account</h2>
                <p style={{ margin: 0, color: "#777" }}>
                  Select your bank and enter your account details for receive payouts.
                </p>
              </div>

              <div
                style={{
                  padding: "8px 16px",
                  borderRadius: "50px",
                  background: bankConnected ? "#dcfce7" : "#fee2e2",
                  color: bankConnected ? "#166534" : "#991b1b",
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                {bankConnected ? "Configured" : "Not Configured"}
              </div>
            </div>

            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                  Select Bank
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "15px",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                    background: "white",
                  }}
                >
                  <option value="">-- Choose your bank --</option>
                  {ETHIOPIAN_BANKS.map((bank, index) => (
                    <option key={index} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                  Account Holder Name
                </label>
                <input
                  placeholder="Full name on bank account"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "15px",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                  Bank Account Number
                </label>
                <input
                  placeholder="Account number"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "15px",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= CURRENCY ================= */}
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "20px",
            boxShadow: "0 5px 20px rgba(0,0,0,.08)",
          }}
        >
          <h2>🌍 Currency</h2>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{
              width: "50%",
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              marginTop: "10px",
            }}
          >
            {isEthiopianCreator ? (
              <option value="ETB">ETB - Ethiopian Birr</option>
            ) : (
              <>
                <option value="CAD">CAD</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </>
            )}
          </select>
        </div>

        <button
          onClick={savePayments}
          className="interactive-btn"
          style={{
            width: "100%",
            padding: "18px",
            background: "#D4AF37",
            border: "none",
            borderRadius: "15px",
            fontWeight: "bold",
            fontSize: "16px",
            cursor: "pointer",
            color: "white",
          }}
        >
          Save Payment Settings
        </button>
      </div>
    </div>
  );
}