import { NextResponse } from 'next/server';
import { verifyAdminCredentials } from '@/lib/adminAuth';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('x-admin-auth');
    const body = await request.json();
    const { email, password, store_name, selected_plan_id, custom_months, adminEmail, adminPassword } = body;

    // Validate admin authentication either from request body or header
    let isAuthorized = false;
    if (adminEmail && adminPassword) {
      const authResult = await verifyAdminCredentials(adminEmail, adminPassword);
      isAuthorized = authResult.success;
    } else if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const envEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
      const envPassword = (process.env.ADMIN_PASSWORD || '').trim();
      if (authHeader && authHeader === `${envEmail}:${envPassword}`) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        isAuthorized = true;
      }
    }

    if (!email || !password || !store_name) {
      return NextResponse.json({ error: 'Missing required shop parameters' }, { status: 400 });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { store_name: store_name.trim() }
      }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (authData.user) {
      let addMonths = 1;
      let planName = 'Free Trial';

      if (selected_plan_id === 'custom') {
        addMonths = parseInt(custom_months) || 1;
        planName = `Custom ${addMonths}M`;
      }

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + addMonths);

      const { error: shopError } = await supabase.from('shops').upsert({
        id: authData.user.id,
        store_name: store_name.trim(),
        subscription_expires_at: expiresAt.toISOString(),
        subscription_plan_name: planName
      });

      if (shopError) {
        return NextResponse.json({ error: shopError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
