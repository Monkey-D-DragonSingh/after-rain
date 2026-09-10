// Procedural Web Audio Engine for AFTER RAIN
// Completely zero external asset dependency — 100% synthesized in real time!

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  // Rain nodes
  private rainGain: GainNode | null = null;
  private rainSource: AudioBufferSourceNode | null = null;

  // Synth pad nodes
  private padGain: GainNode | null = null;
  private padOscs: OscillatorNode[] = [];
  private padFilter: BiquadFilterNode | null = null;
  private padInterval: ReturnType<typeof setInterval> | null = null;

  // Neon hum nodes
  private neonGain: GainNode | null = null;
  private neonOsc: OscillatorNode | null = null;

  public init() {
    if (this.isInitialized) return;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.isInitialized = true;

      this.setupRain();
      this.setupNeonHum();
      this.startSynthPad();
    } catch (e) {
      console.warn('AudioContext not supported or blocked by autoplay policy', e);
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private setupRain() {
    if (!this.ctx) return;

    // Create 4 seconds of stereo pink/brown filtered noise
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    }

    this.rainSource = this.ctx.createBufferSource();
    this.rainSource.buffer = buffer;
    this.rainSource.loop = true;

    // Bandpass filter for realistic rain timbre
    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1000;
    bandpass.Q.value = 0.8;

    // Lowpass to tame harsh treble
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 3500;

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0.28, this.ctx.currentTime);

    this.rainSource.connect(bandpass);
    bandpass.connect(lowpass);
    lowpass.connect(this.rainGain);
    this.rainGain.connect(this.ctx.destination);

    this.rainSource.start();
  }

  private setupNeonHum() {
    if (!this.ctx) return;

    this.neonOsc = this.ctx.createOscillator();
    this.neonOsc.type = 'sawtooth';
    this.neonOsc.frequency.setValueAtTime(60, this.ctx.currentTime); // 60Hz AC hum

    const humFilter = this.ctx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.setValueAtTime(140, this.ctx.currentTime);

    this.neonGain = this.ctx.createGain();
    this.neonGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    this.neonOsc.connect(humFilter);
    humFilter.connect(this.neonGain);
    this.neonGain.connect(this.ctx.destination);

    this.neonOsc.start();
  }

  private startSynthPad() {
    if (!this.ctx) return;

    // Melancholic cinematic chord progressions (Blade Runner style)
    // Dm9, Bbmaj7, Fmaj7, Cadd9
    const chords = [
      [146.83, 220.00, 261.63, 329.63], // D3, A3, C4, E4
      [116.54, 174.61, 233.08, 293.66], // Bb2, F3, Bb3, D4
      [174.61, 261.63, 329.63, 392.00], // F3, C4, E4, G4
      [130.81, 196.00, 261.63, 293.66], // C3, G3, C4, D4
    ];

    let chordIndex = 0;

    const playNextChord = () => {
      if (!this.ctx || this.isMuted) return;

      const freqs = chords[chordIndex % chords.length];
      chordIndex++;

      // Fade out old oscillators
      this.padOscs.forEach(osc => {
        try {
          osc.stop(this.ctx!.currentTime + 1.5);
        } catch {
          // ignore already stopped oscillators
        }
      });
      this.padOscs = [];

      const padMaster = this.ctx.createGain();
      padMaster.gain.setValueAtTime(0.001, this.ctx.currentTime);
      padMaster.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 3.0);
      padMaster.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 9.5);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(680, this.ctx.currentTime + 4.5);
      filter.frequency.exponentialRampToValueAtTime(380, this.ctx.currentTime + 9.5);

      padMaster.connect(filter);
      filter.connect(this.ctx.destination);

      freqs.forEach(freq => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        // Gentle detuning for lush analog warmth
        const detune = (Math.random() - 0.5) * 12;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.detune.setValueAtTime(detune, this.ctx.currentTime);

        osc.connect(padMaster);
        osc.start();
        osc.stop(this.ctx.currentTime + 10.0);
        this.padOscs.push(osc);
      });
    };

    playNextChord();
    this.padInterval = setInterval(playNextChord, 8500);
  }

  // Trigger distant thunder with low boom & sub-bass rumble
  public playThunder() {
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const dur = 3.5;

    // Sub sine drop
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(75, now);
    subOsc.frequency.exponentialRampToValueAtTime(28, now + dur);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.35, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + dur);

    // Filtered noise crackle
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 1.2));
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(250, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noiseSource.start(now);
  }

  // Footstep on wet pavement
  public playFootstep() {
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Pure crystalline chime for memory discovery
  public playMemoryChime() {
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.0001, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.08, now + idx * 0.09 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 2.2);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 2.3);
    });
  }

  // Automated Transit PA Chime (F4 -> A4 -> C5)
  public playAnnouncementChime() {
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const chimeTones = [349.23, 440.00, 523.25]; // F4, A4, C5

    chimeTones.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.22);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.0001, now + idx * 0.22);
      gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.22 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.22 + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.22);
      osc.stop(now + idx * 0.22 + 0.85);
    });
  }

  // Elevated Train passing sound
  public playTrainSwoosh() {
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const dur = 4.0;

    const panner = this.ctx.createStereoPanner();
    panner.pan.setValueAtTime(-0.9, now);
    panner.pan.linearRampToValueAtTime(0.9, now + dur);

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(70, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 1.8);
    osc.frequency.exponentialRampToValueAtTime(60, now + dur);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.07, now + 1.8);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + dur);
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.ctx) {
      if (this.isMuted) {
        this.ctx.suspend();
      } else {
        this.ctx.resume();
      }
    }
    return this.isMuted;
  }

  public getMuted() {
    return this.isMuted;
  }
}

export const sound = new SoundEngine();
