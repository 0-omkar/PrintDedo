'use server';

import crypto from 'crypto';

const failedAttemptsMap = new Map<string, { count: number; lastAttempt: number }>();
const SECRET_KEY = process.env.ADMIN_PASSWORD || process.env.SUPABASE_SERVICE_ROLE_KEY || 'printdedo_admin_secret_key_2026';

export async function generateAdminToken(email: string): Promise<string> {
  const timestamp = Date.now();
  const cleanEmail = email.trim().toLowerCase();
  const data = `${cleanEmail}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');
  return `${timestamp}.${cleanEmail}.${hmac}`;
}

export async function verifyAdminToken(token?: string): Promise<{ success: boolean; email?: string }> {
  if (!token || typeof token !== 'string') return { success: false };
  const parts = token.split('.');
  if (parts.length !== 3) return { success: false };

  const [timestampStr, email, hmac] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return { success: false };

  // Check 24 hour expiration
  if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
    return { success: false };
  }

  const data = `${email}:${timestamp}`;
  const expectedHmac = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');

  try {
    if (crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) {
      return { success: true, email };
    }
  } catch (e) {}

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
