import { Link } from "react-router-dom";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { formatPrice } from "../lib/utils";

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
  const shortDescription = description && description.length > 118 ? `${description.slice(0, 118)}...` : description || "No description available yet.";

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
        {featured && <span className="featured-badge">Featured</span>}
        {Number(price) === 0 && <span className="free-badge">Free</span>}
      </div>

      <div className="product-card-body">
        <div className="product-card-topline">
          {category && <span className="product-card-category">{category}</span>}
          <span className="rating-chip">4.9 (12)</span>
        </div>
        <h3 className="product-card-title">{title}</h3>
        <p className="product-card-desc">{shortDescription}</p>
        <div className="product-price-row">
          <span className="current-price">{formatPrice(price, currency)}</span>
          {oldPrice && Number(oldPrice) > Number(price) ? <span className="old-price">{formatPrice(oldPrice, currency)}</span> : null}
        </div>
        <div className="card-tags">
          <span className="tag-chip">{productType}</span>
          {compatibility && <span className="tag-chip">{compatibility}</span>}
          {version && <span className="tag-chip">v{version}</span>}
          {tags.slice(0, 2).map((tag, index) => <span key={`${tag}-${index}`} className="tag-chip">{tag}</span>)}
        </div>
        <div className="card-footer">
          <Link to={`/products/${id}`} className="card-link-btn">View details</Link>
          <Link to={`/checkout/${id}`} className="primary-link-btn">Buy now</Link>
          <Link to="/custom-request" className="secondary-link-btn">Customize</Link>
        </div>
      </div>
    </Motion.article>
  );
}

export default ProductCard;
