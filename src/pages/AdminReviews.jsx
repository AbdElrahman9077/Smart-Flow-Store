import { useEffect, useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { adminGetReviews, adminUpdateReviewStatus } from "../lib/reviewService";
import { formatDate } from "../lib/utils";

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  async function load() { const result = await adminGetReviews(); setReviews(result.data || []); }
  useEffect(() => { load(); }, []);
  async function setStatus(id, status) { await adminUpdateReviewStatus(id, status); load(); }
  return (
    <PageWrapper>
      <div className="container page-section">
        <h1 className="page-title">Reviews</h1>
        <div className="orders-grid">
          {reviews.length === 0 ? <div className="order-card">No reviews yet.</div> : reviews.map((review) => (
            <div className="order-card" key={review.id}>
              <div className="order-header"><h2>{review.title || "Review"}</h2><span className="status-badge">{review.status}</span></div>
              <p><strong>Rating:</strong> {review.rating}/5</p><p>{review.content}</p><p><strong>Product:</strong> {review.products?.title || review.product_id}</p><p><strong>Date:</strong> {formatDate(review.created_at)}</p>
              <div className="status-actions"><button onClick={() => setStatus(review.id, "approved")}>Approve</button><button onClick={() => setStatus(review.id, "rejected")}>Reject</button></div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}

export default AdminReviews;
