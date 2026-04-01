import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInUser } from "../lib/auth";
import PageWrapper from "../components/PageWrapper";

function Login() {
  const navigate = useNavigate();

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

    const { error } = await signInUser(formData.email, formData.password);

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    navigate("/");
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="details-box auth-box">
          <h1>Login</h1>
          <p className="details-description">
            Login to manage and track your orders.
          </p>

          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {errorMessage && <small className="error-text">{errorMessage}</small>}

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p style={{ marginTop: "16px" }}>
            Don&apos;t have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Login;