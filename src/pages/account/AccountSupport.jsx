import { useEffect, useState } from "react";
import PageWrapper from "../../components/PageWrapper";
import { getCurrentUser } from "../../lib/auth";
import { createTicket, getMyTickets } from "../../lib/supportService";
import { formatDate } from "../../lib/utils";

function AccountSupport() {
  const [tickets, setTickets] = useState([]);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ subject: "", message: "", priority: "normal" });

  async function load() {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      const result = await getMyTickets(currentUser.id);
      setTickets(result.data || []);
    }
  }

  useEffect(() => { load(); }, []);

  async function submit(event) {
    event.preventDefault();
    if (!user || !form.subject || !form.message) return;
    await createTicket({ userId: user.id, ...form });
    setForm({ subject: "", message: "", priority: "normal" });
    load();
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">Support Tickets</h1>
        <div className="checkout-box" style={{ marginBottom: 24 }}>
          <form className="checkout-form" onSubmit={submit}>
            <div className="form-group"><label>Subject</label><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
            <div className="form-group"><label>Message</label><textarea rows="4" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
            <div className="form-group"><label>Priority</label><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option>low</option><option>normal</option><option>high</option></select></div>
            <button className="primary-btn" type="submit">Create ticket</button>
          </form>
        </div>
        <div className="orders-grid">
          {tickets.length === 0 ? <div className="order-card">No tickets yet.</div> : tickets.map((ticket) => (
            <div className="order-card" key={ticket.id}>
              <div className="order-header"><h2>{ticket.subject}</h2><span className="status-badge">{ticket.status}</span></div>
              <p>{ticket.message}</p>
              <p><strong>Priority:</strong> {ticket.priority}</p>
              <p><strong>Created:</strong> {formatDate(ticket.created_at)}</p>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}

export default AccountSupport;
