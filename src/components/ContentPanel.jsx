import { Suspense, useMemo } from 'react'
import { useJourneyStore } from '../state/useJourneyStore'
import zonesData from '../content/zones.json'
import timelineData from '../content/timeline.json'
import { INTERACTION_COMPONENTS } from './ZoneInteractions'

const zonesById = Object.fromEntries(zonesData.zones.map((z) => [z.id, z]))
const timelineById = Object.fromEntries(timelineData.events.map((e) => [e.id, e]))

export default function ContentPanel() {
  const activeZoneId = useJourneyStore((s) => s.activeZoneId)
  const panelOpen = useJourneyStore((s) => s.panelOpen)
  const togglePanel = useJourneyStore((s) => s.togglePanel)
  const reducedMotion = useJourneyStore((s) => s.reducedMotion)

  const zone = zonesById[activeZoneId]
  const miniTimeline = useMemo(
    () =>
      zone.timelineRefs
        .map((id) => timelineById[id])
        .filter(Boolean)
        .sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999)),
    [zone]
  )

  if (!panelOpen) {
    return (
      <button
        type="button"
        onClick={togglePanel}
        aria-label={`Show details for ${zone.compartment}`}
        className="fixed right-3 bottom-3 z-20 rounded-full bg-black/60 backdrop-blur border border-white/10 px-4 py-3 min-h-[44px] text-[#EDEDE6] text-sm shadow-lg"
      >
        {zone.compartment} ↑
      </button>
    )
  }

  return (
    <section
      key={zone.id}
      aria-label={`${zone.compartment}: ${zone.era}`}
      className={`fixed inset-x-0 bottom-0 z-20 sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[400px] max-h-[58vh] sm:max-h-none sm:h-full overflow-y-auto rounded-t-2xl sm:rounded-none bg-[#0B0B0E]/85 backdrop-blur-md border-t sm:border-t-0 sm:border-l border-white/10 ${
        reducedMotion ? '' : 'animate-panel-in'
      }`}
    >
      <div className="sticky top-0 bg-[#0B0B0E]/95 backdrop-blur px-4 pt-3 pb-2 border-b border-white/10 flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#C9A84C]">{zone.compartment}</p>
          <p className="text-[10px] text-[#EDEDE6]/50">{zone.era}</p>
        </div>
        <button
          type="button"
          onClick={togglePanel}
          aria-label="Collapse panel"
          className="text-[#EDEDE6]/60 text-lg leading-none min-w-[36px] min-h-[36px]"
        >
          ⌄
        </button>
      </div>

      <div className="px-4 py-3">
        <h2
          className="text-xl font-semibold text-[#F5F0E8] leading-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {zone.headline}
        </h2>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 mb-3">
          {zone.stats.map((s) => (
            <div key={s.label}>
              <p className="text-[9px] uppercase tracking-wider text-[#EDEDE6]/45">{s.label}</p>
              <p className="text-sm font-medium text-[#EDEDE6]">{s.value}</p>
            </div>
          ))}
        </div>

        {zone.paragraphs.map((p, i) => (
          <p key={i} className="text-sm text-[#EDEDE6]/80 leading-relaxed mb-2.5">
            {p}
          </p>
        ))}

        {miniTimeline.length > 0 && (
          <div className="mt-3 border-l-2 border-white/10 pl-3 space-y-2">
            {miniTimeline.map((e) => (
              <div key={e.id}>
                <p className="text-xs text-[#C9A84C]">{e.date || e.year || 'Planned'}</p>
                <p className="text-sm text-[#EDEDE6]">{e.title}</p>
              </div>
            ))}
          </div>
        )}

        <Suspense fallback={null}>
          {zone.interactions.map((id) => {
            const Widget = INTERACTION_COMPONENTS[id]
            return Widget ? <Widget key={id} /> : null
          })}
        </Suspense>

        <div className="h-6" />
      </div>
    </section>
  )
}
