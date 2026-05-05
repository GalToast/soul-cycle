let _audioCtx = null;

function getCtx() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (_audioCtx.state === 'suspended') {
    _audioCtx.resume();
  }
  return _audioCtx;
}

function osc(freq, type = 'sine', duration = 0.15, gain = 0.3, ctx = null) {
  const c = ctx || getCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime);
  g.gain.setValueAtTime(gain, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  o.connect(g);
  g.connect(c.destination);
  o.start(c.currentTime);
  o.stop(c.currentTime + duration + 0.01);
  return { osc: o, gain: g };
}

function noise(duration = 0.15, gain = 0.1, ctx = null) {
  const c = ctx || getCtx();
  const bufSize = c.sampleRate * duration;
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  src.connect(g);
  g.connect(c.destination);
  src.start(c.currentTime);
  src.stop(c.currentTime + duration + 0.01);
  return { src, gain: g };
}

function chord(freqs, type = 'sine', duration = 0.4, gain = 0.15, ctx = null) {
  const c = ctx || getCtx();
  freqs.forEach(f => osc(f, type, duration, gain, c));
}

function freqOf(era) {
  const map = {
    ANCIENT: 110,
    MEDIEVAL: 165,
    EARLY_MODERN: 220,
    INDUSTRIAL: 330,
    MODERN: 440,
    NEAR_FUTURE: 550,
    FAR_FUTURE: 660,
  };
  return map[era] || 220;
}

class AudioManager {
  constructor() {
    this._muted = false;
    this._soundscape = null;
    this._soundscapeGain = null;
    this._hoverBuffer = null;
    this._clickBuffer = null;
    this._initialized = false;
    this._eraMusic = null;
    this._eraMusicGain = null;
    this._eraSource = null;
    this._currentEra = null;
    this._eraMusicFiles = {
      ANCIENT: 'assets/music/ancient_ambient.mp3',
      MEDIEVAL: 'assets/music/medieval_ambient.mp3',
      EARLY_MODERN: 'assets/music/earlymodern_ambient.mp3',
      INDUSTRIAL: 'assets/music/industrial_ambient.mp3',
      MODERN: 'assets/music/modern_ambient.mp3',
      NEAR_FUTURE: 'assets/music/nearfuture_ambient.mp3',
      FAR_FUTURE: 'assets/music/farfuture_ambient.mp3',
    };
  }

  _ensureInit() {
    if (this._initialized) return;
    this._initialized = true;
    const ctx = getCtx();
    this._soundscapeGain = ctx.createGain();
    this._soundscapeGain.gain.setValueAtTime(0.12, ctx.currentTime);
    this._soundscapeGain.connect(ctx.destination);
  }

  updateSoundscape(era) {
    this._ensureInit();
    this._stopSoundscape();
    if (this._muted) return;
    const ctx = getCtx();
    const freq = freqOf(era);
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const g = ctx.createGain();
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, ctx.currentTime);
    osc2.frequency.setValueAtTime(freq * 1.5, ctx.currentTime);
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.5);
    osc1.connect(g);
    osc2.connect(g);
    g.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 4);
    osc2.stop(ctx.currentTime + 4);
    this._soundscape = { osc1, osc2, gain: g };
    this._soundscapeGain = g;
  }

  _stopSoundscape() {
    if (this._soundscape) {
      try {
        this._soundscape.osc1.stop();
        this._soundscape.osc2.stop();
      } catch (e) { /* already stopped */ }
      this._soundscape = null;
    }
  }

  crisisBeep() {
    if (this._muted) return;
    const ctx = getCtx();
    osc(880, 'square', 0.08, 0.25, ctx);
    setTimeout(() => osc(660, 'square', 0.08, 0.25, ctx), 100);
    setTimeout(() => osc(440, 'square', 0.12, 0.25, ctx), 200);
  }

  lifeStart() {
    if (this._muted) return;
    const ctx = getCtx();
    const base = 330;
    osc(base, 'sine', 0.5, 0.2, ctx);
    setTimeout(() => osc(base * 1.25, 'sine', 0.4, 0.18, ctx), 120);
    setTimeout(() => osc(base * 1.5, 'sine', 0.6, 0.15, ctx), 280);
  }

  deathFlash() {
    if (this._muted) return;
    const ctx = getCtx();
    osc(220, 'sawtooth', 0.3, 0.3, ctx);
    osc(110, 'square', 0.5, 0.2, ctx);
    noise(0.4, 0.15, ctx);
    setTimeout(() => osc(80, 'sine', 0.6, 0.25, ctx), 150);
  }

  fragmentExtract() {
    if (this._muted) return;
    const ctx = getCtx();
    osc(1200, 'sine', 0.12, 0.2, ctx);
    setTimeout(() => osc(900, 'sine', 0.1, 0.18, ctx), 60);
    setTimeout(() => osc(600, 'sine', 0.2, 0.15, ctx), 130);
    setTimeout(() => osc(1800, 'triangle', 0.15, 0.1, ctx), 160);
  }

