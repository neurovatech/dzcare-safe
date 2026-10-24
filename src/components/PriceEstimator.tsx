"use client";

import Link from "next/link";
import { useState } from "react";
import type { Brand, IconName } from "@/lib/data";
import { formatTaka } from "@/lib/format";
import { repairPath } from "@/lib/slug";
import { tint } from "@/lib/tints";
import AddToCartButton from "./AddToCartButton";
import ModelPicker from "./ModelPicker";
import { ClockIcon, ServiceIcon } from "./Icons";

export type ServiceLite = { slug: string; name: string; icon: IconName; time: string };

/** "Select your device → see repair prices → add to cart" picker. */
export default function PriceEstimator({
  brands,
  services,
  initialBrand = "iphone",
}: {
  brands: Brand[];
  services: ServiceLite[];
  initialBrand?: string;
}) {
  const [brandSlug, setBrandSlug] = useState(initialBrand);
  const brand = brands.find((b) => b.slug === brandSlug) ?? brands[0];
  const [model, setModel] = useState(brand.models[0]);

  const priced = Object.values(brand.prices).filter((p): p is number => !!p);
  const meta = `${priced.length ? `From ${formatTaka(Math.min(...priced))} · ` : ""}${priced.length} repairs`;

  const selectBrand = (slug: string) => {
    const next = brands.find((b) => b.slug === slug) ?? brands[0];
    setBrandSlug(next.slug);
    setModel(next.models[0]);
  };

  return (
    <div className="overflow-hidden rounded-[2rem] border border-black/[.06] bg-white shadow-2xl shadow-gold/10">
      {/* Device picker — dark band */}
      <div className="relative overflow-hidden bg-ink p-5 sm:p-7">
        <div aria-hidden="true" className="glow pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,rgb(212_169_122/0.14),transparent)]" />

        <div className="relative grid grid-cols-[minmax(0,1fr)] gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">1 · Choose brand</p>
            <div role="tablist" aria-label="Phone brand" className="no-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
              {brands.map((b) => {
                const active = b.slug === brand.slug;
                return (
                  <button
                    key={b.slug}
                    role="tab"
                    type="button"
                    aria-selected={active}
                    onClick={() => selectBrand(b.slug)}
                    className={`h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition duration-300 ${
                      active
                        ? "bg-gradient-to-r from-gold to-gold-light text-ink shadow-lg shadow-gold/30"
                        : "border border-white/15 text-white/80 hover:-translate-y-0.5 hover:border-gold hover:text-white"
                    }`}
                  >
                    {b.name}
                  </button>
                );
              })}
            </div>
          </div>
          <ModelPicker key={brand.slug} tone="dark" label="2 · Select model" models={brand.models} value={model} onChange={setModel} meta={meta} />
        </div>
      </div>

      {/* Repairs */}
      <div className="bg-gradient-to-b from-cream to-white p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">
          3 · Pick a repair for <span className="text-ink">{model}</span>
        </p>
        <ul key={brand.slug} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const price = brand.prices[s.slug];
            const t = tint(i);
            const params = new URLSearchParams({ brand: brand.slug, model, service: s.slug });
            return (
              <li
                key={s.slug}
                className={`fade-up group relative flex flex-col overflow-hidden rounded-3xl border border-black/[.06] bg-gradient-to-br ${t.soft} to-white p-5 transition duration-500 hover:-translate-y-1.5 hover:shadow-xl ${t.ring} ${t.shadow}`}
                style={{ "--d": `${i * 35}ms` } as React.CSSProperties}
              >
                <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 ${t.solid}`} />
                <div className="flex items-start justify-between gap-3">
                  <span className={`grid h-12 w-12 place-items-center rounded-2xl transition duration-500 group-hover:rotate-[-8deg] group-hover:scale-110 ${t.tile}`}>
                    <ServiceIcon name={s.icon} />
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-neutral-600 shadow-sm">
                    <ClockIcon className="h-3.5 w-3.5" /> {s.time}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-ink">{s.name}</h3>
                <p className="mt-1 flex items-baseline gap-1.5">
                  {price !== undefined ? (
                    <>
                      <span className="text-xs font-medium text-neutral-500">from</span>
                      <span className={`text-2xl font-bold tracking-tight ${t.text}`}>{formatTaka(price)}</span>
                    </>
                  ) : (
                    <span className="text-sm text-neutral-500">Get a quote</span>
                  )}
                </p>
                <div className="mt-4 flex-1" />
                {price !== undefined ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                        href={brand.models.includes(model) ? repairPath(brand.slug, model, s.slug) : `/services/${s.slug}`}
                        className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 px-3.5 text-xs font-semibold text-ink transition hover:border-gold hover:text-gold-dark"
                      >
                        Read More
                      </Link>
                    <AddToCartButton
                      compact
                      itemKey={`phone:${brand.slug}:${s.slug}:${model}`}
                      source={{ kind: "phone", brand: brand.slug, service: s.slug, model }}
                      title={`${model} — ${s.name}`}
                      subtitle={brand.name}
                      price={price}
                    />
                  </div>
                ) : (
                  <Link href={`/book?${params}`} prefetch={false} className="link-underline text-xs font-semibold text-neutral-600 hover:text-ink">
                    Get a quote →
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-5 flex items-center gap-2 text-xs text-neutral-500">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
          Starting prices for {model}. Final price confirmed after a free diagnosis — pay only after the repair.
        </p>
      </div>
    </div>
  );
}
