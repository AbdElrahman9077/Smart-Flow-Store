import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PageWrapper from "../components/PageWrapper";
import { useAppContext } from "../context/AppContext";

function AdminDashboard() {
  const { tx } = useAppContext();

  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    customRequests: 0,
    products: 0,
    downloads: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);

      const [
        usersRes,
        ordersRes,
        customRes,
        productsRes,
        downloadsRes,
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("custom_requests").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("download_logs").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        users: usersRes.count || 0,
        orders: ordersRes.count || 0,
        customRequests: customRes.count || 0,
        products: productsRes.count || 0,
        downloads: downloadsRes.error ? 0 : downloadsRes.count || 0,
      });

      setLoading(false);
    }

    fetchStats();
  }, []);

  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">
          {tx("Admin Dashboard", "لوحة الأدمن")}
        </h1>

        {loading ? (
          <p>{tx("Loading dashboard...", "جاري تحميل الداشبورد...")}</p>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{tx("Total Users", "إجمالي المستخدمين")}</h3>
              <p>{stats.users}</p>
            </div>

            <div className="stat-card">
              <h3>{tx("Total Orders", "إجمالي الطلبات")}</h3>
              <p>{stats.orders}</p>
            </div>

            <div className="stat-card">
              <h3>{tx("Custom Requests", "الطلبات المخصصة")}</h3>
              <p>{stats.customRequests}</p>
            </div>

            <div className="stat-card">
              <h3>{tx("Products", "المنتجات")}</h3>
              <p>{stats.products}</p>
            </div>

            <div className="stat-card">
              <h3>{tx("Downloads", "عدد التحميلات")}</h3>
              <p>{stats.downloads}</p>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default AdminDashboard;