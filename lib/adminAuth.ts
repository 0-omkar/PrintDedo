'use server';

/**
 * Server Action for Admin Authentication
 * Keeps ADMIN_EMAIL and ADMIN_PASSWORD strictly on the server side so credentials are never bundled into client JavaScript.
 */
export async function verifyAdminCredentials(emailInput: string, passwordInput: string): Promise<{ success: boolean; error?: string }> {
  const cleanInputEmail = (emailInput || '').trim().toLowerCase();
  const cleanInputPassword = (passwordInput || '').trim();

  const envEmail = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'omkarvarpe.work@gmail.com').trim().toLowerCase();
  const envPassword = (process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Omkar@910').trim();

  if (cleanInputEmail === envEmail && cleanInputPassword === envPassword) {
    return { success: true };
  }

  return { success: false, error: 'Invalid admin email or password' };
}
