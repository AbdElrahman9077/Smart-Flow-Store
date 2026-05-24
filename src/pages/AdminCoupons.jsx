import { useEffect, useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { adminCreateCoupon, adminGetCoupons, adminUpdateCoupon } from "../lib/couponService";
import { formatDate } from "../lib/utils";

function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: "", type: "percentage", value: 10, max_uses: "", expires_at: "" });

  async function load() {
    const result = await adminGetCoupons();
    setCoupons(result.data || []);
  }
  useEffect(() => { load(); }, []);

  async function submit(event) {
    event.preventDefault();
    await adminCreateCoupon({ ...form, value: Number(form.value), max_uses: form.max_uses ? Number(form.max_uses) : null, expires_at: form.expires_at || null, is_active: true });
    setForm({ code: "", type: "percentage", value: 10, max_uses: "", expires_at: "" });
    load();
  }

  async function toggle(coupon) {
    await adminUpdateCoupon(coupon.id, { is_active: !coupon.is_active });
    load();
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">Coupons</h1>
        <div className="checkout-box" style={{ marginBottom: 24 }}>
          <form className="checkout-form" onSubmit={submit}>
            <div className="form-group"><label>Code</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required /></div>
            <div className="form-group"><label>Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="percentage">percentage</option><option value="fixed">fixed</option></select></div>
            <div className="form-group"><label>Value</label><input type="number" min="0" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
            <div className="form-group"><label>Max uses</label><input type="number" min="0" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} /></div>
            <div className="form-group"><label>Expires at</label><input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} /></div>
            <button className="primary-btn" type="submit">Create coupon</button>
          </form>
        </div>
        <div className="orders-grid">
          {coupons.map((coupon) => <div className="order-card" key={coupon.id}><div className="order-header"><h2>{coupon.code}</h2><span className="status-badge">{coupon.is_active ? "active" : "inactive"}</span></div><p>{coupon.type}: {coupon.value}</p><p>Used {coupon.used_count || 0} / {coupon.max_uses || "unlimited"}</p><p>Expires: {formatDate(coupon.expires_at)}</p><button className="secondary-link-btn" onClick={() => toggle(coupon)}>{coupon.is_active ? "Deactivate" : "Activate"}</button></div>)}
        </div>
      </div>
    </PageWrapper>
  );
}

export default AdminCoupons;
