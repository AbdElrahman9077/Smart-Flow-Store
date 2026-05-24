import { NavLink } from "react-router-dom";
import { StaggerContainer, StaggerItem, SlideIn } from "./animations";
import { useAppContext } from "../context/AppContext";

function AdminLayout({ children }) {
  const { t } = useAppContext();
  const adminLinks = [
    { to: "/admin/dashboard", label: t.adminDashboard },
    { to: "/admin/products", label: t.adminProducts },
    { to: "/admin/orders", label: t.adminOrders },
    { to: "/admin/customers", label: t.adminUsers },
    { to: "/admin/licenses", label: t.adminLicenses },
    { to: "/admin/downloads", label: t.adminDownloads },
    { to: "/admin/coupons", label: t.adminCoupons },
    { to: "/admin/custom-requests", label: t.adminCustomRequests },
    { to: "/admin/support", label: t.adminSupport },
    { to: "/admin/reviews", label: t.adminReviews },
    { to: "/admin/logs", label: t.adminLogs },
    { to: "/admin/settings", label: t.adminSettings },
  ];

  return (
    <div className="workspace-layout admin-layout">
      <SlideIn className="workspace-sidebar-shell">
      <aside className="workspace-sidebar" aria-label="Admin navigation">
        <div className="workspace-sidebar-title">{t.admin}</div>
        <StaggerContainer as="nav" className="workspace-nav">
          {adminLinks.map((link) => (
            <StaggerItem key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) => `workspace-nav-link ${isActive ? "active" : ""}`}
            >
              {link.label}
            </NavLink>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </aside>
      </SlideIn>
      <div className="workspace-content">{children}</div>
    </div>
  );
}

export default AdminLayout;
