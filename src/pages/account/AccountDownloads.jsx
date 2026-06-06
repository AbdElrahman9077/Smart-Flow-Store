import { useEffect, useState } from "react";
import PageWrapper from "../../components/PageWrapper";
import { requestSecureDownload } from "../../lib/downloadService";
import { listCustomerDownloads } from "../../lib/customerAccountService";
import { formatDate, formatPrice } from "../../lib/utils";

function AccountDownloads() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await listCustomerDownloads();
      setRows(result.data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleDownload(row) {
    const license = Array.isArray(row.licenses) ? row.licenses[0] : null;
    const result = await requestSecureDownload({ orderId: row.id, productId: row.product_id, licenseId: license?.id });
    if (result.data?.signedUrl) window.open(result.data.signedUrl, "_blank");
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">Downloads</h1>
        <p className="page-subtitle">Your paid products use a controlled delivery flow. Download buttons request a short-lived signed URL.</p>
        <div className="orders-grid">
          {loading ? <div className="order-card">Loading downloads...</div> : rows.length === 0 ? <div className="order-card">No downloads are available yet.</div> : rows.map((row) => {
            const license = Array.isArray(row.licenses) ? row.licenses[0] : null;
            return (
              <div className="order-card" key={row.id}>
                <div className="order-header"><h2>{row.product_title || row.products?.title}</h2><span className="status-badge">{row.payment_status}</span></div>
                <p><strong>Order:</strong> {row.order_number || row.id}</p>
                <p><strong>Total:</strong> {formatPrice(row.total || row.product_price, row.currency)}</p>
                <p><strong>License:</strong> {license?.license_key || "Generated after admin confirmation"}</p>
                <p><strong>Purchased:</strong> {formatDate(row.created_at)}</p>
                <button className="primary-btn" type="button" onClick={() => handleDownload(row)}>Secure download</button>
              </div>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
}

export default AccountDownloads;
