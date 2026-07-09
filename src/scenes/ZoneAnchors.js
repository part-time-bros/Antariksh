import * as THREE from 'three'
import zonesData from '../content/zones.json'

// Where each zone's in-world panel sits, in scene meters. The real shuttle
// model is an EXTERIOR-ONLY shell (no modeled interior — see DECISIONS.md
// #14), positioned via ShuttleModel's MODEL_OFFSET, so these are placed
// just off the hull near the feature each zone is actually about: the
// nose for Genesis, cockpit windows for Learning to Fly, the payload bay
// for Workhorse Decades, the Canadarm tip for Reaching Beyond Earth, the
// engines for Engineering the Engines, and a pulled-back establishing shot
// for By the Numbers.
const ANCHOR_POSITIONS = {
  genesis: [5, 4.5, 15],
  'learning-to-fly': [5.5, 6.5, 8.5],
  'human-spaceflight': [5.5, 1, 2.5],
  'workhorse-decades': [6.5, 6.5, -5.8],
  'reaching-beyond-earth': [-10.5, 5.5, -9.5],
  'engineering-the-engines': [5.5, 2.5, -24],
  'whats-next': [0, 11, 13],
  'by-the-numbers': [11, 6, -5],
}

// The camera looks roughly toward the hull from each anchor, not straight
// out into space — used only to orient the panel to face outward nicely.
const LOOK_TARGETS = {
  genesis: [0, 2.5, 16],
  'learning-to-fly': [0, 3, 9],
  'human-spaceflight': [0, 1.5, 3],
  'workhorse-decades': [0, 2, -5.8],
  'reaching-beyond-earth': [-8, 4.2, -9.5],
  'engineering-the-engines': [0, 0, -25],
  'whats-next': [0, 4, 13],
  'by-the-numbers': [3, 3, -6],
}

export const ZONES = [...zonesData.zones].sort((a, b) => a.order - b.order).map((zone) => ({
  ...zone,
  anchor: new THREE.Vector3(...ANCHOR_POSITIONS[zone.id]),
  lookAt: new THREE.Vector3(...LOOK_TARGETS[zone.id]),
}))

export function getZoneById(id) {
  return ZONES.find((z) => z.id === id) || null
}

// Default spawn point after onboarding — a wide shot that sees the whole
// ship at once, so a first-time visitor has their bearings immediately.
export const SPAWN_POSITION = new THREE.Vector3(18, 9, 22)
export const SPAWN_LOOK_AT = new THREE.Vector3(0, 2, -4)

// How close (meters) the camera needs to be to a zone's anchor before its
// panel expands from a small beacon into the full readable card.
export const FOCUS_RADIUS = 10
// Soft flight boundary — a sphere around the ship's center the free-flight
// hook clamps position within, so you can't wander off into the void
// forever and lose your way back.
export const WORLD_BOUNDS_RADIUS = 55
