import { lazy, useMemo, useState } from 'react'
import { useJourneyStore } from '../state/useJourneyStore'
import timeline from '../content/timeline.json'
import { audioEngine } from '../audio/audioEngine'

// Code-split: recharts is a sizeable dependency used by only 2 of these 12
// widgets, so it shouldn't be in the initial bundle everyone downloads
// before even pressing "Begin the journey" (Section 12 performance budget).
const PayloadCapacityChart = lazy(() => import('./Charts/PayloadCapacityChart'))
const MilestonesPerDecadeChart = lazy(() => import('./Charts/MilestonesPerDecadeChart'))

const cardCls = 'rounded-lg border border-white/10 bg-white/[0.03] p-3 mt-3'

// ---------------------------------------------------------------------------
function ThumbaCallout() {
  return (
    <div className={cardCls}>
      <p className="text-[11px] uppercase tracking-wider text-[#C9A84C] mb-1">On the ground, 1963</p>
      <p className="text-sm text-[#EDEDE6]/85 leading-relaxed">
        The first launch station had no dedicated buildings yet. Rocket payloads were assembled in a
        nearby church, and components moved across the site by bicycle and bullock cart.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
const SARABHAI_LINES = [
  "A developing country shouldn't chase a space race for its own sake — it should use advanced technology to solve real problems, at national scale.",
  'The vision behind INCOSPAR was practical from the start: satellites for communication, weather, and resource-mapping, not prestige missions.',
]

function SarabhaiQuote() {
  const [i, setI] = useState(0)
  return (
    <div className={cardCls}>
      <p className="text-[11px] uppercase tracking-wider text-[#C9A84C] mb-1">Sarabhai's vision, paraphrased</p>
      <p className="text-sm text-[#EDEDE6]/85 leading-relaxed italic">{SARABHAI_LINES[i]}</p>
      <button
        type="button"
        onClick={() => setI((n) => (n + 1) % SARABHAI_LINES.length)}
        className="mt-2 text-xs text-[#EDEDE6]/55 underline underline-offset-2 min-h-[32px]"
      >
        Next
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
function ThenVsNowSlider() {
  const [pos, setPos] = useState(0)
  const kg = Math.round(40 + pos * (3800 - 40))
  return (
    <div className={cardCls}>
      <p className="text-[11px] uppercase tracking-wider text-[#C9A84C] mb-1">1980 → 1994, payload to orbit</p>
      <input
        type="range"
        min={0}
        max={100}
        value={pos * 100}
        onChange={(e) => setPos(Number(e.target.value) / 100)}
        className="w-full accent-[#B0001E]"
        aria-label="Slide between SLV-3 and PSLV payload capacity"
      />
      <div className="flex justify-between text-[10px] text-[#EDEDE6]/50 mt-1">
        <span>SLV-3 · ~40 kg</span>
        <span>PSLV · ~3,800 kg</span>
      </div>
      <p className="text-sm text-[#EDEDE6] mt-2 font-medium">≈ {kg.toLocaleString()} kg to low Earth orbit</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
const GAGANYATRIS = [
  { name: 'Prasanth Nair', role: 'Gaganyatri, IAF test pilot' },
  { name: 'Ajit Krishnan', role: 'Gaganyatri, IAF test pilot' },
  { name: 'Angad Pratap', role: 'Gaganyatri, IAF test pilot' },
  { name: 'Shubhanshu Shukla', role: 'Gaganyatri · flew to the ISS, 2025' },
]

function GaganyatriRoster() {
  return (
    <div className={cardCls}>
      <p className="text-[11px] uppercase tracking-wider text-[#C9A84C] mb-2">The four gaganyatris, named 2024</p>
      <div className="grid grid-cols-2 gap-2">
        {GAGANYATRIS.map((p) => (
          <div key={p.name} className="rounded-md bg-black/25 px-2 py-2">
            <p className="text-xs font-medium text-[#EDEDE6]">{p.name}</p>
            <p className="text-[10px] text-[#EDEDE6]/55">{p.role}</p>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-[#EDEDE6]/45 mt-2">
        Rakesh Sharma (1984) remains the first Indian in space; Shukla is the second.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
function SatelliteBurstButton() {
  const trigger = useJourneyStore((s) => s.triggerSatelliteBurst)
  return (
    <div className={cardCls}>
      <p className="text-[11px] uppercase tracking-wider text-[#C9A84C] mb-1">PSLV-C37 · 15 Feb 2017</p>
      <p className="text-sm text-[#EDEDE6]/85 mb-2">104 satellites, one launch — a world record at the time.</p>
      <button
        type="button"
        onClick={() => {
          audioEngine.playBurst()
          trigger()
        }}
        className="rounded-full bg-[#B0001E] text-[#F5F0E8] text-xs px-3 py-2 min-h-[40px] hover:brightness-110 transition"
      >
        Replay the launch
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
const DESTINATIONS = [
  { id: 'moon', label: 'Moon', detail: 'Chandrayaan-3 soft-landed near the south pole, 2023.' },
  { id: 'mars', label: 'Mars', detail: 'Mangalyaan reached orbit on the first attempt, 2014.' },
  { id: 'sun', label: 'Sun (L1)', detail: "Aditya-L1 reached its halo orbit at Sun-Earth L1, 2024." },
  { id: 'iss', label: 'ISS', detail: 'Shubhanshu Shukla flew there via Axiom-4, 2025.' },
  { id: 'venus', label: 'Venus', detail: 'Shukrayaan-1 is in active planning, no launch date yet.' },
]

function TrajectorySelector() {
  const [active, setActive] = useState(DESTINATIONS[0].id)
  const current = DESTINATIONS.find((d) => d.id === active)
  return (
    <div className={cardCls}>
      <p className="text-[11px] uppercase tracking-wider text-[#C9A84C] mb-2">Where India has pointed a spacecraft</p>
      <div className="flex flex-wrap gap-1.5">
        {DESTINATIONS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setActive(d.id)}
            className={`rounded-full px-3 py-1.5 text-xs min-h-[32px] transition ${
              active === d.id ? 'bg-[#B0001E] text-[#F5F0E8]' : 'bg-white/10 text-[#EDEDE6]/75'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-[#EDEDE6]/85 mt-2">{current.detail}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
function EngineDiagram() {
  const stages = [
    { label: 'S200 solid boosters ×2', note: 'Heritage from SLV-3/ASLV solid motors' },
    { label: 'L110 liquid core · Vikas engines', note: 'Vikas is a licensed descendant of France\u2019s Viking engine' },
    { label: 'C25 cryogenic upper stage · CE-20', note: 'Built indigenously after a blocked 1990s tech transfer' },
  ]
  return (
    <div className={cardCls}>
      <p className="text-[11px] uppercase tracking-wider text-[#C9A84C] mb-2">LVM3, stage by stage (tail to nose)</p>
      <div className="space-y-1.5">
        {stages.map((s, i) => (
          <div key={s.label} className="rounded-md bg-black/25 px-2.5 py-2 border-l-2" style={{ borderColor: i === 2 ? '#B0001E' : '#3A3A3E' }}>
            <p className="text-xs font-medium text-[#EDEDE6]">{s.label}</p>
            <p className="text-[10px] text-[#EDEDE6]/55">{s.note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
function RoadmapScrubber() {
  const upcoming = useMemo(
    () =>
      timeline.events
        .filter((e) => e.status === 'upcoming')
        .sort((a, b) => (a.year || 9999) - (b.year || 9999)),
    []
  )
  const [idx, setIdx] = useState(0)
  const item = upcoming[idx]
  return (
    <div className={cardCls}>
      <p className="text-[11px] uppercase tracking-wider text-[#C9A84C] mb-2">The roadmap, 2026 → 2040</p>
      <input
        type="range"
        min={0}
        max={upcoming.length - 1}
        value={idx}
        onChange={(e) => setIdx(Number(e.target.value))}
        className="w-full accent-[#B0001E]"
        aria-label="Scrub through upcoming ISRO milestones"
      />
      <p className="text-xs text-[#C9A84C] mt-2">{item.year || 'Planned'}</p>
      <p className="text-sm text-[#EDEDE6] font-medium">{item.title}</p>
      <p className="text-xs text-[#EDEDE6]/60 mt-0.5">{item.detail}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
const PATCHES = [
  { id: 'chandrayaan3', label: 'CH-3', color: '#B0001E' },
  { id: 'mom', label: 'MOM', color: '#C9A84C' },
  { id: 'gaganyaan', label: 'GYN', color: '#1B4B43' },
  { id: 'aditya', label: 'AL1', color: '#FF5A2E' },
  { id: 'nisar', label: 'NSR', color: '#3A6FB0' },
]

function PatchGallery() {
  return (
    <div className={cardCls}>
      <p className="text-[11px] uppercase tracking-wider text-[#C9A84C] mb-2">Mission roundels (stylized)</p>
      <div className="flex flex-wrap gap-2">
        {PATCHES.map((p) => (
          <div
            key={p.id}
            className="w-12 h-12 rounded-full flex items-center justify-center text-[9px] font-bold text-[#0E0E12]"
            style={{ backgroundColor: p.color }}
            title={p.id}
          >
            {p.label}
          </div>
        ))}
      </div>
      <p className="text-[10px] text-[#EDEDE6]/40 mt-2">
        Original stand-ins, not official ISRO mission patches — swap in the real, freely licensed
        patches from isro.gov.in when this asset pass happens (see DECISIONS.md).
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
const COLLABORATIONS = [
  { partner: 'Soviet Union / Russia', detail: 'Launched Aryabhata (1975); flew Rakesh Sharma (1984)' },
  { partner: 'France', detail: 'Viking engine, licensed ancestor of the Vikas engine' },
  { partner: 'USA / NASA', detail: 'Chandrayaan-1 Moon Mineralogy Mapper; NISAR; Axiom-4 ISS flight' },
  { partner: 'Japan / JAXA', detail: 'Partner on the planned LUPEX lunar rover' },
  { partner: 'Europe / Arianespace', detail: 'Launched APPLE (1981) and other early satellites' },
]

function CollaborationList() {
  return (
    <div className={cardCls}>
      <p className="text-[11px] uppercase tracking-wider text-[#C9A84C] mb-2">Nobody does this alone</p>
      <ul className="space-y-1.5">
        {COLLABORATIONS.map((c) => (
          <li key={c.partner} className="text-xs">
            <span className="text-[#EDEDE6] font-medium">{c.partner}</span>
            <span className="text-[#EDEDE6]/55"> — {c.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------------------
export const INTERACTION_COMPONENTS = {
  'thumba-callout': ThumbaCallout,
  'sarabhai-quote': SarabhaiQuote,
  'then-vs-now-slider': ThenVsNowSlider,
  'gaganyatri-roster': GaganyatriRoster,
  'payload-chart': PayloadCapacityChart,
  'satellite-burst': SatelliteBurstButton,
  'trajectory-selector': TrajectorySelector,
  'engine-diagram': EngineDiagram,
  'roadmap-scrubber': RoadmapScrubber,
  'satellites-over-time-chart': MilestonesPerDecadeChart,
  'patch-gallery': PatchGallery,
  'collaboration-list': CollaborationList,
}
