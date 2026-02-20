-- ============================================
-- NO SOMOS IGNORANTES - BUSINESS INTELLIGENCE
-- Analytics queries for data-driven decisions
-- ============================================
-- These queries power your dashboard and reports

-- ============================================
-- SALES ANALYTICS
-- ============================================

-- Best Selling Products
-- Shows which products generate most revenue
CREATE OR REPLACE VIEW public.bi_best_selling_products AS
SELECT
    p.id,
    p.name,
    p.category,
    p.price_bolivianos,
    p.total_sales,
    p.total_revenue,
    p.total_downloads,
    p.average_rating,
    ROUND((p.total_revenue / NULLIF(p.total_sales, 0))::NUMERIC, 2) as avg_order_value
FROM public.products p
WHERE p.is_active = true
ORDER BY p.total_revenue DESC;

-- Sales by Time Period
-- Revenue trends over time
CREATE OR REPLACE FUNCTION public.bi_sales_by_period(
    p_start_date DATE,
    p_end_date DATE,
    p_group_by VARCHAR DEFAULT 'day' -- day, week, month
)
RETURNS TABLE (
    period TEXT,
    total_orders BIGINT,
    total_revenue DECIMAL,
    avg_order_value DECIMAL,
    unique_customers BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        CASE p_group_by
            WHEN 'day' THEN TO_CHAR(pu.created_at, 'YYYY-MM-DD')
            WHEN 'week' THEN TO_CHAR(DATE_TRUNC('week', pu.created_at), 'YYYY-MM-DD')
            WHEN 'month' THEN TO_CHAR(pu.created_at, 'YYYY-MM')
        END as period,
        COUNT(*)::BIGINT as total_orders,
        SUM(pu.price_paid)::DECIMAL as total_revenue,
        ROUND(AVG(pu.price_paid)::NUMERIC, 2)::DECIMAL as avg_order_value,
        COUNT(DISTINCT pu.user_id)::BIGINT as unique_customers
    FROM public.purchases pu
    WHERE pu.payment_status = 'completed'
      AND pu.created_at::DATE BETWEEN p_start_date AND p_end_date
    GROUP BY 1
    ORDER BY 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sales by Category
CREATE OR REPLACE VIEW public.bi_sales_by_category AS
SELECT
    p.category,
    COUNT(DISTINCT pu.id) as total_orders,
    SUM(pu.price_paid) as total_revenue,
    COUNT(DISTINCT pu.user_id) as unique_customers,
    COUNT(DISTINCT p.id) as products_count
FROM public.purchases pu
JOIN public.products p ON pu.product_id = p.id
WHERE pu.payment_status = 'completed'
GROUP BY p.category
ORDER BY total_revenue DESC;

-- ============================================
-- USER ANALYTICS
-- ============================================

-- Most Active Users
-- Users who buy and download the most
CREATE OR REPLACE VIEW public.bi_most_active_users AS
SELECT
    u.id,
    u.email,
    u.full_name,
    u.account_type,
    u.total_purchases,
    u.total_spent,
    u.total_downloads,
    u.created_at as member_since,
    u.last_purchase_at,
    u.last_activity_at,
    EXTRACT(days FROM NOW() - u.last_activity_at) as days_since_active
FROM public.users u
WHERE u.is_active = true
ORDER BY u.total_spent DESC, u.total_downloads DESC;

-- User Cohort Analysis
-- How users from different periods behave
CREATE OR REPLACE FUNCTION public.bi_user_cohort_analysis(
    p_cohort_period VARCHAR DEFAULT 'month' -- week, month
)
RETURNS TABLE (
    cohort TEXT,
    users_acquired BIGINT,
    users_purchased BIGINT,
    conversion_rate DECIMAL,
    total_revenue DECIMAL,
    avg_revenue_per_user DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH cohorts AS (
        SELECT
            CASE p_cohort_period
                WHEN 'week' THEN TO_CHAR(DATE_TRUNC('week', u.created_at), 'YYYY-MM-DD')
                WHEN 'month' THEN TO_CHAR(u.created_at, 'YYYY-MM')
            END as cohort,
            u.id as user_id
        FROM public.users u
    )
    SELECT
        c.cohort,
        COUNT(DISTINCT c.user_id)::BIGINT as users_acquired,
        COUNT(DISTINCT pu.user_id)::BIGINT as users_purchased,
        ROUND(
            (COUNT(DISTINCT pu.user_id)::DECIMAL / NULLIF(COUNT(DISTINCT c.user_id), 0) * 100)::NUMERIC,
            2
        )::DECIMAL as conversion_rate,
        COALESCE(SUM(pu.price_paid), 0)::DECIMAL as total_revenue,
        ROUND(
            (COALESCE(SUM(pu.price_paid), 0) / NULLIF(COUNT(DISTINCT c.user_id), 0))::NUMERIC,
            2
        )::DECIMAL as avg_revenue_per_user
    FROM cohorts c
    LEFT JOIN public.purchases pu ON c.user_id = pu.user_id AND pu.payment_status = 'completed'
    GROUP BY c.cohort
    ORDER BY c.cohort;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- User Acquisition Sources
-- Where your customers come from
CREATE OR REPLACE VIEW public.bi_acquisition_sources AS
SELECT
    COALESCE(u.acquisition_source, 'unknown') as source,
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE u.account_type != 'free') as paid_users,
    SUM(u.total_spent) as total_revenue,
    ROUND(AVG(u.total_spent)::NUMERIC, 2) as avg_revenue_per_user,
    ROUND(
        (COUNT(*) FILTER (WHERE u.account_type != 'free')::DECIMAL / NULLIF(COUNT(*), 0) * 100)::NUMERIC,
        2
    ) as conversion_rate
FROM public.users u
GROUP BY u.acquisition_source
ORDER BY total_users DESC;

-- ============================================
-- CONVERSION ANALYTICS
-- ============================================

-- Funnel: Visitor → Free → Paid
CREATE OR REPLACE FUNCTION public.bi_conversion_funnel(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    stage TEXT,
    users_count BIGINT,
    conversion_from_previous DECIMAL
) AS $$
DECLARE
    v_total_users BIGINT;
    v_free_downloaded BIGINT;
    v_paid_users BIGINT;
    v_members BIGINT;
BEGIN
    -- Total registered users
    SELECT COUNT(*) INTO v_total_users
    FROM public.users u
    WHERE (p_start_date IS NULL OR u.created_at::DATE >= p_start_date)
      AND (p_end_date IS NULL OR u.created_at::DATE <= p_end_date);

    -- Users who downloaded something free
    SELECT COUNT(DISTINCT pu.user_id) INTO v_free_downloaded
    FROM public.purchases pu
    WHERE pu.price_paid = 0
      AND pu.payment_status = 'completed'
      AND (p_start_date IS NULL OR pu.created_at::DATE >= p_start_date)
      AND (p_end_date IS NULL OR pu.created_at::DATE <= p_end_date);

    -- Users who made a paid purchase
    SELECT COUNT(DISTINCT pu.user_id) INTO v_paid_users
    FROM public.purchases pu
    WHERE pu.price_paid > 0
      AND pu.payment_status = 'completed'
      AND (p_start_date IS NULL OR pu.created_at::DATE >= p_start_date)
      AND (p_end_date IS NULL OR pu.created_at::DATE <= p_end_date);

    -- Users with active membership
    SELECT COUNT(DISTINCT m.user_id) INTO v_members
    FROM public.memberships m
    WHERE m.status = 'active'
      AND (p_start_date IS NULL OR m.created_at::DATE >= p_start_date)
      AND (p_end_date IS NULL OR m.created_at::DATE <= p_end_date);

    RETURN QUERY VALUES
        ('1. Registrados'::TEXT, v_total_users, 100::DECIMAL),
        ('2. Descarga gratis'::TEXT, v_free_downloaded,
            ROUND((v_free_downloaded::DECIMAL / NULLIF(v_total_users, 0) * 100)::NUMERIC, 2)),
        ('3. Compra pagada'::TEXT, v_paid_users,
            ROUND((v_paid_users::DECIMAL / NULLIF(v_free_downloaded, 0) * 100)::NUMERIC, 2)),
        ('4. Membresía'::TEXT, v_members,
            ROUND((v_members::DECIMAL / NULLIF(v_paid_users, 0) * 100)::NUMERIC, 2));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Free to Paid Conversion Time
-- How long it takes free users to become paid
CREATE OR REPLACE VIEW public.bi_free_to_paid_conversion AS
WITH first_free AS (
    SELECT
        user_id,
        MIN(created_at) as first_free_date
    FROM public.purchases
    WHERE price_paid = 0 AND payment_status = 'completed'
    GROUP BY user_id
),
first_paid AS (
    SELECT
        user_id,
        MIN(created_at) as first_paid_date
    FROM public.purchases
    WHERE price_paid > 0 AND payment_status = 'completed'
    GROUP BY user_id
)
SELECT
    ff.user_id,
    ff.first_free_date,
    fp.first_paid_date,
    EXTRACT(days FROM fp.first_paid_date - ff.first_free_date) as days_to_convert
FROM first_free ff
JOIN first_paid fp ON ff.user_id = fp.user_id
WHERE fp.first_paid_date > ff.first_free_date
ORDER BY days_to_convert;

-- Average conversion time
CREATE OR REPLACE VIEW public.bi_avg_conversion_time AS
SELECT
    ROUND(AVG(days_to_convert)::NUMERIC, 1) as avg_days,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY days_to_convert) as median_days,
    MIN(days_to_convert) as min_days,
    MAX(days_to_convert) as max_days
