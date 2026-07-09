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

**GitHub Pages** (what you're using): `.github/workflows/deploy.yml` builds with the correct base path and deploys automatically on every push to `main` — same "push and it updates" behavior as Vercel. **One-time setup**, done once in the GitHub UI, not from Codespaces: repo → **Settings → Pages → Source → GitHub Actions**. Without this one click, Pages serves whatever raw files are in the repo instead of running the workflow, which is exactly what caused the blank page.

The site will be at `https://<your-username>.github.io/<repo-name>/` — note the trailing `/<repo-name>/`. `vite.config.js`'s `base` is hardcoded to `/Antariksh/` to match; if you ever rename the repo, update that too.

**Vercel** (if you switch back): push to GitHub, Vercel auto-deploys, no setup needed — it serves from the root so the GitHub-Pages-specific `base` doesn't apply (the config only activates it when `GITHUB_PAGES=true` is set, which only the Actions workflow sets). `vercel.json` rewrites every path to `index.html` so `/read` works there too.

## Structure

```
public/
  models/        space-shuttle.glb — NASA public-domain model, compressed (DECISIONS.md #12)
src/
  content/        zones.json, timeline.json, mission-watch.json — the single source of truth.
                  Edit these for copy changes; components read from them, nothing is hardcoded twice.
  scenes/         ZoneAnchors (where each zone lives in space), CameraRig, ShuttleModel, ZoneMarkers,
                  ZonePanel3D (in-world content), Starfield, SatelliteBurst, Scene
  hooks/          useFreeFlight (the per-frame flight loop), useInputState (keyboard/drag/joystick)
  state/          useJourneyStore (Zustand)
  components/     HUD layer — TeleportNav, MissionWatchCard, TouchJoystick, VerticalControls,
                  ControlsHint, Onboarding, ReadFallback, ZoneInteractions (the 12 zone widgets), Charts/
```

**Controls:** desktop is WASD/arrows to fly + Space/Shift for up/down + click-drag to look. Touch is an on-screen joystick (bottom-left) + two small up/down buttons + drag-to-look anywhere else. Fly close to a glowing beacon and its zone panel opens in place, near the ship — nothing is a screen-docked sidebar anymore (see DECISIONS.md #14 for why this changed from the original rail design).

**Model attribution:** `space-shuttle.glb` is sourced from [nasa/NASA-3D-Resources](https://github.com/nasa/NASA-3D-Resources) ("Space Shuttle (D)"), NASA-produced content and therefore public domain / free of copyright in the US. Worth double-checking NASA's current media usage guidelines before any commercial use, but nothing here should require attribution.

## Before you treat this as done

1. **This version is screenshot-verified, not just math-verified.** Onboarding, spawn view, flying, looking around, a teleported zone panel, and the touch control layout were all actually rendered and checked (headless Chromium, software WebGL) — see DECISIONS.md #14. Still worth a real look on your actual tablet: software rendering in a sandbox isn't a substitute for real GPU performance.
2. **Real shuttle model, exterior only.** `public/models/space-shuttle.glb` is NASA's own public-domain model (360KB compressed). It's a museum-display asset with no interior geometry — which is exactly why the experience is a free-flight walkaround now, not a fly-through-the-cabin rail (DECISIONS.md #14). The Canadarm is still procedural (the source model doesn't include one).
3. **Two placeholders in `index.html`**: there's no `og:image` (no asset to point it at yet) and no `rel="canonical"` (don't know your Vercel URL yet) — add both once you've deployed once.
4. **Mission Watch will go stale.** `mission-watch.json` is meant to be hand-edited as things resolve — Vikram-1's launch window is 12 July–4 Aug 2026, Gaganyaan G1 is now H2 2026. Check back after either lands.

Full list of what's deferred vs. deliberately simplified: `DECISIONS.md`.
