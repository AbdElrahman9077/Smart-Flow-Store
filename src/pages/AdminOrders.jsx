import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PageWrapper from "../components/PageWrapper";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch admin orders error:", error);
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  async function handleStatusChange(orderId, newStatus) {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      console.error("Update status error:", error);
      alert(`Failed to update status: ${error.message}`);
      return;
    }

    fetchOrders();
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">Admin Orders</h1>

        {loading ? (
          <div className="details-box">
            <p className="details-description">Loading admin orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="details-box">
            <p className="details-description">No orders found.</p>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => (
              <div className="order-card" key={order.id}>
                <div className="order-header">
                  <h2>{order.product_title}</h2>
                  <span className="status-badge">{order.status}</span>
                </div>

                <p><strong>Price:</strong> {order.product_price} {order.currency}</p>
                <p><strong>Customer:</strong> {order.customer_full_name}</p>
                <p><strong>Email:</strong> {order.customer_email}</p>
                <p><strong>Phone:</strong> {order.customer_phone}</p>
                <p><strong>Payment:</strong> {order.payment_method}</p>
                <p><strong>Notes:</strong> {order.notes || "No notes"}</p>
                <p><strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}</p>

                {order.proof_file_url && (
                  <div className="proof-preview">
                    <p><strong>Payment Proof:</strong></p>
                    <a href={order.proof_file_url} target="_blank" rel="noreferrer">
                      Open proof
                    </a>
                    <img src={order.proof_file_url} alt="Payment proof" />
                  </div>
                )}

                <div className="status-actions">
                  <button onClick={() => handleStatusChange(order.id, "Pending Review")}>
                    Pending
                  </button>
                  <button onClick={() => handleStatusChange(order.id, "Confirmed")}>
                    Confirm
                  </button>
                  <button onClick={() => handleStatusChange(order.id, "Rejected")}>
                    Reject
                  </button>
                  <button onClick={() => handleStatusChange(order.id, "Delivered")}>
                    Deliver
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