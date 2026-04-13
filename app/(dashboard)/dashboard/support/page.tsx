"use client";

import { useState } from "react";
import { TreePine, Bug, HelpCircle, MessageSquare, Send, ShieldAlert, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function SupportPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API dispatch to support ticketing system
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Ticket Dispatched", {
        description: "A compliance response team member will review your request.",
      });
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header className="flex items-center justify-between border-b border-border pb-8">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-khaki-600 italic">Technical_Assistance</span>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">Support Terminal</h1>
        </div>
        <div className="h-12 w-12 bg-forest-900 flex items-center justify-center text-khaki-100 shadow-xl transform rotate-3">
          <HelpCircle size={24} />
        </div>
      </header>

      {submitted ? (
        <div className="p-12 border-2 border-forest-900 bg-white text-center space-y-6 shadow-2xl">
          <CheckCircle2 size={48} className="mx-auto text-forest-900" />
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">Signal Received</h2>
          <p className="max-w-md mx-auto text-muted-foreground font-medium">
            Your support request has been logged into the compliance queue. We prioritize urgent Article 10 audit blockers.
          </p>
          <Button 
            onClick={() => setSubmitted(false)}
            variant="outline" 
            className="h-12 uppercase font-bold tracking-widest text-xs rounded-none border-forest-900"
          >
            Create New Support Ticket
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white border border-border p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="text-forest-900 h-5 w-5" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Inquiry Details</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Request Category</Label>
                    <select id="type" className="w-full h-11 bg-white border border-border px-3 text-sm font-medium focus:ring-1 focus:ring-forest-900 outline-none">
                      <option>EUDR Policy Question</option>
                      <option>GIS/Polygon Issue</option>
                      <option>Account & Billing</option>
                      <option>System Bug Report</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="urgency" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Operational Priority</Label>
                    <select id="urgency" className="w-full h-11 bg-white border border-border px-3 text-sm font-medium focus:ring-1 focus:ring-forest-900 outline-none">
                      <option>Standard Dispatch</option>
                      <option>Audit Blocker (High)</option>
                      <option>Critical System Failure</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subject Header</Label>
                  <Input id="subject" placeholder="e.g. Polygon intersection mismatch on Plot 42" className="h-11 rounded-none" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Detailed Transmission</Label>
                  <Textarea id="message" placeholder="Provide full technical context or the regulatory clause in question..." className="min-h-[150px] rounded-none resize-none" required />
                </div>

                <Button disabled={loading} className="w-full h-14 bg-forest-900 text-khaki-100 font-bold uppercase tracking-[0.2em] text-xs rounded-none hover:bg-forest-800 transition-all shadow-lg group">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Dispatch Request <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></>}
                </Button>
              </form>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="p-6 bg-khaki-100/50 border border-khaki-200">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-forest-900 flex items-center gap-2 mb-4">
                <ShieldAlert className="h-4 w-4 text-forest-900" /> Compliance Hotline
              </h4>
              <p className="text-[11px] font-medium leading-relaxed text-forest-900/70 mb-4">
                For immediate assistance with competent authority audits, use our priority line:
              </p>
              <p className="text-xl font-black text-forest-900 font-mono">+91 132-COMPLY-1</p>
              <p className="text-[10px] font-mono text-muted-foreground mt-1 uppercase">24/7 Regulatory Support</p>
            </div>

            <div className="p-6 bg-forest-900 text-khaki-100 space-y-4">
               <div className="h-10 w-10 bg-khaki-100/10 flex items-center justify-center">
                  <Bug className="h-5 w-5" />
               </div>
               <h4 className="text-xs font-bold uppercase tracking-widest">Security Disclosure</h4>
               <p className="text-[10px] font-medium text-khaki-600 leading-relaxed">
                 Found a vulnerability? Reports are eligible for the VrikshLogix Bug Bounty program. Submit full PoC details via this terminal.
               </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
