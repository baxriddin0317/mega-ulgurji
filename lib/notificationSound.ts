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
 * Play a two-tone notification chime (like a cash register / doorbell).
 * Used for new order notifications.
 */
export function playOrderSound() {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    // Tone 1: higher pitch
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);        // A5
    osc1.frequency.setValueAtTime(1108.73, now + 0.1); // C#6
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc1.connect(gain1).connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Tone 2: resolve chord (delayed)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, now + 0.15); // E6
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.25, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.5);
  } catch {
    // Silently fail if audio not available
  }
}

/**
 * Play a soft single-tone ping for new user registrations.
 */
export function playUserSound() {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, now);  // E5
    osc.frequency.exponentialRampToValueAtTime(987.77, now + 0.15); // B5 slide up
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  } catch {
    // Silently fail if audio not available
  }
}
