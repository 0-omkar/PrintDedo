import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const normalizedPath = pathname.toLowerCase();

  const isDashboard = normalizedPath === '/dashboard' || normalizedPath.startsWith('/dashboard/');

  if (!isDashboard) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // Add bfcache security headers to prevent Back button from displaying cached sensitive pages
  response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate, private');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  // Check for Supabase Auth cookie in request cookies
  const authCookie = request.cookies.get('sb-access-token') || 
                     request.cookies.getAll().find(c => c.name.includes('-auth-token'));

  // If no auth cookie present on protected dashboard route, redirect immediately
  if (!authCookie || !authCookie.value) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl, { headers: response.headers });
  }

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

  if (supabaseUrl && supabaseAnonKey) {
    try {
      let token = authCookie.value;
      if (token.startsWith('%7B') || token.startsWith('{')) {
        const parsed = JSON.parse(decodeURIComponent(token));
        token = parsed.access_token || parsed[0] || token;
      }
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      });
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl, { headers: response.headers });
      }
    } catch (e) {
      // Fallback
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
  ],
};
