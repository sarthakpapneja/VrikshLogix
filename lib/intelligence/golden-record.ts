/**
 * VrikshLogix Golden Record Engine
 * Implements immutable supply chain lineage using cryptographic hashing (Simulated Blockchain)
 */

import { createHash } from "crypto";

export interface TraceabilityNode {
  id: string;
  type: "PLOT" | "PERMIT" | "BATCH" | "UNIT" | "SHIPMENT";
  timestamp: string;
  parentId?: string;
  parentHash?: string;
  dataHash: string;
  nodeHash: string;
}

/**
 * Generates a SHA-256 hash for a specific data object
 */
export function generateDataHash(data: any): string {
  const content = typeof data === "string" ? data : JSON.stringify(data);
  return createHash("sha256").update(content).digest("hex");
}

/**
 * Seals a supply chain node into the Golden Record by linking it to its parent
 */
export function sealNode(
  type: TraceabilityNode["type"],
  id: string,
  data: any,
  parent?: TraceabilityNode
): TraceabilityNode {
  const timestamp = new Date().toISOString();
  const dataHash = generateDataHash(data);
  
  // Create a block-style hash linking parent to child
  const rawNodeContent = `${type}:${id}:${timestamp}:${dataHash}:${parent?.nodeHash || "ROOT"}`;
  const nodeHash = createHash("sha256").update(rawNodeContent).digest("hex");

  return {
    id,
    type,
    timestamp,
    parentId: parent?.id,
    parentHash: parent?.nodeHash,
    dataHash,
    nodeHash,
  };
}

/**
 * Verifies the integrity of a supply chain link
 */
export function verifyLink(child: TraceabilityNode, parent: TraceabilityNode): boolean {
  return child.parentHash === parent.nodeHash;
}

/**
 * Mocks a standard Forest-to-Finish chain for Saharanpur handicrafts
 */
export function mockFullLineageChain(khasra: string) {
  const plotNode = sealNode("PLOT", khasra, { location: "Saharanpur", owner: "Registry#42" });
  const permitNode = sealNode("PERMIT", "UP-SHR-2026-00341", { species: "Sheesham", vol: 480 }, plotNode);
  const batchNode = sealNode("BATCH", "VL-20260413-0014", { facility: "Sharma Sawmill" }, permitNode);
  
  return [plotNode, permitNode, batchNode];
}
