import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ProductCard from "./ProductCard";
import { useAppContext } from "../context/AppContext";

function Products({ featuredOnly = false, showHeader = true, limit = null }) {
  const { tx } = useAppContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);

      let query = supabase
        .from("products")
        .select(
          "id, title, description, price, currency, cover_image_url, image_url, image_urls, featured, old_price, category, tags, updated_at, is_active"
        )
        .eq("is_active", true)
        .order("featured", { ascending: false })
        .order("updated_at", { ascending: false })
        .order("id", { ascending: false });

      if (featuredOnly) {
        query = query.eq("featured", true);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Fetch products error:", error);
        setProducts([]);
      } else {
        setProducts(data || []);
      }

      setLoading(false);
    }

    fetchProducts();
  }, [featuredOnly, limit]);

  return (
    <section className="products-section">
      <div className="container">
        {showHeader && (
          <div className="section-title-row">
            <span className="section-kicker">
              {featuredOnly
                ? tx("Featured Collection", "مجموعة مميزة")
                : tx("All Products", "كل المنتجات")}
            </span>

            <h2>
              {featuredOnly
                ? tx("Featured Products", "المنتجات المميزة")
                : tx("Browse Our Products", "تصفح منتجاتنا")}
            </h2>

            <p className="section-subtitle">
              {featuredOnly
                ? tx(
                    "Hand-picked digital products ready for instant value.",
                    "منتجات رقمية مختارة بعناية وجاهزة لتقديم قيمة مباشرة."
                  )
                : tx(
                    "Explore our ready-made systems, sheets, dashboards, and business tools.",
                    "استكشف أنظمتنا الجاهزة والشيتات والداشبوردز وأدوات الأعمال."
                  )}
            </p>
          </div>
        )}

        {loading ? (
          <div className="products-empty">
            {tx("Loading products...", "جاري تحميل المنتجات...")}
          </div>
        ) : products.length === 0 ? (
          <div className="products-empty">
            {tx("No products available right now.", "لا توجد منتجات متاحة حاليًا.")}
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                description={product.description}
                price={product.price}
                oldPrice={product.old_price}
                currency={product.currency}
                category={product.category}
                tags={Array.isArray(product.tags) ? product.tags : []}
                featured={product.featured}
                image={
                  product.cover_image_url ||
                  product.image_urls?.[0] ||
                  product.image_url ||
                  ""
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Products;