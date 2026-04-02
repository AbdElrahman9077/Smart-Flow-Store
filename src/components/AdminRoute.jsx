import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../lib/auth";
import { supabase } from "../lib/supabase";

function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const user = await getCurrentUser();

      if (!user) {
        setLoading(false);
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!error && data?.is_admin) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    }

    checkAdmin();
  }, []);

  if (loading) return null;

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;