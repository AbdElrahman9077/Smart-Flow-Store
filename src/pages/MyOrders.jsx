import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/auth";
import PageWrapper from "../components/PageWrapper";
import { Link } from "react-router-dom";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyOrders() {
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch my orders error:", error);
      } else {
        setOrders(data || []);
      }

      setLoading(false);
    }

    fetchMyOrders();
  }, []);

  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">My Orders</h1>

        {loading ? (
          <div className="details-box">
            <p className="details-description">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="details-box">
            <p className="details-description">You have no orders yet.</p>
            <Link to="/products" className="primary-link-btn">
              Browse Products
            </Link>
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
                <p><strong>Name:</strong> {order.customer_full_name}</p>
                <p><strong>Email:</strong> {order.customer_email}</p>
                <p><strong>Phone:</strong> {order.customer_phone}</p>
                <p><strong>Payment:</strong> {order.payment_method}</p>
                <p><strong>Proof File:</strong> {order.proof_file_name || "No file uploaded"}</p>
                <p><strong>Notes:</strong> {order.notes || "No notes"}</p>
                <p><strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default MyOrders;