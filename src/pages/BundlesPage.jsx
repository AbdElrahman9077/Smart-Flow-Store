import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../lib/productService";
import { useAppContext } from "../context/AppContext";
import { LoadingSkeleton } from "../components/ui";
import { normalizeProductType } from "../lib/productTypes";

function BundlesPage() {
  const { tx, t } = useAppContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then(({ data }) => {
      setProducts(data || []);
      setLoading(false);
    });
  }, []);

  const actualBundles = products.filter((product) => normalizeProductType(product.product_type) === "bundle");
  const curatedBundles = useMemo(() => {
    const byCategory = (name) => products.filter((product) => product.category === name).slice(0, 3);
    return [
      {
        title: tx("Operations Control Bundle", "حزمة ضبط العمليات"),
        description: tx("A curated package for teams that need dashboards, stock visibility, and daily operational reporting.", "حزمة مختارة للفرق التي تحتاج إلى لوحات متابعة ورؤية للمخزون وتقارير تشغيل يومية."),
        useCase: tx("Operations, inventory, and management reporting", "العمليات والمخزون والتقارير الإدارية"),
        items: [...byCategory("Dashboards"), ...byCategory("Inventory")].slice(0, 3),
      },
      {
        title: tx("Sales Growth Bundle", "حزمة نمو المبيعات"),
        description: tx("A quote-ready package for sales tracking, CRM follow-up, and performance reviews.", "حزمة جاهزة للتسعير لمتابعة المبيعات وإدارة العملاء ومراجعة الأداء."),
        useCase: tx("Sales teams, pipeline tracking, and follow-up", "فرق المبيعات ومتابعة العملاء والفرص"),
        items: [...byCategory("Sales & CRM"), ...byCategory("Dashboards")].slice(0, 3),
      },
      {
        title: tx("Finance Starter Bundle", "حزمة البداية المالية"),
        description: tx("A practical set for budget planning, reporting, and lightweight financial control.", "مجموعة عملية لتخطيط الميزانية والتقارير والرقابة المالية المبسطة."),
        useCase: tx("Small business finance and planning", "التخطيط المالي للشركات الصغيرة"),
        items: byCategory("Finance").slice(0, 3),
      },
    ];
  }, [products, tx]);

  return (
    <PageWrapper>
      <section className="page-section">
        <div className="container page-header">
          <span className="section-kicker">{tx("Curated business packages", "حزم أعمال مختارة")}</span>
          <h1 className="page-title">{tx("Excel system bundles for complete workflows", "حزم أنظمة Excel لسير عمل متكامل")}</h1>
          <p className="page-subtitle">
            {tx(
              "Bundle options combine related Excel systems into a clearer operating workflow. When a fixed bundle is not available yet, request a quote for a curated package.",
              "تجمع الحزم بين أنظمة Excel المرتبطة لتكوين سير عمل أوضح. وعند عدم توفر حزمة ثابتة، يمكنك طلب عرض سعر لحزمة مختارة."
            )}
          </p>
          <div className="section-actions">
            <Link to="/custom-request" className="primary-link-btn">{tx("Request bundle quote", "طلب عرض سعر للحزمة")}</Link>
            <Link to="/products" className="secondary-link-btn">{t.browseProducts}</Link>
          </div>
        </div>
      </section>

      <div className="container page-section">
        {loading ? (
          <LoadingSkeleton cards={3} />
        ) : actualBundles.length > 0 ? (
          <div className="products-grid">
            {actualBundles.map((product) => (
              <ProductCard key={product.id} product={product} id={product.slug || product.id} title={product.title} description={product.description || product.short_description} price={product.price} oldPrice={product.old_price} currency={product.currency} category={product.category} tags={Array.isArray(product.tags) ? product.tags : []} featured={product.featured} image={product.cover_image_url || product.image_url || ""} productType={product.product_type} />
            ))}
          </div>
        ) : (
          <div className="bundle-grid">
            {curatedBundles.map((bundle) => (
              <article className="details-box bundle-card" key={bundle.title}>
                <span className="section-kicker">{tx("Quote-ready package", "حزمة جاهزة للتسعير")}</span>
                <h2>{bundle.title}</h2>
                <p>{bundle.description}</p>
                <div className="bundle-use-case">
                  <strong>{tx("Best for", "مناسبة لـ")}</strong>
                  <span>{bundle.useCase}</span>
                </div>
                <div className="bundle-items">
                  <strong>{tx("Included systems", "الأنظمة المقترحة")}</strong>
                  {bundle.items.length > 0 ? (
                    bundle.items.map((item) => <span key={item.id}>{item.title}</span>)
                  ) : (
                    <span>{tx("Configured after discovery call", "يتم تحديدها بعد مراجعة الاحتياج")}</span>
                  )}
                </div>
                <div className="card-footer">
                  <Link to="/custom-request" className="primary-link-btn">{tx("Request quote", "طلب عرض سعر")}</Link>
                  <Link to="/products" className="card-link-btn">{tx("View products", "عرض المنتجات")}</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default BundlesPage;
