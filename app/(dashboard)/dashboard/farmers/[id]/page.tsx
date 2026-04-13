"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  FileText, 
  Map as MapIcon, 
  ShieldCheck, 
  Clock, 
  User, 
  MapPin, 
  ArrowUpRight,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  History,
  HardDrive,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getFarmerAuditDataAction } from "@/lib/actions/compliance";
import { toast } from "sonner";

export default function FarmerAuditPage() {
  const params = useParams();
  const router = useRouter();
  const farmerId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await getFarmerAuditDataAction(farmerId);
      if (res.success) {
        setData(res.data);
      } else {
        toast.error("DATA_SYNC_FAILED", { description: res.message });
      }
      setLoading(false);
    }
    load();
  }, [farmerId]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-khaki-100/10">
        <Loader2 className="h-10 w-10 animate-spin text-forest-900 mb-4" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-khaki-600">Accessing Digital Twin Audit Vault...</h2>
      </div>
    );
  }

  if (!data || !data.farmer) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-sm font-bold uppercase tracking-widest">Legal Node Not Found</h2>
        <Button onClick={() => router.back()} variant="link" className="mt-4">Return to Registry</Button>
      </div>
    );
  }

  const { farmer, plots, logs, permits } = data;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background font-sans">
      {/* Audit Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-white z-20 shadow-sm">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 rounded-none border border-border">
             <ChevronLeft className="h-4 w-4" />
           </Button>
           <div>
             <span className="op-label !mb-0 text-forest-900">Digital Twin Audit Vault</span>
             <h1 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
               NODE_REF: {farmer.id.substring(0,8).toUpperCase()} / {farmer.name.replace(/\s+/g, '_').toUpperCase()}
             </h1>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-3 py-1 border border-border bg-khaki-100/50 text-[10px] font-mono font-bold uppercase tracking-tighter">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              REGISTRY_STATUS: {plots.every((p:any) => p.bhulekh_verified_at) ? 'VERIFIED_CLEAR' : 'PARTIAL_VERIFICATION'}
           </div>
           <Button className="h-8 bg-forest-900 text-khaki-100 px-6 text-[10px] uppercase font-bold rounded-none hover:bg-forest-800 transition-all font-sans">
             Export Audit Pack (.zip)
           </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Metadata & Plot Ledger */}
        <div className="flex-1 overflow-y-auto p-8 bg-khaki-100/10 space-y-10">
          {/* Section: Farmer Identity */}
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-forest-900" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-forest-900 underline decoration-khaki-500 decoration-2 underline-offset-4">Legal Entity Profile</h2>
            </div>
            <div className="grid grid-cols-4 gap-px bg-border border border-border translate-z-0">
               {[
                 { label: "Full Name", value: farmer.name },
                 { label: "Village / Block", value: farmer.village },
                 { label: "District ID", value: farmer.district },
                 { label: "Reg Date", value: new Date(farmer.created_at).toLocaleDateString() },
                 { label: "Contact Phone", value: farmer.contact_phone || "Not Provided" },
                 { label: "Asset Count", value: `${plots.length} Linked Plots` },
                 { label: "Aadhaar L4", value: farmer.aadhaar_last4 || "Awaiting KYC" },
                 { label: "Verification Level", value: plots.length > 0 ? "Tier-1 Authenticated" : "Tier-0 Entry Only" },
               ].map(item => (
                 <div key={item.label} className="bg-white p-4 group hover:bg-khaki-100/10 transition-colors">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</span>
                    <p className="text-xs font-bold font-mono text-forest-900 mt-1 uppercase truncate">{item.value}</p>
                 </div>
               ))}
            </div>
          </section>

          {/* Section: Asset Ledger (Plots) */}
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <MapIcon className="h-4 w-4 text-forest-900" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-forest-900 underline decoration-khaki-500 decoration-2 underline-offset-4">Supply Chain Assets (Plots)</h2>
            </div>
            <div className="space-y-4">
              {plots.map((plot: any) => (
                <div key={plot.id} className="bg-white border border-border p-6 flex items-center justify-between group hover:border-forest-900/40 transition-colors shadow-sm">
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "h-12 w-12 border-2 flex items-center justify-center rotate-45 transition-colors",
                      plot.bhulekh_verified_at ? "border-emerald-600 bg-emerald-50 text-emerald-600" : "border-khaki-300 bg-khaki-50 text-khaki-400"
                    )}>
                      <ShieldCheck className="h-6 w-6 -rotate-45" />
                    </div>
                    <div>
                      <h3 className="font-mono text-sm font-extrabold text-forest-900 uppercase tracking-tight">Khasra {plot.khasra_no}</h3>
                      <div className="flex items-center gap-3 mt-1 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                        <span>{plot.area_ha} Hectares</span>
                        <span className="h-1 w-1 bg-border rounded-full" />
                        <span>{plot.timber_species?.join(", ") || "Species Unspecified"}</span>
                        <span className="h-1 w-1 bg-border rounded-full" />
                        {plot.bhulekh_verified_at ? (
                           <span className="text-emerald-700">Verified {new Date(plot.bhulekh_verified_at).toLocaleDateString()}</span>
                        ) : (
                           <span className="text-amber-600">Verification Pending</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" className="h-8 text-[10px] uppercase font-bold rounded-none border border-border bg-khaki-100/20 font-sans">
                      View GIS
                    </Button>
                    {!plot.bhulekh_verified_at && (
                       <Button variant="ghost" className="h-8 text-[10px] uppercase font-bold rounded-none border border-border bg-khaki-100/20 font-sans">
                        Verify Bhulekh
                       </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {plots.length === 0 && (
                 <div className="p-12 border-2 border-dashed border-border bg-white flex flex-col items-center justify-center text-center">
                    <MapPin className="h-10 w-10 text-khaki-300 mb-4" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">No plots linked to this farmer node.</p>
                 </div>
              )}
            </div>
          </section>

          {/* Section: Audit Trail */}
          <section className="space-y-6 pb-12">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-forest-900" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-forest-900 underline decoration-khaki-500 decoration-2 underline-offset-4">Chain of Custody Audit Trail</h2>
            </div>
            <div className="relative border-l border-border pl-8 space-y-8 py-2">
               {logs.length > 0 ? logs.map((log: any, idx: number) => (
                 <div key={log.id} className="relative">
                   <div className="absolute -left-[37px] top-1.5 h-4 w-4 rounded-full border-2 border-forest-900 bg-white" />
                   <p className="font-mono text-[9px] font-bold text-khaki-600 uppercase tracking-widest">{new Date(log.created_at).toLocaleDateString()}</p>
                   <h4 className="text-xs font-bold uppercase text-forest-900 mt-1">{log.action.replace(/_/g, ' ')}</h4>
                   <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{log.payload?.details || "Authenticated system action recorded."}</p>
                 </div>
               )) : (
                 <div className="relative">
                    <div className="absolute -left-[37px] top-1.5 h-4 w-4 rounded-full border-2 border-khaki-300 bg-white" />
                    <p className="font-mono text-[9px] font-bold text-khaki-600 uppercase tracking-widest">Initialization</p>
                    <h4 className="text-xs font-bold uppercase text-forest-600 mt-1">Registry Record Created</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">No historical transitions recorded for this node yet.</p>
                 </div>
               )}
            </div>
          </section>
        </div>

        {/* Right: Document Library */}
        <div className="w-[450px] bg-white border-l border-border flex flex-col overflow-hidden shadow-2xl">
           <div className="p-6 border-b border-border bg-khaki-100/30">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-forest-900" />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-forest-900">Verification Files</h2>
                 </div>
                 <span className="text-[10px] font-mono font-bold text-muted-foreground">{permits.length} ASSETS FOUND</span>
              </div>
              <div className="relative mt-4">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                 <input placeholder="Search_Documents..." className="w-full bg-white border border-border h-9 pl-9 text-[11px] font-mono uppercase focus:outline-none focus:border-forest-900 font-sans" />
              </div>
           </div>

           <div className="flex-1 overflow-y-auto divide-y divide-border">
              {permits.map((file: any) => (
                <div key={file.id} className="p-6 hover:bg-khaki-100/10 cursor-pointer transition-colors group">
                   <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                         <div className="h-10 w-10 border border-border bg-khaki-100 flex items-center justify-center text-forest-900 group-hover:bg-forest-900 group-hover:text-khaki-100 transition-colors">
                            <FileText className="h-5 w-5" />
                         </div>
                         <div>
                            <p className="text-[11px] font-bold uppercase text-forest-900 leading-tight">Form-T: {file.permit_no || 'Pending OCR'}</p>
                            <p className="text-[9px] font-mono font-bold text-muted-foreground mt-1 uppercase tracking-tighter">
                               TRANSIT PERMIT · {file.issue_date || 'Awaiting verification'}
                            </p>
                         </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border border-border opacity-0 group-hover:opacity-100 transition-opacity">
                         <Download className="h-4 w-4" />
                      </Button>
                   </div>
                   <div className="mt-4 flex items-center gap-2">
                      <div className={cn(
                        "text-[8px] font-bold px-2 py-0.5 border flex items-center gap-1.5 uppercase font-sans",
                        file.status === 'verified' ? "bg-emerald-50 border-emerald-500 text-emerald-800" : "bg-khaki-100 border-khaki-500 text-khaki-800"
                      )}>
                         <CheckCircle2 className="h-3 w-3" />
                         Compliance_{file.status}
                      </div>
                      <span className="text-[8px] font-mono font-bold text-muted-foreground uppercase">PLOT_REF: K-{plots.find((p:any) => p.id === file.plot_id)?.khasra_no || 'UNLINKED'}</span>
                   </div>
                </div>
              ))}
              
              {permits.length === 0 && (
                 <div className="p-12 flex flex-col items-center justify-center text-center opacity-40">
                    <FileText className="h-10 w-10 mb-4" />
                    <p className="text-[9px] font-bold uppercase tracking-widest">No digitized permits found in vault.</p>
                 </div>
              )}
           </div>

           <div className="p-6 border-t border-border bg-khaki-100/30">
              <Button className="w-full h-12 bg-white text-forest-900 border border-forest-900 uppercase font-bold text-xs tracking-widest rounded-none hover:bg-khaki-100 transition-all font-sans shadow-lg">
                Generate Public Disclosure URL
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
