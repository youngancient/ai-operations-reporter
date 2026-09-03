export default function LoadingDashboard() {
  return (
    <div className="min-h-screen bg-slate-50/50 p-6 sm:p-10">
      <div className="mx-auto max-w-[1400px] space-y-10 animate-pulse">
        
        {/* Header Skeleton */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <div className="h-8 w-48 bg-slate-200 rounded-md"></div>
            <div className="h-4 w-64 bg-slate-200 rounded-md"></div>
          </div>
          
          <div className="flex gap-3">
            <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
            <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
          </div>
        </header>

        {/* TL;DR Executive Summary Skeleton */}
        <section>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm h-40 flex flex-col">
            <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
              <div className="h-5 w-48 bg-slate-200 rounded-md"></div>
            </div>
            <div className="p-6 space-y-3 flex-grow">
              <div className="h-4 w-full bg-slate-100 rounded-md"></div>
              <div className="h-4 w-full bg-slate-100 rounded-md"></div>
              <div className="h-4 w-5/6 bg-slate-100 rounded-md"></div>
            </div>
          </div>
        </section>

        {/* Sections Skeleton */}
        <div className="space-y-14">
          {[1, 2].map((section) => (
            <section key={section} className="space-y-5">
              <div className="border-b border-slate-200/80 pb-3">
                <div className="h-7 w-40 bg-slate-200 rounded-md"></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">
                {/* Metric Cards Skeleton */}
                <div className="lg:col-span-8 grid gap-6 sm:grid-cols-2">
                  {[1, 2, 3, 4].map(card => (
                    <div key={card} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm h-36 flex flex-col justify-between">
                      <div className="h-4 w-24 bg-slate-100 rounded-md"></div>
                      <div className="h-10 w-20 bg-slate-200 rounded-md mt-4"></div>
                      <div className="h-5 w-32 bg-slate-100 rounded-md mt-6"></div>
                    </div>
                  ))}
                </div>
                {/* Side InsightPanel Skeleton */}
                <div className="lg:col-span-4 self-start">
                  <div className="rounded-xl border border-slate-200 bg-white shadow-sm h-64 flex flex-col">
                    <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
                      <div className="h-5 w-32 bg-slate-200 rounded-md"></div>
                    </div>
                    <div className="p-6 space-y-3 flex-grow">
                      <div className="h-6 w-24 bg-slate-200 rounded-md mb-4"></div>
                      <div className="h-4 w-full bg-slate-100 rounded-md"></div>
                      <div className="h-4 w-5/6 bg-slate-100 rounded-md"></div>
                      <div className="h-4 w-4/6 bg-slate-100 rounded-md"></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Actionable Intelligence Skeleton */}
        <section className="space-y-6 pt-10 border-t border-slate-200/80">
          <div className="h-8 w-64 bg-slate-200 rounded-md"></div>
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2].map(action => (
              <div key={action} className="rounded-xl border border-slate-200 bg-white shadow-sm h-64 flex flex-col">
                <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
                  <div className="h-5 w-32 bg-slate-200 rounded-md"></div>
                </div>
                <div className="p-6 space-y-3 flex-grow">
                  <div className="h-4 w-full bg-slate-100 rounded-md"></div>
                  <div className="h-4 w-full bg-slate-100 rounded-md"></div>
                  <div className="h-4 w-5/6 bg-slate-100 rounded-md"></div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
