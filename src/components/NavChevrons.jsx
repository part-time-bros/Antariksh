import { useJourneyStore } from '../state/useJourneyStore'

function Chevron({ direction, label, glyph }) {
  const setHeld = useJourneyStore((s) => s.setHeld)

  const start = (e) => {
    e.preventDefault()
    setHeld(direction, true)
  }
  const stop = () => setHeld(direction, false)

  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      className="w-14 h-14 rounded-full bg-black/55 backdrop-blur border border-white/15 text-[#EDEDE6] text-2xl flex items-center justify-center active:bg-[#B0001E]/70 active:scale-95 transition select-none touch-none"
    >
      {glyph}
    </button>
  )
}

export default function NavChevrons() {
  return (
    <div className="fixed bottom-[calc(58vh+12px)] sm:bottom-8 right-3 sm:right-[420px] z-20 flex flex-col gap-3">
      <Chevron direction="forward" label="Move forward, toward the tail" glyph="▲" />
      <Chevron direction="backward" label="Move backward, toward the nose" glyph="▼" />
    </div>
  )
}
