"use server";

import { createClient } from "@/lib/supabase/server";

export type ExporterRecord = {
  id: string;
  user_id: string;
  company_name: string;
  subscription_tier: string;
};

/**
 * Retrieves the current exporter context for the logged-in session.
 * If no profile exists, it auto-provisions a default one (Production Hardening).
 */
export async function getCurrentExporter(): Promise<ExporterRecord> {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("UNAUTHORIZED: No active session found.");
  }

  // 1. Try to find existing exporter profile
  const { data: exporter, error: fetchError } = await supabase
    .from("exporters")
    .select("id, user_id, company_name, subscription_tier")
    .eq("user_id", user.id)
    .single();

  if (exporter && !fetchError) {
    return exporter as ExporterRecord;
  }

  // 2. Auto-Provision if missing (Production Hardening Strategy)
  // This ensures the platform never crashes for legacy test users or fresh signups
  console.log(`[AUTH] Auto-provisioning exporter profile for user: ${user.id}`);
  
  const { data: newExporter, error: insertError } = await supabase
    .from("exporters")
    .insert({
      user_id: user.id,
      company_name: user.email?.split("@")[0].toUpperCase() + " EXPORTS",
      contact_email: user.email,
      onboarding_complete: false,
      onboarding_step: 1
    })
    .select()
    .single();

  if (insertError) {
    console.error("[AUTH] Failed to provision exporter profile:", insertError);
    throw new Error("DATABASE_FAILURE: Could not initialize exporter profile.");
  }

  return newExporter as ExporterRecord;
}
