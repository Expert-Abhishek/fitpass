-- ==============================================================================
-- 00002_water_logs.sql
-- Hydration Tracking: Water Logs Table, Indexes & RLS Policies
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.water_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount_ml INTEGER NOT NULL CHECK (amount_ml > 0 AND amount_ml <= 10000),
    logged_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_water_logs_user_id ON public.water_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_water_logs_logged_at ON public.water_logs(user_id, logged_at DESC);

-- Enable Row Level Security
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;

-- Water logs table RLS policies
DROP POLICY IF EXISTS "Users can view their own water logs" ON public.water_logs;
CREATE POLICY "Users can view their own water logs"
    ON public.water_logs FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own water logs" ON public.water_logs;
CREATE POLICY "Users can insert their own water logs"
    ON public.water_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own water logs" ON public.water_logs;
CREATE POLICY "Users can update their own water logs"
    ON public.water_logs FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own water logs" ON public.water_logs;
CREATE POLICY "Users can delete their own water logs"
    ON public.water_logs FOR DELETE
    USING (auth.uid() = user_id);
