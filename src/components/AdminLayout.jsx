import { NavLink } from "react-router-dom";
import { StaggerContainer, StaggerItem, SlideIn } from "./animations";
import { useAppContext } from "../context/AppContext";
import useAdminPermissions from "../hooks/useAdminPermissions";
import { ADMIN_ROUTE_PERMISSIONS } from "../lib/adminRbac";

function AdminLayout({ children }) {
  const { t } = useAppContext();
  const { role, hasPermission } = useAdminPermissions();
  const adminLinks = [
    { to: "/admin/dashboard", label: t.adminDashboard, permission: ADMIN_ROUTE_PERMISSIONS["/admin/dashboard"] },
    { to: "/admin/products", label: t.adminProducts, permission: ADMIN_ROUTE_PERMISSIONS["/admin/products"] },
    { to: "/admin/orders", label: t.adminOrders, permission: ADMIN_ROUTE_PERMISSIONS["/admin/orders"] },
    { to: "/admin/customers", label: t.adminUsers, permission: ADMIN_ROUTE_PERMISSIONS["/admin/customers"] },
    { to: "/admin/licenses", label: t.adminLicenses, permission: ADMIN_ROUTE_PERMISSIONS["/admin/licenses"] },
    { to: "/admin/downloads", label: t.adminDownloads, permission: ADMIN_ROUTE_PERMISSIONS["/admin/downloads"] },
    { to: "/admin/coupons", label: t.adminCoupons, permission: ADMIN_ROUTE_PERMISSIONS["/admin/coupons"] },
    { to: "/admin/custom-requests", label: t.adminCustomRequests, permission: ADMIN_ROUTE_PERMISSIONS["/admin/custom-requests"] },
    { to: "/admin/support", label: t.adminSupport, permission: ADMIN_ROUTE_PERMISSIONS["/admin/support"] },
    { to: "/admin/reviews", label: t.adminReviews, permission: ADMIN_ROUTE_PERMISSIONS["/admin/reviews"] },
    { to: "/admin/logs", label: t.adminLogs, permission: ADMIN_ROUTE_PERMISSIONS["/admin/logs"] },
    { to: "/admin/settings", label: t.adminSettings, permission: ADMIN_ROUTE_PERMISSIONS["/admin/settings"] },
  ].filter((link) => hasPermission(link.permission));

  return (
    <div className="workspace-layout admin-layout">
      <SlideIn className="workspace-sidebar-shell">
      <aside className="workspace-sidebar" aria-label="Admin navigation">
        <div className="workspace-sidebar-title">{t.admin} · {role}</div>
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
