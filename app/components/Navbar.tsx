"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <h2 style={{ margin: 0 }}>CreatorStore</h2>

        <button
          onClick={() => setMenuOpen(true)}
          style={{
            fontSize: "24px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          ☰
        </button>
      </nav>

      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "#D4AF37",
            zIndex: 999,
            padding: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2>CreatorStore</h2>

            <button
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: "24px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              marginTop: "50px",
              display: "flex",
              flexDirection: "column",
              gap: "25px",
              fontSize: "28px",
            }}
          >
            <Link href="/">Home</Link>
            <Link href="/features">Features</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/login">Login</Link>
            <Link href="/signup">Sign Up</Link>
          </div>
        </div>
      )}
    </>
  );
}