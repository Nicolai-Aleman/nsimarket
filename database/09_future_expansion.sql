-- ============================================
-- NO SOMOS IGNORANTES - FUTURE EXPANSION
-- Prepared structures for growth
-- ============================================
-- Run this when you're ready to expand features

-- ============================================
-- EXPANSION 1: COURSE SYSTEM
-- ============================================
-- For when you want to sell video courses

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Course info
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    short_description VARCHAR(500),

    -- Pricing
    price_bolivianos DECIMAL(10,2) NOT NULL,
    price_usd DECIMAL(10,2),
    original_price_bolivianos DECIMAL(10,2),

    -- Content
    total_modules INTEGER DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    total_duration_minutes INTEGER DEFAULT 0,

    -- Media
    thumbnail_url TEXT,
    preview_video_url TEXT,

    -- Status
    is_active BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,

    -- Access
    access_type VARCHAR(20) DEFAULT 'lifetime' CHECK (access_type IN ('lifetime', 'subscription', 'rental')),

    -- Stats
    total_students INTEGER DEFAULT 0,
    average_rating DECIMAL(2,1) DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Course modules
CREATE TABLE IF NOT EXISTS public.course_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,

    is_free_preview BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course lessons
CREATE TABLE IF NOT EXISTS public.course_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url TEXT,
    duration_minutes INTEGER,
    display_order INTEGER DEFAULT 0,

    -- Attachments
    attachments JSONB, -- [{name, url, type}]

    is_free_preview BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course progress tracking
CREATE TABLE IF NOT EXISTS public.course_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,

    is_completed BOOLEAN DEFAULT FALSE,
    progress_percent INTEGER DEFAULT 0,
    last_position_seconds INTEGER DEFAULT 0,

    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    UNIQUE(user_id, lesson_id)
);

-- ============================================
-- EXPANSION 2: COMMUNITY/FORUM
-- ============================================
-- For building a community around your brand

-- Community posts
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

    title VARCHAR(255),
    content TEXT NOT NULL,

    -- Categorization
    category VARCHAR(50),
    tags TEXT[],

    -- Engagement
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,

    -- Moderation
    is_approved BOOLEAN DEFAULT TRUE,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post comments
CREATE TABLE IF NOT EXISTS public.community_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.community_comments(id), -- For replies

    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,

    is_approved BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EXPANSION 3: GAMIFICATION
-- ============================================
-- For increasing engagement with achievements

-- Achievement definitions
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,

    -- Requirements
    requirement_type VARCHAR(50), -- purchases, downloads, streak, etc.
    requirement_value INTEGER,

    -- Rewards
    points_reward INTEGER DEFAULT 0,
    discount_reward_id UUID, -- Reference to discount code

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,

    earned_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, achievement_id)
);

-- User points/levels
CREATE TABLE IF NOT EXISTS public.user_gamification (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,

    total_points INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    current_streak_days INTEGER DEFAULT 0,
    longest_streak_days INTEGER DEFAULT 0,
    last_activity_date DATE,

    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EXPANSION 4: LIVE EVENTS/WEBINARS
-- ============================================
-- For hosting live sessions

CREATE TABLE IF NOT EXISTS public.live_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,

    -- Scheduling
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    timezone VARCHAR(50) DEFAULT 'America/La_Paz',

    -- Access
    is_free BOOLEAN DEFAULT FALSE,
    price_bolivianos DECIMAL(10,2),
    max_attendees INTEGER,

    -- Links
    stream_url TEXT,
    replay_url TEXT,

    -- Status
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),

    -- Stats
    registered_count INTEGER DEFAULT 0,
    attended_count INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event registrations
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.live_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

    registered_at TIMESTAMPTZ DEFAULT NOW(),
    attended BOOLEAN DEFAULT FALSE,
    attended_at TIMESTAMPTZ,

    reminder_sent BOOLEAN DEFAULT FALSE,

    UNIQUE(event_id, user_id)
);

-- ============================================
-- EXPANSION 5: A/B TESTING
-- ============================================
-- For optimizing conversions

CREATE TABLE IF NOT EXISTS public.ab_experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Configuration
    variants JSONB NOT NULL, -- [{id, name, weight}]

    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),

    -- Results
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    winner_variant VARCHAR(50),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experiment assignments
CREATE TABLE IF NOT EXISTS public.ab_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID NOT NULL REFERENCES public.ab_experiments(id) ON DELETE CASCADE,

    -- User identification
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    session_id VARCHAR(100),

    variant_id VARCHAR(50) NOT NULL,

    -- Conversion tracking
    converted BOOLEAN DEFAULT FALSE,
    conversion_value DECIMAL(10,2),
    converted_at TIMESTAMPTZ,

    assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EXPANSION 6: NOTIFICATION SYSTEM
-- ============================================
-- For in-app and push notifications

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

    -- Content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,

    -- Type
    notification_type VARCHAR(50), -- purchase, system, promo, etc.

    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push notification subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

    -- Web Push
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,

    -- Device info
    device_type VARCHAR(50),
    browser VARCHAR(100),

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HELPER: Enable RLS on new tables
-- ============================================
-- Uncomment and run when you activate these features

/*
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Basic policies
CREATE POLICY "Users view own notifications"
    ON public.notifications FOR SELECT
    USING (user_id = public.current_user_id());

CREATE POLICY "Users view own progress"
    ON public.course_progress FOR SELECT
    USING (user_id = public.current_user_id());

CREATE POLICY "Anyone can view published courses"
    ON public.courses FOR SELECT
    USING (is_active = true);

CREATE POLICY "Anyone can view published events"
    ON public.live_events FOR SELECT
    USING (status != 'cancelled');
*/

COMMENT ON TABLE public.courses IS 'FUTURE: Video course system';
COMMENT ON TABLE public.community_posts IS 'FUTURE: Community forum posts';
COMMENT ON TABLE public.achievements IS 'FUTURE: Gamification achievements';
COMMENT ON TABLE public.live_events IS 'FUTURE: Webinars and live sessions';
COMMENT ON TABLE public.ab_experiments IS 'FUTURE: A/B testing experiments';
COMMENT ON TABLE public.notifications IS 'FUTURE: In-app notification system';
