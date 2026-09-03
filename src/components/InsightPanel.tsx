import type { AiInsight } from '@/lib/types'
import { AlertTriangle, Lightbulb, TrendingUp, FileText, CheckCircle2 } from 'lucide-react'

interface InsightPanelProps {
  insight: AiInsight
}

export function InsightPanel({ insight }: InsightPanelProps) {
  const { insight_type, content } = insight

  const renderContent = () => {
    try {
      if (insight_type === 'executive_summary') {
        return <p className="text-slate-700 leading-relaxed font-inter">{content}</p>
      }

      if (['sales_trend', 'delivery_trend', 'people_ops_trend'].includes(insight_type)) {
        const parsed = JSON.parse(content) as { trend: string; commentary: string }
        return (
          <div className="space-y-3 font-inter">
            <span className="inline-block rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 uppercase tracking-wider">
              {parsed.trend.replace('_', ' ')}
            </span>
            <p className="text-slate-700 leading-relaxed">{parsed.commentary}</p>
          </div>
        )
      }

      if (['risks_and_anomalies', 'recommended_actions'].includes(insight_type)) {
        const parsed = JSON.parse(content) as string[]
        return (
          <ul className="space-y-3 font-inter">
            {parsed.map((item, idx) => (
              <li key={idx} className="flex gap-3 text-slate-700">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-slate-400 mt-0.5" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        )
      }
    } catch (e) {
      return <p className="text-rose-500 text-sm">Error parsing insight content: {String(e)}</p>
    }

    return <p className="text-slate-700 leading-relaxed font-inter">{content}</p>
  }

  const getTitleAndIcon = () => {
    switch (insight_type) {
      case 'executive_summary': return { title: 'Executive Summary', icon: FileText }
      case 'sales_trend': return { title: 'Sales Analysis', icon: TrendingUp }
      case 'delivery_trend': return { title: 'Delivery Analysis', icon: TrendingUp }
      case 'people_ops_trend': return { title: 'People Ops Analysis', icon: TrendingUp }
      case 'risks_and_anomalies': return { title: 'Risks & Anomalies', icon: AlertTriangle }
      case 'recommended_actions': return { title: 'Recommended Actions', icon: Lightbulb }
      default: return { title: 'Insight', icon: FileText }
    }
  }

  const { title, icon: Icon } = getTitleAndIcon()

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4 flex items-center gap-3">
        <Icon className="h-5 w-5 text-slate-500" />
        <h2 className="font-semibold text-slate-900 font-plus-jakarta">{title}</h2>
      </div>
      <div className="p-6 flex-grow">
        {renderContent()}
      </div>
    </div>
  )
}
