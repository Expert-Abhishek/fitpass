-- ==============================================================================
-- 00001_initial_schema.sql
-- Fitness Tracking Platform: Initial Schema, Triggers, Indexes & RLS Policies
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. USERS TABLE
-- ------------------------------------------------------------------------------
-- Mirrors and extends Supabase auth.users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Automatic updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- ------------------------------------------------------------------------------
-- 2. AUTOMATIC USER CREATION TRIGGER FROM SUPABASE AUTH
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    )
    ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
        updated_at = timezone('utc'::text, now());

    RETURN NEW;
END;
$$;

-- Drop trigger if existing to ensure clean migration idempotence
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 3. BODY ASSESSMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.body_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    height_cm NUMERIC(5, 2) NOT NULL CHECK (height_cm > 0 AND height_cm <= 300),
    weight_kg NUMERIC(5, 2) NOT NULL CHECK (weight_kg > 0 AND weight_kg <= 500),
    gender TEXT NOT NULL CHECK (gender IN ('MALE', 'FEMALE')),
    age INTEGER NOT NULL CHECK (age >= 10 AND age <= 120),
    bmi NUMERIC(4, 1) NOT NULL CHECK (bmi >= 0),
    bmr NUMERIC(6, 1) NOT NULL CHECK (bmr >= 0),
    target_goal TEXT NOT NULL CHECK (target_goal IN ('WEIGHT_LOSS', 'MUSCLE_GAIN', 'MAINTENANCE')),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_body_assessments_user_id ON public.body_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_body_assessments_recorded_at ON public.body_assessments(user_id, recorded_at DESC);

-- ------------------------------------------------------------------------------
-- 4. WORKOUT SESSIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    session_type TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    calories_burned INTEGER NOT NULL CHECK (calories_burned >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_created_at ON public.workout_sessions(user_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- 5. MEAL LOGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.meal_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    meal_name TEXT NOT NULL,
    calories INTEGER NOT NULL CHECK (calories >= 0),
    protein_g NUMERIC(5, 1) NOT NULL DEFAULT 0 CHECK (protein_g >= 0),
    carbs_g NUMERIC(5, 1) NOT NULL DEFAULT 0 CHECK (carbs_g >= 0),
    fats_g NUMERIC(5, 1) NOT NULL DEFAULT 0 CHECK (fats_g >= 0),
    logged_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_meal_logs_user_id ON public.meal_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_logs_logged_at ON public.meal_logs(user_id, logged_at DESC);

-- ------------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

-- Users table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.users;
CREATE POLICY "Users can delete their own profile"
    ON public.users FOR DELETE
    USING (auth.uid() = id);

-- Body assessments table policies
DROP POLICY IF EXISTS "Users can view their own body assessments" ON public.body_assessments;
CREATE POLICY "Users can view their own body assessments"
    ON public.body_assessments FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own body assessments" ON public.body_assessments;
CREATE POLICY "Users can insert their own body assessments"
    ON public.body_assessments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own body assessments" ON public.body_assessments;
CREATE POLICY "Users can update their own body assessments"
    ON public.body_assessments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own body assessments" ON public.body_assessments;
CREATE POLICY "Users can delete their own body assessments"
    ON public.body_assessments FOR DELETE
    USING (auth.uid() = user_id);

-- Workout sessions table policies
DROP POLICY IF EXISTS "Users can view their own workout sessions" ON public.workout_sessions;
CREATE POLICY "Users can view their own workout sessions"
    ON public.workout_sessions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own workout sessions" ON public.workout_sessions;
CREATE POLICY "Users can insert their own workout sessions"
    ON public.workout_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own workout sessions" ON public.workout_sessions;
CREATE POLICY "Users can update their own workout sessions"
    ON public.workout_sessions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own workout sessions" ON public.workout_sessions;
CREATE POLICY "Users can delete their own workout sessions"
    ON public.workout_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Meal logs table policies
DROP POLICY IF EXISTS "Users can view their own meal logs" ON public.meal_logs;
CREATE POLICY "Users can view their own meal logs"
    ON public.meal_logs FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own meal logs" ON public.meal_logs;
CREATE POLICY "Users can insert their own meal logs"
    ON public.meal_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own meal logs" ON public.meal_logs;
CREATE POLICY "Users can update their own meal logs"
    ON public.meal_logs FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own meal logs" ON public.meal_logs;
CREATE POLICY "Users can delete their own meal logs"
    ON public.meal_logs FOR DELETE
    USING (auth.uid() = user_id);
