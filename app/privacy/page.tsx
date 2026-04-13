"use client";

import Link from "next/link";
import { TreePine, ShieldCheck, Lock, Eye, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-khaki-100/30 text-forest-900 selection:bg-forest-900 selection:text-khaki-100">
      <nav className="p-6 border-b border-border bg-white sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group transition-all">
            <div className="h-10 w-10 bg-forest-900 flex items-center justify-center text-khaki-100 transform group-hover:rotate-12 transition-transform">
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

      <main className="container mx-auto py-20 px-6 max-w-4xl">
        <header className="mb-16">
          <div className="flex items-center gap-3 text-khaki-600 mb-4">
            <ShieldCheck size={20} />
            <span className="font-mono text-xs uppercase tracking-[0.3em] font-bold">Data Privacy Protocol</span>
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-6 leading-none">Privacy & Data Ethics</h1>
          <p className="text-xl text-forest-900/60 font-medium">How we protect your supply chain intelligence and artisan records.</p>
          <div className="mt-8 p-4 bg-forest-900 text-khaki-100 inline-block font-mono text-[10px] uppercase tracking-widest">
            Last Updated: April 13, 2026 · Version 1.0.4-Compliance
          </div>
        </header>

        <section className="prose prose-forest max-w-none space-y-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
               <Eye className="text-forest-900" size={24} />
               <h2 className="text-2xl font-black uppercase tracking-tight m-0">1. Data Sovereignty</h2>
            </div>
            <p className="text-lg leading-relaxed text-forest-900/80">
              VrikshLogix adheres to the <strong>Sovereignty Principle</strong>. Forest plot data, artisan identities, and industrial throughput records are owned by the license holder. We process this data solely for EUDR Article 10 & 12 compliance verification.
            </p>
          </div>

          <div>
             <div className="flex items-center gap-2 mb-4">
               <Lock className="text-forest-900" size={24} />
               <h2 className="text-2xl font-black uppercase tracking-tight m-0">2. EUDR Geolocation Logging</h2>
            </div>
            <p className="text-lg leading-relaxed text-forest-900/80">
              As required by Regulation (EU) 2023/1115, we collect and store polygon-level geolocation data. This data is cryptographically hashed into the Golden Record and is only shared with competent authorities during a formal audit request.
            </p>
          </div>

          <div className="p-8 bg-forest-900 text-khaki-100 border-2 border-forest-900">
             <h3 className="text-xl font-bold uppercase mb-4 tracking-tight">Artisan Privacy Guarantee</h3>
             <p className="text-sm leading-relaxed opacity-80">
                We believe in fair data practice. Master carvers and individual units maintain absolute control over their workshop geolocation. VrikshLogix never shares artisan contact details with third-party marketers.
             </p>
          </div>

          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">3. Security Infrastructure</h2>
            <p className="text-lg leading-relaxed text-forest-900/80">
              Our servers are located in secure EU-based data centers, ensuring GDPR compliance at the infrastructure level. All data in transit is encrypted using TLS 1.3, and data at rest is protected via AES-256 encryption.
            </p>
          </div>
        </section>

        <footer className="mt-20 pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
           <p className="text-xs font-mono uppercase text-khaki-600">© 2026 VrikshLogix Compliance Systems</p>
           <div className="flex gap-8">
              <Link href="/terms" className="text-xs font-mono uppercase text-khaki-600 hover:text-forest-900 transition-colors">Terms of Service</Link>
              <a href="mailto:privacy@vrikshlogix.com" className="text-xs font-mono uppercase text-khaki-600 hover:text-forest-900 transition-colors">Contact Ethics Officer</a>
           </div>
        </footer>
      </main>
    </div>
  );
}
