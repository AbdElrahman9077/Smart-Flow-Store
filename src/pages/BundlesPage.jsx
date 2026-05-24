import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../lib/productService";
import { useAppContext } from "../context/AppContext";
import { LoadingSkeleton } from "../components/ui";

function BundlesPage() {
  const { tx } = useAppContext();
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ productType: "bundle" }).then(({ data }) => {
      setBundles(data);
      setLoading(false);
    });
  }, []);

  return (
    <PageWrapper>
      <section className="page-section">
        <div className="container page-header">
          <span className="section-kicker">{tx("Value bundles", "حزم قيمة")}</span>
          <h1 className="page-title">{tx("Excel system bundles", "حزم أنظمة Excel")}</h1>
          <p className="page-subtitle">
            {tx("Buy curated product sets for operations, sales, finance, and management at a better total price.", "اشترِ مجموعات منتجات مختارة للعمليات والمبيعات والمالية والإدارة بسعر إجمالي أفضل.")}
          </p>
        </div>
      </section>

      <div className="container page-section">
        {loading ? (
          <LoadingSkeleton cards={3} />
        ) : bundles.length === 0 ? (
          <div className="products-empty">
            <h3>{tx("No bundles available yet", "لا توجد حزم متاحة حاليًا")}</h3>
            <p>{tx("We are preparing curated bundles. Explore individual products for now.", "نعمل على تجهيز حزم مختارة. يمكنك تصفح المنتجات الفردية حاليًا.")}</p>
            <Link to="/products" className="primary-link-btn" style={{ marginTop: 16 }}>
              {tx("Browse products", "تصفح المنتجات")}
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {bundles.map((product) => (
              <ProductCard key={product.id} id={product.slug || product.id} title={product.title} description={product.description || product.short_description} price={product.price} oldPrice={product.old_price} currency={product.currency} category={product.category} tags={Array.isArray(product.tags) ? product.tags : []} featured={product.featured} image={product.cover_image_url || product.image_url || ""} productType={product.product_type} />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default BundlesPage;
