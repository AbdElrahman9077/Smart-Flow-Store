import { supabase } from "./supabase";
import { generateLicenseKey, generateOrderNumber } from "./utils";
import { logAction } from "./orderTools";
import { getCurrentUser } from "./auth";

/**
 * Order Service
 * Manages order creation, retrieval, and status updates.
 */

export const CHECKOUT_COMPATIBLE_PRODUCT_TYPES = ["digital_download", "bundle", "free_product"];

export function isCheckoutCompatibleProduct(product) {
  return CHECKOUT_COMPATIBLE_PRODUCT_TYPES.includes(product?.product_type || "digital_download");
}

/**
 * Create an order through the server-side Edge Function.
 * The browser only sends product IDs, quantities, and non-pricing manual-payment metadata.
 */
export async function createServerOrder({
  items,
  customerName,
  customerEmail,
  customerPhone,
  paymentMethod,
  notes = null,
  proofFilePath = null,
  proofFileName = null,
}) {
  const { data, error } = await supabase.functions.invoke("create-order", {
    body: {
      items,
      customer: {
        full_name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      payment_method: paymentMethod,
      notes,
      proof_file_path: proofFilePath,
      proof_file_name: proofFileName,
    },
  });

  return { data, error };
}

/**
 * Create a new order
 */
export async function createOrder({
  userId,
  product,
  customerName,
  customerEmail,
  customerPhone,
  paymentMethod,
  notes = null,
  proofFileUrl = null,
  proofFilePath = null,
  proofFileName = null,
  couponCode = null,
  discountTotal = 0,
}) {
  const price = product.sale_price || product.price || 0;
  const total = Math.max(0, price - discountTotal);

  const orderPayload = {
    user_id: userId,
    product_id: product.id,
    product_title: product.title,
    product_price: price,
    customer_full_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    payment_method: paymentMethod,
    notes: notes || null,
    proof_file_url: proofFileUrl,
    proof_file_path: proofFilePath,
    proof_file_name: proofFileName,
    status: "pending",
    payment_status: "pending",
    subtotal: price,
    discount_total: discountTotal,
    total,
    currency: product.currency || "EGP",
    coupon_code: couponCode || null,
    download_enabled: false,
    download_used: false,
  };

  const { data: insertedOrder, error } = await supabase
    .from("orders")
    .insert([orderPayload])
    .select()
    .single();

  if (error) return { data: null, error };

  // Set order number
  const orderNumber = generateOrderNumber(insertedOrder.id);
  await supabase
    .from("orders")
    .update({ order_number: orderNumber })
    .eq("id", insertedOrder.id);

  return {
    data: { ...insertedOrder, order_number: orderNumber },
    error: null,
  };
}

/**
 * Get orders for a customer
 */
export async function getMyOrders() {
  const user = await getCurrentUser();
  if (!user) return { data: [], error: "Authentication required" };

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return { data: data || [], error };
}

/**
 * Admin: Get all orders with optional filters
 */
export async function adminGetOrders({ search = "", status = "", paymentStatus = "" } = {}) {
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (paymentStatus) query = query.eq("payment_status", paymentStatus);
  if (search) {
    query = query.or(
      `customer_email.ilike.%${search}%,customer_full_name.ilike.%${search}%,order_number.ilike.%${search}%,product_title.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  return { data: data || [], error };
}

/**
 * Admin: Mark order as paid — updates status and generates license if needed
 */
export async function adminConfirmOrderPayment(order) {
  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "confirmed",
      payment_status: "confirmed",
      payment_proof_status: "approved",
      download_enabled: true,
      confirmed_at: now,
      paid_at: now,
      updated_at: now,
    })
    .eq("id", order.id);

  if (updateError) return { error: updateError };

  // Generate license if product qualifies
  let licenseKey = null;
  try {
    const { data: existingLicense } = await supabase
      .from("licenses")
      .select("id, license_key")
      .eq("order_id", order.id)
      .maybeSingle();

    if (!existingLicense) {
      licenseKey = generateLicenseKey();
      const supportExpiry = new Date();
      supportExpiry.setMonth(supportExpiry.getMonth() + 6);

      await supabase.from("licenses").insert([{
        user_id: order.user_id,
        order_id: order.id,
        product_id: order.product_id,
        license_key: licenseKey,
        license_type: "single",
        status: "active",
        activation_limit: 1,
        support_expires_at: supportExpiry.toISOString(),
      }]);
    } else {
      licenseKey = existingLicense.license_key;
    }
  } catch (licErr) {
    console.warn("[orderService] License generation error:", licErr);
  }

  // Audit log
  await logAction({
    action: "order_payment_confirmed",
    entityType: "order",
    entityId: order.id,
    description: `Order ${order.order_number || order.id} confirmed`,
    metadata: { orderId: order.id, licenseKey },
  });

  return { data: { licenseKey }, error: null };
}

/**
 * Admin: Update order status
 */
export async function adminUpdateOrderStatus(orderId, status, adminNotes = null) {
  const now = new Date().toISOString();
  const payload = { status, updated_at: now };

  if (status === "confirmed") {
    payload.download_enabled = true;
    payload.confirmed_at = now;
    payload.payment_status = "confirmed";
  }
  if (status === "rejected" || status === "cancelled") {
    payload.download_enabled = false;
    payload.payment_status = status === "rejected" ? "failed" : "pending";
  }
  if (status === "completed" || status === "delivered") {
    payload.download_enabled = false;
  }
  if (adminNotes !== null) payload.admin_notes = adminNotes;

  const { error } = await supabase.from("orders").update(payload).eq("id", orderId);
  return { error };
}

/**
 * Validate coupon code
 */
export async function validateCoupon(code, orderAmount) {
  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .maybeSingle();

  if (error || !coupon) return { valid: false, message: "Invalid coupon code" };

  const now = new Date();
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { valid: false, message: "Coupon has expired" };
  }
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { valid: false, message: "Coupon is not yet active" };
  }
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    return { valid: false, message: "Coupon usage limit reached" };
  }
  if (coupon.min_order_amount && orderAmount < coupon.min_order_amount) {
    return {
      valid: false,
      message: `Minimum order amount is ${coupon.min_order_amount} ${coupon.currency || ""}`,
    };
  }

  let discount = 0;
  if (coupon.type === "percentage") {
    discount = Math.min(orderAmount, (orderAmount * coupon.value) / 100);
  } else {
    discount = Math.min(orderAmount, coupon.value);
  }

  return { valid: true, coupon, discount: Math.round(discount * 100) / 100 };
}
