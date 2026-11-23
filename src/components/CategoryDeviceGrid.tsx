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
  } catch {
    // Ignore storage access errors
  }
}

export default function CategoryDeviceGrid({ categories, limit }: CategoryDeviceGridProps) {
  useEffect(() => {
    clearDeviceStorage();
  }, []);

  const displayed = limit && limit > 0 ? categories.slice(0, limit) : categories;

  return (
    <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {displayed.map((c, i) => (
        <li key={c.uuid} className="reveal">
          <Link
            href={`/categories/${c.slug}`}
            onClick={clearDeviceStorage}
            className="spotlight card-lift group flex h-full flex-col items-center overflow-hidden rounded-3xl border border-black/[.06] bg-cream p-4 text-center sm:p-5 transition duration-500 hover:-translate-y-1 hover:border-gold hover:shadow-xl hover:shadow-gold/15"
            style={{ "--d": `${i * 40}ms` } as React.CSSProperties}
          >
            <span className="relative block aspect-square w-full">
              <Image
                src={c.image}
                alt={`${c.name} repair`}
                width={150}
                height={150}
                className="h-full w-[70%] m-auto object-contain drop-shadow-xl transition duration-700 ease-out group-hover:-translate-y-2 group-hover:rotate-[-4deg] group-hover:scale-110"
              />
            </span>
            <span className="mt-3 text-base font-semibold text-ink">{c.name}</span>
            <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-neutral-500 transition-colors group-hover:text-gold-dark">
              View repairs
              <ArrowIcon className="h-3 w-3 -translate-x-1 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
