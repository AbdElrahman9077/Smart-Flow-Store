import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { getCurrentUser } from "../../lib/auth";
import PageWrapper from "../../components/PageWrapper";
import { useAppContext } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import { formatDateTime } from "../../lib/utils";

// Reuse status logic from MyOrders
function getStatusBadgeClass(status) {
  if (status === "confirmed" || status === "completed" || status === "delivered") return "badge-success";
  if (status === "pending") return "badge-warning";
  if (status === "rejected" || status === "cancelled") return "badge-danger";
  return "badge-default";
}

function AccountOrders() {
  const { tx } = useAppContext();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    async function load() {
      const currentUser = await getCurrentUser();
      if (!currentUser) return;

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        showToast(tx("Failed to load orders", "فشل تحميل الطلبات"), "error");
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  function canDownload(order) {
    const s = (order.status || "").toLowerCase();
    return (s === "confirmed" || s === "paid") && order.download_enabled === true && order.download_used !== true;
  }

  async function handleDownload(order) {
    setDownloadingId(order.id);
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) { showToast(tx("Please login", "سجل دخولك"), "error"); return; }

      const { data: product } = await supabase.from("products").select("file_path, title").eq("id", order.product_id).single();
      if (!product?.file_path) { showToast(tx("File not found", "الملف غير موجود"), "error"); return; }

      const now = new Date().toISOString();
      const { data: locked } = await supabase
        .from("orders")
        .update({ status: "delivered", download_enabled: false, download_used: true, download_used_at: now })
        .eq("id", order.id).eq("user_id", currentUser.id).eq("status", "confirmed").eq("download_enabled", true)
        .or("download_used.is.null,download_used.eq.false")
        .select("id").maybeSingle();

      if (!locked) { showToast(tx("Order already downloaded or unavailable", "الطلب محمّل مسبقًا أو غير متاح"), "error"); return; }

      const { data: signed } = await supabase.storage.from("product-files").createSignedUrl(product.file_path, 60);
      if (!signed?.signedUrl) { showToast(tx("Could not generate download link", "تعذر إنشاء رابط التحميل"), "error"); return; }

      await supabase.from("download_logs").insert([{ order_id: order.id, user_id: currentUser.id, product_id: order.product_id }]);

      const a = document.createElement("a"); a.href = signed.signedUrl; a.target = "_blank"; a.rel = "noopener noreferrer"; document.body.appendChild(a); a.click(); a.remove();
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: "delivered", download_enabled: false, download_used: true } : o));
      showToast(tx("Download started!", "بدأ التحميل!"));
    } catch { showToast(tx("Download error", "خطأ في التحميل"), "error"); }
    finally { setDownloadingId(null); }
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="page-header-row">
          <h1 className="page-title">{tx("My Orders", "طلباتي")}</h1>
          <Link to="/products" className="primary-link-btn">{tx("Browse More", "تصفح المزيد")}</Link>
        </div>

        {loading ? (
          <div className="orders-grid">{[1,2].map(i => <div key={i} className="order-card skeleton-card" style={{height:120}}><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line short" /></div>)}</div>
        ) : orders.length === 0 ? (
          <div className="products-empty">
            <div className="empty-icon">📦</div>
            <h3>{tx("No orders yet", "لا توجد طلبات بعد")}</h3>
            <Link to="/products" className="primary-link-btn" style={{ marginTop: 16 }}>{tx("Shop Now", "تسوّق الآن")}</Link>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => (
              <div className="order-card" key={order.id}>
                <div className="order-header">
                  <div>
                    <h2>{order.product_title || tx("Product", "المنتج")}</h2>
                    <small style={{ color: "#64748b" }}>{order.order_number || `#${order.id}`}</small>
                  </div>
                  <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="order-meta-row">
                  <span>💰 {order.product_price} {order.currency}</span>
                  <span>📅 {formatDateTime(order.created_at)}</span>
                  <span>💳 {order.payment_method || "—"}</span>
                </div>
                {canDownload(order) && (
                  <div style={{ marginTop: 14 }}>
                    <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 10 }}>
                      {tx("⚠️ One-time download. Use it now.", "⚠️ تحميل لمرة واحدة. استخدمه الآن.")}
                    </p>
                    <button
                      className="primary-btn"
                      onClick={() => handleDownload(order)}
                      disabled={downloadingId === order.id}
                    >
                      {downloadingId === order.id ? tx("Downloading...", "جاري التحميل...") : tx("⬇️ Download", "⬇️ تحميل")}
                    </button>
                  </div>
                )}
                {order.download_used && (
                  <p style={{ marginTop: 12, color: "#64748b", fontSize: 13 }}>
                    ✅ {tx("Downloaded", "تم التحميل")} — {formatDateTime(order.download_used_at)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default AccountOrders;
