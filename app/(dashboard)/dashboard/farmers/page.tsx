"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  TreePine,
  MapPin,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MoreHorizontal,
  History,
  FileSpreadsheet,
  Globe,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getFarmersAction } from "@/lib/actions/compliance";
import { useEffect } from "react";

// Mock data removed for production - now fetching from Supabase

export default function FarmersPage() {
  const [query, setQuery] = useState("");
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getFarmersAction();
      if (res.success) {
        setFarmers(res.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = farmers.filter(
    (p: any) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.village.toLowerCase().includes(query.toLowerCase()) ||
      p.khasra_no.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* 1. Header Area */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white z-10">
        <div>
          <span className="op-label !mb-0 text-forest-900">Supply Chain Source Registry</span>
          <h1 className="text-xl font-bold uppercase tracking-widest">Farmer & Asset Ledger</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 px-4 py-1.5 border border-border bg-khaki-100/30 font-mono text-[10px] font-bold">
             <div className="flex items-center gap-1.5 text-forest-900">
                <Database className="h-3 w-3" /> REGISTERED: {farmers.length}
             </div>
              <div className="flex items-center gap-1.5 text-emerald-600">
                 <CheckCircle2 className="h-3 w-3" /> VERIFIED: {farmers.reduce((s: number, f: any) => s + (f.plots?.filter((p: any) => p.bhulekh_verified_at).length ?? 0), 0)} PLOTS
              </div>
          </div>
          <Link href="/dashboard/farmers/new">
            <Button className="h-9 bg-forest-900 text-khaki-100 px-6 text-xs uppercase tracking-widest font-bold rounded-none hover:bg-forest-800 transition-all">
              <Plus className="h-4 w-4 mr-2" /> Add New Registry Node
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Tactical Toolbar */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-border bg-khaki-100/10">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by UID, Khasra, or Village..."
            className="pl-9 h-8 text-[11px] font-mono tracking-tight rounded-none border-border bg-white uppercase"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="h-8 text-[10px] uppercase font-bold rounded-none border-border bg-white">
              <Filter className="h-3 w-3 mr-1.5" /> Registry Filter
           </Button>
           <Button variant="outline" className="h-8 text-[10px] uppercase font-bold rounded-none border-border bg-white">
              <FileSpreadsheet className="h-3 w-3 mr-1.5" /> Export Manifest
           </Button>
           <Button variant="outline" className="h-8 text-[10px] uppercase font-bold rounded-none border-border bg-white">
              <Globe className="h-3 w-3 mr-1.5" /> Bhulekh Sync
           </Button>
        </div>
      </div>

      {/* 3. Main Registry Table */}
      <div className="flex-1 overflow-auto p-6 bg-khaki-100/10">
         <div className="bg-white border border-border overflow-hidden shadow-sm">
            <table className="w-full border-collapse text-left">
               <thead className="bg-khaki-100/30 border-b border-border">
                  <tr>
                     <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-khaki-700">Audit Status</th>
                     <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-khaki-700">Farmer / Legal Node</th>
                     <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-khaki-700">Village / Tehsil</th>
                     <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-khaki-700">Assets (Plots)</th>
                     <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-khaki-700">Total Area</th>
                     <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-khaki-700 text-right">Actions</th>
                  </tr>
               </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                         <div className="flex flex-col items-center gap-4">
                            <Clock className="h-8 w-8 animate-spin text-khaki-400" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Synchronizing Registry...</p>
                         </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                         <div className="flex flex-col items-center gap-4">
                            <Plus className="h-8 w-8 text-khaki-300" />
                            <div>
                               <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">No Registry Entries Found</p>
                               <Link href="/dashboard/farmers/new" className="text-forest-900 underline text-[10px] font-bold uppercase tracking-tight mt-1">Add your first farmer node →</Link>
                            </div>
                         </div>
                      </td>
                    </tr>
                  ) : filtered.map((farmer) => {
                    const allVerified = farmer.plots?.every((p: any) => p.bhulekh_verified_at) ?? false;
                    const hasRisk = farmer.plots?.some((p: any) => p.risk_score === 'red') ?? false;
                    
                    return (
                      <tr key={farmer.id} className="hover:bg-khaki-100/10 transition-colors group">
                         <td className="px-6 py-5 whitespace-nowrap">
                            <div className={cn(
                              "h-10 w-10 flex items-center justify-center border-2 rotate-45 transition-colors",
                              hasRisk ? "border-red-600 bg-red-50 text-red-600" :
                              allVerified ? "border-emerald-600 bg-emerald-50 text-emerald-600" :
                              "border-khaki-300 bg-khaki-50 text-khaki-400"
                            )}>
                               <div className="-rotate-45">
                                 {hasRisk ? <AlertTriangle className="h-4 w-4" /> :
                                  allVerified ? <CheckCircle2 className="h-4 w-4" /> :
                                  <Clock className="h-4 w-4" />}
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-5">
                            <p className="text-xs font-bold uppercase text-forest-900 tracking-tight">{farmer.name}</p>
                            <p className="font-mono text-[10px] text-muted-foreground uppercase opacity-70">UID: IFIS-{farmer.id.substring(0, 4).toUpperCase()}</p>
                         </td>
                         <td className="px-6 py-5">
                            <p className="text-[11px] font-bold text-khaki-800 uppercase leading-tight">{farmer.village}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">{farmer.tehsil}, {farmer.district}</p>
                         </td>
                          <td className="px-6 py-5">
                             <div className="flex gap-1 flex-wrap max-w-xs">
                                {farmer.plots?.map((plot: any) => (
                                  <div key={plot.id} className={cn(
                                    "px-2 py-0.5 border text-[9px] font-mono font-bold uppercase tracking-tighter",
                                    plot.risk_score === 'green' ? "bg-emerald-50 border-emerald-500 text-emerald-800" :
                                    plot.risk_score === 'red' ? "bg-red-50 border-red-500 text-red-800" :
                                    "bg-khaki-100 border-khaki-500 text-khaki-800"
                                  )}>
                                     K-{plot.khasra_no}
                                  </div>
                                ))}
                                {(!farmer.plots || farmer.plots.length === 0) && <span className="text-[8px] font-bold text-muted-foreground uppercase">No Plots Linked</span>}
                                <button className="h-4 w-4 border border-border bg-white flex items-center justify-center rounded-none text-[10px] font-bold hover:bg-forest-900 hover:text-white transition-colors">+</button>
                             </div>
                          </td>
                          <td className="px-6 py-5">
                             <div className="flex items-center gap-2">
                                <p className="font-mono text-xs font-bold">{(farmer.plots?.reduce((s: number, p: any) => s + (p.area_ha ?? 0), 0) ?? 0).toFixed(2)}</p>
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Hectares</span>
                             </div>
                          </td>
                         <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                               <Link href={`/dashboard/farmers/${farmer.id}`}>
                                 <Button variant="ghost" className="h-8 text-[10px] uppercase font-bold rounded-none border border-border bg-white hover:bg-forest-900 hover:text-khaki-100 transition-all">
                                    Audit Files
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
                  <span>Page Index: 001 - 040</span>
                  <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 bg-emerald-500 rounded-full" /> Remote Connection: UP Bhulekh (Stable)</span>
               </div>
               <span>Timestamp: {new Date().toISOString()}</span>
            </div>
         </div>
      </div>
    </div>
  );
}
