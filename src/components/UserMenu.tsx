"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { signOut } from "@/app/(auth)/actions";
import { clearAuthTokens } from "@/lib/auth-client";
import { cartDrawer } from "@/lib/cart";

// ─── Cookie readers ───────────────────────────────────────────────────────────
function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  if (!match) return null;
  try { return decodeURIComponent(match[1]) || null; } catch { return null; }
}

const readName   = () => readCookie("dc_user");
const readAvatar = () => readCookie("dc_avatar");

const subscribeAuth = (onChange: () => void) => {
  window.addEventListener("dc-auth", onChange);
  return () => window.removeEventListener("dc-auth", onChange);
};

// ─── Icon ─────────────────────────────────────────────────────────────────────
const userIcon = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export default function UserMenu() {
  const pathname = usePathname();
  const name   = useSyncExternalStore(subscribeAuth, readName,   () => null);
  const avatar = useSyncExternalStore(subscribeAuth, readAvatar, () => null);
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!name) {
    return (
      <Link
        href="/signin"
        aria-label="Sign in"
        className="grid h-11 w-11 place-items-center rounded-full border border-black/10 text-ink transition hover:border-gold hover:text-gold-dark"
      >
        {userIcon}
      </Link>
    );
  }

  const initials = name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const firstName = name.split(/\s+/)[0];

  // Shared trigger classes
  const triggerBase =
    "grid h-11 w-11 cursor-pointer place-items-center rounded-full transition hover:ring-2 hover:ring-gold hover:ring-offset-1";

  return (
    <details ref={ref} className="group relative">
      <summary aria-label={`Account menu for ${name}`} className="list-none">
        {avatar ? (
          <div className={`${triggerBase} overflow-hidden`}>
            <Image
              src={avatar}
              alt={name}
              width={44}
              height={44}
              className="h-11 w-11 rounded-full object-cover"
            />
          </div>
        ) : (
          <div className={`${triggerBase} bg-ink text-sm font-semibold text-gold`}>
            {initials}
          </div>
        )}
      </summary>

      {/* Dropdown */}
      <div className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right rounded-2xl border border-black/10 bg-white p-2 shadow-xl shadow-black/10 group-open:animate-pop">
        {/* User info header */}
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover shrink-0"
            />
          ) : (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-gold">
              {initials}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">Hi, {firstName}</p>
            <p className="truncate text-xs text-neutral-400">{name}</p>
          </div>
        </div>

        <div className="h-px bg-black/[.06] mx-1 mb-1" />

        <Link href="/account" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink hover:bg-cream transition">
          <svg className="h-4 w-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
          My account &amp; orders
        </Link>

        <button
          type="button"
          onClick={() => { if (ref.current) ref.current.open = false; cartDrawer.open(); }}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-ink hover:bg-cream transition"
        >
          <svg className="h-4 w-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          My booked services
        </button>

        <div className="h-px bg-black/[.06] mx-1 my-1" />

        <form action={async () => { clearAuthTokens(); await signOut(); }}>
          <button type="submit" className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </form>
      </div>
    </details>
  );
}
