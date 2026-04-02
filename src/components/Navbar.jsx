import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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

  return (
    <motion.nav
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
          <li><Link to="/">{t.home}</Link></li>
          <li><Link to="/products">{t.products}</Link></li>
          <li><Link to="/about">{t.about}</Link></li>
          <li><Link to="/contact">{t.contact}</Link></li>

          {user && (
            <li>
              <Link to="/my-orders">{t.myOrders}</Link>
            </li>
          )}

          {user && (
            <li>
              <Link to="/custom-request">{t.customRequest || "Custom Request"}</Link>
            </li>
          )}

          {!loading && isAdmin && (
            <>
              <li>
                <Link to="/admin-dashboard">
                  {t.adminDashboard || "Admin Dashboard"}
                </Link>
              </li>
              <li>
                <Link to="/admin-products">
                  {t.adminProducts || "Admin Products"}
                </Link>
              </li>
              <li>
                <Link to="/admin-orders">
                  {t.adminOrders || "Admin Orders"}
                </Link>
              </li>
              <li>
                <Link to="/admin-users">
                  {t.adminUsers || "Admin Users"}
                </Link>
              </li>
              <li>
                <Link to="/admin-custom-requests">
                  {t.adminCustomRequests || "Custom Requests"}
                </Link>
              </li>
            </>
          )}

          {!user && (
            <li>
              <Link to="/login">{t.login}</Link>
            </li>
          )}

          {!user && (
            <li>
              <Link to="/register">{t.register}</Link>
            </li>
          )}

          {user && (
            <li>
              <button className="nav-text-btn" onClick={handleLogout}>
                {t.logout}
              </button>
            </li>
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
    </motion.nav>
  );
}

export default Navbar;