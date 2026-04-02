import { supabase } from "./supabase";

export async function sendCustomerEmail({ to, subject, html }) {
  const { data, error } = await supabase.functions.invoke("send-email", {
    body: { to, subject, html },
  });

  if (error) {
    console.error("sendCustomerEmail error:", error);
    return { error };
  }

  return { data };
}

export async function sendAdminNotification({ subject, html }) {
  const { data, error } = await supabase.functions.invoke("send-email", {
    body: {
      to: "alexelshater@gmail.com",
      subject,
      html,
    },
  });

  if (error) {
    console.error("sendAdminNotification error:", error);
    return { error };
  }

  return { data };
}