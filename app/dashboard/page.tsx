"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { FaTiktok, FaFacebook, FaYoutube, FaInstagram } from "react-icons/fa";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function Dashboard() {
  const [userData, setUserData] = useState<any>(null);
  
  const [isOpen, setIsOpen] = useState(false);

  const [stats, setStats] = useState({
    visits: 0,
    revenue: 0,
    products: 0,
    coachingCalls: 0,
    customers: 0,
  });

  const [graphData, setGraphData] = useState([
    { month: "Jan", revenue: 0 },
    { month: "Feb", revenue: 0 },
    { month: "Mar", revenue: 0 },
    { month: "Apr", revenue: 0 },
    { month: "May", revenue: 0 },
    { month: "Jun", revenue: 0 },
    { month: "July", revenue: 0 },
    { month: "Aug", revenue: 0 },
    { month: "Sep", revenue: 0 },
    { month: "Oct", revenue: 0 },
    { month: "Nov", revenue: 0 },
    { month: "Dec", revenue: 0 },
  ]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribeUser = onSnapshot(userRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      setUserData(data);

      setStats((prev) => ({
        ...prev,
        visits: data.visits || 0,
      }));
    });

    const fetchStoreStats = async () => {
      try {
        const productsQuery = query(
          collection(db, "products"),
          where("userId", "==", user.uid)
        );
        const productsSnapshot = await getDocs(productsQuery);
        
        let productRevenue = 0;
        let productCustomers = 0;

        productsSnapshot.forEach((docSnap) => {
          const product = docSnap.data();
          productRevenue += Number(product.revenue || 0);
          productCustomers += Number(product.customers || 0);
        });

        const coachingSnapshot = await getDocs(
          collection(db, "coachingCalls")
        );

        let coachingRevenue = 0;
        let coachingCustomers = 0;
        let coachingCount = 0;

        coachingSnapshot.forEach((docSnap) => {
          const coaching = docSnap.data();
          const ownerId = coaching.creatorId || coaching.userId;

          if (ownerId === user.uid) {
            coachingCount += 1;
            coachingRevenue += Number(coaching.revenue || 0);
            coachingCustomers += Number(coaching.customers || 0);
          }
        });

        const ordersQuery = query(
          collection(db, "orders"),
          where("creatorId", "==", user.uid)
        );
        const ordersSnapshot = await getDocs(ordersQuery);

        const monthlyDataMap: { [key: string]: { revenue: number } } = {
          "Jan": { revenue: 0 },
          "Feb": { revenue: 0 },
          "Mar": { revenue: 0 },
          "Apr": { revenue: 0 },
          "May": { revenue: 0 },
          "Jun": { revenue: 0 },
          "July": { revenue: 0 },
          "Aug": { revenue: 0 },
          "Sep": { revenue: 0 },
          "Oct": { revenue: 0 },
          "Nov": { revenue: 0 },
          "Dec": { revenue: 0 },
        };
        ordersSnapshot.forEach((docSnap) => {
          const order = docSnap.data();
          const amount = Number(order.amount || 0);

          if (order.createdAt) {
            const date = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const monthStr = monthNames[date.getMonth()];

            if (monthlyDataMap[monthStr]) {
              monthlyDataMap[monthStr].revenue += amount;
            }
          }
        });

        const formattedGraphData = Object.keys(monthlyDataMap).map((month) => ({
          month,
          revenue: monthlyDataMap[month].revenue,
        }));

        setGraphData(formattedGraphData);

        const totalRevenue = productRevenue + coachingRevenue;
        const totalCustomers = productCustomers + coachingCustomers;

        setStats((prev) => ({
          ...prev,
          revenue: totalRevenue,
          products: productsSnapshot.size,
          coachingCalls: coachingCount,
          customers: totalCustomers,
        }));
      } catch (error) {
        console.error("Error fetching store stats:", error);
      }
    };

    fetchStoreStats();

    return () => {
      unsubscribeUser();
    };
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${userData?.storeURL}`);
    alert("Store link copied!");
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div
        style={{
          background: "#D4AF37",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "20px",
          fontWeight: "bold",
        }}
      >
        Welcome to CreatorStore 🚀
        <div>
          <h1>{userData?.name || "Creator"}</h1>
          <p style={{ color: "#f11329", margin: 0 }}>{userData?.storeURL}</p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button
          onClick={copyLink}
          className="interactive-btn"
          style={{
            color: "blue",
            background: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "12px",
          }}
        >
          copy Store 🔗
        </button>
      </div>

      {/* ================= FIRST INCOME GUIDE BOX ================= */}
      <div
      style={{
        background: "white",
        padding: "22px",
        borderRadius: "14px",
        marginBottom: "30px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
        borderLeft: "5px solid #14b3c5",
        lineHeight: "1.65",
        color: "#222",
        textAlign: "left",
      }}
    >
      {/* Clickable Topic Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          padding: 0,
          textAlign: "left",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div>
          <h3 style={{ margin: "0 0 6px", fontWeight: "bold", fontSize: "18px", color: "#111" }}>
            የመጀመሪያ ገቢዎን በCreatorStore.ca ላይ ለማግኘት ዝግጁ ነዎት?
          </h3>
          <p style={{ margin: 0, fontWeight: "bold",  fontSize: "18px", color: "#111" }}>
            የመጀመሪያ ገቢዎን ለማግኘት ከዚህ በታች ያሉትን ቀላል ዘዴዎችን ይከተሉ፦ ቀስቱን click ያድርጉ
          </p>
        </div>

        <span
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "#14b3c5",
            flexShrink: 0,
          }}
        >
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {/* Hidden Until Clicked */}
      {isOpen && (
        <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #eee" }}>
          <div style={{ marginBottom: "14px" }}>
            <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "bold", color: "#111" }}>
              1️⃣ Profile ፎቶዎን ያስገቡ
            </p>
            <p style={{ margin: 0, fontSize: "14px", color: "#444" }}>
              የProfile ፎቶዎን በመጨመር ሱቅዎን ለገዢዎች የበለጠ ታማኝና ማራኪ ያድርጉ።
            </p>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "bold", color: "#111" }}>
              2️⃣ Add Product የሚለውን ይጫኑ
            </p>
            <p style={{ margin: "0 0 4px", fontSize: "14px", color: "#444" }}>
              ለመሸጥ የሚፈልጉትን ምርት ይምረጡ፦
            </p>
            <ul style={{ margin: "4px 0 0", paddingLeft: "20px", fontSize: "14px", color: "#444" }}>
              <li>📚 Digital Product (ዲጂታል ምርት)</li>
              <li>🎓 Coaching (ማማክርና ስልጠና)</li>
            </ul>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "bold", color: "#111" }}>
              3️⃣ Digital Product ከመረጡ፦
            </p>
            <ul style={{ margin: "4px 0 0", paddingLeft: "20px", fontSize: "14px", color: "#444" }}>
              <li>የምርትዎን Title (ርዕስ) ያስገቡ።</li>
              <li>የምርትዎን Thumbnail (የምርት ምስል) ያስገቡ።</li>
              <li>Description (ማብራሪያ) እና Benefits (ጥቅሞች) የሚለውን ክፍል በጥሩ ሁኔታ ይሙሉ።</li>
              <li>የሚሸጡበትን የዋጋ ተመን ያስቀምጡ</li>
              <li>የሚሸጡትን Digital Product ፋይል ያስገቡ።</li>
              <li>ሁሉንም ካጠናቀቁ በኋላ Publish ያድርጉ።</li>
            </ul>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "bold", color: "#111" }}>
              4️⃣ Coaching ከመረጡ፦
            </p>
            <ul style={{ margin: "4px 0 0", paddingLeft: "20px", fontSize: "14px", color: "#444" }}>
              <li>የሚሰጡትን አገልግሎት Title (ርዕስ) ያስገቡ።</li>
              <li>Thumbnail (የአገልግሎት ምስል) ያስገቡ።</li>
              <li>Description (ማብራሪያ) እና Benefits (ጥቅሞች) የሚለውን ክፍል ይሙሉ: ሌሎች ቦታዎች በጥንቃቄ ይሙሉ።</li>
              <li>የMeeting Link ያስገቡ።</li>
              <li>ሁሉንም ካጠናቀቁ በኋላ Publish ያድርጉ።</li>
            </ul>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <p style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: "bold", color: "#111" }}>
              5️⃣ ሱቅዎን በSocial Media ላይ ያስተዋውቁ! 📢
            </p>
            <p style={{ margin: "0 0 6px", fontSize: "14px", color: "#444" }}>
             ከላይ copy store የሚለውን የStore Link ዎን ኮፒ በማድረግ በሚከተሉት የSocial Media መድረኮች bio ላይ ያጋሩ፦
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", fontSize: "14px", color: "#333", marginBottom: "6px" }}>
              <span>📱 TikTok</span>
              <span>📘 Facebook</span>
              <span>✈️ Telegram</span>
              <span>▶️ YouTube</span>
              <span>📸 Instagram</span>
              <span>💬 WhatsApp</span>
            </div>
            <p style={{ margin: 0, fontSize: "14px", color: "#444" }}>
              ብዙ ሰዎች ሊንክዎን እንዲያዩ፣ ሱቅዎን እንዲጎበኙ እና ምርትዎን እንዲገዙ ያበረታቷቸው።
            </p>
          </div>

          <p style={{ margin: "12px 0 0", fontSize: "15px", fontWeight: "bold", color: "#111" }}>
            የመጀመሪያ ገቢዎን ለማግኘት ብዙ ጊዜ መጠበቅ አያስፈልግም። የመጀመሪያ እርምጃዎን ዛሬ ይጀምሩ!
          </p>
        </div>
      )}
    </div>
  


      {/* Social Media Icons */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="interactive-btn" style={{ color: "black", fontSize: "28px" }}><FaTiktok /></a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="interactive-btn" style={{ color: "#1877F2", fontSize: "28px" }}><FaFacebook /></a>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="interactive-btn" style={{ color: "#FF0000", fontSize: "28px" }}><FaYoutube /></a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="interactive-btn" style={{ color: "#E4405F", fontSize: "28px" }}><FaInstagram /></a>
      </div>

      {/* LIVE STATS */}
     <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  }}
>
  {/* Revenue */}
  <div
    style={{
      background: "#FFFFFF",
      padding: "20px",
      borderRadius: "12px",
      border: "1px solid #E5E5E5",
      color: "#222222",
    }}
  >
    <h3 style={{ color: "#222222", fontSize: "18px", fontWeight: "600" }}>
      💰 Revenue
    </h3>
    <h2 style={{ color: "#111111", fontSize: "26px", fontWeight: "700" }}>
      ${stats.revenue}
    </h2>
  </div>

  {/* Store Visits */}
  <div
    style={{
      background: "#FFFFFF",
      padding: "20px",
      borderRadius: "12px",
      border: "1px solid #E5E5E5",
      color: "#222222",
    }}
  >
    <h3 style={{ color: "#222222", fontSize: "18px", fontWeight: "600" }}>
      👀 Store Visits
    </h3>
    <h2 style={{ color: "#111111", fontSize: "26px", fontWeight: "700" }}>
      {stats.visits}
    </h2>
  </div>

  {/* Products */}
  <div
    style={{
      background: "#FFFFFF",
      padding: "20px",
      borderRadius: "12px",
      border: "1px solid #E5E5E5",
      color: "#222222",
    }}
  >
    <h3 style={{ color: "#222222", fontSize: "18px", fontWeight: "600" }}>
      📦 Products
    </h3>
    <h2 style={{ color: "#111111", fontSize: "26px", fontWeight: "700" }}>
      {stats.products}
    </h2>
  </div>

  {/* Coaching Calls */}
  <div
    style={{
      background: "#FFFFFF",
      padding: "20px",
      borderRadius: "12px",
      border: "1px solid #E5E5E5",
      color: "#222222",
    }}
  >
    <h3 style={{ color: "#222222", fontSize: "18px", fontWeight: "600" }}>
      🎯 Coaching Calls
    </h3>
    <h2 style={{ color: "#111111", fontSize: "26px", fontWeight: "700" }}>
      {stats.coachingCalls}
    </h2>
  </div>

  {/* Customers */}
  <div
    style={{
      background: "#FFFFFF",
      padding: "20px",
      borderRadius: "12px",
      border: "1px solid #E5E5E5",
      color: "#222222",
    }}
  >
    <h3 style={{ color: "#222222", fontSize: "18px", fontWeight: "600" }}>
      👥 Customers
    </h3>
    <h2 style={{ color: "#111111", fontSize: "26px", fontWeight: "700" }}>
      {stats.customers}
    </h2>
  </div>
</div>

      {/* GRAPH */}
      <div
        style={{
          marginTop: "40px",
          background: "#D4AF37",
          padding: "25px",
          borderRadius: "15px",
        }}
      >
        <h2
          style={{
            marginBottom: "20px",
            color: "#000",
          }}
        >
          📈 Store Analytics (All Months)
        </h2>

        <div
          style={{
            width: "100%",
            overflowX: "auto",
          }}
        >
          <div
            style={{
              minWidth: "650px",
              height: "320px",
            }}
          >
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graphData}>
                <XAxis dataKey="month" stroke="#000" />
                <YAxis stroke="#000" />
                <Tooltip />
                <Bar
                  dataKey="revenue"
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}