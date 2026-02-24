/**
 * NO SOMOS IGNORANTES - Shopping Cart System
 * Handles cart functionality and checkout process
 */

// ==========================================
// CART STATE
// ==========================================
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

// ==========================================
// PRODUCT DATABASE
// ==========================================
const PRODUCTS = {
    'comparador-tasas': { id: 'comparador-tasas', title: 'Comparador de Crédito Hipotecario', price: 99, icon: 'fa-home', type: 'personal' },
    'bola-nieve': { id: 'bola-nieve', title: 'Bola de Nieve Automatizada', price: 99, icon: 'fa-snowflake', type: 'personal' },
    'amortizacion': { id: 'amortizacion', title: 'Amortizador de Deudas Pro', price: 99, icon: 'fa-calculator', type: 'personal' },
    'matriz-riesgos': { id: 'matriz-riesgos', title: 'Analizador de Score Crediticio', price: 150, icon: 'fa-shield-alt', type: 'personal' },
    'presupuesto': { id: 'presupuesto', title: 'Presupuesto Mensual 50/30/20', price: 0, icon: 'fa-wallet', type: 'personal' },
    'tracking-ventas': { id: 'tracking-ventas', title: 'Sistema de Ventas con Código Único', price: 150, icon: 'fa-chart-bar', type: 'emprendedor' },
    'gastos-operativos': { id: 'gastos-operativos', title: 'Control de Gastos Operativos', price: 50, icon: 'fa-building', type: 'emprendedor' },
    'costos-indirectos': { id: 'costos-indirectos', title: 'Calculadora de Costos Indirectos', price: 50, icon: 'fa-cogs', type: 'emprendedor' },
    'costos-venta': { id: 'costos-venta', title: 'Gestor de Costos de Venta', price: 50, icon: 'fa-tags', type: 'emprendedor' },
    'arpu': { id: 'arpu', title: 'Calculadora ARPU', price: 70, icon: 'fa-user-dollar', type: 'emprendedor' },
    'flujo-caja': { id: 'flujo-caja', title: 'Flujo de Caja Dual (Bs/$us)', price: 99, icon: 'fa-money-bill-wave', type: 'emprendedor' },
    'calc-precios': { id: 'calc-precios', title: 'Calculadora de Precio de Venta', price: 99, icon: 'fa-percent', type: 'emprendedor' },
    'estados-financieros': { id: 'estados-financieros', title: 'Estados Financieros Completos', price: 150, icon: 'fa-file-invoice-dollar', type: 'emprendedor' },
    'pack-personal': { id: 'pack-personal', title: 'Pack Finanzas Personales', price: 300, originalPrice: 447, icon: 'fa-box-open', type: 'pack' },
    'pack-emprendedor': { id: 'pack-emprendedor', title: 'Pack Emprendedor Total', price: 500, originalPrice: 718, icon: 'fa-briefcase', type: 'pack' },
    'pack-enterprise': { id: 'pack-enterprise', title: 'Pack Enterprise Valuation', price: 49, originalPrice: 99, icon: 'fa-chart-line', type: 'pack', currency: 'USD' }
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

function addToCart(productId) {
    const product = PRODUCTS[productId];
    if (!product) { showToast('Producto no encontrado', 'error'); return; }

    const existingIndex = cart.findIndex(item => item.id === productId);
    if (existingIndex !== -1) {
        showToast('Este producto ya está en tu carrito', 'info');
        openCart();
        return;
    }

    const cartItem = { id: product.id, title: product.title, price: product.price, icon: product.icon };
    if (product.currency) cartItem.currency = product.currency;
    cart.push(cartItem);
    saveCart();
    updateCartUI();

    if (product.price === 0) {
        showToast('¡Producto gratis agregado!', 'success');
    } else {
        showToast(`${product.title} agregado al carrito`, 'success');
    }

    openCart();
    animateCartButton();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    renderCartItems();
    showToast('Producto eliminado', 'info');
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
    const totalItems = cart.length;

    if (cartElements.count) {
        cartElements.count.textContent = totalItems;
        cartElements.count.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    if (cartElements.total) {
        const totalBs = cart.filter(i => !i.currency || i.currency === 'Bs').reduce((s, i) => s + i.price, 0);
        const totalUSD = cart.filter(i => i.currency === 'USD').reduce((s, i) => s + i.price, 0);
        const parts = [];
        if (totalBs > 0) parts.push(`Bs. ${totalBs}`);
        if (totalUSD > 0) parts.push(`$${totalUSD} USD`);
        cartElements.total.textContent = parts.length > 0 ? parts.join(' + ') : 'Bs. 0';
    }

    renderCartItems();
}

function renderCartItems() {
    if (!cartElements.items) return;

    if (cart.length === 0) {
        cartElements.items.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Tu carrito está vacío</p>
                <a href="#productos" class="btn btn-outline btn-sm" onclick="closeCart()">Explorar productos</a>
            </div>`;
        return;
    }

    cartElements.items.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-icon"><i class="fas ${item.icon}"></i></div>
            <div class="cart-item-info">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">${item.price === 0 ? 'Gratis' : item.currency === 'USD' ? `$${item.price} USD` : `Bs. ${item.price}`}</div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" title="Eliminar">
                <i class="fas fa-times"></i>
            </button>
        </div>`).join('');
}

function openCart() {
    cartElements.sidebar?.classList.add('open');
    cartElements.overlay?.classList.add('open');
    document.body.classList.add('no-scroll');
}

function closeCart() {
    cartElements.sidebar?.classList.remove('open');
    cartElements.overlay?.classList.remove('open');
    document.body.classList.remove('no-scroll');
}

function toggleCart() {
    cartElements.sidebar?.classList.contains('open') ? closeCart() : openCart();
}

function animateCartButton() {
    if (!cartElements.floating) return;
    cartElements.floating.style.transform = 'scale(1.2)';
    setTimeout(() => { cartElements.floating.style.transform = 'scale(1)'; }, 200);
}

function checkout() {
    if (cart.length === 0) { showToast('Tu carrito está vacío', 'error'); return; }
    closeCart();
    const allFree = cart.every(item => item.price === 0);
    if (allFree) {
        handleFreeDownload();
    } else {
        openCheckoutModal();
    }
}

function handleFreeDownload() {
    const modal = document.getElementById('checkout-modal');
    const wrapper = modal.querySelector('.checkout-wrapper');

    wrapper.innerHTML = `
        <div class="checkout-header">
            <h2>🎁 Producto Gratuito</h2>
            <p>Ingresa tu correo para recibir acceso instantáneo</p>
        </div>
        <div style="text-align:center; padding: 1rem 0 2rem;">
            <div style="width:80px;height:80px;background:linear-gradient(135deg,#10b981,#059669);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;">
                <i class="fas fa-gift" style="font-size:2rem;color:white;"></i>
            </div>
        </div>
        <form id="free-form" style="display:flex;flex-direction:column;gap:1rem;">
            <div class="form-group">
                <label>Nombre Completo *</label>
                <input type="text" id="free-name" placeholder="Tu nombre" required>
            </div>
            <div class="form-group">
                <label>Email *</label>
                <input type="email" id="free-email" placeholder="tu@email.com" required>
                <span class="form-hint">Aquí recibirás el acceso gratuito</span>
            </div>
            <button type="submit" class="btn btn-primary btn-lg btn-block">
                <i class="fas fa-download"></i> Obtener Acceso Gratis
            </button>
        </form>
        <button class="modal-close" onclick="closeCheckoutModal()"><i class="fas fa-times"></i></button>`;

    modal.classList.add('open');
    document.body.classList.add('no-scroll');

    document.getElementById('free-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        showToast('¡Listo! Revisa tu correo pronto.', 'success');
        cart = [];
        saveCart();
        updateCartUI();
        closeCheckoutModal();
    });
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
}

// ==========================================
// CHECKOUT MODAL - QR ONLY
// ==========================================
function openCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    const wrapper = modal.querySelector('.checkout-wrapper');

    // Calculate total
    const totalBs = cart.filter(i => !i.currency || i.currency === 'Bs').reduce((s, i) => s + i.price, 0);
    const totalUSD = cart.filter(i => i.currency === 'USD').reduce((s, i) => s + i.price, 0);
    const totalDisplay = [
        totalBs > 0 ? `Bs. ${totalBs}` : '',
        totalUSD > 0 ? `$${totalUSD} USD` : ''
    ].filter(Boolean).join(' + ');

    const summaryItems = cart.map(item => `
        <div class="checkout-summary-item">
            <span>${item.title}</span>
            <span>${item.price === 0 ? 'Gratis' : item.currency === 'USD' ? `$${item.price} USD` : `Bs. ${item.price}`}</span>
        </div>`).join('');

    wrapper.innerHTML = `
        <button class="modal-close" onclick="closeCheckoutModal()"><i class="fas fa-times"></i></button>

        <div class="checkout-header">
            <h2>Finalizar Compra</h2>
            <p>Completa tu información y sube tu comprobante de pago</p>
        </div>

        <form id="checkout-form-new">

            <div class="form-section">
                <h3><i class="fas fa-user"></i> Información Personal</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label>Nombre Completo *</label>
                        <input type="text" id="co-name" placeholder="Tu nombre completo" required>
                    </div>
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" id="co-email" placeholder="tu@email.com" required>
                        <span class="form-hint">Aquí recibirás tus herramientas</span>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h3><i class="fas fa-receipt"></i> Resumen del Pedido</h3>
                <div class="checkout-summary">${summaryItems}</div>
                <div class="checkout-total">
                    <span>Total a Pagar:</span>
                    <span class="checkout-total-amount">${totalDisplay}</span>
                </div>
            </div>

            <div class="form-section">
                <h3><i class="fas fa-qrcode"></i> Pago con QR Bolivia</h3>
                <div class="qr-payment-block">
                    <p class="qr-instruction">Escanea el código QR con tu app bancaria y realiza el pago exacto.</p>
                    <div class="qr-image-wrapper">
                        <img src="assets/QR.jpg" alt="QR de Pago Bolivia" class="qr-static-img">
                    </div>
                    <p class="qr-amount-label">Monto a pagar: <strong>${totalDisplay}</strong></p>
                </div>
            </div>

            <div class="form-section">
                <h3><i class="fas fa-upload"></i> Sube tu Comprobante</h3>
                <p style="font-size:0.9rem;color:var(--muted);margin-bottom:1rem;">
                    Después de realizar el pago, sube la captura del comprobante aquí.
                </p>
                <div class="upload-area" id="upload-area" onclick="document.getElementById('comprobante-input').click()">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span id="upload-label">Toca para subir tu comprobante</span>
                    <small>JPG, PNG o PDF — máx. 5MB</small>
                    <input type="file" id="comprobante-input" accept="image/*,.pdf" style="display:none" onchange="handleFileSelect(this)">
                </div>
                <div id="file-preview" style="display:none;margin-top:1rem;"></div>
            </div>

            <button type="submit" class="btn btn-primary btn-lg btn-block" id="submit-order-btn">
                <i class="fas fa-paper-plane"></i>
                <span>Enviar Comprobante</span>
            </button>

            <p class="checkout-security">
                <i class="fas fa-shield-alt"></i>
                Verificaremos tu pago en menos de 24 horas y te enviaremos acceso a tus herramientas.
            </p>
        </form>`;

    modal.classList.add('open');
    document.body.classList.add('no-scroll');

    // Handle form submit
    document.getElementById('checkout-form-new').addEventListener('submit', handleCheckoutSubmit);
}

