"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import { auth, db, storage } from "@/lib/firebase";

/*
|--------------------------------------------------------------------------
| PRODUCT TEMPLATE
|--------------------------------------------------------------------------
| Change TEMPLATE_VERSION whenever you change the default product template.
|
| Example:
| v1 -> v2
|
| This automatically prevents old Chrome/Edge localStorage values from
| overriding your new defaults.
|--------------------------------------------------------------------------
*/

const TEMPLATE_VERSION = "v3";

const DEFAULT_PRODUCT = {
  title: "",
  description:
    "This guide will help you achieve your goals and learn practical skills.",
  price: "11.99",
  discountPrice: "",
  buttonText: "Purchase Now",
  benefit1: "",
  benefit2: "",
  benefit3: "",
  thumbnail: "",
};

const STORAGE_KEYS = {
  version: "creatorstore_product_template_version",
  title: "productTitle",
  thumbnail: "productThumbnail",
  description: "productDescription",
  price: "productPrice",
  discountPrice: "productDiscountPrice",
  buttonText: "productButtonText",
  benefit1: "benefit1",
  benefit2: "benefit2",
  benefit3: "benefit3",
  editingProductId: "editingProductId",
};

export default function PublishPage() {
  const router = useRouter();

  const [title, setTitle] = useState(DEFAULT_PRODUCT.title);
  const [productThumbnail, setProductThumbnail] = useState(
    DEFAULT_PRODUCT.thumbnail
  );

  const [thumbnailFile, setThumbnailFile] =
    useState<File | null>(null);

  const [description, setDescription] = useState(
    DEFAULT_PRODUCT.description
  );

  const [price, setPrice] = useState(
    DEFAULT_PRODUCT.price
  );

  const [discountPrice, setDiscountPrice] = useState(
    DEFAULT_PRODUCT.discountPrice
  );

  const [buttonText, setButtonText] = useState(
    DEFAULT_PRODUCT.buttonText
  );

  const [benefit1, setBenefit1] = useState(
    DEFAULT_PRODUCT.benefit1
  );

  const [benefit2, setBenefit2] = useState(
    DEFAULT_PRODUCT.benefit2
  );

  const [benefit3, setBenefit3] = useState(
    DEFAULT_PRODUCT.benefit3
  );

  const [productFile, setProductFile] =
    useState<File | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const [uploadProgress, setUploadProgress] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  /*
  |--------------------------------------------------------------------------
  | LOAD PRODUCT DRAFT
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadProductDraft();
  }, []);

  const clearOldTemplate = () => {
    localStorage.removeItem(STORAGE_KEYS.title);
    localStorage.removeItem(STORAGE_KEYS.thumbnail);
    localStorage.removeItem(STORAGE_KEYS.description);
    localStorage.removeItem(STORAGE_KEYS.price);
    localStorage.removeItem(STORAGE_KEYS.discountPrice);
    localStorage.removeItem(STORAGE_KEYS.buttonText);
    localStorage.removeItem(STORAGE_KEYS.benefit1);
    localStorage.removeItem(STORAGE_KEYS.benefit2);
    localStorage.removeItem(STORAGE_KEYS.benefit3);
  };

  const loadProductDraft = async () => {
    try {
      /*
      |--------------------------------------------------------------------------
      | VERSION CHECK
      |--------------------------------------------------------------------------
      */

      const savedVersion =
        localStorage.getItem(
          STORAGE_KEYS.version
        );

      /*
      | If browser has an old version, remove old draft.
      */

      if (savedVersion !== TEMPLATE_VERSION) {
        clearOldTemplate();

        localStorage.setItem(
          STORAGE_KEYS.version,
          TEMPLATE_VERSION
        );
      }

      /*
      |--------------------------------------------------------------------------
      | LOAD VALUES
      |--------------------------------------------------------------------------
      */

      setTitle(
        localStorage.getItem(
          STORAGE_KEYS.title
        ) || DEFAULT_PRODUCT.title
      );

      setProductThumbnail(
        localStorage.getItem(
          STORAGE_KEYS.thumbnail
        ) || DEFAULT_PRODUCT.thumbnail
      );

      setDescription(
        localStorage.getItem(
          STORAGE_KEYS.description
        ) || DEFAULT_PRODUCT.description
      );

      setPrice(
        localStorage.getItem(
          STORAGE_KEYS.price
        ) || DEFAULT_PRODUCT.price
      );

      setDiscountPrice(
        localStorage.getItem(
          STORAGE_KEYS.discountPrice
        ) || DEFAULT_PRODUCT.discountPrice
      );

      setButtonText(
        localStorage.getItem(
          STORAGE_KEYS.buttonText
        ) || DEFAULT_PRODUCT.buttonText
      );

      setBenefit1(
        localStorage.getItem(
          STORAGE_KEYS.benefit1
        ) || DEFAULT_PRODUCT.benefit1
      );

      setBenefit2(
        localStorage.getItem(
          STORAGE_KEYS.benefit2
        ) || DEFAULT_PRODUCT.benefit2
      );

      setBenefit3(
        localStorage.getItem(
          STORAGE_KEYS.benefit3
        ) || DEFAULT_PRODUCT.benefit3
      );
    } catch (error) {
      console.error(
        "Failed to load product draft:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE DRAFT
  |--------------------------------------------------------------------------
  */

  const saveDraft = () => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.version,
        TEMPLATE_VERSION
      );

      localStorage.setItem(
        STORAGE_KEYS.title,
        title
      );

      localStorage.setItem(
        STORAGE_KEYS.description,
        description
      );

      localStorage.setItem(
        STORAGE_KEYS.price,
        price
      );

      localStorage.setItem(
        STORAGE_KEYS.discountPrice,
        discountPrice
      );

      localStorage.setItem(
        STORAGE_KEYS.buttonText,
        buttonText
      );

      localStorage.setItem(
        STORAGE_KEYS.benefit1,
        benefit1
      );

      localStorage.setItem(
        STORAGE_KEYS.benefit2,
        benefit2
      );

      localStorage.setItem(
        STORAGE_KEYS.benefit3,
        benefit3
      );

      if (productThumbnail) {
        localStorage.setItem(
          STORAGE_KEYS.thumbnail,
          productThumbnail
        );
      }
    } catch (error) {
      console.error(
        "Failed to save product draft:",
        error
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CLEAR DRAFT
  |--------------------------------------------------------------------------
  */

  const clearDraft = () => {
    try {
      Object.values(STORAGE_KEYS).forEach(
        (key) => {
          if (key !== STORAGE_KEYS.version) {
            localStorage.removeItem(key);
          }
        }
      );

      localStorage.setItem(
        STORAGE_KEYS.version,
        TEMPLATE_VERSION
      );
    } catch (error) {
      console.error(
        "Failed to clear draft:",
        error
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | THUMBNAIL
  |--------------------------------------------------------------------------
  */

  const handleThumbnailChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(
        "Thumbnail must be smaller than 5MB."
      );
      return;
    }

    setThumbnailFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setProductThumbnail(previewUrl);
  };

  /*
  |--------------------------------------------------------------------------
  | PRODUCT FILE
  |--------------------------------------------------------------------------
  */

  const handleProductFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    /*
    | Prevent video uploads.
    */

    if (file.type.startsWith("video/")) {
      alert(
        "if this Video more than 5 minutes you'll be charged."
      );
      return;
    }

    setProductFile(file);
  };

  /*
  |--------------------------------------------------------------------------
  | VALIDATION
  |--------------------------------------------------------------------------
  */

  const validateProduct = () => {
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      alert(
        "Please enter a product title."
      );
      return false;
    }

    if (
      cleanTitle.length < 1 ||
      cleanTitle.length > 30
    ) {
      alert(
        "Product title must be between 1 and 30 characters."
      );
      return false;
    }

    const numericPrice =
      Number(price);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0
    ) {
      alert(
        "Please enter a valid product price."
      );
      return false;
    }

    if (discountPrice.trim()) {
      const numericDiscount =
        Number(discountPrice);

      if (
        !Number.isFinite(
          numericDiscount
        ) ||
        numericDiscount <= 0
      ) {
        alert(
          "Please enter a valid discount price."
        );
        return false;
      }

      if (
        numericDiscount >=
        numericPrice
      ) {
        alert(
          "Discount price must be lower than the regular price."
        );
        return false;
      }
    }

    return true;
  };

  /*
  |--------------------------------------------------------------------------
  | PUBLISH PRODUCT
  |--------------------------------------------------------------------------
  */
