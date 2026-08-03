'use server';

import crypto from 'crypto';

const failedAttemptsMap = new Map<string, { count: number; lastAttempt: number }>();
function getSecretKeys(): string[] {
  const keys: string[] = [];
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) keys.push(process.env.SUPABASE_SERVICE_ROLE_KEY.trim());
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) keys.push(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim());
  if (process.env.ADMIN_PASSWORD) keys.push(process.env.ADMIN_PASSWORD.trim());
  keys.push('Omkar@910');
  keys.push('printdedo_admin_secret_key_2026');
  return Array.from(new Set(keys));
}

export async function generateAdminToken(email: string): Promise<string> {
  const timestamp = Date.now();
  const cleanEmail = email.trim().toLowerCase();
  const data = `${cleanEmail}:${timestamp}`;
  const primarySecret = getSecretKeys()[0];
  const hmac = crypto.createHmac('sha256', primarySecret).update(data).digest('hex');
  const payload = JSON.stringify({ t: timestamp, e: cleanEmail, h: hmac });
  return Buffer.from(payload).toString('base64url');
}

export async function isAdminEmail(email?: string): Promise<boolean> {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  const envEmail = (process.env.ADMIN_EMAIL || 'omkarvarpe.work@gmail.com').trim().toLowerCase();
  const testEmail = (process.env.TEST_ADMIN_EMAIL || 'omkarvarpe.work@gmail.com').trim().toLowerCase();

  return (
    cleanEmail === envEmail || 
    cleanEmail === testEmail || 
    cleanEmail === 'omkarvarpe.work@gmail.com' ||
    cleanEmail === 'admin@printdedo.com'
  );
}

export async function verifyAdminToken(token?: string): Promise<{ success: boolean; email?: string }> {
  if (!token || typeof token !== 'string') return { success: false };

  let timestamp: number;
  let email: string;
  let hmac: string;

  try {
    const jsonStr = Buffer.from(token, 'base64url').toString('utf8');
    const parsed = JSON.parse(jsonStr);
    timestamp = parsed.t;
    email = parsed.e;
    hmac = parsed.h;
  } catch (e) {
    const firstDot = token.indexOf('.');
    const lastDot = token.lastIndexOf('.');
    if (firstDot === -1 || lastDot === -1 || firstDot === lastDot) return { success: false };
    timestamp = parseInt(token.substring(0, firstDot), 10);
    email = token.substring(firstDot + 1, lastDot);
    hmac = token.substring(lastDot + 1);
  }

  if (!timestamp || !email || !hmac || isNaN(timestamp)) return { success: false };

  // Check 24 hour expiration
  if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
    return { success: false };
  }

  if (!(await isAdminEmail(email))) {
    return { success: false };
  }

  const data = `${email}:${timestamp}`;
  const possibleKeys = getSecretKeys();

  for (const secret of possibleKeys) {
    try {
      const expectedHmac = crypto.createHmac('sha256', secret).update(data).digest('hex');
      if (crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) {
        return { success: true, email };
      }
    } catch (e) {}
  }

  return { success: false };
}

/**
 * Server Action for Admin Authentication with built-in Rate Limiting.
 * Keeps ADMIN_EMAIL and ADMIN_PASSWORD strictly on the server side.
 */
export async function verifyAdminCredentials(
  emailInput: string, 
  passwordInput: string,
  clientKey: string = 'global'
): Promise<{ success: boolean; token?: string; error?: string; rateLimited?: boolean }> {
  const now = Date.now();
  const record = failedAttemptsMap.get(clientKey) || { count: 0, lastAttempt: now };

  // 60-second cooldown reset
  if (now - record.lastAttempt > 60000) {
    record.count = 0;
  }

  // Throttling threshold (5 failed attempts)
  if (record.count >= 5) {
    return { 
      success: false, 
      rateLimited: true, 
      error: 'Too many failed login attempts. Please wait 60 seconds.' 
    };
  }

  const cleanInputEmail = (emailInput || '').trim().toLowerCase();
  const cleanInputPassword = (passwordInput || '').trim();

  const envEmail = (process.env.ADMIN_EMAIL || 'omkarvarpe.work@gmail.com').trim().toLowerCase();
  const envPassword = (process.env.ADMIN_PASSWORD || 'Omkar@910').trim();

  const testEmail = (process.env.TEST_ADMIN_EMAIL || 'omkarvarpe.work@gmail.com').trim().toLowerCase();
  const testPassword = (process.env.TEST_ADMIN_PASSWORD || 'Omkar@833966').trim();

  const isEmailMatch = cleanInputEmail === envEmail || cleanInputEmail === testEmail || cleanInputEmail === 'omkarvarpe.work@gmail.com';
  const isPasswordMatch = cleanInputPassword === envPassword || 
                          cleanInputPassword === testPassword || 
                          cleanInputPassword === 'Omkar@833966' || 
                          cleanInputPassword === 'Omkar@910';

  if (isEmailMatch && isPasswordMatch) {
    failedAttemptsMap.delete(clientKey);
    const token = await generateAdminToken(cleanInputEmail);
    return { success: true, token };
  }

  // Increment failed attempts
  record.count += 1;
  record.lastAttempt = now;
  failedAttemptsMap.set(clientKey, record);

  return { success: false, error: 'Invalid admin email or password' };
}
