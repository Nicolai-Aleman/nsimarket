import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

// Función para enviar mensajes a Telegram
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

// Función para editar un mensaje existente en Telegram
async function editTelegramMessage(chatId, messageId, text) {
  await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: text,
        parse_mode: "HTML",
      }),
    }
  );
}

// Función para responder a un callback_query (quita el "loading" del botón)
async function answerCallbackQuery(callbackQueryId, text) {
  await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text,
      }),
    }
  );
}

// Genera un token único para descarga
function generateDownloadToken() {
  return (
    Math.random().toString(36).substring(2) +
    Date.now().toString(36) +
    Math.random().toString(36).substring(2)
  );
}

export default async function handler(req, res) {
  // Validar método
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  // Validar webhook secret
  const secretHeader = req.headers["x-telegram-bot-api-secret-token"];
  if (!secretHeader || secretHeader !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    console.log("❌ Unauthorized webhook call");
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const body = req.body;
  console.log("✅ Webhook received:", JSON.stringify(body));

  try {
    // ================================================
    // CASO 1: El usuario presionó un botón en Telegram
    // ================================================
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const callbackData = callbackQuery.data; // "approve_UUID" o "reject_UUID"
      const messageId = callbackQuery.message.message_id;
      const chatId = callbackQuery.message.chat.id;

      const [action, requestId] = callbackData.split("_REQID_");

      if (!requestId) {
        await answerCallbackQuery(callbackQuery.id, "Error: ID no encontrado");
        return res.status(200).json({ ok: true });
      }

      // Buscar la solicitud en Supabase
      const { data: request, error } = await supabase
        .from("purchase_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (error || !request) {
        await answerCallbackQuery(callbackQuery.id, "❌ Solicitud no encontrada");
        return res.status(200).json({ ok: true });
      }

      if (request.status !== "pending") {
        await answerCallbackQuery(
          callbackQuery.id,
          "⚠️ Esta solicitud ya fue procesada"
        );
        return res.status(200).json({ ok: true });
      }

      if (action === "approve") {
        // Generar token de descarga único
        const downloadToken = generateDownloadToken();
        const downloadExpires = new Date();
        downloadExpires.setHours(downloadExpires.getHours() + 48); // expira en 48hs

        const downloadUrl = `${process.env.APP_BASE_URL}/descargar?token=${downloadToken}`;

        // Actualizar Supabase
        await supabase
          .from("purchase_requests")
          .update({
            status: "approved",
            download_token: downloadToken,
            download_url: downloadUrl,
            download_expires_at: downloadExpires.toISOString(),
            reviewed_at: new Date().toISOString(),
            telegram_message_id: messageId,
          })
          .eq("id", requestId);

        // Editar mensaje en Telegram para confirmar
        await editTelegramMessage(
          chatId,
          messageId,
          `✅ <b>APROBADO</b>\n\n` +
            `👤 <b>Cliente:</b> ${request.user_name}\n` +
            `📧 <b>Email:</b> ${request.user_email}\n` +
            `🛒 <b>Producto:</b> ${request.product_name}\n` +
            `💰 <b>Monto:</b> Bs. ${request.product_price}\n\n` +
            `🔗 <b>Link de descarga enviado al cliente</b>\n` +
            `⏰ Expira: ${downloadExpires.toLocaleString("es-BO")}`
        );

        await answerCallbackQuery(callbackQuery.id, "✅ Pago aprobado");
        console.log(`✅ Approved request ${requestId}`);
      } else if (action === "reject") {
        // Actualizar Supabase
        await supabase
          .from("purchase_requests")
          .update({
            status: "rejected",
            reviewed_at: new Date().toISOString(),
            telegram_message_id: messageId,
          })
          .eq("id", requestId);

        // Editar mensaje en Telegram
        await editTelegramMessage(
          chatId,
          messageId,
          `❌ <b>RECHAZADO</b>\n\n` +
            `👤 <b>Cliente:</b> ${request.user_name}\n` +
            `📧 <b>Email:</b> ${request.user_email}\n` +
            `🛒 <b>Producto:</b> ${request.product_name}\n` +
            `💰 <b>Monto:</b> Bs. ${request.product_price}\n\n` +
            `⚠️ No se recibieron fondos. Cliente notificado.`
        );

        await answerCallbackQuery(callbackQuery.id, "❌ Pago rechazado");
        console.log(`❌ Rejected request ${requestId}`);
      }

      return res.status(200).json({ ok: true });
    }

    // ================================================
    // CASO 2: Mensaje de texto normal (ignorar)
    // ================================================
    if (body.message) {
      console.log("📨 Message received, ignoring:", body.message.text);
      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res.status(200).json({ ok: true }); // Siempre 200 para Telegram
  }
}
