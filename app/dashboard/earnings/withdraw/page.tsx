"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { auth, db } from "@/lib/firebase";

import {
  doc, getDoc, addDoc, collection, serverTimestamp,
  query, where, orderBy, getDocs, updateDoc,
} from "firebase/firestore";

export default function WithdrawPage() {
const [submittedAmount, setSubmittedAmount] = useState(0);
  const [loading,setLoading]=useState(true);

  const [error,setError]=useState("");

  const [step,setStep]=useState(1);

  const [showSuccess,setShowSuccess]=useState(false);

  const [amount,setAmount]=useState("");

  const [balance,setBalance]=useState(0);

  const [pending,setPending]=useState(0);

  const [paid,setPaid]=useState(0);

  const [country,setCountry]=useState("");

  const [currency,setCurrency]=useState("CAD");

  const [selectedMethod,setSelectedMethod]=useState("");

  const [stripeConnected,setStripeConnected]=useState(false);

  const [paypalConnected,setPaypalConnected]=useState(false);

  const [telebirrNumber,setTelebirrNumber]=useState("");

  const [stripeEmail,setStripeEmail]=useState("");

  const [paypalEmail,setPaypalEmail]=useState("");
  const [history, setHistory] = useState<any[]>([]);

  useEffect(()=>{

    loadCreator();

  },[]);

  const loadCreator=async()=>{

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

        setCountry(data.country || "");

        setCurrency(data.currency || "CAD");

        setStripeEmail(data.stripeEmail || "");

        setPaypalEmail(data.paypalEmail || "");

        setTelebirrNumber(
          data.telebirrNumber || ""
        );

        setStripeConnected(
          !!data.stripeEmail
        );

        setPaypalConnected(
          !!data.paypalEmail
        );
     setBalance(
  Number(data.availableBalance || 0)
);

setPaid(
  Number(data.totalPaid || 0)
);   
      }
const historyQuery = query(
  collection(db, "withdrawals"),
  where("creatorId", "==", user.uid),
  orderBy("requestedAt", "desc")
);
const historySnapshot = await getDocs(historyQuery);
const withdrawalList: any[] = [];
historySnapshot.forEach((doc) => {
  withdrawalList.push({
    id: doc.id,
    ...doc.data()
  });
});
setHistory(withdrawalList);
let pendingAmount = 0;
let paidAmount = 0;

withdrawalList.forEach((item: any) => {
  if (item.status === "Pending") {
    pendingAmount += Number(item.amount || 0);
  }

  if (item.status === "Paid") {
    paidAmount += Number(item.amount || 0);
  }
});
setPending(pendingAmount);
setPaid(paidAmount);
    }
    catch (error: any) {

  console.error("loadCreator error:", error);

  alert(error.message);

  setError("Failed to load withdrawal information.");

}
 setLoading(false);
 };
 const continueWithdrawal=()=>{

    setError("");

    const value=Number(amount);

    if(!amount){

      setError(
        "Enter withdrawal amount."
      );

      return;

    }

    if(value<8){

      setError(
        "Minimum withdrawal is CA$250."
      );

      return;

    }

    if(value>500){

      setError(
        "Maximum withdrawal is CA$500."
      );

      return;

    }

    if(value>balance){

      setError(
        "Insufficient available balance."
      );

      return;

    }

    setStep(2);

  };
const submitWithdrawal = async () => {

  try {

    const user = auth.currentUser;

    if (!user) {
      alert("Please login.");
      return;
    }
    const userSnap = await getDoc(
      doc(db, "users", user.uid)
    );

    if (!userSnap.exists()) {

      alert("Creator account not found.");

      return;

    }

    const creator = userSnap.data();

   await addDoc(
  collection(db, "withdrawals"),
  {
    creatorId: user.uid,
    creatorName: creator.name || "",
    email: creator.email || "",
    country: creator.country || "",
    method: selectedMethod,
    amount: Number(amount),
    currency: creator.currency || "CAD",
    status: "Pending",
    requestedAt: serverTimestamp(),
  }
);

const value = Number(amount);
const newBalance = balance - value;

// Update Firestore
await updateDoc(
  doc(db, "users", user.uid),
  {
    availableBalance: newBalance,
  }
);

// Update UI
setBalance(newBalance);
setPending((prev) => prev + value);

setHistory((prev) => [
  {
    amount: value,
    method: selectedMethod,
    status: "Pending",
    requestedAt: new Date(),
  },
  ...prev,
]);
setSubmittedAmount(value);
setStep(4);
setAmount("");
  } catch (error: any) {
  console.error("Withdrawal Error:", error);
  alert(error.message);
}
};
  if(loading){
 return(
   <div
      style={{
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        height:"80vh",
        fontSize:"22px",
        fontWeight:"bold"
      }}
      >

      Loading...

      </div>

    );

  }

  return(

<div
style={{
maxWidth:"1000px",
margin:"40px auto",
padding:"20px"
}}
>
<Link href="/dashboard/earnings">
← Back to Earnings
</Link>

<h1
style={{
marginTop:"20px",
fontSize:"36px",
fontWeight:"bold"
}}
>

💸 Withdraw Earnings

</h1>

<p
style={{
color:"#666",
marginTop:"10px"
}}
>

Withdraw your earnings securely.

</p>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
gap:"20px",
marginTop:"30px"
}}
>

