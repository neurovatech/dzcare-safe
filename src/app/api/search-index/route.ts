import { getSearchIndex } from "@/lib/search-index";

// Loaded by the header search the first time it opens, then cached by the browser.
export async function GET() {
  return Response.json(await getSearchIndex(), {
    headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" },
  });
}
