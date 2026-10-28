"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { clearAuthTokens, getApiKey, getToken, saveAvatarUrl } from "@/lib/auth-client";
import SignOutButton from "./SignOutButton";

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserProfile {
  userFullName: string;
  email: string;
  mobile: string;
  address?: string;
  isEmailVerified: boolean;
  updatedAt: string;
  userAvatar?: string;
  purchasePoint: number;
}
interface ProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function passwordStrength(pwd: string): { label: string; color: string; pct: number } {
  if (!pwd) return { label: "", color: "", pct: 0 };
  let score = 0;
  if (pwd.length >= 6)        score++;
  if (/[A-Z]/.test(pwd))     score++;
  if (/[a-z]/.test(pwd))     score++;
  if (/[0-9]/.test(pwd))     score++;
  if (/[@$!%*?&#]/.test(pwd)) score++;
  if (score <= 2) return { label: "Weak",   color: "bg-red-400",    pct: 33 };
  if (score <= 4) return { label: "Fair",   color: "bg-yellow-400", pct: 66 };
  return              { label: "Strong", color: "bg-green-500",  pct: 100 };
}

const fieldCls =
  "mt-1.5 h-12 w-full rounded-xl border border-black/10 bg-white px-4 pr-16 text-ink placeholder:text-neutral-400 outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/20";

// ─── Change Password Form ──────────────────────────────────────────────────────
function ChangePasswordForm({ onClose }: { onClose: () => void }) {
  const [newPwd, setNewPwd]   = useState("");
  const [rePwd, setRePwd]     = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showRe, setShowRe]   = useState(false);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState("");
  const [errors, setErrors]   = useState<{ newPwd?: string; rePwd?: string; global?: string }>({});

  const strength = passwordStrength(newPwd);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    const errs: typeof errors = {};
    if (newPwd.length < 8)   errs.newPwd = "Password must be at least 8 characters.";
    if (rePwd !== newPwd)    errs.rePwd  = "Passwords don't match.";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const token  = getToken();
    const apiKey = getApiKey();
    if (!token || !apiKey) { setErrors({ global: "Session expired. Please sign in again." }); return; }

    const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    setPending(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
          Authorization: authHeader,
        },
        body: JSON.stringify({ newPassword: newPwd, rePassword: rePwd }),
        signal: AbortSignal.timeout(12_000),
      });
      const json = (await res.json()) as {
        statusCode: number; status: string; message: string;
        data?: { updatedAt: string }; errors?: string[];
      };

      if (json.statusCode === 200) {
        setSuccess(json.message || "Password changed successfully.");
        setNewPwd(""); setRePwd("");
      } else if (json.errors?.length) {
        const errs: typeof errors = {};
        json.errors.forEach((msg) => {
          const l = msg.toLowerCase();
          if (l.includes("new-password") || l.includes("newpassword")) errs.newPwd = msg;
          else if (l.includes("re-password") || l.includes("repassword")) errs.rePwd = msg;
          else errs.global = msg;
        });
        setErrors(errs);
      } else {
        setErrors({ global: json.message || "Failed to change password." });
      }
    } catch {
      setErrors({ global: "Something went wrong. Please try again." });
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-1 space-y-4 rounded-2xl border border-black/[.07] bg-cream p-4">
      {errors.global && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errors.global}</p>
      )}
      {success && (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          {success}
        </p>
      )}

      {/* New Password */}
      <div>
        <label className="text-sm font-medium text-neutral-700">New Password</label>
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            placeholder="Min. 8 characters"
            className={fieldCls}
            aria-invalid={!!errors.newPwd}
          />
          <button type="button" onClick={() => setShowNew((s) => !s)}
            className="absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-neutral-500 hover:text-ink">
            {showNew ? "Hide" : "Show"}
          </button>
        </div>
        {newPwd && (
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
              <div className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                style={{ width: `${strength.pct}%` }} />
            </div>
            <span className={`text-xs font-semibold ${
              strength.label === "Weak" ? "text-red-400" :
              strength.label === "Fair" ? "text-yellow-500" : "text-green-600"
            }`}>{strength.label}</span>
          </div>
        )}
        {errors.newPwd && <p className="mt-1 text-xs text-red-600">{errors.newPwd}</p>}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="text-sm font-medium text-neutral-700">Confirm Password</label>
        <div className="relative">
          <input
            type={showRe ? "text" : "password"}
            value={rePwd}
            onChange={(e) => setRePwd(e.target.value)}
            placeholder="Re-enter new password"
            className={fieldCls}
            aria-invalid={!!errors.rePwd}
          />
          <button type="button" onClick={() => setShowRe((s) => !s)}
            className="absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-neutral-500 hover:text-ink">
            {showRe ? "Hide" : "Show"}
          </button>
        </div>
        {errors.rePwd && <p className="mt-1 text-xs text-red-600">{errors.rePwd}</p>}
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button type="submit" disabled={pending}
          className="btn-shine inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-ink text-sm font-semibold text-white transition hover:bg-gold hover:text-ink disabled:opacity-60">
          {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
          {pending ? "Saving…" : "Change Password"}
        </button>
        <button type="button" onClick={onClose}
          className="h-11 rounded-full border border-black/10 px-5 text-sm font-semibold text-ink hover:border-gold hover:text-gold-dark transition">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <aside className="rounded-[2rem] border border-black/[.07] bg-white overflow-hidden">
      <div className="h-28 bg-neutral-100 animate-pulse" />
      <div className="px-6 pb-6">
        <div className="-mt-10 h-20 w-20 rounded-full bg-neutral-200 animate-pulse border-4 border-white" />
        <div className="mt-4 h-5 w-36 rounded-lg bg-neutral-200 animate-pulse" />
        <div className="mt-2 h-4 w-52 rounded-lg bg-neutral-200 animate-pulse" />
        <div className="mt-6 h-11 rounded-full bg-neutral-200 animate-pulse" />
        <div className="mt-2 h-11 rounded-full bg-neutral-200 animate-pulse" />
      </div>
    </aside>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-neutral-600">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream text-gold-dark">
        {icon}
      </span>
      <span className="truncate">{text}</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AccountProfile() {
  const [profile, setProfile]             = useState<UserProfile | null>(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [showChangePwd, setShowChangePwd] = useState(false);

  useEffect(() => {
    const token  = getToken();
    const apiKey = getApiKey();
    if (!token || !apiKey) {
      clearAuthTokens();
      window.location.href = "/signin?next=/account";
      return;
    }
    const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    fetch("/api/auth/user-profile", {
      method: "GET",
      headers: { "Content-Type": "application/json", "X-API-Key": apiKey, Authorization: authHeader },
      signal: AbortSignal.timeout(10_000),
    })
      .then(async (res) => {
        const json = (await res.json()) as ProfileResponse;
        if (!res.ok || !json.success) {
          if (res.status === 401 || res.status === 403) {
            clearAuthTokens();
            window.location.href = "/signin?next=/account";
            return;
          }
          throw new Error(json.message || "Failed to load profile.");
        }
        setProfile(json.data);
        if (json.data.userFullName) {
          const exp = new Date(Date.now() + 30 * 864e5).toUTCString();
          document.cookie = `dc_user=${encodeURIComponent(json.data.userFullName)}; expires=${exp}; path=/; SameSite=Lax`;
        }
        if (json.data.userAvatar) saveAvatarUrl(json.data.userAvatar);
        window.dispatchEvent(new Event("dc-auth"));
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load profile.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ProfileSkeleton />;

  if (error) {
    return (
      <aside className="rounded-[2rem] border border-black/[.07] bg-white p-6">
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}{" "}
          <button onClick={() => window.location.reload()} className="font-semibold underline">Retry</button>
        </p>
      </aside>
    );
  }

  if (!profile) return null;

  const initials = getInitials(profile.userFullName);

  return (
    <aside className="fade-up rounded-[2rem] border border-black/[.07] bg-white overflow-hidden">
      {/* Cover banner */}
      <div className="relative h-28 bg-gradient-to-br from-ink via-neutral-800 to-neutral-900">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #d4a97a 0%, transparent 60%)" }} />
      </div>

      <div className="px-6 pb-6">
        {/* Avatar */}
        <div className="-mt-10 mb-4 flex items-end justify-between">
          <div className="relative">
            {profile.userAvatar ? (
              <Image src={profile.userAvatar} alt={profile.userFullName} width={80} height={80}
                className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-md" />
            ) : (
              <span className="grid h-20 w-20 place-items-center rounded-full bg-ink border-4 border-white shadow-md text-2xl font-bold text-gold">
                {initials}
              </span>
            )}
            {profile.isEmailVerified && (
              <span className="absolute bottom-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 border-2 border-white" title="Email verified">
                <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
            )}
          </div>
          {profile.purchasePoint > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-dark">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {profile.purchasePoint} pts
            </span>
          )}
        </div>

        {/* Name */}
        <h2 className="text-xl font-bold text-ink leading-tight">{profile.userFullName}</h2>

        {/* Info rows */}
        <div className="mt-3 space-y-2">
          <InfoRow
            icon={<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>}
            text={profile.email}
          />
          {profile.mobile && (
            <InfoRow
              icon={<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg>}
              text={profile.mobile}
            />
          )}
          {profile.address && (
            <InfoRow
              icon={<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>}
              text={profile.address}
            />
          )}
        </div>

        {/* Divider */}
        <div className="my-5 border-t border-black/[.06]" />

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          {/* Change password toggle button */}
          <button
            type="button"
            onClick={() => setShowChangePwd((s) => !s)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/10 text-sm font-semibold text-ink hover:border-gold hover:text-gold-dark transition"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            {showChangePwd ? "Cancel" : "Change password"}
          </button>

          {/* Inline form — shown when toggled */}
          {showChangePwd && (
            <ChangePasswordForm onClose={() => setShowChangePwd(false)} />
          )}

          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}
