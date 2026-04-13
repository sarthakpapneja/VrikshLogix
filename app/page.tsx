"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Leaf,
  MapPin,
  FileText,
  Factory,
  Ship,
  Satellite,
  Shield,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Clock,
  Star,
  Globe,
  Menu,
  X,
  TreePine,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { daysUntil } from "@/lib/utils";

const features = [
  {
    icon: MapPin,
    title: "UP Bhulekh Land Connector",
    description:
      "Verify farmer plots directly against UP government land records. Get instant deep-links to bhulekh.up.gov.in with pre-filled Khasra/Khatauni numbers.",
    tag: "Module 1",
    tagColor: "bg-forest-500/20 text-forest-400",
  },
  {
    icon: FileText,
    title: "Form-T Permit OCR Parser",
    description:
      "Upload a photo of any UP Forest Dept Form-T transit permit — our AI extracts species, volume, origin district, and issuing range office in seconds.",
    tag: "Module 2",
    tagColor: "bg-blue-500/20 text-blue-400",
  },
  {
    icon: Factory,
    title: "Sawmill Batch Tracker",
    description:
      "Maintain full lot-in → lot-out traceability even when logs from multiple farmers are mixed. Every batch gets a QR code you can scan at dispatch.",
    tag: "Module 3",
    tagColor: "bg-bark-500/20 text-bark-400",
  },
  {
    icon: MapPin,
    title: "Offline Polygon Mapper",
    description:
      "Field agents walk the plot perimeter — the app drops GPS waypoints and draws the polygon in real time. Works fully offline, syncs when connected.",
    tag: "Module 4",
    tagColor: "bg-amber-500/20 text-amber-400",
  },
  {
    icon: Satellite,
    title: "Satellite Deforestation Engine",
    description:
      "Every polygon is checked against Hansen Global Forest Watch data for forest cover loss post-2020. GREEN/AMBER/RED risk score in one click.",
    tag: "Module 5",
    tagColor: "bg-purple-500/20 text-purple-400",
  },
  {
    icon: Ship,
    title: "DDS Generator & TRACES NT Sync",
    description:
      "One-click generate a fully EUDR-compliant Due Diligence Statement PDF and submit directly to the EU TRACES NT portal. DDS reference number in minutes.",
    tag: "Module 6",
    tagColor: "bg-rose-500/20 text-rose-400",
  },
];

const testimonials = [
  {
    quote:
      "Our EU buyer asked for polygon coordinates for our last 3 containers. We had nothing. VrikshLogix gave us a system to actually map our supply chain.",
    name: "Rajan Agarwal",
    role: "Director, Agarwal Wood Crafts Pvt Ltd",
    location: "Saharanpur",
  },
  {
    quote:
      "The Form-T OCR alone saved us hours of manual data entry. We upload a photo and it reads the permit. The species, volume, everything.",
    name: "Priya Sharma",
    role: "Compliance Manager, Woodcraft Exports",
    location: "Saharanpur",
  },
  {
    quote:
      "As a carving unit, we never had to worry about EUDR before. Now our export house client needs traceability from us. VrikshLogix makes it simple.",
    name: "Mohd. Rizwan",
    role: "Master Carver",
    location: "Saharanpur",
  },
];

const steps = [
  {
    number: "01",
    title: "Enter your EPCH number",
    description: "Register your export house with GSTIN and EPCH registration details.",
  },
  {
    number: "02",
    title: "Add your first farmer & plot",
    description: "Verify the plot via UP Bhulekh records or map it in the field.",
  },
  {
    number: "03",
    title: "Upload your first Form-T",
    description: "Our OCR extracts all permit details — you just confirm and save.",
  },
  {
    number: "04",
    title: "Choose your compliance plan",
    description: "Start with 14-day SME free trial. No credit card needed.",
  },
];

