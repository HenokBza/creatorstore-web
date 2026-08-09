"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

export default function PaymentsPage() {

const [loading, setLoading] = useState(true);

const [currency, setCurrency] = useState("CAD");

const [stripeEmail, setStripeEmail] = useState("");
const [paypalEmail, setPaypalEmail] = useState("");
const [telebirrPhone, setTelebirrPhone] = useState("");

const [stripeConnected, setStripeConnected] = useState(false);
const [paypalConnected, setPaypalConnected] = useState(false);
const [telebirrConnected, setTelebirrConnected] = useState(false);

useEffect(() => {
  loadPayments();
}, []);
const loadPayments = async () => {

  try {

    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    const snap = await getDoc(
      doc(db, "users", user.uid)
    );

    if (snap.exists()) {

      const data = snap.data();

      setStripeEmail(data.stripeEmail || "");
      setPaypalEmail(data.paypalEmail || "");
      setTelebirrPhone(data.telebirrPhone || "");

      setStripeConnected(
        data.stripeConnected || false
      );

      setPaypalConnected(
        data.paypalConnected || false
      );

      setTelebirrConnected(
        data.telebirrConnected || false
      );

      setCurrency(
        data.currency || "CAD"
      );

    }

  } catch (error) {

    console.log(error);

  }

  setLoading(false);

};

const savePayments = async () => {

  try {

    const user = auth.currentUser;

    if (!user) {

      alert("Please login");

      return;

    }

    await setDoc(

      doc(db, "users", user.uid),

      {

        stripeEmail,
        paypalEmail,
        telebirrPhone,

        stripeConnected:
          stripeEmail.trim() !== "",

        paypalConnected:
          paypalEmail.trim() !== "",

        telebirrConnected:
          telebirrPhone.trim() !== "",

        currency,

      },

      {
        merge: true,
      }

    );

    setStripeConnected(
      stripeEmail.trim() !== ""
    );

    setPaypalConnected(
      paypalEmail.trim() !== ""
    );

    setTelebirrConnected(
      telebirrPhone.trim() !== ""
    );

    alert("Payment settings updated ✅");

  } catch (error) {

    console.log(error);

    alert("Failed to save.");

  }

};


const createStripe=()=>{

window.open(
"https://dashboard.stripe.com/register",
"_blank"
);

};

const createPaypal=()=>{

window.open(
"https://www.paypal.com/signup",
"_blank"
);

};

const createTelebirr=()=>{

window.open(
"https://telebirr.ethiotelecom.et/",
"_blank"
);

};


if(loading){

return(
<h2>
Loading...
</h2>
);

}

return(

<div
style={{
padding:"30px",
maxWidth:"900px",
margin:"auto"
}}
>

<h1
style={{
marginBottom:"25px"
}}
>
💳 Payment Methods
</h1>

<div
style={{
display:"flex",
flexDirection:"column",
gap:"25px"
}}
>

{/* STRIPE */}

<div
style={{
background:"white",
padding:"30px",
borderRadius:"20px",
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

<div
style={{
display:"flex",
alignItems:"center",
gap:"15px"
}}
>

<img
src="https://cdn-icons-png.flaticon.com/512/5968/5968382.png"
style={{
width:"45px"
}}
/>

<div>

<h2
style={{
margin:0
}}
>
Stripe
</h2>

<p
style={{
margin:0,
color:"#777"
}}
>

Receive payouts directly into your Stripe account.

</p>

</div>

</div>

<div
style={{
padding:"8px 16px",
borderRadius:"50px",
background:
stripeConnected
?
"#dcfce7"
:
"#fee2e2",

color:
stripeConnected
?
"#166534"
:
"#991b1b",

fontWeight:"bold",
fontSize:"13px"
}}
>

{
stripeConnected
?
"Connected"
:
"Not Connected"
}

</div>

</div>

<input
placeholder="Stripe Email"
value={stripeEmail}
onChange={(e)=>
setStripeEmail(
e.target.value
)
}
style={{
width:"100%",
padding:"15px",
marginTop:"25px",
borderRadius:"10px",
border:"1px solid #ddd"
}}
/>

<div
style={{
display:"flex",
gap:"15px",
marginTop:"20px"
}}
>

<button
onClick={savePayments}
className="interactive-btn"
style={{
flex:1,
padding:"14px",
background:"#635BFF",
color:"white",
border:"none",
borderRadius:"10px",
cursor:"pointer",
fontWeight:"bold"
}}
>

Save Stripe

</button>

<button
onClick={()=>
window.open(
"https://dashboard.stripe.com/register",
"_blank"
)
}
className="interactive-btn"
style={{
flex:1,
padding:"14px",
background:"#f4f4f4",
border:"1px solid #ddd",
borderRadius:"10px",
cursor:"pointer",
fontWeight:"bold"
}}
>

Create Account

</button>

</div>

</div>


{/* PAYPAL */}

<div
style={{
background:"white",
padding:"30px",
borderRadius:"20px",
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

<div
style={{
display:"flex",
alignItems:"center",
gap:"15px"
}}
>

<img
src="https://cdn-icons-png.flaticon.com/512/174/174861.png"
style={{
width:"45px"
}}
/>

<div>

<h2 style={{margin:0}}>
PayPal
</h2>

<p
style={{
margin:0,
color:"#777"
}}
>

Receive payouts into your PayPal account.

</p>

</div>

</div>

<div
style={{
padding:"8px 16px",
borderRadius:"50px",
background:
paypalConnected
?
"#dcfce7"
:
"#fee2e2",

color:
paypalConnected
?
"#166534"
:
"#991b1b",

fontWeight:"bold",
fontSize:"13px"
}}
>

{
paypalConnected
?
"Connected"
:
"Not Connected"
}

</div>

</div>

<input
placeholder="PayPal Email"
value={paypalEmail}
onChange={(e)=>
setPaypalEmail(
e.target.value
)
}
style={{
width:"100%",
padding:"15px",
marginTop:"25px",
borderRadius:"10px",
border:"1px solid #ddd"
}}
/>

<div
style={{
display:"flex",
gap:"15px",
marginTop:"20px"
}}
>

<button
onClick={savePayments}
className="interactive-btn"
style={{
flex:1,
padding:"14px",
background:"#0070BA",
color:"white",
border:"none",
borderRadius:"10px",
cursor:"pointer",
fontWeight:"bold"
}}
>

Save PayPal

</button>

<button
onClick={()=>
window.open(
"https://www.paypal.com/signup",
"_blank"
)
}
className="interactive-btn"
style={{
flex:1,
padding:"14px",
background:"#f4f4f4",
border:"1px solid #ddd",
borderRadius:"10px",
cursor:"pointer",
fontWeight:"bold"
}}
>

Create Account

</button>

</div>

</div>



{/* TELEBIRR */}
<div
style={{
background:"white",
padding:"30px",
borderRadius:"20px",
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

<div
style={{
display:"flex",
alignItems:"center",
gap:"15px"
}}
>

<div
style={{
width:"45px",
height:"45px",
background:"#00A651",
borderRadius:"50%",
display:"flex",
justifyContent:"center",
alignItems:"center",
fontWeight:"bold",
color:"white",
fontSize:"18px"
}}
>

T

</div>

<div>

<h2 style={{margin:0}}>
Telebirr
</h2>

<p
style={{
margin:0,
color:"#777"
}}
>

Receive payouts into your Telebirr wallet.

</p>

</div>

</div>

<div
style={{
padding:"8px 16px",
borderRadius:"50px",
background:
telebirrConnected
?
"#dcfce7"
:
"#fee2e2",

color:
telebirrConnected
?
"#166534"
:
"#991b1b",

fontWeight:"bold",
fontSize:"13px"
}}
>

{
telebirrConnected
?
"Connected"
:
"Not Connected"
}

</div>

</div>

<input
placeholder="Telebirr Phone Number"
value={telebirrPhone}
onChange={(e)=>
setTelebirrPhone(
e.target.value
)
}
style={{
width:"100%",
padding:"15px",
marginTop:"25px",
borderRadius:"10px",
border:"1px solid #ddd"
}}
/>

<div
style={{
display:"flex",
gap:"15px",
marginTop:"20px"
}}
>

<button
onClick={savePayments}
className="interactive-btn"
style={{
flex:1,
padding:"14px",
background:"#00A651",
color:"white",
border:"none",
borderRadius:"10px",
cursor:"pointer",
fontWeight:"bold"
}}
>

Save Telebirr

</button>

<button
onClick={()=>
window.open(
"https://telebirr.ethiotelecom.et/",
"_blank"
)
}
style={{
flex:1,
padding:"14px",
background:"#f4f4f4",
border:"1px solid #ddd",
borderRadius:"10px",
cursor:"pointer",
fontWeight:"bold"
}}
>

Create Account

</button>

</div>

</div>


{/* CURRENCY */}

<div
style={{
background:"white",
padding:"25px",
borderRadius:"20px",
boxShadow:
"0 5px 20px rgba(0,0,0,.08)"
}}
>

<h2>
🌍 Currency
</h2>

<select
value={currency}
onChange={(e)=>
setCurrency(
e.target.value
)
}
style={{
width:"50%",
padding:"14px",
borderRadius:"10px"
}}
>

<option>CAD</option>
<option>USD</option>
<option>EUR</option>
<option>ETB</option>

</select>

</div>


<button
onClick={savePayments}
className="interactive-btn"
style={{
width:"100%",
padding:"18px",
background:"#D4AF37",
border:"none",
borderRadius:"15px",
fontWeight:"bold",
fontSize:"16px",
cursor:"pointer"
}}
>
Save Payment Settings
</button>

</div>



</div>
);
}