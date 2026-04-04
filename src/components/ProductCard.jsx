import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
}) {
  const { tx } = useAppContext();

  const shortDescription = description
    ? description.length > 110
      ? `${description.slice(0, 110)}...`
      : description
    : tx("No description available yet.", "لا يوجد وصف متاح حاليًا.");

  return (
    <motion.article
      className="product-card"
      whileHover={{ y: -8, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
    >
      <div className="product-card-media">
        {image ? (
          <img src={image} alt={title} className="product-image" />
        ) : (
          <div className="product-card-placeholder">
            {tx("No Image", "لا توجد صورة")}
          </div>
        )}

        {featured && (
          <span className="featured-badge">
            {tx("Featured", "مميز")}
          </span>
        )}
      </div>

      <div className="product-card-body">
        {category && <span className="product-card-category">{category}</span>}

        <h3 className="product-card-title">{title}</h3>

        <p className="product-card-desc">{shortDescription}</p>

        <div className="product-price-row">
          <span className="current-price">
            {price} {currency}
          </span>

          {oldPrice ? (
            <span className="old-price">
              {oldPrice} {currency}
            </span>
          ) : null}
        </div>

        {tags.length > 0 && (
          <div className="card-tags">
            {tags.slice(0, 3).map((tag, index) => (
              <span key={`${tag}-${index}`} className="tag-chip">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="card-footer">
          <Link to={`/product/${id}`} className="card-link-btn">
            {tx("View Details", "عرض التفاصيل")}
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default ProductCard;