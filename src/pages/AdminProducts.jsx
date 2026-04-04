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
  old_price: "",
  currency: "EGP",
  category: "",
  tags_text: "",
  featured: false,
};

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [descriptionImageFiles, setDescriptionImageFiles] = useState([]);
  const [productFile, setProductFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const { showToast } = useToast();
  const { tx } = useAppContext();

  function parseTags(value) {
    return String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function formatDate(value) {
    if (!value) return tx("Not available", "غير متاح");
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  }

  async function fetchProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("updated_at", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
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
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function resetForm() {
    setFormData(initialFormData);
    setCoverImageFile(null);
    setDescriptionImageFiles([]);
    setProductFile(null);
    setEditingProductId(null);
    setEditingProduct(null);
  }

  function handleEdit(product) {
    setEditingProductId(product.id);
    setEditingProduct(product);

    setFormData({
      title: product.title || "",
      description: product.description || "",
      long_description: product.long_description || "",
      price: product.price ?? "",
      old_price: product.old_price ?? "",
      currency: product.currency || "EGP",
      category: product.category || "",
      tags_text: Array.isArray(product.tags) ? product.tags.join(", ") : "",
      featured: Boolean(product.featured),
    });

    setCoverImageFile(null);
    setDescriptionImageFiles([]);
    setProductFile(null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadImage(file, folder = "products") {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: false });

    if (error) throw error;

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);

    return {
      path,
      url: data.publicUrl,
    };
  }

  async function uploadProductFile(file) {
    const ext = file.name.split(".").pop();
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

    const { error } = await supabase.storage
      .from("product-files")
      .upload(path, file, { upsert: false });

    if (error) throw error;

    return { file_path: path };
  }

  async function uploadDescriptionImages(files) {
    const uploaded = await Promise.all(
      files.map((file) => uploadImage(file, "descriptions"))
    );

    return {
      description_image_paths: uploaded.map((item) => item.path),
      description_image_urls: uploaded.map((item) => item.url),
    };
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

    if (Number(formData.price) < 0) {
      showToast(tx("Price cannot be negative.", "السعر لا يمكن أن يكون سالبًا."), "error");
      return;
    }

    if (formData.old_price !== "" && Number(formData.old_price) < 0) {
      showToast(
        tx("Old price cannot be negative.", "السعر القديم لا يمكن أن يكون سالبًا."),
        "error"
      );
      return;
    }

    if (!editingProductId && !productFile) {
      showToast(tx("Please upload the product file.", "من فضلك ارفع ملف المنتج."), "error");
      return;
    }

    if (!editingProductId && !coverImageFile) {
      showToast(tx("Please upload a cover image.", "من فضلك ارفع صورة الغلاف."), "error");
      return;
    }

    setSubmitting(true);

    try {
      let coverImagePath =
        editingProduct?.cover_image_path || editingProduct?.image_path || null;
      let coverImageUrl =
        editingProduct?.cover_image_url || editingProduct?.image_url || "";
      let descriptionImagePaths = Array.isArray(editingProduct?.description_image_paths)
        ? editingProduct.description_image_paths
        : [];
      let descriptionImageUrls = Array.isArray(editingProduct?.description_image_urls)
        ? editingProduct.description_image_urls
        : [];
      let filePath = editingProduct?.file_path || null;

      if (coverImageFile) {
        const uploadedCover = await uploadImage(coverImageFile, "covers");
        coverImagePath = uploadedCover.path;
        coverImageUrl = uploadedCover.url;
      }

      if (descriptionImageFiles.length > 0) {
        const uploadedDescriptions = await uploadDescriptionImages(descriptionImageFiles);
        descriptionImagePaths = uploadedDescriptions.description_image_paths;
        descriptionImageUrls = uploadedDescriptions.description_image_urls;
      }

      if (productFile) {
        const uploadedFile = await uploadProductFile(productFile);
        filePath = uploadedFile.file_path;
      }

      const allImageUrls = [coverImageUrl, ...descriptionImageUrls].filter(Boolean);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        long_description: formData.long_description.trim(),
        price: Number(formData.price),
        old_price:
          String(formData.old_price).trim() === "" ? null : Number(formData.old_price),
        currency: formData.currency.trim() || "EGP",
        category: formData.category.trim() || null,
        tags: parseTags(formData.tags_text),
        featured: Boolean(formData.featured),
        cover_image_path: coverImagePath,
        cover_image_url: coverImageUrl,
        image_path: coverImagePath,
        image_url: coverImageUrl,
        image_urls: allImageUrls,
        description_image_paths: descriptionImagePaths,
        description_image_urls: descriptionImageUrls,
        file_path: filePath,
        updated_at: new Date().toISOString(),
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

      if (error) throw error;

      showToast(
        editingProductId
          ? tx("Product updated successfully.", "تم تحديث المنتج بنجاح.")
          : tx("Product added successfully.", "تمت إضافة المنتج بنجاح.")
      );

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error(error);
      showToast(
        tx(`Failed to save product: ${error.message}`, `فشل حفظ المنتج: ${error.message}`),
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(product) {
    const { error } = await supabase
      .from("products")
      .update({
        is_active: !product.is_active,
        updated_at: new Date().toISOString(),
      })
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

        <div className="checkout-box" style={{ marginBottom: 30 }}>
          <h2 style={{ marginBottom: 20 }}>
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
                required
              />
            </div>

            <div className="form-group">
              <label>{tx("Short Description", "وصف مختصر")}</label>
              <textarea
                rows="3"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>{tx("Long Description", "وصف كامل")}</label>
              <textarea
                rows="6"
                name="long_description"
                value={formData.long_description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>{tx("Price", "السعر")}</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>{tx("Old Price", "السعر القديم")}</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="old_price"
                value={formData.old_price}
                onChange={handleChange}
                placeholder={tx("Optional", "اختياري")}
              />
            </div>

            <div className="form-group">
              <label>{tx("Currency", "العملة")}</label>
              <input
                type="text"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>{tx("Category", "التصنيف")}</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder={tx("Example: Excel System", "مثال: نظام Excel")}
              />
            </div>

            <div className="form-group">
              <label>{tx("Tags", "الوسوم")}</label>
              <input
                type="text"
                name="tags_text"
                value={formData.tags_text}
                onChange={handleChange}
                placeholder={tx(
                  "Comma separated tags",
                  "اكتب الوسوم مفصولة بفاصلة"
                )}
              />
            </div>

            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                />
                {tx("Featured Product", "منتج مميز")}
              </label>
            </div>

            <div className="form-group">
              <label>{tx("Cover Image", "صورة الغلاف")}</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)}
              />
              {editingProduct?.cover_image_url && !coverImageFile && (
                <small>
                  {tx("Current cover exists.", "يوجد غلاف حالي.")}
                </small>
              )}
            </div>

            <div className="form-group">
              <label>{tx("Description Images", "صور الوصف")}</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setDescriptionImageFiles(Array.from(e.target.files || []))}
              />
              {Array.isArray(editingProduct?.description_image_urls) &&
                editingProduct.description_image_urls.length > 0 &&
                descriptionImageFiles.length === 0 && (
                  <small>
                    {tx(
                      `Current description images: ${editingProduct.description_image_urls.length}`,
                      `صور الوصف الحالية: ${editingProduct.description_image_urls.length}`
                    )}
                  </small>
                )}
            </div>

            <div className="form-group">
              <label>{tx("Product File", "ملف المنتج")}</label>
              <input
                type="file"
                accept=".zip,.rar,.7z,.xlsx,.xlsm,.pdf,.docx,.pptx"
                onChange={(e) => setProductFile(e.target.files?.[0] || null)}
              />
              {editingProduct?.file_path && !productFile && (
                <small>
                  {tx("Current product file exists.", "يوجد ملف منتج حالي.")}
                </small>
              )}
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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

                {product.old_price ? (
                  <p>
                    <strong>{tx("Old Price:", "السعر القديم:")}</strong> {product.old_price}{" "}
                    {product.currency}
                  </p>
                ) : null}

                <p>
                  <strong>{tx("Category:", "التصنيف:")}</strong>{" "}
                  {product.category || tx("Not set", "غير محدد")}
                </p>

                <p>
                  <strong>{tx("Featured:", "مميز:")}</strong>{" "}
                  {product.featured ? tx("Yes", "نعم") : tx("No", "لا")}
                </p>

                <p>
                  <strong>{tx("Description:", "الوصف:")}</strong>{" "}
                  {product.description || tx("No description", "لا يوجد وصف")}
                </p>

                <p>
                  <strong>{tx("Tags:", "الوسوم:")}</strong>{" "}
                  {Array.isArray(product.tags) && product.tags.length > 0
                    ? product.tags.join(", ")
                    : tx("No tags", "لا توجد وسوم")}
                </p>

                <p>
                  <strong>{tx("File Path:", "مسار الملف:")}</strong>{" "}
                  {product.file_path || tx("Not set", "غير محدد")}
                </p>

                <p>
                  <strong>{tx("Downloads:", "التحميلات:")}</strong>{" "}
                  {product.download_count || 0}
                </p>

                <p>
                  <strong>{tx("Updated At:", "آخر تحديث:")}</strong>{" "}
                  {formatDate(product.updated_at || product.created_at)}
                </p>

                {product.cover_image_url && (
                  <img
                    src={product.cover_image_url}
                    alt={product.title}
                    className="product-image"
                    style={{ maxWidth: 250 }}
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