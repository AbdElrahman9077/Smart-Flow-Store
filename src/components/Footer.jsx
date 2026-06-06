import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

function Footer() {
  const { t, tx } = useAppContext();
  const groups = [
    [tx("Products", "المنتجات"), [
      ["/products", t.products],
      ["/free-templates", t.freeTemplates],
      ["/bundles", t.bundles],
      ["/web-apps", t.webApps],
      ["/saas", t.saas],
      ["/desktop-software", t.desktopSoftware],
    ]],
    [tx("Company", "الشركة"), [
      ["/about", t.about],
      ["/custom-request", t.customRequest],
      ["/contact", t.contact],
    ]],
    [tx("Support", "الدعم"), [
      ["/faq", t.faq],
      ["/docs", t.docs],
      ["/contact", t.contact],
    ]],
    [tx("Legal", "القانوني"), [
      ["/terms", tx("Terms", "الشروط")],
      ["/privacy", tx("Privacy", "الخصوصية")],
    ]],
    [tx("Account", "الحساب"), [
      ["/login", t.login],
      ["/account", t.account],
    ]],
  ];

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <strong>Smart Flow Hub</strong>
          <p>
            {tx(
              "A Smart Flow Hub foundation for Excel products, digital downloads, custom requests, partial customer/admin portals, support workflows, and secure-download infrastructure. Production payments, subscriptions, desktop activation, and real email delivery are still pending modules.",
              "أساس Smart Flow Hub لمنتجات Excel والتحميلات الرقمية والطلبات المخصصة وبوابات العملاء والإدارة الجزئية والدعم وبنية التحميل الآمن. الدفع الإنتاجي والاشتراكات وتفعيل سطح المكتب والبريد الحقيقي ما زالت وحدات قيد التنفيذ."
            )}
          </p>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          {groups.map(([title, links]) => (
            <div className="footer-link-group" key={title}>
              <strong>{title}</strong>
              {links.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}
            </div>
          ))}
        </nav>
        <div className="footer-trust">
          <span>{tx("Secure-download function exists", "توجد دالة تحميل آمن")}</span>
          <span>{tx("Manual checkout foundation", "أساس دفع يدوي")}</span>
          <span>{tx("Manual payment confirmation", "تأكيد دفع يدوي")}</span>
          <span>{tx("Support foundation", "أساس الدعم")}</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>(c) 2026 Smart Flow Hub. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
