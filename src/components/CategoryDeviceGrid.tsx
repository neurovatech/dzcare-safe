"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/Icons";
import type { Category } from "@/lib/api";

type CategoryDeviceGridProps = {
  categories: Category[];
  limit?: number;
};

// Helper to clear all device, brand, model, and repair state from storage
function clearDeviceStorage() {
  try {
    if (typeof window === "undefined") return;
    const keysToRemove = [
      "dc_brand",
      "dc_model",
      "dc_selected_device",
      "dc_repair_step",
      "dc_selected_repair",
      "dc_selected_brand",
      "dc_selected_model",
      "dc_category",
    ];
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  } catch (err) {
    // Ignore storage access errors
  }
}

export default function CategoryDeviceGrid({
  categories,
  limit,
}: CategoryDeviceGridProps) {
  // Whenever the user visits or enters the "Choose your device" section, clear storage
  // so that navigating to any category ALWAYS starts fresh from Step 1 (Brand)
  useEffect(() => {
    clearDeviceStorage();
  }, []);

  const displayed =
    limit && limit > 0 ? categories.slice(0, limit) : categories;

  return (
    <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {displayed.map((c, i) => (
        <li key={c.uuid} className="reveal">
          <Link
  href={`/categories/${c.slug}`}
  onClick={clearDeviceStorage}
  className="spotlight card-lift group flex h-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-black/[.06] bg-cream p-3 text-center sm:p-4 transition duration-500 hover:-translate-y-1 hover:border-gold hover:shadow-xl hover:shadow-gold/15"
  style={{ "--d": `${i * 40}ms` } as React.CSSProperties}
>
  <Image
    src={c.image}
    alt={`${c.name} repair`}
    width={150}
    height={150}
    className="h-auto w-[65%] object-contain drop-shadow-xl transition duration-700 ease-out group-hover:-translate-y-2 group-hover:rotate-[-4deg] group-hover:scale-110"
  />
  <span className="mt-2 text-base font-semibold leading-tight text-ink">{c.name}</span>
  <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 transition-colors group-hover:text-gold-dark">
    View repairs
    <ArrowIcon className="h-3 w-3 -translate-x-1 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
  </span>
</Link>
        </li>
      ))}
    </ul>
  );
}
