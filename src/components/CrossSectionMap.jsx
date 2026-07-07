import { useJourneyStore } from '../state/useJourneyStore'
import { ZONES } from '../scenes/Rail'

export default function CrossSectionMap() {
  const t = useJourneyStore((s) => s.t)
  const jumpTo = useJourneyStore((s) => s.jumpTo)
  const activeZoneId = useJourneyStore((s) => s.activeZoneId)
  const mapCollapsed = useJourneyStore((s) => s.mapCollapsed)
  const toggleMap = useJourneyStore((s) => s.toggleMap)

  if (mapCollapsed) {
    return (
      <button
        type="button"
        onClick={toggleMap}
        aria-label="Show cross-section map"
        className="fixed left-3 bottom-[calc(58vh+12px)] sm:bottom-3 z-20 rounded-full bg-black/60 backdrop-blur border border-white/10 px-4 py-3 min-h-[44px] text-[#EDEDE6] text-xs shadow-lg"
      >
        Map
      </button>
    )
  }

  return (
    <div className="fixed left-3 bottom-[calc(58vh+12px)] sm:bottom-3 z-20 w-[min(78vw,300px)] rounded-xl bg-black/55 backdrop-blur border border-white/10 p-2.5 shadow-lg">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] uppercase tracking-wider text-[#EDEDE6]/55">Cross-section</span>
        <button
          type="button"
          onClick={toggleMap}
          aria-label="Hide cross-section map"
          className="text-[#EDEDE6]/50 text-xs min-w-[32px] min-h-[32px]"
        >
          ✕
        </button>
      </div>

      <div className="relative h-11">
        {/* Visual track */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3 rounded-full bg-[#0E0E12] border border-white/10 overflow-hidden flex pointer-events-none">
          {ZONES.map((zone) => (
            <div
              key={zone.id}
              style={{ flexGrow: zone.railRange[1] - zone.railRange[0], flexBasis: 0 }}
              className={`h-full border-r border-black/40 last:border-r-0 ${
                zone.id === activeZoneId ? 'bg-[#B0001E]/70' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Position marker */}
        <div
          className="absolute top-1/2 w-2.5 h-2.5 rounded-full bg-[#FF5A2E] border border-black/50 pointer-events-none"
          style={{ left: `${t * 100}%`, transform: 'translate(-50%, -50%)' }}
        />

        {/* Accessible tap targets, one per zone, overlaid on the visual track */}
        <div className="absolute inset-0 flex">
          {ZONES.map((zone) => {
            const [start, end] = zone.railRange
            return (
              <button
                key={zone.id}
                type="button"
                style={{ flexGrow: end - start, flexBasis: 0 }}
                className="h-full min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] rounded"
                aria-label={`Jump to ${zone.compartment}, ${zone.era}`}
                aria-current={zone.id === activeZoneId ? 'true' : undefined}
                onClick={() => jumpTo((start + end) / 2)}
              />
            )
          })}
        </div>
      </div>

      <div className="flex justify-between text-[9px] text-[#EDEDE6]/40 mt-1">
        <span>Nose</span>
        <span>Tail</span>
      </div>
    </div>
  )
}
