import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client for administrative and background operations.
 * Uses SUPABASE_SERVICE_ROLE_KEY if defined, falling back to anon key for public checks.
 */
export function getSupabaseAdmin() {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables on the server.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
