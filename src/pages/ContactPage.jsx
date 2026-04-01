import PageWrapper from "../components/PageWrapper";
function ContactPage() {
  return (
    <PageWrapper>

   
    <div className="container page-section">
      <div className="details-box">
        <h1>Contact Us</h1>
        <p className="details-description">
          You can contact us for custom Excel systems, Excel sheet modifications,
          dashboards, and any business tool requests.
        </p>

        <div style={{ lineHeight: "2", fontSize: "18px" }}>
          <p><strong>Email:</strong> smartflow@example.com</p>
          <p><strong>Phone:</strong> +20 103 7461 971</p>
          <p><strong>WhatsApp:</strong> +20 103 7461 971</p>
        </div>

        <div style={{ marginTop: "24px" }}>
          <a
            href="https://wa.me/201037461971"
            target="_blank"
            rel="noreferrer"
            className="primary-link-btn"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
   </PageWrapper>
  );
}

export default ContactPage;