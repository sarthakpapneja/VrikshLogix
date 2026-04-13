import { NextRequest, NextResponse } from "next/server";

/**
 * GFW Satellite Risk Engine
 * POST /api/satellite
 * Body: { plot_id: string, polygon: GeoJSON Polygon }
 * Returns: risk_score, deforestation_ha, data_source
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { plot_id, polygon } = body;

  if (!polygon) {
    return NextResponse.json({ error: "polygon is required" }, { status: 400 });
  }

  const apiKey = process.env.GFW_API_KEY;

  if (!apiKey || apiKey.startsWith("placeholder")) {
    // Demo mode: return mock risk assessment
    const mockScore = getMockScore(polygon);
    return NextResponse.json({
      plot_id,
      risk_score: mockScore.risk_score,
      deforestation_ha: mockScore.deforestation_ha,
      data_source: "mock",
      data_gaps: mockScore.data_gaps,
      risk_reason: mockScore.risk_reason,
      gfw_result: null,
      jrc_result: null,
      assessed_at: new Date().toISOString(),
      note: "Using mock data — set GFW_API_KEY to enable live satellite queries",
    });
  }

  try {
    // Real GFW query
    const gfwRes = await queryGFW(polygon, apiKey);
    const deforestationHa = gfwRes.deforestation_ha ?? 0;

    const risk_score = computeRiskScore(deforestationHa, gfwRes.has_data_gap);
    const risk_reason = computeRiskReason(risk_score, deforestationHa, gfwRes);

    return NextResponse.json({
      plot_id,
      risk_score,
      deforestation_ha: deforestationHa,
      data_source: "gfw",
      risk_reason,
      data_gaps: gfwRes.data_gaps ?? [],
      gfw_result: gfwRes,
      jrc_result: null,
      assessed_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[satellite-risk] GFW query failed:", err);
    return NextResponse.json(
      {
        error: "GFW query failed",
        details: err instanceof Error ? err.message : "Unknown error",
        fallback_risk_score: "amber",
        note: "Defaulted to amber due to API error",
      },
      { status: 502 }
    );
  }
}

async function queryGFW(polygon: unknown, apiKey: string) {
  // Hansen GFW Data API
  // Dataset: umd_tree_cover_loss / v1.8
  const datasetId = "umd_tree_cover_loss";
  const version = "v1.8";
  const url = `https://data-api.globalforestwatch.org/dataset/${datasetId}/${version}/query/json`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      geometry: polygon,
      sql: `SELECT umd_tree_cover_loss__year, SUM(area__ha) AS deforestation_ha
            FROM data
            WHERE umd_tree_cover_loss__year >= 2020
            AND umd_tree_cover_canopy_density_2000__threshold = 30
            GROUP BY umd_tree_cover_loss__year
            ORDER BY umd_tree_cover_loss__year`,
    }),
  });

  if (!res.ok) {
    throw new Error(`GFW API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const rows = json.data ?? [];
  const totalLoss = rows.reduce((sum: number, r: { deforestation_ha: number }) => sum + (r.deforestation_ha || 0), 0);
  const hasDataGap = rows.length === 0 && json.status !== "success";

  return {
    rows,
    deforestation_ha: totalLoss,
    has_data_gap: hasDataGap,
    data_gaps: hasDataGap ? ["no coverage in selected area"] : [],
    raw: json,
  };
}

function computeRiskScore(
  deforestationHa: number,
  hasDataGap: boolean
): "green" | "amber" | "red" {
  if (hasDataGap) return "amber";
  if (deforestationHa === 0) return "green";
  if (deforestationHa < 0.1) return "amber"; // marginal loss
  return "red";
}

function computeRiskReason(
  score: "green" | "amber" | "red",
  deforestationHa: number,
  gfwResult: { has_data_gap?: boolean; data_gaps?: string[] }
): string {
  switch (score) {
    case "green":
      return "No forest cover loss detected within plot boundary since 1 January 2020 (Hansen GFW).";
    case "amber":
      if (gfwResult.has_data_gap) {
        return `Satellite data gap detected. ${gfwResult.data_gaps?.join("; ") || "Insufficient coverage to confirm deforestation-free status."}`;
      }
      return `Marginal tree cover loss of ${deforestationHa.toFixed(2)} ha detected — below significance threshold but requires documentation.`;
    case "red":
      return `Forest cover loss of ${deforestationHa.toFixed(2)} ha detected within plot boundary after 1 January 2020. Plot does not comply with EUDR Article 2(b).`;
  }
}

function getMockScore(polygon: unknown): {
  risk_score: "green" | "amber" | "red";
  deforestation_ha: number;
  data_gaps: string[];
  risk_reason: string;
} {
  // Use polygon centroid lat to deterministically assign mock scores
  let lat = 30.0;
  try {
    const p = polygon as { coordinates?: number[][][] };
    if (p.coordinates?.[0]?.[0]) {
      lat = p.coordinates[0][0][1];
    }
  } catch {}

  if (lat > 30.01) {
    return { risk_score: "green", deforestation_ha: 0, data_gaps: [], risk_reason: "No forest cover loss detected (mock data)." };
  } else if (lat > 29.97) {
    return { risk_score: "amber", deforestation_ha: 0, data_gaps: ["partial satellite coverage — cloud cover during key period"], risk_reason: "Data gap — insufficient satellite coverage (mock)." };
  } else {
    return { risk_score: "red", deforestation_ha: 0.85, data_gaps: [], risk_reason: "Tree cover loss 0.85 ha detected post-2020 (mock)." };
  }
}
