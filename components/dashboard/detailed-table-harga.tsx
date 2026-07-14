"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Coins, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface DetailedTableHargaProps {
  rows: {
    kode_wilayah: string
    nama_wilayah: string
    harga_terkini: number
    tahun?: number
    bulan?: number
  }[]
  isLoading?: boolean
}

type SortKey = "nama_wilayah" | "harga_terkini" | "selisih"
type SortOrder = "asc" | "desc"

const MEDALS = ["🥇", "🥈", "🥉"]

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val)
}

export function DetailedTableHarga({ rows, isLoading }: DetailedTableHargaProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("harga_terkini")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Reset page when search term changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Calculate ranks and HAP deviation based on input rows
  const preparedRows = useMemo(() => {
    // Sort all rows by price descending first to assign absolute ranks
    const sortedForRank = [...rows].sort((a, b) => Number(b.harga_terkini ?? 0) - Number(a.harga_terkini ?? 0))
    return rows.map(row => {
      const rankIndex = sortedForRank.findIndex(r => r.kode_wilayah === row.kode_wilayah)
      const selisih = Number(row.harga_terkini ?? 0) - 11000 // HAP is 11,000

      let status = "Aman - Menguntungkan Petani"
      if (row.harga_terkini < 10500) {
        status = "Kritis - Butuh Serapan Bulog"
      } else if (row.harga_terkini < 11000) {
        status = "Rentan"
      }

      return {
        ...row,
        rank: rankIndex !== -1 ? rankIndex + 1 : 999,
        selisih,
        status,
      }
    })
  }, [rows])

  // Filter rows by search term
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return preparedRows
    const term = searchTerm.toLowerCase()
    return preparedRows.filter(r => r.nama_wilayah.toLowerCase().includes(term))
  }, [preparedRows, searchTerm])

  // Sort filtered rows
  const sortedRows = useMemo(() => {
    if (!sortKey) return filteredRows

    return [...filteredRows].sort((a, b) => {
      let aVal = a[sortKey]
      let bVal = b[sortKey]

      if (sortKey === "nama_wilayah") {
        const strA = String(aVal ?? "").toLowerCase()
        const strB = String(bVal ?? "").toLowerCase()
        return sortOrder === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA)
      } else {
        const numA = Number(aVal ?? 0)
        const numB = Number(bVal ?? 0)
        return sortOrder === "asc" ? numA - numB : numB - numA
      }
    })
  }, [filteredRows, sortKey, sortOrder])

  // Paginate sorted rows
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedRows.slice(startIndex, startIndex + pageSize)
  }, [sortedRows, currentPage, pageSize])

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize))

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortOrder(key === "nama_wilayah" ? "asc" : "desc")
    }
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const startEntryIndex = sortedRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endEntryIndex = Math.min(currentPage * pageSize, sortedRows.length)

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Table controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari Kabupaten/Kota..."
            className="pl-9 h-9 text-xs border-slate-200 focus-visible:ring-emerald-500 bg-slate-50/50 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <span>Tampilkan</span>
          <select
            className="h-8 rounded-lg border border-slate-200 px-2 py-0.5 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
          >
            {[10, 20, 38].map(size => (
              <option key={size} value={size}>
                {size === 38 ? "Semua (38)" : `${size} baris`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-5 py-4 w-20 text-center">Peringkat</th>
                <th className="px-5 py-4 min-w-[200px]">
                  <button
                    onClick={() => handleSort("nama_wilayah")}
                    className="flex items-center gap-1 hover:text-slate-800 font-bold"
                  >
                    Nama Wilayah
                    <ArrowUpDown className="size-3 text-slate-400" />
                  </button>
                </th>
                <th className="px-5 py-4 text-right">
                  <button
                    onClick={() => handleSort("harga_terkini")}
                    className="flex items-center gap-1 hover:text-slate-800 ml-auto font-bold"
                  >
                    Harga Kedelai
                    <ArrowUpDown className="size-3 text-slate-400" />
                  </button>
                </th>
                <th className="px-5 py-4 text-right">
                  <button
                    onClick={() => handleSort("selisih")}
                    className="flex items-center gap-1 hover:text-slate-800 ml-auto font-bold"
                  >
                    Deviasi HAP (Rp11.000)
                    <ArrowUpDown className="size-3 text-slate-400" />
                  </button>
                </th>
                <th className="px-5 py-4 text-center font-bold min-w-[180px]">Status Kebijakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-8 mx-auto" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-36" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-16 ml-auto" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-16 ml-auto" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-28 mx-auto" /></td>
                  </tr>
                ))
              ) : paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground bg-slate-50/20">
                    Tidak ditemukan data kabupaten/kota.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => {
                  const isTop3 = row.rank <= 3
                  const price = row.harga_terkini

                  // Penentuan warna status badge
                  let badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200"
                  if (price < 10500) {
                    badgeStyle = "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                  } else if (price < 11000) {
                    badgeStyle = "bg-amber-50 text-amber-700 border-amber-200"
                  }

                  return (
                    <tr
                      key={row.kode_wilayah}
                      className="hover:bg-slate-50/50 odd:bg-slate-50/10 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-center font-semibold text-slate-600">
                        {isTop3 ? (
                          <span className="text-base select-none">{MEDALS[row.rank - 1]}</span>
                        ) : (
                          row.rank
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-800 flex items-center gap-1.5">
                        {price > 0 && isTop3 && <Coins className="size-3.5 text-amber-500 animate-bounce" />}
                        {row.nama_wilayah}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-800 tabular-nums">
                        {price > 0 ? formatRupiah(price) : "—"}
                      </td>
                      <td className={["px-5 py-3.5 text-right font-bold tabular-nums", row.selisih >= 0 ? "text-emerald-600" : "text-rose-600"].join(" ")}>
                        {price > 0 ? (
                          <span>
                            {row.selisih >= 0 ? "+" : ""}
                            {formatRupiah(row.selisih)}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {price > 0 ? (
                          <span className={["inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border rounded-full", badgeStyle].join(" ")}>
                            {price < 10500 && <AlertCircle className="size-3 flex-shrink-0" />}
                            {row.status}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-full">
                            Tidak Melapor
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 bg-slate-50/50 border-t border-slate-100">
          <div className="text-xs text-muted-foreground font-semibold">
            Menampilkan <span className="text-slate-800 font-bold">{startEntryIndex}</span> - <span className="text-slate-800 font-bold">{endEntryIndex}</span> dari <span className="text-slate-800 font-bold">{sortedRows.length}</span> kabupaten/kota
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-lg border-slate-200 bg-white"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronsLeft className="size-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-lg border-slate-200 bg-white"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="size-4" />
            </Button>

            <div className="flex items-center justify-center h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 min-w-16">
              Hal {currentPage} / {totalPages}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-lg border-slate-200 bg-white"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
            >
              <ChevronRight className="size-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-lg border-slate-200 bg-white"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || isLoading}
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
