import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import PageWrapper from "../components/PageWrapper";
import { useAppContext } from "../context/AppContext";
import { StatCard } from "../components/ui";

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
      const [usersRes, totalOrdersRes, pendingOrdersRes, deliveredOrdersRes, customRes, productsRes, featuredProductsRes, downloadsRes] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "delivered"),
        supabase.from("custom_requests").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("featured", true),
        supabase.from("download_logs").select("*", { count: "exact", head: true }),
      ]);

      const mainError = usersRes.error || totalOrdersRes.error || pendingOrdersRes.error || deliveredOrdersRes.error || customRes.error || productsRes.error || featuredProductsRes.error;
      if (mainError) setErrorMessage(tx("Failed to load dashboard metrics.", "تعذر تحميل مؤشرات لوحة التحكم."));

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

  const quickActions = [
    ["/admin/products", tx("Manage products", "إدارة المنتجات")],
    ["/admin/orders", tx("Review orders", "مراجعة الطلبات")],
    ["/admin/custom-requests", tx("Custom request CRM", "إدارة الطلبات المخصصة")],
    ["/admin/coupons", tx("Create coupons", "إدارة الكوبونات")],
    ["/admin/support", tx("Support tickets", "تذاكر الدعم")],
    ["/admin/settings", tx("Store settings", "إعدادات المتجر")],
  ];

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="page-header">
          <span className="section-kicker">{tx("Control center", "مركز التحكم")}</span>
          <div className="page-header-main">
            <div>
              <h1 className="page-title">{tx("Admin Dashboard", "لوحة التحكم")}</h1>
              <p className="page-subtitle">
                {tx("Monitor sales operations, customer activity, licenses, downloads, and pending work from one focused workspace.", "راقب المبيعات ونشاط العملاء والتراخيص والتحميلات والمهام المعلقة من مساحة عمل واحدة.")}
              </p>
            </div>
            <Link to="/admin/products" className="primary-link-btn">{tx("Add or edit products", "إضافة أو تعديل منتجات")}</Link>
          </div>
        </div>

        {errorMessage && <p className="error-text">{errorMessage}</p>}

        <div className="stats-grid">
          <StatCard label={tx("Revenue", "الإيرادات")} value={loading ? "..." : "Manual"} hint={tx("Connect payment provider for live totals", "اربط بوابة الدفع لعرض الإجمالي المباشر")} />
          <StatCard label={tx("Total Orders", "إجمالي الطلبات")} value={loading ? "..." : stats.totalOrders} hint={tx("All order records", "كل سجلات الطلبات")} />
          <StatCard label={tx("Pending Orders", "طلبات قيد المراجعة")} value={loading ? "..." : stats.pendingOrders} hint={tx("Need payment confirmation", "تحتاج تأكيد الدفع")} />
          <StatCard label={tx("Customers", "العملاء")} value={loading ? "..." : stats.users} hint={tx("Registered profiles", "الحسابات المسجلة")} />
          <StatCard label={tx("Products", "المنتجات")} value={loading ? "..." : stats.products} hint={`${stats.featuredProducts} featured`} />
          <StatCard label={tx("Downloads", "التحميلات")} value={loading ? "..." : stats.downloads} hint={tx("Logged secure downloads", "تحميلات آمنة مسجلة")} />
          <StatCard label={tx("Custom Requests", "طلبات مخصصة")} value={loading ? "..." : stats.customRequests} hint={tx("CRM pipeline", "مسار إدارة العملاء")} />
          <StatCard label={tx("Delivered Orders", "طلبات مسلمة")} value={loading ? "..." : stats.deliveredOrders} hint={tx("Completed delivery flow", "مسار تسليم مكتمل")} />
        </div>

        <div className="dashboard-section">
          <h2>{tx("Priority actions", "إجراءات مهمة")}</h2>
          <div className="quick-action-grid">
            {quickActions.map(([to, label]) => (
              <Link to={to} className="secondary-link-btn quick-link" key={to}>{label}</Link>
            ))}
          </div>
        </div>

        <div className="dashboard-section details-box">
          <h2>{tx("Operations summary", "ملخص العمليات")}</h2>
          <p className="details-description">
            {tx("Use this dashboard to keep manual payments, licenses, downloads, support, and custom work synchronized before moving to a fully automated payment provider.", "استخدم هذه اللوحة لمزامنة الدفع اليدوي والتراخيص والتحميلات والدعم والأعمال المخصصة قبل الانتقال إلى بوابة دفع مؤتمتة بالكامل.")}
          </p>
          <div className="hero-chart" aria-label="Operational activity chart">
            <span style={{ height: "35%" }} />
            <span style={{ height: "58%" }} />
            <span style={{ height: "47%" }} />
            <span style={{ height: "72%" }} />
            <span style={{ height: "64%" }} />
            <span style={{ height: "88%" }} />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default AdminDashboard;
