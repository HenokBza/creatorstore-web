"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [openProfile, setOpenProfile] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
  let userUnsubscribe: (() => void) | undefined;
  let bookingsUnsubscribe: (() => void) | undefined;

  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    // If user logs out, clean up any existing listeners immediately
    if (!user) {
      if (userUnsubscribe) userUnsubscribe();
      if (bookingsUnsubscribe) bookingsUnsubscribe();
      setUserData(null);
      setUnreadCount(0);
      return;
    }

    // Listen to user data
    userUnsubscribe = onSnapshot(
      doc(db, "users", user.uid), 
      (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      },
      (error) => {
        // Silently catch permission-denied during logout transition
        if (error.code !== "permission-denied") console.error(error);
      }
    );

    // Listen to unread coaching bookings count
    const q = query(
      collection(db, "coachingBookings"),
      where("creatorId", "==", user.uid),
      where("unread", "==", true)
    );

    bookingsUnsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        setUnreadCount(snapshot.size);
      },
      (error) => {
        if (error.code !== "permission-denied") console.error(error);
      }
    );
  });

  // THIS IS THE CRITICAL FIX FOR useEffect:
  return () => {
    unsubscribeAuth();
    if (userUnsubscribe) userUnsubscribe();
    if (bookingsUnsubscribe) bookingsUnsubscribe();
  };
}, []);
  const changeProfilePicture = async (file: File) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setUploading(true);
      const storageRef = ref(storage, `profiles/${user.uid}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "users", user.uid), {
        profileImage: imageUrl,
      });

      alert("Profile picture updated!");
    } catch (error) {
      console.log(error);
      alert("Failed to update profile picture.");
    }
    setUploading(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.log(error);
    }
  };

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: "🏠" },
    { name: "Add Products", href: "/dashboard/products", icon: "🛍️" },
    { name: "My Store", href: "/dashboard/store", icon: "🏪" },
    { name: "Earnings", href: "/dashboard/earnings", icon: "💰" },
    { name: "Coaching Books", href: "/dashboard/coaching-bookings", icon: "🎯" },
    { name: "Help", href: "/dashboard/help", icon: "❓" },
    { name: "Settings", href: "/dashboard/settings", icon: "⚙️" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <div
        style={{
          width: "250px",
          background: "white",
          color: "black",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* LOGO */}
        <h2
          style={{
            color: "#D4AF37",
            fontWeight: "bold",
            fontSize: "24px",
            marginBottom: "25px",
          }}
        >
          CreatorStore
        </h2>

        {/* PROFILE MOVED TO TOP */}
        <div
          style={{
            position: "relative",
            marginBottom: "25px",
            paddingBottom: "20px",
            borderBottom: "1px solid #333",
          }}
        >
          <div
            onClick={() => setOpenProfile(!openProfile)}
            style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
          >
            <div style={{ position: "relative", width: "50px", height: "50px" }}>
              <img
                src={userData?.profileImage || "/profile-placeholder.png"}
                alt="profile"
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #D4AF37",
                }}
              />
              <div
                className="interactive-btn"
                style={{
                  position: "absolute",
                  bottom: "-2px",
                  right: "-2px",
                  width: "18px",
                  height: "18px",
                  background: "#D4AF37",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  border: "2px solid #111",
                  color: "#111",
                }}
              >
                ✏️
              </div>
            </div>

            <div>
              <strong>{userData?.name || "User"}</strong>
              <div
                style={{
                  fontSize: "12px",
                  color: "#ccc",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {userData?.email}
              </div>
            </div>
          </div>

          {openProfile && (
            <div
              style={{
                background: "#222",
                borderRadius: "10px",
                marginTop: "12px",
                padding: "12px",
              }}
            >
              <label
                className="interactive-btn"
                style={{ display: "block", color: "white", cursor: "pointer", marginBottom: "12px" }}
              >
                👤 Change Profile Pic
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    if (!e.target.files?.length) return;
                    await changeProfilePicture(e.target.files[0]);
                  }}
                />
              </label>

              <Link
                href="/dashboard/settings"
                className="interactive-btn"
                style={{ display: "block", color: "white", textDecoration: "none", marginBottom: "12px" }}
              >
                ⚙️ Settings
              </Link>

              <p
                onClick={handleLogout}
                className="interactive-btn"
                style={{ cursor: "pointer", color: "#ff6b6b", margin: 0 }}
              >
                🚪 Logout
              </p>
            </div>
          )}
        </div>

        {/* SIDEBAR LINKS */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {links.map((link) => {
            const isActive = pathname === link.href;
            const isCoaching = link.href === "/dashboard/coaching-bookings";

            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px",
                  marginBottom: "10px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  color: isActive ? "#111" : "black",
                  background: isActive ? "#D4AF37" : "transparent",
                  fontWeight: isActive ? "bold" : "normal",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>{link.icon}</span>
                  <span>{link.name}</span>
                </span>

                {/* Notification Badge */}
                {isCoaching && unreadCount > 0 && (
                  <span
                    style={{
                      background: "#ef4444",
                      color: "white",
                      fontSize: "11px",
                      fontWeight: "bold",
                      padding: "2px 7px",
                      borderRadius: "9999px",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: "30px", background: "#f8f8f8" }}>
        {children}
      </div>
    </div>
  );
}