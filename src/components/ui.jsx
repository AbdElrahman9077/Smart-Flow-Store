import { Link } from "react-router-dom";
import { motion as Motion, useReducedMotion } from "framer-motion";

const MotionLink = Motion.create(Link);

export function AppButton({
  children,
  to,
  variant = "primary",
  full = false,
  loading = false,
  className = "",
  ...props
}) {
  const reduce = useReducedMotion();
  const classes = `app-button app-button-${variant} ${full ? "app-button-full" : ""} ${className}`.trim();
  if (to) {
    return (
      <MotionLink
        to={to}
        className={classes}
        whileHover={reduce ? undefined : { y: -1 }}
        whileTap={reduce ? undefined : { scale: 0.98 }}
      >
        {loading ? <span className="button-loading">Please wait</span> : children}
      </MotionLink>
    );
  }
  return (
    <Motion.button
      className={classes}
      disabled={loading || props.disabled}
      whileHover={reduce ? undefined : { y: -1 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      {...props}
    >
      {loading ? <span className="button-loading">Please wait</span> : children}
    </Motion.button>
  );
}

export function AppCard({ children, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <Motion.div
      className={`app-card ${className}`.trim()}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : { y: -4 }}
    >
      {children}
    </Motion.div>
  );
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
    <Motion.div className="empty-state" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}>
      <div className="empty-state-mark" aria-hidden="true" />
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </Motion.div>
  );
}

export function LoadingSkeleton({ cards = 3 }) {
  return <div className="skeleton-grid">{Array.from({ length: cards }).map((_, index) => <div className="skeleton-card" key={index} />)}</div>;
}

export function StatCard({ label, value, hint, tone = "neutral" }) {
  const reduce = useReducedMotion();
  return (
    <Motion.div
      className={`stat-card stat-card-${tone}`}
      initial={reduce ? false : { opacity: 0, y: 14, scale: 0.98 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="stat-label">{label}</span>
      <p className="stat-value">{value}</p>
      {hint && <small>{hint}</small>}
    </Motion.div>
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
