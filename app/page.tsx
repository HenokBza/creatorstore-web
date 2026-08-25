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
    maxWidth: "650px",
    marginLeft: "auto",
    marginRight: "auto",
    background: "white",
    borderRadius: "20px",
    padding: "25px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
    textAlign: "left",
  }}
>
  {/* Header */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "15px",
      marginBottom: "20px",
    }}
  >
    <img
      src="/logo.png"
      alt="CreatorStore"
      style={{
        width: "55px",
        height: "55px",
        borderRadius: "50%",
        objectFit: "cover",
      }}
    />

    <div>
      <h3
        style={{
          margin: 0,
          fontSize: "22px",
          color: "#111",
        }}
      >
        Creator Dashboard
      </h3>

      <p
        style={{
          margin: "4px 0 0",
          color: "#777",
          fontSize: "14px",
        }}
      >
        This month
      </p>
    </div>
  </div>

  {/* Revenue */}
  <div
    style={{
      background: "#f7f7f7",
      borderRadius: "14px",
      padding: "20px",
      marginBottom: "20px",
    }}
  >
    <p
      style={{
        margin: 0,
        color: "#666",
        fontSize: "15px",
      }}
    >
      Total Revenue
    </p>

    <h2
      style={{
        margin: "6px 0 0",
        fontSize: "34px",
        color: "#14b3c5",
      }}
    >
      CA$2,000
    </h2>

    <p
      style={{
        margin: "5px 0 0",
        color: "#33a285",
        fontWeight: "bold",
        fontSize: "14px",
      }}
    >
      ↑ Growing this month
    </p>
  </div>

  {/* Simple Graph */}
  <div>
    <p
      style={{
        margin: "0 0 10px",
        fontSize: "15px",
        fontWeight: "bold",
        color: "#333",
      }}
    >
      Revenue Growth
    </p>

    <div
      style={{
        height: "150px",
        position: "relative",
        borderBottom: "2px solid #ddd",
        borderLeft: "2px solid #ddd",
        padding: "10px",
      }}
    >
      <svg
        viewBox="0 0 500 130"
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <polyline
          points="10,115 90,105 170,90 250,82 330,55 410,38 490,15"
          fill="none"
          stroke="#14b3c5"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle cx="10" cy="115" r="5" fill="#14b3c5" />
        <circle cx="90" cy="105" r="5" fill="#14b3c5" />
        <circle cx="170" cy="90" r="5" fill="#14b3c5" />
        <circle cx="250" cy="82" r="5" fill="#14b3c5" />
        <circle cx="330" cy="55" r="5" fill="#14b3c5" />
        <circle cx="410" cy="38" r="5" fill="#14b3c5" />
        <circle cx="490" cy="15" r="6" fill="#D4AF37" />
      </svg>
    </div>

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: "8px",
        color: "#888",
        fontSize: "12px",
      }}
    >
      <span>Week 1</span>
      <span>Week 2</span>
      <span>Week 3</span>
      <span>Week 4</span>
    </div>
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