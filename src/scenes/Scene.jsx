import { Suspense } from 'react'
import Starfield from './Starfield'
import ShuttleModel from './ShuttleModel'
import CameraRig from './CameraRig'
import SatelliteBurst from './SatelliteBurst'

export default function Scene({ inputRef }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[28, 22, 12]} intensity={1.5} color="#FFF3E2" />
      <directionalLight position={[-24, -12, -18]} intensity={0.22} color="#3A6FB0" />
      <Suspense fallback={null}>
        <Starfield />
        <ShuttleModel />
        <SatelliteBurst />
      </Suspense>
      <CameraRig inputRef={inputRef} />
    </>
  )
}
