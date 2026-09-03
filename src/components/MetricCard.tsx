import { ArrowDownIcon, ArrowUpIcon, HelpCircleIcon, MinusIcon } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type TrendStatus = 'improved' | 'declined' | 'stable' | 'insufficient_data'

interface MetricCardProps {
  title: string
  value?: string | number
  trend?: TrendStatus
  trendContext?: string
  breakdowns?: { label: string, value: string | number }[]
}

const trendConfig = {
  improved: { icon: ArrowUpIcon, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-600/20' },
  declined: { icon: ArrowDownIcon, color: 'text-rose-600', bg: 'bg-rose-50', ring: 'ring-rose-600/20' },
  stable: { icon: MinusIcon, color: 'text-slate-500', bg: 'bg-slate-50', ring: 'ring-slate-500/20' },
  insufficient_data: { icon: HelpCircleIcon, color: 'text-amber-500', bg: 'bg-amber-50', ring: 'ring-amber-500/20' },
}

export function MetricCard({ title, value, trend, trendContext, breakdowns }: MetricCardProps) {
  const config = trend ? trendConfig[trend] : null
  const Icon = config?.icon

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
      <h3 className="text-sm font-medium text-slate-500 font-inter uppercase tracking-wider truncate">
        {title}
      </h3>
      <div className="mt-3 flex flex-col gap-2">
        {value !== undefined && (
          <span className="text-4xl font-bold tracking-tight text-slate-900 font-plus-jakarta tabular-nums">
            {value}
          </span>
        )}
        {breakdowns && breakdowns.length > 0 && (
          <div className="mt-1 space-y-1.5 w-full">
            {breakdowns.map((b, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-inter">{b.label}</span>
                <span className="font-semibold text-slate-900 tabular-nums">{b.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {trend && config && (
        <div className="mt-4 flex items-center gap-2">
          <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset", config.bg, config.color, config.ring)}>
            {Icon && <Icon className="mr-1 h-3 w-3" />}
            {trend.replace('_', ' ').toUpperCase()}
          </span>
          {trendContext && (
            <span className="text-xs text-slate-500 font-inter truncate">{trendContext}</span>
          )}
        </div>
      )}
    </div>
  )
}
