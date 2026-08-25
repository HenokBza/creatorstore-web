"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
export default function Home() {
    const [showCreatorTestimonials, setShowCreatorTestimonials] =
    useState(false);
 return (
  <main
    style={{
      minHeight: "100vh",
      background: "#D4AF37",
      color: "#111",
      padding: "20px",
    }}
  >
    <Navbar /> 

    <section
      style={{
        textAlign: "center",
        marginTop: "80px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "25px",
        }}
      >
        <img
          src="/logo.png"
          alt="creatorstorelogo"
          style={{
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      </div>

      <h1
        style={{
          fontSize: "3rem",
          fontWeight: "bold",
          lineHeight: "1.2",
        }}
      >
        Create. Sell. Grow.
        <br />
        Turn Your Knowledge, Into Income
      </h1>

      <p
        style={{
          marginTop: "20px",
          fontSize: "1.2rem",
          maxWidth: "600px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        CreatorStore is the simplest way to Make Money online <br/>
        by selling courses, digital products, and <br/>
        bookings—directly from your link-in-bio.
      </p>

      <div
        style={{
          marginTop: "60px",
          display: "flex",
          fontWeight: "bold",
          gap: "20px",
          justifyContent: "center",
          fontSize: "26px",
        }}
      >
        <a href="/phone">
          <button style={{ padding: "12px 24px", cursor: "pointer", borderRadius: "10px", border: "none", background: "#14b3c5", color: "white", fontWeight: "bold" }}>
            Get Started
          </button>
        </a>

        <a href="/login">
          <button style={{ padding: "12px 24px", cursor: "pointer", borderRadius: "10px", border: "none", background: "#fff", color: "#111", fontWeight: "bold" }}>
            Login
          </button>
        </a>
      </div>

      <div
        style={{
          marginTop: "30px",
          textAlign: "center",
          gap: "60px"
        }}
      >
        <h3>Why CreatorStore?</h3>
        <p>
          No coding. No complicated setup.
          Start selling in minutes.
        </p>
      </div>

      {/* ================= FIRST GROUP: CARDS 1, 2, 3 ================= */}
      <div
        style={{
          marginTop: "50px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "40px",
          maxWidth: "1200px",
          marginLeft: "auto",
          marginRight: "auto",
          padding: "0 20px",
        }}
      >
        {/* Card 1 */}
        <div style={{ background: "#D4AF37", borderRadius: "20px", padding: "15px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", textAlign: "left" }}>
          <img src="/testimony.png" alt="Testimonial 1" style={{ width: "100%", height: "auto", borderRadius: "14px", objectFit: "cover" }} />
        </div>

        {/* Card 2 */}
        <div style={{ background: "white", borderRadius: "20px", padding: "15px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", textAlign: "left" }}>
          <img src="/testimony1.png" alt="Testimonial 2" style={{ width: "100%", height: "auto", borderRadius: "14px", objectFit: "cover" }} />
        </div>

        {/* Card 3 */}
        <div style={{ background: "#D4AF37", borderRadius: "20px", padding: "15px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", textAlign: "left" }}>
          <img src="/testimony2.png" alt="Testimonial 3" style={{ width: "100%", height: "auto", borderRadius: "14px", objectFit: "cover" }} />
        </div>
      </div>

      {/* ================= MIDDLE: CALL TO ACTION BANNER ================= */}
      <div
        style={{
          marginTop: "50px",
          maxWidth: "600px",
          marginLeft: "auto",
          marginRight: "auto",
          background: "white",
          borderRadius: "20px",
          padding: "30px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "22px", color: "#111", lineHeight: "1.4" }}>
          🇪🇹 Now Live in Ethiopia! Join for FREE — No Subscription Required.
        </h3>
        <p style={{ margin: 0, fontSize: "18px", color: "#555" }}>
          You have the talent, we give you the platform. Turn your knowledge into income today.
        </p>
        <div>
          <a href="/phone">
            <button
              style={{
                padding: "16px 36px",
                cursor: "pointer",
                borderRadius: "12px",
                border: "none",
                background: "#14b3c5",
                color: "white",
                fontWeight: "bold",
                fontSize: "18px",
                boxShadow: "0 5px 15px rgba(20,179,197,0.3)",
              }}
            >
              Start Now 🚀
            </button>
          </a>
        </div>
      </div>
      {/* ================= CREATOR REVENUE PREVIEW ================= */}
<div
  style={{
    marginTop: "50px",
    maxWidth: "700px",
    marginLeft: "auto",
    marginRight: "auto",
    background: "white",
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.14)",
    textAlign: "left",
    border: "1px solid rgba(0,0,0,0.06)",
  }}
>
  {/* Dashboard Header */}
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "25px",
      flexWrap: "wrap",
      gap: "15px",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
      }}
    >
      <img
        src="/logo.png"
        alt="CreatorStore"
        style={{
          width: "58px",
          height: "58px",
          borderRadius: "50%",
          objectFit: "cover",
          boxShadow: "0 5px 15px rgba(0,0,0,0.15)",
        }}
      />

      <div>
        <h3
          style={{
            margin: 0,
            fontSize: "22px",
            color: "#111",
            fontWeight: "800",
          }}
        >
          Creator Dashboard
        </h3>

        <p
          style={{
            margin: "5px 0 0",
            color: "#777",
            fontSize: "14px",
          }}
        >
          Revenue overview · August
        </p>
      </div>
    </div>

    {/* Live Badge */}
    <div
      style={{
        background: "#e9faf5",
        color: "#16866b",
        padding: "8px 14px",
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: "700",
      }}
    >
      ● Live
    </div>
  </div>

  {/* Revenue Main Card */}
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "15px",
      marginBottom: "25px",
    }}
  >
    {/* Total Revenue */}
    <div
      style={{
        background:
          "linear-gradient(135deg, #f8ffff 0%, #eefafa 100%)",
        borderRadius: "18px",
        padding: "22px",
        border: "1px solid #dff3f3",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#666",
          fontSize: "14px",
          fontWeight: "600",
        }}
      >
        Total Revenue
      </p>

      <h2
        style={{
          margin: "7px 0 0",
          fontSize: "36px",
          color: "#111",
          fontWeight: "800",
          letterSpacing: "-1px",
        }}
      >
        CA$2,100
      </h2>

      <div
        style={{
          marginTop: "8px",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background: "#dff8ef",
          color: "#16866b",
          padding: "5px 9px",
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: "700",
        }}
      >
        ↑ 10.8%
      </div>

      <span
        style={{
          marginLeft: "7px",
          color: "#888",
          fontSize: "12px",
        }}
      >
        this month
      </span>
    </div>

    {/* Mini Stats */}
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <div
        style={{
          flex: 1,
          background: "#fafafa",
          borderRadius: "16px",
          padding: "15px 18px",
          border: "1px solid #eee",
        }}
      >
        <div
          style={{
            color: "#777",
            fontSize: "13px",
            marginBottom: "4px",
          }}
        >
          Total Visits
        </div>

        <strong
          style={{
            fontSize: "23px",
            color: "#111",
          }}
        >
          92
        </strong>
      </div>

      <div
        style={{
          flex: 1,
          background: "#fafafa",
          borderRadius: "16px",
          padding: "15px 18px",
          border: "1px solid #eee",
        }}
      >
        <div
          style={{
            color: "#777",
            fontSize: "13px",
            marginBottom: "4px",
          }}
        >
          Sales
        </div>

        <strong
          style={{
            fontSize: "23px",
            color: "#111",
          }}
        >
          31
        </strong>
      </div>
    </div>
  </div>

  {/* Graph Header */}
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px",
    }}
  >
    <div>
      <h4
        style={{
          margin: 0,
          fontSize: "17px",
          color: "#222",
          fontWeight: "800",
        }}
      >
        Revenue Growth
      </h4>

      <p
        style={{
          margin: "4px 0 0",
          fontSize: "12px",
          color: "#888",
        }}
      >
        Weekly revenue performance
      </p>
    </div>

    <span
      style={{
        fontSize: "13px",
        fontWeight: "700",
        color: "#14a894",
      }}
    >
      Growing ↑
    </span>
  </div>

  {/* Realistic Graph */}
  <div
    style={{
      position: "relative",
      height: "230px",
      borderRadius: "16px",
      background: "#fcfefe",
      border: "1px solid #edf2f2",
      overflow: "hidden",
      padding: "15px",
    }}
  >
    {/* Horizontal Grid */}
    <div
      style={{
        position: "absolute",
        inset: "20px 15px 35px 45px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {[2000, 1500, 1000, 500, 0].map((value) => (
        <div
          key={value}
          style={{
            borderTop: "1px dashed #e5eaea",
            width: "100%",
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: "-42px",
              top: "-8px",
              fontSize: "10px",
              color: "#999",
            }}
          >
            {value === 0 ? "0" : `CA$${value / 1000}k`}
          </span>
        </div>
      ))}
    </div>

    {/* SVG Chart */}
    <svg
      viewBox="0 0 600 180"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        left: "55px",
        right: "15px",
        bottom: "38px",
        width: "calc(100% - 70px)",
        height: "165px",
        overflow: "visible",
      }}
    >
      {/* Area */}
      <polygon
        points="
          0,150
          100,135
          200,115
          300,92
          400,60
          500,35
          600,8
          600,180
          0,180
        "
        fill="rgba(20,179,197,0.10)"
      />

      {/* Main Line */}
      <polyline
        points="
          0,150
          100,135
          200,115
          300,92
          400,60
          500,35
          600,8
        "
        fill="none"
        stroke="#14b3c5"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data Points */}
      {[
        [0, 150],
        [100, 135],
        [200, 115],
        [300, 92],
        [400, 60],
        [500, 35],
      ].map(([cx, cy], index) => (
        <circle
          key={index}
          cx={cx}
          cy={cy}
          r="5"
          fill="white"
          stroke="#14b3c5"
          strokeWidth="3"
        />
      ))}

      {/* Current Point */}
      <circle
        cx="600"
        cy="8"
        r="7"
        fill="#D4AF37"
        stroke="white"
        strokeWidth="4"
      />

      {/* Current Revenue Label */}
      <rect
        x="505"
        y="-28"
        width="90"
        height="25"
        rx="7"
        fill="#111"
      />

      <text
        x="550"
        y="-11"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="white"
      >
        CA$2,100
      </text>
    </svg>

    {/* Week Labels */}
    <div
      style={{
        position: "absolute",
        bottom: "10px",
        left: "55px",
        right: "15px",
        display: "flex",
        justifyContent: "space-between",
        fontSize: "11px",
        color: "#999",
      }}
    >
      <span>Week 1</span>
      <span>Week 2</span>
      <span>Week 3</span>
      <span>Week 4</span>
    </div>
  </div>

  {/* Bottom Message */}
  <div
    style={{
      marginTop: "18px",
      padding: "14px 16px",
      borderRadius: "12px",
      background: "#fffaf0",
      border: "1px solid #f3e3b0",
      textAlign: "center",
      fontSize: "14px",
      color: "#555",
    }}
  >
    <strong style={{ color: "#111" }}>
      Your knowledge can become income.
   </strong>
  </div>
