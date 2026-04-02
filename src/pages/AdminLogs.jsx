import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PageWrapper from "../components/PageWrapper";
import { useAppContext } from "../context/AppContext";

function AdminLogs() {
  const { tx } = useAppContext();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  function formatDate(value) {
    if (!value) return tx("Not available", "غير متاح");
    return new Date(value).toLocaleString();
  }

  async function fetchLogs() {
    setLoading(true);

    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch logs error:", error);
      setLogs([]);
      setLoading(false);
      return;
    }

    setLogs(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">{tx("Admin Logs", "سجلات الأدمن")}</h1>

        {loading ? (
          <div className="details-box">
            <p className="details-description">
              {tx("Loading logs...", "جاري تحميل السجلات...")}
            </p>
          </div>
        ) : logs.length === 0 ? (
          <div className="details-box">
            <p className="details-description">
              {tx("No logs found.", "لا توجد سجلات.")}
            </p>
          </div>
        ) : (
          <div className="orders-grid">
            {logs.map((log) => (
              <div className="order-card" key={log.id}>
                <h2>{log.action}</h2>

                <p>
                  <strong>{tx("Entity:", "الكيان:")}</strong>{" "}
                  {log.entity_type || tx("Not set", "غير محدد")}
                </p>

                <p>
                  <strong>{tx("Entity ID:", "رقم الكيان:")}</strong>{" "}
                  {log.entity_id || tx("Not set", "غير محدد")}
                </p>

                <p>
                  <strong>{tx("Description:", "الوصف:")}</strong>{" "}
                  {log.description || tx("No description", "لا يوجد وصف")}
                </p>

                <p>
                  <strong>{tx("Created At:", "تاريخ الإنشاء:")}</strong>{" "}
                  {formatDate(log.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default AdminLogs;