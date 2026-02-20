-- ============================================
-- NO SOMOS IGNORANTES - DATABASE SCHEMA
-- Membership, Reviews, Affiliates
-- ============================================
-- Run after 02_schema_marketing.sql

-- ============================================
-- TABLE: membership_tiers
-- ============================================
-- Define different membership levels
--
-- WHAT IT DOES:
-- - Defines membership levels (Basic, Pro, VIP)
-- - Sets pricing for each tier
-- - Specifies what's included
-- - Enables subscription business model
-- ============================================

CREATE TABLE IF NOT EXISTS public.membership_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Tier info
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    features JSONB, -- list of features/benefits

    -- Pricing
    price_monthly_bob DECIMAL(10,2),
    price_yearly_bob DECIMAL(10,2),
    price_monthly_usd DECIMAL(10,2),
    price_yearly_usd DECIMAL(10,2),

    -- Access
    access_level INTEGER NOT NULL DEFAULT 1, -- 1 = basic, 2 = pro, 3 = vip
    included_products UUID[], -- specific products included
    included_categories TEXT[], -- product categories included
    monthly_download_limit INTEGER, -- NULL = unlimited
    priority_support BOOLEAN DEFAULT FALSE,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: memberships
-- ============================================
-- Active user memberships/subscriptions
--
-- WHAT IT DOES:
-- - Tracks who has what membership
-- - Manages subscription status
-- - Handles renewals and cancellations
-- - Records payment history
-- ============================================

CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Who has the membership
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tier_id UUID NOT NULL REFERENCES public.membership_tiers(id) ON DELETE RESTRICT,

    -- Subscription status
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN (
        'active',
        'past_due',
        'cancelled',
        'expired',
        'paused',
        'trial'
    )),

    -- Billing period
    billing_period VARCHAR(20) CHECK (billing_period IN ('monthly', 'yearly', 'lifetime')),
    price_paid DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'BOB',

    -- Important dates
    started_at TIMESTAMPTZ DEFAULT NOW(),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,

    -- Trial
    is_trial BOOLEAN DEFAULT FALSE,
    trial_ends_at TIMESTAMPTZ,

    -- Payment
    payment_method VARCHAR(50),
    last_payment_at TIMESTAMPTZ,
    next_payment_at TIMESTAMPTZ,

    -- Usage this period
    downloads_this_period INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX idx_memberships_tier_id ON public.memberships(tier_id);
CREATE INDEX idx_memberships_status ON public.memberships(status);
CREATE INDEX idx_memberships_current_period_end ON public.memberships(current_period_end);

-- ============================================
-- TABLE: reviews
-- ============================================
-- Product reviews and ratings
--
-- WHAT IT DOES:
-- - Stores customer reviews
-- - Enables social proof
-- - Helps improve products
-- - Builds trust with new customers
-- ============================================

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Who reviewed what
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    purchase_id UUID REFERENCES public.purchases(id) ON DELETE SET NULL,

    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,

    -- What they liked/disliked
    pros TEXT[],
    cons TEXT[],

    -- Verification
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE, -- admin approval
    is_featured BOOLEAN DEFAULT FALSE,

    -- Helpfulness
    helpful_votes INTEGER DEFAULT 0,
    unhelpful_votes INTEGER DEFAULT 0,

    -- Admin response
    admin_response TEXT,
    admin_responded_at TIMESTAMPTZ,

    -- Moderation
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_reason TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- One review per user per product
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_reviews_is_approved ON public.reviews(is_approved);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at);

-- ============================================
-- TABLE: affiliates
-- ============================================
-- Affiliate program management
--
-- WHAT IT DOES:
-- - Tracks affiliate partners
-- - Stores commission rates
-- - Links to their discount codes
-- - Manages payouts
-- ============================================

CREATE TABLE IF NOT EXISTS public.affiliates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Link to user account
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,

    -- Affiliate info
    affiliate_code VARCHAR(50) NOT NULL UNIQUE, -- their unique referral code
    company_name VARCHAR(255),
    website_url TEXT,
    social_media JSONB, -- instagram, youtube, tiktok handles

    -- Commission structure
    commission_type VARCHAR(20) DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed')),
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00, -- percentage or fixed amount
    commission_currency VARCHAR(10) DEFAULT 'BOB',

    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES public.users(id),

    -- Payment info
    payment_method VARCHAR(50), -- bank_transfer, paypal, etc.
    payment_details JSONB, -- bank account, paypal email, etc.
    minimum_payout DECIMAL(10,2) DEFAULT 100.00,

    -- Stats (denormalized)
    total_referrals INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_commission_earned DECIMAL(10,2) DEFAULT 0,
    total_commission_paid DECIMAL(10,2) DEFAULT 0,
    pending_commission DECIMAL(10,2) DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_affiliates_user_id ON public.affiliates(user_id);
