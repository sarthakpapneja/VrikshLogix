"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentExporter } from "./exporter";

export async function upgradeSubscriptionAction(formData: FormData) {
  const supabase = await createClient();
  const plan = formData.get("plan") as string;
  
  const exporter = await getCurrentExporter();

  // In production, this would initialize a Stripe/Razorpay session.
  // For pre-launch hardening, we simulate the success by updating the DB.
  const { error } = await supabase
    .from("subscriptions")
    .update({ 
      plan: plan.toLowerCase(),
      status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq("exporter_id", exporter.id);

  if (error) throw new Error(error.message);

  revalidatePath("/(dashboard)/billing");
  return { success: true };
}

export async function getSubscriptionStatus() {
  const supabase = await createClient();
  let exporter;
  
  try {
    exporter = await getCurrentExporter();
  } catch (err) {
    return null;
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select(`
      plan,
      status,
      trial_ends_at,
      current_period_end,
      dds_credits,
      monthly_dds_limit
    `)
    .eq("exporter_id", exporter.id)
    .single();

  return subscription;
}
