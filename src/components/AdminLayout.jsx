import { NavLink } from "react-router-dom";

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/licenses", label: "Licenses" },
  { to: "/admin/downloads", label: "Downloads" },
  { to: "/admin/coupons", label: "Coupons" },
  { to: "/admin/custom-requests", label: "Custom Requests" },
  { to: "/admin/support", label: "Support" },
  { to: "/admin/reviews", label: "Reviews" },
  { to: "/admin/logs", label: "Logs" },
  { to: "/admin/settings", label: "Settings" },
];

function AdminLayout({ children }) {
  return (
    <div className="workspace-layout admin-layout">
      <aside className="workspace-sidebar" aria-label="Admin navigation">
        <div className="workspace-sidebar-title">Admin</div>
        <nav className="workspace-nav">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `workspace-nav-link ${isActive ? "active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="workspace-content">{children}</div>
    </div>
  );
}

export default AdminLayout;
