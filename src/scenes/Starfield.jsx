import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 9000
const RADIUS = 280

export default function Starfield() {
  const pointsRef = useRef()

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    const sizeArr = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      // Distribute on a sphere shell so density looks even from anywhere on the rail.
      const u = Math.random()
      const v = Math.random()
      const theta = 2 * Math.PI * u
      const phi = Math.acos(2 * v - 1)
      const r = RADIUS * (0.55 + 0.45 * Math.random())
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
      sizeArr[i] = Math.random() * 1.6 + 0.4
    }
    return [pos, sizeArr]
  }, [])

  // A very slow ambient drift — motion budget belongs to the rail (Section
  // 9.4), so this is barely perceptible, not a "moving starfield" effect.
  useFrame((_, delta) => {
    if (pointsRef.current) pointsRef.current.rotation.y += delta * 0.0015
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        color="#EDEDE6"
        size={0.55}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  )
}
