/**
 * VrikshLogix Compliance Engine
 * Logic for calculating risk scores based on EUDR Article 10 criteria.
 */

export type RiskLevel = "negligible" | "standard" | "high";

export interface RiskInput {
  species: string[];
  locationBenchmark: "low" | "standard" | "high";
  satelliteEvidence: boolean;
  documentConfidence: number; // 0 to 1
  supplyChainComplexity: number; // 1 to 5
}

export interface RiskScore {
  level: RiskLevel;
  score: number;
  indicators: string[];
}

/**
 * Assess compliance risk based on multi-factor weighting.
 */
export function assessComplianceRisk(input: RiskInput): RiskScore {
  let score = 0;
  const indicators: string[] = [];

  // 1. Species Risk (Article 9/10)
  if (input.species.some(s => s.toLowerCase().includes("sissoo") || s.toLowerCase().includes("nigra"))) {
    score += 30;
    indicators.push("Species Risk: Dalbergia High Index");
  }

  // 2. Location Benchmarking (Commission Regulation 2025/1093)
  if (input.locationBenchmark === "high") {
    score += 40;
    indicators.push("Location: High-Risk Benchmarking Zone");
  } else if (input.locationBenchmark === "standard") {
    score += 20;
    indicators.push("Location: Standard Risk Zone");
  }

  // 3. Satellite Evidence (Article 11 Mitigation)
  if (!input.satelliteEvidence) {
    score += 20;
    indicators.push("Missing: Remote Sensing Verification");
  }

  // 4. Document Confidence
  if (input.documentConfidence < 0.7) {
    score += 15;
    indicators.push("Docs: Low Confidence OCR Output");
  }

  // 5. Complexity
  if (input.supplyChainComplexity > 3) {
    score += 10;
    indicators.push("Supply Chain: High Complexity (>3 Nodes)");
  }

  let level: RiskLevel = "negligible";
  if (score > 60) level = "high";
  else if (score > 25) level = "standard";

  return { level, score, indicators };
}
