"use client";

import { useEffect,useState } from "react";
import { useParams } from "next/navigation";
import {
doc,
getDoc
} from "firebase/firestore";

import {
db
} from "@/lib/firebase";

export default function PreviewPage(){

const params=
useParams();

const [product,setProduct]=
useState<any>(null);

useEffect(()=>{

loadProduct();

},[]);

const loadProduct=
async()=>{

const productRef=
doc(
db,
"products",
params.id as string
);

const snapshot=
await getDoc(
productRef
);

if(snapshot.exists()){

setProduct({

id:snapshot.id,
...snapshot.data()

});

}

};

if(!product){

return(
<div>
Loading...
</div>
);

}

return(

<div
style={{
minHeight:"100vh",
background:"#D4AF37",
display:"flex",
justifyContent:"center",
padding:"50px"
}}
>

<div
style={{
width:"450px",
background:"white",
borderRadius:"25px",
overflow:"hidden",
boxShadow:
"0px 5px 25px rgba(0,0,0,.1)"
}}
>

<img
src={
product.thumbnail
}
style={{
width:"40%",
height:"190px",
objectFit:"cover"
}}
/>

<div
style={{
padding:"25px"
}}
>

<h1>
{product.title}
</h1>

<h2
style={{
color:"#9b937b"
}}
>
$
{product.price}
</h2>

<p
style={{
marginTop:"20px",
lineHeight:"1.6",
color:"#374ca9"
}}
>
{product.description}
</p>

<div
style={{
marginTop:"25px",
display:"flex",
flexDirection:"column",
gap:"12px"
}}
>

<div
style={{
marginTop:"20px",
display:"flex",
flexDirection:"column",
gap:"10px"
}}
>

{product?.benefits?.map(

(item:string,index:number)=>(

<div
key={index}
style={{
display:"flex",
gap:"10px",
padding:"12px",
background:"#fff",
borderRadius:"10px",
wordBreak:"break-word",
overflowWrap:"break-word"
}}
>

<span>
✅
</span>

<span
style={{
flex:1
}}
>
{item}
</span>

</div>

)

)}

</div>

</div>

</div>

<input
placeholder="Enter your name"
style={{
width:"100%",
padding:"14px",
marginTop:"25px",
borderRadius:"10px",
border:"1px solid #ddd"
}}
/>

<input
placeholder="Enter your email"
style={{
width:"100%",
padding:"14px",
marginTop:"15px",
borderRadius:"10px",
border:"1px solid #ddd"
}}
/>

<button
style={{
marginTop:"30px",
width:"100%",
background:"#e4c40fbd",
color:"blue",
justifyContent:"center",
padding:"15px",
border:"none",
borderRadius:"12px",
fontWeight:"bold",
cursor:"pointer"
}}
>
{product.buttonText}
</button>

</div>

</div>

);

}