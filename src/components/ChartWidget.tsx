'use client'

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { LineChart as LineChartIcon } from 'lucide-react'

interface ChartDataPoint {
  label: string
  value: number
}

interface ChartWidgetProps {
  title: string
  data: ChartDataPoint[]
  valueFormatter?: (val: number) => string
  color?: string
}

export function ChartWidget({ 
  title, 
  data, 
  valueFormatter = (val) => val.toString(),
  color = '#0f172a' // Default slate-900
}: ChartWidgetProps) {
  
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center justify-center h-72">
        <LineChartIcon className="h-8 w-8 text-slate-300 mb-2" />
        <p className="text-sm text-slate-500 font-inter">No trend data available.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow duration-300">
      <div className="mb-6 flex items-center gap-2">
        <div className="p-2 bg-slate-50 rounded-md ring-1 ring-inset ring-slate-200">
          <LineChartIcon className="h-4 w-4 text-slate-600" />
        </div>
        <h3 className="font-semibold text-slate-900 font-plus-jakarta tracking-tight">{title}</h3>
      </div>
      
      <div className="h-64 w-full flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`colorValue-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.15}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b', fontFamily: 'var(--font-inter)' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b', fontFamily: 'var(--font-inter)' }} 
              tickFormatter={valueFormatter}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                fontFamily: 'var(--font-inter)',
                padding: '12px'
              }}
              itemStyle={{ color: '#0f172a', fontWeight: 600, fontSize: '16px', fontFamily: 'var(--font-plus-jakarta)' }}
              formatter={(value: any) => [valueFormatter(typeof value === 'number' ? value : 0), '']}
              labelStyle={{ color: '#64748b', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2}
              fillOpacity={1} 
              fill={`url(#colorValue-${title.replace(/\s+/g, '')})`} 
              activeDot={{ r: 6, strokeWidth: 0, fill: color }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
