import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
import fs from "fs"

const env = dotenv.parse(fs.readFileSync(".env.local"))
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  const { count, error: countErr } = await supabase
    .from("dashboard_harga_bulanan_kabkota_jatim")
    .select("*", { count: "exact", head: true })
  
  if (countErr) {
    console.error("Count Error:", countErr.message)
    return
  }
  console.log("Total records in DB:", count)

  const { data, error } = await supabase
    .from("dashboard_harga_bulanan_kabkota_jatim")
    .select("tahun, bulan, nama_bulan")
    .order("tahun", { ascending: false })
  
  if (error) {
    console.error("Error:", error.message)
    return
  }

  const years = Array.from(new Set(data.map(r => r.tahun))).sort()
  console.log("Years found in DB:", years)
  
  const year2026 = data.filter(r => r.tahun === 2026)
  console.log("Number of 2026 records:", year2026.length)
  if (year2026.length > 0) {
    console.log("2026 months:", Array.from(new Set(year2026.map(r => r.nama_bulan))))
  }
}

test()
