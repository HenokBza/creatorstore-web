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
          Create. Sell. Grow. <br />
           Turn Your Knowledge, Into Income
        </h1>
        <p
  style={{
    marginTop: "20px",
    fontSize: "1.2rem",
    maxWidth: "600px",
    marginLeft: "auto",
    marginRight: "auto",
  }}
>
  CreatorStore is the easiest way to make money online. <br />
All of your courses, digital products, <br />
 and bookings are now hosted right within your link-in-bio.
  

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
        <div
  style={{
    marginTop: "80px",
    textAlign: "center",
  }}
>
  <h3>Why CreatorStore?</h3>

  <p>
    No coding. No complicated setup.
    Start selling in minutes.
  </p>
</div>
      </section>
    </main>
  );
}