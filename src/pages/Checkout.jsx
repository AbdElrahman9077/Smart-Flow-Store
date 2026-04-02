import PageWrapper from "../components/PageWrapper";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/auth";
import { useToast } from "../context/ToastContext";
import { useAppContext } from "../context/AppContext";

function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { showToast } = useToast();
  const { tx } = useAppContext();

  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    paymentMethod: "Vodafone Cash",
    notes: "",
  });

  const [proofFile, setProofFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoadingProduct(true);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setProduct(null);
        setLoadingProduct(false);
        return;
      }

      setProduct(data);
      setLoadingProduct(false);
    }

    async function preloadUserData() {
      const currentUser = await getCurrentUser();

      if (!currentUser) return;

      setFormData((prev) => ({
        ...prev,
        email: currentUser.email || prev.email,
      }));

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", currentUser.id)
        .single();

      if (profile?.full_name) {
        setFormData((prev) => ({
          ...prev,
          fullName: profile.full_name,
        }));
      }
    }

    loadProduct();
    preloadUserData();
  }, [id]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;
    setProofFile(file);
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = tx("Full name is required", "الاسم الكامل مطلوب");
    }

    if (!formData.email.trim()) {
      newErrors.email = tx("Email is required", "البريد الإلكتروني مطلوب");
    } else if (!formData.email.includes("@")) {
      newErrors.email = tx("Enter a valid email", "ادخل بريدًا إلكترونيًا صحيحًا");
    }

    if (!formData.phone.trim()) {
      newErrors.phone = tx("Phone number is required", "رقم الهاتف مطلوب");
    }

    if (!proofFile) {
      newErrors.proofFile = tx("Payment proof is required", "إثبات الدفع مطلوب");
    }

    return newErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      setSubmitting(false);
      showToast(tx("Please login first before placing an order.", "سجل دخول أولًا قبل تنفيذ الطلب."), "error");
      navigate("/login");
      return;
    }

    let uploadedProofUrl = "";
    let uploadedProofPath = "";

    if (proofFile) {
      const fileExt = proofFile.name.split(".").pop();
      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(filePath, proofFile);

      if (uploadError) {
        setSubmitting(false);
        showToast(
          tx(`Proof upload failed: ${uploadError.message}`, `فشل رفع إثبات الدفع: ${uploadError.message}`),
          "error"
        );
        return;
      }

      uploadedProofPath = filePath;

      const { data: publicUrlData } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(filePath);

      uploadedProofUrl = publicUrlData?.publicUrl || "";
    }

    const { error } = await supabase.from("orders").insert([
      {
        user_id: currentUser.id,
        product_id: product.id,
        product_title: product.title,
        product_price: product.price,
        currency: product.currency,
        customer_full_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        payment_method: formData.paymentMethod,
        proof_file_name: proofFile ? proofFile.name : null,
        proof_file_url: uploadedProofUrl,
        proof_file_path: uploadedProofPath,
        notes: formData.notes,
        status: "pending",
        download_enabled: false,
      },
    ]);

    setSubmitting(false);

    if (error) {
      console.error("Supabase insert error:", error);
      showToast(
        tx(`There was an error saving the order: ${error.message}`, `حدث خطأ أثناء حفظ الطلب: ${error.message}`),
        "error"
      );
      return;
    }

    showToast(tx("Order submitted successfully.", "تم إرسال الطلب بنجاح."));
    navigate("/order-success");
  }

  if (loadingProduct) {
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

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="checkout-box">
          <h1>{tx("Checkout", "إتمام الطلب")}</h1>
          <p className="checkout-text">
            {tx("Complete your order details for:", "أكمل بيانات الطلب من أجل:")}
          </p>

          <div className="checkout-product">
            <h2>{product.title}</h2>
            <p>{product.description}</p>
            <h3>
              {product.price} {product.currency}
            </h3>
          </div>

          <div className="payment-info-box">
            <h3>{tx("Payment Instructions", "تعليمات الدفع")}</h3>
            <p>
              <strong>Vodafone Cash:</strong> 01037461971
            </p>
            <p>
              <strong>Instapay:</strong> abdelrahman.mo077644@instapay
            </p>
            <p>
              <strong>{tx("Note:", "ملاحظة:")}</strong>{" "}
              {tx("After payment, upload proof below.", "بعد الدفع، ارفع إثبات الدفع بالأسفل.")}
            </p>
          </div>

          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{tx("Full Name", "الاسم الكامل")}</label>
              <input
                type="text"
                name="fullName"
                placeholder={tx("Enter your full name", "ادخل اسمك الكامل")}
                value={formData.fullName}
                onChange={handleChange}
              />
              {errors.fullName && <small className="error-text">{errors.fullName}</small>}
            </div>

            <div className="form-group">
              <label>{tx("Email", "البريد الإلكتروني")}</label>
              <input
                type="email"
                name="email"
                placeholder={tx("Enter your email", "ادخل بريدك الإلكتروني")}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <small className="error-text">{errors.email}</small>}
            </div>

            <div className="form-group">
              <label>{tx("Phone Number", "رقم الهاتف")}</label>
              <input
                type="text"
                name="phone"
                placeholder={tx("Enter your phone number", "ادخل رقم هاتفك")}
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && <small className="error-text">{errors.phone}</small>}
            </div>

            <div className="form-group">
              <label>{tx("Payment Method", "طريقة الدفع")}</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
              >
                <option>Vodafone Cash</option>
                <option>Instapay</option>
                <option>Bank Transfer</option>
              </select>
            </div>

            <div className="form-group">
              <label>{tx("Upload Payment Proof", "ارفع إثبات الدفع")}</label>
              <input type="file" accept="image/*,.pdf" onChange={handleFileChange} />
              {proofFile && (
                <small>
                  {tx("Selected file:", "الملف المختار:")} {proofFile.name}
                </small>
              )}
              {errors.proofFile && <small className="error-text">{errors.proofFile}</small>}
            </div>

            <div className="form-group">
              <label>{tx("Notes", "ملاحظات")}</label>
              <textarea
                rows="4"
                name="notes"
                placeholder={tx("Write any extra notes here", "اكتب أي ملاحظات إضافية هنا")}
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting
                ? tx("Submitting...", "جاري الإرسال...")
                : tx("Submit Order", "إرسال الطلب")}
            </button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Checkout;