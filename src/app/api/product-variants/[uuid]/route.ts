import { NextRequest, NextResponse } from "next/server";
import { getProductVariants } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await params;
  const { searchParams } = new URL(request.url);

  const isSparePartsParam = searchParams.get("isSpareParts");
  const isSpareParts = isSparePartsParam !== null ? (Number(isSparePartsParam) as 0 | 1) : undefined;

  const result = await getProductVariants(
    uuid,
    isSpareParts !== undefined ? { isSpareParts } : undefined
  );

  return NextResponse.json(result, {
    status: result.statusCode || 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
