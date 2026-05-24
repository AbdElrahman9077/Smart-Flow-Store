import { supabase } from "./supabase";
export { adminGetReviews, adminUpdateReviewStatus, getProductReviews } from "./adminService";

export async function createReview(payload) {
  const { data, error } = await supabase.from("reviews").insert([{ ...payload, status: "pending" }]).select().single();
  return { data, error };
}
