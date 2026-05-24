import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "./ProductCard";
import { getProducts } from "../lib/productService";
import { StaggerContainer, StaggerItem, SlideUp } from "./animations";

const productTypes = ["all", "system", "template", "bundle", "service", "free"];

function Products({ featuredOnly = false, showHeader = true, limit = null }) {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const result = await getProducts({ featured: featuredOnly ? true : null, limit, orderBy: sort });
      setProducts(result.data || []);
      setLoading(false);
    }
    fetchProducts();
  }, [featuredOnly, limit, sort]);

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category).filter(Boolean))), [products]);
  const activeCategory = slug ? slug.replace(/-/g, " ").toLowerCase() : "";

  const filtered = products.filter((product) => {
    const text = `${product.title} ${product.description || ""} ${product.short_description || ""} ${(product.tags || []).join(" ")}`.toLowerCase();
    const matchesSearch = !search || text.includes(search.toLowerCase());
    const matchesType = type === "all" || product.product_type === type;
    const effectivePrice = Number(product.sale_price || product.price || 0);
    const matchesPrice = price === "all" || (price === "free" && effectivePrice === 0) || (price === "paid" && effectivePrice > 0) || (price === "sale" && product.sale_price);
    const matchesCategory = !activeCategory || String(product.category || "").toLowerCase().replace(/&/g, "and").includes(activeCategory);
    return matchesSearch && matchesType && matchesPrice && matchesCategory;
  });

  return (
    <section className="products-section">
      <div className="container">
        {showHeader && (
          <SlideUp className="section-title-row">
            <span className="section-kicker">{featuredOnly ? "Featured Collection" : "Marketplace"}</span>
            <h2>{featuredOnly ? "Best-selling Excel systems" : "Browse Excel systems, templates, and services"}</h2>
            <p className="section-subtitle">Search, compare, and purchase digital Excel products with manual-payment delivery, licensing, and support workflows ready for production.</p>
          </SlideUp>
        )}

        {!featuredOnly && (
          <SlideUp className="catalog-toolbar">
            <input aria-label="Search products" placeholder="Search dashboards, CRM, inventory..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Product type">
              {productTypes.map((item) => <option key={item} value={item}>{item === "all" ? "All types" : item}</option>)}
            </select>
            <select value={price} onChange={(e) => setPrice(e.target.value)} aria-label="Price filter">
              <option value="all">All prices</option>
              <option value="paid">Paid</option>
              <option value="free">Free</option>
              <option value="sale">On sale</option>
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price_asc">Price low to high</option>
              <option value="price_desc">Price high to low</option>
            </select>
          </SlideUp>
        )}

        {!featuredOnly && categories.length > 0 && (
          <StaggerContainer className="filter-chip-row">{categories.map((category) => <StaggerItem as="span" className="tag-chip" key={category}>{category}</StaggerItem>)}</StaggerContainer>
        )}

        {loading ? (
          <div className="skeleton-grid">{Array.from({ length: 6 }).map((_, index) => <div className="skeleton-card" key={index} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="products-empty">No products match your filters. Try another search or request a custom Excel system.</div>
        ) : (
          <StaggerContainer className="products-grid">
            {filtered.map((product) => (
              <StaggerItem key={product.id}>
              <ProductCard key={product.id} id={product.slug || product.id} title={product.title} description={product.short_description || product.description} price={product.sale_price || product.price} oldPrice={product.old_price || product.price} currency={product.currency} category={product.category} tags={Array.isArray(product.tags) ? product.tags : []} featured={product.featured} productType={product.product_type} compatibility={product.compatibility} version={product.version} image={product.cover_image_url || product.image_urls?.[0] || product.image_url || ""} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </section>
  );
}

export default Products;
