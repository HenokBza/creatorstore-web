"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!sessionId) return;
    verifyPayment();
  }, [sessionId]);

  async function verifyPayment() {
    const response = await fetch(
      `/api/verify-payment?session_id=${sessionId}`
    );
    const data = await response.json();
    setDownloadUrl(data.fileUrl);
    setTitle(data.title);
    setLoading(false);
  }

  if (loading) {
    return <h2>Verifying payment...</h2>;
  }

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "80px auto",
        textAlign: "center",
      }}
    >
      <h1>🎉 Payment Successful</h1>
      <p>Thank you for your purchase.</p>
      <h2>{title}</h2>

      <a
        href={downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <button
          style={{
            marginTop: 30,
            padding: "18px 40px",
            fontSize: 18,
            borderRadius: 12,
            border: "none",
            background: "#D4AF37",
            color: "white",
            cursor: "pointer",
          }}
        >
          Download Product
        </button>
      </a>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<h2>Loading...</h2>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}