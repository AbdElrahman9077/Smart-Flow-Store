import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signUpUser } from "../lib/auth";
import PageWrapper from "../components/PageWrapper";

function Register() {
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

    const { error } = await signUpUser(formData.email, formData.password);

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    alert("Account created successfully. You can login now.");
    navigate("/login");
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="details-box auth-box">
          <h1>Register</h1>
          <p className="details-description">
            Create your account to track your orders.
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
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p style={{ marginTop: "16px" }}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Register;