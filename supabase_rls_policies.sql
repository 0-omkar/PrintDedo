-- PrintDedo Security Hardening Script: Enabling Row Level Security (RLS) & Policies

-- 1. Enable RLS on core tables
ALTER TABLE IF EXISTS public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

-- 2. Define policies for Shops
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'shops') THEN
    DROP POLICY IF EXISTS "Public Shops Read" ON public.shops;
    DROP POLICY IF EXISTS "Shop Owner Access" ON public.shops;
    DROP POLICY IF EXISTS "Shop Owner Update Self" ON public.shops;

    CREATE POLICY "Public Shops Read"
      ON public.shops FOR SELECT
      USING (true);

    CREATE POLICY "Shop Owner Update Self"
      ON public.shops FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END $$;

-- 3. Define policies for Plans
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'plans') THEN
    DROP POLICY IF EXISTS "Public Plans Read" ON public.plans;

    CREATE POLICY "Public Plans Read"
      ON public.plans FOR SELECT
      USING (true);
  END IF;
END $$;

-- 4. Define strict policies for Orders
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
    DROP POLICY IF EXISTS "Public Orders Insert" ON public.orders;
    DROP POLICY IF EXISTS "Shop Owner Orders Access" ON public.orders;
    DROP POLICY IF EXISTS "Shop Owner Orders Select" ON public.orders;
    DROP POLICY IF EXISTS "Shop Owner Orders Update" ON public.orders;
    DROP POLICY IF EXISTS "Shop Owner Orders Delete" ON public.orders;

    -- Allow customers to submit orders for a shop
    CREATE POLICY "Public Orders Insert"
      ON public.orders FOR INSERT
      WITH CHECK (length(file_path) > 0);

    -- Allow shop owners to view, update, and delete ONLY their own shop's orders
    CREATE POLICY "Shop Owner Orders Select"
      ON public.orders FOR SELECT
      USING (shop_id = auth.uid());

    CREATE POLICY "Shop Owner Orders Update"
      ON public.orders FOR UPDATE
      USING (shop_id = auth.uid());

    CREATE POLICY "Shop Owner Orders Delete"
      ON public.orders FOR DELETE
      USING (shop_id = auth.uid());
  END IF;
END $$;

-- 5. Define policies for Admin Messages (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_messages') THEN
    ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public Admin Messages Insert" ON public.admin_messages;

    CREATE POLICY "Public Admin Messages Insert"
      ON public.admin_messages FOR INSERT
      WITH CHECK (length(message) > 0 AND length(message) <= 2000);
  END IF;
END $$;

-- 6. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
