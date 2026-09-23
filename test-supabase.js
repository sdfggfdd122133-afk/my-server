import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

console.log("🔵 Starting Supabase test...");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

const { data, error } = await supabase
  .from("visits")
  .insert({
    ip: "127.0.0.1",
    country: "Egypt",
    city: "Ismailia",
    device: "Desktop",
    page: "/",
    user_agent: "Supabase-Test"
  })
  .select()
  .single();

if (error) {
  console.error("❌ Supabase Test Failed:");
  console.error(error);
  process.exit(1);
}

console.log("✅ Supabase Connected Successfully");
console.log("✅ Test visit inserted:");
console.log(data);
