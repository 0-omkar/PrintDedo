import { PDFDocument } from 'pdf-lib';

/**
 * Client-side AES-GCM-256 encryption helper.
 */
export async function encryptFile(file: File) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const fileBuffer = await file.arrayBuffer();
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    fileBuffer
  );

  const rawKey = await window.crypto.subtle.exportKey('raw', key);
  const keyBase64 = Buffer.from(rawKey).toString('base64');
  const ivBase64 = Buffer.from(iv).toString('base64');

  return {
    encryptedBlob: new Blob([encryptedBuffer], { type: 'application/octet-stream' }),
    keyBase64,
    ivBase64,
  };
}

/**
 * Client-side AES-GCM-256 decryption helper.
 */
export async function decryptFile(
  encryptedBuffer: ArrayBuffer,
  keyBase64: string,
  ivBase64: string,
  mimeType = 'application/pdf'
): Promise<Blob> {
  const rawKey = Buffer.from(keyBase64, 'base64');
  const iv = Buffer.from(ivBase64, 'base64');

  const key = await window.crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedBuffer
  );

  return new Blob([decryptedBuffer], { type: mimeType });
}

/**
 * Client-side PDF page counter.
 */
export async function countPdfPages(file: File): Promise<number> {
  try {
    const buffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    return doc.getPageCount();
  } catch (err) {
    console.warn('PDF page count fallback to 1:', err);
    return 1;
  }
}
