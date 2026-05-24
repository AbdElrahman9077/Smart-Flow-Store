import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRole) return json({ error: "Server is not configured" }, 500);

    const authHeader = req.headers.get("Authorization") || "";
    const supabase = createClient(supabaseUrl, serviceRole, { global: { headers: { Authorization: authHeader } } });
    const { data: userResult, error: userError } = await supabase.auth.getUser();
    if (userError || !userResult.user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const orderId = Number(body.order_id);
    const productId = Number(body.product_id);
    const licenseId = body.license_id ? Number(body.license_id) : null;
    if (!orderId || !productId) return json({ error: "order_id and product_id are required" }, 400);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, products:product_id (file_storage_path, file_path, download_limit)")
      .eq("id", orderId)
      .eq("user_id", userResult.user.id)
      .eq("product_id", productId)
      .maybeSingle();
    if (orderError || !order) return json({ error: "Order not found" }, 404);
    if (!["confirmed", "paid"].includes(order.payment_status) && !["confirmed", "paid", "completed"].includes(order.status)) {
      return json({ error: "Payment is not confirmed" }, 403);
    }

    const { data: license } = await supabase
      .from("licenses")
      .select("*")
      .eq("user_id", userResult.user.id)
      .eq("order_id", orderId)
      .eq("product_id", productId)
      .eq("status", "active")
      .maybeSingle();
    if (licenseId && license?.id !== licenseId) return json({ error: "License mismatch" }, 403);

    const storagePath = order.products?.file_storage_path || order.products?.file_path || order.file_path;
    if (!storagePath) return json({ error: "Product file is not configured" }, 404);

    const { count } = await supabase
      .from("download_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userResult.user.id)
      .eq("order_id", orderId)
      .eq("product_id", productId);
    const limit = order.products?.download_limit || order.download_limit || 3;
    if ((count || 0) >= limit) return json({ error: "Download limit reached" }, 403);

    const { data: signed, error: signedError } = await supabase.storage
      .from("product-files")
      .createSignedUrl(storagePath, 300);
    if (signedError || !signed?.signedUrl) return json({ error: "Could not create signed URL" }, 500);

    await supabase.from("download_logs").insert([{
      user_id: userResult.user.id,
      order_id: orderId,
      product_id: productId,
      license_id: license?.id || licenseId,
      storage_path: storagePath,
      ip_address: req.headers.get("x-forwarded-for"),
      user_agent: req.headers.get("user-agent"),
    }]);

    return json({ signedUrl: signed.signedUrl, expiresIn: 300 });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});

function json(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