<div
style={{
background:"#D4AF37",
padding:"25px",
fontWeight:"bold",
borderRadius:"20px"
}}
>

<h3>

Available Balance

</h3>

<h1>

CA${balance.toFixed(2)}

</h1>

</div>

<div
style={{
background:"orange",
padding:"25px",
borderRadius:"20px",
fontWeight:"bold"
}}
>

<h3>

Pending

</h3>

<h1>

CA${pending.toFixed(2)}

</h1>

</div>

<div
style={{
background:"red",
padding:"25px",
borderRadius:"20px",
fontWeight:"bold"
}}
>

<h3>

Total Paid

</h3>

<h1>

CA${paid.toFixed(2)}

</h1>

</div>

</div>

<div
style={{
background:"white",
marginTop:"30px",
padding:"30px",
borderRadius:"20px"
}}
>

<h2>

Withdrawal Policy

</h2>

<ul
style={{
lineHeight:"35px"
}}
>

<li>Minimum withdrawal: CA$250</li>

<li>Maximum withdrawal: CA$500</li>

<li>Processing time: 1–5 business days</li>

<li>Payouts are reviewed before sending.</li>

</ul>

<h2
style={{
marginTop:"30px"
}}
>

Withdrawal Amount

</h2>

<input
type="number"
placeholder="250"
value={amount}
onChange={(e)=>
setAmount(e.target.value)
}
style={{
width:"50%",
padding:"16px",
marginTop:"15px",
borderRadius:"12px",
border:"1px solid #ddd",
fontSize:"18px"
}}
/>

{
error &&

<p
style={{
marginTop:"15px",
color:"red"
}}
>

{error}

</p>

}

<button
onClick={continueWithdrawal}
style={{
marginTop:"25px",
width:"100%",
padding:"16px",
background:"#D4AF37",
border:"none",
borderRadius:"12px",
fontWeight:"bold",
cursor:"pointer",
fontSize:"17px"
}}onMouseEnter={(e)=>{
e.currentTarget.style.fontWeight="bold";
e.currentTarget.style.color="hsl(246, 89%, 51%)";
e.currentTarget.style.transform="scale(1.05)";
}}
onMouseLeave={(e)=>{
e.currentTarget.style.fontWeight="600";
e.currentTarget.style.color="#111";
e.currentTarget.style.transform="scale(1)";
}}
>
Continue

</button>
{
step===2 && (

<div
style={{
marginTop:"30px",
padding:"30px",
background:"white",
borderRadius:"20px"
}}
>

<h2>

Choose Withdrawal Method

</h2>

{
country==="Ethiopia"

?

(

<div
style={{
marginTop:"20px"
}}
>

<p
style={{
color:"#3344c2",
marginBottom:"20px"
}}
>

Since your account country is Ethiopia,
withdrawals are processed through
Telebirr.

</p>

<input
placeholder="Telebirr Phone Number"
value={telebirrNumber}
onChange={(e)=>
setTelebirrNumber(
e.target.value
)
}
style={{
width:"100%",
padding:"15px",
border:"1px solid #ddd",
borderRadius:"12px"
}}
/>

<button
onClick={()=>{
setSelectedMethod("Telebirr");
setStep(3);
}}
style={{
marginTop:"25px",
width:"100%",
padding:"16px",
background:"#00A651",
color:"white",
border:"none",
borderRadius:"12px",
fontWeight:"bold",
cursor:"pointer"
}}
onMouseEnter={(e)=>{
e.currentTarget.style.fontWeight="bold";
e.currentTarget.style.color="hsl(246, 89%, 51%)";
e.currentTarget.style.transform="scale(1.05)";
}}
onMouseLeave={(e)=>{
e.currentTarget.style.fontWeight="600";
e.currentTarget.style.color="#111";
e.currentTarget.style.transform="scale(1)";
}}
>
Continue with Telebirr
</button>
</div>
)
:
(
<div
style={{
display:"flex",
flexDirection:"column",
gap:"20px",
marginTop:"25px"
}}
>

<div
style={{
border:"1px solid #eee",
borderRadius:"15px",
padding:"20px"
}}
>

<h3>

💳 Stripe

</h3>

<p>

{
stripeConnected

?

stripeEmail

:

"Not Connected"

}

</p>

<button
disabled={!stripeConnected}
onClick={()=>{
setSelectedMethod("Stripe");
setStep(3);
}}
style={{
marginTop:"15px",
width:"100%",
padding:"15px",
background:
stripeConnected
?
"#635BFF"
:
"#ddd",
color:"white",
border:"none",
borderRadius:"10px",
cursor:
stripeConnected
?
"pointer"
:
"not-allowed"
}}
>

Withdraw to Stripe

</button>

</div>

<div
style={{
border:"1px solid #eee",
borderRadius:"15px",
padding:"20px"
}}
>

<h3>

🅿️ PayPal

</h3>

<p>

{
paypalConnected

?

paypalEmail

:

"Not Connected"

}

</p>

<button
disabled={!paypalConnected}
onClick={()=>{
setSelectedMethod("PayPal");
setStep(3);
}}
style={{
marginTop:"15px",
width:"100%",
padding:"15px",
background:
paypalConnected
?
"#0070BA"
:
"#ddd",
color:"white",
border:"none",
borderRadius:"10px",
cursor:
paypalConnected
?
"pointer"
:
"not-allowed"
}}
>

Withdraw to PayPal

</button>

</div>

</div>

)

}

</div>

)
}

