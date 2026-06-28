"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { FaTiktok, FaFacebook, FaYoutube, FaInstagram } from "react-icons/fa";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

export default function Dashboard() {

  const [userData,setUserData]=
  useState<any>(null);

  const [stats,setStats]=
  useState({
    visits:0,
    revenue:0,
    products:0,
    customers:0,
  });

  useEffect(()=>{

    const user=
    auth.currentUser;

    if(!user) return;

    const userRef=
    doc(
      db,
      "users",
      user.uid
    );

    const unsubscribe=
    onSnapshot(
      userRef,

      async(snapshot)=>{

        if(
          !snapshot.exists()
        ) return;

        const data=
        snapshot.data();

        setUserData(
          data
        );

        const productsQuery=
        query(
          collection(
            db,
            "products"
          ),
          where(
            "userId",
            "==",
            user.uid
          )
        );

        const productsSnapshot=
        await getDocs(
          productsQuery
        );

        const productCount=
        productsSnapshot.size;

        let totalRevenue=0;
        let totalCustomers=0;

        productsSnapshot.forEach(
          (doc)=>{

          const product=
          doc.data();

          totalRevenue+=
          product.revenue || 0;

          totalCustomers+=
          product.customers || 0;

        });

        setStats({

          visits:
          data.visits || 0,

          revenue:
          totalRevenue,

          products:
          productCount,

          customers:
          totalCustomers

        });

      }

    );

    return ()=>unsubscribe();

  },[]);


  const copyLink=()=>{

    navigator.clipboard.writeText(
      `https://${userData?.storeURL}`
    );

    alert(
      "Store link copied!"
    );

  };


  // GRAPH DATA
  const graphData=[

    {
      month:"Jan",
      visits:stats.visits
    },

    {
      month:"Feb",
      visits:stats.visits
    },

    {
      month:"Mar",
      visits:stats.visits
    },

    {
      month:"Apr",
      visits:stats.visits
    },

    {
      month:"May",
      visits:stats.visits
    },

    {
      month:"Jun",
      visits:stats.visits
    },
    {
      month:"July",
      visits:stats.visits
    },
     {
      month:"aug",
      visits:stats.visits
    },
     {
      month:"sep",
      visits:stats.visits
    },
     {
      month:"oct",
      visits:stats.visits
    },
     {
      month:"nov",
      visits:stats.visits
    },
     {
      month:"dec",
      visits:stats.visits
    }
  ];


  return(

<div>

<div
style={{
background:"#D4AF37",
padding:"15px",
borderRadius:"10px",
marginBottom:"30px",
fontWeight:"bold"
}}
>
Welcome to CreatorStore 🚀
</div>


<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:"25px"
}}
>

<div>

<h1>
Welcome back,
{" "}
{userData?.name ||
"Creator"}!
</h1>

<p
style={{
color:"#f11329"
}}
>
{" "}
{userData?.storeURL}
</p>

</div>

<button
onClick={copyLink}
style={{
background:"#be8734fb",
border:"none",
padding:"12px 20px",
borderRadius:"10px",
cursor:"pointer",
fontWeight:"bold"
}}
>
🔗 Share Store Link
</button>

{/* Social Media Icons */}
<div
style={{
display:"flex",
justifyContent:"center",
gap:"20px",
marginTop:"20px"
}}
>

<a
href="https://tiktok.com"
target="_blank"
rel="noopener noreferrer"
style={{color:"black", fontSize:"28px"}}
>
<FaTiktok />
</a>

<a
href="https://facebook.com"
target="_blank"
rel="noopener noreferrer"
style={{color:"#1877F2", fontSize:"28px"}}
>
<FaFacebook />
</a>

<a
href="https://youtube.com"
target="_blank"
rel="noopener noreferrer"
style={{color:"#FF0000", fontSize:"28px"}}
>
<FaYoutube />
</a>

<a
href="https://instagram.com"
target="_blank"
rel="noopener noreferrer"
style={{color:"#E4405F", fontSize:"28px"}}
>
<FaInstagram />
</a>

</div>

</div>


{/* LIVE STATS */}

<div
style={{
display:"grid",
gridTemplateColumns:
"repeat(auto-fit,minmax(220px,1fr))",
gap:"20px"
}}
>

<div
style={{
background:"white",
padding:"20px",
borderRadius:"12px"
}}
>
<h3>👀 Store Visits</h3>
<h2>{stats.visits}</h2>
</div>

<div
style={{
background:"white",
padding:"20px",
borderRadius:"12px"
}}
>
<h3>💰 Revenue</h3>
<h2>
${stats.revenue}
</h2>
</div>

<div
style={{
background:"white",
padding:"20px",
borderRadius:"12px"
}}
>
<h3>📦 Products</h3>
<h2>
{stats.products}
</h2>
</div>

<div
style={{
background:"white",
padding:"20px",
borderRadius:"12px"
}}
>
<h3>👥 Customers</h3>
<h2>
{stats.customers}
</h2>
</div>

</div>


{/* GRAPH */}

<div
style={{
marginTop:"40px",
background:"#D4AF37",
padding:"25px",
borderRadius:"15px"
}}
>

<h2
style={{
marginBottom:"20px"
}}
>
📈 Store Analytics
</h2>

<div
style={{
width:"100%",
height:"300px"
}}
>

<ResponsiveContainer
width="100%"
height="100%"
>

<LineChart
data={graphData}
>

<XAxis
dataKey="month"
/>

<YAxis/>

<Tooltip/>

<Line
type="monotone"
dataKey="visits"
stroke="#3417d9"
strokeWidth={3}
/>

</LineChart>

</ResponsiveContainer>

</div>

</div>

</div>

);

}