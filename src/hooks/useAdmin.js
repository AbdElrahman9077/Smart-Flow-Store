import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function useAdmin() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadUserAndProfile = useCallback(async () => {
    setLoading(true);

    const {
      data: { user: currentUser },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !currentUser) {
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setUser(currentUser);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, is_admin, full_name")
      .eq("id", currentUser.id)
      .single();

    if (profileError || !profileData) {
      setProfile(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setProfile(profileData);
    setIsAdmin(!!profileData.is_admin);
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
    isAdmin,
    refreshAdmin: loadUserAndProfile,
  };
}

export default useAdmin;