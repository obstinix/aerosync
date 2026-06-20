import { Howl } from 'howler';

// Generates dynamic synthetically produced WAV PCM 8-bit mono sounds in Data URIs
function makeWavDataUri(type) {
  const sampleRate = 8000;
  const duration = type === 'beep' ? 0.20 : 0.45;
  const numSamples = Math.floor(sampleRate * duration);
  const blockAlign = 1;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const fileSize = 36 + dataSize;

  const buffer = new Uint8Array(44 + dataSize);
  const view = new DataView(buffer.buffer);

  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, fileSize, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"

  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 8, true); // 8-bit

  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;
    if (type === 'beep') {
      const freq = 900 - (t / duration) * 300;
      const angle = 2 * Math.PI * freq * t;
      const decay = Math.exp(-t * 12);
      sample = Math.sin(angle) * decay;
    } else {
      // Whoosh sweep
      const freq = 100 + (t / duration) * 350;
      const angle = 2 * Math.PI * (100 * t + 175 * t * t / duration);
      const env = t < 0.12 ? t / 0.12 : Math.max(0, 1 - (t - 0.12) / (duration - 0.12));
      sample = Math.sin(angle) * env;
    }
    const val = Math.floor((sample + 1) * 127.5);
    buffer[44 + i] = Math.max(0, Math.min(255, val));
  }

  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

const beepUri = makeWavDataUri('beep');
const whooshUri = makeWavDataUri('whoosh');

const beepSound = new Howl({
  src: [beepUri],
  format: ['wav'],
  volume: 0.18
});

const whooshSound = new Howl({
  src: [whooshUri],
  format: ['wav'],
  volume: 0.28
});

export const soundManager = {
  isMuted: () => localStorage.getItem('aerosync_mute') === 'true',
  setMute: (mute) => {
    localStorage.setItem('aerosync_mute', mute ? 'true' : 'false');
  },
  toggleMute: () => {
    const nextMute = !soundManager.isMuted();
    soundManager.setMute(nextMute);
    return nextMute;
  },
  playAlert: () => {
    if (!soundManager.isMuted()) {
      beepSound.play();
    }
  },
  playWhoosh: () => {
    if (!soundManager.isMuted()) {
      whooshSound.play();
    }
  }
};
