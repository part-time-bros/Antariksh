import { useMemo } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import timeline from '../../content/timeline.json'

function decadeLabel(year) {
  const d = Math.floor(year / 10) * 10
  return `${d}s`
}

export default function MilestonesPerDecadeChart() {
  const data = useMemo(() => {
    const counts = {}
    timeline.events.forEach((e) => {
      if (!e.year) return
      const label = decadeLabel(e.year)
      counts[label] = (counts[label] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => parseInt(a[0], 10) - parseInt(b[0], 10))
      .map(([decade, count]) => ({ decade, count }))
  }, [])

  return (
    <div className="w-full">
      <p className="text-[10px] uppercase tracking-wider text-[#EDEDE6]/50 mb-1">
        Milestones per decade, this exhibit's own timeline
      </p>
      <div style={{ width: '100%', height: 150 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="#3A3A3E" vertical={false} />
            <XAxis dataKey="decade" tick={{ fill: '#EDEDE6', fontSize: 10 }} axisLine={{ stroke: '#3A3A3E' }} tickLine={false} />
            <YAxis
              tick={{ fill: '#EDEDE6', fontSize: 10 }}
              axisLine={{ stroke: '#3A3A3E' }}
              tickLine={false}
              width={22}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.06)' }}
              contentStyle={{ background: '#101014', border: '1px solid #3A3A3E', fontSize: 12, borderRadius: 6 }}
              labelStyle={{ color: '#EDEDE6' }}
            />
            <Bar dataKey="count" radius={[3, 3, 0, 0]} fill="#1B4B43" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
