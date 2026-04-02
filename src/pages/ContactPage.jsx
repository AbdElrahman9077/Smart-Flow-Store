import PageWrapper from "../components/PageWrapper";
import { useAppContext } from "../context/AppContext";

function ContactPage() {
  const { tx } = useAppContext();

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="details-box">
          <h1>{tx("Contact Us", "تواصل معنا")}</h1>

          <p className="details-description">
            {tx(
              "You can contact us for custom Excel systems, Excel sheet modifications, dashboards, and any business tool requests.",
              "يمكنك التواصل معنا لطلب أنظمة Excel مخصصة أو تعديل شيتات Excel أو تصميم Dashboards أو أي أدوات أعمال أخرى."
            )}
          </p>

          <div style={{ lineHeight: "2", fontSize: "18px" }}>
            <p>
              <strong>{tx("Email:", "البريد الإلكتروني:")}</strong>{" "}
              alexelshater@gmail.com
            </p>

            <p>
              <strong>{tx("Phone:", "الهاتف:")}</strong> +20 103 7461 971
            </p>

            <p>
              <strong>{tx("WhatsApp:", "واتساب:")}</strong> +20 103 7461 971
            </p>
          </div>

          <div style={{ marginTop: "24px" }}>
            <a
              href="https://wa.me/201037461971"
              target="_blank"
              rel="noreferrer"
              className="primary-link-btn"
            >
              {tx("Chat on WhatsApp", "تواصل على واتساب")}
            </a>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default ContactPage;