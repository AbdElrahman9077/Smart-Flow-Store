import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import ProductCard from "../components/ProductCard";
import { getProductById, getProductBySlug, getRelatedProducts } from "../lib/productService";
import { formatPrice } from "../lib/utils";

function asArray(value, fallback = []) {
  return Array.isArray(value) && value.length ? value : fallback;
}

function buildGallery(product) {
  if (!product) return [];
  return Array.from(new Set([
    product.cover_image_url,
    ...(Array.isArray(product.gallery_urls) ? product.gallery_urls : []),
    ...(Array.isArray(product.description_image_urls) ? product.description_image_urls : []),
    ...(Array.isArray(product.image_urls) ? product.image_urls : []),
    product.image_url,
  ].filter(Boolean)));
}

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const result = Number.isNaN(Number(id)) ? await getProductBySlug(id) : await getProductById(id);
      const nextProduct = result.data;
      setProduct(nextProduct);
      setActiveImage(buildGallery(nextProduct)[0] || "");
      if (nextProduct) {
        const relatedResult = await getRelatedProducts(nextProduct.id, nextProduct.category, 3);
        setRelated(relatedResult.data || []);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  const gallery = useMemo(() => buildGallery(product), [product]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="container page-section"><div className="details-box"><h2>Loading product...</h2></div></div>
      </PageWrapper>
    );
  }

  if (!product) {
    return (
      <PageWrapper>
        <div className="container page-section">
          <div className="details-box">
            <h2>Product not found</h2>
            <Link to="/products" className="secondary-link-btn">Back to products</Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const price = product.sale_price || product.price || 0;
  const features = asArray(product.features, ["Editable Excel workbook", "Clean business dashboard", "Setup guide included", "Ready for customization"]);
  const whatYouGet = asArray(product.what_you_get, ["Excel file package", "License key after confirmation", "Implementation notes", "Support window"]);
  const faqs = asArray(product.faq, [
    { q: "How is delivery handled?", a: "After payment confirmation, your account receives access to a controlled download and license key." },
    { q: "Can this be customized?", a: "Yes. Use the customization request button and the admin team can quote modifications." },
  ]);

  return (
    <PageWrapper>
      <div className="container page-section product-details-page">
        <div className="details-box product-hero-grid">
          <div className="details-gallery">
            {activeImage ? <img src={activeImage} alt={product.title} className="details-image" /> : <div className="product-card-placeholder details-placeholder">Excel product preview</div>}
            {gallery.length > 1 && (
              <div className="thumb-grid">
                {gallery.map((img, index) => (
                  <button key={`${img}-${index}`} className={`thumb-btn ${activeImage === img ? "active" : ""}`} onClick={() => setActiveImage(img)} type="button">
                    <img src={img} alt={`${product.title} preview ${index + 1}`} className="thumb-image" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <aside className="purchase-panel">
            <div className="details-meta">
              {product.featured && <span className="details-chip details-chip-primary">Featured</span>}
              <span className="details-chip">{product.category || "Excel System"}</span>
              <span className="details-chip">v{product.version || "1.0"}</span>
              <span className="details-chip">{product.compatibility || "Excel 2016+"}</span>
            </div>
            <h1>{product.title}</h1>
            <p className="details-description">{product.long_description || product.description || product.short_description}</p>
            <div className="details-price-wrap">
              <h3 className="details-price">{formatPrice(price, product.currency)}</h3>
              {product.old_price && <span className="details-old-price">{formatPrice(product.old_price, product.currency)}</span>}
            </div>
            <div className="details-actions">
              <Link to={`/checkout/${product.id}`} className="primary-link-btn">Buy now</Link>
              <Link to="/custom-request" className="secondary-link-btn">Request customization</Link>
            </div>
            <div className="trust-list">
              {["Instant after confirmation", "Secure download", "License included", "Support available"].map((item) => <span className="trust-pill" key={item}>{item}</span>)}
            </div>
          </aside>
        </div>

        <div className="details-box details-section-stack">
          <h2>What you get</h2>
          <div className="feature-grid">{whatYouGet.map((item) => <div className="feature-tile" key={item}>{item}</div>)}</div>
          <h2>Features</h2>
          <div className="feature-grid">{features.map((item) => <div className="feature-tile" key={item}>{item}</div>)}</div>
          <h2>How secure delivery works</h2>
          <p className="details-description">Paid files should stay in a private Supabase Storage bucket. The included secure-download edge function verifies the customer owns a paid order, checks the active license and download limit, logs the event, then returns a short-lived signed URL.</p>
          <h2>FAQ</h2>
          <div className="faq-list">{faqs.map((item) => <div className="faq-item" key={item.q || item.question}><strong>{item.q || item.question}</strong><p>{item.a || item.answer}</p></div>)}</div>
        </div>

        {related.length > 0 && (
          <section className="products-section">
            <div className="section-title-row"><span className="section-kicker">Related</span><h2>Similar Excel products</h2></div>
            <div className="products-grid">
              {related.map((item) => (
                <ProductCard key={item.id} id={item.slug || item.id} title={item.title} description={item.short_description || item.description} price={item.sale_price || item.price} currency={item.currency} image={item.cover_image_url} category={item.category} featured={item.featured} />
              ))}
            </div>
          </section>
        )}
      </div>
    </PageWrapper>
  );
}

export default ProductDetails;
