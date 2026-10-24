"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { signInModal, signUpModal, type AuthState } from "@/app/(auth)/actions";
import { notifyAuthChange } from "@/lib/cart";

type Props = {
  /** Shown under the title, e.g. the repair being started */
  context?: string;
  onSuccess: () => void;
  onClose: () => void;
};

const field =
  "mt-1.5 h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-ink placeholder:text-neutral-400 outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/20";

/** Sign in / create account without leaving the page. */
export default function AuthModal({ context, onSuccess, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  const close = () => {
    if (dialog.current?.open) dialog.current.close();
    onClose();
  };

  const done = () => {
    notifyAuthChange();
    if (dialog.current?.open) dialog.current.close();
    onSuccess();
    onClose();
  };

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => e.target === dialog.current && close()}
      aria-label="Sign in to start your repair"
      className="prebook-dialog m-auto w-[min(94vw,440px)] overflow-hidden rounded-[1.75rem] border border-black/[.06] bg-white p-0 text-left text-ink shadow-2xl"
    >
      <div className="relative overflow-hidden bg-ink px-6 pb-5 pt-6 text-white">
        <div aria-hidden="true" className="glow pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full" />
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full text-white/60 transition hover:rotate-90 hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <p className="relative pr-10 text-xl font-bold">{tab === "signin" ? "Sign in to continue" : "Create your account"}</p>
        {context && <p className="relative mt-1 pr-8 text-sm text-white/70">to start: {context}</p>}
        <div role="tablist" className="relative mt-5 grid grid-cols-2 rounded-full bg-white/10 p-1 text-sm font-semibold">
          {(["signin", "signup"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`h-9 rounded-full transition ${tab === t ? "bg-gold text-ink" : "text-white/75 hover:text-white"}`}
            >
              {t === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">{tab === "signin" ? <SignIn onDone={done} /> : <SignUp onDone={done} />}</div>
    </dialog>
  );
}

function useAuth(action: typeof signInModal, onDone: () => void) {
  const [state, run, pending] = useActionState(action, {} as AuthState);
  useEffect(() => {
    if (state.ok) onDone();
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
  return [state, run, pending] as const;
}

function Submit({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-shine inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink font-semibold text-white transition hover:bg-gold hover:text-ink disabled:opacity-60"
    >
      {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
      {label}
    </button>
  );
}

function SignIn({ onDone }: { onDone: () => void }) {
  const [state, run, pending] = useAuth(signInModal, onDone);
  return (
    <form action={run} className="fade-up space-y-4" noValidate>
      {state.message && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.message}</p>}
      <label className="block text-sm font-medium text-neutral-700">
        Email
        <input name="email" type="email" autoComplete="email" defaultValue={state.values?.email} className={field} placeholder="you@example.com" />
      </label>
      <label className="block text-sm font-medium text-neutral-700">
        <span className="flex items-center justify-between">
          Password
          <Link href="/forgot-password" className="text-xs font-semibold text-gold-dark hover:underline">Forgot password?</Link>
        </span>
        <input name="password" type="password" autoComplete="current-password" className={field} />
      </label>
      <Submit pending={pending} label={pending ? "Signing in…" : "Sign in & start repair"} />
    </form>
  );
}

function SignUp({ onDone }: { onDone: () => void }) {
  const [state, run, pending] = useAuth(signUpModal, onDone);
  const e = state.errors ?? {};
  const err = (k: keyof typeof e) => e[k] && <span className="mt-1 block text-xs text-red-600">{e[k]}</span>;
  return (
    <form action={run} className="fade-up space-y-3.5" noValidate>
      <label className="block text-sm font-medium text-neutral-700">
        Full name
        <input name="name" autoComplete="name" defaultValue={state.values?.name} className={field} placeholder="Rahim Uddin" />
        {err("name")}
      </label>
      <label className="block text-sm font-medium text-neutral-700">
        Mobile number
        <input name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={state.values?.phone} className={field} placeholder="01XXXXXXXXX" />
        {err("phone")}
      </label>
      <label className="block text-sm font-medium text-neutral-700">
        Email
        <input name="email" type="email" autoComplete="email" defaultValue={state.values?.email} className={field} placeholder="you@example.com" />
        {err("email")}
      </label>
      <label className="block text-sm font-medium text-neutral-700">
        Password
        <input name="password" type="password" autoComplete="new-password" className={field} placeholder="At least 8 characters" />
        {err("password")}
      </label>
      <Submit pending={pending} label={pending ? "Creating account…" : "Create account & start repair"} />
    </form>
  );
}
