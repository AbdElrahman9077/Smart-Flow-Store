import PageWrapper from "../components/PageWrapper";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import products from "../data/products";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/auth";
function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = products.find((item) => String(item.id) === String(id));

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    paymentMethod: "Vodafone Cash",
    notes: "",
    proofFileName: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!product) {
    return (
      <PageWrapper>
        <div className="container page-section">
          <h2>Product not found</h2>
        </div>
      </PageWrapper>
    );
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleFileChange(event) {
    const file = event.target.files[0];

    setFormData((prev) => ({
      ...prev,
      proofFileName: file ? file.name : "",
    }));
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!formData.email.includes("@")) {
      newErrors.email = "Enter a valid email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.proofFileName.trim()) {
      newErrors.proofFileName = "Payment proof is required";
    }

    return newErrors;
  }

async function handleSubmit(event) {
  event.preventDefault();

  const validationErrors = validateForm();
  setErrors(validationErrors);

  if (Object.keys(validationErrors).length > 0) return;

  setSubmitting(true);

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    setSubmitting(false);
    alert("Please login first before placing an order.");
    navigate("/login");
    return;
  }

  const { error } = await supabase.from("orders").insert([
    {
      user_id: currentUser.id,
      product_id: product.id,
      product_title: product.title,
      product_price: product.price,
      currency: product.currency,
      customer_full_name: formData.fullName,
      customer_email: formData.email,
      customer_phone: formData.phone,
      payment_method: formData.paymentMethod,
      proof_file_name: formData.proofFileName,
      notes: formData.notes,
      status: "Pending Review",
    },
  ]);

  setSubmitting(false);

  if (error) {
    console.error("Supabase insert error:", error);
    alert("There was an error saving the order.");
    return;
  }

  navigate("/order-success");
}

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="checkout-box">
          <h1>Checkout</h1>
          <p className="checkout-text">Complete your order details for:</p>

          <div className="checkout-product">
            <h2>{product.title}</h2>
            <p>{product.description}</p>
            <h3>
              {product.price} {product.currency}
            </h3>
          </div>

          <div className="payment-info-box">
            <h3>Payment Instructions</h3>
            <p>
              <strong>Vodafone Cash:</strong> 01037461971
            </p>
            <p>
              <strong>Instapay:</strong> abdelrahman.mo077644@instapay
            </p>
            <p>
              <strong>Note:</strong> After payment, upload proof below.
            </p>
          </div>

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
              {errors.fullName && (
                <small className="error-text">{errors.fullName}</small>
              )}
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
              {errors.email && (
                <small className="error-text">{errors.email}</small>
              )}
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
              {errors.phone && (
                <small className="error-text">{errors.phone}</small>
              )}
            </div>

            <div className="form-group">
              <label>Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
              >
                <option>Vodafone Cash</option>
                <option>Instapay</option>
                <option>Bank Transfer</option>
              </select>
            </div>

            <div className="form-group">
              <label>Upload Payment Proof</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
              {formData.proofFileName && (
                <small>Selected file: {formData.proofFileName}</small>
              )}
              {errors.proofFileName && (
                <small className="error-text">{errors.proofFileName}</small>
              )}
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                rows="4"
                name="notes"
                placeholder="Write any extra notes here"
                value={formData.notes}
                onChange={handleChange}
              ></textarea>
            </div>

            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Order"}
            </button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Checkout;