import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useRailDrive } from '../hooks/useRailDrive'
import { useJourneyStore } from '../state/useJourneyStore'
import { getPointAt, getTangentAt } from './Rail'

const worldUp = new THREE.Vector3(0, 1, 0)

export default function CameraRig({ inputRef }) {
  const lookRef = useRailDrive(inputRef)
  const regress = useThree((state) => state.performance.regress)
  const lastT = useRef(0)

  const position = useRef(new THREE.Vector3())
  const tangent = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())
  const up = useRef(new THREE.Vector3())
  const lookDir = useRef(new THREE.Vector3())
  const lookTarget = useRef(new THREE.Vector3())
  const yawQuat = useRef(new THREE.Quaternion())
  const pitchQuat = useRef(new THREE.Quaternion())

  useFrame((state) => {
    const t = useJourneyStore.getState().t

    // Tell R3F's built-in performance system we're mid-motion so
    // AdaptiveDpr (Section 12) has a real signal to regress against —
    // our custom rig doesn't go through drei's controls, which is where
    // that signal normally comes from.
    if (Math.abs(t - lastT.current) > 1e-6) regress()
    lastT.current = t

    getPointAt(t, position.current)
    getTangentAt(t, tangent.current)

    right.current.crossVectors(tangent.current, worldUp).normalize()
    // Guard the degenerate case where the tangent is nearly parallel to world-up
    // (can happen briefly during the Zone 5 -> 6 dip) by falling back to the
    // previous frame's right vector direction via a stable secondary axis.
    if (right.current.lengthSq() < 1e-6) right.current.set(1, 0, 0)
    up.current.crossVectors(right.current, tangent.current).normalize()

    yawQuat.current.setFromAxisAngle(up.current, lookRef.current.yaw)
    lookDir.current.copy(tangent.current).applyQuaternion(yawQuat.current)
    pitchQuat.current.setFromAxisAngle(right.current, lookRef.current.pitch)
    lookDir.current.applyQuaternion(pitchQuat.current)

    state.camera.position.copy(position.current)
    lookTarget.current.copy(position.current).add(lookDir.current)
    state.camera.up.copy(up.current)
    state.camera.lookAt(lookTarget.current)
  })

  return null
}
