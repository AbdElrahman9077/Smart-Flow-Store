import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ["orders.manage", "payments.manage"],
  admin: ["orders.manage"],
  sales: [],
  support_agent: [],
  content_manager: [],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRole) return json({ error: "Server is not configured" }, 500);

    const authHeader = req.headers.get("Authorization") || "";
    const supabase = createClient(supabaseUrl, serviceRole, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userResult, error: userError } = await supabase.auth.getUser();
    if (userError || !userResult.user) return json({ error: "Unauthorized" }, 401);
    const adminUser = userResult.user;

    const permission = await resolveAdminPermission(supabase, adminUser.id);
    if (!permission.allowed) return json({ error: "Admin payment review permission required" }, 403);

    const body = await req.json().catch(() => ({}));
    const orderId = Number(body.order_id);
    const action = cleanText(body.action);
    const adminNotes = cleanText(body.admin_notes);
    const rejectionReason = cleanText(body.rejection_reason);

    if (!Number.isInteger(orderId) || orderId <= 0) return json({ error: "order_id is required" }, 400);
    if (!["approve", "reject"].includes(action)) return json({ error: "action must be approve or reject" }, 400);
    if (action === "reject" && !rejectionReason) return json({ error: "rejection_reason is required when rejecting" }, 400);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items (*), products:product_id (id, title, product_type)")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) return json({ error: orderError.message }, 500);
    if (!order) return json({ error: "Order not found" }, 404);
    if (!order.user_id) return json({ error: "Order is not linked to a customer user" }, 400);

    const hasCustomer = await orderHasCustomerRecord(supabase, order.user_id);
    if (!hasCustomer) return json({ error: "Order customer profile was not found" }, 400);

    if (["confirmed", "paid"].includes(order.payment_status) || ["confirmed", "completed", "delivered"].includes(order.status)) {
      return json({ error: "Order payment is already confirmed" }, 409);
    }
    if (["rejected", "failed", "refunded"].includes(order.payment_status)) {
      return json({ error: "Order payment is already closed" }, 409);
    }

    const allowedPaymentStates = ["pending", "under_review", "manual_review", null, undefined];
    if (!allowedPaymentStates.includes(order.payment_status)) {
      return json({ error: "Order is not pending manual payment review" }, 409);
    }

    const now = new Date().toISOString();
    const updatePayload: Record<string, unknown> = {
      payment_reviewed_by: adminUser.id,
      payment_reviewed_at: now,
      payment_admin_notes: adminNotes || null,
      updated_at: now,
    };

    let licenseKey: string | null = null;
    if (action === "approve") {
      Object.assign(updatePayload, {
        status: "confirmed",
        payment_status: "confirmed",
        payment_proof_status: "approved",
        delivery_status: "ready",
        paid_at: now,
        confirmed_at: now,
        download_enabled: true,
        download_used: false,
        download_used_at: null,
        payment_rejection_reason: null,
      });
    } else {
      Object.assign(updatePayload, {
        status: "rejected",
        payment_status: "rejected",
        payment_proof_status: "rejected",
        delivery_status: "cancelled",
        paid_at: null,
        confirmed_at: null,
        download_enabled: false,
        payment_rejection_reason: rejectionReason,
      });
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", orderId)
      .select()
      .single();

    if (updateError || !updatedOrder) return json({ error: updateError?.message || "Could not update order" }, 500);

    if (action === "approve") {
      licenseKey = await ensureLegacyLicense(supabase, order);
    }

    const auditAction = action === "approve" ? "manual_payment_approved" : "manual_payment_rejected";
    await supabase.from("audit_logs").insert([{
      user_id: order.user_id,
      actor_id: adminUser.id,
      action: auditAction,
      entity_type: "order",
      entity_id: String(orderId),
      description: `Manual payment ${action === "approve" ? "approved" : "rejected"} for order ${order.order_number || orderId}`,
      metadata: {
        order_id: orderId,
        order_number: order.order_number || null,
        reviewed_by: adminUser.id,
        license_key: licenseKey,
        rejection_reason: action === "reject" ? rejectionReason : null,
      },
    }]);

    return json({
      order: {
        id: updatedOrder.id,
        order_number: updatedOrder.order_number,
        status: updatedOrder.status,
        payment_status: updatedOrder.payment_status,
        payment_proof_status: updatedOrder.payment_proof_status,
        delivery_status: updatedOrder.delivery_status,
        paid_at: updatedOrder.paid_at,
        payment_reviewed_by: updatedOrder.payment_reviewed_by,
        payment_reviewed_at: updatedOrder.payment_reviewed_at,
        payment_rejection_reason: updatedOrder.payment_rejection_reason,
      },
      license_key: licenseKey,
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});

async function resolveAdminPermission(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data: adminRecord } = await supabase
    .from("admin_users")
    .select("role, permissions, status")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (adminRecord) {
    const role = String(adminRecord.role || "");
    const explicit = Array.isArray(adminRecord.permissions) ? adminRecord.permissions : [];
    const merged = new Set([...(ROLE_PERMISSIONS[role] || []), ...explicit]);
    return { allowed: merged.has("orders.manage") || merged.has("payments.manage") };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, role")
    .eq("id", userId)
    .maybeSingle();

  return { allowed: profile?.is_admin === true || profile?.role === "admin" };
}

async function orderHasCustomerRecord(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (customer) return true;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  return Boolean(profile);
}

async function ensureLegacyLicense(supabase: ReturnType<typeof createClient>, order: Record<string, unknown>) {
  if (!order.product_id || !order.user_id) return null;

  const { data: existingLicense } = await supabase
    .from("licenses")
    .select("id, license_key")
    .eq("order_id", order.id)
    .maybeSingle();
  if (existingLicense?.license_key) return existingLicense.license_key;

  const supportExpiry = new Date();
  supportExpiry.setMonth(supportExpiry.getMonth() + 6);
  const licenseKey = generateLicenseKey();

  const { error } = await supabase.from("licenses").insert([{
    user_id: order.user_id,
    order_id: order.id,
    product_id: order.product_id,
    license_key: licenseKey,
    license_type: "single",
    status: "active",
    activation_limit: 1,
    support_expires_at: supportExpiry.toISOString(),
  }]);

  return error ? null : licenseKey;
}

function generateLicenseKey() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `SFH-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}`;
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 1000) : "";
}

function json(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
