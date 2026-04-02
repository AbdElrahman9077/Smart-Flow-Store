import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PageWrapper from "../components/PageWrapper";

function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch users error:", error);
      } else {
        setUsers(data || []);
      }
    }

    fetchUsers();
  }, []);

  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">Admin Users</h1>

        <div className="orders-grid">
          {users.map((user) => (
            <div className="order-card" key={user.id}>
              <h2>{user.full_name || "No Name"}</h2>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Admin:</strong> {user.is_admin ? "Yes" : "No"}</p>
              <p><strong>Created At:</strong> {new Date(user.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}

export default AdminUsers;