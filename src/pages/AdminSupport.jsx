import { useEffect, useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { adminGetTickets, adminUpdateTicket } from "../lib/supportService";
import { formatDate } from "../lib/utils";

function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  async function load() { const result = await adminGetTickets(); setTickets(result.data || []); }
  useEffect(() => { load(); }, []);
  async function update(id, updates) { await adminUpdateTicket(id, updates); load(); }
  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">Support CRM</h1>
        <div className="orders-grid">
          {tickets.length === 0 ? <div className="order-card">No support tickets.</div> : tickets.map((ticket) => (
            <div className="order-card" key={ticket.id}>
              <div className="order-header"><h2>{ticket.subject}</h2><span className="status-badge">{ticket.status} / {ticket.priority}</span></div>
              <p>{ticket.message}</p><p><strong>Customer:</strong> {ticket.profiles?.email || ticket.user_id}</p><p><strong>Created:</strong> {formatDate(ticket.created_at)}</p>
              <div className="status-actions"><button onClick={() => update(ticket.id, { status: "open" })}>Open</button><button onClick={() => update(ticket.id, { status: "pending" })}>Pending</button><button onClick={() => update(ticket.id, { status: "closed" })}>Close</button><button onClick={() => update(ticket.id, { priority: "high" })}>High priority</button></div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}

export default AdminSupport;
