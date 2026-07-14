import { ReactNode } from "react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

export type KpiVariant = "sky" | "lime" | "amber" | "carrot"

const V = {
  sky: {
    card: "from-sky-50 via-cyan-50 to-white border-sky-200/80",
    text: "text-sky-950",
    sub: "text-sky-700/75",
    icon: "bg-gradient-to-br from-sky-500 to-cyan-500 text-white",
    ring: "ring-sky-200/70",
    sparklineColor: "rgb(14 165 233)",
    gradId: "sparklineSky",
  },
  lime: {
    card: "from-lime-50 via-emerald-50 to-white border-lime-200/80",
    text: "text-lime-950",
    sub: "text-lime-700/75",
    icon: "bg-gradient-to-br from-lime-500 to-emerald-500 text-white",
    ring: "ring-lime-200/70",
    sparklineColor: "rgb(101 163 13)",
    gradId: "sparklineLime",
  },
  amber: {
    card: "from-amber-50 via-yellow-50 to-white border-amber-200/80",
    text: "text-amber-950",
    sub: "text-amber-700/75",
    icon: "bg-gradient-to-br from-amber-400 to-orange-500 text-white",
    ring: "ring-amber-200/70",
    sparklineColor: "rgb(245 158 11)",
    gradId: "sparklineAmber",
  },
  carrot: {
    card: "from-orange-50 via-red-50 to-white border-orange-200/80",
    text: "text-orange-950",
    sub: "text-orange-700/75",
    icon: "bg-gradient-to-br from-orange-500 to-red-500 text-white",
    ring: "ring-orange-200/70",
    sparklineColor: "rgb(249 115 22)",
    gradId: "sparklineCarrot",
  },
} as const

type KpiCardProps = {
  title: string
  value: string | number
  sub?: string
  icon: ReactNode
  variant: KpiVariant
  sparklineData?: { value: number }[]
  className?: string
}

function isLongValue(value: string | number) {
  return String(value).length > 18
}

export function KpiCard({
  title,
  value,
  sub,
  icon,
  variant,
  sparklineData,
  className,
}: KpiCardProps) {
  const s = V[variant]
  const longValue = isLongValue(value)

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border bg-gradient-to-br shadow-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        s.card,
        className
      )}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-white/50 blur-2xl" />

      {/* Dihapus min-h-36 dan pt-1, diganti dengan padding seragam p-4 */}
      <CardContent className="relative flex h-full flex-col px-4 py-1">
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl shadow-sm ring-2", // Ukuran diturunkan ke size-10
              s.icon,
              s.ring
            )}
          >
            {/* Ukuran icon diturunkan ke size-5 */}
            <div className="[&_svg]:size-6">{icon}</div>
          </div>

          <div className="min-w-0 flex-1 text-right">
            <p
              className={cn(
                "text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.18em]",
                s.sub
              )}
            >
              {title}
            </p>

            <p
              title={String(value)}
              className={cn(
                "mt-1 font-black leading-none tracking-tight",
                longValue
                  ? "text-lg sm:text-xl line-clamp-2 break-words" // Ukuran diperkecil untuk teks panjang
                  : "text-2xl sm:text-[1.75rem] tabular-nums", // Ukuran diperkecil dari 3xl/2rem
                s.text
              )}
            >
              {value}
            </p>

            {sub && (
              <p
                title={sub}
                className={cn(
                  "mt-1 text-xs font-bold leading-snug", // margin top & ukuran huruf dirapatkan
                  "line-clamp-2",
                  s.sub
                )}
              >
                {sub}
              </p>
            )}
          </div>
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-auto h-8 w-full overflow-hidden pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={sparklineData}
                margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
              >
                <defs>
                  <linearGradient id={s.gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={s.sparklineColor}
                      stopOpacity={0.28}
                    />
                    <stop
                      offset="100%"
                      stopColor={s.sparklineColor}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={s.sparklineColor}
                  strokeWidth={2.5}
                  fill={`url(#${s.gradId})`}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}