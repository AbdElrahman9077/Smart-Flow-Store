import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAppContext } from "../context/AppContext";
import PageWrapper from "../components/PageWrapper";

export default function ResetPassword() {
  const { t, tx } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function setupRecoverySession() {
      const code = searchParams.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage(error.message);
          setReady(true);
          return;
        }
      }

      setReady(true);
    }

    setupRecoverySession();
  }, [searchParams]);

  async function handleUpdatePassword(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage(tx("Passwords do not match.", "كلمتا المرور غير متطابقتين."));
      return;
    }

    if (password.length < 6) {
      setMessage(tx("Use at least 6 characters.", "استخدم 6 أحرف على الأقل."));
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage(t.passwordUpdated);
    setTimeout(() => navigate("/login"), 1200);
    setLoading(false);
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="auth-shell auth-focused">
          <aside className="auth-side">
            <span className="section-kicker">{tx("Secure password update", "تحديث آمن لكلمة المرور")}</span>
            <h1>{t.resetPassword}</h1>
            <p>
              {tx(
                "Choose a secure password. You will use it for future access to orders, licenses, and downloads.",
                "اختر كلمة مرور آمنة لاستخدامها لاحقًا في الوصول إلى الطلبات والتراخيص والتحميلات."
              )}
            </p>
            <div className="auth-benefits">
              <span>{tx("Use a unique password", "استخدم كلمة مرور فريدة")}</span>
              <span>{tx("Keep customer downloads protected", "حافظ على حماية تحميلاتك")}</span>
              <span>{tx("Return to checkout after login", "يمكنك العودة للشراء بعد تسجيل الدخول")}</span>
            </div>
          </aside>

          <section className="auth-form-panel">
            {!ready ? (
              <p>{t.loading}</p>
            ) : (
              <>
                <h2>{tx("Create a new password", "إنشاء كلمة مرور جديدة")}</h2>
                <p className="form-hint">
                  {tx(
                    "Your new password should be memorable to you and hard for others to guess.",
                    "يجب أن تكون كلمة المرور سهلة لك وصعبة التخمين على الآخرين."
                  )}
                </p>
                <form onSubmit={handleUpdatePassword} className="checkout-form">
                  <div className="form-group">
                    <label>{t.password}</label>
                    <input
                      type="password"
                      placeholder={t.password}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{t.confirmPassword}</label>
                    <input
                      type="password"
                      placeholder={t.confirmPassword}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  {message && <div className="form-message">{message}</div>}

                  <button type="submit" className="primary-btn" disabled={loading}>
                    {loading ? t.loading : t.updatePassword}
                  </button>
                  <Link to="/login" className="card-link-btn">{tx("Back to login", "العودة إلى تسجيل الدخول")}</Link>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </PageWrapper>
  );
}
