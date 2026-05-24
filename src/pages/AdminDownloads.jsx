import { useEffect, useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { adminGetDownloadLogs } from "../lib/downloadService";
import { formatDateTime } from "../lib/utils";

function AdminDownloads() {
  const [logs, setLogs] = useState([]);
  useEffect(() => { adminGetDownloadLogs().then((result) => setLogs(result.data || [])); }, []);
  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">Admin Downloads</h1>
        <div className="orders-grid">
          {logs.length === 0 ? <div className="order-card">No download logs yet.</div> : logs.map((log) => (
            <div className="order-card" key={log.id}>
              <div className="order-header"><h2>{log.products?.title || log.product_id}</h2><span className="status-badge">{formatDateTime(log.downloaded_at)}</span></div>
              <p><strong>Customer:</strong> {log.profiles?.email || log.user_id}</p>
              <p><strong>Order:</strong> {log.orders?.order_number || log.order_id}</p>
              <p><strong>Storage path:</strong> {log.storage_path || "Not logged"}</p>
              <p><strong>IP:</strong> {log.ip_address || "Not available"}</p>
              <p><strong>User agent:</strong> {log.user_agent || "Not available"}</p>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}

export default AdminDownloads;
