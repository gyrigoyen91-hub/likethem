/**
 * Safe image source helper to prevent next/image errors
 * @param src - The image source URL (can be undefined, null, or empty)
 * @param fallback - Fallback image path (defaults to avatar placeholder)
 * @returns A valid image source URL
 */
export function safeSrc(src?: string | null, fallback = "/images/avatar-placeholder.svg"): string {
  return src && src.trim().length > 0 ? src : fallback;
}

/**
 * Check if a URL is a valid image source
 * @param src - The image source URL
 * @returns true if the URL is valid
 */
export function isValidImageSrc(src?: string | null): boolean {
  return !!(src && src.trim().length > 0);
}
