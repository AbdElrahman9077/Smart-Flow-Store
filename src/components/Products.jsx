import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ProductCard from "./ProductCard";

function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("id", { ascending: true });

      if (error) {
        console.error("Fetch products error:", error);
      } else {
        setProducts(data || []);
      }
    }

    fetchProducts();
  }, []);

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
              currency={product.currency}
              image={product.image_urls?.[0] || product.image_url || ""}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Products;