"use client";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
EmailAuthProvider,
reauthenticateWithCredential,
updatePassword
} from "firebase/auth";

export default function SecurityPage() {

const user = auth.currentUser;

const [currentPassword,setCurrentPassword]=
useState("");

const [newPassword,setNewPassword]=
useState("");
const [showCurrentPassword,setShowCurrentPassword]=
useState(false);

const [showNewPassword,setShowNewPassword]=
useState(false);
const [fullName,setFullName]=
useState("");

const [storeName,setStoreName]=
useState("");

const [email,setEmail]=
useState("");

const [reason,setReason]=
useState("");

const [confirmText,setConfirmText]=
useState("");

const [showDeleteForm,setShowDeleteForm]=
useState(false);
useEffect(()=>{

const loadUser=async()=>{

const currentUser=
auth.currentUser;

if(!currentUser) return;

const snap=
await getDoc(
doc(
db,
"users",
currentUser.uid
)
);

if(snap.exists()){

const data=
snap.data();

setFullName(
data.name || ""
);

setStoreName(
data.storeName || ""
);

setEmail(
data.email || ""
);

}

};

loadUser();

},[]);

const changePassword =
async()=>{

try{

if(!user){

alert(
"Please login first"
);

return;

}

const credential=
EmailAuthProvider.credential(
user.email || "",
currentPassword
);

await reauthenticateWithCredential(
user,
credential
);

await updatePassword(
user,
newPassword
);

alert(
"Password changed successfully ✅"
);

setCurrentPassword("");
setNewPassword("");

}catch(error){

console.log(error);

alert(
"Failed to change password"
);

}

};

const submitDeletionRequest=()=>{

const subject=
encodeURIComponent(
"CreatorStore Account Deletion Request"
);

const body=
encodeURIComponent(
`
CreatorStore Account Deletion Request

Full Name:
${fullName}

Store Name:
${storeName}

Email:
${email}

Reason:
${reason}

Confirmation:
${confirmText}

I understand deleting my account permanently removes my products, store, and account data.
`
);

window.location.href=
`mailto:creatorstore.ca@gmail.com?subject=${subject}&body=${body}`;

};

return(

<div
style={{
maxWidth:"900px",
margin:"auto",
display:"flex",
flexDirection:"column",
gap:"30px"
}}
>

<h1>
🔒 Security Settings
</h1>

{/* CHANGE PASSWORD */}

<div
  style={{
    background: "white",
    padding: "20px",
    borderRadius: "20px",
    boxShadow: "0 5px 20px rgba(0,0,0,.08)",
  }}
>
  <h2>Change Password</h2>

  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "15px",
      marginTop: "20px",
    }}
  >
    {/* Current Password */}

    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid #ddd",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      <input
        type={
          showCurrentPassword
            ? "text"
            : "password"
        }
        placeholder="Current Password"
        value={currentPassword}
        onChange={(e) =>
          setCurrentPassword(
            e.target.value
          )
        }
        style={{
          flex: 1,
          padding: "14px",
          border: "none",
          outline: "none",
        }}
      />

      <button
        type="button"
        onClick={() =>
          setShowCurrentPassword(
            !showCurrentPassword
          )
        }
        className="interactive-btn"
        style={{
          padding: "14px",
          border: "none",
          background: "#f5f5f5",
          cursor: "pointer",
        }}
      >
        {showCurrentPassword
          ? "🙈"
          : "👁️"}
      </button>
    </div>

    {/* New Password */}

    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid #ddd",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      <input
        type={
          showNewPassword
            ? "text"
            : "password"
        }
        placeholder="New Password"
        value={newPassword}
        onChange={(e) =>
          setNewPassword(
            e.target.value
          )
        }
        style={{
          flex: 1,
          padding: "14px",
          border: "none",
          outline: "none",
        }}
      />

      <button
        type="button"
        onClick={() =>
          setShowNewPassword(
            !showNewPassword
          )
        }
        style={{
          padding: "14px",
          border: "none",
          background: "#f5f5f5",
          cursor: "pointer",
        }}
      >
        {showNewPassword
          ? "🙈"
          : "👁️"}
      </button>
    </div>

    <button
      onClick={changePassword}
     className="interactive-btn" 
      style={{
        background: "#2563eb",
        color: "white",
        padding: "14px",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "bold",
      }}
    >
      Save Password
    </button>
  </div>
</div>

{/* ACCOUNT DELETE */}

<div
style={{
background:"white",
padding:"30px",
borderRadius:"20px",
boxShadow:
"0 5px 20px rgba(0,0,0,.08)"
}}
>

<h2
style={{
color:"red"
}}
>
Request Account Deletion
</h2>

<p
style={{
marginTop:"15px",
lineHeight:"28px",
color:"#666"
}}
>

Deleting your CreatorStore account is permanent.

<br/><br/>

After deletion:

<br/>

• Your store disappears<br/>
• Products are removed<br/>
• Analytics are deleted<br/>
• Customer data may be removed

<br/><br/>

Need help? Contact:

<a
href="mailto:creatorstore.ca@gmail.com"
style={{
marginLeft:"6px",
color:"#2563eb",
fontWeight:"bold",
textDecoration:"none"
}}
>
creatorstore.ca@gmail.com
</a>

</p>

<button
onClick={()=>
setShowDeleteForm(
!showDeleteForm
)
}
className="interactive-btn"
style={{
marginTop:"20px",
padding:"14px 25px",
background:"#dc2626",
color:"white",
border:"none",
borderRadius:"10px",
cursor:"pointer",
fontWeight:"bold"
}}

>

📝 Fill Deletion Form 

</button>

{showDeleteForm && (

<div
style={{
marginTop:"25px",
display:"flex",
flexDirection:"column",
gap:"15px",
padding:"20px",
background:"#f8f8f8",
borderRadius:"15px"
}}
>

<input
value={fullName}
disabled
style={{
padding:"14px",
borderRadius:"10px",
border:"1px solid #ddd",
background:"#eee"
}}
/>

<input
value={storeName}
disabled
style={{
padding:"14px",
borderRadius:"10px",
border:"1px solid #ddd",
background:"#eee"
}}
/>

<input
value={email}
disabled
style={{
padding:"14px",
borderRadius:"10px",
border:"1px solid #ddd",
background:"#eee"
}}
/>

<textarea
placeholder=
"Why do you want to delete your account? write here 1 - 50 words"
value={reason}
onChange={(e)=>
setReason(
e.target.value
)
}
style={{
padding:"14px",
height:"120px",
borderRadius:"10px",
border:"1px solid #ddd"
}}
/>

<input
placeholder=
'Type: DELETE MY ACCOUNT'
value={confirmText}
onChange={(e)=>
setConfirmText(
e.target.value
)
}
style={{
padding:"14px",
borderRadius:"10px",
border:"1px solid #ddd"
}}
/>

<button
disabled={
confirmText !==
"DELETE MY ACCOUNT"
}
onClick={
submitDeletionRequest
}
className="interactive-btn"
style={{
padding:"15px",
border:"none",
borderRadius:"10px",
fontWeight:"bold",
cursor:
confirmText===
"DELETE MY ACCOUNT"
?
"pointer"
:
"not-allowed",

background:
confirmText===
"DELETE MY ACCOUNT"
?
"#dc2626"
:
"#ccc",

color:"white"
}}
>

Send Request

</button>

</div>

)}
</div>
</div>
)}
