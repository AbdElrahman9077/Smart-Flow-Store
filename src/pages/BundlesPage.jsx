import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../lib/productService";
import { useAppContext } from "../context/AppContext";

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
      <section className="free-hero" style={{ background: "linear-gradient(135deg, #0f172a, #7c3aed)" }}>
        <div className="container">
          <span className="section-kicker">📦 {tx("Value Bundles", "حزم القيمة")}</span>
          <h1>{tx("Excel System Bundles", "حزم أنظمة Excel")}</h1>
          <p>
            {tx(
              "Get multiple Excel systems at a special bundled price. Maximum value, minimum cost.",
              "احصل على أنظمة Excel متعددة بسعر مجمّع خاص. أقصى قيمة، أقل تكلفة."
            )}
          </p>
        </div>
      </section>

      <div className="container page-section">
        {loading ? (
          <div className="products-grid">
            {[1, 2].map((i) => (
              <div key={i} className="product-card skeleton-card">
                <div className="skeleton skeleton-img" />
                <div style={{ padding: 20 }}>
                  <div className="skeleton skeleton-line" />
                  <div className="skeleton skeleton-line short" />
                </div>
              </div>
            ))}
          </div>
        ) : bundles.length === 0 ? (
          <div className="products-empty">
            <div className="empty-icon">📦</div>
            <h3>{tx("No bundles available yet", "لا توجد حزم متاحة حتى الآن")}</h3>
            <p>{tx("We're preparing amazing bundles. Check back soon!", "نحضر حزماً رائعة. تفقد قريباً!")}</p>
            <Link to="/products" className="primary-link-btn" style={{ marginTop: 16 }}>
              {tx("Browse Individual Products", "تصفح المنتجات الفردية")}
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {bundles.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                description={product.description || product.short_description}
                price={product.price}
                oldPrice={product.old_price}
                currency={product.currency}
                category={product.category}
                tags={Array.isArray(product.tags) ? product.tags : []}
                featured={product.featured}
                image={product.cover_image_url || product.image_url || ""}
              />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default BundlesPage;
