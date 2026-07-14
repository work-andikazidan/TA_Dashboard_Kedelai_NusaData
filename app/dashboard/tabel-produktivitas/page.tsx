"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Grid2x2Check } from "lucide-react"

import { supabase } from "@/lib/supabase"
import { AppSidebar } from "@/components/app-sidebar"
import { DetailedTable } from "@/components/dashboard/detailed-table"
import type { DashboardProduksiTahunan } from "@/types/dashboard"

import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

const DEFAULT_KOMODITAS_ID = 33

export default function TabelProduktivitasPage() {
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
                  <Grid2x2Check className="size-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold leading-tight text-slate-800">
                    Tabel Data Produktivitas Kedelai Jawa Timur
                  </h1>
                  <p className="text-md text-muted-foreground">
                    Rincian data granular produktivitas, luas lahan, luas tanam, luas panen, dan volume produksi kedelai di Jawa Timur
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

            {/* ══════════════════ DETAILED TABLE CONTAINER ══════════════════ */}
            <section aria-label="Detail Granular Kabupaten/Kota" className="flex flex-col gap-6">
              <Card className="border border-border/80 shadow-sm p-4 bg-white">
                <div className="flex flex-col gap-0.5 mb-2">
                  <h2 className="text-base font-bold text-foreground">Detail Data Produktivitas Kabupaten/Kota</h2>
                  <p className="text-xs text-muted-foreground">
                    Semua wilayah kabupaten/kota di Jawa Timur untuk komoditas kedelai lokal tahun {selectedYear}
                  </p>
                </div>
                <DetailedTable rows={rows} isLoading={loading} />
              </Card>
            </section>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}