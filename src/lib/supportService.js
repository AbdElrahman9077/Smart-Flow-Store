import { supabase } from "./supabase";
import { getCurrentUser } from "./auth";

/**
 * Support Ticket Service
 */

export async function getMyTickets() {
  const user = await getCurrentUser();
  if (!user) return { data: [], error: "Authentication required" };

  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return { data: data || [], error };
}

export async function createTicket({ subject, message, orderId = null, priority = "normal" }) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Authentication required" };

  const { data, error } = await supabase
    .from("support_tickets")
    .insert([{
      user_id: user.id,
      order_id: orderId,
      subject,
      message,
      priority,
      status: "open",
    }])
    .select()
    .single();

  return { data, error };
}

export async function adminGetTickets({ status = "", priority = "" } = {}) {
  let query = supabase
    .from("support_tickets")
    .select(`*, profiles (full_name, email)`)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function adminUpdateTicket(ticketId, updates) {
  const { error } = await supabase
    .from("support_tickets")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", ticketId);

  return { error };
}
