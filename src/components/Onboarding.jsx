import { useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import gsap from 'gsap'
import ShuttleModel from '../scenes/ShuttleModel'
import Starfield from '../scenes/Starfield'
import { useJourneyStore } from '../state/useJourneyStore'

const KSC_TILT = (43.21 * Math.PI) / 180 // the real display tilt, Section 2.3

function HeroRig({ reducedMotion }) {
  const groupRef = useRef()

  useEffect(() => {
    if (!groupRef.current) return
    if (reducedMotion) {
      groupRef.current.rotation.y = 0.4
      return
    }
    groupRef.current.rotation.y = 1.15
    gsap.to(groupRef.current.rotation, { y: 0.4, duration: 3.4, ease: 'power2.out' })
  }, [reducedMotion])

  return (
    <group ref={groupRef} rotation={[0, 0, KSC_TILT]} position={[0, -1, 0]} scale={0.62}>
      <ShuttleModel />
    </group>
  )
}

export default function Onboarding() {
  const completeOnboarding = useJourneyStore((s) => s.completeOnboarding)
  const reducedMotion = useJourneyStore((s) => s.reducedMotion)
  const titleRef = useRef()
  const subRef = useRef()
  const ctaRef = useRef()

  useEffect(() => {
    if (reducedMotion) return
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
    tl.fromTo(titleRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9 })
      .fromTo(subRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
      .fromTo(ctaRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.45')
  }, [reducedMotion])

  return (
    <div className="fixed inset-0 z-30 bg-[#08080A] overflow-hidden">
      <Canvas camera={{ position: [0, 2.5, 30], fov: 44 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.45} />
        <directionalLight position={[22, 18, 12]} intensity={1.5} color="#FFF3E2" />
        <directionalLight position={[-18, -8, -14]} intensity={0.2} color="#3A6FB0" />
        <Starfield />
        <HeroRig reducedMotion={reducedMotion} />
      </Canvas>

      <div className="absolute inset-0 flex flex-col items-center justify-end sm:justify-center px-6 pb-14 sm:pb-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center">
          <h1
            ref={titleRef}
            className="text-3xl sm:text-5xl font-bold text-[#F5F0E8] text-center tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            ANTARIKSH YATRA
          </h1>
          <p ref={subRef} className="text-sm sm:text-base text-[#EDEDE6]/70 text-center mt-3 max-w-md">
            Sixty years of the Indian space programme, staged inside a Space Shuttle's own
            compartments — nose to tail, 1962 to now.
          </p>
          <button
            ref={ctaRef}
            type="button"
            onClick={completeOnboarding}
            className="mt-7 rounded-full bg-[#B0001E] text-[#F5F0E8] px-7 py-3.5 min-h-[44px] text-sm font-medium tracking-wide hover:brightness-110 active:scale-95 transition"
          >
            Begin the journey
          </button>
          <a
            href="/read"
            className="mt-4 text-xs text-[#EDEDE6]/45 underline underline-offset-2 min-h-[32px] flex items-center"
          >
            Prefer to read? Text-only version →
          </a>
        </div>
      </div>
    </div>
  )
}
