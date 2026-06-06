import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageWrapper from "../../components/PageWrapper";
import { listCustomerCustomRequests } from "../../lib/customerAccountService";
import { formatDate, formatPrice } from "../../lib/utils";

function AccountCustomRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await listCustomerCustomRequests();
      setRequests(result.data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">Custom Requests</h1>
        <div className="success-buttons"><Link to="/custom-request" className="primary-link-btn">Submit a new request</Link></div>
        <div className="orders-grid">
          {loading ? <div className="order-card">Loading requests...</div> : requests.length === 0 ? <div className="order-card">No custom requests yet.</div> : requests.map((request) => (
            <div className="order-card" key={request.id}>
              <div className="order-header"><h2>{request.request_title}</h2><span className="status-badge">{request.status}</span></div>
              <p><strong>Business:</strong> {request.business_type || "Not specified"}</p>
              <p><strong>Budget:</strong> {request.budget_range || "Not specified"}</p>
              <p><strong>Quote:</strong> {request.quoted_price ? formatPrice(request.quoted_price, "EGP") : "Pending"}</p>
              <p><strong>Created:</strong> {formatDate(request.created_at)}</p>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}

export default AccountCustomRequests;
