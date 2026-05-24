import { NavLink } from "react-router-dom";
import { StaggerContainer, StaggerItem, SlideIn } from "./animations";
import { useAppContext } from "../context/AppContext";

function AccountLayout({ children }) {
  const { t } = useAppContext();
  const accountLinks = [
    { to: "/account", label: t.accountDashboard, end: true },
    { to: "/account/orders", label: t.myOrders },
    { to: "/account/downloads", label: t.downloads },
    { to: "/account/licenses", label: t.licenses },
    { to: "/account/custom-requests", label: t.adminCustomRequests },
    { to: "/account/support", label: t.support },
    { to: "/account/profile", label: t.profile },
  ];

  return (
    <div className="workspace-layout account-layout">
      <SlideIn className="workspace-sidebar-shell">
      <aside className="workspace-sidebar" aria-label="Account navigation">
        <div className="workspace-sidebar-title">{t.account}</div>
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
