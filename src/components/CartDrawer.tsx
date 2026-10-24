"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { checkCoupon } from "@/app/booking/actions";
import { cart, cartDrawer, couponStore, useCart, useCartDrawer, useCoupon } from "@/lib/cart";
import { formatTaka } from "@/lib/format";
import { iconForItem } from "@/lib/service-icons";
import { site } from "@/lib/site";
import { ServiceIcon } from "./Icons";

/** "Your Booked Services" slide-over, opened by Start Repair and the header cart icon. */
export default function CartDrawer() {
  const open = useCartDrawer();
  const items = useCart();
  const applied = useCoupon();
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [code, setCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const discount = applied ? Math.min(applied.discount, subtotal) : 0;
  const total = subtotal - discount;

  const apply = () =>
    start(async () => {
      setCouponError("");
      const res = await checkCoupon(code, items.map((i) => i.source));
      if (!res.ok) {
        setCouponError(res.error ?? "Invalid coupon.");
        return;
      }
      couponStore.set({ code: res.code!, discount: res.discount!, label: res.label ?? "" });
      setCode("");
    });

  // coupon amounts depend on the cart, so drop it when the cart changes
  const signature = items.map((i) => i.key).join("|");
  const lastSignature = useRef(signature);
  useEffect(() => {
    if (lastSignature.current !== signature && applied) couponStore.set(null);
    lastSignature.current = signature;
  }, [signature, applied]);

  return (
    <dialog
      ref={dialog}
      onClose={() => cartDrawer.close()}
      onCancel={(e) => {
        e.preventDefault();
        cartDrawer.close();
      }}
      onClick={(e) => e.target === dialog.current && cartDrawer.close()}
      aria-label="Your booked services"
      className="cart-drawer m-0 ml-auto h-dvh max-h-dvh w-full max-w-md bg-transparent p-0 sm:p-3"
    >
      <div className="flex h-full flex-col overflow-hidden bg-white shadow-2xl sm:rounded-[1.75rem]">
        <div className="flex items-center justify-between border-b border-black/[.06] px-6 py-5">
          <h2 className="text-xl font-bold text-ink">Your Booked Services</h2>
          <button
            type="button"
            onClick={() => cartDrawer.close()}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full bg-cream text-ink transition hover:rotate-90 hover:bg-gold"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-cream text-gold-dark">
              <ServiceIcon name="chip" className="h-8 w-8" />
            </span>
            <p className="mt-4 text-lg font-bold text-ink">No services booked yet</p>
            <p className="mt-1 text-sm text-neutral-500">Find your device and tap Start Repair.</p>
            <button
              type="button"
              onClick={() => {
                cartDrawer.close();
                router.push("/categories");
              }}
              className="mt-6 h-11 rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-gold hover:text-ink"
            >
              Choose your device
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-ink">
                  {items.length} Item{items.length === 1 ? "" : "s"}
                </p>
                <button type="button" onClick={() => cart.clear()} className="text-sm font-semibold text-red-600 hover:underline">
                  Clear All
                </button>
              </div>
              <ul className="mt-3 divide-y divide-black/[.06]">
                {items.map((item) => (
                  <li key={item.key} className="fade-up flex gap-4 py-4">
                    <span className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gold/15 text-gold-dark">
                      {item.image ? (
                        <Image src={item.image} alt="" width={80} height={80} className="h-full w-full object-contain p-2" />
                      ) : (
                        <ServiceIcon name={iconForItem(item)} className="h-9 w-9" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold leading-snug text-ink">{item.title}</span>
                      <span className="mt-1.5 block font-bold text-ink">{item.price ? formatTaka(item.price) : "Free"}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => cart.remove(item.key)}
                      aria-label={`Remove ${item.title}`}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cream text-neutral-600 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-lg font-bold text-ink">Booking Summary</p>
              {applied ? (
                <div className="mt-3 flex items-center justify-between rounded-2xl border border-gold/50 bg-cream px-4 py-3 text-sm">
                  <span>
                    <b className="text-ink">{applied.code}</b> <span className="text-neutral-600">applied</span>
                  </span>
                  <button type="button" onClick={() => couponStore.set(null)} className="font-semibold text-red-600 hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <form
                  className="mt-3 flex rounded-full border border-black/10 bg-cream p-1"
                  onSubmit={(e) => {
                    e.preventDefault();
                    apply();
                  }}
                >
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Apply Coupon"
                    aria-label="Coupon code"
                    className="min-w-0 flex-1 bg-transparent px-4 text-sm uppercase text-ink outline-none placeholder:normal-case placeholder:text-neutral-400"
                  />
                  <button
                    type="submit"
                    disabled={pending || !code.trim()}
                    className="h-10 rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-gold hover:text-ink disabled:opacity-50"
                  >
                    {pending ? "Checking…" : "Apply Coupon"}
                  </button>
                </form>
              )}
              {couponError && <p className="mt-2 text-xs text-red-600">{couponError}</p>}

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Sub Total ({items.length} item{items.length === 1 ? "" : "s"})</dt>
                  <dd className="font-semibold text-ink">{formatTaka(subtotal)}</dd>
                </div>
                <div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-600">Delivery</dt>
                    <dd className="font-semibold text-ink">{formatTaka(0)}</dd>
                  </div>
                  <p className="mt-0.5 text-xs text-gold-dark">
                    Pickup & delivery charge is added based on location ({formatTaka(site.deliveryCharge.min)}–
                    {formatTaka(site.deliveryCharge.max)}).
                  </p>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Discount</dt>
                  <dd className="font-semibold text-ink">{discount ? `− ${formatTaka(discount)}` : formatTaka(0)}</dd>
                </div>
                <div className="flex justify-between border-t border-black/[.06] pt-3 text-base">
                  <dt className="font-bold text-ink">Total Amount</dt>
                  <dd className="font-bold text-ink">{formatTaka(total)}</dd>
                </div>
              </dl>
            </div>

            <div className="border-t border-black/[.06] p-5">
              <button
                type="button"
                onClick={() => {
                  cartDrawer.close();
                  router.push("/booking");
                }}
                className="btn-shine h-12 w-full rounded-full bg-gold font-semibold text-ink transition hover:bg-ink hover:text-white"
              >
                Continue
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
