"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";

type RiskScore = "green" | "amber" | "red" | null;

interface RiskBadgeProps {
  score: RiskScore;
  showLabel?: boolean;
  className?: string;
}

export function RiskBadge({ score, showLabel = true, className }: RiskBadgeProps) {
  if (!score) {
    return (
      <Badge variant="outline" className={cn("gap-1.5", className)}>
        <Clock className="h-3 w-3" />
        {showLabel && "Not Assessed"}
      </Badge>
    );
  }

  const config = {
    green: {
      variant: "green" as const,
      icon: CheckCircle2,
      label: "Green — No Deforestation",
    },
    amber: {
      variant: "amber" as const,
      icon: AlertTriangle,
      label: "Amber — Data Gap",
    },
    red: {
      variant: "red" as const,
      icon: XCircle,
      label: "Red — Deforestation Detected",
    },
  };

  const { variant, icon: Icon, label } = config[score];

  return (
    <Badge variant={variant} className={cn("gap-1.5", className)}>
      <Icon className="h-3 w-3" />
      {showLabel && label}
    </Badge>
  );
}

interface RiskExplainerCardProps {
  score: RiskScore;
}

export function RiskExplainerCard({ score }: RiskExplainerCardProps) {
  const content = {
    green: {
      title: "✅ Green — Compliant",
      description:
        "No deforestation or forest degradation detected within this plot boundary since January 2020. This plot meets EUDR Article 9 requirements for risk-free classification.",
      action: "Proceed to Due Diligence Statement generation.",
      bg: "bg-emerald-500/10 border-emerald-500/30",
    },
    amber: {
      title: "⚠️ Amber — Further Review Required",
      description:
        "Satellite data gaps or partial overlap with forest cover change areas detected. Additional documentation may be required to demonstrate compliance.",
      action:
        "Upload additional evidence (land title, community certificate, or historical satellite imagery).",
      bg: "bg-amber-500/10 border-amber-500/30",
    },
    red: {
      title: "🚫 Red — Deforestation Detected",
      description:
        "Forest cover loss detected within or adjacent to this plot boundary after January 2020. Under EUDR Article 3, products from this plot cannot be placed on the EU market.",
      action:
        "Do not include this plot in any EU-bound shipment. Contact your compliance officer.",
      bg: "bg-red-500/10 border-red-500/30",
    },
  };

  if (!score) return null;
  const { title, description, action, bg } = content[score];

  return (
    <div className={cn("rounded-xl border p-4 space-y-2", bg)}>
      <h4 className="font-semibold text-sm">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
      <p className="text-xs font-medium text-foreground/80">→ {action}</p>
    </div>
  );
}
