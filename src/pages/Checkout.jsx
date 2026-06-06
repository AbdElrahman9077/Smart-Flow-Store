import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/auth";
import { getProductById, getProductBySlug } from "../lib/productService";
import { formatPrice } from "../lib/utils";
import { useToast } from "../context/ToastContext";
import { useAppContext } from "../context/AppContext";
import { createAuditLog, sendAdminNotification, sendCustomerEmail } from "../lib/notifications";
import { createServerOrder, isCheckoutCompatibleProduct } from "../lib/orderService";

function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { tx, t } = useAppContext();
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
    let active = true;

    async function load() {
      setLoadingProduct(true);
      const result = Number.isNaN(Number(id)) ? await getProductBySlug(id) : await getProductById(id);
      if (!active) return;
      setProduct(result.data || null);
      setLoadingProduct(false);

      const currentUser = await getCurrentUser();
      if (!active || !currentUser) return;
      setFormData((prev) => ({ ...prev, email: currentUser.email || prev.email }));

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", currentUser.id)
        .single();

      if (active && profile?.full_name) {
        setFormData((prev) => ({ ...prev, fullName: profile.full_name }));
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [id]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function validateForm() {
    const nextErrors = {};
    if (!formData.fullName.trim()) nextErrors.fullName = tx("Full name is required", "الاسم الكامل مطلوب");
    if (!formData.email.trim()) nextErrors.email = tx("Email is required", "البريد الإلكتروني مطلوب");
    else if (!formData.email.includes("@")) nextErrors.email = tx("Enter a valid email", "أدخل بريدًا إلكترونيًا صحيحًا");
    if (!formData.phone.trim()) nextErrors.phone = tx("Phone number is required", "رقم الهاتف مطلوب");
    if (!proofFile) nextErrors.proofFile = tx("Payment proof is required", "إثبات الدفع مطلوب");
    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (product && !isCheckoutCompatibleProduct(product)) {
      showToast(
        tx(
          "This product type is not available for checkout yet. Please use the request/contact flow.",
          "This product type is not available for checkout yet. Please use the request/contact flow."
        ),
        "error"
      );
      navigate(product.product_type === "custom_service" ? "/custom-request" : "/contact");
      return;
    }

    if (!product) {
      showToast(tx("Product not found.", "المنتج غير موجود."), "error");
      return;
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      showToast(tx("Please sign in before checkout.", "يرجى تسجيل الدخول قبل متابعة الشراء."), "error");
      navigate(`/checkout/${id}`);
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
        showToast(tx("You already have an active order for this product.", "لديك طلب نشط بالفعل لهذا المنتج."), "error");
        setSubmitting(false);
        return;
      }

      let uploadedProofPath = "";

      if (proofFile) {
        const fileExt = proofFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${fileExt}`;
        const filePath = `${currentUser.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from("payment-proofs").upload(filePath, proofFile, { upsert: false });

        if (uploadError) {
          showToast(tx(`Proof upload failed: ${uploadError.message}`, `فشل رفع إثبات الدفع: ${uploadError.message}`), "error");
          setSubmitting(false);
          return;
        }

        uploadedProofPath = filePath;
      }

      const { data: orderResult, error } = await createServerOrder({
        items: [{ product_id: product.id, quantity: 1 }],
        customerName: formData.fullName.trim(),
        customerEmail: formData.email.trim(),
        customerPhone: formData.phone.trim(),
        paymentMethod: formData.paymentMethod.trim(),
        notes: formData.notes.trim() || null,
        proofFilePath: uploadedProofPath,
        proofFileName: proofFile ? proofFile.name : null,
      });

      if (error) {
        showToast(tx(`There was an error saving the order: ${error.message}`, `حدث خطأ أثناء حفظ الطلب: ${error.message}`), "error");
        setSubmitting(false);
        return;
      }

      const insertedOrder = orderResult?.order;

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
          html: `<div><h2>New Order Received</h2><p>Order ID: ${insertedOrder?.id || "-"}</p><p>Product: ${product.title}</p><p>Customer: ${formData.fullName}</p></div>`,
        }),
        sendCustomerEmail({
          to: formData.email.trim(),
          subject: "Smart Flow - Order Received",
          html: `<div><h2>Your order has been received</h2><p>Product: ${product.title}</p><p>We will review your payment proof and update your order soon.</p></div>`,
        }),
      ]);

      showToast(tx("Order submitted successfully.", "تم إرسال الطلب بنجاح."));
      navigate("/order-success", { state: { order: orderResult?.summary || insertedOrder } });
    } catch (error) {
      console.error(error);
      showToast(tx("Something went wrong while submitting your order.", "حدث خطأ أثناء إرسال الطلب."), "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingProduct) {
    return (
      <PageWrapper>
        <div className="container page-section"><div className="details-box"><span className="skeleton-line title" /><span className="skeleton-line" /></div></div>
      </PageWrapper>
    );
  }

  if (!product) {
    return (
      <PageWrapper>
        <div className="container page-section"><div className="details-box"><h2>{tx("Product not found", "المنتج غير موجود")}</h2></div></div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="checkout-box">
          <span className="section-kicker">{tx("Manual payment checkout", "شراء بتأكيد دفع يدوي")}</span>
          <h1>{tx("Complete your order", "إتمام الطلب")}</h1>
          <p className="checkout-text">
            {tx("Submit your details and payment proof. Downloads and licenses unlock after admin confirmation.", "أرسل بياناتك وإثبات الدفع. يتم فتح التحميلات والتراخيص بعد تأكيد الإدارة.")}
          </p>

          <div className="checkout-product">
            <h2>{product.title}</h2>
            <p>{product.short_description || product.description}</p>
            <h3>{Number(product.price || 0) === 0 ? t.free : formatPrice(product.price, product.currency)}</h3>
            {!isCheckoutCompatibleProduct(product) && (
              <p className="details-description">
                {tx(
                  "Checkout is not active for this product family yet. Please use request/demo or contact flows.",
                  "Checkout is not active for this product family yet. Please use request/demo or contact flows."
                )}
              </p>
            )}
          </div>

          <div className="payment-info-box">
            <h3>{tx("Payment instructions", "تعليمات الدفع")}</h3>
            <p><strong>Vodafone Cash:</strong> 01037461971</p>
            <p><strong>Instapay:</strong> abdelrahman.mo077644@instapay</p>
            <p><strong>{tx("Note:", "ملاحظة:")}</strong> {tx("After payment, upload proof below.", "بعد الدفع، ارفع إثبات الدفع بالأسفل.")}</p>
          </div>

          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t.fullName}</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} />
              {errors.fullName && <small className="error-text">{errors.fullName}</small>}
            </div>
            <div className="form-group">
              <label>{t.email}</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
              {errors.email && <small className="error-text">{errors.email}</small>}
            </div>
            <div className="form-group">
              <label>{t.phone}</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
              {errors.phone && <small className="error-text">{errors.phone}</small>}
            </div>
            <div className="form-group">
              <label>{tx("Payment method", "طريقة الدفع")}</label>
              <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
                <option>Vodafone Cash</option>
                <option>Instapay</option>
                <option>Bank Transfer</option>
              </select>
            </div>
            <div className="form-group">
              <label>{tx("Upload payment proof", "رفع إثبات الدفع")}</label>
              <input type="file" accept="image/*,.pdf" onChange={(event) => setProofFile(event.target.files?.[0] || null)} />
              {proofFile && <small>{tx("Selected file:", "الملف المختار:")} {proofFile.name}</small>}
              {errors.proofFile && <small className="error-text">{errors.proofFile}</small>}
            </div>
            <div className="form-group">
              <label>{tx("Notes", "ملاحظات")}</label>
              <textarea rows="4" name="notes" value={formData.notes} onChange={handleChange} />
            </div>
            <button type="submit" className="primary-btn" disabled={submitting || !isCheckoutCompatibleProduct(product)}>
              {submitting ? tx("Submitting...", "جاري الإرسال...") : tx("Submit order", "إرسال الطلب")}
            </button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Checkout;
