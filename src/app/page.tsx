import { getDashboardData } from '@/lib/api'
import { MetricCard } from '@/components/MetricCard'
import { InsightPanel } from '@/components/InsightPanel'
import { ReportControls } from '@/components/ReportControls'
import { RealtimeListener } from '@/components/RealtimeListener'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AlertCircle } from 'lucide-react'

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

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 sm:p-10">
      <RealtimeListener />
      <div className="mx-auto max-w-7xl space-y-10">
        
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-plus-jakarta">
              Koya Vantage
            </h1>
            <p className="mt-2 text-sm text-slate-500 font-inter">
              {lastRun ? `Report generated on ${new Date(lastRun.run_timestamp).toLocaleString()}` : 'Generating data...'}
            </p>
          </div>
          
          <ReportControls currentPeriod={period} />
        </header>

        {warnings.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900">Data Quality Issues Detected</h3>
              <ul className="mt-2 text-sm text-amber-800 space-y-1 font-inter">
                {warnings.map(w => (
                  <li key={w.id}>• {w.issue} {w.source && <span className="opacity-75">({w.source})</span>}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
           {metrics.length === 0 ? (
             <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
               No KPI metrics found for this period. Try changing the date range.
             </div>
           ) : (
             metrics.map((metric) => (
               <MetricCard 
                 key={metric.id}
                 title={metric.metric_name.replace(/[._]/g, ' ')} 
                 value={metric.metric_value.toLocaleString()} 
               />
             ))
           )}
        </section>

        {/* AI Insights */}
        {insights.length > 0 && (
          <section className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 font-plus-jakarta">
                Claude's Analysis
              </h2>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Force Executive Summary to be full width at top if it exists */}
              {insights.filter(i => i.insight_type === 'executive_summary').map((insight) => (
                <div key={insight.id} className="md:col-span-2 lg:col-span-3">
                  <InsightPanel insight={insight} />
                </div>
              ))}
              
              {/* Render the rest */}
              {insights.filter(i => i.insight_type !== 'executive_summary').map((insight) => (
                <InsightPanel key={insight.id} insight={insight} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
