import { type NextRequest, NextResponse } from "next/server";

/**
 * Auth proxy — forwards all POST /api/auth/* requests to the upstream API.
 *
 * Browser sees: POST /api/auth/user-login
 * Upstream sees: POST https://apix.bigpoint.com.bd/user-login
 *
 * The real base URL is never exposed to the client.
 */

const UPSTREAM = (process.env.AUTH_API_URL ?? "https://apix.bigpoint.com.bd").replace(/\/$/, "");

// Endpoints allowed through this proxy — whitelist prevents open-proxy abuse
const ALLOWED = new Set([
  "user-login",
  "user-request-otp",
  "user-verify-otp",
  "user-registration-otp",
  "user-registration",
  "password-recovery",
  "user-profile",
  "change-password",
]);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const endpoint = path.join("/");

  if (!ALLOWED.has(endpoint)) {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  // Forward Authorization + X-API-Key headers if present (for user-profile etc.)
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const auth = request.headers.get("authorization");
  const apiKey = request.headers.get("x-api-key");
  if (auth) headers["Authorization"] = auth;
  if (apiKey) headers["X-API-Key"] = apiKey;

  let body: string | undefined;
  try {
    body = await request.text();
  } catch {
    body = undefined;
  }

  try {
    const upstream = await fetch(`${UPSTREAM}/${endpoint}`, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(15_000),
    });

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    console.error(`[auth-proxy] ${endpoint}`, err);
    return NextResponse.json(
      { statusCode: 503, status: "error", message: "Service temporarily unavailable." },
      { status: 503 },
    );
  }
}

// Also support GET (for user-profile)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const endpoint = path.join("/");

  if (!ALLOWED.has(endpoint)) {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const auth = request.headers.get("authorization");
  const apiKey = request.headers.get("x-api-key");
  if (auth) headers["Authorization"] = auth;
  if (apiKey) headers["X-API-Key"] = apiKey;

  try {
    const upstream = await fetch(`${UPSTREAM}/${endpoint}`, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(15_000),
    });

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    console.error(`[auth-proxy] ${endpoint}`, err);
    return NextResponse.json(
      { statusCode: 503, status: "error", message: "Service temporarily unavailable." },
      { status: 503 },
    );
  }
}
