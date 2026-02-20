/**
 * NO SOMOS IGNORANTES - Shopping Cart System
 * Handles cart functionality and checkout process
 */

// ==========================================
// CART STATE
// ==========================================
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

// ==========================================
// PRODUCT DATABASE - Updated prices 2025
// ==========================================
const PRODUCTS = {
    // ===== PRODUCTOS PERSONALES =====
    'comparador-tasas': {
        id: 'comparador-tasas',
        title: 'Comparador de Crédito Hipotecario',
        price: 99,
        icon: 'fa-home',
        type: 'personal'
    },
    'bola-nieve': {
        id: 'bola-nieve',
        title: 'Bola de Nieve Automatizada',
        price: 99,
        icon: 'fa-snowflake',
        type: 'personal'
    },
    'amortizacion': {
        id: 'amortizacion',
        title: 'Amortizador de Deudas Pro',
        price: 99,
        icon: 'fa-calculator',
        type: 'personal'
    },
    'matriz-riesgos': {
        id: 'matriz-riesgos',
        title: 'Analizador de Score Crediticio',
        price: 150,
        icon: 'fa-shield-alt',
        type: 'personal'
    },
    'presupuesto': {
        id: 'presupuesto',
        title: 'Presupuesto Mensual 50/30/20',
        price: 0,
        icon: 'fa-wallet',
        type: 'personal'
    },
    // ===== PRODUCTOS EMPRENDEDORES =====
    'tracking-ventas': {
        id: 'tracking-ventas',
        title: 'Sistema de Ventas con Código Único',
        price: 150,
        icon: 'fa-chart-bar',
        type: 'emprendedor'
    },
    'gastos-operativos': {
        id: 'gastos-operativos',
        title: 'Control de Gastos Operativos',
        price: 50,
        icon: 'fa-building',
        type: 'emprendedor'
    },
    'costos-indirectos': {
        id: 'costos-indirectos',
        title: 'Calculadora de Costos Indirectos',
        price: 50,
        icon: 'fa-cogs',
        type: 'emprendedor'
    },
    'costos-venta': {
        id: 'costos-venta',
        title: 'Gestor de Costos de Venta',
        price: 50,
        icon: 'fa-tags',
        type: 'emprendedor'
    },
    'arpu': {
        id: 'arpu',
        title: 'Calculadora ARPU',
        price: 70,
        icon: 'fa-user-dollar',
        type: 'emprendedor'
    },
    'flujo-caja': {
        id: 'flujo-caja',
        title: 'Flujo de Caja Dual (Bs/$us)',
        price: 99,
        icon: 'fa-money-bill-wave',
        type: 'emprendedor'
    },
    'calc-precios': {
        id: 'calc-precios',
        title: 'Calculadora de Precio de Venta',
        price: 99,
        icon: 'fa-percent',
        type: 'emprendedor'
    },
    'estados-financieros': {
        id: 'estados-financieros',
        title: 'Estados Financieros Completos',
        price: 150,
        icon: 'fa-file-invoice-dollar',
        type: 'emprendedor'
    },
    // ===== PACKS =====
    'pack-personal': {
        id: 'pack-personal',
        title: 'Pack Finanzas Personales',
        price: 300,
        originalPrice: 447,
        icon: 'fa-box-open',
        type: 'pack'
    },
    'pack-emprendedor': {
        id: 'pack-emprendedor',
        title: 'Pack Emprendedor Total',
        price: 500,
        originalPrice: 718,
        icon: 'fa-briefcase',
        type: 'pack'
    },
    // ===== ENTERPRISE (USD) =====
    'pack-enterprise': {
        id: 'pack-enterprise',
        title: 'Pack Enterprise Valuation',
        price: 49,
        originalPrice: 99,
        icon: 'fa-chart-line',
        type: 'pack',
        currency: 'USD'
    }
};

