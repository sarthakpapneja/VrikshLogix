"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  MoreHorizontal,
  Leaf,
  Hammer,
  Award,
  ShieldCheck,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCarvingUnitsAction } from "@/lib/actions/compliance";

export default function CarvingUnitsPage() {
  const [query, setQuery] = useState("");
  const [carvingUnits, setCarvingUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getCarvingUnitsAction();
      if (res.success) {
        setCarvingUnits(res.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* 1. Controller Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white shadow-sm z-10">
        <div>
          <span className="op-label !mb-0 text-forest-900">Craftsmanship Node Registry</span>
          <h1 className="text-xl font-bold uppercase tracking-widest">Carving Units & Workshops</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 px-4 py-1.5 border border-border bg-khaki-100/30 font-mono text-[10px] font-bold">
             <div className="flex items-center gap-1.5 text-forest-900">
                <Users className="h-3 w-3" /> UNITS_ACTIVE: {carvingUnits.length}
             </div>
             <div className="flex items-center gap-1.5 text-emerald-600">
                <Award className="h-3 w-3" /> CERTIFIED: {carvingUnits.filter(u=>u.status==='Certified').length}
             </div>
          </div>
          <Button className="h-9 bg-forest-900 text-khaki-100 px-6 text-xs uppercase tracking-widest font-bold rounded-none hover:bg-forest-800 transition-all">
            <Plus className="h-4 w-4 mr-2" /> REGISTER_NEW_UNIT
          </Button>
        </div>
      </div>

      {/* 2. Tactical Filters */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-border bg-khaki-100/10">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="SEARCH_BY_MASTER_OR_UNIT_ID..."
            className="pl-9 w-full h-8 bg-white border border-border outline-none text-[11px] font-mono font-bold tracking-tight uppercase"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="h-8 text-[10px] uppercase font-bold rounded-none border-border bg-white">
              <Hammer className="h-3.5 w-3.5 mr-1.5" /> CRAFT_TYPE
           </Button>
           <Button variant="outline" className="h-8 text-[10px] uppercase font-bold rounded-none border-border bg-white">
              <Globe className="h-3.5 w-3.5 mr-1.5" /> LOC_ZONE
           </Button>
        </div>
      </div>

      {/* 3. Terminal Registry Ledger */}
      <div className="flex-1 overflow-auto p-8 bg-khaki-100/10">
        <div className="bg-white border border-border shadow-sm overflow-hidden">
           <table className="w-full border-collapse text-left">
              <thead className="bg-khaki-100/30 border-b border-border">
                 <tr>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-khaki-700">Node State</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-khaki-700">Unit ID / Identifier</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-khaki-700">Master Carver / Capacity</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-khaki-700">Specialization & Location</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-khaki-700">Audit Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-khaki-700 text-right">Ops</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-border">
                 {carvingUnits.map((unit) => {
                   const isCertified = unit.status === 'Certified';
                   const isVerified = unit.status === 'Verified';
                   
                   return (
                     <tr key={unit.id} className="hover:bg-khaki-100/10 transition-colors group">
                        <td className="px-6 py-5 whitespace-nowrap">
                           <div className={cn(
                             "h-10 w-10 flex items-center justify-center border-2 rotate-45 transition-colors",
                             isCertified ? "border-emerald-600 bg-emerald-50 text-emerald-600" :
                             isVerified ? "border-sky-600 bg-sky-50 text-sky-600" :
                             "border-amber-600 bg-amber-50 text-amber-600"
                           )}>
                              <div className="-rotate-45">
                                 <Hammer className="h-4 w-4" />
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <p className="font-mono text-xs font-bold text-forest-900 uppercase">{unit.id}</p>
                           <p className="text-[9px] text-muted-foreground uppercase font-mono tracking-tighter mt-1 font-bold">Registry Node: PROG_VAL_04</p>
                        </td>
                        <td className="px-6 py-5">
                           <p className="text-xs font-bold uppercase text-forest-900 tracking-tight">{unit.master}</p>
                           <p className="text-[10px] text-muted-foreground uppercase font-mono mt-0.5 font-bold">CAP: {unit.capacity} ({unit.workers} CARVERS)</p>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-1.5">
                              <Leaf className="h-3 w-3 text-khaki-600" />
                              <span className="text-[11px] font-bold uppercase text-forest-900">{unit.specialization}</span>
                           </div>
                           <div className="flex items-center gap-1.5 mt-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-[10px] font-bold uppercase text-muted-foreground">{unit.location}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2">
                                 <span className={cn(
                                   "h-1.5 w-1.5 rounded-full",
                                   isCertified ? "bg-emerald-500" : isVerified ? "bg-sky-500" : "bg-amber-400 animate-pulse"
                                 )} />
                                 <span className="text-[10px] font-bold uppercase tracking-widest text-forest-900">{unit.status}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <ShieldCheck className="h-3 w-3 text-emerald-600 opacity-70" />
                                 <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase">Social_Audit: PASS</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <Button className="h-8 text-[10px] uppercase font-bold rounded-none border border-border bg-white text-forest-900 hover:bg-khaki-100 transition-all">
                                 VIEW_SKILL_ID
                              </Button>
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
                 <span>LEGAL_RECORD: CARVING_PHASE_TRACEABILITY</span>
                 <span className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                    Skills Sync: Saharanpur District Registrar
                 </span>
              </div>
              <span className="uppercase">Terminal_v1.0: READY</span>
           </div>
        </div>
      </div>
    </div>
  );
}
