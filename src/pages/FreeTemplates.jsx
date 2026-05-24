import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../lib/productService";
import { useAppContext } from "../context/AppContext";

function FreeTemplates() {
  const { tx } = useAppContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ productType: "free" }).then(({ data }) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="free-hero">
        <div className="container">
          <span className="section-kicker">🎁 {tx("Free Resources", "موارد مجانية")}</span>
          <h1>{tx("Free Excel Templates", "قوالب Excel مجانية")}</h1>
          <p>
            {tx(
              "Download high-quality Excel templates completely free. No credit card needed.",
              "حمّل قوالب Excel عالية الجودة مجانًا تمامًا. لا حاجة لبطاقة ائتمان."
            )}
          </p>
          <Link to="/custom-request" className="primary-link-btn">
            {tx("Need Custom Work?", "تريد عمل مخصص؟")}
          </Link>
        </div>
      </section>

      <div className="container page-section">
        {loading ? (
          <div className="products-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="product-card skeleton-card">
                <div className="skeleton skeleton-img" />
                <div style={{ padding: 20 }}>
                  <div className="skeleton skeleton-line" />
                  <div className="skeleton skeleton-line short" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="products-empty">
            <div className="empty-icon">🎁</div>
            <h3>{tx("No free templates yet", "لا توجد قوالب مجانية حتى الآن")}</h3>
            <p>{tx("Check back soon for free downloads!", "تفقد مجدداً قريباً!")}</p>
            <Link to="/products" className="primary-link-btn" style={{ marginTop: 16 }}>
              {tx("Browse All Products", "تصفح كل المنتجات")}
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
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
                productType={product.product_type}
              />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default FreeTemplates;
