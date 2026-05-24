import PageWrapper from "../components/PageWrapper";
import Products from "../components/Products";
import { useAppContext } from "../context/AppContext";

function ProductsPage() {
  const { tx } = useAppContext();

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="page-header">
          <span className="section-kicker">{tx("Marketplace", "المتجر")}</span>
          <h1 className="page-title">{tx("Professional Excel products for business operations", "منتجات Excel احترافية لإدارة الأعمال")}</h1>
          <p className="page-subtitle">
            {tx("Find ready-made dashboards, trackers, templates, and complete Excel systems with secure delivery and license management.", "اكتشف لوحات متابعة وأدوات تتبع وقوالب وأنظمة Excel كاملة مع تسليم آمن وإدارة للتراخيص.")}
          </p>
        </div>
        <Products showHeader={false} />
      </div>
    </PageWrapper>
  );
}

export default ProductsPage;