</div>

      {/* ================= SEE WHAT CREATORS SAY ================= */}
<div
  style={{
    marginTop: "50px",
    textAlign: "center",
  }}
>
  <button
    onClick={() =>
      setShowCreatorTestimonials(!showCreatorTestimonials)
    }
    style={{
      padding: "16px 32px",
      borderRadius: "12px",
      border: "none",
      background: "#14b3c5",
      color: "white",
      fontSize: "18px",
      fontWeight: "bold",
      cursor: "pointer",
    }}
  >
    {showCreatorTestimonials
      ? "Hide Creator Stories"
      : "See What Creators Say"}
  </button>
</div>


{/* ================= SECOND GROUP: CARDS 4 & 5 ================= */}
{showCreatorTestimonials && (
  <div
    style={{
      marginTop: "50px",
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "40px",
      maxWidth: "700px",
      marginLeft: "auto",
      marginRight: "auto",
      padding: "0 20px",
    }}
  >

    {/* Card 4 */}
    <div
      style={{
        background: "white",
        borderRadius: "20px",
        padding: "20px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
      }}
    >
      <img
        src="/testimony3.png"
        alt="Testimonial 4"
        style={{
          width: "100%",
          height: "auto",
          borderRadius: "14px",
          objectFit: "cover",
        }}
      />

      <div>
        <h4
          style={{
            margin: "0 0 8px 0",
            fontSize: "20px",
            color: "#222",
          }}
        >
          My Journey: Unemployed to Creator
        </h4>

        <p
          style={{
            margin: 0,
            fontSize: "16px",
            color: "#151414",
            lineHeight: "1.5",
          }}
        >
          23 years old, graduated last year from Bahir Dar University.
          One year with no job. Heard about digital products, but they
          didn't work here. Then CreatorStore started working in Ethiopia.
          Now it's my full-time job. I get paid! No more stress. Thanks,
          God.
        </p>
      </div>
    </div>


    {/* Card 5 */}
    <div
      style={{
        background: "white",
        borderRadius: "20px",
        padding: "20px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
      }}
    >
      <img
        src="/testimony4.png"
        alt="Testimonial 5"
        style={{
          width: "100%",
          height: "auto",
          borderRadius: "14px",
          objectFit: "cover",
        }}
      />

      <div>
        <h4
          style={{
            margin: "0 0 8px 0",
            fontSize: "20px",
            color: "#222",
          }}
        >
          My Journey: High School Teacher to Digital Creator & 1:1 Coaching
        </h4>

        <p
          style={{
            margin: 0,
            fontSize: "16px",
            color: "#555",
            lineHeight: "1.5",
          }}
        >
          25 years old, living in Adama, Ethiopia. I've been teaching
          high school for 5 years, but my monthly income couldn't cover
          all my bills. I wanted to find another source of income without
          leaving my career. Then I heard about CreatorStore working in
          Ethiopia and joined for free. In my very first month, I made
          CA$1,500! Now I have extra income and peace of mind. Thankful
          for the platform.
        </p>
      </div>
    </div>

  </div>
)}
      {/* ================= FAQ ================= */}
      <section
        style={{
          marginTop: "80px",
          maxWidth: "900px",
          marginLeft: "auto",
          marginRight: "auto",
          padding: "0 20px 60px",
          textAlign: "left",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "36px",
            fontWeight: "bold",
            color: "#111",
            marginBottom: "12px",
          }}
        >
          Frequently Asked Questions
        </h2>

        <p
          style={{
            textAlign: "center",
            fontSize: "18px",
            color: "#333",
            marginBottom: "35px",
          }}
        >
          Everything you need to know about CreatorStore.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          {/* Question 1 */}
          <details
            style={{
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.10)",
              overflow: "hidden",
            }}
          >
            <summary
              style={{
                padding: "22px 25px",
                fontSize: "19px",
                fontWeight: "bold",
                color: "#111",
                cursor: "pointer",
                listStyle: "none",
              }}
            >
              ❓ What is CreatorStore?
            </summary>

            <div
              style={{
                padding: "0 25px 22px",
                fontSize: "17px",
                lineHeight: "1.6",
                color: "#555",
              }}
            >
              CreatorStore is a platform that helps creators make money
              online by selling digital products, courses, and 1-to-1
              coaching or bookings from one simple link.
            </div>
          </details>

          {/* Question 2 */}
          <details
            style={{
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.10)",
              overflow: "hidden",
            }}
          >
            <summary
              style={{
                padding: "22px 25px",
                fontSize: "19px",
                fontWeight: "bold",
                color: "#111",
                cursor: "pointer",
                listStyle: "none",
              }}
            >
              ❓ Can I use CreatorStore in Ethiopia?
            </summary>

            <div
              style={{
                padding: "0 25px 22px",
                fontSize: "17px",
                lineHeight: "1.6",
                color: "#555",
              }}
            >
              Yes! 🇪🇹 CreatorStore works in Ethiopia. Ethiopian creators
              can create their store, sell their products and services for Diaspora.
              start building an online income without needing complicated
              technical setup.
            </div>
          </details>

          {/* Question 3 */}
          <details
            style={{
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.10)",
              overflow: "hidden",
            }}
          >
            <summary
              style={{
                padding: "22px 25px",
                fontSize: "19px",
                fontWeight: "bold",
                color: "#111",
                cursor: "pointer",
                listStyle: "none",
              }}
            >
              ❓ Is CreatorStore free?
            </summary>

            <div
              style={{
                padding: "0 25px 22px",
                fontSize: "17px",
                lineHeight: "1.6",
                color: "#555",
              }}
            >
             Now live in Ethiopia, Yes! 🎉 CreatorStore is free to join. But from other countries subscription Required.
              You can create your store and start building your creator business.
            </div>
          </details>

          {/* Question 4 */}
          <details
            style={{
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.10)",
              overflow: "hidden",
            }}
          >
            <summary
              style={{
                padding: "22px 25px",
                fontSize: "19px",
                fontWeight: "bold",
                color: "#111",
                cursor: "pointer",
                listStyle: "none",
              }}
            >
              ❓ What can I sell on CreatorStore?
            </summary>

            <div
              style={{
                padding: "0 25px 22px",
                fontSize: "17px",
                lineHeight: "1.6",
                color: "#555",
              }}
            >
              You can sell digital products, courses, educational content,
              and 1-to-1 coaching or booking services. CreatorStore gives
              you one place to showcase what you know and turn your skills
              into income.
            </div>
          </details>
          {/* Question 5 */}
