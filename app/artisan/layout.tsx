"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Hammer,
  Map as MapIcon,
  QrCode,
  Settings,
  Bell,
  Wifi,
  WifiOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function ArtisanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);

  // Simulation of offline capability for field workers
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { href: "/artisan", label: "Tasks", icon: Hammer },
    { href: "/artisan/map", label: "Map Plots", icon: MapIcon },
    { href: "/artisan/scan", label: "Scanner", icon: QrCode },
    { href: "/artisan/settings", label: "Setup", icon: Settings },
  ];

  return (
    <div className="flex flex-col h-screen bg-khaki-100/50 text-forest-900 font-sans select-none overflow-hidden">
      {/* 1. Mobile HUD Header */}
      <header className="px-5 py-4 border-b border-border bg-white flex items-center justify-between sticky top-0 z-50">
         <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-forest-900" />
            <div>
               <h1 className="text-xs font-bold uppercase tracking-[0.2em] leading-tight">VrikshLogix Field</h1>
               <p className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-tight">Terminal Node: Saharanpur_Local</p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-emerald-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-amber-600 animate-pulse" />
            )}
            <div className="h-7 w-7 border border-border bg-khaki-100 flex items-center justify-center relative">
               <Bell className="h-4 w-4 text-forest-900" />
               <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full border-white border" />
            </div>
         </div>
      </header>

      {/* 2. Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto pb-24">
         {children}
      </main>

      {/* 3. Bottom Tactical Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-4 py-3 pb-8 flex items-center justify-between z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
         {navItems.map((item) => {
           const isActive = pathname === item.href;
           return (
             <Link key={item.href} href={item.href} className="flex-1">
                <div className={cn(
                  "flex flex-col items-center gap-1 transition-all active:scale-90",
                  isActive ? "text-forest-900" : "text-khaki-600/60"
                )}>
                   <div className={cn(
                     "h-10 w-10 flex items-center justify-center border-2 rotate-45 transition-all text-sm",
                     isActive ? "border-forest-900 bg-forest-900 text-khaki-100 shadow-lg shadow-forest-900/20" : "border-transparent"
                   )}>
                      <div className="-rotate-45">
                        <item.icon className="h-5 w-5" />
                      </div>
                   </div>
                   <span className="text-[9px] font-bold uppercase tracking-widest mt-1">
                     {item.label}
                   </span>
                </div>
             </Link>
           );
         })}
      </nav>

      <style jsx global>{`
        /* Optimized for mobile touch */
        * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
}
