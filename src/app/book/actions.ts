"use server";

import { cookies, headers } from "next/headers";
import { after } from "next/server";
import { getBrand, getService } from "@/lib/data";
import { site } from "@/lib/site";
import { contextFromHeaders, newEventId, normalizePhone, sendGa4Event, sendMetaEvent } from "@/lib/tracking/server";

export type BookingState = {
  ok: boolean;
  message?: string;
  errors?: Partial<Record<"name" | "phone" | "brand" | "service", string>>;
  /** Echo of submitted text so the form can refill after React resets it */
  values?: { name: string; phone: string; visit: string; note: string };
  eventId?: string;
  value?: number;
};

const clean = (v: FormDataEntryValue | null, max = 200) => String(v ?? "").trim().slice(0, max);

export async function bookRepair(_prev: BookingState, formData: FormData): Promise<BookingState> {
  // Honeypot — bots fill hidden fields
  if (clean(formData.get("company"))) return { ok: true, message: "Thanks!" };

  const name = clean(formData.get("name"), 80);
  const phone = clean(formData.get("phone"), 20);
  const brandSlug = clean(formData.get("brand"), 40);
  const model = clean(formData.get("model"), 60);
  const serviceSlug = clean(formData.get("service"), 60);
  const visit = clean(formData.get("visit"), 20);
  const note = clean(formData.get("note"), 1000);

  const errors: BookingState["errors"] = {};
  if (name.length < 2) errors.name = "Please enter your name.";
  if (!/^8801[3-9]\d{8}$/.test(normalizePhone(phone))) errors.phone = "Enter a valid Bangladeshi mobile number (01XXXXXXXXX).";
  const brand = getBrand(brandSlug);
  const service = getService(serviceSlug);
  if (!brand) errors.brand = "Select your phone brand.";
  if (!service) errors.service = "Select the problem.";
  const values = { name, phone, visit, note };
  if (Object.keys(errors).length) return { ok: false, errors, values };

  const value = brand!.prices[service!.slug] ?? 0;
  const eventId = newEventId();
  const h = await headers();
  const c = await cookies();
  const ctx = contextFromHeaders(h, (n) => c.get(n)?.value, h.get("referer") ?? `${site.url}/book`);

  const lead = {
    name,
    phone: `+${normalizePhone(phone)}`,
    brand: brand!.name,
    model,
    service: service!.name,
    visit,
    note,
    estimate: value,
    createdAt: new Date().toISOString(),
  };

  // Deliver the lead (Google Sheet / Zapier / Make / n8n / your CRM webhook)
  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
        signal: AbortSignal.timeout(8000),
      });
    } catch (err) {
      console.error("[lead-webhook]", err);
      return { ok: false, values, message: "Could not send your request. Please call or WhatsApp us." };
    }
  } else {
    console.info("[lead]", lead);
  }

  // Server-side conversions run after the response is sent
  after(async () => {
    await Promise.all([
      sendMetaEvent({
        eventName: "Lead",
        eventId,
        ctx,
        user: { phone, name },
        customData: { currency: "BDT", value, content_name: service!.name, content_category: brand!.name },
      }),
      sendGa4Event(ctx, "generate_lead", { currency: "BDT", value, service: service!.name, brand: brand!.name }),
    ]);
  });

  return {
    ok: true,
    eventId,
    value,
    message: `Thank you ${name.split(" ")[0]}! Your ${brand!.name} ${service!.name.toLowerCase()} request is received. We'll call you shortly.`,
  };
}
