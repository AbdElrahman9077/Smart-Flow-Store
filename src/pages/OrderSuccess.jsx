import { Link } from "react-router-dom";

function OrderSuccess() {
  return (
    <div className="container page-section">
      <div className="details-box success-box">
        <h1>Order Submitted Successfully</h1>
        <p className="details-description">
          Thank you! Your order has been submitted successfully.
        </p>
        <p className="details-description">
          We will review your payment proof and confirm your order soon.
        </p>

        <div className="success-buttons">
          <Link to="/orders" className="primary-link-btn">
            View Orders
          </Link>

          <Link to="/" className="secondary-link-btn">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;