// ==========================================
// DOM ELEMENTS
// ==========================================
const cartElements = {
    sidebar: document.getElementById('cart-sidebar'),
    overlay: document.getElementById('cart-overlay'),
    items: document.getElementById('cart-items'),
    total: document.getElementById('cart-total'),
    count: document.getElementById('cart-count'),
    floating: document.getElementById('cart-floating')
};

// ==========================================
// CART FUNCTIONS
// ==========================================

/**
 * Add product to cart
 * @param {string} productId - Product identifier
 */
function addToCart(productId) {
    const product = PRODUCTS[productId];

    if (!product) {
        showToast('Producto no encontrado', 'error');
        return;
    }

    // Check if product already in cart
    const existingIndex = cart.findIndex(item => item.id === productId);

    if (existingIndex !== -1) {
        showToast('Este producto ya está en tu carrito', 'info');
        openCart();
        return;
    }

    // Add to cart
    const cartItem = {
        id: product.id,
        title: product.title,
        price: product.price,
        icon: product.icon
    };
    if (product.currency) cartItem.currency = product.currency;
    cart.push(cartItem);

    // Save to localStorage
    saveCart();

    // Update UI
    updateCartUI();

    // Show notification
    if (product.price === 0) {
        showToast('¡Producto gratis agregado!', 'success');
    } else {
        showToast(`${product.title} agregado al carrito`, 'success');
    }

    // Open cart sidebar
    openCart();

    // Animate floating cart button
    animateCartButton();
}

/**
 * Remove product from cart
 * @param {string} productId - Product identifier
 */
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    renderCartItems();
    showToast('Producto eliminado', 'info');
}

/**
 * Save cart to localStorage
 */
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

/**
 * Update cart UI elements
 */
function updateCartUI() {
    const totalItems = cart.length;
    const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

    // Update count badge
    if (cartElements.count) {
        cartElements.count.textContent = totalItems;
        cartElements.count.setAttribute('data-count', totalItems);

        if (totalItems > 0) {
            cartElements.count.style.display = 'flex';
        } else {
            cartElements.count.style.display = 'none';
        }
    }

    // Update total — separate by currency
    if (cartElements.total) {
        const totalBs = cart.filter(i => !i.currency || i.currency === 'Bs').reduce((s, i) => s + i.price, 0);
        const totalUSD = cart.filter(i => i.currency === 'USD').reduce((s, i) => s + i.price, 0);
        const parts = [];
        if (totalBs > 0) parts.push(`Bs. ${totalBs}`);
        if (totalUSD > 0) parts.push(`$${totalUSD} USD`);
        cartElements.total.textContent = parts.length > 0 ? parts.join(' + ') : 'Bs. 0';
    }

    // Render cart items
    renderCartItems();
}

/**
 * Render cart items in sidebar
 */
function renderCartItems() {
    if (!cartElements.items) return;

    if (cart.length === 0) {
        cartElements.items.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Tu carrito está vacío</p>
                <a href="#productos" class="btn btn-outline btn-sm" onclick="closeCart()">
                    Explorar productos
                </a>
            </div>
        `;
        return;
    }

    let html = '';

    cart.forEach(item => {
        html += `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-icon">
                    <i class="fas ${item.icon}"></i>
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">${item.price === 0 ? 'Gratis' : item.currency === 'USD' ? `$${item.price} USD` : `Bs. ${item.price}`}</div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" title="Eliminar">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });

    cartElements.items.innerHTML = html;
}

/**
 * Open cart sidebar
 */
function openCart() {
    if (cartElements.sidebar) {
        cartElements.sidebar.classList.add('open');
    }
    if (cartElements.overlay) {
        cartElements.overlay.classList.add('open');
    }
    document.body.classList.add('no-scroll');
}

/**
 * Close cart sidebar
 */
function closeCart() {
    if (cartElements.sidebar) {
        cartElements.sidebar.classList.remove('open');
    }
    if (cartElements.overlay) {
        cartElements.overlay.classList.remove('open');
    }
    document.body.classList.remove('no-scroll');
}

