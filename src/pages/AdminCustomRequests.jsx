import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PageWrapper from "../components/PageWrapper";
import { useToast } from "../context/ToastContext";

function AdminCustomRequests() {
  const [requests, setRequests] = useState([]);
  const { showToast } = useToast();

  async function fetchRequests() {
    const { data, error } = await supabase
      .from("custom_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch custom requests error:", error);
    } else {
      setRequests(data || []);
    }
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  async function handleStatusChange(id, status) {
    const { error } = await supabase
      .from("custom_requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      showToast(`Failed to update request: ${error.message}`, "error");
      return;
    }

    showToast("Request status updated successfully.");
    fetchRequests();
  }

  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">Admin Custom Requests</h1>

        <div className="orders-grid">
          {requests.map((request) => (
            <div className="order-card" key={request.id}>
              <div className="order-header">
                <h2>{request.request_title}</h2>
                <span className="status-badge">{request.status}</span>
              </div>

              <p><strong>Name:</strong> {request.full_name}</p>
              <p><strong>Email:</strong> {request.email}</p>
              <p><strong>Phone:</strong> {request.phone || "No phone"}</p>
              <p><strong>Budget:</strong> {request.budget || "Not specified"}</p>
              <p><strong>Description:</strong> {request.request_description}</p>
              <p><strong>Created At:</strong> {new Date(request.created_at).toLocaleString()}</p>

              <div className="status-actions">
                <button onClick={() => handleStatusChange(request.id, "Pending Review")}>
                  Pending
                </button>
                <button onClick={() => handleStatusChange(request.id, "Confirmed")}>
                  Confirm
                </button>
                <button onClick={() => handleStatusChange(request.id, "Rejected")}>
                  Reject
                </button>
                <button onClick={() => handleStatusChange(request.id, "Delivered")}>
                  Deliver
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}

export default AdminCustomRequests;