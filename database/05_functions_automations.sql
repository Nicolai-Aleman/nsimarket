-- ============================================
-- NO SOMOS IGNORANTES - AUTOMATION FUNCTIONS
-- Backend logic for automated workflows
-- ============================================
-- Run after 04_security_rls.sql

-- ============================================
-- FUNCTION: Handle new user registration
-- ============================================
-- Called when someone signs up
-- Creates their user profile and logs the event

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Create user profile
    INSERT INTO public.users (
        auth_user_id,
        email,
        full_name,
        acquisition_source,
        created_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'source', 'organic'),
        NOW()
    )
    RETURNING id INTO new_user_id;

    -- Log the automation
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
        'new_user_registration',
        'data_update',
        'auth.users.insert',
        jsonb_build_object('email', NEW.email, 'auth_id', NEW.id),
        new_user_id,
        'completed',
        NOW(),
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new auth users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCTION: Process completed purchase
-- ============================================
-- Called when a purchase is marked as completed
-- Updates stats and triggers delivery

CREATE OR REPLACE FUNCTION public.process_completed_purchase()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process if status changed to 'completed'
    IF NEW.payment_status = 'completed' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'completed') THEN

        -- Update purchase completion time
        NEW.completed_at = NOW();
        NEW.is_delivered = TRUE;
        NEW.delivered_at = NOW();

        -- Update user stats
        UPDATE public.users
        SET
            total_purchases = total_purchases + 1,
            total_spent = total_spent + NEW.price_paid,
            last_purchase_at = NOW(),
            last_activity_at = NOW(),
            -- Upgrade to premium if first purchase
            account_type = CASE
                WHEN account_type = 'free' THEN 'premium'
                ELSE account_type
            END
        WHERE id = NEW.user_id;

        -- Update product stats
        UPDATE public.products
        SET
            total_sales = total_sales + 1,
            total_revenue = total_revenue + NEW.price_paid
        WHERE id = NEW.product_id;

        -- Log the automation
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
            'process_completed_purchase',
            'data_update',
            'purchase.completed',
            jsonb_build_object(
                'purchase_id', NEW.id,
                'order_number', NEW.order_number,
                'amount', NEW.price_paid,
                'product_id', NEW.product_id
            ),
            NEW.user_id,
            'purchase',
            NEW.id,
            'completed',
            NOW(),
            NOW()
        );

        -- Process affiliate commission if applicable
        IF NEW.affiliate_id IS NOT NULL THEN
            PERFORM process_affiliate_commission(NEW.id);
        END IF;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_purchase_completed ON public.purchases;
CREATE TRIGGER on_purchase_completed
    BEFORE UPDATE ON public.purchases
    FOR EACH ROW
    EXECUTE FUNCTION public.process_completed_purchase();

-- ============================================
-- FUNCTION: Record download
-- ============================================
-- Called when user downloads a file
-- Updates stats and checks limits

CREATE OR REPLACE FUNCTION public.record_download(
    p_user_id UUID,
    p_product_id UUID,
    p_purchase_id UUID DEFAULT NULL,
    p_download_type VARCHAR DEFAULT 'purchased',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    download_id UUID;
    user_downloads INTEGER;
    membership_limit INTEGER;
BEGIN
    -- Check membership download limits if applicable
    IF p_download_type = 'membership' THEN
        SELECT m.downloads_this_period, mt.monthly_download_limit
        INTO user_downloads, membership_limit
        FROM public.memberships m
        JOIN public.membership_tiers mt ON m.tier_id = mt.id
        WHERE m.user_id = p_user_id AND m.status = 'active';

        IF membership_limit IS NOT NULL AND user_downloads >= membership_limit THEN
            RAISE EXCEPTION 'Monthly download limit reached';
        END IF;

        -- Increment download count for membership
        UPDATE public.memberships
        SET downloads_this_period = downloads_this_period + 1
        WHERE user_id = p_user_id AND status = 'active';
    END IF;

    -- Create download record
    INSERT INTO public.downloads (
        user_id,
        product_id,
        purchase_id,
        download_type,
        ip_address,
        user_agent
    ) VALUES (
        p_user_id,
        p_product_id,
        p_purchase_id,
        p_download_type,
        p_ip_address,
        p_user_agent
    )
    RETURNING id INTO download_id;

    -- Update user stats
    UPDATE public.users
    SET
        total_downloads = total_downloads + 1,
        last_activity_at = NOW()
    WHERE id = p_user_id;

    -- Update product stats
    UPDATE public.products
    SET total_downloads = total_downloads + 1
    WHERE id = p_product_id;

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
        'record_download',
        'data_update',
        'download.created',
        jsonb_build_object(
            'product_id', p_product_id,
            'download_type', p_download_type
        ),
        p_user_id,
        'download',
        download_id,
        'completed',
        NOW(),
        NOW()
    );

    RETURN download_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Process affiliate commission
