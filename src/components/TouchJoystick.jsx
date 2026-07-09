import { useEffect, useRef, useState } from 'react'

const BASE_RADIUS = 52
const KNOB_RADIUS = 24

export default function TouchJoystick({ setJoystick }) {
  const baseRef = useRef(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const activeId = useRef(null)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    setIsTouch(window.matchMedia('(pointer: coarse)').matches)
  }, [])

  if (!isTouch) return null

  const updateFromEvent = (e) => {
    const base = baseRef.current
    if (!base) return
    const rect = base.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let dx = e.clientX - cx
    let dy = e.clientY - cy
    const dist = Math.hypot(dx, dy)
    const max = BASE_RADIUS - KNOB_RADIUS * 0.4
    if (dist > max) {
      dx = (dx / dist) * max
      dy = (dy / dist) * max
    }
    setKnob({ x: dx, y: dy })
    // forward = pushing the knob up (negative screen Y); strafe = right-positive.
    setJoystick(-dy / max, dx / max)
  }

  const onPointerDown = (e) => {
    e.stopPropagation()
    activeId.current = e.pointerId
    e.currentTarget.setPointerCapture(e.pointerId)
    updateFromEvent(e)
  }
  const onPointerMove = (e) => {
    if (activeId.current !== e.pointerId) return
    e.stopPropagation()
    updateFromEvent(e)
  }
  const endTouch = (e) => {
    if (activeId.current !== e.pointerId) return
    e.stopPropagation()
    activeId.current = null
    setKnob({ x: 0, y: 0 })
    setJoystick(0, 0)
  }

  return (
    <div
      ref={baseRef}
      data-joystick
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endTouch}
      onPointerCancel={endTouch}
      className="fixed left-5 bottom-5 z-20 rounded-full bg-black/40 border border-white/15 touch-none select-none"
      style={{ width: BASE_RADIUS * 2, height: BASE_RADIUS * 2 }}
      aria-label="Move — drag to fly forward, back, left, or right"
      role="slider"
      aria-valuetext="Flight joystick"
    >
      <div
        className="absolute rounded-full bg-white/25 border border-white/40"
        style={{
          width: KNOB_RADIUS * 2,
          height: KNOB_RADIUS * 2,
          left: BASE_RADIUS - KNOB_RADIUS + knob.x,
          top: BASE_RADIUS - KNOB_RADIUS + knob.y,
          transition: activeId.current ? 'none' : 'left 0.15s ease-out, top 0.15s ease-out',
        }}
      />
    </div>
  )
}