<details
  style={{
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.10)",
    overflow: "hidden",
  }}
>
  <summary
    style={{
      padding: "22px 25px",
      fontSize: "19px",
      fontWeight: "bold",
      color: "#111",
      cursor: "pointer",
      listStyle: "none",
    }}
  >
    ❓ How do creators receive their payments?
  </summary>

  <div
    style={{
      padding: "0 25px 22px",
      fontSize: "17px",
      lineHeight: "1.6",
      color: "#555",
    }}
  >
    Creators in countries supported by Stripe can receive their earnings
    through Stripe using the payout methods available in their country.

    <br />
    <br />

    🇪🇹 <strong>Ethiopian creators:</strong> CreatorStore also works in
    Ethiopia and provides a local withdrawal option for eligible creators,
    including Telebirr and bank-account payouts according to the
    CreatorStore withdrawal policy.

    <br />
    <br />

    🌍 <strong>Other countries:</strong> If Stripe supports payouts in your
    country, you can connect your Stripe account and receive payments
    according to Stripe's local payout rules and availability.
  </div>
</details>
        </div>

        {/* Bottom encouragement */}
        <div
          style={{
            marginTop: "40px",
            background: "white",
            borderRadius: "20px",
            padding: "30px",
            textAlign: "center",
            boxShadow: "0 8px 20px rgba(0,0,0,0.10)",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "24px",
              color: "#111",
            }}
          >
            You have the talent.
          </h3>

          <p
            style={{
              margin: "10px 0 0",
              fontSize: "18px",
              fontWeight: "bold",
              color: "#14b3c5",
            }}
          >
            We give you the platform. You build the success. 🚀
          </p>
        </div>
         <div
        style={{
          marginTop: "60px",
          display: "flex",
          fontWeight: "bold",
          gap: "20px",
          justifyContent: "center",
          fontSize: "26px",
        }}
      >
        <a href="/phone">
          <button style={{ padding: "12px 24px", cursor: "pointer", borderRadius: "10px", border: "none", background: "#14b3c5", color: "white", fontWeight: "bold" }}>
           Start Now
          </button>
        </a>
        </div>
      </section>
    </section>
  </main>
 );
}