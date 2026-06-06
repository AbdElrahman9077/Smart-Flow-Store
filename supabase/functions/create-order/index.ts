import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CHECKOUT_PRODUCT_TYPES = new Set(["digital_download", "bundle", "free_product"]);
const MANUAL_PAYMENT_METHODS = new Set(["Vodafone Cash", "Instapay", "Bank Transfer"]);

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
    const user = userResult.user;

    const body = await req.json().catch(() => ({}));
    const items = normalizeItems(body.items);
    if (items.length === 0) return json({ error: "At least one checkout item is required" }, 400);

    const paymentMethod = normalizePaymentMethod(body.payment_method);
    if (!MANUAL_PAYMENT_METHODS.has(paymentMethod)) {
      return json({ error: "Only manual payment methods are available right now" }, 400);
    }

    const customer = body.customer || {};
    const fullName = cleanText(customer.full_name);
    const email = cleanText(customer.email || user.email);
    const phone = cleanText(customer.phone);
    if (!fullName || !email || !phone) return json({ error: "Customer name, email, and phone are required" }, 400);

    const proofFilePath = cleanText(body.proof_file_path);
    const proofFileName = cleanText(body.proof_file_name);
    if (proofFilePath && !proofFilePath.startsWith(`${user.id}/`)) {
      return json({ error: "Payment proof path is not owned by this user" }, 403);
    }

    const productIds = items.map((item) => item.product_id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, title, price, sale_price, currency, is_active, status, visibility, product_type")
      .in("id", productIds);

    if (productsError) return json({ error: productsError.message }, 500);
    if (!products || products.length !== productIds.length) return json({ error: "One or more products were not found" }, 404);

    const productById = new Map(products.map((product) => [Number(product.id), product]));
    const unsupported = products.find((product) => !CHECKOUT_PRODUCT_TYPES.has(product.product_type || "digital_download"));
    if (unsupported) {
      return json({ error: `${unsupported.product_type} products are not available for checkout yet` }, 400);
    }

    const unavailable = products.find((product) => {
      const status = product.status || "published";
      const visibility = product.visibility || "public";
      return !product.is_active || status !== "published" || visibility === "hidden";
    });
    if (unavailable) return json({ error: "One or more products are not available for checkout" }, 400);

    if (items.length === 1) {
      const activeStatuses = ["pending", "confirmed", "paid", "processing", "completed"];
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("product_id", items[0].product_id)
        .in("status", activeStatuses)
        .limit(1)
        .maybeSingle();
      if (existingOrder) return json({ error: "You already have an active order for this product" }, 409);
    }

    const enrichedItems = items.map((item) => {
      const product = productById.get(item.product_id);
      const unitPrice = Number(product?.sale_price ?? product?.price ?? 0);
      const lineTotal = roundMoney(unitPrice * item.quantity);
      return { item, product, unitPrice, lineTotal };
    });
    const subtotal = roundMoney(enrichedItems.reduce((sum, row) => sum + row.lineTotal, 0));
    const discountTotal = 0;
    const total = roundMoney(Math.max(0, subtotal - discountTotal));
    const currency = enrichedItems[0]?.product?.currency || "EGP";
    const first = enrichedItems[0];
    const now = new Date().toISOString();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([{
        user_id: user.id,
        product_id: first.product?.id,
        product_title: first.product?.title,
        product_price: first.unitPrice,
        customer_full_name: fullName,
        customer_email: email,
        customer_phone: phone,
        payment_method: paymentMethod,
        manual_payment_method: paymentMethod,
        payment_status: proofFilePath ? "under_review" : "pending",
        status: "pending",
        delivery_status: "manual_review",
        subtotal,
        discount_total: discountTotal,
        discount_amount: discountTotal,
        total,
        currency,
        proof_file_path: proofFilePath || null,
        proof_file_name: proofFileName || null,
        payment_proof_path: proofFilePath || null,
        payment_proof_status: proofFilePath ? "pending_review" : "not_required",
        notes: cleanText(body.notes) || null,
        download_enabled: false,
        download_used: false,
        download_used_at: null,
        updated_at: now,
      }])
      .select()
      .single();

    if (orderError || !order) return json({ error: orderError?.message || "Could not create order" }, 500);

    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${String(order.id).padStart(5, "0")}`;
    await supabase.from("orders").update({ order_number: orderNumber }).eq("id", order.id);

    const orderItems = enrichedItems.map((row) => ({
      order_id: order.id,
      product_id: row.product?.id,
      product_title: row.product?.title || "Product",
      product_name_snapshot: row.product?.title || "Product",
      product_type_snapshot: row.product?.product_type || "digital_download",
      quantity: row.item.quantity,
      unit_price: row.unitPrice,
      line_total: row.lineTotal,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id);
      return json({ error: itemsError.message }, 500);
    }

    await supabase.from("audit_logs").insert([{
      user_id: user.id,
      actor_id: user.id,
      action: "order_created_server",
      entity_type: "order",
      entity_id: String(order.id),
      description: "Order created through create-order Edge Function",
      metadata: {
        order_id: order.id,
        order_number: orderNumber,
        product_ids: productIds,
        subtotal,
        total,
        payment_method: paymentMethod,
      },
    }]);

    return json({
      order: { ...order, order_number: orderNumber },
      summary: {
        id: order.id,
        order_number: orderNumber,
        subtotal,
        discount_total: discountTotal,
        total,
        currency,
        status: "pending",
        payment_status: proofFilePath ? "under_review" : "pending",
        payment_proof_status: proofFilePath ? "pending_review" : "not_required",
        payment_method: paymentMethod,
        items: orderItems,
      },
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});

function normalizeItems(value: unknown) {
  if (!Array.isArray(value)) return [];
  const seen = new Set<number>();
  const items: Array<{ product_id: number; quantity: number }> = [];
  for (const raw of value) {
    const row = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
    const productId = Number(row.product_id);
    const quantity = Number(row.quantity || 1);
    if (!Number.isInteger(productId) || productId <= 0 || seen.has(productId)) continue;
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 20) continue;
    seen.add(productId);
    items.push({ product_id: productId, quantity });
  }
  return items;
}

function normalizePaymentMethod(value: unknown) {
  const method = cleanText(value);
  return MANUAL_PAYMENT_METHODS.has(method) ? method : "Vodafone Cash";
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 500) : "";
}

function roundMoney(value: number) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function json(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
