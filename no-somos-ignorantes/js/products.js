/**
 * NO SOMOS IGNORANTES - Products System
 * Product data, modals, and detailed views
 */

// ==========================================
// PRODUCT DATABASE - Complete Details
// ==========================================
const PRODUCTS_DATA = {
    // ========== PRODUCTOS PERSONALES ==========
    'comparador-tasas': {
        id: 'comparador-tasas',
        title: 'Comparador de Crédito Hipotecario',
        shortTitle: 'Comparador Hipotecario',
        category: 'personal',
        categoryLabel: 'Finanzas Personales',
        price: 99,
        icon: 'fa-home',
        badge: 'popular',
        description: 'Compara las tasas de interés de diferentes bancos bolivianos y encuentra el crédito hipotecario ideal para tu casa o departamento.',
        problem: '¿Sabías que elegir mal tu crédito hipotecario puede costarte decenas de miles de bolivianos extra en intereses?',
        solution: 'Esta plantilla te permite comparar lado a lado las ofertas de diferentes bancos, calculando el costo total real de cada opción para que tomes la mejor decisión.',
        features: [
            'Compara hasta 5 bancos simultáneamente',
            'Cálculo automático de cuotas mensuales',
            'Proyección de intereses totales a pagar',
            'Gráficos comparativos visuales',
            'Incluye bancos bolivianos (BNB, Mercantil, Bisa, etc.)',
            'Simulador de pagos anticipados'
        ],
        includes: [
            'Plantilla Google Sheets lista para usar',
            'Video tutorial de 10 minutos',
            'Guía PDF de términos hipotecarios',
            'Actualizaciones gratuitas'
        ],
        idealFor: 'Personas que están por comprar su primera vivienda o refinanciar su crédito actual.'
    },

    'bola-nieve': {
        id: 'bola-nieve',
        title: 'Bola de Nieve Automatizada',
        shortTitle: 'Bola de Nieve',
        category: 'personal',
        categoryLabel: 'Finanzas Personales',
        price: 99,
        icon: 'fa-snowflake',
        badge: 'featured',
        description: 'El método probado para eliminar deudas de forma estratégica. Visualiza tu camino hacia la libertad financiera con cálculos automáticos.',
        problem: '¿Tienes varias deudas y no sabes por cuál empezar? ¿Te sientes abrumado viendo que no avanzas?',
        solution: 'La estrategia Bola de Nieve te indica exactamente qué deuda pagar primero, creando un efecto de motivación que te mantiene enfocado hasta eliminarlas todas.',
        features: [
            'Organiza hasta 15 deudas diferentes',
            'Cálculo automático del orden óptimo de pago',
            'Fecha estimada de libertad financiera',
            'Gráficos de progreso motivacionales',
            'Seguimiento mensual de avance',
            'Alertas de hitos alcanzados'
        ],
        includes: [
            'Plantilla Google Sheets automatizada',
            'Video explicativo del método',
            'Checklist de implementación',
            'Soporte por WhatsApp'
        ],
        idealFor: 'Personas con múltiples deudas (tarjetas, préstamos, créditos) que quieren un plan claro.'
    },

    'amortizacion': {
        id: 'amortizacion',
        title: 'Amortizador de Deudas Pro',
        shortTitle: 'Amortizador Pro',
        category: 'personal',
        categoryLabel: 'Finanzas Personales',
        price: 99,
        icon: 'fa-calculator',
        badge: null,
        description: 'Calcula exactamente cuánto ahorras haciendo pagos anticipados a capital y reduce años de tu deuda.',
        problem: '¿Quieres pagar tu deuda más rápido pero no sabes cuánto te conviene abonar a capital?',
        solution: 'Esta calculadora te muestra en números exactos cuánto reduces tu plazo y cuánto ahorras en intereses con cada pago extra que hagas.',
        features: [
            'Simulador de pagos extraordinarios',
            'Comparador antes/después de amortizar',
            'Tabla de amortización detallada',
            'Cálculo de ahorro en intereses',
            'Múltiples escenarios de pago',
            'Calendario de pagos óptimos'
        ],
        includes: [
            'Plantilla Google Sheets profesional',
            'Guía de estrategias de amortización',
            'Ejemplos prácticos incluidos'
        ],
        idealFor: 'Personas con préstamos a largo plazo que quieren reducir el tiempo y costo total.'
    },

    'matriz-riesgos': {
        id: 'matriz-riesgos',
        title: 'Analizador de Score Crediticio',
        shortTitle: 'Analizador Score',
        category: 'personal',
        categoryLabel: 'Finanzas Personales',
        price: 150,
        icon: 'fa-shield-alt',
        badge: 'new',
        description: 'Evalúa cómo cada nueva deuda impactará tu historial crediticio antes de tomarla.',
        problem: '¿Estás pensando en tomar un nuevo crédito pero no sabes cómo afectará tu score?',
        solution: 'Esta matriz te ayuda a evaluar el riesgo de cada deuda potencial, considerando tu situación actual y proyectando el impacto en tu capacidad de endeudamiento futuro.',
        features: [
            'Evaluación de capacidad de endeudamiento',
            'Matriz de riesgo crediticio visual',
            'Ratio deuda/ingreso automático',
            'Proyección de impacto en score',
            'Recomendaciones personalizadas',
            'Historial de evaluaciones previas'
        ],
        includes: [
            'Plantilla Google Sheets avanzada',
            'Guía de interpretación de resultados',
            'Video tutorial completo',
            'Actualización de normativas bancarias'
        ],
        idealFor: 'Personas que quieren tomar decisiones informadas antes de endeudarse.'
    },

    'presupuesto': {
        id: 'presupuesto',
        title: 'Presupuesto Mensual 50/30/20',
        shortTitle: 'Presupuesto 50/30/20',
        category: 'personal gratis',
        categoryLabel: 'Finanzas Personales',
        price: 0,
        icon: 'fa-wallet',
        badge: 'free',
        description: 'La regla más simple y probada para organizar tu dinero. Divide automáticamente tus ingresos.',
        problem: '¿Llegas a fin de mes sin saber en qué se fue tu dinero?',
        solution: 'La regla 50/30/20 divide tus ingresos automáticamente: 50% necesidades, 30% deseos, 20% ahorro. Simple pero efectivo.',
        features: [
            'División automática de ingresos',
            'Categorización de gastos',
            'Dashboard visual mensual',
            'Alertas de sobrepresupuesto',
            'Historial de meses anteriores',
            'Totalmente gratuito'
        ],
        includes: [
            'Plantilla Google Sheets completa',
            'Video de configuración inicial',
            'Sin costo, sin trampa'
        ],
        idealFor: 'Cualquier persona que quiera empezar a organizar sus finanzas hoy mismo.'
    },

    // ========== PRODUCTOS EMPRENDEDORES ==========
    'tracking-ventas': {
        id: 'tracking-ventas',
        title: 'Sistema de Ventas con Código Único',
        shortTitle: 'Tracking Ventas',
        category: 'emprendedor',
        categoryLabel: 'Emprendedores',
        price: 150,
        icon: 'fa-chart-bar',
        badge: 'popular',
        description: 'Rastrea cada venta con un código único por producto. El sistema profesional que tu negocio necesita.',
        problem: '¿No tienes control de tus ventas? ¿No sabes qué productos se venden más ni cuándo?',
        solution: 'Este sistema genera códigos únicos para cada venta, permitiéndote rastrear todo: qué vendiste, cuándo, a quién y por cuánto.',
        features: [
            'Código único automático por venta',
            'Dashboard de métricas en tiempo real',
            'Top 10 productos más vendidos',
            'Análisis de ventas por período',
            'Registro de clientes',
            'Reportes exportables'
        ],
        includes: [
            'Plantilla Google Sheets profesional',
            'Video tutorial de configuración',
            'Guía de análisis de ventas',
            'Soporte técnico incluido'
        ],
        idealFor: 'Emprendedores que venden productos físicos o digitales y quieren profesionalizarse.'
    },

    'gastos-operativos': {
        id: 'gastos-operativos',
        title: 'Control de Gastos Operativos',
        shortTitle: 'Gastos Operativos',
        category: 'emprendedor',
        categoryLabel: 'Emprendedores',
        price: 50,
        icon: 'fa-building',
        badge: null,
        description: 'Organiza todos los gastos de operación de tu empresa en un solo lugar.',
        problem: '¿Tus gastos operativos están descontrolados? ¿No sabes exactamente cuánto te cuesta operar?',
        solution: 'Esta plantilla categoriza y controla todos tus gastos operativos: alquiler, servicios, sueldos, insumos, etc.',
        features: [
            'Categorización automática de gastos',
            'Comparativo mensual',
            'Alertas de gastos inusuales',
            'Proyección anual',
            'Gráficos de distribución',
            'Múltiples categorías predefinidas'
        ],
        includes: [
            'Plantilla Google Sheets',
            'Lista de categorías de gastos',
            'Guía de registro'
        ],
        idealFor: 'Emprendedores que quieren tener claridad sobre sus costos de operación.'
    },

    'costos-indirectos': {
        id: 'costos-indirectos',
        title: 'Calculadora de Costos Indirectos',
        shortTitle: 'Costos Indirectos',
        category: 'emprendedor',
        categoryLabel: 'Emprendedores',
        price: 50,
        icon: 'fa-cogs',
        badge: null,
        description: 'Identifica y asigna correctamente los costos indirectos de producción a tus productos.',
        problem: '¿Estás incluyendo todos los costos en tu precio? ¿O estás perdiendo dinero sin saberlo?',
        solution: 'Esta calculadora te ayuda a identificar los costos ocultos (luz, agua, depreciación, etc.) y asignarlos correctamente a cada producto.',
        features: [
            'Identificación de costos ocultos',
            'Distribución por producto',
            'Cálculo de depreciación',
            'Prorrateo automático',
            'Impacto en precio de venta',
            'Análisis de rentabilidad real'
        ],
        includes: [
            'Plantilla Google Sheets',
            'Guía de costos indirectos',
            'Ejemplos de cálculo'
        ],
        idealFor: 'Productores y fabricantes que necesitan conocer su costo real.'
    },

    'costos-venta': {
        id: 'costos-venta',
        title: 'Gestor de Costos de Venta',
        shortTitle: 'Costos de Venta',
        category: 'emprendedor',
        categoryLabel: 'Emprendedores',
        price: 50,
        icon: 'fa-tags',
        badge: null,
        description: 'Calcula el costo real de vender cada producto incluyendo comisiones, envíos y más.',
        problem: '¿Sabes cuánto te cuesta realmente vender un producto, más allá del costo de producción?',
        solution: 'Esta plantilla calcula todos los costos asociados a la venta: comisiones de plataformas, envíos, empaques, etc.',
        features: [
            'Desglose completo de costos',
            'Comisiones de plataformas (FB, IG, ML)',
            'Costos de envío por zona',
            'Empaque y materiales',
            'Margen neto real',
            'Comparativo de canales'
        ],
        includes: [
            'Plantilla Google Sheets',
            'Lista de costos comunes',
            'Calculadora de envíos'
        ],
        idealFor: 'Vendedores online que usan múltiples canales de venta.'
    },

    'arpu': {
        id: 'arpu',
        title: 'Calculadora ARPU',
        shortTitle: 'ARPU Calculator',
        category: 'emprendedor',
        categoryLabel: 'Emprendedores',
        price: 70,
        icon: 'fa-user-dollar',
        badge: null,
        description: 'Mide el ingreso promedio por cliente y optimiza tu estrategia de precios.',
        problem: '¿Sabes cuánto te deja en promedio cada cliente? ¿Estás maximizando el valor de cada uno?',
        solution: 'El ARPU (Average Revenue Per User) es una métrica clave. Esta calculadora te muestra exactamente cuánto genera cada cliente.',
        features: [
            'Cálculo de ARPU mensual/anual',
            'Segmentación de clientes',
            'Análisis de ticket promedio',
            'Frecuencia de compra',
            'Valor de vida del cliente (LTV)',
            'Comparativo histórico'
        ],
        includes: [
            'Plantilla Google Sheets',
            'Guía de métricas de clientes',
            'Estrategias de incremento de ARPU'
        ],
        idealFor: 'Negocios que quieren aumentar los ingresos por cliente existente.'
    },

    'flujo-caja': {
        id: 'flujo-caja',
        title: 'Flujo de Caja Dual (Bs/$us)',
        shortTitle: 'Flujo de Caja',
        category: 'emprendedor',
        categoryLabel: 'Emprendedores',
        price: 99,
        icon: 'fa-money-bill-wave',
        badge: 'featured',
        description: 'Controla las entradas y salidas de tu negocio en bolivianos y dólares con conversión automática.',
        problem: '¿Manejas dinero en dos monedas y es un caos llevar el control?',
        solution: 'Esta plantilla maneja ambas monedas con tipo de cambio actualizable, dándote una visión clara de tu situación financiera.',
        features: [
            'Dual currency (Bs y $us)',
            'Tipo de cambio configurable',
            'Proyección a 12 meses',
            'Alertas de saldo bajo',
            'Categorías de ingresos/egresos',
            'Dashboard consolidado'
        ],
        includes: [
            'Plantilla Google Sheets avanzada',
            'Video tutorial de uso',
            'Guía de proyecciones'
        ],
        idealFor: 'Negocios que operan con bolivianos y dólares.'
    },

    'calc-precios': {
        id: 'calc-precios',
        title: 'Calculadora de Precio de Venta',
        shortTitle: 'Calculadora Precios',
        category: 'emprendedor',
        categoryLabel: 'Emprendedores',
        price: 99,
        icon: 'fa-percent',
        badge: null,
        description: 'Define tu precio ideal incluyendo margen de ganancia, impuestos bolivianos y todos los costos.',
        problem: '¿No estás seguro si tu precio es correcto? ¿Estás dejando dinero en la mesa o espantando clientes?',
        solution: 'Esta calculadora considera todos los factores: costos, margen deseado, impuestos (IVA, IT) y te da el precio óptimo.',
        features: [
            'Cálculo de precio con margen',
            'Inclusión de IVA e IT',
            'Múltiples escenarios de margen',
            'Comparador de precios',
            'Break-even automático',
            'Análisis de competencia'
        ],
        includes: [
            'Plantilla Google Sheets',
            'Guía de precios en Bolivia',
            'Calculadora de impuestos'
        ],
        idealFor: 'Emprendedores que quieren precios competitivos pero rentables.'
    },

    'estados-financieros': {
        id: 'estados-financieros',
        title: 'Estados Financieros Completos',
        shortTitle: 'Estados Financieros',
        category: 'emprendedor',
        categoryLabel: 'Emprendedores',
        price: 150,
        icon: 'fa-file-invoice-dollar',
        badge: 'new',
        description: 'Estado de Resultados y Flujo de Caja profesional para tu empresa, listo para presentar.',
        problem: '¿Necesitas estados financieros pero no tienes contador o es muy caro?',
        solution: 'Esta plantilla genera automáticamente tu Estado de Resultados y Flujo de Caja con formato profesional.',
        features: [
            'Estado de Resultados completo',
            'Flujo de Caja directo',
            'Formato profesional',
            'Análisis de rentabilidad',
            'Comparativo mensual',
            'Exportable a PDF'
        ],
        includes: [
            'Plantilla Google Sheets profesional',
            'Video de interpretación',
            'Guía de términos contables',
            'Plantilla de presentación'
        ],
        idealFor: 'Empresas que necesitan reportes financieros para inversionistas o bancos.'
    },

    // ========== PACKS ==========
    'pack-personal': {
        id: 'pack-personal',
        title: 'Pack Finanzas Personales',
        shortTitle: 'Pack Personal',
        category: 'pack',
        categoryLabel: 'Pack Especial',
        price: 300,
        originalPrice: 447,
        icon: 'fa-box-open',
        badge: 'pack',
        description: 'Las 4 herramientas esenciales para tomar control total de tus finanzas personales.',
        problem: '¿Quieres todas las herramientas para dominar tus finanzas pero no quieres pagar por separado?',
        solution: 'Este pack incluye las 4 herramientas de finanzas personales con un 33% de descuento.',
        features: [
            'Comparador de Crédito Hipotecario (Bs. 99)',
            'Bola de Nieve Automatizada (Bs. 99)',
            'Amortizador de Deudas Pro (Bs. 99)',
            'Analizador de Score Crediticio (Bs. 150)',
            '+ Presupuesto 50/30/20 GRATIS'
        ],
        includes: [
            '5 plantillas Google Sheets',
            'Todos los videos tutoriales',
            'Todas las guías PDF',
            'Soporte prioritario por WhatsApp',
            'Actualizaciones de por vida'
        ],
        idealFor: 'Personas que quieren transformar completamente su vida financiera.'
    },

    'pack-emprendedor': {
        id: 'pack-emprendedor',
        title: 'Pack Emprendedor Total',
        shortTitle: 'Pack Emprendedor',
        category: 'pack',
        categoryLabel: 'Pack Especial',
        price: 500,
        originalPrice: 718,
        icon: 'fa-briefcase',
        badge: 'pack',
        description: 'Todo lo que necesitas para profesionalizar la gestión financiera de tu negocio.',
        problem: '¿Quieres profesionalizar tu negocio pero no sabes por dónde empezar?',
        solution: 'Este pack incluye las 8 herramientas para emprendedores con un 30% de descuento.',
        features: [
            'Sistema de Ventas con Código Único (Bs. 150)',
            'Control de Gastos Operativos (Bs. 50)',
            'Calculadora de Costos Indirectos (Bs. 50)',
            'Gestor de Costos de Venta (Bs. 50)',
            'Calculadora ARPU (Bs. 70)',
            'Flujo de Caja Dual Bs/$us (Bs. 99)',
            'Calculadora de Precio de Venta (Bs. 99)',
            'Estados Financieros Completos (Bs. 150)'
        ],
        includes: [
            '8 plantillas Google Sheets profesionales',
            'Videos tutoriales completos',
            'Guías de implementación',
            'Soporte prioritario por WhatsApp',
            'Actualizaciones de por vida',
            'Sesión de onboarding de 30 minutos'
        ],
        idealFor: 'Emprendedores serios que quieren llevar su negocio al siguiente nivel.'
    },

    'pack-enterprise': {
        id: 'pack-enterprise',
        title: 'Pack Enterprise Valuation',
        shortTitle: 'Enterprise Pack',
        category: 'pack',
        categoryLabel: 'Pack Inversión',
        price: 49,
        originalPrice: 99,
        currency: 'USD',
        icon: 'fa-chart-line',
        badge: 'new',
        description: 'Herramientas profesionales de inversión y valuación de empresas en Google Sheets con datos en tiempo real.',
        problem: '¿Quieres analizar inversiones en acciones pero no tienes herramientas profesionales?',
        solution: 'Este pack incluye un Dashboard de Portafolio Markowitz con GOOGLEFINANCE y un modelo DCF de valuación de empresas, todo automatizado.',
        features: [
            'Portfolio Dashboard (Markowitz)',
            'Correlaciones Automatizadas entre Activos',
            'GOOGLEFINANCE en Tiempo Real',
            'DCF Valuation Model (Flujo de Caja Descontado)',
            'Análisis de Sensibilidad (WACC vs Growth)',
            'Comparación vs S&P 500, NASDAQ-100, Dow Jones',
            'Tasa libre de riesgo automatizada (US Treasury)',
            'Distribución de Retornos y Estadísticas'
        ],
        includes: [
            '2 plantillas Google Sheets profesionales',
            'Apps Script pre-configurado',
            'Datos en tiempo real con GOOGLEFINANCE',
            'Video tutorial de implementación',
            'Soporte por WhatsApp'
        ],
        idealFor: 'Inversores que quieren analizar acciones del mercado estadounidense con herramientas profesionales de valuación.'
    }
};

