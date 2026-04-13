"use client";

import Link from "next/link";
import { TreePine, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingSuccessPage() {
  return (
    <div className="min-h-screen bg-khaki-100/30 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white border-2 border-forest-900 p-12 shadow-2xl relative overflow-hidden">
        {/* Tactical background elements */}
        <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
           <ShieldCheck size={200} />
        </div>

        <div className="relative z-10 text-center space-y-8">
           <div className="h-20 w-20 bg-forest-900 mx-auto flex items-center justify-center text-khaki-100 rounded-none shadow-xl transform rotate-3">
              <CheckCircle2 size={40} />
           </div>

           <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-khaki-600 block">Transaction_Verified</span>
              <h1 className="text-4xl font-black uppercase tracking-tighter leading-none italic">License Scaled.</h1>
              <p className="text-muted-foreground font-medium max-w-sm mx-auto">
                Your organizational tier has been updated. Professional compliance features and Golden Record primitives are now active in your dashboard.
              </p>
           </div>

           <div className="grid grid-cols-2 gap-4 text-left border-y border-border py-6 my-8">
              <div>
                 <p className="text-[8px] font-bold uppercase tracking-widest text-khaki-600">Current_Access</p>
                 <p className="text-sm font-bold uppercase tracking-tight text-forest-900">Professional ID</p>
              </div>
              <div>
                 <p className="text-[8px] font-bold uppercase tracking-widest text-khaki-600">Status</p>
                 <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-sm font-bold uppercase tracking-tight text-forest-900">Active_Link</p>
                 </div>
              </div>
           </div>

           <Link href="/dashboard">
              <Button className="w-full h-14 bg-forest-900 text-khaki-100 font-bold uppercase tracking-[0.2em] text-xs rounded-none hover:bg-forest-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                Return to Tactical Terminal <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
           </Link>
           
           <p className="text-[9px] font-mono uppercase text-khaki-600 tracking-tight">
             Confirmation ID: VLX-TRA-{Math.random().toString(36).substring(7).toUpperCase()} · SHA-256 Verified
           </p>
        </div>
      </div>
    </div>
  );
}
