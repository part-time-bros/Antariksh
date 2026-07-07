import * as THREE from 'three'
import zonesData from '../content/zones.json'

// Control points threading the dolly nose -> tail -> back forward -> wide
// exterior pull-back, in the shuttle's local space (meters, loosely scaled
// against the real OV-104 dimensions in the buildspec, Section 2.2).
// Nose faces +z, tail faces -z. See DECISIONS.md #1 for why the path loops
// back toward the nose for Zone 7 instead of continuing monotonically aft.
export const RAIL_POINTS = [
  new THREE.Vector3(0, 2.2, 15.5), // Zone 1 — flight deck, nose interior
  new THREE.Vector3(0, 0.9, 10.8), // Zone 2 — mid-deck
  new THREE.Vector3(0, 0.3, 6.2), // Zone 3 — airlock
  new THREE.Vector3(0, 1.4, 0), // Zone 4 — payload bay, forward
  new THREE.Vector3(0, 1.9, -6), // Zone 4 — payload bay, mid (extra point: longest compartment)
  new THREE.Vector3(0, 1.9, -11.5), // Zone 4/5 — payload bay aft, arm base
  new THREE.Vector3(-8, 4.2, -9.5), // Zone 5 — Canadarm tip, swung to port and out
  new THREE.Vector3(0, -1.1, -15.5), // Zone 6 — aft propulsion bay, tail
  new THREE.Vector3(2.5, 4.5, -6), // Zone 7 — looping forward, exterior pass by the flight-deck windows
  new THREE.Vector3(7, 4, 3), // Zone 8 — wide exterior pull-back near the payload bay
]
// These exact coordinates were solved numerically, not eyeballed — see
// DECISIONS.md #1. getPointAt()/getTangentAt() parametrize by ARC LENGTH,
// not by control-point index, so zone t-ranges (in zones.json) had to be
// derived from the curve's real geometry or every zone's dwell-time would
// silently drift out of proportion to what Section 5's content actually needs.

export const RAIL_CURVE = new THREE.CatmullRomCurve3(RAIL_POINTS, false, 'catmullrom', 0.4)

// Zone t-ranges, read from zones.json (the single source of truth) so the
// 3D layer and the content layer can never drift out of sync.
export const ZONES = [...zonesData.zones].sort((a, b) => a.order - b.order)

export function getZoneAt(t) {
  for (const zone of ZONES) {
    const [start, end] = zone.railRange
    if (t >= start && t <= end) return zone
  }
  // Past the last boundary due to float rounding — return the last zone.
  return t <= 0 ? ZONES[0] : ZONES[ZONES.length - 1]
}

export function getZoneById(id) {
  return ZONES.find((z) => z.id === id) || null
}

const _pos = new THREE.Vector3()
const _tan = new THREE.Vector3()

export function getPointAt(t, target = _pos) {
  return RAIL_CURVE.getPointAt(THREE.MathUtils.clamp(t, 0, 1), target)
}

export function getTangentAt(t, target = _tan) {
  return RAIL_CURVE.getTangentAt(THREE.MathUtils.clamp(t, 0.0005, 0.9995), target)
}
