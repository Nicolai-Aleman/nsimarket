-- ============================================
-- NO SOMOS IGNORANTES - SEED DATA
-- Initial products and configuration
-- ============================================
-- Run this last to populate your database

-- ============================================
-- PRODUCTS: Personal Finance Templates
-- ============================================
-- These are the Excel templates you sell for personal finances

INSERT INTO public.products (
    name,
    slug,
    description,
    short_description,
    category,
    subcategory,
    tags,
    price_bolivianos,
    price_usd,
    original_price_bolivianos,
    is_free,
    product_type,
    file_format,
    related_topics,
    is_active,
    is_featured,
    display_order
) VALUES
-- FINANZAS PERSONALES
(
    'Bola de Nieve - Elimina tus Deudas',
    'bola-de-nieve',
    'Plantilla Excel con el método Bola de Nieve para eliminar todas tus deudas de forma sistemática. Incluye calculadora de pagos, visualización de progreso, y plan personalizado para liberarte de deudas.',
    'Elimina tus deudas con el método Bola de Nieve',
    'personal',
    'deudas',
    ARRAY['deudas', 'bola de nieve', 'finanzas personales', 'presupuesto'],
    49.00,
    7.00,
    69.00,
    FALSE,
    'template',
    'xlsx',
    ARRAY['pagar deudas', 'método bola de nieve', 'libertad financiera'],
    TRUE,
    TRUE,
    1
),
(
    'Avalancha - Ahorra en Intereses',
    'avalancha',
    'Plantilla Excel con el método Avalancha para pagar deudas ahorrando el máximo en intereses. Prioriza las deudas con mayor tasa de interés para minimizar lo que pagas al banco.',
    'Paga menos intereses con el método Avalancha',
    'personal',
    'deudas',
    ARRAY['deudas', 'avalancha', 'intereses', 'ahorro'],
    49.00,
    7.00,
    69.00,
    FALSE,
    'template',
    'xlsx',
    ARRAY['reducir intereses', 'pagar deudas rápido', 'método avalancha'],
    TRUE,
    FALSE,
    2
),
(
    'Presupuesto Personal Completo',
    'presupuesto-personal',
    'El presupuesto más completo para controlar todos tus gastos e ingresos. Categorización automática, gráficos visuales, y seguimiento mensual de tu situación financiera.',
    'Controla cada boliviano que entra y sale',
    'personal',
    'presupuesto',
    ARRAY['presupuesto', 'gastos', 'ingresos', 'control financiero'],
    59.00,
    8.50,
    79.00,
    FALSE,
    'template',
    'xlsx',
    ARRAY['controlar gastos', 'presupuesto familiar', 'organizar finanzas'],
    TRUE,
    TRUE,
    3
),
(
    'Fondo de Emergencia',
    'fondo-emergencia',
    'Calcula cuánto necesitas para tu fondo de emergencia y crea un plan para alcanzarlo. Incluye calculadora de gastos esenciales y seguimiento de ahorro.',
    'Protege tu futuro con un fondo de emergencia',
    'personal',
    'ahorro',
    ARRAY['fondo de emergencia', 'ahorro', 'seguridad financiera'],
    39.00,
    5.50,
    NULL,
    FALSE,
    'template',
    'xlsx',
    ARRAY['ahorrar dinero', 'emergencias financieras', 'colchón financiero'],
    TRUE,
    FALSE,
    4
),
(
    'Calculadora de Metas de Ahorro',
    'metas-ahorro',
    'Define tus metas financieras y calcula exactamente cuánto debes ahorrar cada mes para alcanzarlas. Perfecto para viajes, compras importantes, o cualquier objetivo.',
    'Alcanza cualquier meta financiera',
    'personal',
    'ahorro',
    ARRAY['metas', 'ahorro', 'planificación', 'objetivos'],
    35.00,
    5.00,
    NULL,
    FALSE,
    'template',
    'xlsx',
    ARRAY['metas financieras', 'planificar ahorro', 'alcanzar objetivos'],
    TRUE,
    FALSE,
    5
),
(
    'Mi Primer Presupuesto - GRATIS',
    'primer-presupuesto',
    'Tu primera plantilla para comenzar a controlar tus finanzas. Simple, fácil de usar, perfecta para principiantes. ¡100% gratis!',
    'Comienza a controlar tus finanzas gratis',
    'personal',
    'presupuesto',
    ARRAY['gratis', 'principiante', 'presupuesto básico'],
    0,
    0,
    NULL,
    TRUE,
    'template',
    'xlsx',
    ARRAY['comenzar finanzas', 'presupuesto simple', 'primer paso'],
    TRUE,
    TRUE,
    0
),

