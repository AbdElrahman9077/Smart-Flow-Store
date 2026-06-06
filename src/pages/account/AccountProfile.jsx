import { useEffect, useState } from "react";
import PageWrapper from "../../components/PageWrapper";
import { getCurrentCustomer, updateCurrentCustomerProfile } from "../../lib/customerAccountService";

const emptyForm = {
  full_name: "",
  company_name: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  billing_name: "",
  billing_email: "",
  billing_phone: "",
  billing_address: "",
  tax_number: "",
};

function AccountProfile() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const result = await getCurrentCustomer();
      if (result.data) {
        setForm({
          full_name: result.data.full_name || "",
          company_name: result.data.company_name || "",
          email: result.data.email || result.user?.email || "",
          phone: result.data.phone || "",
          country: result.data.country || "",
          city: result.data.city || "",
          billing_name: result.data.billing_name || "",
          billing_email: result.data.billing_email || "",
          billing_phone: result.data.billing_phone || "",
          billing_address: result.data.billing_address || "",
          tax_number: result.data.tax_number || "",
        });
        setStatus(result.data.status || "active");
        if (result.warning) setMessage("Customer table not confirmed yet; using profile fallback.");
      }
      setLoading(false);
    }
    load();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    const result = await updateCurrentCustomerProfile(form);
    setSaving(false);
    setMessage(result.error ? `Could not save profile: ${result.error.message || result.error}` : "Profile saved for your account.");
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Your customer profile is scoped to your signed-in account. Billing fields are stored for future invoices, but invoices are not implemented yet.</p>

        {loading ? (
          <div className="details-box">Loading profile...</div>
        ) : (
          <form className="checkout-box checkout-form" onSubmit={handleSubmit}>
            {message && <div className="form-message">{message}</div>}
            <div className="profile-grid">
              <div><strong>Status</strong><span>{status}</span></div>
              <div><strong>Subscriptions</strong><span>Coming soon</span></div>
              <div><strong>Devices</strong><span>Coming soon</span></div>
              <div><strong>Invoices</strong><span>Coming soon</span></div>
            </div>

            <div className="form-group"><label>Full name</label><input name="full_name" value={form.full_name} onChange={handleChange} /></div>
            <div className="form-group"><label>Company name</label><input name="company_name" value={form.company_name} onChange={handleChange} /></div>
            <div className="form-group"><label>Email</label><input type="email" name="email" value={form.email} onChange={handleChange} /></div>
            <div className="form-group"><label>Phone</label><input name="phone" value={form.phone} onChange={handleChange} /></div>
            <div className="form-group"><label>Country</label><input name="country" value={form.country} onChange={handleChange} /></div>
            <div className="form-group"><label>City</label><input name="city" value={form.city} onChange={handleChange} /></div>
            <div className="form-group"><label>Billing name</label><input name="billing_name" value={form.billing_name} onChange={handleChange} /></div>
            <div className="form-group"><label>Billing email</label><input type="email" name="billing_email" value={form.billing_email} onChange={handleChange} /></div>
            <div className="form-group"><label>Billing phone</label><input name="billing_phone" value={form.billing_phone} onChange={handleChange} /></div>
            <div className="form-group"><label>Billing address</label><textarea rows="3" name="billing_address" value={form.billing_address} onChange={handleChange} /></div>
            <div className="form-group"><label>Tax number</label><input name="tax_number" value={form.tax_number} onChange={handleChange} /></div>
            <button className="primary-btn" type="submit" disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
          </form>
        )}
      </div>
    </PageWrapper>
  );
}

export default AccountProfile;
