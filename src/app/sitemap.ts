import type { MetadataRoute } from "next";
import { getCategories } from "@/lib/api";
import { brands, services } from "@/lib/data";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" = "monthly") => ({
    url: `${site.url}${path}`,
    changeFrequency,
    priority,
  });
  const categories = await getCategories();
  return [
    page("", 1, "weekly"),
    page("/services", 0.9, "weekly"),
    page("/categories", 0.9, "weekly"),
    page("/book", 0.9),
    ...brands.map((b) => page(`/repair/${b.slug}`, 0.8, "weekly")),
    ...services.map((s) => page(`/services/${s.slug}`, 0.8, "weekly")),
    ...categories.map((c) => page(`/categories/${c.slug}`, 0.8, "weekly")),
    page("/about", 0.6),
    page("/contact", 0.7),
    page("/privacy-policy", 0.2),
    page("/terms", 0.2),
  ];
}
