"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DigitalProductPage() {

const router = useRouter();

const [title,setTitle]=
useState("");

const [thumbnail,setThumbnail]=
useState(
"/product-placeholder.png"
);

const handleImage=(

e:React.ChangeEvent<HTMLInputElement>

)=>{

const file=
e.target.files?.[0];

if(!file) return;

const reader=
new FileReader();

reader.onload=(event)=>{

const imageData=
event.target?.result as string;

if(!imageData) return;

/* update preview */

setThumbnail(
imageData
);

/* save image */

localStorage.setItem(
"productThumbnail",
imageData
);

};

reader.readAsDataURL(
file
);

};

const handleNext=()=>{

if(!title){

alert(
"Please enter product title"
);

return;

}

/* save title */

localStorage.setItem(
"productTitle",
title
);

router.push(
"/dashboard/products/checkout"
);

};

return(

<div
style={{
display:"flex",
gap:"30px",
padding:"30px"
}}
>

{/* LEFT */}

<div
style={{
flex:2,
background:"white",
padding:"30px",
borderRadius:"20px",
boxShadow:
"0px 4px 20px rgba(0,0,0,.08)"
}}
>

<h1>
📦 Create Product
</h1>

<p
style={{
color:"#777",
marginBottom:"30px"
}}
>
Add your product basics
</p>

<div
style={{
display:"flex",
flexDirection:"column",
gap:"30px"
}}
>

<div>

<h3>
✍ Product Title
</h3>

<input
value={title}
onChange={(e)=>
setTitle(
e.target.value
)
}
placeholder="My Ultimate Guide"
style={{
width:"100%",
padding:"15px",
borderRadius:"12px",
border:"1px solid #ddd",
marginTop:"10px"
}}
/>

</div>


<div>

<h3>
🖼 Upload Thumbnail
</h3>

<div
style={{
border:
"2px dashed #D4AF37",
padding:"30px",
borderRadius:"15px",
textAlign:"center"
}}
>

<input
type="file"
accept="image/*"
onChange={
handleImage
}
/>

</div>

</div>


<button
onClick={handleNext}
style={{
background:"#D4AF37",
border:"none",
padding:"18px",
borderRadius:"15px",
fontWeight:"bold",
fontSize:"17px",
cursor:"pointer"
}}
>
Next → Customize Checkout
</button>

</div>

</div>


{/* RIGHT SIDE */}

<div
style={{
flex:1,
background:"white",
padding:"25px",
borderRadius:"20px",
height:"fit-content",
boxShadow:
"0px 4px 20px rgba(0,0,0,.08)"
}}
>

<h2>
👀 Live Preview
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
src={thumbnail}
alt="thumbnail"
style={{
width:"100%",
height:"220px",
objectFit:"cover",
borderRadius:"15px"
}}
/>

<h2
style={{
marginTop:"20px"
}}
>
{title ||
"My Product Title"}
</h2>

<p
style={{
color:"#777"
}}
>
Your product preview will appear here
</p>

<button
style={{
width:"100%",
marginTop:"20px",
background:"#111",
color:"white",
padding:"15px",
border:"none",
borderRadius:"10px"
}}
>
Purchase
</button>

</div>

</div>

</div>

);

}