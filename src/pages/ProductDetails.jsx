import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import PageWrapper from "../components/PageWrapper";
import { useAppContext } from "../context/AppContext";

function buildGallery(product) {
  if (!product) return [];

  return Array.from(
    new Set(
      [
        product.cover_image_url,
        ...(Array.isArray(product.description_image_urls)
          ? product.description_image_urls
          : []),
        ...(Array.isArray(product.image_urls) ? product.image_urls : []),
        product.image_url,
      ].filter(Boolean)
    )
  );
}

function ProductDetails() {
  const { id } = useParams();
  const { tx } = useAppContext();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);

      const productId = Number(id);

      if (Number.isNaN(productId)) {
        setProduct(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("is_active", true)
        .single();

      if (error || !data) {
        setProduct(null);
        setActiveImage("");
        setLoading(false);
        return;
      }

      const gallery = buildGallery(data);

      setProduct(data);
      setActiveImage(gallery[0] || "");
      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  const gallery = useMemo(() => buildGallery(product), [product]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="container page-section">
          <div className="details-box">
            <h2>{tx("Loading product...", "جاري تحميل المنتج...")}</h2>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!product) {
    return (
      <PageWrapper>
        <div className="container page-section">
          <div className="details-box">
            <h2>{tx("Product not found", "المنتج غير موجود")}</h2>
            <div className="details-actions">
              <Link to="/products" className="secondary-link-btn">
                {tx("Back to Products", "العودة للمنتجات")}
              </Link>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="details-box details-layout">
          <div className="details-gallery">
            {activeImage ? (
              <img src={activeImage} alt={product.title} className="details-image" />
            ) : (
              <div className="product-card-placeholder details-placeholder">
                {tx("No Image", "لا توجد صورة")}
              </div>
            )}

            {gallery.length > 1 && (
              <div className="thumb-grid">
                {gallery.map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    className={`thumb-btn ${activeImage === img ? "active" : ""}`}
                    onClick={() => setActiveImage(img)}
                    type="button"
                  >
                    <img
                      src={img}
                      alt={`${product.title}-${index + 1}`}
                      className="thumb-image"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="details-info">
            <div className="details-meta">
              {product.featured && (
                <span className="details-chip details-chip-primary">
                  {tx("Featured", "مميز")}
                </span>
              )}

              {product.category && (
                <span className="details-chip">{product.category}</span>
              )}
            </div>

            <h1>{product.title}</h1>

            <p className="details-description">
              {product.long_description || product.description}
            </p>

            {Array.isArray(product.tags) && product.tags.length > 0 && (
              <div className="details-tags">
                {product.tags.map((tag, index) => (
                  <span key={`${tag}-${index}`} className="tag-chip">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="details-price-wrap">
              <h3 className="details-price">
                {product.price} {product.currency}
              </h3>

              {product.old_price ? (
                <span className="details-old-price">
                  {product.old_price} {product.currency}
                </span>
              ) : null}
            </div>

            <div className="details-actions">
              <Link to={`/checkout/${product.id}`} className="primary-link-btn">
                {tx("Buy Now", "اشترِ الآن")}
              </Link>

              <Link to="/products" className="secondary-link-btn">
                {tx("Back to Products", "العودة للمنتجات")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default ProductDetails;