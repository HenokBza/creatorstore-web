"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect, useRef } from "react";
import { doc, onSnapshot, updateDoc, collection, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [openProfile, setOpenProfile] = useState(false);
  const [openMenu3Dots, setOpenMenu3Dots] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let userUnsubscribe: (() => void) | undefined;
    let bookingsUnsubscribe: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        if (userUnsubscribe) userUnsubscribe();
        if (bookingsUnsubscribe) bookingsUnsubscribe();
        setUserData(null);
        setUnreadCount(0);
        return;
      }

      userUnsubscribe = onSnapshot(
        doc(db, "users", user.uid),
        (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        },
        (error) => {
          if (error.code !== "permission-denied") console.error(error);
        }
      );

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

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu3Dots(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      unsubscribeAuth();
      if (userUnsubscribe) userUnsubscribe();
      if (bookingsUnsubscribe) bookingsUnsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
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

  const mobilePrimaryLinks = links.slice(0, 3).concat(links[4]);
  const mobileSecondaryLinks = [links[3], links[5], links[6]];

  return (
    <>
      <style jsx global>{`
        .desktop-sidebar {
          display: none !important;
        }
        .mobile-header {
          display: flex !important;
        }
        .mobile-bottom-nav {
          display: flex !important;
        }
        .main-layout-wrapper {
          flex-direction: column !important;
        }
        .main-content-container {
          padding: 20px 20px 90px 20px !important;
          margin-left: 0 !important;
        }

        @media (min-width: 768px) {
          .desktop-sidebar {
            display: flex !important;
          }
          .mobile-header {
            display: none !important;
          }
          .mobile-bottom-nav {
            display: none !important;
          }
          .main-layout-wrapper {
            flex-direction: row !important;
          }
          .main-content-container {
            padding: 30px !important;
            margin-left: 260px !important;
            max-width: 900px !important; /* Limits maximum width on wide screens */
            margin-right: auto !important; /* Centers the content neatly */
          }
        }
      `}</style>

      <div
        className="main-layout-wrapper"
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#f8f8f8",
        }}
      >
        {/* DESKTOP SIDEBAR */}
        <aside
          className="desktop-sidebar"
          style={{
            width: "260px",
            background: "white",
            color: "black",
            padding: "20px",
            flexDirection: "column",
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            borderRight: "1px solid #e5e7eb",
            zIndex: 40,
            overflowY: "auto",
          }}
        >
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

          <div
            style={{
              position: "relative",
              marginBottom: "25px",
              paddingBottom: "20px",
              borderBottom: "1px solid #eee",
            }}
          >
            <div
              onClick={() => setOpenProfile(!openProfile)}
              style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
            >
              <div style={{ position: "relative", width: "80px", height: "80px" }}>
                <img
                  src={userData?.profileImage || "/profile-placeholder.png"}
                  alt="profile"
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #D4AF37",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "-2px",
                    right: "-2px",
                    width: "15px",
                    height: "15px",
                    background: "#D4AF37",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    border: "2px solid #fff",
                    color: "#111",
                  }}
                >
                  ✏️
                </div>
              </div>
              <div style={{ overflow: "hidden" }}>
                <strong style={{ fontSize: "14px", display: "block" }}>{userData?.name || "User"}</strong>
                <span style={{ fontSize: "11px", color: "#666", textOverflow: "ellipsis", overflow: "hidden", display: "block" }}>
                  {userData?.email}
                </span>
              </div>
            </div>

            {openProfile && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: "55px",
                  background: "#222",
                  color: "white",
                  borderRadius: "10px",
                  padding: "12px",
                  width: "210px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                  zIndex: 50,
                }}
              >
                <div style={{ paddingBottom: "8px", borderBottom: "1px solid #444", marginBottom: "10px" }}>
                  <strong style={{ display: "block", fontSize: "13px" }}>{userData?.name || "User"}</strong>
                  <span style={{ fontSize: "11px", color: "#aaa", wordBreak: "break-all" }}>{userData?.email}</span>
                </div>
                <label
                  style={{ display: "block", color: "white", cursor: "pointer", marginBottom: "10px", fontSize: "13px" }}
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
                  style={{ display: "block", color: "white", textDecoration: "none", marginBottom: "10px", fontSize: "13px" }}
                >
                  ⚙️ Settings
                </Link>
                <p
                  onClick={handleLogout}
                  style={{ cursor: "pointer", color: "#ff6b6b", margin: 0, fontSize: "13px" }}
                >
                  🚪 Logout
                </p>
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
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
                    padding: "12px 14px",
                    borderRadius: "10px",
                    textDecoration: "none",
                    color: isActive ? "#111" : "#333",
                    background: isActive ? "#D4AF37" : "transparent",
                    fontWeight: isActive ? "bold" : "normal",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span>{link.icon}</span>
                    <span>{link.name}</span>
                  </span>

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
        </aside>

        {/* CONTAINER FOR MOBILE HEADER + CONTENT */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* MOBILE TOP HEADER */}
          <header
            className="mobile-header"
            style={{
              width: "100%",
              background: "white",
              borderBottom: "1px solid #e5e7eb",
              padding: "12px 20px",
              justifyContent: "space-between",
              alignItems: "center",
              position: "sticky",
              top: 0,
              zIndex: 40,
              display: "none",
            }}
          >
            <h2 style={{ color: "#D4AF37", fontWeight: "bold", fontSize: "22px", margin: 0 }}>
              CreatorStore
            </h2>

            <div style={{ position: "relative" }}>
              <div
                onClick={() => setOpenProfile(!openProfile)}
                style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
              >
                <div style={{ position: "relative", width: "80px", height: "80px" }}>
                  <img
                    src={userData?.profileImage || "/profile-placeholder.png"}
                    alt="profile"
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #D4AF37",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-2px",
                      right: "-2px",
                      width: "15px",
                      height: "15px",
                      background: "#D4AF37",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      border: "2px solid #fff",
                      color: "#111",
                    }}
                  >
                    ✏️
                  </div>
                </div>
              </div>

              {openProfile && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "52px",
                    background: "#222",
                    color: "white",
                    borderRadius: "12px",
                    padding: "12px",
                    width: "210px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                    zIndex: 50,
                  }}
                >
                  <div style={{ paddingBottom: "8px", borderBottom: "1px solid #444", marginBottom: "10px" }}>
                    <strong style={{ display: "block", fontSize: "13px" }}>{userData?.name || "User"}</strong>
                    <span style={{ fontSize: "11px", color: "#aaa", wordBreak: "break-all" }}>{userData?.email}</span>
                  </div>
                  <label style={{ display: "block", cursor: "pointer", marginBottom: "10px", fontSize: "13px" }}>
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
                  <Link href="/dashboard/settings" style={{ display: "block", color: "white", textDecoration: "none", marginBottom: "10px", fontSize: "13px" }}>
                    ⚙️ Settings
                  </Link>
                  <p onClick={handleLogout} style={{ cursor: "pointer", color: "#ff6b6b", margin: 0, fontSize: "13px" }}>
                    🚪 Logout
                  </p>
                </div>
              )}
            </div>
          </header>

          {/* MAIN CONTENT WRAPPER */}
          <main
            className="main-content-container"
            style={{
              flex: 1,
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {children}
          </main>
        </div>

        {/* MOBILE BOTTOM NAVIGATION BAR */}
        <nav
          className="mobile-bottom-nav"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "white",
            borderTop: "1px solid #e5e7eb",
            justifyContent: "space-around",
            alignItems: "center",
            padding: "8px 10px",
            boxShadow: "0 -4px 15px rgba(0,0,0,0.05)",
            zIndex: 40,
            display: "none",
          }}
        >
          {mobilePrimaryLinks.map((link) => {
            const isActive = pathname === link.href;
            const isCoaching = link.href === "/dashboard/coaching-bookings";

            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textDecoration: "none",
                  color: isActive ? "#D4AF37" : "#666",
                  fontSize: "11px",
                  fontWeight: isActive ? "bold" : "normal",
                  position: "relative",
                  padding: "6px",
                  flex: 1,
                }}
              >
                <span style={{ fontSize: "20px", marginBottom: "2px" }}>{link.icon}</span>
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "70px" }}>
                  {link.name}
                </span>

                {isCoaching && unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "12px",
                      background: "#ef4444",
                      color: "white",
                      fontSize: "10px",
                      fontWeight: "bold",
                      padding: "1px 5px",
                      borderRadius: "9999px",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}

          <div ref={menuRef} style={{ position: "relative", flex: 1, display: "flex", justifyContent: "center" }}>
            <button
              onClick={() => setOpenMenu3Dots(!openMenu3Dots)}
              style={{
                background: "transparent",
                border: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                padding: "6px",
                color: openMenu3Dots ? "#D4AF37" : "#666",
              }}
            >
              <span style={{ fontSize: "20px", marginBottom: "2px", fontWeight: "bold", letterSpacing: "2px" }}>⋯</span>
              <span style={{ fontSize: "11px" }}>More</span>
            </button>

            {openMenu3Dots && (
              <div
                style={{
                  position: "absolute",
                  bottom: "65px",
                  right: "10px",
                  background: "white",
                  color: "#111",
                  borderRadius: "12px",
                  padding: "8px",
                  width: "160px",
                  boxShadow: "0 5px 20px rgba(0,0,0,0.15)",
                  border: "1px solid #e5e7eb",
                  zIndex: 50,
                }}
              >
                {mobileSecondaryLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpenMenu3Dots(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        color: isActive ? "#D4AF37" : "#333",
                        background: isActive ? "#fdf8e2" : "transparent",
                        fontWeight: isActive ? "bold" : "normal",
                        fontSize: "14px",
                      }}
                    >
                      <span>{link.icon}</span>
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}