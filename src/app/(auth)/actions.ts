"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import {
  createUser,
  findUserByEmail,
  findUserByResetHash,
  normalizeEmail,
  updateUser,
} from "@/lib/auth/store";
import { endSession, hashPassword, hashToken, newResetToken, startSession, verifyPassword } from "@/lib/auth/session";
import { site } from "@/lib/site";
import { contextFromHeaders, newEventId, normalizePhone, sendMetaEvent } from "@/lib/tracking/server";

export type AuthState = {
  ok?: boolean;
  message?: string;
  errors?: Partial<Record<"name" | "email" | "phone" | "password" | "confirm", string>>;
  values?: { name?: string; email?: string; phone?: string };
};

const str = (v: FormDataEntryValue | null, max = 200) => String(v ?? "").trim().slice(0, max);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Only allow same-site relative redirects after sign-in. */
const safeNext = (next: string) => (next.startsWith("/") && !next.startsWith("//") ? next : "/account");

// Naive in-memory throttle for sign-in attempts (per IP + email).
const attempts = new Map<string, { count: number; until: number }>();
const MAX_TRACKED = 5_000;

/** Drops expired entries and caps the map so it can never grow without bound. */
function pruneAttempts(now: number) {
  for (const [k, v] of attempts) if (v.until <= now) attempts.delete(k);
  // Map keeps insertion order → delete the oldest first if still too big
  for (const k of attempts.keys()) {
    if (attempts.size <= MAX_TRACKED) break;
    attempts.delete(k);
  }
}

async function throttled(email: string) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "local";
  const key = `${ip}:${email}`;
  const now = Date.now();
  if (attempts.size > 500) pruneAttempts(now);
  const entry = attempts.get(key);
  if (entry && entry.until > now && entry.count >= 5) return { blocked: true, key };
  if (!entry || entry.until <= now) attempts.set(key, { count: 0, until: now + 15 * 60_000 });
  return { blocked: false, key };
}

/** Creates the account and starts a session. Shared by the sign-up page and the login modal. */
async function register(form: FormData, opts: { requirePhone?: boolean } = {}): Promise<AuthState> {
  const name = str(form.get("name"), 80);
  const email = normalizeEmail(str(form.get("email"), 120));
  const phone = str(form.get("phone"), 20);
  const password = String(form.get("password") ?? "");
  const confirm = form.has("confirm") ? String(form.get("confirm") ?? "") : password;
  const values = { name, email, phone };

  const errors: AuthState["errors"] = {};
  if (name.length < 2) errors.name = "Please enter your name.";
  if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  if ((opts.requirePhone || phone) && !/^8801[3-9]\d{8}$/.test(normalizePhone(phone)))
    errors.phone = "Enter a valid Bangladeshi mobile number (01XXXXXXXXX).";
  if (password.length < 8) errors.password = "Use at least 8 characters.";
  else if (password.length > 128) errors.password = "Password is too long.";
  if (confirm !== password) errors.confirm = "Passwords don't match.";
  if (Object.keys(errors).length) return { errors, values };

  const user = await createUser({
    id: randomUUID(),
    name,
    email,
    phone: phone ? `0${normalizePhone(phone).slice(-10)}` : undefined,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  });
  if (!user) return { errors: { email: "An account with this email already exists." }, values };

  await startSession(user);

  const h = await headers();
  const ctx = contextFromHeaders(h, () => undefined, `${site.url}/signup`);
  after(() =>
    sendMetaEvent({ eventName: "CompleteRegistration", eventId: newEventId(), ctx, user: { email, phone, name } }),
  );
  return { ok: true, values };
}

/** Checks the password and starts a session. Shared by the sign-in page and the login modal. */
async function authenticate(form: FormData): Promise<AuthState> {
  const email = normalizeEmail(str(form.get("email"), 120));
  const password = String(form.get("password") ?? "");
  const values = { email };
  if (!EMAIL_RE.test(email) || !password) return { message: "Enter your email and password.", values };

  const { blocked, key } = await throttled(email);
  if (blocked) return { message: "Too many attempts. Please try again in 15 minutes.", values };

  const user = await findUserByEmail(email);
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !valid) {
    const entry = attempts.get(key);
    if (entry) entry.count++;
    return { message: "Incorrect email or password.", values };
  }

  attempts.delete(key);
  await startSession(user);
  return { ok: true, values: { email, name: user.name } };
}

export async function signUp(_prev: AuthState, form: FormData): Promise<AuthState> {
  const result = await register(form);
  if (!result.ok) return result;
  redirect(safeNext(str(form.get("next"))));
}

export async function signIn(_prev: AuthState, form: FormData): Promise<AuthState> {
  const result = await authenticate(form);
  if (!result.ok) return result;
  redirect(safeNext(str(form.get("next"))));
}

/** Login modal: same checks, but returns instead of redirecting so the page can continue. */
export async function signInModal(_prev: AuthState, form: FormData): Promise<AuthState> {
  return authenticate(form);
}

/** Login modal sign-up: phone is required because it's needed for the repair booking. */
export async function signUpModal(_prev: AuthState, form: FormData): Promise<AuthState> {
  return register(form, { requirePhone: true });
}

export async function signOut() {
  await endSession();
  redirect("/");
}

export async function requestPasswordReset(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = normalizeEmail(str(form.get("email"), 120));
  if (!EMAIL_RE.test(email)) return { errors: { email: "Enter a valid email address." }, values: { email } };

  const user = await findUserByEmail(email);
  if (user) {
    const token = newResetToken();
    await updateUser(user.id, { resetTokenHash: hashToken(token), resetTokenExpires: Date.now() + 30 * 60_000 });
    const link = `${site.url}/reset-password?token=${token}`;

    // Deliver via your email provider (Resend / SendGrid / n8n ...) through a webhook.
    const webhook = process.env.RESET_EMAIL_WEBHOOK_URL;
    if (webhook) {
      after(() =>
        fetch(webhook, {
          method: "POST",
        signal: AbortSignal.timeout(8000),
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: email, name: user.name, link, subject: `Reset your ${site.name} password` }),
        }).catch((err) => console.error("[reset-email]", err)),
      );
    } else if (process.env.NODE_ENV !== "production") {
      console.info(`[reset-password] ${email} → ${link}`);
    }
  }

  // Same response whether or not the account exists (prevents email enumeration).
  return { ok: true, message: "If an account exists for this email, a reset link has been sent. It expires in 30 minutes." };
}

export async function resetPassword(_prev: AuthState, form: FormData): Promise<AuthState> {
  const token = str(form.get("token"), 200);
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");

  const errors: AuthState["errors"] = {};
  if (password.length < 8) errors.password = "Use at least 8 characters.";
  if (confirm !== password) errors.confirm = "Passwords don't match.";
  if (Object.keys(errors).length) return { errors };

  const user = token ? await findUserByResetHash(hashToken(token)) : undefined;
  if (!user) return { message: "This reset link is invalid or has expired. Please request a new one." };

  await updateUser(user.id, {
    passwordHash: await hashPassword(password),
    resetTokenHash: undefined,
    resetTokenExpires: undefined,
  });
  await startSession(user);
  redirect("/account");
}
