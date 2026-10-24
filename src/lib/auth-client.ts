/**
 * Client-side auth token helpers.
 *
 * Tokens are kept in:
 *  - localStorage  → survives page reload, readable by JS
 *  - cookie        → readable by Next.js middleware for server-side redirect guards
 *
 * Cookie is intentionally NOT httpOnly so JS can also clear it on sign-out.
 */

const TOKEN_KEY = "dc_token";
const API_KEY_KEY = "dc_apiKey";
const COOKIE_NAME = "dc_auth"; // middleware reads this

function setCookie(name: string, value: string, days = 30) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

/** Save tokens after a successful login or registration. */
export function saveAuthTokens(token: string, apiKey: string, userName?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(API_KEY_KEY, apiKey);
  // Auth presence flag — middleware reads this to guard auth pages
  setCookie(COOKIE_NAME, "1");
  // Display name cookie — UserMenu reads this to show initials in the header
  // (mirrors what the old server-session flow did with dc_user)
  if (userName) {
    setCookie("dc_user", userName);
  }
}

/** Read the stored token (for API calls that need Authorization header). */
export function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

/** Read the stored API key. */
export function getApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(API_KEY_KEY) ?? "";
}

/** Returns true when the user has a saved token. */
export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

/** Clear all auth data (sign out). */
export function clearAuthTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(API_KEY_KEY);
  deleteCookie(COOKIE_NAME);
  deleteCookie("dc_user");
  deleteCookie("dc_avatar");
}

/** Save the avatar URL so UserMenu can show it without an API call. */
export function saveAvatarUrl(url: string) {
  if (typeof window === "undefined") return;
  setCookie("dc_avatar", url);
}
