"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { CategoryBrand } from "@/lib/api";
import type { CategoryRepair } from "@/lib/data";
import { formatTaka } from "@/lib/format";
import { repairPath } from "@/lib/slug";
import AddToCartButton from "./AddToCartButton";
import ModelPicker from "./ModelPicker";
import { ArrowIcon, CheckIcon, ClockIcon } from "./Icons";

type Props = {
  categorySlug: string;
  categoryName: string;
  categoryImage: string;
  brands: CategoryBrand[];
  repairs: CategoryRepair[];
  /** Phones only: API brand slug → our brand price table, for exact per-brand prices */
  brandPrices?: Record<string, { slug: string; prices: Partial<Record<string, number>>; models: string[] }>;
};

type Step = 1 | 2 | 3;

const INITIAL_BRANDS = 12;

/** Step-by-step wizard: brand → model → repair, with Start Repair and Read More. */
export default function CategoryRepairPicker({ categorySlug, categoryName, categoryImage, brands, repairs, brandPrices }: Props) {
  const hasBrands = brands.length > 0;
  const [step, setStep] = useState<Step>(hasBrands ? 1 : 3);
  const [brandSlug, setBrandSlug] = useState<string | null>(null);
  const [model, setModel] = useState("");
  const [showAllBrands, setShowAllBrands] = useState(false);
  const top = useRef<HTMLDivElement>(null);

  const brand = brands.find((b) => b.slug === brandSlug);
  const device = model || (brand ? `${brand.name} ${categoryName}` : categoryName);
  const shownBrands = showAllBrands ? brands : brands.slice(0, INITIAL_BRANDS);
  const table = brand ? brandPrices?.[brand.slug] : undefined;
  // brand-specific price when we have one, otherwise the category "from" price
  const priceOf = (r: CategoryRepair) => table?.prices[r.slug] ?? r.price;
  const lowest = Math.min(...repairs.map(priceOf).filter((p) => p > 0));

  const go = (next: Step) => {
    setStep(next);
    // keep the active step in view (mainly for phones)
    requestAnimationFrame(() => {
      const el = top.current;
      if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const pickBrand = (slug: string) => {
    setBrandSlug(slug);
    setModel("");
    go(2);
  };

  const pickModel = (m: string) => {
    setModel(m);
    go(3);
  };

  const steps = [
    { n: 1 as Step, label: "Brand", value: brand?.name },
    { n: 2 as Step, label: "Model", value: model ? model.replace(`${brand?.name ?? ""} `, "") : undefined },
    { n: 3 as Step, label: "Repair", value: undefined },
  ];

  return (
    <div ref={top} className="scroll-mt-24 overflow-hidden rounded-[2rem] border border-black/[.06] bg-white shadow-2xl shadow-gold/10">
      {/* ── Stepper ─────────────────────────────────────────────── */}
      {hasBrands && (
        <div className="relative overflow-hidden bg-ink px-5 py-6 sm:px-8">
          <div aria-hidden="true" className="glow pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full" />
          <ol className="relative grid grid-cols-3 gap-2">
            {/* progress track */}
            <span aria-hidden="true" className="absolute left-[16.6%] right-[16.6%] top-5 h-0.5 bg-white/15" />
            <span
              aria-hidden="true"
              className="absolute left-[16.6%] top-5 h-0.5 bg-gold transition-all duration-500"
              style={{ width: `${((step - 1) / 2) * 66.8}%` }}
            />
            {steps.map((s) => {
              const done = step > s.n;
              const active = step === s.n;
              const reachable = s.n === 1 || (s.n === 2 && !!brand) || s.n === 3;
              return (
                <li key={s.n} className="relative flex flex-col items-center text-center">
                  <button
                    type="button"
                    disabled={!reachable || active}
                    onClick={() => go(s.n)}
                    aria-current={active ? "step" : undefined}
                    className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold ring-4 ring-ink transition duration-300 ${
                      active
                        ? "scale-110 bg-gold text-ink shadow-lg shadow-gold/40"
                        : done
                          ? "bg-gold/90 text-ink hover:bg-gold"
                          : "bg-ink-2 text-white/60"
                    } disabled:cursor-default`}
                  >
                    {done ? <CheckIcon className="h-4 w-4" /> : s.n}
                  </button>
                  <span className={`mt-2 text-xs font-semibold uppercase tracking-[0.15em] ${active || done ? "text-gold" : "text-white/50"}`}>
                    {s.label}
                  </span>
                  <span className="mt-0.5 line-clamp-1 max-w-full px-1 text-[11px] text-white/70">{s.value ?? " "}</span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* ── Your device summary ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 border-b border-black/[.06] bg-cream px-5 py-4 sm:px-8">
        <span className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-sm">
          {brand ? (
            <Image src={brand.logo} alt="" width={56} height={56} className="h-full w-full object-contain p-2 mix-blend-multiply" />
          ) : (
            <Image src={categoryImage} alt="" width={56} height={56} className="h-full w-full object-contain p-1" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold uppercase tracking-[0.15em] text-gold-dark">Your device</span>
          <span className="block truncate text-base font-bold text-ink sm:text-lg">{device}</span>
        </span>
        <span className="w-full rounded-full bg-white px-3 py-1.5 text-center text-xs font-semibold text-ink shadow-sm sm:w-auto">
          Repairs from <span className="text-gold-dark">{formatTaka(lowest)}</span>
        </span>
      </div>

      <div className="p-5 sm:p-8">
        {/* ── Step 1 · Brand ─────────────────────────────────────── */}
        {step === 1 && (
          <section key="s1" className="fade-up" aria-labelledby="step-brand">
            <StepTitle id="step-brand" n={1} title={`Which ${categoryName.toLowerCase()} brand do you have?`} hint="Tap your brand to continue." />
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {shownBrands.map((b, i) => {
                const active = b.slug === brandSlug;
                return (
                  <li key={b.slug} className="fade-up" style={{ "--d": `${i * 30}ms` } as React.CSSProperties}>
                    <button
                      type="button"
                      onClick={() => pickBrand(b.slug)}
                      aria-pressed={active}
                      className={`group relative flex h-full w-full flex-col items-center gap-2 rounded-2xl border bg-white p-4 transition duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-xl hover:shadow-gold/20 ${
                        active ? "border-gold ring-2 ring-gold" : "border-black/[.07]"
                      }`}
                    >
                      <span className="flex h-12 w-full items-center justify-center">
                        <Image
                          src={b.logo}
                          alt=""
                          width={112}
                          height={48}
                          className="h-full w-full object-contain mix-blend-multiply transition duration-300 group-hover:scale-110"
                        />
                      </span>
                      <span className="text-sm font-semibold text-ink">{b.name}</span>
                      <span className="rounded-full bg-cream px-2 py-0.5 text-[11px] font-medium text-gold-dark">
                        {b.models.length} model{b.models.length === 1 ? "" : "s"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              {brands.length > INITIAL_BRANDS ? (
                <button
                  type="button"
                  onClick={() => setShowAllBrands((v) => !v)}
                  className="text-sm font-semibold text-gold-dark underline-offset-4 hover:underline"
                >
                  {showAllBrands ? "Show fewer brands" : `Show all ${brands.length} brands`}
                </button>
              ) : (
                <span />
              )}
              <button type="button" onClick={() => go(3)} className="text-sm font-medium text-neutral-500 underline-offset-4 hover:text-ink hover:underline">
                My brand isn&apos;t listed — show repairs
              </button>
            </div>
          </section>
        )}

        {/* ── Step 2 · Model ─────────────────────────────────────── */}
        {step === 2 && brand && (
          <section key="s2" className="fade-up" aria-labelledby="step-model">
            <StepTitle id="step-model" n={2} title={`Which ${brand.name} model?`} hint="Search or tap your model — it helps us quote the right parts." />
            <div className="mt-6 rounded-3xl border border-black/[.06] bg-cream/60 p-4 sm:p-6">
              <ModelPicker key={brand.slug} models={brand.models} value={model} onChange={pickModel} label={`${brand.name} models`}
                brand={brand.name}
                meta={`${Number.isFinite(lowest) ? `From ${formatTaka(lowest)} · ` : ""}${repairs.length} repairs`}
              />
            </div>
            <StepNav onBack={() => go(1)} backLabel="Change brand" onSkip={() => go(3)} skipLabel="Not sure? Skip this step" />
          </section>
        )}

        {/* ── Step 3 · Repair ────────────────────────────────────── */}
        {step === 3 && (
          <section key="s3" className="fade-up" aria-labelledby="step-repair">
            <StepTitle
              id="step-repair"
              n={hasBrands ? 3 : 1}
              title={`What needs fixing on your ${device}?`}
              hint="Tap Start Repair on one or more repairs, or pre-book a time slot."
            />
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {repairs.map((r, i) => {
                const price = priceOf(r);
                // Priced from our brand table → the server re-checks it as a phone repair
                const source = table
                  ? { kind: "phone" as const, brand: table.slug, service: r.slug, model: device }
                  : { kind: "category" as const, category: categorySlug, repair: r.slug, model: device };
                const title = `${device} — ${r.name}`;
                return (
                  <li
                    key={r.slug}
                    className="fade-up group relative flex flex-col overflow-hidden rounded-3xl border border-black/[.07] bg-white p-5 transition duration-500 hover:-translate-y-1 hover:border-gold hover:shadow-xl hover:shadow-gold/20"
                    style={{ "--d": `${i * 40}ms` } as React.CSSProperties}
                  >
                    <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />
                    <div className="flex items-start gap-4">
                      <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-cream">
                        <Image
                          src={categoryImage}
                          alt=""
                          width={56}
                          height={56}
                          className="h-full w-full object-contain p-1.5 transition duration-500 group-hover:rotate-[-6deg] group-hover:scale-110"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-ink">{r.name}</span>
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-cream px-2 py-0.5 text-[11px] font-medium text-neutral-600">
                          <ClockIcon className="h-3 w-3" /> {r.time}
                        </span>
                      </span>
                      <span className="text-right">
                        {price ? (
                          <>
                            <span className="block text-[11px] text-neutral-500">from</span>
                            <span className="block text-xl font-bold tracking-tight text-gold-dark">{formatTaka(price)}</span>
                          </>
                        ) : (
                          <span className="rounded-full bg-gold/20 px-2.5 py-1 text-sm font-bold text-gold-dark">Free</span>
                        )}
                      </span>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-2 border-t border-black/[.06] pt-4">
                      <Link
                        href={table && table.models.includes(model) && table.prices[r.slug] !== undefined ? repairPath(table.slug, model, r.slug) : `/categories/${categorySlug}/${r.slug}`}
                        className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 px-3.5 text-xs font-semibold text-ink transition hover:border-gold hover:text-gold-dark"
                      >
                        Read More
                      </Link>
                      <AddToCartButton
                        compact
                        itemKey={table ? `phone:${table.slug}:${r.slug}:${device}` : `category:${categorySlug}:${r.slug}:${device}`}
                        source={source}
                        title={title}
                        subtitle={brand?.name ?? categoryName}
                        price={price}
                        image={categoryImage}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
            {hasBrands && <StepNav onBack={() => go(brand ? 2 : 1)} backLabel={brand ? "Change model" : "Choose brand"} />}
          </section>
        )}
      </div>
    </div>
  );
}

function StepTitle({ id, n, title, hint }: { id: string; n: number; title: string; hint: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/20 text-sm font-bold text-gold-dark">{n}</span>
      <div>
        <h3 id={id} className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
          {title}
        </h3>
        <p className="mt-1 text-sm text-neutral-500">{hint}</p>
      </div>
    </div>
  );
}

function StepNav({
  onBack,
  backLabel,
  onSkip,
  skipLabel,
}: {
  onBack: () => void;
  backLabel: string;
  onSkip?: () => void;
  skipLabel?: string;
}) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-black/[.06] pt-5">
      <button
        type="button"
        onClick={onBack}
        className="group inline-flex h-11 items-center gap-2 rounded-full border border-black/10 px-5 text-sm font-semibold text-ink transition hover:border-gold hover:text-gold-dark"
      >
        <ArrowIcon className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-0.5" /> {backLabel}
      </button>
      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="group inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-gold hover:text-ink"
        >
          {skipLabel} <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
    </div>
  );
}
