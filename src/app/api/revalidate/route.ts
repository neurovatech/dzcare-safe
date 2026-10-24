import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

const TAGS = new Set(["categories", "brands"]);

const sameSecret = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

/**
 * Instantly drops cached API data (call it from your admin panel after editing
 * categories or brands):
 *
 *   POST /api/revalidate?tag=categories
 *   Authorization: Bearer <REVALIDATE_SECRET>
 *
 * Without `tag`, every API tag is cleared.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const given = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || !given || !sameSecret(given, secret)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const tag = new URL(request.url).searchParams.get("tag");
  if (tag && !TAGS.has(tag)) return Response.json({ ok: false, error: "Unknown tag" }, { status: 400 });

  const cleared = tag ? [tag] : [...TAGS];
  // expire: 0 → no stale copy is served; the next visitor gets fresh data
  for (const t of cleared) revalidateTag(t, { expire: 0 });

  return Response.json({ ok: true, cleared });
}
