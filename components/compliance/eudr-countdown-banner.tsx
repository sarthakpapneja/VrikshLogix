"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X, Clock, ShieldAlert } from "lucide-react";
import { daysUntil } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function EUDRCountdownBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [days, setDays] = useState(0);

  useEffect(() => {
    const deadline = process.env.NEXT_PUBLIC_EUDR_DEADLINE_LARGE || "2026-12-30";
    setDays(daysUntil(deadline));
  }, []);

  if (dismissed) return null;

  const isUrgent = days <= 365;

  return (
    <div className={cn(
      "relative flex items-center gap-3 px-4 py-1.5 text-[10px] font-mono border-b transition-all duration-300",
      isUrgent ? "bg-amber-600 text-white border-amber-700" : "bg-forest-900 text-khaki-100 border-forest-950"
    )}>
      <div className="flex items-center gap-4 flex-1 uppercase font-bold tracking-widest">
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span>EUDR_COUNTDOWN: {days} DAYS</span>
        </div>
        <div className="hidden lg:flex items-center gap-2 border-l border-white/20 pl-4">
          <ShieldAlert className="h-3 w-3" />
          <span>REG_STATUS: INDIA_STANDARD_RISK (MANDATORY_POLYGONS)</span>
        </div>
        <div className="hidden xl:block border-l border-white/20 pl-4 opacity-70">
          ENFORCEMENT_DATE: 2026-12-30
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 hover:bg-white/20 p-0.5 transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
