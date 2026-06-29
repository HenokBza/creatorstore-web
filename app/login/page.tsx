"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Login successful!");

      router.push("/dashboard");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        textAlign: "center",
        background: "#D4AF37",
        minHeight: "100vh",
        color: "#111",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          marginBottom: "20px",
        }}
      >
        Login
      </h1>

      <div
        style={{
          maxWidth: "400px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={{
            padding: "12px",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={{
            padding: "12px",
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            padding: "12px",
            background: "#c32acb",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Login
        </button>

<div
  style={{
    marginTop: "15px",
    textAlign: "center",
    fontSize: "14px",
  }}
>
  Don't have an account?{" "}
  <a
    href="/signup"
    style={{
      color: "#7b2cbf",
      fontWeight: "bold",
      textDecoration: "none",
    }}
  >
    Create here
  </a>
</div>

</div>
</div>
);
}
     