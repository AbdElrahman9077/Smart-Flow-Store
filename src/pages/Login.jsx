import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import { supabase } from "../lib/supabase";
import { useAppContext } from "../context/AppContext";

function Login() {
  const navigate = useNavigate();
  const { t, tx } = useAppContext();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email.trim(),
      password: formData.password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    const userId = data?.user?.id;

    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", userId)
        .single();

      setLoading(false);

      if (profile?.is_admin) {
        navigate("/admin-dashboard");
        return;
      }
    }

    setLoading(false);
    navigate("/my-orders");
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="auth-shell">
          <div className="auth-side">
            <span className="section-kicker">
              {tx("Welcome Back", "أهلًا بعودتك")}
            </span>

            <h1>{t.login}</h1>

            <p className="details-description">
              {tx(
                "Login to manage your orders, access your purchased files, and continue your workflow smoothly.",
                "سجل دخولك لإدارة طلباتك والوصول لملفاتك المشتراة ومتابعة شغلك بسهولة."
              )}
            </p>

            <div className="auth-benefits">
              <span>{tx("Track your orders easily", "تابع طلباتك بسهولة")}</span>
              <span>{tx("Access your downloads", "الوصول إلى التحميلات")}</span>
              <span>{tx("Fast and secure login", "دخول سريع وآمن")}</span>
            </div>
          </div>

          <div className="details-box auth-box auth-form-panel">
            <h2>{t.login}</h2>

            <form className="checkout-form" onSubmit={handleSubmit}>
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
                  autoComplete="current-password"
                  required
                />
              </div>

              {errorMessage ? <small className="error-text">{errorMessage}</small> : null}

              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? tx("Logging in...", "جاري تسجيل الدخول...") : t.login}
              </button>
            </form>

            <p className="auth-links-inline">
              {tx("Don't have an account?", "ليس لديك حساب؟")}{" "}
              <Link to="/register" className="muted-link">
                {t.register}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Login;