playEraMusic(era) {
    if (this._muted) return;
    const musicFile = this._eraMusicFiles[era];
    if (!musicFile) return;
    const ctx = getCtx();

    if (this._currentEra === era && this._eraSource) {
      return;
    }

    if (this._eraSource) {
      this._crossfadeToEra(era, musicFile, ctx);
    } else {
      this._startEraMusic(era, musicFile, ctx);
    }
  }

  _startEraMusic(era, musicFile, ctx) {
    fetch(musicFile)
      .then(resp => resp.arrayBuffer())
      .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        if (this._muted) return;
        const source = ctx.createBufferSource();
        const gainNode = ctx.createGain();
        source.buffer = audioBuffer;
        source.loop = true;
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 2);
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start();
        this._eraSource = source;
        this._eraMusicGain = gainNode;
        this._currentEra = era;
        this._eraMusic = this._eraMusicFiles[era];
      })
      .catch(err => {
        console.warn('Era music failed to load:', err);
      });
  }

  _crossfadeToEra(era, musicFile, ctx) {
    fetch(musicFile)
      .then(resp => resp.arrayBuffer())
      .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        const oldSource = this._eraSource;
        const oldGain = this._eraMusicGain;
        const source = ctx.createBufferSource();
        const gainNode = ctx.createGain();
        source.buffer = audioBuffer;
        source.loop = true;
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 2);
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start();
        if (oldGain) {
          oldGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
        }
        setTimeout(() => {
          try { oldSource?.stop(); } catch (e) {}
        }, 2100);
        this._eraSource = source;
        this._eraMusicGain = gainNode;
        this._currentEra = era;
        this._eraMusic = musicFile;
      })
      .catch(err => {
        console.warn('Era music crossfade failed:', err);
      });
  }

  stopEraMusic() {
    if (this._eraMusicGain) {
      const ctx = getCtx();
      this._eraMusicGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
    }
    setTimeout(() => {
      try { this._eraSource?.stop(); } catch (e) {}
      this._eraSource = null;
      this._eraMusicGain = null;
      this._currentEra = null;
      this._eraMusic = null;
    }, 1100);
  }

  eraMusic(era) {
    this.updateSoundscape(era);
  }

  _stopEraMusicImmediate() {
    try { this._eraSource?.stop(); } catch (e) {}
    this._eraSource = null;
    this._eraMusicGain = null;
    this._currentEra = null;
    this._eraMusic = null;
  }

  soulFingerprintHarmonics() {
    if (this._muted) return;
    const ctx = getCtx();
    const base = 200 + Math.random() * 400;
    osc(base, 'sine', 0.3, 0.12, ctx);
    osc(base * 1.414, 'sine', 0.35, 0.08, ctx);
    osc(base * 1.618, 'triangle', 0.4, 0.06, ctx);
    osc(base * 2, 'sine', 0.25, 0.05, ctx);
  }

  limboEnter() {
    if (this._muted) return;
    const ctx = getCtx();
    osc(80, 'sine', 1.2, 0.2, ctx);
    osc(120, 'sine', 1.2, 0.15, ctx);
    osc(160, 'sine', 1.2, 0.1, ctx);
    noise(1.0, 0.06, ctx);
  }

  limboExit() {
    if (this._muted) return;
    const ctx = getCtx();
    osc(200, 'sine', 0.3, 0.18, ctx);
    setTimeout(() => osc(400, 'sine', 0.3, 0.15, ctx), 150);
    setTimeout(() => osc(800, 'sine', 0.4, 0.12, ctx), 300);
  }

  uiHover() {
    if (this._muted) return;
    const ctx = getCtx();
    osc(600, 'sine', 0.05, 0.06, ctx);
  }

  uiClick() {
    if (this._muted) return;
    const ctx = getCtx();
    osc(800, 'sine', 0.06, 0.12, ctx);
    setTimeout(() => osc(1000, 'sine', 0.05, 0.08, ctx), 40);
  }

  uiDisable() {
    if (this._muted) return;
    const ctx = getCtx();
    osc(150, 'square', 0.12, 0.1, ctx);
  }

  mute() {
    this._muted = true;
    this._stopSoundscape();
    if (this._soundscapeGain) {
      const ctx = getCtx();
      this._soundscapeGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
    }
  }

  unmute() {
    this._muted = false;
    if (this._soundscapeGain) {
      const ctx = getCtx();
      this._soundscapeGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1);
    }
  }
}

