import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/auth";
import PageWrapper from "../components/PageWrapper";

function CustomRequest() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    requestTitle: "",
    requestDescription: "",
    budget: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.requestTitle.trim()) newErrors.requestTitle = "Request title is required";
    if (!formData.requestDescription.trim()) {
      newErrors.requestDescription = "Request description is required";
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      setSubmitting(false);
      alert("Please login first before submitting a custom request.");
      navigate("/login");
      return;
    }

    const { error } = await supabase.from("custom_requests").insert([
      {
        user_id: currentUser.id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        request_title: formData.requestTitle,
        request_description: formData.requestDescription,
        budget: formData.budget,
        status: "Pending Review",
      },
    ]);

    setSubmitting(false);

    if (error) {
      console.error("Custom request error:", error);
      alert(`There was an error saving the request: ${error.message}`);
      return;
    }

    alert("Custom request submitted successfully.");
    navigate("/");
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="checkout-box">
          <h1>Request Custom Work</h1>
          <p className="checkout-text">
            Tell us what kind of Excel system, dashboard, or custom tool you need.
          </p>

          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
              />
              {errors.fullName && <small className="error-text">{errors.fullName}</small>}
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <small className="error-text">{errors.email}</small>}
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Request Title</label>
              <input
                type="text"
                name="requestTitle"
                placeholder="Example: CRM for sales team"
                value={formData.requestTitle}
                onChange={handleChange}
              />
              {errors.requestTitle && (
                <small className="error-text">{errors.requestTitle}</small>
              )}
            </div>

            <div className="form-group">
              <label>Request Description</label>
              <textarea
                rows="6"
                name="requestDescription"
                placeholder="Describe exactly what you need..."
                value={formData.requestDescription}
                onChange={handleChange}
              ></textarea>
              {errors.requestDescription && (
                <small className="error-text">{errors.requestDescription}</small>
              )}
            </div>

            <div className="form-group">
              <label>Estimated Budget</label>
              <input
                type="text"
                name="budget"
                placeholder="Example: 3000 EGP"
                value={formData.budget}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}

export default CustomRequest;