import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

async function sendTelegramMessage(chatId, text, replyMarkup = null) {
  const body = {
    chat_id: chatId,
    text: text,
    parse_mode: "HTML",
  };
  if (replyMarkup) body.reply_markup = replyMarkup;

  const res = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  return res.json();
}

export default async function handler(req, res) {
  // Solo aceptar POST
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const { user_name, user_email, product_id, product_name, product_price, payment_proof_url, payment_reference } = req.body;

  // Validar campos obligatorios
  if (!user_name || !user_email || !product_name || !product_price) {
    return res.status(400).json({ ok: false, error: "Faltan campos obligatorios" });
  }

  try {
    // 1. Guardar solicitud en Supabase
    const { data: request, error } = await supabase
      .from("purchase_requests")
      .insert({
        user_name,
        user_email,
        product_id: product_id || null,
        product_name,
        product_price,
        payment_proof_url: payment_proof_url || null,
        payment_reference: payment_reference || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return res.status(500).json({ ok: false, error: "Error guardando solicitud" });
    }

    console.log("✅ Purchase request created:", request.id);

    // 2. Enviar mensaje a Telegram con botones
    const message =
      `🛒 <b>NUEVA SOLICITUD DE COMPRA</b>\n\n` +
      `👤 <b>Cliente:</b> ${user_name}\n` +
      `📧 <b>Email:</b> ${user_email}\n` +
      `🛍️ <b>Producto:</b> ${product_name}\n` +
      `💰 <b>Monto:</b> Bs. ${product_price}\n` +
      (payment_reference ? `🔖 <b>Referencia:</b> ${payment_reference}\n` : "") +
      (payment_proof_url ? `🖼️ <b>Comprobante:</b> <a href="${payment_proof_url}">Ver imagen</a>\n` : "") +
      `\n⏰ <b>Fecha:</b> ${new Date().toLocaleString("es-BO")}\n\n` +
      `¿Confirmas la recepción del pago?`;

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "✅ Confirmar recibo de dinero",
            callback_data: `approve_REQID_${request.id}`,
          },
          {
            text: "❌ No se recibió ningún fondo",
            callback_data: `reject_REQID_${request.id}`,
          },
        ],
      ],
    };

    const telegramResponse = await sendTelegramMessage(
      TELEGRAM_ADMIN_CHAT_ID,
      message,
      keyboard
    );

    console.log("📨 Telegram message sent:", telegramResponse);

    // 3. Guardar el message_id de Telegram en Supabase (para editarlo después)
    if (telegramResponse.ok && telegramResponse.result) {
      await supabase
        .from("purchase_requests")
        .update({
          telegram_message_id: telegramResponse.result.message_id,
          telegram_notified_at: new Date().toISOString(),
        })
        .eq("id", request.id);
    }

    return res.status(200).json({
      ok: true,
      request_id: request.id,
      message: "Solicitud enviada correctamente. Recibirás tu enlace de descarga por email una vez confirmado el pago.",
    });

  } catch (err) {
    console.error("❌ Notify error:", err);
    return res.status(500).json({ ok: false, error: "Error interno del servidor" });
  }
}
