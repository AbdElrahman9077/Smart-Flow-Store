import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import PageWrapper from "../components/PageWrapper";
import { useAppContext } from "../context/AppContext";

function AdminDashboard() {
  const { tx } = useAppContext();

  const [stats, setStats] = useState({
    users: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    customRequests: 0,
    products: 0,
    featuredProducts: 0,
    downloads: 0,
  });

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setErrorMessage("");

      const [
        usersRes,
        totalOrdersRes,
        pendingOrdersRes,
        deliveredOrdersRes,
        customRes,
        productsRes,
        featuredProductsRes,
        downloadsRes,
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("status", "delivered"),
        supabase.from("custom_requests").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("featured", true),
        supabase.from("download_logs").select("*", { count: "exact", head: true }),
      ]);

      const mainError =
        usersRes.error ||
        totalOrdersRes.error ||
        pendingOrdersRes.error ||
        deliveredOrdersRes.error ||
        customRes.error ||
        productsRes.error ||
        featuredProductsRes.error;

      if (mainError) {
        setErrorMessage(
          tx("Failed to load dashboard stats.", "فشل تحميل إحصائيات الداشبورد.")
        );
      }

      setStats({
        users: usersRes.count || 0,
        totalOrders: totalOrdersRes.count || 0,
        pendingOrders: pendingOrdersRes.count || 0,
        deliveredOrders: deliveredOrdersRes.count || 0,
        customRequests: customRes.count || 0,
        products: productsRes.count || 0,
        featuredProducts: featuredProductsRes.count || 0,
        downloads: downloadsRes.error ? 0 : downloadsRes.count || 0,
      });

      setLoading(false);
    }

    fetchStats();
  }, [tx]);

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="dashboard-header">
          <div>
            <h1 className="page-title">{tx("Admin Dashboard", "لوحة الأدمن")}</h1>
            <p className="page-subtitle">
              {tx(
                "A quick overview of your platform performance and activity.",
                "نظرة سريعة على أداء المنصة وحركتها."
              )}
            </p>
          </div>
        </div>

        {loading ? (
          <p>{tx("Loading dashboard...", "جاري تحميل الداشبورد...")}</p>
        ) : (
          <>
            {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

            <div className="stats-grid">
              <div className="stat-card">
                <h3>{tx("Total Users", "إجمالي المستخدمين")}</h3>
                <p>{stats.users}</p>
              </div>

              <div className="stat-card">
                <h3>{tx("Total Orders", "إجمالي الطلبات")}</h3>
                <p>{stats.totalOrders}</p>
              </div>

              <div className="stat-card">
                <h3>{tx("Pending Orders", "الطلبات المعلقة")}</h3>
                <p>{stats.pendingOrders}</p>
              </div>

              <div className="stat-card">
                <h3>{tx("Delivered Orders", "الطلبات المسلّمة")}</h3>
                <p>{stats.deliveredOrders}</p>
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
                <h3>{tx("Featured Products", "المنتجات المميزة")}</h3>
                <p>{stats.featuredProducts}</p>
              </div>

              <div className="stat-card">
                <h3>{tx("Downloads", "عدد التحميلات")}</h3>
                <p>{stats.downloads}</p>
              </div>
            </div>

            <div className="dashboard-section">
              <h2>{tx("Quick Actions", "إجراءات سريعة")}</h2>

              <div className="quick-action-grid">
                <Link to="/admin-products" className="secondary-link-btn quick-link">
                  {tx("Manage Products", "إدارة المنتجات")}
                </Link>

                <Link to="/admin-orders" className="secondary-link-btn quick-link">
                  {tx("Manage Orders", "إدارة الطلبات")}
                </Link>

                <Link to="/admin-users" className="secondary-link-btn quick-link">
                  {tx("Manage Users", "إدارة المستخدمين")}
                </Link>

                <Link
                  to="/admin-custom-requests"
                  className="secondary-link-btn quick-link"
                >
                  {tx("Custom Requests", "الطلبات المخصصة")}
                </Link>

                <Link to="/admin-logs" className="secondary-link-btn quick-link">
                  {tx("Admin Logs", "سجلات الأدمن")}
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}

export default AdminDashboard;