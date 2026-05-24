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
          <span className="hero-kicker">{tx("Premium Excel marketplace", "منصة احترافية لحلول Excel")}</span>
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
            <input aria-label="Find Excel products" placeholder={tx("Search dashboards, inventory, CRM, finance...", "ابحث عن لوحات متابعة، مخزون، مبيعات، مالية...")} />
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
            <StaggerItem as="span">{tx("Secure delivery", "تسليم آمن")}</StaggerItem>
            <StaggerItem as="span">{tx("License management", "إدارة التراخيص")}</StaggerItem>
            <StaggerItem as="span">{tx("Admin confirmation", "تأكيد إداري للدفع")}</StaggerItem>
          </StaggerContainer>
        </StaggerContainer>

        <ScaleIn className="hero-product-panel hero-float" aria-label="Excel operations preview">
          <div className="hero-panel-header">
            <span>{tx("Operations dashboard", "لوحة عمليات")}</span>
            <strong>Excel Store Pro</strong>
          </div>
          <div className="hero-metric-grid">
            <div><small>{tx("Monthly sales", "مبيعات الشهر")}</small><strong>184K</strong></div>
            <div><small>{tx("Open orders", "طلبات مفتوحة")}</small><strong>42</strong></div>
            <div><small>{tx("Active licenses", "تراخيص نشطة")}</small><strong>318</strong></div>
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
            <span>{tx("Inventory tracker", "متابعة المخزون")}</span>
            <span>{tx("Sales CRM", "إدارة المبيعات")}</span>
            <span>{tx("Finance planner", "تخطيط مالي")}</span>
          </div>
        </ScaleIn>
      </div>
    </header>
  );
}

export default Hero;
