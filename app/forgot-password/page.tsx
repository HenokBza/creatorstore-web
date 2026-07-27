"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {

const router = useRouter();

const [email,setEmail] =
useState("");

const [message,setMessage] =
useState("");

const [error,setError] =
useState("");

const resetPassword = async()=>{

setError("");
setMessage("");

if(!email){

setError(
"Please enter your email"
);

return;

}

try{

await sendPasswordResetEmail(
auth,
email
);

setMessage(
"Password reset email sent 📩 ( check in spam folder) "
);

}
catch(error:any){

setError(
error.message
);

}

};

return(

<div
style={{
minHeight:"100vh",
display:"flex",
justifyContent:"center",
alignItems:"center",
background:"#f5f5f5"
}}
>

<div
style={{
width:"420px",
background:"white",
padding:"35px",
borderRadius:"20px",
boxShadow:
"0px 5px 20px rgba(0,0,0,.1)"
}}
>

<h1
style={{
textAlign:"center",
marginBottom:"10px",
color:"#D4AF37"
}}
>
🔒 Forgot Password
</h1>

<p
style={{
textAlign:"center",
color:"#777",
marginBottom:"25px"
}}
>
Enter your email and we'll send a reset link
</p>

{error && (

<p
style={{
color:"red"
}}
>
{error}
</p>

)}

{message && (

<p
style={{
color:"green"
}}
>
{message}
</p>

)}

<input
placeholder="Email address"
value={email}
onChange={(e)=>
setEmail(
e.target.value
)
}
style={{
width:"100%",
padding:"14px",
borderRadius:"10px",
border:"1px solid #ddd",
marginBottom:"20px",
boxSizing:"border-box"
}}
/>

<button
onClick={resetPassword}
style={{
width:"100%",
background:"#D4AF37",
padding:"15px",
border:"none",
borderRadius:"10px",
fontWeight:"bold",
cursor:"pointer"
}}
>
Send Reset Link
</button>

<button
onClick={()=>
router.push(
"/login"
)
}
style={{
width:"100%",
marginTop:"10px",
background:"transparent",
padding:"15px",
border:"1px solid #ddd",
borderRadius:"10px",
cursor:"pointer"
}}
>
Back to Login
</button>

</div>

</div>

);

}