import { Suspense, useEffect, useMemo } from 'react'
import { Html } from '@react-three/drei'
import { useJourneyStore } from '../state/useJourneyStore'
import { ZONES } from './ZoneAnchors'
import timelineData from '../content/timeline.json'
import { INTERACTION_COMPONENTS } from '../components/ZoneInteractions'
import { audioEngine } from '../audio/audioEngine'

const timelineById = Object.fromEntries(timelineData.events.map((e) => [e.id, e]))
const zonesById = Object.fromEntries(ZONES.map((z) => [z.id, z]))

function PanelContent({ zone }) {
  const miniTimeline = useMemo(
    () =>
      zone.timelineRefs
        .map((id) => timelineById[id])
        .filter(Boolean)
        .sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999))
        .slice(0, 4),
    [zone]
  )

  return (
    <div
      className="relative w-[min(84vw,360px)] max-h-[62vh] overflow-y-auto rounded-xl border border-[#C9A84C]/40 bg-[#0B0B0E]/90 backdrop-blur-md shadow-[0_0_40px_rgba(201,168,76,0.15)] animate-hologram-in"
      style={{ pointerEvents: 'auto' }}
    >
      {/* corner brackets — the one flourish that sells "in-world terminal" over "web card" */}
      <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-[#C9A84C]" />
      <div className="absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-[#C9A84C]" />
      <div className="absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-[#C9A84C]" />
      <div className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-[#C9A84C]" />

      <div className="px-4 pt-3 pb-2 border-b border-[#C9A84C]/25">
        <p className="text-[10px] uppercase tracking-[0.15em] text-[#C9A84C]">{zone.compartment}</p>
        <p className="text-[9px] text-[#EDEDE6]/45">{zone.era}</p>
      </div>

      <div className="px-4 py-3">
        <h2
          className="text-lg font-semibold text-[#F5F0E8] leading-tight"
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
          <p key={i} className="text-[13px] text-[#EDEDE6]/80 leading-relaxed mb-2.5">
            {p}
          </p>
        ))}

        {miniTimeline.length > 0 && (
          <div className="mt-3 border-l-2 border-[#C9A84C]/25 pl-3 space-y-2">
            {miniTimeline.map((e) => (
              <div key={e.id}>
                <p className="text-[11px] text-[#C9A84C]">{e.date || e.year || 'Planned'}</p>
                <p className="text-[13px] text-[#EDEDE6]">{e.title}</p>
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

        <div className="h-2" />
      </div>
    </div>
  )
}

export default function ZonePanel3D() {
  const focusedZoneId = useJourneyStore((s) => s.focusedZoneId)

  useEffect(() => {
    if (focusedZoneId) audioEngine.playChime()
  }, [focusedZoneId])

  if (!focusedZoneId) return null
  const zone = zonesById[focusedZoneId]
  if (!zone) return null

  return (
    <Html position={zone.lookAt} center distanceFactor={7} zIndexRange={[10, 0]} style={{ position: 'relative' }}>
      <PanelContent zone={zone} />
    </Html>
  )
}
