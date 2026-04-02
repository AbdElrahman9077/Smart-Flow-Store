import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PageWrapper from "../components/PageWrapper";
import { useToast } from "../context/ToastContext";
import { useAppContext } from "../context/AppContext";

function AdminCustomRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();
  const { tx } = useAppContext();

  function formatDate(value) {
    if (!value) return tx("Not available", "غير متاح");
    return new Date(value).toLocaleString();
  }

  function normalizeStatus(status) {
    const value = (status || "").toLowerCase().trim();

    if (value === "pending review") return "pending";
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

  async function fetchRequests() {
    setLoading(true);

    const { data, error } = await supabase
      .from("custom_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch custom requests error:", error);
      showToast(
        tx("Failed to load custom requests.", "فشل تحميل الطلبات المخصصة."),
        "error"
      );
      setRequests([]);
      setLoading(false);
      return;
    }

    setRequests(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  async function handleStatusChange(id, status) {
    const { error } = await supabase
      .from("custom_requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      showToast(
        tx(`Failed to update request: ${error.message}`, `فشل تحديث الطلب: ${error.message}`),
        "error"
      );
      return;
    }

    showToast(tx("Request status updated successfully.", "تم تحديث حالة الطلب بنجاح."));
    fetchRequests();
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">
          {tx("Admin Custom Requests", "إدارة الطلبات المخصصة")}
        </h1>

        {loading ? (
          <p>{tx("Loading requests...", "جاري تحميل الطلبات...")}</p>
        ) : requests.length === 0 ? (
          <p>{tx("No custom requests found.", "لا توجد طلبات مخصصة.")}</p>
        ) : (
          <div className="orders-grid">
            {requests.map((request) => (
              <div className="order-card" key={request.id}>
                <div className="order-header">
                  <h2>{request.request_title || tx("Untitled Request", "طلب بدون عنوان")}</h2>
                  <span className="status-badge">
                    {getStatusLabel(request.status)}
                  </span>
                </div>

                <p>
                  <strong>{tx("Name:", "الاسم:")}</strong>{" "}
                  {request.full_name || tx("No name", "بدون اسم")}
                </p>

                <p>
                  <strong>{tx("Email:", "البريد الإلكتروني:")}</strong>{" "}
                  {request.email || tx("No email", "بدون بريد")}
                </p>

                <p>
                  <strong>{tx("Phone:", "الهاتف:")}</strong>{" "}
                  {request.phone || tx("No phone", "لا يوجد رقم")}
                </p>

                <p>
                  <strong>{tx("Budget:", "الميزانية:")}</strong>{" "}
                  {request.budget || tx("Not specified", "غير محددة")}
                </p>

                <p>
                  <strong>{tx("Description:", "الوصف:")}</strong>{" "}
                  {request.request_description || tx("No description", "لا يوجد وصف")}
                </p>

                <p>
                  <strong>{tx("Created At:", "تاريخ الإنشاء:")}</strong>{" "}
                  {formatDate(request.created_at)}
                </p>

                <div className="status-actions">
                  <button onClick={() => handleStatusChange(request.id, "pending")}>
                    {tx("Pending", "قيد المراجعة")}
                  </button>

                  <button onClick={() => handleStatusChange(request.id, "confirmed")}>
                    {tx("Confirm", "تأكيد")}
                  </button>

                  <button onClick={() => handleStatusChange(request.id, "rejected")}>
                    {tx("Reject", "رفض")}
                  </button>

                  <button onClick={() => handleStatusChange(request.id, "delivered")}>
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

export default AdminCustomRequests;