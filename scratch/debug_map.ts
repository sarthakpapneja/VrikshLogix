
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // use service role for debug

async function debugMapPlots() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log("Testing simplified plots query...");
  const { data, error } = await supabase
    .from("plots")
    .select(`
      id,
      khasra_no,
      area_ha,
      timber_species,
      village,
      bhulekh_verified_at,
      farmers(name)
    `)
    .limit(1);

  if (error) {
    console.error("Query Error:", error);
  } else {
    console.log("Query Success! Sample data:", JSON.stringify(data, null, 2));
  }

  console.log("\nTesting GIS plots query...");
  const { data: gisData, error: gisError } = await supabase
    .from("plots")
    .select(`
      id,
      centroid,
      polygon
    `)
    .limit(1);

  if (gisError) {
    console.error("GIS Query Error:", gisError);
  } else {
    console.log("GIS Query Success! Sample data (first 50 chars):", JSON.stringify(gisData, null, 2).substring(0, 100));
  }
}

debugMapPlots();
