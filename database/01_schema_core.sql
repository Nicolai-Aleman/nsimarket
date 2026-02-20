-- ============================================
-- NO SOMOS IGNORANTES - DATABASE SCHEMA
-- Core Tables: Users, Products, Purchases
-- ============================================
-- Run this first to create the foundational tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLE: users
-- ============================================
-- Stores all registered users (both free and paid)
-- This is your customer database
--
-- WHAT IT DOES:
-- - Tracks everyone who signs up
-- - Stores their contact info
-- - Knows if they're free or paid
-- - Tracks how they found you
-- ============================================

CREATE TABLE IF NOT EXISTS public.users (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Authentication (links to Supabase Auth)
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Basic info
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    country VARCHAR(100) DEFAULT 'Bolivia',
    city VARCHAR(100),

    -- Account status
    account_type VARCHAR(20) DEFAULT 'free' CHECK (account_type IN ('free', 'premium', 'vip', 'admin')),
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,

    -- Marketing & acquisition
    acquisition_source VARCHAR(100), -- youtube, tiktok, instagram, referral, organic
    acquisition_campaign VARCHAR(255), -- specific campaign name
    referred_by UUID REFERENCES public.users(id), -- who referred them
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(255),

    -- Engagement tracking
    total_purchases INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    total_downloads INTEGER DEFAULT 0,
    last_activity_at TIMESTAMPTZ,
    last_purchase_at TIMESTAMPTZ,

    -- Communication preferences
    email_marketing_consent BOOLEAN DEFAULT TRUE,
    whatsapp_consent BOOLEAN DEFAULT FALSE,
    preferred_language VARCHAR(10) DEFAULT 'es',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX idx_users_account_type ON public.users(account_type);
CREATE INDEX idx_users_acquisition_source ON public.users(acquisition_source);
CREATE INDEX idx_users_created_at ON public.users(created_at);

-- ============================================
-- TABLE: products
-- ============================================
-- All your Excel templates and digital products
--
-- WHAT IT DOES:
-- - Stores every product you sell
-- - Tracks pricing (including discounts)
-- - Knows which category each belongs to
-- - Stores the actual file download link
-- ============================================

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Basic info
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE, -- URL-friendly name (e.g., "bola-de-nieve")
    description TEXT,
    short_description VARCHAR(500),

    -- Categorization
    category VARCHAR(50) NOT NULL CHECK (category IN ('personal', 'emprendedor', 'pack', 'membership')),
    subcategory VARCHAR(100), -- more specific: deudas, presupuesto, ventas, etc.
    tags TEXT[], -- array of tags for filtering

    -- Pricing
    price_bolivianos DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_usd DECIMAL(10,2),
    original_price_bolivianos DECIMAL(10,2), -- for showing discounts
    is_free BOOLEAN DEFAULT FALSE,

    -- Product type
    product_type VARCHAR(50) DEFAULT 'template' CHECK (product_type IN ('template', 'pack', 'course', 'membership', 'ebook')),

    -- Files
    file_url TEXT, -- Supabase Storage URL
    preview_url TEXT, -- preview image or video
    thumbnail_url TEXT,
    file_size_mb DECIMAL(5,2),
    file_format VARCHAR(50) DEFAULT 'xlsx', -- xlsx, pdf, etc.

    -- Content for YouTube/SEO
    youtube_video_id VARCHAR(20), -- related YouTube video
    related_topics TEXT[], -- topics this covers (for content insights)

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,

    -- Stats (denormalized for speed)
    total_sales INTEGER DEFAULT 0,
    total_downloads INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    average_rating DECIMAL(2,1) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_is_free ON public.products(is_free);
CREATE INDEX idx_products_total_sales ON public.products(total_sales DESC);

-- ============================================
-- TABLE: purchases
-- ============================================
-- Every transaction (including free "purchases")
--
-- WHAT IT DOES:
-- - Records every sale
-- - Tracks payment status
-- - Links user to product
-- - Stores payment details for accounting
-- ============================================

CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Order identification
    order_number VARCHAR(50) UNIQUE, -- NSI-2024-001234

    -- Who bought what
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,

    -- Pricing at time of purchase (important: prices can change)
    price_paid DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'BOB',
    original_price DECIMAL(10,2),
    discount_amount DECIMAL(10,2) DEFAULT 0,
    discount_code VARCHAR(50),

    -- Payment info
    payment_method VARCHAR(50), -- qr, transfer, card, free
    payment_status VARCHAR(30) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
    payment_reference VARCHAR(255), -- bank reference or transaction ID
    payment_proof_url TEXT, -- uploaded payment screenshot

    -- Fulfillment
    is_delivered BOOLEAN DEFAULT FALSE,
    delivered_at TIMESTAMPTZ,
    download_link TEXT, -- unique download link for this purchase
    download_expires_at TIMESTAMPTZ,

    -- Attribution
    affiliate_id UUID REFERENCES public.users(id), -- who referred this sale
    affiliate_commission DECIMAL(10,2),

    -- For packs: track included products
    is_pack BOOLEAN DEFAULT FALSE,
    pack_products JSONB, -- array of product IDs included

    -- Notes
    customer_notes TEXT,
    admin_notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX idx_purchases_product_id ON public.purchases(product_id);
CREATE INDEX idx_purchases_payment_status ON public.purchases(payment_status);
CREATE INDEX idx_purchases_created_at ON public.purchases(created_at);
CREATE INDEX idx_purchases_order_number ON public.purchases(order_number);

-- ============================================
-- TABLE: downloads
-- ============================================
-- Every time someone downloads a file
--
-- WHAT IT DOES:
-- - Tracks all downloads
-- - Limits downloads per purchase
-- - Detects suspicious activity
-- - Provides usage analytics
-- ============================================

CREATE TABLE IF NOT EXISTS public.downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Who downloaded what
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    purchase_id UUID REFERENCES public.purchases(id) ON DELETE SET NULL,

    -- Download type
    download_type VARCHAR(20) DEFAULT 'purchased' CHECK (download_type IN ('free', 'purchased', 'sample', 'membership')),

    -- Technical tracking
    ip_address INET,
    user_agent TEXT,
    country_code VARCHAR(5),
    device_type VARCHAR(50), -- mobile, desktop, tablet
    browser VARCHAR(100),

    -- Download status
    is_successful BOOLEAN DEFAULT TRUE,
    file_size_bytes BIGINT,
    download_duration_ms INTEGER,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_downloads_user_id ON public.downloads(user_id);
CREATE INDEX idx_downloads_product_id ON public.downloads(product_id);
CREATE INDEX idx_downloads_purchase_id ON public.downloads(purchase_id);
CREATE INDEX idx_downloads_created_at ON public.downloads(created_at);
CREATE INDEX idx_downloads_download_type ON public.downloads(download_type);

-- ============================================
-- TRIGGER: Auto-update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at
    BEFORE UPDATE ON public.purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Generate order number
-- ============================================

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part VARCHAR(4);
    sequence_num INTEGER;
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');

    -- Get next sequence number for this year
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(order_number FROM 10) AS INTEGER)
    ), 0) + 1
    INTO sequence_num
    FROM public.purchases
    WHERE order_number LIKE 'NSI-' || year_part || '-%';

    NEW.order_number := 'NSI-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
    BEFORE INSERT ON public.purchases
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL)
    EXECUTE FUNCTION generate_order_number();

COMMENT ON TABLE public.users IS 'All registered users - your customer database';
COMMENT ON TABLE public.products IS 'Excel templates and digital products for sale';
COMMENT ON TABLE public.purchases IS 'All transactions including free downloads';
COMMENT ON TABLE public.downloads IS 'Track every file download for analytics';
