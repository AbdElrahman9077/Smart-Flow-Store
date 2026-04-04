import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import { supabase } from "../lib/supabase";
import { useAppContext } from "../context/AppContext";

function Register() {
  const navigate = useNavigate();
  const { t, tx } = useAppContext();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage(tx("Passwords do not match.", "كلمتا المرور غير متطابقتين."));
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage(
        tx(
          "Password must be at least 6 characters.",
          "يجب أن تكون كلمة المرور 6 أحرف على الأقل."
        )
      );
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: formData.email.trim(),
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName.trim(),
        },
        emailRedirectTo: `${window.location.origin}/verify-otp?email=${encodeURIComponent(
          formData.email.trim()
        )}`,
      },
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    navigate(`/verify-otp?email=${encodeURIComponent(formData.email.trim())}`);
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="auth-shell">
          <div className="auth-side">
            <span className="section-kicker">
              {tx("Start Now", "ابدأ الآن")}
            </span>

            <h1>{t.register}</h1>

            <p className="details-description">
              {tx(
                "Create your account to place orders, receive your files, and manage everything from one place.",
                "أنشئ حسابك لتقديم الطلبات واستلام ملفاتك وإدارة كل شيء من مكان واحد."
              )}
            </p>

            <div className="auth-benefits">
              <span>{tx("Simple registration", "تسجيل بسيط")}</span>
              <span>{tx("Secure verification", "تحقق آمن")}</span>
              <span>{tx("Easy order tracking", "متابعة سهلة للطلبات")}</span>
            </div>
          </div>

          <div className="details-box auth-box auth-form-panel">
            <h2>{t.register}</h2>

            <form className="checkout-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t.fullName}</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder={tx("Enter your full name", "ادخل اسمك الكامل")}
                  value={formData.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="form-group">
                <label>{t.email}</label>
                <input
                  type="email"
                  name="email"
                  placeholder={tx("Enter your email", "ادخل بريدك الإلكتروني")}
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-group">
                <label>{t.password}</label>
                <input
                  type="password"
                  name="password"
                  placeholder={tx("Enter your password", "ادخل كلمة المرور")}
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="form-group">
                <label>{t.confirmPassword}</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder={tx("Confirm your password", "أكد كلمة المرور")}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>

              <small className="form-hint">
                {tx(
                  "Use a strong password with at least 6 characters.",
                  "استخدم كلمة مرور قوية لا تقل عن 6 أحرف."
                )}
              </small>

              {errorMessage ? <small className="error-text">{errorMessage}</small> : null}

              <button type="submit" className="primary-btn" disabled={loading}>
                {loading
                  ? tx("Creating account...", "جاري إنشاء الحساب...")
                  : tx("Create Account", "إنشاء الحساب")}
              </button>
            </form>

            <p className="auth-links-inline">
              {tx("Already have an account?", "لديك حساب بالفعل؟")}{" "}
              <Link to="/login" className="muted-link">
                {t.login}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Register;