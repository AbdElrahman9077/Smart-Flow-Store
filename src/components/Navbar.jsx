import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getCurrentUser, signOutUser } from "../lib/auth";
import { useAppContext } from "../context/AppContext";

function Navbar() {
  const [user, setUser] = useState(null);
  const { t, toggleLanguage, language, toggleTheme, theme } = useAppContext();

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }

    loadUser();
  }, []);

  async function handleLogout() {
    await signOutUser();
    window.location.href = "/";
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

          {user && <li><Link to="/my-orders">{t.myOrders}</Link></li>}

          {!user && <li><Link to="/login">{t.login}</Link></li>}
          {!user && <li><Link to="/register">{t.register}</Link></li>}
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