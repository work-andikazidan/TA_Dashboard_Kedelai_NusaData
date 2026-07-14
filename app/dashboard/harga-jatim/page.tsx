"use client"

import * as React from "react"
import { useEffect, useState, useMemo } from "react"
import { Coins, TrendingUp, TrendingDown, Layers } from "lucide-react"

import { supabase } from "@/lib/supabase"
import { KpiCard } from "@/components/dashboard/kpi-card"
import {
  ChartTrenProvinsi,
  ChartBulletHap,
  ChartTop5Termurah,
  type TrenProvinsiData,
  type BulletHapData,
  type Top5TermurahData,
} from "@/components/dashboard/chart-harga"
import { AppSidebar } from "@/components/app-sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

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

function Pulse({ className }: { className?: string }) {
  return <div className={["animate-pulse rounded-lg bg-slate-200/80", className].join(" ")} />
}

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val)
}

export default function HargaJatimPage() {
  const [allPrices, setAllPrices] = useState<DashboardHargaBulanan[]>([])
  // State baru khusus menampung data multi-tahun untuk ChartTrenProvinsi
  const [globalPrices, setGlobalPrices] = useState<DashboardHargaBulanan[]>([])
  const [selectedYear, setSelectedYear] = useState<string>("2026")
  const [years, setYears] = useState<number[]>([2026, 2025, 2024, 2023, 2022])
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [loading, setLoading] = useState(true)

  // ─── 1. EFFECT: Mengambil Data Tren Jangka Panjang (Hanya Sekali di Awal) ───
  useEffect(() => {
    async function fetchGlobalTrendData() {
      try {
        // Supabase membatasi 1000 baris per request secara default.
        // Kita gunakan loop pagination (range) untuk mengambil SEMUA data agar tren tidak terpotong.
        const PAGE_SIZE = 1000
        let allData: DashboardHargaBulanan[] = []
        let from = 0
        let hasMore = true

        while (hasMore) {
          const { data, error } = await supabase
            .from("dashboard_harga_bulanan_kabkota_jatim")
            .select("tahun, bulan, nama_bulan, harga_bulanan")
            .range(from, from + PAGE_SIZE - 1)

          if (error) {
            console.error("Error fetching global trend data:", error)
            break
          }

          if (data && data.length > 0) {
            allData = allData.concat(data as DashboardHargaBulanan[])
            from += PAGE_SIZE
            // Jika hasil kurang dari PAGE_SIZE, berarti sudah halaman terakhir
            hasMore = data.length === PAGE_SIZE
          } else {
            hasMore = false
          }
        }

        setGlobalPrices(allData)
      } catch (err) {
        console.error("Error fetching global trend data:", err)
      }
    }
    fetchGlobalTrendData()
  }, [])

  // ─── 2. EFFECT: Mengambil Data Spesifik Tahun Pilihan (Terpicu Slicer) ───
  useEffect(() => {
    async function fetchByYear() {
      if (!selectedYear) return
      try {
        setLoading(true)
        // Data per tahun (38 kabupaten × 12 bulan = 456 baris) tidak akan melebihi 1000,
        // namun tetap diberi limit eksplisit yang aman.
        const { data, error } = await supabase
          .from("dashboard_harga_bulanan_kabkota_jatim")
          .select("*")
          .eq("tahun", Number(selectedYear))
          .limit(500)
        
        if (!error && data) {
          setAllPrices(data as DashboardHargaBulanan[])
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchByYear()
  }, [selectedYear])

  // Data sudah murni terfilter dari server berdasarkan tahun
  const selectedYearRows = allPrices;

  // Daftar bulan yang tersedia dalam tahun terpilih (hanya bulan yang ada datanya)
  const availableMonths = useMemo(() => {
    const valid = selectedYearRows.filter(r => r.harga_bulanan !== null)
    const monthMap = new Map<number, string>()
    valid.forEach(r => {
      if (!monthMap.has(r.bulan)) monthMap.set(r.bulan, r.nama_bulan)
    })
    return Array.from(monthMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([bulan, nama_bulan]) => ({ bulan, nama_bulan }))
  }, [selectedYearRows])

  // Auto-set ke bulan terbaru setiap kali availableMonths berubah (tahun berganti atau data baru masuk)
  useEffect(() => {
    if (availableMonths.length === 0) return
    const latest = availableMonths[availableMonths.length - 1]
    setSelectedMonth(String(latest.bulan))
  }, [availableMonths])

  // Informasi bulan yang sedang aktif (untuk label KPI)
  const activeMonthInfo = useMemo(() => {
    const found = availableMonths.find(m => String(m.bulan) === selectedMonth)
    return found ?? { bulan: 0, nama_bulan: "" }
  }, [availableMonths, selectedMonth])

  // Baris data untuk bulan yang dipilih
  const latestMonthRows = useMemo(() => {
    if (!selectedMonth) return []
    return selectedYearRows.filter(r => r.bulan === Number(selectedMonth) && r.harga_bulanan !== null)
  }, [selectedYearRows, selectedMonth])

  // Calculate 4 KPI metrics dynamically
  const cardsData = useMemo(() => {
    if (latestMonthRows.length === 0) return null
    const validPrices = latestMonthRows.map(r => Number(r.harga_bulanan))
    const total = validPrices.reduce((s, p) => s + p, 0)
    const avg = validPrices.length ? total / validPrices.length : 0

    const sortedDesc = [...latestMonthRows].sort((a, b) => Number(b.harga_bulanan) - Number(a.harga_bulanan))
    const highest = sortedDesc[0]

    const sortedAsc = [...latestMonthRows].sort((a, b) => Number(a.harga_bulanan) - Number(b.harga_bulanan))
    const lowest = sortedAsc[0]

    return {
      rata_rata_provinsi: avg,
      harga_tertinggi: highest ? Number(highest.harga_bulanan) : 0,
      wilayah_termahal: highest ? highest.nama_wilayah : "—",
      harga_terendah: lowest ? Number(lowest.harga_bulanan) : 0,
      wilayah_termurah: lowest ? lowest.nama_wilayah : "—",
      jumlah_melapor: latestMonthRows.length
    }
  }, [latestMonthRows])

  // ─── 3. MEMO: Menghitung Tren Provinsi Menggunakan globalPrices (Bypass Slicer) ───
  const trenData = useMemo(() => {
    if (globalPrices.length === 0) return []
    const groups: Record<string, { tahun: number; bulan: number; nama_bulan: string; sum: number; count: number }> = {}

    globalPrices.forEach(r => {
      if (r.harga_bulanan === null) return
      const key = `${r.tahun}-${r.bulan}`
      if (!groups[key]) {
        groups[key] = { tahun: r.tahun, bulan: r.bulan, nama_bulan: r.nama_bulan, sum: 0, count: 0 }
      }
      groups[key].sum += Number(r.harga_bulanan)
      groups[key].count += 1
    })

    return Object.values(groups)
      .map(g => ({
        tahun: g.tahun,
        bulan: g.bulan,
        nama_bulan: g.nama_bulan,
        label_waktu: `${g.nama_bulan} ${g.tahun}`,
        rata_rata_provinsi: g.sum / g.count
      }))
      .sort((a, b) => {
        if (a.tahun !== b.tahun) return a.tahun - b.tahun
        return a.bulan - b.bulan
      })
  }, [globalPrices])

const top5Data = useMemo(() => {
  if (latestMonthRows.length === 0) return []
  return [...latestMonthRows]
    .sort((a, b) => Number(a.harga_bulanan) - Number(b.harga_bulanan))
    .slice(0, 5)
    .map(r => ({
      tahun: Number(r.tahun), // <-- TAMBAHKAN INI
      nama_wilayah: r.nama_wilayah,
      harga_terkini: Number(r.harga_bulanan)
    }))
}, [latestMonthRows])

  // Calculate bullet chart data
  const bulletData = useMemo(() => {
  if (latestMonthRows.length === 0) return []
  return latestMonthRows.map(r => {
    const harga = Number(r.harga_bulanan)
    const selisih = harga - 11000
    let status_kebijakan = "Aman - Menguntungkan Petani"
    if (harga < 10500) {
      status_kebijakan = "Kritis - Butuh Serapan Bulog"
    } else if (harga < 11000) {
      status_kebijakan = "Rentan"
    }

    return {
      tahun: Number(r.tahun), // <-- TAMBAHKAN INI
      kode_wilayah: r.kode_wilayah,
      nama_wilayah: r.nama_wilayah,
      harga_terkini: harga,
      harga_acuan_pemerintah: 11000,
      selisih,
      status_kebijakan
    }
  })
}, [latestMonthRows])

  return (
    <SidebarProvider>
      <AppSidebar variant="sidebar" />

      <SidebarInset>
        <div className="flex flex-1 flex-col overflow-auto bg-slate-50 bg-[linear-gradient(to_right,rgba(55,65,81,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(55,65,81,0.07)_1px,transparent_1px)] bg-[size:40px_40px]">
          <div className="mx-auto w-full max-w-screen-xl flex flex-col gap-3 px-4 py-3 lg:px-6">

            {/* HEADER */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-2xl font-extrabold leading-tight text-slate-800">
                    Dashboard Harga Kedelai di Jawa Timur
                  </h1>
                  <p className="text-md text-muted-foreground">
                    Analisis fluktuasi harga kedelai tingkat konsumen, evaluasi kebijakan HAP, dan deteksi anomali pasar Jawa Timur
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={availableMonths.length === 0}>
                  <SelectTrigger className="h-9 w-36 text-xs bg-white border-slate-200 font-semibold shadow-sm focus:ring-[#2E7D32] rounded-lg">
                    <SelectValue placeholder="Pilih Bulan…" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMonths.map((m) => (
                      <SelectItem key={m.bulan} value={String(m.bulan)} className="text-xs font-medium">
                        {m.nama_bulan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear} disabled={years.length === 0}>
                  <SelectTrigger className="h-9 w-36 text-xs bg-white border-slate-200 font-semibold shadow-sm focus:ring-[#2E7D32] rounded-lg">
                    <SelectValue placeholder="Pilih Tahun…" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={String(y)} className="text-xs font-medium">{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* LEVEL 1 — KPI CARDS */}
            <section aria-label="Indikator Utama Harga">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => <Pulse key={i} className="h-24" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <KpiCard
                    title="Rata-rata Provinsi"
                    value={cardsData ? formatRupiah(cardsData.rata_rata_provinsi) : "—"}
                    sub={activeMonthInfo.nama_bulan ? `Periode ${activeMonthInfo.nama_bulan} ${selectedYear}` : "Rata-rata harga se-Jatim"}
                    icon={<Coins className="size-5" />}
                    variant="lime"
                  />

                  <KpiCard
                    title="Harga Tertinggi"
                    value={cardsData ? formatRupiah(cardsData.harga_tertinggi) : "—"}
                    sub={cardsData?.wilayah_termahal ?? "—"}
                    icon={<TrendingUp className="size-5" />}
                    variant="carrot"
                  />

                  <KpiCard
                    title="Harga Terendah"
                    value={cardsData ? formatRupiah(cardsData.harga_terendah) : "—"}
                    sub={cardsData?.wilayah_termurah ?? "—"}
                    icon={<TrendingDown className="size-5" />}
                    variant="sky"
                  />

                  <KpiCard
                    title="Daerah Melapor"
                    value={cardsData ? `${cardsData.jumlah_melapor} Wilayah` : "—"}
                    sub="Dari total 38 kabupaten/kota"
                    icon={<Layers className="size-5" />}
                    variant="amber"
                  />
                </div>
              )}
            </section>

            {/* GRAPHS SECTION */}
            <div className="flex flex-col gap-3">
              <section aria-label="Grafik Tren & Kantong Pasok" className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                {/* Chart ini sekarang membaca trenData global (2023 - 2026+) secara kontinu */}
                <div className="lg:col-span-3">
                  <ChartTrenProvinsi data={trenData} />
                </div>

                <div className="lg:col-span-2">
                  <ChartTop5Termurah data={top5Data} />
                </div>
              </section>

              <section aria-label="Grafik Evaluasi Kebijakan" className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                <div className="lg:col-span-5">
                  <ChartBulletHap data={bulletData} />
                </div>
              </section>
            </div>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}