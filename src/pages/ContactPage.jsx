import { Link } from "react-router-dom";
import { useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { useAppContext } from "../context/AppContext";

function ContactPage() {
  const { tx, t } = useAppContext();
  const [sent, setSent] = useState(false);

  function submit(event) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <PageWrapper>
      <section className="page-section">
        <div className="container contact-grid">
          <div className="details-box">
            <span className="section-kicker">{tx("Contact", "تواصل معنا")}</span>
            <h1>{tx("Talk to us about Excel systems, support, or custom work", "تواصل معنا بخصوص أنظمة Excel أو الدعم أو الطلبات المخصصة")}</h1>
            <p className="details-description">
              {tx(
                "Send a clear request and we will route it to the right workflow: product questions, custom Excel builds, or post-purchase support.",
                "أرسل طلبك بوضوح وسنوجهه للمسار المناسب: استفسارات المنتجات، تنفيذ Excel مخصص، أو دعم بعد الشراء."
              )}
            </p>
            <div className="contact-card-grid">
              <div className="feature-tile">
                <strong>{tx("Sales inquiries", "استفسارات الشراء")}</strong>
                <span>{tx("Questions about products, bundles, and manual payment.", "أسئلة عن المنتجات والحزم والدفع اليدوي.")}</span>
              </div>
              <div className="feature-tile">
                <strong>{tx("Custom solutions", "الحلول المخصصة")}</strong>
                <span>{tx("Discovery requests for dashboards, trackers, and business systems.", "طلبات تحليل وتنفيذ للوحات المتابعة وأدوات التتبع وأنظمة الأعمال.")}</span>
              </div>
              <div className="feature-tile">
                <strong>{t.support}</strong>
                <span>{tx("Help with orders, downloads, licenses, and updates.", "مساعدة في الطلبات والتحميلات والتراخيص والتحديثات.")}</span>
              </div>
            </div>
            <div className="contact-details">
              <p><strong>{t.email}:</strong> support@example.com</p>
              <p><strong>{tx("Response time", "وقت الرد")}:</strong> {tx("Within one business day", "خلال يوم عمل واحد")}</p>
            </div>
            <div className="section-actions">
              <Link to="/custom-request" className="primary-link-btn">{t.requestCustomWork}</Link>
              <Link to="/faq" className="secondary-link-btn">{t.faq}</Link>
            </div>
          </div>

          <div className="details-box">
            <h2>{tx("Send a message", "إرسال رسالة")}</h2>
            <form className="checkout-form" onSubmit={submit}>
              <div className="form-group">
                <label>{t.fullName}</label>
                <input required />
              </div>
              <div className="form-group">
                <label>{t.email}</label>
                <input type="email" required />
              </div>
              <div className="form-group">
                <label>{tx("Topic", "الموضوع")}</label>
                <select>
                  <option>{tx("Product question", "استفسار عن منتج")}</option>
                  <option>{tx("Custom Excel request", "طلب Excel مخصص")}</option>
                  <option>{tx("Support request", "طلب دعم")}</option>
                </select>
              </div>
              <div className="form-group">
                <label>{tx("Message", "الرسالة")}</label>
                <textarea rows="5" required />
              </div>
              {sent && <div className="form-message">{tx("Message prepared. Connect this form to your notification service before production.", "تم تجهيز الرسالة. اربط هذا النموذج بخدمة الإشعارات قبل الإنتاج.")}</div>}
              <button type="submit" className="primary-btn">{t.send}</button>
            </form>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

export default ContactPage;
