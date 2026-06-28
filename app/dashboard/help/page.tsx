"use client";

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I create a product?",
      answer:
        "Go to Add Products → Create Product and select a product type.",
    },

    {
      question: "How do I upload a PDF?",
      answer:
        "Inside Digital Product, use the Upload PDF section.",
    },

    {
      question: "Can I change my profile picture?",
      answer:
        "Yes. Open your profile menu and go to Settings.",
    },

    {
      question: "How do I edit my store?",
      answer:
        "Open My Store from the sidebar and update your information.",
    },

    {
      question: "How do I receive payments?",
      answer:
        "Payment setup will be available inside Earnings.",
    },

    {
      question: "Can I create multiple products?",
      answer:
        "Yes. You can create unlimited products.",
    },

    {
      question: "Can I sell digital downloads?",
      answer:
        "Yes. CreatorStore supports PDFs, templates, guides and more.",
    },

    {
      question: "I forgot my password",
      answer:
        "Use the Forgot Password option on the login page.",
    },

    {
      question: "How do I contact support?",
      answer:
        "Email: creatorstore2@gmail.com",
    },
  ];

  return (
    <div
      style={{
        padding: "30px",
      }}
    >
      <h1
        style={{
          marginBottom: "10px",
        }}
      >
        ❓ CreatorStore Help Center
      </h1>

      <p
        style={{
          color: "gray",
          marginBottom: "30px",
        }}
      >
        Need help? Browse common questions below.
      </p>

      {faqs.map((faq, index) => (
        <div
          key={index}
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "15px",
            marginBottom: "15px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,.08)",
          }}
        >
          <h3>{faq.question}</h3>

          <p
            style={{
              color: "#666",
            }}
          >
            {faq.answer}
          </p>
        </div>
      ))}

      <div
        style={{
          marginTop: "30px",
          background: "#D4AF37",
          padding: "20px",
          borderRadius: "15px",
        }}
      >
        <h3>Still need help?</h3>

        <p>
          Contact us: creatorstore2@gmail.com
        </p>
      </div>
    </div>
  );
}