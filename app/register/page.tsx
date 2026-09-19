"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function RegisterApplicationPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("Ethiopia");
  const [phone, setPhone] = useState("+251");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Remove any spaces or dashes from the phone number input first
    const cleanPhone = phone.replace(/\s+/g, "").trim();

    // Validate phone number format for Ethiopia
    if (!cleanPhone.startsWith("+251") || cleanPhone.length < 13) {
      alert("Please enter a valid Ethiopian phone number starting with +251 (e.g., +2519xxxxxxxx)");
      return;
    }

    if (!fullName.trim()) {
      alert("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      // Automatically extract the last 4 digits from the cleaned phone number
      const lastFourDigits = cleanPhone.slice(-4);

      // Save application request to Firestore with clean phone and lastFourDigits
      await addDoc(collection(db, "pendingApplications"), {
        fullName: fullName.trim(),
        country,
        phone: cleanPhone,       // Saved without accidental spaces
        lastFourDigits: lastFourDigits, // Automatically saved for easy payment matching!
        isActive: false,
        status: "pending_payment",
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "#33a285", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
        <div style={{ background: "white", padding: "40px", borderRadius: "24px", maxWidth: "500px", textAlign: "center", boxShadow: "0 10px 35px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "50px", marginBottom: "20px" }}>🎉</div>
          <h1 style={{ fontSize: "24px", marginBottom: "15px", color: "#333" }}>Application Received!</h1>
          <p style={{ color: "#666", lineHeight: 1.6, marginBottom: "25px" }}>
            Thank you! Please make sure you have transferred the **100 Birr** registration fee to Telebirr number: <strong>0922086245</strong>. 
            Once verified, you will receive a confirmation message, and you can click Get start and proceed using same this phone number: <strong>{phone}</strong>.
          </p>
          <button
            onClick={() => router.push("/")}
            style={{ background: "#D4AF37", color: "white", border: "none", padding: "12px 24px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", fontSize: "16px" }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#33a285", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "28px", width: "100%", maxWidth: "500px", boxShadow: "0 10px 35px rgba(0,0,0,0.1)" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "10px", color: "#222" }}>Join as a Creator</h1>
        <p style={{ color: "#666", fontSize: "15px", marginBottom: "25px", lineHeight: 1.5 }}>
          Fill out your details below and complete your payment via Telebirr to set up your store.
        </p>

        {/* Telebirr Payment Instruction Box with 100 Birr */}
        <div style={{ background: "#fdf8e2", border: "1px solid #f3e5ab", borderRadius: "14px", padding: "16px", marginBottom: "25px", fontSize: "14px", color: "#444", lineHeight: 1.6 }}>
          💳 <strong>Telebirr Payment Instruction:</strong><br />
          Send the registration fee of <strong style={{ color: "#D4AF37", fontSize: "16px" }}>100 Birr</strong> to Telebirr account: <strong style={{ color: "#D4AF37", fontSize: "16px" }}>0922086245</strong> before submitting this form.
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px", fontSize: "14px" }}>Full Name</label>
            <input
              type="text"
              placeholder="e.g. Dagmawit Fekadu"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #ddd", fontSize: "15px", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px", fontSize: "14px" }}>Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #ddd", fontSize: "15px", background: "white", boxSizing: "border-box" }}
            >
              <option value="Ethiopia">Ethiopia</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px", fontSize: "14px" }}>Phone Number (Telebirr)</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+2519xxxxxxxx"
              required
              style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #ddd", fontSize: "15px", boxSizing: "border-box" }}
            />
            <span style={{ fontSize: "12px", color: "#888", marginTop: "4px", display: "block" }}>Must start with +251</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "10px",
              width: "100%",
              padding: "16px",
              background: loading ? "#999" : "#D4AF37",
              color: "white",
              border: "none",
              borderRadius: "14px",
              fontWeight: "bold",
              fontSize: "18px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Submitting..." : "Submit Application (100 Birr)"}
          </button>
        </form>
      </div>
    </div>
  );
}