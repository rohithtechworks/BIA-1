-- HOME SPOKEN CENTRE - SUPABASE DATABASE MIGRATION
-- Migration 001: Initial Schema, Indexes, Triggers, and Row Level Security (RLS)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for phone lookups and role queries
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_course ON public.categories(course_id);

-- 4. LESSONS TABLE
CREATE TABLE IF NOT EXISTS public.lessons (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_storage_key TEXT,
    video_status TEXT NOT NULL DEFAULT 'unavailable' CHECK (video_status IN ('available', 'unavailable', 'processing')),
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_category ON public.lessons(category_id);

-- 5. COURSE ACCESS CODES TABLE
CREATE TABLE IF NOT EXISTS public.course_access_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_hash TEXT NOT NULL UNIQUE,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'revoked', 'expired')),
    claimed_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    claimed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_codes_hash ON public.course_access_codes(code_hash);
CREATE INDEX IF NOT EXISTS idx_access_codes_status ON public.course_access_codes(status);

-- 6. ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    access_code_id UUID REFERENCES public.course_access_codes(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_course UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments(user_id);

-- 7. ACTIVE SESSIONS TABLE (ONE ACTIVE DEVICE POLICY ENFORCEMENT)
CREATE TABLE IF NOT EXISTS public.active_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_token_hash TEXT NOT NULL UNIQUE,
    device_label TEXT NOT NULL DEFAULT 'Unknown Device',
    ip_address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_active_sessions_user_active ON public.active_sessions(user_id, is_active);

-- 8. LESSON PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_activities JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_lesson UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user ON public.lesson_progress(user_id);

-- 9. AUDIT EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_user ON public.audit_events(user_id);

-- AUTOMATIC UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER update_lessons_timestamp BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER update_progress_timestamp BEFORE UPDATE ON public.lesson_progress FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can read/update own profile; admins can read all
CREATE POLICY profiles_select_policy ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_admin());
CREATE POLICY profiles_update_policy ON public.profiles FOR UPDATE USING (id = auth.uid() OR public.is_admin());

-- Courses: Anyone can read active courses
CREATE POLICY courses_select_policy ON public.courses FOR SELECT USING (is_active = TRUE OR public.is_admin());

-- Categories & Lessons: Public read for course structure
CREATE POLICY categories_select_policy ON public.categories FOR SELECT USING (TRUE);
CREATE POLICY lessons_select_policy ON public.lessons FOR SELECT USING (TRUE);
CREATE POLICY lessons_admin_policy ON public.lessons FOR ALL USING (public.is_admin());

-- Access Codes: Only admin can view/manage codes directly. Claiming happens via server function.
CREATE POLICY access_codes_admin_policy ON public.course_access_codes FOR ALL USING (public.is_admin());

-- Enrollments: Users can view their own enrollments, admins can view all
CREATE POLICY enrollments_select_policy ON public.enrollments FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

-- Active Sessions: Users can view their own active sessions
CREATE POLICY active_sessions_select_policy ON public.active_sessions FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

-- Lesson Progress: Users can select/insert/update their own progress
CREATE POLICY progress_select_policy ON public.lesson_progress FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY progress_insert_policy ON public.lesson_progress FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY progress_update_policy ON public.lesson_progress FOR UPDATE USING (user_id = auth.uid());

-- Audit Events: Only admin can select
CREATE POLICY audit_events_admin_policy ON public.audit_events FOR SELECT USING (public.is_admin());