// ==========================================
// PRODUCT MODAL FUNCTIONS
// ==========================================
function openProductModal(productId) {
    const product = PRODUCTS_DATA[productId];
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }

    const modal = document.getElementById('product-modal');
    const modalContent = document.getElementById('product-modal-content');

    const isPack = product.category === 'pack';
    const isFree = product.price === 0;

    const featuresHTML = product.features.map(f =>
        `<li><i class="fas fa-check"></i> ${f}</li>`
    ).join('');

    const includesHTML = product.includes.map(i =>
        `<li><i class="fas fa-gift"></i> ${i}</li>`
    ).join('');

    const cur = product.currency === 'USD' ? '$' : 'Bs. ';
    const curSuffix = product.currency === 'USD' ? ' USD' : '';
    const priceHTML = isFree
        ? '<span class="modal-price free">Gratis</span>'
        : product.originalPrice
            ? `<span class="modal-price-original">${cur}${product.originalPrice}${curSuffix}</span><span class="modal-price">${cur}${product.price}${curSuffix}</span>`
            : `<span class="modal-price">${cur}${product.price}${curSuffix}</span>`;

    const content = `
        <button class="modal-close" onclick="closeProductModal()">
            <i class="fas fa-times"></i>
        </button>

        <div class="product-modal-header">
            <div class="product-modal-icon ${isFree ? 'icon-free' : ''} ${isPack ? 'icon-pack' : ''}">
                <i class="fas ${product.icon}"></i>
            </div>
            <div class="product-modal-title-section">
                <span class="product-modal-category">${product.categoryLabel}</span>
                <h2 class="product-modal-title">${product.title}</h2>
            </div>
        </div>

        <div class="product-modal-body">
            <div class="product-modal-description">
                <p>${product.description}</p>
            </div>

            ${product.problem ? `
            <div class="product-modal-problem">
                <h4><i class="fas fa-exclamation-circle"></i> El Problema</h4>
                <p>${product.problem}</p>
            </div>
            ` : ''}

            ${product.solution ? `
            <div class="product-modal-solution">
                <h4><i class="fas fa-lightbulb"></i> La Solución</h4>
                <p>${product.solution}</p>
            </div>
            ` : ''}

            <div class="product-modal-features">
                <h4><i class="fas fa-list-check"></i> ${isPack ? 'Incluye' : 'Características'}</h4>
                <ul>${featuresHTML}</ul>
            </div>

            <div class="product-modal-includes">
                <h4><i class="fas fa-box"></i> Con tu compra recibes</h4>
                <ul>${includesHTML}</ul>
            </div>

            ${product.idealFor ? `
            <div class="product-modal-ideal">
                <h4><i class="fas fa-user-check"></i> Ideal para</h4>
                <p>${product.idealFor}</p>
            </div>
            ` : ''}
        </div>

        <div class="product-modal-footer">
            <div class="product-modal-pricing">
                ${priceHTML}
            </div>
            <div class="product-modal-actions">
                <button class="btn btn-primary btn-lg" onclick="closeProductModal(); addToCart('${productId}')">
                    <i class="fas ${isFree ? 'fa-download' : 'fa-shopping-cart'}"></i>
                    <span>${isFree ? 'Descargar Gratis' : 'Agregar al Carrito'}</span>
                </button>
            </div>
        </div>

        ${!isPack && !isFree ? `
        <div class="product-modal-pack-hint">
            <p><i class="fas fa-info-circle"></i> Este producto está incluido en el
            <a href="#" onclick="closeProductModal(); openProductModal('${product.category === 'personal' ? 'pack-personal' : 'pack-emprendedor'}')">
                Pack ${product.category === 'personal' ? 'Finanzas Personales' : 'Emprendedor Total'}
            </a> con 30% de descuento</p>
        </div>
        ` : ''}
    `;

    modalContent.innerHTML = content;
    modal.classList.add('open');
    document.body.classList.add('no-scroll');
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('open');
    document.body.classList.remove('no-scroll');
}

