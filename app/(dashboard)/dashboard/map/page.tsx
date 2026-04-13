"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Layers, 
  MapPin, 
  Satellite, 
  TreePine, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Plus, 
  Crosshair,
  Maximize2,
  Info,
  ChevronRight,
  ChevronLeft,
  X,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getMapPlotsAction } from "@/lib/actions/compliance";
import { parsePostGISPoint } from "@/lib/geo-utils";
import { toast } from "sonner";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [plots, setPlots] = useState<any[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<any>(null);
  const [mapStyle, setMapStyle] = useState<"streets" | "satellite">("streets");
  const [coordinates, setCoordinates] = useState({ lat: 29.998, lng: 77.563 });
  const [mapError, setMapError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Load production data — graceful fallback if table not in schema cache
  useEffect(() => {
    async function load() {
      try {
        const res = await getMapPlotsAction();
        if (res.success && res.data) {
          setPlots(res.data);
        } else {
          // Non-blocking: map still loads with zero plots
          console.warn("[GIS] Plot data unavailable:", res.message);
        }
      } catch (err) {
        console.warn("[GIS] Plot fetch failed, loading map without data:", err);
      }
      setLoadingData(false);
    }
    load();
  }, []);

  // 1. One-time Initialization with navigation guard
  useEffect(() => {
    if (!mapContainer.current || loadingData) return;
    if (mapRef.current) return; 

    let rafId: number;

    const initMap = () => {
      try {
        const styles = {
          streets: {
            version: 8 as any,
            sources: {
              "osm-standard": {
                type: "raster" as any,
                tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                tileSize: 256,
                attribution: "© OpenStreetMap contributors",
              },
            },
            layers: [{ id: "osm", type: "raster" as any, source: "osm-standard" }],
          },
          satellite: {
            version: 8 as any,
            sources: {
              "esri-world": {
                type: "raster" as any,
                tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
                tileSize: 256,
                attribution: "Esri, Maxar, Earthstar Geographics, etc.",
              },
            },
            layers: [{ id: "esri", type: "raster" as any, source: "esri-world" }],
          },
        };

        const map = new maplibregl.Map({
          container: mapContainer.current!,
          style: styles[mapStyle] as any,
          center: [77.563, 29.998] as [number, number],
          zoom: 11.5,
          attributionControl: false,
        });

        mapRef.current = map;

        map.on("load", () => {
          console.log("GIS_ENGINE: READY");
          setMapLoaded(true);
          map.resize();
        });

        map.on("error", (e) => {
          console.error("GIS_ENGINE_ERROR:", e);
          setMapError(e.error?.message || "Engine Error");
        });

        map.on("mousemove", (e) => {
          setCoordinates({ lat: e.lngLat.lat, lng: e.lngLat.lng });
        });

        // Test Marker (Always Visible)
        const testEl = document.createElement("div");
        testEl.className = "w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-xl z-50 animate-pulse";
        new maplibregl.Marker({ element: testEl }).setLngLat([77.563, 29.998]).addTo(map);

        setTimeout(() => { if (mapRef.current) mapRef.current.resize(); }, 300);
      } catch (err: any) {
        setMapError(err.message || "Init Failed");
      }
    };

    // Frame delay to ensure container size is stable
    rafId = requestAnimationFrame(() => {
       initMap();
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (mapRef.current) {
        console.log("GIS_ENGINE: Cleanup_Triggered");
        mapRef.current.remove();
        mapRef.current = null;
        setMapLoaded(false);
      }
    };
  }, [loadingData]);

  // 2. Dynamic Style Switching
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    
    const styles = {
      streets: {
        version: 8 as any,
        sources: {
          "osm-standard": {
            type: "raster" as any,
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
          },
        },
        layers: [{ id: "osm", type: "raster" as any, source: "osm-standard" }],
      },
      satellite: {
        version: 8 as any,
        sources: {
          "esri-world": {
            type: "raster" as any,
            tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
            tileSize: 256,
          },
        },
        layers: [{ id: "esri", type: "raster" as any, source: "esri-world" }],
      },
    };

    mapRef.current.setStyle(styles[mapStyle] as any);
  }, [mapStyle, mapLoaded]);

  // Decoupled Marker Sync
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    plots.forEach((plot) => {
      let lng = 77.563;
      let lat = 29.998;
      const coords = parsePostGISPoint(plot.centroid);
      if (coords) [lng, lat] = coords;

      const risk = plot.bhulekh_verified_at ? 'green' : 'amber';
      const color = risk === 'green' ? '#10b981' : '#f59e0b';

      const el = document.createElement("div");
      el.className = "cursor-pointer group flex items-center justify-center";
      el.style.width = '32px';
      el.style.height = '32px';
      el.innerHTML = `
        <div class="relative flex items-center justify-center h-full w-full">
           <div class="absolute h-full w-full rounded-full bg-white/40 animate-ping group-hover:bg-white/60"></div>
           <div style="background-color: white; border: 2px solid ${color}; width: 14px; height: 14px; transform: rotate(45deg); transition: all 0.2s;" class="shadow-lg group-hover:scale-125 z-10"></div>
        </div>
      `;
      el.addEventListener('click', () => setSelectedPlot(plot));
      const marker = new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(mapRef.current);
      markersRef.current.push(marker);
    });
  }, [mapLoaded, plots]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background font-sans">
      {/* 1. Tactical GIS Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-white z-20 shadow-sm">
        <div className="flex items-center gap-4">
           <div>
             <span className="op-label !mb-0 text-forest-900 text-[10px] tracking-widest font-bold">Geospatial Audit Interface</span>
             <h1 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
               Registry_Map: Active_Traceability_Overlay
             </h1>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-6 px-4 py-1.5 border border-border bg-khaki-100/30 font-mono text-[9px] font-bold uppercase tracking-tighter shadow-inner">
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Compliant: {plots.filter(p=>p.bhulekh_verified_at).length}</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Assessment Required: {plots.filter(p=>!p.bhulekh_verified_at).length}</div>
           </div>
           <Button className="h-8 bg-forest-900 text-khaki-100 px-6 text-[10px] uppercase font-bold rounded-none hover:bg-forest-800 transition-all shadow-md">
             <Plus className="h-3 w-3 mr-2" /> Plot Perimeter Survey
           </Button>
        </div>
      </div>

      {/* 2. Full Screen Map Viewport */}
      <div 
        className="relative overflow-hidden group border-t border-forest-900/10 w-full"
        style={{ height: 'calc(100vh - 64px)', minHeight: '600px', position: 'relative' }}
      >
        <div 
          ref={mapContainer} 
          className="absolute inset-0 z-0 bg-khaki-200/50 transition-colors duration-1000" 
          style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
        />
        
        {/* Diagnostic HUD Overlay */}
        <div className="absolute top-4 left-4 z-50 flex flex-col gap-2 pointer-events-none">
           <div className="bg-black/80 text-white p-3 font-mono text-[9px] border border-white/20 backdrop-blur shadow-2xl min-w-[200px] pointer-events-auto">
              <div className="flex justify-between border-b border-white/10 pb-1 mb-2">
                 <span className="text-white/60">GIS_DIAGNOSTICS</span>
                 <span className={cn("px-1", mapLoaded ? "bg-emerald-500" : "bg-amber-500 animate-pulse")}>
                   {mapLoaded ? "STATUS:READY" : "STATUS:INIT"}
                 </span>
              </div>
              <div className="space-y-1 opacity-80">
                 <div className="flex justify-between"><span>Engine:</span> <span>MapLibre_GL_v5</span></div>
                 <div className="flex justify-between"><span>Plots_Synced:</span> <span>{plots.length}</span></div>
                 <div className="flex justify-between"><span>Tiles:</span> <span className="text-amber-400">{mapStyle === 'streets' ? 'OSM_STANDARD' : 'ESRI_WORLD'}</span></div>
                 <div className="flex justify-between text-blue-400"><span>Viewport:</span> <span>ABS_LOCK_V8</span></div>
              </div>
              <Button 
                onClick={() => window.location.reload()}
                className="mt-3 w-full h-6 bg-white/10 hover:bg-white/20 text-[8px] uppercase font-bold rounded-none border border-white/20"
              >
                Hard_Reset_Engine
              </Button>
                 {mapError && (
                   <div className="mt-2 p-2 bg-red-900/50 border border-red-500 text-red-100 whitespace-pre-wrap br-all">
                      FATAL_ERROR: {mapError}
                   </div>
                 )}
           </div>
        </div>
        
        {loadingData && (
          <div className="absolute top-4 right-4 z-50 p-2 bg-white/90 border border-border shadow-xl rounded">
             <Loader2 className="h-4 w-4 animate-spin text-forest-900" />
          </div>
        )}

        {/* Floating Map HUD - Left */}
        <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
           <div className="gis-panel p-1 flex flex-col gap-1 shadow-xl bg-white/90 backdrop-blur border border-border">
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-none bg-khaki-100/50" title="Pan to Center"><Crosshair className="h-4.5 w-4.5 text-forest-900" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-none hover:bg-khaki-100" title="Full Map"><Maximize2 className="h-4.5 w-4.5" /></Button>
           </div>
           <div className="gis-panel p-1 flex flex-col gap-1 mt-2 shadow-xl bg-white/90 backdrop-blur border border-border">
              <Button size="icon" variant="ghost" className={cn("h-8 w-8 rounded-none", mapStyle==='streets' && "bg-forest-900 text-white")} onClick={() => setMapStyle('streets')}><Layers className="h-4.5 w-4.5" /></Button>
              <Button size="icon" variant="ghost" className={cn("h-8 w-8 rounded-none", mapStyle==='satellite' && "bg-forest-900 text-white")} onClick={() => setMapStyle('satellite')}><Satellite className="h-4.5 w-4.5" /></Button>
           </div>
        </div>

        {/* Floating Search HUD - Right Top */}
        <div className="absolute top-6 right-6 z-10 flex gap-2">
           <div className="gis-panel px-3 py-1.5 flex items-center gap-3 shadow-xl bg-white/90 backdrop-blur border border-border">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input placeholder="SEARCH_KHASRA..." className="bg-transparent border-none outline-none text-[10px] font-mono font-bold w-48 uppercase font-sans focus:ring-0" />
           </div>
        </div>

        {/* Plot Details Sidebar (Slide In) */}
        <div className={cn(
          "absolute inset-y-0 right-0 z-20 w-[420px] bg-white border-l border-border transition-transform duration-300 transform shadow-2xl flex flex-col",
          selectedPlot ? "translate-x-0" : "translate-x-full"
        )}>
          {selectedPlot && (
             <>
               <div className="p-6 border-b border-border bg-khaki-100/30 flex justify-between items-center">
                  <div>
                    <span className="op-label !mb-0 text-forest-900 font-bold uppercase tracking-widest text-[10px]">Parcel Identification</span>
                    <h2 className="text-lg font-bold uppercase tracking-tight font-sans">KHASRA_{selectedPlot.khasra_no}</h2>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedPlot(null)} className="h-8 w-8 rounded-none border border-border bg-white hover:bg-khaki-100">
                    <X className="h-4 w-4" />
                  </Button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  <div className="grid grid-cols-2 gap-px bg-border border border-border">
                     {[
                       { label: "Village / Block", value: selectedPlot.village },
                       { label: "Registry Area", value: `${selectedPlot.area_ha} Hectares` },
                       { label: "Primary Species", value: selectedPlot.timber_species?.join(", ") || "Unspecified" },
                       { label: "Land Ownership", value: selectedPlot.farmers?.name || "Unknown" },
                     ].map(item => (
                       <div key={item.label} className="bg-white p-3 group hover:bg-khaki-100/10 transition-colors">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</span>
                          <p className="text-xs font-bold font-mono text-forest-900 mt-1 uppercase leading-tight">{item.value}</p>
                       </div>
                     ))}
                  </div>

                  <div className="space-y-4">
                     <span className="op-label text-forest-900 font-bold uppercase text-[10px] tracking-widest underline decoration-khaki-500 decoration-2 underline-offset-4">EUDR Risk Assessment</span>
                     <div className={cn(
                       "border-2 p-6 flex items-center justify-between shadow-inner transition-colors",
                       selectedPlot.bhulekh_verified_at ? "border-emerald-600 bg-emerald-50/50" : "border-amber-600 bg-amber-50/50"
                     )}>
                        <div>
                           <p className="font-mono text-[10px] font-bold text-muted-foreground uppercase">Compliance_Level</p>
                           <p className={cn(
                             "text-xl font-bold uppercase tracking-tighter font-sans",
                             selectedPlot.bhulekh_verified_at ? "text-emerald-700" : "text-amber-700"
                           )}>
                             {selectedPlot.bhulekh_verified_at ? "L0 — Verified Clear" : "L1 — Assessment Required"}
                           </p>
                        </div>
                        {selectedPlot.bhulekh_verified_at ? <CheckCircle2 className="h-8 w-8 text-emerald-600" /> : <AlertTriangle className="h-8 w-8 text-amber-600" />}
                     </div>
                     <p className="text-[10px] text-muted-foreground leading-relaxed italic uppercase font-medium">
                       Satellite monitoring integrated via GFW. Next automated scan scheduled within 72 hours.
                     </p>
                  </div>

                  <div className="pt-4 border-t border-border">
                     <span className="op-label text-forest-900 font-bold uppercase text-[10px] tracking-widest">Operational Links</span>
                     <div className="grid grid-cols-2 gap-3 mt-4">
                        <Link href={`/dashboard/farmers`}>
                           <Button variant="outline" className="w-full rounded-none h-12 text-[10px] font-bold uppercase tracking-widest bg-white border-forest-900/20 text-forest-900 hover:bg-khaki-100 transition-all font-sans">
                              <Info className="h-4 w-4 mr-2" /> View Ledger
                           </Button>
                        </Link>
                        <Button className="rounded-none h-12 text-[10px] font-bold uppercase tracking-widest bg-forest-900 text-khaki-100 hover:bg-forest-800 transition-all font-sans shadow-md">
                           <Satellite className="h-4 w-4 mr-2" /> Refresh Scan
                        </Button>
                     </div>
                  </div>
               </div>
               
               <div className="p-6 border-t border-border bg-khaki-100/10">
                  <Button className="w-full h-12 bg-forest-900 text-khaki-100 uppercase font-bold text-xs tracking-widest rounded-none shadow-xl hover:bg-forest-800 transition-all font-sans">
                     Generate DDS Submission Kit
                  </Button>
               </div>
             </>
          )}
        </div>

        {/* Bottom Coordinates Strip */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
           <div className="gis-panel px-6 py-2 flex items-center gap-8 shadow-2xl bg-white/90 backdrop-blur border border-border">
              <div className="flex flex-col">
                 <span className="text-[8px] font-bold text-muted-foreground uppercase">Latitude_N</span>
                 <span className="text-xs font-mono font-bold text-forest-900 tracking-widest">{coordinates.lat.toFixed(6)}°</span>
              </div>
              <div className="h-6 w-[1px] bg-border" />
              <div className="flex flex-col">
                 <span className="text-[8px] font-bold text-muted-foreground uppercase">Longitude_E</span>
                 <span className="text-xs font-mono font-bold text-forest-900 tracking-widest">{coordinates.lng.toFixed(6)}°</span>
              </div>
              <div className="h-6 w-[1px] bg-border" />
              <div className="flex flex-col">
                 <span className="text-[8px] font-bold text-muted-foreground uppercase">Projection</span>
                 <span className="text-xs font-mono font-bold text-forest-900 tracking-widest">EPSG:4326</span>
              </div>
           </div>
        </div>

        {/* Right Corner Legend */}
        <div className={cn(
          "absolute bottom-6 left-6 z-10 flex flex-col gap-2 transition-opacity duration-300",
          selectedPlot ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
           <div className="gis-panel p-4 space-y-3 min-w-[200px] bg-white/90 backdrop-blur shadow-2xl border border-border">
              <span className="op-label !mb-0 text-forest-900 font-bold uppercase text-[10px] tracking-widest">Map_Legend</span>
              <div className="space-y-2">
                 {[
                   { color: 'bg-emerald-500', label: 'L0_Compliant' },
                   { color: 'bg-amber-500', label: 'L1_Observation' },
                   { color: 'bg-red-500', label: 'L2_Violation' },
                   { color: 'bg-khaki-300', label: 'U_Unassessed' },
                 ].map(item => (
                   <div key={item.label} className="flex items-center gap-2">
                      <div className={cn("h-3 w-3 shadow-sm rotate-45 border border-white", item.color)} />
                      <span className="text-[10px] font-mono font-bold text-khaki-700 uppercase tracking-tighter">{item.label}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
