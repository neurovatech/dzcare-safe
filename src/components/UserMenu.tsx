"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { signOut } from "@/app/(auth)/actions";
import { cartDrawer } from "@/lib/cart";

// The header is fully static (cached HTML, no per-request render). The signed-in
// state comes from the display-only `dc_user` cookie; real auth checks always use
// the httpOnly session cookie on the server.
const readName = () => {
  const match = document.cookie.match(/(?:^|;\s*)dc_user=([^;]*)/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]) || null;
  } catch {
    return null;
  }
};
// Re-read the display cookie when the login modal signs someone in (no navigation happens)
const subscribeAuth = (onChange: () => void) => {
  window.addEventListener("dc-auth", onChange);
  return () => window.removeEventListener("dc-auth", onChange);
};

const userIcon = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export default function UserMenu() {
  // Re-read the cookie after every navigation (sign-in / sign-out redirect)
  const pathname = usePathname();
  const name = useSyncExternalStore(subscribeAuth, readName, () => null);
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

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

  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <details ref={ref} className="group relative">
      <summary
        aria-label={`Account menu for ${name}`}
        className="grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-ink text-sm font-semibold text-gold transition hover:bg-gold hover:text-ink"
      >
        {initials}
      </summary>
      <div className="absolute right-0 top-full z-50 mt-2 w-60 origin-top-right rounded-2xl border border-black/10 bg-white p-2 shadow-xl shadow-black/10 group-open:animate-pop">
        <p className="truncate px-3 pb-2 pt-1.5 text-sm font-semibold text-ink">Hi, {name.split(/\s+/)[0]}</p>
        <Link href="/account" className="block rounded-xl px-3 py-2.5 text-sm text-ink hover:bg-cream">
          My account & orders
        </Link>
        <button
          type="button"
          onClick={() => {
            if (ref.current) ref.current.open = false;
            cartDrawer.open();
          }}
          className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-ink hover:bg-cream"
        >
          My booked services
        </button>
        <form action={signOut}>
          <button type="submit" className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-red-700 hover:bg-red-50">
            Sign out
          </button>
        </form>
      </div>
    </details>
  );
}
