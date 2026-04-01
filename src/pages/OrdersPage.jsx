import PageWrapper from "../components/PageWrapper";
function OrdersPage() {
  const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];

  return (
<PageWrapper>
<div className="container page-section">
      <h1 className="page-title">Orders</h1>

      {savedOrders.length === 0 ? (
        <div className="details-box">
          <p className="details-description">No orders submitted yet.</p>
        </div>
      ) : (
        <div className="orders-grid">
          {savedOrders
            .slice()
            .reverse()
            .map((order) => (
              <div className="order-card" key={order.orderId}>
                <div className="order-header">
                  <h2>{order.product.title}</h2>
                  <span className="status-badge">{order.status}</span>
                </div>

                <p><strong>Price:</strong> ${order.product.price}</p>
                <p><strong>Customer:</strong> {order.customer.fullName}</p>
                <p><strong>Email:</strong> {order.customer.email}</p>
                <p><strong>Phone:</strong> {order.customer.phone}</p>
                <p><strong>Payment:</strong> {order.customer.paymentMethod}</p>
                <p><strong>Proof File:</strong> {order.customer.proofFileName || "No file uploaded"}</p>
                <p><strong>Notes:</strong> {order.customer.notes || "No notes"}</p>
                <p><strong>Created At:</strong> {order.createdAt}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  </PageWrapper>
  );
}

export default OrdersPage;