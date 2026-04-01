import { useParams, Link } from "react-router-dom";
import products from "../data/products";

function ProductDetails() {
  const { id } = useParams();
console.log("Product ID from URL:", id);

const product = products.find((item) => item.id === Number(id));
console.log("Found product:", product);

  if (!product) {
    return (
      <div className="container page-section">
        <h2>Product not found</h2>
      </div>
    );
  }

  return (
    <div className="container page-section">
      <div className="details-box">
        <h1>{product.title}</h1>
        <p className="details-description">{product.description}</p>
        <h3 className="details-price">Price: ${product.price}</h3>

        <Link to={`/checkout/${product.id}`} className="primary-link-btn">
          Buy Now
        </Link>
      </div>
    </div>
  );
}

export default ProductDetails;