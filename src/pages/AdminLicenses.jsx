import { useEffect, useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { adminGetLicenses, adminUpdateLicenseStatus } from "../lib/licenseService";
import { formatDate } from "../lib/utils";

function AdminLicenses() {
  const [licenses, setLicenses] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  async function load() {
    const result = await adminGetLicenses({ search, status });
    setLicenses(result.data || []);
  }

  useEffect(() => { load(); }, [search, status]);

  async function setLicenseStatus(id, nextStatus) {
    await adminUpdateLicenseStatus(id, nextStatus);
    load();
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">Admin Licenses</h1>
        <div className="catalog-toolbar"><input placeholder="Search license key" value={search} onChange={(e) => setSearch(e.target.value)} /><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option><option>active</option><option>suspended</option><option>expired</option><option>refunded</option></select></div>
        <div className="orders-grid">
          {licenses.length === 0 ? <div className="order-card">No licenses found.</div> : licenses.map((license) => (
            <div className="order-card" key={license.id}>
              <div className="order-header"><h2><code>{license.license_key}</code></h2><span className="status-badge">{license.status}</span></div>
              <p><strong>Product:</strong> {license.products?.title || license.product_id}</p>
              <p><strong>Customer:</strong> {license.orders?.customer_full_name || license.user_id}</p>
              <p><strong>Order:</strong> {license.orders?.order_number || license.order_id}</p>
              <p><strong>Support expires:</strong> {formatDate(license.support_expires_at)}</p>
              <div className="status-actions"><button onClick={() => setLicenseStatus(license.id, "active")}>Activate</button><button onClick={() => setLicenseStatus(license.id, "suspended")}>Suspend</button><button onClick={() => navigator.clipboard?.writeText(license.license_key)}>Copy</button></div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}

export default AdminLicenses;
