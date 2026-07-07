import { useEffect, useRef } from 'react'
import { useJourneyStore } from '../state/useJourneyStore'

const isTypingTarget = (el) =>
  !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)

/**
 * Owns the raw, high-frequency parts of input (wheel accumulation, drag
 * deltas) in a plain ref so the per-frame rail-drive loop can drain them
 * without subscribing to React state every frame. Keyboard press/release
 * is low-frequency, so it's fine to route straight into the Zustand store's
 * `held` flags — the same flags the on-screen chevrons (NavChevrons.jsx)
 * write to via press-and-hold.
 */
export function useInputState() {
  const inputRef = useRef({
    wheelDelta: 0,
    dragDeltaYaw: 0,
    dragDeltaPitch: 0,
    isDragging: false,
    lastPointer: null,
  })

  useEffect(() => {
    const { setHeld } = useJourneyStore.getState()

    const onKeyDown = (e) => {
      if (isTypingTarget(e.target)) return
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') setHeld('forward', true)
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') setHeld('backward', true)
    }
    const onKeyUp = (e) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') setHeld('forward', false)
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') setHeld('backward', false)
    }
    // Don't strand the dolly mid-move if focus/visibility changes while a key is held.
    const releaseAll = () => {
      setHeld('forward', false)
      setHeld('backward', false)
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

  // Wheel/trackpad over the canvas drives the dolly directly (Section 4.1 —
  // the one place "scroll" is welcome, since it's moving the camera through
  // 3D space, not a page).
  const onWheel = (e) => {
    inputRef.current.wheelDelta += e.deltaY
  }

  // Pointer drag (mouse or touch) drives free-look only. Forward/backward
  // touch movement is handled by the always-visible chevrons instead of a
  // second, competing swipe gesture on the same canvas — see DECISIONS.md #4.
  const onPointerDown = (e) => {
    inputRef.current.isDragging = true
    inputRef.current.lastPointer = { x: e.clientX, y: e.clientY }
  }
  const onPointerMove = (e) => {
    const s = inputRef.current
    if (!s.isDragging || !s.lastPointer) return
    s.dragDeltaYaw += e.clientX - s.lastPointer.x
    s.dragDeltaPitch += e.clientY - s.lastPointer.y
    s.lastPointer = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = () => {
    inputRef.current.isDragging = false
    inputRef.current.lastPointer = null
  }

  return { inputRef, onWheel, onPointerDown, onPointerMove, onPointerUp }
}
