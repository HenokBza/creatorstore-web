"use client";

import Link from "next/link";

export default function SettingsPage() {

return(

<div
style={{
padding:"30px"
}}
>

<h1
style={{
marginBottom:"30px"
}}
>
⚙️ Account Settings
</h1>

<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(230px,1fr))",
    gap: "20px",
  }}
>
  <Link
    href="/dashboard/settings/profile"
    className="interactive-btn"
    style={{ ...cardStyle, display: "block" }}
  >
    👤 Profile
  </Link>

  <Link
    href="/dashboard/settings/payments"
    className="interactive-btn"
    style={{ ...cardStyle, display: "block" }}
  >
    💳 Payments
  </Link>

  <Link
    href="/dashboard/settings/notifications"
    className="interactive-btn"
    style={{ ...cardStyle, display: "block" }}
  >
    🔔 Notifications
  </Link>

  <Link
    href="/dashboard/settings/security"
    className="interactive-btn"
    style={{ ...cardStyle, display: "block" }}
  >
    🔒 Security
  </Link>
</div>

</div>

);

}

const cardStyle: React.CSSProperties = {
  background:"#D4AF37",
  padding:"25px",
  borderRadius:"20px",
  textDecoration:"none",
  color:"#111",
  fontWeight:"bold",
  fontSize:"18px",
  boxShadow:"0 4px 15px rgba(0,0,0,.08)",
  textAlign:"center"
};