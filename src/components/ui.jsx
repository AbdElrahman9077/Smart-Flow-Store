import { Link } from "react-router-dom";

export function AppButton({
  children,
  to,
  variant = "primary",
  full = false,
  loading = false,
  className = "",
  ...props
}) {
  const classes = `app-button app-button-${variant} ${full ? "app-button-full" : ""} ${className}`.trim();
  if (to) {
    return <Link to={to} className={classes}>{loading ? "Please wait" : children}</Link>;
  }
  return <button className={classes} disabled={loading || props.disabled} {...props}>{loading ? "Please wait" : children}</button>;
}

export function AppCard({ children, className = "" }) {
  return <div className={`app-card ${className}`.trim()}>{children}</div>;
}

export function AppBadge({ children, tone = "neutral", className = "" }) {
  return <span className={`app-badge app-badge-${tone} ${className}`.trim()}>{children}</span>;
}

export function PageShell({ children, className = "" }) {
  return <main className={`page-shell ${className}`.trim()}>{children}</main>;
}

export function PageHeader({ kicker, title, description, actions }) {
  return (
    <header className="page-header">
      {kicker && <span className="section-kicker">{kicker}</span>}
      <div className="page-header-main">
        <div>
          <h1 className="page-title">{title}</h1>
          {description && <p className="page-subtitle">{description}</p>}
        </div>
        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
    </header>
  );
}

export function SectionHeader({ kicker, title, description }) {
  return (
    <div className="section-title-row">
      {kicker && <span className="section-kicker">{kicker}</span>}
      <h2>{title}</h2>
      {description && <p className="section-subtitle">{description}</p>}
    </div>
  );
}

export function EmptyState({ title = "No records found", description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-mark" aria-hidden="true" />
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

export function LoadingSkeleton({ cards = 3 }) {
  return <div className="skeleton-grid">{Array.from({ length: cards }).map((_, index) => <div className="skeleton-card" key={index} />)}</div>;
}

export function StatCard({ label, value, hint, tone = "neutral" }) {
  return (
    <div className={`stat-card stat-card-${tone}`}>
      <span className="stat-label">{label}</span>
      <p className="stat-value">{value}</p>
      {hint && <small>{hint}</small>}
    </div>
  );
}

export function AppInput(props) {
  return <input className="app-field" {...props} />;
}

export function AppSelect(props) {
  return <select className="app-field" {...props} />;
}

export function AppTextarea(props) {
  return <textarea className="app-field" {...props} />;
}
