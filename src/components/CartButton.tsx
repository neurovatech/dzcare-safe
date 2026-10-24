"use client";

import { cartDrawer, useCart } from "@/lib/cart";

export default function CartButton() {
  const count = useCart().length;
  return (
    <button
      type="button"
      onClick={() => cartDrawer.open()}
      aria-label={`Booked services, ${count} item${count === 1 ? "" : "s"}`}
      className="relative grid h-11 w-11 place-items-center rounded-full border border-black/10 text-ink transition hover:border-gold hover:text-gold-dark"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M3 4h2l2.2 10.5a2 2 0 0 0 2 1.5h7.6a2 2 0 0 0 2-1.6L20 8H6.2" />
        <circle cx="10" cy="20" r="1.3" />
        <circle cx="17" cy="20" r="1.3" />
      </svg>
      {count > 0 && (
        <span
          key={count}
          className="animate-pop absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[11px] font-bold text-ink"
        >
          {count}
        </span>
      )}
    </button>
  );
}