// Make functions global
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;

// ==========================================
// ADD MODAL STYLES DYNAMICALLY
// ==========================================
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    .product-modal-header {
        display: flex;
        align-items: flex-start;
        gap: 1.5rem;
        padding: 2rem 2rem 0;
        background: linear-gradient(135deg, var(--primary-50) 0%, white 100%);
        border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    }

    .product-modal-icon {
        flex-shrink: 0;
        width: 72px;
        height: 72px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--gradient-primary);
        border-radius: var(--radius-lg);
        color: white;
        font-size: 1.75rem;
    }

    .product-modal-icon.icon-free {
        background: linear-gradient(135deg, #10b981, #059669);
    }

    .product-modal-icon.icon-pack {
        background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    }

    .product-modal-category {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--primary-600);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.5rem;
    }

    .product-modal-title {
        font-family: var(--font-display);
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--foreground);
        line-height: 1.3;
    }

    .product-modal-body {
        padding: 2rem;
    }

    .product-modal-description {
        font-size: 1.0625rem;
        color: var(--neutral-700);
        line-height: 1.7;
        margin-bottom: 1.5rem;
    }

    .product-modal-problem,
    .product-modal-solution {
        padding: 1.25rem;
        border-radius: var(--radius-md);
        margin-bottom: 1.5rem;
    }

    .product-modal-problem {
        background: #fef2f2;
        border-left: 4px solid #ef4444;
    }

    .product-modal-problem h4 {
        color: #dc2626;
    }

    .product-modal-solution {
        background: #f0fdf4;
        border-left: 4px solid #10b981;
    }

    .product-modal-solution h4 {
        color: #059669;
    }

    .product-modal-body h4 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 0.75rem;
    }

    .product-modal-body p {
        color: var(--neutral-600);
        line-height: 1.6;
    }

    .product-modal-features,
    .product-modal-includes {
        margin-bottom: 1.5rem;
    }

    .product-modal-features h4 i,
    .product-modal-includes h4 i {
        color: var(--primary-500);
    }

    .product-modal-features ul,
    .product-modal-includes ul {
        display: grid;
        gap: 0.5rem;
    }

    .product-modal-features li,
    .product-modal-includes li {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        font-size: 0.9375rem;
        color: var(--neutral-700);
    }

    .product-modal-features li i {
        color: var(--accent-green);
        margin-top: 0.25rem;
    }

    .product-modal-includes li i {
        color: var(--primary-500);
        margin-top: 0.25rem;
    }

    .product-modal-ideal {
        padding: 1.25rem;
        background: var(--primary-50);
        border-radius: var(--radius-md);
        margin-bottom: 1.5rem;
    }

    .product-modal-ideal h4 i {
        color: var(--primary-600);
    }

    .product-modal-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
        padding: 1.5rem 2rem;
        background: var(--neutral-50);
        border-top: 1px solid var(--border);
    }

    .product-modal-pricing {
        display: flex;
        align-items: baseline;
        gap: 0.75rem;
    }

    .modal-price {
        font-family: var(--font-display);
        font-size: 2rem;
        font-weight: 800;
        color: var(--primary-600);
    }

    .modal-price.free {
        color: var(--accent-green);
    }

    .modal-price-original {
        font-size: 1.25rem;
        color: var(--muted);
        text-decoration: line-through;
    }

    .product-modal-pack-hint {
        padding: 1rem 2rem 2rem;
        text-align: center;
    }

    .product-modal-pack-hint p {
        font-size: 0.875rem;
        color: var(--muted);
    }

    .product-modal-pack-hint a {
        color: var(--primary-600);
        font-weight: 600;
    }

    .product-modal-pack-hint a:hover {
        text-decoration: underline;
    }

    @media (max-width: 640px) {
        .product-modal-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 1.5rem 1.5rem 0;
        }

        .product-modal-body {
            padding: 1.5rem;
        }

        .product-modal-footer {
            flex-direction: column;
            padding: 1.5rem;
        }

        .product-modal-actions {
            width: 100%;
        }

        .product-modal-actions .btn {
            width: 100%;
        }
    }
