import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useJourneyStore } from '../state/useJourneyStore'

const MAX_T_PER_SECOND = 0.085 // full-length traversal in ~12s at max speed
const RAMP_UP = 2.6 // how quickly velocity approaches target (per second)
const RAMP_DOWN = 3.4 // slightly snappier stop than start, never a snap-back
const WHEEL_TO_T = 0.00014
const JUMP_SECONDS = 2 // map-tap navigation: 1.5-2.5s per spec 4.1/8.2
const REDUCED_MOTION_STEP = 0.06 // instant per-press jump when motion is reduced

const YAW_LIMIT = 0.85 // ~49 degrees either side of the rail's forward direction
const PITCH_LIMIT = 0.55 // ~31 degrees up/down
const LOOK_SENSITIVITY = 0.0028
const LOOK_DAMPING = 6 // how quickly look easing settles

/**
 * Drives `t` every frame from held keys/buttons + wheel, and integrates
 * free-look yaw/pitch from drag deltas. Returns a ref CameraRig reads to
 * position the actual three.js camera — this hook never touches the
 * camera directly, keeping "drive the state" separate from "render the
 * state" (see scenes/CameraRig.jsx).
 */
export function useRailDrive(inputRef) {
  const velocityRef = useRef(0)
  const lookRef = useRef({ yaw: 0, pitch: 0 })
  const prevHeldRef = useRef({ forward: false, backward: false })

  useFrame((_, rawDelta) => {
    const store = useJourneyStore.getState()
    const dt = Math.min(rawDelta, 0.1) // guard against big deltas after a tab switch
    const input = inputRef.current

    // ---- Reduced motion: discrete stepped jumps, no continuous glide ----
    if (store.reducedMotion) {
      if (store.held.forward && !prevHeldRef.current.forward) store.setT(store.t + REDUCED_MOTION_STEP)
      if (store.held.backward && !prevHeldRef.current.backward) store.setT(store.t - REDUCED_MOTION_STEP)
      if (input.wheelDelta !== 0) {
        store.setT(store.t + (input.wheelDelta > 0 ? REDUCED_MOTION_STEP : -REDUCED_MOTION_STEP))
        input.wheelDelta = 0
      }
      prevHeldRef.current = { ...store.held }
      velocityRef.current = 0
      lookRef.current.yaw = 0
      lookRef.current.pitch = 0
      return
    }

    // ---- Map-jump animation in flight: it owns `t` this frame ----------
    if (store.jumpTarget) {
      const elapsed = (performance.now() - store.jumpTarget.startedAt) / 1000
      const progress = Math.min(1, elapsed / JUMP_SECONDS)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      const { from, to } = store.jumpTarget
      store.setT(from + (to - from) * eased)
      if (progress >= 1) store.clearJump()
      velocityRef.current = 0
      return
    }

    // ---- Held keyboard/chevron input -> target velocity ----------------
    let target = 0
    if (store.held.forward) target += MAX_T_PER_SECOND
    if (store.held.backward) target -= MAX_T_PER_SECOND

    const rampRate = target === 0 ? RAMP_DOWN : RAMP_UP
    const alpha = 1 - Math.exp(-rampRate * dt) // frame-rate independent easing
    velocityRef.current += (target - velocityRef.current) * alpha
    if (Math.abs(velocityRef.current) < 0.00005 && target === 0) velocityRef.current = 0

    // ---- Wheel: drained every frame, added on top of the eased glide ---
    const wheelStep = input.wheelDelta * WHEEL_TO_T
    input.wheelDelta = 0

    if (velocityRef.current !== 0 || wheelStep !== 0) {
      store.setT(store.t + velocityRef.current * dt + wheelStep)
    }

    // ---- Free-look: eased drag deltas, clamped to a comfortable range --
    const targetYaw = Math.max(
      -YAW_LIMIT,
      Math.min(YAW_LIMIT, lookRef.current.yaw + input.dragDeltaYaw * LOOK_SENSITIVITY)
    )
    const targetPitch = Math.max(
      -PITCH_LIMIT,
      Math.min(PITCH_LIMIT, lookRef.current.pitch + input.dragDeltaPitch * LOOK_SENSITIVITY)
    )
    input.dragDeltaYaw = 0
    input.dragDeltaPitch = 0
    const lookAlpha = 1 - Math.exp(-LOOK_DAMPING * dt)
    lookRef.current.yaw += (targetYaw - lookRef.current.yaw) * lookAlpha
    lookRef.current.pitch += (targetPitch - lookRef.current.pitch) * lookAlpha
  })

  return lookRef
}
