import Navbar from "./components/Navbar";
export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#D4AF37",
        color: "#111",
        padding: "20px",
      }}
    >
      <Navbar />

      <section
        style={{
          textAlign: "center",
          marginTop: "100px",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "bold",
          }}
        >
          Create. Sell. Grow.
        </h1>

        <p
          style={{
            marginTop: "20px",
            fontSize: "1.2rem",
          }}
        >
          Build your store, upload products, and earn online.
        </p>

        <div
          style={{
            marginTop: "30px",
            display: "flex",
            gap: "10px",
            justifyContent: "center",
          }}
        >
          <a href="/signup">
            <button>Get Started</button>
          </a>

          <a href="/login">
            <button>Login</button>
          </a>
        </div>
      </section>
    </main>
  );
}