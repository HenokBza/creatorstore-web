"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  addDoc,
  updateDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { auth, db, storage } from "@/lib/firebase";

export default function CoachingCallPage() {
  const router = useRouter();

  // ==========================================
  // FORM STATES
  // ==========================================

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");

  const [duration, setDuration] = useState("60");
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [newAvailableTime, setNewAvailableTime] = useState("");
  const [availabilityTimeZone, setAvailabilityTimeZone] = useState("Africa/Addis_Ababa");

  const [benefit1, setBenefit1] = useState("");
  const [benefit2, setBenefit2] = useState("");
  const [benefit3, setBenefit3] = useState("");

  const [meetingLink, setMeetingLink] = useState("");

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");

  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const timeZones = [
    { label: "Ethiopia — Addis Ababa (UTC+03:00)", value: "Africa/Addis_Ababa" },
    { label: "Canada — Eastern Time", value: "America/Toronto" },
    { label: "Canada — Central Time", value: "America/Winnipeg" },
    { label: "Canada — Mountain Time", value: "America/Edmonton" },
    { label: "Canada — Pacific Time", value: "America/Vancouver" },
    { label: "USA — Eastern Time", value: "America/New_York" },
    { label: "USA — Central Time", value: "America/Chicago" },
    { label: "USA — Mountain Time", value: "America/Denver" },
    { label: "USA — Pacific Time", value: "America/Los_Angeles" },
    { label: "UAE — Dubai", value: "Asia/Dubai" },
    { label: "Saudi Arabia — Riyadh", value: "Asia/Riyadh" },
    { label: "Qatar — Doha", value: "Asia/Qatar" },
    { label: "UK — London", value: "Europe/London" },
    { label: "Europe — Central European Time", value: "Europe/Berlin" },
  ];

  // ==========================================
  // AVAILABILITY HANDLERS
  // ==========================================
  const toggleAvailableDay = (day: string) => {
    setAvailableDays((current) =>
      current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day]
    );
  };

  const addAvailableTime = () => {
    if (!newAvailableTime) return;

    if (availableTimes.includes(newAvailableTime)) {
      alert("This time has already been added.");
      return;
    }

    setAvailableTimes((current) => [...current, newAvailableTime].sort());
    setNewAvailableTime("");
  };

  const removeAvailableTime = (time: string) => {
    setAvailableTimes((current) => current.filter((t) => t !== time));
  };

  // ==========================================
  // LOAD EXISTING COACHING CALL IF EDITING
  // ==========================================
  useEffect(() => {
    const savedTimeZone = localStorage.getItem("coachingAvailabilityTimeZone");
    if (savedTimeZone) {
      setAvailabilityTimeZone(savedTimeZone);
    }

    const editingId = localStorage.getItem("editingCoachingCallId");
    if (editingId) {
      setTitle(localStorage.getItem("coachingTitle") || "");
      setDescription(localStorage.getItem("coachingDescription") || "");
      setPrice(localStorage.getItem("coachingPrice") || "");
      setDiscountPrice(localStorage.getItem("coachingDiscountPrice") || "");
      setDuration(localStorage.getItem("coachingDuration") || "60");
      setAvailabilityTimeZone(localStorage.getItem("coachingAvailabilityTimeZone") || "Africa/Addis_Ababa");

      try {
        const savedDays = JSON.parse(
          localStorage.getItem("coachingAvailableDays") || "[]"
        );
        const savedTimes = JSON.parse(
          localStorage.getItem("coachingAvailableTimes") || "[]"
        );

        if (Array.isArray(savedDays)) setAvailableDays(savedDays);
        if (Array.isArray(savedTimes)) setAvailableTimes(savedTimes);
      } catch (error) {
        console.error("❌ Failed to load coaching availability:", error);
      }

      setMeetingLink(localStorage.getItem("coachingMeetingLink") || "");
      
      const thumb = localStorage.getItem("coachingThumbnail");
      if (thumb) setThumbnailPreview(thumb);

      setBenefit1(localStorage.getItem("benefit1") || "");
      setBenefit2(localStorage.getItem("benefit2") || "");
      setBenefit3(localStorage.getItem("benefit3") || "");
    }
  }, []);

  useEffect(() => {
    return () => {
      if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Thumbnail must be smaller than 5MB.");
      return;
    }

    setThumbnailFile(file);
    const previewUrl = URL.createObjectURL(file);
    setThumbnailPreview(previewUrl);
  };

  const publishCoaching = async () => {
    try {
      setPublishing(true);
      setMessage("");

      const user = auth.currentUser;
      if (!user) {
        alert("Please login before creating a coaching call.");
        setPublishing(false);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        alert("Creator account not found.");
        setPublishing(false);
        return;
      }

      const userData = userSnap.data();

      if (
        userData.country !== "Ethiopia" &&
        userData.subscriptionStatus !== "active"
      ) {
        alert("A Creator Pro subscription is required to publish a Coaching Call.");
        setPublishing(false);
        router.push(
          `/dashboard/subscription?returnTo=${encodeURIComponent(
            "/dashboard/products/coaching-call"
          )}`
        );
        return;
      }

      if (!title.trim()) {
        alert("Please enter a coaching call title.");
        setPublishing(false);
        return;
      }

      if (!description.trim()) {
        alert("Please enter a coaching description.");
        setPublishing(false);
        return;
      }

      const numericPrice = Number(price);
      if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        alert("Please enter a valid price.");
        setPublishing(false);
        return;
      }

      let numericDiscount: number | null = null;
      if (discountPrice.trim()) {
        numericDiscount = Number(discountPrice);
        if (!Number.isFinite(numericDiscount) || numericDiscount <= 0) {
          alert("Please enter a valid discount price.");
          setPublishing(false);
          return;
        }
        if (numericDiscount >= numericPrice) {
          alert("Discount price must be lower than the original price.");
          setPublishing(false);
          return;
        }
      }

      const numericDuration = Number(duration);
      if (!Number.isFinite(numericDuration) || numericDuration <= 0) {
        alert("Please enter a valid coaching duration.");
        setPublishing(false);
        return;
      }

      if (availableDays.length === 0) {
        alert("Please select at least one available day.");
        setPublishing(false);
        return;
      }

      if (availableTimes.length === 0) {
        alert("Please add at least one available time.");
        setPublishing(false);
        return;
      }

      if (!meetingLink.trim()) {
        alert("Please enter your meeting link.");
        setPublishing(false);
        return;
      }

      try {
        new URL(meetingLink.trim());
      } catch {
        alert("Please enter a valid meeting link.");
        setPublishing(false);
        return;
      }

      const benefits = [
        benefit1.trim(),
        benefit2.trim(),
        benefit3.trim(),
      ].filter(Boolean);

      if (benefits.length === 0) {
        alert("Please add at least one coaching benefit.");
        setPublishing(false);
        return;
      }

     let thumbnailUrl = thumbnailPreview;
      if (thumbnailFile) {
        setMessage("Uploading coaching thumbnail...");
        const safeFileName = thumbnailFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const storageRef = ref(
          storage,
          `coaching/${user.uid}/items/${Date.now()}-${safeFileName}`
        );
        await uploadBytes(storageRef, thumbnailFile);
        thumbnailUrl = await getDownloadURL(storageRef);
      }

      setMessage("Saving coaching call...");

      const coachingData = {
        creatorId: user.uid,
        creatorName: userData.name || "Creator",
        creatorEmail: userData.email || user.email || "",

        title: title.trim(),
        description: description.trim(),

        price: numericPrice,
        discountPrice: numericDiscount,

        duration: numericDuration,

        availableDays,
        availableTimes,
        availabilityTimeZone, // ✅ Properly saved to Firestore

        benefits,
        meetingLink: meetingLink.trim(),
        thumbnail: thumbnailUrl || "/product-placeholder.png",
        isActive: true,
        updatedAt: serverTimestamp(),
      };

      const editingCoachingCallId = localStorage.getItem("editingCoachingCallId");

      if (editingCoachingCallId) {
        await updateDoc(
          doc(db, "coachingCalls", editingCoachingCallId),
          coachingData
        );
        localStorage.removeItem("editingCoachingCallId");
        alert("Coaching call updated successfully 🚀");
      } else {
        await addDoc(collection(db, "coachingCalls"), {
          ...coachingData,
          customers: 0,
          revenue: 0,
          createdAt: serverTimestamp(),
        });
        alert("Coaching call published successfully 🚀");
      }

      // Cleanup local storage
      localStorage.removeItem("coachingTitle");
      localStorage.removeItem("coachingDescription");
      localStorage.removeItem("coachingPrice");
      localStorage.removeItem("coachingDiscountPrice");
      localStorage.removeItem("coachingDuration");
      localStorage.removeItem("coachingMeetingLink");
      localStorage.removeItem("coachingThumbnail");
      localStorage.removeItem("coachingAvailableDays");
      localStorage.removeItem("coachingAvailableTimes");
      localStorage.removeItem("coachingAvailabilityTimeZone");

      router.push("/dashboard/store");

    } catch (error: any) {
      console.error("❌ COACHING SAVE ERROR:", error);
      setPublishing(false);
      setMessage(error?.message || "Something went wrong.");
      alert(error?.message || "Something went wrong.");
    }
  };

  const hasDiscount =
    discountPrice.trim() !== "" &&
    Number(discountPrice) > 0 &&
    Number(discountPrice) < Number(price);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "30px",
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* BACK BUTTON & HEADER */}
      <div>
        <button
          onClick={() => {
            localStorage.removeItem("editingCoachingCallId");
            router.push("/dashboard/store");
          }}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            color: "#555",
            marginBottom: "15px",
            fontSize: "15px",
          }}
        >
          ← Back to Store
        </button>

        <h1 style={{ marginBottom: "8px", fontSize: "clamp(22px, 5vw, 28px)" }}>
          📅 Create or Edit Coaching Call
        </h1>
        <p style={{ color: "#666", fontSize: "14px" }}>
          Create a paid one-on-one coaching session for your customers.
        </p>
      </div>

      {/* MAIN LAYOUT CONTAINER */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "30px",
          alignItems: "start",
        }}
      >
        {/* ===================================
            LEFT: FORM
        ==================================== */}
        <div
          style={{
            background: "white",
            padding: "clamp(15px, 3vw, 30px)",
            borderRadius: "20px",
            boxShadow: "0px 4px 20px rgba(0,0,0,.08)",
            boxSizing: "border-box",
            width: "100%",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {/* TITLE */}
            <div>
              <h3 style={{ marginBottom: "8px" }}>Coaching Title *</h3>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Example: 1-on-1 Business Coaching"
                maxLength={100}
                style={inputStyle}
              />
            </div>

            {/* THUMBNAIL */}
            <div>
              <h3 style={{ marginBottom: "8px" }}>🖼️ Coaching Thumbnail</h3>
              <div
                style={{
                  border: "2px dashed #D4AF37",
                  padding: "15px",
                  borderRadius: "15px",
                  textAlign: "center",
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  style={{ width: "100%", fontSize: "13px" }}
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <h3 style={{ marginBottom: "8px" }}>Description *</h3>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what customers will receive during the coaching session..."
                rows={6}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                }}
              />
            </div>

            {/* PRICING */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: "15px",
              }}
            >
              <div>
                <h3 style={{ marginBottom: "8px" }}>Price (CA$) *</h3>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="100.00"
                  style={inputStyle}
                />
              </div>

              <div>
                <h3 style={{ marginBottom: "8px" }}>Discount Price (CA$)</h3>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  placeholder="Optional"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* DURATION */}
            <div>
              <h3 style={{ marginBottom: "8px" }}>Session Duration *</h3>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                style={inputStyle}
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
                <option value="120">2 hours</option>
              </select>
            </div>

            {/* ==========================================
                WEEKLY AVAILABILITY (Side-by-side Layout)
            ========================================== */}
            <div>
              <h3 style={{ marginBottom: "8px" }}>📅 Weekly Availability</h3>
              <p
                style={{
                  color: "#666",
                  fontSize: "14px",
                  marginBottom: "15px",
                  lineHeight: "1.5",
                }}
              >
                Select your available days, and set your timezone and daily time slots.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "20px",
                }}
              >
                {/* 1. AVAILABLE DAYS (Left) */}
                <div
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "15px",
                    padding: "16px",
                    background: "#fafafa",
                    boxSizing: "border-box",
                  }}
                >
                  <h4 style={{ marginTop: 0, marginBottom: "12px" }}>
                    📅 Available Days
                  </h4>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {weekDays.map((day) => {
                      const selected = availableDays.includes(day);

                      return (
                        <label
                          key={day}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            cursor: "pointer",
                            padding: "8px",
                            borderRadius: "8px",
                            background: selected ? "#fff8dc" : "transparent",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleAvailableDay(day)}
                            style={{
                              width: "18px",
                              height: "18px",
                              cursor: "pointer",
                            }}
                          />
                          <span style={{ fontSize: "14px" }}>{day}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 2. TIMEZONE + AVAILABLE TIMES (Right) */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {/* TIMEZONE BOX */}
                  <div
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "15px",
                      padding: "16px",
                      background: "#fafafa",
                      boxSizing: "border-box",
                    }}
                  >
                    <h4 style={{ marginTop: 0, marginBottom: "10px" }}>
                      🌍 Time Zone
                    </h4>
                    <select
                      value={availabilityTimeZone}
                      onChange={(e) => setAvailabilityTimeZone(e.target.value)}
                      style={inputStyle}
                    >
                      {timeZones.map((zone) => (
                        <option key={zone.value} value={zone.value}>
                          {zone.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* AVAILABLE TIMES BOX */}
                  <div
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "15px",
                      padding: "16px",
                      background: "#fafafa",
                      boxSizing: "border-box",
                    }}
                  >
                    <h4 style={{ marginTop: 0, marginBottom: "10px" }}>
                      🕐 Available Times
                    </h4>

                    {!availableDays.length ? (
                      <div
                        style={{
                          padding: "10px",
                          borderRadius: "8px",
                          background: "#f1f5f9",
                          color: "#64748b",
                          fontSize: "13px",
                        }}
                      >
                        Select at least one available day first.
                      </div>
                    ) : (
                      <>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <input
                            type="time"
                            value={newAvailableTime}
                            onChange={(e) => setNewAvailableTime(e.target.value)}
                            style={{
                              ...inputStyle,
                              flex: 1,
                              minWidth: "110px",
                            }}
                          />

                          <button
                            type="button"
                            onClick={addAvailableTime}
                            style={{
                              border: "none",
                              background: "#D4AF37",
                              color: "#111",
                              padding: "12px 14px",
                              borderRadius: "10px",
                              fontWeight: "bold",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              fontSize: "14px",
                            }}
                          >
                            + Add
                          </button>
                        </div>

                        <div
                          style={{
                            marginTop: "12px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                            maxHeight: "150px",
                            overflowY: "auto",
                          }}
                        >
                          {availableTimes.length === 0 ? (
                            <p
                              style={{
                                color: "#888",
                                fontSize: "13px",
                                margin: 0,
                              }}
                            >
                              No times added yet.
                            </p>
                          ) : (
                            availableTimes.map((time) => (
                              <div
                                key={time}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "8px 10px",
                                  background: "white",
                                  border: "1px solid #eee",
                                  borderRadius: "8px",
                                }}
                              >
                                <span style={{ fontWeight: "600", fontSize: "14px" }}>
                                  🕐 {time}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => removeAvailableTime(time)}
                                  style={{
                                    border: "none",
                                    background: "#fee2e2",
                                    color: "#b91c1c",
                                    borderRadius: "6px",
                                    padding: "3px 7px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* BENEFITS */}
            <div>
              <h3 style={{ marginBottom: "8px" }}>✅ What the customer gets</h3>
              <input
                type="text"
                value={benefit1}
                onChange={(e) => setBenefit1(e.target.value)}
                placeholder="Benefit 1"
                style={inputStyle}
              />
              <input
                type="text"
                value={benefit2}
                onChange={(e) => setBenefit2(e.target.value)}
                placeholder="Benefit 2"
                style={{ ...inputStyle, marginTop: "10px" }}
              />
              <input
                type="text"
                value={benefit3}
                onChange={(e) => setBenefit3(e.target.value)}
                placeholder="Benefit 3"
                style={{ ...inputStyle, marginTop: "10px" }}
              />
            </div>

            {/* MEETING LINK */}
            <div>
              <h3 style={{ marginBottom: "8px" }}>🔗 Meeting Link *</h3>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                style={inputStyle}
              />
            </div>

            {/* STATUS MESSAGE */}
            {message && (
              <div
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  background: "#f8fafc",
                  color: "#334155",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                }}
              >
                {message}
              </div>
            )}

            {/* PUBLISH BUTTON */}
            <button
              onClick={publishCoaching}
              disabled={publishing}
              style={{
                background: publishing ? "#aaa" : "#D4AF37",
                border: "none",
                padding: "16px",
                borderRadius: "15px",
                fontWeight: "bold",
                fontSize: "16px",
                cursor: publishing ? "not-allowed" : "pointer",
                width: "100%",
                color: "#111",
              }}
            >
              {publishing ? "Saving..." : "🚀 Save Coaching Call"}
            </button>
          </div>
        </div>

        {/* ===================================
            RIGHT: LIVE PREVIEW
        ==================================== */}
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "20px",
            boxShadow: "0px 4px 20px rgba(0,0,0,.08)",
            position: "sticky",
            top: "20px",
            boxSizing: "border-box",
            width: "100%",
            overflow: "hidden",
          }}
        >
          <h2>👀 Live Preview</h2>

          <div
            style={{
              marginTop: "20px",
              background: "#f8f8f8",
              padding: "15px",
              borderRadius: "15px",
              boxSizing: "border-box",
              width: "100%",
              overflow: "hidden",
            }}
          >
            <img
              src={thumbnailPreview || "/product-placeholder.png"}
              alt="thumbnail"
              style={{
                width: "100%",
                height: "160px",
                objectFit: "cover",
                borderRadius: "12px",
              }}
            />

            <h3
              style={{
                marginTop: "12px",
                wordBreak: "break-word",
                fontSize: "18px",
              }}
            >
              {title || "Your Coaching Call"}
            </h3>

            <p
              style={{
                color: "#555",
                lineHeight: "1.4",
                wordBreak: "break-word",
                marginTop: "8px",
                fontSize: "14px",
              }}
            >
              {description || "Your coaching description will appear here."}
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: "12px",
                flexWrap: "wrap",
              }}
            >
              {hasDiscount ? (
                <>
                  <h3
                    style={{
                      color: "#D4AF37",
                      margin: 0,
                      fontSize: "20px",
                    }}
                  >
                    CA${Number(discountPrice).toFixed(2)}
                  </h3>
                  <span
                    style={{
                      textDecoration: "line-through",
                      color: "#888",
                      fontWeight: "bold",
                      fontSize: "14px",
                    }}
                  >
                    CA${Number(price || 0).toFixed(2)}
                  </span>
                </>
              ) : (
                <h3
                  style={{
                    color: "#D4AF37",
                    margin: 0,
                    fontSize: "20px",
                  }}
                >
                  CA${Number(price || 0).toFixed(2)}
                </h3>
              )}
            </div>

            <p
              style={{
                marginTop: "8px",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              ⏱️ {duration} minutes
            </p>

            <div
              style={{
                marginTop: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {[benefit1, benefit2, benefit3]
                .filter(Boolean)
                .map((benefit, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: "8px",
                      padding: "8px",
                      background: "white",
                      borderRadius: "8px",
                      wordBreak: "break-word",
                    }}
                  >
                    <span style={{ fontSize: "14px" }}>✅</span>
                    <span style={{ flex: 1, fontSize: "13px" }}>
                      {benefit}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  boxSizing: "border-box",
  fontSize: "14px",
  outline: "none",
  background: "#fff",
};