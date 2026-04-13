"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Save,
  Trash2,
  Navigation,
  Globe,
  Settings,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Lock,
  Wifi,
  WifiOff,
  CloudUpload,
  Layers,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function MobileMapPage() {
  const [waypoints, setWaypoints] = useState<[number, number][]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "pending" | "offline">("synced");

  function addWaypoint() {
    // Simulated GPS coords for Saharanpur plot
    const lat = 29.9984 + (Math.random() - 0.5) * 0.01;
    const lng = 77.5615 + (Math.random() - 0.5) * 0.01;
    setWaypoints(prev => [...prev, [lat, lng]]);
    toast.success("WAYPOINT_LOCKED", {
      description: `LOC: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    });
  }

  function handleCompletePolygon() {
    if (waypoints.length < 3) {
      toast.error("INVALID_POLYGON", { description: "Minimum 3 points required to define a plot." });
      return;
    }
    setSyncStatus("pending");
    toast.info("POLYGON_FINALIZED", { description: "Calculated Area: 1.42 Ha. Synching when online." });
  }

  return (
    <div className="flex flex-col h-full bg-khaki-100/30 overflow-hidden relative">
      
      {/* 1. Map Canvas Placeholder (Stylized for Mobile Terminal) */}
      <div className="flex-1 bg-khaki-200 relative overflow-hidden">
         {/* Simulated Map Grid */}
         <div className="absolute inset-0 opacity-20 pointer-events-none" 
              style={{ backgroundImage: "linear-gradient(#1b3022 1px, transparent 1px), linear-gradient(90deg, #1b3022 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
         
         {/* Crosshair Overlay */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40">
            <div className="h-10 w-10 border border-forest-900/30 flex items-center justify-center">
               <div className="h-0.5 w-6 bg-forest-900" />
               <div className="h-6 w-0.5 bg-forest-900 absolute" />
            </div>
         </div>

         {/* Simulated Waypoints */}
         {waypoints.map((point, i) => (
           <div 
             key={i} 
             className="absolute h-3 w-3 border-2 border-forest-900 bg-khaki-100 rotate-45 flex items-center justify-center shadow-lg"
             style={{ 
               left: `calc(50% + ${(point[1] - 77.5615) * 5000}px)`, 
               top: `calc(50% - ${(point[0] - 29.9984) * 5000}px)` 
             }}
           >
              <span className="text-[8px] font-mono font-bold -rotate-45">{i + 1}</span>
           </div>
         ))}

         {/* Floating Map HUD */}
         <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
            <div className="p-3 bg-white/90 border border-border shadow-xl backdrop-blur-sm pointer-events-auto space-y-1">
               <span className="text-[9px] font-bold uppercase tracking-widest text-khaki-600 block">Current Coordinate</span>
               <p className="font-mono text-[11px] font-bold text-forest-900 leading-none tracking-tight">29.9984° N, 77.5615° E</p>
               <p className="text-[8px] font-mono text-muted-foreground uppercase mt-1">Accuracy: ± 2.4m</p>
            </div>
            
            <div className="flex flex-col gap-2 pointer-events-auto">
               <Button size="icon" variant="outline" className="h-10 w-10 rounded-none bg-white border-border shadow-md">
                  <Layers className="h-4 w-4" />
               </Button>
               <Button size="icon" variant="outline" className="h-10 w-10 rounded-none bg-white border-border shadow-md">
                  <Maximize2 className="h-4 w-4" />
               </Button>
            </div>
         </div>

         {/* Sync Status Overlay */}
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className={cn(
              "px-4 py-1.5 border-2 shadow-2xl flex items-center gap-2 text-[10px] font-bold font-mono uppercase tracking-widest bg-white",
              syncStatus === 'synced' ? "border-emerald-600 text-emerald-700" :
              syncStatus === 'pending' ? "border-amber-500 text-amber-600 animate-pulse" :
              "border-red-600 text-red-700"
            )}>
               {syncStatus === 'synced' ? <CloudUpload className="h-3 w-3" /> :
                syncStatus === 'pending' ? <WifiOff className="h-3 w-3" /> :
                <Lock className="h-3 w-3" />}
               SYNC_STATUS: {syncStatus}
            </div>
         </div>
      </div>

      {/* 2. Tactical Controls Bar */}
      <div className="bg-white border-t border-border p-6 grid grid-cols-2 gap-4 sticky bottom-0 z-50 shadow-[0_-8px_24px_rgba(0,0,0,0.05)]">
         <Button 
            variant="outline"
            className="h-14 rounded-none border-2 border-border font-bold uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 active:bg-khaki-100"
            disabled={waypoints.length === 0}
            onClick={() => setWaypoints([])}
         >
            <Trash2 className="h-4 w-4 text-red-500" /> RESET_PLOTTING
         </Button>
         
         <Button 
            className="h-14 rounded-none bg-forest-900 text-khaki-100 border-2 border-forest-900 font-bold uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-forest-900/10 active:scale-95 transition-all"
            onClick={addWaypoint}
         >
            <MapPin className="h-4 w-4" /> DROP_WAYPOINT
         </Button>

         <Button 
            className="col-span-2 h-16 bg-white border-2 border-forest-900 text-forest-900 rounded-none font-bold uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-30 disabled:border-border transition-all"
            disabled={waypoints.length < 3}
            onClick={handleCompletePolygon}
         >
            <Navigation className="h-5 w-5" /> FINALIZE_PARCEL_GEOM
         </Button>
      </div>

      {/* 3. Detail Analysis Sheet (Static) */}
      <div className="p-5 bg-khaki-100/50 border-t border-border space-y-3">
         <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-khaki-600">Parcel Analytics</h3>
            <span className="text-[9px] font-mono font-bold text-muted-foreground">EPSG: 4326 (WGS84)</span>
         </div>
         <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Total Points", val: waypoints.length },
              { label: "Calc Area", val: waypoints.length >= 3 ? "1.42 Ha" : "---" },
              { label: "Legal Check", val: "BHULEKH_OK", color: "text-emerald-600" },
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-border p-3">
                 <p className="text-[8px] font-bold text-muted-foreground uppercase leading-none mb-1.5">{stat.label}</p>
                 <p className={cn("text-xs font-mono font-bold", stat.color || "text-forest-900")}>{stat.val}</p>
              </div>
            ))}
         </div>
      </div>

    </div>
  );
}