// File select handler
window.handleFileSelect = function(input) {
    const file = input.files[0];
    if (!file) return;

    const area = document.getElementById('upload-area');
    const preview = document.getElementById('file-preview');
    const label = document.getElementById('upload-label');

    label.textContent = `✅ ${file.name}`;
    area.style.borderColor = '#10b981';
    area.style.background = '#f0fdf4';

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.style.display = 'block';
            preview.innerHTML = `<img src="${e.target.result}" alt="Comprobante" style="max-width:100%;max-height:200px;border-radius:8px;border:2px solid #10b981;">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.style.display = 'block';
        preview.innerHTML = `<div style="padding:1rem;background:#f0fdf4;border-radius:8px;color:#059669;"><i class="fas fa-file-pdf"></i> ${file.name}</div>`;
    }
};

// Submit checkout
async function handleCheckoutSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('co-name').value.trim();
    const email = document.getElementById('co-email').value.trim();
    const fileInput = document.getElementById('comprobante-input');
    const btn = document.getElementById('submit-order-btn');

    if (!name || !email) {
        showToast('Por favor completa tu nombre y email', 'error');
        return;
    }

    if (!fileInput.files[0]) {
        showToast('Por favor sube tu comprobante de pago', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    try {
        // Upload comprobante to Supabase Storage (base64)
        const file = fileInput.files[0];
        let payment_proof_url = null;

        // Convert to base64 for sending
        const base64 = await fileToBase64(file);

        // Try to upload to Supabase Storage via API
        const uploadResp = await fetch('/api/telegram/upload-proof', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                file_data: base64,
                file_name: file.name,
                file_type: file.type
            })
        }).catch(() => null);

        if (uploadResp && uploadResp.ok) {
            const uploadData = await uploadResp.json();
            payment_proof_url = uploadData.url;
        }

        // Build product list
        const productNames = cart.map(i => i.title).join(', ');
        const totalBs = cart.filter(i => !i.currency || i.currency === 'Bs').reduce((s, i) => s + i.price, 0);
        const totalUSD = cart.filter(i => i.currency === 'USD').reduce((s, i) => s + i.price, 0);
        const totalPrice = totalBs || totalUSD;
        const firstItem = cart[0];

        // Notify via Telegram bot
        const notifyResp = await fetch('/api/telegram/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_name: name,
                user_email: email,
                product_name: cart.length > 1 ? `${cart.length} productos: ${productNames}` : firstItem.title,
                product_price: totalPrice,
                payment_proof_url: payment_proof_url || 'No subido',
                payment_reference: `WEB-${Date.now()}`
            })
        });

        if (!notifyResp.ok) throw new Error('Error al enviar notificación');

        // Clear cart
        cart = [];
        saveCart();
        updateCartUI();
        closeCheckoutModal();

        // Show success
        showOrderSuccess(name, email);

    } catch (err) {
        console.error(err);
        showToast('Error al enviar. Intenta de nuevo o contáctanos por WhatsApp.', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Comprobante';
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function showOrderSuccess(name, email) {
    const modal = document.getElementById('checkout-modal');
    const wrapper = modal.querySelector('.checkout-wrapper');

    wrapper.innerHTML = `
        <div style="text-align:center;padding:3rem 2rem;">
            <div style="width:90px;height:90px;background:linear-gradient(135deg,#10b981,#059669);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;box-shadow:0 8px 24px rgba(16,185,129,0.3);">
                <i class="fas fa-check" style="font-size:2.5rem;color:white;"></i>
            </div>
            <h2 style="font-size:1.75rem;margin-bottom:0.75rem;">¡Comprobante enviado!</h2>
            <p style="color:var(--muted);margin-bottom:0.5rem;">Hola <strong>${name}</strong>, recibimos tu comprobante.</p>
            <p style="color:var(--muted);margin-bottom:2rem;">Verificaremos tu pago y te enviaremos tus herramientas a <strong>${email}</strong> en menos de 24 horas.</p>
            <button class="btn btn-primary" onclick="closeCheckoutModal()">
                <i class="fas fa-home"></i> Volver al inicio
            </button>
            <p style="margin-top:1.5rem;font-size:0.85rem;color:var(--muted);">
                ¿Consultas? <a href="https://wa.me/59176638365" target="_blank" style="color:var(--primary-600);">WhatsApp +591 76638365</a>
            </p>
        </div>`;

    modal.classList.add('open');
    document.body.classList.add('no-scroll');
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    modal.classList.remove('open');
    document.body.classList.remove('no-scroll');
}

// ==========================================
// GLOBAL EXPORTS
// ==========================================
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.openCart = openCart;
window.closeCart = closeCart;
window.toggleCart = toggleCart;
window.checkout = checkout;
window.clearCart = clearCart;
window.updateCartUI = updateCartUI;
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    cart = JSON.parse(localStorage.getItem('cart') || '[]');
    updateCartUI();
    console.log('🛒 Shopping Cart Initialized');
});
