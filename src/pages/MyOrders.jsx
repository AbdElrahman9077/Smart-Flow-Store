import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/auth";
import PageWrapper from "../components/PageWrapper";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useAppContext } from "../context/AppContext";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [downloadingOrderId, setDownloadingOrderId] = useState(null);

  const { showToast } = useToast();
  const { tx, t } = useAppContext();

  function normalizeStatus(status) {
    const value = String(status || "").toLowerCase().trim();

    if (value === "pending review" || value === "pending") return "pending";
    if (value === "confirmed") return "confirmed";
    if (value === "rejected") return "rejected";
    if (value === "delivered") return "delivered";

    return "pending";
  }

  function getStatusLabel(status) {
    const normalized = normalizeStatus(status);

    if (normalized === "pending") return tx("Pending Review", "قيد المراجعة");
    if (normalized === "confirmed") return tx("Confirmed", "تم التأكيد");
    if (normalized === "rejected") return tx("Rejected", "مرفوض");
    if (normalized === "delivered") return tx("Delivered", "تم التسليم");

    return status || tx("Pending Review", "قيد المراجعة");
  }

  function canDownload(order) {
    return (
      normalizeStatus(order.status) === "confirmed" &&
      order.download_enabled === true &&
      order.download_used !== true
    );
  }

  function formatDate(value) {
    if (!value) return tx("Not available", "غير متاح");
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  }

  useEffect(() => {
    async function fetchMyOrders() {
      setLoading(true);

      const currentUser = await getCurrentUser();

      if (!currentUser) {
        setIsLoggedIn(false);
        setOrders([]);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        showToast(tx("Failed to load your orders.", "فشل تحميل طلباتك."), "error");
        setOrders([]);
        setLoading(false);
        return;
      }

      setOrders(data || []);
      setLoading(false);
    }

    fetchMyOrders();
  }, []);

  function triggerDownload(url) {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function handleDownload(order) {
    try {
      setDownloadingOrderId(order.id);

      const currentUser = await getCurrentUser();

      if (!currentUser) {
        showToast(tx("Please login first.", "سجل دخول أولًا."), "error");
        setDownloadingOrderId(null);
        return;
      }

      if (!canDownload(order)) {
        showToast(
          tx("This order is not available for download.", "هذا الطلب غير متاح للتحميل."),
          "error"
        );
        setDownloadingOrderId(null);
        return;
      }

      const { data: product, error: productError } = await supabase
        .from("products")
        .select("file_path, title, download_count")
        .eq("id", order.product_id)
        .single();

      if (productError || !product?.file_path) {
        showToast(tx("Product file not found.", "ملف المنتج غير موجود."), "error");
        setDownloadingOrderId(null);
        return;
      }

      const now = new Date().toISOString();

      const { data: lockedOrder, error: lockError } = await supabase
        .from("orders")
        .update({
          status: "delivered",
          download_enabled: false,
          download_used: true,
          download_used_at: now,
        })
        .eq("id", order.id)
        .eq("user_id", currentUser.id)
        .eq("status", "confirmed")
        .eq("download_enabled", true)
        .or("download_used.is.null,download_used.eq.false")
        .select("id")
        .maybeSingle();

      if (lockError) {
        console.error(lockError);
        showToast(tx("Could not lock this download.", "تعذر قفل هذا التحميل."), "error");
        setDownloadingOrderId(null);
        return;
      }

      if (!lockedOrder) {
        showToast(
          tx(
            "This order was already used or is no longer available.",
            "تم استخدام هذا الطلب بالفعل أو لم يعد متاحًا."
          ),
          "error"
        );
        setDownloadingOrderId(null);
        return;
      }

      const { data: signedData, error: signedError } = await supabase.storage
        .from("product-files")
        .createSignedUrl(product.file_path, 60);

      if (signedError || !signedData?.signedUrl) {
        console.error(signedError);

        await supabase
          .from("orders")
          .update({
            status: "confirmed",
            download_enabled: true,
            download_used: false,
            download_used_at: null,
          })
          .eq("id", order.id)
          .eq("user_id", currentUser.id);

        showToast(tx("Could not generate download link.", "تعذر إنشاء رابط التحميل."), "error");
        setDownloadingOrderId(null);
        return;
      }

      await Promise.allSettled([
        supabase.from("download_logs").insert([
          {
            order_id: order.id,
            user_id: currentUser.id,
            product_id: order.product_id,
          },
        ]),
        supabase
          .from("products")
          .update({ download_count: (product.download_count || 0) + 1 })
          .eq("id", order.product_id),
      ]);

      triggerDownload(signedData.signedUrl);

      setOrders((prev) =>
        prev.map((item) =>
          item.id === order.id
            ? {
                ...item,
                status: "delivered",
                download_enabled: false,
                download_used: true,
                download_used_at: now,
              }
            : item
        )
      );

      showToast(
        tx(
          "Download started. This order is now marked as delivered.",
          "بدأ التحميل وتم اعتبار الطلب مُسلّمًا."
        )
      );
    } catch (error) {
      console.error(error);
      showToast(tx("Something went wrong while downloading.", "حدث خطأ أثناء التحميل."), "error");
    } finally {
      setDownloadingOrderId(null);
    }
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">{t.myOrders}</h1>

        {loading ? (
          <div className="details-box">
            <p className="details-description">
              {tx("Loading your orders...", "جاري تحميل طلباتك...")}
            </p>
          </div>
        ) : !isLoggedIn ? (
          <div className="details-box">
            <p className="details-description">
              {tx("Please login first to view your orders.", "سجل دخول أولًا لمشاهدة طلباتك.")}
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/login" className="primary-link-btn">
                {t.login}
              </Link>
              <Link to="/products" className="secondary-link-btn">
                {tx("Browse Products", "تصفح المنتجات")}
              </Link>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="details-box">
            <p className="details-description">
              {tx("You have no orders yet.", "ليس لديك طلبات حتى الآن.")}
            </p>
            <Link to="/products" className="primary-link-btn">
              {tx("Browse Products", "تصفح المنتجات")}
            </Link>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => (
              <div className="order-card" key={order.id}>
                <div className="order-header">
                  <h2>{order.product_title || tx("Untitled Product", "منتج بدون عنوان")}</h2>
                  <span className="status-badge">{getStatusLabel(order.status)}</span>
                </div>

                <p>
                  <strong>{tx("Price:", "السعر:")}</strong> {order.product_price}{" "}
                  {order.currency}
                </p>
                <p>
                  <strong>{tx("Name:", "الاسم:")}</strong>{" "}
                  {order.customer_full_name || tx("No name", "بدون اسم")}
                </p>
                <p>
                  <strong>{tx("Email:", "البريد الإلكتروني:")}</strong>{" "}
                  {order.customer_email || tx("No email", "بدون بريد")}
                </p>
                <p>
                  <strong>{tx("Phone:", "الهاتف:")}</strong>{" "}
                  {order.customer_phone || tx("No phone", "بدون رقم")}
                </p>
                <p>
                  <strong>{tx("Payment:", "طريقة الدفع:")}</strong>{" "}
                  {order.payment_method || tx("Not specified", "غير محددة")}
                </p>
                <p>
                  <strong>{tx("Notes:", "الملاحظات:")}</strong>{" "}
                  {order.notes || tx("No notes", "لا توجد ملاحظات")}
                </p>
                <p>
                  <strong>{tx("Created At:", "تاريخ الإنشاء:")}</strong>{" "}
                  {formatDate(order.created_at)}
                </p>

                {order.download_used && (
                  <p>
                    <strong>{tx("Download Used:", "تم استخدام التحميل:")}</strong>{" "}
                    {tx("Yes", "نعم")}
                  </p>
                )}

                {order.download_used_at && (
                  <p>
                    <strong>{tx("Download Used At:", "تاريخ استخدام التحميل:")}</strong>{" "}
                    {formatDate(order.download_used_at)}
                  </p>
                )}

                {canDownload(order) && (
                  <div style={{ marginTop: 18 }}>
                    <p style={{ marginBottom: 12 }}>
                      {tx(
                        "This file can be downloaded one time only.",
                        "يمكن تحميل هذا الملف مرة واحدة فقط."
                      )}
                    </p>

                    <button
                      className="primary-btn"
                      onClick={() => handleDownload(order)}
                      disabled={downloadingOrderId === order.id}
                    >
                      {downloadingOrderId === order.id
                        ? tx("Preparing download...", "جاري تجهيز التحميل...")
                        : t.download}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default MyOrders;