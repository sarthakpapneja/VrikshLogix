"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Satellite,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  Factory,
  MapPin,
  Leaf,
  XCircle,
  TreePine,
  FileText,
  Ship,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardMiniMap } from "@/components/dashboard/mini-map";
import { daysUntil, cn } from "@/lib/utils";
import { getDashboardMetricsAction, getMapPlotsAction } from "@/lib/actions/compliance";
import { PipelineNodeGraph } from "@/components/compliance/pipeline-graph";
import { parsePostGISPoint } from "@/lib/geo-utils";
import { toast } from "sonner";

export default function DashboardPage() {
  const deadlineDays = daysUntil("2026-12-30");
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [plots, setPlots] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const [metricsRes, plotsRes] = await Promise.all([
        getDashboardMetricsAction(),
        getMapPlotsAction()
      ]);

      if (metricsRes.success) setMetrics(metricsRes.data);
      if (plotsRes.success) setPlots(plotsRes.data);
      
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-khaki-100/10">
        <Loader2 className="h-10 w-10 animate-spin text-forest-900 mb-4" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-khaki-600 font-sans">Synchronizing Traceability Hub...</h2>
      </div>
    );
  }

  const kpiData = metrics || {
    activePlots: 0,
    pendingPermits: 0,
    shipmentsDue: 0,
    riskSummary: { green: 0, amber: 0, red: 0 },
    totalFarmers: 0,
    totalBatches: 0,
    complianceScore: 0
  };

  return (
    <div className="flex flex-col bg-background font-sans pb-24">
      {/* 1. System Header / Status Strip (Compact) */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-white text-[11px] font-mono tracking-tighter shadow-sm z-30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground uppercase">Exporter Mode:</span>
            <span className="font-bold text-forest-900">PRODUCTION_LIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground uppercase">Region:</span>
            <span className="font-bold">North India Cluster</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground uppercase">System Status:</span>
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              OPERATIONAL
            </span>
          </div>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-3 py-1 border border-amber-500/20 bg-amber-500/5",
          deadlineDays < 365 ? "text-amber-700" : "text-muted-foreground"
        )}>
          <Clock className="h-3 w-3" />
          <span className="uppercase">EUDR Deadline:</span>
          <span className="font-bold underline">{deadlineDays} Days Remaining</span>
        </div>
      </div>

      {/* 2. Top Metric Strip */}
      <div className="grid grid-cols-6 border-b border-border bg-khaki-100/20 divide-x divide-border shadow-inner">
        {[
          { label: "Active Plots", value: kpiData.activePlots, hindi: "सक्रिय भूमि" },
          { label: "Pending Permits", value: kpiData.pendingPermits, hindi: "लंबित परमिट", color: kpiData.pendingPermits > 0 ? "text-amber-600" : "text-emerald-600" },
          { label: "Compliance", value: `${kpiData.complianceScore}%`, hindi: "अनुपालन स्कोर" },
          { label: "Total Farmers", value: kpiData.totalFarmers, hindi: "कुल किसान" },
          { label: "Live Batches", value: kpiData.totalBatches, hindi: "सक्रिय बैच" },
          { label: "DDS Due", value: kpiData.shipmentsDue, hindi: "डीडीएस शेष", color: kpiData.shipmentsDue > 0 ? "text-red-700" : "text-emerald-600" },
        ].map((item) => (
          <div key={item.label} className="p-3 px-4 flex flex-col justify-center group hover:bg-white transition-colors cursor-default">
            <span className="op-label text-[10px] font-bold text-khaki-700 uppercase tracking-widest">{item.label}</span>
            <div className="flex items-baseline justify-between">
              <span className={cn("text-xl font-bold font-mono tracking-tighter", item.color || "text-forest-900")}>
                {String(item.value).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-khaki-600/60 font-medium group-hover:text-khaki-600">{item.hindi}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Supply Chain Tactical Strip (Rigid Engine Layout) */}
      <div className="flex h-[500px] min-h-[500px] border-b border-border bg-white shadow-lg relative">
        {/* Left: Tactical Map View */}
        <div className="basis-3/5 relative bg-khaki-200/5 group overflow-hidden border-r border-border h-full">
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
            <div className="bg-white/90 backdrop-blur border border-border p-1 flex flex-col gap-1 shadow-lg overflow-hidden ring-1 ring-black/5 pointer-events-auto">
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none bg-khaki-100 hover:bg-khaki-200"><MapPin className="h-4 w-4 text-forest-900" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none hover:bg-khaki-100"><Leaf className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none hover:bg-khaki-100"><Satellite className="h-4 w-4" /></Button>
            </div>
          </div>
          
          <DashboardMiniMap 
            plots={plots.map(p => {
               let lng = 77.563;
               let lat = 29.998;
               const coords = parsePostGISPoint(p.centroid);
               if (coords) {
                  [lng, lat] = coords;
               }
               return {
                  id: p.id,
                  lat,
                  lng,
                  risk_score: p.bhulekh_verified_at ? 'green' : 'amber',
                  khasra: p.khasra_no
               };
            })} 
          />
          
          <div className="absolute top-4 right-4 z-10">
             <Link href="/dashboard/map">
                <Button size="sm" className="h-8 bg-forest-900 text-khaki-100 px-4 text-[10px] uppercase font-bold rounded-none shadow-xl hover:bg-forest-800 transition-all font-sans">
                  Go to GIS Workbench <ArrowRight className="h-3 w-3 ml-2" />
                </Button>
             </Link>
          </div>
        </div>

        {/* Right: Operational Feed / Alerts */}
        <div className="w-96 bg-white flex flex-col overflow-hidden shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.02)]">
          <div className="p-4 border-b border-border bg-khaki-100/10">
            <span className="op-label flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-widest text-forest-900">
              <Bell className="h-3.5 w-3.5" /> Intelligence Feed
            </span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border/40">
            {plots.length === 0 ? (
               <div className="p-12 text-center flex flex-col items-center justify-center opacity-40">
                  <TreePine className="h-10 w-10 mb-4" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">No recent audit activity.</p>
               </div>
            ) : plots.slice(0, 10).map((plot, i) => (
              <div key={plot.id} className={cn(
                "p-5 hover:bg-khaki-100/10 transition-colors cursor-pointer group"
              )}>
                <div className="flex justify-between items-start mb-2">
                  <span className={cn(
                    "text-[8px] font-bold px-1.5 py-0.5 border uppercase tracking-wider",
                    plot.bhulekh_verified_at ? "bg-emerald-50 border-emerald-500 text-emerald-800" : "bg-amber-50 border-amber-500 text-amber-800"
                  )}>
                    {plot.bhulekh_verified_at ? 'VERIFIED' : 'PENDING'}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-muted-foreground">{new Date(plot.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <h5 className="text-[11px] font-extrabold text-forest-900 uppercase tracking-tight group-hover:underline">Asset Registry Update</h5>
                <p className="text-[10px] text-muted-foreground mt-1 leading-normal italic uppercase">Khasra {plot.khasra_no} in village {plot.village} synced from registry.</p>
                {!plot.bhulekh_verified_at && (
                  <div className="mt-2 text-[8px] text-amber-600 font-bold flex items-center gap-1 uppercase tracking-widest">
                    <AlertTriangle className="h-2.5 w-2.5" /> Article 9 Review Advised
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border bg-khaki-100/10">
            <Link href="/dashboard/farmers" className="block">
               <Button variant="outline" className="w-full text-[10px] h-10 rounded-none border-forest-900/20 uppercase tracking-widest font-bold shadow-sm hover:bg-forest-900 hover:text-white transition-all font-sans">
                 Access Full Audit Registry
               </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Bottom Zone: Supply Chain Pipeline (Tightened) */}
      <div className="bg-white border-t border-border mt-6 relative shadow-inner">
        <div className="px-4 py-2 border-b border-border bg-khaki-100/20 flex justify-between items-center bg-white shadow-sm ring-1 ring-black/5">
          <span className="op-label !mb-0 text-forest-900 font-bold uppercase text-[9px] tracking-[0.2em] underline decoration-khaki-500 underline-offset-4">Traceability Pipeline: Geo-origin to Export</span>
          <div className="flex gap-8">
             <span className="text-[8px] font-mono font-bold text-khaki-600/60 uppercase">Node: Saharanpur_Master_Hub</span>
             <span className="text-[8px] font-mono font-bold text-khaki-600/60 uppercase">Source: BHULEKH_V2.1_REST_ACTIVE</span>
          </div>
        </div>
        <div className="flex items-center justify-center bg-khaki-100/5 py-4">
           <PipelineNodeGraph />
        </div>
      </div>
    </div>
  );
}
