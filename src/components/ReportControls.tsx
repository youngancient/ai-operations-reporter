'use client'

import { useState, useEffect } from 'react'
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


export function ReportControls({ currentPeriod }: { currentPeriod: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)

  // Custom date state
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

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
    } else if (val.startsWith('custom_')) {
      // Do nothing, just re-selecting the current custom period
    } else {
      router.push(`/?period=${val}`)
    }
  }

  async function generateReport(period: string, start?: string, end?: string) {
    setLoading(true)
    setMessageIndex(0)
    setShowCustomModal(false)

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
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* READ: Select Period */}
        <select
          value={currentPeriod}
          onChange={handlePeriodChange}
          className="rounded-lg border border-slate-300 text-sm font-medium text-slate-700 shadow-sm focus:border-slate-900 focus:ring-slate-900 bg-white py-2.5 px-4 cursor-pointer outline-none transition-all"
        >
          <option value="last_30_days">Last 30 Days</option>
          <option value="last_90_days">Last 90 Days</option>
          <option value="ytd">Year to Date</option>
          {currentPeriod.startsWith('custom_') && (
            <option value={currentPeriod}>
              Custom ({currentPeriod.replace('custom_', '').replace('_', ' to ')})
            </option>
          )}
          <option value="custom">Create Custom Range...</option>
        </select>

        {/* WRITE: Generate New Report for current standard period */}
        {!currentPeriod.startsWith('custom') && (
          <button
            onClick={() => generateReport(currentPeriod)}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </button>
        )}
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
            <h3 className="text-lg font-bold text-slate-900 font-plus-jakarta mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-slate-500" />
              Generate Custom Report
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm px-3 py-2 border outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm px-3 py-2 border outline-none"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => generateReport('custom', startDate, endDate)}
                  disabled={!startDate || !endDate}
                  className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm disabled:opacity-50 transition-colors inline-flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Run Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
