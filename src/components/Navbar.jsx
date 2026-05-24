import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion as Motion, useScroll, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { signOutUser } from "../lib/auth";
import { useAppContext } from "../context/AppContext";
import useAdmin from "../hooks/useAdmin";

function Navbar() {
  const navigate = useNavigate();
  const { t, toggleLanguage, language, toggleTheme, theme } = useAppContext();
  const { user, isAdmin, loading } = useAdmin();
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const accountLinks = useMemo(() => [
    ["/account", t.accountDashboard],
    ["/account/orders", t.myOrders],
    ["/account/downloads", t.downloads],
    ["/account/licenses", t.licenses],
    ["/account/custom-requests", t.adminCustomRequests],
    ["/account/support", t.support],
    ["/account/profile", t.profile],
  ], [t]);

  const adminLinks = useMemo(() => [
    ["/admin/dashboard", t.adminDashboard],
    ["/admin/products", t.adminProducts],
    ["/admin/orders", t.adminOrders],
    ["/admin/customers", t.adminUsers],
    ["/admin/licenses", t.adminLicenses],
    ["/admin/downloads", t.adminDownloads],
    ["/admin/coupons", t.adminCoupons],
    ["/admin/custom-requests", t.adminCustomRequests],
    ["/admin/support", t.adminSupport],
    ["/admin/reviews", t.adminReviews],
    ["/admin/logs", t.adminLogs],
    ["/admin/settings", t.adminSettings],
  ], [t]);

  async function handleLogout() {
    await signOutUser();
    setDrawerOpen(false);
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

  useEffect(() => {
    document.body.classList.toggle("nav-drawer-open", drawerOpen);
    return () => document.body.classList.remove("nav-drawer-open");
  }, [drawerOpen]);

  function closeDrawer() {
    setDrawerOpen(false);
  }

  function navLinkClass({ isActive }) {
    return isActive ? "active" : "";
  }

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

        <ul className="nav-links desktop-nav-links">
          {publicLinks.map(([to, label]) => (
            <li key={to}>
              <NavLink to={to} className={navLinkClass} end={to === "/"}>
                {label}
              </NavLink>
            </li>
          ))}

          {user && (
            <li className="nav-menu">
              <Link to="/account" className="nav-outline-btn">{t.account}</Link>
              <div className="nav-menu-panel">
                {accountLinks.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}
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

        <div className="nav-actions desktop-nav-actions">
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

        <button
          className="mobile-menu-btn"
          type="button"
          aria-expanded={drawerOpen}
          aria-controls="mobile-navigation"
          onClick={() => setDrawerOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
          <strong>{drawerOpen ? "Close" : "Menu"}</strong>
        </button>
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <Motion.div
            className="mobile-nav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeDrawer}
          >
            <Motion.div
              id="mobile-navigation"
              className="mobile-nav-drawer"
              initial={reduce ? false : { opacity: 0, x: language === "ar" ? -28 : 28 }}
              animate={reduce ? undefined : { opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: language === "ar" ? -18 : 18 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mobile-drawer-header">
                <Link to="/" onClick={closeDrawer} className="mobile-drawer-logo">Excel Store</Link>
                <button className="small-toggle-btn" type="button" onClick={closeDrawer}>Close</button>
              </div>

              <nav className="mobile-drawer-section" aria-label="Primary navigation">
                {publicLinks.map(([to, label]) => (
                  <NavLink key={to} to={to} end={to === "/"} className={navLinkClass} onClick={closeDrawer}>
                    {label}
                  </NavLink>
                ))}
              </nav>

              {user && (
                <div className="mobile-drawer-section">
                  <span className="mobile-drawer-kicker">{t.account}</span>
                  {accountLinks.map(([to, label]) => (
                    <NavLink key={to} to={to} end={to === "/account"} className={navLinkClass} onClick={closeDrawer}>
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}

              {!loading && isAdmin && (
                <div className="mobile-drawer-section">
                  <span className="mobile-drawer-kicker">{t.admin}</span>
                  {adminLinks.map(([to, label]) => (
                    <NavLink key={to} to={to} className={navLinkClass} onClick={closeDrawer}>
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}

              <div className="mobile-drawer-actions">
                {!user ? (
                  <>
                    <Link to="/login" className="nav-outline-btn" onClick={closeDrawer}>{t.login}</Link>
                    <Link to="/register" className="nav-primary-btn" onClick={closeDrawer}>{t.register}</Link>
                  </>
                ) : (
                  <button className="nav-text-btn" onClick={handleLogout}>{t.logout}</button>
                )}
                <button className="small-toggle-btn" onClick={toggleLanguage}>{language === "en" ? "AR" : "EN"}</button>
                <button className="small-toggle-btn" onClick={toggleTheme}>{theme === "light" ? "Dark" : "Light"}</button>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.nav>
  );
}

export default Navbar;
