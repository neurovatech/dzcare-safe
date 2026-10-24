import { after } from "next/server";
import { contextFromHeaders, sendMetaEvent } from "@/lib/tracking/server";

const MAX_BODY = 4 * 1024;
const ALLOWED = new Set(["PageView", "Contact", "ViewContent", "AddToCart"]);

// Receives browser events and mirrors them to Meta Conversions API (server-side tracking).
export async function POST(request: Request) {
  // CAPI not configured → skip all parsing work
  if (!process.env.NEXT_PUBLIC_META_PIXEL_ID || !process.env.META_CAPI_ACCESS_TOKEN) return new Response(null, { status: 204 });

  // Tracking payloads are tiny — refuse anything big before buffering it into memory.
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) return new Response(null, { status: 413 });

  let body: { event?: string; eventId?: string; url?: string; data?: Record<string, unknown> };
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return new Response(null, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!body || typeof body !== "object") return new Response(null, { status: 400 });

  const { event, eventId, url, data } = body;
  if (!event || !ALLOWED.has(event) || !eventId || typeof eventId !== "string" || eventId.length > 100) {
    return new Response(null, { status: 400 });
  }

  const cookies = new Map(
    (request.headers.get("cookie") ?? "").split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, decodeURIComponent(v.join("="))] as const;
    }),
  );
  const ctx = contextFromHeaders(request.headers, (n) => cookies.get(n), typeof url === "string" ? url : undefined);

  after(() =>
    sendMetaEvent({
      eventName: event,
      eventId,
      ctx,
      customData:
        event === "AddToCart" && data && typeof data.value === "number"
          ? { currency: "BDT", value: data.value, content_name: String(data.name ?? "").slice(0, 120) }
          : data && typeof data.method === "string"
            ? { content_name: data.method }
            : undefined,
    }),
  );

  return new Response(null, { status: 204 });
}
