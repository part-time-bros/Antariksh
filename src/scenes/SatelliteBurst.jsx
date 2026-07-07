import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useJourneyStore } from '../state/useJourneyStore'

const COUNT = 104
const DURATION = 2.2
const ORIGIN = new THREE.Vector3(0, 2.2, -5)

export default function SatelliteBurst() {
  const meshRef = useRef()
  const [active, setActive] = useState(false)
  const startRef = useRef(0)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const directions = useMemo(() => {
    const arr = []
    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      arr.push(
        new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta),
          Math.sin(phi) * Math.sin(theta) * 0.55 + 0.35,
          Math.cos(phi) * 0.6
        ).normalize()
      )
    }
    return arr
  }, [])

  useEffect(() => {
    const unsub = useJourneyStore.subscribe((state, prev) => {
      if (state.satelliteBurstAt !== prev.satelliteBurstAt) {
        startRef.current = performance.now()
        setActive(true)
      }
    })
    return unsub
  }, [])

  useFrame(() => {
    if (!active || !meshRef.current) return
    const elapsed = (performance.now() - startRef.current) / 1000
    const progress = Math.min(1, elapsed / DURATION)
    const eased = 1 - Math.pow(1 - progress, 2)

    for (let i = 0; i < COUNT; i++) {
      const dist = eased * (3.2 + (i % 7) * 0.6)
      dummy.position.copy(ORIGIN).addScaledVector(directions[i], dist)
      const shrink = progress > 0.82 ? 1 - (progress - 0.82) / 0.18 : 1
      dummy.scale.setScalar(Math.max(0, 0.085 * shrink))
      dummy.rotation.set(i * 0.3, i * 0.7, i * 0.2)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true

    if (progress >= 1) setActive(false)
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} visible={active} frustumCulled={false}>
      <boxGeometry args={[1, 0.4, 0.4]} />
      <meshStandardMaterial color="#C9A84C" metalness={0.5} roughness={0.45} />
    </instancedMesh>
  )
}