CREATE INDEX idx_affiliates_affiliate_code ON public.affiliates(affiliate_code);
CREATE INDEX idx_affiliates_status ON public.affiliates(status);

-- ============================================
-- TABLE: affiliate_referrals
-- ============================================
-- Track individual referrals
--
-- WHAT IT DOES:
-- - Records each referred visitor
-- - Tracks conversions
-- - Links to eventual purchases
-- - Calculates commissions
-- ============================================

CREATE TABLE IF NOT EXISTS public.affiliate_referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,

    -- Referred user
    referred_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    referred_email VARCHAR(255),

    -- Tracking
    referral_code VARCHAR(50) NOT NULL,
    landing_page TEXT,
    ip_address INET,
    user_agent TEXT,

    -- Conversion
    converted_at TIMESTAMPTZ,
    purchase_id UUID REFERENCES public.purchases(id) ON DELETE SET NULL,
    purchase_amount DECIMAL(10,2),

    -- Commission
    commission_amount DECIMAL(10,2),
    commission_status VARCHAR(20) DEFAULT 'pending' CHECK (commission_status IN ('pending', 'approved', 'paid', 'cancelled')),
    paid_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_affiliate_referrals_affiliate_id ON public.affiliate_referrals(affiliate_id);
CREATE INDEX idx_affiliate_referrals_referred_user_id ON public.affiliate_referrals(referred_user_id);
CREATE INDEX idx_affiliate_referrals_created_at ON public.affiliate_referrals(created_at);
CREATE INDEX idx_affiliate_referrals_commission_status ON public.affiliate_referrals(commission_status);

-- ============================================
-- TABLE: affiliate_payouts
-- ============================================
-- Track affiliate payments
--
-- WHAT IT DOES:
-- - Records all payments to affiliates
-- - Tracks payment status
-- - Provides payment history
-- - Manages commission payouts
-- ============================================

CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,

    -- Payment details
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'BOB',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),

    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

    -- Period covered
    period_start DATE,
    period_end DATE,
    referrals_included UUID[], -- referral IDs included in this payout

    -- Notes
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_affiliate_payouts_affiliate_id ON public.affiliate_payouts(affiliate_id);
CREATE INDEX idx_affiliate_payouts_status ON public.affiliate_payouts(status);

-- Triggers for updated_at
CREATE TRIGGER update_membership_tiers_updated_at
    BEFORE UPDATE ON public.membership_tiers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at
    BEFORE UPDATE ON public.memberships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliates_updated_at
    BEFORE UPDATE ON public.affiliates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default membership tiers
INSERT INTO public.membership_tiers (name, slug, description, access_level, features, price_monthly_bob, price_yearly_bob) VALUES
('Básico', 'basico', 'Acceso a herramientas básicas de finanzas personales', 1,
 '["Acceso a plantillas básicas", "Actualizaciones mensuales", "Soporte por email"]'::jsonb,
 29.00, 290.00),
('Pro', 'pro', 'Todo lo básico + herramientas para emprendedores', 2,
 '["Todo lo de Básico", "Plantillas de emprendedor", "Plantillas nuevas cada mes", "Soporte prioritario", "Comunidad privada"]'::jsonb,
 79.00, 790.00),
('VIP', 'vip', 'Acceso completo a todo + mentoría', 3,
 '["Todo lo de Pro", "Acceso a TODO", "Mentoría mensual", "Consultas ilimitadas", "Plantillas personalizadas"]'::jsonb,
 199.00, 1990.00)
ON CONFLICT (slug) DO NOTHING;

COMMENT ON TABLE public.membership_tiers IS 'Define subscription membership levels';
COMMENT ON TABLE public.memberships IS 'Active user subscriptions';
COMMENT ON TABLE public.reviews IS 'Product reviews and ratings from customers';
COMMENT ON TABLE public.affiliates IS 'Affiliate partner accounts';
COMMENT ON TABLE public.affiliate_referrals IS 'Individual referral tracking';
COMMENT ON TABLE public.affiliate_payouts IS 'Affiliate commission payments';
