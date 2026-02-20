-- ============================================
-- NO SOMOS IGNORANTES - USER FLOWS
-- Step-by-step logic for every user action
-- ============================================
-- This file documents and implements all user flows

-- ============================================
-- FLOW 1: USER REGISTRATION
-- ============================================
-- What happens when someone signs up
--
-- STEP BY STEP:
-- 1. User clicks "Registrarse" on website
-- 2. Supabase Auth creates auth.users record
-- 3. Trigger fires: on_auth_user_created
-- 4. handle_new_user() function runs:
--    - Creates public.users profile
--    - Logs the registration event
-- 5. User gets welcome email (via Edge Function)
-- 6. User is redirected to dashboard
--
-- DATABASE TABLES USED:
-- - auth.users (Supabase built-in)
-- - public.users (our profile data)
-- - public.automation_logs (tracking)

-- Helper view: See recent registrations
CREATE OR REPLACE VIEW public.recent_registrations AS
SELECT
    u.id,
    u.email,
    u.full_name,
    u.acquisition_source,
    u.created_at,
    COALESCE(al.status, 'unknown') as registration_status
FROM public.users u
LEFT JOIN public.automation_logs al
    ON al.user_id = u.id
    AND al.automation_name = 'new_user_registration'
WHERE u.created_at > NOW() - INTERVAL '7 days'
ORDER BY u.created_at DESC;

-- ============================================
-- FLOW 2: FREE DOWNLOAD
-- ============================================
-- What happens when user downloads a free template
--
-- STEP BY STEP:
-- 1. User browses free products (is_free = true)
-- 2. User clicks "Descargar Gratis"
-- 3. If not logged in: redirect to login/register
-- 4. System creates purchase record (price_paid = 0)
-- 5. record_download() function logs the download
-- 6. User stats updated (total_downloads++)
-- 7. User interests tracked based on product category
-- 8. File download starts
--
-- DATABASE TABLES USED:
-- - public.products (get file info)
-- - public.purchases (record transaction)
-- - public.downloads (track download)
-- - public.user_interests (personalization)

-- Function: Process free download
CREATE OR REPLACE FUNCTION public.process_free_download(
    p_user_id UUID,
    p_product_id UUID,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    download_url TEXT,
    message TEXT
) AS $$
DECLARE
    v_product RECORD;
    v_purchase_id UUID;
    v_download_id UUID;
BEGIN
    -- Get product details
    SELECT * INTO v_product
    FROM public.products
    WHERE id = p_product_id AND is_active = true;

    IF v_product IS NULL THEN
        RETURN QUERY SELECT FALSE, NULL::TEXT, 'Producto no encontrado'::TEXT;
        RETURN;
    END IF;

    IF NOT v_product.is_free THEN
        RETURN QUERY SELECT FALSE, NULL::TEXT, 'Este producto no es gratis'::TEXT;
        RETURN;
    END IF;

    -- Create purchase record for tracking
    INSERT INTO public.purchases (
        user_id,
        product_id,
        price_paid,
        original_price,
        payment_method,
        payment_status,
        is_delivered,
        delivered_at
    ) VALUES (
        p_user_id,
        p_product_id,
        0,
        v_product.price_bolivianos,
        'free',
        'completed',
        TRUE,
        NOW()
    )
    RETURNING id INTO v_purchase_id;

    -- Record the download
    v_download_id := record_download(
        p_user_id,
        p_product_id,
        v_purchase_id,
        'free',
        p_ip_address,
        p_user_agent
    );

    -- Track user interest
    PERFORM track_user_interest(
        p_user_id,
        v_product.category,
        v_product.subcategory,
        'download'
    );

    RETURN QUERY SELECT TRUE, v_product.file_url, 'Descarga exitosa'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FLOW 3: PAID PURCHASE
-- ============================================
-- What happens when user buys a template
--
-- STEP BY STEP:
-- 1. User browses paid products
-- 2. User clicks "Comprar"
-- 3. User enters payment info (QR, transfer)
-- 4. System creates pending purchase
-- 5. User uploads payment proof (optional)
-- 6. Admin or webhook verifies payment
-- 7. process_completed_purchase() triggers:
--    - Updates purchase to completed
--    - Updates user stats
--    - Updates product stats
--    - Processes affiliate commission
-- 8. User receives download access
-- 9. Confirmation email sent
--
-- DATABASE TABLES USED:
-- - public.products
-- - public.purchases
-- - public.users (stats update)
-- - public.affiliates (commission)
-- - public.automation_logs

