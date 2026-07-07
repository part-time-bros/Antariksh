# Build decisions

Things this spec left open, or that needed a judgment call while building. Logged as they came up, per Section 0.

## 1. Rail geometry had to be solved numerically, not eyeballed

`getPointAt()`/`getTangentAt()` (which `CameraRig.jsx` uses every frame) parametrize a `CatmullRomCurve3` by **arc length**, not by control-point index. My first pass at `RAIL_POINTS` put zone boundaries at hand-guessed t-fractions (0.10, 0.22, 0.32...) that assumed each zone's control points were evenly spaced along the curve. They weren't — one segment (the loop back toward the nose for Zone 7) was almost 30% of the total arc length by itself, which would have made that zone drag on forever while Zone 3 (human spaceflight — Rakesh Sharma, Gaganyaan) flew past in under 5% of the journey.

Fixed by writing a throwaway Node script (`three` runs fine outside a browser for pure math) that samples the curve at high resolution, finds the exact `u` where it passes through each control point, and derives zone `railRange` values directly from that. Re-ran it after nudging a few control points to balance the shares. Final spread is 6.7%–16.9% per zone, with Workhorse Decades correctly the longest as Section 5 asks for. The zones.json `railRange` values and `Rail.js` control points are now the output of that computation, not independent guesses — if you ever move a control point, the ranges need re-deriving the same way, or they'll drift out of sync again exactly like this did.

## 2. The shuttle is Phase-1 primitive geometry, not a sourced model

Section 11.1 says check NASA's 3D Resources / Sketchfab / TurboSquid before modeling from scratch. I don't have browser/network access to those sites from this environment, and I'm not comfortable pulling a random GLB into your repo without you seeing the license first. So `ShuttleModel.jsx` is boxes/cylinders/cones proportioned against the real OV-104 dimensions (Section 2.2) — nose cone, crew module, hinged bay doors (permanently open), Canadarm (built from point-to-point segments, not real inverse kinematics), wings, vertical stabilizer, three engines. It's genuinely Phase 1 as the spec defines it, not a corner I cut silently.

