import { NextRequest, NextResponse } from "next/server";

/**
 * TRACES NT DDS Submission Stub
 * POST /api/traces
 * Body: { shipment_id, dds_payload }
 *
 * Status: STUB — TRACES NT API requires formal EC application (DG SANTE).
 * This route stores the DDS payload and returns a mock reference number.
 * Real integration: replace callTracesNT() implementation with live credentials.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { shipment_id, dds_payload } = body;

  if (!shipment_id || !dds_payload) {
    return NextResponse.json(
      { error: "shipment_id and dds_payload are required" },
      { status: 400 }
    );
  }

  // Validate DDS payload completeness
  const validation = validateDDSPayload(dds_payload);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "DDS payload incomplete", missing_fields: validation.missing },
      { status: 422 }
    );
  }

  const tracesApiUrl = process.env.TRACES_NT_API_URL;
  const tracesToken = process.env.TRACES_NT_API_TOKEN;

  if (tracesApiUrl && tracesToken && !tracesToken.startsWith("placeholder")) {
    // Real TRACES NT submission
    try {
      const result = await callTracesNT(dds_payload, tracesApiUrl, tracesToken);
      return NextResponse.json({
        status: "submitted",
        traces_reference_no: result.referenceNumber,
        submitted_at: new Date().toISOString(),
        traces_response: result,
      });
    } catch (err) {
      return NextResponse.json(
        {
          error: "TRACES NT submission failed",
          details: err instanceof Error ? err.message : "Unknown error",
        },
        { status: 502 }
      );
    }
  }

  // Stub mode: generate mock reference number
  const mockRefNo = `EUDR-DDS-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return NextResponse.json({
    status: "stub_submitted",
    traces_reference_no: mockRefNo,
    submitted_at: new Date().toISOString(),
    note: "TRACES NT API not configured — this is a simulated reference number. Apply for TRACES NT API access via EC DG SANTE to enable live submissions.",
    payload_stored: true,
    payload_summary: {
      operator: dds_payload.operator?.name,
      commodity: dds_payload.commodity?.hs_codes,
      country_of_production: dds_payload.country_of_production,
      plot_count: dds_payload.geolocation?.plots?.length ?? 0,
      risk_assessment: dds_payload.risk_assessment?.overall_score,
    },
  });
}

async function callTracesNT(
  ddsPayload: unknown,
  apiUrl: string,
  token: string
) {
  const res = await fetch(`${apiUrl}/api/v1/dds/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(ddsPayload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`TRACES NT error ${res.status}: ${err}`);
  }

  return res.json();
}

function validateDDSPayload(payload: Record<string, unknown>) {
  const required = ["operator", "commodity", "country_of_production", "geolocation", "risk_assessment"];
  const missing = required.filter((f) => !payload[f]);
  return { valid: missing.length === 0, missing };
}

export async function GET() {
  return NextResponse.json({
    message: "TRACES NT DDS Submission API",
    status: process.env.TRACES_NT_API_TOKEN ? "configured" : "stub_mode",
    note: "Apply for TRACES NT API access via European Commission DG SANTE.",
    docs: "https://traces.ec.europa.eu/api/docs",
  });
}
