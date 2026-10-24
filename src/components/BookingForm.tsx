"use client";

import { useActionState, useEffect, useState } from "react";
import { bookRepair, type BookingState } from "@/app/book/actions";
import type { Brand } from "@/lib/data";
import { formatTaka } from "@/lib/format";
import { trackLeadBrowser } from "@/lib/tracking/client";

const initial: BookingState = { ok: false };

const field =
  "mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-ink placeholder:text-neutral-400 outline-none transition focus:border-gold";

type Props = {
  brands: Brand[];
  services: { slug: string; name: string }[];
  /** Prefill from ?brand=&model=&service= (links from the price estimator) */
  defaults?: { brand?: string; model?: string; service?: string };
};

export default function BookingForm({ brands, services, defaults = {} }: Props) {
  const [state, action, pending] = useActionState(bookRepair, initial);
  const [brand, setBrand] = useState(defaults.brand ?? "");
  const [service, setService] = useState(defaults.service ?? "");
  const [model, setModel] = useState(defaults.model ?? "");

  useEffect(() => {
    if (state.ok && state.eventId) trackLeadBrowser(state.eventId, state.value);
  }, [state]);

  const selectedBrand = brands.find((b) => b.slug === brand);
  const estimate = selectedBrand?.prices[service];

  if (state.ok) {
    return (
      <div role="status" className="rounded-3xl border border-gold/40 bg-gold/10 p-8 text-center">
        <p className="text-4xl" aria-hidden="true">✓</p>
        <h2 className="mt-3 text-2xl font-bold text-ink">Booking received</h2>
        <p className="mt-3 text-neutral-700">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="relative rounded-3xl border border-black/10 bg-white p-5 sm:p-8" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-neutral-700">Your name *</label>
          <input id="name" name="name" defaultValue={state.values?.name} autoComplete="name" required className={field} placeholder="e.g. Rahim Uddin" aria-invalid={!!state.errors?.name} aria-describedby="name-err" />
          {state.errors?.name && <p id="name-err" className="mt-1.5 text-sm text-red-600">{state.errors.name}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="text-sm font-medium text-neutral-700">Mobile number *</label>
          <input id="phone" name="phone" defaultValue={state.values?.phone} type="tel" inputMode="tel" autoComplete="tel" required className={field} placeholder="01XXXXXXXXX" aria-invalid={!!state.errors?.phone} aria-describedby="phone-err" />
          {state.errors?.phone && <p id="phone-err" className="mt-1.5 text-sm text-red-600">{state.errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="brand" className="text-sm font-medium text-neutral-700">Phone brand *</label>
          <select id="brand" name="brand" value={brand} onChange={(e) => setBrand(e.target.value)} required className={field} aria-invalid={!!state.errors?.brand}>
            <option value="">Select brand</option>
            {brands.map((b) => (
              <option key={b.slug} value={b.slug}>{b.name}</option>
            ))}
          </select>
          {state.errors?.brand && <p className="mt-1.5 text-sm text-red-600">{state.errors.brand}</p>}
        </div>
        <div>
          <label htmlFor="model" className="text-sm font-medium text-neutral-700">Model</label>
          <input id="model" name="model" list="model-list" value={model} onChange={(e) => setModel(e.target.value)} className={field} placeholder="e.g. iPhone 15 Pro" />
          <datalist id="model-list">
            {selectedBrand?.models.map((m) => <option key={m} value={m} />)}
          </datalist>
        </div>
        <div>
          <label htmlFor="service" className="text-sm font-medium text-neutral-700">Problem *</label>
          <select id="service" name="service" value={service} onChange={(e) => setService(e.target.value)} required className={field} aria-invalid={!!state.errors?.service}>
            <option value="">Select problem</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>{s.name}</option>
            ))}
          </select>
          {state.errors?.service && <p className="mt-1.5 text-sm text-red-600">{state.errors.service}</p>}
        </div>
        <div>
          <label htmlFor="visit" className="text-sm font-medium text-neutral-700">Service type</label>
          <select id="visit" name="visit" className={field} defaultValue={state.values?.visit || "walk-in"}>
            <option value="walk-in">I&apos;ll visit the service center</option>
            <option value="pickup">Pickup & delivery (Dhaka)</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="note" className="text-sm font-medium text-neutral-700">Describe the issue</label>
          <textarea id="note" name="note" defaultValue={state.values?.note} rows={3} className={`${field} h-auto py-3`} placeholder="What happened to your phone?" />
        </div>
        {/* honeypot */}
        <div aria-hidden="true" className="absolute -left-[9999px]">
          <label>Company <input name="company" tabIndex={-1} autoComplete="off" /></label>
        </div>
      </div>

      {estimate ? (
        <p className="mt-6 rounded-xl bg-gold/10 px-4 py-3 text-sm text-neutral-700">
          Estimated starting price: <span className="font-semibold text-gold-dark">{formatTaka(estimate)}</span> — confirmed after free diagnosis.
        </p>
      ) : null}
      {state.message && !state.ok && <p role="alert" className="mt-4 text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-gold font-semibold text-ink transition hover:bg-gold-light disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {pending ? "Sending…" : "Book My Repair"}
      </button>
      <p className="mt-3 text-xs text-neutral-600">We&apos;ll call you within 15 minutes during opening hours. No spam, ever.</p>
    </form>
  );
}