FROM public.bi_free_to_paid_conversion;

-- ============================================
-- CONTENT INSIGHTS (For YouTube Strategy)
-- ============================================

-- Most Interesting Topics
-- What topics users care about most
CREATE OR REPLACE VIEW public.bi_topic_interests AS
SELECT
    ui.interest_category as category,
    ui.interest_topic as topic,
    COUNT(*) as users_interested,
    AVG(ui.confidence_score) as avg_confidence,
    COUNT(*) FILTER (WHERE ui.interest_level IN ('high', 'very_high')) as highly_interested
FROM public.user_interests ui
GROUP BY ui.interest_category, ui.interest_topic
ORDER BY users_interested DESC;

-- Topics that Lead to Purchases
-- What interests correlate with sales
CREATE OR REPLACE VIEW public.bi_topics_that_convert AS
SELECT
    ui.interest_category,
    ui.interest_topic,
    COUNT(DISTINCT ui.user_id) as interested_users,
    COUNT(DISTINCT pu.user_id) as users_who_purchased,
    ROUND(
        (COUNT(DISTINCT pu.user_id)::DECIMAL / NULLIF(COUNT(DISTINCT ui.user_id), 0) * 100)::NUMERIC,
        2
    ) as purchase_rate,
    SUM(pu.price_paid) as total_revenue
