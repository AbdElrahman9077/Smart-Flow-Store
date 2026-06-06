import { Navigate } from "react-router-dom";
import useAdmin from "../hooks/useAdmin";

function AdminRoute({ children, requiredPermission = null }) {
  const { loading, user, isAdmin, status, hasPermission } = useAdmin();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "40vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin || status === "suspended") {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default AdminRoute;
