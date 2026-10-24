import { type NextRequest, NextResponse } from "next/server";

/**
 * Auth guard middleware.
 *
 * - Logged-in users trying to visit /signin, /signup, /forgot-password, /reset-password
 *   are redirected to /account (or the `next` query param).
 *
 * The presence of the `dc_auth` cookie (set by saveAuthTokens() in auth-client.ts)
 * is used as the "logged in" signal — no JWT parsing needed here.
 */

const AUTH_PAGES = ["/signin", "/signup", "/forgot-password", "/reset-password"];

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const isAuthPage = AUTH_PAGES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!isAuthPage) return NextResponse.next();

  const loggedIn = request.cookies.has("dc_auth");
  if (!loggedIn) return NextResponse.next();

  // Already logged in → bounce away from auth pages
  const next = searchParams.get("next");
  const destination = next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  return NextResponse.redirect(new URL(destination, request.url));
}

export const config = {
  matcher: ["/signin", "/signup", "/forgot-password", "/reset-password/:path*"],
};
