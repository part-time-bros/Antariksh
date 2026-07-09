import { useEffect, useRef } from 'react'
import { useJourneyStore } from '../state/useJourneyStore'

const isTypingTarget = (el) =>
  !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)

/**
 * Full free-flight input: keyboard (WASD/arrows + Space/Shift for up/down)
 * sets low-frequency `held` flags on the store; drag (mouse or touch) feeds
 * a high-frequency look-delta ref so the per-frame flight loop can drain it
 * without subscribing to React state every frame. The on-screen joystick
 * (TouchJoystick.jsx) writes analog values into the same ref via the
 * returned setters, so keyboard and touch can't fight each other.
 */
export function useInputState() {
  const inputRef = useRef({
    dragDeltaYaw: 0,
    dragDeltaPitch: 0,
    isDragging: false,
    lastPointer: null,
    lastPointerId: null,
    joystickForward: 0, // -1..1, written by TouchJoystick
    joystickStrafe: 0, // -1..1
  })

  useEffect(() => {
    const { setHeld } = useJourneyStore.getState()

    const keyMap = {
      w: 'forward', W: 'forward', ArrowUp: 'forward',
      s: 'backward', S: 'backward', ArrowDown: 'backward',
      a: 'left', A: 'left', ArrowLeft: 'left',
      d: 'right', D: 'right', ArrowRight: 'right',
      ' ': 'up', e: 'up', E: 'up',
      Shift: 'down', q: 'down', Q: 'down',
    }

    const onKeyDown = (e) => {
      if (isTypingTarget(e.target)) return
      const dir = keyMap[e.key]
      if (dir) {
        e.preventDefault()
        setHeld(dir, true)
      }
    }
    const onKeyUp = (e) => {
      const dir = keyMap[e.key]
      if (dir) setHeld(dir, false)
    }
    const releaseAll = () => {
      ;['forward', 'backward', 'left', 'right', 'up', 'down'].forEach((d) => setHeld(d, false))
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', releaseAll)
    document.addEventListener('visibilitychange', releaseAll)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', releaseAll)
      document.removeEventListener('visibilitychange', releaseAll)
    }
  }, [])

  // Drag (mouse or a touch that isn't on the joystick) drives look only.
  const onPointerDown = (e) => {
    if (e.target.closest('[data-joystick]')) return
    inputRef.current.isDragging = true
    inputRef.current.lastPointerId = e.pointerId
    inputRef.current.lastPointer = { x: e.clientX, y: e.clientY }
  }
  const onPointerMove = (e) => {
    const s = inputRef.current
    if (!s.isDragging || s.lastPointerId !== e.pointerId || !s.lastPointer) return
    s.dragDeltaYaw += e.clientX - s.lastPointer.x
    s.dragDeltaPitch += e.clientY - s.lastPointer.y
    s.lastPointer = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = (e) => {
    if (inputRef.current.lastPointerId !== e.pointerId) return
    inputRef.current.isDragging = false
    inputRef.current.lastPointer = null
    inputRef.current.lastPointerId = null
  }

  const setJoystick = (forward, strafe) => {
    inputRef.current.joystickForward = forward
    inputRef.current.joystickStrafe = strafe
  }

  return { inputRef, onPointerDown, onPointerMove, onPointerUp, setJoystick }
}
