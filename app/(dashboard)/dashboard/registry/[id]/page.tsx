"use client";

import { use } from "react";
import { 
  GitBranch, 
  Clock, 
  Search, 
  MapPin, 
  FileCheck, 
  ShieldCheck, 
  AlertCircle,
  Hash,
  ArrowDownCircle,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Simulated Chain Data for the 'Deep Trace' portal
const MOCK_CHAIN = [
  {
    id: "PLOT-SHR-42",
    type: "FOREST PLOT",
    timestamp: "2026-03-10T09:00:00Z",
    status: "VERIFIED",
    details: "Plot #42, Saharanpur West. Owner: Rajesh Kumar.",
    hash: "8f3e2...9a1c",
    checks: ["Bhulekh Valid", "Satellite Clear"]
  },
  {
    id: "PRM-2026-00341",
    type: "FELLING PERMIT (FORM-T)",
    timestamp: "2026-03-15T14:20:00Z",
    status: "VERIFIED",
    details: "Permit for 480 CFT Sheesham. Range: Saharanpur South.",
    hash: "a4c2d...8b7e",
    checks: ["UPFD Hash Match", "OCR Integrity high"]
  },
  {
    id: "BTH-SL-0091",
    type: "SAWMILL BATCH",
    timestamp: "2026-03-20T10:15:00Z",
    status: "ACTIVE",
    details: "Processed at Sharma Timber Mill. Transit Pass #TP-992.",
    hash: "f7d1b...2e43",
    checks: ["Inlet weight match", "IP Camera active"]
  },
  {
    id: "ART-MCR-7",
    type: "ARTISAN WORKSHOP",
    timestamp: "2026-04-01T16:45:00Z",
    status: "IN-PROGRESS",
    details: "Assigned to Master Carver Salim. Component: Floral Panels.",
    hash: "c9a4f...3d22",
    checks: ["Artisan ID #732", "Geolocation verified"]
  }
];

export default function DeepTracePortal({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const targetId = resolvedParams.id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <GitBranch size={18} />
            <h1 className="font-mono text-xs tracking-widest uppercase font-bold">Traceability Ledger / Core Lineage</h1>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground uppercase italic">Deep Trace Explorer</h2>
          <p className="text-muted text-xs mt-1 font-mono uppercase">Querying System Integrity Hash: <span className="text-primary">{targetId}</span></p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="font-mono text-[10px] uppercase">
            <Search className="mr-2 h-4 w-4" />
            Expand Ledger
          </Button>
          <Button size="sm" className="font-mono text-[10px] uppercase bg-primary text-primary-foreground">
            <FileCheck className="mr-2 h-4 w-4" />
            Export Audit Pack
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Trace Timeline */}
        <div className="lg:col-span-8 space-y-8">
          <div className="relative pl-8 border-l border-primary/20 space-y-10 py-4">
            {MOCK_CHAIN.map((node, index) => (
              <div key={node.id} className="relative">
                {/* Connector Dot */}
                <div className={cn(
                  "absolute -left-[41px] top-0 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center",
                  node.status === "VERIFIED" ? "bg-primary" : "bg-amber-500"
                )}>
                  {node.status === "VERIFIED" ? <ShieldCheck className="text-white h-3 w-3" /> : <Clock className="text-white h-3 w-3" />}
                </div>

                <div className="bg-paper p-6 border border-border hover:border-primary/40 transition-colors shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-tighter text-muted-foreground block mb-1">
                        Node Type: {node.type}
                      </span>
                      <h3 className="text-lg font-bold uppercase tracking-tight">{node.id}</h3>
                    </div>
                    <div className={cn(
                      "font-mono text-[10px] px-2 py-1 rounded uppercase",
                      node.status === "VERIFIED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {node.status}
                    </div>
                  </div>

                  <p className="text-sm text-foreground mb-4">{node.details}</p>

                  <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                    <div>
                      <span className="font-mono text-[9px] uppercase text-muted py-1 flex items-center gap-1">
                        <Hash size={10} /> Link Hash
                      </span>
                      <div className="font-mono text-xs text-primary bg-muted/30 px-2 py-1 rounded truncate">
                        {node.hash}
                      </div>
                    </div>
                    <div>
                      <span className="font-mono text-[9px] uppercase text-muted py-1 flex items-center gap-1">
                        <Clock size={10} /> Timestamp
                      </span>
                      <div className="font-mono text-xs text-foreground">
                        {new Date(node.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {node.checks.map((check) => (
                      <div key={check} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-[9px] font-mono uppercase text-muted-foreground">
                        <ShieldCheck size={10} className="text-primary" />
                        {check}
                      </div>
                    ))}
                  </div>
                </div>

                {index < MOCK_CHAIN.length - 1 && (
                  <div className="absolute -left-[32px] top-6 bottom-0 w-px bg-primary/20" />
                )}
              </div>
            ))}
          </div>

          <div className="p-8 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-center opacity-50">
            <ArrowDownCircle className="text-muted mb-2" />
            <p className="text-xs font-mono uppercase">End of Immutable Record</p>
          </div>
        </div>

        {/* Sidebar Intel */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-paper border-primary/20 shadow-none border">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-mono uppercase flex items-center gap-2">
                <ShieldCheck className="text-primary" size={16} /> Integrity Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-muted uppercase">Global Risk Profile</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[94%]" />
                  </div>
                  <span className="font-mono text-sm font-bold">0.06%</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-muted p-3 rounded border border-border">
                  <div className="text-lg font-bold text-primary">04</div>
                  <div className="text-[8px] font-mono uppercase text-muted">Hops</div>
                </div>
                <div className="bg-muted p-3 rounded border border-border">
                  <div className="text-lg font-bold text-primary">100%</div>
                  <div className="text-[8px] font-mono uppercase text-muted">Uptime</div>
                </div>
              </div>

              <div className="pt-2 border-t border-border mt-2">
                <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                  "This batch matches the SHA-256 fingerprint generated at harvest on Mar 10. No data tampering detected in the supply chain lineage."
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-paper shadow-none border">
            <CardHeader className="pb-3 border-b border-border bg-muted/30">
              <CardTitle className="text-sm font-mono uppercase flex items-center gap-2 font-bold">
                <AlertCircle className="text-amber-500" size={16} /> Chain Warning
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm flex items-start gap-3">
                <AlertCircle className="text-amber-600 shrink-0" size={16} />
                <p className="text-[10px] text-amber-800 leading-normal">
                  <span className="font-bold uppercase">Pending Check:</span> Artisan unit #MCR-7 has not yet synced final production weight. Hash remains unsealed.
                </p>
              </div>
              <Button variant="outline" className="w-full font-mono text-[9px] uppercase tracking-widest border-amber-200 text-amber-700 bg-amber-50/50">
                Trigger Resync
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-paper shadow-none border">
             <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-mono uppercase flex items-center gap-2">
                <ExternalLink className="text-muted" size={16} /> Related Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
                <Link href="#" className="flex items-center justify-between p-2 bg-muted/20 hover:bg-muted/40 text-[10px] font-mono uppercase rounded transition-colors group">
                  TP-992-TransitPass.pdf
                  <ExternalLink size={10} className="text-muted group-hover:text-primary" />
                </Link>
                <Link href="#" className="flex items-center justify-between p-2 bg-muted/20 hover:bg-muted/40 text-[10px] font-mono uppercase rounded transition-colors group">
                  Bhulekh-Verification.json
                  <ExternalLink size={10} className="text-muted group-hover:text-primary" />
                </Link>
                <Link href="#" className="flex items-center justify-between p-2 bg-muted/20 hover:bg-muted/40 text-[10px] font-mono uppercase rounded transition-colors group">
                  Satellite-Survey-Log.txt
                  <ExternalLink size={10} className="text-muted group-hover:text-primary" />
                </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper for navigation
function Link({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} className={className}>{children}</a>
  );
}
