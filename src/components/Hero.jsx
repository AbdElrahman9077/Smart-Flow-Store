import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { StaggerContainer, StaggerItem, ScaleIn } from "./animations";

function Hero() {
  const { t, tx } = useAppContext();

  return (
    <header className="hero">
      <div className="container hero-grid">
        <StaggerContainer className="hero-copy">
          <StaggerItem>
            <span className="hero-kicker">{tx("Smart Flow Hub foundation", "أساس Smart Flow Hub")}</span>
          </StaggerItem>
          <StaggerItem>
            <h1>{t.heroTitle}</h1>
          </StaggerItem>
          <StaggerItem>
            <p className="subtitle">{t.heroSubtitle}</p>
          </StaggerItem>
          <StaggerItem>
            <p className="description">{t.heroDescription}</p>
          </StaggerItem>
          <StaggerItem>
            <div className="hero-search" role="search">
              <input aria-label={t.searchProducts} placeholder={t.searchProducts} />
              <Link to="/products" className="primary-link-btn">{t.browseProducts}</Link>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="hero-buttons">
              <Link to="/products" className="hero-link-btn">{t.browseProducts}</Link>
              <Link to="/custom-request" className="hero-link-btn secondary">{t.requestCustomWork}</Link>
            </div>
          </StaggerItem>
          <StaggerContainer className="trust-strip" aria-label="Marketplace trust signals">
            <StaggerItem as="span">{tx("Excel and digital products available", "منتجات Excel والمنتجات الرقمية متاحة")}</StaggerItem>
            <StaggerItem as="span">{tx("Customer portal foundation", "أساس بوابة العملاء")}</StaggerItem>
            <StaggerItem as="span">{tx("Manual payment confirmation", "تأكيد دفع يدوي")}</StaggerItem>
          </StaggerContainer>
        </StaggerContainer>

        <ScaleIn className="hero-product-panel hero-float" aria-label="Smart Flow Hub roadmap preview">
          <div className="hero-panel-header">
            <span>{tx("Platform modules", "وحدات المنصة")}</span>
            <strong>Smart Flow Hub</strong>
          </div>
          <div className="hero-metric-grid">
            <div><small>{tx("Available now", "متاح الآن")}</small><strong>Excel</strong></div>
            <div><small>{tx("Foundation", "أساس")}</small><strong>Portal</strong></div>
            <div><small>{tx("Pending", "قيد التخطيط")}</small><strong>SaaS</strong></div>
          </div>
          <div className="hero-chart">
            <span style={{ height: "42%" }} />
            <span style={{ height: "58%" }} />
            <span style={{ height: "46%" }} />
            <span style={{ height: "74%" }} />
            <span style={{ height: "66%" }} />
            <span style={{ height: "88%" }} />
          </div>
          <div className="hero-panel-list">
            <span>{tx("Excel products and digital downloads", "منتجات Excel وتحميلات رقمية")}</span>
            <span>{tx("Custom web app requests", "طلبات تطبيقات ويب مخصصة")}</span>
            <span>{tx("SaaS and desktop licensing roadmap", "خارطة طريق SaaS وتراخيص سطح المكتب")}</span>
          </div>
        </ScaleIn>
      </div>
    </header>
  );
}

export default Hero;
