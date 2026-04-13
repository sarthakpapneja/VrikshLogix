"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  CreditCard,
  Lock,
  Bell,
  Globe,
  Database,
  Cloud,
  ChevronRight,
  User,
  Building,
  Key
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCurrentExporter, ExporterRecord } from "@/lib/actions/exporter";
import { getSubscriptionStatus } from "@/lib/actions/billing";

export default function SettingsPage() {
  const [exporter, setExporter] = useState<ExporterRecord | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettingsData() {
      try {
        const [exporterData, subData] = await Promise.all([
          getCurrentExporter(),
          getSubscriptionStatus()
        ]);
        setExporter(exporterData);
        setSubscription(subData);
      } catch (err) {
        console.error("Failed to fetch settings metadata", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettingsData();
  }, []);

  if (loading) {
     return (
        <div className="flex flex-col h-screen items-center justify-center bg-background">
           <div className="animate-pulse flex flex-col items-center">
              <Database className="h-8 w-8 text-khaki-400 mb-4 animate-spin" />
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">Retrieving Secure Configurations...</p>
           </div>
        </div>
     );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white shadow-sm">
        <div>
           <span className="op-label !mb-0 text-forest-900">System Configuration</span>
           <h1 className="text-xl font-bold uppercase tracking-widest">Settings & Infrastructure</h1>
        </div>
        <div className="flex items-center gap-3">
           <Button className="h-9 bg-forest-900 text-khaki-100 px-6 text-xs uppercase tracking-widest font-bold rounded-none hover:bg-forest-800 transition-all">
              SAVE_ALL_CONFIG
           </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 bg-khaki-100/10">
        <div className="max-w-4xl mx-auto space-y-8">
           
           {/* Section 1: Account / Org */}
           <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-khaki-600 flex items-center gap-2">
                 <Building className="h-3.5 w-3.5" /> Organizational Profile
              </h2>
              <div className="bg-white border border-border shadow-sm divide-y divide-border">
                 <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 border border-border bg-khaki-100/30 flex items-center justify-center text-forest-900">
                          <User className="h-5 w-5" />
                       </div>
                       <div>
                          <p className="text-[11px] font-bold uppercase tracking-tight">{exporter?.company_name || 'UNINITIALIZED ORG'}</p>
                          <p className="text-[9px] font-mono text-muted-foreground mt-1 uppercase">OR_ID: {exporter?.id?.split('-')[0] || 'N/A'} · {exporter?.subscription_tier || 'FREE_TIER'}</p>
                       </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-[10px] uppercase font-bold text-khaki-600">EDIT_PROFILE</Button>
                 </div>
                 <div className="p-6 flex items-center justify-between bg-khaki-100/10">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 border border-border bg-khaki-100/30 flex items-center justify-center text-forest-900">
                          <Shield className="h-5 w-5" />
                       </div>
                       <div>
                          <p className="text-[11px] font-bold uppercase tracking-tight">Primary Compliance Officer</p>
                          <p className="text-[9px] font-mono text-muted-foreground mt-1 uppercase">ADMIN_LEVEL: ROOT_AUTHENTICATED</p>
                       </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-[10px] uppercase font-bold text-khaki-600">MANAGE_ROLES</Button>
                 </div>
              </div>
           </section>

           {/* Section 2: Integration & APIs */}
           <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-khaki-600 flex items-center gap-2">
                 <Database className="h-3.5 w-3.5" /> Compliance Connectors
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[
                   { name: "UP Bhulekh Gateway", status: "Active", icon: <Globe className="h-4 w-4" /> },
                   { name: "Global Forest Watch", status: "Active", icon: <Cloud className="h-4 w-4" /> },
                   { name: "EU TRACES NT API", status: "Sandbox", icon: <Lock className="h-4 w-4" /> },
                   { name: "Digital Signature Key", status: "Configured", icon: <Key className="h-4 w-4" /> },
                 ].map((conn, i) => (
                   <div key={i} className="bg-white border border-border p-4 flex items-center justify-between group hover:border-khaki-400 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 border border-border bg-khaki-100/30 flex items-center justify-center text-forest-900">
                            {conn.icon}
                         </div>
                         <span className="text-[11px] font-bold uppercase tracking-tight">{conn.name}</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase">{conn.status}</span>
                   </div>
                 ))}
              </div>
           </section>

           {/* Section 3: Billing & Subscription */}
           <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-khaki-600 flex items-center gap-2">
                 <CreditCard className="h-3.5 w-3.5" /> Data Subscription
              </h2>
              <div className="bg-forest-900 p-8 flex items-center justify-between shadow-xl">
                 <div className="space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-khaki-500">Enterprise Managed Support</span>
                    <h3 className="text-xl font-bold text-khaki-100">{subscription?.plan ? `${subscription.plan} Tier` : 'Annual Compliance Tier'}</h3>
                    <p className="text-[9px] font-mono text-khaki-600 uppercase">Renewal Date: {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'Mar 2027'} · Unused Credits: {subscription?.dds_credits || '42,000'}</p>
                 </div>
                 <Button className="h-10 bg-khaki-100 text-forest-900 uppercase font-bold text-[10px] tracking-widest px-8 hover:bg-khaki-200 rounded-none transition-all">
                    UPGRADE_CREDITS
                 </Button>
              </div>
           </section>

        </div>
      </div>
    </div>
  );
}
