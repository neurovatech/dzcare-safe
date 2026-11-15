import { NextRequest, NextResponse } from "next/server";
import { getCategoriesWithChildRaw } from "@/lib/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isCareParam = searchParams.get("isCare");

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

  const result = await getCategoriesWithChildRaw({ isCare });

  return NextResponse.json(result, {
    status: result.statusCode || 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
