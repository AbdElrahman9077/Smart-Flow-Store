import { Link } from "react-router-dom";

function ProductCard({ id, title, description, price, currency }) {
  return (
    <div className="product-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <span>{price} {currency}</span>

      <div style={{ marginTop: "16px" }}>
        <Link to={`/product/${id}`}>View Details</Link>
      </div>
    </div>
  );
}

export default ProductCard;