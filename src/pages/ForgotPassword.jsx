import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAppContext } from "../context/AppContext";
import PageWrapper from "../components/PageWrapper";

export default function ForgotPassword() {
  const { t, tx } = useAppContext();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setMessage(error ? error.message : t.resetEmailSent);
    setLoading(false);
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="auth-shell auth-focused">
          <aside className="auth-side">
            <span className="section-kicker">{tx("Account recovery", "استعادة الحساب")}</span>
            <h1>{t.resetPassword}</h1>
            <p>
              {tx(
                "Enter your email and we will send reset instructions if the account exists.",
                "أدخل بريدك الإلكتروني وسنرسل تعليمات إعادة التعيين إذا كان الحساب مسجلًا لدينا."
              )}
            </p>
            <div className="auth-benefits">
              <span>{tx("Secure recovery flow", "استعادة آمنة للحساب")}</span>
              <span>{tx("Customer portal access remains protected", "تبقى بوابة العميل محمية")}</span>
              <span>{tx("Return to your orders and downloads after login", "عد إلى طلباتك وتحميلاتك بعد تسجيل الدخول")}</span>
            </div>
          </aside>

          <section className="auth-form-panel">
            <h2>{tx("Send reset instructions", "إرسال تعليمات إعادة التعيين")}</h2>
            <p className="form-hint">
              {tx(
                "For security, the same confirmation message appears whether the email exists or not.",
                "لأمان حسابك، تظهر نفس رسالة التأكيد سواء كان البريد مسجلًا أم لا."
              )}
            </p>
            <form onSubmit={handleReset} className="checkout-form">
              <div className="form-group">
                <label>{t.email}</label>
                <input
                  type="email"
                  placeholder={t.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {message && <div className="form-message">{message}</div>}

              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? t.loading : t.sendResetLink}
              </button>
              <Link to="/login" className="card-link-btn">{tx("Back to login", "العودة إلى تسجيل الدخول")}</Link>
            </form>
          </section>
        </div>
      </div>
    </PageWrapper>
  );
}
