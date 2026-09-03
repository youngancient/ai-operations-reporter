'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard Error:', error)
  }, [error])

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="mx-auto w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-rose-600" />
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-plus-jakarta">
            Failed to load dashboard
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-inter">
            We couldn't connect to the database. The servers might be down or you might be offline.
          </p>
        </div>

        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  )
}
