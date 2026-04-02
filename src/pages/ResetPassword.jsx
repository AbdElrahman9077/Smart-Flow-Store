import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, useSearchParams } from "react-router-dom";
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
        <div className="details-box auth-box">
          {!ready ? (
            <p>{t.loading}</p>
          ) : (
            <>
              <h1>{t.resetPassword}</h1>

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

                {message && <small className="error-text">{message}</small>}

                <button type="submit" className="primary-btn" disabled={loading}>
                  {loading ? t.loading : t.updatePassword}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}