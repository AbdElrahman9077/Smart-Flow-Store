import { supabase } from "./supabase";

export async function createCustomRequest(payload) {
  const { data, error } = await supabase.from("custom_requests").insert([payload]).select().single();
  return { data, error };
}

export async function getMyCustomRequests(userId) {
  const { data, error } = await supabase
    .from("custom_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}
