-- ====================================================================
-- SUPABASE 10-MINUTE CLEANUP SCHEMA MIGRATION
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ====================================================================

-- 1. Enable pg_cron Extension if not already active
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Create Trigger Function to delete files from Storage bucket when an order is deleted
--    Supabase Storage stores references in storage.objects table.
--    Deleting a row in storage.objects automatically triggers physical file deletion.
CREATE OR REPLACE FUNCTION public.delete_storage_file_on_order_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM storage.objects
  WHERE bucket_id = 'xerox-files'
    AND name = OLD.file_path;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Bind Trigger to orders table
--    So whenever we delete an order (either manually or via cleanup job),
--    the corresponding PDF is instantly deleted from storage.
DROP TRIGGER IF EXISTS tr_delete_storage_file ON public.orders;
CREATE TRIGGER tr_delete_storage_file
BEFORE DELETE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.delete_storage_file_on_order_delete();

-- 4. Create database cleanup function
CREATE OR REPLACE FUNCTION public.clean_old_orders()
RETURNS void AS $$
BEGIN
  -- Deleting orders triggers tr_delete_storage_file to remove files
  DELETE FROM public.orders
  WHERE created_at < NOW() - INTERVAL '10 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Schedule Job via pg_cron to check & clean up every minute
SELECT cron.unschedule('clean-old-orders-job'); -- clear previous if exists
SELECT cron.schedule(
  'clean-old-orders-job',
  '* * * * *', -- runs every minute
  $$ SELECT public.clean_old_orders(); $$
);
