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
      email: formData.email,
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
    navigate("/");
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="details-box auth-box">
          <h1>{t.login}</h1>

          <p className="details-description">
            {tx("Login to manage and track your orders.", "سجل دخولك لمتابعة وإدارة طلباتك.")}
          </p>

          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t.email}</label>
              <input
                type="email"
                name="email"
                placeholder={tx("Enter your email", "ادخل بريدك الإلكتروني")}
                value={formData.email}
                onChange={handleChange}
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
                required
              />
            </div>

            {errorMessage && <small className="error-text">{errorMessage}</small>}

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? tx("Logging in...", "جاري تسجيل الدخول...") : t.login}
            </button>
          </form>

          <p style={{ marginTop: "16px" }}>
            <Link to="/forgot-password">{t.forgotPassword}</Link>
          </p>

          <p style={{ marginTop: "16px" }}>
            {tx("Don't have an account?", "ليس لديك حساب؟")}{" "}
            <Link to="/register">{t.register}</Link>
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Login;