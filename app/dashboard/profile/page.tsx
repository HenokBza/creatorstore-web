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
          disabled={true}
          style={{
            padding:"14px",
            borderRadius:"10px",
            background:"#f3f3f3",
            color:"#777",
            cursor:
            "not-allowed"
          }}
        />

        <p
          style={{
            fontSize:"12px",
            color:"#666"
          }}
        >
          Store name cannot be changed
        </p>

        <label>
          Email
        </label>

        <input
          value={
            email
          }
          disabled={true}
          style={{
            padding:"14px",
            borderRadius:"10px",
            background:"#f3f3f3",
            color:"#777",
            cursor:
            "not-allowed"
          }}
        />

        <p
          style={{
            fontSize:"12px",
            color:"#666"
          }}
        >
          Email cannot be changed
        </p>

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
    </div>
  );
}