"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Map,
  FileText,
  Factory,
  Ship,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Leaf,
  LogOut,
  Shield,
  Bell,
  MessageSquare,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  {
    group: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/map", label: "Supply Chain Map", icon: Map },
    ],
  },
  {
    group: "Data Entry",
    items: [
      { href: "/dashboard/farmers", label: "Farmers & Plots", icon: Users },
      { href: "/dashboard/permits", label: "Form-T Permits", icon: FileText, badge: "OCR" },
      { href: "/dashboard/sawmill", label: "Sawmill Batches", icon: Factory },
      { href: "/dashboard/carving-units", label: "Carving Units", icon: Leaf },
    ],
  },
  {
    group: "Compliance",
    items: [
      { href: "/dashboard/shipments", label: "Shipments & DDS", icon: Ship },
      { href: "/dashboard/risk", label: "Risk Assessments", icon: Shield },
      { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    group: "Account",
    items: [
      { href: "/dashboard/settings", label: "Settings & Billing", icon: Settings },
    ],
  },
];

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
     try {
        setIsSigningOut(true);
        toast.loading("Terminating session securely...");
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        toast.dismiss();
        toast.success("Terminal Access Terminated", { description: "Session keys have been purged." });
        router.push("/auth/login");
        router.refresh();
     } catch (err: any) {
        toast.dismiss();
        toast.error("Logout Protocol Failed", { description: err.message });
        setIsSigningOut(false);
     }
  };

  const handleSystemAlerts = () => {
     // Currently simulated, will drop down a sheet/panel later
     toast("System Alerts", {
        description: "3 Background Checks Running. 0 Critical Faults.",
        icon: <Bell className="h-4 w-4 text-emerald-500" />
     });
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen sticky top-0 border-r border-border bg-forest-900 text-khaki-100 transition-all duration-200 shrink-0 z-50",
        collapsed ? "w-14" : "w-56"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-6 border-b border-forest-800", collapsed && "justify-center px-2")}>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-none border border-khaki-600/30 bg-khaki-600/10">
          <Leaf className="h-3.5 w-3.5 text-khaki-500" />
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <span className="font-bold text-xs uppercase tracking-[0.2em] text-khaki-500">VrikshLogix</span>
            <p className="text-[9px] font-mono text-khaki-600/70 mt-0.5">EST. SAHARANPUR · v1.0</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto pt-6 px-1.5 space-y-6">
        {navItems.map((group) => (
          <div key={group.group}>
            {!collapsed && (
              <p className="px-3 pb-2 text-[9px] font-bold uppercase tracking-[0.15em] text-khaki-600/60">
                {group.group}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-[13px] transition-colors duration-100 group relative",
                        isActive
                          ? "bg-khaki-600/10 text-khaki-200 font-medium"
                          : "text-khaki-600/80 hover:bg-forest-800 hover:text-khaki-300",
                        collapsed && "justify-center"
                      )}
                    >
                      {isActive && !collapsed && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-khaki-500" />
                      )}
                      <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-khaki-400" : "text-khaki-700")} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] font-mono bg-khaki-600/20 text-khaki-500 px-1 border border-khaki-600/30">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className={cn("p-2 border-t border-forest-800 space-y-0.5", collapsed && "flex flex-col items-center")}>
        <button 
          onClick={handleSystemAlerts}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 text-[12px] text-khaki-600/70 hover:bg-forest-800 hover:text-khaki-300 transition-colors",
            collapsed && "justify-center"
          )}
        >
          <Bell className="h-4 w-4 shrink-0" />
          {!collapsed && <span>System Alerts</span>}
        </button>
        <Link href="/dashboard/setup" className={cn(
          "flex items-center gap-3 w-full px-3 py-2 text-[12px] text-khaki-600/70 hover:bg-khaki-600/10 hover:text-khaki-300 transition-colors",
          collapsed && "justify-center"
        )}>
           <div className="relative flex items-center justify-center h-4 w-4 shrink-0">
              <Database className="h-4 w-4 text-amber-500/70" />
           </div>
           {!collapsed && <span className="flex-1 text-left font-bold text-amber-500/80">Platform Setup</span>}
        </Link>
        <button 
          onClick={() => {
            toast.info("System_Report Initialized", {
              description: "Our compliance team will review your session logs shortly.",
            });
          }}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 text-[12px] text-khaki-600/70 hover:bg-forest-800 hover:text-khaki-300 transition-colors",
            collapsed && "justify-center"
          )}
        >
          <div className="relative flex items-center justify-center h-4 w-4 shrink-0">
             <MessageSquare className="h-4 w-4" />
             <span className="absolute -top-1 -right-1 h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          {!collapsed && <span className="flex-1 text-left">System Report</span>}
        </button>
        <button 
          disabled={isSigningOut}
          onClick={handleSignOut}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 text-[12px] text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors border-t border-forest-800/50 mt-1",
            collapsed && "justify-center",
            isSigningOut && "opacity-50 cursor-not-allowed"
          )}
        >
          <LogOut className={cn("h-4 w-4 shrink-0", isSigningOut && "animate-pulse")} />
          {!collapsed && <span>{isSigningOut ? "Terminating..." : "Terminal Logout"}</span>}
        </button>
        {/* System Status Indicator */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 mt-1",
          collapsed && "justify-center"
        )}>
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          {!collapsed && (
            <span className="text-[9px] font-mono text-khaki-600/50 tracking-widest uppercase">
              EUDR:LIVE · SUPABASE OK
            </span>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[68px] flex h-6 w-6 items-center justify-center rounded-none border border-forest-800 bg-forest-900 shadow-none hover:bg-forest-800 transition-colors z-50 text-khaki-600"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </aside>
  );
}

