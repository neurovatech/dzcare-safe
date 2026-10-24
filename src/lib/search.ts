import type { IconName } from "./data";

// Compact, serialisable search index + a matcher that runs on both server and client.

export type SearchIndex = {
  models: { brand: string; brandName: string; name: string }[];
  services: { slug: string; name: string; icon: IconName; keywords: string }[];
  prices: Record<string, Partial<Record<string, number>>>;
  categories: { name: string; href: string }[];
};

export type SearchHit = {
  brand: string;
  model: string;
  service: { slug: string; name: string; icon: IconName };
  price: number;
};

// Extra words people type for each repair
export const SERVICE_KEYWORDS: Record<string, string> = {
  "screen-replacement": "screen display lcd oled touch broken cracked glass",
  "battery-replacement": "battery backup drain swollen",
  "charging-port-repair": "charging charger port usb type-c lightning",
  "camera-repair": "camera lens front rear",
  "water-damage-repair": "water liquid wet damage",
  "motherboard-repair": "motherboard board ic chip dead no power",
  "back-glass-replacement": "back glass backshell housing body",
  "speaker-mic-repair": "speaker mic microphone audio sound earpiece",
  "software-repair": "software update unlock restore data",
  "face-id-repair": "face id sensor fingerprint proximity",
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Every token must appear somewhere in "brand model service keywords". */
export function search(index: SearchIndex, query: string, limit = 12) {
  const tokens = norm(query).split(" ").filter(Boolean);
  if (!tokens.length) return { hits: [] as SearchHit[], total: 0, categories: [] as SearchIndex["categories"] };

  const hits: (SearchHit & { score: number })[] = [];
  for (const m of index.models) {
    const modelText = norm(`${m.brandName} ${m.name}`);
    for (const s of index.services) {
      const price = index.prices[m.brand]?.[s.slug];
      if (price === undefined) continue;
      const text = `${modelText} ${norm(s.name)} ${s.keywords}`;
      if (!tokens.every((t) => text.includes(t))) continue;
      // rank: tokens matching the start of a model word first, then shorter model names
      const score =
        tokens.filter((t) => modelText.split(" ").some((w) => w.startsWith(t))).length * 10 - m.name.length / 10;
      hits.push({ brand: m.brand, model: m.name, service: { slug: s.slug, name: s.name, icon: s.icon }, price, score });
    }
  }
  hits.sort((a, b) => b.score - a.score);

  // Words that belong to a model name ("iphone", "14", "pro") shouldn't pick repair categories
  const modelWords = new Set(index.models.flatMap((m) => norm(`${m.brandName} ${m.name}`).split(" ")));
  const repairTokens = tokens.filter((t) => ![...modelWords].some((w) => w.startsWith(t)));
  const anyToken = (text: string) =>
    repairTokens.some((t) => norm(text).split(" ").some((w) => w.startsWith(t)));
  const categories = [
    ...index.services.filter((s) => anyToken(`${s.name} ${s.keywords}`)).map((s) => ({ name: s.name, href: `/services/${s.slug}` })),
    ...index.categories.filter((c) => anyToken(c.name)),
  ];

  return {
    hits: hits.slice(0, limit).map((h) => ({ brand: h.brand, model: h.model, service: h.service, price: h.price })),
    total: hits.length,
    // fall back to every repair type when nothing specific matched (like a browse list)
    categories: categories.length ? categories : index.services.map((s) => ({ name: s.name, href: `/services/${s.slug}` })),
  };
}
