import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAppContext } from "../context/AppContext";
import PageWrapper from "../components/PageWrapper";

export default function ForgotPassword() {
  const { t } = useAppContext();

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
        <div className="details-box auth-box">
          <h1>{t.resetPassword}</h1>

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

            {message && <small className="error-text">{message}</small>}

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? t.loading : t.sendResetLink}
            </button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}