"use client"

import * as React from "react"
import { useEffect, useState, useMemo } from "react"
import { Grid2x2Check } from "lucide-react"

import { supabase } from "@/lib/supabase"
import { AppSidebar } from "@/components/app-sidebar"
import { DetailedTableHarga } from "@/components/dashboard/detailed-table-harga"
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

export default function TabelHargaPage() {
  const [allPrices, setAllPrices] = useState<DashboardHargaBulanan[]>([])
  const [years, setYears] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHargaTable() {
      try {
        setLoading(true)

        // Supabase membatasi 1000 baris secara default.
        // Gunakan loop pagination untuk mengambil SEMUA data tanpa terpotong.
        const PAGE_SIZE = 1000
        let allData: DashboardHargaBulanan[] = []
        let from = 0
        let hasMore = true

        while (hasMore) {
          const { data, error } = await supabase
            .from("dashboard_harga_bulanan_kabkota_jatim")
            .select("*")
            .range(from, from + PAGE_SIZE - 1)

          if (error) {
            console.error("Error fetching harga table data:", error)
            break
          }

          if (data && data.length > 0) {
            allData = allData.concat(data as DashboardHargaBulanan[])
            from += PAGE_SIZE
            hasMore = data.length === PAGE_SIZE
          } else {
            hasMore = false
          }
        }

        setAllPrices(allData)

        // Ambil daftar tahun unik (descending) dari semua data
        const uniqueYears = Array.from(new Set(allData.map(r => r.tahun))).sort((a, b) => b - a)
        setYears(uniqueYears)

        if (uniqueYears.length > 0) {
          const latestYear = String(uniqueYears[0])
          setSelectedYear(latestYear)

          // Tentukan bulan terbaru yang tersedia di tahun terbaru
          const rowsInLatestYear = allData.filter(r => r.tahun === uniqueYears[0] && r.harga_bulanan !== null)
          if (rowsInLatestYear.length > 0) {
            const maxMonth = Math.max(...rowsInLatestYear.map(r => r.bulan))
            setSelectedMonth(String(maxMonth))
          }
        }
      } catch (err) {
        console.error("Error fetching harga table data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchHargaTable()
  }, [])

  // Rows yang sesuai tahun yang dipilih
  const selectedYearRows = useMemo(() => {
    if (!selectedYear || allPrices.length === 0) return []
    return allPrices.filter(r => r.tahun === Number(selectedYear))
  }, [allPrices, selectedYear])

  // Daftar bulan yang tersedia untuk tahun yang dipilih (hanya bulan yang ada datanya)
  const availableMonths = useMemo(() => {
    const valid = selectedYearRows.filter(r => r.harga_bulanan !== null)
    const monthMap: Record<number, string> = {}
    valid.forEach(r => {
      monthMap[r.bulan] = r.nama_bulan
    })
    return Object.entries(monthMap)
      .map(([bulan, nama_bulan]) => ({ bulan: Number(bulan), nama_bulan }))
      .sort((a, b) => b.bulan - a.bulan) // descending: terbaru di atas
  }, [selectedYearRows])

  // Saat tahun berubah → reset bulan ke bulan terbaru yang ada di tahun baru
  const handleYearChange = (year: string) => {
    setSelectedYear(year)
    const rowsInYear = allPrices.filter(r => r.tahun === Number(year) && r.harga_bulanan !== null)
    if (rowsInYear.length > 0) {
      const maxMonth = Math.max(...rowsInYear.map(r => r.bulan))
      setSelectedMonth(String(maxMonth))
    } else {
      setSelectedMonth("")
    }
  }

  // Info bulan terpilih (nama)
  const selectedMonthName = useMemo(() => {
    const found = availableMonths.find(m => m.bulan === Number(selectedMonth))
    return found ? found.nama_bulan : ""
  }, [availableMonths, selectedMonth])

  // Data untuk tabel: filter sesuai tahun & bulan terpilih
  const tableData = useMemo(() => {
    if (!selectedYear || !selectedMonth) return []
    return selectedYearRows
      .filter(r => r.bulan === Number(selectedMonth) && r.harga_bulanan !== null)
      .map(r => ({
        kode_wilayah: r.kode_wilayah,
        nama_wilayah: r.nama_wilayah,
        harga_terkini: Number(r.harga_bulanan ?? 0),
        tahun: r.tahun,
        bulan: r.bulan,
      }))
  }, [selectedYearRows, selectedYear, selectedMonth])

  return (
    <SidebarProvider>
      <AppSidebar variant="sidebar" />

      <SidebarInset>
        <div className="flex flex-1 flex-col overflow-auto bg-slate-50 bg-[linear-gradient(to_right,rgba(55,65,81,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(55,65,81,0.07)_1px,transparent_1px)] bg-[size:40px_40px]">
          <div className="mx-auto w-full max-w-screen-xl flex flex-col gap-4 px-4 py-4 lg:px-6">

            {/* ══════════════════ HEADER ══════════════════ */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-green-800 text-white shadow-md shadow-emerald-200">
                    <Grid2x2Check className="size-5" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold leading-tight text-slate-800 tracking-tight">
                    Tabel Data Harga Kedelai Jawa Timur
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Rincian harga kedelai tingkat konsumen per wilayah kabupaten/kota, deviasi terhadap HAP, dan status kebijakan pelindungan
                  </p>
                </div>
              </div>

              {/* ── SLICER: Tahun + Bulan ── */}
              <div className="flex items-center gap-2 self-start mt-1 flex-wrap">
                {/* Slicer Tahun */}
                <Select value={selectedYear} onValueChange={handleYearChange} disabled={years.length === 0 || loading}>
                  <SelectTrigger className="h-9 w-36 text-xs bg-white border-slate-200 font-semibold shadow-sm focus:ring-[#2E7D32] rounded-lg">
                    <SelectValue placeholder="Pilih Tahun…" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={String(y)} className="text-xs font-medium">{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Slicer Bulan */}
                <Select
                  value={selectedMonth}
                  onValueChange={setSelectedMonth}
                  disabled={availableMonths.length === 0 || loading}
                >
                  <SelectTrigger className="h-9 w-40 text-xs bg-white border-slate-200 font-semibold shadow-sm focus:ring-[#2E7D32] rounded-lg">
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

                {/* Label periode aktif */}
                {selectedMonthName && selectedYear && (
                  <div className="flex items-center justify-center h-9 px-4 text-xs bg-white border border-slate-200 font-semibold shadow-sm rounded-lg text-slate-700">
                    Periode: {selectedMonthName} {selectedYear}
                  </div>
                )}
              </div>
            </div>

            {/* ══════════════════ DETAILED TABLE CONTAINER ══════════════════ */}
            <section aria-label="Tabel Rincian Harga Kabupaten/Kota" className="flex flex-col gap-6">
              <DetailedTableHarga rows={tableData} isLoading={loading} />
            </section>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}