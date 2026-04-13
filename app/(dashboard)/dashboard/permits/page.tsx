"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Filter,
  Eye,
  Camera,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

import { useEffect } from "react";
import { getPermitsAction } from "@/lib/actions/compliance";

const statusConfig: Record<string, { label: string; variant: "green" | "amber" | "red" | "outline" | "blue"; icon: React.ElementType }> = {
  verified: { label: "Verified", variant: "green", icon: CheckCircle2 },
  extracted: { label: "Review Needed", variant: "amber", icon: AlertTriangle },
  pending: { label: "Pending OCR", variant: "outline", icon: Clock },
  rejected: { label: "Rejected", variant: "red", icon: AlertTriangle },
};

export default function PermitsPage() {
  const [query, setQuery] = useState("");
  const [permits, setPermits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getPermitsAction();
      if (res.success) {
        setPermits(res.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = permits.filter(
    (p: any) =>
      p.permit_no.toLowerCase().includes(query.toLowerCase()) ||
      p.linked_farmer?.toLowerCase().includes(query.toLowerCase()) ||
      p.species.some((s: string) => s.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Form-T Permits</h1>
          <p className="text-muted-foreground text-sm">
            {permits.length} permits · {permits.filter((p) => p.status === "verified").length} verified · {permits.filter((p) => p.status === "pending").length} pending OCR
          </p>
        </div>
        <Link href="/dashboard/permits/new">
          <Button variant="forest" className="gap-2">
            <Plus className="h-4 w-4" />
            Upload Permit (OCR)
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Permits", value: permits.length, emoji: "📄" },
          { label: "Verified", value: permits.filter((p) => p.status === "verified").length, emoji: "✅" },
          { label: "Needs Review", value: permits.filter((p: any) => p.status === "extracted").length, emoji: "⚠️" },
          { label: "Total Volume (CFT)", value: permits.reduce((s: number, p: any) => s + p.volume_cft, 0).toFixed(0), emoji: "📦" },
        ].map((s: any) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-2xl mb-1">{s.emoji}</p>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="permit-search"
            placeholder="Search permit number, species, farmer..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Permit list */}
      <div className="space-y-3">
        {filtered.map((permit) => {
          const status = statusConfig[permit.status];
          const confidencePct = Math.round(permit.ocr_confidence * 100);
          return (
            <Card key={permit.id} className="card-hover">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">
                        {permit.permit_no !== "—" ? permit.permit_no : "Permit pending extraction"}
                      </h3>
                      <Badge variant={status.variant} className="gap-1">
                        <status.icon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>Species: <strong className="text-foreground">{permit.species.join(", ") || "—"}</strong></span>
                      <span>Volume: <strong className="text-foreground">{permit.volume_cft > 0 ? `${permit.volume_cft} CFT` : "—"}</strong></span>
                      <span>District: <strong className="text-foreground">{permit.origin_district || "—"}</strong></span>
                      <span>Issue Date: <strong className="text-foreground">{permit.issue_date ? formatDate(permit.issue_date) : "—"}</strong></span>
                    </div>
                    {permit.linked_farmer && (
                      <p className="mt-1 text-xs text-forest-500">
                        🌳 Linked to {permit.linked_farmer} · Khasra {permit.linked_khasra}
                      </p>
                    )}
                    {permit.ocr_confidence > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${confidencePct >= 90 ? "bg-emerald-500" : confidencePct >= 75 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${confidencePct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{confidencePct}% OCR confidence</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {permit.status === "pending" && (
                      <Link href={`/dashboard/permits/new`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Camera className="h-3.5 w-3.5" />
                          Extract
                        </Button>
                      </Link>
                    )}
                    {permit.status === "extracted" && (
                      <Link href={`/dashboard/permits/${permit.id}`}>
                        <Button variant="outline" size="sm" className="gap-1 text-amber-500 border-amber-500/30">
                          <Eye className="h-3.5 w-3.5" />
                          Review
                        </Button>
                      </Link>
                    )}
                    <Link href={`/dashboard/permits/${permit.id}`}>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
