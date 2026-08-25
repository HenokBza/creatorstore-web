'use client'; // Required if using Next.js App Router

import React from 'react';
import { useRouter } from 'next/navigation'; // Use 'next/router' if you are on the Pages router

export default function TermsPage() {
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
      {/* Back Button to return directly to signup */}
      <button
        onClick={() => router.back()}
        style={{
          marginBottom: "20px",
          padding: "8px 16px",
          background: "#14b3c5",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        ← Agree Back to Signup
      </button>

      <h1 style={{ color: "#D4AF37" }}>
        Terms of Service
      </h1>

      <p>
        Last updated: July 2026
      </p>

      <h2>1. Acceptance</h2>

      <p>
        By creating a CreatorStore account or using our platform,
        you agree to these Terms of Service.
      </p>

      <h2>2. Creator Accounts</h2>

      <p>
        Creators are responsible for maintaining the security
        of their accounts and passwords.
      </p>

      <h2>3. Digital Products & Coaching</h2>

      <p>
        Creators are responsible for all products and coaching services they publish.
        CreatorStore does not own or review every item listed, but reserves the right 
        to remove content that violates our guidelines.
      </p>

      <h2>4. Payments, Payouts & Currency</h2>

      <p>
        Customer payments are processed via supported global and local gateways. 
        For Ethiopian creators and international users alike, earnings are tracked 
        within the dashboard. Payouts and withdrawals are processed subject to platform 
        withdrawal requests, verification, applicable service fees, and local banking 
        or mobile money processing times. CreatorStore is not responsible for bank 
        transfer delays or currency exchange rate fluctuations.
      </p>

      <h2>5. Prohibited Content</h2>

      <p>
        You may not sell illegal, fraudulent, copyrighted,
        harmful, or offensive content through CreatorStore.
      </p>

      <h2>6. Account Suspension</h2>

      <p>
        CreatorStore may suspend or remove accounts that violate
        these Terms.
      </p>

      <h2>7. Limitation of Liability</h2>

      <p>
        CreatorStore is provided "as is" without warranties.
        We are not responsible for indirect losses resulting
        from the use of our platform or scheduling/payout disputes.
      </p>

      <h2>8. Contact</h2>

      <p>
        Questions?
        <br />
        creatorstore.ca@gmail.com
      </p>
       {/* Back Button to return directly to signup */}
      <button
        onClick={() => router.back()}
        style={{
          marginBottom: "20px",
          padding: "8px 16px",
          background: "#14b3c5",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        ← Agree Back to Signup
      </button>


    </div>
  );
}