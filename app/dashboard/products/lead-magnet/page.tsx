"use client";

export default function LeadmagnetPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        <span style={{ fontSize: "40px", marginBottom: "15px", display: "block" }}>
          ⏳
        </span>
        <h1
          style={{
            fontSize: "24px",
            color: "#111",
            marginBottom: "10px",
          }}
        >
          Lead Magnet
        </h1>
        <p
          style={{
            color: "#ef4444",
            fontWeight: "bold",
            fontSize: "16px",
            marginBottom: "15px",
          }}
        >
          Unavailable Now
        </p>
        <p
          style={{
            color: "#666",
            fontSize: "14px",
            lineHeight: "1.5",
          }}
        >
          This feature or page is currently offline. Please check back later for updates!
        </p>
      </div>
    </div>
  );
}