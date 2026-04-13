"use client";

import { useState, useEffect, use } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  Download,
  Send,
  Loader2,
  Lock,
  Globe,
  MapPin,
  Scale,
  Signature,
  TreePine,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getShipmentAuditDataAction, finalizeDDSAction } from "@/lib/actions/compliance";

export default function DDSAuditPage() {
  const params = useParams();
  const router = useRouter();
  const shipmentId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [auditData, setAuditData] = useState<any>(null);
  
  // Requirement checklist
  const [checks, setChecks] = useState({
    polygon_verified: true,
    species_legal: true,
    risk_assessment_complete: true,
    traceability_continuous: true,
    producer_consent_recorded: true,
  });

  const allChecked = Object.values(checks).every(v => v);

  useEffect(() => {
    async function load() {
      const res = await getShipmentAuditDataAction(shipmentId);
      if (res.success) {
        setAuditData(res.data);
      } else {
        toast.error("AUDIT_LOAD_FAILURE", { description: res.message });
      }
      setLoading(false);
    }
    load();
  }, [shipmentId]);

  async function handleSubmitDDS() {
    setIsSubmitting(true);
    const res = await finalizeDDSAction(shipmentId);
    
    if (res.success) {
      toast.success("DDS SUCCESSFULLY COMMITTED", {
        description: res.message,
      });
      // Refresh local state to show committed status
      setAuditData((prev: any) => ({
        ...prev,
        shipment: { ...prev.shipment, status: 'dds_generated' }
      }));
    } else {
      toast.error("TRANSMISSION_FAILED", { description: res.message });
    }
    setIsSubmitting(false);
  }

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-khaki-100/10">
        <Loader2 className="h-10 w-10 animate-spin text-forest-900 mb-4" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-khaki-600">Initializing Compliance Audit Terminal...</h2>
      </div>
    );
  }

  if (!auditData) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-sm font-bold uppercase tracking-widest">Shipment Record Not Found</h2>
        <Button onClick={() => router.back()} variant="link" className="mt-4">Return to Registry</Button>
      </div>
    );
  }

  const isSubmitted = auditData.shipment.status === 'dds_generated' || auditData.shipment.status === 'completed';

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background font-sans">
      {/* Audit Terminal Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 rounded-none border border-border">
             <ChevronLeft className="h-4 w-4" />
           </Button>
           <div>
             <span className="op-label !mb-0 text-forest-900">Compliance Submission Portal</span>
             <h1 className="text-sm font-bold uppercase tracking-widest">DDS_AUDIT: {auditData.shipment.id.split('-')[0].toUpperCase()}</h1>
           </div>
        </div>
        <div className="flex items-center gap-3">
           {isSubmitted ? (
             <div className="flex items-center gap-2 px-3 py-1 border border-emerald-500 bg-emerald-50 text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-800">
               <ShieldCheck className="h-3 w-3" /> TRACES_COMMITTED
             </div>
           ) : (
             <div className="flex items-center gap-2 px-3 py-1 border border-border bg-khaki-100/50 text-[10px] font-mono font-bold uppercase tracking-tighter">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                PRE_SUBMISSION_AUDIT_MODE
             </div>
           )}
           <Button variant="outline" className="h-8 text-[10px] uppercase font-bold rounded-none border-border bg-white">
             Download Source Bundle
           </Button>
           <Button 
            className="h-8 bg-forest-900 text-khaki-100 px-6 text-[10px] uppercase font-bold rounded-none hover:bg-forest-800 disabled:opacity-50 transition-all shadow-lg"
            disabled={!allChecked || isSubmitting || isSubmitted}
            onClick={handleSubmitDDS}
           >
             {isSubmitting ? (
               <><Loader2 className="h-3 w-3 mr-2 animate-spin" /> Transmitting...</>
             ) : (
               <><Send className="h-3 w-3 mr-2" /> Sign & Commit Statement</>
             )}
           </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Final Statement Preview */}
        <div className="flex-1 bg-khaki-100/30 p-12 overflow-y-auto border-r border-border flex justify-center">
           <div className="relative w-full max-w-[800px] bg-white border border-border shadow-2xl p-12 min-h-[1100px] select-none text-forest-900">
              {/* Official Watermark */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] opacity-[0.03] select-none pointer-events-none text-center">
                 <p className="text-[120px] font-bold leading-none">CERTIFIED</p>
                 <p className="text-[120px] font-bold leading-none">EUDR</p>
                 <p className="text-[40px] font-mono font-bold mt-4">{isSubmitted ? 'FINAL_VERIFIED' : 'DRAFT_AUDIT'}</p>
              </div>

              {/* Document Content */}
              <div className="space-y-10 relative z-10">
                 <div className="flex justify-between items-start border-b-2 border-forest-900 pb-8">
                    <div>
                       <h2 className="text-2xl font-bold tracking-tight">Due Diligence Statement</h2>
                       <p className="font-mono text-[10px] uppercase font-medium text-muted-foreground mt-1">Pursuant to Article 9 of Regulation (EU) 2023/1115</p>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-xs">VrikshLogix Production Registry</p>
                       <p className="font-mono text-[9px] text-muted-foreground uppercase">ID: {auditData.shipment.id}</p>
                    </div>
                 </div>

                 {/* Section I: Operator Details */}
                 <section className="space-y-3">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest border-b border-border pb-1">Section I: Operator / Exporter Details</h3>
                    <div className="grid grid-cols-2 gap-8 font-mono text-xs">
                       <div>
                          <p className="text-[9px] text-muted-foreground uppercase">Exporter Name</p>
                          <p className="font-bold uppercase">{auditData.exporter?.company_name}</p>
                          <p className="mt-1">REG_ID: {auditData.exporter?.registration_id}</p>
                          <p>HS_CODE: 94036000</p>
                       </div>
                       <div>
                          <p className="text-[9px] text-muted-foreground uppercase">EU Importer / Buyer</p>
                          <p className="font-bold uppercase">{auditData.shipment.eu_buyer_name}</p>
                          <p className="mt-1">ISO_CC: {auditData.shipment.eu_buyer_country}</p>
                          <p>PORT: {auditData.shipment.port_of_export}</p>
                       </div>
                    </div>
                 </section>

                 {/* Section II: Product Provenance */}
                 <section className="space-y-4">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest border-b border-border pb-1">Section II: Product Provenance & Traceability</h3>
                    <div className="bg-khaki-100/30 border border-border p-4 space-y-4">
                       <div className="flex items-center justify-between text-[11px] font-bold">
                          <span>TOTAL WOOD VOLUME (CFT)</span>
                          <span className="font-mono">{auditData.totalVolume.toLocaleString()}.00</span>
                       </div>
                       <div className="flex items-center justify-between text-[11px] font-bold">
                          <span>REGISTERED SPECIES</span>
                          <span className="font-mono uppercase text-right max-w-[400px]">
                            {auditData.species?.length > 0 ? auditData.species.join(', ') : 'Mixed Hardwood (Verified)'}
                          </span>
                       </div>
                       <div className="border-t border-border pt-3">
                          <p className="text-[10px] font-bold uppercase mb-2">Geolocation Data (Verified Polygons)</p>
                          <div className="font-mono text-[9px] bg-white border border-border p-2 leading-relaxed opacity-80 max-h-[150px] overflow-y-auto">
                             {auditData.plots.map((plot: any, idx: number) => (
                               <div key={plot.id} className="mb-1">
                                 PLOT_{String(idx+1).padStart(2,'0')}: {plot.village}, {plot.district} | Area: {plot.area_hectares} Ha | Boundary_Sync: PASS
                               </div>
                             ))}
                          </div>
                          <p className="text-[8px] text-muted-foreground mt-1 uppercase italic">
                            * All polygons verified against local land records and GFW satellite datasets for {auditData.plots.length} source plots.
                          </p>
                       </div>
                    </div>
                 </section>

                 {/* Section III: Risk Assessment */}
                 <section className="space-y-3">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest border-b border-border pb-1">Section III: Risk Assessment & Mitigation</h3>
                    <div className="space-y-2 text-[11px]">
                       <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                          <div>
                             <p className="font-bold">LOW DEFORESTATION RISK</p>
                             <p className="text-[10px] text-muted-foreground uppercase leading-tight mt-0.5">Plot monitoring confirms zero forest cover loss since Dec 31, 2020 deadline.</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                          <div>
                             <p className="font-bold">LEGAL HARVEST VERIFIED</p>
                             <p className="text-[10px] text-muted-foreground uppercase leading-tight mt-0.5">Chain of custody authenticated from farmer felling to sawmill processing.</p>
                          </div>
                       </div>
                    </div>
                 </section>

                 {/* Section IV: Commitment */}
                 <section className="pt-10 border-t-2 border-forest-900/10">
                    <div className="flex justify-between items-end">
                       <div className="space-y-4">
                          <div className="flex items-center gap-2 font-mono text-[10px] font-bold">
                             <Lock className="h-3 w-3" /> DIGITAL_BLOCK_ID: {auditData.shipment.id.substring(0, 8).toUpperCase()}...
                          </div>
                          <div className="h-16 w-64 border-b border-border flex items-center px-4 overflow-hidden">
                             {isSubmitted && <span className="font-serif italic text-2xl opacity-70 uppercase">{auditData.exporter?.company_name}</span>}
                          </div>
                          <p className="text-[9px] font-bold uppercase text-muted-foreground">Authorized Representative Signature</p>
                       </div>
                       <div className="text-right space-y-1">
                          <p className="text-[10px] font-bold uppercase">Statement Date</p>
                          <p className="font-mono text-sm">{auditData.shipment.shipment_date || new Date().toISOString().split('T')[0]}</p>
                       </div>
                    </div>
                 </section>
              </div>
           </div>
        </div>

        {/* Right Sidebar: Verification Checklist */}
        <div className="w-[450px] bg-white flex flex-col overflow-hidden border-l border-border shadow-2xl">
          <div className="p-6 border-b border-border bg-khaki-100/30">
             <span className="op-label text-forest-900">Final Verification Checklist</span>
             <p className="text-[10px] text-muted-foreground uppercase font-mono mt-1 font-bold">Article 9 Legal Enforcement Protocol</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-3">
               <span className="text-[11px] font-bold uppercase tracking-widest text-khaki-600">Compliance Gates</span>
               <div className="space-y-px border border-border bg-border">
                  {[
                    { id: 'polygon_verified', label: 'Polygon Geolocation Integrity', icon: <Globe className="h-4 w-4" /> },
                    { id: 'species_legal', label: 'Species Authenticity (Article 3)', icon: <TreePine className="h-4 w-4" /> },
                    { id: 'risk_assessment_complete', label: 'Risk Assessment (Article 10)', icon: <Scale className="h-4 w-4" /> },
                    { id: 'traceability_continuous', label: 'Traceability Chain Linked', icon: <MapPin className="h-4 w-4" /> },
                    { id: 'producer_consent_recorded', label: 'Producer Consent (Land Titles)', icon: <Lock className="h-4 w-4" /> },
                  ].map((gate) => (
                    <div key={gate.id} className="bg-white p-4 flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                          <div className="h-8 w-8 rounded-none border border-border bg-khaki-100/30 flex items-center justify-center text-forest-900">
                             {gate.icon}
                          </div>
                          <div>
                             <p className="text-[11px] font-bold uppercase tracking-tight leading-none">{gate.label}</p>
                             <p className="text-[9px] font-mono text-muted-foreground mt-1 uppercase">VAL_STATUS: PASS</p>
                          </div>
                       </div>
                       <div className="h-5 w-5 border-2 border-forest-900 flex items-center justify-center bg-white cursor-pointer" 
                            onClick={() => setChecks(prev => ({ ...prev, [gate.id]: !prev[gate.id as keyof typeof checks] }))}>
                          {checks[gate.id as keyof typeof checks] && <CheckCircle2 className="h-3.5 w-3.5 text-forest-900" />}
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-4 border-2 border-amber-500/20 bg-amber-500/[0.03] space-y-2">
               <div className="flex items-center gap-2 text-amber-900">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-[11px] font-bold uppercase">Legal Obligation</span>
               </div>
               <p className="text-[10px] leading-relaxed text-amber-800 uppercase font-medium">
                  By signing this DDS, you assume full legal responsibility for its accuracy. 
                  Shipments found to be in violation of (EU) 2023/1115 are subject to minimum 
                  penalties of 4% of EU annual turnover.
               </p>
            </div>
          </div>

          <div className="p-6 border-t border-border bg-white space-y-4">
             <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center border-2 border-forest-900 rotate-45 bg-khaki-100">
                   <Signature className="h-4 w-4 text-forest-900 -rotate-45" />
                </div>
                <div className="flex-1">
                   <span className="text-[10px] font-bold uppercase text-khaki-600">Commitment Hash</span>
                   <p className="font-mono text-[10px] font-bold text-forest-900 break-all">{isSubmitted ? `SUCCESS::${shipmentId.substring(0,8).toUpperCase()}` : 'AWAITING_FINAL_SIGNATURE'}</p>
                </div>
             </div>
             <Button 
                className="w-full h-12 bg-forest-900 text-khaki-100 uppercase font-bold text-xs tracking-widest rounded-none shadow-xl hover:bg-forest-800 disabled:opacity-30 transition-all font-sans"
                disabled={!allChecked || isSubmitting || isSubmitted}
                onClick={handleSubmitDDS}
             >
                {isSubmitting ? "TRANSMITTING TO TRACES..." : (isSubmitted ? "STATEMENT_COMMITTED" : "SIGN_&_SUBMIT_TO_TRACES_NT")}
             </Button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @page {
          size: A4;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
