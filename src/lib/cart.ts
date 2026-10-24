"use client";

import { useSyncExternalStore } from "react";
import type { CartRef } from "./data";

export type CartItem = {
  key: string;
  source: CartRef;
  title: string;
  subtitle?: string;
  price: number;
  image?: string;
};

const KEY = "dc_cart_v1";
const EMPTY: CartItem[] = [];
const listeners = new Set<() => void>();
let cache: CartItem[] | null = null;

function read(): CartItem[] {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(parsed) ? parsed : [];
  } catch {
    cache = [];
  }
  return cache!;
}

function write(items: CartItem[]) {
  cache = items;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable — keep in memory */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export const useCart = () => useSyncExternalStore(subscribe, read, () => EMPTY);

export const cart = {
  add(item: CartItem) {
    const items = read();
    if (items.some((i) => i.key === item.key)) return false;
    write([...items, item]);
    return true;
  },
  remove(key: string) {
    write(read().filter((i) => i.key !== key));
  },
  clear() {
    write([]);
  },
};

// ---- cart drawer open/close (shared by every "Start Repair" button and the header) ----
let drawerOpen = false;
const drawerListeners = new Set<() => void>();
const setDrawer = (open: boolean) => {
  drawerOpen = open;
  drawerListeners.forEach((l) => l());
};
const subscribeDrawer = (l: () => void) => {
  drawerListeners.add(l);
  return () => {
    drawerListeners.delete(l);
  };
};

export const cartDrawer = { open: () => setDrawer(true), close: () => setDrawer(false) };
export const useCartDrawer = () => useSyncExternalStore(subscribeDrawer, () => drawerOpen, () => false);

/** Signed-in hint from the display cookie (the server re-checks the real session). */
export const isSignedInHint = () => /(?:^|;\s*)dc_user=[^;]+/.test(document.cookie);

// ---- applied coupon (validated again on the server at booking time) ----
export type AppliedCoupon = { code: string; discount: number; label: string };
const COUPON_KEY = "dc_coupon_v1";
const couponListeners = new Set<() => void>();
let couponCache: AppliedCoupon | null | undefined;

function readCoupon(): AppliedCoupon | null {
  if (couponCache !== undefined) return couponCache;
  try {
    couponCache = JSON.parse(localStorage.getItem(COUPON_KEY) ?? "null");
  } catch {
    couponCache = null;
  }
  return couponCache ?? null;
}

export const couponStore = {
  set(c: AppliedCoupon | null) {
    couponCache = c;
    try {
      if (c) localStorage.setItem(COUPON_KEY, JSON.stringify(c));
      else localStorage.removeItem(COUPON_KEY);
    } catch {
      /* storage unavailable */
    }
    couponListeners.forEach((l) => l());
  },
};

export const useCoupon = () =>
  useSyncExternalStore(
    (l) => {
      couponListeners.add(l);
      return () => {
        couponListeners.delete(l);
      };
    },
    readCoupon,
    () => null,
  );

/** Tell the header (and anything else) that the signed-in state changed without a navigation. */
export const notifyAuthChange = () => window.dispatchEvent(new Event("dc-auth"));
