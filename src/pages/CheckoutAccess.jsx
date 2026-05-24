import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { getProductById, getProductBySlug } from "../lib/productService";
import { formatPrice } from "../lib/utils";
import { useAppContext } from "../context/AppContext";

function CheckoutAccess() {
  const { id } = useParams();
  const { t, tx } = useAppContext();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadProduct() {
      if (!id) return;
      const result = Number.isNaN(Number(id)) ? await getProductBySlug(id) : await getProductById(id);
      if (active) setProduct(result.data || null);
    }
    loadProduct();
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <PageWrapper>
      <section className="page-section">
        <div className="container checkout-access-grid">
          <div className="details-box checkout-access-main">
            <span className="section-kicker">{tx("Secure checkout", "شراء آمن")}</span>
            <h1>{id ? t.checkoutAccessTitle : t.chooseProductFirst}</h1>
            <p className="details-description">
              {id ? t.checkoutAccessSubtitle : t.noCartDescription}
            </p>
            <div className="checkout-process-list">
              <span>{tx("Create an account or sign in to continue checkout.", "أنشئ حسابًا أو سجل دخولك لمتابعة الشراء.")}</span>
              <span>{tx("Orders, licenses, and downloads stay organized in your customer portal.", "يتم تنظيم الطلبات والتراخيص والتحميلات داخل بوابة العميل.")}</span>
              <span>{t.manualPaymentNotice}</span>
            </div>
            <div className="details-actions">
              <Link to="/login" className="primary-link-btn">{t.signInToContinue}</Link>
              <Link to="/register" className="secondary-link-btn">{t.createAccount}</Link>
              <Link to="/products" className="card-link-btn">{t.browseProducts}</Link>
            </div>
          </div>

          <aside className="details-box checkout-access-card">
            {product ? (
              <>
                <span className="section-kicker">{t.selectedProduct}</span>
                <h2>{product.title}</h2>
                <p>{product.short_description || product.description}</p>
                <strong>{formatPrice(product.sale_price || product.price || 0, product.currency)}</strong>
                <div className="trust-list">
                  <span className="trust-pill">{t.secureDelivery}</span>
                  <span className="trust-pill">{t.licenseIncluded}</span>
                  <span className="trust-pill">{t.supportAvailable}</span>
                </div>
              </>
            ) : (
              <>
                <span className="section-kicker">{tx("No product selected", "لم يتم اختيار منتج")}</span>
                <h2>{t.chooseProductFirst}</h2>
                <p>{t.noCartDescription}</p>
                <Link to="/free-templates" className="secondary-link-btn">{t.freeTemplates}</Link>
              </>
            )}
          </aside>
        </div>
      </section>
    </PageWrapper>
  );
}

export default CheckoutAccess;
