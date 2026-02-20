/**
 * NO SOMOS IGNORANTES - Advanced Animations
 * Powered by Anime.js v4 + GSAP
 * Distinctive, production-grade motion design
 */

// ==========================================
// ANIMATION ENGINE - MAIN CONTROLLER
// ==========================================
const AnimationEngine = {
    gsapReady: false,
    animeReady: false,
    initialized: false,

    init() {
        // Check if libraries are loaded
        this.gsapReady = typeof gsap !== 'undefined';
        this.animeReady = typeof anime !== 'undefined';

        if (!this.gsapReady || !this.animeReady) {
            console.warn('Animation libraries loading... Retrying in 100ms');
            setTimeout(() => this.init(), 100);
            return;
        }

        if (this.initialized) return;
        this.initialized = true;

        // Register GSAP plugins
        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }

        // Initialize all animation modules
        this.setupGlobalDefaults();
        LoaderAnimation.init();
        HeroAnimations.init();
        ScrollAnimations.init();
        TextAnimations.init();
        CardAnimations.init();
        MicroInteractions.init();
        ParallaxEffects.init();
        MagneticElements.init();
        CounterAnimations.init();
        FloatingElements.init();
        PodcastAnimations.init();
        AboutAnimations.init();

        console.log('Animation Engine initialized with Anime.js + GSAP');
    },

    setupGlobalDefaults() {
        // GSAP defaults for consistent feel
        gsap.defaults({
            ease: 'power3.out',
            duration: 0.8
        });
    }
};

// ==========================================
// LOADER ANIMATION
// ==========================================
const LoaderAnimation = {
    init() {
        const loader = document.getElementById('loader');
        if (!loader) return;

        // Animate loader ring with Anime.js
        anime({
            targets: '.loader-ring',
            rotate: [0, 720],
            duration: 2000,
            easing: 'easeInOutQuad',
            loop: true
        });

        // Pulsing initials
        anime({
            targets: '.loader-initials',
            scale: [1, 1.1, 1],
            duration: 1000,
            easing: 'easeInOutQuad',
            loop: true
        });

        // When page loads, exit loader with dramatic effect
        window.addEventListener('load', () => {
            setTimeout(() => {
                const exitTl = gsap.timeline({
                    onComplete: () => {
                        loader.classList.add('hidden');
                        document.body.classList.remove('no-scroll');
                        // Trigger page entrance animations
                        PageEntrance.animate();
                    }
                });

                exitTl
                    .to('.loader-initials', {
                        scale: 30,
                        opacity: 0,
                        duration: 0.6,
                        ease: 'power4.in'
                    })
                    .to('.loader-content', {
                        opacity: 0,
                        duration: 0.2
                    }, '-=0.4')
                    .to(loader, {
                        opacity: 0,
                        duration: 0.4,
                        ease: 'power2.inOut'
                    }, '-=0.2');

            }, 1000);
        });
    }
};

// ==========================================
// PAGE ENTRANCE ANIMATIONS
// ==========================================
const PageEntrance = {
    animate() {
        const tl = gsap.timeline();

        // Hero badge entrance with bounce
        tl.fromTo('.hero-badge',
            {
                opacity: 0,
                y: 40,
                scale: 0.7
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.7,
                ease: 'back.out(1.7)'
            }
        );

        // Title lines with dramatic staggered reveal
        tl.fromTo('.title-line',
            {
                opacity: 0,
                y: 100,
                skewY: 7
            },
            {
                opacity: 1,
                y: 0,
                skewY: 0,
                duration: 0.9,
                stagger: 0.12,
                ease: 'power4.out'
            },
            '-=0.4'
        );

        // Subtitle with smooth fade
        tl.fromTo('.hero-subtitle',
            {
                opacity: 0,
                y: 30,
                filter: 'blur(10px)'
            },
            {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 0.7
            },
            '-=0.5'
        );

        // CTA buttons with spring effect using Anime.js
        anime({
            targets: '.hero-cta .btn',
            opacity: [0, 1],
            translateY: [30, 0],
            scale: [0.9, 1],
            delay: anime.stagger(120, { start: 800 }),
            duration: 700,
            easing: 'easeOutElastic(1, .5)'
        });

        // Stats cards with stagger
        anime({
            targets: '.stat-card',
            opacity: [0, 1],
            translateY: [50, 0],
            scale: [0.85, 1],
            delay: anime.stagger(100, { start: 1100 }),
            duration: 800,
            easing: 'easeOutBack'
        });

        // Floating cards with organic movement
        anime({
            targets: '.floating-card',
            opacity: [0, 1],
            translateY: [60, 0],
            translateX: function(el, i) {
                return [i % 2 === 0 ? -30 : 30, 0];
            },
            rotate: function(el, i) {
                return [i % 2 === 0 ? -10 : 10, 0];
            },
            delay: anime.stagger(250, { start: 1400 }),
            duration: 1000,
            easing: 'easeOutElastic(1, .6)'
        });
    }
};

