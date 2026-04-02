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
      console.log("CURRENT USER:", user);

      if (!user) {
        console.log("NO USER FOUND");
        setLoading(false);
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin, email")
        .eq("id", user.id)
        .single();

      console.log("PROFILE DATA:", data);
      console.log("PROFILE ERROR:", error);

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