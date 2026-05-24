import { Link } from "react-router-dom";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { formatPrice } from "../lib/utils";
import { useAppContext } from "../context/AppContext";

function ProductCard({
  id,
  title,
  description,
  price,
  oldPrice,
  currency,
  image,
  category,
  tags = [],
  featured = false,
  productType = "template",
  compatibility,
  version,
}) {
  const reduce = useReducedMotion();
  const { t, categoryLabel, productTypeLabel } = useAppContext();
  const shortDescription = description && description.length > 118 ? `${description.slice(0, 118)}...` : description || "No description available yet.";
  const isFree = Number(price || 0) === 0 || productType === "free";
  const primaryLabel = isFree ? t.downloadFree : t.buyNow;
  const displayPrice = isFree ? t.free : formatPrice(price, currency);

  return (
    <Motion.article
      className="product-card animate-card-hover"
      variants={{
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] } },
      }}
      initial={reduce ? false : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once: true, margin: "-30px" }}
      whileHover={reduce ? undefined : { y: -7 }}
      whileTap={reduce ? undefined : { scale: 0.99 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <div className="product-card-media">
        {image ? <img src={image} alt={title} className="product-image" /> : <div className="product-card-placeholder">Excel product</div>}
        {featured && <span className="featured-badge">{t.featured}</span>}
        {isFree && <span className="free-badge">{t.free}</span>}
      </div>

      <div className="product-card-body">
        <div className="product-card-topline">
          {category && <span className="product-card-category">{categoryLabel(category)}</span>}
          <span className="rating-chip">{isFree ? t.getTemplate : t.licenseIncluded}</span>
        </div>
        <h3 className="product-card-title">{title}</h3>
        <p className="product-card-desc">{shortDescription}</p>
        <div className="product-price-row">
          <span className="current-price">{displayPrice}</span>
          {oldPrice && Number(oldPrice) > Number(price) ? <span className="old-price">{formatPrice(oldPrice, currency)}</span> : null}
        </div>
        <div className="card-tags">
          <span className="tag-chip">{productTypeLabel(productType)}</span>
          {compatibility && <span className="tag-chip">{compatibility}</span>}
          {version && <span className="tag-chip">v{version}</span>}
          {tags.slice(0, 2).map((tag, index) => <span key={`${tag}-${index}`} className="tag-chip">{tag}</span>)}
        </div>
        <div className="proof-chip-row">
          <span>{t.secureDelivery}</span>
          <span>{t.supportAvailable}</span>
          <span>{t.customizable}</span>
        </div>
        <div className="card-footer">
          <Link to={`/products/${id}`} className="card-link-btn">{t.viewDetails}</Link>
          <Link to={`/checkout/${id}`} className="primary-link-btn">{primaryLabel}</Link>
          <Link to="/custom-request" className="secondary-link-btn">{t.customize}</Link>
        </div>
      </div>
    </Motion.article>
  );
}

export default ProductCard;
