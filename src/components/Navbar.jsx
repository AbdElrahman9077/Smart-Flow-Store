import { Link, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { signOutUser } from "../lib/auth";
import { useAppContext } from "../context/AppContext";
import useAdmin from "../hooks/useAdmin";

function Navbar() {
  const navigate = useNavigate();
  const { t, toggleLanguage, language, toggleTheme, theme } = useAppContext();
  const { user, isAdmin, loading } = useAdmin();

  async function handleLogout() {
    await signOutUser();
    navigate("/");
  }

  const adminLinks = [
    ["/admin/dashboard", "Dashboard"],
    ["/admin/products", "Products"],
    ["/admin/orders", "Orders"],
    ["/admin/customers", "Customers"],
    ["/admin/licenses", "Licenses"],
    ["/admin/downloads", "Downloads"],
    ["/admin/coupons", "Coupons"],
    ["/admin/custom-requests", "Custom Requests"],
    ["/admin/support", "Support"],
    ["/admin/reviews", "Reviews"],
    ["/admin/logs", "Logs"],
    ["/admin/settings", "Settings"],
  ];

  return (
    <Motion.nav
      className="navbar"
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container nav-content">
        <h2 className="logo">
          <Link to="/">Smart Flow</Link>
        </h2>

        <ul className="nav-links">
          {!user ? (
            <>
              <li><Link to="/">{t.home}</Link></li>
              <li><Link to="/about">{t.about}</Link></li>

              <li>
                <Link to="/login" className="nav-outline-btn">
                  {t.login}
                </Link>
              </li>

              <li>
                <Link to="/register" className="nav-primary-btn">
                  {t.register}
                </Link>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/">{t.home}</Link></li>
              <li><Link to="/products">{t.products}</Link></li>
              <li><Link to="/about">{t.about}</Link></li>
              <li><Link to="/contact">{t.contact}</Link></li>
              <li><Link to="/account">Account</Link></li>
              <li><Link to="/account/orders">{t.myOrders}</Link></li>
              <li><Link to="/account/downloads">Downloads</Link></li>
              <li><Link to="/account/licenses">Licenses</Link></li>
              <li><Link to="/account/support">Support</Link></li>
              <li>
                <Link to="/custom-request">
                  {t.customRequest || "Custom Request"}
                </Link>
              </li>

              {!loading && isAdmin && (
                <li className="nav-menu">
                  <Link to="/admin/dashboard" className="nav-outline-btn">{t.admin || "Admin"}</Link>
                  <div className="nav-menu-panel">
                    {adminLinks.map(([to, label]) => (
                      <Link key={to} to={to}>{label}</Link>
                    ))}
                  </div>
                </li>
              )}

              <li>
                <button className="nav-text-btn" onClick={handleLogout}>
                  {t.logout}
                </button>
              </li>
            </>
          )}
        </ul>

        <div className="nav-actions">
          <button className="small-toggle-btn" onClick={toggleLanguage}>
            {language === "en" ? "AR" : "EN"}
          </button>

          <button className="small-toggle-btn" onClick={toggleTheme}>
            {theme === "light" ? "Dark" : "Light"}
          </button>

          <a
            className="whatsapp-btn"
            href="https://wa.me/201037461971"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </Motion.nav>
  );
}

export default Navbar;
