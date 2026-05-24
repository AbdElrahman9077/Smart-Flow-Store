import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

function Hero() {
  const { t, tx } = useAppContext();

  return (
    <header className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="hero-kicker">{tx("Premium Excel marketplace", "منصة احترافية لحلول Excel")}</span>
          <h1>{t.heroTitle}</h1>
          <p className="subtitle">{t.heroSubtitle}</p>
          <p className="description">{t.heroDescription}</p>
          <div className="hero-search" role="search">
            <input aria-label="Find Excel products" placeholder={tx("Search dashboards, inventory, CRM, finance...", "ابحث عن لوحات متابعة، مخزون، مبيعات، مالية...")} />
            <Link to="/products" className="primary-link-btn">{t.browseProducts}</Link>
          </div>
          <div className="hero-buttons">
            <Link to="/products" className="hero-link-btn">{t.browseProducts}</Link>
            <Link to="/custom-request" className="hero-link-btn secondary">{t.requestCustomWork}</Link>
          </div>
          <div className="trust-strip" aria-label="Marketplace trust signals">
            <span>{tx("Secure delivery", "تسليم آمن")}</span>
            <span>{tx("License management", "إدارة التراخيص")}</span>
            <span>{tx("Admin confirmation", "تأكيد إداري للدفع")}</span>
          </div>
        </div>

        <div className="hero-product-panel" aria-label="Excel operations preview">
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
        </div>
      </div>
    </header>
  );
}

export default Hero;
