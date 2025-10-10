import crypto from 'crypto';

/**
 * Generate a secure random share token
 */
export function generateShareToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate shareable URL for report
 */
export function getShareUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
  return `${baseUrl}/share/${token}`;
}