console.log("STEP 2: About to create product");

console.log("Current auth UID:", auth.currentUser?.uid);
  const publishProduct = async () => {

  if (uploading) return;

  setUploading(true);

  try {
    
      const user =
        auth.currentUser;

      if (!user) {
        alert(
          "Please login first."
        );
        return;
      }

      setUploading(true);
      setUploadProgress(
        "Checking your creator account..."
      );

      /*
      |--------------------------------------------------------------------------
      | GET CREATOR
      |--------------------------------------------------------------------------
      */

      console.log("STEP 1: Reading user document...");

const userSnap = await getDoc(
  doc(db, "users", user.uid)
);

console.log("STEP 1 SUCCESS: User document read");

      if (!userSnap.exists()) {
        alert(
          "Creator account not found."
        );
        setUploading(false);
        return;
      }

      const userData =
        userSnap.data();
console.log("========== CREATOR SUBSCRIPTION ==========");
console.log("UID:", user.uid);
console.log("Country:", userData.country);
console.log("subscriptionStatus:", userData.subscriptionStatus);
console.log("subscriptionPlan:", userData.subscriptionPlan);
console.log("stripeCustomerId:", userData.stripeCustomerId);
console.log("stripeSubscriptionId:", userData.stripeSubscriptionId);
console.log("===========================================");
      /*
      |--------------------------------------------------------------------------
      | PUBLISHING ACCESS
      |--------------------------------------------------------------------------
      |
      | Ethiopia:
      |    Can publish without subscription.
      |
      | Other countries:
      |    Must have active Creator Pro subscription.
      |--------------------------------------------------------------------------
      */

      const country =
        String(
          userData.country || ""
        ).trim();

      const subscriptionStatus =
        String(
          userData.subscriptionStatus ||
            ""
        ).toLowerCase();

      const isEthiopianCreator =
        country.toLowerCase() ===
        "ethiopia";

      const hasActiveSubscription =
        subscriptionStatus ===
        "active";

      if (
        !isEthiopianCreator &&
        !hasActiveSubscription
      ) {
        setUploading(false);

        alert(
          "A Creator Pro subscription is required before publishing your product."
        );

        router.push(
          "/dashboard/subscription?returnTo=/dashboard/products/publish"
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | THUMBNAIL UPLOAD
      |--------------------------------------------------------------------------
      */

      let thumbnailUrl =
        productThumbnail || "";

      if (thumbnailFile) {
        setUploadProgress(
          "Uploading thumbnail..."
        );

        const safeFileName =
          thumbnailFile.name.replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
          );

        const thumbnailRef =
          ref(
            storage,
            `thumbnails/${user.uid}/${Date.now()}-${safeFileName}`
          );

        await uploadBytes(
          thumbnailRef,
          thumbnailFile
        );

        thumbnailUrl =
          await getDownloadURL(
            thumbnailRef
          );
      }

      /*
      |--------------------------------------------------------------------------
      | PRODUCT FILE UPLOAD
      |--------------------------------------------------------------------------
      */

      let fileUrl = "";
      let fileName = "";
      let fileType = "";
      let fileSize = 0;

      if (productFile) {
        setUploadProgress(
          "Uploading product..."
        );

        const safeFileName =
          productFile.name.replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
          );

        const storageRef =
          ref(
            storage,
            `products/${user.uid}/${Date.now()}-${safeFileName}`
          );

        await uploadBytes(
          storageRef,
          productFile
        );

        fileUrl =
          await getDownloadURL(
            storageRef
          );

        fileName =
          productFile.name;

        fileType =
          productFile.type;

        fileSize =
          productFile.size;

        setUploadProgress(
          "Product upload complete ✅"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | PRODUCT DATA
      |--------------------------------------------------------------------------
      */

      const productData = {
        userId: user.uid,

        title:
          title.trim() ||
          "Untitled Product",

        thumbnail:
          thumbnailUrl ||
          "/product-placeholder.png",

        description:
          description.trim(),

        price:
          Number(price),

        discountPrice:
          discountPrice.trim()
            ? Number(discountPrice)
            : null,

        buttonText:
          buttonText.trim() ||
          "Purchase Now",

        benefits: [
          benefit1.trim(),
          benefit2.trim(),
          benefit3.trim(),
        ],

        fileUrl,
        fileName,
        fileType,
        fileSize,
      };

      /*
      |--------------------------------------------------------------------------
      | EDIT OR CREATE
      |--------------------------------------------------------------------------
      */

     const editingProductId =
  localStorage.getItem("editingProductId");

console.log("========== PRODUCT MODE ==========");
console.log("editingProductId:", editingProductId);
console.log("current UID:", user.uid);
console.log("==================================");

if (editingProductId) {

  console.log("EDIT MODE");

  const existingProductSnap = await getDoc(
    doc(db, "products", editingProductId)
  );

  if (!existingProductSnap.exists()) {

    console.log(
      "Old editingProductId does not exist. Creating new product."
    );

    localStorage.removeItem("editingProductId");

    await addDoc(
      collection(db, "products"),
      {
        ...productData,
        isActive: true,
        revenue: 0,
        customers: 0,
        visits: 0,
        createdAt: new Date(),
      }
    );

  } else {

    const existingProduct =
      existingProductSnap.data();

    // Make sure this product belongs to the logged-in creator
    if (existingProduct.userId !== user.uid) {

      console.error(
        "Product ownership mismatch.",
        {
          existingOwner: existingProduct.userId,
          currentUser: user.uid,
        }
      );

      alert(
        "This product belongs to another creator. A new product will be created instead."
      );

      localStorage.removeItem("editingProductId");

      await addDoc(
        collection(db, "products"),
        {
          ...productData,
          isActive: true,
          revenue: 0,
          customers: 0,
          visits: 0,
          createdAt: new Date(),
        }
      );

    } else {

      await updateDoc(
        doc(db, "products", editingProductId),
        productData
      );

      alert("Product updated successfully 🚀");

      localStorage.removeItem(
        "editingProductId"
      );
    }
  }

} else {

  console.log("CREATE MODE");

  await addDoc(
    collection(db, "products"),
    {
      ...productData,
      isActive: true,
      revenue: 0,
      customers: 0,
      visits: 0,
      createdAt: new Date(),
    }
  );

  alert("Product published successfully 🚀");
}
      /*
      |--------------------------------------------------------------------------
      | CLEANUP
      |--------------------------------------------------------------------------
      */

      clearDraft();

      setUploading(false);

      setUploadProgress("");

      setProductFile(null);

      setThumbnailFile(null);

      /*
      |--------------------------------------------------------------------------
      | GO TO STORE
      |--------------------------------------------------------------------------
      */

      router.push(
        "/dashboard/store"
      );
    } catch (error: any) {
      console.error(
        "Publish error:",
        error
      );

      setUploading(false);

      setUploadProgress("");

      alert(
        `${error.code || "Error"}\n\n${
          error.message ||
          "Something went wrong."
        }`
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div
        style={{
          padding: "50px",
          textAlign: "center",
        }}
      >
        Loading product editor...
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div
      style={{
        display: "flex",
        gap: "30px",
        padding: "30px",
        maxWidth: "1400px",
        margin: "0 auto",
        alignItems: "flex-start",
      }}
    >
      {/* ========================================================= */}
      {/* LEFT SIDE */}
      {/* ========================================================= */}

      <div
        style={{
          flex: 2,
          background: "white",
          padding: "30px",
          borderRadius: "20px",
          boxShadow:
            "0 5px 20px rgba(0,0,0,.08)",
        }}
      >
        <h1>
          🎨 Add Product, Customize &
          Publish Live
        </h1>

        <p
          style={{
            color: "#666",
            marginBottom: "30px",
          }}
        >
          Build your digital product
          page.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "25px",
          }}
        >
          {/* TITLE */}

          <div>
            <h3>
              Product Title
            </h3>

            <input
              value={title}
              maxLength={30}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              placeholder="Enter product title"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                border:
                  "1px solid #ddd",
                boxSizing:
                  "border-box",
              }}
            />

            <p
              style={{
                fontSize: "13px",
                color: "#777",
                marginTop: "6px",
              }}
            >
              1–30 characters
              only.
              {title.length}/30
            </p>
          </div>

          {/* DESCRIPTION */}

          <div>
            <h3>
              Description
            </h3>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                height: "120px",
                padding: "14px",
                borderRadius: "10px",
                border:
                  "1px solid #ddd",
                boxSizing:
                  "border-box",
                resize: "vertical",
              }}
            />
          </div>

          {/* PRICE */}

          <div
            style={{
              display: "flex",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: "200px",
              }}
            >
              <h3>
                Price (CA$) *
              </h3>

              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) =>
                  setPrice(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "10px",
                  border:
                    "1px solid #ddd",
                  boxSizing:
                    "border-box",
                }}
              />
            </div>

            <div
              style={{
                flex: 1,
                minWidth: "200px",
              }}
            >
              <h3>
                Discount Price (CA$)
              </h3>

              <input
                type="number"
                min="0"
                step="0.01"
                value={discountPrice}
                placeholder="Optional"
                onChange={(e) =>
                  setDiscountPrice(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "10px",
                  border:
                    "1px solid #ddd",
                  boxSizing:
                    "border-box",
                }}
              />
            </div>
          </div>

          {/* BUTTON TEXT */}

          <div>
            <h3>
              Button Text
            </h3>

            <input
              value={buttonText}
              onChange={(e) =>
                setButtonText(
                  e.target.value
                )
              }
              placeholder="Purchase Now"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                border:
                  "1px solid #ddd",
                boxSizing:
                  "border-box",
              }}
            />
          </div>

          {/* BENEFITS */}

          <div>
            <h3>
              ✅ Product Benefits
            </h3>

            <input
              value={benefit1}
              onChange={(e) =>
                setBenefit1(
                  e.target.value
                )
              }
              placeholder="Benefit 1"
              style={{
                width: "100%",
                padding: "12px",
                marginBottom:
                  "10px",
                borderRadius: "10px",
                border:
                  "1px solid #ddd",
                boxSizing:
                  "border-box",
              }}
            />

            <input
              value={benefit2}
              onChange={(e) =>
                setBenefit2(
                  e.target.value
                )
              }
              placeholder="Benefit 2"
              style={{
                width: "100%",
                padding: "12px",
                marginBottom:
                  "10px",
                borderRadius: "10px",
                border:
                  "1px solid #ddd",
                boxSizing:
                  "border-box",
              }}
            />

            <input
              value={benefit3}
              onChange={(e) =>
                setBenefit3(
                  e.target.value
                )
              }
              placeholder="Benefit 3"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border:
                  "1px solid #ddd",
                boxSizing:
                  "border-box",
              }}
            />
          </div>

          {/* THUMBNAIL */}

          <div>
            <h3>
              🖼️ Product Thumbnail
            </h3>

            <div
              style={{
                padding: "25px",
                border:
                  "2px dashed #D4AF37",
                borderRadius: "15px",
                textAlign: "center",
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={
                  handleThumbnailChange
                }
              />

              {thumbnailFile && (
                <p
                  style={{
                    marginTop: "10px",
                    color: "#666",
                  }}
                >
                  🖼️{" "}
                  {thumbnailFile.name}
                </p>
              )}
            </div>
          </div>

          {/* PRODUCT FILE */}

          <div>
            <h3>
              📄 Upload Your Product
            </h3>

            <div
              style={{
                padding: "25px",
                border:
                  "2px dashed #D4AF37",
                borderRadius: "15px",
                textAlign: "center",
              }}
            >
              <input
                type="file"
                onChange={
                  handleProductFileChange
                }
              />

              {productFile && (
                <div
                  style={{
                    marginTop:
                      "10px",
                    color: "#666",
                  }}
                >
                  📄{" "}
                  {productFile.name}
                  <br />
                  {(
                    productFile.size /
                    1024 /
                    1024
                  ).toFixed(2)}{" "}
                  MB
                </div>
              )}

              {uploading && (
                <p
                  style={{
                    marginTop:
                      "10px",
                    color:
                      "#D4AF37",
                    fontWeight:
                      "600",
                  }}
                >
                  {uploadProgress}
                </p>
              )}
            </div>
          </div>

          {/* SAVE DRAFT */}

          <button
            type="button"
            onClick={() => {
              saveDraft();
              alert(
                "Product draft saved."
              );
            }}
            style={{
              padding: "14px",
              background:
                "#f1f5f9",
              border:
                "1px solid #cbd5e1",
              borderRadius: "12px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            💾 Save Draft
          </button>

          {/* PUBLISH */}

          <button
  onClick={publishProduct}
  disabled={uploading}
  className="interactive-btn"
  style={{
    background: uploading ? "#aaa" : "#D4AF37",
    padding: "18px",
    border: "none",
    borderRadius: "15px",
    fontWeight: "bold",
    fontSize: "18px",
    cursor: uploading ? "not-allowed" : "pointer",
  }}
>
  {uploading
    ? "⏳ Publishing..."
    : "🚀 Publish Product"}
</button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT SIDE — LIVE PREVIEW */}
      {/* ========================================================= */}

      <div
        style={{
          flex: 1,
          minWidth: "300px",
          maxWidth: "430px",
          background: "white",
          padding: "25px",
          borderRadius: "25px",
          boxShadow:
            "0 5px 20px rgba(0,0,0,.08)",
          height: "fit-content",
          position: "sticky",
          top: "20px",
        }}
      >
        <h2>
          📱 Live Preview
        </h2>

        <div
          style={{
            marginTop: "20px",
            background:
              "#f8f8f8",
            padding: "20px",
            borderRadius:
              "20px",
          }}
        >
          {/* THUMBNAIL */}

          <img
            src={
              productThumbnail ||
              "/product-placeholder.png"
            }
            alt="Product thumbnail"
            style={{
              width: "100%",
              height: "180px",
              objectFit: "cover",
              borderRadius:
                "15px",
            }}
          />

          {/* TITLE */}

          <h2
            style={{
              marginTop:
                "15px",
              wordBreak:
                "break-word",
            }}
          >
            {title ||
              "Your Product Title"}
          </h2>

          {/* DESCRIPTION */}

          <p
            style={{
              color: "#555",
              overflow: "hidden",
              display:
                "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient:
                "vertical",
              lineHeight: "1.5",
              minHeight: "72px",
            }}
          >
            {description ||
              "Your product description will appear here."}
          </p>

          {/* PRICE */}

          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: "10px",
              marginTop:
                "10px",
              flexWrap:
                "wrap",
            }}
          >
            {discountPrice ? (
              <>
                <h1
                  style={{
                    color:
                      "#37b2d4",
                    margin: 0,
                  }}
                >
                  CA$
                  {Number(
                    discountPrice
                  ).toFixed(2)}
                </h1>

                <span
                  style={{
                    textDecoration:
                      "line-through",
                    color:
                      "#888",
                    fontSize:
                      "18px",
                    fontWeight:
                      "bold",
                  }}
                >
                  CA$
                  {Number(
                    price
                  ).toFixed(2)}
                </span>
              </>
            ) : (
              <h1
                style={{
                  color:
                    "#D4AF37",
                  margin: 0,
                }}
              >
                CA$
                {Number(
                  price
                ).toFixed(2)}
              </h1>
            )}
          </div>

          {/* BENEFITS */}

          <div
            style={{
              marginTop:
                "20px",
              display:
                "flex",
              flexDirection:
                "column",
              gap: "10px",
            }}
          >
            {[
              benefit1,
              benefit2,
              benefit3,
            ].map(
              (
                benefit,
                index
              ) => (
                <div
                  key={index}
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "flex-start",
                    gap: "10px",
                    padding:
                      "12px",
                    background:
                      "#fff",
                    borderRadius:
                      "10px",
                    wordBreak:
                      "break-word",
                    overflowWrap:
                      "break-word",
                  }}
                >
                  <span>
                    ✅
                  </span>

                  <span
                    style={{
                      flex: 1,
                    }}
                  >
                    {benefit ||
                      `Product benefit ${
                        index + 1
                      }`}
                  </span>
                </div>
              )
            )}
          </div>

          {/* EMAIL */}

          <input
            placeholder="Enter your email"
            style={{
              width: "100%",
              padding: "12px",
              marginTop:
                "20px",
              borderRadius:
                "10px",
              border:
                "1px solid #ddd",
              boxSizing:
                "border-box",
            }}
          />

          {/* BUTTON */}

          <button
            type="button"
            className="interactive-btn"
            style={{
              marginTop:
                "15px",
              width: "100%",
              padding:
                "15px",
              background:
                "#111",
              color:
                "white",
              border:
                "none",
              borderRadius:
                "10px",
              fontWeight:
                "bold",
            }}
          >
            {buttonText ||
              "Purchase Now"}
          </button>
        </div>
      </div>
    </div>
  );
}