// ==========================================
// HERO ANIMATIONS
// ==========================================
const HeroAnimations = {
    init() {
        this.animateBackground();
        this.animateBadgePulse();
        this.animateGlow();
        this.animateGrid();
    },

    animateBackground() {
        // Subtle continuous background movement
        gsap.to('.hero-gradient', {
            backgroundPosition: '100% 100%',
            duration: 20,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    },

    animateBadgePulse() {
        // Enhanced pulse animation with anime.js
        anime({
            targets: '.badge-pulse',
            scale: [1, 2, 1],
            opacity: [1, 0.2, 1],
            duration: 2500,
            easing: 'easeInOutSine',
            loop: true
        });
    },

    animateGlow() {
        // Breathing glow effect
        gsap.to('.hero-glow', {
            scale: 1.15,
            opacity: 0.25,
            duration: 5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    },

    animateGrid() {
        // Grid pattern subtle animation
        gsap.to('.hero-grid', {
            backgroundPosition: '60px 60px',
            duration: 25,
            repeat: -1,
            ease: 'none'
        });
    }
};

// ==========================================
// SCROLL-TRIGGERED ANIMATIONS
// ==========================================
const ScrollAnimations = {
    init() {
        if (typeof ScrollTrigger === 'undefined') {
            console.warn('ScrollTrigger not loaded, using fallback');
            this.initFallback();
            return;
        }

        this.setupSectionReveals();
        this.setupProductAnimations();
        this.setupTestimonialAnimations();
        this.setupResourceAnimations();
        this.setupContactAnimations();
        this.setupPackAnimations();
    },

    initFallback() {
        // Intersection Observer fallback
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    entry.target.style.opacity = 1;
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.section-header, .product-card, .resource-card, .testimonial-card').forEach(el => {
            el.style.opacity = 0;
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
    },

    setupSectionReveals() {
        // Section headers with dramatic reveal
        gsap.utils.toArray('.section-header').forEach(header => {
            const tag = header.querySelector('.section-tag');
            const title = header.querySelector('.section-title');
            const subtitle = header.querySelector('.section-subtitle');

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: header,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            });

            if (tag) {
                tl.fromTo(tag,
                    { opacity: 0, y: 25, scale: 0.85 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
                );
            }

            if (title) {
                tl.fromTo(title,
                    { opacity: 0, y: 50 },
                    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
                    '-=0.3'
                );
            }

            if (subtitle) {
                tl.fromTo(subtitle,
                    { opacity: 0, y: 25 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    '-=0.4'
                );
            }
        });
    },

    setupProductAnimations() {
        // Product cards with staggered grid reveal
        const productsGrid = document.querySelector('.products-grid');
        if (!productsGrid) return;

        const cards = productsGrid.querySelectorAll('.product-card');

        gsap.fromTo(cards,
            {
                opacity: 0,
                y: 70,
                scale: 0.92,
                rotateX: 15
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                rotateX: 0,
                duration: 0.65,
                stagger: {
                    amount: 1,
                    grid: 'auto',
                    from: 'start'
                },
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: productsGrid,
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        // Filter buttons animation
        const filterBtns = document.querySelectorAll('.filter-btn');
        gsap.fromTo(filterBtns,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.4,
                stagger: 0.08,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.product-filters',
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    },

    setupPackAnimations() {
        // Pack cards with special animation
        gsap.utils.toArray('.pack-card').forEach((card, i) => {
            gsap.fromTo(card,
                {
                    opacity: 0,
                    x: i % 2 === 0 ? -60 : 60,
                    y: 30,
                    scale: 0.9
                },
                {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        });
    },

    setupTestimonialAnimations() {
        const cards = document.querySelectorAll('.testimonial-card');
        if (!cards.length) return;

        gsap.fromTo(cards,
            {
                opacity: 0,
                y: 60,
                scale: 0.9
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.7,
                stagger: 0.15,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.testimonials-slider',
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        // Stars animation with anime.js
        cards.forEach(card => {
            const stars = card.querySelectorAll('.testimonial-stars i');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        anime({
                            targets: stars,
                            scale: [0, 1],
                            rotate: [-180, 0],
                            opacity: [0, 1],
                            delay: anime.stagger(80),
                            duration: 500,
                            easing: 'easeOutBack'
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            observer.observe(card);
        });
    },

    setupResourceAnimations() {
        const cards = document.querySelectorAll('.resource-card');
        if (!cards.length) return;

        gsap.fromTo(cards,
            {
                opacity: 0,
                y: 50,
                rotateY: 15
            },
            {
                opacity: 1,
                y: 0,
                rotateY: 0,
                duration: 0.6,
                stagger: 0.12,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.resources-grid',
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    },

    setupContactAnimations() {
        // Contact info reveal
        gsap.fromTo('.contact-info',
            { opacity: 0, x: -60 },
            {
                opacity: 1,
                x: 0,
                duration: 0.8,
                scrollTrigger: {
                    trigger: '.contact-grid',
                    start: 'top 70%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        // Contact form reveal
        gsap.fromTo('.contact-form-wrapper',
            { opacity: 0, x: 60, y: 30 },
            {
                opacity: 1,
                x: 0,
                y: 0,
                duration: 0.8,
                delay: 0.2,
                scrollTrigger: {
                    trigger: '.contact-grid',
                    start: 'top 70%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        // Contact methods stagger
        const methods = document.querySelectorAll('.contact-method');
        gsap.fromTo(methods,
            { opacity: 0, x: -30 },
            {
                opacity: 1,
                x: 0,
                duration: 0.5,
                stagger: 0.1,
                scrollTrigger: {
                    trigger: '.contact-methods',
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    }
};

// ==========================================
// ABOUT SECTION ANIMATIONS
// ==========================================
const AboutAnimations = {
    init() {
        this.setupFeatureItems();
        this.setupTikTokCard();
    },

    setupFeatureItems() {
        gsap.utils.toArray('.feature-item').forEach((item, i) => {
            const icon = item.querySelector('.feature-icon');
            const text = item.querySelector('.feature-text');

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            });

            tl.fromTo(icon,
                { scale: 0, rotation: -90 },
                { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.7)' }
            )
            .fromTo(text,
                { opacity: 0, x: 30 },
                { opacity: 1, x: 0, duration: 0.4 },
                '-=0.2'
            );
        });
    },

    setupTikTokCard() {
        const visualCard = document.querySelector('.visual-card');
        if (!visualCard) return;

        gsap.fromTo(visualCard,
            { opacity: 0, y: 60, rotateY: -15 },
            {
                opacity: 1,
                y: 0,
                rotateY: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: visualCard,
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        // Glow pulse animation
        gsap.to('.card-glow', {
            scale: 1.1,
            opacity: 0.3,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }
};

// ==========================================
// PODCAST SECTION ANIMATIONS
// ==========================================
const PodcastAnimations = {
    init() {
        this.setupPlayerAnimation();
        this.setupWavesAnimation();
    },

    setupPlayerAnimation() {
        const player = document.querySelector('.podcast-player');
        if (!player) return;

        gsap.fromTo(player,
            { opacity: 0, scale: 0.9, rotateY: 20 },
            {
                opacity: 1,
                scale: 1,
                rotateY: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: player,
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    },

    setupWavesAnimation() {
        // Enhanced waves with anime.js
        anime({
            targets: '.player-waves span',
            scaleY: function() {
                return [0.3, anime.random(0.5, 1), 0.3];
            },
            duration: function() {
                return anime.random(400, 700);
            },
            delay: anime.stagger(100),
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutSine'
        });
    }
};

// ==========================================
// TEXT ANIMATIONS
// ==========================================
const TextAnimations = {
    init() {
        this.setupTextGradientAnimation();
    },

    setupTextGradientAnimation() {
        // Animated gradient shimmer
        const gradientTexts = document.querySelectorAll('.text-gradient, .title-highlight');

        gradientTexts.forEach(el => {
            el.style.backgroundSize = '200% 200%';

            gsap.to(el, {
                backgroundPosition: '200% center',
                duration: 4,
                repeat: -1,
                ease: 'none'
            });
        });
    }
};

// ==========================================
// CARD ANIMATIONS
// ==========================================
const CardAnimations = {
    init() {
        this.setupHoverEffects();
        this.setup3DEffects();
    },

    setupHoverEffects() {
        // Product card hover with enhanced animation
        document.querySelectorAll('.product-card').forEach(card => {
            const icon = card.querySelector('.product-icon');
            const overlay = card.querySelector('.product-overlay');

            card.addEventListener('mouseenter', () => {
                anime({
                    targets: card,
                    translateY: -12,
                    scale: 1.02,
                    duration: 350,
                    easing: 'easeOutCubic'
                });

                if (icon) {
                    anime({
                        targets: icon,
                        scale: 1.15,
                        rotate: 10,
                        duration: 400,
                        easing: 'easeOutBack'
                    });
                }

                gsap.to(card, {
                    boxShadow: '0 25px 60px rgba(59, 130, 246, 0.25)',
                    duration: 0.35
                });
            });

            card.addEventListener('mouseleave', () => {
                anime({
                    targets: card,
                    translateY: 0,
                    scale: 1,
                    duration: 350,
                    easing: 'easeOutCubic'
                });

                if (icon) {
                    anime({
                        targets: icon,
                        scale: 1,
                        rotate: 0,
                        duration: 350,
                        easing: 'easeOutCubic'
                    });
                }

                gsap.to(card, {
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    duration: 0.35
                });
            });
        });

        // Resource card hover
        document.querySelectorAll('.resource-card').forEach(card => {
            const icon = card.querySelector('.resource-icon');

            card.addEventListener('mouseenter', () => {
                gsap.to(card, { y: -10, duration: 0.3, ease: 'power2.out' });
                if (icon) {
                    gsap.to(icon, {
                        scale: 1.1,
                        rotation: 8,
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                        duration: 0.3
                    });
                }
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, { y: 0, duration: 0.3, ease: 'power2.out' });
                if (icon) {
                    gsap.to(icon, {
                        scale: 1,
                        rotation: 0,
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        duration: 0.3
                    });
                }
            });
        });

        // Pack card hover
        document.querySelectorAll('.pack-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    y: -8,
                    boxShadow: '0 0 50px rgba(59, 130, 246, 0.35)',
                    borderColor: '#3b82f6',
                    duration: 0.4
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    y: 0,
                    boxShadow: 'none',
                    borderColor: '#e4e4e7',
                    duration: 0.4
                });
            });
        });
    },

    setup3DEffects() {
        // 3D tilt effect on visual card
        const visualCard = document.querySelector('.visual-card');
        if (!visualCard) return;

        visualCard.addEventListener('mousemove', (e) => {
            const rect = visualCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 12;
            const rotateY = (centerX - x) / 12;

            gsap.to(visualCard, {
                rotationX: rotateX,
                rotationY: rotateY,
                transformPerspective: 1000,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        visualCard.addEventListener('mouseleave', () => {
            gsap.to(visualCard, {
                rotationX: 0,
                rotationY: 0,
                duration: 0.6,
                ease: 'elastic.out(1, 0.5)'
            });
        });
    }
};

// ==========================================
// MICRO INTERACTIONS
// ==========================================
const MicroInteractions = {
    init() {
        this.setupButtonEffects();
        this.setupFilterEffects();
        this.setupFormEffects();
        this.setupNavEffects();
        this.setupSocialEffects();
    },

    setupButtonEffects() {
        // Primary button hover/click effects
        document.querySelectorAll('.btn-primary').forEach(btn => {
            // Ripple effect on click
            btn.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                ripple.className = 'btn-ripple';

                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255,255,255,0.4);
                    border-radius: 50%;
                    pointer-events: none;
                    transform: scale(0);
                `;

                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);

                anime({
                    targets: ripple,
                    scale: 3,
                    opacity: 0,
                    duration: 600,
                    easing: 'easeOutCubic',
                    complete: () => ripple.remove()
                });
            });

            // Hover effect
            btn.addEventListener('mouseenter', () => {
                gsap.to(btn, {
                    scale: 1.03,
                    y: -3,
                    duration: 0.25,
                    ease: 'power2.out'
                });
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    scale: 1,
                    y: 0,
                    duration: 0.25,
                    ease: 'power2.out'
                });
            });
        });
    },

    setupFilterEffects() {
        const filterBtns = document.querySelectorAll('.filter-btn');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Active button pulse
                anime({
                    targets: this,
                    scale: [1, 1.08, 1],
                    duration: 300,
                    easing: 'easeOutCubic'
                });

                // Animate filtered products
                setTimeout(() => {
                    const visibleProducts = document.querySelectorAll('.product-card:not([style*="display: none"])');
                    anime({
                        targets: visibleProducts,
                        opacity: [0, 1],
                        translateY: [30, 0],
                        scale: [0.95, 1],
                        delay: anime.stagger(50),
                        duration: 400,
                        easing: 'easeOutCubic'
                    });
                }, 50);
            });
        });
    },

    setupFormEffects() {
        // Input focus effects
        document.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('focus', function() {
                gsap.to(this, {
                    scale: 1.01,
                    boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.15)',
                    duration: 0.2
                });
            });

            input.addEventListener('blur', function() {
                gsap.to(this, {
                    scale: 1,
                    boxShadow: 'none',
                    duration: 0.2
                });
            });
        });
    },

    setupNavEffects() {
        // Navigation link hover animation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('mouseenter', () => {
                gsap.to(link, { y: -2, duration: 0.2 });
            });

            link.addEventListener('mouseleave', () => {
                gsap.to(link, { y: 0, duration: 0.2 });
            });
        });

        // Mobile menu toggle animation
        const navToggle = document.getElementById('nav-toggle');
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                const spans = navToggle.querySelectorAll('span');
                if (navToggle.classList.contains('active')) {
                    anime({
                        targets: spans[0],
                        rotate: 45,
                        translateY: 7,
                        duration: 300,
                        easing: 'easeOutCubic'
                    });
                    anime({
                        targets: spans[1],
                        opacity: 0,
                        duration: 200
                    });
                    anime({
                        targets: spans[2],
                        rotate: -45,
                        translateY: -7,
                        duration: 300,
                        easing: 'easeOutCubic'
                    });
                }
            });
        }
    },

    setupSocialEffects() {
        // Social links bounce effect
        document.querySelectorAll('.social-link, .footer-social a').forEach(link => {
            link.addEventListener('mouseenter', () => {
                anime({
                    targets: link,
                    translateY: -5,
                    scale: 1.1,
                    duration: 300,
                    easing: 'easeOutBack'
                });
            });

            link.addEventListener('mouseleave', () => {
                anime({
                    targets: link,
                    translateY: 0,
                    scale: 1,
                    duration: 300,
                    easing: 'easeOutCubic'
                });
            });
        });
    }
};

// ==========================================
// PARALLAX EFFECTS
// ==========================================
const ParallaxEffects = {
    init() {
        if (typeof ScrollTrigger === 'undefined') return;

        // Hero glow parallax
        gsap.to('.hero-glow', {
            yPercent: 40,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            }
        });

        // Floating cards parallax
        gsap.utils.toArray('.floating-card').forEach((card, i) => {
            gsap.to(card, {
                y: (i + 1) * -40,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1.5
                }
            });
        });
    }
};

// ==========================================
// MAGNETIC ELEMENTS
// ==========================================
const MagneticElements = {
    init() {
        // Social links magnetic effect
        const magneticElements = document.querySelectorAll('.social-link, .platform-icon, .tiktok-follow');

        magneticElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                gsap.to(el, {
                    x: x * 0.35,
                    y: y * 0.35,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            el.addEventListener('mouseleave', () => {
                gsap.to(el, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: 'elastic.out(1, 0.3)'
                });
            });
        });

        // Hero CTA buttons magnetic
        document.querySelectorAll('.hero-cta .btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                gsap.to(btn, {
                    x: x * 0.2,
                    y: y * 0.2,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: 'elastic.out(1, 0.3)'
                });
            });
        });
    }
};

// ==========================================
// COUNTER ANIMATIONS
// ==========================================
const CounterAnimations = {
    init() {
        const counters = document.querySelectorAll('[data-count]');
        if (!counters.length) return;

        if (typeof ScrollTrigger !== 'undefined') {
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-count'));

                ScrollTrigger.create({
                    trigger: counter,
                    start: 'top 85%',
                    onEnter: () => this.animateValue(counter, 0, target, 2000),
                    once: true
                });
            });
        } else {
            // Fallback with Intersection Observer
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = parseInt(entry.target.getAttribute('data-count'));
                        this.animateValue(entry.target, 0, target, 2000);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            counters.forEach(counter => observer.observe(counter));
        }
    },

    animateValue(element, start, end, duration) {
        // Use anime.js for smooth counter
        const obj = { val: start };
        anime({
            targets: obj,
            val: end,
            round: 1,
            duration: duration,
            easing: 'easeOutExpo',
            update: function() {
                element.textContent = obj.val.toLocaleString();
            }
        });
    }
};

// ==========================================
// FLOATING ELEMENTS ANIMATION
// ==========================================
const FloatingElements = {
    init() {
        // Continuous float animation for floating cards
        document.querySelectorAll('.floating-card').forEach((card, i) => {
            anime({
                targets: card,
                translateY: function() {
                    return [0, anime.random(-12, 12)];
                },
                translateX: function() {
                    return [0, anime.random(-5, 5)];
                },
                rotate: function() {
                    return [0, anime.random(-3, 3)];
                },
                duration: function() {
                    return anime.random(3500, 5500);
                },
                delay: i * 500,
                direction: 'alternate',
                loop: true,
                easing: 'easeInOutSine'
            });
        });

        // Floating cart button pulse
        const cartFloating = document.querySelector('.cart-floating');
        if (cartFloating) {
            anime({
                targets: cartFloating,
                scale: [1, 1.05, 1],
                duration: 2000,
                easing: 'easeInOutSine',
                loop: true
            });
        }
    }
};

// ==========================================
// SCROLL PROGRESS ANIMATION
// ==========================================
const ScrollProgressAnimation = {
    init() {
        // Create progress bar if not exists
        let progressBar = document.querySelector('.scroll-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'scroll-progress';
            progressBar.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
                transform-origin: left;
                transform: scaleX(0);
                z-index: 10000;
            `;
            document.body.appendChild(progressBar);
        }

        if (typeof ScrollTrigger !== 'undefined') {
            gsap.to(progressBar, {
                scaleX: 1,
                ease: 'none',
                scrollTrigger: {
                    trigger: document.body,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 0.3
                }
            });
        } else {
            // Fallback
            window.addEventListener('scroll', () => {
                const scrollTop = window.pageYOffset;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercent = scrollTop / docHeight;
                progressBar.style.transform = `scaleX(${scrollPercent})`;
            });
        }
    }
};

// ==========================================
// INITIALIZE ON DOM READY
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure libraries are loaded
    setTimeout(() => {
        AnimationEngine.init();
        ScrollProgressAnimation.init();
    }, 50);
});

// Export for external use
window.AnimationEngine = AnimationEngine;
window.PageEntrance = PageEntrance;
