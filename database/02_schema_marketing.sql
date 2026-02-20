-- ============================================
-- NO SOMOS IGNORANTES - DATABASE SCHEMA
-- Marketing Tables: Interests, Emails, Automations
-- ============================================
-- Run after 01_schema_core.sql

-- ============================================
-- TABLE: user_interests
-- ============================================
-- Track what topics each user is interested in
--
-- WHAT IT DOES:
-- - Records what topics users care about
-- - Helps personalize recommendations
-- - Guides YouTube content strategy
-- - Enables targeted email campaigns
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

    -- Interest categorization
    interest_category VARCHAR(100) NOT NULL, -- finanzas-personales, emprendimiento, inversiones, etc.
    interest_topic VARCHAR(255), -- specific topic like "pagar-deudas", "flujo-de-caja"
    interest_level VARCHAR(20) DEFAULT 'medium' CHECK (interest_level IN ('low', 'medium', 'high', 'very_high')),

    -- How we know this
    source VARCHAR(50), -- quiz, browsing, purchase, download, explicit
    confidence_score DECIMAL(3,2) DEFAULT 0.5, -- 0.00 to 1.00

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicates
    UNIQUE(user_id, interest_category, interest_topic)
);

CREATE INDEX idx_user_interests_user_id ON public.user_interests(user_id);
CREATE INDEX idx_user_interests_category ON public.user_interests(interest_category);
CREATE INDEX idx_user_interests_topic ON public.user_interests(interest_topic);

-- ============================================
-- TABLE: email_campaigns
-- ============================================
-- Track email marketing campaigns
--
-- WHAT IT DOES:
-- - Defines email campaigns
-- - Stores email templates
-- - Tracks campaign performance
-- ============================================

CREATE TABLE IF NOT EXISTS public.email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Campaign identification
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    campaign_type VARCHAR(50) NOT NULL CHECK (campaign_type IN (
        'welcome',
        'upsell',
        'abandoned_cart',
        'post_purchase',
        're_engagement',
        'newsletter',
        'promotion',
        'educational'
    )),

    -- Content
    subject_line VARCHAR(500) NOT NULL,
    preview_text VARCHAR(255),
    html_content TEXT,
    plain_text_content TEXT,

    -- Targeting
    target_segment JSONB, -- criteria for who receives this
    exclude_segment JSONB, -- who to exclude

    -- Scheduling
    is_automated BOOLEAN DEFAULT FALSE,
    trigger_event VARCHAR(100), -- what triggers this campaign
    delay_minutes INTEGER DEFAULT 0, -- delay after trigger

    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed')),

    -- Stats (denormalized)
    total_sent INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_unsubscribed INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ
);

CREATE INDEX idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX idx_email_campaigns_campaign_type ON public.email_campaigns(campaign_type);
CREATE INDEX idx_email_campaigns_trigger_event ON public.email_campaigns(trigger_event);

-- ============================================
-- TABLE: email_events
-- ============================================
-- Track every email interaction
--
-- WHAT IT DOES:
-- - Records sends, opens, clicks
-- - Tracks unsubscribes and bounces
-- - Measures campaign effectiveness
-- - Helps calculate engagement scores
-- ============================================

CREATE TABLE IF NOT EXISTS public.email_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    email_address VARCHAR(255) NOT NULL,
    campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE SET NULL,

    -- Event type
    event_type VARCHAR(30) NOT NULL CHECK (event_type IN (
        'sent',
        'delivered',
        'opened',
        'clicked',
        'bounced',
        'complained',
        'unsubscribed'
    )),

    -- Event details
    link_clicked TEXT, -- which link was clicked
    bounce_type VARCHAR(50), -- hard, soft
    bounce_reason TEXT,

    -- Technical
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_events_user_id ON public.email_events(user_id);
CREATE INDEX idx_email_events_campaign_id ON public.email_events(campaign_id);
CREATE INDEX idx_email_events_event_type ON public.email_events(event_type);
CREATE INDEX idx_email_events_created_at ON public.email_events(created_at);
CREATE INDEX idx_email_events_email_address ON public.email_events(email_address);

-- ============================================
-- TABLE: automation_logs
-- ============================================
-- Track all automated actions
--
-- WHAT IT DOES:
-- - Records every automation that runs
-- - Helps debug automation issues
-- - Tracks automation effectiveness
-- - Provides audit trail
-- ============================================

