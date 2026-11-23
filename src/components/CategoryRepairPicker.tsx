/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ApiProductItem, ApiProductVariantItem, CategoryBrand, CategoryRepair } from "@/lib/api";
import { formatTaka } from "@/lib/format";
import AddToCartButton from "./AddToCartButton";
import { ArrowIcon, CheckIcon } from "./Icons";

type MergedVariant = ApiProductVariantItem & {
  allAttributes: { group: string; value: string }[];
};

type Props = {
  categorySlug: string;
  categoryName: string;
  categoryImage: string;
  brands: CategoryBrand[];
  repairs?: CategoryRepair[];
  brandRepairs?: Record<string, CategoryRepair[]>;
  brandPrices?: Record<string, { slug: string; prices: Partial<Record<string, number>>; models: string[] }>;
};

type Step = 1 | 2 | 3;

const INITIAL_BRANDS = 24;

/**
 * Step-by-step repair flow:
 * Step 1: Brand selection (/categories/{slug}/brands?isCare=1)
 * Step 2: Model / Spare Part selection (/products?isSparePart=1)
 * Step 3: Variant / Options selection (/product-variants/{productUUID}?isSpareParts=1)
 */
export default function CategoryRepairPicker({
  categorySlug,
  categoryName,
  categoryImage,
  brands,
}: Props) {
  const hasBrands = brands.length > 0;
  const [step, setStep] = useState<Step>(1);
  const [brandSlug, setBrandSlug] = useState<string | null>(null);
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Step 2 products state
  const [products, setProducts] = useState<ApiProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ApiProductItem | null>(null);

  // Step 3 variants state
  const [variants, setVariants] = useState<ApiProductVariantItem[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  const top = useRef<HTMLDivElement>(null);

  // Clear any stored device/brand/model data and ensure step is ALWAYS 1 (Brand) on entry
  useEffect(() => {
    setStep(1);
    setBrandSlug(null);
    setSelectedProduct(null);
    setProducts([]);
    setVariants([]);
    setProductSearch("");
    try {
      if (typeof window !== "undefined") {
        const keys = [
          "dc_brand",
          "dc_model",
          "dc_selected_device",
          "dc_repair_step",
          "dc_selected_repair",
          "dc_selected_brand",
          "dc_selected_model",
          "dc_category",
        ];
        for (const k of keys) {
          localStorage.removeItem(k);
          sessionStorage.removeItem(k);
        }
      }
    } catch {}
  }, [categorySlug]);

  const brand = brands.find((b) => b.slug === brandSlug);
  const shownBrands = showAllBrands ? brands : brands.slice(0, INITIAL_BRANDS);

  // 3rd call: /products?brandSlug=${brandSlug}&isSparePart=1 (Step 2 - Model selection)
  useEffect(() => {
    if (!brandSlug) {
      setProducts([]);
      return;
    }
    let active = true;
    setLoadingProducts(true);

    fetch(`/api/products?brandSlug=${encodeURIComponent(brandSlug)}&isSparePart=1`, { cache: "no-store" })
      .then((r) => r.json())
      .then(async (res) => {
        if (!active) return;
        let items = (res.data ?? []) as ApiProductItem[];
        // Fallback: if no items found by brandSlug, check if tagged under subCategorySlug
        if (items.length === 0) {
          try {
            const subRes = await fetch(
              `/api/products?subCategorySlug=${encodeURIComponent(brandSlug)}&isSparePart=1`,
              { cache: "no-store" }
            ).then((r) => r.json());
            if (active && subRes.data && subRes.data.length > 0) {
              items = subRes.data;
            }
          } catch {}
        }
        setProducts(items);
        setLoadingProducts(false);
      })
      .catch(() => {
        if (active) {
          setProducts([]);
          setLoadingProducts(false);
        }
      });

    return () => {
      active = false;
    };
  }, [brandSlug]);

  // 4th call: /product-variants/{productUUID}?isSpareParts=1 (Step 3 - Variants selection)
  useEffect(() => {
    if (!selectedProduct?.productUuid) {
      setVariants([]);
      return;
    }
    let active = true;
    setLoadingVariants(true);

    fetch(
      `/api/product-variants/${encodeURIComponent(selectedProduct.productUuid)}?isSpareParts=1`,
      { cache: "no-store" }
    )
      .then((r) => r.json())
      .then((res) => {
        if (!active) return;
        const items = (res.data ?? []) as ApiProductVariantItem[];
        setVariants(items);
        setLoadingVariants(false);
      })
      .catch(() => {
        if (active) {
          setVariants([]);
          setLoadingVariants(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedProduct?.productUuid]);

  // Deduplicate variants by variantUuid and merge their attributes (Color, Storage, Network, etc.)
  const deduplicatedVariants = useMemo(() => {
    const map = new Map<string, MergedVariant>();
    for (const v of variants) {
      const existing = map.get(v.variantUuid);
      if (!existing) {
        map.set(v.variantUuid, {
          ...v,
          allAttributes: [{ group: v.attributeGroup, value: v.attribute }],
        });
      } else {
        if (!existing.allAttributes.some((a) => a.group === v.attributeGroup && a.value === v.attribute)) {
          existing.allAttributes.push({ group: v.attributeGroup, value: v.attribute });
        }
      }
    }
    return Array.from(map.values());
  }, [variants]);

  // Filter products by search input
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase().trim();
    return products.filter((p) => p.productName.toLowerCase().includes(q));
  }, [products, productSearch]);

  // Lowest price computation
  const variantPrices = deduplicatedVariants.map((v) => v.retailUnitSale).filter((p) => p > 0);
  const lowestPrice = variantPrices.length
    ? Math.min(...variantPrices)
    : selectedProduct?.discountedPrice
      ? selectedProduct.discountedPrice
      : selectedProduct?.regularPrice ?? 0;

  const currentDeviceName =
    selectedProduct?.productName ||
    (brand ? `${brand.name} ${categoryName}` : categoryName);

  const go = (next: Step) => {
    setStep(next);
    // Scroll after state update — use a small delay so the new step renders first
    setTimeout(() => {
      const el = top.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Only scroll if the top of the picker is off-screen
      if (rect.top < 0 || rect.top > 120) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const pickBrand = (slug: string) => {
    setBrandSlug(slug);
    setSelectedProduct(null);
    setProductSearch("");
    go(2);
  };

  const pickProduct = (product: ApiProductItem) => {
    setSelectedProduct(product);
    go(3);
  };

  const steps = [
    { n: 1 as Step, label: "Brand", value: brand?.name },
    { n: 2 as Step, label: "Model", value: selectedProduct?.productName },
    { n: 3 as Step, label: "Option / Repair", value: undefined },
  ];


  console.log(selectedProduct, "selectedProductselectedProduct")

  return (
    <div
      ref={top}
      className="scroll-mt-24 overflow-hidden rounded-[2rem] border border-black/[.06] bg-white shadow-2xl shadow-gold/10"
    >
      {/* ── Stepper ─────────────────────────────────────────────── */}
      {hasBrands && (
        <div className="relative overflow-hidden bg-ink px-5 py-6 sm:px-8">
          <div aria-hidden="true" className="glow pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full" />
          <ol className="relative grid grid-cols-3 gap-2">
            <span aria-hidden="true" className="absolute left-[16.6%] right-[16.6%] top-5 h-0.5 bg-white/15" />
            <span
              aria-hidden="true"
              className="absolute left-[16.6%] top-5 h-0.5 bg-gold transition-all duration-500"
              style={{ width: `${((step - 1) / 2) * 66.8}%` }}
            />
            {steps.map((s) => {
              const done = step > s.n;
              const active = step === s.n;
              const reachable = s.n === 1 || (s.n === 2 && !!brand) || (s.n === 3 && !!selectedProduct);
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
                  <span
                    className={`mt-2 text-xs font-semibold uppercase tracking-[0.15em] ${
                      active || done ? "text-gold" : "text-white/50"
                    }`}
                  >
                    {s.label}
                  </span>
                  <span className="mt-0.5 line-clamp-1 max-w-full px-1 text-[11px] text-white/70">
                    {s.value ?? " "}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* ── Your device summary ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 border-b border-black/[.06] bg-cream px-5 py-4 sm:px-8">
        <span className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-sm">
          {selectedProduct?.thumbnails?.mediaFileUrl ? (
            <Image
              src={selectedProduct.thumbnails.mediaFileUrl}
              alt=""
              width={56}
              height={56}
              className="h-full w-full object-contain p-1"
            />
          ) : brand ? (
            <Image
              src={brand.logo}
              alt=""
              width={56}
              height={56}
              className="h-full w-full object-contain p-2 mix-blend-multiply"
            />
          ) : (
            <Image
              src={categoryImage}
              alt=""
              width={56}
              height={56}
              className="h-full w-full object-contain p-1"
            />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold uppercase tracking-[0.15em] text-gold-dark">
            Your device
          </span>
          <span className="block truncate text-base font-bold text-ink sm:text-lg">
            {currentDeviceName}
          </span>
        </span>
        {lowestPrice > 0 && (
          <span className="w-full rounded-full bg-white px-3 py-1.5 text-center text-xs font-semibold text-ink shadow-sm sm:w-auto">
            From <span className="text-gold-dark">{formatTaka(lowestPrice)}</span>
          </span>
        )}
      </div>

      <div className="p-5 sm:p-8">
        {/* ── Step 1 · Brand ─────────────────────────────────────── */}
        {step === 1 && (
          <section key="s1" className="fade-up" aria-labelledby="step-brand">
            <StepTitle
              id="step-brand"
              n={1}
              title={`Which ${categoryName.toLowerCase()} brand do you have?`}
              hint="Tap your brand to continue."
            />
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {shownBrands.map((b, i) => {
                const active = b.slug === brandSlug;
                return (
                  <li key={b.slug} className="fade-up" style={{ "--d": `${i * 30}ms` } as React.CSSProperties}>
                    <button
                      type="button"
                      onClick={() => pickBrand(b.slug)}
                      onTouchEnd={(e) => { e.preventDefault(); pickBrand(b.slug); }}
                      aria-pressed={active}
                      className={`group relative flex h-full w-full flex-col items-center gap-2 rounded-2xl border bg-white p-4 transition duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-xl hover:shadow-gold/20 ${
                        active ? "border-gold ring-2 ring-gold" : "border-black/[.07]"
                      }`}
                    >
                      <span className="relative grid h-16 w-16 place-items-center overflow-hidden rounded-xl bg-cream p-2">
                        {b.logo ? (
                          <Image
                            src={b.logo}
                            alt={b.name}
                            width={64}
                            height={64}
                            className="h-full w-full object-contain mix-blend-multiply transition duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <span className="text-base font-bold text-ink/70">
                            {b.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </span>
                      <span className="text-sm font-semibold text-ink">{b.name}</span>
                      {b.models && b.models.length > 0 && (
                        <span className="text-xs text-neutral-400">{b.models.length} models</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            {brands.length > INITIAL_BRANDS && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setShowAllBrands((v) => !v)}
                  className="text-sm font-semibold text-gold-dark underline-offset-4 hover:underline"
                >
                  {showAllBrands ? "Show fewer brands" : `Show all ${brands.length} brands`}
                </button>
              </div>
            )}
          </section>
        )}

        {/* ── Step 2 · Model / Product (/products?isSparePart=1) ──── */}
        {step === 2 && brand && (
          <section key="s2" className="fade-up" aria-labelledby="step-model">
            <StepTitle
              id="step-model"
              n={2}
              title={`Which ${brand.name} model?`}
              hint="Search or tap your model to view available repair parts and options."
            />

            {/* Search filter bar */}
            <div className="mt-5">
              <div className="relative max-w-md">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder={`Search ${brand.name} models...`}
                  className="w-full rounded-2xl border border-black/10 bg-cream/50 px-4 py-3 pl-11 text-sm font-medium text-ink placeholder-neutral-400 focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/30"
                />
                <svg
                  className="absolute left-4 top-3.5 h-4 w-4 text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                {productSearch && (
                  <button
                    type="button"
                    onClick={() => setProductSearch("")}
                    className="absolute right-3.5 top-3.5 text-xs font-semibold text-neutral-400 hover:text-ink"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {loadingProducts ? (
              <div className="py-16 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
                <p className="mt-4 text-sm font-medium text-neutral-600">
                  Loading {brand.name} models from live API...
                </p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map((p, i) => {
                  const price = p.discountedPrice > 0 ? p.discountedPrice : p.regularPrice;
                  const img = p.thumbnails?.mediaFileUrl || brand.logo || categoryImage;
                  return (
                    <li
                      key={p.productUuid}
                      className="fade-up"
                      style={{ "--d": `${Math.min(i, 30) * 20}ms` } as React.CSSProperties}
                    >
                      <button
                        type="button"
                        onClick={() => pickProduct(p)}
                        onTouchEnd={(e) => { e.preventDefault(); pickProduct(p); }}
                        className="group flex h-full w-full flex-col justify-between rounded-2xl border border-black/[.07] bg-white p-4 text-left transition duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-xl hover:shadow-gold/20"
                      >
                        <div>
                          <span className="relative block aspect-square w-full overflow-hidden rounded-xl bg-cream p-3">
                            <Image
                              src={img}
                              alt={p.productName}
                              width={120}
                              height={120}
                              className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                            />
                          </span>
                          <h4 className="mt-3 line-clamp-2 text-sm font-semibold text-ink group-hover:text-gold-dark">
                            {p.productName}
                          </h4>
                        </div>
                        {/* <div className="mt-3 flex items-center justify-between border-t border-black/[.05] pt-2.5">
                          {price > 0 ? (
                            <span className="text-xs font-bold text-gold-dark">
                              From {formatTaka(price)}
                            </span>
                          ) : (
                            <span className="text-xs text-neutral-400">View parts</span>
                          )}
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500 group-hover:text-gold-dark">
                            Select <ArrowIcon className="h-3 w-3" />
                          </span>
                        </div> */}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="rounded-2xl border border-black/[.06] bg-cream/40 p-8 text-center mt-6">
                <p className="text-sm font-medium text-neutral-600">
                  {productSearch
                    ? `No models matching "${productSearch}" found.`
                    : `No models currently listed for ${brand.name}.`}
                </p>
                {productSearch ? (
                  <button
                    type="button"
                    onClick={() => setProductSearch("")}
                    className="mt-3 text-xs font-semibold text-gold-dark underline"
                  >
                    Clear search filter
                  </button>
                ) : (
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setLoadingProducts(true);
                        fetch(`/api/products?isSparePart=1`, { cache: "no-store" })
                          .then((r) => r.json())
                          .then((res) => {
                            setProducts((res.data ?? []) as ApiProductItem[]);
                            setLoadingProducts(false);
                          })
                          .catch(() => setLoadingProducts(false));
                      }}
                      className="rounded-full bg-gold px-4 py-2 text-xs font-bold text-ink shadow-sm hover:bg-gold/90 transition"
                    >
                      Browse all available repair models
                    </button>
                    <button
                      type="button"
                      onClick={() => go(1)}
                      className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-ink hover:border-gold transition"
                    >
                      Choose another brand
                    </button>
                  </div>
                )}
              </div>
            )}

            <StepNav onBack={() => go(1)} backLabel="Change Brand" />
          </section>
        )}

        {/* ── Step 3 · Variants & Options (/product-variants/{uuid}?isSpareParts=1) ──── */}
        {step === 3 && selectedProduct && (
          <section key="s3" className="fade-up" aria-labelledby="step-repair">
            <StepTitle
              id="step-repair"
              n={3}
              title={`Available Options & Parts for ${selectedProduct.productName}`}
              hint="All options, specifications and prices loaded directly from the live API."
            />

            {loadingVariants ? (
              <div className="py-16 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
                <p className="mt-4 text-sm font-medium text-neutral-600">
                  Loading live API options for {selectedProduct.productName}...
                </p>
              </div>
            ) : deduplicatedVariants.length > 0 ? (
              <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5">
                {deduplicatedVariants.map((v, i) => {
                  const discountPercent =
                    v.mrpUnitSale > v.retailUnitSale
                      ? Math.round(((v.mrpUnitSale - v.retailUnitSale) / v.mrpUnitSale) * 100)
                      : 0;
                  const discountAmount =
                    v.mrpUnitSale > v.retailUnitSale ? v.mrpUnitSale - v.retailUnitSale : 0;

                  return (
                    <li
                      key={v.variantUuid}
                      className="fade-up group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-black/[.08] bg-white p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-2xl hover:shadow-gold/20"
                      style={{ "--d": `${i * 30}ms` } as React.CSSProperties}
                    >
                      {/* Top decorative accent bar on hover */}
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 top-0 h-1.5 origin-left scale-x-0 bg-gradient-to-r from-gold via-gold-dark to-gold transition-transform duration-500 group-hover:scale-x-100"
                      />

                      <div>
                        {/* Header: Thumbnail + Title + Attribute Pills */}
                        <div className="flex items-start gap-4 sm:gap-5">
                          {/* High-res Thumbnail */}
                          <div className="relative grid h-24 w-24 sm:h-28 sm:w-28 shrink-0 place-items-center overflow-hidden rounded-2xl border border-black/[.06] bg-cream/50 p-2 shadow-inner transition duration-500 group-hover:scale-105">
                            <Image
                              src={
                                v.thumbnailUrl ||
                                selectedProduct.thumbnails?.mediaFileUrl ||
                                brand?.logo ||
                                categoryImage
                              }
                              alt={v.variantName}
                              width={112}
                              height={112}
                              className="h-full w-full object-contain mix-blend-multiply transition duration-500 group-hover:rotate-[-4deg]"
                            />
                            {discountPercent > 0 && (
                              <span className="absolute bottom-1.5 right-1.5 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                                {discountPercent}% OFF
                              </span>
                            )}
                          </div>

                          {/* Title & Attributes */}
                          <div className="min-w-0 flex-1">
                            <h4 className="text-base font-bold text-ink transition-colors duration-200 group-hover:text-gold-dark sm:text-lg line-clamp-2">
                              {v.variantName}
                            </h4>

                            {/* Attribute Pills (Color, Storage, Region, etc.) */}
                            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                              {v.allAttributes.map((attr, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold-dark"
                                >
                                  <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                                    {attr.group}:
                                  </span>
                                  <span>{attr.value}</span>
                                </span>
                              ))}

                              {/* Stock status indicator */}
                              {v.isActive ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  In Stock
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/60 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                  Available to Order
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom: Price + Action Button */}
                      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-black/[.06] pt-4">
                        <div>
                          <span className="block text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                            Repair / Part Price
                          </span>
                          <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-2xl font-extrabold tracking-tight text-ink">
                              {formatTaka(v.retailUnitSale)}
                            </span>
                            {v.mrpUnitSale > v.retailUnitSale && (
                              <span className="text-sm font-medium text-neutral-400 line-through">
                                {formatTaka(v.mrpUnitSale)}
                              </span>
                            )}
                          </div>
                          {discountAmount > 0 && (
                            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">
                              Save {formatTaka(discountAmount)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <AddToCartButton
                            itemKey={`variant:${v.variantUuid}`}
                            source={{
                              kind: "category",
                              category: categorySlug,
                              repair: v.variantUuid,
                              model: selectedProduct.productName,
                            }}
                            title={v.variantName}
                            subtitle={brand?.name ?? categoryName}
                            price={v.retailUnitSale}
                            image={
                              v.thumbnailUrl ||
                              selectedProduct.thumbnails?.mediaFileUrl ||
                              categoryImage
                            }
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="mt-6 rounded-3xl border border-black/[.08] bg-cream/40 p-6 sm:p-8">
                {/* Example preview */}
                <div className="mb-5 flex items-center gap-2">
                  <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-xs font-semibold text-gold-dark">Example</span>
                  <span className="text-xs text-neutral-400">This is how repair options appear when available</span>
                </div>
                <div className="pointer-events-none select-none opacity-50 mb-6">
                  <div className="flex items-start gap-4 rounded-2xl border border-black/[.07] bg-white p-4">
                    <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-cream">
                      <svg className="h-10 w-10 text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="h-4 w-40 rounded bg-neutral-200" />
                      <div className="mt-2 flex gap-2">
                        <div className="h-5 w-16 rounded-full bg-gold/20" />
                        <div className="h-5 w-12 rounded-full bg-emerald-100" />
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-black/[.05] pt-3">
                        <div>
                          <div className="h-3 w-16 rounded bg-neutral-200" />
                          <div className="mt-1 h-6 w-24 rounded bg-neutral-200" />
                        </div>
                        <div className="h-9 w-24 rounded-full bg-ink/10" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-black/[.06] mb-6" />

                {/* Message */}
                <div className="text-center">
                  <h4 className="text-base font-bold text-ink">No options found</h4>
                  <p className="mt-1.5 text-sm text-neutral-500 max-w-xs mx-auto">
                    No spare parts or repair options are listed for{" "}
                    <span className="font-medium text-ink">{selectedProduct.productName}</span> yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => go(2)}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-bold text-ink shadow-sm hover:bg-gold/90 transition"
                  >
                    <ArrowIcon className="rotate-180 h-3.5 w-3.5" /> Choose another model
                  </button>
                </div>
              </div>
            )}

            <StepNav onBack={() => go(2)} backLabel="Change Model" />
          </section>
        )}
      </div>
    </div>
  );
}

function StepTitle({
  id,
  n,
  title,
  hint,
}: {
  id: string;
  n: number;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/20 text-sm font-bold text-gold-dark">
        {n}
      </span>
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
        className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-ink transition hover:text-gold-dark"
      >
        <ArrowIcon className="rotate-180 h-3.5 w-3.5 shrink-0" /> {backLabel}
      </button>
      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500 hover:text-ink"
        >
          {skipLabel}
        </button>
      )}
    </div>
  );
}
