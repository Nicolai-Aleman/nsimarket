# Integración con Google Sheets - Formulario de Contacto

## Tu Google Sheet de contactos
URL: https://docs.google.com/spreadsheets/d/1jW0iBVpusZtWyKmdum2yzGJlrigWF7lYplhrVcGnz8g/edit?gid=0#gid=0

---

## Paso 1: Preparar el Google Sheet

1. Abre tu Google Sheet
2. En la primera fila (encabezados), asegúrate de tener estas columnas:
   - A1: `Fecha`
   - B1: `Nombre`
   - C1: `Email`
   - D1: `Asunto`
   - E1: `Mensaje`

---

## Paso 2: Crear el Apps Script

1. En tu Google Sheet, ve a **Extensiones > Apps Script**
2. Borra todo el código que aparece por defecto
3. Copia y pega el siguiente código:

```javascript
/**
 * No Somos Ignorantes - Contact Form Handler
 * Este script recibe datos del formulario de contacto y los guarda en Google Sheets
 */

// Configuración
const SHEET_NAME = 'Hoja 1'; // Nombre de tu hoja (cámbialo si es diferente)

/**
 * Maneja las solicitudes POST del formulario
 */
function doPost(e) {
  try {
    // Obtener los datos del formulario
    const data = JSON.parse(e.postData.contents);

    // Abrir la hoja de cálculo activa
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();

    // Agregar nueva fila con los datos
    sheet.appendRow([
      data.fecha || new Date().toLocaleString('es-BO'),
      data.nombre || '',
      data.email || '',
      data.asunto || '',
      data.mensaje || ''
    ]);

    // Enviar notificación por email (opcional)
    sendNotificationEmail(data);

    // Respuesta exitosa
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Datos guardados correctamente' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Respuesta de error
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Maneja las solicitudes GET (para pruebas)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'API de No Somos Ignorantes funcionando correctamente',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Envía notificación por email cuando llega un nuevo mensaje
 */
function sendNotificationEmail(data) {
  try {
    const emailTo = 'nosomosignorantes@gmail.com'; // Tu email
    const subject = `Nuevo contacto: ${data.asunto}`;
    const body = `
¡Nuevo mensaje desde tu página web!

Fecha: ${data.fecha}
Nombre: ${data.nombre}
Email: ${data.email}
Asunto: ${data.asunto}

Mensaje:
${data.mensaje}

---
No Somos Ignorantes - Sistema automático
    `;

    MailApp.sendEmail(emailTo, subject, body);
  } catch (error) {
    console.log('Error enviando email: ' + error);
  }
}

/**
 * Función de prueba - ejecutar manualmente para verificar
 */
function testDoPost() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        fecha: new Date().toLocaleString('es-BO'),
        nombre: 'Usuario de Prueba',
        email: 'test@example.com',
        asunto: 'Consulta sobre productos',
        mensaje: 'Este es un mensaje de prueba desde el sistema.'
      })
    }
  };

  const result = doPost(testData);
  console.log(result.getContent());
}
```

---

## Paso 3: Desplegar como Web App

1. Guarda el archivo (Ctrl+S o Cmd+S)
2. Haz clic en **Desplegar > Nuevo despliegue**
3. Configura:
   - **Tipo**: Selecciona "Aplicación web"
   - **Descripción**: "Formulario de contacto NSI"
   - **Ejecutar como**: "Yo mismo" (tu cuenta)
   - **Quién tiene acceso**: "Cualquiera" (importante para que funcione desde la web)
4. Haz clic en **Desplegar**
5. **Copia la URL del despliegue** - se verá algo así:
   ```
   https://script.google.com/macros/s/AKfycbx...muy-largo.../exec
   ```

---

## Paso 4: Actualizar tu página web

1. Abre el archivo `js/products.js`
2. Busca esta línea (cerca de la línea 798):
   ```javascript
   const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
   ```
3. Reemplaza `YOUR_DEPLOYMENT_ID` con tu URL completa de despliegue

---

## Paso 5: Probar

1. Ve a tu página web
2. Llena el formulario de contacto y envía
3. Revisa tu Google Sheet - debería aparecer una nueva fila
4. Revisa tu email - deberías recibir una notificación

---

## Solución de problemas

### El formulario no envía datos
- Verifica que la URL esté correcta en `products.js`
- Asegúrate de que el despliegue tenga acceso "Cualquiera"
- Revisa la consola del navegador (F12) para ver errores

### No recibo emails
- Verifica que el email en `sendNotificationEmail` sea correcto
- Google tiene límites de envío (100 emails/día en cuentas gratuitas)

### Los datos no aparecen en el Sheet
- Verifica el nombre de la hoja (`SHEET_NAME`)
- Ejecuta `testDoPost()` manualmente para probar

---

## Actualizar el despliegue

Si cambias el código:
1. Guarda los cambios
2. Ve a **Desplegar > Gestionar despliegues**
3. Haz clic en el ícono de lápiz (editar)
4. Selecciona **Nueva versión**
5. Haz clic en **Desplegar**

La URL se mantiene igual, no necesitas cambiarla en tu web.
