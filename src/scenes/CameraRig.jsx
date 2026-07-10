import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useFreeFlight } from '../hooks/useFreeFlight'
import { useJourneyStore } from '../state/useJourneyStore'
import { ZONES, FOCUS_RADIUS } from './ZoneAnchors'

const _euler = new THREE.Euler(0, 0, 0, 'YXZ')

export default function CameraRig({ inputRef }) {
  const { position, yaw, pitch, roll } = useFreeFlight(inputRef)

  useFrame((state) => {
    state.camera.position.copy(position.current)
    // YXZ order composes yaw (world Y) -> pitch (local X) -> roll (local Z)
    // correctly for a flight camera; lookAt() can't express roll/banking
    // at all, which is why this replaced it (DECISIONS.md #16).
    _euler.set(pitch.current, yaw.current, roll.current)
    state.camera.quaternion.setFromEuler(_euler)

    // Proximity-based zone focus: nearest anchor within FOCUS_RADIUS wins.
    let nearest = null
    let nearestDist = FOCUS_RADIUS
    for (const zone of ZONES) {
      const d = position.current.distanceTo(zone.anchor)
      if (d < nearestDist) {
        nearest = zone.id
        nearestDist = d
      }
    }
    useJourneyStore.getState().setFocusedZone(nearest)
  })

  return null
}