`;
document.head.appendChild(modalStyles);

// ==========================================
// GOOGLE SHEETS INTEGRATION FOR CONTACT FORM
// ==========================================
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbw9_0VIOXFq_HYbObtOyzHTgeYHlQk72tq4nWYHnPCcWFmvcbkoVe9sDN72m2bPvV8nLw/exec';

// Note: For the Google Sheets integration to work, you need to:
// 1. Create a Google Apps Script in your spreadsheet
// 2. Deploy it as a web app
// 3. Replace YOUR_DEPLOYMENT_ID with the actual deployment ID

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('contact-submit');
            const formStatus = document.getElementById('form-status');

            // Get form data
            const formData = {
                nombre: document.getElementById('contact-name').value,
                email: document.getElementById('contact-email').value,
                asunto: document.getElementById('contact-subject').value,
                mensaje: document.getElementById('contact-message').value,
                fecha: new Date().toLocaleString('es-BO')
            };

            // Disable button and show loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

            try {
                // Send to Google Sheets via Apps Script
                const response = await fetch(GOOGLE_SHEETS_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                // Since no-cors doesn't return readable response, assume success
                formStatus.className = 'form-status success';
                formStatus.innerHTML = '<i class="fas fa-check-circle"></i> ¡Mensaje enviado! Te responderemos pronto.';
                contactForm.reset();

                showToast('¡Mensaje enviado exitosamente!', 'success');

            } catch (error) {
                console.error('Error sending message:', error);

                formStatus.className = 'form-status error';
                formStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error al enviar. Intenta por WhatsApp.';

                showToast('Error al enviar. Intenta por WhatsApp.', 'error');
            }

            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Enviar Mensaje</span><i class="fas fa-paper-plane"></i>';

            // Hide status after 5 seconds
            setTimeout(() => {
                formStatus.className = 'form-status';
            }, 5000);
        });
    }
});

console.log('📦 Products System Initialized');
