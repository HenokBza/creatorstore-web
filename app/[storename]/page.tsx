type Props = {
  params: {
    storeName: string;
  };
};

export default function CreatorPage({
  params,
}: Props) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f8f8",
        display: "flex",
        justifyContent: "center",
        padding: "40px",
      }}
    >
      <div
        style={{
          width: "500px",
          background: "white",
          borderRadius: "20px",
          padding: "30px",
          textAlign: "center",
          boxShadow:
            "0 5px 20px rgba(0,0,0,.1)",
        }}
      >
        <img
          src="https://placehold.co/120"
          alt="profile"
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            marginBottom: "20px",
          }}
        />

        <h1>@{params.storeName}</h1>

        <p
          style={{
            color: "gray",
            marginBottom: "30px",
          }}
        >
          Helping creators grow online 🚀
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <button
            style={{
              padding: "15px",
              borderRadius: "10px",
              border: "none",
              background: "#D4AF37",
              fontWeight: "bold",
            }}
          >
            📦 My Ebook
          </button>

          <button
            style={{
              padding: "15px",
              borderRadius: "10px",
              border: "none",
              background: "#111",
              color: "white",
            }}
          >
            🎓 Course
          </button>

          <button
            style={{
              padding: "15px",
              borderRadius: "10px",
              border: "none",
              background: "#2563eb",
              color: "white",
            }}
          >
            📅 Coaching
          </button>
        </div>
      </div>
    </div>
  );
}