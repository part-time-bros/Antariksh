import { create } from 'zustand'
import { getZoneAt, ZONES } from '../scenes/Rail'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const useJourneyStore = create((set, get) => ({
  // --- Rail position -------------------------------------------------
  t: 0,
  activeZoneId: ZONES[0].id,

  setT: (t) => {
    const clamped = Math.min(1, Math.max(0, t))
    if (clamped === get().t) return
    const zone = getZoneAt(clamped)
    set({ t: clamped, activeZoneId: zone.id })
  },

  // --- Held input (keyboard + on-screen chevrons share this) ---------
  held: { forward: false, backward: false },
  setHeld: (direction, isDown) =>
    set((s) => ({ held: { ...s.held, [direction]: isDown } })),

  // --- Map-jump animation (tap a zone on the cross-section map) ------
  jumpTarget: null, // { from, to, startedAt } while animating
  jumpTo: (targetT) => {
    const clamped = Math.min(1, Math.max(0, targetT))
    if (get().reducedMotion) {
      get().setT(clamped)
      return
    }
    set({ jumpTarget: { from: get().t, to: clamped, startedAt: performance.now() } })
  },
  clearJump: () => set({ jumpTarget: null }),

  // --- Free-look (a few degrees off the rail's forward direction) ----
  freeLookMode: false, // the optional fuller explore-in-place toggle (Section 4.2)
  toggleFreeLookMode: () => set((s) => ({ freeLookMode: !s.freeLookMode })),

  // --- UI chrome -------------------------------------------------------
  panelOpen: true,
  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
  mapCollapsed: false,
  toggleMap: () => set((s) => ({ mapCollapsed: !s.mapCollapsed })),

  // --- Onboarding ------------------------------------------------------
  hasOnboarded: false,
  completeOnboarding: () => set({ hasOnboarded: true, t: 0, activeZoneId: ZONES[0].id }),

  // --- Accessibility -----------------------------------------------------
  reducedMotion: prefersReducedMotion(),
  setReducedMotion: (v) => set({ reducedMotion: v }),

  // --- The one earned particle moment: PSLV-C37's 104 satellites (4.5/5) --
  satelliteBurstAt: 0,
  triggerSatelliteBurst: () => set({ satelliteBurstAt: performance.now() }),
}))
