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
        marginTop: "80px",
      }}
    >
      <div
  style={{
    display: "flex",
    justifyContent: "center",
    marginBottom: "25px",
  }}
>
  <img
    src="/logo.png"
    alt="creatorstorelogo"
    style={{
      width: "180px",
      height: "180px",
      borderRadius:"50%",
      objectFit:"cover",
    }}
  />
</div>

      <h1
        style={{
          fontSize: "3rem",
          fontWeight: "bold",
          lineHeight: "1.2",
        }}
      >
        Create. Sell. Grow.
        <br />
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
  CreatorStore is the simplest way to Make Money online <br/>
 by selling courses, digital products, and <br/>
  bookings—directly from your link-in-bio.

</p>
  <div
          style={{
            marginTop: "30px",
            display: "flex",
            fontWeight:
              "bold",
            gap: "10px",
            color: "#4c4ecf",
            justifyContent: "center",
          }}
        >
          <a href="/phone">
            <button>Get Started</button>
          </a>
   <div   
       style={{
            marginTop: "30px",
            display: "flex",
            fontWeight:"bold",
            gap: "10px",
            color: "#204ee6",
            justifyContent: "center",
          }}
        ></div>

          <a href="/login">
            <button>Login</button>
          </a>
        </div>
        <div
  style={{
    marginTop: "30px",
     
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