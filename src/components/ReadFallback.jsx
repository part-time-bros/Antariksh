import zonesData from '../content/zones.json'
import timelineData from '../content/timeline.json'
import missionWatch from '../content/mission-watch.json'

const zones = [...zonesData.zones].sort((a, b) => a.order - b.order)
const timelineById = Object.fromEntries(timelineData.events.map((e) => [e.id, e]))

export default function ReadFallback() {
  return (
    <main className="min-h-screen bg-[#0B0B0E] text-[#EDEDE6] px-5 py-10 sm:px-10">
      <div className="max-w-2xl mx-auto">
        <a href="/" className="text-xs text-[#C9A84C] underline underline-offset-2">
          ← Back to the 3D experience
        </a>
        <h1
          className="text-3xl sm:text-4xl font-bold text-[#F5F0E8] mt-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Antariksh Yatra
        </h1>
        <p className="text-sm text-[#EDEDE6]/60 mt-2">
          Sixty years of the Indian space programme, in text — a full-content alternative to the 3D
          journey for low-powered devices, screen readers, and anyone who'd rather read.
        </p>

        <section aria-label="Mission Watch" className="mt-8 rounded-xl border border-white/10 p-4">
          <h2 className="text-lg font-semibold text-[#F5F0E8]">Mission Watch</h2>
          <ul className="mt-2 space-y-2">
            {missionWatch.items.map((item) => (
              <li key={item.id} className="text-sm">
                <span className="text-[#C9A84C] text-xs uppercase tracking-wide">{item.status}</span>
                {' · '}
                <span className="font-medium text-[#EDEDE6]">{item.title}</span>
                <span className="text-[#EDEDE6]/55"> — {item.detail}</span>
              </li>
            ))}
          </ul>
        </section>

        {zones.map((zone) => (
          <section key={zone.id} className="mt-10">
            <p className="text-xs uppercase tracking-wider text-[#C9A84C]">
              {zone.compartment} · {zone.era}
            </p>
            <h2 className="text-2xl font-semibold text-[#F5F0E8] mt-1">{zone.headline}</h2>

            <dl className="flex flex-wrap gap-x-6 gap-y-1 mt-3">
              {zone.stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-[10px] uppercase tracking-wider text-[#EDEDE6]/45">{s.label}</dt>
                  <dd className="text-sm font-medium text-[#EDEDE6]">{s.value}</dd>
                </div>
              ))}
            </dl>

            {zone.paragraphs.map((p, i) => (
              <p key={i} className="text-sm text-[#EDEDE6]/80 leading-relaxed mt-3">
                {p}
              </p>
            ))}

            {zone.timelineRefs.length > 0 && (
              <ul className="mt-4 space-y-1.5 border-l-2 border-white/10 pl-3">
                {zone.timelineRefs
                  .map((id) => timelineById[id])
                  .filter(Boolean)
                  .sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999))
                  .map((e) => (
                    <li key={e.id} className="text-sm">
                      <span className="text-[#C9A84C]">{e.date || e.year || 'Planned'}</span>{' '}
                      <span className="text-[#EDEDE6]">{e.title}</span>
                    </li>
                  ))}
              </ul>
            )}
          </section>
        ))}

        <section aria-label="Full timeline" className="mt-12 border-t border-white/10 pt-6">
          <h2 className="text-lg font-semibold text-[#F5F0E8]">Full timeline</h2>
          <ol className="mt-3 space-y-1.5">
            {timelineData.events.map((e) => (
              <li key={e.id} className="text-sm">
                <span className="text-[#C9A84C]">{e.date || e.year || 'Planned'}</span>{' '}
                <span className="text-[#EDEDE6]">{e.title}</span>
                <span className="text-[#EDEDE6]/50"> — {e.detail}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  )
}
