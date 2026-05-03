let audioContext;
let isUnlocked = false;

export async function unlockOrderSound() {
  const context = getAudioContext();
  if (!context) return;

  if (context.state === "suspended") {
    await context.resume().catch(() => {});
  }

  isUnlocked = true;
}

export function playOrderSound() {
  const context = getAudioContext();
  if (!context || !isUnlocked) return;

  if (context.state === "suspended") {
    context.resume().catch(() => {});
  }

  const now = context.currentTime;
  playTone(context, now, 784, 0.12, 0.08);
  playTone(context, now + 0.14, 988, 0.14, 0.1);
  playTone(context, now + 0.32, 1318, 0.2, 0.08);
}

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  return audioContext;
}

function playTone(context, startTime, frequency, duration, volume) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}
