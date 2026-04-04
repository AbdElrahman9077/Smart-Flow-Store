import PageWrapper from "../components/PageWrapper";
import Products from "../components/Products";
import { useAppContext } from "../context/AppContext";

function ProductsPage() {
  const { tx } = useAppContext();

  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">{tx("Our Products", "منتجاتنا")}</h1>
        <p className="page-subtitle">
          {tx(
            "Browse all available systems, templates, and digital business tools.",
            "تصفح كل الأنظمة والقوالب والأدوات الرقمية المتاحة."
          )}
        </p>

        <Products showHeader={false} />
      </div>
    </PageWrapper>
  );
}

export default ProductsPage;