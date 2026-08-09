"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth, db, storage, } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc, } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();
  const router = useRouter();

  const [openProfile,setOpenProfile] =
    useState(false);

  const [userData,setUserData] =
    useState<any>(null);
const [uploading, setUploading] =
  useState(false);
  useEffect(()=>{

    const user =
      auth.currentUser;

    if(!user) return;

    const unsubscribe =
      onSnapshot(

        doc(
          db,
          "users",
          user.uid
        ),

        (docSnap)=>{

          if(
            docSnap.exists()
          ){

            setUserData(
              docSnap.data()
            );

          }

        }

      );

    return ()=>
      unsubscribe();

  },[]);
const changeProfilePicture = async (
  file: File
) => {

  const user = auth.currentUser;

  if (!user) return;

  try {

    setUploading(true);

    const storageRef = ref(
      storage,
      `profiles/${user.uid}`
    );

    await uploadBytes(
      storageRef,
      file
    );

    const imageUrl =
      await getDownloadURL(
        storageRef
      );

    await updateDoc(
      doc(db, "users", user.uid),
      {
        profileImage: imageUrl,
      }
    );

    alert(
      "Profile picture updated!"
    );

  } catch (error) {

    console.log(error);

    alert(
      "Failed to update profile picture."
    );

  }

  setUploading(false);

};
  const handleLogout = async()=>{

    try{

      await signOut(
        auth
      );

      router.push(
        "/login"
      );

    }
    catch(error){

      console.log(
        error
      );

    }

  };

  const links=[

    {
      name:"Dashboard",
      href:"/dashboard",
      icon:"🏠"
    },

    {
      name:"Add Products",
      href:"/dashboard/products",
      icon:"🛍️"
    },

    {
      name:"My Store",
      href:"/dashboard/store",
      icon:"🏪"
    },

    {
      name:"Earnings",
      href:"/dashboard/earnings",
      icon:"💰"
    },

    {
      name:"Help",
      href:"/dashboard/help",
      icon:"❓"
    },

    {
      name:"Settings",
      href:"/dashboard/settings",
      icon:"⚙️"
    }

  ];

  return(

<div
style={{
display:"flex",
minHeight:"100vh"
}}
>

{/* SIDEBAR */}

<div
style={{
width:"250px",
background:"#33a285",
color:"white",
padding:"20px",
display:"flex",
flexDirection:"column"
}}
>

{/* LOGO */}

<h2
style={{
color:"#D4AF37",
fontWeight: "bold",
fontSize: "24px",
marginBottom:"25px"
}}
>
CreatorStore
</h2>


{/* PROFILE MOVED TO TOP */}

<div
style={{
position:"relative",
marginBottom:"25px",
paddingBottom:"20px",
borderBottom:
"1px solid #333"
}}
>

<div
onClick={() =>
setOpenProfile(!openProfile)
}
style={{
display:"flex",
alignItems:"center",
gap:"12px",
cursor:"pointer"
}}
>

<div
style={{
position:"relative",
width:"50px",
height:"50px",
}}
>

<img
src={
userData?.profileImage ||
"/profile-placeholder.png"
}
alt="profile"
style={{
width:"50px",
height:"50px",
borderRadius:"50%",
objectFit:"cover",
border:"2px solid #D4AF37",
}}
/>

<div
style={{
position:"absolute",
bottom:"-2px",
right:"-2px",
width:"18px",
height:"18px",
background:"#D4AF37",
borderRadius:"50%",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:"20px",
border:"2px solid #111",
color:"#111",
}}
>
 ✏️
</div>

</div>

<div>
<strong>

{
userData?.name ||
"User"
}

</strong>

<div
style={{
fontSize:"12px",
color:"#ccc",
overflow:"hidden",
textOverflow:"ellipsis"
}}
>

{
userData?.email
}

</div>

</div>

</div>


{openProfile && (

<div
style={{
background:"#222",
borderRadius:"10px",
marginTop:"12px",
padding:"12px"
}}
>

<label
style={{
display:"block",
color:"white",
cursor:"pointer",
marginBottom:"12px"
}}
>

👤 Change Profile Pic

<input
type="file"
accept="image/*"
hidden

onChange={async (e)=>{

if(!e.target.files?.length)
return;

await changeProfilePicture(
e.target.files[0]
);

}}

 />

</label>

<Link
href="/dashboard/settings"
style={{
display:"block",
color:"white",
textDecoration:"none",
marginBottom:"12px"
}}
>
⚙️ Settings
</Link>

<p
onClick={
handleLogout
}
style={{
cursor:"pointer",
color:"#ff6b6b",
margin:0
}}
>
🚪 Logout
</p>

</div>

)}

</div>


{/* SIDEBAR LINKS */}

<div
style={{
display:"flex",
flexDirection:"column"
}}
>

{links.map((link)=>(

<Link
key={link.href}
href={link.href}

style={{
display:"block",
padding:"14px",
marginBottom:"10px",
borderRadius:"10px",
textDecoration:"none",

color:
pathname===
link.href
? "#111"
: "white",

background:
pathname===
link.href
? "#D4AF37"
: "transparent",

fontWeight:
pathname===
link.href
? "bold"
: "normal"
}}
>

{link.icon}
{" "}
{link.name}

</Link>

))}

</div>

</div>


{/* MAIN CONTENT */}

<div
style={{
flex:1,
padding:"30px",
background:"#f8f8f8"
}}
>

{children}

</div>

</div>

);

}