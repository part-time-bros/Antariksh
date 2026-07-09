import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useJourneyStore } from '../state/useJourneyStore'
import { ZONES } from './ZoneAnchors'

const IDLE_COLOR = new THREE.Color('#C9A84C')
const FOCUS_COLOR = new THREE.Color('#FF5A2E')

function Beacon({ zone, index }) {
  const ringRef = useRef()
  const coreRef = useRef()
  const focusedZoneId = useJourneyStore((s) => s.focusedZoneId)
  const isFocused = focusedZoneId === zone.id

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const pulse = 0.75 + Math.sin(t * 2 + index) * 0.25
    if (ringRef.current) {
      ringRef.current.scale.setScalar(isFocused ? 1.4 + Math.sin(t * 3) * 0.15 : pulse)
      ringRef.current.material.color.lerp(isFocused ? FOCUS_COLOR : IDLE_COLOR, 0.1)
      ringRef.current.rotation.z = t * 0.4
    }
    if (coreRef.current) {
      coreRef.current.material.emissiveIntensity = isFocused ? 1.8 : 0.9 + Math.sin(t * 2 + index) * 0.3
    }
  })

  return (
    <group position={zone.lookAt}>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial
          color={isFocused ? '#FF5A2E' : '#C9A84C'}
          emissive={isFocused ? '#FF5A2E' : '#C9A84C'}
          emissiveIntensity={1}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={ringRef}>
        <ringGeometry args={[0.42, 0.5, 24]} />
        <meshBasicMaterial color="#C9A84C" transparent opacity={0.7} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <pointLight color={isFocused ? '#FF5A2E' : '#C9A84C'} intensity={isFocused ? 4 : 1.5} distance={6} />
    </group>
  )
}

export default function ZoneMarkers() {
  return (
    <>
      {ZONES.map((zone, i) => (
        <Beacon key={zone.id} zone={zone} index={i} />
      ))}
    </>
  )
}
