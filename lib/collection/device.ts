/**
 * Normalize a User-Agent string to a coarse device type. The raw UA is never
 * stored — only this bucket is.
 */
import type { DeviceType } from "@/types/collection";

export function deviceTypeFromUserAgent(ua: string | null | undefined): DeviceType {
  if (!ua) return "unknown";
  const s = ua.toLowerCase();
  const isTablet = /ipad|tablet|playbook|silk|(android(?!.*mobile))/.test(s);
  if (isTablet) return "tablet";
  const isMobile = /mobi|iphone|ipod|android.*mobile|windows phone|blackberry|bb10|opera mini/.test(s);
  if (isMobile) return "mobile";
  if (/mozilla|chrome|safari|firefox|edg|macintosh|windows nt|x11|linux/.test(s)) return "desktop";
  return "unknown";
}
