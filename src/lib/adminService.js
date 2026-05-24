import { supabase } from "./supabase";

/**
 * Admin Stats Service
 * Fetches dashboard statistics.
 */

export async function getAdminStats() {
  const [
    usersRes,
    totalOrdersRes,
    pendingOrdersRes,
    confirmedOrdersRes,
    productsRes,
    customRequestsRes,
    licensesRes,
    openTicketsRes,
    downloadsRes,
    recentOrdersRes,
  ] = await Promise.allSettled([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("custom_requests").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("licenses").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("download_logs").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("id, order_number, product_title, status, payment_status, total, currency, created_at, customer_full_name").order("created_at", { ascending: false }).limit(5),
  ]);

  function getCount(result) {
    return result.status === "fulfilled" ? result.value.count || 0 : 0;
  }

  function getData(result) {
    return result.status === "fulfilled" ? result.value.data || [] : [];
  }

  return {
    totalUsers: getCount(usersRes),
    totalOrders: getCount(totalOrdersRes),
    pendingOrders: getCount(pendingOrdersRes),
    confirmedOrders: getCount(confirmedOrdersRes),
    totalProducts: getCount(productsRes),
    newCustomRequests: getCount(customRequestsRes),
    activeLicenses: getCount(licensesRes),
    openTickets: getCount(openTicketsRes),
    totalDownloads: getCount(downloadsRes),
    recentOrders: getData(recentOrdersRes),
  };
}

/**
 * Coupon management
 */
export async function adminGetCoupons() {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

export async function adminCreateCoupon(coupon) {
  const { data, error } = await supabase
    .from("coupons")
    .insert([{
      ...coupon,
      code: coupon.code.toUpperCase(),
      used_count: 0,
    }])
    .select()
    .single();
  return { data, error };
}

export async function adminUpdateCoupon(id, updates) {
  const { data, error } = await supabase
    .from("coupons")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

export async function adminDeleteCoupon(id) {
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  return { error };
}

/**
 * Reviews management
 */
export async function adminGetReviews({ status = "" } = {}) {
  let query = supabase
    .from("reviews")
    .select(`*, profiles (full_name, email), products (title)`)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  return { data: data || [], error };
}

export async function adminUpdateReviewStatus(id, status) {
  const { error } = await supabase
    .from("reviews")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  return { error };
}

export async function getProductReviews(productId) {
  const { data, error } = await supabase
    .from("reviews")
    .select(`*, profiles (full_name)`)
    .eq("product_id", productId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

/**
 * Download logs management
 */
export async function adminGetDownloadLogs({ limit = 50 } = {}) {
  const { data, error } = await supabase
    .from("download_logs")
    .select(`
      *,
      profiles (full_name, email),
      products (title),
      orders (order_number)
    `)
    .order("downloaded_at", { ascending: false })
    .limit(limit);
  return { data: data || [], error };
}

/**
 * Site settings
 */
export async function getSiteSettings() {
  const { data, error } = await supabase.from("site_settings").select("*");
  if (error || !data) return {};
  return Object.fromEntries(data.map((s) => {
    try {
      return [s.key, typeof s.value === "string" ? JSON.parse(s.value) : s.value];
    } catch {
      return [s.key, s.value];
    }
  }));
}

export async function updateSiteSetting(key, value) {
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value: JSON.stringify(value), updated_at: new Date().toISOString() }, { onConflict: "key" });
  return { error };
}

/**
 * Custom requests admin
 */
export async function adminGetCustomRequests({ status = "", search = "" } = {}) {
  let query = supabase
    .from("custom_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (search) query = query.or(`customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`);

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function adminUpdateCustomRequest(id, updates) {
  const { error } = await supabase
    .from("custom_requests")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  return { error };
}
