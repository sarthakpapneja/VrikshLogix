import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function check() {
  const { data, error } = await supabase.from("plots").select("id, centroid").limit(1);
  console.log("Plot Data:", JSON.stringify(data, null, 2));
  if (error) console.error("Error:", error);
}

check();
