import PageWrapper from "../components/PageWrapper";
import Products from "../components/Products";
import { useAppContext } from "../context/AppContext";

function ProductsPage() {
  const { tx } = useAppContext();

  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">{tx("Our Products", "منتجاتنا")}</h1>
        <Products />
      </div>
    </PageWrapper>
  );
}

export default ProductsPage;