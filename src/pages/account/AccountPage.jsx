import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { getCurrentUser } from "../../lib/auth";
import PageWrapper from "../../components/PageWrapper";
import { useAppContext } from "../../context/AppContext";

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
    { icon: "📦", label: tx("My Orders", "طلباتي"), sub: tx("View all your orders", "عرض كل طلباتك"), to: "/account/orders" },
    { icon: "⬇️", label: tx("Downloads", "التحميلات"), sub: tx("Download your purchased files", "تحميل ملفاتك"), to: "/account/downloads" },
    { icon: "🔑", label: tx("Licenses", "التراخيص"), sub: tx("View your license keys", "عرض مفاتيح الترخيص"), to: "/account/licenses" },
    { icon: "⚙️", label: tx("Custom Requests", "الطلبات المخصصة"), sub: tx("Track your custom orders", "تتبع طلباتك المخصصة"), to: "/account/custom-requests" },
    { icon: "🎫", label: tx("Support", "الدعم"), sub: tx("Open or view support tickets", "فتح أو عرض تذاكر الدعم"), to: "/account/support" },
  ];

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="account-header">
          <div className="account-avatar">
            {user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="page-title" style={{ textAlign: "left", marginBottom: 4 }}>
              {tx("My Account", "حسابي")}
            </h1>
            <p className="page-subtitle" style={{ textAlign: "left" }}>
              {user?.email}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: 32 }}>
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-value">{loading ? "—" : stats.orders}</div>
            <div className="stat-label">{tx("Total Orders", "إجمالي الطلبات")}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔑</div>
            <div className="stat-value">{loading ? "—" : stats.licenses}</div>
            <div className="stat-label">{tx("Active Licenses", "التراخيص النشطة")}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎫</div>
            <div className="stat-value">{loading ? "—" : stats.tickets}</div>
            <div className="stat-label">{tx("Open Tickets", "التذاكر المفتوحة")}</div>
          </div>
        </div>

        {/* Menu */}
        <div className="account-menu-grid">
          {menuItems.map((item) => (
            <Link key={item.to} to={item.to} className="account-menu-card">
              <span className="account-menu-icon">{item.icon}</span>
              <div>
                <div className="account-menu-label">{item.label}</div>
                <div className="account-menu-sub">{item.sub}</div>
              </div>
              <span className="account-menu-arrow">→</span>
            </Link>
          ))}
        </div>

        {/* CTAs */}
        <div className="account-cta-row">
          <Link to="/products" className="primary-link-btn">
            {tx("Browse Products", "تصفح المنتجات")}
          </Link>
          <Link to="/custom-request" className="secondary-link-btn">
            {tx("Request Custom Excel", "اطلب Excel مخصص")}
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}

export default AccountPage;
