/**
 * Web Audio API 环境音生成器
 * 无需外部音频文件，纯算法生成
 */

type SoundType = 'rain' | 'ocean' | 'forest';

export interface AmbientSound {
  start: () => void;
  stop: () => void;
  setVolume: (v: number) => void;
}

function createNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * seconds;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function createBrownNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * seconds;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  return buffer;
}

export function createAmbientSound(type: SoundType): AmbientSound {
  let ctx: AudioContext | null = null;
  let gainNode: GainNode | null = null;
  let nodes: AudioNode[] = [];
  let started = false;

  const init = () => {
    if (ctx) return;
    ctx = new AudioContext();
    gainNode = ctx.createGain();
    gainNode.gain.value = 0.3;
    gainNode.connect(ctx.destination);
  };

  const start = () => {
    if (started) return;
    init();
    if (!ctx || !gainNode) return;
    started = true;

    if (type === 'rain') {
      // Brown noise filtered for rain
      const brownBuffer = createBrownNoiseBuffer(ctx, 4);
      const source = ctx.createBufferSource();
      source.buffer = brownBuffer;
      source.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 800;
      bandpass.Q.value = 0.5;

      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 200;

      source.connect(bandpass);
      bandpass.connect(highpass);
      highpass.connect(gainNode);
      source.start();
      nodes.push(source);

      // Occasional drip sounds via high-freq impulses
      const scheduleDrip = () => {
        if (!ctx || !started) return;
        const osc = ctx.createOscillator();
        const dripGain = ctx.createGain();
        osc.frequency.value = 2000 + Math.random() * 3000;
        osc.type = 'sine';
        dripGain.gain.setValueAtTime(0.02, ctx.currentTime);
        dripGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(dripGain);
        dripGain.connect(gainNode!);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
        setTimeout(scheduleDrip, 200 + Math.random() * 800);
      };
      setTimeout(scheduleDrip, 500);

    } else if (type === 'ocean') {
      // White noise with LFO modulated filter for waves
      const noiseBuffer = createNoiseBuffer(ctx, 4);
      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 400;
      lowpass.Q.value = 1;

      // LFO to modulate filter frequency (wave swells)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 0.08; // ~12 second cycle
      lfoGain.gain.value = 300;
      lfo.connect(lfoGain);
      lfoGain.connect(lowpass.frequency);
      lfo.start();

      source.connect(lowpass);
      lowpass.connect(gainNode);
      source.start();
      nodes.push(source, lfo);

    } else if (type === 'forest') {
      // Soft noise floor
      const noiseBuffer = createNoiseBuffer(ctx, 4);
      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 3000;
      bandpass.Q.value = 0.3;

      const forestGain = ctx.createGain();
      forestGain.gain.value = 0.15;

      source.connect(bandpass);
      bandpass.connect(forestGain);
      forestGain.connect(gainNode);
      source.start();
      nodes.push(source);

      // Bird-like chirps
      const scheduleChirp = () => {
        if (!ctx || !started) return;
        const chirpFreq = 2000 + Math.random() * 4000;
        const osc = ctx.createOscillator();
        const chirpGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(chirpFreq, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(chirpFreq + 500, ctx.currentTime + 0.1);
        osc.frequency.linearRampToValueAtTime(chirpFreq, ctx.currentTime + 0.15);
        chirpGain.gain.setValueAtTime(0, ctx.currentTime);
        chirpGain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.02);
        chirpGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(chirpGain);
        chirpGain.connect(gainNode!);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
        setTimeout(scheduleChirp, 1000 + Math.random() * 4000);
      };
      setTimeout(scheduleChirp, 500);
    }
  };

  const stop = () => {
    started = false;
    for (const node of nodes) {
      try { (node as AudioBufferSourceNode | OscillatorNode).stop?.(); } catch { /* already stopped */ }
    }
    nodes = [];
    if (ctx) {
      ctx.close();
      ctx = null;
      gainNode = null;
    }
  };

  const setVolume = (v: number) => {
    if (gainNode) {
      gainNode.gain.value = Math.max(0, Math.min(1, v));
    }
  };

  return { start, stop, setVolume };
}
