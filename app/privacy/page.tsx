'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "50px auto",
        padding: "30px",
        background: "white",
        borderRadius: "20px",
        lineHeight: "30px",
        color: "#111"
      }}
    >
      {/* Top Back Button */}
      <button
        onClick={() => router.back()}
        style={{
          marginBottom: "20px",
          padding: "10px 20px",
          background: "#14b3c5",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "16px"
        }}
      >
        ← Agree & Back to Signup
      </button>

      <h1 style={{ color: "#D4AF37" }}>
        Privacy Policy
      </h1>

      <p>
        Last updated: July 2026
      </p>

      <h2>Information We Collect</h2>
      <p>
        We may collect your name, email address,
        phone number, profile image, store information,
        payment account information, and other information
        you provide while using CreatorStore.
      </p>

      <h2>How We Use Your Information</h2>
      <p>
        We use your information to:
      </p>
      <ul>
        <li>Create your account</li>
        <li>Provide our services</li>
        <li>Process payments</li>
        <li>Improve CreatorStore</li>
        <li>Provide customer support</li>
      </ul>

      <h2>Data Security</h2>
      <p>
        We use industry-standard security measures,
        including Firebase Authentication and secure
        cloud storage, to help protect your information.
      </p>

      <h2>Sharing Information</h2>
      <p>
        We do not sell your personal information.
        Information may be shared only with trusted
        service providers required to operate the platform,
        such as payment processors.
      </p>

      <h2>Your Rights</h2>
      <p>
        You may update your profile information,
        request account deletion,
        or contact us regarding your personal data.
      </p>

      <h2>Contact</h2>
      <p>
        Email:
        <br />
        creatorstore.ca@gmail.com
      </p>

      {/* Bottom Back Button */}
      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <button
          onClick={() => router.back()}
          style={{
            padding: "12px 24px",
            background: "#14b3c5",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px"
          }}
        >
          ← Agree & Back to Signup
        </button>
      </div>
    </div>
  );
}