"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { MapPinned } from "lucide-react"

import { supabase } from "@/lib/supabase"
import { AppSidebar } from "@/components/app-sidebar"
import type { DashboardProduksiTahunan } from "@/types/dashboard"

import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

// Memuat komponen Peta Leaflet secara dinamis (Bypass SSR)
const MapJatimDynamic = dynamic(
  () => import("@/components/dashboard/map-jatim"),
  { 
    ssr: false, 
    loading: () => <Pulse className="h-[550px] w-full" /> 
  }
)

const DEFAULT_KOMODITAS_ID = 33

function Pulse({ className }: { className?: string }) {
  return <div className={["animate-pulse rounded-lg bg-slate-200/80", className].join(" ")} />
}

export default function PetaProduktivitasPage() {
  const [rows, setRows] = useState<DashboardProduksiTahunan[]>([])
  const [years, setYears] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [loading, setLoading] = useState(true)

  // Fetch available years
  useEffect(() => {
    async function fetchYears() {
      const { data, error } = await supabase
        .from("dashboard_produktivitas_tahunan_jatim")
        .select("tahun")
        .eq("komoditas_id", DEFAULT_KOMODITAS_ID)
        .order("tahun", { ascending: false })
      if (error) { console.error(error); setLoading(false); return }
      const unique = Array.from(new Set((data ?? []).map((r: { tahun: number }) => r.tahun))).sort((a, b) => b - a)
      setYears(unique)
      if (unique.length > 0) setSelectedYear(String(unique[0]))
    }
    fetchYears()
  }, [])

  // Fetch selected-year rows
  useEffect(() => {
    if (!selectedYear) return
    setLoading(true)
    supabase
      .from("dashboard_produktivitas_tahunan_jatim")
      .select("*")
      .eq("tahun", Number(selectedYear))
      .eq("komoditas_id", DEFAULT_KOMODITAS_ID)
      .then(({ data, error }) => {
        if (!error) setRows((data ?? []) as DashboardProduksiTahunan[])
        setLoading(false)
      })
  }, [selectedYear])

  const mapData = rows.map((r) => ({
    nama: r.nama_wilayah,
    produksi: Number(r.produksi ?? 0),
  }))

  return (
    <SidebarProvider>
      <AppSidebar variant="sidebar" />

      <SidebarInset>
        <div className="flex flex-1 flex-col overflow-auto bg-slate-50 bg-[linear-gradient(to_right,rgba(55,65,81,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(55,65,81,0.07)_1px,transparent_1px)] bg-[size:40px_40px]">
          <div className="mx-auto w-full max-w-screen-xl flex flex-col gap-4 px-4 py-4 lg:px-6">

            {/* ══════════════════ HEADER ══════════════════ */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#2E7D32] text-white shadow-sm">
                  <MapPinned className="size-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold leading-tight text-slate-800">
                    Peta Persebaran Produktivitas Kedelai Jawa Timur
                  </h1>
                  <p className="text-md text-muted-foreground">
                    Visualisasi spasial sebaran volume produksi kedelai berdasarkan wilayah kabupaten/kota di Jawa Timur
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

            {/* ══════════════════ MAP CONTAINER ══════════════════ */}
            <section aria-label="Peta Produksi Kabupaten/Kota" className="w-full flex-1 flex flex-col">
              <div className="bg-gradient-to-tr from-emerald-500/10 via-green-500/5 to-transparent p-[1.5px] rounded-3xl shadow-[0_20px_50px_rgba(46,125,50,0.04)]">
                <div className="bg-white/95 backdrop-blur-md rounded-[23px] p-5 flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                        <span className="relative flex size-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500"></span>
                        </span>
                        Peta Interaktif Sebaran Produksi
                      </h2>
                      <p className="text-xs text-slate-500">
                        Arahkan kursor ke wilayah kabupaten/kota untuk melihat detail volume produksi · Tahun <span className="font-semibold text-emerald-700">{selectedYear}</span>
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
                      Choropleth Spasial
                    </span>
                  </div>

                  <div className="w-full relative rounded-2xl overflow-hidden">
                    <MapJatimDynamic 
                      data={loading ? [] : mapData} 
                      isLoading={loading} 
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