interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema?: string;
  record: Record<string, unknown> | null;
  old_record: Record<string, unknown> | null;
}

function esc(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function getField(obj: Record<string, unknown> | null, key: string) {
  return obj && key in obj ? obj[key] : null;
}

function pick(
  r: Record<string, unknown> | null,
  o: Record<string, unknown> | null,
  key: string
) {
  return getField(r, key) ?? getField(o, key);
}

function asUrl(value: unknown): string | null {
  const s = String(value ?? "").trim();
  if (!s) return null;
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return null;
}

function getPaymentProofUrl(
  r: Record<string, unknown> | null,
  o: Record<string, unknown> | null
): string | null {
  const possibleKeys = [
    "payment_proof_url",
    "payment_proof",
    "proof_url",
    "payment_screenshot",
    "screenshot_url",
    "receipt_url",
    "payment_image",
    "payment_image_url",
  ];

  for (const key of possibleKeys) {
    const found = asUrl(pick(r, o, key));
    if (found) return found;
  }

  return null;
}

function shortBool(value: unknown) {
  if (value === true) return "Yes / نعم";
  if (value === false) return "No / لا";
  return esc(value);
}

function buildMessage(payload: WebhookPayload) {
  const r = payload.record;
  const o = payload.old_record;
  const schema = payload.schema ?? "public";

  const eventEmoji =
    payload.type === "INSERT" ? "🟢" :
    payload.type === "UPDATE" ? "🟡" :
    "🔴";

  const eventAr =
    payload.type === "INSERT" ? "إضافة" :
    payload.type === "UPDATE" ? "تحديث" :
    "حذف";

  const eventEn = payload.type;

  const header = `${eventEmoji} <b>تنبيه Smart Flow | Smart Flow Alert</b>`;
  const eventLine = `الحدث / Event: <b>${esc(eventAr)} - ${esc(eventEn)}</b>`;
  const tableLine = `الجدول / Table: <b>${esc(schema)}.${esc(payload.table)}</b>`;

  if (payload.table === "orders") {
    const proofUrl = getPaymentProofUrl(r, o);

    const lines = [
      header,
      eventLine,
      tableLine,
      `رقم الطلب / Order ID: <b>${esc(pick(r, o, "id"))}</b>`,
      `المنتج / Product: <b>${esc(pick(r, o, "product_title"))}</b>`,
      `العميل / Customer: <b>${esc(pick(r, o, "customer_full_name"))}</b>`,
      `الإيميل / Email: <b>${esc(pick(r, o, "customer_email"))}</b>`,
      `الحالة / Status: <b>${esc(pick(r, o, "status"))}</b>`,
      `الدفع / Payment Method: <b>${esc(pick(r, o, "payment_method"))}</b>`,
      `المبلغ / Amount: <b>${esc(pick(r, o, "amount"))}</b>`,
      `التحميل متاح / Download Enabled: <b>${shortBool(pick(r, o, "download_enabled"))}</b>`,
      `تم التحميل / Download Used: <b>${shortBool(pick(r, o, "download_used"))}</b>`,
      `إثبات الدفع موجود / Payment Proof Found: <b>${proofUrl ? "Yes / نعم" : "No / لا"}</b>`,
    ];

    if (proofUrl) {
      lines.push(`رابط الإثبات / Proof URL: <b>${esc(proofUrl)}</b>`);
    }

    return lines.join("\n");
  }

  if (payload.table === "download_logs") {
    return [
      "📥 <b>تنبيه تحميل | Download Alert</b>",
      eventLine,
      tableLine,
      `رقم الطلب / Order ID: <b>${esc(pick(r, o, "order_id"))}</b>`,
      `رقم المنتج / Product ID: <b>${esc(pick(r, o, "product_id"))}</b>`,
      `رقم المستخدم / User ID: <b>${esc(pick(r, o, "user_id"))}</b>`,
      `وقت العملية / Timestamp: <b>${esc(pick(r, o, "created_at"))}</b>`,
    ].join("\n");
  }

  if (payload.table === "custom_requests") {
    return [
      "🧩 <b>طلب مخصص | Custom Request</b>",
      eventLine,
      tableLine,
      `رقم الطلب / Request ID: <b>${esc(pick(r, o, "id"))}</b>`,
      `الاسم / Name: <b>${esc(pick(r, o, "full_name"))}</b>`,
      `الإيميل / Email: <b>${esc(pick(r, o, "email"))}</b>`,
      `الهاتف / Phone: <b>${esc(pick(r, o, "phone"))}</b>`,
      `التفاصيل / Details: <b>${esc(pick(r, o, "details"))}</b>`,
    ].join("\n");
  }

  if (payload.table === "profiles") {
    return [
      "👤 <b>تنبيه مستخدم | User Alert</b>",
      eventLine,
      tableLine,
      `رقم المستخدم / User ID: <b>${esc(pick(r, o, "id"))}</b>`,
      `الاسم / Name: <b>${esc(pick(r, o, "full_name"))}</b>`,
      `أدمن / Admin: <b>${shortBool(pick(r, o, "is_admin"))}</b>`,
      `الإيميل / Email: <b>${esc(pick(r, o, "email"))}</b>`,
    ].join("\n");
  }

  if (payload.table === "audit_logs") {
    return [
      "📋 <b>سجل حركة | Audit Log</b>",
      eventLine,
      tableLine,
      `الإجراء / Action: <b>${esc(pick(r, o, "action"))}</b>`,
      `النوع / Entity Type: <b>${esc(pick(r, o, "entity_type"))}</b>`,
      `الرقم / Entity ID: <b>${esc(pick(r, o, "entity_id"))}</b>`,
      `الوصف / Description: <b>${esc(pick(r, o, "description"))}</b>`,
    ].join("\n");
  }

  return [
    "🔔 <b>تنبيه عام | General Alert</b>",
    eventLine,
    tableLine,
    `<pre>${esc(JSON.stringify(payload, null, 2))}</pre>`,
  ].join("\n");
}

function buildPhotoCaption(fullText: string) {
  // Telegram captions are shorter than normal messages
  if (fullText.length <= 900) return fullText;
  return fullText.slice(0, 900) + "\n...";
}

async function sendTelegramMessage(botToken: string, chatId: string, text: string) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`sendMessage failed: ${JSON.stringify(json)}`);
  }
}

async function sendTelegramPhoto(
  botToken: string,
  chatId: string,
  photoUrl: string,
  caption: string
) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      photo: photoUrl,
      caption,
      parse_mode: "HTML",
      show_caption_above_media: true,
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`sendPhoto failed: ${JSON.stringify(json)}`);
  }
}

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const incomingSecret = req.headers.get("x-webhook-secret");
    const webhookSecret = Deno.env.get("WEBHOOK_SECRET");

    if (!incomingSecret || incomingSecret !== webhookSecret) {
      return new Response("Unauthorized", { status: 401 });
    }

    const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

    if (!BOT_TOKEN || !CHAT_ID) {
      return new Response("Missing ENV", { status: 500 });
    }

    const payload: WebhookPayload = await req.json();
    const text = buildMessage(payload);

    const proofUrl = getPaymentProofUrl(payload.record, payload.old_record);

    if (proofUrl) {
      const caption = buildPhotoCaption(text);
      await sendTelegramPhoto(BOT_TOKEN, CHAT_ID, proofUrl, caption);

      // لو الرسالة طويلة، ابعتها كاملة بعد الصورة
      if (text.length > 900) {
        await sendTelegramMessage(BOT_TOKEN, CHAT_ID, text);
      }
    } else {
      await sendTelegramMessage(BOT_TOKEN, CHAT_ID, text);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});