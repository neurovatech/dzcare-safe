import { cacheLife, cacheTag } from "next/cache";

const API_URL = (process.env.API_URL ?? "https://apix.bigpoint.com.bd").replace(/\/$/, "");

export type Category = {
  uuid: string;
  name: string;
  slug: string;
  image: string;
  isTradeIn: boolean;
};

type ApiCategory = {
  uuid: string;
  category_name: string;
  category_slug: string;
  thumbnail_img: string;
  is_active: boolean;
  is_trade_in: boolean;
};

/** Device categories from the Dazzle Commerce API, cached for an hour. */
export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("api");
  cacheTag("categories");

  try {
    const res = await fetch(`${API_URL}/categories?limit=50`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { data?: ApiCategory[] };
    return (json.data ?? [])
      .filter((c) => c.is_active && c.thumbnail_img)
      .map((c) => ({
        uuid: c.uuid,
        name: c.category_name,
        slug: c.category_slug,
        image: c.thumbnail_img,
        isTradeIn: c.is_trade_in,
      }));
  } catch (err) {
    console.error("[api] categories", err);
    return [];
  }
}

export async function getCategory(slug: string) {
  return (await getCategories()).find((c) => c.slug === slug);
}

export type ApiBrand = { uuid: string; name: string; slug: string; logo: string };

// Brands shown in the logo marquee, in display order.
const MARQUEE_BRANDS = [
  "apple", "samsung", "xiaomi", "oppo", "vivo", "realme", "google", "oneplus", "huawei", "honor",
  "infinix", "tecno", "nokia", "motorola", "asus", "lenovo", "hp", "dell", "sony", "jbl", "anker",
];

