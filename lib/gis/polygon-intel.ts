/**
 * VrikshLogix GIS Intelligence Module
 * Specialized polygon processing for EUDR compliance
 */

export type Point = [number, number];
export type Polygon = Point[];

/**
 * Calculates the approximate area of a Lat/Long polygon in hectares
 * Uses a simplified spherical calculation suitable for small forest plots
 */
export function calculatePolygonArea(polygon: Polygon): number {
  if (polygon.length < 3) return 0;

  const radius = 6378137; // Earth's radius in meters
  let area = 0;

  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    const [lon1, lat1] = polygon[i];
    const [lon2, lat2] = polygon[j];

    area += (lon2 - lon1) * (2 + Math.sin(lat1 * Math.PI / 180) + Math.sin(lat2 * Math.PI / 180));
  }

  area = area * radius * radius / 2;
  const ha = Math.abs(area) / 10000; // Convert sq meters to hectares

  return Number(ha.toFixed(4));
}

/**
 * Validates a polygon as per EUDR standards (Annex II)
 * - Must be closed (first == last)
 * - Must have at least 4 points (3 vertices + closure)
 */
export function validateEUDRPolygon(polygon: Polygon): { valid: boolean; error?: string } {
  if (polygon.length < 4) {
    return { valid: false, error: "Polygon must have at least 4 points (Article 9 requirement)." };
  }

  const first = polygon[0];
  const last = polygon[polygon.length - 1];

  if (first[0] !== last[0] || first[1] !== last[1]) {
    return { valid: false, error: "Polygon is not closed (first point must equal last point)." };
  }

  return { valid: true };
}

/**
 * Simulates the intersection area calculation against a forest cover dataset (Hansen GFW)
 */
export function calculateForestLossIntersection(plotPolygon: Polygon, lossYear: number): number {
  // In production, this would use '@turf/intersect' against a GeoJSON layer
  // of forest cover loss pixels for the specified 'lossYear'.
  
  const totalArea = calculatePolygonArea(plotPolygon);
  
  // Simulation: randomize loss for demo purposes, but skew towards zero for 'healthy' plots
  const seed = totalArea * (plotPolygon[0][0] + plotPolygon[0][1]);
  const pseudoRandom = Math.abs(Math.sin(seed));
  
  // Return intersection area in hectares
  if (pseudoRandom > 0.95) return totalArea * 0.12; // 12% loss
  if (pseudoRandom > 0.90) return totalArea * 0.02; // 2% loss
  
  return 0; // No loss
}