-- Function: Create pending purchase
CREATE OR REPLACE FUNCTION public.create_purchase(
    p_user_id UUID,
    p_product_id UUID,
    p_discount_code VARCHAR DEFAULT NULL,
    p_affiliate_code VARCHAR DEFAULT NULL,
    p_payment_method VARCHAR DEFAULT 'qr'
)
RETURNS TABLE (
    success BOOLEAN,
    purchase_id UUID,
    order_number VARCHAR,
    amount_to_pay DECIMAL,
    message TEXT
) AS $$
DECLARE
    v_product RECORD;
    v_discount RECORD;
    v_final_price DECIMAL;
    v_discount_amount DECIMAL := 0;
    v_affiliate_id UUID;
    v_purchase_id UUID;
    v_order_number VARCHAR;
BEGIN
    -- Get product
    SELECT * INTO v_product
    FROM public.products
    WHERE id = p_product_id AND is_active = true;

    IF v_product IS NULL THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::VARCHAR, NULL::DECIMAL, 'Producto no encontrado'::TEXT;
        RETURN;
    END IF;

    v_final_price := v_product.price_bolivianos;

    -- Apply discount if provided
    IF p_discount_code IS NOT NULL THEN
        SELECT * INTO v_discount
        FROM validate_discount_code(p_discount_code, p_user_id, p_product_id, v_product.price_bolivianos);

        IF v_discount.is_valid THEN
            v_discount_amount := v_discount.final_discount;
            v_final_price := v_product.price_bolivianos - v_discount_amount;
        END IF;
    END IF;

    -- Get affiliate if code provided
    IF p_affiliate_code IS NOT NULL THEN
        SELECT user_id INTO v_affiliate_id
        FROM public.affiliates
        WHERE affiliate_code = p_affiliate_code AND status = 'approved';
    END IF;

    -- Create purchase
    INSERT INTO public.purchases (
        user_id,
        product_id,
        price_paid,
        original_price,
        discount_amount,
        discount_code,
        payment_method,
        payment_status,
        affiliate_id
    ) VALUES (
        p_user_id,
        p_product_id,
        v_final_price,
        v_product.price_bolivianos,
        v_discount_amount,
        p_discount_code,
        p_payment_method,
        'pending',
        v_affiliate_id
    )
    RETURNING id, order_number INTO v_purchase_id, v_order_number;

    -- Apply discount code usage
    IF p_discount_code IS NOT NULL AND v_discount.is_valid THEN
        PERFORM apply_discount_code(p_discount_code);
    END IF;

    RETURN QUERY SELECT
        TRUE,
        v_purchase_id,
        v_order_number,
        v_final_price,
        ('Orden creada: ' || v_order_number)::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Confirm payment (called by admin or webhook)
