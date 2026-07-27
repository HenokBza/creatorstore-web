"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import Link from "next/link";
import {
  collection, query, doc, updateDoc, getDoc, where, getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
export default function EarningsPage() {
    const [stats, setStats] = useState({
  revenue: 0,
  available: 0,
  pending: 0,
  sold: 0,
  visits: 0,
  productCount: 0,
});

const [products, setProducts] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      loadData(user.uid);
    } else {
      setLoading(false);
    }
  });

  return () => unsubscribe();
}, []);

const loadData = async (uid: string) => {
  try {
    setLoading(true);
 const user = auth.currentUser;

  if (!user) return;
    const q = query(
  collection(db, "products"),
  where("userId", "==", uid)
);
    const snapshot = await getDocs(q);

let totalRevenue = 0;
let totalCustomers = 0;
let totalVisits = 0;

const bestProducts: any[] = [];

snapshot.forEach((doc) => {
  const product = doc.data();

  totalRevenue += Number(product.revenue || 0);
  totalCustomers += Number(product.customers || 0);
  totalVisits += Number(product.visits || 0);

  bestProducts.push({
    id: doc.id,
    title: product.title,
    revenue: Number(product.revenue || 0),
    customers: Number(product.customers || 0),
    visits: Number(product.visits || 0),
    thumbnail: product.thumbnail,
    createdAt: product.createdAt,
  });
});

const userRef = doc(db, "users", uid);
const userSnap = await getDoc(userRef);

let previousRevenue = 0;
let availableBalance = totalRevenue;

if (userSnap.exists()) {
  const data = userSnap.data();

  previousRevenue = Number(data.totalRevenue || 0);
  availableBalance = Number(data.availableBalance || 0);

  const newRevenue = totalRevenue - previousRevenue;

  if (newRevenue > 0) {
    availableBalance += newRevenue;
  }

  await updateDoc(userRef, {
    totalRevenue,
    totalSales: totalCustomers,
    totalVisits,
    availableBalance,
  });
}

bestProducts.sort((a, b) => b.revenue - a.revenue);

setProducts(bestProducts);

setStats({
  revenue: totalRevenue,
  available: availableBalance,
  pending: 0,
  sold: totalCustomers,
  visits: totalVisits,
  productCount: bestProducts.length,
});
    setError("");
  } catch (err) {
    console.error(err);
    setError("Failed to load earnings.");
  } finally {
    setLoading(false);
  }
};
if (loading) {


   
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "70vh",
        fontSize: "22px",
        fontWeight: "bold",
      }}
    >
      Loading earnings...
    </div>
  );
}

if (error) {
  return (
    <div
      style={{
        color: "red",
        padding: "30px",
        fontSize: "18px",
      }}
    >
      {error}
    </div>
  );
}
return(

<div
style={{
maxWidth:"1300px",
margin:"auto"
}}
>

<h1
style={{
fontSize:"34px",
marginBottom:"8px"
}}
>
💰 Earnings
</h1>

<p
style={{
color:"#666",
marginBottom:"35px"
}}
>
Track your revenue, , payouts and business growth.
</p>

{/* TOP CARDS */}

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",
gap:"20px"
}}
>

<div
style={{
background:"white",
padding:"25px",
borderRadius:"20px",
boxShadow:"0 5px 20px rgba(0,0,0,.06)"
}}
>

<p
style={{
color:"#777",
marginBottom:"10px"
}}
>
💵 Total Revenue
</p>

<h1>
CA${stats.revenue.toFixed(2)}
</h1>

<p
style={{
color:"#16a34a",
fontWeight:"bold"
}}
>
+0% this month
</p>

</div>


<div
style={{
background:"white",
padding:"25px",
borderRadius:"20px",
boxShadow:"0 5px 20px rgba(0,0,0,.06)"
}}
>

<p
style={{
color:"#777",
marginBottom:"10px"
}}
>
💳 Available Balance
</p>

<h1>
CA${stats.available.toFixed(2)}
</h1>

<p
style={{
color:"#ebca25fd",
fontWeight:"bold"
}}
>
Ready to withdraw
</p>

</div>


<div
style={{
background:"white",
padding:"25px",
borderRadius:"20px",
boxShadow:"0 5px 20px rgba(0,0,0,.06)"
}}
>

<p
style={{
color:"#777",
marginBottom:"10px"
}}
>
⏳ Pending
</p>

<h1>
CA${stats.pending.toFixed(2)}
</h1>

<p
style={{
color:"#f59e0b",
fontWeight:"bold"
}}
>
Processing
</p>

</div>


<div
style={{
background:"white",
padding:"25px",
borderRadius:"20px",
boxShadow:"0 5px 20px rgba(0,0,0,.06)"
}}
>

<p
style={{
color:"#777",
marginBottom:"10px"
}}
>
📦 Products Sold
</p>

<h1>
{stats.sold}
</h1>