function initAudio() {
  return new AudioManager();
}

function playSound(type) {
  const ctx = getCtx();
  switch (type) {
    case 'hover':
      osc(600, 'sine', 0.05, 0.06, ctx);
      break;
    case 'click':
      osc(800, 'sine', 0.06, 0.12, ctx);
      setTimeout(() => osc(1000, 'sine', 0.05, 0.08, ctx), 40);
      break;
    case 'disable':
      osc(150, 'square', 0.12, 0.1, ctx);
      break;
    case 'crisis':
      osc(880, 'square', 0.08, 0.25, ctx);
      setTimeout(() => osc(660, 'square', 0.08, 0.25, ctx), 100);
      setTimeout(() => osc(440, 'square', 0.12, 0.25, ctx), 200);
      break;
    case 'lifeStart':
      osc(330, 'sine', 0.5, 0.2, ctx);
      setTimeout(() => osc(412.5, 'sine', 0.4, 0.18, ctx), 120);
      setTimeout(() => osc(495, 'sine', 0.6, 0.15, ctx), 280);
      break;
    case 'death':
      osc(220, 'sawtooth', 0.3, 0.3, ctx);
      osc(110, 'square', 0.5, 0.2, ctx);
      noise(0.4, 0.15, ctx);
      setTimeout(() => osc(80, 'sine', 0.6, 0.25, ctx), 150);
      break;
    case 'fragment':
      osc(1200, 'sine', 0.12, 0.2, ctx);
      setTimeout(() => osc(900, 'sine', 0.1, 0.18, ctx), 60);
      setTimeout(() => osc(600, 'sine', 0.2, 0.15, ctx), 130);
      setTimeout(() => osc(1800, 'triangle', 0.15, 0.1, ctx), 160);
      break;
    case 'limboEnter':
      osc(80, 'sine', 1.2, 0.2, ctx);
      osc(120, 'sine', 1.2, 0.15, ctx);
      osc(160, 'sine', 1.2, 0.1, ctx);
      noise(1.0, 0.06, ctx);
      break;
    case 'limboExit':
      osc(200, 'sine', 0.3, 0.18, ctx);
      setTimeout(() => osc(400, 'sine', 0.3, 0.15, ctx), 150);
      setTimeout(() => osc(800, 'sine', 0.4, 0.12, ctx), 300);
      break;
    default:
      osc(500, 'sine', 0.08, 0.1, ctx);
  }
}

function stopSound(type) {
  // No-op for synthesized audio; kept for API compatibility
}

export { AudioManager, initAudio, playSound, stopSound };
