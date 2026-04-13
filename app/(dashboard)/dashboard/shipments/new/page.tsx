"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Plus,
  Ship,
  Search,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Package,
  ArrowRight,
  Factory
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getSawmillBatchesAction, createShipmentAction } from "@/lib/actions/compliance";

export default function NewShipmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availableBatches, setAvailableBatches] = useState<any[]>([]);
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    buyer_name: "",
    buyer_country: "DE",
    port: "Nhava Sheva",
    ship_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    async function load() {
      const res = await getSawmillBatchesAction();
      if (res.success) {
        // Only show batches that aren't already dispatched or closed
        const filtered = res.data.filter((b: any) => b.status === "open" || b.status === "processing");
        setAvailableBatches(filtered);
      }
      setLoading(false);
    }
    load();
  }, []);

  const totalVolume = availableBatches
    .filter(b => selectedBatches.includes(b.id))
    .reduce((acc, b) => acc + (b.input_volume_cft ?? 0), 0);

  function toggleBatch(id: string) {
    setSelectedBatches(prev => 
      prev.includes(id) ? prev.filter(bid => bid !== id) : [...prev, id]
    );
  }

  async function handleCreateShipment() {
    if (!formData.buyer_name || selectedBatches.length === 0) {
      toast.error("MISSING_DATA", { description: "Please provide buyer info and select at least one batch." });
      return;
    }

    setSubmitting(true);
    const res = await createShipmentAction({
      buyer_name: formData.buyer_name,
      buyer_country: formData.buyer_country,
      port_of_export: formData.port,
      shipment_date: formData.ship_date,
      batch_ids: selectedBatches
    });

    if (res.success) {
      toast.success("MANIFEST_CREATED", { description: "Shipment record initialized. Proceeding to DDS Audit." });
      router.push(`/dashboard/shipments/${res.data.id}/dds`);
    } else {
      toast.error("COMMIT_FAILED", { description: res.message });
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 rounded-none border border-border">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <span className="op-label !mb-0 text-forest-900">Logistics Manifest Generator</span>
            <h1 className="text-xl font-bold uppercase tracking-widest">New Outbound Shipment</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="h-9 bg-forest-900 text-khaki-100 px-6 text-xs uppercase tracking-widest font-bold rounded-none hover:bg-forest-800 transition-all"
            onClick={handleCreateShipment}
            disabled={submitting || selectedBatches.length === 0}
          >
            {submitting ? "GENERATING..." : "Generate_Manifest"} <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Manifest Form */}
        <div className="w-[400px] border-r border-border bg-khaki-100/10 p-6 overflow-y-auto space-y-8">
           <section className="space-y-4">
             <span className="text-[11px] font-bold uppercase tracking-widest text-khaki-600">Export Parameters</span>
             <div className="space-y-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] uppercase font-bold text-forest-950">EU Buyer Name</label>
                   <input 
                      className="w-full h-10 border border-border bg-white px-3 text-xs font-bold uppercase focus:ring-1 focus:ring-forest-900 outline-none"
                      placeholder="e.g. SCHIERHOLT GMBH"
                      value={formData.buyer_name}
                      onChange={(e) => setFormData({...formData, buyer_name: e.target.value})}
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] uppercase font-bold text-forest-950">Destination Country (ISO)</label>
                   <select 
                      className="w-full h-10 border border-border bg-white px-3 text-xs font-bold uppercase outline-none"
                      value={formData.buyer_country}
                      onChange={(e) => setFormData({...formData, buyer_country: e.target.value})}
                   >
                      <option value="DE">Germany (DE)</option>
                      <option value="FR">France (FR)</option>
                      <option value="NL">Netherlands (NL)</option>
                      <option value="ES">Spain (ES)</option>
                      <option value="IT">Italy (IT)</option>
                   </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-forest-950">Port of Export</label>
                      <input 
                         className="w-full h-10 border border-border bg-white px-3 text-xs font-bold uppercase outline-none"
                         value={formData.port}
                         onChange={(e) => setFormData({...formData, port: e.target.value})}
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-forest-950">Shipment Date</label>
                      <input 
                         type="date"
                         className="w-full h-10 border border-border bg-white px-3 text-xs font-mono font-bold uppercase outline-none"
                         value={formData.ship_date}
                         onChange={(e) => setFormData({...formData, ship_date: e.target.value})}
                      />
                   </div>
                </div>
             </div>
           </section>

           <section className="p-4 border-2 border-forest-900/10 bg-forest-900/[0.02] space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-forest-900 flex items-center gap-2">
                 <Package className="h-4 w-4" /> Load Summary
              </span>
              <div className="space-y-2">
                 <div className="flex justify-between text-[11px] font-bold uppercase">
                    <span className="text-muted-foreground">Total Batches:</span>
                    <span className="font-mono">{selectedBatches.length}</span>
                 </div>
                 <div className="flex justify-between text-[11px] font-bold uppercase">
                    <span className="text-muted-foreground">Total Volume:</span>
                    <span className="font-mono">{totalVolume.toLocaleString()} CFT</span>
                 </div>
                 <div className="flex justify-between text-[11px] font-bold uppercase">
                    <span className="text-muted-foreground">Article 9 Status:</span>
                    <span className={cn("font-bold", selectedBatches.length > 0 ? "text-emerald-600" : "text-amber-600")}>
                        {selectedBatches.length > 0 ? "VERIFIED" : "PENDING"}
                    </span>
                 </div>
              </div>
           </section>
        </div>

        {/* Right: Batch Selector Registry */}
        <div className="flex-1 p-8 bg-khaki-100/30 overflow-y-auto">
           <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                 <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-khaki-600">Select Processed Batches from Inventory</h2>
                 <div className="text-[10px] font-mono font-bold text-forest-900 bg-khaki-100 border border-border px-3 py-1 uppercase">
                    Registry_Sync: ACTIVE
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                 {loading ? (
                    <div className="p-12 text-center border-border opacity-50">
                       <Package className="h-8 w-8 animate-pulse mx-auto mb-4 text-khaki-400" />
                       <p className="text-[10px] font-bold uppercase tracking-widest">Synchronizing Inventory...</p>
                    </div>
                 ) : availableBatches.map((batch) => {
                   const isSelected = selectedBatches.includes(batch.id);
                   return (
                     <div 
                        key={batch.id} 
                        className={cn(
                           "flex items-center justify-between p-4 bg-white border cursor-pointer transition-all",
                           isSelected ? "border-forest-900 shadow-md translate-x-1" : "border-border hover:border-khaki-400"
                        )}
                        onClick={() => toggleBatch(batch.id)}
                     >
                        <div className="flex items-center gap-6">
                           <div className={cn(
                              "h-10 w-10 flex items-center justify-center border-2 rotate-45 transition-colors",
                              isSelected ? "border-forest-900 bg-forest-900 text-khaki-100" : "border-khaki-300 text-khaki-300"
                           )}>
                              <div className="-rotate-45">
                                 <Factory className="h-4 w-4" />
                              </div>
                           </div>
                           <div>
                              <p className="font-mono text-sm font-bold text-forest-900 uppercase">{batch.batch_qr_id}</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                                 Facility: {batch.sawmill_name} · Species: {batch.species_mix?.join(', ')}
                              </p>
                           </div>
                        </div>
                        <div className="flex items-center gap-12 text-right">
                           <div>
                              <p className="text-[9px] font-bold uppercase text-khaki-600">Input Load</p>
                              <p className="font-mono text-xs font-bold">{batch.input_volume_cft} CFT</p>
                           </div>
                           <div>
                              <p className="text-[9px] font-bold uppercase text-khaki-600">Provenance</p>
                              <p className="font-mono text-xs font-bold uppercase">{batch.batch_inputs?.length || 0} Plots Linked</p>
                           </div>
                           <div className={cn(
                              "h-5 w-5 border-2 flex items-center justify-center transition-colors",
                              isSelected ? "border-forest-900 bg-forest-900 text-khaki-100" : "border-khaki-300"
                           )}>
                              {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                           </div>
                        </div>
                     </div>
                   );
                 })}
                 
                 {!loading && availableBatches.length === 0 && (
                    <div className="p-12 border-2 border-dashed border-border flex flex-col items-center justify-center text-center space-y-4">
                       <div className="h-12 w-12 rounded-full bg-khaki-100/50 flex items-center justify-center text-khaki-400">
                          <Package className="h-6 w-6" />
                       </div>
                       <div>
                          <h3 className="text-xs font-bold uppercase tracking-widest">No Batches Available</h3>
                          <p className="text-[10px] text-muted-foreground uppercase mt-1">Please process timber in the sawmill module before creating a manifest.</p>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