CREATE TABLE IF NOT EXISTS public.automation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- What automation ran
    automation_name VARCHAR(255) NOT NULL,
    automation_type VARCHAR(50) NOT NULL CHECK (automation_type IN (
        'email',
        'webhook',
        'notification',
        'data_update',
        'file_delivery',
        'analytics',
        'cleanup'
    )),

    -- Who/what triggered it
    trigger_event VARCHAR(100) NOT NULL,
    trigger_data JSONB, -- data that triggered the automation
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    related_entity_type VARCHAR(50), -- purchase, download, etc.
    related_entity_id UUID,

    -- Result
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
    result_data JSONB,
    error_message TEXT,

    -- Performance
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_automation_logs_automation_name ON public.automation_logs(automation_name);
CREATE INDEX idx_automation_logs_status ON public.automation_logs(status);
CREATE INDEX idx_automation_logs_user_id ON public.automation_logs(user_id);
CREATE INDEX idx_automation_logs_created_at ON public.automation_logs(created_at);
CREATE INDEX idx_automation_logs_trigger_event ON public.automation_logs(trigger_event);

-- ============================================
-- TABLE: page_views
-- ============================================
-- Track website visits for analytics
--
-- WHAT IT DOES:
-- - Records every page visit
-- - Tracks user journey
-- - Identifies popular content
-- - Helps optimize conversion
-- ============================================

CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Who viewed
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    session_id VARCHAR(100), -- anonymous session tracking

    -- What was viewed
    page_url TEXT NOT NULL,
    page_type VARCHAR(50), -- home, product, checkout, blog, etc.
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,

    -- Referrer
    referrer_url TEXT,
    referrer_source VARCHAR(100), -- google, youtube, tiktok, direct, etc.

    -- Technical
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    country_code VARCHAR(5),

    -- Engagement
    time_on_page_seconds INTEGER,
    scroll_depth_percent INTEGER,

    -- UTM tracking
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(255),
    utm_content VARCHAR(255),
    utm_term VARCHAR(255),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_page_views_user_id ON public.page_views(user_id);
CREATE INDEX idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX idx_page_views_product_id ON public.page_views(product_id);
CREATE INDEX idx_page_views_page_type ON public.page_views(page_type);
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at);
CREATE INDEX idx_page_views_referrer_source ON public.page_views(referrer_source);

-- ============================================
-- TABLE: discount_codes
-- ============================================
-- Promotional codes and discounts
--
-- WHAT IT DOES:
-- - Creates discount codes
-- - Tracks usage limits
-- - Supports different discount types
-- - Enables promotions and partnerships
-- ============================================

CREATE TABLE IF NOT EXISTS public.discount_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Code info
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,

    -- Discount type
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
    discount_value DECIMAL(10,2) NOT NULL, -- percentage or fixed amount
    max_discount DECIMAL(10,2), -- cap for percentage discounts

    -- Validity
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,

    -- Usage limits
    max_uses INTEGER, -- total uses allowed
    max_uses_per_user INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,

    -- Restrictions
    minimum_purchase DECIMAL(10,2),
    applicable_products UUID[], -- NULL means all products
    applicable_categories TEXT[], -- NULL means all categories

    -- Attribution
    affiliate_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    campaign_name VARCHAR(255),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_discount_codes_code ON public.discount_codes(code);
CREATE INDEX idx_discount_codes_is_active ON public.discount_codes(is_active);
CREATE INDEX idx_discount_codes_affiliate_id ON public.discount_codes(affiliate_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_interests_updated_at
    BEFORE UPDATE ON public.user_interests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at
    BEFORE UPDATE ON public.email_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discount_codes_updated_at
    BEFORE UPDATE ON public.discount_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.user_interests IS 'Track what topics each user is interested in for personalization';
COMMENT ON TABLE public.email_campaigns IS 'Email marketing campaigns and templates';
COMMENT ON TABLE public.email_events IS 'Track all email interactions (opens, clicks, etc.)';
COMMENT ON TABLE public.automation_logs IS 'Audit trail for all automated actions';
COMMENT ON TABLE public.page_views IS 'Website analytics and user journey tracking';
COMMENT ON TABLE public.discount_codes IS 'Promotional codes and affiliate discounts';
