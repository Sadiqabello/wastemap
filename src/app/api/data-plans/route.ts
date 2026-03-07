import { NextRequest, NextResponse } from "next/server";
import { getDataPlans } from "@/lib/providers/vtpass";

/**
 * GET /api/data-plans?network=mtn
 * Returns available data plan variations for a given network.
 * Cached for 1 hour.
 */
export async function GET(request: NextRequest) {
  const network = request.nextUrl.searchParams.get("network") || "mtn";
  const plans = await getDataPlans(network);

  return NextResponse.json(plans, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
