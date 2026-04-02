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

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
        },
        emailRedirectTo: `${window.location.origin}/verify-otp?email=${encodeURIComponent(
          formData.email
        )}`,
      },
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="details-box auth-box">
          <h1>{t.register}</h1>

          <p className="details-description">
            {tx("Create your account to track your orders.", "أنشئ حسابك لمتابعة طلباتك بسهولة.")}
          </p>

          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t.fullName}</label>
              <input
                type="text"
                name="fullName"
                placeholder={tx("Enter your full name", "ادخل اسمك الكامل")}
                value={formData.fullName}
                onChange={handleChange}
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

            <div className="form-group">
              <label>{t.confirmPassword}</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder={tx("Confirm your password", "أكد كلمة المرور")}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {errorMessage && <small className="error-text">{errorMessage}</small>}

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading
                ? tx("Creating account...", "جاري إنشاء الحساب...")
                : tx("Create Account", "إنشاء الحساب")}
            </button>
          </form>

          <p style={{ marginTop: "16px" }}>
            {tx("Already have an account?", "لديك حساب بالفعل؟")}{" "}
            <Link to="/login">{t.login}</Link>
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Register;