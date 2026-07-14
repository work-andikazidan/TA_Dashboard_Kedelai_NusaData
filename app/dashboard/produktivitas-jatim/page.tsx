"use client"

import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { Activity, MapPinned, TrendingUp, Layers, LucideSprout } from "lucide-react"

import { supabase } from "@/lib/supabase"
import { formatNumber } from "@/lib/formatters"
import { KpiCard } from "@/components/dashboard/kpi-card"
import {
  ChartTrenPerforma,
  ChartLumbungKedelai,
  ChartRasioLahanPie,
  ChartTrenKebutuhanPupuk,
  type TrendPerformaData,
  type TrenKebutuhanPupukData,
  type RasioLahanData, // Pastikan ini sudah di-export dari file chart-produktivitas
} from "@/components/dashboard/chart-produktivitas"
import { AppSidebar } from "@/components/app-sidebar"
import type { DashboardProduksiTahunan } from "@/types/dashboard"

import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

const DEFAULT_KOMODITAS_ID = 33

function Pulse({ className }: { className?: string }) {
  return <div className={["animate-pulse rounded-lg bg-slate-200/80", className].join(" ")} />
}

export default function ProduktivitasJatimPage() {
  const [rows, setRows] = useState<DashboardProduksiTahunan[]>([])
  const [years, setYears] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [loading, setLoading] = useState(true)

  // Chart Data States
  const [chart2Data, setChart2Data] = useState<TrendPerformaData[]>([])
  const [chartPupukData, setChartPupukData] = useState<TrenKebutuhanPupukData[]>([])
  const [rasioLahanData, setRasioLahanData] = useState<RasioLahanData[]>([]) // State baru untuk Rasio Lahan
  const [chartsLoading, setChartsLoading] = useState(true)

  // 1. Fetch available years on mount
  useEffect(() => {
    async function fetchYears() {
      const { data, error } = await supabase
        .from("dashboard_produktivitas_tahunan_jatim")
        .select("tahun")
        .eq("komoditas_id", DEFAULT_KOMODITAS_ID)
        .order("tahun", { ascending: false })
      
      if (error) { 
        console.error(error)
        setLoading(false)
        return 
      }
      
      const unique = Array.from(new Set((data ?? []).map((r: { tahun: number }) => r.tahun))).sort((a, b) => b - a)
      setYears(unique)
      if (unique.length > 0) setSelectedYear(String(unique[0]))
    }
    fetchYears()
  }, [])

  // 2. Fetch data that depends on the Selected Year
  useEffect(() => {
    if (!selectedYear) return
    setLoading(true)

    async function fetchYearlyData() {
      try {
        // A. Fetch raw data untuk KPI Cards dan Chart Lumbung
        const resRows = await supabase
          .from("dashboard_produktivitas_tahunan_jatim")
          .select("*")
          .eq("tahun", Number(selectedYear))
          .eq("komoditas_id", DEFAULT_KOMODITAS_ID)
        
        if (!resRows.error) setRows((resRows.data ?? []) as DashboardProduksiTahunan[])

        // B. Fetch data agregasi Rasio Lahan dari view Supabase
        const resRasio = await supabase
          .from("dash_rasio_lahan_tanam")
          .select("*")
          .eq("tahun", Number(selectedYear))
        
        if (!resRasio.error) setRasioLahanData((resRasio.data ?? []) as RasioLahanData[])

      } catch (err) {
        console.error("Error fetching yearly data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchYearlyData()
  }, [selectedYear])

  // 3. Fetch View Charts once on mount (All-Time Trends)
  useEffect(() => {
    setChartsLoading(true)
    async function fetchViewCharts() {
      try {
        // Fetch Chart 2 (Tren Performa)
        const resTrend = await supabase
          .from("dash_tren_performa_jatim")
          .select("*")
          .order("tahun", { ascending: true })
        if (!resTrend.error && resTrend.data) {
          setChart2Data(resTrend.data as TrendPerformaData[])
        }

        // Fetch Chart 6 (Kebutuhan / Harga Pupuk)
        const resPupuk = await supabase
          .from("dash_rerata_harga_pupuk")
          .select("*")
          .order("tahun", { ascending: true })

        if (!resPupuk.error && resPupuk.data) {
          setChartPupukData(resPupuk.data as TrenKebutuhanPupukData[])
        }
      } catch (err) {
        console.error("Error fetching view charts:", err)
      } finally {
        setChartsLoading(false)
      }
    }
    fetchViewCharts()
  }, [])

  // ── KPI metrics calculation (Tetap menggunakan raw rows)
  const metrics = useMemo(() => {
    const totalProduksi = rows.reduce((s, r) => s + Number(r.produksi ?? 0), 0)
    const kabKotaAktif = rows.filter((r) => Number(r.produksi ?? 0) > 0).length

    const valid = rows.filter((r) => r.produktivitas != null)
    const rataProduktivitas = valid.length
      ? valid.reduce((s, r) => s + Number(r.produktivitas), 0) / valid.length
      : 0

    const sorted = [...valid].sort((a, b) => Number(b.produktivitas) - Number(a.produktivitas))

    const validLuas = rows.filter((r) => r.luas_panen != null && Number(r.luas_panen) > 0)
    const sortedLuas = [...validLuas].sort((a, b) => Number(b.luas_panen) - Number(a.luas_panen))
    const luasTertinggi = sortedLuas[0]

    return {
      totalProduksi,
      kabKotaAktif,
      rataProduktivitas,
      top5: sorted.slice(0, 5),
      tertinggi: sorted[0],
      luasTertinggi,
    }
  }, [rows])

  // ── Dynamic top lumbung data
  const dynamicLumbungData = useMemo(() => {
    return [...rows]
      .filter((r) => Number(r.produksi ?? 0) > 0)
      .map((r) => ({
        nama_wilayah: r.nama_wilayah,
        total_produksi: Number(r.produksi ?? 0),
      }))
      .sort((a, b) => b.total_produksi - a.total_produksi)
      .slice(0, 7) // Pemotongan (LIMIT) dipindahkan ke sini karena dihapus dari komponen Chart
  }, [rows])


  return (
    <SidebarProvider>
      <AppSidebar variant="sidebar" />

      <SidebarInset>
        <div className="flex flex-1 flex-col overflow-auto bg-slate-50 bg-[linear-gradient(to_right,rgba(55,65,81,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(55,65,81,0.07)_1px,transparent_1px)] bg-[size:40px_40px]">
          <div className="mx-auto w-full max-w-screen-xl flex flex-col gap-3 px-4 py-3 lg:px-6">

            {/* ══════════════════ HEADER ══════════════════ */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#2E7D32] text-white shadow-sm">
                  <LucideSprout className="size-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold leading-tight text-slate-800">
                    Dashboard Produktivitas Kedelai di Jawa Timur
                  </h1>
                  <p className="text-md text-muted-foreground">
                    Analisis Produktivitas Kedelai Berdasarkan Laporan Data Dinas Pertanian dan Ketahanan Pangan Jawa Timur dan Siskaperbapo Jawa Timur
                  </p>
                </div>
              </div>

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

            {/* ══════════════════ LEVEL 1 — KPI CARDS ══════════════════ */}
            <section aria-label="Indikator Utama">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => <Pulse key={i} className="h-24" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <KpiCard
                    title="Total Produksi"
                    value={`${formatNumber(metrics.totalProduksi)} ton`}
                    sub={`${metrics.kabKotaAktif} kab/kota aktif`}
                    icon={<Activity className="size-5" />}
                    variant="sky"
                  />

                  <KpiCard
                    title="Rata-rata Produktivitas"
                    value={`${formatNumber(metrics.rataProduktivitas)} ku/ha`}
                    sub="Rata-rata produktivitas daerah"
                    icon={<TrendingUp className="size-5" />}
                    variant="lime"
                  />

                  <KpiCard
                    title="Produktivitas Tertinggi"
                    value={metrics.tertinggi ? `${formatNumber(metrics.tertinggi.produktivitas)} ku/ha` : "—"}
                    sub={metrics.tertinggi?.nama_wilayah ?? "Tidak ada data"}
                    icon={<MapPinned />}
                    variant="amber"
                  />

                  <KpiCard
                    title="Luas Panen Tertinggi"
                    value={
                      metrics.luasTertinggi
                        ? `${formatNumber(metrics.luasTertinggi.luas_panen)} ha`
                        : "—"
                    }
                    sub={metrics.luasTertinggi?.nama_wilayah ?? "Tidak ada data"}
                    icon={<Layers />}
                    variant="carrot"
                  />
                </div>
              )}
            </section>

            {/* ══════════════════ WRAPPER BARIS 2 & 3 ══════════════════ */}
            <div className="flex flex-col gap-3">

              {/* ══════════════════ BARIS KEDUA (Layout Grid 3:2) ══════════════════ */}
              <section aria-label="Analisis Grafis Atas" className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                <div className="lg:col-span-3">
                  <ChartTrenPerforma data={chart2Data} isLoading={chartsLoading} />
                </div>

                <div className="lg:col-span-2">
                  <ChartLumbungKedelai
                    data={dynamicLumbungData}
                    isLoading={loading}
                    selectedYear={selectedYear}
                  />
                </div>
              </section>

              {/* ══════════════════ BARIS KETIGA (Layout Grid 2:3) ══════════════════ */}
              <section aria-label="Analisis Grafis Bawah" className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                <div className="lg:col-span-2">
                  {/* Memasukkan props 'data' dari Supabase alih-alih angka manual */}
                  <ChartRasioLahanPie
                    data={rasioLahanData}
                    isLoading={loading}
                    selectedYear={selectedYear}
                  />
                </div>

                <div className="lg:col-span-3">
                  <ChartTrenKebutuhanPupuk
                    data={chartPupukData}
                    isLoading={chartsLoading}
                  />
                </div>
              </section>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}