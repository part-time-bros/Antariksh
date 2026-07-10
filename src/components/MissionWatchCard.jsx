import { useState } from 'react'
import missionWatch from '../content/mission-watch.json'
import { audioEngine } from '../audio/audioEngine'

const STATUS_STYLES = {
  upcoming: { bg: '#1B4B43', label: 'Upcoming' },
  'in-progress': { bg: '#C9A84C', label: 'In progress' },
  resolved: { bg: '#3A3A3E', label: 'Resolved' },
}

export default function MissionWatchCard() {
  const [open, setOpen] = useState(true)

  return (
    <div className="fixed top-3 right-3 z-20 w-[min(82vw,300px)]">
      <button
        type="button"
        onClick={() => {
          audioEngine.playClick()
          setOpen((o) => !o)
        }}
        className="w-full flex items-center justify-between rounded-t-xl bg-black/65 backdrop-blur border border-white/10 px-3 py-2.5 min-h-[44px]"
        aria-expanded={open}
      >
        <span className="text-xs font-medium text-[#EDEDE6] tracking-wide">Mission Watch</span>
        <span className="text-[#EDEDE6]/50 text-xs">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="rounded-b-xl bg-black/55 backdrop-blur border border-t-0 border-white/10 p-2.5 space-y-2 max-h-[42vh] overflow-y-auto">
          {missionWatch.items.map((item) => {
            const style = STATUS_STYLES[item.status] || STATUS_STYLES.resolved
            return (
              <div key={item.id} className="rounded-lg bg-white/[0.04] p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full text-[#0E0E12] font-medium"
                    style={{ backgroundColor: style.bg }}
                  >
                    {style.label}
                  </span>
                  <span className="text-[9px] text-[#EDEDE6]/45">{item.window}</span>
                </div>
                <p className="text-xs font-medium text-[#EDEDE6] leading-snug">{item.title}</p>
                <p className="text-[10px] text-[#EDEDE6]/55 mt-0.5 leading-snug">{item.detail}</p>
              </div>
            )
          })}
          <p className="text-[9px] text-[#EDEDE6]/35 pt-1">Updated {missionWatch.lastUpdated}</p>
        </div>
      )}
    </div>
  )
}
