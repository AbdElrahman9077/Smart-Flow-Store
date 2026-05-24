import { Link, useParams } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import Products from "../components/Products";
import { useAppContext } from "../context/AppContext";

function ProductsPage() {
  const { tx, t, categoryLabel } = useAppContext();
  const { slug } = useParams();
  const isCategory = Boolean(slug);
  const categoryName = isCategory ? categoryLabel(slug) : "";

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="page-header">
          <span className="section-kicker">{isCategory ? tx("Category", "تصنيف") : t.marketplace}</span>
          <h1 className="page-title">
            {isCategory
              ? tx(`${categoryName} Excel solutions`, `حلول Excel لفئة ${categoryName}`)
              : tx("Professional Excel products for business operations", "منتجات Excel احترافية لإدارة الأعمال")}
          </h1>
          <p className="page-subtitle">
            {isCategory
              ? tx(
                  "Explore products selected for this workflow, then request a custom version if your process needs more precise controls.",
                  "استكشف المنتجات المناسبة لهذا النوع من سير العمل، أو اطلب نسخة مخصصة إذا كانت عمليتك تحتاج إلى إعدادات أدق."
                )
              : tx(
                  "Find ready-made dashboards, trackers, templates, and complete Excel systems with secure delivery and license management.",
                  "اكتشف لوحات متابعة وأدوات تتبع وقوالب وأنظمة Excel كاملة مع تسليم آمن وإدارة للتراخيص."
                )}
          </p>
          {isCategory && (
            <div className="category-proof-row">
              <span>{tx("Recommended products appear below", "تظهر المنتجات المقترحة بالأسفل")}</span>
              <span>{t.secureDelivery}</span>
              <span>{t.customizable}</span>
              <Link to="/custom-request">{t.requestCustomWork}</Link>
            </div>
          )}
        </div>
        <Products showHeader={false} />
      </div>
    </PageWrapper>
  );
}

export default ProductsPage;
