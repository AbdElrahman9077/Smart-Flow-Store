import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { can, canAll, canAny, mergePermissions, normalizeAdminRole } from "../lib/adminRbac";

function useAdmin() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [adminRecord, setAdminRecord] = useState(null);
  const [role, setRole] = useState("customer");
  const [permissions, setPermissions] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const loadUserAndProfile = useCallback(async () => {
    setLoading(true);

    const {
      data: { user: currentUser },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !currentUser) {
      setUser(null);
      setProfile(null);
      setAdminRecord(null);
      setRole("customer");
      setPermissions([]);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setLoading(false);
      return;
    }

    setUser(currentUser);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, is_admin, role, status, full_name")
      .eq("id", currentUser.id)
      .single();

    if (profileError || !profileData) {
      setProfile(null);
      setAdminRecord(null);
      setRole("customer");
      setPermissions([]);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setLoading(false);
      return;
    }

    const { data: adminData } = await supabase
      .from("admin_users")
      .select("id, user_id, role, permissions, status")
      .eq("user_id", currentUser.id)
      .maybeSingle();

    const nextRole = normalizeAdminRole(adminData?.role, profileData);
    const nextStatus = adminData?.status || profileData.status || "active";
    const nextPermissions = mergePermissions(nextRole, adminData?.permissions);
    const nextIsAdmin = nextStatus !== "suspended" && nextRole !== "customer";

    setProfile(profileData);
    setAdminRecord(adminData || null);
    setRole(nextRole);
    setPermissions(nextPermissions);
    setIsAdmin(nextIsAdmin);
    setIsSuperAdmin(nextIsAdmin && nextRole === "super_admin");
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUserAndProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUserAndProfile();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserAndProfile]);

  return {
    loading,
    user,
    profile,
    adminRecord,
    role,
    status: adminRecord?.status || profile?.status || "active",
    permissions,
    isAdmin,
    isSuperAdmin,
    hasPermission: (permission) => can(permissions, permission),
    hasAnyPermission: (items) => canAny(permissions, items),
    hasAllPermissions: (items) => canAll(permissions, items),
    refreshAdmin: loadUserAndProfile,
  };
}

export default useAdmin;
