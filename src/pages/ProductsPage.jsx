import PageWrapper from "../components/PageWrapper";

import Products from "../components/Products";

function ProductsPage() {
  return (
     <PageWrapper>
    <div className="container page-section">
      <h1 className="page-title">Our Products</h1>
      <Products />
    </div>
  </PageWrapper>
  );
}

export default ProductsPage;