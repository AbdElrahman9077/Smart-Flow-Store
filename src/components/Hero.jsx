import { Link } from "react-router-dom";

function Hero() {
  return (
    <header className="hero">
      <div className="container">
        <h1>Smart Excel Solutions for Business</h1>
        <p className="subtitle">
          Sell Excel systems, sheets, dashboards, and custom business tools.
        </p>
        <p className="description">
          منصة متخصصة لعرض وبيع أنظمة Excel وشيتات Excel الجاهزة
          مع إمكانية طلب التخصيص والتعديل بشكل احترافي ومنظم.
        </p>

        <div className="hero-buttons">
          <Link to="/products" className="hero-link-btn">
            Browse Products
          </Link>
          <Link to="/custom-request" className="hero-link-btn secondary">
            Request Custom Work
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Hero;