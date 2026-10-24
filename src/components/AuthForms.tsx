"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { resetPassword, type AuthState } from "@/app/(auth)/actions";
import { saveAuthTokens, saveAvatarUrl } from "@/lib/auth-client";

// ─── Inline icons (no lucide-react dependency) ────────────────────────────────
const PhoneIcon = ({ size = 17 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const ShieldIcon = ({ size = 17 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const MailCheckIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    <path d="m16 19 2 2 4-4" />
  </svg>
);
const XIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const UserIcon = ({ size = 17 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

// ─── Auth API helper ───────────────────────────────────────────────────────────
const AUTH_API = (process.env.NEXT_PUBLIC_AUTH_API_URL ?? "https://apix.bigpoint.com.bd").replace(/\/$/, "");

async function authPost<T>(endpoint: string, body: Record<string, string>): Promise<T> {
  const res = await fetch(`${AUTH_API}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(12_000),
  });
  const json = (await res.json()) as T;
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json;
}

// ─── Shared API response types ─────────────────────────────────────────────────
interface AuthApiResponse {
  statusCode: number;
  status: "success" | "error";
  message: string;
  errors?: string[];
}
interface LoginData {
  "x-api-key": string;
  Authorization: string;
  authorization?: string;
}
interface LoginResponse extends AuthApiResponse {
  data?: LoginData | { username: string; "recovery-token": string; validity: string };
}
interface RegisterData {
  usersCommuuid: string;
  userFullName: string;
  email: string;
  emailVerifiedToken: string;
  createdAt: string;
  "x-api-key": string;
  Authorization: string;
}
interface RegisterResponse extends AuthApiResponse {
  data?: RegisterData;
}
interface OtpSendResponse extends AuthApiResponse {
  data?: { mobile: string; tokenType: string; expireAt: string };
}
interface OtpVerifyResponse extends AuthApiResponse {
  data?: {
    "x-api-key": string;
    Authorization: string;
    authorization?: string;
    CreatedAt?: string;
    ExpireAt?: string;
  };
}

/** Save tokens after login/register — persists across reloads via localStorage + cookie. */
function saveTokens(token: string, apiKey: string, userName?: string) {
  saveAuthTokens(token, apiKey, userName);
  // Notify UserMenu (header) to re-read the dc_user cookie immediately
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("dc-auth"));
  }
}

/** After login, fetch profile to get the real name + avatar for the header. */
async function fetchAndCacheProfile(token: string, apiKey: string) {
  try {
    const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    const res = await fetch(`${AUTH_API}/user-profile`, {
      headers: { "Content-Type": "application/json", "X-API-Key": apiKey, Authorization: authHeader },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return;
    const json = (await res.json()) as { success: boolean; data?: { userFullName?: string; userAvatar?: string } };
    if (!json.success || !json.data) return;
    const exp = new Date(Date.now() + 30 * 864e5).toUTCString();
    if (json.data.userFullName) {
      document.cookie = `dc_user=${encodeURIComponent(json.data.userFullName)}; expires=${exp}; path=/; SameSite=Lax`;
    }
    if (json.data.userAvatar) {
      saveAvatarUrl(json.data.userAvatar);
    }
    window.dispatchEvent(new Event("dc-auth"));
  } catch {
    // Non-critical — header will update when user visits account page
  }
}

// ─── Shared UI primitives (design unchanged) ──────────────────────────────────
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
        <label htmlFor={id} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {error && (
        <p id={`${id}-err`} className="fade-up mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordInput({
  id,
  name,
  error,
  autoComplete,
}: {
  id: string;
  name: string;
  error?: string;
  autoComplete: string;
}) {
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
      {pending && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          aria-hidden="true"
        />
      )}
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

// ─── Error parser helper ───────────────────────────────────────────────────────
function parseApiError(error: unknown): { message: string; errors?: string[] } {
  if (error instanceof Error) {
    try {
      return JSON.parse(error.message) as { message: string; errors?: string[] };
    } catch {
      return { message: error.message || "Something went wrong. Please try again." };
    }
  }
  return { message: "Failed to connect to servers." };
}

// ─── 6-box OTP input ──────────────────────────────────────────────────────────
function OtpBoxes({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) {
  const ref0 = useRef<HTMLInputElement>(null);
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);
  const ref3 = useRef<HTMLInputElement>(null);
  const ref4 = useRef<HTMLInputElement>(null);
  const ref5 = useRef<HTMLInputElement>(null);
  const refs = [ref0, ref1, ref2, ref3, ref4, ref5];

  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  const focus = (i: number) => refs[i]?.current?.focus();

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = value.slice(0, i) + value.slice(i + 1);
      onChange(next);
      if (i > 0) focus(i - 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (i > 0) focus(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (i < 5) focus(i + 1);
    }
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) return;
    const chars = raw.slice(0, 6 - i).split("");
    const next = value.split("");
    next.splice(i, chars.length, ...chars);
    const result = next.join("").slice(0, 6);
    onChange(result);
    const nextFocus = Math.min(i + chars.length, 5);
    setTimeout(() => focus(nextFocus), 0);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    setTimeout(() => focus(Math.min(pasted.length, 5)), 0);
  };

  return (
    <div>
      <div className="flex gap-2" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={refs[i]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d.trim()}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKey(i, e)}
            onFocus={(e) => e.target.select()}
            placeholder="·"
            aria-label={`OTP digit ${i + 1}`}
            className={[
              "h-12 w-full rounded-xl border text-center text-xl font-bold text-ink outline-none transition",
              "placeholder:text-neutral-300 focus:ring-4 focus:ring-gold/20",
              d.trim() ? "border-gold bg-gold/5 focus:border-gold" : "border-black/10 bg-white focus:border-gold",
              error ? "border-red-400" : "",
            ].join(" ")}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}


const RESEND_COOLDOWN = 120;

interface MobileOtpModalProps {
  onClose: () => void;
  next?: string;
}

function MobileOtpModal({ onClose, next = "/" }: MobileOtpModalProps) {
  const router = useRouter();
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    modalRef.current?.showModal();
  }, []);

  const close = () => {
    if (modalRef.current?.open) modalRef.current.close();
    onClose();
  };

  const [step, setStep] = useState<"mobile" | "otp" | "profile">("mobile");
  const [sentMobile, setSentMobile] = useState("");
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState("");

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  // Profile step state (name / email / password)
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [showProfilePwd, setShowProfilePwd] = useState(false);
  const [profileErrors, setProfileErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [submittingProfile, setSubmittingProfile] = useState(false);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Countdown timer
  const startTimer = useCallback(() => {
    setResendTimer(RESEND_COOLDOWN);
    setCanResend(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const formatTimer = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // Validate Bangladeshi mobile
  const validateMobile = (val: string) => {
    if (!val) return "Mobile number is required.";
    if (!/^\d+$/.test(val)) return "Only numbers are allowed.";
    if (val.length !== 11) return "Mobile number must be exactly 11 digits.";
    if (!/^01[3-9]\d{8}$/.test(val)) return "Enter a valid Bangladeshi mobile number (e.g. 01700000000).";
    return "";
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const err = validateMobile(mobile);
    if (err) { setMobileError(err); return; }
    setMobileError("");
    setGlobalError("");
    setSendingOtp(true);
    try {
      const res = await authPost<OtpSendResponse>("login-mobile-otp", { mobile });
      if (res.statusCode === 200) {
        setSentMobile(mobile);
        setStep("otp");
        startTimer();
      } else {
        setGlobalError(res.message || "Failed to send OTP.");
      }
    } catch (err) {
      const parsed = parseApiError(err);
      // "User not found" → new user, but still go through OTP step
      // (the OTP verify will handle new vs existing user)
      const msg = (parsed.message ?? "").toLowerCase();
      const isNewUser =
        msg.includes("not found") ||
        msg.includes("no user") ||
        msg.includes("user not") ||
        (parsed as { statusCode?: number }).statusCode === 404;
      if (isNewUser) {
        // Mark as new user so OTP verify knows to show profile form after
        setSentMobile(mobile);
        setIsNewUser(true);
        setStep("otp");
        startTimer();
      } else if (parsed.errors?.length) {
        setMobileError(parsed.errors.join(" "));
      } else {
        setGlobalError(parsed.message);
      }
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { setOtpError("Please enter the 6-digit OTP."); return; }
    setOtpError("");
    setGlobalError("");
    setVerifyingOtp(true);
    try {
      const res = await authPost<OtpVerifyResponse>("login-with-mobile", { mobile: sentMobile, otp });
      if (res.statusCode === 200 && res.data) {
        const token = res.data.Authorization || res.data.authorization || "";
        const apiKey = res.data["x-api-key"];
        saveTokens(token, apiKey, sentMobile);
        if (isNewUser) {
          // New user — show profile completion form
          setStep("profile");
        } else {
          // Existing user — fetch real name + avatar then redirect
          void fetchAndCacheProfile(token, apiKey);
          close();
          router.push(next);
        }
      } else {
        setOtpError(res.message || "OTP verification failed.");
      }
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.errors?.length) {
        setOtpError(parsed.errors.join(" "));
      } else {
        setOtpError(parsed.message || "Invalid OTP.");
      }
      setOtp("");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof profileErrors = {};
    if (profileName.trim().length < 2) errs.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(profileEmail)) errs.email = "Enter a valid email address.";
    if (profilePassword.length < 8) errs.password = "Use at least 8 characters.";
    if (Object.keys(errs).length) { setProfileErrors(errs); return; }

    setProfileErrors({});
    setGlobalError("");
    setSubmittingProfile(true);
    // TODO: call your profile-complete / register API here
    // For now just close and redirect
    setTimeout(() => {
      setSubmittingProfile(false);
      onClose();
      router.push(next);
    }, 600);
  };

  // Step label helpers
  const stepTitle = { mobile: "Login with Phone", otp: "Enter OTP", profile: "Complete Profile" }[step];
  const stepSub = {
    mobile: "We'll send a 6-digit code to your number",
    otp: `Code sent to ${sentMobile}`,
    profile: "Almost done — fill in your details",
  }[step];

  const StepIcon = step === "mobile" ? PhoneIcon : step === "otp" ? ShieldIcon : UserIcon;

  return (
    <dialog
      ref={modalRef}
      onClose={onClose}
      onCancel={(e) => { e.preventDefault(); close(); }}
      onClick={(e) => e.target === modalRef.current && close()}
      aria-label="Login with phone number"
      className="prebook-dialog m-auto w-[min(94vw,440px)] overflow-hidden rounded-[1.75rem] border border-black/[.06] bg-white p-0 text-left text-ink shadow-2xl"
    >
      {/* ── Dark header ── */}
      <div className="relative overflow-hidden bg-ink px-6 pb-5 pt-6 text-white">
        <div aria-hidden="true" className="glow pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full" />

        {/* Close */}
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

        {/* Title */}
        <p className="relative pr-10 text-xl font-bold">{stepTitle}</p>
        <p className="relative mt-1 pr-8 text-sm text-white/70">{stepSub}</p>

        {/* Step dots */}
        <div className="relative mt-5 flex items-center gap-2">
          {(["mobile", "otp", "profile"] as const).map((s, i) => {
            const done =
              (s === "mobile" && (step === "otp" || step === "profile")) ||
              (s === "otp" && step === "profile");
            const active = step === s;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  active  ? "bg-gold text-ink" :
                  done    ? "bg-white/20 text-white" :
                            "bg-white/10 text-white/50"
                }`}>
                  {done ? (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : i + 1}
                </div>
                {i < 2 && (
                  <div className={`h-px w-6 transition-colors ${
                    done || (i === 0 && step === "profile") ? "bg-gold/60" : "bg-white/20"
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── White body ── */}
      <div className="p-6">
        {globalError && (
          <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{globalError}</p>
        )}

        {/* STEP 1 — Mobile */}
        {step === "mobile" && (
          <form onSubmit={handleSendOtp} noValidate className="space-y-4">
            <label className="block text-sm font-medium text-neutral-700">
              Mobile Number
              <input
                type="tel" inputMode="numeric" maxLength={11}
                value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 01700000000"
                className={field}
                aria-invalid={!!mobileError}
              />
              {mobileError && <span className="mt-1 block text-xs text-red-600">{mobileError}</span>}
            </label>
            <Submit pending={sendingOtp}>{sendingOtp ? "Sending OTP…" : "Send OTP"}</Submit>
          </form>
        )}

        {/* STEP 2 — OTP */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} noValidate className="space-y-4">
            <p className="text-sm text-neutral-500">
              Didn&apos;t get the code?{" "}
              {canResend ? (
                <button type="button" onClick={() => handleSendOtp()} disabled={sendingOtp}
                  className="font-semibold text-gold-dark hover:underline disabled:opacity-60">
                  {sendingOtp ? "Sending…" : "Resend OTP"}
                </button>
              ) : (
                <span className="font-semibold text-gold-dark">Resend in {formatTimer(resendTimer)}</span>
              )}
            </p>

            {/* 6 individual digit boxes */}
            <OtpBoxes value={otp} onChange={setOtp} error={otpError} />

            <Submit pending={verifyingOtp || otp.length < 6}>
              {verifyingOtp ? "Verifying…" : "Verify OTP"}
            </Submit>
            <button type="button" onClick={() => { setStep("mobile"); setOtp(""); setOtpError(""); }}
              className="block w-full text-center text-sm text-neutral-400 hover:text-neutral-600 transition-colors underline underline-offset-4">
              ← Change phone number
            </button>
          </form>
        )}

        {/* STEP 3 — Profile */}
        {step === "profile" && (
          <form onSubmit={handleProfileSubmit} noValidate className="space-y-4">
            <label className="block text-sm font-medium text-neutral-700">
              Full Name
              <input type="text" autoComplete="name" value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Rahim Uddin" className={field} aria-invalid={!!profileErrors.name} />
              {profileErrors.name && <span className="mt-1 block text-xs text-red-600">{profileErrors.name}</span>}
            </label>
            <label className="block text-sm font-medium text-neutral-700">
              Email Address
              <input type="email" autoComplete="email" value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                placeholder="you@example.com" className={field} aria-invalid={!!profileErrors.email} />
              {profileErrors.email && <span className="mt-1 block text-xs text-red-600">{profileErrors.email}</span>}
            </label>
            <label className="block text-sm font-medium text-neutral-700">
              <span className="flex items-center justify-between">
                Password
                <button type="button" onClick={() => setShowProfilePwd((s) => !s)}
                  className="text-xs font-semibold text-neutral-400 hover:text-ink">
                  {showProfilePwd ? "Hide" : "Show"}
                </button>
              </span>
              <input type={showProfilePwd ? "text" : "password"} autoComplete="new-password"
                value={profilePassword} onChange={(e) => setProfilePassword(e.target.value)}
                placeholder="Min. 8 characters" className={field} aria-invalid={!!profileErrors.password} />
              {profileErrors.password && <span className="mt-1 block text-xs text-red-600">{profileErrors.password}</span>}
            </label>
            <Submit pending={submittingProfile}>
              {submittingProfile ? "Saving…" : "Complete Sign Up"}
            </Submit>
          </form>
        )}
      </div>
    </dialog>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Email Verified Modal (shown after successful registration)
// ═════════════════════════════════════════════════════════════════════════════
function EmailVerifyModal({ email, onClose }: { email: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500" />
        <div className="flex justify-end px-5 pt-4">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
            aria-label="Close"
          >
            <XIcon size={16} />
          </button>
        </div>
        <div className="px-8 pb-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mb-5">
            <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center">
              <MailCheckIcon size={28} />
            </div>
          </div>
          <h2 className="text-xl font-bold text-ink mb-2">Verify Your Email Address</h2>
          <p className="text-sm text-neutral-500 leading-relaxed mb-1">A verification link has been sent to</p>
          <p className="text-sm font-semibold text-ink mb-5 break-all">{email}</p>
          <div className="w-full bg-gold/10 border border-gold/20 rounded-2xl px-5 py-4 mb-6">
            <p className="text-xs text-gold-dark leading-relaxed">
              Please check your inbox and click the verification link to activate your account. If you don&apos;t see
              the email, check your <strong>spam or junk folder</strong>.
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-shine w-full h-12 rounded-full bg-ink font-semibold text-white transition hover:bg-gold hover:text-ink"
          >
            OK, Got It
          </button>
          <p className="text-xs text-neutral-400 mt-4">
            Already verified?{" "}
            <Link href="/signin" className="text-gold-dark font-semibold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Sign In Form
// ═════════════════════════════════════════════════════════════════════════════
export function SignInForm({ next = "" }: { next?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const redirectTo = next || "/";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});
    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") as string).trim();
    const password = (fd.get("password") as string);

    if (!email) { setFieldErrors({ email: "Enter your email address." }); return; }
    if (!password) { setFieldErrors({ password: "Enter your password." }); return; }

    setPending(true);
    try {
      const res = await authPost<LoginResponse>("user-login", { username: email, password });
      if (res.statusCode === 200 && res.status === "success" && res.data && "x-api-key" in res.data) {
        const token = (res.data as LoginData).authorization || (res.data as LoginData).Authorization;
        const apiKey = (res.data as LoginData)["x-api-key"];
        // Pass email as temp display name; profile fetch below will update it
        saveTokens(token, apiKey, email);
        // Fetch real name + avatar immediately so header shows them
        void fetchAndCacheProfile(token, apiKey);
        router.push(redirectTo);
      } else {
        setFormError(res.message || "Failed to log in.");
      }
    } catch (err) {
      const parsed = parseApiError(err);
      // Password expired → redirect to reset
      if ((parsed as LoginResponse).statusCode === 403 && (parsed as LoginResponse).data && "recovery-token" in ((parsed as LoginResponse).data!)) {
        const token = ((parsed as LoginResponse).data as { "recovery-token": string })["recovery-token"];
        router.push(`/reset-password?token=${token}`);
        return;
      }
      if (parsed.errors?.length) {
        const errs: typeof fieldErrors = {};
        parsed.errors.forEach((e) => {
          if (e.toLowerCase().includes("email") || e.toLowerCase().includes("username")) errs.email = e;
          if (e.toLowerCase().includes("password")) errs.password = e;
        });
        setFieldErrors(errs);
      } else {
        setFormError(parsed.message);
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      {showMobileModal && (
        <MobileOtpModal onClose={() => setShowMobileModal(false)} next={redirectTo} />
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {formError && (
          <p role="alert" className="fade-up rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </p>
        )}

        <Field id="email" label="Email" error={fieldErrors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={field}
            placeholder="you@example.com"
            aria-invalid={!!fieldErrors.email}
          />
        </Field>

        <Field
          id="password"
          label="Password"
          error={fieldErrors.password}
          aside={
            <Link href="/forgot-password" className="link-underline text-sm font-medium text-gold-dark">
              Forgot password?
            </Link>
          }
        >
          <PasswordInput id="password" name="password" autoComplete="current-password" error={fieldErrors.password} />
        </Field>

        {/* Phone login link */}
        <button
          type="button"
          onClick={() => setShowMobileModal(true)}
          className="w-full text-center text-sm font-semibold text-gold-dark underline underline-offset-4 hover:text-ink transition-colors"
        >
          Login with Phone number
        </button>

        <Submit pending={pending}>{pending ? "Signing in…" : "Sign in"}</Submit>

        <p className="text-center text-sm text-neutral-600">
          New to DazzleCare?{" "}
          <Link
            href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}
            className="font-semibold text-ink underline underline-offset-4 hover:text-gold-dark"
          >
            Create an account
          </Link>
        </p>
      </form>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Sign Up Form
// ═════════════════════════════════════════════════════════════════════════════
export function SignUpForm({ next = "" }: { next?: string }) {
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"userFullName" | "email" | "mobile" | "password" | "rePassword", string>>>({});
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});
    const fd = new FormData(e.currentTarget);
    const userFullName = (fd.get("name") as string).trim();
    const email = (fd.get("email") as string).trim();
    const mobile = (fd.get("phone") as string).trim();
    const password = fd.get("password") as string;
    const rePassword = fd.get("confirm") as string;

    // Client-side validation
    const errs: typeof fieldErrors = {};
    if (userFullName.length < 2) errs.userFullName = "Please enter your name.";
    if (!email) errs.email = "Enter a valid email address.";
    if (password.length < 8) errs.password = "Use at least 8 characters.";
    if (rePassword !== password) errs.rePassword = "Passwords don't match.";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setPending(true);
    try {
      const payload: Record<string, string> = { userFullName, email, password, rePassword };
      if (mobile) payload.mobile = mobile;

      const res = await authPost<RegisterResponse>("user-registration", payload);
      if (res.statusCode === 200 && res.status === "success") {
        if (res.data) {
          saveTokens(res.data.Authorization, res.data["x-api-key"], userFullName);
          void fetchAndCacheProfile(res.data.Authorization, res.data["x-api-key"]);
        }
        setRegisteredEmail(email);
        setShowVerifyModal(true);
        (e.target as HTMLFormElement).reset();
      } else {
        setFormError(res.message || "Something went wrong.");
      }
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.errors?.length) {
        const errs: typeof fieldErrors = {};
        parsed.errors.forEach((e) => {
          const lower = e.toLowerCase();
          if (lower.includes("email")) errs.email = e;
          if (lower.includes("mobile")) errs.mobile = e;
          if (lower.includes("password") && !lower.includes("re")) errs.password = e;
          if (lower.includes("repassword") || lower.includes("match")) errs.rePassword = e;
          if (lower.includes("userfullname") || lower.includes("name")) errs.userFullName = e;
        });
        setFieldErrors(errs);
      } else {
        setFormError(parsed.message);
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      {showVerifyModal && (
        <EmailVerifyModal email={registeredEmail} onClose={() => setShowVerifyModal(false)} />
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {formError && (
          <p role="alert" className="fade-up rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </p>
        )}

        <Field id="name" label="Full name" error={fieldErrors.userFullName}>
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            className={field}
            placeholder="Rahim Uddin"
            aria-invalid={!!fieldErrors.userFullName}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="email" label="Email" error={fieldErrors.email}>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={field}
              placeholder="you@example.com"
              aria-invalid={!!fieldErrors.email}
            />
          </Field>
          <Field id="phone" label="Mobile (optional)" error={fieldErrors.mobile}>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={11}
              onKeyDown={(e) => {
                const allowed = ["Backspace","Delete","Tab","Escape","Enter","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"];
                if (allowed.includes(e.key)) return;
                if (!/^\d$/.test(e.key)) e.preventDefault();
              }}
              className={field}
              placeholder="01XXXXXXXXX"
              aria-invalid={!!fieldErrors.mobile}
            />
          </Field>
        </div>

        <Field id="password" label="Password" error={fieldErrors.password}>
          <PasswordInput id="password" name="password" autoComplete="new-password" error={fieldErrors.password} />
        </Field>

        <Field id="confirm" label="Confirm password" error={fieldErrors.rePassword}>
          <PasswordInput id="confirm" name="confirm" autoComplete="new-password" error={fieldErrors.rePassword} />
        </Field>

        <Submit pending={pending}>{pending ? "Creating account…" : "Create account"}</Submit>

        <p className="text-center text-sm text-neutral-600">
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-ink underline underline-offset-4 hover:text-gold-dark">
            Sign in
          </Link>
        </p>
      </form>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Forgot Password Form
// ═════════════════════════════════════════════════════════════════════════════
export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [formMessage, setFormMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [emailError, setEmailError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormMessage(null);
    setEmailError("");
    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") as string).trim();
    if (!email) { setEmailError("Enter a valid email address."); return; }

    setPending(true);
    try {
      const res = await authPost<AuthApiResponse>("password-recovery", { email });
      if (res.statusCode === 200 && res.status === "success") {
        setFormMessage({ ok: true, text: res.message || "Password recovery email sent successfully!" });
        (e.target as HTMLFormElement).reset();
      } else {
        setFormMessage({ ok: false, text: res.message || "Failed to submit request." });
      }
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.errors?.length) {
        const emailErr = parsed.errors.find((e) => e.toLowerCase().includes("email"));
        if (emailErr) setEmailError(emailErr);
        else setFormMessage({ ok: false, text: parsed.errors.join(" ") });
      } else {
        setFormMessage({ ok: false, text: parsed.message });
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {formMessage && (
        <p
          role={formMessage.ok ? "status" : "alert"}
          className={`fade-up rounded-xl px-4 py-3 text-sm ${formMessage.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}
        >
          {formMessage.text}
        </p>
      )}

      <Field id="email" label="Email" error={emailError}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={field}
          placeholder="you@example.com"
          aria-invalid={!!emailError}
        />
      </Field>

      <Submit pending={pending}>{pending ? "Sending…" : "Send reset link"}</Submit>

      <p className="text-center text-sm text-neutral-600">
        Remembered it?{" "}
        <Link href="/signin" className="font-semibold text-ink underline underline-offset-4 hover:text-gold-dark">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Reset Password Form (token from email link)
// ═════════════════════════════════════════════════════════════════════════════
export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, initial);
  const e = state.errors ?? {};
  if (!token) {
    return (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        This reset link is missing its token.{" "}
        <Link href="/forgot-password" className="font-semibold underline">
          Request a new link
        </Link>
        .
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
