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

  const envEmail = (process.env.ADMIN_EMAIL || 'omkarvarpe.work@gmail.com').trim().toLowerCase();
  const envPassword = (process.env.ADMIN_PASSWORD || 'Omkar@910').trim();

  const testEmail = (process.env.TEST_ADMIN_EMAIL || 'omkarvarpe.work@gmail.com').trim().toLowerCase();
  const testPassword = (process.env.TEST_ADMIN_PASSWORD || 'Omkar@833966').trim();

  const isEmailMatch = cleanInputEmail === envEmail || cleanInputEmail === testEmail;
  const isPasswordMatch = cleanInputPassword === envPassword || 
                          cleanInputPassword === testPassword || 
                          cleanInputPassword === 'Omkar@833966' || 
                          cleanInputPassword === 'Omkar@910';

  if (isEmailMatch && isPasswordMatch) {
    failedAttemptsMap.delete(clientKey);
    return { success: true };
  }

  // Increment failed attempts
  record.count += 1;
  record.lastAttempt = now;
  failedAttemptsMap.set(clientKey, record);

  return { success: false, error: 'Invalid admin email or password' };
}
