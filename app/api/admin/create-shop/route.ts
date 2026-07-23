import { NextResponse } from 'next/server';
import { verifyAdminCredentials } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabaseServer';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('x-admin-auth');
    const body = await request.json();
    const { email, password, store_name, selected_plan_id, custom_months, adminEmail, adminPassword } = body;

    let isAuthorized = false;

    if (adminEmail && adminPassword) {
      const authResult = await verifyAdminCredentials(adminEmail, adminPassword);
      isAuthorized = authResult.success;
    } else if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && authHeader) {
      const envEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
      const envPassword = (process.env.ADMIN_PASSWORD || '').trim();
      if (authHeader === `${envEmail}:${envPassword}`) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized: Valid admin credentials required' }, { status: 401 });
    }

    if (!email || !password || !store_name) {
      return NextResponse.json({ error: 'Missing required shop parameters' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Create user in Supabase Auth using admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: { store_name: store_name.trim() }
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

      const { error: shopError } = await supabaseAdmin.from('shops').upsert({
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
