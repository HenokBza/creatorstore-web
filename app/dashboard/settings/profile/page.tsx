"use client";

import { useEffect, useState } from "react";
import { auth, db, storage } from "@/lib/firebase";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

export default function ProfilePage() {
  const [userData, setUserData] =
    useState<any>(null);

  const [editing, setEditing] =
    useState(false);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [name, setName] =
    useState("");

  const [storeName, setStoreName] =
    useState("");

  const [email, setEmail] =
    useState("");
  const [subscriptionStatus, setSubscriptionStatus] =
  useState("inactive");

const [subscriptionPlan, setSubscriptionPlan] =
  useState("");

const [subscriptionEnd, setSubscriptionEnd] =
  useState("");  

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user =
      auth.currentUser;

    if (!user) return;

    const snap =
      await getDoc(
        doc(
          db,
          "users",
          user.uid
        )
      );

    if (snap.exists()) {
      const data =
        snap.data();

      setUserData(data);

      setName(
        data.name || ""
      );

      setStoreName(
        data.storeName || ""
      );

      setEmail(
        data.email || ""
      );

      setImagePreview(
        data.profileImage || ""
      );
      setSubscriptionStatus(
  data.subscriptionStatus || "inactive"
);

setSubscriptionPlan(
  data.subscriptionPlan || "Creator Pro"
);

if (data.subscriptionEnd) {

  const date =
    data.subscriptionEnd.toDate
      ? data.subscriptionEnd.toDate()
      : new Date(data.subscriptionEnd);

  setSubscriptionEnd(
    date.toLocaleDateString()
  );

}
    }
  };

  const handleImage = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    const preview =
      URL.createObjectURL(file);

    setImagePreview(
      preview
    );
  };

  const saveChanges =
    async () => {

      const user =
        auth.currentUser;

      if (!user) return;

      let imageURL =
        userData?.profileImage || "";

      try {

        if (
          selectedFile
        ) {

          const imageRef =
            ref(
              storage,
              `profiles/${user.uid}`
            );

          await uploadBytes(
            imageRef,
            selectedFile
          );

          imageURL =
            await getDownloadURL(
              imageRef
            );
        }

        await updateDoc(
          doc(
            db,
            "users",
            user.uid
          ),
          {
            name,
            profileImage:
              imageURL,
          }
        );

        alert(
          "Profile updated!"
        );

        setEditing(
          false
        );

        loadUser();

      } catch (
        error
      ) {
        console.log(
          error
        );
      }
    };
const manageSubscription = async () => {

  try {

    const user = auth.currentUser;

    if (!user) return;

    const response = await fetch(
      "/api/subscription/manage",
      {
        method: "POST",
        headers: {
          "Content-Type":"application/json",
        },
        body: JSON.stringify({
          uid: user.uid,
        }),
      }
    );

    const data = await response.json();

    if (data.url) {

      window.location.href = data.url;

    } else {

      alert(data.error);

    }

  } catch (error) {

    console.log(error);

  }

};
  return (
    <div
      style={{
        maxWidth:"700px",
        margin:"auto",
        background:"white",
        padding:"30px",
        borderRadius:"20px",
        boxShadow:
        "0 5px 20px rgba(0,0,0,.1)"
      }}
    >
      <div
        style={{
          textAlign:"center"
        }}
      >
        <img
          src={
            imagePreview ||
            "/profile-placeholder.png"
          }
          alt="profile"
          style={{
            width:"120px",
            height:"120px",
            borderRadius:"50%",
            objectFit:"cover",
            border:
            "4px solid #D4AF37"
          }}
        />

        {editing && (

          <input
            type="file"
            accept="image/*"
            onChange={
              handleImage
            }
            style={{
              marginTop:"15px"
            }}
          />

        )}

        <h1>
          {name}
        </h1>

        <p>
          {email}
        </p>
      </div>

      <div
        style={{
          marginTop:"30px",
          display:"flex",
          flexDirection:"column",
          gap:"15px"
        }}
      >

        <label>
          Full Name
        </label>

        <input
          value={name}
          disabled={!editing}
          onChange={(e)=>
          setName(
            e.target.value
          )}
          style={{
            padding:"14px",
            borderRadius:"10px"
          }}
        />

        <label>
          Store Name
        </label>

        <input
          value={
            storeName
          }
           disabled={!editing}
          onChange={(e)=>
          setName(
            e.target.value
          )}
          style={{
            padding:"14px",
            borderRadius:"10px"
          }}
        />


        <label>
          Email
        </label>

        <input
          value={
            email
          }
           disabled={!editing}
          onChange={(e)=>
          setName(
            e.target.value
          )}
          style={{
            padding:"14px",
            borderRadius:"10px"
          }}
          />

        {!editing ? (

          <button
            onClick={()=>
            setEditing(
              true
            )
            }
            style={{
              background:
              "#2563eb",
              color:
              "white",
              border:
              "none",
              padding:
              "14px",
              borderRadius:
              "10px",
              cursor:
              "pointer",
              fontWeight:
              "bold"
            }}
          >
            Edit Profile
          </button>

        ) : (

          <button
            onClick={
              saveChanges
            }
            style={{
              background:
              "#D4AF37",
              color:
              "white",
              border:
              "none",
              padding:
              "14px",
              borderRadius:
              "10px",
              cursor:
              "pointer",
              fontWeight:
              "bold"
            }}
          >
            Save Changes
          </button>

        )}

      </div>
      <div
  style={{
    marginTop: "40px",
    padding: "25px",
    background: "#fafafa",
    borderRadius: "18px",
    border: "1px solid #e5e7eb",
  }}
>

  <h2
    style={{
      marginBottom: "20px",
    }}
  >
    💳 Creator Pro Subscription
  </h2>

  <p>
    <b>Status:</b>{" "}
    <span
      style={{
        color:
          subscriptionStatus === "active"
            ? "#16a34a"
            : "#ef4444",
        fontWeight: "bold",
      }}
    >
      {subscriptionStatus === "active"
        ? "Active"
        : "Inactive"}
    </span>
  </p>

  <p
    style={{
      marginTop: "12px",
    }}
  >
    <b>Plan:</b>{" "}
    {subscriptionPlan || "Creator Pro"}
  </p>

  <p
    style={{
      marginTop: "12px",
    }}
  >
    <b>Next Renewal:</b>{" "}
    {subscriptionEnd || "--"}
  </p>

  <button
    onClick={manageSubscription}
    style={{
      width: "100%",
      marginTop: "25px",
      padding: "15px",
      background: "#635BFF",
      color: "white",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "16px",
    }}
  >
    Manage Subscription
  </button>

  <button
    onClick={manageSubscription}
    style={{
      width: "100%",
      marginTop: "15px",
      padding: "15px",
      background: "#ef4444",
      color: "white",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "16px",
    }}
  >
    Cancel Subscription
  </button>

</div>
    </div>
  );
}