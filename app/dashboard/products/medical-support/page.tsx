"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { auth, db, storage } from "@/lib/firebase";

import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

export default function MedicalSupportPage() {
  const router = useRouter();

  // ==============================
  // FORM STATES
  // ==============================

  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalAmount, setGoalAmount] = useState("");

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImageURLs, setExistingImageURLs] = useState<string[]>([]);

  // Reward Product states
  const [productTitle, setProductTitle] = useState("");
  const [productFile, setProductFile] = useState<File | null>(null);
  const [existingProductFileUrl, setExistingProductFileUrl] = useState("");

  // Edit Mode & Loading States
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  // ==============================
  // AUTH CHECK & FETCH EXISTING
  // ==============================

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const q = query(
          collection(db, "medicalSupport"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0];
          setCampaignId(docData.id);
          const data = docData.data();

          setTitle(data.title || "");
          setDescription(data.description || "");
          setGoalAmount(data.goalAmount ? data.goalAmount.toString() : "");
          setExistingImageURLs(data.images || []);

          setProductTitle(data.productTitle || "");
          setExistingProductFileUrl(data.productFileUrl || "");
        }
      } catch (error) {
        console.error("Error fetching campaign:", error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // ==============================
  // HANDLE IMAGE SELECTION
  // ==============================

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (selectedFiles.length === 0) {
      return;
    }

    const totalCurrentImages = existingImageURLs.length + images.length;
    const remainingSlots = 3 - totalCurrentImages;

    if (remainingSlots <= 0) {
      alert("You can upload a maximum of 3 photos.");
      return;
    }

    const filesToAdd = selectedFiles.slice(
      0,
      remainingSlots
    );

    const validFiles = filesToAdd.filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length !== filesToAdd.length) {
      alert("Only image files are allowed.");
    }

    const sizeValidFiles = validFiles.filter(
      (file) => file.size <= 5 * 1024 * 1024
    );

    if (sizeValidFiles.length !== validFiles.length) {
      alert("Each image must be 5MB or smaller.");
    }

    if (sizeValidFiles.length === 0) {
      return;
    }

    setImages((previous) => [
      ...previous,
      ...sizeValidFiles,
    ]);

    const newPreviews = sizeValidFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setImagePreviews((previous) => [
      ...previous,
      ...newPreviews,
    ]);

    event.target.value = "";
  };

  const removeExistingImage = (index: number) => {
    setExistingImageURLs((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  const removeNewImage = (index: number) => {
    setImages((previous) =>
      previous.filter((_, i) => i !== index)
    );

    setImagePreviews((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  // ==============================
  // UPLOAD FILE HELPER
  // ==============================

  const uploadFileToStorage = async (
    file: File,
    userId: string,
    folder: string
  ) => {
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}-${file.name}`;

    const storageRef = ref(
      storage,
      `${folder}/${userId}/${fileName}`
    );

    await uploadBytes(storageRef, file);

    const downloadURL =
      await getDownloadURL(storageRef);

    return downloadURL;
  };

  // ==============================
  // PUBLISH / UPDATE CAMPAIGN
  // ==============================

  const handlePublish = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Please log in first.");
        router.push("/login");
        return;
      }

      if (!title.trim()) {
        alert("Please enter a title.");
        return;
      }

      if (existingImageURLs.length + images.length === 0) {
        alert("Please upload at least one photo.");
        return;
      }

      if (!description.trim()) {
        alert("Please enter a description.");
        return;
      }

      const goal = Number(goalAmount);

      if (!goalAmount || isNaN(goal) || goal <= 0) {
        alert("Please enter a valid fundraising goal.");
        return;
      }

      setIsPublishing(true);

      setUploadProgress(
        "Uploading medical support photos..."
      );

      const newlyUploadedURLs: string[] = [];

      for (let i = 0; i < images.length; i++) {
        setUploadProgress(
          `Uploading photo ${i + 1} of ${images.length}...`
        );

        const url = await uploadFileToStorage(
          images[i],
          user.uid,
          "medical-support"
        );

        newlyUploadedURLs.push(url);
      }

      const finalImages = [...existingImageURLs, ...newlyUploadedURLs];

      let productFileUrl = existingProductFileUrl;
      if (productFile) {
        setUploadProgress("Uploading reward product file...");
        productFileUrl = await uploadFileToStorage(
          productFile,
          user.uid,
          "medical-support-products"
        );
      }

      const campaignData = {
        userId: user.uid,
        title: title.trim(),
        description: description.trim(),
        images: finalImages,
        goalAmount: goal,
        productTitle: productTitle.trim(),
        productFileUrl: productFileUrl,
        updatedAt: serverTimestamp(),
      };

      if (campaignId) {
        setUploadProgress("Updating your medical support campaign...");

        const campaignRef = doc(db, "medicalSupport", campaignId);
        await updateDoc(campaignRef, campaignData);

        alert("Medical Support updated successfully!");
      } else {
        setUploadProgress("Creating your medical support campaign...");

        const docRef = await addDoc(
          collection(db, "medicalSupport"),
          {
            ...campaignData,
            raisedAmount: 0,
            currency: "CAD",
            donors: 0,
            status: "published",
            createdAt: serverTimestamp(),
          }
        );

        setCampaignId(docRef.id);
        alert("Medical Support published successfully!");
      }

      setImages([]);
      setImagePreviews([]);
      setProductFile(null);
      setUploadProgress("");
      setIsEditing(false);

      router.push("/dashboard/products/medical-support");
    } catch (error) {
      console.error(
        "Medical support publish error:",
        error
      );

      alert(
        "Something went wrong while saving your campaign. Please try again."
      );

      setUploadProgress("");
    } finally {
      setIsPublishing(false);
    }
  };

  // ==============================
  // DELETE CAMPAIGN
  // ==============================

  const handleDelete = async () => {
    if (!campaignId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this medical support campaign?"
    );

    if (!confirmed) return;

    try {
      setIsPublishing(true);
      setUploadProgress("Deleting campaign...");

      await deleteDoc(doc(db, "medicalSupport", campaignId));

      alert("Campaign deleted successfully.");
      setCampaignId(null);
      setTitle("");
      setDescription("");
      setGoalAmount("");
      setExistingImageURLs([]);
      setImages([]);
      setImagePreviews([]);
      setProductTitle("");
      setExistingProductFileUrl("");
      setProductFile(null);
      setIsEditing(false);
      setUploadProgress("");
    } catch (error) {
      console.error("Error deleting campaign:", error);
      alert("Failed to delete campaign. Please try again.");
      setUploadProgress("");
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p style={{ fontSize: "16px", color: "#666" }}>Loading...</p>
      </div>
    );
  }

  // Fields are editable if it's a new campaign OR if the user clicked "Edit"
  const canEdit = !campaignId || isEditing;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f7f7",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "850px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: 700,
                marginBottom: "10px",
                color: "#111",
              }}
            >
              {campaignId ? "Medical Support Campaign" : "Create Medical Support"}
            </h1>

            <p
              style={{
                fontSize: "16px",
                color: "#666",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {campaignId
                ? "View or update your existing medical support campaign."
                : "Create a medical support campaign and share your story."}
            </p>
          </div>

          {campaignId && !isEditing && (
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid #D4AF37",
                  background: "white",
                  color: "#b08d25",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid #d9534f",
                  background: "white",
                  color: "#d9534f",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* MAIN CARD */}
        <div
          style={{
            background: "white",
            borderRadius: "18px",
            padding: "30px",
            boxShadow: "0 5px 25px rgba(0,0,0,0.08)",
          }}
        >
          {/* TITLE */}
          <div style={{ marginBottom: "25px" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
                color: "#222",
              }}
            >
              Medical Support Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Example: Help My Father Get Medical Treatment"
              disabled={!canEdit || isPublishing}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box",
                background: canEdit ? "white" : "#f9f9f9",
              }}
            />
          </div>

          {/* PHOTOS */}
          <div style={{ marginBottom: "25px" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
                color: "#222",
              }}
            >
              Medical Support Photos
            </label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "15px",
              }}
            >
              {existingImageURLs.map((url, index) => (
                <div
                  key={url}
                  style={{
                    position: "relative",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "1px solid #ddd",
                    background: "#fafafa",
                  }}
                >
                  <img
                    src={url}
                    alt={`Existing ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      disabled={isPublishing}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(0,0,0,0.7)",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "16px",
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              {imagePreviews.map((preview, index) => (
                <div
                  key={preview}
                  style={{
                    position: "relative",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "1px solid #ddd",
                    background: "#fafafa",
                  }}
                >
                  <img
                    src={preview}
                    alt={`New ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      disabled={isPublishing}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(0,0,0,0.7)",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "16px",
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              {canEdit && existingImageURLs.length + images.length < 3 && (
                <label
                  style={{
                    minHeight: "180px",
                    border: "2px dashed #ccc",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    background: "#fafafa",
                  }}
                >
                  <span style={{ fontSize: "38px", marginBottom: "8px" }}>📷</span>
                  <span style={{ fontWeight: 600, color: "#555" }}>Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={isPublishing}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div style={{ marginBottom: "25px" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
                color: "#222",
              }}
            >
              Your Story / Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell people about the medical situation..."
              disabled={!canEdit || isPublishing}
              rows={8}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                fontSize: "16px",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
                lineHeight: 1.6,
                background: canEdit ? "white" : "#f9f9f9",
              }}
            />
          </div>

          {/* FUNDRAISING GOAL */}
          <div style={{ marginBottom: "25px" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
                color: "#222",
              }}
            >
              How much do you need?
            </label>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #ddd",
                borderRadius: "10px",
                overflow: "hidden",
                background: canEdit ? "white" : "#f9f9f9",
              }}
            >
              <span
                style={{
                  paddingLeft: "14px",
                  fontWeight: 600,
                  color: "#555",
                }}
              >
                CA$
              </span>

              <input
                type="number"
                min="1"
                step="0.01"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                placeholder="10000"
                disabled={!canEdit || isPublishing}
                style={{
                  flex: 1,
                  padding: "14px 10px",
                  border: "none",
                  outline: "none",
                  fontSize: "18px",
                  background: "transparent",
                }}
              />
            </div>
          </div>

          {/* REWARD PRODUCT FOR SUPPORTERS */}
          <div
            style={{
              background: "#fafafa",
              border: "1px solid #eaeaea",
              borderRadius: "14px",
              padding: "20px",
              marginBottom: "25px",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: "8px",
                color: "#111",
              }}
            >
              🎁 Reward Product for Supporters
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#666",
                marginBottom: "20px",
              }}
            >
              Optionally attach a digital product or file that supporters receive when they donate.
            </p>

            {/* Product Title */}
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  marginBottom: "8px",
                  color: "#222",
                  fontSize: "14px",
                }}
              >
                Product Title
              </label>

              <input
                type="text"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                placeholder="Example: Exclusive Thank-You Digital Guide"
                disabled={!canEdit || isPublishing}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                  background: canEdit ? "white" : "#f9f9f9",
                }}
              />
            </div>

            {/* Choose Product File */}
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  marginBottom: "8px",
                  color: "#222",
                  fontSize: "14px",
                }}
              >
                Product File
              </label>

              {existingProductFileUrl && !productFile && (
                <div style={{ marginBottom: "10px", fontSize: "14px" }}>
                  <a href={existingProductFileUrl} target="_blank" rel="noreferrer" style={{ color: "#D4AF37", fontWeight: 600 }}>
                    📄 View Current Product File
                  </a>
                </div>
              )}

              {canEdit && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <label
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px dashed #ccc",
                      background: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: isPublishing ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      color: productFile ? "#111" : "#777",
                    }}
                  >
                    <span>
                      {productFile ? productFile.name : "Choose a new file to upload..."}
                    </span>
                    <span
                      style={{
                        background: "#eee",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#333",
                      }}
                    >
                      Browse
                    </span>
                    <input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setProductFile(e.target.files[0]);
                        }
                      }}
                      disabled={isPublishing}
                      style={{ display: "none" }}
                    />
                  </label>

                  {productFile && (
                    <button
                      type="button"
                      onClick={() => setProductFile(null)}
                      disabled={isPublishing}
                      style={{
                        padding: "12px 15px",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        background: "white",
                        color: "#d9534f",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* STATUS */}
          {uploadProgress && (
            <div
              style={{
                marginBottom: "20px",
                textAlign: "center",
                color: "#555",
                fontSize: "14px",
              }}
            >
              {uploadProgress}
            </div>
          )}

          {/* PUBLISH / UPDATE BUTTON */}
          {canEdit && (
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "10px",
                border: "none",
                background: isPublishing ? "#aaa" : "#D4AF37",
                color: "#111",
                fontSize: "17px",
                fontWeight: 700,
                cursor: isPublishing ? "not-allowed" : "pointer",
              }}
            >
              {isPublishing
                ? "Saving..."
                : campaignId
                ? "Update Medical Support"
                : "Publish Medical Support"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}