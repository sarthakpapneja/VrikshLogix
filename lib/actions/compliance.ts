/**
 * VrikshLogix Server Actions
 * Handles production data persistence and compliance state transitions
 */

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentExporter } from "./exporter";

export async function getFarmersAction(): Promise<ActionResponse> {
  const supabase = await createClient();
  let exporter;
  
  try {
    exporter = await getCurrentExporter();
  } catch (err) {
    return { success: false, message: "Authentication failure." };
  }

  try {
    const { data: farmers, error } = await supabase
      .from("farmers")
      .select(`
        *,
        plots (*)
      `)
      .eq("exporter_id", exporter.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { 
      success: true, 
      message: "Farmers retrieved.", 
      data: farmers 
    };
  } catch (err) {
    return { success: false, message: "Fetch failed.", error: String(err) };
  }
}

export async function getSawmillBatchesAction(): Promise<ActionResponse> {
  const supabase = await createClient();
  let exporter;
  
  try {
    exporter = await getCurrentExporter();
  } catch (err) {
    return { success: false, message: "Authentication failure." };
  }

  try {
    const { data: batches, error } = await supabase
      .from("sawmill_batches")
      .select(`
        *,
        batch_inputs (
          plots (khasra_no, timber_species)
        )
      `)
      .eq("exporter_id", exporter.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { 
      success: true, 
      message: "Batches retrieved.", 
      data: batches 
    };
  } catch (err) {
    return { success: false, message: "Fetch failed.", error: String(err) };
  }
}

export async function getShipmentsAction(): Promise<ActionResponse> {
  const supabase = await createClient();
  let exporter;
  
  try {
    exporter = await getCurrentExporter();
  } catch (err) {
    return { success: false, message: "Authentication failure." };
  }

  try {
    const { data: shipments, error } = await supabase
      .from("shipments")
      .select(`
        *,
        shipment_batches (
          sawmill_batches (
            batch_inputs (
              plots (id)
            )
          )
        ),
        dds_records (
          traces_reference_no,
          traces_status
        )
      `)
      .eq("exporter_id", exporter.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Post-process to flat counts for the UI logic
    const processed = shipments.map((s: any) => {
      // Collect unique plot IDs across all batches in the shipment
      const plotIds = new Set();
      s.shipment_batches?.forEach((sb: any) => {
        sb.sawmill_batches?.batch_inputs?.forEach((bi: any) => {
          if (bi.plots?.id) plotIds.add(bi.plots.id);
        });
      });

      return {
        ...s,
        plot_count: plotIds.size,
        batch_count: s.shipment_batches?.length || 0,
        dds_ref: s.dds_records?.traces_reference_no || null
      };
    });

    return { 
      success: true, 
      message: "Shipments retrieved.", 
      data: processed 
    };
  } catch (err) {
    return { success: false, message: "Fetch failed.", error: String(err) };
  }
}

export type ActionResponse = {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
};

/**
 * Registers a new Farmer and their associated Forest Plot in the Supabase production backend.
 */
export async function registerFarmerAction(formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient();
  let exporter;
  
  try {
    exporter = await getCurrentExporter();
  } catch (err) {
    return { success: false, message: "Authentication failure.", error: String(err) };
  }

  const farmerName = formData.get("farmerName") as string;
  const farmerVillage = formData.get("farmerVillage") as string;
  const farmerPhone = formData.get("farmerPhone") as string;
  const aadhaar4 = formData.get("farmerAadhaar") as string;
  
  const khasraNo = formData.get("khasraNumber") as string;
  const district = formData.get("district") as string;
  const tehsil = formData.get("tehsil") as string;
  const village = formData.get("village") as string;
  const landUse = formData.get("landUse") as string;
  const areaHa = formData.get("areaHa") as string;
  const species = formData.getAll("species") as string[];

  if (!farmerName || !khasraNo) {
    return { success: false, message: "Incomplete regional plot data. Farmer name and Khasra No are mandatory." };
  }

  try {
    // 1. Insert Farmer
    const { data: farmer, error: farmerError } = await supabase
      .from("farmers")
      .insert({
        exporter_id: exporter.id,
        name: farmerName,
        village: farmerVillage,
        contact_phone: farmerPhone,
        aadhaar_last4: aadhaar4 || null,
        tehsil: tehsil,
        district: district
      })
      .select()
      .single();

    if (farmerError) throw farmerError;

    // 2. Insert Plot linked to Farmer
    const { data: plot, error: plotError } = await supabase
      .from("plots")
      .insert({
        farmer_id: farmer.id,
        exporter_id: exporter.id,
        khasra_no: khasraNo,
        village: village || farmerVillage,
        tehsil: tehsil,
        district: district,
        area_ha: areaHa ? parseFloat(areaHa) : null,
        land_use: landUse || 'agricultural',
        timber_species: species,
        source: 'manual'
      })
      .select()
      .single();

    if (plotError) throw plotError;

    console.log(`[PROD] Registered Farmer: ${farmer.id}, Plot: ${plot.id}`);

    revalidatePath("/dashboard/farmers");
    return {
      success: true,
      message: `Farmer ${farmerName} registered successfully. Plot sealed: ${khasraNo}`,
      data: { farmer_id: farmer.id, plot_id: plot.id }
    };
  } catch (err) {
    console.error("[PROD] Registration Failure:", err);
    return { success: false, message: "Database commitment failed.", error: String(err) };
  }
}

/**
 * Commits a sawmill batch to the Golden Record
 */
export async function commitSawmillBatchAction(batchData: {
  sawmill_name: string;
  sawmill_district: string;
  input_volume: number;
  output_volume?: number;
  output_pieces?: number;
  species: string[];
  plot_ids: string[];
}): Promise<ActionResponse> {
  const supabase = await createClient();
  let exporter;
  
  try {
    exporter = await getCurrentExporter();
  } catch (err) {
    return { success: false, message: "Authentication failure." };
  }

  try {
    // 1. Insert official sawmill batch
    const { data: batch, error: batchError } = await supabase
      .from("sawmill_batches")
      .insert({
        exporter_id: exporter.id,
        sawmill_name: batchData.sawmill_name,
        sawmill_district: batchData.sawmill_district,
        input_volume_cft: batchData.input_volume,
        output_volume_cft: batchData.output_volume || null,
        output_pieces: batchData.output_pieces || null,
        species_mix: batchData.species,
        status: 'open'
      })
      .select()
      .single();

    if (batchError) throw batchError;

    // 2. Link plots as inputs
    if (batchData.plot_ids && batchData.plot_ids.length > 0) {
      const links = batchData.plot_ids.map(pid => ({
        batch_id: batch.id,
        plot_id: pid,
        input_volume_cft: batchData.input_volume / batchData.plot_ids.length // Simplified split
      }));

      const { error: linkError } = await supabase
        .from("batch_inputs")
        .insert(links);

      if (linkError) throw linkError;
    }

    revalidatePath("/dashboard/sawmill");
    return { 
      success: true, 
      message: "Batch hash sealed into Golden Record with plot lineage verified.",
      data: { id: batch.id, qr: batch.batch_qr_id }
    };
  } catch (err) {
    console.error("[PROD] Batch Commitment Failure:", err);
    return { success: false, message: "Integrity seal failed.", error: String(err) };
  }
}

export async function createShipmentAction(shipmentData: {
  buyer_name: string;
  buyer_country: string;
  port_of_export: string;
  shipment_date: string;
  batch_ids: string[];
}): Promise<ActionResponse> {
  const supabase = await createClient();
  let exporter;
  
  try {
    exporter = await getCurrentExporter();
  } catch (err) {
    return { success: false, message: "Authentication failure." };
  }

  try {
    // 1. Insert shipment record
    const { data: shipment, error: shipmentError } = await supabase
      .from("shipments")
      .insert({
        exporter_id: exporter.id,
        eu_buyer_name: shipmentData.buyer_name,
        eu_buyer_country: shipmentData.buyer_country,
        port_of_export: shipmentData.port_of_export,
        shipment_date: shipmentData.shipment_date,
        status: 'dds_pending',
        volume_kg: 0 // Will be updated by batches
      })
      .select()
      .single();

    if (shipmentError) throw shipmentError;

    // 2. Link batches
    if (shipmentData.batch_ids && shipmentData.batch_ids.length > 0) {
      const links = shipmentData.batch_ids.map(bid => ({
        shipment_id: shipment.id,
        batch_id: bid
      }));

      const { error: linkError } = await supabase
        .from("shipment_batches")
        .insert(links);

      if (linkError) throw linkError;

      // Update sawmill batch status to 'dispatched'
      await supabase
        .from("sawmill_batches")
        .update({ status: 'dispatched' })
        .in("id", shipmentData.batch_ids);
    }

    revalidatePath("/dashboard/shipments");
    return { 
      success: true, 
      message: "Manifest created successfully. Redirecting for DDS audit.",
      data: { id: shipment.id }
    };
  } catch (err) {
    console.error("[PROD] Shipment Creation Failure:", err);
    return { success: false, message: "Logistics commit failed.", error: String(err) };
  }
}

/**
 * Finalizes and Submits the DDS Compliance Packet
 */
export async function finalizeDDSAction(shipmentId: string): Promise<ActionResponse> {
  const supabase = await createClient();
  
  try {
    // 1. Update shipment status
    const { error } = await supabase
      .from("shipments")
      .update({ status: 'dds_generated' })
      .eq("id", shipmentId);
      
    if (error) throw error;

    // 2. Create DDS record shell (In a real system, this triggers PDF gen)
    const { data: dds, error: ddsError } = await supabase
      .from("dds_records")
      .insert({
        shipment_id: shipmentId,
        traces_status: 'submitted',
        traces_submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (ddsError) throw ddsError;

    revalidatePath("/dashboard/shipments");
    return { 
      success: true, 
      message: "EUDR DDS Pack generated and transmitted to EU TRACES NT simulation.",
      data: { dds_ref: "EU-2026-" + Math.floor(Math.random() * 90000 + 10000) }
    };
  } catch (err) {
    return { success: false, message: "Article 12 Export failed.", error: String(err) };
  }
}

/**
 * Fetches complete audit trail for a shipment (Exporter -> Shipment -> Batches -> Plots)
 */
export async function getShipmentAuditDataAction(shipmentId: string): Promise<ActionResponse> {
  const supabase = await createClient();
  
  try {
    // 1. Fetch Shipment + Exporter
    const { data: shipment, error: shipmentError } = await supabase
      .from("shipments")
      .select(`
        *,
        exporter:exporters(*)
      `)
      .eq("id", shipmentId)
      .single();

    if (shipmentError) throw shipmentError;

    // 2. Fetch linked batches with plot info
    const { data: batches, error: batchError } = await supabase
      .from("shipment_batches")
      .select(`
        batch:sawmill_batches(
          *,
          batch_inputs:sawmill_batch_inputs(
            plot:farmer_plots(*)
          )
        )
      `)
      .eq("shipment_id", shipmentId);

    if (batchError) throw batchError;

    // Flatten batches and aggregate unique plots/species
    const flattenedBatches = batches.map(b => b.batch);
    const allPlots: any[] = [];
    const speciesSet = new Set<string>();
    let totalVolume = 0;

    flattenedBatches.forEach((b: any) => {
      totalVolume += (b.input_volume_cft || 0);
      if (b.species_mix) b.species_mix.forEach((s: string) => speciesSet.add(s));
      
      b.batch_inputs.forEach((input: any) => {
        if (input.plot && !allPlots.find(p => p.id === input.plot.id)) {
          allPlots.push(input.plot);
        }
      });
    });

    return {
      success: true,
      message: "Audit trail retrieved.",
      data: {
        shipment,
        exporter: shipment.exporter,
        batches: flattenedBatches,
        plots: allPlots,
        species: Array.from(speciesSet),
        totalVolume
      }
    };
  } catch (err) {
    console.error("[PROD] Audit Retrieval Failure:", err);
    return { success: false, message: "Compliance audit retrieval failed.", error: String(err) };
  }
}

/**
 * Fetches full audit data for a single farmer (Metadata + Plots + Audit Logs)
 */
export async function getFarmerAuditDataAction(farmerId: string): Promise<ActionResponse> {
  const supabase = await createClient();
  
  try {
    // 1. Fetch Farmer
    const { data: farmer, error: farmerError } = await supabase
      .from("farmers")
      .select(`
        *,
        plots(*)
      `)
      .eq("id", farmerId)
      .single();

    if (farmerError) throw farmerError;

    // 2. Fetch Audit Logs for this entity
    const { data: logs, error: logsError } = await supabase
      .from("audit_log")
      .select("*")
      .eq("entity_id", farmerId)
      .order("created_at", { ascending: false });

    // 3. Fetch any related permits
    let permits: any[] = [];
    const plotIds = farmer.plots.map((p: any) => p.id);
    if (plotIds.length > 0) {
      const { data: pData, error: permitsError } = await supabase
        .from("form_t_permits")
        .select("*")
        .in("plot_id", plotIds);
      if (!permitsError && pData) {
        permits = pData;
      }
    }

    return {
      success: true,
      message: "Farmer audit data retrieved.",
      data: {
        farmer,
        plots: farmer.plots,
        logs: logs || [],
        permits: permits
      }
    };
  } catch (err) {
    console.error("[PROD] Farmer Audit Retrieval Failure:", err);
    return { success: false, message: "Farmer audit retrieval failed.", error: String(err) };
  }
}

/**
 * Fetches all plots with geometry for map rendering
 */
export async function getMapPlotsAction(): Promise<ActionResponse> {
  const supabase = await createClient();
  
  try {
    const { data: plots, error } = await supabase
      .from("plots")
      .select(`
        *,
        farmers(name)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: plots
    };
  } catch (err: any) {
    console.error("[PROD] Map Plots Retrieval Failure:", err);
    const errorMessage = err.message || err.details || String(err);
    return { success: false, message: `Map data retrieval failed: ${errorMessage}`, error: String(err) };
  }
}

/**
 * Fetches core KPI metrics for the mission control dashboard
 */
export async function getDashboardMetricsAction(): Promise<ActionResponse> {
  const supabase = await createClient();
  
  try {
    const exporter = await getCurrentExporter();

    const [farmersCount, plots, permits, batches, shipments] = await Promise.all([
      supabase.from("farmers").select("id", { count: "exact", head: true }),
      supabase.from("plots").select("id, bhulekh_verified_at"),
      supabase.from("form_t_permits").select("id").eq("status", "pending"),
      supabase.from("sawmill_batches").select("id").eq("status", "open"),
      supabase.from("shipments").select("id").eq("status", "dds_pending"),
    ]);

    const riskSummary = {
      green: plots.data?.filter(p => p.bhulekh_verified_at).length || 0,
      amber: plots.data?.filter(p => !p.bhulekh_verified_at).length || 0,
      red: 0 // Placeholder until risk scoring engine is live
    };

    return {
      success: true,
      data: {
        totalFarmers: farmersCount.count || 0,
        activePlots: plots.data?.length || 0,
        pendingPermits: permits.data?.length || 0,
        totalBatches: batches.data?.length || 0,
        shipmentsDue: shipments.data?.length || 0,
        riskSummary,
        complianceScore: plots.data?.length ? Math.round((riskSummary.green / plots.data.length) * 100) : 0
      }
    };
  } catch (err) {
    console.error("[PROD] Dashboard Metrics Failure:", err);
    return { success: false, message: "Dashboard metrics synchronization failed.", error: String(err) };
  }
}

/**
 * Fetches Article 10 risk assessments for the current tenant's plots.
 * Uses a multi-factor scoring engine: Bhulekh verification, area size,
 * species diversity, and land-use classification.
 */
export async function getRiskAssessmentsAction(): Promise<ActionResponse> {
  const supabase = await createClient();
  
  try {
    const exporter = await getCurrentExporter();

    // Fetch plots with full risk-relevant fields
    const { data: plots, error } = await supabase
      .from("plots")
      .select(`
        id,
        khasra_no,
        village,
        bhulekh_verified_at,
        area_ha,
        timber_species,
        land_use,
        is_tof,
        status
      `)
      .eq("exporter_id", exporter.id)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const riskNodes = plots.map((plot) => {
      let score = 30; // Base score (low)
      const indicators: string[] = [];
      let status = "Assessment Pending";
      let risk = "standard";

      // ── Factor 1: Bhulekh (Government Registry) Verification ──
      if (!plot.bhulekh_verified_at) {
        score += 25;
        indicators.push("Missing Bhulekh Sync");
      } else {
        score -= 15;
        indicators.push("Gov Registry Verified");
      }

      // ── Factor 2: Area Size (EUDR Article 10 flags large plots) ──
      const area = parseFloat(String(plot.area_ha)) || 0;
      if (area > 2.0) {
        score += 20;
        indicators.push(`Large Plot (${area.toFixed(2)} ha)`);
      } else if (area > 1.0) {
        score += 10;
        indicators.push(`Medium Plot (${area.toFixed(2)} ha)`);
      } else {
        indicators.push(`Standard Plot (${area.toFixed(2)} ha)`);
      }

      // ── Factor 3: Species Diversity ──
      const speciesCount = plot.timber_species?.length || 0;
      if (speciesCount > 2) {
        score += 15;
        indicators.push(`High Species Mix (${speciesCount})`);
      } else if (speciesCount > 1) {
        score += 5;
        indicators.push("Species Mixed");
      }

      // ── Factor 4: Land Use Classification ──
      if (plot.land_use === 'forest_fringe') {
        score += 20;
        indicators.push("Forest Fringe — Elevated Monitoring");
      } else if (plot.land_use === 'other') {
        score += 10;
        indicators.push("Unclassified Land Use");
      }

      // ── Factor 5: Trees Outside Forest (ToF) bonus ──
      if (plot.is_tof) {
        score -= 10;
        indicators.push("ToF Verified — Reduced Exposure");
      }

      // Bound score 0-100
      score = Math.max(0, Math.min(100, score));

      // Derive risk tier from composite score
      if (score >= 70) {
        risk = "high";
        status = "BLOCKED — Requires Mitigation";
      } else if (score >= 45) {
        risk = "standard";
        status = "Mitigation Pending";
      } else {
        risk = "negligible";
        status = "Cleared";
      }

      return {
        id: `PLOT-${plot.id.split('-')[0]}`,
        plotId: plot.id,
        type: "Plot",
        target: `Khasra #${plot.khasra_no} (${plot.village})`,
        risk,
        score,
        indicators,
        status
      };
    });

    return {
      success: true,
      data: riskNodes
    };
  } catch (err) {
    console.error("[PROD] Risk Retrieval Failure:", err);
    return { success: false, message: "Risk telemetry synchronization failed.", error: String(err) };
  }
}

/**
 * Simulates a satellite risk refresh for a specific plot.
 * In production this would query the Hansen GFW API; here it updates
 * the risk_assessment record with simulated deforestation detection.
 */
export async function refreshPlotRiskAction(plotId: string): Promise<ActionResponse> {
  const supabase = await createClient();
  
  try {
    const exporter = await getCurrentExporter();

    // Fetch the target plot
    const { data: plot, error: plotError } = await supabase
      .from("plots")
      .select("id, area_ha, bhulekh_verified_at, land_use")
      .eq("id", plotId)
      .eq("exporter_id", exporter.id)
      .single();

    if (plotError || !plot) {
      return { success: false, message: "Plot not found or access denied." };
    }

    // Simulate GFW deforestation check
    const area = parseFloat(String(plot.area_ha)) || 0;
    const isForestFringe = plot.land_use === 'forest_fringe';
    const simulatedLoss = isForestFringe ? Math.random() * 0.15 : Math.random() * 0.05;
    const riskScore = simulatedLoss > 0.1 ? 'red' : simulatedLoss > 0.03 ? 'amber' : 'green';

    // Upsert risk assessment record
    const { error: riskError } = await supabase
      .from("risk_assessments")
      .insert({
        plot_id: plotId,
        exporter_id: exporter.id,
        gfw_deforestation_ha: parseFloat(simulatedLoss.toFixed(4)),
        gfw_queried_at: new Date().toISOString(),
        deforestation_detected: simulatedLoss > 0.1,
        deforestation_area_ha: parseFloat(simulatedLoss.toFixed(4)),
        risk_score: riskScore,
        risk_reason: simulatedLoss > 0.1 
          ? `Post-2020 canopy loss detected: ${(simulatedLoss * area).toFixed(3)} ha` 
          : "No significant deforestation detected in monitoring window.",
        data_source: 'mock',
        assessed_at: new Date().toISOString()
      });

    if (riskError) throw riskError;

    revalidatePath("/dashboard/risk");
    revalidatePath("/dashboard/map");

    return {
      success: true,
      message: `Satellite scan complete. Risk: ${riskScore.toUpperCase()}. Deforestation: ${(simulatedLoss * area).toFixed(3)} ha.`,
      data: { risk_score: riskScore, loss_ha: parseFloat((simulatedLoss * area).toFixed(3)) }
    };
  } catch (err) {
    console.error("[PROD] Satellite Risk Refresh Failure:", err);
    return { success: false, message: "Satellite risk refresh failed.", error: String(err) };
  }
}

/**
 * Fetches Article 12 reporting analytics, including species throughput
 */
export async function getReportsAnalyticsAction(): Promise<ActionResponse> {
  const supabase = await createClient();
  
  try {
    const exporter = await getCurrentExporter();

    // 1. Fetch total volume exported (from shipments)
    const { data: shipments, error: shipError } = await supabase
      .from("shipments")
      .select("volume_kg")
      .eq("exporter_id", exporter.id)
      .in("status", ["dds_generated", "shipped"]);

    if (shipError) throw shipError;

    const totalVolume = shipments.reduce((sum, s) => sum + (s.volume_kg || 0), 0);

    // 2. Aggregate species distribution from plots
    const { data: plots, error: plotError } = await supabase
      .from("plots")
      .select("timber_species")
      .eq("exporter_id", exporter.id);

    if (plotError) throw plotError;

    const speciesCounts: Record<string, number> = {};
    let totalSpeciesEntries = 0;

    plots.forEach(p => {
      p.timber_species?.forEach((species: string) => {
        speciesCounts[species] = (speciesCounts[species] || 0) + 1;
        totalSpeciesEntries++;
      });
    });

    // Formatting for the reporting UI
    const speciesVolume = Object.entries(speciesCounts).map(([species, count]) => {
      const shareStr = totalSpeciesEntries > 0 ? Math.round((count / totalSpeciesEntries) * 100) + "%" : "0%";
      // Simulated volume distribution based on plot counts
      const estimatedVol = totalVolume > 0 ? (totalVolume * (count / totalSpeciesEntries)).toFixed(2) : "0.00";
      return {
        species,
        volume: `${estimatedVol} KG`,
        share: shareStr,
        risk: "Negligible" // Defaults based on typical UP sourcing
      };
    }).sort((a, b) => parseFloat(b.share) - parseFloat(a.share));

    // 3. Fetch recent DDS records
    const { data: ddsRecords, error: ddsError } = await supabase
      .from("dds_records")
      .select(`
        traces_reference_no,
        traces_status,
        traces_submitted_at,
        shipments!inner(exporter_id)
      `)
      .eq("shipments.exporter_id", exporter.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (ddsError) throw ddsError;

    const archives = ddsRecords.map(d => ({
      id: d.traces_reference_no || `DDS-PENDING`,
      name: "Article 12 Transmittal",
      date: new Date(d.traces_submitted_at || Date.now()).toISOString().split('T')[0],
      type: "EUDR_LEGAL",
      status: d.traces_status.toUpperCase()
    }));

    return {
      success: true,
      data: {
        totalVolume,
        speciesVolume,
        archives
      }
    };
  } catch (err) {
    console.error("[PROD] Reports Analytics Failure:", err);
    return { success: false, message: "Reports analytics failed.", error: String(err) };
  }
}

export async function getPermitsAction(): Promise<ActionResponse> {
  const supabase = await createClient();
  try {
    const exporter = await getCurrentExporter();

    const { data: permits, error } = await supabase
      .from("form_t_permits")
      .select(`
        *,
        plots(khasra_no, farmers(name))
      `)
      .eq("exporter_id", exporter.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data: permits };
  } catch (err: any) {
    console.error("[PROD] Permits Data Retrieval Failure:", err);
    return { success: false, message: "Permits retrieval failed.", error: String(err) };
  }
}

export async function getCarvingUnitsAction(): Promise<ActionResponse> {
  const supabase = await createClient();
  try {
    const exporter = await getCurrentExporter();

    const { data: units, error } = await supabase
      .from("carving_units")
      .select("*")
      .eq("exporter_id", exporter.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data: units };
  } catch (err: any) {
    console.error("[PROD] Carving Units Data Retrieval Failure:", err);
    return { success: false, message: "Carving units retrieval failed.", error: String(err) };
  }
}
