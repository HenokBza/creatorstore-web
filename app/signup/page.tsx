"use client";

import { useState } from "react";
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

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState("/profile-placeholder.png");

  const [name, setName] = useState("");
  const [storeName, setStoreName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const handleImage = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    const imageURL =
      URL.createObjectURL(file);

    setImagePreview(imageURL);
  };

  const handleSignup = async () => {

    setError("");

    if (
      !name ||
      !storeName ||
      !email ||
      !password
    ) {
      setError(
        "Please fill all required fields"
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

      const user =
        userCredential.user;

      let profileImageURL = "";

      // Upload image if selected

      if (selectedFile) {

        const imageRef = ref(
          storage,
          `profiles/${user.uid}`
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
          name,
          email,
          storeName,
          storeURL:
            `creatorstore.ca/${storeName}`,
          profileImage:
            profileImageURL,
          createdAt:
            new Date(),
        }
      );

      alert(
        "Account created successfully!"
      );

      router.push("/login");

    } catch (error: any) {

      setError(
        error.message
      );
    }
  };

  return (
    <div
      style={{
        minHeight:"100vh",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        background:"#f5f5f5"
      }}
    >
      <div
        style={{
          width:"420px",
          background:"white",
          padding:"35px",
          borderRadius:"20px",
          boxShadow:
          "0 5px 20px rgba(0,0,0,.1)"
        }}
      >

        <h1
          style={{
            textAlign:"center",
            color:"#D4AF37"
          }}
        >
          Create CreatorStore Account
        </h1>

        <div
          style={{
            textAlign:"center",
            marginTop:"20px"
          }}
        >

          <img
            src={imagePreview}
            alt="profile"
            style={{
              width:"100px",
              height:"100px",
              borderRadius:"50%",
              objectFit:"cover",
              border:
              "4px solid #D4AF37"
            }}
          />

          <div
            style={{
              marginTop:"10px"
            }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
            />
          </div>

        </div>

        {error && (

          <p
            style={{
              color:"red",
              marginTop:"15px"
            }}
          >
            {error}
          </p>

        )}

        <div
          style={{
            display:"flex",
            flexDirection:"column",
            gap:"15px",
            marginTop:"20px"
          }}
        >

          <input
            placeholder="Full Name"
            value={name}
            onChange={(e)=>
            setName(
              e.target.value
            )}
            style={{
              padding:"14px",
              borderRadius:"10px"
            }}
          />

          <input
            placeholder="Store Name"
            value={storeName}
            onChange={(e)=>
            setStoreName(
              e.target.value
            )}
            style={{
              padding:"14px",
              borderRadius:"10px"
            }}
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e)=>
            setEmail(
              e.target.value
            )}
            style={{
              padding:"14px",
              borderRadius:"10px"
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>
            setPassword(
              e.target.value
            )}
            style={{
              padding:"14px",
              borderRadius:"10px"
            }}
          />

          <button
            onClick={handleSignup}
            style={{
              background:"#D4AF37",
              color:"white",
              padding:"15px",
              border:"none",
              borderRadius:"10px",
              fontWeight:"bold",
              cursor:"pointer",
              fontSize:"16px"
            }}
          >
            Create Account
          </button>

        </div>

      </div>
    </div>
  );
}