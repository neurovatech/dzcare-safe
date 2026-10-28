"use client";

import { useEffect, useRef, useState } from "react";
import { notifyAuthChange } from "@/lib/cart";
import { saveAuthTokens, saveAvatarUrl } from "@/lib/auth-client";

type Props = {
  context?: string;
  onSuccess: () => void;
  onClose: () => void;
};

// ─── Auth API proxy ────────────────────────────────────────────────────────────
const AUTH_PROXY = "/api/auth";

async function authPost<T>(endpoint: string, body: Record<string, string>): Promise<T> {
  const res = await fetch(`${AUTH_PROXY}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(12_000),
  });
  const json = (await res.json()) as T;
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json;
}

function parseError(err: unknown): { message: string; errors?: string[] } {
  if (err instanceof Error) {
    try { return JSON.parse(err.message) as { message: string; errors?: string[] }; }
    catch { return { message: err.message }; }
  }
  return { message: "Something went wrong." };
}

async function fetchAndCacheProfile(token: string, apiKey: string) {
  try {
    const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    const res = await fetch(`/api/auth/user-profile`, {
      method: "GET",
      headers: { "Content-Type": "application/json", "X-API-Key": apiKey, Authorization: authHeader },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return;
    const json = (await res.json()) as { success: boolean; data?: { userFullName?: string; userAvatar?: string } };
    if (!json.success || !json.data) return;
    const exp = new Date(Date.now() + 30 * 864e5).toUTCString();
    if (json.data.userFullName)
      document.cookie = `dc_user=${encodeURIComponent(json.data.userFullName)}; expires=${exp}; path=/; SameSite=Lax`;
    if (json.data.userAvatar) saveAvatarUrl(json.data.userAvatar);
    window.dispatchEvent(new Event("dc-auth"));
  } catch { /* non-critical */ }
}

// ─── Shared field style ────────────────────────────────────────────────────────
const field =
  "mt-1.5 h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-ink placeholder:text-neutral-400 outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/20";

// ─── Submit button ─────────────────────────────────────────────────────────────
function Submit({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button type="submit" disabled={pending}
      className="btn-shine inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink font-semibold text-white transition hover:bg-gold hover:text-ink disabled:opacity-60">
      {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
      {label}
    </button>
  );
}

// ─── RESEND COOLDOWN ───────────────────────────────────────────────────────────
const RESEND_COOLDOWN = 120;

// ═════════════════════════════════════════════════════════════════════════════
// Sign In form (email + password) with Phone OTP inline
// ═════════════════════════════════════════════════════════════════════════════
function SignIn({ onDone }: { onDone: () => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  // Phone OTP sub-flow
  const [phoneFlow, setPhoneFlow] = useState<"idle" | "mobile" | "otp" | "profile">("idle");
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [sentMobile, setSentMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileErrors, setProfileErrors] = useState<{ name?: string; email?: string }>({});
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const startTimer = () => {
    setResendTimer(RESEND_COOLDOWN);
    setCanResend(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((p) => {
        if (p <= 1) { clearInterval(timerRef.current!); setCanResend(true); return 0; }
        return p - 1;
      });
    }, 1000);
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // ── Email + password login ──
  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") as string).trim();
    const password = fd.get("password") as string;
    try {
      const res = await authPost<{
        statusCode: number; status: string; message: string;
        data?: { "x-api-key": string; Authorization?: string; authorization?: string };
      }>("user-login", { username: email, password });
      if (res.statusCode === 200 && res.data?.["x-api-key"]) {
        const token = res.data.Authorization || res.data.authorization || "";
        const apiKey = res.data["x-api-key"];
        saveAuthTokens(token, apiKey, email);
        window.dispatchEvent(new Event("dc-auth"));
        void fetchAndCacheProfile(token, apiKey);
        notifyAuthChange();
        onDone();
      } else {
        setError(res.message || "Login failed.");
      }
    } catch (err) {
      const p = parseError(err);
      setError(p.errors?.join(" ") || p.message);
    } finally {
      setPending(false);
    }
  };

  // ── Phone: send OTP ──
  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!mobile || !/^\d{11}$/.test(mobile) || !/^01[3-9]\d{8}$/.test(mobile)) {
      setMobileError("Enter a valid 11-digit Bangladeshi mobile number.");
      return;
    }
    setMobileError("");
    setSendingOtp(true);
    try {
      const res = await authPost<{ statusCode: number; message: string }>("user-request-otp", { mobile });
      if (res.statusCode === 200 || res.statusCode === 429) {
        setSentMobile(mobile);
        setPhoneFlow("otp");
        startTimer();
        if (res.statusCode === 429) setOtpError(res.message);
      } else {
        setMobileError(res.message || "Failed to send OTP.");
      }
    } catch (err) {
      const p = parseError(err);
      const code = (p as { statusCode?: number }).statusCode;
      if (code === 429) {
        setSentMobile(mobile);
        setPhoneFlow("otp");
        startTimer();
        setOtpError(p.message);
      } else {
        setMobileError(p.errors?.join(" ") || p.message);
      }
    } finally {
      setSendingOtp(false);
    }
  };

  // ── Phone: verify OTP ──
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { setOtpError("Please enter the 6-digit OTP."); return; }
    setOtpError("");
    setVerifyingOtp(true);
    try {
      const res = await authPost<{
        statusCode: number; message: string; userExist?: boolean;
        data?: { "x-api-key": string; Authorization?: string; authorization?: string };
      }>("user-verify-otp", { mobile: sentMobile, otp });
      if (res.statusCode === 200) {
        if (res.userExist === false) {
          setIsNewUser(true);
          setPhoneFlow("profile");
          return;
        }
        if (res.data?.["x-api-key"]) {
          const token = res.data.Authorization || res.data.authorization || "";
          const apiKey = res.data["x-api-key"];
          saveAuthTokens(token, apiKey, sentMobile);
          window.dispatchEvent(new Event("dc-auth"));
          void fetchAndCacheProfile(token, apiKey);
          notifyAuthChange();
          onDone();
        } else {
          setOtpError(res.message || "Verification failed.");
        }
      } else {
        setOtpError(res.message || "Invalid OTP.");
      }
    } catch (err) {
      const p = parseError(err);
      setOtpError(p.errors?.join(" ") || p.message);
      setOtp("");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // ── Phone: complete registration ──
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileName.trim().length < 2) { setProfileErrors({ name: "Full name is required." }); return; }
    setProfileErrors({});
    setSubmittingProfile(true);
    try {
      const payload: Record<string, string> = { mobile: sentMobile, otp, userFullName: profileName.trim() };
      if (profileEmail.trim()) payload.email = profileEmail.trim();
      if (profileAddress.trim()) payload.address = profileAddress.trim();
      const res = await authPost<{
        statusCode: number; message: string; errors?: string[];
        data?: { "x-api-key": string; Authorization: string; userFullName?: string };
      }>("user-registration-otp", payload);
      if (res.statusCode === 200 && res.data) {
        const token = res.data.Authorization;
        const apiKey = res.data["x-api-key"];
        saveAuthTokens(token, apiKey, res.data.userFullName ?? profileName.trim());
        window.dispatchEvent(new Event("dc-auth"));
        void fetchAndCacheProfile(token, apiKey);
        notifyAuthChange();
        onDone();
      } else {
        setOtpError(res.message || "Registration failed.");
        setPhoneFlow("otp");
      }
    } catch (err) {
      const p = parseError(err);
      if (p.errors?.length) {
        const errs: typeof profileErrors = {};
        p.errors.forEach((e) => {
          if (e.toLowerCase().includes("name")) errs.name = e;
          else if (e.toLowerCase().includes("email")) errs.email = e;
        });
        setProfileErrors(Object.keys(errs).length ? errs : {});
        if (!Object.keys(errs).length) setOtpError(p.errors.join(" "));
      } else {
        setOtpError(p.message);
        setPhoneFlow("otp");
      }
    } finally {
      setSubmittingProfile(false);
    }
  };

  // ── Email / password view ──
  if (phoneFlow === "idle") {
    return (
      <form onSubmit={handleEmailSubmit} className="fade-up space-y-4" noValidate>
        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <label className="block text-sm font-medium text-neutral-700">
          Email
          <input name="email" type="email" autoComplete="email" className={field} placeholder="you@example.com" />
        </label>
        <label className="block text-sm font-medium text-neutral-700">
          <span className="flex items-center justify-between">
            Password
            <a href="/forgot-password" className="text-xs font-semibold text-gold-dark hover:underline">Forgot password?</a>
          </span>
          <input name="password" type="password" autoComplete="current-password" className={field} />
        </label>
        {/* Phone login trigger */}
        <button type="button" onClick={() => setPhoneFlow("mobile")}
          className="block w-full text-center text-sm font-semibold text-gold-dark underline underline-offset-4 hover:text-ink transition-colors">
          Login with Phone number
        </button>
        <Submit pending={pending} label={pending ? "Signing in…" : "Sign in & start repair"} />
      </form>
    );
  }

  // ── Mobile input ──
  if (phoneFlow === "mobile") {
    return (
      <form onSubmit={handleSendOtp} className="fade-up space-y-4" noValidate>
        <button type="button" onClick={() => setPhoneFlow("idle")}
          className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          Back to email login
        </button>
        <label className="block text-sm font-medium text-neutral-700">
          Mobile Number
          <input type="tel" inputMode="numeric" maxLength={11} value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
            placeholder="e.g. 01700000000" className={field} aria-invalid={!!mobileError} />
          {mobileError && <span className="mt-1 block text-xs text-red-600">{mobileError}</span>}
        </label>
        <Submit pending={sendingOtp} label={sendingOtp ? "Sending OTP…" : "Send OTP"} />
      </form>
    );
  }

  // ── OTP input ──
  if (phoneFlow === "otp") {
    return (
      <form onSubmit={handleVerifyOtp} className="fade-up space-y-4" noValidate>
        <p className="text-sm text-neutral-500">
          Code sent to <span className="font-semibold text-ink">{sentMobile}</span>.{" "}
          {canResend ? (
            <button type="button" onClick={() => handleSendOtp()} disabled={sendingOtp}
              className="font-semibold text-gold-dark hover:underline disabled:opacity-60">
              {sendingOtp ? "Sending…" : "Resend"}
            </button>
          ) : (
            <span className="font-semibold text-gold-dark">Resend in {fmt(resendTimer)}</span>
          )}
        </p>
        {otpError && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{otpError}</p>}
        <OtpBoxes value={otp} onChange={(v) => { setOtp(v); if (v.length === 6) setOtpError(""); }} error="" />
        <Submit pending={verifyingOtp || otp.length < 6} label={verifyingOtp ? "Verifying…" : "Verify OTP"} />
        <button type="button" onClick={() => { setPhoneFlow("mobile"); setOtp(""); setOtpError(""); }}
          className="block w-full text-center text-xs text-neutral-400 hover:text-neutral-600 underline underline-offset-4">
          ← Change phone number
        </button>
      </form>
    );
  }

  // ── Profile completion (new user) ──
  return (
    <form onSubmit={handleProfileSubmit} className="fade-up space-y-4" noValidate>
      <p className="text-sm text-neutral-500">One more step — create your account.</p>
      <label className="block text-sm font-medium text-neutral-700">
        Full Name <span className="text-red-500">*</span>
        <input type="text" autoComplete="name" value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          placeholder="Rahim Uddin" className={field} aria-invalid={!!profileErrors.name} />
        {profileErrors.name && <span className="mt-1 block text-xs text-red-600">{profileErrors.name}</span>}
      </label>
      <label className="block text-sm font-medium text-neutral-700">
        Email <span className="text-xs font-normal text-neutral-400">(optional)</span>
        <input type="email" autoComplete="email" value={profileEmail}
          onChange={(e) => setProfileEmail(e.target.value)}
          placeholder="you@example.com" className={field} aria-invalid={!!profileErrors.email} />
        {profileErrors.email && <span className="mt-1 block text-xs text-red-600">{profileErrors.email}</span>}
      </label>
      <label className="block text-sm font-medium text-neutral-700">
        Address <span className="text-xs font-normal text-neutral-400">(optional)</span>
        <input type="text" autoComplete="street-address" value={profileAddress}
          onChange={(e) => setProfileAddress(e.target.value)}
          placeholder="Dhaka, Bangladesh" className={field} />
      </label>
      <Submit pending={submittingProfile} label={submittingProfile ? "Creating account…" : "Complete Sign Up"} />
    </form>
  );
}

// ─── 6-box OTP input (same as AuthForms) ──────────────────────────────────────
function OtpBoxes({ value, onChange, error }: { value: string; onChange: (v: string) => void; error: string }) {
  const r0 = useRef<HTMLInputElement>(null), r1 = useRef<HTMLInputElement>(null),
    r2 = useRef<HTMLInputElement>(null), r3 = useRef<HTMLInputElement>(null),
    r4 = useRef<HTMLInputElement>(null), r5 = useRef<HTMLInputElement>(null);
  const refs = [r0, r1, r2, r3, r4, r5];
  const digits = value.padEnd(6, " ").split("").slice(0, 6);
  const focus = (i: number) => refs[i]?.current?.focus();

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") { e.preventDefault(); onChange(value.slice(0, i) + value.slice(i + 1)); if (i > 0) focus(i - 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); if (i > 0) focus(i - 1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); if (i < 5) focus(i + 1); }
  };
  const onChg = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) return;
    const chars = raw.slice(0, 6 - i).split("");
    const next = value.split(""); next.splice(i, chars.length, ...chars);
    onChange(next.join("").slice(0, 6));
    setTimeout(() => focus(Math.min(i + chars.length, 5)), 0);
  };
  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(p); setTimeout(() => focus(Math.min(p.length, 5)), 0);
  };
  return (
    <div className="flex gap-2" onPaste={onPaste}>
      {digits.map((d, i) => (
        <input key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={1}
          value={d.trim()} onChange={(e) => onChg(i, e)} onKeyDown={(e) => onKey(i, e)}
          onFocus={(e) => e.target.select()} placeholder="·" aria-label={`OTP digit ${i + 1}`}
          className={[
            "h-12 w-full rounded-xl border text-center text-xl font-bold text-ink outline-none transition",
            "placeholder:text-neutral-300 focus:ring-4 focus:ring-gold/20",
            d.trim() ? "border-gold bg-gold/5 focus:border-gold" : "border-black/10 bg-white focus:border-gold",
            error ? "border-red-400" : "",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

// ─── Sign Up form ──────────────────────────────────────────────────────────────
function SignUp({ onDone }: { onDone: () => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"name" | "email" | "mobile" | "password" | "confirm", string>>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); setFieldErrors({});
    const fd = new FormData(e.currentTarget);
    const userFullName = (fd.get("name") as string).trim();
    const email = (fd.get("email") as string).trim();
    const mobile = (fd.get("phone") as string).trim();
    const password = fd.get("password") as string;
    const rePassword = fd.get("confirm") as string;

    const errs: typeof fieldErrors = {};
    if (userFullName.length < 2) errs.name = "Enter your name.";
    if (!email) errs.email = "Enter a valid email.";
    if (password.length < 8) errs.password = "Use at least 8 characters.";
    if (rePassword !== password) errs.confirm = "Passwords don't match.";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setPending(true);
    try {
      const payload: Record<string, string> = { userFullName, email, password, rePassword };
      if (mobile) payload.mobile = mobile;
      const res = await authPost<{
        statusCode: number; status: string; message: string; errors?: string[];
        data?: { "x-api-key": string; Authorization: string; userFullName?: string };
      }>("user-registration", payload);
      if (res.statusCode === 200 && res.data) {
        const token = res.data.Authorization;
        const apiKey = res.data["x-api-key"];
        saveAuthTokens(token, apiKey, res.data.userFullName ?? userFullName);
        window.dispatchEvent(new Event("dc-auth"));
        notifyAuthChange();
        onDone();
      } else {
        setError(res.message || "Registration failed.");
      }
    } catch (err) {
      const p = parseError(err);
      if (p.errors?.length) {
        const errs: typeof fieldErrors = {};
        p.errors.forEach((e) => {
          const l = e.toLowerCase();
          if (l.includes("email")) errs.email = e;
          else if (l.includes("mobile")) errs.mobile = e;
          else if (l.includes("password") && !l.includes("re")) errs.password = e;
          else if (l.includes("repassword") || l.includes("match")) errs.confirm = e;
          else if (l.includes("name")) errs.name = e;
        });
        setFieldErrors(errs);
      } else {
        setError(p.message);
      }
    } finally {
      setPending(false);
    }
  };

  const err = (k: keyof typeof fieldErrors) =>
    fieldErrors[k] ? <span className="mt-1 block text-xs text-red-600">{fieldErrors[k]}</span> : null;

  return (
    <form onSubmit={handleSubmit} className="fade-up space-y-3.5" noValidate>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <label className="block text-sm font-medium text-neutral-700">
        Full name <input name="name" autoComplete="name" className={field} placeholder="Rahim Uddin" />{err("name")}
      </label>
      <label className="block text-sm font-medium text-neutral-700">
        Mobile number <input name="phone" type="tel" inputMode="tel" autoComplete="tel" className={field} placeholder="01XXXXXXXXX" />{err("mobile")}
      </label>
      <label className="block text-sm font-medium text-neutral-700">
        Email <input name="email" type="email" autoComplete="email" className={field} placeholder="you@example.com" />{err("email")}
      </label>
      <label className="block text-sm font-medium text-neutral-700">
        Password <input name="password" type="password" autoComplete="new-password" className={field} placeholder="At least 8 characters" />{err("password")}
      </label>
      <label className="block text-sm font-medium text-neutral-700">
        Confirm password <input name="confirm" type="password" autoComplete="new-password" className={field} />{err("confirm")}
      </label>
      <Submit pending={pending} label={pending ? "Creating account…" : "Create account & start repair"} />
    </form>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Main modal
// ═════════════════════════════════════════════════════════════════════════════
export default function AuthModal({ context, onSuccess, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  useEffect(() => { dialog.current?.showModal(); }, []);

  const close = () => { if (dialog.current?.open) dialog.current.close(); onClose(); };
  const done  = () => { notifyAuthChange(); if (dialog.current?.open) dialog.current.close(); onSuccess(); onClose(); };

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onCancel={(e) => { e.preventDefault(); close(); }}
      onClick={(e) => e.target === dialog.current && close()}
      aria-label="Sign in to start your repair"
      className="prebook-dialog m-auto w-[min(94vw,440px)] overflow-hidden rounded-[1.75rem] border border-black/[.06] bg-white p-0 text-left text-ink shadow-2xl"
    >
      {/* Dark header */}
      <div className="relative overflow-hidden bg-ink px-6 pb-5 pt-6 text-white">
        <div aria-hidden="true" className="glow pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full" />
        <button type="button" onClick={close} aria-label="Close"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full text-white/60 transition hover:rotate-90 hover:bg-white/10 hover:text-white">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <p className="relative pr-10 text-xl font-bold">
          {tab === "signin" ? "Sign in to continue" : "Create your account"}
        </p>
        {context && <p className="relative mt-1 pr-8 text-sm text-white/70">to start: {context}</p>}
        {/* Tab switcher */}
        <div role="tablist" className="relative mt-5 grid grid-cols-2 rounded-full bg-white/10 p-1 text-sm font-semibold">
          {(["signin", "signup"] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`h-9 rounded-full transition ${tab === t ? "bg-gold text-ink" : "text-white/75 hover:text-white"}`}>
              {t === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>
      </div>
      {/* White body */}
      <div className="p-6">
        {tab === "signin" ? <SignIn onDone={done} /> : <SignUp onDone={done} />}
      </div>
    </dialog>
  );
}
