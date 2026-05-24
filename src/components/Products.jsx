import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "./ProductCard";
import { getProducts } from "../lib/productService";
import { StaggerContainer, StaggerItem, SlideUp } from "./animations";
import { useAppContext } from "../context/AppContext";

const productTypes = ["all", "system", "template", "bundle", "service", "free"];

function Products({ featuredOnly = false, showHeader = true, limit = null }) {
  const { slug } = useParams();
  const { t, categoryLabel, productTypeLabel } = useAppContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

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
            <span className="section-kicker">{featuredOnly ? t.featuredCollection : t.marketplace}</span>
            <h2>{featuredOnly ? t.bestSellingSystems : t.browseCatalogTitle}</h2>
            <p className="section-subtitle">{t.catalogSubtitle}</p>
          </SlideUp>
        )}

        {!featuredOnly && (
          <SlideUp className={`catalog-toolbar ${filtersOpen ? "filters-open" : ""}`}>
            <input aria-label={t.searchProducts} placeholder={t.searchProducts} value={search} onChange={(e) => setSearch(e.target.value)} />
            <button type="button" className="filter-toggle" onClick={() => setFiltersOpen((open) => !open)}>
              {filtersOpen ? t.hideFilters : t.filters}
            </button>
            <div className="catalog-filter-fields">
              <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Product type">
                {productTypes.map((item) => <option key={item} value={item}>{item === "all" ? t.allTypes : productTypeLabel(item)}</option>)}
              </select>
              <select value={price} onChange={(e) => setPrice(e.target.value)} aria-label="Price filter">
                <option value="all">{t.allPrices}</option>
                <option value="paid">{t.paid}</option>
                <option value="free">{t.free}</option>
                <option value="sale">{t.onSale}</option>
              </select>
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
                <option value="featured">{t.featured}</option>
                <option value="newest">{t.newest}</option>
                <option value="price_asc">{t.priceLowHigh}</option>
                <option value="price_desc">{t.priceHighLow}</option>
              </select>
            </div>
          </SlideUp>
        )}

        {!featuredOnly && categories.length > 0 && (
          <StaggerContainer className="filter-chip-row">{categories.map((category) => <StaggerItem as="span" className="tag-chip" key={category}>{categoryLabel(category)}</StaggerItem>)}</StaggerContainer>
        )}

        {loading ? (
          <div className="skeleton-grid">{Array.from({ length: 6 }).map((_, index) => <div className="skeleton-card" key={index} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="products-empty">{t.noProducts}</div>
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
