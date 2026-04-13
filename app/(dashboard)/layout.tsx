import { EUDRCountdownBanner } from "@/components/compliance/eudr-countdown-banner";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <div className="flex flex-col flex-1 overflow-y-auto">
        <EUDRCountdownBanner />
        <main className="flex-1 relative overflow-visible">
          {children}
        </main>
      </div>
    </div>
  );
}
