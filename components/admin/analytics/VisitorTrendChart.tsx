'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function VisitorTrendChart({ data }: { data: Array<{ date: string; views: number }> }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted">
        No data available
      </div>
    )
  }

  const chartData = data.map((d) => ({ ...d, label: formatDate(d.date) }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E4DF" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#888780' }}
          tickLine={false}
          axisLine={false}
          interval={6}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#888780' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: '#FFFFFF',
            border: '1px solid #E5E4DF',
            borderRadius: '6px',
            fontSize: '12px',
          }}
          labelStyle={{ color: '#1A1A18', fontWeight: 600 }}
          formatter={(value) => [Number(value ?? 0).toLocaleString(), 'Page views']}
        />
        <Line
          type="monotone"
          dataKey="views"
          stroke="#E05A2B"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#E05A2B' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
