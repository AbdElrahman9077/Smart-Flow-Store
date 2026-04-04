import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PageWrapper from "../components/PageWrapper";
import { useToast } from "../context/ToastContext";
import { useAppContext } from "../context/AppContext";
import {
  sendAdminNotification,
  sendCustomerEmail,
  createAuditLog,
} from "../lib/notifications";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

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
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
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

  async function handleOpenProof(order) {
    try {
      if (order.proof_file_path) {
        const { data, error } = await supabase.storage
          .from("payment-proofs")
          .createSignedUrl(order.proof_file_path, 300);

        if (!error && data?.signedUrl) {
          window.open(data.signedUrl, "_blank");
          return;
        }
      }

      if (order.proof_file_url) {
        window.open(order.proof_file_url, "_blank");
        return;
      }

      showToast(
        tx("No payment proof available for this order.", "لا يوجد إثبات دفع لهذا الطلب."),
        "error"
      );
    } catch (err) {
      console.error(err);
      showToast(tx("Could not open payment proof.", "تعذر فتح إثبات الدفع."), "error");
    }
  }

  function getCustomerEmailMessage(normalized, productTitle) {
    if (normalized === "confirmed") {
      return `
        <div>
          <h2>Your order has been confirmed</h2>
          <p>Product: ${productTitle || "-"}</p>
          <p>Your product is now available in My Orders for one-time download.</p>
        </div>
      `;
    }

    if (normalized === "rejected") {
      return `
        <div>
          <h2>Your order has been rejected</h2>
          <p>Product: ${productTitle || "-"}</p>
          <p>Please contact support if you need more details.</p>
        </div>
      `;
    }

    if (normalized === "delivered") {
      return `
        <div>
          <h2>Your order has been marked as delivered</h2>
          <p>Product: ${productTitle || "-"}</p>
          <p>This order is now considered completed.</p>
        </div>
      `;
    }

    return `
      <div>
        <h2>Your order status has been updated</h2>
        <p>Product: ${productTitle || "-"}</p>
        <p>Status: ${normalized}</p>
      </div>
    `;
  }

  async function handleStatusChange(order, nextStatus) {
    const normalized = normalizeStatus(nextStatus);
    const now = new Date().toISOString();

    setUpdatingOrderId(order.id);

    const payload = {
      status: normalized,
      updated_at: now,
    };

    if (normalized === "confirmed") {
      payload.confirmed_at = now;
      payload.download_enabled = true;
      payload.download_used = false;
      payload.download_used_at = null;
    }

    if (normalized === "pending") {
      payload.confirmed_at = null;
      payload.download_enabled = false;
    }

    if (normalized === "rejected") {
      payload.download_enabled = false;
      payload.confirmed_at = null;
    }

    if (normalized === "delivered") {
      payload.download_enabled = false;
      payload.download_used = true;
      payload.download_used_at = order.download_used_at || now;
    }

    const { error } = await supabase
      .from("orders")
      .update(payload)
      .eq("id", order.id);

    setUpdatingOrderId(null);

    if (error) {
      console.error("Update status error:", error);
      showToast(
        tx(`Failed to update status: ${error.message}`, `فشل تحديث الحالة: ${error.message}`),
        "error"
      );
      return;
    }

    await Promise.allSettled([
      createAuditLog({
        action: "order_status_changed",
        entityType: "order",
        entityId: order.id,
        description: `Order #${order.id} changed to ${normalized}`,
        metadata: {
          orderId: order.id,
          status: normalized,
          customerEmail: order.customer_email || null,
          productTitle: order.product_title || null,
        },
      }),

      sendAdminNotification({
        subject: `Smart Flow - Order #${order.id} updated`,
        html: `
          <div>
            <h2>Order Updated</h2>
            <p>Order ID: ${order.id}</p>
            <p>Product: ${order.product_title || "-"}</p>
            <p>Customer: ${order.customer_full_name || "-"}</p>
            <p>Status: ${normalized}</p>
          </div>
        `,
      }),

      order.customer_email
        ? sendCustomerEmail({
            to: order.customer_email,
            subject: "Smart Flow - Order Status Updated",
            html: getCustomerEmailMessage(normalized, order.product_title),
          })
        : Promise.resolve(),
    ]);

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
                  <strong>{tx("Price:", "السعر:")}</strong> {order.product_price}{" "}
                  {order.currency}
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
                  <strong>{tx("Download Used:", "تم استخدام التحميل:")}</strong>{" "}
                  {order.download_used ? tx("Yes", "نعم") : tx("No", "لا")}
                </p>
                <p>
                  <strong>{tx("Created At:", "تاريخ الإنشاء:")}</strong>{" "}
                  {formatDate(order.created_at)}
                </p>

                {order.confirmed_at && (
                  <p>
                    <strong>{tx("Confirmed At:", "تاريخ التأكيد:")}</strong>{" "}
                    {formatDate(order.confirmed_at)}
                  </p>
                )}

                {order.download_used_at && (
                  <p>
                    <strong>{tx("Download Used At:", "تاريخ استخدام التحميل:")}</strong>{" "}
                    {formatDate(order.download_used_at)}
                  </p>
                )}

                {(order.proof_file_path || order.proof_file_url) && (
                  <div className="proof-preview">
                    <p>
                      <strong>{tx("Payment Proof:", "إثبات الدفع:")}</strong>
                    </p>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => handleOpenProof(order)}
                    >
                      {tx("Open proof", "فتح الإثبات")}
                    </button>
                  </div>
                )}

                <div className="status-actions">
                  <button
                    onClick={() => handleStatusChange(order, "pending")}
                    disabled={updatingOrderId === order.id}
                  >
                    {tx("Pending", "قيد المراجعة")}
                  </button>

                  <button
                    onClick={() => handleStatusChange(order, "confirmed")}
                    disabled={updatingOrderId === order.id}
                  >
                    {updatingOrderId === order.id
                      ? tx("Updating...", "جاري التحديث...")
                      : tx("Confirm", "تأكيد")}
                  </button>

                  <button
                    onClick={() => handleStatusChange(order, "rejected")}
                    disabled={updatingOrderId === order.id}
                  >
                    {tx("Reject", "رفض")}
                  </button>

                  <button
                    onClick={() => handleStatusChange(order, "delivered")}
                    disabled={updatingOrderId === order.id}
                  >
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