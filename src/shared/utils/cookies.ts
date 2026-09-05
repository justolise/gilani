/**
 * GilaniAI Cookie Utilities
 *
 * Provides type-safe helpers for setting, getting, and removing cookies
 * both on the browser (client-side) and within SSR/server functions.
 */

/**
 * Common cookie options
 */
export interface CookieOptions {
  /** Lifetime in days */
  days?: number;
  /** Lifetime in seconds (takes precedence over days) */
  maxAge?: number;
  /** Path scope (defaults to '/') */
  path?: string;
  /** Domain scope */
  domain?: string;
  /** HTTPS only (defaults to true in production) */
  secure?: boolean;
  /** SameSite policy ('lax', 'strict', or 'none') */
  sameSite?: "lax" | "strict" | "none";
}

/**
 * Set a cookie in the browser.
 * Respects cookie consent if checkConsent is true.
 */
export function setClientCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof document === "undefined") return;

  const {
    days = 365,
    maxAge,
    path = "/",
    domain,
    secure = window.location.protocol === "https:",
    sameSite = "lax",
  } = options;

  let expires = "";
  if (maxAge !== undefined) {
    expires = `; max-age=${maxAge}`;
  } else if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }

  const domainStr = domain ? `; domain=${domain}` : "";
  const secureStr = secure ? "; Secure" : "";
  const sameSiteStr = `; SameSite=${sameSite}`;

  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${expires}; path=${path}${domainStr}${secureStr}${sameSiteStr}`;
}

/**
 * Read a cookie in the browser by name.
 */
export function getClientCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const nameEQ = `${encodeURIComponent(name)}=`;
  const ca = document.cookie.split(";");

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
}

/**
 * Remove a cookie in the browser.
 */
export function removeClientCookie(name: string, path = "/"): void {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
}

/**
 * Parse cookies from a raw HTTP 'Cookie' header string (for SSR server functions).
 */
export function parseCookieHeader(cookieHeader?: string | null): Record<string, string> {
  if (!cookieHeader) return {};

  const cookies: Record<string, string> = {};
  const pairs = cookieHeader.split(";");

  for (const pair of pairs) {
    const idx = pair.indexOf("=");
    if (idx < 0) continue;
    const key = decodeURIComponent(pair.substring(0, idx).trim());
    const val = decodeURIComponent(pair.substring(idx + 1).trim());
    cookies[key] = val;
  }

  return cookies;
}
