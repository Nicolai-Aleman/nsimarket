-- ============================================
-- NO SOMOS IGNORANTES - ROW LEVEL SECURITY
-- Protecting your data with access policies
-- ============================================
-- Run after all schema files

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
-- RLS = Row Level Security
-- This prevents users from seeing data they shouldn't see
-- Even if they have the database connection, they can only
-- access their own data (unless they're admin)

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTION: Check if user is admin
-- ============================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE auth_user_id = auth.uid()
        AND account_type = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HELPER FUNCTION: Get current user's ID
-- ============================================

CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT id FROM public.users
        WHERE auth_user_id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth_user_id = auth.uid() OR public.is_admin());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth_user_id = auth.uid())
    WITH CHECK (auth_user_id = auth.uid());

-- Allow insert for registration (service role or auth trigger)
CREATE POLICY "Enable insert for registration"
    ON public.users FOR INSERT
    WITH CHECK (true);

-- Admins can do everything
CREATE POLICY "Admins have full access to users"
    ON public.users FOR ALL
    USING (public.is_admin());

-- ============================================
-- PRODUCTS TABLE POLICIES
-- ============================================
-- Products are public for reading (anyone can see them)

-- Anyone can view active products
CREATE POLICY "Anyone can view active products"
    ON public.products FOR SELECT
    USING (is_active = true);

-- Only admins can modify products
CREATE POLICY "Only admins can modify products"
    ON public.products FOR ALL
    USING (public.is_admin());

-- ============================================
-- PURCHASES TABLE POLICIES
-- ============================================

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
    ON public.purchases FOR SELECT
    USING (user_id = public.current_user_id() OR public.is_admin());

-- System/admin can create purchases
CREATE POLICY "System can create purchases"
    ON public.purchases FOR INSERT
    WITH CHECK (true);

-- Only admins can update/delete purchases
CREATE POLICY "Admins can manage purchases"
    ON public.purchases FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete purchases"
    ON public.purchases FOR DELETE
    USING (public.is_admin());

-- ============================================
-- DOWNLOADS TABLE POLICIES
-- ============================================

-- Users can view their own downloads
CREATE POLICY "Users can view own downloads"
    ON public.downloads FOR SELECT
    USING (user_id = public.current_user_id() OR public.is_admin());

-- System can insert downloads
CREATE POLICY "System can create downloads"
    ON public.downloads FOR INSERT
    WITH CHECK (true);

-- ============================================
-- USER_INTERESTS TABLE POLICIES
-- ============================================

-- Users can view and manage their own interests
CREATE POLICY "Users can view own interests"
    ON public.user_interests FOR SELECT
    USING (user_id = public.current_user_id() OR public.is_admin());

CREATE POLICY "Users can manage own interests"
    ON public.user_interests FOR ALL
    USING (user_id = public.current_user_id() OR public.is_admin());

-- ============================================
-- EMAIL TABLES POLICIES (Admin only)
-- ============================================

CREATE POLICY "Only admins can access email campaigns"
    ON public.email_campaigns FOR ALL
    USING (public.is_admin());

CREATE POLICY "Only admins can access email events"
    ON public.email_events FOR ALL
    USING (public.is_admin());

-- ============================================
-- AUTOMATION LOGS (Admin only)
-- ============================================

CREATE POLICY "Only admins can access automation logs"
    ON public.automation_logs FOR ALL
    USING (public.is_admin());

-- ============================================
-- PAGE VIEWS (Mixed access)
-- ============================================

-- System can insert page views
CREATE POLICY "System can create page views"
    ON public.page_views FOR INSERT
    WITH CHECK (true);

-- Only admins can view page views
CREATE POLICY "Only admins can view page views"
    ON public.page_views FOR SELECT
    USING (public.is_admin());

-- ============================================
-- DISCOUNT CODES POLICIES
-- ============================================

-- Anyone can read active discount codes (for validation)
CREATE POLICY "Anyone can validate discount codes"
    ON public.discount_codes FOR SELECT
    USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- Only admins can manage discount codes
