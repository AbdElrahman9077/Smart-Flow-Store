import { supabase } from "./supabase";

export async function confirmOrderAndEnableDownload(orderId) {
  return await supabase
    .from("orders")
    .update({
      status: "confirmed",
      download_enabled: true,
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", orderId);
}

export async function getSignedProductDownload(filePath) {
  return await supabase.storage
    .from("products-files")
    .createSignedUrl(filePath, 300);
}

export async function logAction({
  action,
  entityType = null,
  entityId = null,
  description = "",
  metadata = {},
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return await supabase.from("audit_logs").insert({
    user_id: user?.id || null,
    action,
    entity_type: entityType,
    entity_id: entityId ? String(entityId) : null,
    description,
    metadata,
  });
}