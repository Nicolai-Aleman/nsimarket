export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const secretHeader = req.headers["x-telegram-bot-api-secret-token"];
  if (!secretHeader || secretHeader !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    console.log("Unauthorized webhook call. Header:", secretHeader);
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  console.log("✅ Telegram webhook received:", JSON.stringify(req.body));

  return res.status(200).json({ ok: true });
}
