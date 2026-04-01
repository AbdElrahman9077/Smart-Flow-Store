import products from "../data/products";
import ProductCard from "./ProductCard";

function Products() {
  return (
    <section className="products-section">
      <div className="container">
        <h2>Featured Products</h2>

        <div className="products-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              description={product.description}
              price={product.price}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Products;