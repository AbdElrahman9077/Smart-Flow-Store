import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import PageWrapper from "../components/PageWrapper";
import { useAppContext } from "../context/AppContext";

function ProductDetails() {
  const { id } = useParams();
  const { tx } = useAppContext();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setProduct(data);
        setActiveImage(data.image_urls?.[0] || data.image_url || "");
      } else {
        setProduct(null);
      }

      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="container page-section">
          <h2>{tx("Loading product...", "جاري تحميل المنتج...")}</h2>
        </div>
      </PageWrapper>
    );
  }

  if (!product) {
    return (
      <PageWrapper>
        <div className="container page-section">
          <h2>{tx("Product not found", "المنتج غير موجود")}</h2>
        </div>
      </PageWrapper>
    );
  }

  const gallery = product.image_urls?.length
    ? product.image_urls
    : product.image_url
    ? [product.image_url]
    : [];

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="details-box">
          {activeImage && (
            <img src={activeImage} alt={product.title} className="details-image" />
          )}

          {gallery.length > 1 && (
            <div className="thumb-grid">
              {gallery.map((img, index) => (
                <button
                  key={index}
                  className="thumb-btn"
                  onClick={() => setActiveImage(img)}
                  type="button"
                >
                  <img
                    src={img}
                    alt={`${product.title}-${index}`}
                    className="thumb-image"
                  />
                </button>
              ))}
            </div>
          )}

          <h1>{product.title}</h1>

          <p className="details-description">
            {product.long_description || product.description}
          </p>

          <h3 className="details-price">
            {tx("Price:", "السعر:")} {product.price} {product.currency}
          </h3>

          <Link to={`/checkout/${product.id}`} className="primary-link-btn">
            {tx("Buy Now", "اشترِ الآن")}
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}

export default ProductDetails;