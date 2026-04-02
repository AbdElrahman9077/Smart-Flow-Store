import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/auth";
import PageWrapper from "../components/PageWrapper";
import { useToast } from "../context/ToastContext";
import { useAppContext } from "../context/AppContext";

function CustomRequest() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { tx } = useAppContext();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    requestTitle: "",
    requestDescription: "",
    budget: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
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

    preloadUserData();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = tx("Full name is required", "الاسم الكامل مطلوب");
    }

    if (!formData.email.trim()) {
      newErrors.email = tx("Email is required", "البريد الإلكتروني مطلوب");
    }

    if (!formData.requestTitle.trim()) {
      newErrors.requestTitle = tx("Request title is required", "عنوان الطلب مطلوب");
    }

    if (!formData.requestDescription.trim()) {
      newErrors.requestDescription = tx("Request description is required", "وصف الطلب مطلوب");
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      setSubmitting(false);
      showToast(
        tx("Please login first before submitting a custom request.", "سجل دخول أولًا قبل إرسال طلب مخصص."),
        "error"
      );
      navigate("/login");
      return;
    }

    const { error } = await supabase.from("custom_requests").insert([
      {
        user_id: currentUser.id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        request_title: formData.requestTitle,
        request_description: formData.requestDescription,
        budget: formData.budget,
        status: "pending",
      },
    ]);

    setSubmitting(false);

    if (error) {
      console.error("Custom request error:", error);
      showToast(
        tx(`There was an error saving the request: ${error.message}`, `حدث خطأ أثناء حفظ الطلب: ${error.message}`),
        "error"
      );
      return;
    }

    showToast(tx("Custom request submitted successfully.", "تم إرسال الطلب المخصص بنجاح."));
    navigate("/");
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="checkout-box">
          <h1>{tx("Request Custom Work", "طلب شغل مخصص")}</h1>
          <p className="checkout-text">
            {tx(
              "Tell us what kind of Excel system, dashboard, or custom tool you need.",
              "اخبرنا بنوع نظام Excel أو Dashboard أو الأداة المخصصة التي تحتاجها."
            )}
          </p>

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
            </div>

            <div className="form-group">
              <label>{tx("Request Title", "عنوان الطلب")}</label>
              <input
                type="text"
                name="requestTitle"
                placeholder={tx("Example: CRM for sales team", "مثال: CRM لفريق المبيعات")}
                value={formData.requestTitle}
                onChange={handleChange}
              />
              {errors.requestTitle && <small className="error-text">{errors.requestTitle}</small>}
            </div>

            <div className="form-group">
              <label>{tx("Request Description", "وصف الطلب")}</label>
              <textarea
                rows="6"
                name="requestDescription"
                placeholder={tx("Describe exactly what you need...", "اشرح بالضبط ما الذي تحتاجه...")}
                value={formData.requestDescription}
                onChange={handleChange}
              />
              {errors.requestDescription && (
                <small className="error-text">{errors.requestDescription}</small>
              )}
            </div>

            <div className="form-group">
              <label>{tx("Estimated Budget", "الميزانية المتوقعة")}</label>
              <input
                type="text"
                name="budget"
                placeholder={tx("Example: 3000 EGP", "مثال: 3000 جنيه")}
                value={formData.budget}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting
                ? tx("Submitting...", "جاري الإرسال...")
                : tx("Submit Request", "إرسال الطلب")}
            </button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}

export default CustomRequest;