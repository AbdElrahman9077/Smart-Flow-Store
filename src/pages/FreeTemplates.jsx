import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../lib/productService";
import { useAppContext } from "../context/AppContext";
import { LoadingSkeleton } from "../components/ui";

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
      <section className="page-section">
        <div className="container page-header">
          <span className="section-kicker">{tx("Free resources", "موارد مجانية")}</span>
          <h1 className="page-title">{tx("Free Excel templates", "قوالب Excel مجانية")}</h1>
          <p className="page-subtitle">
            {tx("Download selected Excel templates to improve your workflow before upgrading to full business systems.", "حمّل قوالب Excel مختارة لتحسين سير العمل قبل الترقية إلى أنظمة أعمال كاملة.")}
          </p>
          <div className="section-actions">
            <Link to="/custom-request" className="secondary-link-btn">{tx("Request custom work", "اطلب تنفيذًا مخصصًا")}</Link>
          </div>
        </div>
      </section>

      <div className="container page-section">
        {loading ? (
          <LoadingSkeleton cards={3} />
        ) : products.length === 0 ? (
          <div className="products-empty">
            <h3>{tx("No free templates yet", "لا توجد قوالب مجانية حاليًا")}</h3>
            <p>{tx("Free downloads will appear here once approved by the admin team.", "ستظهر التحميلات المجانية هنا بعد اعتمادها من فريق الإدارة.")}</p>
            <Link to="/products" className="primary-link-btn" style={{ marginTop: 16 }}>
              {tx("Browse all products", "تصفح كل المنتجات")}
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} id={product.slug || product.id} title={product.title} description={product.description || product.short_description} price={product.price} oldPrice={product.old_price} currency={product.currency} category={product.category} tags={Array.isArray(product.tags) ? product.tags : []} featured={product.featured} image={product.cover_image_url || product.image_url || ""} productType={product.product_type} />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default FreeTemplates;
