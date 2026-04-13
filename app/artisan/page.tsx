"use client";

import { useState } from "react";
import {
  Hammer,
  QrCode,
  Package,
  ArrowRight,
  Clock,
  CheckCircle2,
  TreePine,
  Activity,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const mockJobs = [
  { id: "JOB-7701", batch: "BTCH-SAH-102", product: "Carved Dining Chairs", status: "In Progress", species: "Sheesham", units: "0/12" },
  { id: "JOB-7705", batch: "BTCH-SAH-105", product: "Geometric Jali Screen", status: "Pending", species: "Sheesham", units: "0/1" },
];

export default function ArtisanDashboard() {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  function handleReceiveTimber() {
    toast.info("SCAN_MODE_INITIALIZED", {
      description: "Center the Sawmill QR code in your camera view.",
    });
  }

  return (
    <div className="p-5 space-y-6">
       {/* 1. Quick Stats / KPI HUD */}
       <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-border p-4 shadow-sm flex flex-col justify-between h-24">
             <span className="text-[10px] font-bold uppercase tracking-widest text-khaki-600">Pending Load</span>
             <p className="text-xl font-bold font-mono text-forest-900 leading-none">02 <span className="text-[9px] uppercase font-bold text-muted-foreground">Batches</span></p>
          </div>
          <div className="bg-white border border-border p-4 shadow-sm flex flex-col justify-between h-24">
             <span className="text-[10px] font-bold uppercase tracking-widest text-khaki-600">Cert. Units</span>
             <p className="text-xl font-bold font-mono text-emerald-600 leading-none">14 <span className="text-[9px] uppercase font-bold text-muted-foreground">Ready</span></p>
          </div>
       </div>

       {/* 2. Primary Mobile Activity */}
       <Button 
          className="w-full h-16 bg-forest-900 border-2 border-forest-800 text-khaki-100 flex items-center justify-between px-6 rounded-none shadow-xl active:scale-[0.98] transition-all"
          onClick={handleReceiveTimber}
       >
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 border border-white/20 bg-white/10 flex items-center justify-center">
                <QrCode className="h-6 w-6" />
             </div>
             <div className="text-left">
                <p className="text-sm font-bold uppercase tracking-widest">Receive Timber Load</p>
                <p className="text-[9px] font-mono text-khaki-600 uppercase">Validate Sawmill Handover</p>
             </div>
          </div>
          <ArrowRight className="h-5 w-5 opacity-50" />
       </Button>

       {/* 3. Task Switching */}
       <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-1">
             <div className="flex gap-4">
                <button 
                  onClick={() => setActiveTab('active')}
                  className={cn("text-[11px] font-bold uppercase tracking-widest pb-1 transition-all", activeTab === 'active' ? "text-forest-900 border-b-2 border-forest-900" : "text-muted-foreground")}
                >
                   Current Jobs
                </button>
                <button 
                  onClick={() => setActiveTab('history')}
                  className={cn("text-[11px] font-bold uppercase tracking-widest pb-1 transition-all", activeTab === 'history' ? "text-forest-900 border-b-2 border-forest-900" : "text-muted-foreground")}
                >
                   Completed
                </button>
             </div>
             <span className="text-[9px] font-mono font-bold text-khaki-600 uppercase tracking-tighter">WS_SYNC: READY</span>
          </div>

          <div className="space-y-4">
             {mockJobs.map((job) => (
                <div key={job.id} className="bg-white border border-border overflow-hidden shadow-sm active:bg-khaki-100/50 transition-colors">
                   <div className="p-4 flex items-center justify-between border-b border-border/50 bg-khaki-100/10">
                      <div className="flex items-center gap-3">
                         <div className="h-6 w-6 border border-border flex items-center justify-center bg-white rotate-45">
                            <Hammer className="h-3 w-3 text-forest-900 -rotate-45" />
                         </div>
                         <p className="font-mono text-[11px] font-bold uppercase text-forest-900">{job.id}</p>
                      </div>
                      <span className={cn(
                        "text-[9px] font-bold uppercase px-2 py-0.5 border border-border",
                        job.status === 'In Progress' ? "bg-emerald-50 text-emerald-700" : "bg-white text-muted-foreground"
                      )}>{job.status}</span>
                   </div>
                   <div className="p-4 space-y-4">
                      <div>
                         <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest leading-none">Product Output</p>
                         <p className="text-sm font-bold uppercase tracking-tight text-forest-900 mt-1">{job.product}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-4">
                         <div>
                            <p className="text-[9px] font-bold uppercase text-muted-foreground">Source Batch</p>
                            <p className="font-mono text-[10px] font-bold uppercase">{job.batch}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-bold uppercase text-muted-foreground">Units Carved</p>
                            <p className="font-mono text-[10px] font-bold uppercase">{job.units}</p>
                         </div>
                      </div>
                      <Button className="w-full h-10 bg-white border border-border text-forest-900 hover:bg-khaki-100 uppercase font-bold text-[10px] tracking-widest rounded-none">
                         LOG_CARVING_PROGRESS
                      </Button>
                   </div>
                </div>
             ))}

             {activeTab === 'active' && (
                <Button variant="ghost" className="w-full h-12 border-2 border-dashed border-border rounded-none text-muted-foreground flex items-center justify-center gap-2 hover:bg-khaki-100/50">
                   <Plus className="h-4 w-4" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Assign to New Batch</span>
                </Button>
             )}
          </div>
       </div>

       {/* 4. Regulatory Info Strip */}
       <div className="p-4 bg-forest-900 text-khaki-100 space-y-2 shadow-2xl">
          <div className="flex items-center gap-2">
             <CheckCircle2 className="h-4 w-4 text-emerald-400" />
             <span className="text-[10px] font-bold uppercase tracking-widest">Traceability Active</span>
          </div>
          <p className="text-[9px] leading-relaxed uppercase font-medium opacity-80">
             Every carving stroke recorded here proves the continuous supply chain as mandated by Article 34 of EUDR for Saharanpur artifacts.
          </p>
       </div>
    </div>
  );
}
