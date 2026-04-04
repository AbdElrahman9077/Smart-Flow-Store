import PageWrapper from "../components/PageWrapper";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/auth";
import { useToast } from "../context/ToastContext";
import { useAppContext } from "../context/AppContext";
import {
  sendAdminNotification,
  sendCustomerEmail,
  createAuditLog,
} from "../lib/notifications";

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

      const productId = Number(id);

      if (Number.isNaN(productId)) {
        setProduct(null);
        setLoadingProduct(false);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("is_active", true)
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

    if (!product) {
      showToast(tx("Product not found.", "المنتج غير موجود."), "error");
      return;
    }

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      showToast(
        tx("Please login first before placing an order.", "سجل دخول أولًا قبل تنفيذ الطلب."),
        "error"
      );
      navigate("/login");
      return;
    }

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);

    try {
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id, status")
        .eq("user_id", currentUser.id)
        .eq("product_id", product.id)
        .in("status", ["pending", "confirmed"])
        .limit(1)
        .maybeSingle();

      if (existingOrder) {
        showToast(
          tx(
            "You already have an active order for this product.",
            "لديك طلب نشط بالفعل لهذا المنتج."
          ),
          "error"
        );
        setSubmitting(false);
        return;
      }

      let uploadedProofUrl = "";
      let uploadedProofPath = "";

      if (proofFile) {
        const fileExt = proofFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${fileExt}`;
        const filePath = `${currentUser.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("payment-proofs")
          .upload(filePath, proofFile, { upsert: false });

        if (uploadError) {
          setSubmitting(false);
          showToast(
            tx(
              `Proof upload failed: ${uploadError.message}`,
              `فشل رفع إثبات الدفع: ${uploadError.message}`
            ),
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

      const { data: insertedOrder, error } = await supabase
        .from("orders")
        .insert([
          {
            user_id: currentUser.id,
            product_id: product.id,
            product_title: product.title,
            product_price: product.price,
            currency: product.currency,
            customer_full_name: formData.fullName.trim(),
            customer_email: formData.email.trim(),
            customer_phone: formData.phone.trim(),
            payment_method: formData.paymentMethod.trim(),
            proof_file_name: proofFile ? proofFile.name : null,
            proof_file_url: uploadedProofUrl,
            proof_file_path: uploadedProofPath,
            notes: formData.notes.trim() || null,
            status: "pending",
            download_enabled: false,
            download_used: false,
            download_used_at: null,
          },
        ])
        .select()
        .single();

      setSubmitting(false);

      if (error) {
        console.error("Supabase insert error:", error);
        showToast(
          tx(
            `There was an error saving the order: ${error.message}`,
            `حدث خطأ أثناء حفظ الطلب: ${error.message}`
          ),
          "error"
        );
        return;
      }

      await Promise.allSettled([
        createAuditLog({
          action: "order_created",
          entityType: "order",
          entityId: insertedOrder?.id || `${currentUser.id}-${product.id}`,
          description: `New order created for ${product.title || "Product"}`,
          metadata: {
            productId: product.id,
            productTitle: product.title,
            customerEmail: formData.email,
            paymentMethod: formData.paymentMethod,
          },
        }),

        sendAdminNotification({
          subject: "Smart Flow - New Order Received",
          html: `
            <div>
              <h2>New Order Received</h2>
              <p>Order ID: ${insertedOrder?.id || "-"}</p>
              <p>Product: ${product.title}</p>
              <p>Price: ${product.price} ${product.currency}</p>
              <p>Customer: ${formData.fullName}</p>
              <p>Email: ${formData.email}</p>
              <p>Phone: ${formData.phone}</p>
              <p>Payment Method: ${formData.paymentMethod}</p>
            </div>
          `,
        }),

        sendCustomerEmail({
          to: formData.email.trim(),
          subject: "Smart Flow - Order Received",
          html: `
            <div>
              <h2>Your order has been received</h2>
              <p>Product: ${product.title}</p>
              <p>We will review your payment proof and update your order soon.</p>
            </div>
          `,
        }),
      ]);

      showToast(tx("Order submitted successfully.", "تم إرسال الطلب بنجاح."));
      navigate("/order-success");
    } catch (error) {
      console.error(error);
      setSubmitting(false);
      showToast(
        tx("Something went wrong while submitting your order.", "حدث خطأ أثناء إرسال الطلب."),
        "error"
      );
    }
  }

  if (loadingProduct) {
    return (
      <PageWrapper>
        <div className="container page-section">
          <div className="details-box">
            <h2>{tx("Loading product...", "جاري تحميل المنتج...")}</h2>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!product) {
    return (
      <PageWrapper>
        <div className="container page-section">
          <div className="details-box">
            <h2>{tx("Product not found", "المنتج غير موجود")}</h2>
          </div>
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