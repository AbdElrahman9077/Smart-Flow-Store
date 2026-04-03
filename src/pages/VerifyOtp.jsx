import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAppContext } from "../context/AppContext";
import PageWrapper from "../components/PageWrapper";

export default function VerifyOtp() {
  const { t, tx } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = useMemo(() => searchParams.get("email") || "", [searchParams]);

  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage(t.otpVerified);
    setTimeout(() => navigate("/login"), 1200);
    setLoading(false);
  }

  async function handleResend() {
    if (!email) {
      setMessage(tx("Email is missing.", "البريد الإلكتروني غير موجود."));
      return;
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-otp?email=${encodeURIComponent(email)}`,
      },
    });

    setMessage(error ? error.message : t.otpSent);
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="details-box auth-box">
          <h1>{t.verifyOtp}</h1>

          <p className="details-description">
            {email
              ? tx(
                  `Verification code was sent to ${email}`,
                  `تم إرسال كود التحقق إلى ${email}`
                )
              : tx(
                  "Open this page from the registration flow.",
                  "افتح الصفحة دي من مسار التسجيل."
                )}
          </p>

          <form onSubmit={handleVerify} className="checkout-form">
            <div className="form-group">
              <label>{t.enterOtp}</label>
              <input
                type="text"
                placeholder={t.enterOtp}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>

            {message && <small className="error-text">{message}</small>}

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? t.loading : t.verify}
            </button>
          </form>

          <button
            type="button"
            className="secondary-link-btn"
            style={{ marginTop: "16px" }}
            onClick={handleResend}
          >
            {t.resendOtp}
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}