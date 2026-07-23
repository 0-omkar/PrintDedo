'use server';

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error('Cloudflare R2 environment variables are missing.');
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

/**
 * Generates a presigned URL allowing the customer browser to upload a PDF directly to Cloudflare R2
 */
export async function getPresignedUploadUrl(fileName: string, contentType: string = 'application/pdf') {
  try {
    if (!fileName || fileName.includes('..')) {
      throw new Error('Invalid file name for upload');
    }

    const { s3Client, bucketName } = getR2Client();
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 600 });
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
    if (!fileName || fileName.includes('..')) {
      throw new Error('Invalid file name for download');
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
    return { success: false, error: error.message };
  }
}

/**
 * Deletes a PDF file from Cloudflare R2
 */
export async function deleteR2File(fileName: string) {
  try {
    if (!fileName || fileName.includes('..')) {
      throw new Error('Invalid file name for deletion');
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
    return { success: false, error: error.message };
  }
}
