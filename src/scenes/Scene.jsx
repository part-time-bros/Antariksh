import { Suspense } from 'react'
import { Environment, Lightformer } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import Starfield from './Starfield'
import ShuttleModel from './ShuttleModel'
import CameraRig from './CameraRig'
import SatelliteBurst from './SatelliteBurst'
import ZoneMarkers from './ZoneMarkers'
import ZonePanel3D from './ZonePanel3D'

export default function Scene({ inputRef }) {
  return (
    <>
      <ambientLight intensity={0.32} />
      <directionalLight position={[28, 22, 12]} intensity={2.2} color="#FFF3E2" />
      <directionalLight position={[-24, -12, -18]} intensity={0.35} color="#3A6FB0" />
      <hemisphereLight args={['#3A6FB0', '#0B0B0E', 0.4]} />

      {/* Procedural environment for reflections on the shuttle's metal/glass
          materials — built from Lightformer panels, not a fetched HDRI, so
          it never depends on runtime network access (see DECISIONS.md #14). */}
      <Environment resolution={256}>
        <Lightformer intensity={2} color="#FFF3E2" position={[20, 15, 10]} scale={12} />
        <Lightformer intensity={1.2} color="#3A6FB0" position={[-20, -8, -15]} scale={14} />
        <Lightformer intensity={0.8} color="#C9A84C" position={[0, 20, -10]} scale={10} form="ring" />
        <Lightformer intensity={0.5} color="#EDEDE6" position={[0, -20, 15]} scale={16} />
      </Environment>

      <Suspense fallback={null}>
        <Starfield />
        <ShuttleModel />
        <SatelliteBurst />
        <ZoneMarkers />
        <ZonePanel3D />
      </Suspense>
      <CameraRig inputRef={inputRef} />

      <EffectComposer multisampling={0}>
        <Bloom intensity={0.6} luminanceThreshold={0.35} luminanceSmoothing={0.3} mipmapBlur radius={0.6} />
        <Vignette eskil={false} offset={0.15} darkness={0.6} />
      </EffectComposer>
    </>
  )
}
