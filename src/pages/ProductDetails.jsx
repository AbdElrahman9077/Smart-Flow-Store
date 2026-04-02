import { useParams, Link } from "react-router-dom";
import products from "../data/products";
import PageWrapper from "../components/PageWrapper";

function ProductDetails() {
  const { id } = useParams();

  const product = products.find((item) => String(item.id) === String(id));

  if (!product) {
    return (
      <PageWrapper>
        <div className="container page-section">
          <h2>Product not found</h2>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="details-box">
          {product.image && (
            <img src={product.image} alt={product.title} className="details-image" />
          )}

          <h1>{product.title}</h1>
          <p className="details-description">{product.description}</p>
          <h3 className="details-price">
            Price: {product.price} {product.currency}
          </h3>

          <Link to={`/checkout/${product.id}`} className="primary-link-btn">
            Buy Now
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}

export default ProductDetails;