<p
style={{
color:"#555"
}}
>
Total sales
</p>

</div>

</div>

{/* CHART */}

<div
style={{
marginTop:"35px",
background:"white",
padding:"30px",
borderRadius:"20px",
boxShadow:"0 5px 20px rgba(0,0,0,.06)"
}}
>

<h2>
📈 Revenue Overview
</h2>

<div
style={{
marginTop:"25px",
height:"280px",
borderRadius:"15px",
background:
"linear-gradient(to top,#f7f7f7,#ffffff)",
display:"flex",
justifyContent:"center",
alignItems:"center",
fontSize:"20px",
color:"#888"
}}
>

<div
style={{
display:"flex",
justifyContent:"center",
alignItems:"center",
height:"100%",
fontSize:"50px",
fontWeight:"bold",
color:"#D4AF37"
}}
>

CA${stats.revenue.toFixed(2)}

</div>

</div>

</div>

{/* TWO COLUMNS */}

<div
style={{
display:"grid",
gridTemplateColumns:"2fr 1fr",
gap:"25px",
marginTop:"35px"
}}
>

{/* SALES */}

<div
style={{
background:"white",
padding:"25px",
borderRadius:"20px",
boxShadow:"0 5px 20px rgba(0,0,0,.06)"
}}
>
<h2>
🛒 Recent Sales
</h2>
<div
style={{
marginTop:"20px",
padding:"25px",
background:"#fafafa",
borderRadius:"15px",
textAlign:"center",
color:"#777"
}}
>
<div
style={{
display:"flex",
flexDirection:"column",
gap:"15px"
}}
>

{products.length===0?

(
<div>No sales yet</div>
)

:
products
.filter(p=>p.customers>0)
.map((p,i)=>(

<div
key={i}
style={{
display:"flex",
justifyContent:"space-between",
padding:"15px",
background:"#fafafa",
borderRadius:"12px"
}}
>
<div>
<b>{p.title}</b>
<div
style={{
color:"#666"
}}
>
{p.customers} customer(s)
</div>
</div>
<b>
CA${p.revenue.toFixed(2)}
</b>
</div>
))
}
</div>
</div>
</div>
{/* PAYOUT */}

<div
style={{
background:"white",
padding:"25px",
borderRadius:"20px",
boxShadow:"0 5px 20px rgba(0,0,0,.06)"
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
<h2>
🏦 Withdraw Earnings
</h2>
<h1
style={{
marginTop:"20px"
}}
>
CA${stats.available.toFixed(2)}
</h1>

<p
style={{
color:"#777",
marginTop:"10px"
}}
>
Check Availablity for payout. click withdraw
</p>

<Link href="/dashboard/earnings/withdraw">

<button
style={{
marginTop:"25px",
width:"100%",
padding:"16px",
background:"#D4AF37",
border:"none",
borderRadius:"14px",
fontWeight:"bold",
cursor:"pointer",
fontSize:"16px"
}}
>

Withdraw Earnings

</button>

</Link>

<p
style={{
marginTop:"15px",
fontSize:"13px",
color:"#777",
textAlign:"center"
}}
>
Connect a payment method to receive payouts.
go to setting → payment
</p>
</div>
</div>

{/* BOTTOM */}
<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginTop: "20px",
  }}
>
  {products.length === 0 ? (
    <div
      style={{
        background: "#fafafa",
        padding: "25px",
        borderRadius: "15px",
        textAlign: "center",
      }}
    >
      No products yet
    </div>
  ) : (
    products.map((product, index) => (
      <div
        key={index}
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "15px",
          background: "#fafafa",
          borderRadius: "12px",
        }}
      >
        <div>
          <b>{product.title}</b>
          <div
            style={{
              color: "#777",
              marginTop: "5px",
            }}
          >
            {product.customers} sales • {product.visits} visits
          </div>
        </div>
        <b>
          CA${product.revenue.toFixed(2)}
        </b>
      </div>
    ))
  )}
</div>
<div
style={{
background:"white",
padding:"25px",
borderRadius:"20px",
boxShadow:"0 5px 20px rgba(0,0,0,.06)"
}}
>
<h2>
🎯 Monthly Goal
</h2>
<h1
style={{
marginTop:"20px"
}}
>
CA${stats.revenue.toFixed(2)} / CA$1000
</h1>
<div
style={{
marginTop:"20px",
height:"16px",
background:"#ececec",
borderRadius:"50px",
overflow:"hidden"
}}
>
<div
style={{
width: `${Math.min(
(stats.revenue/1000)*100,
100
)}%`,
height:"100%",
background:"#D4AF37"
}}
/>
</div>
<p
style={{
marginTop:"15px",
color:"#777"
}}
>
{stats.revenue >= 1000
? "🎉 Congratulations! Monthly goal achieved."
: `Only CA$${(
1000-stats.revenue
).toFixed(2)} left to reach your goal.`
}
</p>
</div>
</div> )}
