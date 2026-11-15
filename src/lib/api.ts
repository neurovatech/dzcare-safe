import { cacheLife, cacheTag } from "next/cache";

const API_URL = (process.env.API_URL ?? "https://apix.bigpoint.com.bd").replace(/\/$/, "");

// ---------------------------------------------------------------------------
// Shared Types
// ---------------------------------------------------------------------------

export type ApiResponse<T> = {
  statusCode: number;
  status: "success" | "error";
  found?: boolean;
  message?: string;
  errors?: string[];
  count?: number;
  totalCount?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  data: T;
};

function buildQueryString(params?: Record<string, unknown>): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      sp.set(key, String(value));
    }
  }
  const q = sp.toString();
  return q ? `?${q}` : "";
}

/**
 * GET with timeout and one retry.
 */
async function getJson<T>(path: string, opts: { retries?: number; deadline?: number } = {}): Promise<T> {
  const { retries = 1, deadline } = opts;
  const budget = deadline ? Math.min(12_000, deadline - Date.now()) : 12_000;
  if (budget < 1_000) throw new Error(`time budget exhausted ${path}`);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      signal: AbortSignal.timeout(budget),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${path}`);
    return (await res.json()) as T;
  } catch (err) {
    if (retries > 0 && (!deadline || deadline - Date.now() > 2_000)) {
      return getJson<T>(path, { retries: retries - 1, deadline });
    }
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

// ---------------------------------------------------------------------------
// Categories API (/categories)
// ---------------------------------------------------------------------------

export type CategoryQueryParams = {
  page?: number;
  limit?: number;
  tradeIn?: 0 | 1 | "all";
  isCare?: 0 | 1 | "all";
};

export type ApiCategoryItem = {
  uuid: string;
  category_name: string;
  category_slug: string;
  categoryIcon?: string;
  thumbnail_img: string;
  is_featured: boolean;
  is_active: boolean;
  is_trade_in: boolean;
};

export type Category = {
  uuid: string;
  name: string;
  slug: string;
  image: string;
  icon?: string;
  isTradeIn: boolean;
  isCare?: boolean;
};

/** Raw response for /categories */
export async function getCategoriesRaw(params?: CategoryQueryParams): Promise<ApiResponse<ApiCategoryItem[]>> {
  "use cache";
  cacheLife("api");
  cacheTag("categories");

  const queryParams: Record<string, unknown> = {};

  if (params?.page !== undefined) queryParams.page = params.page;
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  queryParams.isCare = 1;

  const query = buildQueryString(queryParams);
  try {
    return await getJson<ApiResponse<ApiCategoryItem[]>>(`/categories${query}`);
  } catch (err) {
    console.error("[api] getCategoriesRaw", err);
    return {
      statusCode: 500,
      status: "error",
      found: false,
      count: 0,
      totalCount: 0,
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      totalPages: 0,
      data: [],
      message: err instanceof Error ? err.message : "Failed to fetch categories",
    };
  }
}

/** Device categories mapped for application consumption (live from /categories/child?isCare=1). */
export async function getCategories(params?: CategoryQueryParams): Promise<Category[]> {
  try {
    // Step 1: Default to /categories/child?isCare=1
    const childCats = await getCategoriesWithChild({ isCare: 1 });
    if (childCats.length > 0) {
      return childCats.map((c) => ({
        uuid: c.uuid,
        name: c.category_name,
        slug: c.category_slug,
        image: c.thumbnail_img,
        icon: c.categoryIcon,
        isTradeIn: !!c.is_trade_in,
        isCare: true,
      }));
    }

    const raw = await getCategoriesRaw({ limit: 50, ...params });
    const data = (raw.data ?? []).filter((c) => c.is_active && c.thumbnail_img);

    return data.map((c) => ({
      uuid: c.uuid,
      name: c.category_name,
      slug: c.category_slug,
      image: c.thumbnail_img,
      icon: c.categoryIcon,
      isTradeIn: c.is_trade_in,
      isCare: c.category_slug === "phones" || c.category_slug === "laptop",
    }));
  } catch (err) {
    console.error("[api] categories", err);
    return [];
  }
}

export async function getCategory(slug: string, params?: CategoryQueryParams) {
  const direct = (await getCategories(params)).find((c) => c.slug === slug);
  if (direct) return direct;
  return (await getCategories({ isCare: "all" })).find((c) => c.slug === slug);
}

// ---------------------------------------------------------------------------
// Categories With Child API (/categories/child)
// ---------------------------------------------------------------------------

export type ApiSubCategoryItem = {
  uuid: string;
  sub_category_name: string;
  sub_category_slug: string;
  thumbnail_img: string;
  is_featured: boolean;
  is_active: boolean;
};

export type ApiCategoryWithChildItem = {
  uuid: string;
  category_name: string;
  category_slug: string;
  categoryIcon?: string;
  thumbnail_img: string;
  is_featured: boolean;
  is_active: boolean;
  is_trade_in?: boolean;
  child: ApiSubCategoryItem[];
};

/** Raw response for /categories/child?isCare=1 */
export async function getCategoriesWithChildRaw(params?: {
  isCare?: 0 | 1 | "all";
}): Promise<ApiResponse<ApiCategoryWithChildItem[]>> {
  "use cache";
  cacheLife("api");
  cacheTag("categories-child");

  let query = "";
  if (params?.isCare === 0 || params?.isCare === 1) {
    query = `?isCare=${params.isCare}`;
  } else if (params?.isCare === "all") {
    query = "";
  } else {
    // Default isCare=1 as requested: "api end point /categories/child?isCare=1"
    query = "?isCare=1";
  }

  try {
    return await getJson<ApiResponse<ApiCategoryWithChildItem[]>>(`/categories/child${query}`);
  } catch (err) {
    console.error("[api] getCategoriesWithChildRaw", err);
    return {
      statusCode: 500,
      status: "error",
      found: false,
      count: 0,
      data: [],
      message: err instanceof Error ? err.message : "Failed to fetch categories with child",
    };
  }
}

/** Active categories with their child sub-categories */
export async function getCategoriesWithChild(params?: {
  isCare?: 0 | 1 | "all";
}): Promise<ApiCategoryWithChildItem[]> {
  const res = await getCategoriesWithChildRaw(params);
  return (res.data ?? []).filter((c) => c.is_active);
}

// ---------------------------------------------------------------------------
// Category Brands API (/categories/{slug}/brands)
// ---------------------------------------------------------------------------

export type ApiCategoryBrandChild = {
  uuid: string;
  brand_name: string;
  brand_slug: string;
  thumbnail_img: string;
  is_featured: boolean;
  is_active: boolean;
  is_trade_in?: boolean;
};

export type ApiCategoryBrandsResponseData = {
  category: Array<{
    uuid: string;
    category_name: string;
    category_slug: string;
    categoryIcon?: string;
    thumbnail_img: string;
    is_featured: boolean;
    is_active: boolean;
    is_trade_in?: boolean;
    child: ApiCategoryBrandChild[];
  }>;
  subCategory?: Array<{
    uuid: string;
    sub_category_name: string;
    sub_category_slug: string;
    thumbnail_img: string;
    is_featured: boolean;
    is_active: boolean;
    child: ApiCategoryBrandChild[];
  }>;
};

/** Raw response for /categories/{slug}/brands?isCare=1 */
export async function getCategoryBrandsBySlugRaw(
  slug: string,
  params?: { isCare?: 0 | 1 }
): Promise<ApiResponse<ApiCategoryBrandsResponseData>> {
  "use cache";
  cacheLife("api");
  cacheTag("brands", `category-brands-${slug}`);

  const isCare = params?.isCare ?? 1;
  const query = isCare !== undefined ? `?isCare=${isCare}` : "";
  try {
    return await getJson<ApiResponse<ApiCategoryBrandsResponseData>>(
      `/categories/${encodeURIComponent(slug)}/brands${query}`
    );
  } catch (err) {
    console.error("[api] getCategoryBrandsBySlugRaw", slug, err);
    return {
      statusCode: 500,
      status: "error",
      found: false,
      count: 0,
      data: { category: [], subCategory: [] },
      message: err instanceof Error ? err.message : `Failed to fetch brands for category ${slug}`,
    };
  }
}

/** Active brands for a specific category (/categories/{slug}/brands?isCare=1) */
export async function getCategoryBrandsBySlug(
  slug: string,
  params?: { isCare?: 0 | 1 }
): Promise<ApiCategoryBrandChild[]> {
  const res = await getCategoryBrandsBySlugRaw(slug, params);
  const catBrands = res.data?.category?.[0]?.child ?? [];
  return catBrands.filter((b) => b.is_active);
}

// ---------------------------------------------------------------------------
// Brands API (/brands)
// ---------------------------------------------------------------------------

export type BrandQueryParams = {
  order?: 0 | 1; // 0 = ASC, 1 = DESC
  page?: number;
  limit?: number;
  tradeIn?: 0 | 1;
  isCare?: 0 | 1;
};

export type ApiBrandItem = {
  uuid: string;
  brand_name: string;
  brand_slug: string;
  thumbnail_img: string;
  is_featured: boolean;
  is_active: boolean;
  is_trade_in: boolean;
};

export type ApiBrand = { uuid: string; name: string; slug: string; logo: string };

/** Raw response for /brands */
export async function getBrandsRaw(params?: BrandQueryParams): Promise<ApiResponse<ApiBrandItem[]>> {
  "use cache";
  cacheLife("api");
  cacheTag("brands");

  const query = buildQueryString(params);
  try {
    return await getJson<ApiResponse<ApiBrandItem[]>>(`/brands${query}`);
  } catch (err) {
    console.error("[api] getBrandsRaw", err);
    return {
      statusCode: 500,
      status: "error",
      found: false,
      count: 0,
      totalCount: 0,
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      totalPages: 0,
      data: [],
      message: err instanceof Error ? err.message : "Failed to fetch brands",
    };
  }
}

/** Active brands list */
export async function getBrands(params?: BrandQueryParams): Promise<ApiBrandItem[]> {
  const res = await getBrandsRaw({ order: 0, isCare: 1, ...params });
  let data = (res.data ?? []).filter((b) => b.is_active);

  // Fallback if isCare: 1 returned empty and caller didn't explicitly request isCare
  if (!data.length && params?.isCare === undefined) {
    const fallback = await getBrandsRaw({ order: 0, ...params });
    data = (fallback.data ?? []).filter((b) => b.is_active);
  }

  return data;
}

// Curated brand order shown in the marquee banner
const MARQUEE_BRANDS = [
  "apple", "samsung", "xiaomi", "oppo", "vivo", "realme", "google", "oneplus", "huawei", "honor",
  "infinix", "tecno", "nokia", "motorola", "asus", "lenovo", "hp", "dell", "sony", "jbl", "anker",
];

/** Brand logos from the Dazzle Commerce API */
export async function getMarqueeBrands(): Promise<ApiBrand[]> {
  try {
    const raw = await getBrandsRaw({ limit: 200, isCare: 1 });
    let all = (raw.data ?? []).filter((b) => b.is_active && b.thumbnail_img);

    // If isCare filtered list is small, fallback to general active brands
    if (all.length < 5) {
      const fallback = await getBrandsRaw({ limit: 200 });
      all = (fallback.data ?? []).filter((b) => b.is_active && b.thumbnail_img);
    }

    return MARQUEE_BRANDS.flatMap((slug) => {
      const b = all.find((x) => x.brand_slug === slug);
      return b ? [{ uuid: b.uuid, name: b.brand_name, slug: b.brand_slug, logo: b.thumbnail_img }] : [];
    });
  } catch (err) {
    console.error("[api] brands", err);
    return [];
  }
}

/** Every active brand with its logo */
export async function getAllBrands(params?: BrandQueryParams) {
  const json = await getBrandsRaw({ order: 0, page: 1, limit: 1000, ...params });
  return (json.data ?? []).filter((b) => b.is_active);
}

// ---------------------------------------------------------------------------
// Products API (/products)
// ---------------------------------------------------------------------------

export type ProductQueryParams = {
  page?: number;
  limit?: number;
  isSparePart?: 0 | 1;
  brandSlug?: string;
  productBadge?: string;
  categorySlug?: string;
  subCategorySlug?: string;
  attributes?: string; // e.g. "black|blue|12/256gb"
  latest?: 1 | 2; // 1 = Ascending, 2 = Descending
  discountedPrice?: "low-to-high" | "high-to-low";
  minDiscountedPrice?: number;
  maxDiscountedPrice?: number;
  stockStatus?: number | string;
  stockAssort?: 0 | 1;
};

export type ApiProductItem = {
  productUuid: string;
  productCode: string;
  productName: string;
  productSlug: string;
  productBadge: string;
  isTba: boolean;
  endOfLife: boolean;
  allowPreOrder: boolean;
  recognitionBadge: string;
  stockStatus: string;
  regularPrice: number;
  discountedPrice: number;
  disRate: number;
  thumbnails: {
    fileUuid: string;
    mediaFileUrl: string;
  } | null;
};

/** Raw response for /products with filters */
export async function getProducts(params?: ProductQueryParams): Promise<ApiResponse<ApiProductItem[]>> {
  "use cache";
  cacheLife("api");
  cacheTag("products");

  const sp = new URLSearchParams();
  if (params?.brandSlug) {
    sp.set("brandSlug", params.brandSlug);
  }
  const isSparePart = params?.isSparePart ?? 1;
  sp.set("isSparePart", String(isSparePart));

  if (params?.categorySlug) sp.set("categorySlug", params.categorySlug);
  if (params?.subCategorySlug) sp.set("subCategorySlug", params.subCategorySlug);
  if (params?.productBadge) sp.set("productBadge", params.productBadge);
  if (params?.attributes) sp.set("attributes", params.attributes);
  if (params?.discountedPrice) sp.set("discountedPrice", params.discountedPrice);
  if (params?.minDiscountedPrice !== undefined) sp.set("minDiscountedPrice", String(params.minDiscountedPrice));
  if (params?.maxDiscountedPrice !== undefined) sp.set("maxDiscountedPrice", String(params.maxDiscountedPrice));
  if (params?.stockStatus !== undefined) sp.set("stockStatus", String(params.stockStatus));
  if (params?.stockAssort !== undefined) sp.set("stockAssort", String(params.stockAssort));
  if (params?.latest !== undefined) sp.set("latest", String(params.latest));
  if (params?.page !== undefined) sp.set("page", String(params.page));
  if (params?.limit !== undefined) sp.set("limit", String(params.limit));

  const query = sp.toString() ? `?${sp.toString()}` : "";
  try {
    return await getJson<ApiResponse<ApiProductItem[]>>(`/products${query}`);
  } catch (err) {
    console.error("[api] getProducts", err);
    return {
      statusCode: 500,
      status: "error",
      found: false,
      count: 0,
      totalCount: 0,
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      totalPages: 0,
      data: [],
      message: err instanceof Error ? err.message : "Failed to fetch products",
    };
  }
}

/** Convenience helper for fetching repair spare parts */
export async function getSpareParts(opts?: {
  brandSlug?: string;
  categorySlug?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<ApiProductItem[]>> {
  return getProducts({
    isSparePart: 1,
    ...opts,
  });
}

// ---------------------------------------------------------------------------
// Product Variants API (/product-variants/{productUUID})
// ---------------------------------------------------------------------------

export type VariantQueryParams = {
  isSpareParts?: 0 | 1;
};

export type ApiProductVariantItem = {
  variantUuid: string;
  variantName: string;
  attributeGroup: string;
  attribute: string;
  mrpUnitSale: number;
  retailUnitSale: number;
  thumbnailUrl: string;
  isActive: boolean;
  isTba: boolean;
  isEcd: boolean;
  isPreOrder: boolean;
  isFs: boolean;
  isLs: boolean;
};

/** Get product variants by product UUID */
export async function getProductVariants(
  productUuid: string,
  params?: VariantQueryParams,
): Promise<ApiResponse<ApiProductVariantItem[]>> {
  "use cache";
  cacheLife("api");
  cacheTag("product-variants", `variant-${productUuid}`);

  const query = buildQueryString(params);
  try {
    return await getJson<ApiResponse<ApiProductVariantItem[]>>(`/product-variants/${encodeURIComponent(productUuid)}${query}`);
  } catch (err) {
    console.error("[api] getProductVariants", productUuid, err);
    return {
      statusCode: 500,
      status: "error",
      found: false,
      count: 0,
      data: [],
      message: err instanceof Error ? err.message : `Failed to fetch variants for ${productUuid}`,
    };
  }
}

// ---------------------------------------------------------------------------
// Model and Brand Helpers for Category Pages
// ---------------------------------------------------------------------------

export type CategoryProductModel = {
  uuid: string;
  code: string;
  name: string;
  modelName: string;
  slug: string;
  price: number;
  regularPrice: number;
  image?: string;
};

export type CategoryBrand = {
  slug: string;
  name: string;
  logo: string;
  models: string[];
  products?: CategoryProductModel[];
};

const cleanModel = (name: string) =>
  name
    .replace(/\s*[([]?\b(un)?official\b[)\]]?\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

export type CategoryRepair = {
  slug: string;
  name: string;
  price: number;
  time: string;
};

/**
 * Care brands from API (/categories/{slug}/brands?isCare=1).
 * Directly returns brands without heavy prefetching of products.
 */
export async function getCategoryCareBrands(categorySlug: string): Promise<CategoryBrand[]> {
  try {
    // 1. Fetch category brands from dedicated endpoint (/categories/{slug}/brands?isCare=1)
    const catBrandsRaw = await getCategoryBrandsBySlugRaw(categorySlug, { isCare: 1 });
    const directBrands = (catBrandsRaw.data?.category?.[0]?.child ?? []).filter((b) => b.is_active);

    if (directBrands.length > 0) {
      return directBrands.map((b) => ({
        slug: b.brand_slug,
        name: b.brand_name,
        logo: b.thumbnail_img,
        models: [],
      }));
    }

    // 2. Fallback to subCategory child if category child was empty
    const subCatBrands = (catBrandsRaw.data?.subCategory?.[0]?.child ?? []).filter((b) => b.is_active);
    if (subCatBrands.length > 0) {
      return subCatBrands.map((b) => ({
        slug: b.brand_slug,
        name: b.brand_name,
        logo: b.thumbnail_img,
        models: [],
      }));
    }

    // 3. Fallback to /categories/child?isCare=1 if /categories/{slug}/brands is empty
    const categoriesWithChild = await getCategoriesWithChild({ isCare: 1 });
    const matchedCategory = categoriesWithChild.find(
      (c) => c.category_slug.toLowerCase() === categorySlug.toLowerCase(),
    );

    const children = (matchedCategory?.child ?? []).filter((ch) => ch.is_active);
    if (children.length > 0) {
      return children.map((ch) => ({
        slug: ch.sub_category_slug,
        name: ch.sub_category_name,
        logo: ch.thumbnail_img,
        models: [],
      }));
    }

    return [];
  } catch (err) {
    console.error("[api] getCategoryCareBrands", err);
    return [];
  }
}

/**
 * Real repair services and spare parts, filtered by category and brand from API (/products)
 */
export async function getCategoryRepairsFromApi(categorySlug: string, brandSlug?: string): Promise<CategoryRepair[]> {
  "use cache";
  cacheLife("api");
  cacheTag("repairs", `repairs-${categorySlug}`);

  try {
    // 1. Try fetching spare parts products for this category and sub-category/brand
    let spareRes = await getProducts({
      categorySlug,
      subCategorySlug: brandSlug,
      isSparePart: 1,
      limit: 50,
    });

    if (!spareRes.data?.length && brandSlug) {
      spareRes = await getProducts({
        categorySlug,
        brandSlug,
        isSparePart: 1,
        limit: 50,
      });
    }

    const spareItems = spareRes.data ?? [];
    if (spareItems.length > 0) {
      return spareItems.map((p) => ({
        slug: p.productSlug,
        name: p.productName,
        price: p.discountedPrice > 0 ? p.discountedPrice : p.regularPrice,
        time: p.stockStatus === "In Stock" ? "Same Day" : "1–2 days",
      }));
    }

    // 2. If no spare parts found, fetch products for this category and sub-category/brand
    let prodRes = await getProducts({
      categorySlug,
      subCategorySlug: brandSlug,
      limit: 50,
    });

    if (!prodRes.data?.length && brandSlug) {
      prodRes = await getProducts({
        categorySlug,
        brandSlug,
        limit: 50,
      });
    }

    const prodItems = prodRes.data ?? [];
    if (prodItems.length > 0) {
      return prodItems.map((p) => ({
        slug: p.productSlug,
        name: p.productName,
        price: p.discountedPrice > 0 ? p.discountedPrice : p.regularPrice,
        time: p.stockStatus === "In Stock" ? "Same Day" : "1–2 days",
      }));
    }
  } catch (err) {
    console.error("[api] getCategoryRepairsFromApi", err);
  }

  return [];
}

/**
 * Brands that have products in a category, strictly using the Care API (/brands?isCare=1).
 */
export async function getCategoryBrands(categorySlug: string): Promise<CategoryBrand[]> {
  return getCategoryCareBrands(categorySlug);
}
