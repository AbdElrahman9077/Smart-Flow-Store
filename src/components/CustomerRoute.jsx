import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../lib/auth";

/**
 * CustomerRoute - Protects routes that require authentication.
 * Redirects unauthenticated users to /login.
 */
function CustomerRoute({ children, fallback = null }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="route-loading">
        <div className="route-loading-spinner" />
      </div>
    );
  }

  if (!user) {
    if (fallback) return fallback;
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default CustomerRoute;