/** Brand logos from the Dazzle Commerce API, cached for a day. */
export async function getMarqueeBrands(): Promise<ApiBrand[]> {
  "use cache";
  cacheLife("api");
  cacheTag("brands");

  try {
    const res = await fetch(`${API_URL}/brands?limit=200`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as {
      data?: { uuid: string; brand_name: string; brand_slug: string; thumbnail_img: string; is_active: boolean }[];
    };
    const all = (json.data ?? []).filter((b) => b.is_active && b.thumbnail_img);
    return MARQUEE_BRANDS.flatMap((slug) => {
      const b = all.find((x) => x.brand_slug === slug);
      return b ? [{ uuid: b.uuid, name: b.brand_name, slug: b.brand_slug, logo: b.thumbnail_img }] : [];
    });
  } catch (err) {
    console.error("[api] brands", err);
    return [];
  }
}

export type CategoryBrand = { slug: string; name: string; logo: string; models: string[] };

type ApiList<T> = { data?: T[]; totalPages?: number };

/**
 * GET with timeout and one retry. When a `deadline` (epoch ms) is given the request
 * never runs past it, so callers stay inside the page-render time limit.
 */
async function getJson<T>(path: string, opts: { retries?: number; deadline?: number } = {}): Promise<T> {
  const { retries = 1, deadline } = opts;
  const budget = deadline ? Math.min(12_000, deadline - Date.now()) : 12_000;
  if (budget < 1_000) throw new Error(`time budget exhausted ${path}`);
  try {
    const res = await fetch(`${API_URL}${path}`, { signal: AbortSignal.timeout(budget) });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${path}`);
    return (await res.json()) as T;
  } catch (err) {
    if (retries > 0 && (!deadline || deadline - Date.now() > 2_000)) return getJson<T>(path, { retries: retries - 1, deadline });
    throw err;
  }
}

/** Runs async jobs with at most `limit` in flight — the API slows down under bursts. */
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

/** Every active brand with its logo (one request — the API allows limit=1000). */
async function getAllBrands() {
  "use cache";
  cacheLife("days");
  cacheTag("brands");
  const json = await getJson<ApiList<{ brand_name: string; brand_slug: string; thumbnail_img: string; is_active: boolean }>>(
    "/brands?order=0&page=1&limit=1000",
  );
  return (json.data ?? []).filter((b) => b.is_active);
}

// "Samsung Galaxy Tab A11 Official" → "Samsung Galaxy Tab A11"
const cleanModel = (name: string) =>
  name
    .replace(/\s*[([]?\b(un)?official\b[)\]]?\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

// Where the spec sheet starts in a product name: CPU/GPU vendors, memory sizes,
// screen sizes, "with …", brackets. Everything from there on is dropped.
const SPEC_START =
  /\s(?:intel|amd|ryzen|snapdragon|qualcomm|mediatek|dimensity|exynos|nvidia|geforce|rtx|core\s|with\s|\d+(?:\.\d+)?\s?(?:gb|tb|mah|hz)\b|\d+(?:\.\d+)?\s?(?:"|”|''|inch\b|-inch\b)|\d+(?:\.\d+)?\s?(?:ton|kg|ltr|litre|liter|l)\b|(?:non[- ]?)?inverter\b|split\b|window\b|cassette\b|air\s+(?:conditioner|purifier|cooler)\b|refrigerator\b|washing\s+machine\b|[([{]|-\s|–|,)/i;

// Generic product-type words at the end of a name ("… Bluetooth Calling Smart Watch")
const TYPE_SUFFIX =
  /(?:\s+(?:bluetooth|calling|portable|wireless|smart|gaming|true|tws|noise|cancelling|earbuds|headphones?|speaker|watch|laptop|smartphone|mouse|keyboard))+$/i;

// Product lines sold without the brand name in front ("Redmi Note 17", "iPhone 18 Pro"),
// plus a few spelling mistakes seen in the catalogue → brand slug.
const PREFIX_ALIASES: Record<string, string> = {
  iphone: "apple",
  ipad: "apple",
  macbook: "apple",
  airpods: "apple",
  imac: "apple",
  redmi: "xiaomi",
  poco: "xiaomi",
  mi: "xiaomi",
  xioami: "xiaomi",
  galaxy: "samsung",
  pixel: "google",
  moto: "motorola",
  reno: "oppo",
  powerbeats: "beats",
  blekin: "belkin",
  bekin: "belkin",
};

/** "Asus Zenbook 14 OLED UX3405M Intel Core Ultra 7 …" → "ASUS Zenbook 14 OLED UX3405M" */
function shortModel(name: string, brandName: string, keepPrefix = false) {
  const cut = name.search(SPEC_START);
  let model = (cut > 0 ? name.slice(0, cut) : name).trim();
  const stripped = model.replace(TYPE_SUFFIX, "").trim();
  // keep the type words if removing them would leave only the brand
  const prefixLength = keepPrefix ? name.split(" ")[0].length : brandName.length;
  if (stripped.length > prefixLength + 1) model = stripped;
  // use the brand's official spelling for the leading brand word(s)
  if (!keepPrefix) model = brandName + model.slice(brandName.length);
  return model.length > 60 ? model.slice(0, 60).replace(/\s+\S*$/, "") : model;
}

/**
 * Brands that actually have products in a category, most products first, each
 * with its model names. The API has no brand↔category link, so it is derived
 * from the category's product names (they start with the brand name).
 */
export async function getCategoryBrands(categorySlug: string): Promise<CategoryBrand[]> {
  "use cache";
  // cache lifetime is decided below: a full result is kept for a day, a partial one only briefly
  cacheTag("brands", "categories", `category-brands-${categorySlug}`);

  try {
    type Product = { productName: string };
    const path = (page: number) => `/products?categorySlug=${encodeURIComponent(categorySlug)}&limit=100&page=${page}`;
    // The API returns at most 100 products per page and slows down under bursts,
    // so pages are fetched 3 at a time within a 25 s budget; whatever arrived in
    // time is used (the cache retries the rest on the next refresh).
    const deadline = Date.now() + 25_000;
    const first = await getJson<ApiList<Product>>(path(1), { deadline });
    const pages = Math.min(first.totalPages ?? 1, 20); // safety cap
    const pageNumbers = Array.from({ length: pages - 1 }, (_, i) => i + 2);
    let failed = 0;
    const rest = await mapLimit(pageNumbers, 3, (p) =>
      getJson<ApiList<Product>>(path(p), { deadline }).catch(() => {
        failed++;
        return { data: [] } as ApiList<Product>;
      }),
    );
    if (failed) console.warn(`[api] ${categorySlug}: ${failed}/${pages} product pages skipped (slow API)`);
    if (failed) cacheLife("api");
    else cacheLife("days");
    const names = [first, ...rest].flatMap((r) => r.data ?? []).map((p) => cleanModel(p.productName));

    const brands = await getAllBrands();
    // Longest names first so "Bang & Olufsen" wins over a shorter overlapping brand
    const byLength = [...brands].sort((a, b) => b.brand_name.length - a.brand_name.length);
    const found = new Map<string, { brand: (typeof brands)[number]; models: Map<string, string> }>();

    for (const name of names) {
      const lower = name.toLowerCase();
      let brand = byLength.find((b) => {
        const n = b.brand_name.toLowerCase();
        return lower === n || lower.startsWith(`${n} `);
      });
      let aliased = false;
      if (!brand) {
        const alias = PREFIX_ALIASES[lower.split(" ")[0]];
        brand = alias ? brands.find((b) => b.brand_slug === alias) : undefined;
        aliased = Boolean(brand);
      }
      if (!brand) continue;
      const entry = found.get(brand.brand_slug) ?? { brand, models: new Map<string, string>() };
      const model = shortModel(name, brand.brand_name, aliased);
      // case-insensitive de-duplication, keep the first spelling seen
      if (!entry.models.has(model.toLowerCase())) entry.models.set(model.toLowerCase(), model);
      found.set(brand.brand_slug, entry);
    }

    return [...found.values()]
      .sort((a, b) => b.models.size - a.models.size)
      .map(({ brand, models }) => ({
        slug: brand.brand_slug,
        name: brand.brand_name,
        logo: brand.thumbnail_img,
        models: [...models.values()].slice(0, 80),
      }));
  } catch (err) {
    console.error("[api] category brands", categorySlug, err);
    cacheLife("api");
    return [];
  }
}
