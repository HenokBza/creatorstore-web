import React from 'react';

export default function BlogPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#D4AF37", padding: "40px 0" }}>
      {/* ================= SECOND GROUP: CARDS 4 & 5 ================= */}
      <div
        style={{
          marginTop: "50px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "40px",
          maxWidth: "700px",
          marginLeft: "auto",
          marginRight: "auto",
          padding: "0 20px",
        }}
      >
        {/* Card 4 */}
        <div style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", textAlign: "left", display: "flex", flexDirection: "column", gap: "15px" }}>
          <img src="/testimony3.png" alt="Testimonial 4" style={{ width: "100%", height: "auto", borderRadius: "14px", objectFit: "cover" }} />
          <div>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "20px", color: "#222" }}>My Journey: Unemployed to Creator</h4>
            <p style={{ margin: 0, fontSize: "16px", color: "#151414", lineHeight: "1.5" }}>
              23 years old, graduated last year from Bahir Dar University. One year with no job. Heard about digital products, but they didn't work here. Then CreatorStore started working in Ethiopia. Now it's my full-time job. I get paid! No more stress. Thanks, God.
            </p>
          </div>
        </div>

        {/* Card 5 */}
        <div style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", textAlign: "left", display: "flex", flexDirection: "column", gap: "15px" }}>
          <img src="/testimony4.png" alt="Testimonial 5" style={{ width: "100%", height: "auto", borderRadius: "14px", objectFit: "cover" }} />
          <div>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "20px", color: "#222" }}>My Journey: High School Teacher to Digital Creator & 1:1 Coaching</h4>
            <p style={{ margin: 0, fontSize: "16px", color: "#555", lineHeight: "1.5" }}>
              25 years old, living in Adama, Ethiopia. I've been teaching high school for 5 years, but my monthly income couldn't cover all my bills. I wanted to find another source of income without leaving my career. Then I heard about CreatorStore working in Ethiopia and joined for free. In my very first month, I made CA$1,500! Now I have extra income and peace of mind. Thankful for the platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}