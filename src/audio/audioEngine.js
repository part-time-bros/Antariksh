// Everything here is synthesized, not sampled — no audio files exist to
// fetch from this sandbox's allowed domains, and procedural synthesis
// means zero additional page weight regardless. One AudioContext, created
// lazily on the first user gesture (autoplay policies block it otherwise;
// "Begin the journey" is that gesture — see useAudioEngine.js).

let ctx = null
let master = null
let droneGain = null
let whooshGain = null
let whooshFilter = null
let noiseSource = null
let muted = false

function ensureContext() {
  if (ctx) return ctx
  ctx = new (window.AudioContext || window.webkitAudioContext)()
  master = ctx.createGain()
  master.gain.value = 0.7
  master.connect(ctx.destination)
  return ctx
}

function makeNoiseBuffer(context, seconds = 2) {
  const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

/** Low, slowly-evolving space drone. Call once; runs until stopAll(). */
function startDrone() {
  const c = ensureContext()
  droneGain = c.createGain()
  droneGain.gain.value = 0
  droneGain.connect(master)
  droneGain.gain.linearRampToValueAtTime(0.05, c.currentTime + 3)

  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 500
  filter.Q.value = 0.6
  filter.connect(droneGain)

  // Slow LFO breathing the filter cutoff so the drone never feels static.
  const lfo = c.createOscillator()
  lfo.frequency.value = 0.045
  const lfoGain = c.createGain()
  lfoGain.gain.value = 180
  lfo.connect(lfoGain).connect(filter.frequency)
  lfo.start()

  ;[55, 55.3, 110.2].forEach((freq, i) => {
    const osc = c.createOscillator()
    osc.type = i === 2 ? 'sine' : 'sawtooth'
    osc.frequency.value = freq
    const g = c.createGain()
    g.gain.value = i === 2 ? 0.5 : 0.28
    osc.connect(g).connect(filter)
    osc.start()
  })

  // A hint of high-frequency "static" for texture, well under the drone.
  const noise = c.createBufferSource()
  noise.buffer = makeNoiseBuffer(c, 4)
  noise.loop = true
  const noiseFilter = c.createBiquadFilter()
  noiseFilter.type = 'highpass'
  noiseFilter.frequency.value = 3000
  const noiseGain = c.createGain()
  noiseGain.gain.value = 0.012
  noise.connect(noiseFilter).connect(noiseGain).connect(master)
  noise.start()
}

/** Continuous filtered-noise "flight" whoosh; call setWhoosh(0..1) per frame. */
function startWhoosh() {
  const c = ensureContext()
  noiseSource = c.createBufferSource()
  noiseSource.buffer = makeNoiseBuffer(c, 3)
  noiseSource.loop = true

  whooshFilter = c.createBiquadFilter()
  whooshFilter.type = 'bandpass'
  whooshFilter.frequency.value = 220
  whooshFilter.Q.value = 0.7

  whooshGain = c.createGain()
  whooshGain.gain.value = 0

  noiseSource.connect(whooshFilter).connect(whooshGain).connect(master)
  noiseSource.start()
}

/** speed01: 0 (stationary) to 1 (max speed) — called every frame, cheap. */
function setWhoosh(speed01) {
  if (!whooshGain || !ctx) return
  const t = ctx.currentTime
  const targetGain = Math.min(0.16, speed01 * 0.16)
  const targetFreq = 180 + speed01 * 900
  whooshGain.gain.setTargetAtTime(targetGain, t, 0.15)
  whooshFilter.frequency.setTargetAtTime(targetFreq, t, 0.2)
}

/** Soft two-note chime — a beacon just came into focus. */
function playChime() {
  if (muted) return
  const c = ensureContext()
  const t = c.currentTime
  ;[880, 1318.5].forEach((freq, i) => {
    const osc = c.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    const g = c.createGain()
    const start = t + i * 0.09
    g.gain.setValueAtTime(0, start)
    g.gain.linearRampToValueAtTime(0.09, start + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.6)
    osc.connect(g).connect(master)
    osc.start(start)
    osc.stop(start + 0.65)
  })
}

/** Short, neutral UI click for buttons/nav. */
function playClick() {
  if (muted) return
  const c = ensureContext()
  const t = c.currentTime
  const osc = c.createOscillator()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(700, t)
  osc.frequency.exponentialRampToValueAtTime(420, t + 0.08)
  const g = c.createGain()
  g.gain.setValueAtTime(0.07, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09)
  osc.connect(g).connect(master)
  osc.start(t)
  osc.stop(t + 0.1)
}

/** Rising pitch-sweep "warp" cue for teleport-to-zone. */
function playWarp() {
  if (muted) return
  const c = ensureContext()
  const t = c.currentTime
  const osc = c.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(120, t)
  osc.frequency.exponentialRampToValueAtTime(900, t + 0.5)
  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(300, t)
  filter.frequency.exponentialRampToValueAtTime(4000, t + 0.5)
  const g = c.createGain()
  g.gain.setValueAtTime(0.001, t)
  g.gain.linearRampToValueAtTime(0.06, t + 0.1)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55)
  osc.connect(filter).connect(g).connect(master)
  osc.start(t)
  osc.stop(t + 0.6)
}

/** Bright ascending sparkle burst, timed to the 104-satellites visual. */
function playBurst() {
  if (muted) return
  const c = ensureContext()
  const base = c.currentTime
  for (let i = 0; i < 10; i++) {
    const t = base + i * 0.045 + Math.random() * 0.02
    const osc = c.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 1400 + Math.random() * 1600
    const g = c.createGain()
    g.gain.setValueAtTime(0.045, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
    osc.connect(g).connect(master)
    osc.start(t)
    osc.stop(t + 0.32)
  }
}

function setMuted(value) {
  muted = value
  if (master && ctx) master.gain.setTargetAtTime(value ? 0 : 0.7, ctx.currentTime, 0.08)
}

function init() {
  const c = ensureContext()
  if (c.state === 'suspended') c.resume()
  if (!droneGain) startDrone()
  if (!whooshGain) startWhoosh()
}

export const audioEngine = {
  init,
  setWhoosh,
  playChime,
  playClick,
  playWarp,
  playBurst,
  setMuted,
  get isReady() {
    return !!ctx
  },
}
