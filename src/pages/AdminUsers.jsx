import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PageWrapper from "../components/PageWrapper";
import { useAppContext } from "../context/AppContext";

function AdminUsers() {
  const { tx } = useAppContext();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  function formatDate(value) {
    if (!value) return tx("Not available", "غير متاح");
    return new Date(value).toLocaleString();
  }

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch users error:", error);
        setUsers([]);
        setLoading(false);
        return;
      }

      setUsers(data || []);
      setLoading(false);
    }

    fetchUsers();
  }, []);

  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">{tx("Admin Users", "إدارة المستخدمين")}</h1>

        {loading ? (
          <p>{tx("Loading users...", "جاري تحميل المستخدمين...")}</p>
        ) : users.length === 0 ? (
          <p>{tx("No users found.", "لا يوجد مستخدمون.")}</p>
        ) : (
          <div className="orders-grid">
            {users.map((user) => (
              <div className="order-card" key={user.id}>
                <h2>{user.full_name || tx("No Name", "بدون اسم")}</h2>

                <p>
                  <strong>{tx("Email:", "البريد الإلكتروني:")}</strong> {user.email}
                </p>

                <p>
                  <strong>{tx("Admin:", "أدمن:")}</strong>{" "}
                  {user.is_admin ? tx("Yes", "نعم") : tx("No", "لا")}
                </p>

                <p>
                  <strong>{tx("Created At:", "تاريخ الإنشاء:")}</strong>{" "}
                  {formatDate(user.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default AdminUsers;