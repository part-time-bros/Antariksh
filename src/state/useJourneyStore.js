import { create } from 'zustand'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const useJourneyStore = create((set, get) => ({
  // --- Held movement input (keyboard + touch joystick share this) -----
  // 6-direction free flight: forward/back, left/right (strafe), up/down.
  held: { forward: false, backward: false, left: false, right: false, up: false, down: false },
  setHeld: (direction, isDown) =>
    set((s) => ({ held: { ...s.held, [direction]: isDown } })),

  // --- Which zone panel is nearest/focused ------------------------------
  // Updated imperatively from CameraRig's useFrame via getState().setFocusedZone
  // (proximity-based, not subscribed reactively every frame — only changes
  // on actual crossing of FOCUS_RADIUS, so this is cheap to subscribe to).
  focusedZoneId: null,
  setFocusedZone: (id) => {
    if (get().focusedZoneId === id) return
    set({ focusedZoneId: id })
  },

  // --- Teleport-to-zone (tap a waypoint in the nav) ---------------------
  teleportTarget: null, // { position, lookAt, startedAt } while animating
  teleportTo: (position, lookAt) => {
    if (get().reducedMotion) {
      set({ teleportTarget: { instant: true, position, lookAt } })
      return
    }
    set({ teleportTarget: { from: null, position, lookAt, startedAt: performance.now() } })
  },
  clearTeleport: () => set({ teleportTarget: null }),

  // --- UI chrome ---------------------------------------------------------
  navOpen: false,
  toggleNav: () => set((s) => ({ navOpen: !s.navOpen })),
  missionWatchOpen: false,
  toggleMissionWatch: () => set((s) => ({ missionWatchOpen: !s.missionWatchOpen })),

  // --- Onboarding ----------------------------------------------------------
  hasOnboarded: false,
  completeOnboarding: () => set({ hasOnboarded: true }),

  // --- Accessibility -----------------------------------------------------
  reducedMotion: prefersReducedMotion(),
  setReducedMotion: (v) => set({ reducedMotion: v }),

  // --- Audio -------------------------------------------------------------
  muted: false,
  toggleMuted: () => set((s) => ({ muted: !s.muted })),

  // --- The one earned particle moment: PSLV-C37's 104 satellites (4.5/5) --
  satelliteBurstAt: 0,
  triggerSatelliteBurst: () => set({ satelliteBurstAt: performance.now() }),
}))