FROM public.user_interests ui
LEFT JOIN public.purchases pu ON ui.user_id = pu.user_id AND pu.payment_status = 'completed'
GROUP BY ui.interest_category, ui.interest_topic
HAVING COUNT(DISTINCT ui.user_id) >= 5  -- Minimum sample size
ORDER BY purchase_rate DESC;

-- Product Popularity vs YouTube Videos
CREATE OR REPLACE VIEW public.bi_product_content_correlation AS
SELECT
    p.name,
    p.category,
    p.youtube_video_id,
    p.related_topics,
    p.total_sales,
    p.total_downloads,
    p.total_revenue,
    CASE WHEN p.youtube_video_id IS NOT NULL THEN TRUE ELSE FALSE END as has_video
FROM public.products p
WHERE p.is_active = true
ORDER BY p.total_sales DESC;

-- ============================================
-- AFFILIATE ANALYTICS
-- ============================================

-- Affiliate Performance
CREATE OR REPLACE VIEW public.bi_affiliate_performance AS
SELECT
    a.id as affiliate_id,
    u.email as affiliate_email,
    u.full_name as affiliate_name,
    a.affiliate_code,
    a.status,
    a.commission_rate,
    a.total_referrals,
    a.total_sales,
    a.total_revenue,
    a.total_commission_earned,
    a.total_commission_paid,
    a.pending_commission,
    ROUND(
        (a.total_sales::DECIMAL / NULLIF(a.total_referrals, 0) * 100)::NUMERIC,
        2
    ) as conversion_rate,
    a.created_at as affiliate_since