-- EMPRENDEDOR
(
    'Flujo de Caja para Emprendedores',
    'flujo-de-caja',
    'Controla el flujo de efectivo de tu negocio. Proyecciones a 12 meses, alertas de liquidez, y análisis de tendencias. Esencial para cualquier emprendedor.',
    'Nunca te quedes sin efectivo en tu negocio',
    'emprendedor',
    'flujo-caja',
    ARRAY['flujo de caja', 'emprendimiento', 'liquidez', 'negocio'],
    89.00,
    12.50,
    119.00,
    FALSE,
    'template',
    'xlsx',
    ARRAY['flujo de efectivo', 'proyecciones', 'liquidez empresarial'],
    TRUE,
    TRUE,
    10
),
(
    'Control de Inventario',
    'control-inventario',
    'Gestiona tu inventario como un profesional. Control de stock, alertas de reorden, valorización de inventario, y reportes automáticos.',
    'Gestiona tu inventario sin complicaciones',
    'emprendedor',
    'inventario',
    ARRAY['inventario', 'stock', 'control', 'negocio'],
    79.00,
    11.00,
    99.00,
    FALSE,
    'template',
    'xlsx',
    ARRAY['gestión de inventario', 'control de stock', 'productos'],
    TRUE,
    FALSE,
    11
),
(
    'Cotizador Profesional',
    'cotizador',
    'Genera cotizaciones profesionales en segundos. Incluye base de datos de productos, cálculo automático de precios, y formato listo para enviar al cliente.',
    'Cotiza como un profesional',
    'emprendedor',
    'ventas',
    ARRAY['cotizaciones', 'ventas', 'clientes', 'precios'],
    69.00,
    10.00,
    89.00,
    FALSE,
    'template',
    'xlsx',
    ARRAY['hacer cotizaciones', 'vender más', 'precio de venta'],
    TRUE,
    FALSE,
    12
),
(
    'Punto de Equilibrio',
    'punto-equilibrio',
    'Calcula exactamente cuánto debes vender para no perder dinero. Análisis de costos fijos y variables, proyección de ganancias, y escenarios.',
    'Sabe cuánto debes vender para ganar',
    'emprendedor',
    'analisis',
    ARRAY['punto de equilibrio', 'costos', 'ganancias', 'análisis'],
    59.00,
    8.50,
    NULL,
    FALSE,
    'template',
    'xlsx',
    ARRAY['calcular punto equilibrio', 'analizar negocio', 'costos fijos'],
    TRUE,
    TRUE,
    13
),
(
    'Registro de Ventas Diarias',
    'registro-ventas',
    'Registra cada venta de tu negocio y obtén reportes automáticos. Ventas por día, semana, mes, productos más vendidos, y análisis de tendencias.',
    'Registra y analiza todas tus ventas',
    'emprendedor',
    'ventas',
    ARRAY['ventas', 'registro', 'reporte', 'análisis'],
    49.00,
    7.00,
    NULL,
    FALSE,
    'template',
    'xlsx',
    ARRAY['registrar ventas', 'control de ventas', 'reportes'],
    TRUE,
    FALSE,
    14
),

