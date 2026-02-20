export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  // 1) Verify Telegram secret header
  const secretHeader = req.headers["x-telegram-bot-api-secret-token"];
  if (!secretHeader || secretHeader !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  // 2) Basic health response
  // We will add full logic later (approve/reject, supabase updates, etc.)
  return res.status(200).json({ ok: true });
}