FROM public.affiliates a
JOIN public.users u ON a.user_id = u.id
WHERE a.status = 'approved'
ORDER BY a.total_revenue DESC;

-- Top Affiliates This Month
CREATE OR REPLACE VIEW public.bi_top_affiliates_monthly AS
SELECT
    a.id as affiliate_id,
    u.full_name as affiliate_name,
    a.affiliate_code,
    COUNT(ar.id) as referrals_this_month,
    COUNT(ar.id) FILTER (WHERE ar.purchase_id IS NOT NULL) as conversions_this_month,
    SUM(ar.purchase_amount) as revenue_this_month,
    SUM(ar.commission_amount) as commission_this_month
FROM public.affiliates a
JOIN public.users u ON a.user_id = u.id
LEFT JOIN public.affiliate_referrals ar ON a.id = ar.affiliate_id
    AND ar.created_at >= DATE_TRUNC('month', NOW())
WHERE a.status = 'approved'
GROUP BY a.id, u.full_name, a.affiliate_code
ORDER BY revenue_this_month DESC NULLS LAST;

-- ============================================
-- EMAIL & ENGAGEMENT ANALYTICS
-- ============================================

-- Email Campaign Performance
CREATE OR REPLACE VIEW public.bi_email_campaign_performance AS
SELECT
    ec.id,
    ec.name,
    ec.campaign_type,
    ec.status,
    ec.total_sent,
    ec.total_opened,
    ec.total_clicked,
    ec.total_unsubscribed,
    ROUND((ec.total_opened::DECIMAL / NULLIF(ec.total_sent, 0) * 100)::NUMERIC, 2) as open_rate,
    ROUND((ec.total_clicked::DECIMAL / NULLIF(ec.total_opened, 0) * 100)::NUMERIC, 2) as click_rate,
    ROUND((ec.total_unsubscribed::DECIMAL / NULLIF(ec.total_sent, 0) * 100)::NUMERIC, 2) as unsubscribe_rate,
    ec.sent_at
FROM public.email_campaigns ec
ORDER BY ec.sent_at DESC NULLS LAST;

-- User Engagement Score
CREATE OR REPLACE VIEW public.bi_user_engagement AS
SELECT
    u.id,
    u.email,
    u.account_type,
    -- Activity score (0-100)
    LEAST(100, (
        (u.total_purchases * 10) +
        (u.total_downloads * 2) +
        CASE WHEN u.last_activity_at > NOW() - INTERVAL '7 days' THEN 20 ELSE 0 END +
        CASE WHEN u.last_activity_at > NOW() - INTERVAL '30 days' THEN 10 ELSE 0 END
    )) as engagement_score,
    u.total_purchases,
    u.total_downloads,
    u.last_activity_at,
    EXTRACT(days FROM NOW() - u.last_activity_at) as days_inactive,
    CASE
        WHEN u.last_activity_at > NOW() - INTERVAL '7 days' THEN 'active'
        WHEN u.last_activity_at > NOW() - INTERVAL '30 days' THEN 'engaged'
        WHEN u.last_activity_at > NOW() - INTERVAL '90 days' THEN 'at_risk'
        ELSE 'churned'
    END as engagement_status
FROM public.users u
WHERE u.is_active = true
ORDER BY engagement_score DESC;

-- ============================================
-- REVENUE DASHBOARD SUMMARY
-- ============================================

