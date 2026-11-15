import { NextRequest, NextResponse } from "next/server";
import { getCategoryBrandsBySlugRaw } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const isCareParam = searchParams.get("isCare");

  let isCare: 0 | 1 | undefined = 1; // Default isCare=1
  if (isCareParam !== null) {
    if (isCareParam === "1" || isCareParam === "0") {
      isCare = Number(isCareParam) as 0 | 1;
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

  const result = await getCategoryBrandsBySlugRaw(slug, { isCare });

  if (result.statusCode === 404 || result.found === false) {
    return NextResponse.json(
      {
        statusCode: 404,
        status: "error",
        found: false,
        message: "Category not found.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(result, {
    status: result.statusCode || 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
