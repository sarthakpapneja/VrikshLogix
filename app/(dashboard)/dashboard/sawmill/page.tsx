"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Factory,
  QrCode,
  TreePine,
  ArrowRight,
  ChevronRight,
  Package,
  Truck,
  Search,
  Filter,
  MoreHorizontal,
  History,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import QRCode from "react-qr-code";
import { getSawmillBatchesAction } from "@/lib/actions/compliance";

// Mock data removed for production - now fetching from Supabase

type BatchStatus = "open" | "processing" | "dispatched" | "closed";

export default function SawmillPage() {
  const [query, setQuery] = useState("");
  const [showQR, setShowQR] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getSawmillBatchesAction();
      if (res.success) {
        setBatches(res.data);
      }
      setLoading(false);
    }
    load();
    setMounted(true);
  }, []);

  const filtered = batches.filter(
    (b) =>
      b.batch_qr_id.toLowerCase().includes(query.toLowerCase()) ||
      b.sawmill_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* 1. Controller Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white shadow-sm z-10">
        <div>
          <span className="op-label !mb-0 text-forest-900">Chain-of-Custody Processor</span>
          <h1 className="text-xl font-bold uppercase tracking-widest">Sawmill Batch Controller</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 px-4 py-1.5 border border-border bg-khaki-100/30 font-mono text-[10px] font-bold">
             <div className="flex items-center gap-1.5 text-forest-900">
                <Activity className="h-3 w-3" /> INPUT: {batches?.reduce((s, b) => s + (b.input_volume_cft ?? 0), 0).toFixed(0)} CFT
             </div>
             <div className="flex items-center gap-1.5 text-bark-600">
                <MoreHorizontal className="h-3 w-3" /> YIELD: 68% AVG
             </div>
          </div>
          <Link href="/dashboard/sawmill/new">
            <Button className="h-9 bg-forest-900 text-khaki-100 px-6 text-xs uppercase tracking-widest font-bold rounded-none hover:bg-forest-800 transition-all">
              <Plus className="h-4 w-4 mr-2" /> Initialize New Batch
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Tactical Filters & Search */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-border bg-khaki-100/10">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search Batch ID / Sawmill Node..."
            className="pl-9 h-8 text-[11px] font-mono tracking-tight rounded-none border-border bg-white uppercase"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="h-8 text-[10px] uppercase font-bold rounded-none border-border bg-white">
              <Filter className="h-3 w-3 mr-1.5" /> Filter Status
           </Button>
           <Button variant="outline" className="h-8 text-[10px] uppercase font-bold rounded-none border-border bg-white">
              <History className="h-3 w-3 mr-1.5" /> Audit History
           </Button>
        </div>
      </div>

      {/* 3. Batch Ledger / Registry Table */}
      <div className="flex-1 overflow-auto p-6 bg-khaki-100/10">
        <div className="bg-white border border-border overflow-hidden shadow-sm">
          <table className="w-full border-collapse text-left">
            <thead className="bg-khaki-100/30 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-khaki-700">Batch ID</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-khaki-700">Sawmill Facility</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-khaki-700">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-khaki-700">IO Volume (CFT)</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-khaki-700">Lineage Summary</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-khaki-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                   <td colSpan={6} className="px-4 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                         <QrCode className="h-8 w-8 animate-pulse text-khaki-400" />
                         <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Registry Synchronizing...</p>
                      </div>
                   </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-4 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                         <Plus className="h-8 w-8 text-khaki-300" />
                         <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">No Processed Batches Found</p>
                            <Link href="/dashboard/sawmill/new" className="text-forest-900 underline text-[10px] font-bold uppercase tracking-tight mt-1">Initialize your first batch →</Link>
                         </div>
                      </div>
                   </td>
                </tr>
              ) : filtered.map((batch) => (
                <tr key={batch.id} className="hover:bg-khaki-100/10 group transition-colors">
                  <td className="px-4 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                       <div className="h-8 w-8 border border-border bg-khaki-200/20 flex items-center justify-center">
                          <QrCode className="h-4 w-4 text-forest-900" />
                       </div>
                       <div>
                          <p className="font-mono text-xs font-bold text-forest-900 uppercase">{batch.batch_qr_id}</p>
                          <p className="text-[9px] text-muted-foreground uppercase font-mono tracking-tighter">Processed: {batch.processing_date}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <p className="font-bold text-xs uppercase text-forest-900">{batch.sawmill_name}</p>
                    <p className="text-[10px] text-muted-foreground truncate max-w-64 italic">{batch.sawmill_address}</p>
                  </td>
                  <td className="px-4 py-5 whitespace-nowrap">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 border text-[9px] font-mono font-bold uppercase tracking-tighter",
                      batch.status === 'dispatched' ? "bg-emerald-50 border-emerald-500 text-emerald-900" :
                      batch.status === 'processing' ? "bg-amber-50 border-amber-500 text-amber-900" :
                      "bg-khaki-100 border-khaki-500 text-khaki-900"
                    )}>
                      <span className={cn(
                        "h-1.5 w-1.5 rounded-full animate-pulse",
                        batch.status === 'dispatched' ? "bg-emerald-600" :
                        batch.status === 'processing' ? "bg-amber-600" :
                        "bg-khaki-600"
                      )} />
                      {batch.status}
                    </div>
                  </td>
                  <td className="px-4 py-5 font-mono text-xs">
                    <div className="flex items-center gap-2">
                       <span className="text-khaki-600">IN:</span>
                       <span className="font-bold">{batch.input_volume_cft}</span>
                    </div>
                    {batch.output_volume_cft > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-khaki-600">OUT:</span>
                         <span className="font-bold text-forest-900">{batch.output_volume_cft}</span>
                         <span className="text-[9px] font-bold text-emerald-600">({Math.round((batch.output_volume_cft / batch.input_volume_cft) * 100)}%)</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-5 whitespace-nowrap">
                    <div className="flex -space-x-1.5">
                      {batch.batch_inputs?.map((inp: any, i: number) => (
                        <div key={i} className="h-7 w-7 border border-border bg-white flex items-center justify-center rounded-none shadow-sm" title={`Khasra: ${inp.plots?.khasra_no}`}>
                          <TreePine className="h-3.5 w-3.5 text-forest-900" />
                        </div>
                      ))}
                      {(!batch.batch_inputs || batch.batch_inputs.length === 0) && (
                         <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-40 italic">Direct Entry</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-2">
                       <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border border-border hover:bg-khaki-100" onClick={() => setShowQR(batch.batch_qr_id)}>
                         <QrCode className="h-4 w-4" />
                       </Button>
                       <Link href={`/dashboard/sawmill/${batch.id}`}>
                         <Button variant="ghost" className="h-8 text-[10px] uppercase font-bold rounded-none border border-border hover:bg-forest-900 hover:text-khaki-100 transition-all">
                           Trace Lineage
                         </Button>
                       </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-khaki-100/20 border-t border-border flex justify-between items-center text-[10px] font-mono text-khaki-600">
             <span>Registry Page: 01 / 01</span>
             <span>Refreshed: {mounted ? new Date().toLocaleTimeString() : "--:--:--"}</span>
          </div>
        </div>
      </div>

      {/* QR Modal Overlay */}
      {showQR && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-forest-900/60 backdrop-blur-[2px]"
          onClick={() => setShowQR(null)}
        >
          <div className="bg-white border border-forest-900 p-8 flex flex-col items-center gap-6 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <div className="absolute -top-4 -left-4 bg-forest-900 text-khaki-100 px-3 py-1 text-[10px] font-mono uppercase tracking-widest">
               Encrypted Batch Identifier
            </div>
            <div>
              <p className="font-bold text-sm uppercase text-center mb-6 tracking-widest">Digital Twin Access QR</p>
              <div className="p-4 border-2 border-border bg-white">
                <QRCode value={showQR} size={180} />
              </div>
            </div>
            <div className="w-full space-y-2">
               <span className="op-label !mb-0 text-center">Batch Unique Hash</span>
               <p className="text-xs font-mono font-bold text-center uppercase border border-border p-2 bg-khaki-100">{showQR}</p>
            </div>
            <p className="text-[9px] text-muted-foreground text-center max-w-64 leading-tight uppercase font-medium">
              Scanning this code provides immediate visibility into land-of-origin, risk score, and species audit data.
            </p>
            <Button variant="outline" className="w-full rounded-none border-forest-900 text-forest-900 uppercase font-bold text-xs" onClick={() => setShowQR(null)}>
              Terminate View
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
