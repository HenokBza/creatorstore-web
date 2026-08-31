"use client";

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db, storage } from "@/lib/firebase";
import { useRouter } from "next/navigation";

import { doc, setDoc } from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

export default function SignupPage() {
  const router = useRouter();
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    // Safely grab from localStorage only after the component mounts on the client
    setCountry(localStorage.getItem("signupCountry") || "");
    setPhone(localStorage.getItem("signupPhone") || "");
  }, []);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState("/profile-placeholder.png");
  const [profession, setProfession] = useState(""); 
  const [occupation, setOccupation] = useState("");
  const [prefix, setPrefix] = useState("Mr"); // default value

  const [name, setName] = useState("");
  const [storeName, setStoreName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [error, setError] =
    useState("");

  const handleImage = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const imageURL = URL.createObjectURL(file);
    setImagePreview(imageURL);
  };

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasLength = password.length >= 8;

    if (
      !hasLength ||
      !hasUpperCase ||
      !hasLowerCase ||
      !hasNumber ||
      !hasSpecial
    ) {
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    setError("");

    if (
      !profession ||
      !prefix ||
      !name ||
      !storeName ||
      !email ||
      !password
    ) {
      setError("Please fill all required fields");
      return;
    }

    /* PASSWORD VALIDATION */
    if (!validatePassword(password)) {
      setError(
        "Password must contain:\n• 8+ characters\n• Uppercase letter\n• Lowercase letter\n• Number\n• Special symbol"
      );
      return;
    } 

    try {
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user = userCredential.user;
      let profileImageURL = "";

      // Upload image if selected
      if (selectedFile) {
        const imageRef = ref(
          storage,
          `profileImages/${user.uid}/avatar`
        );

        await uploadBytes(
          imageRef,
          selectedFile
        );

        profileImageURL =
          await getDownloadURL(
            imageRef
          );
      }

      // Save user profile
      await setDoc(
        doc(
          db,
          "users",
          user.uid
        ),
        {
          profession,
          name: `${prefix} ${name}`,
          email,
          storeName,
          storeURL: `creatorstore.ca/${storeName}`,
          profileImage: profileImageURL,
          country,
          visits: 0,
          phone,
          createdAt: new Date(),
        }
      );

      alert("Account created successfully 🚀");
      router.push("/login");

    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#D4AF37",
        padding: "20px"
      }}
    >
      <div
        style={{
          width: "420px",
          background: "white",
          padding: "35px",
          borderRadius: "20px",
          boxShadow: "0 5px 20px rgba(0,0,0,.1)"
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#111",
            fontSize: "22px",
            marginBottom: "5px"
          }}
        >
          Creating CreatorStore Account
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "#D4AF37",
            fontWeight: "bold",
            marginBottom: "20px",
            fontSize: "15px"
          }}
        >
          Upload profile pic
        </p>

        <div
          style={{
            textAlign: "center",
            marginTop: "10px"
          }}
        >
          <img
            src={imagePreview}
            alt="profile"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "4px solid #D4AF37"
            }}
          />

          <div
            style={{
              marginTop: "15px"
            }}
          >
            {/* Hidden native input */}
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              onChange={handleImage}
              style={{ display: "none" }}
            />
            {/* Custom Gold Button acting as file selector */}
            <label
              htmlFor="profile-upload"
              className="interactive-btn"
              style={{
                background: "#D4AF37",
                color: "white",
                padding: "10px 20px",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "inline-block",
                fontSize: "14px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
              }}
            >
              {selectedFile ? "Change Profile" : "Upload Profile "}
            </label>
            {selectedFile && (
              <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                {selectedFile.name}
              </p>
            )}
          </div>
        </div>

        {error && (
          <p
            style={{
              color: "red",
              marginTop: "15px",
              fontSize: "14px",
              whiteSpace: "pre-line"
            }}
          >
            {error}
          </p>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            marginTop: "20px"
          }}
        >
          <input
            placeholder="Profession/Occupation"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              outline: "none"
            }}
          />

          {/* Name Row with Prefix Dropdown */}
          <div
            style={{
              display: "flex",
              gap: "10px"
            }}
          >
            <select
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              style={{
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                background: "white",
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="Mr">Mr.</option>
              <option value="Ms">Ms.</option>
              <option value="Miss">Miss</option>
              <option value="Mrs">Mrs.</option>
              <option value="Dr">Dr.</option>
              <option value="Prof">Prof.</option>
              <option value="Teacher">Teacher</option>
            </select>

            <input
              placeholder="First Name and Last Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                outline: "none"
              }}
            />
          </div>

          <div>
            <input
              placeholder="StoreName"
              value={storeName}
              onChange={(e) => {
                const valueWithoutSpaces = e.target.value.replace(/\s+/g, '');
                setStoreName(valueWithoutSpaces);
              }}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
            {storeName && (
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginTop: "5px",
                  paddingLeft: "4px"
                }}
              >
                Your store link: <strong style={{ color: "#33a285" }}>creatorstore.ca/{storeName}</strong>
              </div>
            )}
          </div>

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              outline: "none"
            }}
          />

          <div
            style={{
              position: "relative"
            }}
          >
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: "14px",
                width: "100%",
                boxSizing: "border-box",
                paddingRight: "50px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                outline: "none"
              }}
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                fontSize: "20px",
                userSelect: "none"
              }}
            >
              {showPassword ? "👁️" : "🙈"}
            </span>
          </div>
 
          <p
            style={{
              fontSize: "13px",
              color: "#666",
              marginTop: "-5px",
              lineHeight: "20px"
            }}
          >
            🔒 Password must contain:
            <br />
            • Minimum 8 characters
            <br />
            • One uppercase letter (A-Z)
            <br />
            • One lowercase letter (a-z)
            <br />
            • One number (0-9)
            <br />
            • One special symbol (!@#$...)
          </p>

          <button
            onClick={handleSignup}
            className="interactive-btn"
            style={{
              background: "#D4AF37",
              color: "white",
              padding: "15px",
              border: "none",
              borderRadius: "10px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            Create Account
          </button>

          <div
            style={{
              marginTop: "15px",
              textAlign: "center",
              fontSize: "13px",
              color: "#666",
              lineHeight: "20px",
            }}
          >
            By Create Account, you agree to our{" "}
            <a
              href="/terms"
              style={{
                color: "#D4AF37",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              style={{
                color: "#D4AF37",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              Privacy Policy
            </a>
            .
          </div>

          <div
            style={{
              marginTop: "10px",
              textAlign: "center",
              fontSize: "15px",
            }}
          >
            Already have an account?{" "}
            <a
              href="/login"
              className="interactive-btn"
              style={{
                color: "#D4AF37",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}