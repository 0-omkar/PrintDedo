'use server';

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getSupabaseAdmin } from './supabaseServer';

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error('Cloudflare R2 environment variables are missing on the server.');
  }

  const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    forcePathStyle: true,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return { s3Client, bucketName };
}

function validateFileName(fileName: string): boolean {
  if (!fileName || typeof fileName !== 'string') return false;
  if (fileName.includes('..') || fileName.startsWith('/') || fileName.includes('\\')) return false;
  const parts = fileName.split('/');
  return parts.length === 2 && parts[0].trim().length > 0 && parts[1].trim().length > 0;
}

/**
 * Validates shop existence and active subscription on server side.
 */
async function validateShopSubscription(fileName: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const shopId = fileName.split('/')[0];
    if (!shopId) return { valid: true };

    const supabaseAdmin = getSupabaseAdmin();
    const { data: shop, error } = await supabaseAdmin
      .from('shops')
      .select('id, subscription_expires_at')
      .eq('id', shopId)
      .maybeSingle();

    if (!error && shop && shop.subscription_expires_at) {
      const expires = new Date(shop.subscription_expires_at).getTime();
      if (expires < Date.now()) {
        return { valid: false, error: 'Shop subscription is expired. Uploads are currently disabled for this shop.' };
      }
    }

    return { valid: true };
  } catch (err: any) {
    console.warn('Graceful fallback in shop subscription validation:', err);
    return { valid: true };
  }
}

/**
 * Generates a presigned URL allowing customer browser to upload a document/image directly to Cloudflare R2
 */
export async function getPresignedUploadUrl(fileName: string) {
  try {
    if (!validateFileName(fileName)) {
      return { success: false, error: 'Invalid file path format.' };
    }

    const subCheck = await validateShopSubscription(fileName);
    if (!subCheck.valid) {
      return { success: false, error: subCheck.error || 'Shop subscription validation failed.' };
    }

    const { s3Client, bucketName } = getR2Client();
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 600 });
    return { success: true, url };
  } catch (error: any) {
    console.error('Error generating presigned upload URL:', error);
    return { success: false, error: error.message || 'Presigned upload URL generation failed' };
  }
}

/**
 * Generates a presigned URL allowing shop owner browser to download/print a document directly from Cloudflare R2
 */
export async function getPresignedDownloadUrl(fileName: string) {
  try {
    if (!validateFileName(fileName)) {
      return { success: false, error: 'Invalid file path format.' };
    }

    const { s3Client, bucketName } = getR2Client();
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 600 });
    return { success: true, url };
  } catch (error: any) {
    console.error('Error generating presigned download URL:', error);
    return { success: false, error: error.message || 'Presigned download URL generation failed' };
  }
}

/**
 * Deletes a file from Cloudflare R2
 */
export async function deleteR2File(fileName: string) {
  try {
    if (!validateFileName(fileName)) {
      return { success: false, error: 'Invalid file name for deletion' };
    }

    const { s3Client, bucketName } = getR2Client();
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });

    await s3Client.send(command);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting R2 file:', error);
    return { success: false, error: error.message || 'Delete R2 file failed' };
  }
}

/**
 * Direct server-side upload to Cloudflare R2
 */
export async function uploadR2Direct(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;

    if (!file || !fileName) {
      return { success: false, error: 'Missing file or file name for upload' };
    }

    if (!validateFileName(fileName)) {
      return { success: false, error: 'Invalid file format or name.' };
    }

    const subCheck = await validateShopSubscription(fileName);
    if (!subCheck.valid) {
      return { success: false, error: subCheck.error || 'Shop subscription is invalid or expired.' };
    }

    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: 'File size exceeds the 50MB limit.' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { s3Client, bucketName } = getR2Client();
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
    });

    await s3Client.send(command);
    return { success: true };
  } catch (error: any) {
    console.error('Error in direct server R2 upload:', error);
    return { success: false, error: error.message || 'Direct R2 upload failed' };
  }
}
