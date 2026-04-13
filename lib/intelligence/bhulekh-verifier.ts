/**
 * VrikshLogix Bhulekh Verification Engine
 * Simulates integration with UP Bhulekh (bhulekh.up.gov.in)
 */

export interface BhulekhRecord {
  khasra: string;
  tehsil: string;
  village: string;
  ownerName: string;
  landType: string;
  areaHa: number;
  verified: boolean;
  lastSync: string;
}

const SAHARANPUR_TEHSILS = ["Behat", "Deoband", "Rampur Maniharan", "Saharanpur", "Nakur"];

/**
 * Mapped simulation data for Saharanpur cluster
 */
const MOCK_REGISTRY: Record<string, Partial<BhulekhRecord>> = {
  "241/3": { ownerName: "Ramesh Kumar Singh", tehsil: "Behat", village: "Mandora", areaHa: 1.42 },
  "88/1": { ownerName: "Salim Ahmed Khan", tehsil: "Saharanpur", village: "Ghasiti", areaHa: 0.85 },
  "156/7": { ownerName: "Sunita Devi Sharma", tehsil: "Deoband", village: "Kailashpur", areaHa: 2.10 },
};

/**
 * Verify a Khasra number against the Saharanpur Land Registry.
 */
export async function verifyLandRecord(khasra: string, tehsil: string): Promise<BhulekhRecord | null> {
  // Simulate network latency for Govt portal
  await new Promise(resolve => setTimeout(resolve, 800));

  const record = MOCK_REGISTRY[khasra];

  if (record && (record.tehsil === tehsil || !tehsil)) {
    return {
      khasra,
      tehsil: record.tehsil || "Unknown",
      village: record.village || "Unknown",
      ownerName: record.ownerName || "Unknown",
      landType: "Bhumidhar With Transferable Rights",
      areaHa: record.areaHa || 0,
      verified: true,
      lastSync: new Date().toISOString(),
    };
  }

  return null;
}

/**
 * Validates if a tehsil is part of the Saharanpur forest cluster.
 */
export function isValidSaharanpurTehsil(tehsil: string): boolean {
  return SAHARANPUR_TEHSILS.includes(tehsil);
}
