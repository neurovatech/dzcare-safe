import { NextRequest, NextResponse } from "next/server";
import { getBrandsRaw } from "@/lib/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const orderParam = searchParams.get("order");
  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");
  const tradeInParam = searchParams.get("tradeIn");
  const isCareParam = searchParams.get("isCare");

  const order = orderParam !== null ? (Number(orderParam) === 1 ? 1 : 0) : undefined;
  const page = pageParam ? Number(pageParam) : undefined;
  const limit = limitParam ? Number(limitParam) : undefined;
  const tradeIn = tradeInParam !== null ? (Number(tradeInParam) as 0 | 1) : undefined;
  const isCare = isCareParam !== null ? (Number(isCareParam) as 0 | 1) : undefined;

  const result = await getBrandsRaw({
    order,
    page,
    limit,
    tradeIn,
    isCare,
  });

  return NextResponse.json(result, {
    status: result.statusCode || 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
