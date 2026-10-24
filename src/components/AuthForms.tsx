"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  requestPasswordReset,
  resetPassword,
  signIn,
  signUp,
  type AuthState,
} from "@/app/(auth)/actions";

const initial: AuthState = {};
const field =
  "mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-ink placeholder:text-neutral-400 outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/20";

function Field({
  id,
  label,
  error,
  children,
  aside,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-neutral-700">{label}</label>
        {aside}
      </div>
      {children}
      {error && <p id={`${id}-err`} className="fade-up mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function PasswordInput({ id, name, error, autoComplete }: { id: string; name: string; error?: string; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        required
        minLength={name === "password" && autoComplete === "current-password" ? undefined : 8}
        className={`${field} pr-16`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-neutral-500 hover:text-ink"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}

function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-shine inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink font-semibold text-white transition hover:bg-gold hover:text-ink disabled:opacity-60"
    >
      {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
      {children}
    </button>
  );
}

function FormMessage({ state }: { state: AuthState }) {
  if (!state.message) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={`fade-up rounded-xl px-4 py-3 text-sm ${state.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}
    >
      {state.message}
    </p>
  );
}

export function SignInForm({ next = "" }: { next?: string }) {
  const [state, action, pending] = useActionState(signIn, initial);
  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next} />
      <FormMessage state={state} />
      <Field id="email" label="Email">
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} className={field} placeholder="you@example.com" />
      </Field>
      <Field
        id="password"
        label="Password"
        aside={<Link href="/forgot-password" className="link-underline text-sm font-medium text-gold-dark">Forgot password?</Link>}
      >
        <PasswordInput id="password" name="password" autoComplete="current-password" />
      </Field>
      <Submit pending={pending}>{pending ? "Signing in…" : "Sign in"}</Submit>
      <p className="text-center text-sm text-neutral-600">
        New to DazzleCare?{" "}
        <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="font-semibold text-ink underline underline-offset-4 hover:text-gold-dark">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignUpForm({ next = "" }: { next?: string }) {
  const [state, action, pending] = useActionState(signUp, initial);
  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next} />
      <FormMessage state={state} />
      <Field id="name" label="Full name" error={e.name}>
        <input id="name" name="name" autoComplete="name" required defaultValue={state.values?.name} className={field} placeholder="Rahim Uddin" aria-invalid={!!e.name} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="email" label="Email" error={e.email}>
          <input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} className={field} placeholder="you@example.com" aria-invalid={!!e.email} />
        </Field>
        <Field id="phone" label="Mobile (optional)">
          <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={state.values?.phone} className={field} placeholder="01XXXXXXXXX" />
        </Field>
      </div>
      <Field id="password" label="Password" error={e.password}>
        <PasswordInput id="password" name="password" autoComplete="new-password" error={e.password} />
      </Field>
      <Field id="confirm" label="Confirm password" error={e.confirm}>
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" error={e.confirm} />
      </Field>
      <Submit pending={pending}>{pending ? "Creating account…" : "Create account"}</Submit>
      <p className="text-center text-sm text-neutral-600">
        Already have an account?{" "}
        <Link href="/signin" className="font-semibold text-ink underline underline-offset-4 hover:text-gold-dark">Sign in</Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initial);
  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <Field id="email" label="Email" error={state.errors?.email}>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} className={field} placeholder="you@example.com" />
      </Field>
      <Submit pending={pending}>{pending ? "Sending…" : "Send reset link"}</Submit>
      <p className="text-center text-sm text-neutral-600">
        Remembered it? <Link href="/signin" className="font-semibold text-ink underline underline-offset-4 hover:text-gold-dark">Back to sign in</Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, initial);
  const e = state.errors ?? {};
  if (!token) {
    return (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        This reset link is missing its token.{" "}
        <Link href="/forgot-password" className="font-semibold underline">Request a new link</Link>.
      </p>
    );
  }
  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="token" value={token} />
      <FormMessage state={state} />
      <Field id="password" label="New password" error={e.password}>
        <PasswordInput id="password" name="password" autoComplete="new-password" error={e.password} />
      </Field>
      <Field id="confirm" label="Confirm new password" error={e.confirm}>
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" error={e.confirm} />
      </Field>
      <Submit pending={pending}>{pending ? "Saving…" : "Set new password"}</Submit>
    </form>
  );
}