When you're ready for Phase 4: swap the contents of `ShuttleModel.jsx`'s `<group name="orbiter">` for a `useGLTF('/shuttle.glb')` call once you've got a licensed model. The Canadarm's tip position is pinned to `RAIL_POINTS[6]` exactly (there's a check for this — see below), so if you do swap models, keep that alignment or the rail will visibly stop short of/overshoot the arm.

## 3. Touch input: chevrons move you, drag looks around — not both on one gesture

Section 4.1 lists "swipe-and-hold" as a touch option for forward/backward, separately from "touch-drag" for free-look. Both are touch-drag gestures on the same canvas, which is ambiguous the moment a real thumb is involved. I picked: on-screen chevrons (always visible, 56px touch targets) are the reliable forward/backward control on touch, and canvas drag is free-look only. If you try it and want swipe-to-move too, it's addable, but I didn't want to ship two gestures that fight each other without being able to test on a real device.

## 4. Two separate `<Canvas>`es for onboarding vs. the main journey

`Onboarding.jsx` mounts its own Canvas for the tilted hero shot (Section 2.3's 43.21° staging), and `MainExperience` mounts a second one after "Begin the journey." Simpler than sharing one WebGL context across two camera modes, at the cost of a brief remount when you cross over (geometry gets rebuilt once). If that flash bothers you in testing, the fix is a single persistent Canvas with a `mode` flag, but it's real added complexity for a one-time transition.

## 5. `ZoneInteractions.jsx` bundles all 12 small widgets in one file

Thumba callout, Sarabhai paraphrase rotator, then-vs-now slider, gaganyatri roster, satellite-burst button, trajectory selector, engine diagram, roadmap scrubber, patch gallery, collaboration list, plus the two chart imports — all in one file with an `INTERACTION_COMPONENTS` lookup map keyed by the `interactions` array in `zones.json`. `oxlint` flags this file for breaking React Fast Refresh (a file that exports both components and a plain object can't hot-reload cleanly) — 13 warnings, 0 errors, harmless in production. Splitting into 12 files was the "correct" option; I chose fewer files given how small each widget is.

## 6. Patch gallery is stylized, not real ISRO mission patches

`PatchGallery` in `ZoneInteractions.jsx` renders original colored roundels with mission initials, not actual ISRO patch artwork — same reasoning as #2, I didn't want to pull real logos in without you checking the license (Section 11.2 says they're freely licensed on isro.gov.in, but I can't fetch from that domain in this sandbox to verify current terms). Swapping in real patch images later is a one-line change per patch.

## 7. "Satellites over time" became "milestones per decade," computed live

I don't have verified year-by-year satellite launch counts I'd trust enough to chart as fact. Rather than invent numbers, `MilestonesPerDecadeChart` counts entries in `timeline.json` by decade at render time — it can never drift out of sync with the actual dataset, and it's honest about what it's measuring (this exhibit's timeline, not an external statistic).

## 8. Fact-checked the real-world content against current sources

Per your last message, I searched rather than shipped from memory alone, especially for anything from 2025–2026 (past most of my training). Caught and fixed three real errors: the EOS-09 anomaly's date was off by one day (IST vs. US Eastern time — ISRO's own launch was already May 18 in India), the Ashoka Chakra award had no exact date (now dated to the 77th Republic Day, 26 Jan 2026), and SpaDeX was filed under 2024 by launch date when the actual docking success — what the entry's title refers to — happened 16 January 2025 (renamed `2024-spadex` → `2025-spadex`, updated the one reference to it in `zones.json`). Also updated the Gaganyaan-G1 and Vikram-1 Mission Watch entries with verified current specifics (G1 slipped to H2 2026 after the EOS-N1 review; Vikram-1's window, orbit, and payload figures). Everything else I checked — PSLV/LVM3/NGLV payload figures, Chandrayaan-3's "Shiv Shakti Point," NISAR's ~85TB/day — matched what was already written.

## 9. `AdaptiveDpr` needed real wiring, not just importing it

First pass mounted drei's `<PerformanceMonitor>` and `<AdaptiveDpr>` with no callbacks and no `regress()` calls anywhere — which does nothing (confirmed against R3F's own docs: "mere calls to regress() will not change or affect anything" if nothing's opted into `performance.current`, and `AdaptiveDpr` only has something to cut *if* the Canvas has a `performance={{ min }}` range to regress within). Fixed: `Canvas` now sets `performance={{ min: 0.5 }}`, and `CameraRig` calls `regress()` whenever `t` actually changes (our custom rig doesn't go through drei's controls, which is where that signal normally comes from). Dropped the unwired `PerformanceMonitor` rather than leave something that looked functional but wasn't.

## 10. Recharts is code-split

`PayloadCapacityChart` and `MilestonesPerDecadeChart` are dynamically imported (`React.lazy`) since recharts is a real chunk of weight (~100KB gzipped) that only matters for 2 of 12 interaction widgets. Main bundle: ~343KB gzipped; recharts loads separately only when a chart actually renders. The remaining bundle size is mostly three.js + R3F + React themselves — expected for a WebGL app of this kind, not something I found a way to shrink further without cutting a dependency.

## 11. Not built: the "fuller 6DoF, once arrived" free-look toggle (Section 4.2)

`freeLookMode` exists in the store (`toggleFreeLookMode`) but nothing currently calls it or changes behavior when it's true — the always-on drag-to-look (clamped ±49°/±31°) is implemented, the *expanded* mode on top of it isn't. Wanted to flag this honestly rather than leave it looking finished.

## 12. The shuttle is now NASA's real public-domain model, not primitives

You asked for a real model instead of boxes and cylinders. I don't have browser access to Sketchfab/TurboSquid, but I do have `github.com`/`raw.githubusercontent.com` access, and NASA's own `nasa/NASA-3D-Resources` GitHub repo turned out to have exactly what Section 11.1 was pointing at: an official Space Shuttle model ("Space Shuttle (D)"), glTF-binary, 42 distinct materials (belly, wing top, OMS pods, nose, tail, cockpit windows, RCS, the works), explicitly "free and without copyright" as NASA-produced content. `ShuttleModel.jsx` now loads this directly via `useGLTF` — the box/cylinder/cone geometry, hinged door panels, and procedural engine glow are gone. The Canadarm stays procedural since the source model doesn't include one.

Three things had to be solved precisely, not eyeballed, since I still can't render this to check by eye:

- **Axis remap.** The model's native axes (X=nose-tail, Y=width, Z=up) don't match the scene's (Z=nose-tail, X=width, Y=up). Solved with `THREE.Matrix4.makeBasis()` against the three target directions, converted to a quaternion, then round-trip verified by re-applying it to the three local axes and confirming they land exactly on `[0,0,1]`/`[1,0,0]`/`[0,1,0]`. Result: `rotation={[-Math.PI/2, 0, -Math.PI/2]}` — not a value I'd have gotten right by guessing.
- **Scale.** The model's units are inches (its bounding box is ~1471×937×555, i.e. 122.6ft × 78.1ft × 46.3ft — matches the real OV-104's 122ft length and 78ft wingspan almost exactly, confirming the unit guess). `INCH_TO_METER = 0.0254`.
- **Bay alignment.** The model's own payload-bay region (found via its `shut-bay` material's bounding box) doesn't sit at the same z-position as the bay-transit rail points tuned in decision #1. Rather than re-deriving the whole rail against the new geometry, I translated the model group by a computed offset (`[0, 2.76, -7.25]`) so its bay lines up with where the rail already expects it. This is a bounding-box-center estimate, not a structural alignment — it's the first thing to eyeball once you're actually looking at it.

