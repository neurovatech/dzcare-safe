// "iPhone 16 Pro Max" → "iphone-16-pro-max" (dependency-free, safe for client bundles)
export const modelSlug = (model: string) =>
  model
    .toLowerCase()
    .replace(/\+/g, " plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Repair detail page for a phone model we list */
export const repairPath = (brandSlug: string, model: string, serviceSlug: string) =>
  `/repair/${brandSlug}/${modelSlug(model)}/${serviceSlug}`;
