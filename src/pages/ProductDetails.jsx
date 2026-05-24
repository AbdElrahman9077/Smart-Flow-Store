import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import ProductCard from "../components/ProductCard";
import { getProductById, getProductBySlug, getRelatedProducts } from "../lib/productService";
import { formatPrice } from "../lib/utils";
import { useAppContext } from "../context/AppContext";

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

function ProductDetailsSkeleton() {
  return (
    <PageWrapper>
      <div className="container page-section product-details-page">
        <div className="details-box product-hero-grid">
          <div className="details-skeleton-media skeleton-card" />
          <aside className="purchase-panel details-skeleton-panel">
            <span className="skeleton-line short" />
            <span className="skeleton-line title" />
            <span className="skeleton-line" />
            <span className="skeleton-line" />
            <span className="skeleton-line medium" />
            <div className="skeleton-button-row">
              <span />
              <span />
            </div>
          </aside>
        </div>
        <div className="details-box details-section-stack">
          <span className="skeleton-line title" />
          <div className="feature-grid">
            <div className="skeleton-card compact" />
            <div className="skeleton-card compact" />
            <div className="skeleton-card compact" />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

function ProductDetails() {
  const { id } = useParams();
  const { tx, t, categoryLabel } = useAppContext();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      setLoading(true);
      const result = Number.isNaN(Number(id)) ? await getProductBySlug(id) : await getProductById(id);
      if (cancelled) return;
      const nextProduct = result.data;
      setProduct(nextProduct);
      setActiveImage(buildGallery(nextProduct)[0] || "");
      setLoading(false);

      if (nextProduct) {
        const relatedResult = await getRelatedProducts(nextProduct.id, nextProduct.category, 3);
        if (!cancelled) setRelated(relatedResult.data || []);
      }
    }

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const gallery = useMemo(() => buildGallery(product), [product]);

  if (loading) return <ProductDetailsSkeleton />;

  if (!product) {
    return (
      <PageWrapper>
        <div className="container page-section">
          <div className="details-box">
            <h2>{tx("Product not found", "المنتج غير موجود")}</h2>
            <Link to="/products" className="secondary-link-btn">{tx("Back to products", "العودة إلى المنتجات")}</Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const price = product.sale_price || product.price || 0;
  const isFree = Number(price || 0) === 0 || product.product_type === "free";
  const displayPrice = isFree ? t.free : formatPrice(price, product.currency);
  const features = asArray(product.features, [
    tx("Editable Excel workbook", "ملف Excel قابل للتعديل"),
    tx("Clean business dashboard", "لوحة متابعة منظمة للأعمال"),
    tx("Setup guide included", "دليل إعداد مرفق"),
    tx("Ready for customization", "جاهز للتخصيص"),
  ]);
  const whatYouGet = asArray(product.what_you_get, [
    tx("Excel file package", "حزمة ملفات Excel"),
    tx("License key after confirmation", "مفتاح ترخيص بعد التأكيد"),
    tx("Implementation notes", "ملاحظات تشغيل واستخدام"),
    tx("Support window", "فترة دعم محددة"),
  ]);
  const faqs = asArray(product.faq, [
    {
      q: tx("How is delivery handled?", "كيف يتم التسليم؟"),
      a: tx(
        "After payment confirmation, your account receives access to a controlled download and license key.",
        "بعد تأكيد الدفع، يحصل حسابك على رابط تحميل مضبوط ومفتاح ترخيص."
      ),
    },
    {
      q: tx("Can this be customized?", "هل يمكن تخصيص المنتج؟"),
      a: tx(
        "Yes. Use the customization request button and the admin team can quote modifications.",
        "نعم. استخدم زر طلب التخصيص وسيتم تجهيز عرض للتعديلات المطلوبة."
      ),
    },
  ]);

  return (
    <PageWrapper>
      <div className="container page-section product-details-page">
        <div className="details-box product-hero-grid">
          <div className="details-gallery">
            {activeImage ? <img src={activeImage} alt={product.title} className="details-image" /> : <div className="product-card-placeholder details-placeholder">{tx("Excel product preview", "معاينة منتج Excel")}</div>}
            {gallery.length > 1 ? (
              <div className="thumb-grid">
                {gallery.map((img, index) => (
                  <button key={`${img}-${index}`} className={`thumb-btn ${activeImage === img ? "active" : ""}`} onClick={() => setActiveImage(img)} type="button">
                    <img src={img} alt={`${product.title} preview ${index + 1}`} className="thumb-image" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="demo-ready-panel">
                <strong>{tx("Demo-ready area", "مساحة مخصصة للمعاينة")}</strong>
                <p>{tx("Add screenshots, a walkthrough video, or a demo workbook when the product assets are ready.", "أضف لقطات شاشة أو فيديو شرح أو ملف تجربة عندما تكون أصول المنتج جاهزة.")}</p>
              </div>
            )}
          </div>

          <aside className="purchase-panel">
            <div className="details-meta">
              {product.featured && <span className="details-chip details-chip-primary">{t.featured}</span>}
              <span className="details-chip">{categoryLabel(product.category || "Excel System")}</span>
              <span className="details-chip">v{product.version || "1.0"}</span>
              <span className="details-chip">{product.compatibility || "Excel 2016+"}</span>
            </div>
            <h1>{product.title}</h1>
            <p className="details-description">{product.long_description || product.description || product.short_description}</p>
            <div className="details-price-wrap">
              <h3 className="details-price">{displayPrice}</h3>
              {product.old_price && <span className="details-old-price">{formatPrice(product.old_price, product.currency)}</span>}
            </div>
            <div className="details-actions">
              <Link to={`/checkout/${product.slug || product.id}`} className="primary-link-btn">{isFree ? t.downloadFree : t.buyNow}</Link>
              <Link to="/custom-request" className="secondary-link-btn">{t.requestCustomization}</Link>
            </div>
            {isFree && (
              <p className="form-hint">
                {tx("Create a free account to save downloads in your customer portal.", "أنشئ حسابًا مجانيًا لحفظ التحميلات داخل بوابة العميل.")}
              </p>
            )}
            <div className="trust-list">
              {[t.secureDelivery, t.licenseIncluded, t.supportAvailable, t.customizable].map((item) => <span className="trust-pill" key={item}>{item}</span>)}
            </div>
          </aside>
        </div>

        <div className="details-box details-section-stack">
          <h2>{tx("What you get", "ماذا ستحصل عليه")}</h2>
          <div className="feature-grid">{whatYouGet.map((item) => <div className="feature-tile" key={item}>{item}</div>)}</div>
          <h2>{tx("Use cases", "حالات الاستخدام")}</h2>
          <div className="feature-grid">
            {[tx("Operational reporting", "تقارير تشغيلية"), tx("Team follow-up", "متابعة فرق العمل"), tx("Management review", "مراجعة إدارية")].map((item) => <div className="feature-tile" key={item}>{item}</div>)}
          </div>
          <h2>{tx("Features", "المزايا")}</h2>
          <div className="feature-grid">{features.map((item) => <div className="feature-tile" key={item}>{item}</div>)}</div>
          <h2>{tx("How delivery works", "كيف يعمل التسليم")}</h2>
          <p className="details-description">
            {tx(
              "Paid files remain private. After confirmation, the customer portal provides controlled download access, license details, and support context for this product.",
              "تبقى الملفات المدفوعة خاصة. بعد التأكيد، توفر بوابة العميل تحميلًا مضبوطًا وتفاصيل الترخيص ومعلومات الدعم الخاصة بالمنتج."
            )}
          </p>
          <h2>{tx("FAQ", "الأسئلة الشائعة")}</h2>
          <div className="faq-list">{faqs.map((item) => <div className="faq-item" key={item.q || item.question}><strong>{item.q || item.question}</strong><p>{item.a || item.answer}</p></div>)}</div>
        </div>

        {related.length > 0 && (
          <section className="products-section">
            <div className="section-title-row"><span className="section-kicker">{tx("Related", "منتجات ذات صلة")}</span><h2>{tx("Similar Excel products", "منتجات Excel مشابهة")}</h2></div>
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
