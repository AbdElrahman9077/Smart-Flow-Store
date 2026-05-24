import { supabase } from "./supabase";
import { generateLicenseKey } from "./utils";

/**
 * License Service
 * Manages license creation, retrieval, and activation.
 */

/**
 * Get licenses for a user
 */
export async function getMyLicenses(userId) {
  const { data, error } = await supabase
    .from("licenses")
    .select(`
      *,
      products (id, title, cover_image_url, category)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { data: data || [], error };
}

/**
 * Admin: Get all licenses
 */
export async function adminGetLicenses({ search = "", status = "" } = {}) {
  let query = supabase
    .from("licenses")
    .select(`
      *,
      products (id, title),
      orders (id, order_number, customer_full_name, customer_email)
    `)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (search) {
    query = query.or(`license_key.ilike.%${search}%`);
  }

  const { data, error } = await query;
  return { data: data || [], error };
}

/**
 * Admin: Update license status
 */
export async function adminUpdateLicenseStatus(licenseId, status) {
  const { error } = await supabase
    .from("licenses")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", licenseId);

  return { error };
}

/**
 * Generate a new license for an order (admin action)
 */
export async function generateLicenseForOrder(order) {
  const licenseKey = generateLicenseKey();
  const supportExpiry = new Date();
  supportExpiry.setMonth(supportExpiry.getMonth() + 6);

  const { data, error } = await supabase
    .from("licenses")
    .insert([{
      user_id: order.user_id,
      order_id: order.id,
      product_id: order.product_id,
      license_key: licenseKey,
      license_type: "single",
      status: "active",
      activation_limit: 1,
      support_expires_at: supportExpiry.toISOString(),
    }])
    .select()
    .single();

  return { data, error };
}