CREATE POLICY "Admins can manage discount codes"
    ON public.discount_codes FOR ALL
    USING (public.is_admin());

-- ============================================
-- MEMBERSHIP TIERS POLICIES
-- ============================================

-- Anyone can view active membership tiers
CREATE POLICY "Anyone can view membership tiers"
    ON public.membership_tiers FOR SELECT
    USING (is_active = true);

-- Only admins can manage tiers
CREATE POLICY "Admins can manage membership tiers"
    ON public.membership_tiers FOR ALL
    USING (public.is_admin());

-- ============================================
-- MEMBERSHIPS POLICIES
-- ============================================

-- Users can view their own membership
CREATE POLICY "Users can view own membership"
    ON public.memberships FOR SELECT
    USING (user_id = public.current_user_id() OR public.is_admin());

-- System/admin can manage memberships
CREATE POLICY "System can manage memberships"
    ON public.memberships FOR ALL
    USING (public.is_admin());

-- ============================================
-- REVIEWS POLICIES
-- ============================================

-- Anyone can view approved reviews
CREATE POLICY "Anyone can view approved reviews"
    ON public.reviews FOR SELECT
    USING (is_approved = true OR user_id = public.current_user_id() OR public.is_admin());

-- Users can create reviews
CREATE POLICY "Users can create reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (user_id = public.current_user_id());

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
    ON public.reviews FOR UPDATE
    USING (user_id = public.current_user_id() OR public.is_admin());

-- Only admins can delete reviews
CREATE POLICY "Admins can delete reviews"
    ON public.reviews FOR DELETE
    USING (public.is_admin());

-- ============================================
-- AFFILIATES POLICIES
-- ============================================

-- Affiliates can view their own profile
CREATE POLICY "Affiliates can view own profile"
    ON public.affiliates FOR SELECT
    USING (user_id = public.current_user_id() OR public.is_admin());

-- Users can apply to become affiliates
CREATE POLICY "Users can apply as affiliate"
    ON public.affiliates FOR INSERT
    WITH CHECK (user_id = public.current_user_id());

-- Affiliates can update their profile
CREATE POLICY "Affiliates can update own profile"
    ON public.affiliates FOR UPDATE
    USING (user_id = public.current_user_id() OR public.is_admin());

-- ============================================
-- AFFILIATE REFERRALS POLICIES
-- ============================================

-- Affiliates can view their own referrals
CREATE POLICY "Affiliates can view own referrals"
    ON public.affiliate_referrals FOR SELECT
    USING (
        affiliate_id IN (
            SELECT id FROM public.affiliates
            WHERE user_id = public.current_user_id()
        )
        OR public.is_admin()
    );

-- System can create referrals
CREATE POLICY "System can create referrals"
    ON public.affiliate_referrals FOR INSERT
    WITH CHECK (true);

-- ============================================
-- AFFILIATE PAYOUTS POLICIES
-- ============================================

-- Affiliates can view their own payouts
CREATE POLICY "Affiliates can view own payouts"
    ON public.affiliate_payouts FOR SELECT
    USING (
        affiliate_id IN (
            SELECT id FROM public.affiliates
            WHERE user_id = public.current_user_id()
        )
        OR public.is_admin()
    );

-- Only admins can create payouts
CREATE POLICY "Admins can manage payouts"
    ON public.affiliate_payouts FOR ALL
    USING (public.is_admin());

-- ============================================
-- SERVICE ROLE BYPASS
-- ============================================
-- Note: The Supabase service role key bypasses RLS
-- Use it only on your server, never expose it to clients

COMMENT ON POLICY "Users can view own profile" ON public.users IS 'Users can only see their own profile data';
COMMENT ON POLICY "Anyone can view active products" ON public.products IS 'Product catalog is public';
COMMENT ON POLICY "Users can view own purchases" ON public.purchases IS 'Purchase history is private to each user';
