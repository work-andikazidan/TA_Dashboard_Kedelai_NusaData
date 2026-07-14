"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Sprout } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/formatters"
import type { DashboardProduksiTahunan } from "@/types/dashboard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface DetailedTableProps {
  rows: DashboardProduksiTahunan[]
  isLoading?: boolean
}

type SortKey = "nama_wilayah" | "produksi" | "luas_panen" | "produktivitas"
type SortOrder = "asc" | "desc"

const MEDALS = ["🥇", "🥈", "🥉"]

export function DetailedTable({ rows, isLoading }: DetailedTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("produktivitas")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Reset page when search term changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // 1. Calculate ranks based on productivity of all input rows
  const rankedRows = useMemo(() => {
    // Sort all rows by productivity descending first to assign absolute ranks
    const sortedForRank = [...rows].sort((a, b) => Number(b.produktivitas ?? 0) - Number(a.produktivitas ?? 0))
    return rows.map(row => {
      const rankIndex = sortedForRank.findIndex(r => r.fact_produksi_key === row.fact_produksi_key)
      return {
        ...row,
        rank: rankIndex !== -1 ? rankIndex + 1 : 999
      }
    })
  }, [rows])

  // 2. Filter rows by search term (search region name)
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rankedRows
    const term = searchTerm.toLowerCase()
    return rankedRows.filter(r => r.nama_wilayah.toLowerCase().includes(term))
  }, [rankedRows, searchTerm])

  // 3. Sort filtered rows
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

  // 4. Paginate sorted rows
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
      setSortOrder("desc") // default desc for numbers
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari Kabupaten/Kota..."
            className="pl-9 h-9 text-xs border-slate-200 focus-visible:ring-primary bg-slate-50/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Tampilkan</span>
          <select
            className="h-8 rounded-lg border border-slate-200 px-2 py-0.5 bg-white text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-5 py-4 w-16 text-center font-bold">Peringkat</th>
                <th className="px-5 py-4 min-w-[200px]">
                  <button
                    onClick={() => handleSort("nama_wilayah")}
                    className="flex items-center gap-1 hover:text-foreground font-bold"
                  >
                    Nama Wilayah
                    <ArrowUpDown className="size-3 text-slate-400" />
                  </button>
                </th>
                <th className="px-5 py-4 text-right">
                  <button
                    onClick={() => handleSort("produksi")}
                    className="flex items-center gap-1 hover:text-foreground ml-auto font-bold"
                  >
                    Produksi (Ton)
                    <ArrowUpDown className="size-3 text-slate-400" />
                  </button>
                </th>
                <th className="px-5 py-4 text-right">
                  <button
                    onClick={() => handleSort("luas_panen")}
                    className="flex items-center gap-1 hover:text-foreground ml-auto font-bold"
                  >
                    Luas Panen (Ha)
                    <ArrowUpDown className="size-3 text-slate-400" />
                  </button>
                </th>
                <th className="px-5 py-4 text-right">
                  <button
                    onClick={() => handleSort("produktivitas")}
                    className="flex items-center gap-1 hover:text-foreground ml-auto font-bold"
                  >
                    Produktivitas (Ku/Ha)
                    <ArrowUpDown className="size-3 text-slate-400" />
                  </button>
                </th>
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
                    <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-16 ml-auto" /></td>
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
                  return (
                    <tr
                      key={row.fact_produksi_key}
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
                        {isTop3 && <Sprout className="size-3 text-lime-moss animate-pulse" />}
                        {row.nama_wilayah}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-800 tabular-nums">
                        {row.produksi != null ? `${formatNumber(row.produksi)} ton` : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-800 tabular-nums">
                        {row.luas_panen != null ? `${formatNumber(row.luas_panen)} ha` : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right font-extrabold text-primary tabular-nums">
                        {row.produktivitas != null ? `${formatNumber(row.produktivitas)} ku/ha` : "—"}
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
            {/* First Page */}
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-lg border-slate-200 bg-white"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronsLeft className="size-4" />
            </Button>

            {/* Prev Page */}
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-lg border-slate-200 bg-white"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="size-4" />
            </Button>

            {/* Current Page Indicator */}
            <div className="flex items-center justify-center h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 min-w-16">
              Hal {currentPage} / {totalPages}
            </div>

            {/* Next Page */}
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-lg border-slate-200 bg-white"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
            >
              <ChevronRight className="size-4" />
            </Button>

            {/* Last Page */}
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