{step===3 && (

<div
style={{
marginTop:"30px",
padding:"30px",
background:"white",
borderRadius:"20px"
}}
>

<h2>Confirm Withdrawal</h2>

<div
style={{
marginTop:"25px",
display:"flex",
flexDirection:"column",
gap:"18px"
}}
>

<div>
<b>Amount</b>
<br/>
CA${Number(amount).toFixed(2)}
</div>

<div>
<b>Method</b>
<br/>
{selectedMethod}
</div>

<div>
<b>Processing Time</b>
<br/>
1–5 Business Days
</div>

<div
style={{
display:"flex",
gap:"15px",
marginTop:"20px"
}}
>

<button
onClick={()=>{
setStep(2);
setSelectedMethod("");
}}
style={{
flex:1,
padding:"16px",
background:"#ef4444",
color:"white",
border:"none",
borderRadius:"12px",
fontWeight:"bold",
cursor:"pointer"
}}
onMouseEnter={(e)=>{
e.currentTarget.style.fontWeight="bold";
e.currentTarget.style.color="hsl(246, 89%, 51%)";
e.currentTarget.style.transform="scale(1.05)";
}}
onMouseLeave={(e)=>{
e.currentTarget.style.fontWeight="600";
e.currentTarget.style.color="#111";
e.currentTarget.style.transform="scale(1)";
}}
>
Cancel
</button>

<button
onClick={submitWithdrawal}
style={{
flex:1,
padding:"16px",
background:"#D4AF37",
border:"none",
borderRadius:"12px",
fontWeight:"bold",
cursor:"pointer"
}}
onMouseEnter={(e)=>{
e.currentTarget.style.fontWeight="bold";
e.currentTarget.style.color="hsl(246, 89%, 51%)";
e.currentTarget.style.transform="scale(1.05)";
}}
onMouseLeave={(e)=>{
e.currentTarget.style.fontWeight="600";
e.currentTarget.style.color="#111";
e.currentTarget.style.transform="scale(1)";
}}
>
Confirm Withdrawal
</button>
</div>
</div>
</div>
)}
{step===4 && (
<div
style={{
marginTop:"30px",
background:"#ecfdf5",
padding:"30px",
borderRadius:"20px",
border:"2px solid #16a34a"
}}
>

<h2>

✅ Withdrawal Request Submitted

</h2>

<p
style={{
marginTop:"20px"
}}
>
<b>Amount</b>
<br/>
CA${submittedAmount.toFixed(2)}
</p>
<p
style={{
marginTop:"15px"
}}
>

<b>Method</b>

<br/>

{selectedMethod}

</p>

<p
style={{
marginTop:"15px"
}}
>

<b>Status</b>

<br/>

Pending Review

</p>

<p
style={{
marginTop:"15px",
color:"#666"
}}
>

Your withdrawal request has been submitted successfully.

Our team will review your request and send your payout within 1–5 business days.

</p>

<Link href="/dashboard/earnings">

<button
style={{
marginTop:"30px",
width:"100%",
padding:"16px",
background:"#D4AF37",
border:"none",
borderRadius:"12px",
fontWeight:"bold",
cursor:"pointer"
}}
>

Back to Earnings

</button>

</Link>

</div>

)
}

<div
style={{
background:"white",
marginTop:"35px",
padding:"30px",
borderRadius:"20px"
}}
>

<h2>Withdrawal History</h2>

<div
style={{
marginTop:"20px",
display:"flex",
flexDirection:"column",
gap:"15px"
}}
>

{history.length===0 ? (

<div
style={{
padding:"25px",
textAlign:"center",
background:"#fafafa",
borderRadius:"15px",
color:"#777"
}}
>
No withdrawal history yet.
</div>

) : (

history.map((item,index)=>(

<div
key={index}
style={{
display:"grid",
gridTemplateColumns:"2fr 1fr 1fr 1fr",
alignItems:"center",
padding:"18px",
background:"#fafafa",
borderRadius:"15px"
}}
>

<div>
{
item.requestedAt?.seconds
?
new Date(
item.requestedAt.seconds*1000
).toLocaleDateString()
:
"Today"
}
</div>

<div>
{item.method}
</div>

<div>
CA${Number(item.amount).toFixed(2)}
</div>

<div
style={{
fontWeight:"bold",
color:
item.status==="Paid"
?
"#16a34a"
:
item.status==="Rejected"
?
"#dc2626"
:
"#f59e0b"
}}
>
{item.status}
</div>
</div>
))
)}
</div>
</div>
</div>
</div>
)}