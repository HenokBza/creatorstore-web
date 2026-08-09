"use client";

import { useEffect, useState } from "react";
import { auth, db, } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, getDoc,collection,
  getDocs,  } from "firebase/firestore";
export default function AdminPage() {

  const router = useRouter();
  const [stats, setStats] = useState({
  pending: 0,
  creators: 0,
  products: 0,
  revenue: 0,
});
const loadStats = async () => {

  // Pending Withdrawals

  const withdrawals = await getDocs(
    collection(db, "withdrawals")
  );

  let pending = 0;

  withdrawals.forEach((doc) => {

    if (doc.data().status === "Pending") {

      pending++;

    }

  });

  // Creators

  const creators = await getDocs(
    collection(db, "users")
  );

  // Products

  const products = await getDocs(
    collection(db, "products")
  );

  // Revenue

  let revenue = 0;

  creators.forEach((doc) => {

    revenue += Number(
      doc.data().totalRevenue || 0
    );

  });

  setStats({

    pending,

    creators: creators.size,

    products: products.size,

    revenue,

  });

};
  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {

        if (!user) {

          router.replace("/");

          return;

        }
        const userDoc = await getDoc(
  doc(db, "adminuser", user.uid)
);

if (!userDoc.exists()) {

  router.replace("/dashboard");

  return;

}

const userData = userDoc.data();

if (userData.role !== "admin") {

  alert("Access denied.");

  router.replace("/dashboard");

  return;
}
await loadStats();
      }
    );

    return () => unsubscribe();

  }, []);

 return (

<div
style={{
maxWidth:"1200px",
margin:"40px auto",
padding:"20px",
}}
>

<h1
style={{
fontSize:"38px",
fontWeight:"700",
marginBottom:"5px",
}}
>
👑 CreatorStore Admin
</h1>

<p
style={{
color:"#666",
marginBottom:"30px",
}}
>
Manage creators, withdrawals and your marketplace.
</p>

{/* Dashboard Cards */}

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(4, minmax(0,1fr))",
gap:"20px",
marginTop:"10px",
borderRadius: "16px",
fontSize:"16px",
fontWeight:"300",
}}
>

<Card
title="Pending Withdrawals"
value={stats.pending}
icon="💰"
/>

<Card
title="Total Creators"
value={stats.creators}
icon="👥"
/>

<Card
title="Products"
value={stats.products}
icon="📦"
/>

<Card
title="Platform Revenue"
value={`CA$${stats.revenue.toFixed(2)}`}
icon="💵"
/>

</div>

{/* Menu */}

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(2, minmax(0,1fr))",
gap:"25px",
marginTop:"20px",
}}
>

<div
onClick={()=>router.push("/withdrawals-requests")}
className="interactive-btn"
style={{
background:"#fff",
padding:"25px",
borderRadius:"10px",
boxShadow:"0 8px 25px rgba(0,0,0,.08)",
cursor:"pointer",
}}
>

<div style={{fontSize:"40px"}}>💰</div>

<h2>Withdrawal Requests</h2>

<p style={{color:"#777"}}>
Review creator payout requests.
</p>

</div>

{/* Creators */}



<div
onClick={() => router.push("/creators")}
className="interactive-btn"
style={{
background:"#fff",
padding:"25px",
borderRadius:"18px",
boxShadow:"0 8px 25px rgba(0,0,0,.08)",
cursor:"pointer",
minHeight:"170px",
display:"flex",
flexDirection:"column",
justifyContent:"space-between",
}}
>

<div style={{fontSize:"40px"}}>
👥
</div>

<h2>
Creators
</h2>

<p
style={{
color:"#777"
}}
>
Manage creators and subscriptions.
</p>

</div>

{/* Products */}

<div
onClick={()=>router.push("/products")}
className="interactive-btn"
style={{
background:"#fff",
padding:"25px",
borderRadius:"18px",
boxShadow:"0 8px 25px rgba(0,0,0,.08)",
cursor:"pointer",
minHeight:"170px",
display:"flex",
flexDirection:"column",
justifyContent:"space-between",
}}
>

<div style={{fontSize:"40px"}}>
📦
</div>

<h2>
Products
</h2>

<p
style={{
color:"#777",
}}
>
Manage creator products.
</p>

</div>

{/* Analytics */}

<div
className="interactive-btn"
style={{
background:"#fff",
padding:"25px",
borderRadius:"10px",
boxShadow:"0 8px 25px rgba(0,0,0,.08)",
cursor:"pointer",
minHeight:"170px",
display:"flex",
flexDirection:"column",
justifyContent:"space-between",
transition:"0.2s",
}}
>

<div style={{fontSize:"40px"}}>
📊
</div>

<h2
style={{
marginTop:"15px"
}}
>
Analytics
</h2>

<p
style={{
color:"#777",
marginTop:"8px"
}}
>
Coming soon...
</p>

</div>

</div>

</div>

);}
function Card({
  title,
  value,
  icon,
}: any) {

  return (

    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "18px",
        boxShadow: "0 6px 20px rgba(0,0,0,.08)",
      }}
    >

      <div
        style={{
          fontSize: "34px",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          marginTop: "15px",
          color: "#777",
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: "8px",
          fontSize: "30px",
          fontWeight: "700",
        }}
      >
        {value}
      </div>

    </div>

  );

}