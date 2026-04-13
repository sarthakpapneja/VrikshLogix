"use client";

import { MessageSquare } from "lucide-react";
import { toast } from "sonner";

export function FeedbackWidget() {
  const handleReport = () => {
    // In production, this would open a side panel or modal
    toast.info("System_Report Initialized", {
      description: "Our compliance team will review your session logs shortly.",
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] group pointer-events-auto">
      <button 
        className="flex items-center gap-2 bg-forest-900 text-khaki-100 px-4 py-2 border-2 border-khaki-100/20 hover:bg-forest-800 transition-all shadow-2xl"
        onClick={handleReport}
      >
        <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest">System_Report</span>
      </button>
    </div>
  );
}
