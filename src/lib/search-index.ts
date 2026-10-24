import { cacheLife } from "next/cache";
import { getCategories } from "./api";
import { brands, services } from "./data";
import { SERVICE_KEYWORDS, type SearchIndex } from "./search";

/** Builds the search index from the catalogue + API categories (cached). */
export async function getSearchIndex(): Promise<SearchIndex> {
  "use cache";
  cacheLife("api");
  const categories = await getCategories();
  return {
    models: brands.flatMap((b) => b.models.map((name) => ({ brand: b.slug, brandName: b.name, name }))),
    services: services.map((s) => ({ slug: s.slug, name: s.name, icon: s.icon, keywords: SERVICE_KEYWORDS[s.slug] ?? "" })),
    prices: Object.fromEntries(brands.map((b) => [b.slug, b.prices])),
    categories: categories.map((c) => ({ name: `${c.name} repair`, href: `/categories/${c.slug}` })),
  };
}
