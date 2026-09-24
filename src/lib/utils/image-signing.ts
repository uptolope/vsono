import { createHmac } from 'crypto';

/**
 * Generate a signed, time-limited URL for a protected image
 * @param imageId - The image ID
 * @param expiresInMinutes - How long the URL is valid for (default: 30 minutes)
 * @returns Full URL to protected image
 */
export function generateSignedImageUrl(
  imageId: string,
  expiresInMinutes: number = 30,
): string {
  const secret = process.env.IMAGE_SIGNING_SECRET || 'default-secret';
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;

  const signature = createHmac('sha256', secret)
    .update(`${imageId}:${expiresAt}`)
    .digest('hex');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return `${baseUrl}/api/protected/images?id=${imageId}&sig=${signature}&expires=${expiresAt}`;
}
