"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { checkCoupon, submitBooking, type BookingInput, type BookingResult } from "@/app/booking/actions";
import { areas, divisions } from "@/lib/bd-locations";
import { cart, couponStore, isSignedInHint, useCart, useCoupon } from "@/lib/cart";
import { formatTaka } from "@/lib/format";
import { iconForItem } from "@/lib/service-icons";
import { site } from "@/lib/site";
import { trackLeadBrowser } from "@/lib/tracking/client";
import AuthModal from "./AuthModal";
import { CheckIcon, ServiceIcon } from "./Icons";

type Defaults = { name?: string; phone?: string; email?: string };
type Errors = BookingResult["errors"];

const input =
  "mt-1.5 h-11 w-full rounded-xl border border-black/10 bg-white px-3.5 text-sm text-ink placeholder:text-neutral-400 outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/20 aria-[invalid=true]:border-red-400";

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-neutral-700">
      {label} {required && <span className="text-red-500">*</span>}
      {children}
      {error && <span className="mt-1 block text-xs font-normal text-red-600">{error}</span>}
    </label>
  );
}

/** Booking page: customer details → submit → complete. */
export default function BookingFlow({ defaults = {} }: { defaults?: Defaults }) {
  const items = useCart();
  const applied = useCoupon();
  const [form, setForm] = useState({
    name: defaults.name ?? "",
    phone: defaults.phone ?? "",
    email: defaults.email ?? "",
    division: "",
    district: "",
    area: "",
    address: "",
    message: "",
    serviceType: "erepair" as BookingInput["serviceType"],
    shop: site.shops[0] as string,
  });
  const [agree, setAgree] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState("");
  const [done, setDone] = useState<BookingResult | null>(null);
  const [needLogin, setNeedLogin] = useState(false);
  const [code, setCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [pending, start] = useTransition();
  const [couponPending, startCoupon] = useTransition();

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    // fixing a field clears its message
    setErrors((e) => (e?.[k as keyof NonNullable<Errors>] ? { ...e, [k]: undefined } : e));
  };
  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const discount = applied ? Math.min(applied.discount, subtotal) : 0;
  const total = subtotal - discount;
  const districtAreas = areas[form.district];

  const submit = () =>
    start(async () => {
      setError("");
      if (!isSignedInHint()) {
        setNeedLogin(true);
        return;
      }
      const res = await submitBooking({ ...form, coupon: applied?.code ?? "", agree, items: items.map((i) => i.source) });
      if (res.needsLogin) {
        setNeedLogin(true);
        return;
      }
      if (!res.ok) {
        setErrors(res.errors ?? {});
        setError(res.error ?? (res.errors ? "Please check the highlighted fields." : "Something went wrong."));
        return;
      }
      if (res.eventId) trackLeadBrowser(res.eventId, res.summary?.total);
      cart.clear();
      couponStore.set(null);
      setDone(res);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

  const applyCode = () =>
    startCoupon(async () => {
      setCouponError("");
      const res = await checkCoupon(code, items.map((i) => i.source));
      if (!res.ok) return setCouponError(res.error ?? "Invalid coupon.");
      couponStore.set({ code: res.code!, discount: res.discount!, label: res.label ?? "" });
      setCode("");
    });

  // ── Step indicator ──────────────────────────────────────────────
  const stepper = (
    <ol className="flex items-center gap-3 border-y border-black/[.07] py-4 text-sm font-semibold">
      <li className={`flex items-center gap-2 ${done ? "text-neutral-500" : "text-ink"}`}>
        <span className={`grid h-7 w-7 place-items-center rounded-full ${done ? "bg-gold/30 text-gold-dark" : "bg-gold text-ink"}`}>
          {done ? <CheckIcon className="h-4 w-4" /> : 1}
        </span>
        Customer Details
      </li>
      <li aria-hidden="true" className="text-neutral-300">›</li>
      <li className={`flex items-center gap-2 ${done ? "text-ink" : "text-neutral-500"}`}>
        <span className={`grid h-7 w-7 place-items-center rounded-full ${done ? "bg-gold text-ink" : "border border-black/15"}`}>2</span>
        Complete
      </li>
    </ol>
  );

  // ── Complete ────────────────────────────────────────────────────
  if (done?.ok && done.summary) {
    const s = done.summary;
    return (
      <div>
        {stepper}
        <div className="fade-up mx-auto mt-8 max-w-2xl rounded-[2rem] border border-gold/40 bg-white p-8 text-center shadow-xl shadow-gold/10">
          <span className="animate-pop mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold text-ink">
            <CheckIcon className="h-8 w-8" />
          </span>
          <h2 className="mt-4 text-2xl font-bold text-ink">Repair request submitted!</h2>
          <p className="mt-2 text-neutral-600">
            Booking ID <b className="text-ink">{done.bookingId}</b>. Our team will call you shortly to confirm
            {s.serviceType === "shop" ? ` your visit to ${s.shop}.` : " the pickup time."}
          </p>
          <ul className="mt-6 divide-y divide-black/[.06] rounded-2xl bg-cream px-5 text-left text-sm">
            {s.items.map((i) => (
              <li key={i.key} className="flex justify-between gap-4 py-3">
                <span className="text-ink">{i.title}</span>
                <span className="font-semibold text-ink">{i.price ? formatTaka(i.price) : "Free"}</span>
              </li>
            ))}
            {s.discount > 0 && (
              <li className="flex justify-between py-3 text-neutral-600">
                <span>Discount</span>
                <span>− {formatTaka(s.discount)}</span>
              </li>
            )}
            <li className="flex justify-between py-3 text-base font-bold text-ink">
              <span>Total</span>
              <span>{formatTaka(s.total)}</span>
            </li>
          </ul>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/account" className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-6 font-semibold text-white hover:bg-gold hover:text-ink">
              View my bookings
            </Link>
            <Link href="/" className="inline-flex h-12 items-center justify-center rounded-full border border-black/15 px-6 font-semibold text-ink hover:border-gold">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Empty ───────────────────────────────────────────────────────
  if (!items.length) {
    return (
      <div>
        {stepper}
        <div className="mx-auto mt-8 max-w-xl rounded-[2rem] border border-black/[.07] bg-white p-10 text-center">
          <p className="text-xl font-bold text-ink">No services selected yet</p>
          <p className="mt-2 text-neutral-600">Choose your device and tap Start Repair to book.</p>
          <Link href="/categories" className="mt-6 inline-flex h-12 items-center rounded-full bg-ink px-6 font-semibold text-white hover:bg-gold hover:text-ink">
            Choose your device
          </Link>
        </div>
      </div>
    );
  }

  // ── Customer details ────────────────────────────────────────────
  return (
    <div>
      {stepper}
      <form
        className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-start"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <section className="rounded-3xl border border-black/[.07] bg-cream/60 p-5 sm:p-7">
          <h2 className="text-lg font-bold text-ink">Customer Details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Full Name" required error={errors?.name}>
                <input className={input} autoComplete="name" placeholder="Enter full name" value={form.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors?.name} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Phone Number" required error={errors?.phone}>
                <input className={input} type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} aria-invalid={!!errors?.phone} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Email" required error={errors?.email}>
                <input className={input} type="email" autoComplete="email" placeholder="Enter email address" value={form.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors?.email} />
              </Field>
            </div>
            <Field label="Division" required error={errors?.division}>
              <select
                className={input}
                value={form.division}
                onChange={(e) => {
                  setForm((f) => ({ ...f, division: e.target.value, district: "", area: "" }));
                  setErrors((er) => ({ ...er, division: undefined }));
                }}
                aria-invalid={!!errors?.division}
              >
                <option value="">Select division</option>
                {Object.keys(divisions).map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field label="District" required error={errors?.district}>
              <select
                className={input}
                value={form.district}
                disabled={!form.division}
                onChange={(e) => {
                  setForm((f) => ({ ...f, district: e.target.value, area: "" }));
                  setErrors((er) => ({ ...er, district: undefined }));
                }}
                aria-invalid={!!errors?.district}
              >
                <option value="">Select district</option>
                {(divisions[form.division] ?? []).map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field label="Area" required error={errors?.area}>
              {districtAreas ? (
                <select className={input} value={form.area} onChange={(e) => set("area", e.target.value)} aria-invalid={!!errors?.area}>
                  <option value="">Select area</option>
                  {districtAreas.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              ) : (
                <input className={input} placeholder="Your area / upazila" value={form.area} disabled={!form.district} onChange={(e) => set("area", e.target.value)} aria-invalid={!!errors?.area} />
              )}
            </Field>
            <Field label="Address" required error={errors?.address}>
              <input className={input} autoComplete="street-address" placeholder="House 23, Road 24, Block B" value={form.address} onChange={(e) => set("address", e.target.value)} aria-invalid={!!errors?.address} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Message (Optional)">
                <textarea className={`${input} h-auto py-3`} rows={2} placeholder="Tell us about the problem…" value={form.message} onChange={(e) => set("message", e.target.value)} />
              </Field>
            </div>

            <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2" role="radiogroup" aria-label="Service type">
              {(
                [
                  ["erepair", "Erepair", "We pick up & deliver your device", "M3 7h11v9H3zM14 10h4l3 3v3h-7zM6.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"],
                  ["shop", "Direct Shop", "Visit our service center", "M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6"],
                ] as const
              ).map(([value, title, hint, d]) => {
                const active = form.serviceType === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => set("serviceType", value)}
                    className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                      active ? "border-gold bg-white ring-2 ring-gold" : "border-black/10 bg-white hover:border-gold"
                    }`}
                  >
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${active ? "bg-gold text-ink" : "bg-cream text-gold-dark"}`}>
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                        <path d={d} />
                      </svg>
                    </span>
                    <span>
                      <span className="block font-semibold text-ink">{title}</span>
                      <span className="block text-xs text-neutral-500">{hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {form.serviceType === "shop" && (
              <div className="fade-up sm:col-span-2">
                <Field label="Shop Location" required error={errors?.shop}>
                  <select className={input} value={form.shop} onChange={(e) => set("shop", e.target.value)}>
                    {site.shops.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
              </div>
            )}
          </div>
        </section>

        <aside className="rounded-3xl border border-black/[.07] bg-white p-5 shadow-xl shadow-black/[.04] sm:p-7 lg:sticky lg:top-28">
          <h2 className="text-lg font-bold text-ink">Booking Summary</h2>
          <ul className="mt-4 divide-y divide-black/[.06]">
            {items.map((i) => (
              <li key={i.key} className="flex gap-3 py-3">
                <span className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gold/15 text-gold-dark">
                  {i.image ? (
                    <Image src={i.image} alt="" width={64} height={64} className="h-full w-full object-contain p-1.5" />
                  ) : (
                    <ServiceIcon name={iconForItem(i)} className="h-7 w-7" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-snug text-ink">{i.title}</span>
                  <span className="mt-1 block text-sm font-bold text-ink">{i.price ? formatTaka(i.price) : "Free"}</span>
                </span>
              </li>
            ))}
          </ul>

          {applied ? (
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-gold/50 bg-cream px-4 py-3 text-sm">
              <span>
                <b className="text-ink">{applied.code}</b> <span className="text-neutral-600">applied</span>
              </span>
              <button type="button" onClick={() => couponStore.set(null)} className="font-semibold text-red-600 hover:underline">
                Remove
              </button>
            </div>
          ) : (
            <div className="mt-4 flex rounded-full border border-black/10 bg-cream p-1">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyCode();
                  }
                }}
                placeholder="Apply Coupon"
                aria-label="Coupon code"
                className="min-w-0 flex-1 bg-transparent px-4 text-sm uppercase text-ink outline-none placeholder:normal-case placeholder:text-neutral-400"
              />
              <button
                type="button"
                onClick={applyCode}
                disabled={couponPending || !code.trim()}
                className="h-10 rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-gold hover:text-ink disabled:opacity-50"
              >
                {couponPending ? "Checking…" : "Apply Coupon"}
              </button>
            </div>
          )}
          {(couponError || errors?.coupon) && <p className="mt-2 text-xs text-red-600">{couponError || errors?.coupon}</p>}

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
                {form.serviceType === "shop"
                  ? "No delivery charge for shop visits."
                  : `Pickup & delivery charge is added based on location (${formatTaka(site.deliveryCharge.min)}–${formatTaka(site.deliveryCharge.max)}).`}
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

          <label className="mt-5 flex items-start gap-2.5 text-sm text-neutral-700">
            <input type="checkbox" checked={agree} onChange={(e) => {
              setAgree(e.target.checked);
              setErrors((er) => ({ ...er, agree: undefined }));
            }} className="mt-0.5 h-4 w-4 accent-[#d4a97a]" />
            <span>
              I have read & agree to the website{" "}
              <Link href="/terms" target="_blank" className="font-semibold text-gold-dark underline-offset-4 hover:underline">
                terms and conditions
              </Link>
            </span>
          </label>
          {errors?.agree && <p className="mt-1 text-xs text-red-600">{errors.agree}</p>}
          {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="btn-shine mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gold font-semibold text-ink transition hover:bg-ink hover:text-white disabled:opacity-60"
          >
            {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" aria-hidden="true" />}
            {pending ? "Submitting…" : "Submit Repair Request"}
          </button>
        </aside>
      </form>
      {needLogin && <AuthModal context="your repair booking" onSuccess={submit} onClose={() => setNeedLogin(false)} />}
    </div>
  );
}
