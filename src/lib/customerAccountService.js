import { getCurrentUser } from "./auth";
import { supabase } from "./supabase";

export async function requireCustomerSession() {
  const user = await getCurrentUser();
  if (!user) return { user: null, error: "Authentication required" };
  return { user, error: null };
}

export async function getCurrentProfile() {
  const { user, error: sessionError } = await requireCustomerSession();
  if (sessionError) return { data: null, user: null, error: sessionError };

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, role, status, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return { data, user, error };
}

export async function getCurrentCustomer() {
  const { user, error: sessionError } = await requireCustomerSession();
  if (sessionError) return { data: null, user: null, error: sessionError };

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!error) return { data, user, error: null };

  const profileResult = await getCurrentProfile();
  if (profileResult.error) return { data: null, user, error };

  return {
    data: {
      user_id: user.id,
      full_name: profileResult.data?.full_name || "",
      email: profileResult.data?.email || user.email || "",
      phone: profileResult.data?.phone || "",
      status: profileResult.data?.status || "active",
      source: "profiles_fallback",
    },
    user,
    error: null,
    warning: "customers table unavailable; using profiles fallback",
  };
}

export async function updateCurrentCustomerProfile(updates) {
  const { user, error: sessionError } = await requireCustomerSession();
  if (sessionError) return { data: null, error: sessionError };

  const payload = {
    user_id: user.id,
    full_name: updates.full_name || "",
    company_name: updates.company_name || null,
    phone: updates.phone || null,
    email: updates.email || user.email || null,
    country: updates.country || null,
    city: updates.city || null,
    billing_name: updates.billing_name || null,
    billing_email: updates.billing_email || null,
    billing_phone: updates.billing_phone || null,
    billing_address: updates.billing_address || null,
    tax_number: updates.tax_number || null,
    status: "active",
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("customers")
    .upsert(payload, { onConflict: "user_id" })
    .select()
    .single();

  if (!error) return { data, error: null };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: payload.full_name,
      phone: payload.phone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  return {
    data: profileError ? null : { ...payload, source: "profiles_fallback" },
    error: profileError || error,
  };
}

export async function listCustomerOrders() {
  const { user, error: sessionError } = await requireCustomerSession();
  if (sessionError) return { data: [], error: sessionError };

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return { data: data || [], error };
}

export async function listCustomerDownloads() {
  const { user, error: sessionError } = await requireCustomerSession();
  if (sessionError) return { data: [], error: sessionError };

  const { data, error } = await supabase
    .from("orders")
    .select("*, licenses (*), products:product_id (id, title, cover_image_url, file_storage_path, file_path, download_limit)")
    .eq("user_id", user.id)
    .in("payment_status", ["confirmed"])
    .order("created_at", { ascending: false });

  return { data: data || [], error };
}

export async function listCustomerLicenses() {
  const { user, error: sessionError } = await requireCustomerSession();
  if (sessionError) return { data: [], error: sessionError };

  const { data, error } = await supabase
    .from("licenses")
    .select("*, products (id, title, cover_image_url, category)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return { data: data || [], error };
}

export async function listCustomerSupportTickets() {
  const { user, error: sessionError } = await requireCustomerSession();
  if (sessionError) return { data: [], error: sessionError };

  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return { data: data || [], error };
}

export async function createCustomerSupportTicket({ subject, message, priority = "normal", orderId = null }) {
  const { user, error: sessionError } = await requireCustomerSession();
  if (sessionError) return { data: null, error: sessionError };

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

export async function listCustomerCustomRequests() {
  const { user, error: sessionError } = await requireCustomerSession();
  if (sessionError) return { data: [], error: sessionError };

  const { data, error } = await supabase
    .from("custom_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return { data: data || [], error };
}
