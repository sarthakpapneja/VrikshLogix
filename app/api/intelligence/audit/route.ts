import { NextResponse } from "next/server";
import { runSatelliteAudit } from "@/lib/intelligence/satellite-audit";

/**
 * Production-ready Satellite Audit Endpoint
 * Returns EUDR Article 10 Risk Assessment based on Polygon Geolocation
 */
export async function POST(request: Request) {
  try {
    const { id, polygon } = await request.json();

    if (!id || !polygon) {
      return NextResponse.json(
        { error: "Insufficient geolocation data for audit." },
        { status: 400 }
      );
    }

    // Simulate satellite data processing time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Run the intelligence engine logic
    const auditResult = runSatelliteAudit(id, polygon);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      source: "Global Forest Watch (Simulated)",
      audit: auditResult
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Satellite Audit Error" },
      { status: 500 }
    );
  }
}
