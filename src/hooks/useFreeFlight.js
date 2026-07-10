import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useJourneyStore } from '../state/useJourneyStore'
import { SPAWN_POSITION, SPAWN_LOOK_AT, WORLD_BOUNDS_RADIUS } from '../scenes/ZoneAnchors'
import { audioEngine } from '../audio/audioEngine'

const MAX_SPEED = 9 // meters/second at full input — ship is ~37m long, crosses it in ~4s
const RAMP_UP = 3.2
const RAMP_DOWN = 0.9 // low drag — coasts like a spacecraft instead of braking like a car
const YAW_SENSITIVITY = 0.0032
const PITCH_SENSITIVITY = 0.0032
const PITCH_LIMIT = Math.PI / 2 - 0.05 // just short of straight up/down, avoids gimbal flip
const TELEPORT_SECONDS = 1.6

// Banking: turning or strafing rolls the camera into the turn, then eases
// back level — the "better physics" pass, since a pure yaw/pitch camera
// feels like a disembodied eye rather than something flying.
const MAX_BANK = 0.46 // ~26°
const BANK_FROM_YAW_RATE = 2.4
const BANK_FROM_STRAFE = 0.55
const BANK_RESPONSE = 6 // how fast roll eases toward its target
const BANK_RECOVERY = 3.2 // how fast roll eases back to level once input stops

// Soft collision: the fuselage approximated as a capsule so "full freedom"
// doesn't mean phasing through solid hull — a gentle push-out, not a hard
// stop, so it never feels like hitting a wall.
const HULL_A = new THREE.Vector3(0, 2.76, 12.2) // nose-ish
const HULL_B = new THREE.Vector3(0, 2.76, -25.2) // tail-ish
const HULL_RADIUS = 3.4
const WING_HALF_SPAN = 12.2
const WING_Z_MIN = -20
const WING_Z_MAX = -10
const WING_THICKNESS = 1.6

const worldUp = new THREE.Vector3(0, 1, 0)

// Face the ship at spawn, computed from the actual points rather than
// hand-derived trig (easy to get a sign wrong doing that by hand).
const _initialDir = new THREE.Vector3().subVectors(SPAWN_LOOK_AT, SPAWN_POSITION).normalize()
const INITIAL_YAW = Math.atan2(_initialDir.x, _initialDir.z)
const INITIAL_PITCH = Math.asin(_initialDir.y)

function resolveHullCollision(pos) {
  // Closest point on the fuselage capsule's spine to `pos`.
  const ab = new THREE.Vector3().subVectors(HULL_B, HULL_A)
  const t = THREE.MathUtils.clamp(
    new THREE.Vector3().subVectors(pos, HULL_A).dot(ab) / ab.lengthSq(),
    0,
    1
  )
  const closest = new THREE.Vector3().copy(HULL_A).addScaledVector(ab, t)
  const toCamera = new THREE.Vector3().subVectors(pos, closest)
  const dist = toCamera.length()
  if (dist < HULL_RADIUS && dist > 1e-5) {
    pos.copy(closest).addScaledVector(toCamera.normalize(), HULL_RADIUS)
  }

  // Wings: a flat slab either side of the fuselage — push out along Y if
  // inside the slab's X/Z footprint, the cheap approximation that matters
  // (nobody flies precisely edge-on into a wing tip in practice).
  if (
    pos.z > WING_Z_MIN &&
    pos.z < WING_Z_MAX &&
    Math.abs(pos.x) < WING_HALF_SPAN &&
    Math.abs(pos.y - 2.76) < WING_THICKNESS
  ) {
    pos.y = pos.y >= 2.76 ? 2.76 + WING_THICKNESS : 2.76 - WING_THICKNESS
  }
  return pos
}

/**
 * Owns camera position + yaw/pitch/roll as refs (not store state — this
 * runs every frame and nothing outside the 3D layer needs to react to it
 * directly; ZoneAnchors proximity is derived from position separately).
 * Returns the refs for CameraRig to apply to the actual three.js camera.
 */
export function useFreeFlight(inputRef) {
  const position = useRef(SPAWN_POSITION.clone())
  const yaw = useRef(INITIAL_YAW)
  const pitch = useRef(INITIAL_PITCH)
  const roll = useRef(0)
  const velocity = useRef(new THREE.Vector3())
  const prevYaw = useRef(INITIAL_YAW)

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
      roll.current *= 0.8
      prevYaw.current = yaw.current
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
    resolveHullCollision(position.current)

    // Soft bounds: clamp to a sphere around the ship so you can't fly off
    // into the void and lose your way back ("full freedom, gently fenced"
    // rather than truly infinite empty space).
    const dist = position.current.length()
    if (dist > WORLD_BOUNDS_RADIUS) {
      position.current.multiplyScalar(WORLD_BOUNDS_RADIUS / dist)
      velocity.current.multiplyScalar(0.3)
    }

    // ---- Banking: roll into turns and strafes, ease back level -----------
    const yawRate = dt > 0 ? (yaw.current - prevYaw.current) / dt : 0
    prevYaw.current = yaw.current
    const targetRoll = THREE.MathUtils.clamp(
      -yawRate * BANK_FROM_YAW_RATE - strafeInput * BANK_FROM_STRAFE,
      -MAX_BANK,
      MAX_BANK
    )
    const bankRate = Math.abs(targetRoll) > Math.abs(roll.current) ? BANK_RESPONSE : BANK_RECOVERY
    const bankAlpha = 1 - Math.exp(-bankRate * dt)
    roll.current += (targetRoll - roll.current) * bankAlpha

    if (audioEngine.isReady) audioEngine.setWhoosh(velocity.current.length() / MAX_SPEED)
  })

  return { position, yaw, pitch, roll }
}
