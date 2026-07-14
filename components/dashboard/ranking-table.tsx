"use client"

import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/formatters"
import type { DashboardProduksiTahunan } from "@/types/dashboard"

interface RankingTableProps {
  rows: DashboardProduksiTahunan[]
  className?: string
}

const MEDAL = ["🥇", "🥈", "🥉"]

export function RankingTable({ rows, className }: RankingTableProps) {
  if (rows.length === 0) return (
    <p className="text-xs text-muted-foreground py-2">Belum ada data.</p>
  )

  const max = Number(rows[0]?.produktivitas ?? 1)

  return (
    <div className={cn("space-y-0.5", className)}>
      {rows.map((row, i) => {
        const pct = Math.round((Number(row.produktivitas ?? 0) / max) * 100)
        return (
          <div
            key={`${row.tahun}-${row.wilayah_key}`}
            className="group flex items-center gap-2 rounded-md px-1.5 py-1.5 transition-colors hover:bg-muted/50"
          >
            {/* Rank */}
            <span className="w-5 shrink-0 text-center text-[11px]">
              {i < 3 ? MEDAL[i] : <span className="text-muted-foreground font-medium">{i + 1}</span>}
            </span>

            {/* Bar + name */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="truncate text-xs font-medium">{row.nama_wilayah}</span>
                <span className="shrink-0 text-xs font-bold tabular-nums text-primary">
                  {formatNumber(row.produktivitas)}
                </span>
              </div>
              <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary/60 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
