import { NextRequest, NextResponse } from "next/server";

/**
 * UP Bhulekh Land Records API
 * POST /api/bhulekh
 * Body: { district, tehsil, village, khasra_no, khatauni_no }
 *
 * Note: UP Bhulekh has no public developer API. This route:
 * 1. Validates and stores the lookup attempt
 * 2. Returns a guided deep-link to bhulekh.up.gov.in
 * 3. Returns a structured response ready for Board of Revenue MoU integration
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { district, tehsil, village, khasra_no, khatauni_no } = body;

  if (!district || !tehsil || !khasra_no) {
    return NextResponse.json(
      { error: "district, tehsil, and khasra_no are required" },
      { status: 400 }
    );
  }

  // Log lookup attempt (for future API integration audit trail)
  console.log("[bhulekh-lookup]", { district, tehsil, village, khasra_no, tenant: request.headers.get("x-exporter-id") });

  // Build Bhulekh deep-link
  const deepLink = buildBhulekhLink({ district, tehsil, village, khasra_no });

  // Check if we have a Board of Revenue API key (Phase 2)
  const borApiKey = process.env.BOARD_OF_REVENUE_API_KEY;
  if (borApiKey && !borApiKey.startsWith("placeholder")) {
    // Future: call Board of Revenue data-sharing API
    // const result = await callBORApi(body, borApiKey);
    // return NextResponse.json({ source: "bhulekh_api", ...result });
  }

  // Demo: return mock result matching Saharanpur plots
  const mockResult = getMockPlotData(khasra_no, district, tehsil, village);

  return NextResponse.json({
    source: "guided_entry", // will be "bhulekh_api" once MoU obtained
    found: mockResult !== null,
    deep_link: deepLink,
    deep_link_instructions: [
      `1. Click the link to open bhulekh.up.gov.in`,
      `2. Select district: ${district}`,
      `3. Select tehsil: ${tehsil}`,
      `4. Enter village and Khasra number ${khasra_no}`,
      `5. Verify owner name and area match your records`,
      `6. Return here and confirm verification`,
    ],
    mock_data: mockResult, // remove this in production
    note: "No official Bhulekh API exists. This system uses guided manual verification. Enterprise clients can apply for Board of Revenue data-sharing MoU.",
  });
}

function buildBhulekhLink(params: {
  district: string;
  tehsil: string;
  village?: string;
  khasra_no: string;
}): string {
  const base = "https://bhulekh.up.gov.in/Bhulekh/PublicRorTehsilWise.jsp";
  // The portal uses POST forms but this link opens the correct flow
  return `${base}?district=${encodeURIComponent(params.district)}&tehsil=${encodeURIComponent(params.tehsil)}`;
}

function getMockPlotData(
  khasraNo: string,
  district: string,
  tehsil: string,
  village?: string
) {
  const mockPlots: Record<string, {
    owner_name: string;
    area_bigha: number;
    area_ha: number;
    land_type: string;
    gata_no: string;
  }> = {
    "241/3": {
      owner_name: "Ramesh Kumar Son-of Shyam Lal",
      area_bigha: 2.0,
      area_ha: 0.82,
      land_type: "Sin Chahar",
      gata_no: "00241",
    },
    "88/1": {
      owner_name: "Salim Ahmed Khan",
      area_bigha: 3.28,
      area_ha: 1.34,
      land_type: "Sin Chahar",
      gata_no: "00088",
    },
    "156/7": {
      owner_name: "Sunita Devi Wife-of Rajendra Sharma",
      area_bigha: 5.14,
      area_ha: 2.1,
      land_type: "Bhumidhari",
      gata_no: "00156",
    },
  };
  return mockPlots[khasraNo] ?? null;
}

export async function GET() {
  return NextResponse.json({
    message: "UP Bhulekh Land Records Connector",
    status: "operational",
    api_type: "guided_entry",
    note: "No public Bhulekh API. Use POST with district/tehsil/khasra_no.",
  });
}
