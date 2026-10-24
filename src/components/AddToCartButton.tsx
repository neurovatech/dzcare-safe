"use client";

import { useState } from "react";
import { cart, cartDrawer, isSignedInHint, useCart, type CartItem } from "@/lib/cart";
import { trackAddToCart } from "@/lib/tracking/client";
import AuthModal from "./AuthModal";

type Props = Omit<CartItem, "key"> & { itemKey: string; className?: string; compact?: boolean };

/**
 * "Start Repair": signed-in customers get the repair added and the booked-services
 * drawer opened; everyone else signs in (or signs up) in a modal first.
 */
export default function AddToCartButton({ itemKey, className = "", compact = false, ...item }: Props) {
  const items = useCart();
  const [auth, setAuth] = useState(false);
  const inCart = items.some((i) => i.key === itemKey);
  const size = compact ? "h-9 px-3.5 text-xs" : "h-11 px-5 text-sm";

  const addAndOpen = () => {
    if (cart.add({ key: itemKey, ...item })) trackAddToCart(item.title, item.price);
    cartDrawer.open();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => (isSignedInHint() ? addAndOpen() : setAuth(true))}
        className={`btn-shine inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition active:scale-95 ${size} ${
          inCart
            ? "border border-gold-dark/30 bg-gold/15 text-gold-dark hover:bg-gold/25"
            : "bg-ink text-white hover:bg-gold hover:text-ink"
        } ${className}`}
      >
        {inCart ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M14.5 6.5a4 4 0 0 0-5.3 5.1L4 16.8V20h3.2l5.2-5.2a4 4 0 0 0 5.1-5.3l-2.4 2.4-2.6-.6-.6-2.6z" />
          </svg>
        )}
        {inCart ? "Booked" : "Start Repair"}
      </button>
      {auth && <AuthModal context={item.title} onSuccess={addAndOpen} onClose={() => setAuth(false)} />}
    </>
  );
}
