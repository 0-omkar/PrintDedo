-- ====================================================================
-- SUPABASE SUBSCRIPTION SYSTEM MIGRATION
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ====================================================================

-- 1. Add subscription columns to public.shops table
ALTER TABLE public.shops 
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_plan_name TEXT DEFAULT 'Free Trial';

-- 2. Create public.plans table to hold customizable standard plans
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  duration_months INT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT
);

-- 3. Row Level Security (RLS) on plans table
-- The admin panel runs entirely in the browser using the public anonymous client.
-- Therefore, we must either disable RLS on the plans table, or enable RLS and add public read/write policies.

-- OPTION A: Disable RLS (Simplest)
ALTER TABLE public.plans DISABLE ROW LEVEL SECURITY;

-- OPTION B: Keep RLS enabled but allow public CRUD access (If Option A is not preferred)
-- ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Allow public read access" ON public.plans;
-- CREATE POLICY "Allow public read access" ON public.plans FOR SELECT TO public USING (true);
-- DROP POLICY IF EXISTS "Allow public insert access" ON public.plans;
-- CREATE POLICY "Allow public insert access" ON public.plans FOR INSERT TO public WITH CHECK (true);
-- DROP POLICY IF EXISTS "Allow public update access" ON public.plans;
-- CREATE POLICY "Allow public update access" ON public.plans FOR UPDATE TO public USING (true) WITH CHECK (true);
-- DROP POLICY IF EXISTS "Allow public delete access" ON public.plans;
-- CREATE POLICY "Allow public delete access" ON public.plans FOR DELETE TO public USING (true);


-- 3. Populate default subscription plans
INSERT INTO public.plans (id, name, duration_months, price, description)
VALUES 
  ('free_trial', 'Free Trial', 1, 0, '1 Month trial for new shops (Free)'),
  ('quarterly', 'Quarterly', 3, 1500, '3 Months standard subscription (500₹/mo)'),
  ('half_yearly', 'Half Yearly', 6, 2700, '6 Months cost-effective subscription (450₹/mo)'),
  ('yearly', 'Yearly', 12, 4800, '12 Months premium subscription (400₹/mo)')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    duration_months = EXCLUDED.duration_months,
    price = EXCLUDED.price,
    description = EXCLUDED.description;

-- 4. Reload PostgREST schema cache immediately so columns are visible to client queries
NOTIFY pgrst, 'reload schema';
