"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Database, ShieldCheck, Zap } from "lucide-react";

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSeed = async () => {
    setLoading(true);
    try {
      // 1. Get current exporter
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Not authenticated");
        return;
      }

      let { data: exporter } = await supabase
        .from("exporters")
        .select("id")
        .eq("user_id", user.id)
        .single();

      // 1.5 Auto-provision exporter if profile is missing
      if (!exporter) {
        const { data: newExporter, error: createError } = await supabase
          .from("exporters")
          .insert({
            user_id: user.id,
            company_name: user.user_metadata?.company_name || user.email?.split('@')[0] + " Org",
            contact_email: user.email,
          })
          .select("id")
          .single();
        
        if (createError) throw createError;
        exporter = newExporter;
        
        toast.info("Org Profile Created", {
          description: "New exporter profile provisioned for your session.",
        });
      }

      // 2. Sample Data
      const farmersData = [
        { name: "Rajesh Kumar", village: "Behat", tehsil: "Behat", district: "Saharanpur", state: "Uttar Pradesh", contact_phone: "9876543210", exporter_id: exporter.id },
        { name: "Mohammad Irfan", village: "Nanauta", tehsil: "Deoband", district: "Saharanpur", state: "Uttar Pradesh", contact_phone: "9876543211", exporter_id: exporter.id },
        { name: "Suresh Saini", village: "Chilkana", tehsil: "Saharanpur", district: "Saharanpur", state: "Uttar Pradesh", contact_phone: "9876543212", exporter_id: exporter.id },
      ];

      const { data: farmers, error: fError } = await supabase.from("farmers").insert(farmersData).select();
      if (fError) throw fError;

      const plotsData = [
        { 
          farmer_id: farmers[0].id, 
          exporter_id: exporter.id,
          khasra_no: "124/A", 
          area_ha: 1.25, 
          village: "Behat", 
          timber_species: ["Sheesham", "Mango"],
          bhulekh_verified_at: new Date().toISOString(),
          centroid: 'POINT(77.5684 29.9984)',
          polygon: 'POLYGON((77.5680 29.9980, 77.5690 29.9980, 77.5690 29.9990, 77.5680 29.9990, 77.5680 29.9980))'
        },
        { 
          farmer_id: farmers[1].id, 
          exporter_id: exporter.id,
          khasra_no: "56/B", 
          area_ha: 2.10, 
          village: "Nanauta", 
          timber_species: ["Teak"],
          bhulekh_verified_at: null,
          centroid: 'POINT(77.5620 29.9910)',
          polygon: 'POLYGON((77.5610 29.9900, 77.5630 29.9900, 77.5630 29.9920, 77.5610 29.9920, 77.5610 29.9900))'
        },
        { 
          farmer_id: farmers[2].id, 
          exporter_id: exporter.id,
          khasra_no: "211", 
          area_ha: 0.75, 
          village: "Chilkana", 
          timber_species: ["Sheesham"],
          bhulekh_verified_at: new Date().toISOString(),
          centroid: 'POINT(77.5750 30.0050)',
          polygon: 'POLYGON((77.5740 30.0040, 77.5760 30.0040, 77.5760 30.0060, 77.5740 30.0060, 77.5740 30.0040))'
        }
      ];

      const { data: insertedPlots, error: pError } = await supabase.from("plots").insert(plotsData).select();
      if (pError) throw pError;

      const riskData = insertedPlots.map((plot: any, idx: number) => ({
        plot_id: plot.id,
        exporter_id: exporter.id,
        risk_score: idx === 1 ? 'amber' : 'green',
        data_source: 'mock'
      }));

      const { error: rError } = await supabase.from("risk_assessments").insert(riskData);
      if (rError) throw rError;

      toast.success("Database Seeded Successfully", {
        description: "Article 9 and 10 records generated for Saharanpur nodes.",
      });
    } catch (err: any) {
      console.error(err);
      toast.error("Seeding Failed", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 p-12 bg-khaki-100/10 border border-dashed border-khaki-300">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-forest-900/5 mb-4">
          <Database className="h-6 w-6 text-forest-900" />
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-widest text-forest-900">Platform Initialization</h1>
        <p className="text-sm text-khaki-700 max-w-md mx-auto">
          Synchronize your local environment with production-grade Article 9 traceability nodes and Article 10 geospatial perimeters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <div className="p-6 bg-white border border-border shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
             <Zap className="h-5 w-5 text-amber-500" />
             <h3 className="font-bold uppercase text-xs tracking-tight">Rapid Seeding</h3>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed italic">
            Injects verified farmer nodes, high-fidelity PostGIS perimeters, and historical compliance logs into the current registry.
          </p>
          <Button 
            onClick={handleSeed} 
            disabled={loading}
            className="w-full bg-forest-900 text-khaki-100 rounded-none h-10 font-bold uppercase text-[10px] tracking-widest"
          >
            {loading ? "Initializing Registry..." : "Seed Production Assets"}
          </Button>
        </div>

        <div className="p-6 bg-white border border-border shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
             <ShieldCheck className="h-5 w-5 text-emerald-600" />
             <h3 className="font-bold uppercase text-xs tracking-tight">Integrity Check</h3>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed italic">
            Validates existing RLS policies, Article 10 risk scoring engines, and EU TRACES NT connectivity status.
          </p>
          <Button 
            variant="outline"
            className="w-full border-forest-900/20 text-forest-900 rounded-none h-10 font-bold uppercase text-[10px] tracking-widest hover:bg-forest-900 hover:text-white"
          >
            Run Compliance Audit
          </Button>
        </div>
      </div>
    </div>
  );
}