export default function LandingPage() {
  const [days, setDays] = useState(0);

  useEffect(() => {
    setDays(daysUntil("2026-12-30"));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-khaki-300 selection:text-forest-900">
      {/* Tactical Navbar */}
      <header className="border-b border-border bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 border border-forest-900/20 bg-forest-900 flex items-center justify-center">
            <Leaf className="h-4 w-4 text-khaki-100" />
          </div>
          <div className="leading-tight">
            <span className="font-bold text-sm uppercase tracking-[0.2em] block">VrikshLogix</span>
            <span className="text-[10px] font-mono text-khaki-600 block">COMPLIANCE_PORTAL_v1.02</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <Link href="#modules" className="hover:text-forest-900 transition-colors">Operational Modules</Link>
            <Link href="#framework" className="hover:text-forest-900 transition-colors">Regulatory Framework</Link>
            <Link href="/billing" className="hover:text-forest-900 transition-colors">Access Plans</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-xs uppercase tracking-tighter h-8 px-4 rounded-none">Portal Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="text-xs uppercase tracking-tighter h-8 px-4 rounded-none bg-forest-900 text-khaki-100 hover:bg-forest-800 transition-colors">Register Exporter</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Operational Hero Section */}
      <section className="relative border-b border-border bg-khaki-100/10">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: "radial-gradient(#1b3022 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        
        <div className="mx-auto max-w-7xl px-6 py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 border border-amber-600/30 bg-amber-500/5 px-3 py-1 text-[11px] font-mono font-bold text-amber-700 uppercase">
              <Clock className="h-3 w-3" />
              <span>EUDR Enforcement Deadline: {days} Days Left</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.05] text-forest-900">
              EUDR Compliance for <br />
              <span className="text-forest-700 underline decoration-khaki-500 underline-offset-8">Saharanpur Exporters</span>
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              A specialized terminal for wood handicraft exporters to manage Forest-to-Finish traceability. 
              Integrated with UP Bhulekh land records, high-resolution satellite risk assessment, 
              and automated TRACES NT submission.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/register">
                <Button size="lg" className="rounded-none h-12 px-8 bg-forest-900 text-khaki-100 hover:bg-forest-800 text-sm font-bold uppercase tracking-widest">
                  Initialize Setup
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="rounded-none h-12 px-8 border-forest-900/20 text-forest-900 text-sm font-bold uppercase tracking-widest bg-white">
                  Demo Dashboard
                </Button>
              </Link>
            </div>

            <div className="pt-8 grid grid-cols-2 gap-8 border-t border-border/50">
              <div>
                <span className="op-label">Regulatory Status</span>
                <p className="text-xs font-mono font-bold text-forest-800 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" /> INDIA: STANDARD RISK
                </p>
              </div>
              <div>
                <span className="op-label">EU Registry Sync</span>
                <p className="text-xs font-mono font-bold text-forest-800 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" /> TRACES NT / ARTICLE 9
                </p>
              </div>
            </div>
          </div>

          {/* Tactical Visual - System Interface Preview */}
          <div className="hidden lg:block">
            <div className="border border-border p-2 bg-khaki-200/20 shadow-[8px_8px_0px_0px_rgba(27,48,34,0.1)]">
              <div className="bg-white border border-border p-1">
                <div className="border border-border bg-khaki-100/50 p-4">
                   <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground">VL_SECURE_NODE_ALPHA</span>
                      <div className="flex gap-1">
                         <div className="h-1.5 w-3 bg-emerald-500/50" />
                         <div className="h-1.5 w-3 bg-emerald-500/50" />
                         <div className="h-1.5 w-3 bg-forest-900" />
                      </div>
                   </div>
                   
                   <div className="space-y-4">
                      <div className="h-20 border border-border bg-white p-3 flex gap-4 items-center">
                        <div className="h-10 w-10 border border-border bg-emerald-50 flex items-center justify-center">
                           <MapPin className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                           <span className="op-label !mb-0 text-[9px]">Plot Geolocation Lock</span>
                           <p className="text-xs font-bold font-mono">29.9984 N, 77.5615 E</p>
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      </div>
                      
                      <div className="h-20 border border-border bg-white p-3 flex gap-4 items-center">
                        <div className="h-10 w-10 border border-border bg-blue-50 flex items-center justify-center">
                           <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                           <span className="op-label !mb-0 text-[9px]">Transit Permit Audit (Form-T)</span>
                           <p className="text-xs font-bold font-mono text-blue-600">OCR_MATCH_98.4%</p>
                        </div>
                        <div className="h-2 w-16 bg-blue-100 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-600 w-[98%]" />
                        </div>
                      </div>

                      <div className="h-20 border-2 border-forest-900 bg-white p-3 flex gap-4 items-center animate-pulse">
                        <div className="h-10 w-10 border border-border bg-khaki-100 flex items-center justify-center">
                           <Satellite className="h-5 w-5 text-forest-900" />
                        </div>
                        <div className="flex-1">
                           <span className="op-label !mb-0 text-[10px] text-forest-900">Satellite Risk Matrix</span>
                           <p className="text-xs font-bold font-mono">ANALYZING_HANSEN_GFW...</p>
                        </div>
                        <div className="h-4 w-4 border-2 border-forest-900 border-t-transparent rounded-full animate-spin" />
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Modules - Operational Focus */}
      <section id="modules" className="py-24 border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-xl mb-16">
            <span className="op-label text-forest-900">System Architecture</span>
            <h2 className="text-3xl font-bold tracking-tight text-forest-900">Six Integrated Modules for Full Traceability</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-border">
            {features.map((f) => (
              <div key={f.title} className="p-8 border-b border-r border-border hover:bg-khaki-100/10 transition-colors">
                <span className="font-mono text-[10px] text-khaki-600 font-bold tracking-widest block mb-4">MOD_{f.tag.replace('Module ', '0')}</span>
                <f.icon className="h-6 w-6 text-forest-900 mb-6" />
                <h3 className="text-lg font-bold text-forest-900 mb-3 uppercase tracking-tight">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Regulatory Context Strip */}
      <section id="framework" className="py-24 border-b border-border bg-khaki-100/30">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="space-y-6">
            <div className="inline-flex px-2 py-0.5 border border-forest-900 text-[10px] font-mono font-bold uppercase">Critical Regulatory Alert</div>
            <h3 className="text-4xl font-bold text-forest-900 tracking-tight">India classified as 'Standard Risk' under EU Benchmarking 2025/1093.</h3>
            <p className="text-muted-foreground leading-relaxed">
              Standard Risk classification mandates **full due diligence**. Saharanpur exporters must provide 
              precise geolocation (polygons), risk assessment back-dated to 2020, and risk mitigation 
              measures for every shipment. Simplified rules for low-risk countries do not apply.
            </p>
            <div className="pt-4">
               <Link href="/register">
                 <Button variant="outline" className="rounded-none h-10 px-6 border-forest-900 uppercase text-[11px] font-bold tracking-widest">Download Compliance Whitepaper</Button>
               </Link>
            </div>
          </div>
          <div className="bg-white border border-border p-8 terminal-panel !lowercase !font-sans !tracking-normal">
             <div className="space-y-4">
                <div className="flex gap-4">
                   <div className="h-10 w-1 pt-1 bg-red-600/20" />
                   <div>
                      <p className="font-bold text-forest-900">Article 9: Information Requirements</p>
                      <p className="text-sm text-muted-foreground">Mandatory collection of geolocation coordinates and proof of legality (Form-T).</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="h-10 w-1 pt-1 bg-red-600/40" />
                   <div>
                      <p className="font-bold text-forest-900">Article 10: Risk Assessment</p>
                      <p className="text-sm text-muted-foreground">Evaluation of forest cover loss through satellite imagery monitoring.</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="h-10 w-1 pt-1 bg-red-600" />
                   <div>
                      <p className="font-bold text-forest-900">Article 12: Due Diligence Statement</p>
                      <p className="text-sm text-muted-foreground">DDS submission to TRACES NT portal prior to placing on market.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer / Initialized Link */}
      <footer className="py-12 px-6 border-t border-border bg-white translate-y-0.5">
         <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2 grayscale brightness-50">
               <span className="font-bold text-sm uppercase tracking-[0.2em]">VrikshLogix Compliance</span>
            </div>
            <div className="flex gap-8 font-mono text-[10px] uppercase text-muted-foreground">
               <span>SAHARANPUR_OFFICE: +91 0121-XXXXXXX</span>
               <span>REG_ID: UP_FOREST_TECH_772</span>
            </div>
            <p className="text-[10px] font-mono text-khaki-600 uppercase">
              © 2026 Integrated Forestry Intelligence Systems.
            </p>
         </div>
      </footer>
    </div>
  );
}

