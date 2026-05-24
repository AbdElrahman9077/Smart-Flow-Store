import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { getCurrentUser } from "../../lib/auth";
import PageWrapper from "../../components/PageWrapper";
import { useAppContext } from "../../context/AppContext";
import { StatCard } from "../../components/ui";

function AccountPage() {
  const { tx } = useAppContext();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ orders: 0, licenses: 0, tickets: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const currentUser = await getCurrentUser();
      if (!currentUser) return;
      setUser(currentUser);

      const [ordersRes, licensesRes, ticketsRes] = await Promise.allSettled([
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("user_id", currentUser.id),
        supabase.from("licenses").select("*", { count: "exact", head: true }).eq("user_id", currentUser.id).eq("status", "active"),
        supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("user_id", currentUser.id).eq("status", "open"),
      ]);

      setStats({
        orders: ordersRes.status === "fulfilled" ? ordersRes.value.count || 0 : 0,
        licenses: licensesRes.status === "fulfilled" ? licensesRes.value.count || 0 : 0,
        tickets: ticketsRes.status === "fulfilled" ? ticketsRes.value.count || 0 : 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  const menuItems = [
    { label: tx("Orders", "الطلبات"), sub: tx("Review purchase history and status", "راجع سجل الشراء وحالة الطلبات"), to: "/account/orders" },
    { label: tx("Downloads", "التحميلات"), sub: tx("Access approved product downloads", "الوصول إلى ملفات المنتجات بعد الاعتماد"), to: "/account/downloads" },
    { label: tx("Licenses", "التراخيص"), sub: tx("Manage product license keys", "إدارة مفاتيح تراخيص المنتجات"), to: "/account/licenses" },
    { label: tx("Custom Requests", "الطلبات المخصصة"), sub: tx("Track tailored Excel work", "متابعة أعمال Excel المخصصة"), to: "/account/custom-requests" },
    { label: tx("Support", "الدعم"), sub: tx("Open and manage support tickets", "فتح وإدارة تذاكر الدعم"), to: "/account/support" },
    { label: tx("Profile", "الملف الشخصي"), sub: tx("Review account details", "مراجعة بيانات الحساب"), to: "/account/profile" },
  ];

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="page-header">
          <span className="section-kicker">{tx("Customer portal", "بوابة العميل")}</span>
          <div className="page-header-main">
            <div>
              <h1 className="page-title">{tx("Account Dashboard", "لوحة حسابي")}</h1>
              <p className="page-subtitle">
                {tx("Manage orders, downloads, licenses, support, and custom Excel requests from one organized workspace.", "أدر الطلبات والتحميلات والتراخيص والدعم وطلبات Excel المخصصة من مساحة واحدة منظمة.")}
              </p>
            </div>
            <Link to="/products" className="primary-link-btn">{tx("Browse products", "تصفح المنتجات")}</Link>
          </div>
        </div>

        <div className="details-box" style={{ marginBottom: 22 }}>
          <h2>{tx("Welcome", "مرحبًا")}</h2>
          <p className="details-description">{user?.email || tx("Your secure customer account is ready.", "حسابك الآمن جاهز للاستخدام.")}</p>
        </div>

        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <StatCard label={tx("Total Orders", "إجمالي الطلبات")} value={loading ? "..." : stats.orders} hint={tx("All submitted purchases", "كل عمليات الشراء")} />
          <StatCard label={tx("Active Licenses", "التراخيص النشطة")} value={loading ? "..." : stats.licenses} hint={tx("Ready for support and updates", "جاهزة للدعم والتحديثات")} />
          <StatCard label={tx("Open Tickets", "تذاكر مفتوحة")} value={loading ? "..." : stats.tickets} hint={tx("Current support conversations", "محادثات الدعم الحالية")} />
        </div>

        <div className="account-menu-grid feature-card-grid">
          {menuItems.map((item) => (
            <Link key={item.to} to={item.to} className="feature-card account-menu-card">
              <div className="account-menu-label">{item.label}</div>
              <div className="account-menu-sub">{item.sub}</div>
            </Link>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}

export default AccountPage;
