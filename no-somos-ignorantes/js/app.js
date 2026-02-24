/**
 * NO SOMOS IGNORANTES - Main Application
 * Modern JavaScript ES6+
 */

// ==========================================
// CONFIGURATION
// ==========================================
const CONFIG = {
    animationDuration: 300,
    scrollOffset: 80,
    loaderDelay: 1500,
    toastDuration: 3000
};

// ==========================================
// DOM ELEMENTS
// ==========================================
const DOM = {
    loader: document.getElementById('loader'),
    navbar: document.getElementById('navbar'),
    navToggle: document.getElementById('nav-toggle'),
    navMenu: document.getElementById('nav-menu'),
    cursor: document.getElementById('cursor'),
    cursorFollower: document.getElementById('cursor-follower'),
    particles: document.getElementById('particles'),
    toastContainer: document.getElementById('toast-container')
};

// ==========================================
// UTILITIES
// ==========================================
const utils = {
    // Debounce function
    debounce(func, wait = 100) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit = 100) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Smooth scroll to element
    scrollTo(target, offset = CONFIG.scrollOffset) {
        const element = document.querySelector(target);
        if (element) {
            const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({
                top,
                behavior: 'smooth'
            });
        }
    },

    // Check if element is in viewport
    isInViewport(element, threshold = 0.1) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        return (
            rect.top <= windowHeight * (1 - threshold) &&
            rect.bottom >= windowHeight * threshold
        );
    },

    // Format number with thousands separator
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    // Generate random number
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};

// ==========================================
// LOADER
// ==========================================
const loader = {
    init() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                DOM.loader.classList.add('hidden');
                document.body.classList.remove('no-scroll');
                this.onComplete();
            }, CONFIG.loaderDelay);
        });

        document.body.classList.add('no-scroll');
    },

    onComplete() {
        // Trigger animations after loader
        document.querySelectorAll('.animate-fade-in, .animate-fade-up').forEach(el => {
            el.style.animationPlayState = 'running';
        });

        // Initialize counter animations
        counterAnimation.init();
    }
};

// ==========================================
// NAVIGATION
// ==========================================
const navigation = {
    init() {
        this.handleScroll();
        this.handleToggle();
        this.handleLinks();
        this.handleActiveLink();
    },

    handleScroll() {
        const onScroll = utils.throttle(() => {
            if (window.scrollY > 50) {
                DOM.navbar.classList.add('scrolled');
            } else {
                DOM.navbar.classList.remove('scrolled');
            }
        }, 50);

        window.addEventListener('scroll', onScroll);
    },

    handleToggle() {
        if (!DOM.navToggle || !DOM.navMenu) return;

        DOM.navToggle.addEventListener('click', () => {
            DOM.navToggle.classList.toggle('active');
            DOM.navMenu.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });
    },

    handleLinks() {
        document.querySelectorAll('.nav-link, .scroll-indicator, a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    utils.scrollTo(href);

                    // Close mobile menu
                    if (DOM.navToggle && DOM.navMenu) {
                        DOM.navToggle.classList.remove('active');
                        DOM.navMenu.classList.remove('active');
                        document.body.classList.remove('no-scroll');
                    }
                }
            });
        });
    },

    handleActiveLink() {
        const sections = document.querySelectorAll('section[id]');

        const onScroll = utils.throttle(() => {
            const scrollY = window.pageYOffset;

            sections.forEach(section => {
                const sectionHeight = section.offsetHeight;
                const sectionTop = section.offsetTop - 100;
                const sectionId = section.getAttribute('id');
                const link = document.querySelector(`.nav-link[href="#${sectionId}"]`);

                if (link) {
                    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                }
            });
        }, 100);

        window.addEventListener('scroll', onScroll);
    }
};

// ==========================================
// CUSTOM CURSOR
// ==========================================
const customCursor = {
    init() {
        if (!DOM.cursor || !DOM.cursorFollower) return;
        if (window.matchMedia('(hover: none)').matches) return;

        document.addEventListener('mousemove', (e) => {
            DOM.cursor.style.left = e.clientX + 'px';
            DOM.cursor.style.top = e.clientY + 'px';

            setTimeout(() => {
                DOM.cursorFollower.style.left = e.clientX + 'px';
                DOM.cursorFollower.style.top = e.clientY + 'px';
            }, 50);
        });

        // Interactive elements
        const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, .product-card');

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                DOM.cursor.classList.add('active');
                DOM.cursorFollower.classList.add('active');
            });

            el.addEventListener('mouseleave', () => {
                DOM.cursor.classList.remove('active');
                DOM.cursorFollower.classList.remove('active');
            });
        });

        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            DOM.cursor.style.opacity = '0';
            DOM.cursorFollower.style.opacity = '0';
        });

        document.addEventListener('mouseenter', () => {
            DOM.cursor.style.opacity = '1';
            DOM.cursorFollower.style.opacity = '1';
        });
    }
};

