# Guía de Publicación - No Somos Ignorantes

## Resumen del Proyecto

Tu página web está lista para publicarse. Incluye:
- Landing page profesional con diseño moderno
- Sistema de marketplace para productos digitales
- Carrito de compras funcional
- Formularios de contacto y newsletter
- Animaciones y efectos visuales 2025/2026
- Diseño responsive (móvil, tablet, desktop)

---

## OPCIÓN 1: GitHub Pages (GRATIS - Recomendado)

### Paso 1: Crear cuenta en GitHub
1. Ve a https://github.com
2. Clic en "Sign up" (Registrarse)
3. Completa el registro con tu email

### Paso 2: Crear repositorio
1. Clic en el botón "+" arriba a la derecha
2. Selecciona "New repository"
3. Nombre: `nosomosignorantes` (o el que prefieras)
4. Marca "Public"
5. Clic en "Create repository"

### Paso 3: Subir archivos
**Opción A - Desde la web:**
1. En tu repositorio, clic en "uploading an existing file"
2. Arrastra toda la carpeta "Página web"
3. Clic en "Commit changes"

**Opción B - Con Git (más profesional):**
```bash
# En la terminal/CMD, navega a tu carpeta
cd "C:\Users\nicol\Desktop\No Somos Ignorantes\Página web"

# Inicializa Git
git init

# Agrega todos los archivos
git add .

# Crea el primer commit
git commit -m "Lanzamiento inicial de No Somos Ignorantes"

# Conecta con GitHub (reemplaza TU-USUARIO)
git remote add origin https://github.com/TU-USUARIO/nosomosignorantes.git

# Sube los archivos
git push -u origin main
```

### Paso 4: Activar GitHub Pages
1. Ve a tu repositorio en GitHub
2. Clic en "Settings" (Configuración)
3. En el menú lateral, busca "Pages"
4. En "Source", selecciona "main" y "/root"
5. Clic en "Save"

### Paso 5: Tu sitio está online
- URL: `https://TU-USUARIO.github.io/nosomosignorantes`
- Espera 2-5 minutos para que se active

### Dominio personalizado (Opcional)
Si compras un dominio (ej: nosomosignorantes.com ~$12/año):
1. En Settings > Pages > Custom domain
2. Escribe tu dominio
3. En tu proveedor de dominio, configura:
   - CNAME: `TU-USUARIO.github.io`

---

## OPCIÓN 2: Netlify (GRATIS - Más fácil)

### Paso 1: Registro
1. Ve a https://www.netlify.com
2. Clic en "Sign up"
3. Puedes usar tu cuenta de GitHub

### Paso 2: Desplegar
1. Clic en "Add new site" > "Deploy manually"
2. Arrastra tu carpeta "Página web" completa
3. ¡Listo! Tendrás una URL como: `random-name.netlify.app`

### Paso 3: Personalizar URL
1. Site settings > Domain management
2. Clic en "Options" > "Edit site name"
3. Cambia a: `nosomosignorantes.netlify.app`

---

## OPCIÓN 3: Vercel (GRATIS)

1. Ve a https://vercel.com
2. Registrate con GitHub
3. "New Project" > "Import" desde GitHub
4. Selecciona tu repositorio
5. Deploy automático

---

## OPCIÓN 4: Cloudflare Pages (GRATIS)

1. Ve a https://pages.cloudflare.com
2. Conecta tu GitHub
3. Selecciona el repositorio
4. Framework: None
5. Deploy

---

## Comparación de Opciones

| Característica | GitHub Pages | Netlify | Vercel | Cloudflare |
|---------------|--------------|---------|--------|------------|
| Costo | GRATIS | GRATIS | GRATIS | GRATIS |
| HTTPS | ✅ | ✅ | ✅ | ✅ |
| Dominio propio | ✅ | ✅ | ✅ | ✅ |
| Formularios | ❌ | ✅ | ❌ | ❌ |
| Velocidad | Buena | Excelente | Excelente | Excelente |
| Facilidad | Media | Fácil | Fácil | Media |

**Mi recomendación:** Netlify para empezar (más fácil) o GitHub Pages si quieres aprender Git.

---

## COSTOS DE MANTENIMIENTO

### Opción 100% Gratis
- Hosting: $0 (GitHub Pages, Netlify, Vercel)
- SSL/HTTPS: $0 (incluido)
- Límites: ~100GB de ancho de banda/mes (más que suficiente)

### Opcional (si quieres profesionalizar)
| Servicio | Costo | Necesidad |
|----------|-------|-----------|
| Dominio .com | ~$12/año | Recomendado |
| Dominio .bo | ~$25/año | Para Bolivia |
| Email profesional | $6/mes (Google) | Opcional |
| Formularios | $0-19/mes | Netlify gratis incluye 100/mes |

---

## Integración de Pagos (Bolivia)

### Opción 1: QR Bolivia (Simple)
Para pagos manuales con QR:
1. Genera tu QR desde tu banco
2. Agrégalo en la sección de checkout
3. El cliente te envía comprobante por WhatsApp
4. Tú envías acceso al Google Sheet manualmente

### Opción 2: Pasarelas de pago
- **Tigo Money API**: Contactar a Tigo Business
- **Pagos Net**: https://www.pagosnet.com.bo (requiere empresa)
- **Khipu**: https://khipu.com (soporta Bolivia)

### Flujo recomendado para empezar:
1. Cliente compra → ve instrucciones de pago QR
2. Cliente paga y envía comprobante por WhatsApp
3. Verificas el pago
4. Compartes acceso al Google Sheet por email

Para automatizar esto más adelante, podemos integrar:
- Google Apps Script (gratis) para dar acceso automático
- Webhook de WhatsApp Business

---

## Próximos Pasos

1. **Ahora:**
   - [ ] Crea cuenta en GitHub o Netlify
   - [ ] Sube los archivos
   - [ ] Activa el sitio

2. **Esta semana:**
   - [ ] Personaliza los textos con tu información real
   - [ ] Agrega tu foto de perfil en `assets/profile.jpg`
   - [ ] Configura tu QR de pagos
   - [ ] Crea los Google Sheets de tus productos

3. **Próximamente:**
   - [ ] Compra un dominio profesional
   - [ ] Configura Google Analytics
   - [ ] Integra formularios con tu email
   - [ ] Automatiza la entrega de productos

---

## Estructura de Archivos

```
Página web/
├── index.html          # Página principal
├── css/
│   ├── styles.css      # Estilos principales
│   └── animations.css  # Animaciones
├── js/
│   ├── app.js          # Lógica principal
│   ├── cart.js         # Sistema de carrito
│   └── animations.js   # Animaciones avanzadas
├── assets/             # Crear esta carpeta
│   ├── profile.jpg     # Tu foto de perfil
│   ├── favicon.png     # Icono del sitio
│   └── og-image.jpg    # Imagen para redes sociales
└── GUIA-PUBLICACION.md # Este archivo
```

---

## Soporte

Si tienes problemas:
1. Revisa que todos los archivos estén en la carpeta correcta
2. Verifica que `index.html` esté en la raíz
3. Los nombres de archivo deben coincidir exactamente

¡Tu sitio está listo para conquistar el mundo financiero! 🚀💰
