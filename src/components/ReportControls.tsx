'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Loader2, Calendar } from 'lucide-react'

import { toast } from 'sonner'

// Progressive loading messages sequence
const loadingMessages = [
  "Initializing secure connection to n8n...",
  "Fetching raw records from Supabase...",
  "Running data quality checks...",
  "Claude is analyzing trends...",
  "Generating executive summaries...",
  "Finalizing report..."
]


export function ReportControls({ currentPeriod, customPeriods = [] }: { currentPeriod: string, customPeriods?: any[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)

  // Custom date state
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const REFERENCE_DATE = '2026-06-30'

  const getOffsetDay = (dateString: string, offset: number) => {
    if (!dateString) return '';
    const [y, m, d] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d + offset));
    return date.toISOString().split('T')[0];
  }

  // Sequence the loading messages every 5s to keep the user engaged
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (loading) {
      interval = setInterval(() => {
        setMessageIndex((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev))
      }, 5000)
    }
    return () => clearInterval(interval)
  }, [loading])

  function handlePeriodChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    if (val === 'custom') {
      setShowCustomModal(true)
    } else {
      startTransition(() => {
        router.push(`/?period=${val}`)
      })
    }
  }

  async function generateReport(period: string, start?: string, end?: string) {
    setLoading(true)
    setMessageIndex(0)
    setShowCustomModal(false)

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('is_manual_refresh', 'true')
    }

    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selected_period: period,
          ...(period === 'custom' && { period_start: start, period_end: end })
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate report')
      }

      toast.success('Report generated successfully!')

      // Success, route to the newly generated period so it fetches from DB
      if (period === 'custom') {
        router.push(`/?period=custom_${start}_${end}`)
      } else {
        router.push(`/?period=${period}`)
      }
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('is_manual_refresh')
      }
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
        {/* READ: Select Period */}
        <div className="relative w-full sm:w-auto">
          <select
            value={currentPeriod}
            onChange={handlePeriodChange}
            disabled={isPending}
            className={`w-full sm:w-auto rounded-lg border border-slate-300 text-sm font-medium text-slate-700 shadow-sm focus:border-slate-900 focus:ring-slate-900 bg-white py-2.5 pl-4 pr-10 outline-none transition-all appearance-none ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em 1em' }}
          >
            <option value="last_30_days">Last 30 Days</option>
            <option value="last_90_days">Last 90 Days</option>
            <option value="ytd">Year to Date</option>
            {currentPeriod.startsWith('custom_') && (
              <option value={currentPeriod}>
                {(() => {
                  const parts = currentPeriod.replace('custom_', '').split('_')
                  if (parts.length === 2) {
                    const formatDate = (dateStr: string) => {
                      try {
                        return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr))
                      } catch {
                        return dateStr
                      }
                    }
                    return `Custom (${formatDate(parts[0])} - ${formatDate(parts[1])})`
                  }
                  return currentPeriod
                })()}
              </option>
            )}
            <option value="custom">Select Custom Range...</option>
          </select>

          {isPending && (
            <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
              <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
            </div>
          )}
        </div>

        {/* WRITE: Generate New Report for current period */}
        <button
          onClick={() => {
            if (currentPeriod.startsWith('custom_')) {
              const parts = currentPeriod.replace('custom_', '').split('_')
              if (parts.length === 2) {
                generateReport('custom', parts[0], parts[1])
                return
              }
            }
            generateReport(currentPeriod)
          }}
          disabled={isPending}
          className={`w-full sm:w-auto justify-center inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900 transition-all ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <RefreshCw className="h-4 w-4" />
          Rerun Analysis
        </button>
      </div>

      {/* Progressive Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl text-center space-y-6">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-slate-800" />
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 font-plus-jakarta">Analyzing Operations</h3>
              <p className="text-sm text-slate-500 font-inter animate-pulse transition-all duration-500">
                {loadingMessages[messageIndex]}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Custom Date Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 font-plus-jakarta mb-4">
              Generate Custom Report
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  max={getOffsetDay(REFERENCE_DATE, -1)}
                  onChange={e => {
                    const newStart = e.target.value;
                    setStartDate(newStart);
                    const minEnd = getOffsetDay(newStart, 1);
                    if (endDate && minEnd && endDate < minEnd) {
                      setEndDate(minEnd);
                    }
                  }}
                  onClick={e => (e.target as HTMLInputElement).showPicker && (e.target as HTMLInputElement).showPicker()}
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm px-3 py-2 border outline-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  min={getOffsetDay(startDate, 1) || undefined}
                  max={REFERENCE_DATE}
                  onChange={e => setEndDate(e.target.value)}
                  onClick={e => (e.target as HTMLInputElement).showPicker && (e.target as HTMLInputElement).showPicker()}
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm px-3 py-2 border outline-none cursor-pointer"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => generateReport('custom', startDate, endDate)}
                  disabled={!startDate || !endDate}
                  className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm disabled:opacity-50 transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                  Run Analysis
                </button>
              </div>

              {customPeriods.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3 font-plus-jakarta">Or select a recent custom report:</h4>
                  <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
                    {customPeriods.map(cp => {
                      const parts = cp.reporting_period.replace('custom_', '').split('_')
                      let label = cp.reporting_period
                      if (parts.length === 2) {
                        const formatDate = (dateStr: string) => {
                          try {
                            return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr))
                          } catch {
                            return dateStr
                          }
                        }
                        label = `${formatDate(parts[0])} - ${formatDate(parts[1])}`
                      }

                      return (
                        <button
                          key={cp.reporting_period}
                          onClick={() => {
                            setShowCustomModal(false)
                            startTransition(() => {
                              router.push(`/?period=${cp.reporting_period}`)
                            })
                          }}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-200 text-sm text-slate-700 font-medium transition-all cursor-pointer flex justify-between items-center group"
                        >
                          <span>{label}</span>
                          <span className="text-xs text-slate-400 group-hover:text-slate-600">View Data &rarr;</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
