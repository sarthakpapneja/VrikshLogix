"use client";

import { useState, useEffect } from "react";
import { Check, Zap, Shield, Crown, CreditCard, Clock, ArrowUpRight, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getSubscriptionStatus, upgradeSubscriptionAction } from "@/lib/actions/billing";
import { toast } from "sonner";

const PLANS = [
  {
    name: "Starter",
    price: "$149",
    period: "per month",
    desc: "Best for small workshops or individual artisan units.",
    features: ["Batch Reception Tracker", "Mobile Evidence Uploader", "GPS Plot Tagging (2 Plots)", "Basic DDS Audit Report"],
    cta: "Upgrade to Starter",
    highlight: false
  },
  {
    name: "Professional",
    price: "$499",
    period: "per month",
    desc: "For medium-sized Saharanpur export houses shipping to EU.",
    features: [
      "Everything in Starter",
      "Unlimited Plots & Polygons",
      "Bhulekh Land Verification API",
      "Satellite Deforestation Alerts",
      "Golden Record Supply Chain Hashing",
      "Official DDS Export Pack"
    ],
    cta: "Upgrade to Pro",
    highlight: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "annual billing",
    desc: "Scale-ready for large export collectives and global furniture brands.",
    features: [
      "Everything in Professional",
      "White-label Compliance Certs",
      "API Access for ERP/SAP Integration",
      "Priority Audit Support",
      "Dedicated Compliance Officer",
    ],
    cta: "Contact Sales",
    highlight: false
  }
];

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  async function load() {
    const data = await getSubscriptionStatus();
    setSubscription(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const handleUpgrade = async (planName: string) => {
    if (planName === "Enterprise") {
      window.location.href = "mailto:sales@vrikshlogix.com?subject=Enterprise Licensing Inquiry";
      return;
    }

    setUpgrading(planName);
    try {
      const formData = new FormData();
      formData.append("plan", planName);
      
      await upgradeSubscriptionAction(formData);
      
      await load();
      toast.success("License Scaled", {
        description: `Successfully upgraded to ${planName} tier.`,
      });
    } catch (err) {
      toast.error("Process Failure", {
        description: "Failed to initialize payment gateway simulation.",
      });
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-20">
        <Loader2 className="h-10 w-10 animate-spin text-forest-900" />
      </div>
    );
  }

  const currentTier = subscription?.plan || 'free';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-1">Licensing & Subscriptions</h1>
          <p className="text-muted-foreground text-sm font-medium">Manage your EUDR compliance scaling.</p>
        </div>
        <div className="p-4 bg-forest-900 text-khaki-100 flex items-center gap-4 shadow-lg border border-forest-800">
           <div className="pr-4 border-r border-khaki-100/20">
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-60">Compliance Credits</p>
              <p className="text-xl font-black font-mono tracking-tighter">{subscription?.dds_credits?.toLocaleString() || 0}</p>
           </div>
           <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-60">Subscription Tier</p>
              <p className="text-xs font-bold uppercase tracking-widest">{currentTier}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {PLANS.map((plan) => {
          const isCurrent = currentTier.toLowerCase() === plan.name.toLowerCase();
          
          return (
            <Card key={plan.name} className={cn(
              "border-2 transition-all flex flex-col relative overflow-hidden rounded-none",
              plan.highlight ? "border-forest-900 shadow-xl" : "border-border shadow-sm",
              isCurrent && "bg-khaki-100/10 border-forest-900"
            )}>
              {isCurrent && (
                <div className="absolute top-0 right-0 bg-forest-900 text-khaki-100 text-[10px] font-bold uppercase tracking-widest px-3 py-1 flex items-center gap-1">
                   <Shield className="h-3 w-3" /> Active Tier
                </div>
              )}

              <CardHeader className="pb-8">
                <div className="flex justify-between items-start mb-2">
                   <CardTitle className="text-xl font-bold uppercase tracking-tight">{plan.name}</CardTitle>
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="text-xs text-muted-foreground font-mono uppercase">{plan.period}</span>
                </div>
                <CardDescription className="text-xs font-medium pt-2 leading-relaxed">
                  {plan.desc}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                 {plan.features.map((feature) => (
                   <div key={feature} className="flex items-start gap-4 text-xs">
                      <Check className={cn("h-4 w-4 shrink-0 mt-0.5", plan.highlight || isCurrent ? "text-forest-900" : "text-muted-foreground")} />
                      <span className="font-medium text-forest-900/80">{feature}</span>
                   </div>
                 ))}
              </CardContent>
              <CardFooter className="pt-8">
                 <Button 
                   disabled={isCurrent || upgrading !== null}
                   onClick={() => handleUpgrade(plan.name)}
                   className={cn(
                    "w-full h-12 uppercase font-bold tracking-widest text-xs rounded-none border-2 transition-all",
                    isCurrent ? "bg-khaki-100 text-forest-900 border-forest-900 cursor-default" : 
                    plan.highlight ? "bg-forest-900 text-khaki-100 border-forest-900 hover:bg-forest-800" :
                    "bg-white text-forest-900 border-forest-900 hover:bg-forest-900 hover:text-khaki-100"
                  )}
                 >
                   {upgrading === plan.name ? <Loader2 className="h-4 w-4 animate-spin" /> : isCurrent ? "Current License" : plan.cta}
                 </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
         <Card className="border-border shadow-none bg-khaki-100/20 rounded-none border-2">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                 <CreditCard className="h-4 w-4" /> Active Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-white border border-border rounded-none">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-16 bg-muted rounded flex items-center justify-center font-bold italic text-muted-foreground">VISA</div>
                    <div>
                       <p className="text-xs font-bold uppercase tracking-tight">Visa Ending in 4242</p>
                       <p className="text-[10px] font-mono text-muted-foreground mt-0.5">Expires 12/28 · Primary Method</p>
                    </div>
                 </div>
                 <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase underline">Edit_Source</Button>
              </div>
            </CardContent>
         </Card>

         <Card className="border-border shadow-none bg-khaki-100/20 rounded-none border-2">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                 <Clock className="h-4 w-4" /> Billing History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
               {[
                 { date: "Apr 01, 2026", amount: "$149.00", id: "INV-00982", status: "Paid" },
                 { date: "Mar 01, 2026", amount: "$149.00", id: "INV-00731", status: "Paid" },
               ].map((inv) => (
                 <div key={inv.id} className="flex items-center justify-between p-3 bg-white border border-border rounded-none text-[11px] group">
                    <div className="flex items-center gap-4">
                       <span className="font-mono font-bold text-muted-foreground opacity-60">{inv.date}</span>
                       <span className="font-bold text-forest-900">{inv.amount}</span>
                       <span className="text-[9px] font-mono text-muted-foreground bg-khaki-100/50 px-2 py-0.5 border border-khaki-200">{inv.id}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                       <ArrowUpRight className="h-4 w-4" />
                    </Button>
                 </div>
               ))}
               <p className="text-[10px] text-muted-foreground font-mono text-center pt-2 uppercase tracking-tight">Archived invoices managed in finance portal</p>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
