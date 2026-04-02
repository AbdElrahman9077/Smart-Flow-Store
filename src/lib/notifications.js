import { supabase } from "./supabase";

const ADMIN_EMAIL = "alexelshater@gmail.com";

export async function sendNotificationEmail({ to, subject, html }) {
  const { data, error } = await supabase.functions.invoke("send-email", {
    body: { to, subject, html },
  });

  if (error) {
    console.error("sendNotificationEmail error:", error);
    return { error };
  }

  return { data };
}

export async function sendAdminNotification({ subject, html }) {
  return await sendNotificationEmail({
    to: ADMIN_EMAIL,
    subject,
    html,
  });
}

export async function sendCustomerEmail({ to, subject, html }) {
  return await sendNotificationEmail({
    to,
    subject,
    html,
  });
}

export async function createAuditLog({
  action,
  entityType = null,
  entityId = null,
  description = "",
  metadata = {},
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.from("audit_logs").insert([
    {
      user_id: user?.id || null,
      action,
      entity_type: entityType,
      entity_id: entityId ? String(entityId) : null,
      description,
      metadata,
    },
  ]);

  if (error) {
    console.error("createAuditLog error:", error);
    return { error };
  }

  return { data };
}