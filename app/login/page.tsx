"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword,setShowPassword]=
useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Login successful!");

      router.push("/dashboard");
    } catch (error: any) {
      alert(error.message);
    }
  };

 return (
<div
style={{
padding:"40px",
textAlign:"center",
background:"#D4AF37",
minHeight:"100vh",
color:"#111",
}}
>

<h1
style={{
fontSize:"2.5rem",
marginBottom:"20px",
}}
>
Login
</h1>

<div
style={{
maxWidth:"400px",
margin:"0 auto",
display:"flex",
flexDirection:"column",
gap:"15px",
}}
>

<input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>
setEmail(e.target.value)
}
style={{
padding:"12px",
}}
/>

<div
style={{
position:"relative"
}}
>

<input
type={
showPassword
? "text"
: "password"
}
placeholder="Password"
value={password}
onChange={(e)=>
setPassword(
e.target.value
)
}
style={{
padding:"12px",
width:"100%",
boxSizing:"border-box",
paddingRight:"50px"
}}
/>

<span
onClick={()=>
setShowPassword(
!showPassword
)
}
style={{
position:"absolute",
right:"15px",
top:"50%",
transform:"translateY(-50%)",
cursor:"pointer",
fontSize:"18px",
userSelect:"none"
}}
>
{
showPassword
?"👁️"
: "🙈"
 
}
</span>

</div>

<div
style={{
textAlign:"right"
}}
>

<Link
href="/forgot-password"
className="interactive-btn"
style={{
fontSize:"14px",
color:"#111",
fontWeight:"600",
textDecoration:"underline",
cursor:"pointer",
transition:"0.3s"
}}
>
🔒 Forgot Password?
</Link>

</div>

<button
onClick={handleLogin}
className="interactive-btn"
style={{
padding:"12px",
background:"#c32acb",
color:"white",
border:"none",
cursor:"pointer",
}}
>
Login
</button>

<div
style={{
marginTop:"15px",
textAlign:"center",
fontSize:"14px",
}}
>

Don't have an account?{" "}

<Link
href="/phone"
style={{
color:"#7b2cbf",
fontWeight:"bold",
textDecoration:"none"
}}
>
Create here
</Link>

</div>

</div>

</div>
)}