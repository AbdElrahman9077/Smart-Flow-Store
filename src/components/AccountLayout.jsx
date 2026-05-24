import { NavLink } from "react-router-dom";

const accountLinks = [
  { to: "/account", label: "Account Dashboard", end: true },
  { to: "/account/orders", label: "Orders" },
  { to: "/account/downloads", label: "Downloads" },
  { to: "/account/licenses", label: "Licenses" },
  { to: "/account/custom-requests", label: "Custom Requests" },
  { to: "/account/support", label: "Support" },
  { to: "/account/profile", label: "Profile" },
];

function AccountLayout({ children }) {
  return (
    <div className="workspace-layout account-layout">
      <aside className="workspace-sidebar" aria-label="Account navigation">
        <div className="workspace-sidebar-title">Account</div>
        <nav className="workspace-nav">
          {accountLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
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

export default AccountLayout;