// ==========================================
// PARTICLES
// ==========================================
const particles = {
    init() {
        if (!DOM.particles) return;

        const particleCount = 30;

        for (let i = 0; i < particleCount; i++) {
            this.createParticle();
        }
    },

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';

        const size = utils.random(4, 8);
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = utils.random(0, 100) + '%';
        particle.style.top = utils.random(0, 100) + '%';
        particle.style.animationDelay = utils.random(0, 15) + 's';
        particle.style.animationDuration = utils.random(10, 20) + 's';

        DOM.particles.appendChild(particle);
    }
};

// ==========================================
// COUNTER ANIMATION
// ==========================================
const counterAnimation = {
    init() {
        const counters = document.querySelectorAll('[data-count]');

        counters.forEach(counter => {
            this.animateCounter(counter);
        });
    },

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += step;
            if (current < target) {
                element.textContent = utils.formatNumber(Math.floor(current));
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = utils.formatNumber(target);
            }
        };

        updateCounter();
    }
};

// ==========================================
// SCROLL REVEAL
// ==========================================
const scrollReveal = {
    init() {
        const revealElements = document.querySelectorAll('.reveal, [data-aos]');

        const checkReveal = utils.throttle(() => {
            revealElements.forEach(el => {
                if (utils.isInViewport(el, 0.15)) {
                    el.classList.add('revealed', 'aos-animate');
                }
            });
        }, 100);

        window.addEventListener('scroll', checkReveal);
        checkReveal(); // Initial check
    }
};

// ==========================================
// PRODUCT FILTERS
// ==========================================
const productFilters = {
    init() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const products = document.querySelectorAll('.product-card');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');

                // Filter products
                products.forEach(product => {
                    const categories = product.getAttribute('data-category') || '';

                    if (filter === 'all' || categories.includes(filter)) {
                        product.style.display = 'block';
                        product.style.animation = 'fadeUp 0.5s ease forwards';
                    } else {
                        product.style.display = 'none';
                    }
                });
            });
        });
    }
};

// ==========================================
// FORMS
// ==========================================
const forms = {
    init() {
        this.handleNewsletterForm();
        this.handleContactForm();
    },

    handleNewsletterForm() {
        const form = document.getElementById('newsletter-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = form.querySelector('input[type="email"]').value;

            // Simulate form submission
            showToast('Procesando...', 'info');

            try {
                // Here you would integrate with your email service
                // For now, we'll simulate success
                await new Promise(resolve => setTimeout(resolve, 1000));

                showToast('¡Gracias por suscribirte! Revisa tu correo.', 'success');
                form.reset();
            } catch (error) {
                showToast('Error al procesar. Intenta de nuevo.', 'error');
            }
        });
    },

    handleContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            showToast('Enviando mensaje...', 'info');

            try {
                // Here you would send to your backend
                await new Promise(resolve => setTimeout(resolve, 1500));

                showToast('¡Mensaje enviado! Te responderemos pronto.', 'success');
                form.reset();
            } catch (error) {
                showToast('Error al enviar. Intenta de nuevo.', 'error');
            }
        });
    }
};

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, CONFIG.toastDuration);
}

// Make toast function global
window.showToast = showToast;

// ==========================================
// MODALS
// ==========================================
function openModal(type) {
    const modal = document.getElementById('product-modal');
    const modalContent = document.getElementById('product-modal-content');

    let content = '';

    switch(type) {
        case 'newsletter':
            content = `
                <button class="modal-close" onclick="closeModal()">
                    <i class="fas fa-times"></i>
                </button>
                <div style="padding: 2.5rem; text-align: center;">
                    <span class="section-tag">Newsletter</span>
                    <h2 style="font-family: var(--font-display); font-size: 1.75rem; margin: 1rem 0;">
                        Únete a nuestra comunidad
                    </h2>
                    <p style="color: var(--muted); margin-bottom: 2rem;">
                        Recibe consejos financieros, herramientas exclusivas y más.
                    </p>
                    <form id="modal-newsletter-form" style="max-width: 400px; margin: 0 auto;">
                        <input type="email" placeholder="Tu correo electrónico" required
                            style="width: 100%; padding: 1rem; margin-bottom: 1rem; background: var(--neutral-100); border-radius: var(--radius-md);">
                        <button type="submit" class="btn btn-primary btn-block">
                            <span>Suscribirme</span>
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </form>
                </div>
            `;
            break;
        default:
            content = '<div style="padding: 2rem;">Contenido no disponible</div>';
    }

    modalContent.innerHTML = content;
    modal.classList.add('open');
    document.body.classList.add('no-scroll');
}

function closeModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('open');
    document.body.classList.remove('no-scroll');
}

// Make modal functions global
window.openModal = openModal;
window.closeModal = closeModal;

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeCheckoutModal();
        closeCart();
    }
});

// ==========================================
// PRODUCT MODAL
// ==========================================
function openProductModal(productId) {
    const modal = document.getElementById('product-modal');
    const modalContent = document.getElementById('product-modal-content');

    // Product data (in production, this would come from a database)
    const products = {
        'bola-nieve': {
            title: 'Estrategia Bola de Nieve',
            description: 'La estrategia más efectiva para eliminar deudas. Esta herramienta te permite listar todas tus deudas, calcular el orden óptimo de pago y visualizar tu progreso hasta quedar libre de deudas.',
            features: [
                'Lista hasta 20 deudas diferentes',
                'Cálculo automático del orden de pago',
                'Gráficos de progreso motivacionales',
                'Proyección de fecha de libertad financiera',
                'Incluye tutorial paso a paso'
            ],
            price: 35,
            originalPrice: 50,
            icon: 'fa-snowflake'
        },
        'amortizacion': {
            title: 'Calculadora de Amortización',
            description: 'Calcula exactamente cuánto pagarás en intereses y cuotas. Compara diferentes escenarios para tomar la mejor decisión financiera.',
            features: [
                'Soporte para múltiples préstamos',
                'Comparador de tasas de interés',
                'Simulador de pagos extra',
                'Tabla de amortización detallada',
                'Gráficos de capital vs interés'
            ],
            price: 25,
            icon: 'fa-calculator'
        },
        'presupuesto': {
            title: 'Presupuesto Mensual 50/30/20',
            description: 'La regla más simple y probada para organizar tu dinero. Divide automáticamente tus ingresos en necesidades, deseos y ahorro.',
            features: [
                'Cálculo automático de proporciones',
                'Registro de gastos por categoría',
                'Dashboard visual mensual',
                'Alertas cuando te pasas del presupuesto',
                'Historial de meses anteriores'
            ],
            price: 0,
            icon: 'fa-wallet'
        },
        'tracking-ventas': {
            title: 'Tracking de Ventas Pro',
            description: 'Sistema profesional para controlar todas tus ventas con código único por producto. Ideal para emprendedores que quieren escalar.',
            features: [
                'Código único automático por venta',
                'Dashboard de métricas en tiempo real',
                'Reportes semanales y mensuales',
                'Control de clientes',
                'Análisis de productos más vendidos'
            ],
            price: 45,
            icon: 'fa-chart-bar'
        },
        'flujo-caja': {
            title: 'Flujo de Caja Simple',
            description: 'Controla las entradas y salidas de tu negocio de forma visual e intuitiva. Proyecta tu situación financiera futura.',
            features: [
                'Registro de ingresos y egresos',
                'Categorización automática',
                'Proyecciones a 3-6-12 meses',
                'Alertas de saldo bajo',
                'Gráficos de tendencia'
            ],
            price: 40,
            icon: 'fa-money-bill-wave'
        },
        'kit-emprendedor': {
            title: 'Kit Emprendedor Completo',
            description: 'Todo lo que necesitas para profesionalizar la gestión financiera de tu negocio en un solo paquete.',
            features: [
                'Tracking de Ventas Pro',
                'Flujo de Caja Simple',
                'Control de Inventario',
                'Gestión de Clientes',
                'Calculadora de Precios',
                'Video tutoriales incluidos',
                'Soporte prioritario por WhatsApp'
            ],
            price: 99,
            originalPrice: 180,
            icon: 'fa-box-open'
        }
    };

    const product = products[productId];
    if (!product) return;

    const content = `
        <button class="modal-close" onclick="closeModal()">
            <i class="fas fa-times"></i>
        </button>
        <div style="display: grid; gap: 2rem; padding: 2.5rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 80px; height: 80px; background: var(--gradient-primary); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">
                    <i class="fas ${product.icon}"></i>
                </div>
                <div>
                    <h2 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 0.25rem;">${product.title}</h2>
                    <div style="display: flex; align-items: baseline; gap: 0.5rem;">
                        <span style="font-size: 1.5rem; font-weight: 700; color: var(--primary-600);">
                            ${product.price === 0 ? 'Gratis' : `Bs. ${product.price}`}
                        </span>
                        ${product.originalPrice ? `<span style="text-decoration: line-through; color: var(--muted);">Bs. ${product.originalPrice}</span>` : ''}
                    </div>
                </div>
            </div>

            <div>
                <p style="color: var(--neutral-700); line-height: 1.7;">${product.description}</p>
            </div>

            <div>
                <h4 style="font-weight: 600; margin-bottom: 1rem;">¿Qué incluye?</h4>
                <ul style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${product.features.map(f => `
                        <li style="display: flex; align-items: flex-start; gap: 0.75rem;">
                            <i class="fas fa-check-circle" style="color: var(--success-500); margin-top: 0.25rem;"></i>
                            <span>${f}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>

            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <button class="btn btn-primary btn-lg" onclick="closeModal(); addToCart('${productId}')">
                    <i class="fas fa-shopping-cart"></i>
                    <span>${product.price === 0 ? 'Descargar Gratis' : 'Agregar al Carrito'}</span>
                </button>
                <button class="btn btn-outline btn-lg" onclick="closeModal()">
                    Seguir Viendo
                </button>
            </div>
        </div>
    `;

    modalContent.innerHTML = content;
    modal.classList.add('open');
    document.body.classList.add('no-scroll');
}

window.openProductModal = openProductModal;

// ==========================================
// CHECKOUT MODAL
// ==========================================
function openCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    modal.classList.add('open');
    document.body.classList.add('no-scroll');

    // Update summary
    updateCheckoutSummary();
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    modal.classList.remove('open');
    document.body.classList.remove('no-scroll');
}

function updateCheckoutSummary() {
    const summary = document.getElementById('checkout-summary');
    const totalAmount = document.getElementById('checkout-total-amount');

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    if (cart.length === 0) {
        summary.innerHTML = '<p style="text-align: center; color: var(--muted);">Tu carrito está vacío</p>';
        totalAmount.textContent = 'Bs. 0';
        return;
    }

    let html = '';
    let total = 0;

    cart.forEach(item => {
        html += `
            <div class="checkout-summary-item">
                <span>${item.title}</span>
                <span>Bs. ${item.price}</span>
            </div>
        `;
        total += item.price;
    });

    summary.innerHTML = html;
    totalAmount.textContent = `Bs. ${total}`;
}

window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;


// Payment toggle
document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('input[name="payment"]').forEach(r=>{r.addEventListener('change',()=>{const q=document.getElementById('payment-qr'),t=document.getElementById('payment-transfer');if(q&&t){q.style.display=r.value==='qr'?'block':'none';t.style.display=r.value==='transfer'?'block':'none';}});});});

// Handle checkout form
document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('checkout-name').value;
            const email = document.getElementById('checkout-email').value;
            const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

            showToast('Procesando tu pedido...', 'info');

            try {
                // Simulate order processing
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Clear cart
                localStorage.removeItem('cart');
                updateCartUI();

                closeCheckoutModal();
                closeCart();

                showToast('¡Pedido confirmado! Revisa tu correo para acceder a tus productos.', 'success');

            } catch (error) {
                showToast('Error al procesar. Intenta de nuevo.', 'error');
            }
        });
    }
});

// ==========================================
// SCROLL PROGRESS BAR
// ==========================================
const scrollProgress = {
    init() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', utils.throttle(() => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = scrollTop / docHeight;
            progressBar.style.transform = `scaleX(${scrollPercent})`;
        }, 10));
    }
};

// ==========================================
// MOBILE MENU STYLES
// ==========================================
const mobileMenu = {
    init() {
        // Add styles for mobile menu
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 1023px) {
                .nav-menu {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: var(--gradient-dark);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 2rem;
                    transform: translateX(-100%);
                    transition: transform 0.3s ease;
                    z-index: 999;
                }

                .nav-menu.active {
                    transform: translateX(0);
                }

                .nav-menu .nav-link {
                    font-size: 1.5rem;
                    color: white;
                }

                .nav-menu .nav-link:hover,
                .nav-menu .nav-link.active {
                    color: var(--primary-400);
                }
            }
        `;
        document.head.appendChild(style);
    }
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loader.init();
    navigation.init();
    customCursor.init();
    particles.init();
    scrollReveal.init();
    productFilters.init();
    forms.init();
    scrollProgress.init();
    mobileMenu.init();

    console.log('🚀 No Somos Ignorantes - Website Initialized');
});

// ==========================================
// EXPORTS (for external use)
// ==========================================
window.NSI = {
    utils,
    showToast,
    openModal,
    closeModal
};