**Compression:** the source file was 2.47MB, heavy for a mobile-first budget. Ran it through `@gltf-transform/cli optimize` (WebP textures capped at 1024px, mesh welding/simplification at a conservative 0.0001 error tolerance, `--palette false` specifically to keep all 42 materials distinct rather than let the optimizer merge similar-looking ones) — down to 360KB, a real 85% reduction, verified afterward that all 42 material names survived intact and the vertex count drop (13.8k → 9.1k) came from welding genuinely-redundant seam vertices, not visible decimation.

**One thing I want to flag rather than let you discover it cold:** the compressed file uses `EXT_meshopt_compression`, which needs a matching decoder wired into the loader or the model fails to load entirely. I checked — `@react-three/drei` 10.7.7's `useGLTF` calls `setMeshoptDecoder()` by default (confirmed by reading `node_modules/@react-three/drei/core/Gltf.js` directly, not assumed), so this works with zero extra config. This was worth checking rather than assuming: an older open GitHub issue on drei's repo shows this wasn't always true.

## What's deferred, unchanged from before

- The "fuller 6DoF, once arrived" free-look toggle (Section 4.2) — `freeLookMode` exists in the store, nothing consumes it yet.
- Door open/close animation — the source model's separate door-prt/door-stb sub-files have bounding boxes that don't cleanly imply their hinge geometry without visual iteration, so I didn't guess at their placement. The main model reads as open-bay already (no door material in its own mesh).

## 13. GitHub Pages needed a base path + an actual build step

You deployed via GitHub Pages instead of Vercel (fine — just a different target than what `vercel.json` assumed). Two things were broken: the repo had the raw source committed, including `index.html`'s `<script src="/src/main.jsx">`, which browsers can't run directly (JSX needs a build step, and GitHub Pages doesn't build anything for you — it's a static file host, not a CI system); and even a proper build defaults to root-relative paths (`/assets/...`), while a GitHub Pages *project* site is served from `/<repo-name>/`, so every asset request would 404 against the actual domain root instead.

Fixed with three changes: `vite.config.js` now sets `base: '/Antariksh/'` only when a `GITHUB_PAGES` env var is set (Vercel still gets `base: '/'`, unaffected); every hardcoded absolute path in the app itself (`ShuttleModel.jsx`'s model URL, the `/read` route check and both links to it) now reads `import.meta.env.BASE_URL` instead, since Vite's automatic base-rewriting only covers things it recognizes as assets in HTML/imports, not string literals used at runtime — this one's easy to miss and would've meant the shuttle model silently 404'd even after the base path was otherwise correct; and `.github/workflows/deploy.yml` builds and deploys on every push, so it's push-and-forget like Vercel. Verified by actually building with `GITHUB_PAGES=true` and grepping the output — every path in `dist/index.html` and the model URL baked into the JS bundle came out correctly prefixed, not just assumed to.

One manual step that has to happen in the GitHub UI (can't be done from a commit): **Settings → Pages → Source → GitHub Actions**, once, on the repo.

## What I couldn't verify from this environment

- **Visual QA, still.** Geometry math (axis remap, scale, bay offset) is verified numerically the same rigorous way as decision #1, but I still haven't *seen* any of this render — no WebGL here. This is now the single most important thing to check first: `npm run dev`, look at the ship, and nudge `MODEL_OFFSET` in `ShuttleModel.jsx` if the bay doesn't line up with the rail the way the numbers predict.
- **Real Android performance with a 360KB model + WebP textures added to the payload.** Should still be well within budget, but worth confirming on your target device alongside everything from decision #9/#10.

