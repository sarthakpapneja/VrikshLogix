"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/navigation";
import { 
  ArrowLeft, 
  Factory, 
  TreePine, 
  Plus, 
  Trash2, 
  AlertTriangle,
  QrCode,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getFarmersAction, commitSawmillBatchAction } from "@/lib/actions/compliance";

export default function NewSawmillBatchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [selectedPlots, setSelectedPlots] = useState<string[]>([]);
  const [sawmillName, setSawmillName] = useState("");
  const [sawmillDistrict, setSawmillDistrict] = useState("Saharanpur");
  const [inputVolume, setInputVolume] = useState("");
  const [species, setSpecies] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const res = await getFarmersAction();
      if (res.success) {
        setFarmers(res.data);
      }
    }
    load();
  }, []);

  const togglePlot = (id: string, plotSpecies: string[]) => {
    if (selectedPlots.includes(id)) {
      setSelectedPlots(prev => prev.filter(p => p !== id));
      // Potential logic to remove species if no other plot has it
    } else {
      setSelectedPlots(prev => [...prev, id]);
      // Merge species
      const uniqueSpecies = Array.from(new Set([...species, ...plotSpecies]));
      setSpecies(uniqueSpecies);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlots.length === 0) {
      toast.error("Process halt: No timber inputs linked.");
      return;
    }

    setLoading(true);
    const res = await commitSawmillBatchAction({
      sawmill_name: sawmillName,
      sawmill_district: sawmillDistrict,
      input_volume: parseFloat(inputVolume),
      species,
      plot_ids: selectedPlots
    });

    if (res.success) {
      toast.success("Batch Hash Sealed: Chain-of-custody established.");
      router.push("/dashboard/sawmill");
    } else {
      toast.error(`Terminal Error: ${res.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden font-sans">
      {/* Tactical Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-none border border-border"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <span className="op-label !mb-0 text-forest-900 leading-none">Resource Transformation</span>
            <h1 className="text-xl font-bold uppercase tracking-widest leading-tight">Initialize Processing Batch</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-4 px-4 py-1.5 border border-border bg-khaki-100/30 font-mono text-[10px] font-bold">
              <span className="flex items-center gap-1.5 text-forest-900">
                <ShieldCheck className="h-3 w-3" /> EUDR ARTICLE 9 READY
              </span>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 bg-khaki-100/10">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Section 1: Facility Details */}
          <div className="space-y-6">
            <div className="bg-white border border-border p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-5">
                <Factory className="h-24 w-24" />
              </div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-khaki-600 mb-6 flex items-center gap-2">
                <div className="h-1 w-4 bg-forest-900" /> Facility Parameters
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Processing Facility Name</Label>
                  <Input 
                    required
                    placeholder="E.G. SHARMA TIMBER INDUSTRIES"
                    className="rounded-none border-border h-11 text-xs font-bold uppercase tracking-tight focus-visible:ring-forest-900"
                    value={sawmillName}
                    onChange={(e) => setSawmillName(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Operational District</Label>
                    <Input 
                      required
                      className="rounded-none border-border h-11 text-xs font-bold uppercase tracking-tight"
                      value={sawmillDistrict}
                      onChange={(e) => setSawmillDistrict(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Input Volume (CFT)</Label>
                    <Input 
                      required
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="rounded-none border-border h-11 text-xs font-mono font-bold tracking-tight"
                      value={inputVolume}
                      onChange={(e) => setInputVolume(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-border p-6 shadow-sm">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-khaki-600 mb-6 flex items-center gap-2">
                <div className="h-1 w-4 bg-forest-900" /> Species Composition
              </h2>
              <div className="flex flex-wrap gap-2">
                {species.length > 0 ? species.map(s => (
                  <div key={s} className="px-3 py-1 border border-forest-900 bg-forest-50 text-[10px] font-bold uppercase tracking-tighter text-forest-900 flex items-center gap-2">
                    <TreePine className="h-3 w-3" /> {s}
                  </div>
                )) : (
                  <p className="text-[10px] italic text-muted-foreground uppercase">Linked plots will populate species automatically...</p>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading || selectedPlots.length === 0}
              className="w-full h-14 bg-forest-900 text-khaki-100 hover:bg-forest-800 rounded-none text-xs font-bold uppercase tracking-[0.2em] shadow-lg transition-all"
            >
              {loading ? "SEALING HASH..." : "COMMIT TO GOLDEN RECORD"}
            </Button>
          </div>

          {/* Section 2: Input Selection (Plots) */}
          <div className="bg-white border border-border p-6 shadow-sm h-fit">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-khaki-600 mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2"><div className="h-1 w-4 bg-forest-900" /> Timber Feedstock Selection</span>
              <span className="bg-khaki-100 px-2 py-0.5 text-khaki-800 font-mono">{selectedPlots.length} SELECTED</span>
            </h2>

            <div className="space-y-3 max-h-[600px] overflow-auto pr-2 custom-scrollbar">
              {farmers.map(farmer => (
                <div key={farmer.id} className="space-y-2">
                   <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest pl-1">{farmer.name}</p>
                   {farmer.plots?.map((plot: any) => (
                     <div 
                       key={plot.id}
                       onClick={() => togglePlot(plot.id, plot.timber_species || [])}
                       className={cn(
                         "p-4 border transition-all cursor-pointer group flex items-center justify-between",
                         selectedPlots.includes(plot.id) 
                          ? "border-forest-900 bg-forest-50/50" 
                          : "border-border hover:border-khaki-400 bg-white"
                       )}
                     >
                       <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-8 w-8 flex items-center justify-center border transition-colors",
                            selectedPlots.includes(plot.id) ? "bg-forest-900 text-khaki-100" : "bg-khaki-100 text-khaki-400"
                          )}>
                            <TreePine className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold uppercase text-forest-900">Khasra No: {plot.khasra_no}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                               <p className="text-[9px] font-mono text-muted-foreground">{plot.area_ha} HA</p>
                               <div className={cn(
                                 "h-1.5 w-1.5 rounded-full",
                                 plot.risk_score === 'red' ? "bg-red-500" : "bg-emerald-500"
                               )} />
                            </div>
                          </div>
                       </div>
                       <div className="flex flex-col items-end gap-1">
                          {selectedPlots.includes(plot.id) ? (
                             <div className="text-[8px] font-bold text-forest-900 bg-khaki-100 px-1 py-0.5">LOCKED</div>
                          ) : (
                             <Plus className="h-3 w-3 text-khaki-300 group-hover:text-khaki-600" />
                          )}
                       </div>
                     </div>
                   ))}
                </div>
              ))}
              
              {farmers.length === 0 && (
                <div className="p-12 text-center border border-dashed border-border opacity-50">
                  <p className="text-[10px] font-bold uppercase tracking-widest">No verified timber nodes found.</p>
                </div>
              )}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
