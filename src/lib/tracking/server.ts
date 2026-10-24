import { createHash, randomUUID } from "node:crypto";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const META_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const META_TEST_CODE = process.env.META_TEST_EVENT_CODE;
const META_GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? "v23.0";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const GA_SECRET = process.env.GA_API_SECRET;

const sha256 = (value: string) => createHash("sha256").update(value.trim().toLowerCase()).digest("hex");

/** Normalizes Bangladeshi numbers to E.164 digits (8801XXXXXXXXX) as Meta expects. */
export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("880")) return digits;
  if (digits.startsWith("01")) return `88${digits}`;
  if (digits.startsWith("1") && digits.length === 10) return `880${digits}`;
  return digits;
}

export type RequestContext = {
  ip?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
  gaClientId?: string;
  url?: string;
};

/** Reads tracking context from request headers + cookies. */
export function contextFromHeaders(h: Headers, cookie: (name: string) => string | undefined, url?: string): RequestContext {
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || undefined;
  let fbc = cookie("_fbc");
  if (!fbc && url) {
    const fbclid = safeUrl(url)?.searchParams.get("fbclid");
    if (fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`;
  }
  return {
    ip,
    userAgent: h.get("user-agent") ?? undefined,
    fbp: cookie("_fbp"),
    fbc,
    gaClientId: parseGaClientId(cookie("_ga")),
    url,
  };
}

function safeUrl(url: string) {
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
}

// _ga cookie looks like "GA1.1.1234567890.1700000000" → client id "1234567890.1700000000"
function parseGaClientId(ga?: string) {
  if (!ga) return undefined;
  const parts = ga.split(".");
  return parts.length >= 4 ? `${parts[2]}.${parts[3]}` : undefined;
}

type MetaEvent = {
  eventName: string;
  eventId: string;
  ctx: RequestContext;
  user?: { phone?: string; email?: string; name?: string };
  customData?: Record<string, unknown>;
};

/** Meta Conversions API — deduplicated with the browser pixel through `eventId`. */
export async function sendMetaEvent({ eventName, eventId, ctx, user, customData }: MetaEvent) {
  if (!META_PIXEL_ID || !META_TOKEN) return;

  const [firstName, ...rest] = (user?.name ?? "").trim().split(/\s+/);
  const userData: Record<string, unknown> = {
    client_ip_address: ctx.ip,
    client_user_agent: ctx.userAgent,
    fbp: ctx.fbp,
    fbc: ctx.fbc,
    country: [sha256("bd")],
  };
  if (user?.phone) userData.ph = [sha256(normalizePhone(user.phone))];
  if (user?.email) userData.em = [sha256(user.email)];
  if (firstName) userData.fn = [sha256(firstName)];
  if (rest.length) userData.ln = [sha256(rest.join(" "))];

  const body = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: ctx.url,
        user_data: userData,
        custom_data: customData,
      },
    ],
    ...(META_TEST_CODE ? { test_event_code: META_TEST_CODE } : {}),
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/${META_PIXEL_ID}/events?access_token=${META_TOKEN}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) console.error("[meta-capi]", res.status, await res.text());
  } catch (err) {
    console.error("[meta-capi]", err);
  }
}

/** GA4 Measurement Protocol — used for server-only conversions (e.g. generate_lead). */
export async function sendGa4Event(ctx: RequestContext, name: string, params: Record<string, unknown> = {}) {
  if (!GA_ID || !GA_SECRET) return;
  const body = {
    client_id: ctx.gaClientId ?? `${Math.floor(Math.random() * 1e10)}.${Math.floor(Date.now() / 1000)}`,
    events: [{ name, params: { ...params, page_location: ctx.url, engagement_time_msec: 1 } }],
  };
  try {
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA_ID}&api_secret=${GA_SECRET}`,
      { method: "POST", body: JSON.stringify(body), signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) console.error("[ga4-mp]", res.status);
  } catch (err) {
    console.error("[ga4-mp]", err);
  }
}

export const newEventId = () => randomUUID();
