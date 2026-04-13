"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Shield,
  ChevronLeft,
  ChevronRight,
  Search,
  Maximize2,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createWorker } from "tesseract.js";
import { createClient } from "@/lib/supabase/client";

interface FieldData {
  value: string;
  confidence: number;
}

interface ExtractedData {
  permit_no: FieldData;
  issue_date: FieldData;
  species: FieldData;
  volume_cft: FieldData;
  origin_district: FieldData;
  range_office: FieldData;
  destination: FieldData;
}

export default function NewPermitPage() {
  const router = useRouter();
  const supabase = createClient();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [step, setStep] = useState<"upload" | "verify">("upload");
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const parseExtractedText = (text: string): ExtractedData => {
    // Advanced parsing logic for UP Forest Department Form-T Templates
    const normalized = text.toLowerCase();
    
    // Permit Number (e.g. UP-SHR-2026-00341)
    const permitMatch = text.match(/UP-[A-Z]{3}-\d{4}-\d+/i) || text.match(/UP\d{8}/i);
    
    // Species Detection
    const speciesList = ["sheesham", "shisham", "dalbergia", "mango", "mangifera", "teak", "tectona", "eucalyptus"];
    const foundSpecies = speciesList.find(s => normalized.includes(s));
    const speciesMap: Record<string, string> = {
      "sheesham": "Sheesham (Dalbergia sissoo)",
      "shisham": "Sheesham (Dalbergia sissoo)",
      "dalbergia": "Sheesham (Dalbergia sissoo)",
      "mango": "Mango (Mangifera indica)",
      "mangifera": "Mango (Mangifera indica)",
      "teak": "Teak (Tectona grandis)",
      "tectona": "Teak (Tectona grandis)",
      "eucalyptus": "Eucalyptus",
    };

    // Volume Extraction (looking for CFT or numbers followed by vol/qty)
    const volumeMatch = normalized.match(/(\d+\.?\d*)\s*(cft|cubic|volume)/) || normalized.match(/volume[:\s]*(\d+\.?\d*)/);

    // Date extraction
    const dateMatch = text.match(/(\d{2}[-/.]\d{2}[-/.]\d{4})/) || text.match(/(\d{4}[-/.]\d{2}[-/.]\d{2})/);

    // Origin District
    const districtMatch = normalized.includes("saharanpur") ? "Saharanpur" : 
                         normalized.includes("gangoh") ? "Gangoh" : 
                         normalized.includes("deoband") ? "Deoband" : "Unknown";

    return {
      permit_no: { value: permitMatch ? permitMatch[0].toUpperCase() : "NOT_DETECTED", confidence: permitMatch ? 0.95 : 0.4 },
      issue_date: { value: dateMatch ? dateMatch[0].replace(/[/.]/g, '-') : new Date().toISOString().split('T')[0], confidence: dateMatch ? 0.9 : 0.5 },
      species: { value: foundSpecies ? speciesMap[foundSpecies] : "MIXED HARDWOOD", confidence: foundSpecies ? 0.92 : 0.3 },
      volume_cft: { value: volumeMatch ? volumeMatch[1] : "0.0", confidence: volumeMatch ? 0.85 : 0.4 },
      origin_district: { value: districtMatch, confidence: districtMatch !== "Unknown" ? 0.99 : 0.2 },
      range_office: { value: "Audit Required", confidence: 0.5 },
      destination: { value: "VL-SAWMILL-DEFAULT", confidence: 0.6 },
    };
  };

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setIsProcessing(true);
    setProgress(0);
    setStatusMessage("INITIALIZING_WORKER");

    try {
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
            setStatusMessage("RECOGNIZING_PATTERNS");
          } else {
            setStatusMessage(m.status.toUpperCase().replace(/\s+/g, "_"));
          }
        },
      });

      const { data: { text } } = await worker.recognize(selectedFile);
      await worker.terminate();

      const parsed = parseExtractedText(text);
      setExtractedData(parsed);
      
      setIsProcessing(false);
      setStep("verify");
      toast.success("Extraction Complete", {
        description: "Document properties mapped to registry nodes.",
      });
    } catch (err) {
      console.error("OCR Error:", err);
      toast.error("Extraction Failed", { description: "Could not process document. Falling back to manual entry." });
      setIsProcessing(false);
      // Fallback empty data
      setExtractedData({
        permit_no: { value: "", confidence: 0 },
        issue_date: { value: "", confidence: 0 },
        species: { value: "", confidence: 0 },
        volume_cft: { value: "", confidence: 0 },
        origin_district: { value: "", confidence: 0 },
        range_office: { value: "", confidence: 0 },
        destination: { value: "", confidence: 0 },
      });
      setStep("verify");
    }
  }

  const handleCommit = async () => {
    if (!extractedData) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      let { data: exporter } = await supabase
        .from('exporters')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // Auto-provision if profile is missing (resiliency enhancement)
      if (!exporter) {
        const { data: newExporter, error: createError } = await supabase
          .from('exporters')
          .insert({
            user_id: user.id,
            company_name: user.user_metadata?.company_name || 'Unnamed Organization',
            contact_email: user.email,
          })
          .select('id')
          .single();
        
        if (createError) throw createError;
        exporter = newExporter;
      }

      const { error } = await supabase
        .from('form_t_permits')
        .insert({
          exporter_id: exporter.id,
          permit_no: extractedData.permit_no.value,
          species: [extractedData.species.value],
          volume_cft: parseFloat(extractedData.volume_cft.value),
          issue_date: extractedData.issue_date.value,
          origin_district: extractedData.origin_district.value,
          issuing_range_office: extractedData.range_office.value,
          status: 'verified', // Assuming the user verified it in this terminal
          ocr_method: 'tesseract',
          ocr_confidence: extractedData,
        });

      if (error) throw error;

      toast.success("Committed to Registry", { description: "Permit successfully added to your compliance vault." });
      router.push("/dashboard/permits");
    } catch (err: any) {
      toast.error("Commit Failed", { description: err.message });
    }
  };

  if (step === "upload") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-khaki-100/10 h-full select-none">
        <div className="w-full max-w-xl border-2 border-dashed border-border p-12 text-center space-y-4 bg-white hover:bg-khaki-100/5 transition-colors group relative overflow-hidden">
          {isProcessing && (
            <div className="absolute inset-0 bg-forest-900/5 animate-pulse z-0" />
          )}
          
          <div className="relative z-10 flex flex-col items-center">
            <div className={cn(
              "h-16 w-16 mb-6 border border-border flex items-center justify-center transition-transform",
              isProcessing ? "" : "group-hover:scale-110"
            )}>
              {isProcessing ? <Loader2 className="h-8 w-8 text-forest-900 animate-spin" /> : <FileText className="h-8 w-8 text-forest-900" />}
            </div>
            
            <h2 className="text-2xl font-bold tracking-tighter uppercase text-forest-900">
              {isProcessing ? statusMessage : "Upload Form-T Permit"}
            </h2>
            <p className="text-sm text-khaki-600 max-w-xs mx-auto mt-2 font-medium">
              Mandatory transit permit issued by UP Forest Dept. 
              Supports .JPG or .PNG
            </p>

            {!isProcessing && (
              <div className="mt-8">
                 <label className="bg-forest-900 text-khaki-100 px-8 py-3 font-bold text-xs uppercase cursor-pointer hover:bg-forest-800 transition-colors tracking-widest">
                   Select System File
                   <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                 </label>
              </div>
            )}

            {isProcessing && (
              <div className="mt-8 w-64 space-y-2">
                <div className="flex justify-between text-[10px] font-mono font-bold text-muted-foreground uppercase">
                  <span>{statusMessage}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1 bg-border overflow-hidden">
                  <div className="h-full bg-forest-900 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" onClick={() => setStep("upload")} className="h-8 w-8 rounded-none border border-border">
             <ChevronLeft className="h-4 w-4" />
           </Button>
           <div>
             <span className="op-label !mb-0 text-forest-900">Document Audit Terminal</span>
             <h1 className="text-sm font-bold uppercase tracking-widest">AUDIT_REF: {file?.name}</h1>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-3 py-1 border border-border bg-khaki-100/50 text-[10px] font-mono font-bold uppercase tracking-tighter">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Tesseract_Engine: Active
           </div>
           <Button className="h-8 bg-forest-900 text-khaki-100 px-6 text-[10px] uppercase font-bold rounded-none hover:bg-forest-800" onClick={handleCommit}>
             Commit to Registry
           </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 bg-khaki-100/30 p-8 overflow-y-auto border-r border-border flex justify-center relative">
          <div className="relative w-full max-w-2xl bg-white border border-border shadow-2xl p-6 min-h-[900px]">
             {previewUrl && (
               <img src={previewUrl} alt="Permit Preview" className="w-full h-auto border border-border" />
             )}
             <div className="absolute top-0 left-0 w-full h-[1px] bg-emerald-500/30 shadow-[0px_0px_10px_2px_rgba(16,185,129,0.3)] animate-[scan_4s_linear_infinite]" />
          </div>
        </div>

        <div className="w-[450px] bg-white flex flex-col overflow-hidden border-l border-border">
          <div className="p-4 border-b border-border bg-khaki-100/30 flex justify-between items-center">
             <div>
               <span className="op-label !mb-0 text-forest-900">Extraction Queue</span>
               <p className="text-[10px] text-muted-foreground uppercase font-mono mt-0.5">Audit_Terminal_Node: 01</p>
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {extractedData && Object.entries(extractedData).map(([field, data]) => {
              const isLow = data.confidence < 0.8;
              return (
                <div key={field} className="space-y-2 group">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-khaki-600">{field.replace('_', ' ')}</span>
                    <span className={cn(
                      "text-[9px] font-mono font-bold px-2 py-0.5 border-l-4 leading-none",
                      isLow ? "bg-amber-50 border-amber-500 text-amber-900" : "bg-emerald-50 border-emerald-500 text-emerald-900"
                    )}>
                      SENSE_LEVEL: {Math.round(data.confidence * 100)}%
                    </span>
                  </div>
                  <Input 
                    value={data.value} 
                    onChange={(e) => setExtractedData({...extractedData, [field]: { ...data, value: e.target.value }})}
                    className={cn(
                      "rounded-none border-border font-mono text-xs h-10 bg-white uppercase tracking-tight focus:border-forest-900",
                      isLow && "border-amber-400 bg-amber-50"
                    )}
                  />
                </div>
              );
            })}
          </div>

          <div className="p-6 border-t border-border bg-khaki-100/10">
              <Button onClick={handleCommit} className="w-full h-12 bg-forest-900 text-khaki-100 uppercase font-bold text-xs tracking-widest rounded-none">
                Commit Extraction to Registry
              </Button>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(900px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
