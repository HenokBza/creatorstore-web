"use client";

import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();

  return (
    <div style={{ padding: "30px" }}>
      <h1
        style={{
          fontSize: "2rem",
          marginBottom: "10px",
        }}
      >
        Choose Product Type
      </h1>

      <p style={{ marginBottom: "30px" }}>
        Select the format that best fits what you're selling.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: "20px",
        }}
      >
        <div
          onClick={() => router.push("/dashboard/products/digital-products")}
          style={{
            border: "1px solid #ddd",
            borderRadius: "15px",
            padding: "25px",
            cursor: "pointer",
            background: "white",
          }}
        >
          <h2>📦 Digital Product</h2>
          <p>PDFs, Guides, Templates, eBooks and Downloads</p>
        </div>

        <div
          onClick={() => router.push("/dashboard/products/create/coaching")}
          style={{
            border: "1px solid #ddd",
            borderRadius: "15px",
            padding: "25px",
            cursor: "pointer",
            background: "white",
          }}
        >
          <h2>📅 Coaching Call</h2>
          <p>Book paid coaching or consulting calls</p>
        </div>

        <div
          onClick={() => router.push("/dashboard/products/create/lead")}
          style={{
            border: "1px solid #ddd",
            borderRadius: "15px",
            padding: "25px",
            cursor: "pointer",
            background: "white",
          }}
        >
          <h2>📧 Lead Magnet</h2>
          <p>Collect emails and build your audience</p>
        </div>
      </div>
    </div>
  );
}