"use server";

import { randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { after } from "next/server";
import { areas, isValidDistrict } from "@/lib/bd-locations";
import { getSession } from "@/lib/auth/session";
import { createOrder, findUserById, updateUser, type OrderItem } from "@/lib/auth/store";
import { applyCoupon } from "@/lib/coupons";
import { cartKey, resolveCartRef, type CartRef } from "@/lib/data";
import { site } from "@/lib/site";
import { contextFromHeaders, newEventId, normalizePhone, sendGa4Event, sendMetaEvent } from "@/lib/tracking/server";

const str = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Server-side price check for the items in the browser cart (prices are never trusted from the client). */
function priceItems(refs: unknown): OrderItem[] {
  if (!Array.isArray(refs)) return [];
  const items: OrderItem[] = [];
  for (const ref of refs.slice(0, 20)) {
    const resolved = ref && typeof ref === "object" ? resolveCartRef(ref as CartRef) : null;
    if (resolved) items.push({ key: cartKey(ref as CartRef), title: resolved.title, price: resolved.price });
  }
  return items;
}

export type CouponResult = { ok: boolean; code?: string; discount?: number; label?: string; error?: string };

/** Validates a coupon against the server-priced subtotal of the cart. */
export async function checkCoupon(code: string, refs: CartRef[]): Promise<CouponResult> {
  const clean = str(code, 30).toUpperCase();
  if (!clean) return { ok: false, error: "Enter a coupon code." };
  const subtotal = priceItems(refs).reduce((s, i) => s + i.price, 0);
  const res = applyCoupon(clean, subtotal);
  return res.ok ? { ok: true, code: res.coupon.code, discount: res.discount, label: res.coupon.label } : { ok: false, error: res.error };
}

export type BookingInput = {
  name: string;
  phone: string;
  email: string;
  division: string;
  district: string;
  area: string;
  address: string;
  message: string;
  serviceType: "erepair" | "shop";
  shop: string;
  coupon: string;
  agree: boolean;
  items: CartRef[];
};

export type BookingResult = {
  ok: boolean;
  errors?: Partial<Record<keyof BookingInput, string>>;
  error?: string;
  needsLogin?: boolean;
  bookingId?: string;
  summary?: { items: OrderItem[]; subtotal: number; discount: number; total: number; serviceType: string; shop?: string };
  eventId?: string;
};

export async function submitBooking(input: BookingInput): Promise<BookingResult> {
  const session = await getSession();
  if (!session) return { ok: false, needsLogin: true, error: "Please sign in to submit your repair request." };

  const name = str(input.name, 80);
  const phone = normalizePhone(str(input.phone, 20));
  const email = str(input.email, 120).toLowerCase();
  const division = str(input.division, 40);
  const district = str(input.district, 40);
  const area = str(input.area, 60);
  const line = str(input.address, 200);
  const message = str(input.message, 1000);
  const serviceType = input.serviceType === "shop" ? "shop" : "erepair";
  const shop = str(input.shop, 120);

  const errors: BookingResult["errors"] = {};
  if (name.length < 2) errors.name = "Please enter your full name.";
  if (!/^8801[3-9]\d{8}$/.test(phone)) errors.phone = "Enter a valid Bangladeshi mobile number (01XXXXXXXXX).";
  if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  if (!isValidDistrict(division, district)) {
    if (!division) errors.division = "Select your division.";
    errors.district = "Select your district.";
  }
  const knownAreas = areas[district];
  if (!area || (knownAreas && !knownAreas.includes(area))) errors.area = "Select your area.";
  if (line.length < 5) errors.address = "Enter your house, road and block.";
  if (serviceType === "shop" && !(site.shops as readonly string[]).includes(shop)) errors.shop = "Select a shop location.";
  if (!input.agree) errors.agree = "Please accept the terms and conditions.";

  const items = priceItems(input.items);
  if (!items.length) return { ok: false, error: "Your booking is empty. Add a repair first." };
  if (Object.keys(errors).length) return { ok: false, errors };

  const subtotal = items.reduce((s, i) => s + i.price, 0);
  let discount = 0;
  let coupon: string | undefined;
  if (str(input.coupon)) {
    const c = applyCoupon(str(input.coupon, 30), subtotal);
    if (!c.ok) return { ok: false, errors: { coupon: c.error } };
    discount = c.discount;
    coupon = c.coupon.code;
  }
  const total = subtotal - discount;

  const order = await createOrder({
    id: `DC-${randomUUID().slice(0, 8).toUpperCase()}`,
    type: "order",
    userId: session.uid,
    name,
    phone: `+${phone}`,
    email,
    visit: serviceType === "shop" ? "walk-in" : "pickup",
    serviceType,
    shop: serviceType === "shop" ? shop : undefined,
    address: { division, district, area, line },
    note: message,
    items,
    subtotal,
    discount,
    coupon,
    total,
    createdAt: new Date().toISOString(),
  });

  // keep the profile phone in sync so the next booking is pre-filled
  const user = await findUserById(session.uid);
  if (user && !user.phone) await updateUser(user.id, { phone: `0${phone.slice(-10)}` });

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    after(() =>
      fetch(webhook, {
        method: "POST",
        signal: AbortSignal.timeout(8000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "booking", ...order }),
      }).catch((err) => console.error("[lead-webhook]", err)),
    );
  }

  const eventId = newEventId();
  const h = await headers();
  const c = await cookies();
  const ctx = contextFromHeaders(h, (n) => c.get(n)?.value, h.get("referer") ?? `${site.url}/booking`);
  after(() =>
    Promise.all([
      sendMetaEvent({
        eventName: "Lead",
        eventId,
        ctx,
        user: { phone, name, email },
        customData: {
          currency: "BDT",
          value: total,
          content_type: "product",
          contents: items.map((i) => ({ id: i.key, quantity: 1, item_price: i.price })),
          order_id: order.id,
        },
      }),
      sendGa4Event(ctx, "generate_lead", {
        currency: "BDT",
        value: total,
        transaction_id: order.id,
        coupon,
        items: items.map((i) => ({ item_id: i.key, item_name: i.title, price: i.price })),
      }),
    ]),
  );

  return {
    ok: true,
    bookingId: order.id,
    eventId,
    summary: { items, subtotal, discount, total, serviceType, shop: order.shop },
  };
}
