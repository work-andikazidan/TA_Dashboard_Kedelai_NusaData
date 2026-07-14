const { createClient } = require("@supabase/supabase-js");

const url = "https://npfikgkvacnpsbqsrobn.supabase.co";
const key = "sb_publishable_35PAMThi-DmYkH8yTYryXA_0nhzm_mP";
const supabase = createClient(url, key);

async function run() {
  console.log("Checking tables...");
  
  const res1 = await supabase
    .from("dashboard_produktivitas_tahunan_jatim")
    .select("tahun")
    .eq("komoditas_id", 33);
  
  if (res1.error) {
    console.error("res1 error:", res1.error);
  } else {
    const years1 = Array.from(new Set(res1.data.map(r => r.tahun))).sort();
    console.log("Unique years in dashboard_produktivitas_tahunan_jatim (komoditas_id=33):", years1);
  }

  const res2 = await supabase
    .from("dashboard_harga_bulanan_kabkota_jatim")
    .select("*")
    .eq("tahun", 2026);
  
  if (res2.error) {
    console.error("Querying 2026 in dashboard_harga_bulanan_kabkota_jatim error:", res2.error);
  } else {
    console.log("Number of rows for 2026 in dashboard_harga_bulanan_kabkota_jatim:", res2.data.length);
    if (res2.data.length > 0) {
      console.log("Sample 2026 row:", res2.data[0]);
    }
  }

  // Get columns of first row to inspect
  const resCol = await supabase
    .from("dashboard_harga_bulanan_kabkota_jatim")
    .select("*")
    .limit(1);
  if (!resCol.error && resCol.data.length > 0) {
    console.log("Columns in dashboard_harga_bulanan_kabkota_jatim:", Object.keys(resCol.data[0]));
  }
}

run();
