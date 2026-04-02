import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PageWrapper from "../components/PageWrapper";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    long_description: "",
    price: "",
    currency: "EGP",
    image_url: "",
    file_url: "",
  });

  async function fetchProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch admin products error:", error);
    } else {
      setProducts(data || []);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const { error } = await supabase.from("products").insert([
      {
        title: formData.title,
        description: formData.description,
        long_description: formData.long_description,
        price: Number(formData.price),
        currency: formData.currency,
        image_url: formData.image_url,
        image_urls: formData.image_url ? [formData.image_url] : [],
        file_url: formData.file_url,
        is_active: true,
      },
    ]);

    if (error) {
      alert(`Failed to add product: ${error.message}`);
      return;
    }

    setFormData({
      title: "",
      description: "",
      long_description: "",
      price: "",
      currency: "EGP",
      image_url: "",
      file_url: "",
    });

    fetchProducts();
  }

  async function toggleActive(product) {
    const { error } = await supabase
      .from("products")
      .update({ is_active: !product.is_active })
      .eq("id", product.id);

    if (error) {
      alert(`Failed to update product: ${error.message}`);
      return;
    }

    fetchProducts();
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">Admin Products</h1>

        <div className="checkout-box" style={{ marginBottom: "30px" }}>
          <h2 style={{ marginBottom: "20px" }}>Add New Product</h2>

          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Short Description</label>
              <textarea
                rows="3"
                name="description"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="form-group">
              <label>Long Description</label>
              <textarea
                rows="6"
                name="long_description"
                value={formData.long_description}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Currency</label>
              <input
                type="text"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Main Image URL</label>
              <input
                type="text"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>File URL</label>
              <input
                type="text"
                name="file_url"
                value={formData.file_url}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="primary-btn">
              Add Product
            </button>
          </form>
        </div>

        <div className="orders-grid">
          {products.map((product) => (
            <div className="order-card" key={product.id}>
              <div className="order-header">
                <h2>{product.title}</h2>
                <span className="status-badge">
                  {product.is_active ? "Active" : "Hidden"}
                </span>
              </div>

              <p><strong>Price:</strong> {product.price} {product.currency}</p>
              <p><strong>Description:</strong> {product.description}</p>

              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="product-image"
                  style={{ maxWidth: "250px" }}
                />
              )}

              <div className="status-actions">
                <button onClick={() => toggleActive(product)}>
                  {product.is_active ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}

export default AdminProducts;