import { useEffect, useState } from 'react'

export default function ControlsHint() {
  const [visible, setVisible] = useState(true)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      setIsTouch(window.matchMedia('(pointer: coarse)').matches)
    }
    const timer = setTimeout(() => setVisible(false), 6000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed top-3 left-1/2 -translate-x-1/2 z-20 rounded-full bg-black/55 backdrop-blur border border-white/10 px-4 py-2 text-[11px] text-[#EDEDE6]/80 pointer-events-none whitespace-nowrap"
      style={{ animation: 'panel-in 0.4s ease-out' }}
    >
      {isTouch
        ? 'Joystick to fly · drag to look · fly near a beacon for its story'
        : 'WASD to fly · drag to look · Space/Shift for up/down · fly near a beacon'}
    </div>
  )
}
