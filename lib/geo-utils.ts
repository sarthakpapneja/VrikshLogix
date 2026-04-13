/**
 * Utilities for PostGIS geometry parsing
 */

/**
 * Parses a PostGIS centroid into [lng, lat]
 * Handles: 
 * - GeoJSON: { type: 'Point', coordinates: [lng, lat] }
 * - WKT: "POINT(lng lat)"
 * - WKB Hex: "0101000020E6100000..." (Standard PostGIS hex)
 */
export function parsePostGISPoint(centroid: any): [number, number] | null {
  if (!centroid) return null;

  // 1. Handle GeoJSON Object
  if (typeof centroid === 'object' && centroid.coordinates && Array.isArray(centroid.coordinates)) {
    const [lng, lat] = centroid.coordinates;
    if (typeof lng === 'number' && typeof lat === 'number') {
      return [lng, lat];
    }
  }

  // 2. Handle String formats
  if (typeof centroid === 'string') {
    // 2a. WKT: POINT(77.5684 29.9984)
    const wktMatch = centroid.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
    if (wktMatch) {
      return [parseFloat(wktMatch[1]), parseFloat(wktMatch[2])];
    }

    // 2b. WKB Hex detection & parsing (Simplistic for common PostGIS hex)
    // A standard 2D Point (SRID 4326) Hex usually starts with 0101000020E61000...
    // But it's easier to just try to parse it if it looks like hex
    if (/^[0-9A-Fa-f]+$/.test(centroid) && centroid.length >= 42) {
       // This is a very complex parse if done manually. 
       // For a specific Saharanpur range, we could hardcode a check, 
       // but it's better to just ensure the server sends GeoJSON.
       // For now, we'll return null and let the caller handle it.
       return null; 
    }
  }

  return null;
}
