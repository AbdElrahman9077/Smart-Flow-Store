import { useEffect, useState } from "react";
import PageWrapper from "../../components/PageWrapper";
import { listCustomerLicenses } from "../../lib/customerAccountService";
import { formatDate } from "../../lib/utils";

function AccountLicenses() {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await listCustomerLicenses();
      setLicenses(result.data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">Licenses</h1>
        <p className="page-subtitle">License keys are shown for confirmed digital products. Desktop activation and device management are not available yet.</p>
        <div className="orders-grid">
          {loading ? <div className="order-card">Loading licenses...</div> : licenses.length === 0 ? <div className="order-card">No license keys yet.</div> : licenses.map((license) => (
            <div className="order-card" key={license.id}>
              <div className="order-header"><h2>{license.products?.title || "Excel product"}</h2><span className="status-badge">{license.status}</span></div>
              <p><strong>License key:</strong> <code>{license.license_key}</code></p>
              <p><strong>Type:</strong> {license.license_type}</p>
              <p><strong>Activation records:</strong> Not available yet. Device activation is a roadmap module.</p>
              <p><strong>Support expires:</strong> {formatDate(license.support_expires_at)}</p>
              <button className="secondary-link-btn" type="button" onClick={() => navigator.clipboard?.writeText(license.license_key)}>Copy key</button>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}

export default AccountLicenses;
