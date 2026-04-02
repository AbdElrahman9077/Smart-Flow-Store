import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

function Hero() {
  const { t } = useAppContext();

  return (
    <header className="hero">
      <div className="container">
        <h1>{t.heroTitle}</h1>
        <p className="subtitle">{t.heroSubtitle}</p>
        <p className="description">{t.heroDescription}</p>

        <div className="hero-buttons">
          <Link to="/products" className="hero-link-btn">
            {t.browseProducts}
          </Link>
          <Link to="/custom-request" className="hero-link-btn secondary">
            {t.requestCustomWork}
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Hero;