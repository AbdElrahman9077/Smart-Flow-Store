import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/auth";
import PageWrapper from "../components/PageWrapper";
import { useToast } from "../context/ToastContext";
import { useAppContext } from "../context/AppContext";
import { sendAdminNotification, sendCustomerEmail, createAuditLog } from "../lib/notifications";

function CustomRequest() {
  const { showToast } = useToast();
  const { tx } = useAppContext();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    businessType: "",
    requestTitle: "",
    requestDescription: "",
    budget: "",
    deadline: "",
    preferredLanguage: "English",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function preloadUserData() {
      const currentUser = await getCurrentUser();
      if (!currentUser) return;
      setFormData((prev) => ({ ...prev, email: currentUser.email || prev.email }));
      const { data: profile } = await supabase.from("profiles").select("full_name, phone").eq("id", currentUser.id).maybeSingle();
      if (profile) {
        setFormData((prev) => ({ ...prev, fullName: profile.full_name || prev.fullName, phone: profile.phone || prev.phone }));
      }
    }
    preloadUserData();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function validateForm() {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = tx("Full name is required", "الاسم الكامل مطلوب");
    if (!formData.email.trim()) newErrors.email = tx("Email is required", "البريد الإلكتروني مطلوب");
    if (!formData.requestTitle.trim()) newErrors.requestTitle = tx("Request title is required", "عنوان الطلب مطلوب");
    if (!formData.requestDescription.trim()) newErrors.requestDescription = tx("Requirements are required", "المتطلبات مطلوبة");
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setSubmitting(true);

    const currentUser = await getCurrentUser();
    const payload = {
      user_id: currentUser?.id || null,
      customer_name: formData.fullName.trim(),
      customer_email: formData.email.trim(),
      customer_phone: formData.phone.trim() || null,
      business_type: formData.businessType.trim() || null,
      request_title: formData.requestTitle.trim(),
      requirements: formData.requestDescription.trim(),
      budget_range: formData.budget.trim() || null,
      deadline: formData.deadline || null,
      preferred_language: formData.preferredLanguage,
      status: "new",
    };

    const { data: insertedRequest, error } = await supabase.from("custom_requests").insert([payload]).select().single();
    setSubmitting(false);

    if (error) {
      showToast(tx(`There was an error saving the request: ${error.message}`, `تعذر حفظ الطلب: ${error.message}`), "error");
      return;
    }

    await Promise.allSettled([
      createAuditLog({ action: "custom_request_created", entityType: "custom_request", entityId: insertedRequest?.id, description: `New custom request: ${payload.request_title}`, metadata: payload }),
      sendAdminNotification({ subject: "Excel Store - New Custom Request", html: `<h2>New custom request</h2><p>${payload.request_title}</p><p>${payload.customer_email}</p>` }),
      sendCustomerEmail({ to: payload.customer_email, subject: "Excel Store - Custom Request Received", html: `<h2>Your request has been received</h2><p>We will review your requirements and contact you with next steps.</p>` }),
    ]);

    setSubmitted(true);
    showToast(tx("Custom request submitted successfully.", "تم إرسال الطلب المخصص بنجاح."));
  }

  if (submitted) {
    return (
      <PageWrapper>
        <div className="container page-section">
          <div className="success-box">
            <h1>{tx("Request received", "تم استلام الطلب")}</h1>
            <p className="details-description">{tx("Our team will review your requirements and contact you with a clear scope and quote.", "سيراجع فريقنا متطلباتك ويتواصل معك بنطاق عمل وسعر واضحين.")}</p>
            <div className="success-buttons">
              <Link to="/products" className="primary-link-btn">{tx("Browse products", "تصفح المنتجات")}</Link>
              <Link to="/account/custom-requests" className="secondary-link-btn">{tx("View requests", "عرض الطلبات")}</Link>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="page-header">
          <span className="section-kicker">{tx("Custom Excel systems", "أنظمة Excel مخصصة")}</span>
          <h1 className="page-title">{tx("Request a tailored Excel workflow", "اطلب سير عمل Excel مخصصًا")}</h1>
          <p className="page-subtitle">{tx("Describe your process and we will scope a reliable spreadsheet system, dashboard, tracker, or reporting workflow.", "اشرح عملية عملك وسنحدد نطاق نظام Excel أو لوحة متابعة أو أداة تتبع أو تقارير مناسبة.")}</p>
        </div>

        <div className="checkout-box">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-group"><label>{tx("Full Name", "الاسم الكامل")}</label><input name="fullName" value={formData.fullName} onChange={handleChange} />{errors.fullName && <small className="error-text">{errors.fullName}</small>}</div>
            <div className="form-group"><label>{tx("Email", "البريد الإلكتروني")}</label><input type="email" name="email" value={formData.email} onChange={handleChange} />{errors.email && <small className="error-text">{errors.email}</small>}</div>
            <div className="form-group"><label>{tx("Phone or WhatsApp", "الهاتف أو واتساب")}</label><input name="phone" value={formData.phone} onChange={handleChange} /></div>
            <div className="form-group"><label>{tx("Business Type", "نوع النشاط")}</label><input name="businessType" value={formData.businessType} onChange={handleChange} placeholder={tx("Retail, services, logistics, finance...", "تجارة، خدمات، لوجستيات، مالية...")} /></div>
            <div className="form-group"><label>{tx("Request Title", "عنوان الطلب")}</label><input name="requestTitle" value={formData.requestTitle} onChange={handleChange} />{errors.requestTitle && <small className="error-text">{errors.requestTitle}</small>}</div>
            <div className="form-group"><label>{tx("Requirements", "المتطلبات")}</label><textarea rows="7" name="requestDescription" value={formData.requestDescription} onChange={handleChange} placeholder={tx("Describe inputs, reports, users, formulas, dashboards, and current pain points.", "اشرح المدخلات والتقارير والمستخدمين والمعادلات ولوحات المتابعة ونقاط المشكلة الحالية.")} />{errors.requestDescription && <small className="error-text">{errors.requestDescription}</small>}</div>
            <div className="form-group"><label>{tx("Budget Range", "نطاق الميزانية")}</label><input name="budget" value={formData.budget} onChange={handleChange} placeholder={tx("Example: 3,000 - 8,000 EGP", "مثال: 3000 - 8000 جنيه")} /></div>
            <div className="form-group"><label>{tx("Preferred Deadline", "الموعد المفضل")}</label><input type="date" name="deadline" value={formData.deadline} onChange={handleChange} /></div>
            <div className="form-group"><label>{tx("Preferred Language", "اللغة المفضلة")}</label><select name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange}><option>English</option><option>Arabic</option></select></div>
            <button type="submit" className="primary-btn" disabled={submitting}>{submitting ? tx("Submitting...", "جاري الإرسال...") : tx("Submit Request", "إرسال الطلب")}</button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}

export default CustomRequest;
