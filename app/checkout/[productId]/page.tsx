"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { db } from "@/lib/firebase";

import {
  doc,
  getDoc,
  updateDoc,
   increment,
} from "firebase/firestore";

interface Product {
  id: string;
  userId: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  buttonText: string;
  benefits: string[];
  isActive?: boolean;
  visits?: number;
  customers?: number;
  revenue?: number;

  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

interface Creator {
  id: string;
  name: string;
  storeName: string;
  profileImage: string;
  email: string;
  currency?: string;
}
export default function CheckoutPage() {

  const params = useParams();

  const productId = params.productId as string;

  const [loading, setLoading] = useState(true);

  const [product, setProduct] =
    useState<Product | null>(null);

  const [creator, setCreator] =
    useState<Creator | null>(null);

  const [email, setEmail] =
    useState("");
  const [isMobile, setIsMobile] = useState(false);

useEffect(() => {

  const handleResize = () => {

    setIsMobile(window.innerWidth < 900);

  };

  handleResize();

  window.addEventListener("resize", handleResize);

  return () =>

    window.removeEventListener(
      "resize",
      handleResize
    );

}, []);  

  useEffect(() => {

    if (!productId) return;

    loadProduct();

  }, [productId]);

  const loadProduct = async () => {

    try {

      const productRef =
        doc(db, "products", productId);

      const productSnap =
        await getDoc(productRef);

      if (!productSnap.exists()) {

        setLoading(false);

        return;

      }

      const productData = {

        id: productSnap.id,

        ...productSnap.data()

      } as Product;
      if (productData.isActive === false) {

  alert(
    "This product is currently unavailable."
  );

  window.location.href = "/";

  return;

}

      setProduct(productData);
    await updateDoc(
  doc(db, "products", productId),
  {
    visits: increment(1),
  }
);  

      const creatorRef =
        doc(db, "users", productData.userId);

      const creatorSnap =
        await getDoc(creatorRef);

      if (creatorSnap.exists()) {

        setCreator({

          id: creatorSnap.id,

          ...creatorSnap.data()

        } as Creator);

      }

    } catch (error) {

      console.log(error);

    }

    setLoading(false);

  };

  if (loading) {

    return (

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 22
        }}
      >
        Loading...
      </div>

    );

  }

  if (!product) {

    return (

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 24
        }}
      >
        Product not found
      </div>

    );

  }
  const buyProduct = async () => {

  if (!email) {
    alert("Enter your email");
    return;
  }

  try {

    const response = await fetch(
      "/api/create-checkout-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product?.id,
          email,
        }),
      }
    );

   const data = await response.json();

console.log(data);

if (!response.ok) {
  throw new Error(data.error || "Checkout failed");
}

    window.location.href = data.url;

  } catch (error) {

    console.error(error);
    alert("Checkout failed");

  }

};

  return (

<div
style={{
  minHeight:"100vh",
  background: "#D4AF37",
  display:"flex",
  justifyContent:"center",
  padding: isMobile
  ? "20px"
  : "40px"
}}
>

<div
style={{
  width:"100%",
  maxWidth:"1200px",
  display:"grid",

  gridTemplateColumns: isMobile
    ? "1fr"
    : "1fr 420px",

  gap: isMobile ? "30px" : "60px",

  alignItems:"start"
}}
>

{/* LEFT */}

<div>

  <img
    src={product.thumbnail || "/product-placeholder.png"}
    alt={product.title}
    style={{
      width: "30%",
     height: isMobile
  ? "100px"
  : "200px",
      objectFit: "cover",
      borderRadius: "24px",
      boxShadow: "0 8px 25px rgba(0,0,0,.08)",
    }}
  />

  <h1
    style={{
      marginTop: "35px",
      fontSize: isMobile
  ? "30px"
  : "42px",
      fontWeight: "bold",
      lineHeight: 1.2,
    }}
  >
    {product.title}
  </h1>

  <p
    style={{
      marginTop: "20px",
      color: "#666",
      fontSize: isMobile
  ? "16px"
  : "18px",
      lineHeight: 1.8,
      maxWidth: "760px",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      overflowWrap: "break-word",
    }}
  >
    {product.description}
  </p>

  <h2
    style={{
      marginTop: "45px",
      marginBottom: "25px",
      fontSize: "28px",
    }}
  >
    What you'll get
  </h2>

  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    }}
  >

    {product.benefits
      ?.filter((item) => item.trim() !== "")
      .map((item, index) => (

        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: isMobile
  ? "15px"
  : "18px 22px",
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 5px 18px rgba(0,0,0,.05)",
          }}
        >

          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: "#D4AF37",
              color: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              flexShrink: 0,
            }}
          >
            ✓
          </div>

          <div
            style={{
              fontSize: "17px",
              color: "#333",
              lineHeight: 1.6,
              wordBreak: "break-word",
            }}
          >
            {item}
          </div>

        </div>

      ))}

  </div>

</div>

{/* RIGHT */}

<div
style={{
background:"white",
borderRadius:"28px",
padding:"35px",
height:"fit-content",
position: isMobile
  ? "relative"
  : "sticky",

top: isMobile
  ? "0"
  : "30px",
boxShadow:"0 10px 35px rgba(0,0,0,.08)"
}}
>

<div
style={{
display:"flex",
alignItems:"center",
gap:"15px"
}}
>

<img
src={
creator?.profileImage ||
"/profile-placeholder.png"
}
alt="creator"
style={{
width:"70px",
height:"70px",
borderRadius:"50%",
objectFit:"cover",
border:"3px solid #D4AF37"
}}
/>

<div>

<div
style={{
fontWeight:"bold",
fontSize:"22px"
}}
>
{creator?.name}
</div>

<div
style={{
color:"#777",
fontSize:"16px"
}}
>
@{creator?.storeName}
</div>

</div>

</div>

<hr
style={{
margin:"30px 0",
border:"none",
borderTop:"1px solid #eee"
}}
/>

<div
style={{
fontSize:"15px",
color:"#777",
marginBottom:"6px"
}}
>
Price
</div>

<div
style={{
fontSize: isMobile
  ? "12px"
  : "22px",
fontWeight:"bold",
color:"#D4AF37",
marginBottom:"25px"
}}
>
CA${product.price}
</div>

<input
type="email"
placeholder="Enter your email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
style={{
width:"100%",
padding:"16px",
borderRadius:"14px",
border:"1px solid #ddd",
fontSize:"16px",
outline:"none",
boxSizing:"border-box"
}}
/>

<button
onClick={buyProduct}

disabled={product.isActive === false}

style={{

marginTop:"20px",

width:"100%",

padding:isMobile
? "16px"
: "18px",

background:
product.isActive === false
? "#999"
: "#D4AF37",

color:"white",

border:"none",

borderRadius:"14px",

fontWeight:"bold",

fontSize:"18px",

cursor:
product.isActive === false
? "not-allowed"
: "pointer",

opacity:
product.isActive === false
? .6
: 1,

transition:"0.25s"

}}
>
{product.isActive === false

? "Unavailable"

: product.buttonText || "Purchase Now"}
</button>

<div
style={{
marginTop:"25px",
padding:"18px",
background:"#fafafa",
borderRadius:"14px",
fontSize:"14px",
color:"#666",
lineHeight:1.7
}}
>
🔒 Secure checkout powered by <strong>CreatorStore</strong>

<br/><br/>

⚡ Instant digital delivery

<br/>

📄 Lifetime access after purchase

<br/>

💳 Visa • Mastercard • Apple Pay • Google Pay
</div>

</div>

</div>
</div>
);

}