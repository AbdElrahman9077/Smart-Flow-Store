import { supabase } from "./supabase";

/**
 * Support Ticket Service
 */

export async function getMyTickets(userId) {
  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { data: data || [], error };
}

export async function createTicket({ userId, subject, message, orderId = null, priority = "normal" }) {
  const { data, error } = await supabase
    .from("support_tickets")
    .insert([{
      user_id: userId,
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
