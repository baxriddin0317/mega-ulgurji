/**
 * Notification sound system using Web Audio API.
 * Generates tones programmatically — no external sound files needed.
 * Auto-unlocks AudioContext on first user interaction.
 */

let audioCtx: AudioContext | null = null;
let unlocked = false;

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

// Browsers require a user gesture to start AudioContext.
// This unlocks it on the first click/touch/keydown anywhere on the page.
function unlock() {
  if (unlocked) return;
  const ctx = getContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  unlocked = true;
}

if (typeof window !== 'undefined') {
  const events = ['click', 'touchstart', 'keydown'];
  const handler = () => {
    unlock();
    events.forEach((e) => document.removeEventListener(e, handler));
  };
  events.forEach((e) => document.addEventListener(e, handler, { once: false }));
}

/**
 * Triple-tone cash register chime — LOUD.
 * Used for new order notifications in warehouse environments.
 */
export function playOrderSound() {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    // Tone 1: 880Hz A5
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.5, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Tone 2: 1047Hz C6
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1047, now + 0.15);
    gain2.gain.setValueAtTime(0.5, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.4);

    // Tone 3: 1319Hz E6
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1319, now + 0.3);
    gain3.gain.setValueAtTime(0.45, now + 0.3);
    gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.65);
    osc3.start(now + 0.3);
    osc3.stop(now + 0.7);
  } catch {
    // Silently fail if audio not available
  }
}

/**
 * Two-tone rising welcome ping — LOUD.
 * Used for new user registration notifications.
 */
export function playUserSound() {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    // Tone 1: 523Hz C5
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523, now);
    gain1.gain.setValueAtTime(0.45, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Tone 2: 784Hz G5
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(784, now + 0.15);
    gain2.gain.setValueAtTime(0.45, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.5);
  } catch {
    // Silently fail if audio not available
  }
}

/**
 * Double beep warning — LOUD, piercing square wave.
 * Used for alert / warning notifications.
 */
export function playAlertSound() {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    // Beep 1: 440Hz square wave
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(440, now);
    gain1.gain.setValueAtTime(0.5, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc1.start(now);
    osc1.stop(now + 0.2);

    // Beep 2: 440Hz square wave (after gap)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(440, now + 0.25);
    gain2.gain.setValueAtTime(0.5, now + 0.25);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc2.start(now + 0.25);
    osc2.stop(now + 0.45);
  } catch {
    // Silently fail if audio not available
  }
}
