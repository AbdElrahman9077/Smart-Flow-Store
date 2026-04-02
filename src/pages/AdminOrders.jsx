import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PageWrapper from "../components/PageWrapper";
import { useToast } from "../context/ToastContext";
import { useAppContext } from "../context/AppContext";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();
  const { tx } = useAppContext();

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

  function formatDate(value) {
    if (!value) return tx("Not available", "غير متاح");
    return new Date(value).toLocaleString();
  }

  function isImageFile(url) {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);
  }

  async function fetchOrders() {
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch admin orders error:", error);
      showToast(tx("Failed to load orders.", "فشل تحميل الطلبات."), "error");
      setOrders([]);
      setLoading(false);
      return;
    }

    setOrders(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  async function handleStatusChange(order, nextStatus) {
    const normalized = normalizeStatus(nextStatus);

    const payload = {
      status: normalized,
      download_enabled: normalized === "confirmed" || normalized === "delivered",
    };

    if (normalized === "confirmed") {
      payload.confirmed_at = new Date().toISOString();
    }

    if (normalized === "pending" || normalized === "rejected") {
      payload.confirmed_at = null;
      payload.download_enabled = false;
    }

    const { error } = await supabase
      .from("orders")
      .update(payload)
      .eq("id", order.id);

    if (error) {
      console.error("Update status error:", error);
      showToast(
        tx(`Failed to update status: ${error.message}`, `فشل تحديث الحالة: ${error.message}`),
        "error"
      );
      return;
    }

    showToast(tx("Order status updated successfully.", "تم تحديث حالة الطلب بنجاح."));
    fetchOrders();
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">{tx("Admin Orders", "إدارة الطلبات")}</h1>

        {loading ? (
          <div className="details-box">
            <p className="details-description">
              {tx("Loading admin orders...", "جاري تحميل طلبات الأدمن...")}
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="details-box">
            <p className="details-description">
              {tx("No orders found.", "لا توجد طلبات.")}
            </p>
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
                  <strong>{tx("Customer:", "العميل:")}</strong>{" "}
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
                  <strong>{tx("Download Enabled:", "التحميل متاح:")}</strong>{" "}
                  {order.download_enabled ? tx("Yes", "نعم") : tx("No", "لا")}
                </p>

                <p>
                  <strong>{tx("Created At:", "تاريخ الإنشاء:")}</strong>{" "}
                  {formatDate(order.created_at)}
                </p>

                {order.proof_file_url && (
                  <div className="proof-preview">
                    <p>
                      <strong>{tx("Payment Proof:", "إثبات الدفع:")}</strong>
                    </p>

                    <a href={order.proof_file_url} target="_blank" rel="noreferrer">
                      {tx("Open proof", "فتح الإثبات")}
                    </a>

                    {isImageFile(order.proof_file_url) && (
                      <img src={order.proof_file_url} alt="Payment proof" />
                    )}
                  </div>
                )}

                <div className="status-actions">
                  <button onClick={() => handleStatusChange(order, "pending")}>
                    {tx("Pending", "قيد المراجعة")}
                  </button>

                  <button onClick={() => handleStatusChange(order, "confirmed")}>
                    {tx("Confirm", "تأكيد")}
                  </button>

                  <button onClick={() => handleStatusChange(order, "rejected")}>
                    {tx("Reject", "رفض")}
                  </button>

                  <button onClick={() => handleStatusChange(order, "delivered")}>
                    {tx("Deliver", "تسليم")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default AdminOrders;