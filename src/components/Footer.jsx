import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

function Footer() {
  const { t, tx } = useAppContext();
  const links = [
    ["/products", t.products],
    ["/bundles", t.bundles],
    ["/free-templates", t.freeTemplates],
    ["/custom-request", t.customRequest],
    ["/faq", t.faq],
    ["/contact", t.contact],
    ["/terms", tx("Terms", "الشروط")],
    ["/privacy", tx("Privacy", "الخصوصية")],
    ["/login", t.login],
  ];

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <strong>Excel Store</strong>
          <p>
            {tx(
              "Professional Excel products, secure customer access, manual payment confirmation, licenses, downloads, and customization workflows.",
              "منتجات Excel احترافية مع وصول آمن للعملاء وتأكيد دفع يدوي وتراخيص وتحميلات ومسارات تخصيص."
            )}
          </p>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          {links.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}
        </nav>
        <div className="footer-trust">
          <span>{t.secureDelivery}</span>
          <span>{t.licenseIncluded}</span>
          <span>{tx("Manual payment confirmation", "تأكيد دفع يدوي")}</span>
          <span>{t.supportAvailable}</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>(c) 2026 Smart Flow. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
