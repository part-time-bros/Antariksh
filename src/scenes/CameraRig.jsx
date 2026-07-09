import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useFreeFlight } from '../hooks/useFreeFlight'
import { useJourneyStore } from '../state/useJourneyStore'
import { ZONES, FOCUS_RADIUS } from './ZoneAnchors'

export default function CameraRig({ inputRef }) {
  const { position, yaw, pitch } = useFreeFlight(inputRef)
  const regress = useThree((state) => state.performance.regress)
  const lastPos = useRef(new THREE.Vector3())
  const lookDir = useRef(new THREE.Vector3())
  const lookTarget = useRef(new THREE.Vector3())

  useFrame((state) => {
    // Signal R3F's performance system during motion so AdaptiveDpr has a
    // real trigger — our rig doesn't go through drei's controls, which is
    // where that signal normally comes from (see DECISIONS.md #9).
    if (position.current.distanceToSquared(lastPos.current) > 1e-6) regress()
    lastPos.current.copy(position.current)

    state.camera.position.copy(position.current)
    lookDir.current.set(
      Math.sin(yaw.current) * Math.cos(pitch.current),
      Math.sin(pitch.current),
      Math.cos(yaw.current) * Math.cos(pitch.current)
    )
    lookTarget.current.copy(position.current).add(lookDir.current)
    state.camera.lookAt(lookTarget.current)

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
