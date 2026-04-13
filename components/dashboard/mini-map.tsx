"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface Plot {
  id: string;
  lat: number;
  lng: number;
  risk_score: "green" | "amber" | "red" | null;
  khasra: string;
}

interface MiniMapProps {
  plots: Plot[];
  className?: string;
  center?: [number, number];
  zoom?: number;
}

export function DashboardMiniMap({ plots, className, center = [77.563, 29.998], zoom = 11.5 }: MiniMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const instanceId = useRef(`minimap-${Math.random().toString(36).substr(2, 9)}`);

  // 1. One-time Initialization with mounting protection
  useEffect(() => {
    if (!mapContainer.current) return;
    if (typeof window === "undefined") return;
    if (mapRef.current) return; 

    let rafId: number;

    const initMap = () => {
      try {
        const style = {
          version: 8,
          sources: {
            "osm-standard": {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "© OpenStreetMap",
            },
          },
          layers: [{ id: "osm", type: "raster", source: "osm-standard" }],
        } as any;

        const map = new maplibregl.Map({
          container: mapContainer.current!,
          style: style,
          center: center,
          zoom: zoom,
          attributionControl: false,
        });

        mapRef.current = map;

        map.on("load", () => {
           setMapLoaded(true);
           map.resize();
        });

        map.on("error", (e) => setMapError(e.error?.message || "Engine Error"));

      } catch (err: any) {
        setMapError(err.message || "Init Failed");
      }
    };

    // Wait for the next frame to ensure parent layout is calculated
    rafId = requestAnimationFrame(() => {
       initMap();
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setMapLoaded(false);
      }
    };
  }, []); 
// Only init once 

  // Sync Markers
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    
    async function sync() {
        // 1. Clear existing markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // 2. Add new markers
        plots.forEach((plot) => {
          const color = plot.risk_score === 'green' ? '#10b981' : plot.risk_score === 'amber' ? '#f59e0b' : plot.risk_score === 'red' ? '#ef4444' : '#9ca3af';
          
          const el = document.createElement("div");
          el.className = "cursor-pointer group";
          el.style.width = '24px';
          el.style.height = '24px';
          el.innerHTML = `
            <div class="relative flex items-center justify-center h-full w-full">
               <div style="background-color: white; border: 2px solid ${color}; width: 100%; height: 100%; transform: rotate(45deg); transition: all 0.2s;" class="shadow-sm"></div>
            </div>
          `;
          
          const marker = new maplibregl.Marker({ element: el }).setLngLat([plot.lng, plot.lat]).addTo(mapRef.current);
          markersRef.current.push(marker);
        });

        // Fix blank maps
        setTimeout(() => mapRef.current?.resize(), 100);
    }
    
    sync();
  }, [mapLoaded, plots]);

  return (
    <div 
      className={cn("relative overflow-hidden bg-khaki-100/5", className)}
      style={{ height: '500px', width: '100%', minHeight: '500px' }}
    >
      <div 
        ref={mapContainer} 
        className="absolute inset-0 z-0 bg-khaki-200/50 border-b border-forest-900/5" 
        style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
      />
      
      {mapError && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-950/20 backdrop-blur-sm p-4">
           <div className="bg-red-900 text-white p-2 font-mono text-[8px] border border-red-500 shadow-xl">
              MINI_MAP_ERROR: {mapError}
           </div>
        </div>
      )}

      {!mapLoaded && !mapError && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/90 p-2 shadow-sm border border-border">
           <div className="h-3 w-3 border-2 border-forest-900 border-t-transparent rounded-full animate-spin" />
           <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-forest-900">Syncing_GIS...</span>
        </div>
      )}

      {/* Coordinate Overlay (Dashboard style) */}
      <div className="absolute bottom-2 right-2 z-10 bg-white/80 border border-border px-1.5 py-0.5 text-[8px] font-mono text-muted-foreground uppercase">
        {mapLoaded ? "Live_Feed: Active" : "Engine: Idle"}
      </div>
    </div>
  );
}
