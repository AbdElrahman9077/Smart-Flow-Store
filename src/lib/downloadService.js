import { supabase } from "./supabase";

export async function requestSecureDownload({ orderId, productId, licenseId }) {
  const { data, error } = await supabase.functions.invoke("secure-download", {
    body: { order_id: orderId, product_id: productId, license_id: licenseId },
  });
  return { data, error };
}

export async function getMyDownloadAccess(userId) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, licenses (*), products:product_id (id, title, cover_image_url, file_storage_path, file_path, download_limit)")
    .eq("user_id", userId)
    .in("payment_status", ["confirmed"])
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

export async function adminGetDownloadLogs({ limit = 100 } = {}) {
  const { data, error } = await supabase
    .from("download_logs")
    .select("*, profiles (full_name, email), products (title), orders (order_number)")
    .order("downloaded_at", { ascending: false })
    .limit(limit);
  return { data: data || [], error };
}
