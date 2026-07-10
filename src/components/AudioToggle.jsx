import { useJourneyStore } from '../state/useJourneyStore'
import { audioEngine } from '../audio/audioEngine'

export default function AudioToggle() {
  const muted = useJourneyStore((s) => s.muted)
  const toggleMuted = useJourneyStore((s) => s.toggleMuted)

  return (
    <button
      type="button"
      onClick={() => {
        if (!muted) audioEngine.playClick()
        toggleMuted()
      }}
      aria-label={muted ? 'Unmute sound' : 'Mute sound'}
      aria-pressed={muted}
      className="fixed top-3 left-3 z-20 w-11 h-11 rounded-full bg-black/55 backdrop-blur border border-white/10 text-[#EDEDE6] text-base flex items-center justify-center shadow-lg"
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
