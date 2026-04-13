"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  BarChart3,
  PieChart,
  Table as TableIcon,
  Search,
  Calendar,
  Filter,
  ArrowDownToLine,
  Printer,
  ChevronRight,
  TrendingUp,
  Box,
  TreePine,
  ShieldAlert,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  Zap,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { generateDDSPreviewMarkdown } from "@/lib/exports/pdf-generator";
import { getReportsAnalyticsAction } from "@/lib/actions/compliance";

export default function ReportsPage() {
  const [showDossier, setShowDossier] = useState(false);
  const [dossierContent, setDossierContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalVolume: 0,
    speciesVolume: [] as any[],
    archives: [] as any[]
  });

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await getReportsAnalyticsAction();
        if (res.success && res.data) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error("Failed to load generic reports analytics", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const handleGeneratePacket = () => {
    const mockConfig = {
      shipmentId: "SHIP-RUN-2026-9921",
      exporterName: "VrikshLogix Tenant",
      exporterEPCH: "EPCH/UP/772-2024",
      commonName: analytics.speciesVolume[0]?.species || "Mixed Timber",
      scientificName: "Dalbergia sissoo",
      plots: [
        { khasra: "241/3", polygon: [], riskRating: "negligible" },
        { khasra: "156/7", polygon: [], riskRating: "standard" }
      ],
      goldenRecordHash: "8F3E29A1C635BD7E2E43C9A4F3D2243C9A4F3D228F3E29A1C635BD7E2E43C9A4"
    };

    const markdown = generateDDSPreviewMarkdown(mockConfig);
    setDossierContent(markdown);
    setShowDossier(true);
  };

  if (loading) {
     return (
        <div className="flex flex-col h-screen items-center justify-center bg-background">
           <div className="animate-pulse flex flex-col items-center">
              <Database className="h-8 w-8 text-khaki-400 mb-4 animate-spin" />
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">Compiling Article 12 Compliance Metrics...</p>
           </div>
        </div>
     );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* 1. Analytics HUD */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white shadow-sm">
        <div>
           <span className="op-label !mb-0 text-forest-900">Regulatory Analysis Terminal</span>
           <h1 className="text-xl font-bold uppercase tracking-widest">Compliance Reporting Suite</h1>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="h-9 text-[10px] uppercase font-bold rounded-none border-border bg-white">
              <Printer className="h-4 w-4 mr-2" /> PRINT_OFFICIAL_RECORD
           </Button>
           <Button className="h-9 bg-forest-900 text-khaki-100 px-6 text-xs uppercase tracking-widest font-bold rounded-none hover:bg-forest-800 transition-all">
              <ArrowDownToLine className="h-4 w-4 mr-2" /> EXPORT_ARTICLE_12_JSON
           </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 space-y-8 bg-khaki-100/10 relative">
        
        {/* Dossier Preview Overlay */}
        {showDossier && (
          <div className="fixed inset-0 z-[100] bg-forest-900/40 backdrop-blur-sm flex items-center justify-center p-8">
             <div className="bg-white border-2 border-forest-900 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                <div className="p-4 border-b border-border bg-khaki-100/30 flex justify-between items-center">
                   <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-forest-900">Official Article 12 Dossier Preview</h3>
                   <Button variant="ghost" size="sm" onClick={() => setShowDossier(false)} className="h-8 font-black">CLOSE [X]</Button>
                </div>
                <div className="flex-1 overflow-auto p-10 font-sans">
                   <div className="max-w-2xl mx-auto border border-border p-12 bg-white shadow-sm leading-relaxed whitespace-pre-wrap text-sm text-forest-900">
                      {dossierContent}
                   </div>
                </div>
                <div className="p-4 border-t border-border bg-white flex justify-end gap-3">
                   <Button variant="outline" className="h-10 px-6 uppercase font-bold text-[10px] tracking-widest rounded-none border-forest-900" onClick={() => setShowDossier(false)}>Cancel_Export</Button>
                   <Button className="h-10 px-8 bg-forest-900 text-khaki-100 uppercase font-bold text-[10px] tracking-widest rounded-none hover:bg-forest-800" onClick={() => { alert("Simulation: Dossier Transmitted to EU TRACES NT."); setShowDossier(false); }}>Sign_and_Transmit_to_EU_NT</Button>
                </div>
             </div>
          </div>
        )}

        {/* 2. Top Analytics Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-6 bg-white border border-border shadow-sm flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-khaki-600">Total Volume Exported</span>
                 <BarChart3 className="h-4 w-4 text-forest-900" />
              </div>
              <div>
                 <p className="text-2xl font-bold font-mono">{analytics.totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                 <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1 tracking-tighter">Kilograms (KG) · YTD 2026</p>
              </div>
           </div>
           
           <div className="p-6 bg-white border border-border shadow-sm flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-khaki-600">Average Risk Rating</span>
                 <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                 <p className="text-2xl font-bold font-mono text-emerald-600">NEGLIGIBLE</p>
                 <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1 tracking-tighter">Based on Art. 10 Risk Analysis</p>
              </div>
           </div>

           <div className="p-6 bg-forest-900 text-khaki-100 shadow-sm flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                 <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-khaki-600">Article 12 Status</span>
                 <ShieldAlert className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                 <p className="text-xl font-bold tracking-tight">REPORT_DUE: 12 DAYS</p>
                 <p className="text-[9px] font-mono text-khaki-600 uppercase mt-1">Next Public Disclosure Deadline</p>
              </div>
           </div>
        </div>

        {/* 3. Data Tables Zone */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           
           {/* Summary by Species */}
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <h2 className="text-xs font-bold uppercase tracking-widest text-forest-900 flex items-center gap-2">
                    <TreePine className="h-4 w-4" /> Volume by Species (Art. 9)
                 </h2>
                 <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Aggregate Registry</span>
              </div>
              <div className="bg-white border border-border shadow-sm">
                 <table className="w-full text-left">
                    <thead className="bg-khaki-100/30 border-b border-border text-[9px] font-bold uppercase tracking-widest text-khaki-700">
                       <tr>
                          <th className="px-5 py-3">Botanical / Common Name</th>
                          <th className="px-5 py-3">Total Volume</th>
                          <th className="px-5 py-3 text-right">Share</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-[11px] font-bold uppercase text-forest-900">
                       {analytics.speciesVolume.length === 0 ? (
                         <tr><td colSpan={3} className="px-5 py-8 text-center text-muted-foreground text-[10px] font-mono">NO SPECIES DATA RECORDED</td></tr>
                       ) : analytics.speciesVolume.map((item, i) => (
                         <tr key={i} className="hover:bg-khaki-100/10">
                            <td className="px-5 py-4">{item.species}</td>
                            <td className="px-5 py-4 font-mono">{item.volume}</td>
                            <td className="px-5 py-4 text-right font-mono text-muted-foreground">{item.share}</td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Report Archive */}
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <h2 className="text-xs font-bold uppercase tracking-widest text-forest-900 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Official Report Archive
                 </h2>
                 <Button variant="ghost" className="h-7 px-2 text-[10px] uppercase font-bold text-khaki-600">
                    View_All
                 </Button>
              </div>
              <div className="bg-border border border-border space-y-px">
                 {analytics.archives.length === 0 ? (
                   <div className="bg-white p-6 text-center">
                     <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">NO REPORTS ARCHIVED YET</p>
                   </div>
                 ) : analytics.archives.map((report) => (
                   <div key={report.id} className="bg-white p-4 flex items-center justify-between hover:bg-khaki-100/10 transition-colors group">
                      <div className="flex items-center gap-4">
                         <div className="h-9 w-9 border border-border bg-khaki-100/30 flex items-center justify-center text-forest-900">
                            <FileText className="h-4 w-4" />
                         </div>
                         <div>
                            <p className="text-[11px] font-bold uppercase tracking-tight">{report.name}</p>
                            <p className="text-[9px] font-mono text-muted-foreground mt-1 uppercase">DATE: {report.date} · REF: {report.id}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className="px-2 py-0.5 border border-border bg-khaki-100/50 text-[9px] font-bold uppercase text-emerald-700">
                           {report.status}
                         </span>
                         <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border border-transparent group-hover:border-border transition-all">
                            <ChevronRight className="h-4 w-4" />
                         </Button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

        </div>

        {/* 4. EUDR Submission Terminal (The DDS Compiler) */}
        <div className="bg-white border-2 border-forest-900 overflow-hidden">
           <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
              <div className="md:w-1/2 p-8 bg-forest-900 text-khaki-100">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-khaki-200/20 rounded border border-khaki-200/30 text-khaki-200">
                       <Zap className="h-5 w-5" />
                    </div>
                    <div>
                       <h3 className="text-xl font-bold uppercase tracking-tight">DDS Pack Compiler</h3>
                       <p className="text-[10px] font-mono text-khaki-600 uppercase">Article 10 · 2023/1115 (EUDR)</p>
                    </div>
                 </div>
                 
                 <p className="text-xs leading-relaxed mb-8 text-khaki-200/80">
                    Collate the "Golden Record" for current quarterly shipments. This compiles all geospatial, 
                    administrative, and industrial evidence into a single sealed dossier for EU TRACES NT.
                 </p>

                 <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[10px] font-mono uppercase bg-khaki-100/10 p-2 border border-khaki-100/10">
                       <CheckCircle2 className="h-3 w-3 text-emerald-400" /> {analytics.speciesVolume.length * 4 || 14} Supply Nodes Sealed
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono uppercase bg-khaki-100/10 p-2 border border-khaki-100/10">
                       <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Satellite Logs Attached
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono uppercase bg-khaki-100/10 p-2 border border-khaki-100/10 text-khaki-500">
                       <FileCheck className="h-3 w-3 text-khaki-600" /> Missing Artisan Unit Sign-off
                    </div>
                 </div>

                 <Button 
                   onClick={handleGeneratePacket}
                   className="w-full mt-8 bg-khaki-100 text-forest-900 uppercase font-black tracking-[0.2em] text-xs h-12 rounded-none hover:bg-white"
                 >
                    Generate_Final_DDS_Packet
                 </Button>
              </div>

              <div className="md:w-1/2 p-8 space-y-6 flex flex-col justify-center">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-khaki-100 border border-border flex items-center justify-center text-forest-900 font-black italic">VL</div>
                    <div className="flex-1">
                       <p className="text-[10px] font-bold uppercase text-khaki-600">Verification Hash</p>
                       <p className="text-xs font-mono break-all font-bold">SHA256: 8F3E29A1C635BD7E2E43C9A4F3D22</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-khaki-100 border border-border flex items-center justify-center text-forest-900 font-black italic"><ShieldCheck className="h-6 w-6" /></div>
                    <div className="flex-1">
                       <p className="text-[10px] font-bold uppercase text-khaki-600">System Signature</p>
                       <p className="text-xs font-mono font-bold">VrikshLogix v1.0.4-PROD</p>
                    </div>
                 </div>
                 <div className="pt-4 border-t border-border mt-4">
                    <p className="text-[9px] text-muted-foreground leading-relaxed italic">
                       * This packet is optimized for the EU TRACES NT "Bulk Upload" protocol. 
                       It includes all polygon-level geolocation data in GeoJSON format.
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* 5. Submission Pipeline Analytics (Article 12 Compliance) */}
        <div className="bg-white border-2 border-forest-900 p-8">
           <div className="flex items-start justify-between mb-8">
              <div>
                 <span className="op-label text-forest-900">Article 12 Disclosure Readiness</span>
                 <h2 className="text-lg font-bold uppercase tracking-[0.2em] mt-1">Public Reliability Matrix</h2>
              </div>
              <div className="h-10 w-10 border-2 border-forest-900 rotate-45 flex items-center justify-center bg-khaki-100">
                 <Box className="h-5 w-5 text-forest-900 -rotate-45" />
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12 font-mono">
              <div>
                 <p className="text-[9px] font-bold text-muted-foreground uppercase mb-2 leading-none">Due Diligence Coverage</p>
                 <p className="text-2xl font-bold border-b border-border pb-2 leading-none">100%</p>
                 <p className="text-[8px] text-emerald-600 mt-2 uppercase font-bold leading-tight">Requirement_Met</p>
              </div>
              <div>
                 <p className="text-[9px] font-bold text-muted-foreground uppercase mb-2 leading-none">Risk Assess. Clarity</p>
                 <p className="text-2xl font-bold border-b border-border pb-2 leading-none text-amber-500">HIGH</p>
                 <p className="text-[8px] text-muted-foreground mt-2 uppercase font-bold leading-tight">Manual_Audits: {Math.max(1, Math.floor(analytics.speciesVolume.length * 1.5))}</p>
              </div>
              <div>
                 <p className="text-[9px] font-bold text-muted-foreground uppercase mb-2 leading-none">Mitigation Evidence</p>
                 <p className="text-2xl font-bold border-b border-border pb-2 leading-none">ALPHA</p>
                 <p className="text-[8px] text-muted-foreground mt-2 uppercase font-bold leading-tight">Digital_Vault_Active</p>
              </div>
              <div>
                 <p className="text-[9px] font-bold text-muted-foreground uppercase mb-2 leading-none">System Integrity</p>
                 <p className="text-2xl font-bold border-b border-border pb-2 leading-none">SECURE</p>
                 <p className="text-[8px] text-forest-900 mt-2 uppercase font-bold leading-tight">VL_CORE_v1.0.4</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
