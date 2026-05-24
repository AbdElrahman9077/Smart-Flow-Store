import { useEffect, useState } from "react";
import PageWrapper from "../../components/PageWrapper";
import { getCurrentUser } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

function AccountProfile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function load() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (!currentUser) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email, phone, status, role, created_at")
        .eq("id", currentUser.id)
        .maybeSingle();
      setProfile(data);
    }
    load();
  }, []);

  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">Profile</h1>
        <div className="details-box">
          <p className="details-description">Your customer profile and account status.</p>
          <div className="profile-grid">
            <div><strong>Name</strong><span>{profile?.full_name || "Not set"}</span></div>
            <div><strong>Email</strong><span>{profile?.email || user?.email || "Not set"}</span></div>
            <div><strong>Phone</strong><span>{profile?.phone || "Not set"}</span></div>
            <div><strong>Status</strong><span>{profile?.status || "active"}</span></div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default AccountProfile;
