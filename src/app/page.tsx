import { getDashboardData } from '@/lib/api'
import { MetricCard } from '@/components/MetricCard'
import { InsightPanel } from '@/components/InsightPanel'
import { ReportControls } from '@/components/ReportControls'
import { RealtimeListener } from '@/components/RealtimeListener'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AlertCircle, ChevronDown, Clock } from 'lucide-react'
import { logout } from '@/app/actions/auth'

export const revalidate = 0

export default async function Dashboard(props: { searchParams: Promise<{ period?: string }> }) {
  // Auth Check
  const cookieStore = await cookies()
  if (!cookieStore.get('exec_session')) {
    redirect('/login')
  }

  const searchParams = await props.searchParams
  const period = searchParams.period || 'last_30_days'

  const { metrics, insights, warnings, lastRun } = await getDashboardData(period)

  const executiveSummary = insights.find(i => i.insight_type === 'executive_summary')
  const risksInsight = insights.find(i => i.insight_type === 'risks_and_anomalies')
  const actionsInsight = insights.find(i => i.insight_type === 'recommended_actions')

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 sm:p-10">
      <RealtimeListener />
      <div className="mx-auto max-w-[1400px] space-y-10">

        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-plus-jakarta">
                Koya Vantage
              </h1>
              <form action={logout}>
                <button type="submit" className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:text-rose-600 transition-all cursor-pointer">
                  Sign Out
                </button>
              </form>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 font-inter">
              <div className={`h-1.5 w-1.5 rounded-full ${lastRun || metrics.length > 0 ? 'bg-emerald-500 animate-pulse ring-2 ring-emerald-500/20' : 'bg-slate-400 ring-2 ring-slate-400/20'}`}></div>
              {lastRun ? (
                <span>Last updated <span className="font-medium text-slate-700">{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(lastRun.run_timestamp))}</span></span>
              ) : metrics.length > 0 ? (
                'Generating data...'
              ) : (
                'No data available'
              )}
            </div>
          </div>

          <ReportControls currentPeriod={period} />
        </header>

        {warnings.length > 0 && (
          <details className="group rounded-xl border border-amber-200 bg-amber-50 shadow-sm overflow-hidden">
            <summary className="flex cursor-pointer items-center gap-3 p-4 font-semibold text-amber-900 list-none [&::-webkit-details-marker]:hidden select-none">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              {warnings.length} Data Quality {warnings.length === 1 ? 'Issue' : 'Issues'} Detected
              <ChevronDown className="ml-auto h-5 w-5 text-amber-600 transition-transform duration-200 group-open:rotate-180 flex-shrink-0" />
            </summary>
            <div className="border-t border-amber-200/60 p-4 pt-3 bg-amber-50/50">
              <ul className="text-sm text-amber-800 space-y-2 font-inter max-h-64 overflow-y-auto custom-scrollbar pr-2">
                {warnings.map(w => (
                  <li key={w.id} className="flex gap-2">
                    <span className="text-amber-500">•</span>
                    <span>{w.issue} {w.source && <span className="opacity-75">({w.source})</span>}</span>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        )}

        {/* TL;DR Executive Summary */}
        {executiveSummary && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <InsightPanel insight={executiveSummary} />
          </section>
        )}

        {/* Metrics Sections */}
        <div className="space-y-14">
          {metrics.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
              No KPI metrics found for this period. Try changing the date range.
            </div>
          ) : (
            Object.entries(
              metrics.reduce((acc, metric) => {
                // Group strictly by the prefix (e.g., "sales.revenue" -> "Sales")
                let category = metric.metric_name.includes('.') ? metric.metric_name.split('.')[0] : 'Overview'
                category = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

                if (!acc[category]) acc[category] = []
                acc[category].push(metric)
                return acc
              }, {} as Record<string, typeof metrics>)
            )
              .sort(([a], [b]) => {
                const order = [
                  'Overview',
                  'Sales', 'Inbound', 'Outbound', 'Partner', 'Referral', 'Event', 'Marketing',
                  'Delivery', 'Client Ops', 'Project', 'Engineering', 'Data', 'Ai Apps', 'Automation', 'Product',
                  'Customer Success', 'Support', 'People Ops', 'Hr', 'Finance', 'Operations'
                ]
                const indexA = order.indexOf(a)
                const indexB = order.indexOf(b)
                if (indexA !== -1 && indexB !== -1) return indexA - indexB
                if (indexA !== -1) return -1
                if (indexB !== -1) return 1
                return a.localeCompare(b)
              })
              .map(([category, catMetrics]) => {
                // Try to find the AI insight for this specific department
                const insightKey = `${category.toLowerCase().replace(/ /g, '_')}_trend`
                const trendInsight = insights.find(i => i.insight_type.toLowerCase() === insightKey)

                return (
                  <section key={category} className="space-y-5">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-plus-jakarta border-b border-slate-200/80 pb-3">
                      {category}
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">
                      {/* The Numbers */}
                      <div className={`grid gap-6 sm:grid-cols-2 ${trendInsight ? 'lg:col-span-8' : 'lg:grid-cols-3 lg:col-span-12 xl:grid-cols-4'}`}>
                        {(() => {
                          // Group metrics by their base metric_name
                          const groupedMetrics = catMetrics.reduce((acc, metric) => {
                            if (!acc[metric.metric_name]) acc[metric.metric_name] = []
                            acc[metric.metric_name].push(metric)
                            return acc
                          }, {} as Record<string, typeof catMetrics>)

                          return Object.entries(groupedMetrics).map(([metricName, group]) => {
                            // Extract display name
                            let displayName = metricName
                            if (displayName.includes('.')) {
                              displayName = displayName.split('.')[1]
                            }
                            displayName = displayName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

                            // Formatting helper
                            const formatValue = (m: typeof catMetrics[0]) => {
                              const lowerName = m.metric_name.toLowerCase()
                              const isPercentage = lowerName.includes('rate') || lowerName.includes('percent')

                              // It is a currency if it contains money terms AND does NOT contain count terms
                              const hasMoneyTerm = ['revenue', 'mrr', 'arr', 'spend', 'cost', 'budget', 'salary', 'value'].some(term => lowerName.includes(term))
                              const hasCountTerm = ['projects', 'count', 'number', 'users', 'customers', 'clients', 'tickets', 'days', 'hours'].some(term => lowerName.includes(term))
                              const isCurrency = !isPercentage && hasMoneyTerm && !hasCountTerm

                              if (isPercentage) {
                                const val = m.metric_value
                                if (val > 0 && val <= 1) {
                                  return new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 }).format(val)
                                } else {
                                  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(val) + '%'
                                }
                              } else if (isCurrency) {
                                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(m.metric_value)
                              } else {
                                return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(m.metric_value)
                              }
                            }

                            // If it's a single item without a department breakdown, it's a normal metric
                            if (group.length === 1 && !group[0].department) {
                              return (
                                <MetricCard
                                  key={group[0].id}
                                  title={displayName}
                                  value={formatValue(group[0])}
                                />
                              )
                            }

                            // Otherwise, it has breakdowns (by department)
                            const totalMetric = group.find(m => !m.department)
                            const breakdownMetrics = group.filter(m => m.department)

                            return (
                              <MetricCard
                                key={group[0].id}
                                title={displayName}
                                value={totalMetric ? formatValue(totalMetric) : undefined}
                                breakdowns={breakdownMetrics.map(m => ({
                                  label: m.department!,
                                  value: formatValue(m)
                                }))}
                              />
                            )
                          })
                        })()}
                      </div>

                      {/* The Analysis for this specific section */}
                      {trendInsight && (
                        <div className="order-first lg:order-none lg:col-span-4 self-start mb-2 lg:mb-0">
                          <InsightPanel insight={trendInsight} />
                        </div>
                      )}
                    </div>
                  </section>
                )
              })
          )}
        </div>

        {/* Deep Dive & Next Steps */}
        {(risksInsight || actionsInsight) && (
          <section className="space-y-6 pt-10 border-t border-slate-200/80">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-plus-jakarta">
              Actionable Intelligence
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {risksInsight && <InsightPanel insight={risksInsight} />}
              {actionsInsight && <InsightPanel insight={actionsInsight} />}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
