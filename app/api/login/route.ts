import { NextResponse } from 'next/server';
import { verifyAdminCredentials } from '@/lib/adminAuth';

export async function POST(req: Request) {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const testHeader = !isProduction ? req.headers.get('x-test-client-id') : null;
    
    // Edge-sanitized header priority: Cloudflare -> Vercel -> First IP in X-Forwarded-For
    const rawForwarded = req.headers.get('x-forwarded-for');
    const firstForwardedIp = rawForwarded ? rawForwarded.split(',')[0].trim() : null;

    const ip = testHeader || 
               req.headers.get('cf-connecting-ip') || 
               req.headers.get('x-real-ip') || 
               firstForwardedIp || 
               'global';

    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const authRes = await verifyAdminCredentials(email, password, ip);

    if (authRes.rateLimited) {
      return NextResponse.json(
        { error: authRes.error },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    if (!authRes.success) {
      return NextResponse.json({ error: authRes.error || 'Invalid email or password' }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
