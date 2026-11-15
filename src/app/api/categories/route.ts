import { NextRequest, NextResponse } from "next/server";
import { getCategoriesRaw } from "@/lib/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");
  const tradeInParam = searchParams.get("tradeIn");
  const isCareParam = searchParams.get("isCare");

  const page = pageParam ? Number(pageParam) : undefined;
  const limit = limitParam ? Number(limitParam) : undefined;

  let tradeIn: 0 | 1 | "all" | undefined = undefined;
  if (tradeInParam !== null) {
    if (tradeInParam === "1" || tradeInParam === "0") {
      tradeIn = Number(tradeInParam) as 0 | 1;
    } else {
      tradeIn = "all";
    }
  }

  let isCare: 0 | 1 | "all" | undefined = undefined;
  if (isCareParam !== null) {
    if (isCareParam === "1" || isCareParam === "0") {
      isCare = Number(isCareParam) as 0 | 1;
    } else if (isCareParam === "all" || isCareParam === "-1" || isCareParam === "") {
      isCare = "all";
    } else {
      return NextResponse.json(
        {
          statusCode: 400,
          status: "error",
          message: "isCare must be 0 or 1.",
        },
        { status: 400 },
      );
    }
  }

  const result = await getCategoriesRaw({
    page,
    limit,
    tradeIn,
    isCare, // if undefined, getCategoriesRaw defaults to 1 (/categories?isCare=1)
  });

  return NextResponse.json(result, {
    status: result.statusCode || 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
