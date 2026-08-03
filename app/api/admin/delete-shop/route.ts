import { NextResponse } from 'next/server';
import { verifyAdminCredentials, verifyAdminToken } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabaseServer';

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('x-admin-auth');
    const body = await request.json();
    const { shopId, adminEmail, adminPassword, adminToken } = body;

    let isAuthorized = false;

    if (adminToken) {
      const tokenRes = await verifyAdminToken(adminToken);
      isAuthorized = tokenRes.success;
    } else if (adminEmail && adminPassword) {
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

    if (!shopId) {
      return NextResponse.json({ error: 'Shop ID is required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Delete shop record from database using admin client
    const { error } = await supabaseAdmin
      .from('shops')
      .delete()
      .eq('id', shopId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Delete user from auth table if present
    await supabaseAdmin.auth.admin.deleteUser(shopId).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
