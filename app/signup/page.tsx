"use client";

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db, storage } from "@/lib/firebase";
import { useRouter } from "next/navigation";

import { doc, setDoc } from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

export default function SignupPage() {
  const router = useRouter();
const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    // Safely grab from localStorage only after the component mounts on the client
    setCountry(localStorage.getItem("signupCountry") || "");
    setPhone(localStorage.getItem("signupPhone") || "");
  }, []);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState("/profile-placeholder.png");

  const [name, setName] = useState("");
  const [storeName, setStoreName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");
   const [showPassword, setShowPassword] =
useState(false);
  const [error, setError] =
    useState("");

  const handleImage = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    const imageURL =
      URL.createObjectURL(file);

    setImagePreview(imageURL);
  };
const validatePassword=(password:string)=>{

const hasUpperCase =
/[A-Z]/.test(password);

const hasLowerCase =
/[a-z]/.test(password);

const hasNumber =
/[0-9]/.test(password);

const hasSpecial =
/[!@#$%^&*(),.?":{}|<>]/.test(password);

const hasLength =
password.length >= 8;

if(
!hasLength ||
!hasUpperCase ||
!hasLowerCase ||
!hasNumber ||
!hasSpecial
){

return false;

}

return true;

};
  const handleSignup = async () => {

    setError("");

    if (
      !name ||
      !storeName ||
      !email ||
      !password
    ) {
      setError(
        "Please fill all required fields"
      );
return;
    }
   /* PASSWORD VALIDATION */

if(
!validatePassword(
password
)
){

setError(
"Password must contain:\n• 8+ characters\n• Uppercase letter\n• Lowercase letter\n• Number\n• Special symbol"
);

return;

} 

    try {

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user =
        userCredential.user;

      let profileImageURL = "";

      // Upload image if selected

      if (selectedFile) {

        const imageRef = ref(
          storage,
          `profiles/${user.uid}`
        );

        await uploadBytes(
          imageRef,
          selectedFile
        );

        profileImageURL =
          await getDownloadURL(
            imageRef
          );
      }

      // Save user profile

      await setDoc(
        doc(
          db,
          "users",
          user.uid
        ),
        {
          name,
          email,
          storeName,
          storeURL:
            `creatorstore.ca/${storeName}`,
          profileImage:
            profileImageURL,
            country,
            visits: 0,
    phone,
          createdAt:
            new Date(),
        }
      );

      alert(
        "Account created successfully 🚀"
      );

      router.push("/login");

    } catch (error: any) {

      setError(
        error.message
      );
    }
  };

  return (
    <div
      style={{
        minHeight:"100vh",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        background:"#D4AF37"
      }}
    >
      <div
        style={{
          width:"420px",
          background:"white",
          padding:"35px",
          borderRadius:"20px",
          boxShadow:
          "0 5px 20px rgba(0,0,0,.1)"
        }}
      >

        <h1
          style={{
            textAlign:"center",
            color:"#4e37d4"
          }}
        >
          ...Creating CreatorStore Account
        </h1>

        <div
          style={{
            textAlign:"center",
            marginTop:"20px"
          }}
        >

          <img
            src={imagePreview}
            alt="profile"
            style={{
              width:"100px",
              height:"100px",
              borderRadius:"50%",
              objectFit:"cover",
              border:
              "4px solid #D4AF37"
            }}
          />

          <div
            style={{
              marginTop:"10px"
            }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
            />
          </div>

        </div>

        {error && (

          <p
            style={{
              color:"red",
              marginTop:"15px"
            }}
          >
            {error}
          </p>

        )}

        <div
          style={{
            display:"flex",
            flexDirection:"column",
            gap:"15px",
            marginTop:"20px"
          }}
        >

          <input
            placeholder="First Name and Last Name"
            value={name}
            onChange={(e)=>
            setName(
              e.target.value
            )}
            style={{
              padding:"14px",
              borderRadius:"10px"
            }}
          />

          <input
            placeholder="Store Name"
            value={storeName}
            onChange={(e)=>
            setStoreName(
              e.target.value
            )}
            style={{
              padding:"14px",
              borderRadius:"10px"
            }}
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e)=>
            setEmail(
              e.target.value
            )}
            style={{
              padding:"14px",
              borderRadius:"10px"
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
fontSize:"20px",
userSelect:"none"
}}
>
{
showPassword
? "👁️"
: "🙈"
}
</span>

</div>
 
          <p
style={{
fontSize:"13px",
color:"#666",
marginTop:"-5px",
lineHeight:"20px"
}}
>
🔒 Password must contain:
<br/>
• Minimum 8 characters
<br/>
• One uppercase letter (A-Z)
<br/>
• One lowercase letter (a-z)
<br/>
• One number (0-9)
<br/>
• One special symbol (!@#$...)
</p>

          <button
            onClick={handleSignup}
            style={{
              background:"#D4AF37",
              color:"white",
              padding:"15px",
              border:"none",
              borderRadius:"10px",
              fontWeight:"bold",
              cursor:"pointer",
              fontSize:"16px"
            }}
          >
            Create Account
          </button>
<div
  style={{
    marginTop: "25px",
    textAlign: "center",
    fontSize: "13px",
    color: "#666",
    lineHeight: "24px",
  }}
>
  By Create Account, you agree to our{" "}
  <a
    href="/terms"
    style={{
      color: "#D4AF37",
      fontWeight: "bold",
      textDecoration: "none",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.textDecoration = "underline";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.textDecoration = "none";
    }}
  >
    Terms of Service
  </a>{" "}
  and{" "}
  <a
    href="/privacy"
    style={{
      color: "#D4AF37",
      fontWeight: "bold",
      textDecoration: "none",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.textDecoration = "underline";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.textDecoration = "none";
    }}
  >
    Privacy Policy
  </a>
  .
</div>

<div
  style={{
    marginTop: "20px",
    textAlign: "center",
    fontSize: "15px",
  }}
>
  Already have an account?{" "}
  <a
    href="/login"
    style={{
      color: "#3222e4",
      fontWeight: "bold",
      textDecoration: "none",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.textDecoration = "underline";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.textDecoration = "none";
    }}
  >
    Login
  </a>
</div>
        </div>

      </div>
    </div>
  );
}