import { createClient } from '@/utils/supabase/server'
import type { Metric, AiInsight, DataQualityWarning, WorkflowRun } from './types'

export async function getDashboardData(periodKey: string, periodStart?: string, periodEnd?: string) {
  const supabase = await createClient()
  
  // Helper to apply the correct date filter
  const applyPeriodFilter = (query: any) => {
    if (periodKey === 'custom' && periodStart && periodEnd) {
      return query.eq('period_start', periodStart).eq('period_end', periodEnd)
    }
    return query.eq('period_key', periodKey)
  }

  // Fetch everything in parallel
  const [metricsRes, insightsRes, warningsRes, runsRes] = await Promise.all([
    applyPeriodFilter(supabase.from('metrics').select('*')),
    applyPeriodFilter(supabase.from('ai_insights').select('*')),
    applyPeriodFilter(supabase.from('data_quality_warnings').select('*')),
    supabase
      .from('workflow_runs')
      .select('*')
      .eq('reporting_period', periodKey)
      .order('run_timestamp', { ascending: false })
      .limit(1)
  ])

  return {
    metrics: (metricsRes.data as Metric[]) || [],
    insights: (insightsRes.data as AiInsight[]) || [],
    warnings: (warningsRes.data as DataQualityWarning[]) || [],
    lastRun: (runsRes.data?.[0] as WorkflowRun) || null,
  }
}
