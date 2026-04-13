"use client";

import Link from "next/link";
import { TreePine, Scale, FileText, Gavel, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white text-forest-900 selection:bg-forest-900 selection:text-khaki-100">
      <nav className="p-6 border-b border-border bg-khaki-100/10 sticky top-0 z-50 backdrop-blur-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group transition-all">
            <div className="h-10 w-10 bg-forest-900 flex items-center justify-center text-khaki-100 transform group-hover:-rotate-12 transition-transform">
              <TreePine size={24} />
            </div>
            <span className="font-display text-2xl font-black uppercase tracking-tighter">VrikshLogix</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="text-xs uppercase font-bold tracking-widest text-forest-900">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Portal
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto py-20 px-6 max-w-4xl font-serif">
        <header className="mb-16 font-sans">
          <div className="flex items-center gap-3 text-khaki-600 mb-4">
            <Scale size={20} />
            <span className="font-mono text-xs uppercase tracking-[0.3em] font-bold text-khaki-600">Legal Agreement</span>
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-6 leading-none italic">Terms of Service</h1>
          <p className="text-xl text-forest-900/60 font-medium font-sans">Formal binding agreement for digital forestry compliance services.</p>
        </header>

        <article className="space-y-12 text-forest-900/90 leading-relaxed border-t border-border pt-12">
          <section>
            <h2 className="text-xl font-bold font-sans uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
               <FileText size={18} className="text-khaki-600" /> 1. Acceptance of Terms
            </h2>
            <p>
              By accessing the VrikshLogix platform, you agree to be bound by these industrial service terms. These terms govern the relationship between VrikshLogix Compliance Systems and the Licensee (Exporter, Sawmill, or Artisan Unit).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-sans uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
               <Gavel size={18} className="text-khaki-600" /> 2. Accuracy of Data
            </h2>
            <p>
              The Licensee is responsible for the accuracy of all documentation uploaded (Form-T, Transit Passes, etc.). While VrikshLogix provides AI-assisted verification, the final Article 10 risk assessment responsibility rests with the Operator as defined in Regulation (EU) 2023/1115.
            </p>
          </section>

          <section className="p-8 bg-khaki-100 border border-border italic mb-8">
             "VrikshLogix provides the tools for transparency, but the integrity of the physical timber chain remains the responsibility of the Licensee."
          </section>

          <section>
            <h2 className="text-xl font-bold font-sans uppercase tracking-[0.1em] mb-4">3. Subscription & Billing</h2>
            <p>
              Access to the EUDR Reporting Suite is provided on a subscription basis. Failure to maintain an active subscription may result in limited access to the Golden Record database and historical compliance exports.
            </p>
          </section>
        </article>

        <footer className="mt-20 pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6 font-sans">
           <p className="text-[10px] font-mono uppercase text-khaki-600">© 2026 VrikshLogix Compliance Systems</p>
           <div className="flex gap-8">
              <Link href="/privacy" className="text-[10px] font-mono uppercase text-khaki-600 hover:text-forest-900 transition-colors">Privacy Policy</Link>
           </div>
        </footer>
      </main>
    </div>
  );
}
