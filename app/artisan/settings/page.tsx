"use client";

import { 
  User, 
  Settings, 
  Shield, 
  Wifi, 
  Database, 
  ChevronRight, 
  LogOut,
  HelpCircle,
  FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ArtisanSettingsPage() {
  return (
    <div className="p-5 space-y-8">
       {/* 1. Header Section */}
       <div className="space-y-1">
          <h2 className="text-xl font-bold uppercase tracking-widest text-forest-900 leading-none">Workshop Node</h2>
          <p className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-tight">Configuration & Sync Portal</p>
       </div>

       {/* 2. Profile Card */}
       <div className="bg-white border border-border p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 bg-khaki-100 border border-border flex items-center justify-center rounded-none rotate-45">
                <div className="-rotate-45">
                   <User className="h-6 w-6 text-forest-900" />
                </div>
             </div>
             <div>
                <p className="text-sm font-bold uppercase tracking-tight text-forest-900">Abdul Sattar</p>
                <p className="text-[9px] font-mono text-muted-foreground uppercase mt-0.5">MASTER_CARVER_ID: SC-770</p>
             </div>
          </div>
          <Button variant="ghost" className="h-8 text-[10px] uppercase font-bold text-khaki-600">EDIT</Button>
       </div>

       {/* 3. Settings Menu */}
       <div className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-khaki-600 border-b border-border pb-1">Operational Controls</h3>
          
          <div className="bg-white border border-border divide-y divide-border shadow-sm">
             {[
               { icon: Wifi, label: "Offline Storage Data", val: "1.4 MB" },
               { icon: Database, label: "Sync Registry Force", val: "NOW" },
               { icon: Shield, label: "Security & Biometrics", val: "ON" },
               { icon: FileCheck, label: "Certifications", val: "02 ACTIVE" },
             ].map((item, i) => (
                <div key={i} className="p-4 flex items-center justify-between active:bg-khaki-100/50 transition-colors">
                   <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-forest-900" />
                      <span className="text-[11px] font-bold uppercase tracking-tight text-forest-900">{item.label}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-bold text-muted-foreground">{item.val}</span>
                      <ChevronRight className="h-3 w-3 text-khaki-600/30" />
                   </div>
                </div>
             ))}
          </div>
       </div>

       {/* 4. Support & logout */}
       <div className="space-y-3">
          <Button className="w-full h-12 bg-white border border-border text-forest-900 rounded-none flex items-center justify-between px-6 hover:bg-khaki-100 transition-all uppercase text-[10px] font-bold tracking-widest font-mono">
             <span>Technical Support</span>
             <HelpCircle className="h-4 w-4" />
          </Button>
          <Button className="w-full h-14 bg-red-50 border-2 border-red-100 text-red-600 rounded-none flex items-center justify-center gap-3 hover:bg-red-100 transition-all uppercase text-xs font-bold tracking-widest">
             <LogOut className="h-4 w-4" /> Exit Field Terminal
          </Button>
       </div>

       {/* 5. Footer Metadata */}
       <div className="text-center pt-8 space-y-2 opacity-30">
          <p className="text-[8px] font-mono font-bold text-forest-900 uppercase">Integrated Forestry Intelligence Systems</p>
          <p className="text-[8px] font-mono text-muted-foreground uppercase font-bold">VrikshLogix v1.0.2 Mobile_Build_772</p>
       </div>
    </div>
  );
}
