"use server";

import { randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { after } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createOrder } from "@/lib/auth/store";
import { cartKey, resolveCartRef, type CartRef } from "@/lib/data";
import { site } from "@/lib/site";
import { TIME_SLOTS } from "@/lib/slots";
import { contextFromHeaders, newEventId, normalizePhone, sendGa4Event, sendMetaEvent } from "@/lib/tracking/server";


export type PreBookState = {
  ok: boolean;
  message?: string;
  errors?: Partial<Record<"name" | "phone" | "date" | "time" | "item", string>>;
  values?: { name: string; phone: string; date: string; time: string; note: string };
  bookingId?: string;
  eventId?: string;
  value?: number;
};

const str = (v: FormDataEntryValue | null, max = 200) => String(v ?? "").trim().slice(0, max);

/** YYYY-MM-DD in Dhaka time, offset by `days`. */
function dhakaDate(days = 0) {
  const d = new Date(Date.now() + days * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(d);
}

export async function preBook(_prev: PreBookState, form: FormData): Promise<PreBookState> {
  const name = str(form.get("name"), 80);
  const phone = str(form.get("phone"), 20);
  const date = str(form.get("date"), 10);
  const time = str(form.get("time"), 20);
  const visit = str(form.get("visit"), 20) === "pickup" ? "pickup" : "walk-in";
  const note = str(form.get("note"), 500);
  const values = { name, phone, date, time, note };

  let ref: CartRef | null = null;
  try {
    ref = JSON.parse(str(form.get("source"), 500)) as CartRef;
  } catch {
    /* handled below */
  }
  // Price comes from the catalog, never from the client.
  const item = ref ? resolveCartRef(ref) : null;

  const errors: PreBookState["errors"] = {};
  if (!item || !ref) errors.item = "This repair is no longer available.";
  if (name.length < 2) errors.name = "Please enter your name.";
  if (!/^8801[3-9]\d{8}$/.test(normalizePhone(phone))) errors.phone = "Enter a valid mobile number (01XXXXXXXXX).";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < dhakaDate(0) || date > dhakaDate(30))
    errors.date = "Pick a date within the next 30 days.";
  if (!TIME_SLOTS.includes(time)) errors.time = "Choose a time slot.";
  if (Object.keys(errors).length) return { ok: false, errors, values };

  const session = await getSession();
  const booking = await createOrder({
    id: `PB-${randomUUID().slice(0, 8).toUpperCase()}`,
    type: "prebook",
    userId: session?.uid,
    name,
    phone: `+${normalizePhone(phone)}`,
    visit,
    note,
    slot: { date, time },
    items: [{ key: cartKey(ref!), title: item!.title, price: item!.price }],
    total: item!.price,
    createdAt: new Date().toISOString(),
  });

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    after(() =>
      fetch(webhook, {
        method: "POST",
        signal: AbortSignal.timeout(8000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...booking, email: session?.email }),
      }).catch((err) => console.error("[lead-webhook]", err)),
    );
  }

  const eventId = newEventId();
  const h = await headers();
  const c = await cookies();
  const ctx = contextFromHeaders(h, (n) => c.get(n)?.value, h.get("referer") ?? site.url);
  after(() =>
    Promise.all([
      sendMetaEvent({
        eventName: "Schedule",
        eventId,
        ctx,
        user: { phone, name, email: session?.email },
        customData: { currency: "BDT", value: item!.price, content_name: item!.title },
      }),
      sendGa4Event(ctx, "generate_lead", {
        currency: "BDT",
        value: item!.price,
        lead_type: "prebook",
        item_name: item!.title,
      }),
    ]),
  );

  return {
    ok: true,
    bookingId: booking.id,
    eventId,
    value: item!.price,
    message: `Your slot is reserved for ${date}, ${time}. Booking ID ${booking.id} — we'll call to confirm.`,
  };
}
