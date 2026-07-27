'use server';

const failedAttemptsMap = new Map<string, { count: number; lastAttempt: number }>();

/**
 * Server Action for Admin Authentication with built-in Rate Limiting.
 * Keeps ADMIN_EMAIL and ADMIN_PASSWORD strictly on the server side.
 */
export async function verifyAdminCredentials(
  emailInput: string, 
  passwordInput: string,
  clientKey: string = 'global'
): Promise<{ success: boolean; error?: string; rateLimited?: boolean }> {
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

  const envEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const envPassword = (process.env.ADMIN_PASSWORD || '').trim();

  if (!envEmail || !envPassword) {
    return { success: false, error: 'Admin authentication is not configured on the server.' };
  }

  if (cleanInputEmail === envEmail && cleanInputPassword === envPassword) {
    failedAttemptsMap.delete(clientKey);
    return { success: true };
  }

  // Increment failed attempts
  record.count += 1;
  record.lastAttempt = now;
  failedAttemptsMap.set(clientKey, record);

  return { success: false, error: 'Invalid admin email or password' };
}
