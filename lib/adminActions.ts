'use server';

import { verifyAdminCredentials } from './adminAuth';
import { getSupabaseAdmin } from './supabaseServer';

interface AdminAuthPayload {
  adminEmail?: string;
  adminPassword?: string;
}

/**
 * Strict server-side authorization check for Super-Admin actions.
 * Fails closed unless valid admin email and password are provided and verified.
 */
async function authorizeAdmin(payload?: AdminAuthPayload): Promise<boolean> {
  if (!payload || !payload.adminEmail || !payload.adminPassword) {
    return false;
  }
  const res = await verifyAdminCredentials(payload.adminEmail, payload.adminPassword);
  return res.success;
}

/**
 * Server action to create a new subscription plan
 */
export async function createSubscriptionPlanServer(planObj: {
  id: string;
  name: string;
  price: number;
  duration_months: number;
  description?: string;
}, authPayload?: AdminAuthPayload) {
  const isAuth = await authorizeAdmin(authPayload);
  if (!isAuth) {
    return { success: false, error: 'Unauthorized: Super Admin credentials required.' };
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from('plans').upsert([planObj]);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create plan' };
  }
}

/**
 * Server action to update an existing subscription plan
 */
export async function updateSubscriptionPlanServer(planId: string, updatedObj: {
  name: string;
  price: number;
  duration_months: number;
  description?: string;
}, authPayload?: AdminAuthPayload) {
  const isAuth = await authorizeAdmin(authPayload);
  if (!isAuth) {
    return { success: false, error: 'Unauthorized: Super Admin credentials required.' };
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from('plans').update(updatedObj).eq('id', planId);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update plan' };
  }
}

/**
 * Server action to delete a subscription plan
 */
export async function deleteSubscriptionPlanServer(planId: string, authPayload?: AdminAuthPayload) {
  const isAuth = await authorizeAdmin(authPayload);
  if (!isAuth) {
    return { success: false, error: 'Unauthorized: Super Admin credentials required.' };
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from('plans').delete().eq('id', planId);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete plan' };
  }
}

/**
 * Server action to renew a shop subscription
 */
export async function renewShopSubscriptionServer(shopId: string, newExpiryIso: string, planName: string, authPayload?: AdminAuthPayload) {
  const isAuth = await authorizeAdmin(authPayload);
  if (!isAuth) {
    return { success: false, error: 'Unauthorized: Super Admin credentials required.' };
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from('shops')
      .update({
        subscription_expires_at: newExpiryIso,
        subscription_plan_name: planName
      })
      .eq('id', shopId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to renew subscription' };
  }
}

/**
 * Server action to update a shop's details (phone, alternate_phone, store_name, upi_id) by Admin
 */
export async function updateShopDetailsServer(shopId: string, updatedObj: {
  store_name?: string;
  phone?: string;
  alternate_phone?: string;
  upi_id?: string;
}, authPayload?: AdminAuthPayload) {
  const isAuth = await authorizeAdmin(authPayload);
  if (!isAuth) {
    return { success: false, error: 'Unauthorized: Super Admin credentials required.' };
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from('shops')
      .update(updatedObj)
      .eq('id', shopId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update shop details' };
  }
}

/**
 * Server action to delete an admin support message
 */
export async function deleteAdminMessageServer(messageId: string, authPayload?: AdminAuthPayload) {
  const isAuth = await authorizeAdmin(authPayload);
  if (!isAuth) {
    return { success: false, error: 'Unauthorized: Super Admin credentials required.' };
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from('admin_messages').delete().eq('id', messageId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete message' };
  }
}

/**
 * Server action to delete a platform review
 */
export async function deletePlatformReviewServer(reviewId: string, authPayload?: AdminAuthPayload) {
  const isAuth = await authorizeAdmin(authPayload);
  if (!isAuth) {
    return { success: false, error: 'Unauthorized: Super Admin credentials required.' };
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from('platform_reviews').delete().eq('id', reviewId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete review' };
  }
}

/**
 * Server action to reply to a platform review
 */
export async function replyPlatformReviewServer(reviewId: string, reply: string, authPayload?: AdminAuthPayload) {
  const isAuth = await authorizeAdmin(authPayload);
  if (!isAuth) {
    return { success: false, error: 'Unauthorized: Super Admin credentials required.' };
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from('platform_reviews').update({ reply }).eq('id', reviewId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to post reply' };
  }
}
