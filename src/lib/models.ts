import { brands, type Brand } from "./data";

export { modelSlug } from "./slug";
import { modelSlug } from "./slug";

export type PhoneModel = { brand: Brand; name: string; slug: string };

export const allModels = (): PhoneModel[] =>
  brands.flatMap((brand) => brand.models.map((name) => ({ brand, name, slug: modelSlug(name) })));

export function getModel(brandSlug: string, slug: string): PhoneModel | undefined {
  const brand = brands.find((b) => b.slug === brandSlug);
  const name = brand?.models.find((m) => modelSlug(m) === slug);
  return brand && name ? { brand, name, slug } : undefined;
}

export const modelHref = (brandSlug: string, model: string) => `/repair/${brandSlug}/${modelSlug(model)}`;

/** Repair detail ("Read More") page for one model + one repair */
export const repairHref = (brandSlug: string, model: string, serviceSlug: string) =>
  `${modelHref(brandSlug, model)}/${serviceSlug}`;

/** Detail link when the model may not be in our list (falls back to the service page). */
export function repairHrefSafe(brandSlug: string, model: string, serviceSlug: string) {
  return getModel(brandSlug, modelSlug(model)) ? repairHref(brandSlug, model, serviceSlug) : `/services/${serviceSlug}`;
}
