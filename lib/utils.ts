import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null): string {
  if (!date) return "—";
  return format(new Date(date), "dd MMM yyyy");
}

export function formatDateTime(date: string | Date | null): string {
  if (!date) return "—";
  return format(new Date(date), "dd MMM yyyy, HH:mm");
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function daysUntil(targetDate: string): number {
  return differenceInDays(new Date(targetDate), new Date());
}

export function formatArea(ha: number | null): string {
  if (!ha) return "—";
  if (ha < 1) return `${(ha * 10000).toFixed(0)} m²`;
  return `${ha.toFixed(2)} ha`;
}

export function formatVolume(cft: number | null): string {
  if (!cft) return "—";
  return `${cft.toFixed(2)} CFT`;
}

export function generateBhulekhDeepLink(params: {
  district: string;
  tehsil: string;
  village: string;
  khasraNo?: string;
}): string {
  const base = "https://bhulekh.up.gov.in/Bhulekh/";
  const query = new URLSearchParams({
    district: params.district,
    tehsil: params.tehsil,
    village: params.village,
    ...(params.khasraNo && { khasra: params.khasraNo }),
  });
  return `${base}?${query.toString()}`;
}

export function getRiskColor(score: "green" | "amber" | "red" | null): string {
  switch (score) {
    case "green": return "text-emerald-500";
    case "amber": return "text-amber-500";
    case "red": return "text-red-500";
    default: return "text-muted-foreground";
  }
}

export function getRiskBg(score: "green" | "amber" | "red" | null): string {
  switch (score) {
    case "green": return "bg-emerald-500/10 border-emerald-500/30";
    case "amber": return "bg-amber-500/10 border-amber-500/30";
    case "red": return "bg-red-500/10 border-red-500/30";
    default: return "bg-muted border-border";
  }
}

export function planLabel(plan: string): string {
  const labels: Record<string, string> = {
    free: "Free / Artisan",
    starter: "Compliance Starter",
    sme: "SME Compliance",
    enterprise: "Enterprise Plus",
  };
  return labels[plan] ?? plan;
}

export function planPrice(plan: string): string {
  const prices: Record<string, string> = {
    free: "₹0",
    starter: "₹1,999/mo",
    sme: "₹4,999/mo",
    enterprise: "₹25,000+/mo",
  };
  return prices[plan] ?? "—";
}
