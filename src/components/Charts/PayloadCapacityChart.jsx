import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'

const DATA = [
  { name: 'SLV-3 · 1980', tonnes: 0.04, note: 'First Indian orbital launch' },
  { name: 'PSLV · 1994', tonnes: 3.8, note: 'To low Earth orbit' },
  { name: 'LVM3 · 2014+', tonnes: 10, note: 'To low Earth orbit' },
  { name: 'NGLV · target', tonnes: 30, note: 'Proposed, partially reusable' },
]

export default function PayloadCapacityChart() {
  return (
    <div className="w-full">
      <p className="text-[10px] uppercase tracking-wider text-[#EDEDE6]/50 mb-1">
        Payload capacity to low Earth orbit, tonnes
      </p>
      <div style={{ width: '100%', height: 150 }}>
        <ResponsiveContainer>
          <BarChart data={DATA} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="#3A3A3E" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#EDEDE6', fontSize: 9.5 }}
              axisLine={{ stroke: '#3A3A3E' }}
              tickLine={false}
            />
            <YAxis tick={{ fill: '#EDEDE6', fontSize: 10 }} axisLine={{ stroke: '#3A3A3E' }} tickLine={false} width={28} />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.06)' }}
              contentStyle={{ background: '#101014', border: '1px solid #3A3A3E', fontSize: 12, borderRadius: 6 }}
              labelStyle={{ color: '#EDEDE6' }}
              formatter={(value, _n, item) => [`${value} t`, item.payload.note]}
            />
            <Bar dataKey="tonnes" radius={[3, 3, 0, 0]}>
              {DATA.map((entry, i) => (
                <Cell key={entry.name} fill={i === DATA.length - 1 ? '#B0001E' : '#C9A84C'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
