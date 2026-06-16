"use client";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const handleSignup = async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    alert("Account created successfully!");

    console.log(userCredential.user);
  } catch (error: any) {
    alert(error.message);
  }
};
  return (
    <div
      style={{
        maxWidth: 400,
        margin: "50px auto",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <h1>Create CreatorStore Account</h1>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleSignup}>
  Create Account
</button>
    </div>
  );
}