"use client";

import { useId, useState } from "react";

type Props = {
  models: string[];
  value: string;
  onChange: (model: string) => void;
  /** Visual theme: "dark" for the ink price-checker band, "light" elsewhere */
  tone?: "dark" | "light";
  label?: string;
  /** Short info line under every model, e.g. "From ৳1,500 · 10 repairs" */
  meta?: string;
  /** Brand name, dropped from the card text ("Samsung Galaxy Tab S10" → "Galaxy Tab S10") */
  brand?: string;
};

const INITIAL = 8;

// "iPhone 16 Pro Max" → "iPhone 16", "Galaxy S24 Ultra" → "Galaxy S24"
const VARIANT = /\s+(pro\s*max|pro\+?|max|plus|\+|mini|ultra|fe|lite|neo|edge|[45]g)$/i;
function seriesOf(model: string) {
  let s = model.trim();
  for (let prev = ""; prev !== s; ) {
    prev = s;
    s = s.replace(VARIANT, "");
  }
  return s;
}

/** Group models by series, keeping the original (newest-first) order. */
function group(models: string[]) {
  const map = new Map<string, string[]>();
  for (const m of models) {
    const key = seriesOf(m);
    map.set(key, [...(map.get(key) ?? []), m]);
  }
  return [...map];
}

function Glyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="6" y="2.5" width="12" height="19" rx="2.6" />
      <path d="M10.5 5h3" strokeLinecap="round" />
      <circle cx="12" cy="18.3" r=".7" fill="currentColor" />
    </svg>
  );
}

function Chevron({ up }: { up?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 transition ${up ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Model chooser: search box + models as informative cards, grouped by series
 * (iPhone 16 → 16, 16 Plus, 16 Pro, 16 Pro Max). The newest models show first, the
 * rest behind "See all". Users can also type a model that isn't listed.
 */
export default function ModelPicker({ models, value, onChange, tone = "light", label = "Select your model", meta, brand }: Props) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const inputId = useId();
  const listId = useId();
  const dark = tone === "dark";

  const prefix = brand ? new RegExp(`^${brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+`, "i") : null;
  const display = (m: string) => (prefix ? m.replace(prefix, "") : m);

  const q = query.trim().toLowerCase();
  const matches = q ? models.filter((m) => m.toLowerCase().includes(q)) : models;
  const collapsible = !q && matches.length > INITIAL;
  const visible = collapsible && !expanded ? matches.slice(0, INITIAL) : matches;
  const groups = group(visible);
  const canUseCustom = q.length > 1 && !models.some((m) => m.toLowerCase() === q);
  const muted = dark ? "text-white/55" : "text-neutral-500";

  const card = (active: boolean) =>
    `group/m relative flex w-full items-center gap-3 overflow-hidden rounded-2xl p-3 text-left transition duration-300 ${
      active
        ? "bg-gradient-to-br from-gold to-gold-light text-ink shadow-lg shadow-gold/30 ring-2 ring-gold"
        : dark
          ? "border border-white/10 bg-white/[.04] text-white hover:-translate-y-0.5 hover:border-gold hover:bg-white/[.07]"
          : "border border-black/[.07] bg-white text-ink hover:-translate-y-0.5 hover:border-gold/70 hover:shadow-lg hover:shadow-gold/15"
    }`;

  const tile = (active: boolean) =>
    `grid h-12 w-10 shrink-0 place-items-center rounded-xl transition duration-300 ${
      active ? "bg-ink text-gold" : dark ? "bg-white/10 text-gold" : "bg-cream text-gold-dark group-hover/m:scale-110 group-hover/m:bg-gold/20"
    }`;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={inputId} className={`text-xs font-semibold uppercase tracking-[0.18em] ${dark ? "text-gold" : "text-gold-dark"}`}>
          {label}
        </label>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${dark ? "bg-white/10 text-white/70" : "bg-white text-neutral-600 shadow-sm"}`}>
          {models.length} model{models.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="relative mt-3">
        <svg
          viewBox="0 0 24 24"
          className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${dark ? "text-white/50" : "text-neutral-400"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="6.5" />
          <path d="M20 20l-4.3-4.3" />
        </svg>
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search your model, e.g. "${display(models[0] ?? "iPhone 15")}"`}
          autoComplete="off"
          className={`h-12 w-full rounded-full pl-11 pr-4 text-sm outline-none transition focus:ring-4 focus:ring-gold/25 ${
            dark
              ? "border border-white/15 bg-white/10 text-white placeholder:text-white/45 focus:border-gold"
              : "border border-black/10 bg-white text-ink shadow-sm placeholder:text-neutral-400 focus:border-gold"
          }`}
        />
      </div>

      <div id={listId} role="listbox" aria-label={label} className="mt-5 space-y-5">
        {groups.map(([series, list]) => (
          <div key={series} role="group" aria-label={series}>
            {groups.length > 1 && (
              <p className={`mb-2.5 flex items-center gap-2 text-xs font-semibold ${dark ? "text-white/80" : "text-ink"}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
                {display(series)}
                <span className={`font-normal ${muted}`}>
                  · {list.length} model{list.length === 1 ? "" : "s"}
                </span>
                <span className={`h-px flex-1 ${dark ? "bg-white/10" : "bg-black/[.06]"}`} />
              </p>
            )}
            <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {list.map((m) => {
                const active = m === value;
                return (
                  <button key={m} type="button" role="option" aria-selected={active} onClick={() => onChange(m)} className={card(active)} title={m}>
                    <span className={tile(active)}>
                      <Glyph className="h-6 w-6" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-sm font-semibold leading-snug">{display(m)}</span>
                      <span className={`mt-0.5 block truncate text-[11px] ${active ? "text-ink/70" : muted}`}>{meta ?? "Free diagnosis"}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition ${
                        active ? "border-ink bg-ink text-gold" : dark ? "border-white/20" : "border-black/15 group-hover/m:border-gold"
                      }`}
                    >
                      {active && (
                        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3.5">
                          <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {canUseCustom && (
          <button type="button" onClick={() => onChange(query.trim())} className={`${card(false)} max-w-sm border-dashed`}>
            <span className={`${tile(false)} text-lg font-bold`}>+</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">Use “{query.trim()}”</span>
              <span className={`block text-[11px] ${muted}`}>Not listed? We repair it too</span>
            </span>
          </button>
        )}
        {q && matches.length === 0 && !canUseCustom && <p className={`py-2 text-sm ${muted}`}>No model found.</p>}
      </div>

      {collapsible && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={listId}
            onClick={() => setExpanded((v) => !v)}
            className={`inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 ${
              dark
                ? "border border-white/15 text-white hover:border-gold hover:text-gold"
                : "border border-black/10 bg-white text-ink shadow-sm hover:border-gold hover:shadow-md hover:shadow-gold/20"
            }`}
          >
            {expanded ? "See less" : `See all ${matches.length} models`}
            <Chevron up={expanded} />
          </button>
        </div>
      )}
    </div>
  );
}