-- PACKS
(
    'Pack Finanzas Personales Completo',
    'pack-finanzas-personales',
    'Todo lo que necesitas para dominar tus finanzas personales: Presupuesto, Bola de Nieve, Avalancha, Fondo de Emergencia, Metas de Ahorro. 5 plantillas en 1 a precio especial.',
    '5 plantillas esenciales para tus finanzas',
    'pack',
    'finanzas-personales',
    ARRAY['pack', 'completo', 'finanzas personales', 'ahorro'],
    149.00,
    21.00,
    231.00,
    FALSE,
    'pack',
    'xlsx',
    ARRAY['finanzas completas', 'pack ahorro', 'todas las plantillas'],
    TRUE,
    TRUE,
    20
),
(
    'Pack Emprendedor Starter',
    'pack-emprendedor',
    'Las herramientas esenciales para arrancar tu negocio: Flujo de Caja, Punto de Equilibrio, Registro de Ventas, Cotizador. 4 plantillas para emprendedores.',
    '4 herramientas para tu negocio',
    'pack',
    'emprendimiento',
    ARRAY['pack', 'emprendedor', 'negocio', 'herramientas'],
    199.00,
    28.00,
    286.00,
    FALSE,
    'pack',
    'xlsx',
    ARRAY['emprender', 'negocio nuevo', 'herramientas emprendedor'],
    TRUE,
    TRUE,
    21
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_bolivianos = EXCLUDED.price_bolivianos,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ============================================
-- DISCOUNT CODES: Initial Promotions
-- ============================================

INSERT INTO public.discount_codes (
    code,
    description,
    discount_type,
    discount_value,
    max_discount,
    is_active,
    starts_at,
    expires_at,
    max_uses,
    max_uses_per_user,
    minimum_purchase
) VALUES
(
    'BIENVENIDO',
    'Descuento de bienvenida para nuevos usuarios',
    'percentage',
    15,
    50.00,
    TRUE,
    NOW(),
    NOW() + INTERVAL '1 year',
    1000,
    1,
    29.00
),
(
    'YOUTUBE10',
    'Descuento especial para suscriptores de YouTube',
    'percentage',
    10,
    NULL,
    TRUE,
    NOW(),
    NULL,
    NULL,
    3,
    NULL
),
(
    'PRIMERPACK',
    'Descuento en tu primer pack',
    'percentage',
    20,
    60.00,
    TRUE,
    NOW(),
    NULL,
    500,
    1,
    100.00
)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- SAMPLE EMAIL CAMPAIGNS
-- ============================================

INSERT INTO public.email_campaigns (
    name,
    slug,
    campaign_type,
    subject_line,
    preview_text,
    is_automated,
    trigger_event,
    delay_minutes,
    status
) VALUES
(
    'Bienvenida - Nuevo Usuario',
    'welcome-new-user',
    'welcome',
    '¡Bienvenido a No Somos Ignorantes! 🎉',
    'Tu viaje hacia la libertad financiera comienza aquí',
    TRUE,
    'user.registered',
    0,
    'active'
),
(
    'Gracias por tu Compra',
    'post-purchase-thanks',
    'post_purchase',
    '¡Gracias por tu compra! Aquí están tus archivos 📊',
    'Tu plantilla está lista para descargar',
    TRUE,
    'purchase.completed',
    5,
    'active'
),
(
    'Te Extrañamos',
    're-engagement-30days',
    're_engagement',
    'Hace tiempo que no te vemos por aquí 👋',
    'Tenemos nuevas plantillas que te pueden interesar',
    TRUE,
    'user.inactive_30days',
    0,
    'active'
),
(
    'Upgrade a Pro',
    'upsell-free-to-pro',
    'upsell',
    'Lleva tus finanzas al siguiente nivel 🚀',
    'Descubre lo que te estás perdiendo',
    TRUE,
    'user.free_download',
    1440, -- 24 hours after free download
    'active'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SAMPLE DATA FOR TESTING (Optional)
-- ============================================
-- Uncomment these if you want sample data for development

/*
-- Sample admin user (you'll need to create this in Supabase Auth first)
-- Then update the auth_user_id with the actual ID

INSERT INTO public.users (
    email,
    full_name,
    account_type,
    is_email_verified,
    acquisition_source
) VALUES (
    'admin@nosomosignorantes.com',
    'Administrador',
    'admin',
    TRUE,
    'organic'
);

-- Sample regular user
INSERT INTO public.users (
    email,
    full_name,
    account_type,
    acquisition_source,
    city
) VALUES (
    'usuario.prueba@gmail.com',
    'Usuario de Prueba',
    'free',
    'youtube',
    'La Paz'
);
*/

COMMENT ON TABLE public.products IS 'All digital products - templates, packs, memberships';
