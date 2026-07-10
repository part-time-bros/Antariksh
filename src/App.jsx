import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import Scene from './scenes/Scene'
import Onboarding from './components/Onboarding'
import TeleportNav from './components/TeleportNav'
import MissionWatchCard from './components/MissionWatchCard'
import TouchJoystick from './components/TouchJoystick'
import VerticalControls from './components/VerticalControls'
import ControlsHint from './components/ControlsHint'
import AudioToggle from './components/AudioToggle'
import ReadFallback from './components/ReadFallback'
import { useInputState } from './hooks/useInputState'
import { useJourneyStore } from './state/useJourneyStore'
import { audioEngine } from './audio/audioEngine'

function MainExperience() {
  const { inputRef, onPointerDown, onPointerMove, onPointerUp, setJoystick } = useInputState()
  const muted = useJourneyStore((s) => s.muted)

  useEffect(() => {
    audioEngine.setMuted(muted)
  }, [muted])

  return (
    <div
      className="fixed inset-0 bg-[#08080A] touch-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <Canvas
        dpr={[1, 2.5]}
        shadows="soft"
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        camera={{ fov: 55, near: 0.1, far: 400 }}
      >
        <Scene inputRef={inputRef} />
      </Canvas>
      <TeleportNav />
      <MissionWatchCard />
      <TouchJoystick setJoystick={setJoystick} />
      <VerticalControls />
      <ControlsHint />
      <AudioToggle />
    </div>
  )
}

export default function App() {
  const hasOnboarded = useJourneyStore((s) => s.hasOnboarded)
  const setReducedMotion = useJourneyStore((s) => s.setReducedMotion)

  // Keep the store in sync if the OS-level preference changes mid-session,
  // not just at load (Section 12).
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [setReducedMotion])

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/'
  const readPath = `${import.meta.env.BASE_URL}read`
  if (pathname === readPath || pathname === `${readPath}/`) return <ReadFallback />

  return hasOnboarded ? <MainExperience /> : <Onboarding />
}
