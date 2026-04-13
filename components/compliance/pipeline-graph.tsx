"use client";

import {
  TreePine,
  FileText,
  Factory,
  Ship,
  ArrowRight,
  ShieldCheck,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

const stages = [
  {
    id: "harvest",
    label: "Harvest Plots",
    hindi: "उत्पादन भूमि",
    icon: TreePine,
    status: "verified",
    count: 47,
    detail: "Bhulekh verified",
    x: 0,
    y: 20,
  },
  {
    id: "transit",
    label: "Transit Permits",
    hindi: "परिवहन अनुमति",
    icon: FileText,
    status: "verified",
    count: 12,
    detail: "Form-T OCR sync",
    x: 200,
    y: 60,
  },
  {
    id: "sawmill",
    label: "Batch Processing",
    hindi: "आरा मिल प्रसंस्करण",
    icon: Factory,
    status: "processing",
    count: 5,
    detail: "Lineage tracked",
    x: 420,
    y: 10,
  },
  {
    id: "carving",
    label: "Carving Units",
    hindi: "नक्काशी इकाई",
    icon: Package,
    status: "idle",
    count: 18,
    detail: "Artisan check-in",
    x: 640,
    y: 50,
  },
  {
    id: "export",
    label: "Shipment / DDS",
    hindi: "निर्यात / डीडीएस",
    icon: Ship,
    status: "pending",
    count: 3,
    detail: "TRACES ready",
    x: 860,
    y: 30,
  },
];

export function PipelineNodeGraph() {
  return (
    <div className="relative w-full h-[280px] overflow-x-auto overflow-y-visible bg-khaki-100/30 border border-border p-4 select-none shadow-inner">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ backgroundImage: "radial-gradient(#1b3022 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
      
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#a8957c" />
          </marker>
        </defs>
        
        {/* Connection Lines */}
        {stages.map((stage, i) => {
          if (i === stages.length - 1) return null;
          const next = stages[i+1];
          return (
            <path
              key={`path-${stage.id}`}
              d={`M ${stage.x + 160} ${stage.y + 40} C ${stage.x + 200} ${stage.y + 40}, ${next.x - 40} ${next.y + 40}, ${next.x} ${next.y + 40}`}
              fill="none"
              stroke="#dcdad2"
              strokeWidth="2"
              strokeDasharray="4 4"
              markerEnd="url(#arrow)"
            />
          );
        })}
      </svg>

      <div className="relative flex min-w-[1000px] h-full">
        {stages.map((stage) => (
          <div
            key={stage.id}
            style={{ 
              position: "absolute", 
              left: `${stage.x}px`, 
              top: `${stage.y}px` 
            }}
            className="group"
          >
            <div className="relative flex flex-col items-center">
              {/* Node "Object" */}
              <div className={cn(
                "w-40 h-24 border-2 bg-white transition-all duration-200 p-3",
                "border-border group-hover:border-accent shadow-[4px_4px_0px_0px_rgba(220,218,210,0.5)]",
                "flex flex-col justify-between"
              )}>
                <div className="flex justify-between items-start">
                  <div className="p-1.5 border border-border bg-khaki-100">
                    <stage.icon className="h-4 w-4 text-forest-900" />
                  </div>
                  <span className="font-mono text-[10px] font-bold text-muted-foreground">{stage.count} UNITS</span>
                </div>
                
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-tight text-forest-900 truncate">
                    {stage.label}
                  </h4>
                  <p className="text-[9px] font-medium text-khaki-600 leading-none mt-0.5">
                    {stage.hindi}
                  </p>
                </div>
              </div>

              {/* Tactical Badge Below */}
              <div className="mt-2 flex items-center gap-1 px-2 py-0.5 border border-border bg-khaki-200 text-[9px] font-mono font-bold uppercase tracking-tighter">
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  stage.status === 'verified' ? "bg-emerald-500" : 
                  stage.status === 'processing' ? "bg-amber-500" : "bg-khaki-400"
                )} />
                {stage.status}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend / Info */}
      <div className="absolute bottom-2 left-4 text-[9px] font-mono text-khaki-600/60 flex gap-4 uppercase tracking-widest">
        <span className="flex items-center gap-1"><span className="h-1 w-1 bg-khaki-400 rounded-full" /> System Flow Diagram</span>
        <span className="flex items-center gap-1"><span className="h-1 w-1 bg-khaki-400 rounded-full" /> Saharanpur Logix v1.02</span>
      </div>
    </div>
  );
}
