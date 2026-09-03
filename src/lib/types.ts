export type PeriodKey = 'last_30_days' | 'last_90_days' | 'ytd' | `custom_${string}_${string}`

export interface Metric {
  id: string
  created_at: string
  period_key: PeriodKey
  period_start: string
  period_end: string
  department: string | null
  metric_name: string
  metric_value: number
  run_id: string
}

export type InsightType = 'executive_summary' | 'sales_trend' | 'delivery_trend' | 'people_ops_trend' | 'risks_and_anomalies' | 'recommended_actions'
export type TrendStatus = 'improved' | 'declined' | 'stable' | 'insufficient_data'

export interface AiInsight {
  id: string
  created_at: string
  period_key: PeriodKey
  period_start: string
  period_end: string
  insight_type: InsightType
  content: string
  based_on_metrics: any | null
  run_id: string
}

export interface DataQualityWarning {
  id: string
  created_at: string
  period_key: PeriodKey
  period_start: string
  period_end: string
  source: string | null
  record_id: string | null
  issue: string
  run_id: string
}

export interface WorkflowRun {
  id: string
  run_id: string
  execution_id: string
  status: string
  run_timestamp: string
  reporting_period: string
  period_start: string
  period_end: string
  warnings_count: number
}
