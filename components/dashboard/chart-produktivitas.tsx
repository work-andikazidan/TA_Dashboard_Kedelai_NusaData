"use client"

import * as React from "react"
import { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Label,
  Area,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// ─── Shared Styles ──────────────────────────────────────────────────────────
const tooltipStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.98)",
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  fontSize: 11,
  padding: "8px 12px",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
}

const formatValue = (v: number) => v.toLocaleString("id-ID", { maximumFractionDigits: 2 })

// ─── 1. Chart No. 2: Line Chart (Tren Performa Kedelai Jatim) ────────────────
export type TrendPerformaData = {
  tahun: number
  total_produksi_jatim: number
  rata_rata_produktivitas_jatim: number
}

interface ChartTrenPerformaProps {
  data: TrendPerformaData[]
  isLoading?: boolean
}

export function ChartTrenPerforma({ data, isLoading }: ChartTrenPerformaProps) {
  // Hanya memastikan urutan tahun dari kecil ke besar
  const sorted = useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    return [...data].sort((a, b) => a.tahun - b.tahun)
  }, [data])

  return (
    <Card className="border border-border/80 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full bg-white">
      <CardHeader className="pb-0 px-5 pt-0">
        <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-600" />
          Produktivitas Kedelai Tiap Tahun
        </CardTitle>
        <CardDescription className="text-xs font-semibold text-muted-foreground leading-tight">
          Perkembangan total produksi (ton) &amp; rata-rata produktivitas (ku/ha) dari tahun ke tahun
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-0 flex-1 mt-1">
        {isLoading || sorted.length === 0 ? (
          <div className="flex h-[190px] items-center justify-center">
            {isLoading ? (
              <div className="size-6 rounded-full border-2 border-emerald-600/30 border-t-emerald-600 animate-spin" />
            ) : (
              <p className="text-xs text-muted-foreground font-medium">Belum ada data tren.</p>
            )}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={190}>
            <ComposedChart data={sorted} margin={{ top: 5, right: 10, left: -10, bottom: -5 }}>
              <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" strokeOpacity={0.6} />
              <XAxis
                dataKey="tahun"
                tick={{ fontSize: 11, fill: "#475569", fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                tick={{ fontSize: 10, fill: "#475569" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                width={40}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={["auto", "auto"]}
                tick={{ fontSize: 10, fill: "#475569" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => Number(v).toFixed(1)}
                width={35}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(l) => `Tahun ${l}`}
                formatter={(value: any, name?: any) => {
                  if (name && String(name).includes("Produksi")) return [`${formatValue(Number(value))} ton`, "Total Produksi"]
                  return [`${formatValue(Number(value))} ku/ha`, "Rata-rata Produktivitas"]
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ fontSize: "10px", paddingBottom: "8px", right: 10 }}
                iconType="circle"
                iconSize={8}
              />
              <Area
                yAxisId="left"
                dataKey="total_produksi_jatim"
                name="Total Produksi (Ton)"
                type="monotone"
                stroke="#2E7D32"     
                strokeWidth={3}      
                dot={{ r: 4, fill: "#2E7D32", strokeWidth: 0, fillOpacity: 1 }}
                activeDot={{ r: 6, strokeWidth: 1.5, stroke: "#ffffff", fillOpacity: 1 }}
                fill="#2E7D32"       
                fillOpacity={0.25}    
              />
              <Line
                yAxisId="right"
                dataKey="rata_rata_produktivitas_jatim"
                name="Produktivitas (ku/ha)"
                type="monotone"
                stroke="#F57C00"
                strokeWidth={3}
                dot={{ r: 4, fill: "#F57C00", strokeWidth: 0}}
                activeDot={{ r: 6, strokeWidth: 1.5, stroke: "#ffffff" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

// ─── 2. Chart No. 3: Bar Chart (Lumbung Kedelai Tertinggi - Dynamic) ────────
export type LumbungData = {
  nama_wilayah: string
  total_produksi: number
}

interface ChartLumbungKedelaiProps {
  data: LumbungData[]
  isLoading?: boolean
  selectedYear?: string
}

export function ChartLumbungKedelai({ data, isLoading, selectedYear }: ChartLumbungKedelaiProps) {
  // Hanya sorting, tidak perlu .slice() jika database view sudah menggunakan LIMIT
  const sorted = useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    return [...data].sort((a, b) => b.total_produksi - a.total_produksi)
  }, [data])

  return (
    <Card className="border border-border/80 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full bg-white">
      <CardHeader className="pb-0 px-5 pt-0">
        <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-600" />
          Penghasil Kedelai Terbesar
        </CardTitle>
        <CardDescription className="text-xs font-semibold text-muted-foreground leading-tight">
          Kabupaten/kota penghasil volume kedelai terbesar (ton) {selectedYear ? `· Tahun ${selectedYear}` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-0 flex-1 mt-1">
        {isLoading || sorted.length === 0 ? (
          <div className="flex h-[190px] items-center justify-center">
            {isLoading ? (
              <div className="size-6 rounded-full border-2 border-emerald-600/30 border-t-emerald-600 animate-spin" />
            ) : (
              <p className="text-xs text-muted-foreground font-medium">Belum ada data lumbung untuk tahun ini.</p>
            )}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={190}>
            <BarChart
              layout="vertical"
              data={sorted}
              margin={{ top: 0, right: 40, left: 10, bottom: 0 }}
              barGap="20%"
              barCategoryGap="25%"
            >
              <CartesianGrid horizontal={false} vertical={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="nama_wilayah"
                tick={{ fontSize: 10, fill: "#334155", fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                width={60}
                tickFormatter={(v: string) => v.replace("Kabupaten ", "Kab. ").replace("Kota ", "")}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(val) => [`${formatValue(Number(val))} ton`, "Total Produksi"]}
              />
              <Bar dataKey="total_produksi" radius={[0, 6, 6, 0]} barSize={16}>
                {sorted.map((entry, index) => {
                  const color = index < 3 ? "#2E7D32" : "#A5D6A7"
                  return <Cell key={`cell-${index}`} fill={color} />
                })}
                <LabelList
                  dataKey="total_produksi"
                  position="right"
                  formatter={(v: any) => `${formatValue(Number(v))} ton`}
                  style={{ fontSize: 9.5, fill: "#475569", fontWeight: 600 }}
                  offset={10}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

// ─── 3. Chart No. 4: Pie Chart (Rasio Pemanfaatan Lahan - Dynamic) ──────────
export type RasioLahanData = {
  tahun: number
  total_luas_lahan: number
  total_luas_tanam: number
  persentase_pemanfaatan: number
}

interface ChartRasioLahanPieProps {
  data: RasioLahanData[] // Menerima array dari tabel dash_rasio_lahan_tanam
  isLoading?: boolean
  selectedYear?: string
}

export function ChartRasioLahanPie({ data, isLoading, selectedYear }: ChartRasioLahanPieProps) {
  // Mengekstrak data tunggal dari array (biasanya dikirim 1 baris saja jika di-filter per tahun)
  const chartData = data && data.length > 0 ? data[0] : null
  const luasLahan = chartData ? Number(chartData.total_luas_lahan) : 0
  const luasTanam = chartData ? Number(chartData.total_luas_tanam) : 0
  const persentase = chartData ? Number(chartData.persentase_pemanfaatan) : 0

  const pieData = useMemo(() => {
    if (luasLahan <= 0) return []
    const planted = luasTanam
    const uncultivated = Math.max(0, luasLahan - luasTanam)

    return [
      { name: "Lahan Lainnya", value: uncultivated, color: "#ff8e15" },
      { name: "Lahan Tanam Kedelai", value: planted, color: "#2E7D32" },
    ]
  }, [luasLahan, luasTanam])

  return (
    <Card className="border border-border/80 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full bg-white">
      <CardHeader className="px-5 pb-0 pt-0">
        <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-600" />
          Rasio Pemanfaatan Lahan
        </CardTitle>
        <CardDescription className="text-xs font-semibold text-muted-foreground leading-tight">
          Perbandingan area tertanam terhadap total lahan potensial {selectedYear ? `· Tahun ${selectedYear}` : ""}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-5 pb-0 flex-1 flex flex-col">
        {isLoading || !chartData || luasLahan <= 0 ? (
          <div className="flex h-[190px] items-center justify-center">
            {isLoading ? (
              <div className="size-6 rounded-full border-2 border-emerald-600/30 border-t-emerald-600 animate-spin" />
            ) : (
              <p className="text-xs text-muted-foreground font-medium">Belum ada data pemanfaatan lahan untuk tahun ini.</p>
            )}
          </div>
        ) : (
          <>
            <div className="flex justify-between items-end mb-2 pt-0 border-b border-slate-100 pb-0">
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                  Total Lahan
                </span>
                <span className="text-2xl font-black text-slate-800 leading-none">
                  {formatValue(luasLahan)} <span className="text-sm font-medium text-slate-500">Ha</span>
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[11px] uppercase tracking-wider text-emerald-700/80 font-semibold mb-1">
                  Total Tanam
                </span>
                <span className="text-2xl font-black text-emerald-700 leading-none">
                  {formatValue(Math.round(luasTanam))} <span className="text-sm font-medium text-emerald-600/70">Ha</span>
                </span>
              </div>
            </div>

            <div className="w-full h-[190px] relative flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%" 
                    innerRadius={50} 
                    outerRadius={75} 
                    paddingAngle={2}
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    <Label
                      value={`${persentase.toFixed(1)}%`} // Diambil langsung dari DB
                      position="center"
                      dy={-4} 
                      style={{ fontSize: "22px", fontWeight: "900", fill: "#064e3b", fontFamily: "inherit" }} 
                    />
                    <Label
                      value="TERTANAM"
                      position="center"
                      dy={14} 
                      style={{ fontSize: "10px", fontWeight: "700", fill: "#64748b", letterSpacing: "0.05em", fontFamily: "inherit" }}
                    />
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: any, name?: any) => {
                      const pct = luasLahan > 0 ? ((Number(value) / luasLahan) * 100).toFixed(0) : "0"
                      return [`${formatValue(Number(value))} Ha (${pct}%)`, String(name ?? "")]
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    layout="horizontal"
                    wrapperStyle={{ fontSize: "10.5px", bottom: 0 }} 
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ─── 4. Chart No. 6: Bar Chart (Tren Rata-rata Harga Pupuk) ──────────────────────
export type TrenKebutuhanPupukData = {
  tahun: number
  harga_pupuk_organik: number       
  harga_pupuk_npk: number   
}

interface ChartTrenKebutuhanPupukProps {
  data: TrenKebutuhanPupukData[]
  isLoading?: boolean
}

export function ChartTrenKebutuhanPupuk({ data, isLoading }: ChartTrenKebutuhanPupukProps) {
  // Karena data dari vw_rerata_harga_pupuk sudah matang (langsung se-Jatim per tahun)
  // Tidak perlu lagi fungsi reduce. Kita hanya perlu sorting tahun.
  const aggregatedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    return [...data].sort((a, b) => a.tahun - b.tahun)
  }, [data])

  return (
    <Card className="border border-border/80 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full bg-white">
      <CardHeader className="pb-0 px-5 pt-0">
        <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-600" />
          Tren Rata-rata Harga Pupuk (Rp)
        </CardTitle>
        <CardDescription className="text-xs font-semibold text-muted-foreground leading-tight">
          Perbandingan rata-rata harga pupuk NPK dan Organik di Jawa Timur dari tahun ke tahun
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-0 flex-1 mt-1">
        {isLoading || aggregatedData.length === 0 ? (
          <div className="flex h-[190px] items-center justify-center">
            {isLoading ? (
              <div className="size-6 rounded-full border-2 border-emerald-600/30 border-t-emerald-600 animate-spin" />
            ) : (
              <p className="text-xs text-muted-foreground font-medium">Belum ada data pupuk.</p>
            )}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={190}>
            {/* Margin Top dibesarkan agar Label atas tidak terpotong */}
            <BarChart data={aggregatedData} margin={{ top: 20, right: 10, left: 5, bottom: -5 }}>
              <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" strokeOpacity={0.6} />
              <XAxis
                dataKey="tahun"
                tick={{ fontSize: 11, fill: "#475569", fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                // Membesarkan batas domain atas (1.15) agar ada ruang tambahan untuk label di ujung bar
                domain={[0, (dataMax: number) => dataMax * 1.15]}
                tick={{ fontSize: 10, fill: "#475569" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v >= 1000 ? `Rp ${(v / 1000).toFixed(0)}k` : `Rp ${v}`)}
                width={65}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(l) => `Tahun ${l}`}
                formatter={(value: any, name?: any) => {
                  return [`Rp ${formatValue(Number(value))}`, String(name)]
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ fontSize: "10px", paddingBottom: "8px", right: 10 }}
                iconType="circle"
                iconSize={8}
              />
              
              {/* Bar Chart untuk NPK */}
              <Bar
                dataKey="harga_pupuk_npk" // Langsung mapping dari DB
                name="Harga NPK"
                fill="#F57C00"
                radius={[4, 4, 0, 0]}
                barSize={20}
              >
                <LabelList
                  dataKey="harga_pupuk_npk"
                  position="top"
                  formatter={(v: any) => `[${(Number(v) / 1000).toFixed(1)}k]`}
                  style={{ fontSize: 8, fill: "#F57C00", fontWeight: 700 }}
                />
              </Bar>

              {/* Bar Chart untuk Organik */}
              <Bar
                dataKey="harga_pupuk_organik" // Langsung mapping dari DB
                name="Harga Organik"
                fill="#2E7D32"
                radius={[4, 4, 0, 0]}
                barSize={20}
              >
                <LabelList
                  dataKey="harga_pupuk_organik"
                  position="top"
                  formatter={(v: any) => `[${(Number(v) / 1000).toFixed(0)}k]`}
                  style={{ fontSize: 9.5, fill: "#2E7D32", fontWeight: 700 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}