CREATE OR REPLACE FUNCTION public.confirm_payment(
    p_purchase_id UUID,
    p_payment_reference VARCHAR DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.purchases
    SET
        payment_status = 'completed',
        payment_reference = COALESCE(p_payment_reference, payment_reference)
    WHERE id = p_purchase_id
      AND payment_status = 'pending';

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FLOW 4: UPGRADE FREE → PRO
-- ============================================
-- What happens when free user upgrades
--
-- STEP BY STEP:
-- 1. Free user sees upsell offer
-- 2. User clicks "Mejorar a Pro"
-- 3. User selects membership tier
-- 4. User completes payment
-- 5. System creates membership record
-- 6. User account_type updated to premium/vip
-- 7. User gets access to premium products
-- 8. Welcome to premium email sent
--
-- DATABASE TABLES USED:
-- - public.membership_tiers
-- - public.memberships
-- - public.users (account_type update)

-- Function: Subscribe to membership
CREATE OR REPLACE FUNCTION public.subscribe_membership(
    p_user_id UUID,
    p_tier_slug VARCHAR,
    p_billing_period VARCHAR DEFAULT 'monthly'
)
RETURNS TABLE (
    success BOOLEAN,
    membership_id UUID,
    amount_to_pay DECIMAL,
    message TEXT
) AS $$
DECLARE
    v_tier RECORD;
    v_price DECIMAL;
    v_membership_id UUID;
    v_period_end TIMESTAMPTZ;
BEGIN
    -- Get tier
    SELECT * INTO v_tier
    FROM public.membership_tiers
    WHERE slug = p_tier_slug AND is_active = true;

    IF v_tier IS NULL THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::DECIMAL, 'Plan no encontrado'::TEXT;
        RETURN;
    END IF;

    -- Check if user already has active membership
    IF EXISTS (
        SELECT 1 FROM public.memberships
        WHERE user_id = p_user_id AND status = 'active'
    ) THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::DECIMAL, 'Ya tienes una membresía activa'::TEXT;
        RETURN;
    END IF;

    -- Calculate price and period
    IF p_billing_period = 'yearly' THEN
        v_price := v_tier.price_yearly_bob;
        v_period_end := NOW() + INTERVAL '1 year';
    ELSE
        v_price := v_tier.price_monthly_bob;
        v_period_end := NOW() + INTERVAL '1 month';
    END IF;

    -- Create membership (pending payment)
    INSERT INTO public.memberships (
        user_id,
        tier_id,
        status,
        billing_period,
        price_paid,
        current_period_start,
        current_period_end
    ) VALUES (
        p_user_id,
        v_tier.id,
        'trial', -- Will be updated to 'active' after payment
        p_billing_period,
        v_price,
        NOW(),
        v_period_end
    )
    RETURNING id INTO v_membership_id;

    RETURN QUERY SELECT TRUE, v_membership_id, v_price, 'Membresía creada'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Activate membership after payment
CREATE OR REPLACE FUNCTION public.activate_membership(p_membership_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_membership RECORD;
    v_tier RECORD;
BEGIN
    SELECT * INTO v_membership FROM public.memberships WHERE id = p_membership_id;
    SELECT * INTO v_tier FROM public.membership_tiers WHERE id = v_membership.tier_id;

    -- Update membership status
    UPDATE public.memberships
    SET
        status = 'active',
        started_at = NOW(),
        last_payment_at = NOW()
    WHERE id = p_membership_id;

    -- Update user account type
    UPDATE public.users
    SET account_type = CASE
        WHEN v_tier.access_level = 3 THEN 'vip'
        WHEN v_tier.access_level >= 2 THEN 'premium'
        ELSE 'premium'
    END
    WHERE id = v_membership.user_id;

    -- Log automation
    INSERT INTO public.automation_logs (
        automation_name,
        automation_type,
        trigger_event,
        trigger_data,
        user_id,
        related_entity_type,
        related_entity_id,
        status,
        started_at,
        completed_at
    ) VALUES (
        'membership_activation',
        'data_update',
        'membership.activated',
        jsonb_build_object('tier', v_tier.name, 'period', v_membership.billing_period),
        v_membership.user_id,
        'membership',
        p_membership_id,
        'completed',
        NOW(),
        NOW()
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FLOW 5: RETURNING USER EXPERIENCE
-- ============================================
-- What happens when user comes back
--
-- STEP BY STEP:
-- 1. User visits website
-- 2. Check if logged in (session/cookie)
-- 3. If logged in: show personalized content
--    - Previously purchased products
--    - Recommended products based on interests
--    - Membership status
-- 4. Update last_activity_at
-- 5. Track page view
--
-- DATABASE TABLES USED:
-- - public.users (activity tracking)
-- - public.purchases (purchase history)
-- - public.user_interests (personalization)
-- - public.page_views (analytics)

-- Function: Get user dashboard data
CREATE OR REPLACE FUNCTION public.get_user_dashboard(p_user_id UUID)
RETURNS TABLE (
    user_info JSONB,
    recent_purchases JSONB,
    recommended_products JSONB,
    membership_info JSONB
) AS $$
BEGIN
    -- Update last activity
    UPDATE public.users SET last_activity_at = NOW() WHERE id = p_user_id;

    RETURN QUERY
    SELECT
        -- User info
        (SELECT jsonb_build_object(
            'full_name', u.full_name,
            'email', u.email,
            'account_type', u.account_type,
            'total_purchases', u.total_purchases,
            'total_downloads', u.total_downloads,
            'member_since', u.created_at
        ) FROM public.users u WHERE u.id = p_user_id),

        -- Recent purchases
        (SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'order_number', p.order_number,
            'product_name', pr.name,
            'price_paid', p.price_paid,
            'purchased_at', p.created_at,
            'download_link', pr.file_url
        ) ORDER BY p.created_at DESC), '[]'::jsonb)
        FROM public.purchases p
        JOIN public.products pr ON p.product_id = pr.id
        WHERE p.user_id = p_user_id
          AND p.payment_status = 'completed'
        LIMIT 5),

        -- Recommended products (using existing function)
        (SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'id', rp.product_id,
            'name', rp.name,
            'price', rp.price_bolivianos,
            'category', rp.category
        )), '[]'::jsonb)
        FROM get_recommended_products(p_user_id, 4) rp),

        -- Membership info
        (SELECT COALESCE(jsonb_build_object(
            'tier_name', mt.name,
            'status', m.status,
            'current_period_end', m.current_period_end,
            'downloads_used', m.downloads_this_period,
            'download_limit', mt.monthly_download_limit
        ), NULL::jsonb)
        FROM public.memberships m
        JOIN public.membership_tiers mt ON m.tier_id = mt.id
        WHERE m.user_id = p_user_id AND m.status = 'active'
        LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FLOW 6: EMAIL CAPTURE (Lead Magnet)
-- ============================================
-- What happens when visitor enters email for free resource
--
-- STEP BY STEP:
-- 1. Visitor sees lead magnet offer
-- 2. Visitor enters email
-- 3. System checks if email exists
-- 4. If new: create user with account_type='free'
-- 5. If existing: update last_activity
-- 6. Track acquisition source
-- 7. Send welcome email with free resource
-- 8. Add to email nurture sequence
--
-- DATABASE TABLES USED:
-- - public.users
-- - public.automation_logs
-- - public.email_campaigns (trigger welcome)

-- Function: Capture email lead
CREATE OR REPLACE FUNCTION public.capture_email_lead(
    p_email VARCHAR,
    p_full_name VARCHAR DEFAULT NULL,
    p_source VARCHAR DEFAULT 'lead_magnet',
    p_campaign VARCHAR DEFAULT NULL,
    p_utm_source VARCHAR DEFAULT NULL,
    p_utm_medium VARCHAR DEFAULT NULL,
    p_utm_campaign VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    user_id UUID,
    is_new_user BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_user_id UUID;
    v_is_new BOOLEAN := FALSE;
BEGIN
    -- Check if user exists
    SELECT id INTO v_user_id FROM public.users WHERE email = LOWER(p_email);

    IF v_user_id IS NULL THEN
        -- Create new user
        INSERT INTO public.users (
            email,
            full_name,
            account_type,
            acquisition_source,
            acquisition_campaign,
            utm_source,
            utm_medium,
            utm_campaign,
            email_marketing_consent
        ) VALUES (
            LOWER(p_email),
            p_full_name,
            'free',
            p_source,
            p_campaign,
            p_utm_source,
            p_utm_medium,
            p_utm_campaign,
            TRUE
        )
        RETURNING id INTO v_user_id;

        v_is_new := TRUE;

        -- Log automation
        INSERT INTO public.automation_logs (
            automation_name,
            automation_type,
            trigger_event,
            trigger_data,
            user_id,
            status,
            started_at,
            completed_at
        ) VALUES (
            'email_lead_capture',
            'data_update',
            'lead.captured',
            jsonb_build_object('source', p_source, 'campaign', p_campaign),
            v_user_id,
            'completed',
            NOW(),
            NOW()
        );
    ELSE
        -- Update existing user activity
        UPDATE public.users
        SET last_activity_at = NOW()
        WHERE id = v_user_id;
    END IF;

    RETURN QUERY SELECT TRUE, v_user_id, v_is_new,
        CASE WHEN v_is_new THEN 'Usuario creado' ELSE 'Usuario existente' END::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FLOW 7: REVIEW SYSTEM
-- ============================================
-- What happens when user writes a review
--
-- STEP BY STEP:
-- 1. User goes to purchased product
-- 2. User clicks "Escribir reseña"
-- 3. System verifies purchase exists
-- 4. User submits rating + review
-- 5. Review saved (is_approved = false)
-- 6. Admin notified for moderation
-- 7. After approval: product stats updated
--
-- DATABASE TABLES USED:
-- - public.reviews
-- - public.purchases (verification)
-- - public.products (rating update)

-- Function: Submit review
CREATE OR REPLACE FUNCTION public.submit_review(
    p_user_id UUID,
    p_product_id UUID,
    p_rating INTEGER,
    p_title VARCHAR DEFAULT NULL,
    p_content TEXT DEFAULT NULL,
    p_pros TEXT[] DEFAULT NULL,
    p_cons TEXT[] DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    review_id UUID,
    message TEXT
) AS $$
DECLARE
    v_purchase_id UUID;
    v_review_id UUID;
BEGIN
    -- Validate rating
    IF p_rating < 1 OR p_rating > 5 THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Rating debe ser entre 1 y 5'::TEXT;
        RETURN;
    END IF;

    -- Check if user purchased this product
    SELECT id INTO v_purchase_id
    FROM public.purchases
    WHERE user_id = p_user_id
      AND product_id = p_product_id
      AND payment_status = 'completed'
    LIMIT 1;

    -- Check if review already exists
    IF EXISTS (
        SELECT 1 FROM public.reviews
        WHERE user_id = p_user_id AND product_id = p_product_id
    ) THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Ya escribiste una reseña para este producto'::TEXT;
        RETURN;
    END IF;

    -- Create review
    INSERT INTO public.reviews (
        user_id,
        product_id,
        purchase_id,
        rating,
        title,
        content,
        pros,
        cons,
        is_verified_purchase,
        is_approved
    ) VALUES (
        p_user_id,
        p_product_id,
        v_purchase_id,
        p_rating,
        p_title,
        p_content,
        p_pros,
        p_cons,
        v_purchase_id IS NOT NULL,
        FALSE -- Requires admin approval
    )
    RETURNING id INTO v_review_id;

    RETURN QUERY SELECT TRUE, v_review_id, 'Reseña enviada para moderación'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Approve review and update product stats
CREATE OR REPLACE FUNCTION public.approve_review(p_review_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_review RECORD;
BEGIN
    SELECT * INTO v_review FROM public.reviews WHERE id = p_review_id;

    IF v_review IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Approve the review
    UPDATE public.reviews
    SET is_approved = TRUE
    WHERE id = p_review_id;

    -- Update product stats
    UPDATE public.products
    SET
        total_reviews = total_reviews + 1,
        average_rating = (
            SELECT AVG(rating)::DECIMAL(2,1)
            FROM public.reviews
            WHERE product_id = v_review.product_id AND is_approved = TRUE
        )
    WHERE id = v_review.product_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FLOW 8: AFFILIATE TRACKING
-- ============================================
-- What happens when visitor comes via affiliate link
--
-- STEP BY STEP:
-- 1. Visitor clicks affiliate link (?ref=CODE)
-- 2. System stores affiliate code in cookie/session
-- 3. If visitor registers: link to affiliate
-- 4. If visitor purchases: track referral
-- 5. Commission calculated via process_affiliate_commission()
-- 6. Affiliate dashboard shows stats
--
-- DATABASE TABLES USED:
-- - public.affiliates
-- - public.affiliate_referrals
-- - public.purchases (commission link)

-- Function: Track affiliate click
CREATE OR REPLACE FUNCTION public.track_affiliate_click(
    p_affiliate_code VARCHAR,
    p_landing_page TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    affiliate_id UUID,
    message TEXT
) AS $$
DECLARE
    v_affiliate RECORD;
BEGIN
    SELECT * INTO v_affiliate
    FROM public.affiliates
    WHERE affiliate_code = p_affiliate_code AND status = 'approved';

    IF v_affiliate IS NULL THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Código de afiliado no válido'::TEXT;
        RETURN;
    END IF;

    -- Create referral record (pre-conversion)
    INSERT INTO public.affiliate_referrals (
        affiliate_id,
        referral_code,
        landing_page,
        ip_address,
        user_agent
    ) VALUES (
        v_affiliate.id,
        p_affiliate_code,
        p_landing_page,
        p_ip_address,
        p_user_agent
    );

    -- Update affiliate stats
    UPDATE public.affiliates
    SET total_referrals = total_referrals + 1
    WHERE id = v_affiliate.id;

    RETURN QUERY SELECT TRUE, v_affiliate.id, 'Click registrado'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.process_free_download(UUID, UUID, INET, TEXT) IS 'Handles complete free download flow';
COMMENT ON FUNCTION public.create_purchase(UUID, UUID, VARCHAR, VARCHAR, VARCHAR) IS 'Creates pending purchase with discount/affiliate handling';
COMMENT ON FUNCTION public.confirm_payment(UUID, VARCHAR) IS 'Confirms payment and triggers purchase completion';
COMMENT ON FUNCTION public.subscribe_membership(UUID, VARCHAR, VARCHAR) IS 'Creates new membership subscription';
COMMENT ON FUNCTION public.activate_membership(UUID) IS 'Activates membership after payment confirmation';
COMMENT ON FUNCTION public.get_user_dashboard(UUID) IS 'Gets all data for user dashboard';
COMMENT ON FUNCTION public.capture_email_lead(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR) IS 'Captures email leads from lead magnets';
COMMENT ON FUNCTION public.submit_review(UUID, UUID, INTEGER, VARCHAR, TEXT, TEXT[], TEXT[]) IS 'Handles review submission with validation';
COMMENT ON FUNCTION public.approve_review(UUID) IS 'Approves review and updates product rating';
COMMENT ON FUNCTION public.track_affiliate_click(VARCHAR, TEXT, INET, TEXT) IS 'Records affiliate link clicks';