-- ============================================
-- Calculates and records affiliate commission

CREATE OR REPLACE FUNCTION public.process_affiliate_commission(p_purchase_id UUID)
RETURNS VOID AS $$
DECLARE
    v_purchase RECORD;
    v_affiliate RECORD;
    v_commission DECIMAL(10,2);
BEGIN
    -- Get purchase details
    SELECT * INTO v_purchase FROM public.purchases WHERE id = p_purchase_id;

    IF v_purchase.affiliate_id IS NULL THEN
        RETURN;
    END IF;

    -- Get affiliate details
    SELECT * INTO v_affiliate
    FROM public.affiliates
    WHERE user_id = v_purchase.affiliate_id AND status = 'approved';

    IF v_affiliate IS NULL THEN
        RETURN;
    END IF;

    -- Calculate commission
    IF v_affiliate.commission_type = 'percentage' THEN
        v_commission := v_purchase.price_paid * (v_affiliate.commission_rate / 100);
    ELSE
        v_commission := v_affiliate.commission_rate;
    END IF;

    -- Update purchase with commission
    UPDATE public.purchases
    SET affiliate_commission = v_commission
    WHERE id = p_purchase_id;

    -- Create referral record if not exists
    INSERT INTO public.affiliate_referrals (
        affiliate_id,
        referred_user_id,
        referral_code,
        converted_at,
        purchase_id,
        purchase_amount,
        commission_amount,
        commission_status
    ) VALUES (
        v_affiliate.id,
        v_purchase.user_id,
        v_affiliate.affiliate_code,
        NOW(),
        p_purchase_id,
        v_purchase.price_paid,
        v_commission,
        'approved'
    )
    ON CONFLICT DO NOTHING;

    -- Update affiliate stats
    UPDATE public.affiliates
    SET
        total_sales = total_sales + 1,
        total_revenue = total_revenue + v_purchase.price_paid,
        total_commission_earned = total_commission_earned + v_commission,
        pending_commission = pending_commission + v_commission
    WHERE id = v_affiliate.id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Track user interest
-- ============================================
-- Records or updates user interest in a topic

CREATE OR REPLACE FUNCTION public.track_user_interest(
    p_user_id UUID,
    p_category VARCHAR,
    p_topic VARCHAR DEFAULT NULL,
    p_source VARCHAR DEFAULT 'browsing'
)
RETURNS UUID AS $$
DECLARE
    interest_id UUID;
    current_level VARCHAR;
    new_level VARCHAR;
