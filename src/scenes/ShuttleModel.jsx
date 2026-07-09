import { useMemo } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'

// Real NASA public-domain Space Shuttle model (Section 11.1's Phase-4 asset,
// now in place — see DECISIONS.md #12 for sourcing, licensing, the axis-remap
// derivation, and the bay-alignment offset below).
const MODEL_URL = `${import.meta.env.BASE_URL}models/space-shuttle.glb`
const INCH_TO_METER = 0.0254

// Model native axes -> scene axes, solved numerically (not eyeballed) via
// THREE.Matrix4.makeBasis + verified round-trip — see DECISIONS.md #12.
const MODEL_ROTATION = [-Math.PI / 2, 0, -Math.PI / 2]

// Bounding-box-center offset that brings the model's actual payload-bay
// region to the scene-space position the zone anchors in ZoneAnchors.js
// assume (computed from the source file's un-quantized geometry — the
// shipped, meshopt-compressed file can't be read this way directly).
const MODEL_OFFSET = [0, 2.76, -7.25]

const METAL = '#D8D4C8'
const ACCENT_REENTRY = '#FF5A2E'

function boneTransform(a, b, radius) {
  const start = new THREE.Vector3(...a)
  const end = new THREE.Vector3(...b)
  const dir = new THREE.Vector3().subVectors(end, start)
  const length = dir.length()
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize()
  )
  return { position: mid.toArray(), quaternion, length, radius }
}

function CanadarmSegment({ a, b, radius }) {
  const bone = useMemo(() => boneTransform(a, b, radius), [a, b, radius])
  return (
    <mesh position={bone.position} quaternion={bone.quaternion}>
      <cylinderGeometry args={[bone.radius, bone.radius, bone.length, 8]} />
      <meshStandardMaterial color={METAL} metalness={0.65} roughness={0.35} />
    </mesh>
  )
}

function Canadarm() {
  // Mounted on the payload bay's port sill, reaching out to near the
  // "reaching-beyond-earth" zone's anchor in ZoneAnchors.js — the real
  // model doesn't include an arm (no such material anywhere in its 42),
  const base = [-2.35, 2.1, -2]
  const elbow = [-4.6, 2.9, -5]
  const wrist = [-6.6, 3.7, -7.6]
  const tip = [-8, 4.2, -9.5]
  return (
    <group>
      <mesh position={base}>
        <boxGeometry args={[0.7, 0.5, 0.9]} />
        <meshStandardMaterial color={METAL} metalness={0.5} roughness={0.5} />
      </mesh>
      <CanadarmSegment a={base} b={elbow} radius={0.19} />
      <mesh position={elbow}>
        <sphereGeometry args={[0.24, 10, 10]} />
        <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.3} />
      </mesh>
      <CanadarmSegment a={elbow} b={wrist} radius={0.16} />
      <mesh position={wrist}>
        <sphereGeometry args={[0.2, 10, 10]} />
        <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.3} />
      </mesh>
      <CanadarmSegment a={wrist} b={tip} radius={0.12} />
      <mesh position={tip}>
        <boxGeometry args={[0.32, 0.32, 0.5]} />
        <meshStandardMaterial color={ACCENT_REENTRY} emissive={ACCENT_REENTRY} emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

function RealOrbiter() {
  const { scene } = useGLTF(MODEL_URL)
  return <primitive object={scene} />
}

export default function ShuttleModel() {
  return (
    <group name="orbiter">
      <group position={MODEL_OFFSET} rotation={MODEL_ROTATION} scale={INCH_TO_METER}>
        <RealOrbiter />
      </group>
      <Canadarm />
    </group>
  )
}

useGLTF.preload(MODEL_URL)

