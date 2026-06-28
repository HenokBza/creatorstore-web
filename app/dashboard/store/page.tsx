"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  addDoc
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function StorePage() {

const router = useRouter();

const [products,setProducts]=
useState<any[]>([]);

useEffect(()=>{

loadProducts();

},[]);


const loadProducts=async()=>{

const user=
auth.currentUser;

if(!user) return;

const q=query(
collection(db,"products"),
where(
"userId",
"==",
user.uid
)
);

const snapshot=
await getDocs(q);

const items=
snapshot.docs.map((doc)=>({

id:doc.id,
...doc.data()

}));

setProducts(items);

};


const handleEdit=(product:any)=>{

localStorage.setItem(
"editingProductId",
product.id
);

localStorage.setItem(
"productTitle",
product.title
);

localStorage.setItem(
"productThumbnail",
product.thumbnail
);

localStorage.setItem(
"productDescription",
product.description
);

localStorage.setItem(
"productPrice",
product.price
);

localStorage.setItem(
"productButtonText",
product.buttonText
);

localStorage.setItem(
"benefit1",
product.benefits?.[0] || ""
);

localStorage.setItem(
"benefit2",
product.benefits?.[1] || ""
);

localStorage.setItem(
"benefit3",
product.benefits?.[2] || ""
);

router.push(
"/dashboard/products/checkout"
);

};


const handlePreview=(product:any)=>{

router.push(
`/preview/${product.id}`
);

};


const handleDuplicate=
async(product:any)=>{

const copy={

...product,
isDuplicate:true,
createdAt:new Date()

};

delete copy.id;

await addDoc(
collection(
db,
"products"
),
copy
);

loadProducts();

alert(
"Product duplicated 🚀"
);

};


const handleDelete=
async(id:string)=>{

const confirmDelete=
confirm(
"Delete this product?"
);

if(
!confirmDelete
)
return;

await deleteDoc(
doc(
db,
"products",
id
)
);

loadProducts();

};


return(

<div>

<h1
style={{
marginBottom:"25px"
}}
>
🏪 My Store
</h1>


<div
style={{
display:"flex",
flexDirection:"column",
gap:"15px"
}}
>

{products.map(
(product)=>(
<div
key={product.id}
style={{
background:"white",
padding:"15px",
borderRadius:"15px",
display:"flex",
justifyContent:"space-between",
alignItems:"center",
boxShadow:
"0 4px 15px rgba(0,0,0,.08)"
}}
>

{/* LEFT */}

<div
style={{
display:"flex",
alignItems:"center",
gap:"15px"
}}
>

<button
onClick={()=>
handleEdit(
product
)
}
style={{
border:"none",
background:"transparent",
fontSize:"22px",
cursor:"pointer"
}}
>
✏️
</button>


<img
src={
product.thumbnail ||
"/product-placeholder.png"
}
alt="product"
style={{
width:"70px",
height:"70px",
borderRadius:"10px",
objectFit:"cover"
}}
/>


<div>

<h3
style={{
marginBottom:"5px"
}}
>
{product.title}
</h3>

<p
style={{
color:"#777"
}}
>
CA$
{product.price}
</p>

</div>

</div>


{/* RIGHT */}

<div
style={{
display:"flex",
gap:"10px"
}}
>

<button
onClick={()=>
handlePreview(product)
}
style={{
padding:"10px 15px",
borderRadius:"10px",
border:"none",
cursor:"pointer",
background:"#f2f2f2"
}}
>
👀 Preview
</button>

<button
onClick={()=>
handleDuplicate(
product
)
}
style={{
padding:"10px 15px",
borderRadius:"10px",
border:"none",
cursor:"pointer",
background:"#D4AF37"
}}
>
📋 Duplicate
</button>

<button
onClick={()=>
handleDelete(
product.id
)
}
style={{
padding:"10px 15px",
borderRadius:"10px",
border:"none",
cursor:"pointer",
background:"#ff4d4d",
color:"white"
}}
>
🗑
</button>

</div>

</div>
))
}

</div>

</div>

);

}