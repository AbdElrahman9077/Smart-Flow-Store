import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PageWrapper from "../components/PageWrapper";
import { useToast } from "../context/ToastContext";
import { useAppContext } from "../context/AppContext";

const initialFormData = {
  title: "",
  description: "",
  long_description: "",
  price: "",
  currency: "EGP",
  image_url: "",
  file_url: "",
  file_path: "",
};

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  const { showToast } = useToast();
  const { tx } = useAppContext();

  async function fetchProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch admin products error:", error);
      showToast(tx("Failed to load products.", "فشل تحميل المنتجات."), "error");
      setProducts([]);
      setLoading(false);
      return;
    }

    setProducts(data || []);
    setLoading(false);
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

  function resetForm() {
    setFormData(initialFormData);
    setEditingProductId(null);
  }

  function handleEdit(product) {
    setEditingProductId(product.id);
    setFormData({
      title: product.title || "",
      description: product.description || "",
      long_description: product.long_description || "",
      price: product.price ?? "",
      currency: product.currency || "EGP",
      image_url: product.image_url || "",
      file_url: product.file_url || "",
      file_path: product.file_path || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast(tx("Title is required.", "العنوان مطلوب."), "error");
      return;
    }

    if (!String(formData.price).trim()) {
      showToast(tx("Price is required.", "السعر مطلوب."), "error");
      return;
    }

    setSubmitting(true);

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      long_description: formData.long_description.trim(),
      price: Number(formData.price),
      currency: formData.currency.trim() || "EGP",
      image_url: formData.image_url.trim(),
      image_urls: formData.image_url.trim() ? [formData.image_url.trim()] : [],
      file_url: formData.file_url.trim(),
      file_path: formData.file_path.trim(),
    };

    let error = null;

    if (editingProductId) {
      const response = await supabase
        .from("products")
        .update(payload)
        .eq("id", editingProductId);

      error = response.error;
    } else {
      const response = await supabase.from("products").insert([
        {
          ...payload,
          is_active: true,
          download_count: 0,
        },
      ]);

      error = response.error;
    }

    setSubmitting(false);

    if (error) {
      showToast(
        tx(`Failed to save product: ${error.message}`, `فشل حفظ المنتج: ${error.message}`),
        "error"
      );
      return;
    }

    showToast(
      editingProductId
        ? tx("Product updated successfully.", "تم تحديث المنتج بنجاح.")
        : tx("Product added successfully.", "تمت إضافة المنتج بنجاح.")
    );

    resetForm();
    fetchProducts();
  }

  async function toggleActive(product) {
    const { error } = await supabase
      .from("products")
      .update({ is_active: !product.is_active })
      .eq("id", product.id);

    if (error) {
      showToast(
        tx(`Failed to update product: ${error.message}`, `فشل تحديث المنتج: ${error.message}`),
        "error"
      );
      return;
    }

    showToast(
      product.is_active
        ? tx("Product hidden successfully.", "تم إخفاء المنتج بنجاح.")
        : tx("Product shown successfully.", "تم إظهار المنتج بنجاح.")
    );

    fetchProducts();
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">{tx("Admin Products", "إدارة المنتجات")}</h1>

        <div className="checkout-box" style={{ marginBottom: "30px" }}>
          <h2 style={{ marginBottom: "20px" }}>
            {editingProductId
              ? tx("Edit Product", "تعديل المنتج")
              : tx("Add New Product", "إضافة منتج جديد")}
          </h2>

          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{tx("Title", "العنوان")}</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={tx("Enter product title", "ادخل عنوان المنتج")}
              />
            </div>

            <div className="form-group">
              <label>{tx("Short Description", "وصف مختصر")}</label>
              <textarea
                rows="3"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={tx("Enter short description", "ادخل وصفًا مختصرًا")}
              />
            </div>

            <div className="form-group">
              <label>{tx("Long Description", "وصف كامل")}</label>
              <textarea
                rows="6"
                name="long_description"
                value={formData.long_description}
                onChange={handleChange}
                placeholder={tx("Enter full description", "ادخل الوصف الكامل")}
              />
            </div>

            <div className="form-group">
              <label>{tx("Price", "السعر")}</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder={tx("Enter price", "ادخل السعر")}
              />
            </div>

            <div className="form-group">
              <label>{tx("Currency", "العملة")}</label>
              <input
                type="text"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                placeholder={tx("Example: EGP", "مثال: EGP")}
              />
            </div>

            <div className="form-group">
              <label>{tx("Main Image URL", "رابط الصورة الرئيسية")}</label>
              <input
                type="text"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder={tx("Enter image URL", "ادخل رابط الصورة")}
              />
            </div>

            <div className="form-group">
              <label>{tx("File URL", "رابط الملف")}</label>
              <input
                type="text"
                name="file_url"
                value={formData.file_url}
                onChange={handleChange}
                placeholder={tx("Optional direct download URL", "رابط مباشر اختياري للتحميل")}
              />
            </div>

            <div className="form-group">
              <label>{tx("File Path", "مسار الملف")}</label>
              <input
                type="text"
                name="file_path"
                value={formData.file_path}
                onChange={handleChange}
                placeholder={tx(
                  "Optional storage path inside bucket",
                  "مسار الملف داخل الـ bucket بشكل اختياري"
                )}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button type="submit" className="primary-btn" disabled={submitting}>
                {submitting
                  ? tx("Saving...", "جاري الحفظ...")
                  : editingProductId
                  ? tx("Update Product", "تحديث المنتج")
                  : tx("Add Product", "إضافة المنتج")}
              </button>

              {editingProductId && (
                <button type="button" className="secondary-link-btn" onClick={resetForm}>
                  {tx("Cancel Edit", "إلغاء التعديل")}
                </button>
              )}
            </div>
          </form>
        </div>

        {loading ? (
          <div className="details-box">
            <p className="details-description">
              {tx("Loading products...", "جاري تحميل المنتجات...")}
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="details-box">
            <p className="details-description">
              {tx("No products found.", "لا توجد منتجات.")}
            </p>
          </div>
        ) : (
          <div className="orders-grid">
            {products.map((product) => (
              <div className="order-card" key={product.id}>
                <div className="order-header">
                  <h2>{product.title}</h2>
                  <span className="status-badge">
                    {product.is_active ? tx("Active", "نشط") : tx("Hidden", "مخفي")}
                  </span>
                </div>

                <p>
                  <strong>{tx("Price:", "السعر:")}</strong> {product.price} {product.currency}
                </p>

                <p>
                  <strong>{tx("Description:", "الوصف:")}</strong>{" "}
                  {product.description || tx("No description", "لا يوجد وصف")}
                </p>

                <p>
                  <strong>{tx("File URL:", "رابط الملف:")}</strong>{" "}
                  {product.file_url || tx("Not set", "غير محدد")}
                </p>

                <p>
                  <strong>{tx("File Path:", "مسار الملف:")}</strong>{" "}
                  {product.file_path || tx("Not set", "غير محدد")}
                </p>

                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="product-image"
                    style={{ maxWidth: "250px" }}
                  />
                )}

                <div className="status-actions">
                  <button onClick={() => handleEdit(product)}>
                    {tx("Edit", "تعديل")}
                  </button>

                  <button onClick={() => toggleActive(product)}>
                    {product.is_active ? tx("Hide", "إخفاء") : tx("Show", "إظهار")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default AdminProducts;