BEGIN
    -- Get current interest level
    SELECT id, interest_level INTO interest_id, current_level
    FROM public.user_interests
    WHERE user_id = p_user_id
      AND interest_category = p_category
      AND (interest_topic = p_topic OR (interest_topic IS NULL AND p_topic IS NULL));

    -- Calculate new interest level
    new_level := CASE
        WHEN current_level IS NULL THEN 'low'
        WHEN current_level = 'low' THEN 'medium'
        WHEN current_level = 'medium' THEN 'high'
        WHEN current_level = 'high' THEN 'very_high'
        ELSE current_level
    END;

    -- Upsert interest
    INSERT INTO public.user_interests (
        user_id,
        interest_category,
        interest_topic,
        interest_level,
        source,
        confidence_score
    ) VALUES (
        p_user_id,
        p_category,
        p_topic,
        'low',
        p_source,
        0.3
    )
    ON CONFLICT (user_id, interest_category, interest_topic)
    DO UPDATE SET
        interest_level = new_level,
        confidence_score = LEAST(user_interests.confidence_score + 0.1, 1.0),
        updated_at = NOW()
    RETURNING id INTO interest_id;

    RETURN interest_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Get recommended products
-- ============================================
-- Returns personalized product recommendations

CREATE OR REPLACE FUNCTION public.get_recommended_products(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 4
)
RETURNS TABLE (
    product_id UUID,
    name VARCHAR,
    slug VARCHAR,
    price_bolivianos DECIMAL,
    category VARCHAR,
    relevance_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH user_interests AS (
        -- Get user's interests
        SELECT interest_category, interest_topic, confidence_score
        FROM public.user_interests
        WHERE user_id = p_user_id
    ),
    user_purchases AS (
        -- Get user's purchased products
        SELECT product_id
        FROM public.purchases
        WHERE user_id = p_user_id AND payment_status = 'completed'
    ),
    scored_products AS (
        SELECT
            p.id,
            p.name,
            p.slug,
            p.price_bolivianos,
            p.category,
            p.total_sales,
            -- Calculate relevance score
            COALESCE(
                (SELECT SUM(ui.confidence_score)
                 FROM user_interests ui
                 WHERE p.category = ui.interest_category
                    OR ui.interest_topic = ANY(p.tags)
                    OR ui.interest_topic = ANY(p.related_topics)
                ), 0
            ) +
            -- Boost popular products
            (p.total_sales::DECIMAL / NULLIF((SELECT MAX(total_sales) FROM public.products), 0)) * 0.3 +
            -- Boost highly rated
            (p.average_rating / 5.0) * 0.2
            AS relevance
        FROM public.products p
        WHERE p.is_active = true
          AND p.id NOT IN (SELECT product_id FROM user_purchases)
    )
    SELECT
        sp.id,
        sp.name,
        sp.slug,
        sp.price_bolivianos,
        sp.category,
        sp.relevance
    FROM scored_products sp
    ORDER BY sp.relevance DESC, sp.total_sales DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Validate discount code
-- ============================================
-- Checks if a discount code is valid and returns details

CREATE OR REPLACE FUNCTION public.validate_discount_code(
    p_code VARCHAR,
    p_user_id UUID,
    p_product_id UUID,
    p_purchase_amount DECIMAL
)
RETURNS TABLE (
    is_valid BOOLEAN,
    discount_type VARCHAR,
    discount_value DECIMAL,
    final_discount DECIMAL,
    error_message TEXT
) AS $$
DECLARE
    v_discount RECORD;
    v_user_uses INTEGER;
    v_final_discount DECIMAL;
BEGIN
    -- Get discount code
    SELECT * INTO v_discount
    FROM public.discount_codes
    WHERE code = UPPER(p_code);

    -- Check if code exists
    IF v_discount IS NULL THEN
        RETURN QUERY SELECT FALSE, NULL::VARCHAR, NULL::DECIMAL, NULL::DECIMAL, 'Código no encontrado'::TEXT;
        RETURN;
    END IF;

    -- Check if active
    IF NOT v_discount.is_active THEN
        RETURN QUERY SELECT FALSE, NULL::VARCHAR, NULL::DECIMAL, NULL::DECIMAL, 'Código inactivo'::TEXT;
        RETURN;
    END IF;

    -- Check dates
    IF v_discount.starts_at > NOW() THEN
        RETURN QUERY SELECT FALSE, NULL::VARCHAR, NULL::DECIMAL, NULL::DECIMAL, 'Código aún no válido'::TEXT;
        RETURN;
    END IF;

    IF v_discount.expires_at IS NOT NULL AND v_discount.expires_at < NOW() THEN
        RETURN QUERY SELECT FALSE, NULL::VARCHAR, NULL::DECIMAL, NULL::DECIMAL, 'Código expirado'::TEXT;
        RETURN;
    END IF;

    -- Check total uses
    IF v_discount.max_uses IS NOT NULL AND v_discount.current_uses >= v_discount.max_uses THEN
        RETURN QUERY SELECT FALSE, NULL::VARCHAR, NULL::DECIMAL, NULL::DECIMAL, 'Código agotado'::TEXT;
        RETURN;
    END IF;

    -- Check user uses
    SELECT COUNT(*) INTO v_user_uses
    FROM public.purchases
    WHERE user_id = p_user_id AND discount_code = p_code;

    IF v_discount.max_uses_per_user IS NOT NULL AND v_user_uses >= v_discount.max_uses_per_user THEN
        RETURN QUERY SELECT FALSE, NULL::VARCHAR, NULL::DECIMAL, NULL::DECIMAL, 'Ya usaste este código'::TEXT;
        RETURN;
    END IF;

    -- Check minimum purchase
    IF v_discount.minimum_purchase IS NOT NULL AND p_purchase_amount < v_discount.minimum_purchase THEN
        RETURN QUERY SELECT FALSE, NULL::VARCHAR, NULL::DECIMAL, NULL::DECIMAL,
            ('Compra mínima: Bs. ' || v_discount.minimum_purchase)::TEXT;
        RETURN;
    END IF;

    -- Check product applicability
    IF v_discount.applicable_products IS NOT NULL AND
       NOT (p_product_id = ANY(v_discount.applicable_products)) THEN
        RETURN QUERY SELECT FALSE, NULL::VARCHAR, NULL::DECIMAL, NULL::DECIMAL, 'Código no válido para este producto'::TEXT;
        RETURN;
    END IF;

    -- Calculate discount
    IF v_discount.discount_type = 'percentage' THEN
        v_final_discount := p_purchase_amount * (v_discount.discount_value / 100);
        IF v_discount.max_discount IS NOT NULL THEN
            v_final_discount := LEAST(v_final_discount, v_discount.max_discount);
        END IF;
    ELSE
        v_final_discount := LEAST(v_discount.discount_value, p_purchase_amount);
    END IF;

    RETURN QUERY SELECT
        TRUE,
        v_discount.discount_type,
        v_discount.discount_value,
        v_final_discount,
        NULL::TEXT;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Apply discount code
-- ============================================
-- Marks a discount code as used

CREATE OR REPLACE FUNCTION public.apply_discount_code(p_code VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE public.discount_codes
    SET current_uses = current_uses + 1
    WHERE code = UPPER(p_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates user profile when someone signs up';
COMMENT ON FUNCTION public.process_completed_purchase() IS 'Updates stats when a purchase is completed';
COMMENT ON FUNCTION public.record_download(UUID, UUID, UUID, VARCHAR, INET, TEXT) IS 'Logs downloads and updates statistics';
COMMENT ON FUNCTION public.process_affiliate_commission(UUID) IS 'Calculates and records affiliate commission for a purchase';
COMMENT ON FUNCTION public.track_user_interest(UUID, VARCHAR, VARCHAR, VARCHAR) IS 'Records user interest in topics for personalization';
COMMENT ON FUNCTION public.get_recommended_products(UUID, INTEGER) IS 'Returns personalized product recommendations';
COMMENT ON FUNCTION public.validate_discount_code(VARCHAR, UUID, UUID, DECIMAL) IS 'Validates discount codes and calculates savings';
COMMENT ON FUNCTION public.apply_discount_code(VARCHAR) IS 'Increments usage counter for a discount code';
