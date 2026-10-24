"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { formatTaka } from "@/lib/format";
import { repairPath } from "@/lib/slug";
import { search, type SearchIndex } from "@/lib/search";
import AddToCartButton from "./AddToCartButton";
import { ArrowIcon, ServiceIcon } from "./Icons";

let indexPromise: Promise<SearchIndex> | null = null;
/** Fetched once per page load, on first open — keeps it out of every page's HTML. */
const loadIndex = () => (indexPromise ??= fetch("/api/search-index").then((r) => r.json() as Promise<SearchIndex>));

const searchIcon = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4.3-4.3" />
  </svg>
);

/** Header search: categories on the left, model × repair cards on the right. */
export default function SearchBox() {
  // Remember which page the panel was opened on — navigating away closes it without an effect
  const [openOn, setOpenOn] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const deferred = useDeferredValue(query);
  const input = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const open = openOn === pathname;
  const setOpen = (v: boolean) => setOpenOn(v ? pathname : null);

  const openSearch = () => {
    setOpen(true);
    loadIndex().then(setIndex).catch(() => (indexPromise = null));
    requestAnimationFrame(() => input.current?.focus());
  };

  // close on Escape and outside click (listeners removed on close/unmount)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    const onDown = (e: PointerEvent) => {
      if (panel.current && !panel.current.contains(e.target as Node)) setOpenOn(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const result = index ? search(index, deferred, 9) : null;
  const viewAll = `/search?q=${encodeURIComponent(query.trim())}`;

  return (
    <div ref={panel} className="relative">
      {/* trigger: pill on desktop, icon on mobile */}
      <button
        type="button"
        onClick={openSearch}
        aria-label="Search repairs"
        className="hidden h-11 w-56 items-center gap-2 rounded-full border border-black/10 bg-cream px-4 text-sm text-neutral-500 transition hover:border-gold lg:flex xl:w-48 2xl:w-64"
      >
        {searchIcon} Search repairs…
      </button>
      <button
        type="button"
        onClick={openSearch}
        aria-label="Search repairs"
        className="grid h-11 w-11 place-items-center rounded-full border border-black/10 text-ink transition hover:border-gold hover:text-gold-dark lg:hidden"
      >
        {searchIcon}
      </button>

      {open && (
        <div className="fade-up fixed inset-x-2 top-[4.5rem] z-50 mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] border border-black/[.06] bg-white shadow-2xl shadow-black/15 sm:inset-x-4 xl:top-20">
          <form
            role="search"
            className="flex items-center gap-2 border-b border-black/[.06] p-3 sm:p-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) router.push(viewAll);
            }}
          >
            <div className="flex flex-1 items-center rounded-full border-2 border-gold bg-white pl-4">
              <input
                ref={input}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your device or repair — e.g. “iPhone 14 display”"
                aria-label="Search repairs"
                className="h-11 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-neutral-400"
              />
              <button type="submit" aria-label="Search" className="m-1 grid h-9 w-11 place-items-center rounded-full bg-gold text-ink transition hover:bg-ink hover:text-white">
                {searchIcon}
              </button>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="px-2 text-sm font-semibold text-neutral-500 hover:text-ink">
              Close
            </button>
          </form>

          <div className="grid max-h-[70vh] overflow-y-auto md:grid-cols-[220px_1fr]">
            <aside className="border-b border-black/[.06] p-5 md:border-b-0 md:border-r">
              <p className="text-lg font-bold text-ink">Categories</p>
              <ul className="mt-3 flex flex-wrap gap-2 md:flex-col md:gap-0">
                {(result?.categories ?? []).slice(0, 12).map((c) => (
                  <li key={c.href}>
                    <Link href={c.href} className="block rounded-full bg-cream px-3 py-1.5 text-sm text-neutral-700 hover:text-gold-dark md:rounded-lg md:bg-transparent md:px-0 md:py-1.5">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>

            <section className="p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-lg font-bold text-ink">Services</p>
                {query.trim() && (result?.total ?? 0) > 0 && (
                  <Link href={viewAll} className="inline-flex items-center gap-1 text-sm font-semibold text-gold-dark hover:gap-2">
                    View all {result?.total} results <ArrowIcon className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>

              {!index ? (
                <p className="mt-6 text-sm text-neutral-500">Loading…</p>
              ) : !query.trim() ? (
                <p className="mt-6 text-sm text-neutral-500">Type a model (iPhone 14, Galaxy S24…) or a repair (display, battery…).</p>
              ) : result && result.hits.length === 0 ? (
                <p className="mt-6 text-sm text-neutral-500">
                  No repairs match “{query}”. Try a shorter word, or{" "}
                  <Link href="/contact" className="font-semibold text-gold-dark underline">ask us</Link>.
                </p>
              ) : (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {result?.hits.map((h) => (
                    <li
                      key={`${h.brand}-${h.model}-${h.service.slug}`}
                      className="flex flex-col items-center rounded-2xl border border-black/[.07] p-4 text-center transition hover:border-gold hover:shadow-lg hover:shadow-gold/15"
                    >
                      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-cream text-gold-dark">
                        <ServiceIcon name={h.service.icon} className="h-8 w-8" />
                      </span>
                      <p className="mt-3 flex-1 text-sm font-medium leading-snug text-ink">
                        {h.model} {h.service.name}
                      </p>
                      <p className="mt-1 font-bold text-gold-dark">{formatTaka(h.price)}</p>
                      <div className="mt-3 grid w-full grid-cols-2 gap-2">
                        <AddToCartButton
                          compact
                          itemKey={`phone:${h.brand}:${h.service.slug}:${h.model}`}
                          source={{ kind: "phone", brand: h.brand, service: h.service.slug, model: h.model }}
                          title={`${h.model} — ${h.service.name}`}
                          subtitle={h.model}
                          price={h.price}
                        />
                        <Link
                          href={repairPath(h.brand, h.model, h.service.slug)}
                          className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 text-xs font-semibold text-ink transition hover:border-gold hover:text-gold-dark"
                        >
                          Read More
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
