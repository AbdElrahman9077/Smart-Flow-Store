import { Link } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import { useAppContext } from "../context/AppContext";

function NotFound() {
  const { tx } = useAppContext();

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="not-found-box">
          <div className="not-found-code">404</div>
          <h1 className="not-found-title">
            {tx("Page Not Found", "الصفحة غير موجودة")}
          </h1>
          <p className="not-found-desc">
            {tx(
              "The page you're looking for doesn't exist or has been moved.",
              "الصفحة التي تبحث عنها غير موجودة أو تم نقلها."
            )}
          </p>
          <div className="not-found-actions">
            <Link to="/" className="primary-link-btn">
              {tx("Back to Home", "العودة للرئيسية")}
            </Link>
            <Link to="/products" className="secondary-link-btn">
              {tx("Browse Products", "تصفح المنتجات")}
            </Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default NotFound;
