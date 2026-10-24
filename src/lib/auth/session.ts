import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";

const scryptAsync = promisify(scrypt) as (pw: string, salt: string, len: number) => Promise<Buffer>;

export const SESSION_COOKIE = "dc_session";
/** Readable by the browser, display-only (first name + initials). Never trusted for auth. */
export const DISPLAY_COOKIE = "dc_user";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret() {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET (32+ chars) must be set in production");
  return "dev-only-insecure-secret-change-me-please-0000";
}

// ---- passwords -------------------------------------------------------------

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = await scryptAsync(password, salt, 64);
  return `scrypt$${salt}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [, salt, hex] = stored.split("$");
  if (!salt || !hex) return false;
  const key = await scryptAsync(password, salt, 64);
  const expected = Buffer.from(hex, "hex");
  return expected.length === key.length && timingSafeEqual(expected, key);
}

// ---- reset tokens ----------------------------------------------------------

export const newResetToken = () => randomBytes(32).toString("base64url");
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

// ---- signed session cookie -------------------------------------------------

export type Session = { uid: string; name: string; email: string; exp: number };

const sign = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");

function encode(session: Session) {
  const data = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${data}.${sign(data)}`;
}

function decode(token?: string): Session | null {
  if (!token) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = Buffer.from(sign(data));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const session = JSON.parse(Buffer.from(data, "base64url").toString()) as Session;
    return session.exp > Date.now() / 1000 ? session : null;
  } catch {
    return null;
  }
}

export async function getSession() {
  return decode((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function startSession(user: { id: string; name: string; email: string }) {
  const token = encode({ uid: user.id, name: user.name, email: user.email, exp: Math.floor(Date.now() / 1000) + MAX_AGE });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  // Lets the static header show the account menu without a server render per request
  (await cookies()).set(DISPLAY_COOKIE, encodeURIComponent(user.name.slice(0, 60)), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(DISPLAY_COOKIE);
}
