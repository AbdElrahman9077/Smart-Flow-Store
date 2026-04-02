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
    const normalized = normalizeStatus(order.status);
    return (
      order.download_enabled === true ||
      normalized === "confirmed" ||
      normalized === "delivered"
    );
  }

  function formatDate(value) {
    if (!value) return tx("Not available", "غير متاح");
    return new Date(value).toLocaleString();
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
        console.error("Fetch my orders error:", error);
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

  async function handleDownload(order) {
    try {
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        showToast(tx("Please login first.", "سجل دخول أولًا."), "error");
        return;
      }

      if (!canDownload(order)) {
        showToast(
          tx("This order is not available for download yet.", "هذا الطلب غير متاح للتحميل حتى الآن."),
          "error"
        );
        return;
      }

      const { data: product, error: productError } = await supabase
        .from("products")
        .select("file_url, file_path, title, download_count")
        .eq("id", order.product_id)
        .single();

      if (productError || !product) {
        showToast(tx("Product file not found.", "ملف المنتج غير موجود."), "error");
        return;
      }

      let downloadUrl = "";

      if (product.file_path) {
        const { data: signedData, error: signedError } = await supabase.storage
          .from("product-files")
          .createSignedUrl(product.file_path, 300);

        if (signedError) {
          console.error("Signed URL error:", signedError);
        } else {
          downloadUrl = signedData?.signedUrl || "";
        }
      }

      if (!downloadUrl && product.file_url) {
        downloadUrl = product.file_url;
      }

      if (!downloadUrl) {
        showToast(
          tx("No downloadable file found for this product.", "لا يوجد ملف قابل للتحميل لهذا المنتج."),
          "error"
        );
        return;
      }

      const { error: logError } = await supabase.from("download_logs").insert([
        {
          order_id: order.id,
          user_id: currentUser.id,
          product_id: order.product_id,
        },
      ]);

      if (logError) {
        console.error("Download log insert error:", logError);
      }

      const { error: countError } = await supabase
        .from("products")
        .update({ download_count: (product.download_count || 0) + 1 })
        .eq("id", order.product_id);

      if (countError) {
        console.error("Download count update error:", countError);
      }

      window.open(downloadUrl, "_blank");
      showToast(tx("Download started successfully.", "بدأ التحميل بنجاح."));
    } catch (error) {
      console.error(error);
      showToast(
        tx("Something went wrong while downloading.", "حدث خطأ أثناء التحميل."),
        "error"
      );
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

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
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
                  <strong>{tx("Price:", "السعر:")}</strong>{" "}
                  {order.product_price} {order.currency}
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
                  <strong>{tx("Proof File:", "ملف الإثبات:")}</strong>{" "}
                  {order.proof_file_name || tx("No file uploaded", "لم يتم رفع ملف")}
                </p>

                <p>
                  <strong>{tx("Notes:", "الملاحظات:")}</strong>{" "}
                  {order.notes || tx("No notes", "لا توجد ملاحظات")}
                </p>

                <p>
                  <strong>{tx("Created At:", "تاريخ الإنشاء:")}</strong>{" "}
                  {formatDate(order.created_at)}
                </p>

                {canDownload(order) && (
                  <div style={{ marginTop: "18px" }}>
                    <button className="primary-btn" onClick={() => handleDownload(order)}>
                      {t.download}
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