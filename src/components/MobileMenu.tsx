"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { nav } from "@/lib/site";
import { NavIcon } from "./Icons";

export default function MobileMenu() {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  return (
    <details ref={ref} className="group xl:hidden">
      <summary
        aria-label="Open menu"
        className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-black/10 text-ink"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path className="group-open:hidden" d="M4 7h16M4 12h16M4 17h16" />
          <path className="hidden group-open:block" d="M6 6l12 12M18 6L6 18" />
        </svg>
      </summary>
      <nav aria-label="Mobile" className="absolute inset-x-0 top-full border-t border-black/5 bg-white px-4 pb-6 pt-2 shadow-2xl shadow-black/10">
        <ul className="flex flex-col">
          {[...nav, { href: "/booking", label: "My Booking", icon: "cart" as const }, { href: "/account", label: "My Account", icon: "user" as const }].map((item, i) => (
            <li key={item.href} className="fade-up" style={{ "--d": `${i * 40}ms` } as React.CSSProperties}>
              <Link href={item.href} className="flex items-center gap-3 border-b border-black/5 py-3 text-base font-medium text-ink hover:text-gold-dark">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gold/15 text-gold-dark">
                  <NavIcon name={item.icon} />
                </span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/book" className="mt-5 flex h-12 items-center justify-center rounded-full bg-ink font-semibold text-white">
          Book a Repair
        </Link>
      </nav>
    </details>
  );
}
