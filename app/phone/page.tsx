"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const countries = [
  { name: "Canada", flag: "🇨🇦", code: "+1" },
  { name: "United States", flag: "🇺🇸", code: "+1" },
  { name: "Ethiopia", flag: "🇪🇹", code: "+251" },
  { name: "United Kingdom", flag: "🇬🇧", code: "+44" },
  { name: "Australia", flag: "🇦🇺", code: "+61" },
  { name: "Germany", flag: "🇩🇪", code: "+49" },
  { name: "France", flag: "🇫🇷", code: "+33" },
  { name: "Italy", flag: "🇮🇹", code: "+39" },
  { name: "India", flag: "🇮🇳", code: "+91" },
  { name: "UAE", flag: "🇦🇪", code: "+971" },
];

export default function PhonePage() {

  const router = useRouter();

  const [countryIndex, setCountryIndex] =
    useState(0);

  const [phone, setPhone] =
    useState("");

  const [error, setError] =
    useState("");

  const selected =
    countries[countryIndex];

  const handleContinue = () => {

    setError("");

    if (!phone.trim()) {

      setError(
        "Please enter your phone number."
      );

      return;

    }

    if (!phone.startsWith(selected.code)) {

      setError(
        `Phone number must start with ${selected.code}`
      );

      return;

    }

    localStorage.setItem(
      "signupCountry",
      selected.name
    );

    localStorage.setItem(
      "signupPhone",
      phone
    );

    router.push("/signup");

  };

  return (

    <div
      style={{
        minHeight:"100vh",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        background:"#D4AF37"
      }}
    >

      <div
        style={{
          width:"430px",
          background:"white",
          padding:"35px",
          borderRadius:"20px",
          boxShadow:"0 5px 20px rgba(0,0,0,.1)"
        }}
      >

        <h1
          style={{
            textAlign:"center",
            color:"#D4AF37"
          }}
        >
          Create Creator Account
        </h1>

        <p
          style={{
            textAlign:"center",
            color:"#666",
            marginTop:"10px",
            lineHeight:"24px"
          }}
        >
          Select your country and enter your
          phone number before creating
          your account.
        </p>

        <div
          style={{
            display:"flex",
            flexDirection:"column",
            gap:"18px",
            marginTop:"30px"
          }}
        >

          <div>

            <label
              style={{
                fontWeight:"bold"
              }}
            >
              Country
            </label>

            <select
              value={countryIndex}
              onChange={(e)=>
                setCountryIndex(
                  Number(e.target.value)
                )
              }
              style={{
                width:"100%",
                marginTop:"8px",
                padding:"14px",
                borderRadius:"10px"
              }}
            >

              {countries.map(
                (country,index)=>(

                  <option
                    key={country.name}
                    value={index}
                  >
                    {country.flag} {country.name}
                  </option>

                )
              )}

            </select>

          </div>

          <div>

            <label
              style={{
                fontWeight:"bold"
              }}
            >
              Phone Number
            </label>

            <input
              placeholder={`${selected.code}`}
              value={phone}
              onChange={(e)=>
                setPhone(
                  e.target.value
                )
              }
              style={{
                width:"100%",
                marginTop:"8px",
                padding:"14px",
                borderRadius:"10px"
              }}
            />

            <p
              style={{
                fontSize:"12px",
                color:"#777",
                marginTop:"8px"
              }}
            >
              Example:
              {" "}
              {selected.code}XXXXXXXXX
            </p>
           
          </div>

          {error && (

            <div
              style={{
                background:"#ffe5e5",
                color:"red",
                padding:"12px",
                borderRadius:"10px"
              }}
            >
              {error}
            </div>

          )}

          <button
            onClick={handleContinue}
            className="interactive-btn"
            style={{
              background:"#D4AF37",
              color:"white",
              border:"none",
              padding:"15px",
              borderRadius:"10px",
              fontWeight:"bold",
              cursor:"pointer",
              fontSize:"16px"
            }}
          >
            Continue →
          </button>

        </div>

      </div>

    </div>

  );

}