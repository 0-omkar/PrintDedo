'use server';

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID || 'e9b3362de1c747908244b583284c2349';
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '42c64dad53e752293b838e2137926792';
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '785cccee4331e03e56ee8b38fd4fc53d09de92a74d1790a8d9c1ada6882e3083';
const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'printdedo-r2';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

/**
 * Generates a presigned URL allowing the customer browser to upload a PDF directly to Cloudflare R2
 */
export async function getPresignedUploadUrl(fileName: string, contentType: string = 'application/pdf') {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 600 }); // Valid for 10 minutes
    return { success: true, url };
  } catch (error: any) {
    console.error('Error generating presigned upload URL:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generates a presigned URL allowing the shop owner browser to download/print a PDF directly from Cloudflare R2
 */
export async function getPresignedDownloadUrl(fileName: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 600 }); // Valid for 10 minutes
    return { success: true, url };
  } catch (error: any) {
    console.error('Error generating presigned download URL:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Deletes a PDF file from Cloudflare R2
 */
export async function deleteR2File(fileName: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });

    await s3Client.send(command);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting R2 file:', error);
    return { success: false, error: error.message };
  }
}
