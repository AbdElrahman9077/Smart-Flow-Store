import { Link } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import { useAppContext } from "../context/AppContext";

function Unauthorized() {
  const { tx } = useAppContext();

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="not-found-box">
          <div className="not-found-code" style={{ color: "#dc2626" }}>403</div>
          <h1 className="not-found-title">
            {tx("Access Denied", "تم رفض الوصول")}
          </h1>
          <p className="not-found-desc">
            {tx(
              "You don't have permission to access this page.",
              "ليس لديك صلاحية للوصول إلى هذه الصفحة."
            )}
          </p>
          <div className="not-found-actions">
            <Link to="/" className="primary-link-btn">
              {tx("Back to Home", "العودة للرئيسية")}
            </Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Unauthorized;