/**
 * Toggle cart sidebar
 */
function toggleCart() {
    if (cartElements.sidebar && cartElements.sidebar.classList.contains('open')) {
        closeCart();
    } else {
        openCart();
    }
}

/**
 * Animate cart button when item is added
 */
function animateCartButton() {
    if (!cartElements.floating) return;

    cartElements.floating.style.transform = 'scale(1.2)';
    setTimeout(() => {
        cartElements.floating.style.transform = 'scale(1)';
    }, 200);
}

/**
 * Proceed to checkout
 */
function checkout() {
    if (cart.length === 0) {
        showToast('Tu carrito está vacío', 'error');
        return;
    }

    closeCart();

    // Check if all items are free
    const allFree = cart.every(item => item.price === 0);

    if (allFree) {
        // Direct download for free products
        handleFreeDownload();
    } else {
        // Open checkout modal for paid products
        openCheckoutModal();
    }
}

/**
 * Handle free product downloads
 */
function handleFreeDownload() {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');

    const content = `
        <button class="modal-close" onclick="closeModal()">
            <i class="fas fa-times"></i>
        </button>
        <div style="padding: 2.5rem; text-align: center;">
            <div style="width: 80px; height: 80px; background: var(--gradient-success); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                <i class="fas fa-gift" style="font-size: 2rem; color: white;"></i>
            </div>
            <h2 style="font-family: var(--font-display); font-size: 1.75rem; margin-bottom: 0.5rem;">
                ¡Productos Gratis!
            </h2>
            <p style="color: var(--muted); margin-bottom: 2rem;">
                Ingresa tu correo para recibir acceso instantáneo a tus herramientas gratuitas.
            </p>
            <form id="free-download-form" style="max-width: 400px; margin: 0 auto;">
                <div style="margin-bottom: 1rem;">
                    <input type="text" placeholder="Tu nombre" required
                        style="width: 100%; padding: 1rem; background: var(--neutral-100); border-radius: var(--radius-md); border: 2px solid transparent;">
                </div>
                <div style="margin-bottom: 1.5rem;">
                    <input type="email" placeholder="Tu correo electrónico" required
                        style="width: 100%; padding: 1rem; background: var(--neutral-100); border-radius: var(--radius-md); border: 2px solid transparent;">
                </div>
                <button type="submit" class="btn btn-primary btn-lg btn-block">
                    <i class="fas fa-download"></i>
                    <span>Obtener Acceso Gratis</span>
                </button>
            </form>
            <p style="font-size: 0.8125rem; color: var(--muted); margin-top: 1.5rem;">
                <i class="fas fa-lock"></i> Tu información está segura con nosotros.
            </p>
        </div>
    `;

    modalContent.innerHTML = content;
    modal.classList.add('open');
    document.body.classList.add('no-scroll');

    // Handle form submission
    const form = document.getElementById('free-download-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        showToast('Procesando...', 'info');

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Clear cart
            cart = [];
            saveCart();
            updateCartUI();

            closeModal();
            showToast('¡Listo! Revisa tu correo para acceder a tus herramientas.', 'success');

        } catch (error) {
            showToast('Error al procesar. Intenta de nuevo.', 'error');
        }
    });
}

/**
 * Get cart total
 * @returns {number} Total price
 */
function getCartTotal() {
    return cart.reduce((sum, item) => sum + item.price, 0);
}

/**
 * Clear entire cart
 */
function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
}

// ==========================================
// MAKE FUNCTIONS GLOBAL
// ==========================================
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.openCart = openCart;
window.closeCart = closeCart;
window.toggleCart = toggleCart;
window.checkout = checkout;
window.clearCart = clearCart;
window.updateCartUI = updateCartUI;

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Load cart from localStorage
    cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Initial UI update
    updateCartUI();

    console.log('🛒 Shopping Cart Initialized');
});
