"use client";

import {  useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
collection,
addDoc, updateDoc, doc,
} from "firebase/firestore";

import {
auth,
db
} from "@/lib/firebase";
export default function CheckoutPage() {

const router = useRouter();

const [title,setTitle]=
useState(" 1 - 30 letters only");
const [productThumbnail,setProductThumbnail] =
useState("");


const [description,setDescription]=
useState(
"This guide will help you achieve your goals and learn practical skills."
);

const [price,setPrice]=
useState("9.99");

const [buttonText,setButtonText]=
useState("Purchase Now");

const [benefit1,setBenefit1]=
useState("");

const [benefit2,setBenefit2]=
useState("");

const [benefit3,setBenefit3]=
useState("");


useEffect(()=>{

setTitle(
localStorage.getItem(
"productTitle"
) || ""
);

setProductThumbnail(
localStorage.getItem(
"productThumbnail"
) || ""
);

setDescription(
localStorage.getItem(
"productDescription"
) || ""
);

setPrice(
localStorage.getItem(
"productPrice"
) || "9.99"
);

setButtonText(
localStorage.getItem(
"productButtonText"
) || "Purchase Now"
);

setBenefit1(
localStorage.getItem(
"benefit1"
) || ""
);

setBenefit2(
localStorage.getItem(
"benefit2"
) || ""
);

setBenefit3(
localStorage.getItem(
"benefit3"
) || ""
);

},[]);

const publishProduct = async () => {
  try {

    const user = auth.currentUser;

    if (!user) {
      alert("Please login first");
      return;
    }

    const editingProductId =
      localStorage.getItem(
        "editingProductId"
      );

    const productData = {

      userId: user.uid,

      title:
        title || "Untitled Product",

      thumbnail:
        productThumbnail ||
        "/product-placeholder.png",

      description:
        description || "",

      price:
        Number(price) || 0,

      buttonText:
        buttonText || "Purchase",

      benefits: [
        benefit1 || "",
        benefit2 || "",
        benefit3 || "",
      ]

    };

    /* EDIT EXISTING PRODUCT */

    if(editingProductId){

      await updateDoc(

        doc(
          db,
          "products",
          editingProductId
        ),

        productData

      );

      alert(
        "Product updated successfully 🚀"
      );

      localStorage.removeItem(
        "editingProductId"
      );

    }

    /* CREATE NEW PRODUCT */

    else{

      await addDoc(

        collection(
          db,
          "products"
        ),

        {
          ...productData,

          revenue:0,
          customers:0,
          visits:0,

          createdAt:
          new Date()
        }

      );

      alert(
        "Product published successfully 🚀"
      );

    }

    localStorage.removeItem(
      "productTitle"
    );

    localStorage.removeItem(
      "productThumbnail"
    );

    router.push(
      "/dashboard/store"
    );

  }

  catch(error){

    console.log(
      "Publish error:",
      error
    );

    alert(
      "Failed to publish product"
    );

  }
};
return(

<div
style={{
display:"flex",
gap:"30px",
padding:"30px"
}}
>

{/* LEFT SIDE */}

<div
style={{
flex:2,
background:"white",
padding:"30px",
borderRadius:"20px",
boxShadow:
"0 5px 20px rgba(0,0,0,.08)"
}}
>

<h1>
🎨 Add Product, Customize Checkout & Publish to live
</h1>

<p
style={{
color:"#666",
marginBottom:"30px"
}}
>
Build your product page
</p>


<div
style={{
display:"flex",
flexDirection:"column",
gap:"25px"
}}
>

<div>

<h3>
Product Title
</h3>

<input
value={title}
onChange={(e)=>
setTitle(
e.target.value
)
}
style={{
width:"100%",
padding:"14px",
borderRadius:"10px",
border:"1px solid #ddd"
}}
/>

</div>


<div>

<h3>
Description
</h3>

<textarea
value={description}
onChange={(e)=>
setDescription(
e.target.value
)
}
style={{
width:"100%",
height:"100px",
padding:"14px",
borderRadius:"10px",
border:"1px solid #ddd",
boxSizing: "border-box"
}}
/>

</div>


<div>

<h3>
Price
</h3>

<input
value={price}
onChange={(e)=>
setPrice(
e.target.value
)
}
style={{
width:"100%",
padding:"14px",
borderRadius:"10px",
border:"1px solid #ddd"
}}
/>

</div>


<div>

<h3>
Button Text
</h3>

<input
value={buttonText}
onChange={(e)=>
setButtonText(
e.target.value
)
}
style={{
width:"100%",
padding:"14px",
borderRadius:"10px",
border:"1px solid #ddd"
}}
/>

</div>


<div
style={{
marginTop:"25px"
}}
>

<h3>
✅ Product Benefits
</h3>

<input
value={benefit1}
onChange={(e)=>
setBenefit1(
e.target.value
)
}
placeholder="Benefit 1"
style={{
width:"100%",
padding:"12px",
marginBottom:"10px",
borderRadius:"10px",
border:"1px solid #ddd",

}}
/>

<input
value={benefit2}
onChange={(e)=>
setBenefit2(
e.target.value
)
}
placeholder="Benefit 2"
style={{
width:"100%",
padding:"12px",
marginBottom:"10px",
borderRadius:"10px",
border:"1px solid #ddd"
}}
/>

<input
value={benefit3}
onChange={(e)=>
setBenefit3(
e.target.value
)
}
placeholder="Benefit 3"
style={{
width:"100%",
padding:"12px",
borderRadius:"10px",
border:"1px solid #ddd",
boxSizing: "border-box"
}}
/>

</div>


<div>

<h3>
Upload Product File
</h3>

<div
style={{
padding:"25px",
border:
"2px dashed #D4AF37",
borderRadius:"15px",
textAlign:"center"
}}
>

<input
type="file"
/>

</div>

</div>


<button
onClick={publishProduct}
style={{
background:"#D4AF37",
padding:"18px",
border:"none",
borderRadius:"15px",
fontWeight:"bold",
fontSize:"18px",
cursor:"pointer"
}}
>
🚀 Publish Product
</button>

</div>

</div>


{/* RIGHT SIDE */}

<div
style={{
flex:1,
background:"white",
padding:"25px",
borderRadius:"25px",
boxShadow:
"0 5px 20px rgba(0,0,0,.08)",
height:"fit-content",
position:"sticky",
top:"20px"
}}
>

<h2>
📱 Live Preview
</h2>


<div
style={{
marginTop:"20px",
background:"#f8f8f8",
padding:"20px",
borderRadius:"20px"
}}
>
<img
src={
productThumbnail ||
"/product-placeholder.png"
}
alt="thumbnail"
style={{
width:"100%",
height:"180px",
objectFit:"cover",
borderRadius:"15px"
}}
/>


<h2 style={{ marginTop: "15px", wordBreak: "break-word" }}>
  {title}
</h2>
<p style={{ color: "#555", wordBreak: "break-word" }}>
  {description}
</p>


<h1
style={{
color:"#D4AF37"
}}
>
CA${price}
</h1>


<div
style={{
marginTop:"20px",
display:"flex",
flexDirection:"column",
gap:"10px"
}}
>

<div
style={{
display:"flex",
alignItems:"flex-start",
gap:"10px",
padding:"12px",
background:"#fff",
borderRadius:"10px",
wordBreak:"break-word",
overflowWrap:"break-word"
}}
>
<span>✅</span>

<span
style={{
flex:1
}}
>
{benefit1}
</span>

</div>


<div
style={{
display:"flex",
alignItems:"flex-start",
gap:"10px",
padding:"12px",
background:"#fff",
borderRadius:"10px",
wordBreak:"break-word",
overflowWrap:"break-word"
}}
>
<span>✅</span>

<span
style={{
flex:1
}}
>
{benefit2}
</span>

</div>


<div
style={{
display:"flex",
alignItems:"flex-start",
gap:"10px",
padding:"12px",
background:"#fff",
borderRadius:"10px",
wordBreak:"break-word",
overflowWrap:"break-word"
}}
>
<span>✅</span>

<span
style={{
flex:1
}}
>
{benefit3}
</span>

</div>

</div>


<input
placeholder="Enter your email"
style={{
width:"100%",
padding:"12px",
marginTop:"20px",
borderRadius:"10px",
border:"1px solid #ddd"
}}
/>


<button
style={{
marginTop:"15px",
width:"100%",
padding:"15px",
background:"#111",
color:"white",
border:"none",
borderRadius:"10px",
fontWeight:"bold"
}}
>
{buttonText}
</button>

</div>

</div>

</div>

);

}