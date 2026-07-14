"use client"

import * as React from "react"
import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  LabelList,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const tooltipStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.98)",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  fontSize: 11,
  padding: "10px 14px",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
}

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val)
}

// ─── 1. AREA CHART: Tren Harga Provinsi Jatim (Data Bulanan) ────────────────────────
export type TrenProvinsiData = {
  tahun: number
  bulan: number
  nama_bulan: string
  label_waktu: string
  rata_rata_provinsi: number
}

interface ChartTrenProvinsiProps {
  data: TrenProvinsiData[]
  isLoading?: boolean
}

export function ChartTrenProvinsi({ data, isLoading }: ChartTrenProvinsiProps) {
  // Memastikan urutan kronologis berdasarkan tahun dan bulan
  const sorted = useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    return [...data].sort((a, b) => {
      if (a.tahun !== b.tahun) return a.tahun - b.tahun
      return a.bulan - b.bulan
    })
  }, [data])

  // Menentukan titik (ticks) sumbu X khusus di awal kuartal (Bulan 1, 4, 7, 10)
  const quarterTicks = useMemo(() => {
    return sorted
      .filter((item) => [1, 4, 7, 10].includes(item.bulan))
      .map((item) => item.label_waktu)
  }, [sorted])

  return (
    <Card className="border border-border/80 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full bg-white">
      <CardHeader className="pb-0 px-5 pt-0">
        <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-600" />
          Tren Rata-rata Harga Kedelai Provinsi
          <sub className="text-sm font-semibold">(Rp/kg)</sub>
        </CardTitle>
        <CardDescription className="text-xs font-semibold text-muted-foreground leading-tight">
          Pergerakan rata-rata harga kedelai tingkat Provinsi Jawa Timur
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-0 flex-1 mt-1">
        {isLoading || sorted.length === 0 ? (
          <div className="flex h-[190px] items-center justify-center">
            {isLoading ? (
              <div className="size-6 rounded-full border-2 border-emerald-600/30 border-t-emerald-600 animate-spin" />
            ) : (
              <p className="text-xs text-muted-foreground font-medium">Belum ada data tren harga.</p>
            )}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={sorted} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
              <CartesianGrid vertical={true} horizontal={true} stroke="#e2e8f0" strokeDasharray="5 5" />
              <XAxis
                dataKey="label_waktu"
                ticks={quarterTicks}
                tickFormatter={(val) => {
                  const parts = val.split(" ")
                  const month = parts[0]
                  const year = parts[1]
                  if (month === "Januari") return `Q1 ${year}`
                  if (month === "April") return `Q2 ${year}`
                  if (month === "Juli") return `Q3 ${year}`
                  if (month === "Oktober") return `Q4 ${year}`
                  return val
                }}
                tick={{ fontSize: 9, fill: "#64748b", fontWeight: 700 }}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                domain={["dataMin - 500", "dataMax + 500"]}
                tick={{ fontSize: 9, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `Rp ${(v / 1000).toFixed(0)}k`}
                width={50}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(val) => [formatRupiah(Number(val)), "Rata-rata Bulanan"]}
                labelFormatter={(label) => <span className="font-bold text-slate-700">{label}</span>}
              />
              <Area
                dataKey="rata_rata_provinsi"
                name="Rata-rata Harga"
                type="monotone"
                stroke="#059669"
                strokeWidth={3}
                fill="#10b981"
                fillOpacity={0.15}
                dot={{ r: 3, fill: "#059669", fillOpacity: 1, strokeWidth: 0 }}
                activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 1.5, fill: "#059669" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

// ─── 2. HORIZONTAL BAR CHART: Top 5 Termurah (Kantong Suplai) ────────
export type Top5TermurahData = {
  tahun: number
  nama_wilayah: string
  harga_terkini: number
}

interface ChartTop5TermurahProps {
  data: Top5TermurahData[]
  isLoading?: boolean
}

export function ChartTop5Termurah({ data, isLoading }: ChartTop5TermurahProps) {
  // Mengurutkan dan memotong 5 teratas dari data (harga termurah ke tertinggi)
  const sorted = useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    return [...data].sort((a, b) => a.harga_terkini - b.harga_terkini).slice(0, 5)
  }, [data])

  // Menentukan batas bawah sumbu X secara dinamis agar selisih harga terlihat jelas.
  // Diberi jarak (padding) Rp 200 dari harga termurah agar bar pertama tetap memiliki panjang.
  const minPrice = sorted.length > 0 ? sorted[0].harga_terkini : 0
  const xDomainMin = Math.max(0, minPrice - 200)

  return (
    <Card className="border border-border/80 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full bg-white">
      <CardHeader className="pb-0 px-5 pt-0">
        <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <span className="size-2 rounded-full bg-amber-500" />
          Top 5 Daerah Harga Terendah
          <sub className="text-sm font-semibold">(Rp/kg)</sub>
        </CardTitle>
        <CardDescription className="text-xs font-semibold text-muted-foreground leading-tight">
          Kantong pasokan kedelai lokal dengan harga terendah di Jawa Timur saat ini
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-0 flex-1 mt-1">
        {isLoading || sorted.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center">
            {isLoading ? (
              <div className="size-6 rounded-full border-2 border-amber-600/30 border-t-amber-600 animate-spin" />
            ) : (
              <p className="text-xs text-muted-foreground font-medium">Belum ada data harga termurah.</p>
            )}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              layout="vertical"
              data={sorted}
              // Margin disesuaikan agar label sumbu Y dan angka di ujung bar tidak terpotong
              margin={{ top: 10, right: 60, left: 10, bottom: 20 }}
              barSize={18}
            >
              <CartesianGrid horizontal={true} vertical={true} stroke="#f1f5f9" strokeDasharray="3 3" />

              {/* Sumbu X dimunculkan dan diberi label */}
              <XAxis
                type="number"
                domain={[xDomainMin, 'dataMax + 200']}
                tick={{ fontSize: 9, fill: "#64748b" }}
                tickFormatter={(v) => `Rp ${(v / 1000).toFixed(0)}k`}
                label={{
                  value: "Harga (Rupiah)",
                  position: "insideBottom",
                  offset: -15,
                  style: { fontSize: 10, fontWeight: 600, fill: "#475569" }
                }}
              />

              {/* Sumbu Y diberi label */}
              <YAxis
                type="category"
                dataKey="nama_wilayah"
                tick={{ fontSize: 9, fill: "#334155", fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                width={85}
                tickFormatter={(v: string) => v.replace("Kabupaten ", "Kab. ").replace("Kota ", "")}
                label={{
                  value: "Wilayah",
                  angle: -90,
                  position: "insideLeft",
                  offset: -5,
                  style: { fontSize: 10, fontWeight: 600, fill: "#475569" }
                }}
              />

              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(val) => [formatRupiah(Number(val)), "Harga Terkini"]}
                cursor={{ fill: "#f8fafc" }}
              />

              <Bar dataKey="harga_terkini" radius={[0, 6, 6, 0]}>
                {/* Menampilkan angka harga langsung di sebelah kanan bar */}
                <LabelList
                  dataKey="harga_terkini"
                  position="right"
                  // Perbaikan: Ubah tipe val menjadi any, lalu konversi ke Number
                  formatter={(val: any) => formatRupiah(Number(val))}
                  style={{ fontSize: 10, fontWeight: 700, fill: "#334155" }}
                />
                {sorted.map((entry, index) => {
                  // Warna hijau paling pekat/gelap untuk yang paling murah (peringkat 1)
                  const colors = ["#780404", "#960505", "#b91010", "#d33434", "#e76e6e"]
                  return <Cell key={`cell-${index}`} fill={colors[index] || "#059669"} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

// ─── 3. BULLET BAR CHART: Evaluasi HAP (Harga Acuan Pemerintah) ────────
export type BulletHapData = {
  tahun: number
  kode_wilayah: string
  nama_wilayah: string
  harga_terkini: number // Diperbarui dari harga_rata_tahunan agar match dengan data API
  harga_acuan_pemerintah: number
  selisih: number
  status_kebijakan: string
}

interface ChartBulletHapProps {
  data: BulletHapData[]
  isLoading?: boolean
}

export function ChartBulletHap({ data, isLoading }: ChartBulletHapProps) {
  const [filterType, setFilterType] = useState<"all" | "below" | "above">("all")

  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return []

    // 1. Memperbaiki Sorting: Menggunakan harga_terkini (Ascending: Murah ke Tinggi)
    let list = [...data].sort((a, b) => a.harga_terkini - b.harga_terkini)

    // 2. Memperbaiki Filter: Menyelaraskan key ke harga_terkini
    if (filterType === "below") {
      list = list.filter((item) => item.harga_terkini < 11000)
    } else if (filterType === "above") {
      list = list.filter((item) => item.harga_terkini >= 11000)
    }

    // 3. Menghapus .slice(0, 16) agar seluruh wilayah/kota ditampilkan
    return list
  }, [data, filterType])

  return (
    <Card className="border border-border/80 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full bg-white">
      <CardHeader className="pb-0 px-5 pt-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span className="size-2 rounded-full bg-indigo-600" />
            Evaluasi Kebijakan Pelindungan
          </CardTitle>
          <CardDescription className="text-xs font-semibold text-muted-foreground leading-tight">
            Perbandingan rata-rata harga tahunan terhadap Harga Acuan Pemerintah (HAP Rp11.000)
          </CardDescription>
        </div>

        <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
          <SelectTrigger className="h-8 w-44 text-[10px] bg-slate-50 border-slate-200 font-semibold focus:ring-emerald-500 rounded-lg">
            <SelectValue placeholder="Pilih Filter..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[10px]">Semua Wilayah</SelectItem>
            <SelectItem value="below" className="text-[10px]">Di Bawah HAP (&lt; Rp11k)</SelectItem>
            <SelectItem value="above" className="text-[10px]">Di Atas HAP (&ge; Rp11k)</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="px-2 pb-0 flex-1 mt-1">
        {isLoading || processedData.length === 0 ? (
          <div className="flex h-[190px] items-center justify-center">
            {isLoading ? (
              <div className="size-6 rounded-full border-2 border-indigo-600/30 border-t-indigo-600 animate-spin" />
            ) : (
              <p className="text-xs text-muted-foreground font-medium">Tidak ada data untuk filter ini.</p>
            )}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={190}>
            <BarChart
              data={processedData}
              margin={{ top: 15, right: 10, left: -5, bottom: 10 }}
              barSize={24}
            >
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="nama_wilayah"
                tick={{ fontSize: 8, fill: "#475569", fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: string) => v.replace("Kabupaten ", "Kab. ").replace("Kota ", "")}
                interval={0} // Memaksa Recharts menampilkan semua label kota tanpa skip
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis
                domain={[0, 18000]}
                tick={{ fontSize: 9, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `Rp ${(v / 1000).toFixed(0)}k`}
                width={50}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(val, name, props) => {
                  if (name === "harga_terkini") {
                    return [
                      <div key="details" className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-800">{formatRupiah(Number(val))}</span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Selisih HAP: <strong className={props.payload.selisih >= 0 ? "text-emerald-600" : "text-rose-600"}>
                            {props.payload.selisih >= 0 ? "+" : ""}{formatRupiah(props.payload.selisih)}
                          </strong>
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Status: <strong className="text-slate-600">{props.payload.status_kebijakan}</strong>
                        </span>
                      </div>,
                      "Rata-rata Harga"
                    ]
                  }
                  return [formatRupiah(Number(val)), "HAP"]
                }}
              />

              <ReferenceLine
                y={11000}
                stroke="#e11d48"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: "HAP Rp11.000",
                  position: "top",
                  fill: "#e11d48",
                  fontSize: 9,
                  fontWeight: 700,
                  offset: 4,
                }}
              />

              <Bar dataKey="harga_terkini" radius={[4, 4, 0, 0]}>
                {processedData.map((entry, index) => {
                  const price = entry.harga_terkini
                  const color = price < 11000
                    ? "#f43f5e"
                    : price <= 12000
                      ? "#fbbf24"
                      : "#10b981"
                  return <Cell key={`cell-${index}`} fill={color} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}