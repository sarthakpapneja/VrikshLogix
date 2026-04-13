"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle,
  Globe,
  FileText,
  Search,
  Filter,
  ArrowUpRight,
  MoreHorizontal,
  Scale,
  Signature,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRiskAssessmentsAction, refreshPlotRiskAction } from "@/lib/actions/compliance";
import { toast } from "sonner";

export default function RiskCommandPage() {
  const [query, setQuery] = useState("");
  const [riskNodes, setRiskNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    async function loadRiskData() {
      try {
        const res = await getRiskAssessmentsAction();
        if (res.success && res.data) {
          setRiskNodes(res.data);
        }
      } catch (err) {
        console.error("Failed to load risk telemetry", err);
      } finally {
        setLoading(false);
      }
    }
    loadRiskData();
  }, []);

  const handleSatelliteSweep = useCallback(async () => {
    if (riskNodes.length === 0) {
      toast.warning("No plots in registry", { description: "Seed data via Platform Setup first." });
      return;
    }
    setScanning(true);
    toast.loading("Initiating satellite constellation sweep...");
    try {
      // Fire risk refresh for all plots with plotId
      const plotIds = riskNodes.filter(n => n.plotId).map(n => n.plotId);
      const results = await Promise.all(plotIds.map(id => refreshPlotRiskAction(id)));
      
      const succeeded = results.filter(r => r.success).length;
      toast.dismiss();
      toast.success(`Sweep Complete: ${succeeded}/${plotIds.length} plots assessed`, {
        description: "Risk telemetry refreshed. Reloading matrix...",
      });

      // Reload the risk data
      const res = await getRiskAssessmentsAction();
      if (res.success && res.data) {
        setRiskNodes(res.data);
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Satellite sweep failed", { description: String(err) });
    } finally {
      setScanning(false);
    }
  }, [riskNodes]);

  const highRiskCount = riskNodes.filter(n => n.risk === 'high').length;
  const clearedCount = riskNodes.filter(n => n.risk === 'negligible').length;
  const mitigationVelocity = riskNodes.length > 0 
    ? Math.round((clearedCount / riskNodes.length) * 100)
    : 0;
  
  // Calculate a simplified threat index based on the proportion of high risk nodes
  const threatIndex = riskNodes.length > 0
    ? (1 + (highRiskCount / riskNodes.length) * 2).toFixed(2)
    : "1.00";

  if (loading) {
     return (
        <div className="flex flex-col h-screen items-center justify-center bg-background">
           <div className="animate-pulse flex flex-col items-center">
              <Database className="h-8 w-8 text-khaki-400 mb-4 animate-spin" />
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">Aggregating Article 10 Telemetry...</p>
           </div>
        </div>
     );
  }

  const filteredNodes = riskNodes.filter(n => 
    n.id.toLowerCase().includes(query.toLowerCase()) || 
    n.target.toLowerCase().includes(query.toLowerCase()) ||
    n.indicators.some((ind: string) => ind.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* 1. Risk HUD Header */}
      <div className="grid grid-cols-4 border-b border-border bg-white shadow-sm h-24">
         <div className="flex flex-col justify-center px-6 border-r border-border">
            <span className="op-label !mb-0 text-forest-900">Regional Threat Index</span>
            <div className="flex items-baseline gap-2 mt-1">
               <span className="text-2xl font-bold font-mono">{threatIndex}</span>
               <span className="text-[10px] font-bold text-emerald-600 uppercase">Monitoring Live</span>
            </div>
         </div>
         <div className="flex flex-col justify-center px-6 border-r border-border bg-khaki-100/10">
            <span className="op-label !mb-0 text-forest-900">Active High Risk Nodes</span>
            <div className="flex items-baseline gap-2 mt-1">
               <span className={cn("text-2xl font-bold font-mono", highRiskCount > 0 ? "text-amber-600" : "text-emerald-600")}>
                 {String(highRiskCount).padStart(2, '0')}
               </span>
               <span className="text-[10px] font-bold text-muted-foreground uppercase">/ {riskNodes.length} total</span>
            </div>
         </div>
         <div className="flex flex-col justify-center px-6 border-r border-border">
            <span className="op-label !mb-0 text-forest-900">Mitigation Velocity</span>
            <div className="flex items-baseline gap-2 mt-1">
               <span className="text-2xl font-bold font-mono">{mitigationVelocity}%</span>
               <span className="text-[10px] font-bold text-muted-foreground uppercase">Compliance Target: 100%</span>
            </div>
         </div>
         <div className="flex flex-col justify-center px-6 bg-forest-900 text-khaki-100">
            <span className="text-[9px] font-bold uppercase tracking-widest text-khaki-600">Article 10 Protocol</span>
            <h1 className="text-sm font-bold uppercase tracking-widest mt-0.5">Risk Command Center</h1>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Mitigation Action Terminal */}
        <div className="w-[320px] bg-white border-r border-border flex flex-col p-6 space-y-8 overflow-y-auto">
           <section className="space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-khaki-600">Operations Feed</span>
              <div className="space-y-4 border-l border-border pl-4">
                 {[
                   { time: "09:42", msg: "Satellite Delta: Plot_241 (A_12)", type: "warning" },
                   { time: "11:15", msg: "Bhulekh Sync: Verified (Batch_102)", type: "success" },
                   { time: "14:22", msg: "Species Flag: Dalbergia Nigra suspected", type: "alert" },
                   { time: "16:05", msg: "EU Port Reject: Missing Geo_Hash", type: "alert" },
                 ].map((log, i) => (
                   <div key={i} className="relative">
                      <div className={cn(
                        "absolute -left-[21px] top-1.5 h-2 w-2 rounded-full",
                        log.type === 'warning' ? 'bg-amber-400' : log.type === 'alert' ? 'bg-red-500' : 'bg-emerald-500'
                      )} />
                      <p className="text-[10px] font-mono font-bold text-muted-foreground">{log.time}</p>
                      <p className="text-[11px] font-bold uppercase mt-0.5 leading-tight">{log.msg}</p>
                   </div>
                 ))}
              </div>
           </section>

           <section className="p-4 border border-border bg-khaki-100/20 space-y-3">
              <div className="flex items-center gap-2 text-forest-900">
                 <Scale className="h-4 w-4" />
                 <span className="text-[11px] font-bold uppercase">Article 11 Evidence</span>
              </div>
              <p className="text-[9px] text-muted-foreground uppercase leading-tight">Operators must establish a framework for risk mitigation including additional data collection and third-party audits.</p>
              <Button size="sm" variant="outline" className="w-full h-8 text-[10px] uppercase font-bold rounded-none border-border bg-white active:scale-95 transition-all">
                INIT_AUDIT_LOG
              </Button>
           </section>
        </div>

        {/* Right: Risk Matrix Table */}
        <div className="flex-1 flex flex-col overflow-hidden bg-khaki-100/10">
           <div className="p-6 border-b border-border flex justify-between items-center bg-white/50 backdrop-blur-sm">
              <div className="relative max-w-sm flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                 <input 
                    placeholder="SEARCH_BY_NODE_ID_OR_INDICATION..."
                    className="w-full h-9 bg-white border border-border outline-none pl-9 text-[11px] font-bold font-mono uppercase tracking-tight"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                 />
              </div>
              <div className="flex items-center gap-2">
                 <Button variant="outline" className="h-9 text-[10px] uppercase font-bold rounded-none border-border bg-white">
                    <Filter className="h-3 w-3 mr-2" /> REQ_ARTICLE_10
                 </Button>
                 <Button 
                    variant="outline" 
                    className={cn("h-9 text-[10px] uppercase font-bold rounded-none border-border bg-white", scanning && "animate-pulse border-amber-500 text-amber-600")}
                    onClick={handleSatelliteSweep}
                    disabled={scanning}
                 >
                    <Activity className={cn("h-3 w-3 mr-2", scanning && "animate-spin")} /> {scanning ? "SCANNING..." : "SATELLITE_LIVE"}
                 </Button>
              </div>
           </div>

           <div className="flex-1 overflow-auto p-8">
              <div className="bg-white border border-border shadow-sm">
                 <table className="w-full border-collapse">
                    <thead className="bg-khaki-100/30 border-b border-border">
                       <tr>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-khaki-700 text-left">Level</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-khaki-700 text-left">Subject Node</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-khaki-700 text-left">Article 10 Score</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-khaki-700 text-left">Flagged Indicators</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-khaki-700 text-left">Audit State</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-khaki-700 text-right">Terminal</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                       {filteredNodes.length === 0 ? (
                         <tr>
                           <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                             {query ? "No active risk nodes match the query." : "No nodes currently exist in the Article 10 telemetry registry."}
                           </td>
                         </tr>
                       ) : filteredNodes.map((node) => (
                         <tr key={node.id} className="group hover:bg-khaki-100/10 transition-colors">
                            <td className="px-6 py-5">
                               <div className={cn(
                                 "h-1.5 w-8 rounded-none",
                                 node.risk === 'high' ? 'bg-red-500' : node.risk === 'standard' ? 'bg-amber-400' : 'bg-emerald-500'
                               )} />
                            </td>
                            <td className="px-6 py-5">
                               <p className="font-mono text-xs font-bold text-forest-900 uppercase">{node.id} :: {node.type}</p>
                               <p className="text-[10px] font-bold uppercase text-muted-foreground mt-0.5">{node.target}</p>
                            </td>
                            <td className="px-6 py-5">
                               <div className="flex items-center gap-3">
                                  <div className="flex-1 h-2 max-w-[100px] border border-border bg-khaki-100">
                                     <div className={cn(
                                       "h-full transition-all duration-500",
                                       node.score > 70 ? 'bg-red-500' : node.score > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                                     )} style={{ width: `${node.score}%` }} />
                                  </div>
                                  <span className="font-mono text-[11px] font-bold">{node.score}</span>
                               </div>
                            </td>
                            <td className="px-6 py-5">
                               <div className="flex flex-wrap gap-1">
                                  {node.indicators.map((ind: string, i: number) => (
                                    <span key={i} className="px-2 py-0.5 border border-border bg-khaki-100/50 text-[9px] font-bold uppercase text-khaki-700">
                                       {ind}
                                    </span>
                                  ))}
                               </div>
                            </td>
                            <td className="px-6 py-5">
                               <div className="flex items-center gap-2">
                                  {node.risk === 'high' ? (
                                    <AlertTriangle className="h-3 w-3 text-red-500 animate-pulse" />
                                  ) : node.risk === 'standard' ? (
                                    <Activity className="h-3 w-3 text-amber-500" />
                                  ) : (
                                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                  )}
                                  <span className="text-[10px] font-bold uppercase text-forest-900">{node.status}</span>
                               </div>
                            </td>
                            <td className="px-6 py-5 text-right">
                               <Button variant="ghost" className="h-8 w-8 rounded-none border border-border border-transparent group-hover:border-border transition-colors">
                                  <ArrowUpRight className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" className="h-8 w-8 rounded-none border border-border border-transparent group-hover:border-border transition-colors ml-1">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
