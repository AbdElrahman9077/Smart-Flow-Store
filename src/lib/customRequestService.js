import { supabase } from "./supabase";
import { getCurrentUser } from "./auth";

export async function createCustomRequest(payload) {
  const { data, error } = await supabase.from("custom_requests").insert([payload]).select().single();
  return { data, error };
}

export async function getMyCustomRequests() {
  const user = await getCurrentUser();
  if (!user) return { data: [], error: "Authentication required" };

  const { data, error } = await supabase
    .from("custom_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}
