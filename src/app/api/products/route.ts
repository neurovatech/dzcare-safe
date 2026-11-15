import { NextRequest, NextResponse } from "next/server";
import { getProducts, type ProductQueryParams } from "@/lib/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const isSparePartParam = searchParams.get("isSparePart");
  let isSparePart: 0 | 1 = 1; // ?isSparePart=1 aeta must be be thakbe

  if (isSparePartParam !== null) {
    if (isSparePartParam === "1" || isSparePartParam === "0") {
      isSparePart = Number(isSparePartParam) as 0 | 1;
    } else {
      return NextResponse.json(
        {
          statusCode: 400,
          status: "error",
          found: false,
          message: "isSparePart must be 0 or 1.",
        },
        { status: 400 }
      );
    }
  }

  const productBadge = searchParams.get("productBadge") || undefined;
  if (productBadge && productBadge.length > 20) {
    return NextResponse.json(
      {
        statusCode: 400,
        status: "error",
        found: false,
        message: "productBadge allows a maximum of 20 characters.",
      },
      { status: 400 }
    );
  }

  const page = searchParams.get("page") ? Number(searchParams.get("page")) : undefined;
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;
  const brandSlug =
    searchParams.get("brandSlug") ||
    searchParams.get("brand_slug") ||
    searchParams.get("brand") ||
    undefined;
  const categorySlug =
    searchParams.get("categorySlug") ||
    searchParams.get("category_slug") ||
    searchParams.get("category") ||
    undefined;
  const subCategorySlug =
    searchParams.get("subCategorySlug") ||
    searchParams.get("subCategory_slug") ||
    searchParams.get("sub_category_slug") ||
    searchParams.get("subCategory") ||
    undefined;
  const attributes = searchParams.get("attributes") || undefined;
  const latest = searchParams.get("latest") ? (Number(searchParams.get("latest")) as 1 | 2) : undefined;
  const discountedPrice = (searchParams.get("discountedPrice") as "low-to-high" | "high-to-low") || undefined;
  const minDiscountedPrice = searchParams.get("minDiscountedPrice") ? Number(searchParams.get("minDiscountedPrice")) : undefined;
  const maxDiscountedPrice = searchParams.get("maxDiscountedPrice") ? Number(searchParams.get("maxDiscountedPrice")) : undefined;
  const stockStatus = searchParams.get("stockStatus") || undefined;
  const stockAssort = searchParams.get("stockAssort") !== null ? (Number(searchParams.get("stockAssort")) as 0 | 1) : undefined;

  const params: ProductQueryParams = {
    page,
    limit,
    isSparePart,
    brandSlug,
    productBadge,
    categorySlug,
    subCategorySlug,
    attributes,
    latest,
    discountedPrice,
    minDiscountedPrice,
    maxDiscountedPrice,
    stockStatus,
    stockAssort,
  };

  const result = await getProducts(params);

  return NextResponse.json(result, {
    status: result.statusCode || 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
