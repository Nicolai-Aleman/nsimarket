import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const { token } = req.query;

  if (!token) {
    return res.status(400).send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:50px">
        <h2>❌ Token inválido</h2>
        <p>El enlace de descarga no es válido.</p>
      </body></html>
    `);
  }

  try {
    // Buscar la solicitud por token
    const { data: request, error } = await supabase
      .from("purchase_requests")
      .select("*")
      .eq("download_token", token)
      .single();

    if (error || !request) {
      return res.status(404).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:50px">
          <h2>❌ Enlace no encontrado</h2>
          <p>Este enlace de descarga no existe o ya fue usado.</p>
        </body></html>
      `);
    }

    // Verificar que fue aprobado
    if (request.status !== "approved") {
      return res.status(403).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:50px">
          <h2>⏳ Pago pendiente de confirmación</h2>
          <p>Tu pago aún no ha sido confirmado. Te notificaremos cuando esté listo.</p>
          <p>Si ya realizaste el pago, por favor espera unos minutos.</p>
        </body></html>
      `);
    }

    // Verificar que no haya expirado
    if (request.download_expires_at && new Date() > new Date(request.download_expires_at)) {
      return res.status(410).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:50px">
          <h2>⏰ Enlace expirado</h2>
          <p>Este enlace de descarga ha expirado (válido por 48 horas).</p>
          <p>Contacta a soporte para obtener uno nuevo: <a href="mailto:soporte@nsimarket.com">soporte@nsimarket.com</a></p>
        </body></html>
      `);
    }

    // Buscar el producto para obtener el file_url
    let fileUrl = null;
    if (request.product_id) {
      const { data: product } = await supabase
        .from("products")
        .select("file_url, name")
        .eq("id", request.product_id)
        .single();

      if (product) fileUrl = product.file_url;
    }

    if (!fileUrl) {
      // Si no hay file_url en el producto, mostrar página de éxito con instrucciones
      return res.status(200).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:50px;max-width:600px;margin:0 auto">
          <h2>✅ Pago confirmado</h2>
          <h3>Hola ${request.user_name}!</h3>
          <p>Tu compra de <strong>${request.product_name}</strong> ha sido confirmada.</p>
          <p>Recibirás el archivo en tu correo <strong>${request.user_email}</strong> en los próximos minutos.</p>
          <br>
          <p style="color:#666;font-size:14px">Si tienes problemas, contacta a <a href="mailto:soporte@nsimarket.com">soporte@nsimarket.com</a></p>
        </body></html>
      `);
    }

    // Registrar la descarga
    await supabase.from("downloads").insert({
      product_id: request.product_id,
      download_type: "purchased",
    });

    // Redirigir al archivo
    return res.redirect(302, fileUrl);

  } catch (err) {
    console.error("❌ Descargar error:", err);
    return res.status(500).send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:50px">
        <h2>❌ Error interno</h2>
        <p>Ocurrió un error. Por favor intenta nuevamente o contacta soporte.</p>
      </body></html>
    `);
  }
}