-- Today's Summary
CREATE OR REPLACE FUNCTION public.bi_today_summary()
RETURNS TABLE (
    metric TEXT,
    value TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'Ventas hoy'::TEXT, COUNT(*)::TEXT
    FROM public.purchases WHERE payment_status = 'completed' AND created_at::DATE = CURRENT_DATE
    UNION ALL
    SELECT 'Ingresos hoy (Bs.)', COALESCE(SUM(price_paid), 0)::TEXT
    FROM public.purchases WHERE payment_status = 'completed' AND created_at::DATE = CURRENT_DATE
    UNION ALL
    SELECT 'Nuevos usuarios', COUNT(*)::TEXT
    FROM public.users WHERE created_at::DATE = CURRENT_DATE
    UNION ALL
    SELECT 'Descargas hoy', COUNT(*)::TEXT
    FROM public.downloads WHERE created_at::DATE = CURRENT_DATE
    UNION ALL
    SELECT 'Reseñas pendientes', COUNT(*)::TEXT
    FROM public.reviews WHERE is_approved = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Monthly Summary
CREATE OR REPLACE FUNCTION public.bi_monthly_summary(p_year INTEGER, p_month INTEGER)
RETURNS TABLE (
    metric TEXT,
    value DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'total_revenue'::TEXT, COALESCE(SUM(price_paid), 0)::DECIMAL
    FROM public.purchases
    WHERE payment_status = 'completed'
      AND EXTRACT(year FROM created_at) = p_year
      AND EXTRACT(month FROM created_at) = p_month
    UNION ALL
    SELECT 'total_orders', COUNT(*)::DECIMAL
    FROM public.purchases
    WHERE payment_status = 'completed'
      AND EXTRACT(year FROM created_at) = p_year
      AND EXTRACT(month FROM created_at) = p_month
    UNION ALL
    SELECT 'new_users', COUNT(*)::DECIMAL
    FROM public.users
    WHERE EXTRACT(year FROM created_at) = p_year
      AND EXTRACT(month FROM created_at) = p_month
    UNION ALL
    SELECT 'new_members', COUNT(*)::DECIMAL
    FROM public.memberships
    WHERE EXTRACT(year FROM created_at) = p_year
      AND EXTRACT(month FROM created_at) = p_month
    UNION ALL
    SELECT 'affiliate_commissions', COALESCE(SUM(affiliate_commission), 0)::DECIMAL
    FROM public.purchases
    WHERE payment_status = 'completed'
      AND affiliate_commission > 0
      AND EXTRACT(year FROM created_at) = p_year
      AND EXTRACT(month FROM created_at) = p_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CHURN PREDICTION
-- ============================================

-- Users at Risk of Churning
CREATE OR REPLACE VIEW public.bi_churn_risk AS
SELECT
    u.id,
    u.email,
    u.full_name,
    u.account_type,
    u.total_purchases,
    u.total_spent,
    u.last_purchase_at,
    u.last_activity_at,
    EXTRACT(days FROM NOW() - u.last_activity_at) as days_inactive,
    CASE
        WHEN EXTRACT(days FROM NOW() - u.last_activity_at) > 90 THEN 'high'
        WHEN EXTRACT(days FROM NOW() - u.last_activity_at) > 60 THEN 'medium'
        WHEN EXTRACT(days FROM NOW() - u.last_activity_at) > 30 THEN 'low'
        ELSE 'none'
    END as churn_risk
FROM public.users u
WHERE u.is_active = true
  AND u.total_purchases > 0
  AND u.last_activity_at < NOW() - INTERVAL '30 days'
ORDER BY days_inactive DESC;

COMMENT ON VIEW public.bi_best_selling_products IS 'Products ranked by revenue';
COMMENT ON VIEW public.bi_acquisition_sources IS 'Where customers come from';
COMMENT ON VIEW public.bi_topic_interests IS 'What topics users care about - use for YouTube content';
COMMENT ON VIEW public.bi_affiliate_performance IS 'Affiliate program performance';
COMMENT ON VIEW public.bi_churn_risk IS 'Users who might leave - target for re-engagement';
