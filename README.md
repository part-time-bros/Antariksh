# Antariksh Yatra

A rail-driven 3D journey through 60 years of ISRO history, staged inside the compartments of a Space Shuttle orbiter. Built from `antariksh-yatra-buildspec.md`, followed section by section — see `DECISIONS.md` for every judgment call made along the way, especially #1 (rail geometry) and #2 (placeholder shuttle model).

## Stack

React 19 · React Three Fiber v9 · drei v10 · three.js · Zustand · Vite 8 · Tailwind v4 · GSAP · recharts — matches Section 8.1 exactly, versions verified against what actually installed (see package.json).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

`npm run build` produces `dist/`. `npm run preview` serves that build locally. `npm run lint` runs oxlint (13 expected warnings from `ZoneInteractions.jsx` — see DECISIONS.md #5, they're harmless).

## Deploy

Push to GitHub, Vercel auto-deploys. `vercel.json` rewrites every path to `index.html` so a direct visit to `/read` (the text-only fallback) works instead of 404ing — `App.jsx` does the actual routing client-side with a plain `pathname` check, no router dependency.

## Structure

```
public/
  models/        space-shuttle.glb — NASA public-domain model, compressed (DECISIONS.md #12)
src/
  content/        zones.json, timeline.json, mission-watch.json — the single source of truth.
                  Edit these for copy changes; components read from them, nothing is hardcoded twice.
  scenes/         Rail.js (curve + zone ranges), CameraRig, ShuttleModel, Starfield, SatelliteBurst, Scene
  hooks/          useRailDrive (the per-frame movement loop), useInputState (keyboard/wheel/drag)
  state/          useJourneyStore (Zustand)
  components/     HUD layer — ContentPanel, CrossSectionMap, NavChevrons, MissionWatchCard,
                  Onboarding, ReadFallback, ZoneInteractions (the 12 zone-specific widgets), Charts/
```

**Model attribution:** `space-shuttle.glb` is sourced from [nasa/NASA-3D-Resources](https://github.com/nasa/NASA-3D-Resources) ("Space Shuttle (D)"), NASA-produced content and therefore public domain / free of copyright in the US. Worth double-checking NASA's current media usage guidelines before any commercial use, but nothing here should require attribution.

## Before you treat this as done

1. **Look at it running.** I couldn't render WebGL in the sandbox I built this in, so the geometry math is verified (see DECISIONS.md #1 and #12) but genuinely unseen. `npm run dev` and check the rail feels right, and that the real shuttle model's payload bay actually lines up with where the rail flies through it, before anything else.
2. **Real shuttle model is in.** `public/models/space-shuttle.glb` is NASA's own public-domain model (360KB, compressed from the official 2.47MB source — see DECISIONS.md #12), not primitives anymore. The one thing to check: the bay-alignment offset in `ShuttleModel.jsx` (`MODEL_OFFSET`) was computed from bounding boxes, not verified visually — nudge it if the rail doesn't track through the bay the way it's supposed to. The Canadarm is still procedural (the source model doesn't include one).
3. **Two placeholders in `index.html`**: there's no `og:image` (no asset to point it at yet) and no `rel="canonical"` (don't know your Vercel URL yet) — add both once you've deployed once.
4. **Mission Watch will go stale.** `mission-watch.json` is meant to be hand-edited as things resolve — Vikram-1's launch window is 12 July–4 Aug 2026, Gaganyaan G1 is now H2 2026. Check back after either lands.

Full list of what's deferred vs. deliberately simplified: `DECISIONS.md`.
