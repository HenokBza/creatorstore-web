"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";

import {
  doc, getDoc, addDoc, collection, serverTimestamp,
  query, where, orderBy, getDocs, updateDoc, increment, limit,
} from "firebase/firestore";

const ethiopianBanks = [
  "Bank of Abyssinia",
  "Zemen Bank",
  "Commercial Bank of Ethiopia (CBE)",
  "Dashen Bank",
  "Cooperative Bank of Oromia",
  "Hibret Bank",
  "Awash Bank",
  "Wegagen Bank",
  "Abay Bank",
  "Bunna Bank",
  "Lion International Bank",
  "Berhan Bank",
  "Addis International Bank",
  "Enat Bank",
  "Nib International Bank",
  "Global Bank Ethiopia",
  "Beroj Bank",
  "Tsehay Bank",
  "ZamZam Bank",
  "Hijra Bank",
  "Shabelle Bank",
  "Siinqee Bank",
  "Goh Betoch Bank",
  "Ahadu Bank"
];

export default function WithdrawPage() {
  const router = useRouter();
  const [submittedAmount, setSubmittedAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  const [amount, setAmount] = useState("");
  const [confirmedAmount, setConfirmedAmount] = useState(0); 
  const [balance, setBalance] = useState(0);
  const [pending, setPending] = useState(0);
  const [paid, setPaid] = useState(0);

  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("CAD");
  const [selectedMethod, setSelectedMethod] = useState("");

  // Payout Data fetched from user profile
  const [telebirrNumber, setTelebirrNumber] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const [withdrawMethod, setWithdrawMethod] = useState("telebirr");
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    loadCreator();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadCreator = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setCountry(data.country || "");
        setCurrency(data.currency || "CAD");
        
        // Load stored details
        setTelebirrNumber(data.telebirrPhone || data.telebirrNumber || "");
        setSelectedBank(data.selectedBank || "");
        setAccountHolder(data.bankAccountName || data.accountHolder || "");
        setAccountNumber(data.bankAccountNumber || data.accountNumber || "");

        setBalance(Number(data.availableBalance || 0));
        setPaid(Number(data.totalWithdrawn || 0));
      }

      const historyQuery = query(
        collection(db, "withdrawals"),
        where("creatorId", "==", user.uid),
        orderBy("requestedAt", "desc"),
        limit(10)
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
          pendingAmount += Number(item.finalPayout || 0);
        }
        if (item.status === "Approved") {
          paidAmount += Number(item.finalPayout || 0);
        }
      });
      setPending(pendingAmount);
      setPaid(paidAmount);
    } catch (error: any) {
      console.error("loadCreator error:", error);
      alert(error.message);
      setError("Failed to load withdrawal information.");
    }
    setLoading(false);
  };

  const continueWithdrawal = () => {
    setError("");
    const value = Number(amount);

    if (!amount) {
      setError("Enter withdrawal amount.");
      return;
    }
    if (value < 250) {
      setError("Minimum withdrawal is CA$250.");
      return;
    }
    if (value > 500) {
      setError("Maximum withdrawal is CA$500.");
      return;
    }
    if (value > balance) {
      setError("Insufficient available balance.");
      return;
    }

    setConfirmedAmount(value);
    setStep(2);
  };

  const submitWithdrawal = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Please login.");
        return;
      }
      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (!userSnap.exists()) {
        alert("Creator account not found.");
        return;
      }

      const creator = userSnap.data();

      await addDoc(collection(db, "withdrawals"), {
        creatorId: user.uid,
        creatorName: creator.name || "",
        email: creator.email || "",
        country: creator.country || "",
        method: selectedMethod,
        requestedAmount: confirmedAmount,
        finalPayout: confirmedAmount * 0.50,
        currency: creator.currency || "CAD",
        status: "Pending",
        requestedAt: serverTimestamp(),
        withdrawMethod: withdrawMethod,
        telebirrNumber: withdrawMethod === "telebirr" ? telebirrNumber : "",
        bankName: withdrawMethod === "bank" ? selectedBank : "",
        accountHolder: withdrawMethod === "bank" ? accountHolder : "",
        accountNumber: withdrawMethod === "bank" ? accountNumber : "",
      });

      await updateDoc(doc(db, "users", user.uid), {
        availableBalance: increment(-confirmedAmount),
        pendingBalance: increment(confirmedAmount * 0.50),
      });

      setBalance((prev) => prev - confirmedAmount);
      setPending((prev) => prev + confirmedAmount * 0.5);

      setHistory((prev) => [
        {
          creatorName: creator.name || "",
          accountHolder: accountHolder,
          accountNumber: accountNumber,
          bankName: selectedBank,
          withdrawMethod: withdrawMethod,
          telebirrNumber: telebirrNumber,
          requestedAmount: confirmedAmount,
          finalPayout: confirmedAmount * 0.5,
          method: selectedMethod,
          status: "Pending",
          requestedAt: {
            seconds: Math.floor(Date.now() / 1000),
          },
        },
        ...prev.slice(0, 9),
      ]);

      setSubmittedAmount(confirmedAmount);
      setStep(4);
      setAmount("");
    } catch (error: any) {
      console.error("Withdrawal Error:", error);
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          fontSize: "22px",
          fontWeight: "bold"
        }}
      >
        Loading...
      </div>
    );
  }

  // Check connectivity states
  const hasTelebirr = telebirrNumber.trim() !== "";
  const hasBank = selectedBank !== "" && accountNumber.trim() !== "";

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "40px auto",
        padding: "20px"
      }}
    >
      <Link href="/dashboard/earnings">
        ← Back to Earnings
      </Link>

      <h1
        style={{
          marginTop: "20px",
          fontSize: "36px",
          fontWeight: "bold"
        }}
      >
        💸 Withdraw Earnings
      </h1>

      <p
        style={{
          color: "#666",
          marginTop: "10px"
        }}
      >
        Withdraw your earnings securely.
      </p>

      {country === "Ethiopia" && (
        <div
          style={{
            background: "#FFF8E1",
            border: "1px solid #FFD54F",
            padding: "18px",
            borderRadius: "12px",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ marginBottom: "10px" }}>
            🇪🇹 Ethiopia Withdrawal Policy
          </h3>
          <div style={{ lineHeight: "1.8", color: "#555" }}>
            • Creator receives <strong>50%</strong> of eligible sales revenue.<br />
            • CreatorStore retains <strong>40%</strong> platform commission.<br />
            • <strong>5%</strong> withdrawal processing fee applies.<br />
            • <strong>5%</strong> transfer fee applies.<br />
            • Your final payout will be calculated before you confirm.
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginTop: "30px"
        }}
      >
        <div style={{ background: "#D4AF37", padding: "25px", fontWeight: "bold", borderRadius: "20px" }}>
          <h3>Available Balance</h3>
          <h1>CA${balance.toFixed(2)}</h1>
        </div>
        <div style={{ background: "orange", padding: "25px", borderRadius: "20px", fontWeight: "bold" }}>
          <h3>Pending</h3>
          <h1>CA${pending.toFixed(2)}</h1>
        </div>
        <div style={{ background: "green", padding: "25px", borderRadius: "20px", fontWeight: "bold" }}>
          <h3>Total Paid</h3>
          <h1>CA${paid.toFixed(2)}</h1>
        </div>
      </div>

      <div
        style={{
          background: "white",
          marginTop: "30px",
          padding: "30px",
          borderRadius: "20px"
        }}
      >
        <h2>Withdrawal Policy</h2>
        <ul style={{ lineHeight: "35px" }}>
          <li>Minimum withdrawal: CA$250</li>
          <li>Maximum withdrawal: CA$500</li>
          <li>Processing time: 1–5 business days</li>
          <li>Payouts are reviewed before sending.</li>
        </ul>

        <h2 style={{ marginTop: "30px" }}>
          Type Withdrawal Amount here
        </h2>

        <input
          type="number"
          placeholder="250"
          value={amount}
          disabled={step > 1}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            width: "50%",
            padding: "16px",
            marginTop: "15px",
            borderRadius: "12px",
            border: "1px solid #ddd",
            fontSize: "18px",
            background: step > 1 ? "#f1f5f9" : "#fff"
          }}
        />

        {error && (
          <p style={{ marginTop: "15px", color: "red" }}>
            {error}
          </p>
        )}

        {step === 1 && (
          <button
            onClick={continueWithdrawal}
            className="interactive-btn"
            style={{
              marginTop: "25px",
              width: "100%",
              padding: "16px",
              background: "#275fd8",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "17px"
            }}
          >
            Continue
          </button>
        )}

        {step === 2 && (
          <div
            style={{
              marginTop: "30px",
              padding: "30px",
              background: "#fafafa",
              borderRadius: "20px"
            }}
          >
            <h2>Choose Payout Method</h2>

            {country === "Ethiopia" ? (
              <div>
                {/* CASE 1: NO METHODS CONNECTED */}
                {!hasTelebirr && !hasBank && (
                  <div
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      padding: "20px",
                      borderRadius: "12px",
                      marginTop: "15px",
                      textAlign: "center"
                    }}
                  >
                    <p style={{ color: "#991b1b", fontWeight: "bold", marginBottom: "15px" }}>
                      ⚠️ No payout method connected! Please go to settings and connect your Telebirr or Bank account to proceed with withdrawals.
                    </p>
                    <Link href="/dashboard/settings/payments">
                      <button
                        style={{
                          padding: "12px 20px",
                          background: "#dc2626",
                          color: "white",
                          border: "none",
                          borderRadius: "10px",
                          fontWeight: "bold",
                          cursor: "pointer"
                        }}
                      >
                        Go to Payment Settings
                      </button>
                    </Link>
                  </div>
                )}

                {/* CASE 2: BOTH METHODS CONNECTED */}
                {hasTelebirr && hasBank && (
                  <div style={{ marginTop: "20px" }}>
                    <p style={{ color: "#555", marginBottom: "15px" }}>You have both Telebirr and Bank Account connected. Select where you want to receive your payout:</p>
                    <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "600", cursor: "pointer" }}>
                        <input
                          type="radio"
                          name="withdrawMethod"
                          value="telebirr"
                          checked={withdrawMethod === "telebirr"}
                          onChange={(e) => setWithdrawMethod(e.target.value)}
                        />
                        Telebirr ({telebirrNumber})
                      </label>

                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "600", cursor: "pointer" }}>
                        <input
                          type="radio"
                          name="withdrawMethod"
                          value="bank"
                          checked={withdrawMethod === "bank"}
                          onChange={(e) => setWithdrawMethod(e.target.value)}
                        />
                        Bank Account ({selectedBank} - {accountNumber})
                      </label>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedMethod(withdrawMethod === "telebirr" ? "Telebirr" : `Bank (${selectedBank})`);
                        setStep(3);
                      }}
                      className="interactive-btn"
                      style={{
                        marginTop: "10px",
                        width: "100%",
                        padding: "16px",
                        background: "#00A651",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        fontWeight: "bold",
                        cursor: "pointer"
                      }}
                    >
                      Continue with {withdrawMethod === "telebirr" ? "Telebirr" : "Bank Account"}
                    </button>
                  </div>
                )}

                {/* CASE 3: ONLY TELEBIRR CONNECTED */}
                {hasTelebirr && !hasBank && (
                  <div style={{ marginTop: "20px" }}>
                    <div
                      style={{
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        padding: "15px",
                        borderRadius: "12px",
                        marginBottom: "20px"
                      }}
                    >
                      <p style={{ color: "#166534", fontWeight: "bold" }}>📱 Connected Payout Method: Telebirr</p>
                      <p style={{ color: "#15803d", marginTop: "5px" }}>Number: {telebirrNumber}</p>
                    </div>

                    <button
                      onClick={() => {
                        setWithdrawMethod("telebirr");
                        setSelectedMethod("Telebirr");
                        setStep(3);
                      }}
                      className="interactive-btn"
                      style={{
                        width: "100%",
                        padding: "16px",
                        background: "#00A651",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        fontWeight: "bold",
                        cursor: "pointer"
                      }}
                    >
                      Continue with Telebirr
                    </button>
                  </div>
                )}

                {/* CASE 4: ONLY BANK CONNECTED */}
                {!hasTelebirr && hasBank && (
                  <div style={{ marginTop: "20px" }}>
                    <div
                      style={{
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        padding: "15px",
                        borderRadius: "12px",
                        marginBottom: "20px"
                      }}
                    >
                      <p style={{ color: "#166534", fontWeight: "bold" }}>🏦 Connected Payout Method: Bank Account</p>
                      <p style={{ color: "#15803d", marginTop: "5px" }}>{selectedBank} - Acc: {accountNumber}</p>
                    </div>

                    <button
                      onClick={() => {
                        setWithdrawMethod("bank");
                        setSelectedMethod(`Bank (${selectedBank})`);
                        setStep(3);
                      }}
                      className="interactive-btn"
                      style={{
                        width: "100%",
                        padding: "16px",
                        background: "#00A651",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        fontWeight: "bold",
                        cursor: "pointer"
                      }}
                    >
                      Continue with Bank Account
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>Stripe/PayPal configurations here</div>
            )}
          </div>
        )}

        {step === 3 && (
          <div
            style={{
              marginTop: "30px",
              padding: "30px",
              background: "#fafafa",
              borderRadius: "20px"
            }}
          >
            <h2>Confirm Withdrawal</h2>
            <div
              style={{
                background: "#f8f9fa",
                padding: "20px",
                borderRadius: "12px",
                marginTop: "20px",
                lineHeight: "2",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Withdrawal Amount</span>
                <strong>CA${Number(confirmedAmount).toFixed(2)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Creator Share</span>
                <strong>50%</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Platform Share</span>
                <strong>40%</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Withdrawal Processing Fee</span>
                <strong>5%</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Transfer Fee</span>
                <strong>5%</strong>
              </div>
              <hr style={{ margin: "15px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "22px", fontWeight: "700", color: "#16a34a" }}>
                <span>Final Amount You'll Receive</span>
                <span>CA${(Number(confirmedAmount) * 0.50).toFixed(2)}</span>
              </div>
            </div>

            {withdrawMethod === "telebirr" ? (
              <p style={{ marginTop: "20px", fontWeight: "600" }}>
                📱 Telebirr Number: <strong>{telebirrNumber}</strong>
              </p>
            ) : (
              <p style={{ marginTop: "20px", fontWeight: "600" }}>
                🏦 {selectedBank}<br />Account: <strong>{accountNumber}</strong>
              </p>
            )}

            <div style={{ marginTop: "25px", display: "flex", gap: "15px" }}>
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedMethod("");
                }}
                className="interactive-btn"
                style={{
                  flex: 1,
                  padding: "16px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Back / Edit Amount
              </button>

              <button
                onClick={submitWithdrawal}
                className="interactive-btn"
                style={{
                  flex: 1,
                  padding: "16px",
                  background: "#2dceda",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div
            style={{
              marginTop: "30px",
              background: "#ecfdf5",
              padding: "30px",
              borderRadius: "20px",
              border: "2px solid #16a34a"
            }}
          >
            <h2>✅ Withdrawal Request Submitted</h2>
            <p style={{ marginTop: "20px" }}><b>Amount</b><br />CA${submittedAmount.toFixed(2)}</p>
            <p style={{ marginTop: "15px" }}><b>Method</b><br />{selectedMethod}</p>
            <p style={{ marginTop: "15px" }}><b>Status</b><br />Pending Review</p>
            <p style={{ marginTop: "15px", color: "#666" }}>
              Your withdrawal request has been submitted successfully. Our team will review your request and send your payout within 1–5 business days after Approved.
            </p>

            <Link href="/dashboard/earnings">
              <button
                className="interactive-btn"
                style={{
                  marginTop: "30px",
                  width: "100%",
                  padding: "16px",
                  background: "#D4AF37",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Back to Earnings
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Withdrawal History Section */}
      <div
        style={{
          background: "white",
          marginTop: "35px",
          padding: "30px",
          borderRadius: "20px"
        }}
      >
        <h2>Withdrawal History (Last 10 Requests)</h2>

        <div style={{ marginTop: "20px" }}>
          {history.length === 0 ? (
            <div
              style={{
                padding: "25px",
                textAlign: "center",
                background: "#fafafa",
                borderRadius: "15px",
                color: "#777"
              }}
            >
              No withdrawal history yet.
            </div>
          ) : !isMobile ? (
            <div style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "5px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1.5fr 2.5fr 1fr 1fr",
                  fontWeight: "bold",
                  padding: "8px 12px",
                  background: "#f1f5f9",
                  borderRadius: "12px",
                  marginBottom: "12px",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                }}
              >
                <div>Date</div>
                <div>Name</div>
                <div>Telebirr / Bank Account</div>
                <div>Payout</div>
                <div>Status</div>
              </div>

              {history.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1.5fr 2.5fr 1fr 1fr",
                    alignItems: "center",
                    padding: "10px",
                    background: "#fafafa",
                    borderRadius: "15px",
                    marginBottom: "10px",
                  }}
                >
                  <div>
                    {item.requestedAt?.seconds
                      ? new Date(item.requestedAt.seconds * 1000).toLocaleDateString()
                      : "Today"}
                  </div>
                  <div>{item.creatorName || "-"}</div>
                  <div>
                    {item.withdrawMethod === "telebirr" ? (
                      <>📱 Telebirr<br />{item.telebirrNumber}</>
                    ) : (
                      <>
                        🏦 {item.bankName}<br />
                        Acc: {item.accountNumber}<br />
                        <span style={{ fontSize: "13px", color: "#666" }}>Holder: {item.accountHolder || "-"}</span>
                      </>
                    )}
                  </div>
                  <div>
                    <strong>CA${Number(item.finalPayout || 0).toFixed(2)}</strong>
                  </div>
                  <div
                    style={{
                      fontWeight: "bold",
                      color:
                        item.status === "Paid"
                          ? "#16a34a"
                          : item.status === "Approved"
                          ? "#1455b5"
                          : item.status === "Rejected"
                          ? "#dc2626"
                          : "#b5a214",
                    }}
                  >
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ maxHeight: "450px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "4px" }}>
              {history.map((item, index) => (
                <div
                  key={index}
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "15px",
                    padding: "16px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>
                      {item.requestedAt?.seconds
                        ? new Date(item.requestedAt.seconds * 1000).toLocaleDateString()
                        : "Today"}
                    </div>
                    <div style={{ fontWeight: "700", fontSize: "16px", color: "#111" }}>
                      CA${Number(item.finalPayout || 0).toFixed(2)}
                    </div>
                    <div style={{ fontSize: "12px", color: "#555", marginTop: "2px" }}>
                      {item.withdrawMethod === "telebirr" ? "📱 Telebirr" : `🏦 ${item.bankName}`}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        background:
                          item.status === "Paid"
                            ? "#ecfdf5"
                            : item.status === "Approved"
                            ? "#eff6ff"
                            : item.status === "Rejected"
                            ? "#fef2f2"
                            : "#fefce8",
                        color:
                          item.status === "Paid"
                            ? "#16a34a"
                            : item.status === "Approved"
                            ? "#2563eb"
                            : item.status === "Rejected"
                            ? "#dc2626"
                            : "#ca8a04",
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}