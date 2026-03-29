'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import type { CategoryCount } from '@/lib/analytics'

export default function EventsByCategoryChart({ data }: { data: CategoryCount[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted">
        No published events yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E4DF" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#888780' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: string) => v.split(' ')[0]}
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
          formatter={(value) => [Number(value ?? 0).toLocaleString(), 'Events']}
        />
        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.slug} fill={entry.colour} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
