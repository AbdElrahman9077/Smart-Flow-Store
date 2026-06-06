import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageWrapper from "../../components/PageWrapper";
import { listCustomerOrders } from "../../lib/customerAccountService";
import { formatDateTime } from "../../lib/utils";

function getStatusBadgeClass(status) {
  if (status === "confirmed" || status === "completed" || status === "delivered") return "badge-success";
  if (status === "pending") return "badge-warning";
  if (status === "rejected" || status === "cancelled") return "badge-danger";
  return "badge-default";
}

function AccountOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const result = await listCustomerOrders();
      if (result.error) setError(result.error.message || result.error);
      setOrders(result.data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">My Orders</h1>
            <p className="page-subtitle">Orders are scoped to your signed-in account. Downloads are handled from the secure downloads page after manual confirmation.</p>
          </div>
          <Link to="/products" className="primary-link-btn">Browse More</Link>
        </div>

        {loading ? (
          <div className="orders-grid">{[1, 2].map((i) => <div key={i} className="order-card skeleton-card" style={{ height: 120 }} />)}</div>
        ) : error ? (
          <div className="products-empty">Could not load orders: {error}</div>
        ) : orders.length === 0 ? (
          <div className="products-empty">
            <h3>No orders yet</h3>
            <Link to="/products" className="primary-link-btn" style={{ marginTop: 16 }}>Shop Now</Link>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => (
              <div className="order-card" key={order.id}>
                <div className="order-header">
                  <div>
                    <h2>{order.product_title || "Product"}</h2>
                    <small style={{ color: "#64748b" }}>{order.order_number || `#${order.id}`}</small>
                  </div>
                  <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>{order.status}</span>
                </div>
                <div className="order-meta-row">
                  <span>Total: {order.total || order.product_price} {order.currency}</span>
                  <span>Created: {formatDateTime(order.created_at)}</span>
                  <span>Payment: {order.payment_method || "Not set"}</span>
                  <span>Payment status: {order.payment_status || "pending"}</span>
                </div>
                {order.payment_status === "confirmed" ? (
                  <div style={{ marginTop: 14 }}>
                    <Link to="/account/downloads" className="primary-link-btn">Go to secure downloads</Link>
                  </div>
                ) : (
                  <p className="details-description" style={{ marginTop: 12 }}>Downloads unlock after manual admin confirmation. Online payment automation is not implemented yet.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default AccountOrders;
