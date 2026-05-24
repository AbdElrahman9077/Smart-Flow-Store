import { useEffect, useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { getSiteSettings, updateSiteSetting } from "../lib/adminService";

const fields = ["store_name", "support_email", "whatsapp_number", "currency", "manual_payment_instructions", "download_limit_default", "license_support_months", "email_notifications", "telegram_notifications", "maintenance_mode"];

function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  useEffect(() => { getSiteSettings().then(setSettings); }, []);
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    await Promise.all(fields.map((key) => updateSiteSetting(key, settings[key] ?? "")));
    setSaving(false);
  }
  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">Admin Settings</h1>
        <div className="checkout-box">
          <form className="checkout-form" onSubmit={submit}>
            {fields.map((field) => <div className="form-group" key={field}><label>{field.replace(/_/g, " ")}</label><input value={settings[field] ?? ""} onChange={(e) => setSettings({ ...settings, [field]: e.target.value })} /></div>)}
            <button className="primary-btn" type="submit" disabled={saving}>{saving ? "Saving..." : "Save settings"}</button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}

export default AdminSettings;
