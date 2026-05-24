import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion as Motion, useScroll, useReducedMotion } from "framer-motion";
import { signOutUser } from "../lib/auth";
import { useAppContext } from "../context/AppContext";
import useAdmin from "../hooks/useAdmin";

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

function Navbar() {
  const navigate = useNavigate();
  const { t, toggleLanguage, language, toggleTheme, theme } = useAppContext();
  const { user, isAdmin, loading } = useAdmin();
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();

  async function handleLogout() {
    await signOutUser();
    navigate("/");
  }

  const publicLinks = [
    ["/", t.home],
    ["/products", t.products],
    ["/bundles", t.bundles],
    ["/free-templates", t.freeTemplates],
    ["/custom-request", t.customRequest],
    ["/faq", t.faq],
    ["/contact", t.contact],
  ];

  return (
    <Motion.nav
      className="navbar"
      initial={reduce ? false : { opacity: 0, y: -12 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      style={{ "--nav-shadow-progress": scrollY }}
      transition={{ duration: 0.3 }}
    >
      <div className="container nav-content">
        <h2 className="logo">
          <Link to="/">Excel Store</Link>
        </h2>

        <ul className="nav-links">
          {publicLinks.map(([to, label]) => (
            <li key={to}>
              <NavLink to={to} className={({ isActive }) => (isActive ? "active" : "")} end={to === "/"}>
                {label}
              </NavLink>
            </li>
          ))}

          {user && (
            <li className="nav-menu">
              <Link to="/account" className="nav-outline-btn">{t.account}</Link>
              <div className="nav-menu-panel">
                <Link to="/account">Dashboard</Link>
                <Link to="/account/orders">Orders</Link>
                <Link to="/account/downloads">Downloads</Link>
                <Link to="/account/licenses">Licenses</Link>
                <Link to="/account/custom-requests">Custom Requests</Link>
                <Link to="/account/support">Support</Link>
                <Link to="/account/profile">Profile</Link>
              </div>
            </li>
          )}

          {!loading && isAdmin && (
            <li className="nav-menu">
              <Link to="/admin/dashboard" className="nav-outline-btn">{t.admin}</Link>
              <div className="nav-menu-panel">
                {adminLinks.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}
              </div>
            </li>
          )}
        </ul>

        <div className="nav-actions">
          {!user ? (
            <>
              <Link to="/login" className="nav-outline-btn">{t.login}</Link>
              <Link to="/register" className="nav-primary-btn">{t.register}</Link>
            </>
          ) : (
            <button className="nav-text-btn" onClick={handleLogout}>{t.logout}</button>
          )}
          <button className="small-toggle-btn" onClick={toggleLanguage}>{language === "en" ? "AR" : "EN"}</button>
          <button className="small-toggle-btn" onClick={toggleTheme}>{theme === "light" ? "Dark" : "Light"}</button>
        </div>
      </div>
    </Motion.nav>
  );
}

export default Navbar;
