"use client";

type Fn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: Fn;
    fbq?: Fn & { disablePushState?: boolean };
    dataLayer?: unknown[];
  }
}

export type BrowserEvent = "PageView" | "Contact" | "ViewContent" | "AddToCart";

export const newEventId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** Mirrors an event to /api/track so the server can send it to Meta CAPI (deduplicated by eventId). */
function mirrorToServer(event: BrowserEvent, eventId: string, data?: Record<string, unknown>) {
  // Nothing to mirror to when Meta CAPI is not set up — save the request entirely
  if (!process.env.NEXT_PUBLIC_META_PIXEL_ID) return;
  const payload = JSON.stringify({ event, eventId, url: location.href, data });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
  } else {
    fetch("/api/track", { method: "POST", body: payload, keepalive: true, headers: { "Content-Type": "application/json" } });
  }
}

export function trackPageView() {
  const eventId = newEventId();
  window.fbq?.("track", "PageView", {}, { eventID: eventId });
  window.gtag?.("event", "page_view", { page_location: location.href, page_title: document.title });
  mirrorToServer("PageView", eventId);
}

/** Phone / WhatsApp / directions clicks. */
export function trackContact(method: "call" | "whatsapp" | "map" | "email", label?: string) {
  const eventId = newEventId();
  window.fbq?.("track", "Contact", { content_name: method }, { eventID: eventId });
  window.gtag?.("event", "contact", { method, label });
  mirrorToServer("Contact", eventId, { method });
}

/** Browser half of the Lead event — the server already sent CAPI + GA4 with the same eventId. */
export function trackLeadBrowser(eventId: string, value?: number) {
  window.fbq?.("track", "Lead", { currency: "BDT", value }, { eventID: eventId });
}

export function trackAddToCart(name: string, value: number) {
  const eventId = newEventId();
  window.fbq?.("track", "AddToCart", { content_name: name, currency: "BDT", value }, { eventID: eventId });
  window.gtag?.("event", "add_to_cart", { currency: "BDT", value, items: [{ item_name: name, price: value }] });
  mirrorToServer("AddToCart", eventId, { name, value });
}

/** Browser half of a pre-booking — the server sent CAPI "Schedule" with the same eventId. */
export function trackScheduleBrowser(eventId: string, value?: number) {
  window.fbq?.("track", "Schedule", { currency: "BDT", value }, { eventID: eventId });
}
