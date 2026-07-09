import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useJourneyStore } from '../state/useJourneyStore'
import { SPAWN_POSITION, SPAWN_LOOK_AT, WORLD_BOUNDS_RADIUS } from '../scenes/ZoneAnchors'

const MAX_SPEED = 9 // meters/second at full input — ship is ~37m long, crosses it in ~4s
const RAMP_UP = 3.2
const RAMP_DOWN = 4.5
const YAW_SENSITIVITY = 0.0032
const PITCH_SENSITIVITY = 0.0032
const PITCH_LIMIT = Math.PI / 2 - 0.05 // just short of straight up/down, avoids gimbal flip
const TELEPORT_SECONDS = 1.6

const worldUp = new THREE.Vector3(0, 1, 0)

// Face the ship at spawn, computed from the actual points rather than
// hand-derived trig (easy to get a sign wrong doing that by hand).
const _initialDir = new THREE.Vector3().subVectors(SPAWN_LOOK_AT, SPAWN_POSITION).normalize()
const INITIAL_YAW = Math.atan2(_initialDir.x, _initialDir.z)
const INITIAL_PITCH = Math.asin(_initialDir.y)

/**
 * Owns camera position + yaw/pitch as refs (not store state — this runs
 * every frame and nothing outside the 3D layer needs to react to it
 * directly; ZoneAnchors proximity is derived from position separately).
 * Returns the refs for CameraRig to apply to the actual three.js camera.
 */
export function useFreeFlight(inputRef) {
  const position = useRef(SPAWN_POSITION.clone())
  const yaw = useRef(INITIAL_YAW)
  const pitch = useRef(INITIAL_PITCH)
  const velocity = useRef(new THREE.Vector3())

  const forwardVec = useRef(new THREE.Vector3())
  const rightVec = useRef(new THREE.Vector3())
  const moveDir = useRef(new THREE.Vector3())

  useFrame((_, rawDelta) => {
    const store = useJourneyStore.getState()
    const dt = Math.min(rawDelta, 0.1)
    const input = inputRef.current

    // ---- Teleport (tap a waypoint in the nav) owns position this frame ----
    if (store.teleportTarget) {
      const tt = store.teleportTarget
      if (tt.instant || store.reducedMotion) {
        position.current.copy(tt.position)
        const dir = new THREE.Vector3().subVectors(tt.lookAt, tt.position).normalize()
        yaw.current = Math.atan2(dir.x, dir.z)
        pitch.current = THREE.MathUtils.clamp(Math.asin(dir.y), -PITCH_LIMIT, PITCH_LIMIT)
        store.clearTeleport()
      } else {
        const elapsed = (performance.now() - tt.startedAt) / 1000
        const progress = Math.min(1, elapsed / TELEPORT_SECONDS)
        const eased = 1 - Math.pow(1 - progress, 3)
        position.current.lerpVectors(position.current, tt.position, progress >= 1 ? 1 : eased * 0.35)
        if (progress >= 1) {
          position.current.copy(tt.position)
          const dir = new THREE.Vector3().subVectors(tt.lookAt, tt.position).normalize()
          yaw.current = Math.atan2(dir.x, dir.z)
          pitch.current = THREE.MathUtils.clamp(Math.asin(dir.y), -PITCH_LIMIT, PITCH_LIMIT)
          store.clearTeleport()
        }
      }
      velocity.current.set(0, 0, 0)
      return
    }

    // ---- Look: drag deltas map directly to yaw/pitch, pitch clamped -------
    yaw.current -= input.dragDeltaYaw * YAW_SENSITIVITY
    pitch.current = THREE.MathUtils.clamp(
      pitch.current - input.dragDeltaPitch * PITCH_SENSITIVITY,
      -PITCH_LIMIT,
      PITCH_LIMIT
    )
    input.dragDeltaYaw = 0
    input.dragDeltaPitch = 0

    // ---- Move: keyboard held flags + analog joystick, combined ------------
    const kbForward = (store.held.forward ? 1 : 0) - (store.held.backward ? 1 : 0)
    const kbStrafe = (store.held.right ? 1 : 0) - (store.held.left ? 1 : 0)
    const kbVertical = (store.held.up ? 1 : 0) - (store.held.down ? 1 : 0)
    const forwardInput = THREE.MathUtils.clamp(kbForward + input.joystickForward, -1, 1)
    const strafeInput = THREE.MathUtils.clamp(kbStrafe + input.joystickStrafe, -1, 1)

    forwardVec.current.set(Math.sin(yaw.current), 0, Math.cos(yaw.current))
    // Pitch tilts the forward vector too — this is a flying camera, so
    // looking up and pressing forward climbs, not just spins in place.
    const pitchedForward = forwardVec.current
      .clone()
      .multiplyScalar(Math.cos(pitch.current))
    pitchedForward.y = Math.sin(pitch.current)
    rightVec.current.crossVectors(pitchedForward, worldUp).normalize()
    if (rightVec.current.lengthSq() < 1e-6) rightVec.current.set(1, 0, 0)

    moveDir.current
      .set(0, 0, 0)
      .addScaledVector(pitchedForward, forwardInput)
      .addScaledVector(rightVec.current, strafeInput)
      .addScaledVector(worldUp, kbVertical)

    const targetVelocity =
      moveDir.current.lengthSq() > 0.0001
        ? moveDir.current.normalize().multiplyScalar(MAX_SPEED)
        : new THREE.Vector3()

    const rampRate = targetVelocity.lengthSq() > 0 ? RAMP_UP : RAMP_DOWN
    const alpha = 1 - Math.exp(-rampRate * dt)
    velocity.current.lerp(targetVelocity, alpha)
    if (velocity.current.lengthSq() < 0.0001 && targetVelocity.lengthSq() === 0) velocity.current.set(0, 0, 0)

    position.current.addScaledVector(velocity.current, dt)

    // Soft bounds: clamp to a sphere around the ship so you can't fly off
    // into the void and lose your way back (Section-style "full freedom,
    // gently fenced" rather than truly infinite empty space).
    const dist = position.current.length()
    if (dist > WORLD_BOUNDS_RADIUS) {
      position.current.multiplyScalar(WORLD_BOUNDS_RADIUS / dist)
      velocity.current.multiplyScalar(0.3)
    }
  })

  return { position, yaw, pitch }
}
