import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function ProductCard({ id, title, description, price, currency, image }) {
  return (
    <motion.div
      className="product-card"
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
    >
      {image && <img src={image} alt={title} className="product-image" />}

      <h3>{title}</h3>
      <p>{description}</p>
      <span>{price} {currency}</span>

      <div style={{ marginTop: "16px" }}>
        <Link to={`/product/${id}`}>View Details</Link>
      </div>
    </motion.div>
  );
}

export default ProductCard;