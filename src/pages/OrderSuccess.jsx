import { Link } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import { useAppContext } from "../context/AppContext";

function OrderSuccess() {
  const { tx, t } = useAppContext();

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="details-box success-box">
          <h1>{tx("Order Submitted Successfully", "تم إرسال الطلب بنجاح")}</h1>

          <p className="details-description">
            {tx(
              "Thank you! Your order has been submitted successfully.",
              "شكرًا لك! تم إرسال طلبك بنجاح."
            )}
          </p>

          <p className="details-description">
            {tx(
              "We will review your payment proof and confirm your order soon.",
              "سنراجع إثبات الدفع الخاص بك ونؤكد الطلب قريبًا."
            )}
          </p>

          <div className="success-buttons">
            <Link to="/my-orders" className="primary-link-btn">
              {t.myOrders}
            </Link>

            <Link to="/" className="secondary-link-btn">
              {t.backHome}
            </Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default OrderSuccess;