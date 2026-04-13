"use client";

import { useState } from "react";
import { 
  QrCode, 
  Camera, 
  RefreshCw, 
  X, 
  History,
  CheckCircle2,
  AlertTriangle,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ArtisanScannerPage() {
  const [isScanning, setIsScanning] = useState(true);
  const [scanResult, setScanResult] = useState<string | null>(null);

  function simulateScan() {
    setIsScanning(false);
    setScanResult("SAW-BTC-26-041");
    toast.success("QR_CODE_AUTHENTICATED", {
      description: "Batch found in sawmill dispatch registry.",
    });
  }

  return (
    <div className="flex flex-col h-full bg-black overflow-hidden relative">
      
      {/* 1. Camera Viewport Simulation */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 relative overflow-hidden">
         <div className="absolute inset-0 opacity-20 pointer-events-none" 
              style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
         
         {isScanning ? (
           <div className="relative w-full aspect-square border-2 border-dashed border-white/50 flex items-center justify-center">
              <div className="absolute top-0 left-0 h-8 w-8 border-l-4 border-t-4 border-emerald-500" />
              <div className="absolute top-0 right-0 h-8 w-8 border-r-4 border-t-4 border-emerald-500" />
              <div className="absolute bottom-0 left-0 h-8 w-8 border-l-4 border-b-4 border-emerald-500" />
              <div className="absolute bottom-0 right-0 h-8 w-8 border-r-4 border-b-4 border-emerald-500" />
              
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,1)] animate-scan" />
              <Camera className="h-10 w-10 text-white/20" />
           </div>
         ) : (
           <div className="bg-white border-2 border-emerald-500 p-8 text-center space-y-4 animate-scale-in">
              <div className="h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-white">
                 <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-khaki-600">Discovered Batch Node</p>
                 <h2 className="text-xl font-bold font-mono text-forest-900 mt-1">{scanResult}</h2>
              </div>
              <Button 
                className="w-full bg-forest-900 text-khaki-100 uppercase font-bold text-xs tracking-widest h-12 rounded-none shadow-xl"
                onClick={() => setIsScanning(true)}
              >
                PROCEED_TO_RECEPTION
              </Button>
           </div>
         )}

         {isScanning && (
            <p className="text-white font-mono text-[11px] font-bold uppercase tracking-[0.2em] animate-pulse">
               Align QR Code in Frame
            </p>
         )}
      </div>

      {/* 2. Tactical Overlay Controls */}
      <div className="bg-white/95 border-t border-border p-6 space-y-6 backdrop-blur-md">
         <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-khaki-600">Recent Scans</span>
            <History className="h-4 w-4 text-khaki-600" />
         </div>

         <div className="space-y-2">
            {[
              { ref: "SAW-BTC-26-039", date: "Today 09:22" },
              { ref: "SAW-BTC-26-012", date: "Yesterday 16:11" },
            ].map((scan, i) => (
              <div key={i} className="bg-khaki-100/30 border border-border p-3 flex items-center justify-between">
                 <div>
                    <p className="font-mono text-[11px] font-bold text-forest-900">{scan.ref}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">{scan.date}</p>
                 </div>
                 <ChevronRight className="h-4 w-4 text-khaki-600" />
              </div>
            ))}
         </div>

         <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-14 rounded-none border-2 border-border font-bold uppercase text-[10px] tracking-widest bg-white"
              onClick={simulateScan}
            >
               SIMULATE_SCAN
            </Button>
            <Button variant="outline" className="h-14 rounded-none border-2 border-border font-bold uppercase text-[10px] tracking-widest bg-white">
               TOGGLE_FLASH
            </Button>
         </div>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { top: 10%; }
          100% { top: 90%; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
