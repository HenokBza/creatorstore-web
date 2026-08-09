"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";

import {
  doc,
  getDoc,
} from "firebase/firestore";

export default function SubscriptionPage() {

const [loading,setLoading]=useState(true);

const [status,setStatus]=useState("inactive");

const [plan,setPlan]=useState("");

const [renewDate,setRenewDate]=useState("");

const [customerId,setCustomerId]=useState("");

useEffect(()=>{

loadSubscription();

},[]);

const loadSubscription=async()=>{

try{

const user=auth.currentUser;

if(!user){

setLoading(false);

return;

}

const snap=await getDoc(
doc(db,"users",user.uid)
);

if(snap.exists()){

const data=snap.data();

setStatus(
data.subscriptionStatus || "inactive"
);

setPlan(
data.subscriptionPlan || ""
);

setCustomerId(
data.stripeCustomerId || ""
);

if(data.subscriptionEnd){

const date=

data.subscriptionEnd.toDate
?

data.subscriptionEnd.toDate()

:

new Date(data.subscriptionEnd);

setRenewDate(
date.toLocaleDateString()
);

}

}

}
catch(error){

console.log(error);

}

setLoading(false);

};
const subscribeNow = async () => {

  try {

    const user = auth.currentUser;

    if (!user) {
      alert("Please login.");
      return;
    }

    const params = new URLSearchParams(window.location.search);

    const returnTo =
      params.get("returnTo") ||
      "/dashboard/subscription";

    const response = await fetch(
      "/api/create-subscription-session",
      {
        method: "POST",
        headers: {
          "Content-Type":"application/json",
        },
        body: JSON.stringify({

          creatorId: user.uid,

          email: user.email,

          returnTo,

        }),
      }
    );

    const data = await response.json();

    if (!data.url) {

      alert(data.error);

      return;

    }

    window.location.href = data.url;

  } catch(error){

    console.log(error);

    alert("Unable to create subscription.");
  }};



const manageSubscription = async () => {

  try {

    const user = auth.currentUser;

    if (!user) {
      alert("Please login.");
      return;
    }

    const response = await fetch(
      "/api/subscription/manage",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user.uid,
        }),
      }
    );

    const data = await response.json();

    if (data.url) {

      window.location.href = data.url;

    } else {

      alert(data.error);

    }

  } catch (error) {

    console.log(error);

    alert("Unable to open Stripe Billing Portal.");

  }

};
if(loading){

return(

<div
style={{
padding:"40px",
fontSize:"22px",
fontWeight:"bold"
}}
>
 Loading Subscription...
</div>

);

}

return(

<div
style={{
maxWidth:"900px",
margin:"40px auto",
padding:"20px"
}}
>

<Link href="/dashboard">

← Dashboard

</Link>

<h1
style={{
marginTop:"25px",
fontSize:"36px"
}}
>

🚀 Creator Subscription

</h1>

{
status==="active"

?

(

<div
style={{
marginTop:"35px",
background:"white",
padding:"35px",
borderRadius:"22px",
boxShadow:"0 5px 20px rgba(0,0,0,.08)"
}}
>

<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}}
>

<div>

<h2>

✅ Active

</h2>

<p
style={{
color:"#666"
}}
>

Your Creator Pro subscription is active.

</p>

</div>

<div
style={{
background:"#DCFCE7",
padding:"10px 18px",
borderRadius:"50px",
fontWeight:"bold",
color:"#15803d"
}}
>

ACTIVE

</div>

</div>

<hr
style={{
margin:"30px 0"
}}
/>

<p>

<b>Plan</b>

</p>

<h2>

{plan}

</h2>

<p
style={{
marginTop:"20px"
}}
>

<b>Next Renewal</b>

</p>

<h2>

{renewDate}

</h2>

<button
onClick={manageSubscription}
className="interactive-btn"
style={{
marginTop:"35px",
width:"100%",
padding:"18px",
background:"#635BFF",
color:"white",
border:"none",
borderRadius:"14px",
fontWeight:"bold",
cursor:"pointer"
}}
>

Manage Subscription

</button>

<button
className="interactive-btn"
style={{
marginTop:"15px",
width:"100%",
padding:"18px",
background:"#ef4444",
color:"white",
border:"none",
borderRadius:"14px",
fontWeight:"bold",
cursor:"pointer"
}}
>

Cancel Subscription

</button>

</div>

)

:

(

<div
style={{
marginTop:"35px",
background:"white",
padding:"35px",
borderRadius:"22px",
boxShadow:"0 5px 20px rgba(0,0,0,.08)"
}}
>
<h2>
Subscription Required

</h2>

<p
style={{
marginTop:"15px",
color:"#666",
lineHeight:"28px"
}}
>

To publish and sell digital products on CreatorStore,

a Creator Pro subscription is required.

</p>

<h1
style={{
marginTop:"35px",
fontSize:"55px"
}}
>

CA$19.99

</h1>

<p>

per month

</p>

<button
onClick={subscribeNow}
className="interactive-btn"
style={{
marginTop:"35px",
width:"100%",
padding:"18px",
background:"#D4AF37",
border:"none",
borderRadius:"14px",
fontWeight:"bold",
cursor:"pointer",
fontSize:"18px"
}}
>

Subscribe Now

</button>

</div>

)

}

</div>

);

}