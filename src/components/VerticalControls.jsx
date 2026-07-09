import { useEffect, useState } from 'react'
import { useJourneyStore } from '../state/useJourneyStore'

function VButton({ direction, label, glyph }) {
  const setHeld = useJourneyStore((s) => s.setHeld)
  const start = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setHeld(direction, true)
  }
  const stop = (e) => {
    e.stopPropagation()
    setHeld(direction, false)
  }
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      className="w-11 h-11 rounded-full bg-black/40 border border-white/15 text-[#EDEDE6] text-lg flex items-center justify-center active:bg-[#B0001E]/60 active:scale-95 transition select-none touch-none"
    >
      {glyph}
    </button>
  )
}

export default function VerticalControls() {
  const [isTouch, setIsTouch] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    setIsTouch(window.matchMedia('(pointer: coarse)').matches)
  }, [])
  if (!isTouch) return null

  return (
    <div className="fixed left-[124px] bottom-5 z-20 flex flex-col gap-2.5">
      <VButton direction="up" label="Fly up" glyph="▲" />
      <VButton direction="down" label="Fly down" glyph="▼" />
    </div>
  )
}
