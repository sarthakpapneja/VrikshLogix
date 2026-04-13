"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Ship,
  FileText,
  CheckCircle2,
  Clock,
  ChevronRight,
  AlertTriangle,
  Download,
  Send,
  Search,
  Filter,
  Globe,
  MoreHorizontal,
  Package,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { getShipmentsAction } from "@/lib/actions/compliance";

// Mock data removed for production - now fetching from Supabase

const COUNTRY_FLAGS: Record<string, string> = { DE: "🇩🇪", NL: "🇳🇱", FR: "🇫🇷", GB: "🇬🇧", IT: "🇮🇹", ES: "🇪🇸" };

export default function ShipmentsPage() {
  const [query, setQuery] = useState("");
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getShipmentsAction();
      if (res.success) {
        setShipments(res.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = shipments.filter(
    (s) =>
      s.shipment_ref.toLowerCase().includes(query.toLowerCase()) ||
      s.eu_buyer_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* 1. Terminal Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white shadow-sm z-10">
        <div>
          <span className="op-label !mb-0 text-forest-900">Outbound Compliance Gateway</span>
          <h1 className="text-xl font-bold uppercase tracking-widest">Post-Processing Terminal</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 px-4 py-1.5 border border-border bg-khaki-100/30 font-mono text-[10px] font-bold">
             <div className="flex items-center gap-1.5 text-forest-900">
                <Ship className="h-3 w-3" /> ACTIVE: {shipments.length}
             </div>
             <div className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 className="h-3 w-3" /> DDS_SYNCED: {shipments.filter(s=>s.status==='submitted').length}
             </div>
          </div>
          <Link href="/dashboard/shipments/new">
            <Button className="h-9 bg-forest-900 text-khaki-100 px-6 text-xs uppercase tracking-widest font-bold rounded-none hover:bg-forest-800 transition-all">
              <Plus className="h-4 w-4 mr-2" /> NEW_MANIFEST
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Tactical Filters */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-border bg-khaki-100/10">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            placeholder="SEARCH_BY_REF_OR_BUYER..."
            className="pl-9 w-full h-8 bg-white border border-border outline-none text-[11px] font-mono font-bold tracking-tight uppercase"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="h-8 text-[10px] uppercase font-bold rounded-none border-border bg-white">
              <Filter className="h-3 w-3 mr-1.5" /> REQ_LEVEL
           </Button>
           <Button variant="outline" className="h-8 text-[10px] uppercase font-bold rounded-none border-border bg-white">
              <Globe className="h-3 w-3 mr-1.5" /> BUYER_DIST
           </Button>
           <Button variant="outline" className="h-8 text-[10px] uppercase font-bold rounded-none border-border bg-white">
              <Package className="h-3 w-3 mr-1.5" /> HS_CATALOG
           </Button>
        </div>
      </div>

      {/* 3. Logistics Ledger Table */}
      <div className="flex-1 overflow-auto p-6 bg-khaki-100/10">
        <div className="bg-white border border-border overflow-hidden shadow-sm">
           <table className="w-full border-collapse text-left">
              <thead className="bg-khaki-100/30 border-b border-border">
                 <tr>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-khaki-700">DDS State</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-khaki-700">Shipment Reference</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-khaki-700">Buyer / Destination</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-khaki-700">Load Analytics</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-khaki-700">Article 9 Status</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-khaki-700 text-right">Gatekeeper</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-border">
                 {loading ? (
                    <tr>
                       <td colSpan={6} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-4">
                             <Ship className="h-8 w-8 animate-bounce text-khaki-400" />
                             <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Terminal Synchronizing...</p>
                          </div>
                       </td>
                    </tr>
                 ) : filtered.length === 0 ? (
                    <tr>
                       <td colSpan={6} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-4">
                             <Package className="h-8 w-8 text-khaki-300" />
                             <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">No Manifests Registered</p>
                                <Link href="/dashboard/shipments/new" className="text-forest-900 underline text-[10px] font-bold uppercase tracking-tight mt-1">Generate your first manifest →</Link>
                             </div>
                          </div>
                       </td>
                    </tr>
                 ) : filtered.map((shipment) => {
                    const isSubmitted = shipment.status === 'submitted' || shipment.status === 'dds_generated';
                   const isPending = shipment.status === 'dds_pending';
                   
                   return (
                     <tr key={shipment.id} className="hover:bg-khaki-100/10 transition-colors group">
                        <td className="px-6 py-5 whitespace-nowrap">
                           <div className={cn(
                             "h-10 w-10 flex items-center justify-center border-2 rotate-45 transition-colors",
                             isSubmitted ? "border-emerald-600 bg-emerald-50 text-emerald-600" :
                             isPending ? "border-amber-600 bg-amber-50 text-amber-600" :
                             "border-khaki-300 bg-khaki-50 text-khaki-400"
                           )}>
                              <div className="-rotate-45">
                                {isSubmitted ? <CheckCircle2 className="h-4 w-4" /> :
                                 isPending ? <Activity className="h-4 w-4" /> :
                                 <FileText className="h-4 w-4" />}
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <p className="font-mono text-xs font-bold text-forest-900 uppercase">REF::{shipment.shipment_ref}</p>
                           <p className="text-[9px] text-muted-foreground uppercase font-mono tracking-tighter mt-1">Export Date: {shipment.shipment_date}</p>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-2">
                              <span className="text-sm shadow-sm">{COUNTRY_FLAGS[shipment.eu_buyer_country] || "🏠"}</span>
                              <p className="text-xs font-bold uppercase text-forest-900 tracking-tight">{shipment.eu_buyer_name}</p>
                           </div>
                           <p className="text-[10px] text-muted-foreground uppercase font-mono mt-1 font-bold">ISO_DEST: {shipment.eu_buyer_country} · {shipment.port_of_export}</p>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-khaki-700">
                                 <span className="font-mono">WT:</span> {shipment.volume_kg.toLocaleString()} KG
                              </div>
                              <div className="flex gap-1">
                                 {shipment.hs_codes.map(hs => (
                                   <span key={hs} className="px-1.5 py-0.5 border border-border bg-khaki-100 text-[9px] font-mono font-bold leading-none">{hs}</span>
                                 ))}
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2">
                                 <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                 <span className="text-[9px] font-bold uppercase tracking-widest text-forest-900">PROV_CHAIN: {shipment.plot_count} PLOTS</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <span className={cn("h-1.5 w-1.5 rounded-full", shipment.dds_ref ? "bg-emerald-500" : "bg-amber-400 animate-pulse")} />
                                 <span className="text-[9px] font-bold uppercase tracking-widest text-forest-900">
                                   DDS_REF: {shipment.dds_ref ? (
                                     <span className="font-mono">{shipment.dds_ref}</span>
                                   ) : "NOT_GENERATED"}
                                 </span>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <Link href={`/dashboard/shipments/${shipment.id}/dds`}>
                                <Button className={cn(
                                  "h-8 text-[10px] uppercase font-bold rounded-none border border-border transition-all",
                                  isSubmitted ? "bg-white text-forest-900 hover:bg-khaki-100" :
                                  "bg-forest-900 text-khaki-100 hover:bg-forest-800"
                                )}>
                                   {isSubmitted ? "VIEW_DDS_MANIFEST" : "AUDIT_&_SUBMIT_DDS"}
                                </Button>
                              </Link>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border border-border bg-white hover:bg-khaki-100">
                                 <MoreHorizontal className="h-4 w-4" />
                              </Button>
                           </div>
                        </td>
                     </tr>
                   );
                 })}
              </tbody>
           </table>
           <div className="px-6 py-3 bg-khaki-100/20 border-t border-border flex justify-between items-center text-[10px] font-mono text-khaki-600">
              <div className="flex items-center gap-6">
                 <span>LEGAL_RECORD: ARTICLE_9_COMPLIANCE</span>
                 <span className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                    EU TRACES NT Connection: Active
                 </span>
              </div>
              <span className="uppercase">Terminal_Sync: {new Date().toLocaleTimeString()}</span>
           </div>
        </div>
      </div>
    </div>
  );
}
