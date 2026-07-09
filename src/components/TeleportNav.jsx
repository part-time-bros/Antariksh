import { useJourneyStore } from '../state/useJourneyStore'
import { ZONES } from '../scenes/ZoneAnchors'

export default function TeleportNav() {
  const navOpen = useJourneyStore((s) => s.navOpen)
  const toggleNav = useJourneyStore((s) => s.toggleNav)
  const teleportTo = useJourneyStore((s) => s.teleportTo)
  const focusedZoneId = useJourneyStore((s) => s.focusedZoneId)

  if (!navOpen) {
    return (
      <button
        type="button"
        onClick={toggleNav}
        aria-label="Show zone list"
        className="fixed right-3 bottom-5 z-20 rounded-full bg-black/55 backdrop-blur border border-white/10 px-4 py-3 min-h-[44px] text-[#EDEDE6] text-xs shadow-lg"
      >
        Zones
      </button>
    )
  }

  return (
    <div className="fixed right-3 bottom-5 z-20 w-[min(78vw,280px)] rounded-xl bg-black/60 backdrop-blur border border-white/10 shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10">
        <span className="text-[10px] uppercase tracking-wider text-[#EDEDE6]/55">Fly to a zone</span>
        <button
          type="button"
          onClick={toggleNav}
          aria-label="Hide zone list"
          className="text-[#EDEDE6]/50 text-xs min-w-[32px] min-h-[32px]"
        >
          ✕
        </button>
      </div>
      <div className="max-h-[42vh] overflow-y-auto">
        {ZONES.map((zone, i) => (
          <button
            key={zone.id}
            type="button"
            onClick={() => teleportTo(zone.anchor.clone(), zone.lookAt)}
            className={`w-full text-left px-3 py-2.5 min-h-[44px] border-b border-white/5 last:border-b-0 transition ${
              focusedZoneId === zone.id ? 'bg-[#B0001E]/25' : 'hover:bg-white/5'
            }`}
          >
            <p className="text-[9px] text-[#C9A84C]">{String(i + 1).padStart(2, '0')} · {zone.compartment}</p>
            <p className="text-xs text-[#EDEDE6] font-medium">{zone.era}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
