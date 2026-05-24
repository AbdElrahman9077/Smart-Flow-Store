import { NavLink } from "react-router-dom";
import { StaggerContainer, StaggerItem, SlideIn } from "./animations";

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
      <SlideIn className="workspace-sidebar-shell">
      <aside className="workspace-sidebar" aria-label="Account navigation">
        <div className="workspace-sidebar-title">Account</div>
        <StaggerContainer as="nav" className="workspace-nav">
          {accountLinks.map((link) => (
            <StaggerItem key={link.to}>
            <NavLink
              to={link.to}
              end={link.end}
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

export default AccountLayout;
