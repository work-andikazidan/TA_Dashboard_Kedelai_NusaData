"use client"

import * as React from "react"
import { useEffect, useState, useMemo } from "react"
import dynamic from "next/dynamic"
import { MapPinned } from "lucide-react"

import { supabase } from "@/lib/supabase"
import { AppSidebar } from "@/components/app-sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

const MapHargaDynamic = dynamic(
  () => import("@/components/dashboard/map-harga"),
  {
    ssr: false,
    loading: () => <Pulse className="h-[550px] w-full" />,
  }
)

type DashboardHargaBulanan = {
  fact_harga_bulanan_kabkota_key: number
  waktu_key: number
  tahun: number
  bulan: number
  nama_bulan: string
  kode_wilayah: string
  nama_wilayah: string
  harga_bulanan: number | null
}

const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]

// Patokan waktu kalender aktual
const CURRENT_YEAR = new Date().getFullYear()
const CURRENT_MONTH = new Date().getMonth() + 1 

function Pulse({ className }: { className?: string }) {
  return <div className={["animate-pulse rounded-lg bg-slate-200/80", className].join(" ")} />
}

export default function PetaHargaPage() {
  const [allPrices, setAllPrices] = useState<DashboardHargaBulanan[]>([])
  
  const [years, setYears] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  
  const [loading, setLoading] = useState(true)

  // 1. Fetch daftar tahun unik pada saat pertama kali load (diurutkan dari yang terbaru)
  useEffect(() => {
    async function fetchYears() {
      try {
        const { data, error } = await supabase
          .from("dashboard_harga_bulanan_kabkota_jatim")
          .select("tahun")
          .order("tahun", { ascending: false })
          
        if (!error && data) {
          const uniqueYears = Array.from(new Set(data.map(r => r.tahun))).sort((a, b) => b - a)
          setYears(uniqueYears)
          
          if (uniqueYears.length > 0 && !selectedYear) {
            setSelectedYear(String(uniqueYears[0]))
          }
        }
      } catch (err) {
        console.error("Error fetching years:", err)
      }
    }
    fetchYears()
  }, [])

  // 2. Fetch data bulanan hanya untuk tahun yang terpilih (mencegah limit 1000 baris Supabase)
  useEffect(() => {
    if (!selectedYear) return
    
    async function fetchHargaMap() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("dashboard_harga_bulanan_kabkota_jatim")
          .select("*")
          .eq("tahun", Number(selectedYear))
          
        if (!error && data) {
          setAllPrices(data as DashboardHargaBulanan[])
        }
      } catch (err) {
        console.error("Error fetching harga map data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchHargaMap()
  }, [selectedYear])

  // 2. Menghasilkan kalender bulan berdasarkan data aktual yang ada di database untuk Tahun terpilih
  const availableMonths = useMemo(() => {
    if (!selectedYear || allPrices.length === 0) return []
    
    const yearNum = Number(selectedYear)
    const monthsForYear = allPrices
      .filter(r => r.tahun === yearNum)
      .map(r => r.bulan)
      
    const uniqueMonths = Array.from(new Set(monthsForYear)).sort((a, b) => b - a)
    
    return uniqueMonths.map((m) => ({
      value: String(m),
      label: NAMA_BULAN[m - 1] || `Bulan ${m}`
    }))
  }, [selectedYear, allPrices])

  // 3. Autoselect jika berpindah tahun ke bulan terbaru yang tersedia untuk tahun tersebut
  useEffect(() => {
    if (availableMonths.length === 0) return
    
    const isCurrentMonthValid = availableMonths.some(m => m.value === selectedMonth)
    if (!selectedMonth || !isCurrentMonthValid) {
      setSelectedMonth(availableMonths[0].value)
    }
  }, [selectedYear, availableMonths, selectedMonth])

  // 4. Data final dilempar ke komponen peta
  const mapData = useMemo(() => {
    if (!selectedYear || !selectedMonth || allPrices.length === 0) return []
    
    const filtered = allPrices.filter(
      r => r.tahun === Number(selectedYear) && 
           r.bulan === Number(selectedMonth) && 
           r.harga_bulanan !== null
    )
    
    return filtered.map((r) => ({
      nama: r.nama_wilayah,
      harga: Number(r.harga_bulanan ?? 0),
    }))
  }, [allPrices, selectedYear, selectedMonth])

  // Dapatkan nama bulan terpilih untuk ditampilkan di label UI
  const selectedMonthName = useMemo(() => {
    const found = availableMonths.find(m => m.value === selectedMonth)
    return found ? found.label : "—"
  }, [availableMonths, selectedMonth])

  return (
    <SidebarProvider>
      <AppSidebar variant="sidebar" />

      <SidebarInset>
        <div className="flex flex-1 flex-col overflow-auto bg-slate-50 bg-[linear-gradient(to_right,rgba(55,65,81,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(55,65,81,0.07)_1px,transparent_1px)] bg-[size:40px_40px]">
          <div className="mx-auto w-full max-w-screen-xl flex flex-col gap-4 px-4 py-4 lg:px-6">

            {/* ══════════════════ HEADER ══════════════════ */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#2E7D32] text-white shadow-sm flex-shrink-0">
                  <MapPinned className="size-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold leading-tight text-slate-800">
                    Peta Sebaran Harga Kedelai Jawa Timur
                  </h1>
                  <p className="text-md text-muted-foreground">
                    Visualisasi spasial sebaran harga kedelai tingkat konsumen per wilayah
                  </p>
                </div>
              </div>

              {/* SLICER: TAHUN & BULAN */}
              <div className="flex items-center gap-2 self-start md:self-auto">
                <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={availableMonths.length === 0}>
                  <SelectTrigger className="h-9 w-32 text-xs bg-white border-slate-200 font-semibold shadow-sm focus:ring-[#2E7D32] rounded-lg">
                    <SelectValue placeholder="Pilih Bulan…" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMonths.map((m) => (
                      <SelectItem key={m.value} value={m.value} className="text-xs font-medium">
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear} disabled={years.length === 0}>
                  <SelectTrigger className="h-9 w-28 text-xs bg-white border-slate-200 font-semibold shadow-sm focus:ring-[#2E7D32] rounded-lg">
                    <SelectValue placeholder="Pilih Tahun…" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={String(y)} className="text-xs font-medium">
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ══════════════════ MAP CONTAINER ══════════════════ */}
            <section aria-label="Peta Harga Kabupaten/Kota" className="w-full flex-1 flex flex-col">
              <div className="bg-gradient-to-tr from-emerald-500/10 via-green-500/5 to-transparent p-[1.5px] rounded-3xl shadow-[0_20px_50px_rgba(46,125,50,0.04)]">
                <div className="bg-white/95 backdrop-blur-md rounded-[23px] p-5 flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                        <span className="relative flex size-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500"></span>
                        </span>
                        Peta Interaktif Sebaran Harga
                      </h2>
                      <p className="text-xs text-slate-500">
                        Warna merah menunjukkan daerah kritis di bawah Harga Acuan Pemerintah (HAP Rp11.000) · Periode <strong className="text-emerald-700">{selectedMonthName} {selectedYear || "—"}</strong>
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
                      Harga vs HAP
                    </span>
                  </div>

                  <div className="w-full relative rounded-2xl overflow-hidden">
                    <MapHargaDynamic 
                      data={loading ? [] : mapData} 
                      isLoading={loading} 
                      selectedYear={selectedYear}
                      selectedMonth={selectedMonth}
                    />
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}