/**
 * SOUL-CYCLE â ” UI Module
 *
 * DOM manipulation, canvas rendering, modals, toasts, tutorial, and overlays.
 * All functions expect the following DOM element IDs to exist in index.html:
 *
 * Overlays (visibility toggled via class 'hidden'):
 *   overlay-soul-browser, overlay-limbo, overlay-gameover, overlay-settings,
 *   overlay-tutorial, overlay-upgrade, overlay-pause, overlay-victory, overlay-era
 *
 * Panels (content injected via innerHTML):
 *   soul-browser-content, limbo-content, death-overlay-content, settings-content,
 *   event-panel, era-display, upgrade-content, title-screen, how-to-play-content,
 *   era-transition-content, event-history
 *
 * Display elements (updated via innerHTML/textContent):
 *   life-phase-bar, resource-display, faith-display, soul-fingerprint
 *
 * Dynamic elements (created/removed at runtime):
 *   divine-toast, outcome-toast, consequence-toast, generic-toast, loading-screen,
 *   tutorial-tip, tutorial-arrow, help-modal, life-detail-modal
 */

/* 0. TTS Narration Engine
 *
 * Uses MiniMax TTS API directly from browser (avoids CORS by using the API
 * endpoint with user's API key from localStorage or sessionStorage).
 * Era voice presets and skip/cancel logic per spec.
 */

import { state, getSoulCompletionStatus } from './main.js';
import { generateSoulAboutPanel, ACHIEVEMENT_DEFS, getAchievementStats } from './world.js';

export const isNarrationEnabled = () => state.narrationEnabled;

export const setNarrationEnabled = (enabled) => {
  if (state) state.narrationEnabled = enabled;
  if (!enabled) cancelCurrentNarration();
};

function cancelCurrentNarration() {
  _currentEventId = null;
  if (_activeAudio) {
    _activeAudio.pause();
    _activeAudio = null;
  }
}

export const triggerEventNarration = (event) => {
  if (!event || !event.description || !state?.narrationEnabled) return;
  cancelCurrentNarration();
  _currentEventId = event.id;

  const trimmed = event.description.length > 300 ? event.description.substring(0, 297) + '...' : event.description;
  _playTTSText(trimmed, event.era || state?.era, event.id);
};

async function _playTTSText(text, era, eventId) {
  if (!text || text.length < 3) return;
  if (_currentEventId !== eventId) return;

  const voice = ERA_VOICES[era] || ERA_VOICES.ANCIENT;

  try {
    const apiKey = _getMiniMaxKey();
    if (!apiKey) {
      await _generateViaCLI(text, voice, eventId);
      return;
    }
    await _generateViaAPI(text, voice, eventId, apiKey);
  } catch (e) {
    // Silent fallback â ” don't block gameplay
  }
}

function _getMiniMaxKey() {
  try {
    if (sessionStorage.getItem('mmx_api_key')) return sessionStorage.getItem('mmx_api_key');
    if (localStorage.getItem('mmx_api_key')) return localStorage.getItem('mmx_api_key');
  } catch {}
  return null;
}

async function _generateViaAPI(text, voice, eventId, apiKey) {
  const response = await fetch('https://api.minimax.chat/v1/t2a_v2', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'speech-02-hd',
      text,
      stream: false,
      voice_setting: {
        voice_id: voice,
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: 'mp3',
      },
    }),
  });

  if (!response.ok) throw new Error(`TTS API ${response.status}`);
  if (_currentEventId !== eventId) return;

  const arrayBuffer = await response.arrayBuffer();
  if (_currentEventId !== eventId) return;

  const blob = new Blob([arrayBuffer], { type: 'audio/mp3' });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  _activeAudio = audio;

  audio.onended = () => URL.revokeObjectURL(url);
  audio.onerror = () => URL.revokeObjectURL(url);
  audio.play().catch(() => {});
}

async function _generateViaCLI(text, voice, eventId) {
  // No local mmx CLI relay available from browser context
  // Silent fallback â ” TTS will only work if API key is stored in sessionStorage
}

export const skipNarration = () => {
  if (_activeAudio) {
    _activeAudio.pause();
    _activeAudio = null;
  }
  _currentEventId = null;
};

export const init = () => {
  getSceneCache();
  initTouchSupport();
  initToastModalDismiss();
};

const SCENE_CACHE_KEY = 'soulcycle_scene_cache';
const SCENE_DIR = 'assets/scenes/';
const RATE_LIMIT_MS = 30000;
const ERA_VOICES = {
  ANCIENT: 'English_Deep-VoicedGentleman',
  MEDIEVAL: 'English_ManWithDeepVoice',
  EARLY_MODERN: 'English_CaptivatingStoryteller',
  INDUSTRIAL: 'English_Trustworth_Man',
  MODERN: 'English_Upbeat_Woman',
  NEAR_FUTURE: 'English_ConfidentWoman',
  FAR_FUTURE: 'Robot_Armor',
};

let _sceneCache = null;
let _rateLimitTimer = null;
let _generationQueue = [];

function getSceneCache() {
  if (_sceneCache !== null) return _sceneCache;
  try {
    const stored = localStorage.getItem(SCENE_CACHE_KEY);
    _sceneCache = stored ? JSON.parse(stored) : {};
  } catch {
    _sceneCache = {};
  }
  return _sceneCache;
}

function saveSceneCache() {
  try {
    localStorage.setItem(SCENE_CACHE_KEY, JSON.stringify(_sceneCache));
  } catch {}
}

function isRateLimited() {
  if (!_rateLimitTimer) return false;
  return Date.now() - _rateLimitTimer < RATE_LIMIT_MS;
}

function getEraImageStyle(era) {
  const styles = {
    ANCIENT: 'painterly, worn textures, aged parchment feel, classical composition',
    MEDIEVAL: 'gothic, illuminated manuscript style, stained glass tones, dark atmosphere',
    EARLY_MODERN: 'baroque lighting, rich colors, dramatic shadows, renaissance influence',
    INDUSTRIAL: 'gritty, desaturated, soot and smoke, harsh mechanical forms, high contrast',
    MODERN: 'clean, diffused light, muted realism, photographic quality',
    NEAR_FUTURE: 'dystopian, overcast sky, technological decay, muted cyberpunk',
    FAR_FUTURE: 'neon holographic, glowing edges, cyberpunk neon, luminous particles, dark background with vibrant accents',
    PREHISTORIC: 'primitive, cave painting influence, earthy ochres, raw natural forms'
  };
  return styles[era] || styles.ANCIENT;
}

function getEventImagePrompt(event, era) {
  const eraStyle = getEraImageStyle(era);
  const tags = event.cascadeTags || [];
  const desc = event.description || '';

  const tagLower = tags.map(t => t.toLowerCase());
  const isGrief = tagLower.some(t => ['grief', 'sadness', 'sorrow', 'loss', 'despair', 'melancholy'].includes(t));
  const isLove = tagLower.some(t => ['love', 'tenderness', 'connection', 'affection', 'devotion'].includes(t));
  const isDread = tagLower.some(t => ['dread', 'fear', 'terror', 'anxiety', 'vertigo', 'horror'].includes(t));
  const isWonder = tagLower.some(t => ['wonder', 'awe', 'discovery', 'curiosity'].includes(t));
  const isRage = tagLower.some(t => ['rage', 'anger', 'fury', 'betrayal'].includes(t));
  const isViolence = tagLower.some(t => ['violence', 'blood', 'fire', 'burning', 'destruction'].includes(t));

  let mood, palette, subject;
  if (isGrief) {
    mood = 'dark, empty, silhouette of figure against dim light';
    palette = 'deep blues and grays, fading light, desaturated';
    subject = 'solitary figure, fading into shadow';
  } else if (isLove) {
    mood = 'warm, soft light, intimate atmosphere';
    palette = 'warm amber and soft rose tones, gentle glow';
    subject = 'two figures close together or connected forms';
  } else if (isDread) {
    mood = 'oppressive, ominous atmosphere, sense of unseen threat';
    palette = 'dark purples and blacks, hints of red, deep shadows';
    subject = 'twisted forms emerging from darkness';
  } else if (isRage || isViolence) {
    mood = 'chaotic, intense, distorted by heat and force';
    palette = 'deep oranges, blacks, red accents, fire glow';
    subject = 'destruction, breaking structures, fire in streets';
  } else if (isWonder) {
    mood = 'expansive, luminous, vast and breathtaking';
    palette = 'ethereal blues and golds, light emanating from center';
    subject = 'vast space or extraordinary discovery';
  } else {
    mood = 'atmospheric, contemplative mood';
    palette = 'muted earth tones, atmospheric haze';
    subject = 'scene reflecting the event narrative';
  }

  const crisisPart = event.crisis ? 'crisis moment,' : '';
  const landmarkPart = event.landmark ? 'landmark moment,' : '';

  return `Abstract atmospheric scene: ${crisisPart}${landmarkPart} ${subject}. ${desc.substring(0, 80)}. Style: ${mood}. Color palette: ${palette}. ${eraStyle}. Cinematic composition, no text, no letters, no faces, no figures identifiable as specific people.`;
}

function shouldGenerateScene(event) {
  if (!event || !event.id) return false;
  if (event.crisis === true) return true;
  if (event.landmark === true) return true;
  if ((event.weight || 0) >= 3) return true;
  return false;
}

function getFallbackGradient(tags) {
  const tagLower = (tags || []).map(t => t.toLowerCase());
  if (tagLower.some(t => ['grief', 'sadness', 'loss'].includes(t))) {
    return 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
  }
  if (tagLower.some(t => ['love', 'tenderness', 'connection'].includes(t))) {
    return 'linear-gradient(135deg, #2d1b3d 0%, #4a1942 50%, #6b2d5b 100%)';
  }
  if (tagLower.some(t => ['dread', 'fear', 'terror', 'horror'].includes(t))) {
    return 'linear-gradient(135deg, #1a0a1a 0%, #2d0a2d 50%, #4a0a4a 100%)';
  }
  if (tagLower.some(t => ['rage', 'anger', 'fury'].includes(t))) {
    return 'linear-gradient(135deg, #2d1a0a 0%, #5c2a0a 50%, #8b3a0a 100%)';
  }
  if (tagLower.some(t => ['wonder', 'awe', 'discovery'].includes(t))) {
    return 'linear-gradient(135deg, #0a1a2d 0%, #0a2d4a 50%, #0a4a6b 100%)';
  }
  return 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #3d3d3d 100%)';
}

function getSceneImagePath(eventId) {
  const cache = getSceneCache();
  return cache[eventId] || null;
}

function setSceneImagePath(eventId, path) {
  const cache = getSceneCache();
  cache[eventId] = path;
  saveSceneCache();
}

function triggerSceneGeneration(event, era, onResult) {
  if (!shouldGenerateScene(event)) {
    if (onResult) onResult(null);
    return;
  }

  const cached = getSceneImagePath(event.id);
  if (cached) {
    if (onResult) onResult(cached);
    return;
  }

  queueSceneGeneration(event, era, onResult);
}

async function queueSceneGeneration(event, era, onResult) {
  _generationQueue.push({ event, era, onResult });
  await processGenerationQueue();
}

async function processGenerationQueue() {
  if (_generationQueue.length === 0) return;
  if (isRateLimited()) return;

  const next = _generationQueue.shift();
  if (!next) return;

  const result = await generateEventSceneImage(next.event, next.era);
  if (next.onResult) next.onResult(result);

  processGenerationQueue();
}

async function generateEventSceneImage(event, era) {
  if (isRateLimited()) return null;

  const outputPath = `${SCENE_DIR}event_${event.id}.png`;

  const prompt = getEventImagePrompt(event, era);

  _rateLimitTimer = Date.now();

  try {
    const { execSync } = require('child_process');
    execSync(`mmx image generate --prompt "${prompt}" --aspect-ratio "16:9" --output "${outputPath}"`, {
      cwd: process.cwd(),
      stdio: 'pipe'
    });

    setSceneImagePath(event.id, outputPath);
    return outputPath;
  } catch (err) {
    console.warn('Scene generation failed:', err.message);
    return null;
  }
}

export const generateEventSceneForEvent = (event, era) => {
  return new Promise((resolve) => {
    triggerSceneGeneration(event, era || 'ANCIENT', (path) => {
      resolve(path);
    });
  });
};

export const createEventCard = (event) => {
  const card = document.createElement('div');
  card.className = `event-card event-${event.category || 'default'}`;
  card.dataset.eventId = event.id;

  const scenePath = getSceneImagePath(event.id);
  const fallbackGradient = getFallbackGradient(event.cascadeTags);

  let sceneHtml = '';
  if (scenePath) {
    sceneHtml = `
      <div class="event-scene-container">
        <img src="${scenePath}" alt="Event scene" class="event-scene-image" loading="lazy" />
        <div class="event-scene-overlay"></div>
      </div>
    `;
  } else if (shouldGenerateScene(event)) {
    sceneHtml = `
      <div class="event-scene-container event-scene-loading" data-event-id="${event.id}">
        <div class="event-scene-placeholder" style="background: ${fallbackGradient};"></div>
        <div class="event-scene-generating">Generating scene...</div>
      </div>
    `;

    const era = event.era || 'ANCIENT';
    generateEventSceneForEvent(event, era).then((path) => {
      const container = document.querySelector(`.event-scene-loading[data-event-id="${event.id}"]`);
      if (!container) return;

      if (path) {
        container.innerHTML = `
          <img src="${path}" alt="Event scene" class="event-scene-image" loading="lazy" />
          <div class="event-scene-overlay"></div>
        `;
        container.classList.remove('event-scene-loading');
      } else {
        const placeholder = container.querySelector('.event-scene-placeholder');
        if (placeholder) {
          placeholder.classList.add('event-scene-fallback');
          container.querySelector('.event-scene-generating')?.remove();
        }
        container.classList.remove('event-scene-loading');
      }
    });
  } else {
    sceneHtml = `
      <div class="event-scene-container">
        <div class="event-scene-placeholder" style="background: ${fallbackGradient};"></div>
      </div>
    `;
  }

  card.innerHTML = `
    ${sceneHtml}
    <div class="event-header">
      <span class="event-era">${event.era || 'Unknown Era'}</span>
      <span class="event-phase">${event.phase || ''}</span>
    </div>
    <h3 class="event-title">${event.title || 'An Event'}</h3>
    <p class="event-description">${event.description || ''}</p>
    <div class="event-tags">
      ${(event.cascadeTags || []).map(tag => `<span class="event-tag tag-${tag}">${tag}</span>`).join('')}
    </div>
  `;

  const sceneContainer = card.querySelector('.event-scene-container');
  if (sceneContainer) {
    const img = sceneContainer.querySelector('.event-scene-image');
    if (img) {
      sceneContainer.addEventListener('click', () => {
        sceneContainer.classList.toggle('expanded');
      });
      sceneContainer.addEventListener('mouseenter', () => {
        if (!sceneContainer.classList.contains('expanded')) {
          img.style.transform = 'scale(1.05)';
        }
      });
      sceneContainer.addEventListener('mouseleave', () => {
        img.style.transform = 'scale(1)';
      });
    }
  }

  return card;
};

export { getSceneImagePath, getFallbackGradient, shouldGenerateScene };

let touchStartX = 0;
let touchStartY = 0;
const SWIPE_THRESHOLD = 50;

export const initTouchSupport = () => {
  const lifeViewport = document.getElementById('life-viewport');
  if (lifeViewport) {
    lifeViewport.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    lifeViewport.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) {
        const target = e.target;
        if (!target.closest('button') && !target.closest('.whisper-panel')) {
          advanceCurrentEvent();
        }
      }
      if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD * 1.5) {
        if (dx < 0) advanceCurrentEvent();
        else goBackInHistory();
      }
    }, { passive: true });
  }

  const canvas = document.getElementById('curve-canvas');
  if (canvas) {
    canvas.addEventListener('touchend', (e) => {
      const currentRisk = window.currentRiskLevel || 0;
      if (currentRisk >= 0.97) {
        window.currentRiskLevel = -0.97;
        renderRiskDial('curve-canvas', 0);
      }
    });

    let isDragging = false;
    canvas.addEventListener('touchstart', (e) => { isDragging = true; e.preventDefault(); }, { passive: false });
    canvas.addEventListener('touchend', () => { isDragging = false; });
    canvas.addEventListener('touchmove', (e) => {
      if (isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        window.currentRiskLevel = Math.max(-1, Math.min(1, (x / rect.width) * 2 - 1));
        renderRiskDial('curve-canvas', (window.currentRiskLevel + 1) / 2);
      }
    }, { passive: false });
  }

  document.querySelectorAll('.choice-button').forEach(btn => {
    btn.addEventListener('touchstart', () => btn.classList.add('touch-active'), { passive: true });
    btn.addEventListener('touchend', () => btn.classList.remove('touch-active'), { passive: true });
    btn.addEventListener('touchcancel', () => btn.classList.remove('touch-active'), { passive: true });
  });

  const speedSlider = document.querySelector('.speed-slider');
  if (speedSlider) {
    let isDraggingSlider = false;
    speedSlider.addEventListener('touchstart', (e) => { isDraggingSlider = true; }, { passive: true });
    speedSlider.addEventListener('touchend', () => { isDraggingSlider = false; });
    speedSlider.addEventListener('touchmove', (e) => {
      if (isDraggingSlider) {
        const touch = e.touches[0];
        const rect = speedSlider.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
        const value = 0.5 + ratio * 2.5;
        speedSlider.value = value;
        speedSlider.dispatchEvent(new Event('input'));
      }
    }, { passive: true });
  }

  const soulBrowserContent = document.getElementById('soul-browser-content');
  if (soulBrowserContent) {
    let bx = 0, by = 0;
    soulBrowserContent.addEventListener('touchstart', (e) => {
      bx = e.touches[0].clientX;
      by = e.touches[0].clientY;
    }, { passive: true });
    soulBrowserContent.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - bx;
      const dy = e.changedTouches[0].clientY - by;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
        const scrollEl = soulBrowserContent.querySelector('.soul-analysis-grid');
        if (scrollEl) {
          if (dx < 0) scrollEl.scrollLeft += 200;
          else scrollEl.scrollLeft -= 200;
        }
      }
    }, { passive: true });
  }
};

export const initToastModalDismiss = () => {
  document.addEventListener('touchend', (e) => {
    const toast = e.target.closest('.toast');
    if (toast) {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }

    const overlay = e.target.closest('.modal-overlay');
    if (overlay && e.target === overlay) {
      overlay.classList.remove('visible');
      const modal = overlay.querySelector('.modal-content');
      if (modal) {
        setTimeout(() => overlay.remove(), 300);
      } else {
        setTimeout(() => overlay.remove(), 300);
      }
    }
  }, { passive: true });
};

export const advanceCurrentEvent = () => {
  if (_activeTypewriter) {
    _activeTypewriter.skipped = true;
    if (_activeTypewriter.cleanup) _activeTypewriter.cleanup();
    return;
  }
  if (_advancingEvent) return;
  _advancingEvent = true;
  document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true }));
  setTimeout(() => { _advancingEvent = false; }, 0);
};

export const goBackInHistory = () => {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
};

export const showOverlay = (id) => {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('hidden');
    el.classList.add('visible');
  }
};

export const hideOverlay = (id) => {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('visible');
    el.classList.add('hidden');
  }
};

export const showDivineToast = (message, duration = 3000) => {
  const existing = document.getElementById('divine-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'divine-toast';
  toast.className = 'toast toast-divine';
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('visible'));

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

export const showOutcomeToast = (outcome, duration = 4000) => {
  const existing = document.getElementById('outcome-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'outcome-toast';
  toast.className = `toast toast-outcome outcome-${outcome.type || 'neutral'}`;
  toast.innerHTML = `<span class="outcome-label">${outcome.label || 'Outcome'}</span><span class="outcome-value">${outcome.value || ''}</span>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('visible'));

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

export const showLongTermConsequenceToast = (text, duration = 5000) => {
  const existing = document.getElementById('consequence-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'consequence-toast';
  toast.className = 'toast toast-consequence';
  toast.innerHTML = `<span class="consequence-icon">&#9733;</span><span class="consequence-text">${text}</span>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('visible'));

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

export const renderGoalTracker = (soul) => {
  if (!soul) return null;
  const status = getSoulCompletionStatus(soul);
  if (status.complete && !soul.soulComplete) return null;

  const section = document.createElement('div');
  section.className = 'goal-tracker';

  const req = { minFragmentTypes: 6, crisesNeeded: 50, erasNeeded: 7, anchorsNeeded: 5 };
  const fragmentLabel = `${status.fragmentTypes}/${req.minFragmentTypes}`;
  const crisesLabel = `${status.crises}/${req.crisesNeeded}`;
  const erasLabel = `${status.eras}/${req.erasNeeded}`;
  const anchorsLabel = `${status.anchors}/${req.anchorsNeeded}`;
  const fragmentDone = status.fragmentTypes >= req.minFragmentTypes;
  const crisesDone = status.crises >= req.crisesNeeded;
  const erasDone = status.eras >= req.erasNeeded;
  const anchorsDone = status.anchors >= req.anchorsNeeded;

  const missingEmotionalTypes = Object.entries(status.fragmentTypeDetails || {})
    .filter(([_, hasIt]) => !hasIt)
    .map(([type]) => type);
  const missingEmotionalHint = missingEmotionalTypes.length > 0
    ? ` â ” Need: ${missingEmotionalTypes.slice(0, 3).join(', ')}${missingEmotionalTypes.length > 3 ? 'â ¦' : ''}`
    : '';
  const crisesMissing = req.crisesNeeded - status.crises;
  const crisesMissingHint = crisesMissing > 0 ? ` â ” ${crisesMissing} more crises` : '';
  const erasMissing = req.erasNeeded - status.eras;
  const erasMissingHint = erasMissing > 0 ? ` â ” ${erasMissing} more eras` : '';
  const anchorsMissing = req.anchorsNeeded - status.anchors;
  const anchorsMissingHint = anchorsMissing > 0 ? ` â ” ${anchorsMissing} more anchors` : '';

  section.innerHTML = `
    <div class="goal-tracker-header">Journey Progress</div>
    <div class="goal-tracker-items">
      <div class="goal-item${fragmentDone ? ' done' : ''}" title="Collect at least 1 of each: grief, love, dread, wonder, rage, grace">
        <span class="goal-label">Fragments</span>
        <span class="goal-value">${fragmentLabel}${!fragmentDone ? missingEmotionalHint : ''}</span>
        <span class="goal-check">${fragmentDone ? 'â—‰' : 'â—‹'}</span>
      </div>
      <div class="goal-item${crisesDone ? ' done' : ''}" title="Survive 50 crises">
        <span class="goal-label">Crises</span>
        <span class="goal-value">${crisesLabel}${!crisesDone ? crisesMissingHint : ''}</span>
        <span class="goal-check">${crisesDone ? 'â—‰' : 'â—‹'}</span>
      </div>
      <div class="goal-item${erasDone ? ' done' : ''}" title="Live in all 7 eras">
        <span class="goal-label">Eras</span>
        <span class="goal-value">${erasLabel}${!erasDone ? erasMissingHint : ''}</span>
        <span class="goal-check">${erasDone ? 'â—‰' : 'â—‹'}</span>
      </div>
      <div class="goal-item${anchorsDone ? ' done' : ''}" title="Form 5 anchors">
        <span class="goal-label">Anchors</span>
        <span class="goal-value">${anchorsLabel}${!anchorsDone ? anchorsMissingHint : ''}</span>
        <span class="goal-check">${anchorsDone ? 'â—‰' : 'â—‹'}</span>
      </div>
    </div>
  `;
  return section;
};

export const showSoulBrowser = () => {
  const container = document.getElementById('soul-browser-content');
  if (!container) return;

  container.innerHTML = '';

  const aboutData = generateSoulAboutPanel(state);

  const soul = state.soul ? state.soul : { livesLived: 0, fragments: [], anchors: [], unlockedEras: ['ANCIENT', 'MEDIEVAL'], metaStats: { totalDeaths: 0, violentDeaths: 0, peacefulDeaths: 0, lovesLost: 0, childrenBorn: 0 } };

  const header = document.createElement('div');
  header.className = 'soul-browser-header';
  const lives = state.soul && state.soul.livesLived !== undefined ? state.soul.livesLived : 0;
  const fragCount = state.soul && state.soul.fragments ? state.soul.fragments.length : 0;
  const anchorCount = state.soul && state.soul.anchors ? state.soul.anchors.length : 0;
  const isComplete = state.soul && state.soul.soulComplete;
  header.innerHTML = `
    <h2>Soul Analysis${isComplete ? ' <span class="soul-complete-badge">COMPLETE</span>' : ''}</h2>
    <div class="soul-stats">
      <span>Lives: ${lives}</span>
      <span>Fragments: ${fragCount}</span>
      <span>Anchors: ${anchorCount}</span>
    </div>
  `;
  container.appendChild(header);

  if (aboutData) {
    const aboutPanel = document.createElement('div');
    aboutPanel.className = 'soul-about-panel';
    aboutPanel.innerHTML = `
      <div class="soul-signature">${aboutData.signature || ''}</div>
      <div class="soul-meta">
        <span class="meta-emotion">${aboutData.dominantEmotion || 'unknown'}</span>
        <span class="meta-complexity">Complexity: ${aboutData.complexity || 0}</span>
        <span class="meta-pattern">${aboutData.patternNote || ''}</span>
      </div>
      <div class="soul-era-affinity">
        <span class="era-label">Era Affinity:</span>
        <span class="era-value">${aboutData.eraAffinity || 'None'}</span>
      </div>
    `;
    container.appendChild(aboutPanel);
  }

  const grid = renderSoulAnalysisGrid(soul);
  container.appendChild(grid);

  const goalTracker = renderGoalTracker(state.soul);
  if (goalTracker) container.appendChild(goalTracker);

  const fingerprintEl = renderSoulFingerprint(soul);
  if (fingerprintEl) container.appendChild(fingerprintEl);

  const achievements = renderAchievements(soul);
  container.appendChild(achievements);

  showOverlay('overlay-soul-browser');
};

export const renderSoulAnalysisGrid = (st) => {
  const grid = document.createElement('div');
  grid.className = 'soul-analysis-grid';

  const fragmentTypes = ['tone', 'fear', 'love', 'warning', 'location', 'name', 'object', 'word'];
  for (const type of fragmentTypes) {
    const fragments = (st.fragments || []).filter(f => f.type === type);
    if (fragments.length === 0) continue;

    const cell = document.createElement('div');
    cell.className = `analysis-cell fragment-type-${type}`;
    cell.innerHTML = `<h4>${type}</h4><ul>${fragments.slice(0, 5).map(f =>
      `<li class="fragment-item ${f.isAnchor ? 'anchor' : ''}">${f.value}</li>`
    ).join('')}</ul>`;
    grid.appendChild(cell);
  }

  return grid;
};

export const renderAchievements = (st) => {
  const section = document.createElement('div');
  section.className = 'achievements-section';

  const meta = st.metaStats || {};
  const achievements = [];

  if ((meta.totalDeaths || 0) >= 1) achievements.push({ id: 'first_death', label: 'First Death', icon: 'â˜ ' });
  if ((meta.violentDeaths || 0) >= 1) achievements.push({ id: 'violent_end', label: 'Violent End', icon: 'âš”' });
  if ((meta.peacefulDeaths || 0) >= 1) achievements.push({ id: 'peaceful_passage', label: 'Peaceful Passage', icon: 'âœ§' });
  if ((meta.lovesLost || 0) >= 1) achievements.push({ id: 'love_lost', label: 'Love Lost', icon: 'â™¥' });
  if ((meta.childrenBorn || 0) >= 1) achievements.push({ id: 'life_given', label: 'Life Given', icon: 'âœ¿' });
  if ((st.anchors?.length || 0) >= 1) achievements.push({ id: 'first_anchor', label: 'First Anchor', icon: 'âš“' });
  if ((st.fragments?.length || 0) >= 10) achievements.push({ id: 'collector', label: 'Fragment Collector', icon: 'â—†' });

  section.innerHTML = `<h3>Achievements</h3><div class="achievements-grid">${achievements.map(a =>
    `<div class="achievement-badge" title="${a.label}">${a.icon}<span>${a.label}</span></div>`
  ).join('')}</div>`;

  return section;
};

export const showAchievementModal = (soulState) => {
  const existing = document.getElementById('achievement-modal');
  if (existing) existing.remove();
  buildAchievementModal(soulState);
};

function buildAchievementModal(soulState) {
  const modal = document.createElement('div');
  modal.id = 'achievement-modal';
  modal.className = 'modal-overlay';

  const content = document.createElement('div');
  content.className = 'modal-content achievement-modal-content';

  const total = Object.keys(ACHIEVEMENT_DEFS).length;
  const unlocked = soulState.achievementsUnlocked?.length || 0;
  const { byCategory } = getAchievementStats(soulState);

  const CATEGORY_LABELS = {
    lifespan: 'Lifespan',
    fragment: 'Fragment Collector',
    anchor: 'Echo Anchors',
    era: 'Temporal Wanderer',
    crisis: 'Crisis Survival',
    chain: 'Chain Weaving',
    speedrunner: 'Speedrunner',
    peaceful: 'Manner of Death',
    special: 'Special',
  };

  const categories = Object.entries(ACHIEVEMENT_DEFS).reduce((acc, [id, def]) => {
    if (!acc[def.category]) acc[def.category] = [];
    acc[def.category].push({ id, ...def });
    return acc;
  }, {});

  let earnedMap = {};
  try {
    earnedMap = (soulState.achievementsUnlocked || []).reduce((m, id) => { m[id] = true; return m; }, {});
  } catch {}

  const tierColor = { bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', platinum: '#e5e4e2' };

  let earnedIds = new Set(soulState.achievementsUnlocked || []);
  const earnedList = [...earnedIds].map(id => {
    const def = ACHIEVEMENT_DEFS[id];
    if (!def) return null;
    const earnedEntry = (soulState.achievementNotifications || []).find(n => n.id === id);
    return {
      id,
      name: def.name,
      icon: def.icon,
      tier: def.tier,
      category: def.category,
      earnedAt: earnedEntry?.timestamp ? new Date(earnedEntry.timestamp).toLocaleDateString() : null,
    };
  }).filter(Boolean).sort((a, b) => (b.earnedAt || 0) - (a.earnedAt || 0));

  const recentEarned = earnedList.slice(0, 3);
  const allAchievementsHtml = Object.entries(categories).map(([cat, defs]) => `
    <div class="ach-category-group">
      <h4 class="ach-category-title">${CATEGORY_LABELS[cat] || cat}</h4>
      <div class="ach-category-list">
        ${defs.map(def => {
          const isEarned = earnedMap[def.id];
          const earnedEntry = earnedList.find(e => e.id === def.id);
          const hint = getAchievementHint(def.id, soulState);
          return `
            <div class="ach-item ${isEarned ? 'earned' : 'locked'}">
              <span class="ach-icon" style="${isEarned ? `color: ${tierColor[def.tier] || '#fff'}` : ''}">${isEarned ? def.icon : '?'}</span>
              <div class="ach-info">
                <span class="ach-name">${isEarned ? def.name : '???'}</span>
                <span class="ach-desc">${isEarned ? def.description : (hint || 'Locked')}</span>
                ${earnedEntry?.earnedAt ? `<span class="ach-earned-date">Earned: ${earnedEntry.earnedAt}</span>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');

  content.innerHTML = `
    <div class="ach-modal-header">
      <h2>Achievements</h2>
      <span class="ach-counter">${unlocked}/${total}</span>
      <button class="btn-close-ach" data-close-ach>&#x2715;</button>
    </div>
    ${recentEarned.length > 0 ? `
      <div class="ach-recent">
        <h4>Recently Earned</h4>
        <div class="ach-recent-list">
          ${recentEarned.map(a => `
            <div class="ach-recent-item">
              <span class="ach-icon" style="color: ${tierColor[a.tier] || '#fff'}">${a.icon}</span>
              <span class="ach-name">${a.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
    <div class="ach-all-list">${allAchievementsHtml}</div>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  requestAnimationFrame(() => modal.classList.add('visible'));

  modal.querySelector('[data-close-ach]').addEventListener('click', () => {
    modal.classList.remove('visible');
    setTimeout(() => modal.remove(), 300);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('visible');
      setTimeout(() => modal.remove(), 300);
    }
  });
};

function getAchievementHint(achievementId, soulState) {
  const hints = {
    centurian: () => {
      const age = soulState.currentAge || 0;
      if (age >= 70) return 'Almost there!';
      if (age >= 50) return `${80 - age} years to go`;
      return null;
    },
    methuselah: () => {
      const age = soulState.currentAge || 0;
      if (age >= 90) return 'So close to 100!';
      if (age >= 80) return `${100 - age} years to go`;
      return null;
    },
    ancient_of_days: () => {
      const age = soulState.currentAge || 0;
      if (age >= 100) return `${110 - age} years to go`;
      return null;
    },
    fragment_awakening: () => {
      const count = soulState.fragments?.length || 0;
      if (count >= 1) return 'Collected!';
      return null;
    },
    memory_keeper: () => {
      const count = soulState.fragments?.length || 0;
      if (count >= 5) return `${count}/10 fragments`;
      return null;
    },
    fragment_collector: () => {
      const count = soulState.fragments?.length || 0;
      if (count >= 10) return `${count}/25 fragments`;
      return null;
    },
    archive_of_lives: () => {
      const count = soulState.fragments?.length || 0;
      if (count >= 30) return `${count}/50 fragments`;
      return null;
    },
    anchor_born: () => {
      if ((soulState.anchors?.length || 0) >= 1) return 'Formed!';
      return null;
    },
    trinity_of_echoes: () => {
      const count = soulState.anchors?.length || 0;
      if (count >= 2) return `${count}/3 anchors`;
      return null;
    },
    constellation_of_echoes: () => {
      const count = soulState.anchors?.length || 0;
      if (count >= 3) return `${count}/5 anchors`;
      return null;
    },
    era_hopper: () => {
      const count = soulState.unlockedEras?.length || 0;
      if (count >= 2) return `${count}/4 eras unlocked`;
      return null;
    },
    era_walker: () => {
      const count = soulState.unlockedEras?.length || 0;
      if (count >= 5) return `${count}/7 eras unlocked`;
      return null;
    },
    storm_survivor: () => {
      const count = soulState.metaStats?.crisesSurvived || 0;
      if (count >= 3) return `${count}/5 crises survived`;
      return null;
    },
    crisis_forger: () => {
      const count = soulState.metaStats?.crisesSurvived || 0;
      if (count >= 7) return `${count}/10 crises survived`;
      return null;
    },
    unbreakable: () => {
      const count = soulState.metaStats?.crisesSurvived || 0;
      if (count >= 15) return `${count}/25 crises survived`;
      return null;
    },
    gentle_release: () => soulState.metaStats?.peacefulDeaths >= 1 ? 'Died peacefully!' : null,
    violent_passage: () => soulState.metaStats?.violentDeaths >= 1 ? 'Died violently!' : null,
  };

  const hintFn = hints[achievementId];
  return hintFn ? hintFn() : null;
}

export const openLifeDetailModal = (life) => {
  const existing = document.getElementById('life-detail-modal');
  if (existing) existing.remove();
  createLifeDetailModal(life);
};

export const createLifeDetailModal = (life) => {
  const modal = document.createElement('div');
  modal.id = 'life-detail-modal';
  modal.className = 'modal-overlay';

  const content = document.createElement('div');
  content.className = 'modal-content life-detail-content';
  content.innerHTML = `
    <h2>${life.name || 'Unknown Soul'}</h2>
    <div class="life-detail-grid">
      <div class="detail-row"><span class="detail-label">Era:</span><span class="detail-value">${life.era || 'Unknown'}</span></div>
      <div class="detail-row"><span class="detail-label">Year:</span><span class="detail-value">${life.year || '?'}</span></div>
      <div class="detail-row"><span class="detail-label">Location:</span><span class="detail-value">${life.location?.city || '?'}, ${life.location?.country || ''}</span></div>
      <div class="detail-row"><span class="detail-label">Health:</span><span class="detail-value">${life.health || 'unknown'}</span></div>
      <div class="detail-row"><span class="detail-label">Social Class:</span><span class="detail-value">${life.socialClass || 'unknown'}</span></div>
      <div class="detail-row"><span class="detail-label">Gender:</span><span class="detail-value">${life.genderPresentation || 'ambiguous'}</span></div>
      ${life.anchor ? `<div class="detail-row anchor-row"><span class="detail-label">Anchor:</span><span class="detail-value anchor-value">${life.anchor.value}</span></div>` : ''}
    </div>
    ${life.events?.length ? `<div class="life-events-list"><h3>Life Events</h3>${life.events.map(e => `<div class="life-event-item"><span class="event-age">Age ${e.age || '?'}</span><span class="event-title">${e.title || 'Unknown event'}</span></div>`).join('')}</div>` : ''}
    <button class="btn-close-modal" data-close-modal>Close</button>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  requestAnimationFrame(() => modal.classList.add('visible'));

  const closeBtn = modal.querySelector('[data-close-modal]');
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('visible');
    setTimeout(() => modal.remove(), 300);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('visible');
      setTimeout(() => modal.remove(), 300);
    }
  });
};

export const showLimbo = (limboState) => {
  const container = document.getElementById('limbo-content');
  if (!container) return;

  container.innerHTML = '';

  let canvas = document.getElementById('limbo-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'limbo-canvas';
    canvas.width = 400;
    canvas.height = 300;
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
    container.appendChild(canvas);
  }

  const limboDiv = document.createElement('div');
  limboDiv.className = 'limbo-container';

  const fragCount = limboState.fragments?.length || 0;
  const anchorCount = limboState.anchors?.length || 0;
  const totalWeight = fragCount + anchorCount * 2;
  const weightLabel = totalWeight <= 3 ? 'light' : totalWeight <= 8 ? 'heavier' : 'heavy';

  const chainTypes = ['GRIEF', 'LOVE', 'DREAD', 'WONDER', 'RAGE', 'GRACE'];
  const dominantChain = limboState.dominantChain || (limboState.fragments?.length > 0
    ? chainTypes.find(c => limboState.fragments.some(f => f.cascadeTags?.includes(c))) || null
    : null);

  const chainLabels = { GRIEF: 'grief', LOVE: 'love', DREAD: 'dread', WONDER: 'wonder', RAGE: 'rage', GRACE: 'grace' };

  let reflectionHTML = '';
  if (fragCount > 0 || anchorCount > 0) {
    const dominantLabel = dominantChain ? chainLabels[dominantChain] : 'something unnamed';
    reflectionHTML = `
      <div class="limbo-reflection">
        <p class="reflection-fragments">Your soul carries ${fragCount} fragment${fragCount !== 1 ? 's' : ''} and ${anchorCount} anchor${anchorCount !== 1 ? 's' : ''}. The weight of them is ${weightLabel}.</p>
        ${dominantChain ? `<p class="reflection-dominant">The dominant thread of your existence: <em>${dominantLabel}</em>.</p>` : ''}
      </div>
    `;
  }

  const previousEra = limboState.previousEra || limboState.era || null;
  const nextEra = limboState.nextEra || (limboState.unlockedEras?.length > 1
    ? limboState.unlockedEras.find(e => e !== previousEra) || 'INDUSTRIAL'
    : 'INDUSTRIAL');

  let eraReflectionHTML = '';
  if (previousEra && previousEra !== nextEra) {
    const prevLabel = previousEra.replace('_', ' ');
    const nextLabel = nextEra.replace('_', ' ');
    eraReflectionHTML = `<p class="limbo-era-reflection">You leave <strong>${prevLabel}</strong> behind. <strong>${nextLabel}</strong> waits, if you're ready.</p>`;
  } else if (nextEra) {
    const nextLabel = nextEra.replace('_', ' ');
    eraReflectionHTML = `<p class="limbo-era-reflection"><strong>${nextLabel}</strong> waits, when you are ready.</p>`;
  }

  const orientationChoices = [
    { id: 'light', text: 'Carry your anchors lightly', hint: 'Release your grip on what you have gathered.' },
    { id: 'gather', text: 'Embrace what you have gathered', hint: 'Let every fragment and anchor define you.' },
  ];
  const chosenOrientation = orientationChoices[Math.floor(Math.random() * orientationChoices.length)];

  const showMemoryPreview = limboState.previousLife && limboState.previousLife.events?.length > 0 && Math.random() < 0.3;
  let memoryPreviewHTML = '';
  if (showMemoryPreview) {
    const definingEvent = limboState.previousLife.events[limboState.previousLife.events.length - 1];
    const eventText = definingEvent?.title || definingEvent?.description || 'A defining moment';
    memoryPreviewHTML = `<div class="limbo-memory-preview"><em>"${eventText}"</em></div>`;
  }

  const limboStartTime = Date.now();
  const formatWaitingTime = (era) => {
    if (era === 'FAR_FUTURE') return 'Moments feel like centuries here.';
    if (era === 'NEAR_FUTURE') return 'Time is strange in these years.';
    if (era === 'INDUSTRIAL') return 'The clock on the wall ticks slow.';
    if (era === 'MODERN') return 'Time slips by unnoticed.';
    if (era === 'EARLY_MODERN') return 'An hour feels like a day.';
    if (era === 'MEDIEVAL') return 'The bells have not rung in what feels like ages.';
    if (era === 'ANCIENT') return 'A breath. A pause. Then silence.';
    return 'Time moves differently here.';
  };

  limboDiv.innerHTML = `
    <h2>The In-Between</h2>
    <p class="limbo-description">${limboState.message || 'You exist between lives.'}</p>
    <div class="limbo-soul-state">
      <div class="limbo-fragments">
        <h3>Fragments Collected</h3>
        <ul>${(limboState.fragments || []).map(f => `<li class="fragment-${f.type}">${f.value}</li>`).join('') || '<li>None yet</li>'}</ul>
      </div>
      ${(limboState.anchors || []).length > 0 ? `<div class="limbo-anchors"><h3>Anchors</h3><ul>${limboState.anchors.map(a => `<li class="anchor-item">${a.value}</li>`).join('')}</ul></div>` : ''}
    </div>
    ${reflectionHTML}
    ${eraReflectionHTML}
    ${memoryPreviewHTML}
    <p class="limbo-time-hint">${formatWaitingTime(limboState.era || 'ANCIENT')}</p>
    <div class="limbo-orientation">
      <p class="orientation-label">Before you pass through again:</p>
      <button class="btn-orientation" data-orientation="${chosenOrientation.id}">${chosenOrientation.text}</button>
      <span class="orientation-hint">${chosenOrientation.hint}</span>
    </div>
    <button class="btn-reincarnate" data-action="reincarnate">Reincarnate</button>
  `;

  container.appendChild(limboDiv);
  showOverlay('overlay-limbo');

  const ctx = canvas.getContext('2d');
  let animating = true;
  const startTime = performance.now();

  const animate = (timestamp) => {
    if (!animating) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const time = timestamp - startTime;
    drawLimboParticlesSwirl(ctx, canvas.width, canvas.height, time);
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);

  const stopAnim = () => { animating = false; };
  container._limboStopAnim = stopAnim;
};

export const showFragments = (newFragments) => {
  if (!newFragments || newFragments.length === 0) return;
  const container = document.getElementById('fragment-display');
  if (!container) return;
  newFragments.forEach((frag, i) => {
    const el = document.createElement('div');
    el.className = 'fragment-pop';
    el.textContent = `+${frag.value}`;
    el.style.left = `${20 + i * 30}px`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  });
};

export const drawCurve = (mode = 1) => {
  const canvas = document.getElementById('curve-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (mode === 0) return;
  const w = canvas.width, h = canvas.height;
  ctx.strokeStyle = '#44aaff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.bezierCurveTo(w * 0.25, h * 0.7, w * 0.75, h * 0.3, w, 0);
  ctx.stroke();
};

export const updateUI = () => {
  const connectionEl = document.getElementById('connection-display');
  const vitalityEl = document.getElementById('vitality-display');
  const momentumEl = document.getElementById('momentum-display');
  const ageEl = document.getElementById('age-display');
  const eraEl = document.getElementById('era-display');
  if (connectionEl) connectionEl.textContent = state.connection;
  if (vitalityEl) vitalityEl.textContent = state.vitality;
  if (momentumEl) momentumEl.textContent = state.momentum;
  if (ageEl) ageEl.textContent = state.currentAge;
  if (eraEl) eraEl.textContent = state.currentLife?.era || 'ANCIENT';
  const fragBadge = document.getElementById('frag-badge');
  if (fragBadge) {
    const count = state.soul?.fragments?.length || 0;
    fragBadge.textContent = `${count} fragment${count !== 1 ? 's' : ''}`;
  }
};

export const resizeCanvas = () => {
  const canvas = document.getElementById('curve-canvas');
  if (!canvas) return;
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
};

export const showDeathOverlay = (deathData, newAchievements = []) => {
  const container = document.getElementById('death-overlay-content');
  if (!container) return;

  container.innerHTML = '';

  const tierColor = { bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', platinum: '#e5e4e2' };
  const achievementsHtml = newAchievements.length > 0 ? `
    <div class="death-achievements">
      <h4>Achievements Unlocked!</h4>
      <div class="death-achievement-list">
        ${newAchievements.map(a => `
          <div class="death-achievement-item">
            <span class="death-ach-icon" style="color: ${tierColor[a.tier] || '#fff'}">${a.icon || 'â˜…'}</span>
            <span class="death-ach-name">${a.name || a.label || 'Achievement'}</span>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  const deathDiv = document.createElement('div');
  deathDiv.className = 'death-overlay-container';
  deathDiv.innerHTML = `
    <h2>${deathData.title || 'Life Ended'}</h2>
    <p class="death-description">${deathData.description || 'A soul has departed.'}</p>
    <div class="death-stats">
      <span>Age: ${deathData.age || '?'}</span>
      <span>Era: ${deathData.era || 'Unknown'}</span>
    </div>
    ${deathData.fragmentGained ? `<div class="fragment-gained">Fragment gained: "${deathData.fragmentGained}"</div>` : ''}
    ${achievementsHtml}
    <button class="btn-continue" data-action="continue">Continue</button>
  `;

  container.appendChild(deathDiv);
  // FIX 2026-10-13: the death content lives in #death-overlay (the alertdialog
  // with death-overlay-content) — NOT the empty #overlay-gameover modal. Showing
  // the wrong overlay left the gameover visible-but-blank over the game.
  showOverlay('death-overlay');
};

export const showSettingsPanel = () => {
  const container = document.getElementById('settings-content');
  if (!container) return;

  container.innerHTML = '';

  const panel = document.createElement('div');
  panel.className = 'settings-panel';
  panel.innerHTML = `
    <h2>Settings</h2>
    <div class="settings-group">
      <label class="setting-item">
        <input type="checkbox" id="setting-tips-enabled" checked />
        <span>Show Tips</span>
      </label>
      <label class="setting-item">
        <input type="checkbox" id="setting-sound-enabled" checked />
        <span>Sound <span class="setting-desc">â ” UI clicks & alerts</span></span>
      </label>
      <label class="setting-item">
        <input type="checkbox" id="setting-music-enabled" checked />
        <span>Music <span class="setting-desc">â ” era ambience tracks</span></span>
      </label>
      <label class="setting-item">
        <input type="checkbox" id="setting-narration-enabled" checked />
        <span>Narration <span class="setting-desc">â ” AI voice reading events</span></span>
      </label>
    </div>
    <div class="settings-group">
      <h3>Game Speed</h3>
      <input type="range" id="setting-game-speed" min="0.5" max="3" step="0.5" value="1" />
    </div>
    <button class="btn-save-settings" data-action="save-settings">Save</button>
    <button class="btn-close-settings" data-action="close-settings">Close</button>
  `;

  container.appendChild(panel);

  const narrationCb = panel.querySelector('#setting-narration-enabled');
  if (narrationCb && state) narrationCb.checked = state.narrationEnabled !== false;
  narrationCb?.addEventListener('change', (e) => setNarrationEnabled(e.target.checked));

  const soundCb = panel.querySelector('#setting-sound-enabled');
  soundCb?.addEventListener('change', (e) => {
    if (state?.audio) state.audio.muted = !e.target.checked;
  });

  showOverlay('overlay-settings');
};

export const toggleTips = (enabled) => {
  const tips = document.querySelectorAll('.tip-container, .tutorial-tip');
  tips.forEach(tip => {
    if (enabled) {
      tip.classList.remove('hidden');
    } else {
      tip.classList.add('hidden');
    }
  });

  const tipsEnabled = enabled;
  try {
    if (state.settings) {
      state.settings.tipsEnabled = tipsEnabled;
    }
  } catch (e) {
    // State not available
  }
};

export const updateHeaderUI = () => {
  updateResourceDisplay(state);
  updateFaithDisplay(state);
  renderLifePhaseBar(state);
};

export const renderSoulFingerprint = (soulState) => {
  if (!soulState || !(soulState.fragments || []).length) return null;

  const fingerprint = document.createElement('div');
  fingerprint.className = 'fingerprint-display';
  fingerprint.style.margin = '16px 0';
  fingerprint.style.padding = '12px';
  fingerprint.style.background = 'rgba(255,255,255,0.03)';
  fingerprint.style.borderRadius = '8px';

  const fragmentTypes = ['tone', 'fear', 'love', 'warning'];
  const colors = { tone: '#d4af37', fear: '#c0392b', love: '#e91e63', warning: '#e67e22' };

  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'fingerprint-dots';

  for (const type of fragmentTypes) {
    const fragments = (soulState.fragments || []).filter(f => f.type === type);
    const count = fragments.length;
    const maxCount = 12;
    const displayCount = Math.min(count, maxCount);

    const typeRow = document.createElement('div');
    typeRow.className = `fingerprint-type-row type-${type}`;

    const label = document.createElement('span');
    label.className = 'fingerprint-type-label';
    label.style.color = colors[type];
    label.textContent = type.toUpperCase();
    typeRow.appendChild(label);

    const dots = document.createElement('div');
    dots.className = 'fingerprint-dot-row';

    for (let i = 0; i < maxCount; i++) {
      const dot = document.createElement('span');
      dot.className = 'fingerprint-dot';
      if (i < displayCount) {
        dot.style.backgroundColor = colors[type];
        dot.style.boxShadow = `0 0 6px ${colors[type]}88`;
        if (fragments[i] && fragments[i].isAnchor) {
          dot.classList.add('anchor-dot');
          dot.style.boxShadow = `0 0 10px ${colors[type]}, 0 0 2px #fff`;
        }
      } else {
        dot.style.backgroundColor = '#2a2a45';
      }
      dot.style.width = '14px';
      dot.style.height = '14px';
      dots.appendChild(dot);
    }

    const countLabel = document.createElement('span');
    countLabel.className = 'fingerprint-count-label';
    countLabel.style.color = colors[type];
    countLabel.textContent = `${count}`;
    dots.appendChild(countLabel);

    typeRow.appendChild(dots);
    dotsContainer.appendChild(typeRow);
  }

  fingerprint.appendChild(dotsContainer);
  return fingerprint;
};

export const renderLifePhaseBar = (st) => {
  const container = document.getElementById('life-phase-bar');
  if (!container) return;

  const currentAge = st.currentAge || st.age || 0;
  const phases = [
    { name: 'INFANT', maxAge: 3 },
    { name: 'CHILD', maxAge: 12 },
    { name: 'ADOLESCENT', maxAge: 19 },
    { name: 'YOUNG_ADULT', maxAge: 39 },
    { name: 'MIDDLE_AGE', maxAge: 64 },
    { name: 'SENIOR', maxAge: 84 },
    { name: 'ANCIENT', maxAge: 120 }
  ];

  let currentPhase = 'INFANT';
  for (const phase of phases) {
    if (currentAge <= phase.maxAge) {
      currentPhase = phase.name;
      break;
    }
  }

  container.innerHTML = '';
  const bar = document.createElement('div');
  bar.className = `life-phase-display phase-${currentPhase.toLowerCase()}`;
  bar.setAttribute('aria-label', `Current life phase: ${currentPhase.replace('_', ' ')}`);
  bar.innerHTML = `
    <span class="phase-label">${currentPhase.replace('_', ' ')}</span>
    <div class="phase-progress" role="list" aria-label="Life phases">
      ${phases.map(p => `<div class="phase-segment ${p.name === currentPhase ? 'active' : ''}" data-phase="${p.name}" role="listitem" aria-label="${p.name === currentPhase ? 'Current phase: ' : ''}${p.name.replace('_', ' ')}"></div>`).join('')}
    </div>
    <span class="age-display" aria-label="Current age">Age ${currentAge}</span>
  `;
  container.appendChild(bar);
};

export const updateResourceDisplay = (st) => {
  const container = document.getElementById('resource-display');
  if (!container) return;

  const souls = st.souls || st.soul?.livesLived || 0;
  const faith = st.faith || 0;
  const xp = st.xp || 0;

  container.innerHTML = `
    <div class="resource-dots">
      <span class="resource-dot" data-tooltip="Souls: lives collected" role="status" aria-label="Souls: ${souls} collected">â˜° ${souls}</span>
      <span class="resource-dot" data-tooltip="Faith: spiritual resonance" role="status" aria-label="Faith: ${faith}">âœ§ ${faith}</span>
      <span class="resource-dot" data-tooltip="XP: experience earned" role="status" aria-label="Experience: ${xp}">â—† ${xp}</span>
    </div>
  `;
};

export const updateFaithDisplay = (st) => {
  const container = document.getElementById('faith-display');
  if (!container) return;

  const faith = st.faith || 0;
  const faithPercent = Math.min((faith / 100) * 100, 100);

  container.innerHTML = `
    <div class="faith-bar-container">
      <div class="faith-bar-fill" style="width: ${faithPercent}%"></div>
      <span class="faith-label">Faith: ${faith}</span>
    </div>
  `;
};

export const createChoiceButton = (choice, index) => {
  const button = document.createElement('button');
  button.className = `choice-button choice-${index + 1}`;
  button.dataset.choiceIndex = index;
  button.setAttribute('tabindex', '0');
  button.setAttribute('role', 'button');
  button.setAttribute('aria-label', `${String.fromCharCode(65 + index)}: ${choice.text || choice.description || 'Choose'}${choice.risk ? ', risk: ' + choice.risk : ''}`);

  button.innerHTML = `
    <span class="choice-label">${String.fromCharCode(65 + index)}</span>
    <span class="choice-text">${choice.text || choice.description || 'Choose'}</span>
    ${choice.risk ? `<span class="choice-risk">Risk: ${choice.risk}</span>` : ''}
  `;

  return button;
};

export const renderRiskDial = (canvasId, riskLevel) => {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 10;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#2a2a45';
  ctx.lineWidth = 8;
  ctx.stroke();

  const startAngle = Math.PI * 0.75;
  const endAngle = Math.PI * 2.25;
  const riskAngle = startAngle + ((endAngle - startAngle) * Math.min(Math.max(riskLevel, 0), 1));

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, startAngle, riskAngle);
  ctx.strokeStyle = riskLevel > 0.7 ? '#c0392b' : riskLevel > 0.4 ? '#e67e22' : '#27ae60';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.7, 0, 2 * Math.PI);
  ctx.fillStyle = '#141420';
  ctx.fill();

  ctx.font = 'bold 24px Cinzel';
  ctx.fillStyle = '#e8e6e3';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(Math.round(riskLevel * 100) + '%', centerX, centerY);
};

export const renderSpeedSlider = (containerId, currentSpeed, onChange) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'speed-slider-wrapper';

  wrapper.innerHTML = `
    <label class="speed-label">Speed: ${currentSpeed}x</label>
    <input type="range" class="speed-slider" min="0.5" max="3" step="0.5" value="${currentSpeed}" />
    <div class="speed-markers">
      <span>0.5x</span>
      <span>1x</span>
      <span>2x</span>
      <span>3x</span>
    </div>
  `;

  const slider = wrapper.querySelector('.speed-slider');
  slider.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    const label = wrapper.querySelector('.speed-label');
    label.textContent = `Speed: ${value}x`;
    if (onChange) onChange(value);
  });

  container.appendChild(wrapper);
};

const ERA_THEMES = {
  PREHISTORIC: { primary: '#8b6914', secondary: '#a67c00', bg: 'linear-gradient(180deg, #1a1209 0%, #2d1f0f 100%)' },
  ANCIENT: { primary: '#8b7355', secondary: '#6b5344', bg: 'linear-gradient(180deg, #1a1510 0%, #2a2018 100%)' },
  MEDIEVAL: { primary: '#4a4a6a', secondary: '#3a3a5a', bg: 'linear-gradient(180deg, #12121a 0%, #1e1e2e 100%)' },
  EARLY_MODERN: { primary: '#6b4423', secondary: '#5a3a1d', bg: 'linear-gradient(180deg, #1a1208 0%, #2a1a0f 100%)' },
  INDUSTRIAL: { primary: '#5a5a5a', secondary: '#4a4a4a', bg: 'linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%)' },
  MODERN: { primary: '#3a5f3a', secondary: '#2a4f2a', bg: 'linear-gradient(180deg, #0f1a0f 0%, #1a2a1a 100%)' },
  NEAR_FUTURE: { primary: '#1a3a5c', secondary: '#0a2a4c', bg: 'linear-gradient(180deg, #0a1520 0%, #152030 100%)' },
  FAR_FUTURE: { primary: '#2a1a4a', secondary: '#1a0a3a', bg: 'linear-gradient(180deg, #0f0a1a 0%, #1a0f2a 100%)' },
};

export const getEraTheme = (era) => ERA_THEMES[era] || ERA_THEMES.ANCIENT;

export const renderLoop = (canvasId, renderFunc) => {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  let animating = true;
  let lastTime = 0;

  const loop = (timestamp) => {
    if (!animating) return;

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    renderFunc(ctx, canvas.width, canvas.height, deltaTime);

    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);

  return () => { animating = false; };
};

export const drawJCurve = (ctx, width, height, progress, era) => {
  const theme = getEraTheme(era);

  const centerX = width / 2;
  const centerY = height / 2;
  const curveWidth = width * 0.8;
  const curveHeight = height * 0.6;

  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 3;
  ctx.beginPath();

  const points = [];
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const x = centerX - curveWidth / 2 + t * curveWidth;

    let y;
    if (t < 0.3) {
      y = centerY + curveHeight * 0.1 * Math.sin(t / 0.3 * Math.PI / 2);
    } else if (t < 0.7) {
      const localT = (t - 0.3) / 0.4;
      y = centerY + curveHeight * 0.1 + curveHeight * 0.7 * Math.pow(localT, 0.7);
    } else {
      const localT = (t - 0.7) / 0.3;
      y = centerY + curveHeight * 0.8 - curveHeight * 0.2 * Math.pow(localT, 2);
    }

    points.push({ x, y });
  }

  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const cp = points[i - 1];
    const c = points[i];
    const cpX = (cp.x + c.x) / 2;
    const cpY = (cp.y + c.y) / 2;
    ctx.quadraticCurveTo(cp.x, cp.y, cpX, cpY);
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.stroke();

  const progressPoint = points[Math.floor(progress * (points.length - 1))];
  if (progressPoint) {
    ctx.beginPath();
    ctx.arc(progressPoint.x, progressPoint.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = theme.secondary;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 10; i++) {
    const x = centerX - curveWidth / 2 + (i / 10) * curveWidth;
    ctx.beginPath();
    ctx.moveTo(x, centerY - curveHeight / 2);
    ctx.lineTo(x, centerY + curveHeight / 2);
    ctx.stroke();
  }
};

export const drawParticles = (ctx, width, height, particles, era) => {
  const theme = getEraTheme(era);

  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size || 3, 0, 2 * Math.PI);
    ctx.fillStyle = p.color || theme.primary;
    ctx.globalAlpha = p.alpha || 1;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
};

export const drawLifeDot = (ctx, x, y, life) => {
  const era = life.era || 'ANCIENT';
  const theme = getEraTheme(era);

  ctx.beginPath();
  ctx.arc(x, y, 6, 0, 2 * Math.PI);
  ctx.fillStyle = theme.primary;
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
};

export const drawCrisisSpike = (ctx, x, y, severity) => {
  const spikeHeight = 20 + severity * 40;
  const spikeWidth = 10 + severity * 10;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - spikeWidth / 2, y + spikeHeight);
  ctx.lineTo(x + spikeWidth / 2, y + spikeHeight);
  ctx.closePath();

  const gradient = ctx.createLinearGradient(x, y, x, y + spikeHeight);
  gradient.addColorStop(0, '#c0392b');
  gradient.addColorStop(1, 'rgba(192, 57, 43, 0)');
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 2;
  ctx.stroke();
};

export const drawDeathEffect = (ctx, x, y, progress) => {
  const radius = progress * 100;
  const alpha = 1 - progress;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = `rgba(192, 57, 43, ${alpha})`;
  ctx.lineWidth = 4 * (1 - progress) + 1;
  ctx.stroke();

  if (progress < 0.5) {
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.5, 0, 2 * Math.PI);
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
};

export const drawLimboParticles = (ctx, width, height, time) => {
  const particleCount = 30;

  for (let i = 0; i < particleCount; i++) {
    const seed = i * 137.5;
    const x = (Math.sin(seed + time * 0.001) * 0.5 + 0.5) * width;
    const y = (Math.cos(seed * 1.618 + time * 0.0007) * 0.5 + 0.5) * height;
    const size = 2 + Math.sin(seed + time * 0.002) * 2;
    const alpha = 0.3 + Math.sin(seed * 2 + time * 0.003) * 0.2;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(155, 89, 182, ${alpha})`;
    ctx.fill();
  }

  for (let i = 0; i < particleCount / 2; i++) {
    const seed = i * 223.7;
    const x = (Math.sin(seed * 0.7 + time * 0.0015) * 0.5 + 0.5) * width;
    const y = (Math.cos(seed * 1.3 + time * 0.001) * 0.5 + 0.5) * height;
    const size = 1 + Math.sin(seed + time * 0.002) * 1.5;
    const alpha = 0.2 + Math.sin(seed * 3 + time * 0.0025) * 0.15;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(212, 175, 55, ${alpha})`;
    ctx.fill();
  }
};

let _tutorialStep = 0;
let _tutorialDismissed = false;
const TUTORIAL_STEPS = [
  { text: 'Connection (Con) â ” your emotional resilience. Affects how you handle loss.', position: 'bottom' },
  { text: 'Vitality (Vit) â ” your physical resilience. Affects crisis survival.', position: 'bottom' },
  { text: 'Momentum (Mom) â ” your drive. Affects how fast you accumulate progress.', position: 'bottom' },
  { text: 'The J-curve shows your mortality risk. Click the risk dial to change how dangerous your life is.', position: 'top' },
  { text: 'When a crisis fires, you have seconds to choose. Your choice affects the outcome.', position: 'right' },
  { text: 'Fragments are memories that persist across lives. They influence future events.', position: 'right' },
  { text: 'Anchors form when a fragment recurs â ” they become core threads of your soul.', position: 'right' },
  { text: 'Press NEW LIFE to begin.', position: 'bottom' },
];

export const showTutorialStep = (step) => {
  _tutorialDismissed = false;
  let tip = document.getElementById('tutorial-tip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'tutorial-tip';
    tip.className = 'tutorial-tip';
    document.body.appendChild(tip);
  }

  const stepData = TUTORIAL_STEPS[step] || TUTORIAL_STEPS[0];
  _tutorialStep = step;

  tip.innerHTML = `
    <div class="tutorial-content">
      <p class="tutorial-text">${stepData.text}</p>
      <div class="tutorial-progress">${step + 1} / ${TUTORIAL_STEPS.length}</div>
      <div class="tutorial-buttons">
        ${step > 0 ? '<button class="btn-tutorial-prev" data-tutorial-prev>Previous</button>' : ''}
        ${step < TUTORIAL_STEPS.length - 1 ? '<button class="btn-tutorial-next" data-tutorial-next>Next</button>' : '<button class="btn-tutorial-done" data-tutorial-done>Done</button>'}
      </div>
    </div>
    <div class="tutorial-arrow"></div>
  `;

  tip.classList.remove('hidden');

  const arrow = tip.querySelector('.tutorial-arrow');
  if (stepData.position === 'bottom') {
    arrow.style.cssText = 'top: -10px; left: 50%; transform: translateX(-50%) rotate(45deg);';
  } else if (stepData.position === 'top') {
    arrow.style.cssText = 'bottom: -10px; left: 50%; transform: translateX(-50%) rotate(225deg);';
  } else if (stepData.position === 'right') {
    arrow.style.cssText = 'left: -10px; top: 50%; transform: translateY(-50%) rotate(135deg);';
  }

  tip.querySelector('[data-tutorial-prev]')?.addEventListener('click', prevTutorialStep);
  tip.querySelector('[data-tutorial-next]')?.addEventListener('click', nextTutorialStep);
  tip.querySelector('[data-tutorial-done]')?.addEventListener('click', closeTutorial);

  const dismissHandler = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      closeTutorial();
      document.removeEventListener('keydown', dismissHandler);
    }
  };
  document.addEventListener('keydown', dismissHandler);
};

export const nextTutorialStep = () => {
  if (_tutorialStep < TUTORIAL_STEPS.length - 1) {
    _tutorialStep++;
    showTutorialStep(_tutorialStep);
  } else {
    closeTutorial();
  }
};

export const prevTutorialStep = () => {
  if (_tutorialStep > 0) {
    _tutorialStep--;
    showTutorialStep(_tutorialStep);
  }
};

export const closeTutorial = () => {
  const tip = document.getElementById('tutorial-tip');
  if (tip) tip.classList.add('hidden');
  _tutorialStep = 0;
  _tutorialDismissed = true;
  try { localStorage.setItem('soulcycle_seen_tutorial', '1'); } catch {}
};

export const showContextualTip = (tipType) => {
  const tipId = `contextual-tip-${tipType}`;
  const existing = document.getElementById(tipId);
  if (existing) return;

  const tips = {
    crisis: 'Press A/B/C or click to choose. ESC auto-selects C (Watch).',
    whisper: 'Y/N to respond to your soul\'s fragments.',
    death: 'Your fragments are extracted and accumulate.',
    resources: 'Connection â ” emotional resilience. Vitality â ” physical resilience. Momentum â ” drive.',
  };

  const text = tips[tipType];
  if (!text) return;

  const tip = document.createElement('div');
  tip.id = tipId;
  tip.className = 'tutorial-tip contextual-tip';
  tip.innerHTML = `<div class="tutorial-content"><p class="tutorial-text">${text}</p></div>`;
  document.body.appendChild(tip);
  requestAnimationFrame(() => tip.classList.add('visible'));

  setTimeout(() => {
    tip.classList.remove('visible');
    setTimeout(() => tip.remove(), 300);
  }, 5000);
};

export const hasSeenTutorial = () => {
  try { return localStorage.getItem('soulcycle_seen_tutorial') === '1'; } catch { return false; }
};

export const showEraTip = (era) => {
  const tips = {
    PREHISTORIC: 'Survival is uncertain. Every choice matters.',
    ANCIENT: 'The gods watch. Empires rise and fall.',
    MEDIEVAL: 'Plague and faith shape the world.',
    EARLY_MODERN: 'Discovery and enlightenment emerge.',
    INDUSTRIAL: 'Machines transform society.',
    MODERN: 'Technology connects and isolates.',
    NEAR_FUTURE: 'Climate and algorithms define existence.',
    FAR_FUTURE: 'Death becomes optional. Meaning persists.'
  };

  const tipText = tips[era] || 'Choose wisely.';
  showDivineToast(tipText, 4000);
};

export const showHowToPlayCarousel = () => {
  const container = document.getElementById('how-to-play-content');
  if (!container) return;

  const slides = [
    { title: 'Welcome to Soul Cycle', content: 'You guide a soul through multiple lifetimes, collecting fragments of memory and meaning.' },
    { title: 'The J-Curve', content: 'Your mortality risk follows a J-curve - low in youth, rising with age. Events can strike at any time.' },
    { title: 'Choices Matter', content: 'Each event presents choices with risks and rewards. Your decisions shape the soul\'s journey.' },
    { title: 'Fragments & Anchors', content: 'Collect fragments from lives lived. Recurring themes become anchors that persist across incarnations.' },
    { title: 'Eras & Progression', content: 'Unlock new eras as your soul collects more fragments, from prehistoric times to the far future.' }
  ];

  let currentSlide = 0;

  container.innerHTML = `
    <div class="carousel-container">
      <div class="carousel-track">
        ${slides.map((slide, i) => `<div class="carousel-slide ${i === 0 ? 'active' : ''}" data-slide="${i}">
          <h3>${slide.title}</h3>
          <p>${slide.content}</p>
        </div>`).join('')}
      </div>
      <div class="carousel-controls">
        <button class="btn-carousel-prev" data-carousel-prev disabled>Previous</button>
        <div class="carousel-dots">${slides.map((_, i) => `<span class="carousel-dot ${i === 0 ? 'active' : ''}" data-dot="${i}"></span>`).join('')}</div>
        <button class="btn-carousel-next" data-carousel-next>Next</button>
      </div>
      <button class="btn-close-carousel" data-close-carousel>Start Game</button>
    </div>
  `;

  const updateSlide = (newSlide) => {
    currentSlide = Math.max(0, Math.min(newSlide, slides.length - 1));

    const slideEls = container.querySelectorAll('.carousel-slide');
    const dotEls = container.querySelectorAll('.carousel-dot');

    slideEls.forEach((el, i) => el.classList.toggle('active', i === currentSlide));
    dotEls.forEach((el, i) => el.classList.toggle('active', i === currentSlide));

    container.querySelector('[data-carousel-prev]').disabled = currentSlide === 0;
    container.querySelector('[data-carousel-next]').disabled = currentSlide === slides.length - 1;
  };

  container.querySelector('[data-carousel-prev]').addEventListener('click', () => updateSlide(currentSlide - 1));
  container.querySelector('[data-carousel-next]').addEventListener('click', () => updateSlide(currentSlide + 1));

  container.querySelectorAll('.carousel-dot').forEach((dot, i) => {
    dot.addEventListener('click', () => updateSlide(i));
  });

  container.querySelector('[data-close-carousel]').addEventListener('click', () => {
    hideOverlay('how-to-play-overlay');
  });

  showOverlay('how-to-play-overlay');
};

export const showArrow = (targetId, text) => {
  const existing = document.getElementById('tutorial-arrow');
  if (existing) existing.remove();

  const target = document.getElementById(targetId);
  if (!target) return;

  const rect = target.getBoundingClientRect();
  const arrow = document.createElement('div');
  arrow.id = 'tutorial-arrow';
  arrow.className = 'tutorial-arrow-indicator';
  arrow.innerHTML = `<span class="arrow-text">${text}</span><div class="arrow-pointer"></div>`;

  arrow.style.cssText = `
    position: fixed;
    left: ${rect.left + rect.width / 2}px;
    top: ${rect.top - 60}px;
    transform: translateX(-50%);
    z-index: 1000;
  `;

  document.body.appendChild(arrow);
};

export const hideArrow = () => {
  const arrow = document.getElementById('tutorial-arrow');
  if (arrow) arrow.remove();
};

export const showEventPanel = (event) => {
  const container = document.getElementById('event-panel');
  if (!container) return;

  container.innerHTML = '';

  const card = createEventCard(event);
  container.appendChild(card);

  if (event.choices && event.choices.length > 0) {
    const choicesContainer = document.createElement('div');
    choicesContainer.className = 'event-choices';

    event.choices.forEach((choice, i) => {
      const btn = createChoiceButton(choice, i);
      btn.addEventListener('click', () => {
        if (choice.action) choice.action(choice);
      });
      btn.addEventListener('touchstart', () => btn.classList.add('touch-active'), { passive: true });
      btn.addEventListener('touchend', () => btn.classList.remove('touch-active'), { passive: true });
      btn.addEventListener('touchcancel', () => btn.classList.remove('touch-active'), { passive: true });
      choicesContainer.appendChild(btn);
    });

    container.appendChild(choicesContainer);
  }

  container.classList.remove('hidden');
};

export const hideEventPanel = () => {
  const container = document.getElementById('event-panel');
  if (container) container.classList.add('hidden');
};

export const updateEraDisplay = (era) => {
  const container = document.getElementById('era-display');
  if (!container) return;

  const theme = getEraTheme(era);

  container.style.cssText = `
    background: ${theme.bg};
    border-color: ${theme.primary};
  `;

  container.innerHTML = `
    <span class="era-badge" style="background: ${theme.primary};">${era.replace('_', ' ')}</span>
  `;
};

export const showUpgradePanel = (upgrades) => {
  const container = document.getElementById('upgrade-content');
  if (!container) return;

  container.innerHTML = '';

  const panel = document.createElement('div');
  panel.className = 'upgrade-panel';

  const title = document.createElement('h2');
  title.textContent = 'Soul Upgrades';
  panel.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'upgrade-grid';

  for (const upgrade of upgrades) {
    const card = document.createElement('div');
    card.className = `upgrade-card ${upgrade.unlocked ? 'unlocked' : 'locked'}`;
    card.innerHTML = `
      <h4>${upgrade.name}</h4>
      <p>${upgrade.description}</p>
      ${upgrade.unlocked ? '<span class="upgrade-unlocked">Unlocked</span>' : `<button class="btn-unlock" data-upgrade="${upgrade.id}">Unlock (${upgrade.cost} XP)</button>`}
    `;
    grid.appendChild(card);
  }

  panel.appendChild(grid);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn-close-upgrade';
  closeBtn.textContent = 'Continue';
  closeBtn.addEventListener('click', () => hideOverlay('overlay-upgrade'));
  panel.appendChild(closeBtn);

  container.appendChild(panel);
  showOverlay('overlay-upgrade');
};

export const updateSoulBrowserFragment = (fragmentId, changes) => {
  const fragmentEl = document.querySelector(`[data-fragment-id="${fragmentId}"]`);
  if (!fragmentEl) return;

  if (changes.strength !== undefined) {
    const bar = fragmentEl.querySelector('.fragment-strength-bar');
    if (bar) bar.style.width = `${changes.strength * 100}%`;
  }
};

export const animateFragmentMerge = (fragmentEl) => {
  if (!fragmentEl) return;

  fragmentEl.classList.add('merging');
  setTimeout(() => fragmentEl.classList.remove('merging'), 600);
};

export const createFragmentTooltip = (fragment) => {
  const tooltip = document.createElement('div');
  tooltip.className = 'fragment-tooltip';
  tooltip.innerHTML = `
    <div class="tooltip-type">${fragment.type}</div>
    <div class="tooltip-value">${fragment.value}</div>
    <div class="tooltip-strength">Strength: ${Math.round(fragment.strength * 100)}%</div>
    <div class="tooltip-desc">Fragments are memories that persist across lives. They influence future events.</div>
    ${fragment.isAnchor ? '<div class="tooltip-anchor">ANCHOR â ” a core thread of your soul</div>' : ''}
    <div class="tooltip-origin">From: ${fragment.origin?.lifeId || 'Unknown life'}</div>
  `;
  return tooltip;
};

export const showTitleScreen = () => {
  const container = document.getElementById('title-screen');
  if (!container) return;

  container.innerHTML = `
    <div class="title-container">
      <h1 class="game-title">Soul Cycle</h1>
      <p class="game-tagline">Lives. Deaths. What remains.</p>
      <div class="title-buttons">
        <button class="btn-new-game" data-action="new-game">New Soul</button>
        <button class="btn-continue-game" data-action="continue-game">Continue</button>
        <button class="btn-museum" data-action="open-museum">Museum</button>
        <button class="btn-how-to-play" data-action="how-to-play">How to Play</button>
      </div>
    </div>
  `;

  container.classList.add('visible');
};

export const hideTitleScreen = () => {
  const container = document.getElementById('title-screen');
  if (container) { container.classList.remove('visible'); container.classList.add('hidden'); }
};

export const showPauseOverlay = () => {
  showOverlay('overlay-pause');
};

export const hidePauseOverlay = () => {
  hideOverlay('overlay-pause');
};

export const showVictoryOverlay = () => {
  showOverlay('overlay-victory');
};

export const hideVictoryOverlay = () => {
  hideOverlay('overlay-victory');
};

export const showEraTransition = (fromEra, toEra, callback) => {
  const container = document.getElementById('era-transition-content');
  if (!container) return;

  container.innerHTML = `
    <div class="era-transition">
      <div class="era-from">${fromEra?.replace('_', ' ') || 'Unknown'}</div>
      <div class="era-arrow">â†’</div>
      <div class="era-to">${toEra?.replace('_', ' ') || 'Unknown'}</div>
    </div>
    <p class="transition-message">A new era awaits...</p>
  `;

  showOverlay('overlay-era');

  setTimeout(() => {
    hideOverlay('overlay-era');
    if (callback) callback();
  }, 3000);
};

export const createMiniEventSummary = (events) => {
  const container = document.createElement('div');
  container.className = 'mini-event-summary';

  const summary = document.createElement('div');
  summary.className = 'event-timeline';

  events.slice(-5).forEach((event, i) => {
    const dot = document.createElement('div');
    dot.className = `timeline-dot event-${event.category || 'default'}`;
    dot.title = event.title || 'Event';
    summary.appendChild(dot);
  });

  container.appendChild(summary);
  return container;
};

export const updateEventHistory = (events) => {
  const container = document.getElementById('event-history');
  if (!container) return;

  container.innerHTML = '';

  const timeline = document.createElement('div');
  timeline.className = 'event-history-timeline';

  for (const event of events.slice(-10)) {
    const item = document.createElement('div');
    item.className = `history-item event-${event.category || 'default'}`;
    item.innerHTML = `
      <span class="history-age">${event.age || '?'}</span>
      <span class="history-title">${event.title || 'Unknown'}</span>
    `;
    timeline.appendChild(item);
  }

  container.appendChild(timeline);
};

export const showLoadingScreen = (message = 'Loading...') => {
  const existing = document.getElementById('loading-screen');
  if (existing) existing.remove();

  const loader = document.createElement('div');
  loader.id = 'loading-screen';
  loader.className = 'loading-overlay';
  loader.innerHTML = `
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <p class="loading-message">${message}</p>
    </div>
  `;

  document.body.appendChild(loader);
};

export const hideLoadingScreen = () => {
  const loader = document.getElementById('loading-screen');
  if (loader) loader.remove();
};

export const showConfirmDialog = (title, message, onConfirm, onCancel) => {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay confirm-dialog';

  const content = document.createElement('div');
  content.className = 'confirm-content';
  content.innerHTML = `
    <h3>${title}</h3>
    <p>${message}</p>
    <div class="confirm-buttons">
      <button class="btn-confirm-yes" data-confirm-yes>Yes</button>
      <button class="btn-confirm-no" data-confirm-no>No</button>
    </div>
  `;

  overlay.appendChild(content);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => overlay.classList.add('visible'));

  overlay.querySelector('[data-confirm-yes]').addEventListener('click', () => {
    overlay.classList.remove('visible');
    setTimeout(() => overlay.remove(), 300);
    if (onConfirm) onConfirm();
  });

  overlay.querySelector('[data-confirm-no]').addEventListener('click', () => {
    overlay.classList.remove('visible');
    setTimeout(() => overlay.remove(), 300);
    if (onCancel) onCancel();
  });
};

export const updateTooltipPosition = (tooltip, x, y) => {
  tooltip.style.cssText = `
    position: fixed;
    left: ${x + 15}px;
    top: ${y + 15}px;
    z-index: 1001;
  `;
};

export const showElementById = (id) => {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
};

export const hideElementById = (id) => {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
};

export const toggleElementVisibility = (id) => {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('hidden');
};

export const addClassToElement = (id, className) => {
  const el = document.getElementById(id);
  if (el) el.classList.add(className);
};

export const removeClassFromElement = (id, className) => {
  const el = document.getElementById(id);
  if (el) el.classList.remove(className);
};

export const setElementText = (id, text) => {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
};

export const setElementHTML = (id, html) => {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
};

export const appendToElement = (id, child) => {
  const el = document.getElementById(id);
  if (el && child) el.appendChild(child);
};

export const clearElement = (id) => {
  const el = document.getElementById(id);
  if (el) el.innerHTML = '';
};

export const removeElement = (id) => {
  const el = document.getElementById(id);
  if (el) el.remove();
};

export const animateElement = (id, animationClass, duration = 600) => {
  const el = document.getElementById(id);
  if (!el) return;

  el.classList.add(animationClass);
  setTimeout(() => el.classList.remove(animationClass), duration);
};

export const pulseElement = (id) => {
  animateElement(id, 'pulse-animation');
};

export const shakeElement = (id) => {
  animateElement(id, 'shake-animation');
};

export const fadeInElement = (id, duration = 300) => {
  const el = document.getElementById(id);
  if (!el) return;

  el.style.opacity = '0';
  el.style.transition = `opacity ${duration}ms ease`;
  requestAnimationFrame(() => {
    el.style.opacity = '1';
  });
};

export const fadeOutElement = (id, duration = 300) => {
  const el = document.getElementById(id);
  if (!el) return;

  el.style.transition = `opacity ${duration}ms ease`;
  el.style.opacity = '0';
  setTimeout(() => el.classList.add('hidden'), duration);
};

export const showToast = (message, type = 'info', duration = 3000) => {
  const existing = document.getElementById('generic-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'generic-toast';
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('visible'));

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

export const updateProgressBar = (id, percent, label) => {
  const container = document.getElementById(id);
  if (!container) return;

  container.innerHTML = `
    <div class="progress-bar-fill" style="width: ${Math.min(Math.max(percent, 0), 100)}%"></div>
    ${label ? `<span class="progress-label">${label}</span>` : ''}
  `;
};

export const renderHealthBar = (current, max) => {
  const percent = (current / max) * 100;
  const color = percent > 60 ? '#27ae60' : percent > 30 ? '#e67e22' : '#c0392b';

  return `<div class="health-bar-container">
    <div class="health-bar-fill" style="width: ${percent}%; background: ${color};"></div>
    <span class="health-text">${current}/${max}</span>
  </div>`;
};

export const createClickableEffect = (element, callback) => {
  if (!element) return;

  element.style.cursor = 'pointer';
  element.addEventListener('click', () => {
    if (callback) callback();
  });
};

export const bindKeyboardShortcut = (key, callback) => {
  document.addEventListener('keydown', (e) => {
    if (e.key === key && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      callback();
    }
  });
};

export const showHelpModal = () => {
  const modal = document.createElement('div');
  modal.id = 'help-modal';
  modal.className = 'modal-overlay';

  const content = document.createElement('div');
  content.className = 'modal-content help-content';
  content.innerHTML = `
    <h2>Keyboard Shortcuts</h2>
    <div class="shortcut-list">
      <div class="shortcut-item"><kbd>Space</kbd><span>Pause/Resume</span></div>
      <div class="shortcut-item"><kbd>1-4</kbd><span>Select Choice</span></div>
      <div class="shortcut-item"><kbd>Tab</kbd><span>Toggle Speed</span></div>
      <div class="shortcut-item"><kbd>Esc</kbd><span>Open Settings</span></div>
      <div class="shortcut-item"><kbd>H</kbd><span>Toggle Help</span></div>
      <div class="shortcut-item"><kbd>S</kbd><span>Save Game</span></div>
    </div>
    <button class="btn-close-help" data-close-help>Close</button>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  requestAnimationFrame(() => modal.classList.add('visible'));

  modal.querySelector('[data-close-help]').addEventListener('click', () => {
    modal.classList.remove('visible');
    setTimeout(() => modal.remove(), 300);
  });
};

export const openMuseum = (soulState, allLives = []) => {
  const existing = document.getElementById('museum-modal');
  if (existing) existing.remove();
  createMuseumModal(soulState, allLives);
};

export const createMuseumModal = (soulState, allLives = []) => {
  const modal = document.createElement('div');
  modal.id = 'museum-modal';
  modal.className = 'modal-overlay museum-overlay';

  const content = document.createElement('div');
  content.className = 'modal-content museum-content';

  const lives = soulState._lifeHistory || allLives;
  const fragmentTypeOrder = ['tone', 'fear', 'love', 'warning', 'location', 'name', 'object', 'word'];
  const chainTypes = ['GRIEF', 'LOVE', 'DREAD', 'WONDER', 'RAGE', 'GRACE'];
  const allEvents = collectAllEvents(lives);
  const eraStats = computeEraStats(lives);
  const achievements = computeAchievements(soulState);
  const chainRecaps = collectChainRecaps(lives);

  content.innerHTML = `
    <div class="museum-header">
      <h2>SOUL MUSEUM</h2>
      <div class="museum-stats">
        <span>${soulState.livesLived || 0} Lives</span>
        <span>${soulState.fragments?.length || 0} Fragments</span>
        <span>${soulState.anchors?.length || 0} Anchors</span>
        ${soulState.soulComplete ? '<span class="museum-complete-badge">COMPLETE SOUL</span>' : ''}
      </div>
      <button class="btn-close-museum" data-close-museum>Close</button>
    </div>
    <div class="museum-tabs">
      <button class="museum-tab active" data-tab="gallery">Life Gallery</button>
      <button class="museum-tab" data-tab="events">Event Archive</button>
      <button class="museum-tab" data-tab="fragments">Fragments</button>
      <button class="museum-tab" data-tab="chains">Chain Exhibition</button>
      <button class="museum-tab" data-tab="achievements">Achievements</button>
      <button class="museum-tab" data-tab="stats">Era Statistics</button>
      <button class="museum-tab" data-tab="statues">Memorials</button>
      ${soulState.soulComplete ? '<button class="museum-tab" data-tab="complete">Complete Soul</button>' : ''}
    </div>
    <div class="museum-body">
      <div class="museum-panel active" id="museum-panel-gallery">
        ${renderLifeGallery(lives, chainTypes)}
      </div>
      <div class="museum-panel" id="museum-panel-events">
        ${renderEventArchive(allEvents)}
      </div>
      <div class="museum-panel" id="museum-panel-fragments">
        ${renderFragmentCollection(soulState, fragmentTypeOrder, lives)}
      </div>
      <div class="museum-panel" id="museum-panel-chains">
        ${renderChainExhibition(chainRecaps)}
      </div>
      <div class="museum-panel" id="museum-panel-achievements">
        ${renderAchievementHall(achievements)}
      </div>
      <div class="museum-panel" id="museum-panel-stats">
        ${renderEraStatistics(eraStats)}
      </div>
      <div class="museum-panel" id="museum-panel-statues">
        ${renderEraStatues(lives, chainTypes)}
      </div>
      <div class="museum-panel" id="museum-panel-complete">
        ${renderCompleteSoulPanel(soulState, lives)}
      </div>
    </div>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  requestAnimationFrame(() => modal.classList.add('visible'));

  const closeBtn = modal.querySelector('[data-close-museum]');
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('visible');
    setTimeout(() => modal.remove(), 300);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('visible');
      setTimeout(() => modal.remove(), 300);
    }
  });

  modal.querySelectorAll('.museum-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      modal.querySelectorAll('.museum-tab').forEach(t => t.classList.remove('active'));
      modal.querySelectorAll('.museum-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = modal.querySelector(`#museum-panel-${tab.dataset.tab}`);
      if (panel) panel.classList.add('active');
    });
  });

  modal.querySelectorAll('.life-card').forEach(card => {
    card.addEventListener('click', () => {
      const lifeId = card.dataset.lifeId;
      const life = lives.find(l => l.id === lifeId);
      if (life) openLifeDetailView(life, lives, chainTypes);
    });
  });

  const searchInput = modal.querySelector('#event-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      modal.querySelectorAll('.archive-event-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  const eraFilter = modal.querySelector('#event-filter-era');
  if (eraFilter) {
    eraFilter.addEventListener('change', (e) => applyEventFilters(modal, eraFilter.value, modal.querySelector('#event-filter-chain')?.value || '', modal.querySelector('#event-filter-outcome')?.value || ''));
  }

  const chainFilter = modal.querySelector('#event-filter-chain');
  if (chainFilter) {
    chainFilter.addEventListener('change', (e) => applyEventFilters(modal, modal.querySelector('#event-filter-era')?.value || '', e.target.value, modal.querySelector('#event-filter-outcome')?.value || ''));
  }

  const outcomeFilter = modal.querySelector('#event-filter-outcome');
  if (outcomeFilter) {
    outcomeFilter.addEventListener('change', (e) => applyEventFilters(modal, modal.querySelector('#event-filter-era')?.value || '', modal.querySelector('#event-filter-chain')?.value || '', e.target.value));
  }

  modal.querySelectorAll('.fragment-type-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      modal.querySelectorAll('.fragment-type-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const ftype = tab.dataset.ftype;
      modal.querySelectorAll('.fragment-card').forEach(card => {
        card.style.display = !ftype || card.dataset.type === ftype ? '' : 'none';
      });
    });
  });
};

function applyEventFilters(modal, eraVal, chainVal, outcomeVal) {
  modal.querySelectorAll('.archive-event-item').forEach(item => {
    const matchEra = !eraVal || item.dataset.era === eraVal;
    const tags = (item.dataset.tags || '').toLowerCase();
    const matchChain = !chainVal || tags.includes(chainVal.toLowerCase());
    const matchOutcome = !outcomeVal || item.dataset.outcome === outcomeVal;
    item.style.display = (matchEra && matchChain && matchOutcome) ? '' : 'none';
  });
}

function collectAllEvents(lives) {
  const events = [];
  for (const life of lives) {
    if (life.events) {
      for (const event of life.events) {
        events.push({ ...event, _lifeId: life.id, _lifeName: life.name, _lifeEra: life.era });
      }
    }
  }
  return events;
}

function collectChainRecaps(lives) {
  const recaps = [];
  for (const life of lives) {
    if (life.chainRecap) {
      recaps.push({ ...life.chainRecap, lifeId: life.id, lifeName: life.name, era: life.era });
    }
  }
  return recaps;
}

function computeEraStats(lives) {
  const eraCounts = {};
  const eraAges = {};
  for (const life of lives) {
    const era = life.era || 'UNKNOWN';
    eraCounts[era] = (eraCounts[era] || 0) + 1;
    eraAges[era] = eraAges[era] || [];
    eraAges[era].push(life.age || 0);
  }
  const eraAvg = {};
  for (const [era, ages] of Object.entries(eraAges)) {
    eraAvg[era] = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;
  }
  return { eraCounts, eraAvg, total: lives.length };
}

function computeAchievements(soulState) {
  const meta = soulState.metaStats || {};
  const earned = [];
  const locked = [];

  const allAchievements = [
    { id: 'first_death', label: 'First Death', icon: 'â˜ ', condition: (m) => (m.totalDeaths || 0) >= 1 },
    { id: 'violent_end', label: 'Violent End', icon: 'âš”', condition: (m) => (m.violentDeaths || 0) >= 1 },
    { id: 'peaceful_passage', label: 'Peaceful Passage', icon: 'âœ§', condition: (m) => (m.peacefulDeaths || 0) >= 1 },
    { id: 'love_lost', label: 'Love Lost', icon: 'â™¥', condition: (m) => (m.lovesLost || 0) >= 1 },
    { id: 'life_given', label: 'Life Given', icon: 'âœ¿', condition: (m) => (m.childrenBorn || 0) >= 1 },
    { id: 'first_anchor', label: 'First Anchor', icon: 'âš“', condition: (s) => (s.anchors?.length || 0) >= 1 },
    { id: 'collector', label: 'Fragment Collector', icon: 'â—†', condition: (s) => (s.fragments?.length || 0) >= 10 },
    { id: 'veteran', label: 'Soul Veteran', icon: 'Î¨', condition: (s) => (s.livesLived || 0) >= 5 },
    { id: 'ancient_soul', label: 'Ancient Soul', icon: 'âˆž', condition: (s) => (s.livesLived || 0) >= 20 },
    { id: 'multi_era', label: 'Time Traveler', icon: 'â˜†', condition: (s) => (s.unlockedEras?.length || 0) >= 4 },
    { id: 'all_eras', label: 'All Eras', icon: 'â˜…â˜…â˜…', condition: (s) => (s.unlockedEras?.length || 0) >= 7 },
    { id: 'anchor_master', label: 'Anchor Master', icon: 'âš“', condition: (s) => (s.anchors?.length || 0) >= 3 },
    { id: 'fragment_hoarder', label: 'Fragment Hoarder', icon: 'â—†', condition: (s) => (s.fragments?.length || 0) >= 50 },
  ];

  for (const ach of allAchievements) {
    if (ach.condition(soulState)) {
      earned.push(ach);
    } else {
      locked.push(ach);
    }
  }
  return { earned, locked };
}

function renderLifeGallery(lives, chainTypes) {
  if (!lives || lives.length === 0) {
    return '<div class="museum-empty">No lives recorded yet.</div>';
  }
  const chainColor = (type) => {
    const map = { GRIEF: '#ff4466', LOVE: '#ff66aa', DREAD: '#9944ff', WONDER: '#44aaff', RAGE: '#ff6600', GRACE: '#aaaaaa' };
    return map[type] || '#666666';
  };
  const eraLabel = (era) => era?.replace('_', ' ') || 'Unknown';

  return `
    <div class="life-gallery-grid">
      ${lives.map((life, idx) => `
        <div class="life-card" data-life-id="${life.id || idx}">
          <div class="life-card-header">
            <span class="life-card-name">${life.name || 'Unknown'}</span>
            <span class="life-card-num">#${idx + 1}</span>
          </div>
          <div class="life-card-meta">
            <span class="life-card-era">${eraLabel(life.era)}</span>
            <span class="life-card-age">${life.age || 0} yrs</span>
          </div>
          ${life.dominantChain ? `<div class="life-card-chain" style="border-left: 3px solid ${chainColor(life.dominantChain)}">${life.dominantChain}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function renderEventArchive(events) {
  if (!events || events.length === 0) {
    return '<div class="museum-empty">No events recorded yet.</div>';
  }
  return `
    <div class="event-archive-controls">
      <input type="text" class="event-search" placeholder="Search events..." id="event-search-input" />
      <select id="event-filter-era" class="event-filter-select">
        <option value="">All Eras</option>
        <option value="ANCIENT">Ancient</option>
        <option value="MEDIEVAL">Medieval</option>
        <option value="EARLY_MODERN">Early Modern</option>
        <option value="INDUSTRIAL">Industrial</option>
        <option value="MODERN">Modern</option>
        <option value="NEAR_FUTURE">Near Future</option>
        <option value="FAR_FUTURE">Far Future</option>
      </select>
      <select id="event-filter-chain" class="event-filter-select">
        <option value="">All Chains</option>
        <option value="GRIEF">Grief</option>
        <option value="LOVE">Love</option>
        <option value="DREAD">Dread</option>
        <option value="WONDER">Wonder</option>
        <option value="RAGE">Rage</option>
        <option value="GRACE">Grace</option>
      </select>
      <select id="event-filter-outcome" class="event-filter-select">
        <option value="">All Outcomes</option>
        <option value="survived">Survived</option>
        <option value="died">Died</option>
      </select>
    </div>
    <div class="event-archive-list" id="event-archive-list">
      ${renderEventListItems(events)}
    </div>
  `;
}

function renderEventListItems(events) {
  return events.map((ev, idx) => `
    <div class="archive-event-item" data-era="${ev._lifeEra || ''}" data-tags="${(ev.cascadeTags || []).join(',')}" data-outcome="${ev.isDeathEvent ? 'died' : 'survived'}">
      <div class="archive-event-title">${ev.title || 'Unknown Event'}</div>
      <div class="archive-event-meta">
        <span class="archive-event-era">${(ev._lifeEra || '').replace('_', ' ')}</span>
        <span class="archive-event-life">${ev._lifeName || 'Unknown Life'}</span>
        <span class="archive-event-age">Age ${ev.age || '?'}</span>
      </div>
      ${ev.cascadeTags && ev.cascadeTags.length > 0 ? `<div class="archive-event-tags">${ev.cascadeTags.map(t => `<span class="event-tag">${t}</span>`).join('')}</div>` : ''}
    </div>
  `).join('');
}

function renderFragmentCollection(soulState, typeOrder, lives) {
  const fragments = soulState.fragments || [];
  if (fragments.length === 0) {
    return '<div class="museum-empty">No fragments collected yet.</div>';
  }
  const lifeMap = {};
  for (const life of lives) {
    lifeMap[life.id] = life.name;
  }

  return `
    <div class="fragment-type-tabs">
      ${typeOrder.map(type => `<button class="fragment-type-tab" data-ftype="${type}">${type}</button>`).join('')}
    </div>
    <div class="fragment-grid" id="fragment-grid">
      ${fragments.map((frag, idx) => `
        <div class="fragment-card" data-type="${frag.type}">
          <div class="fragment-type-badge">${frag.type}</div>
          <div class="fragment-value">"${frag.value}"</div>
          <div class="fragment-strength">Strength: ${Math.round(frag.strength * 100)}%</div>
          <div class="fragment-origin">From: ${lifeMap[frag.origin?.lifeId] || frag.origin?.lifeId || 'Unknown Life'}</div>
          ${frag.isAnchor ? '<div class="fragment-anchor-badge">â˜… ANCHOR</div>' : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function renderChainExhibition(chainRecaps) {
  if (!chainRecaps || chainRecaps.length === 0) {
    return '<div class="museum-empty">No chain recaps recorded yet.</div>';
  }
  const chainColor = (type) => {
    const map = { GRIEF: '#ff4466', LOVE: '#ff66aa', DREAD: '#9944ff', WONDER: '#44aaff', RAGE: '#ff6600', GRACE: '#aaaaaa' };
    return map[type] || '#666666';
  };

  return `
    <div class="chain-exhibition">
      ${chainRecaps.map((recap, idx) => `
        <div class="chain-recap-card">
          <div class="chain-recap-header" style="color:${chainColor(recap.type)}">
            ${recap.type} CHAIN â ” ${recap.label || ''}
          </div>
          <div class="chain-recap-life">${recap.lifeName || 'Unknown Life'} Â· ${(recap.era || '').replace('_', ' ')}</div>
          <div class="chain-recap-events">
            ${(recap.events || []).map((e, i) => `
              <div class="chain-recap-event" style="border-left: 2px solid ${chainColor(recap.type)}">
                <span class="chain-recap-event-title">${e.title || 'Event'}</span>
                <span class="chain-recap-event-age">Age ${e.age || '?'}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderAchievementHall(achievements) {
  const { earned, locked } = achievements;

  return `
    <div class="achievement-hall">
      <div class="achievement-section">
        <h4>Earned</h4>
        <div class="achievement-list">
          ${earned.length > 0 ? earned.map(a => `
            <div class="achievement-item earned">
              <span class="achievement-icon">${a.icon}</span>
              <span class="achievement-label">${a.label}</span>
            </div>
          `).join('') : '<div class="museum-empty">None earned yet.</div>'}
        </div>
      </div>
      <div class="achievement-section">
        <h4>Locked</h4>
        <div class="achievement-list">
          ${locked.map(a => `
            <div class="achievement-item locked">
              <span class="achievement-icon silhouette">${a.icon}</span>
              <span class="achievement-label silhouette">${a.label}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderEraStatistics(eraStats) {
  const { eraCounts, eraAvg, total } = eraStats;
  const eraLabels = { ANCIENT: 'Ancient', MEDIEVAL: 'Medieval', EARLY_MODERN: 'Early Modern', INDUSTRIAL: 'Industrial', MODERN: 'Modern', NEAR_FUTURE: 'Near Future', FAR_FUTURE: 'Far Future' };
  const eraColors = { ANCIENT: '#8b7355', MEDIEVAL: '#4a4a6a', EARLY_MODERN: '#6b4423', INDUSTRIAL: '#5a5a5a', MODERN: '#3a5f3a', NEAR_FUTURE: '#1a3a5c', FAR_FUTURE: '#2a1a4a' };

  return `
    <div class="era-stats-container">
      <div class="era-stats-summary">
        <span>Total Lives: ${total}</span>
      </div>
      <div class="era-pie-container">
        <div class="era-pie-chart" id="era-pie-chart">
          ${Object.entries(eraCounts).map(([era, count]) => `
            <div class="era-bar-row">
              <span class="era-bar-label" style="color:${eraColors[era] || '#666'}">${eraLabels[era] || era}</span>
              <div class="era-bar-track">
                <div class="era-bar-fill" style="width:${total > 0 ? (count / total * 100) : 0}%; background:${eraColors[era] || '#666'}"></div>
              </div>
              <span class="era-bar-count">${count} (${total > 0 ? Math.round(count / total * 100) : 0}%)</span>
              <span class="era-avg-age">Avg: ${eraAvg[era] || 0} yrs</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderCompleteSoulPanel(soulState, lives) {
  const isEnlightenment = soulState.enlightenmentAchieved;
  const journeyText = isEnlightenment
    ? 'You achieved enlightenment â ” 100+ lives lived without grasping to any anchor. The self was a mask you wore through every era. Now the mask is off.'
    : 'You have woven all six fragment types across seven eras, survived 50 crises, and formed five anchors. The thread is complete. Every life was a stitch in a pattern you are only now beginning to see.';

  return `
    <div class="complete-soul-panel">
      <div class="complete-soul-header">
        <div class="complete-soul-icon">${isEnlightenment ? 'â˜¯' : 'â—ˆ'}</div>
        <div class="complete-soul-title">${isEnlightenment ? 'ENLIGHTENMENT' : 'SOUL COMPLETE'}</div>
        <div class="complete-soul-subtitle">${soulState.livesLived} lives lived across the ages</div>
      </div>
      <div class="complete-soul-journey">
        <p>${journeyText}</p>
      </div>
      <div class="complete-soul-metrics">
        <div class="complete-metric">
          <span class="metric-value">${soulState.fragments?.length || 0}</span>
          <span class="metric-label">Fragments Collected</span>
        </div>
        <div class="complete-metric">
          <span class="metric-value">${soulState.erasVisited?.length || 0}/7</span>
          <span class="metric-label">Eras Explored</span>
        </div>
        <div class="complete-metric">
          <span class="metric-value">${soulState.metaStats?.crisesSurvived || 0}</span>
          <span class="metric-label">Crises Survived</span>
        </div>
        <div class="complete-metric">
          <span class="metric-value">${soulState.anchors?.length || 0}</span>
          <span class="metric-label">Anchors Formed</span>
        </div>
      </div>
      <div class="complete-soul-cta">
        <p>Continue your journey in <strong>free play</strong> â ” every new life is yours to explore, with achievements as your guide.</p>
      </div>
    </div>
  `;
}

function renderEraStatues(lives, chainTypes) {
  const eraLabels = { ANCIENT: 'Ancient', MEDIEVAL: 'Medieval', EARLY_MODERN: 'Early Modern', INDUSTRIAL: 'Industrial', MODERN: 'Modern', NEAR_FUTURE: 'Near Future', FAR_FUTURE: 'Far Future' };
  const eraSculpture = {
    ANCIENT: { icon: 'âš°', theme: 'Loss & The Gods', desc: 'Fragments of devotion and sacrifice' },
    MEDIEVAL: { icon: 'â›ª', theme: 'Faith & Plague', desc: 'The weight of belief and mortality' },
    EARLY_MODERN: { icon: 'âš™', theme: 'Reason & Revolution', desc: 'Old worlds unmaking themselves' },
    INDUSTRIAL: { icon: 'âš ', theme: 'Machine & Struggle', desc: 'The factory whistle and the trench' },
    MODERN: { icon: 'â˜¢', theme: 'Connection & Isolation', desc: 'Screens between hearts' },
    NEAR_FUTURE: { icon: 'â˜', theme: 'Algorithm & Climate', desc: 'The data cloud and the rising sea' },
    FAR_FUTURE: { icon: 'âˆž', theme: 'Upload & Meaning', desc: 'Death is optional. Purpose is not.' },
  };

  return `
    <div class="era-statues">
      ${Object.entries(eraSculpture).map(([era, statue]) => {
        const eraLives = (lives || []).filter(l => l.era === era);
        const dominant = eraLives.length > 0 ? eraLives[0].dominantChain : null;
        const chainColor = dominant ? { GRIEF: '#ff4466', LOVE: '#ff66aa', DREAD: '#9944ff', WONDER: '#44aaff', RAGE: '#ff6600', GRACE: '#aaaaaa' }[dominant] || '#666' : '#333';
        return `
          <div class="era-statue ${eraLives.length > 0 ? 'unlocked' : 'locked'}">
            <div class="statue-icon">${statue.icon}</div>
            <div class="statue-info">
              <div class="statue-title">${eraLabels[era] || era}</div>
              <div class="statue-theme" style="color:${chainColor}">${dominant ? dominant + ' THEME' : statue.theme}</div>
              <div class="statue-desc">${statue.desc}</div>
              <div class="statue-count">${eraLives.length} lives recorded</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function openLifeDetailView(life, allLives = [], chainTypes) {
  const existing = document.getElementById('life-detail-museum');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'life-detail-museum';
  modal.className = 'modal-overlay';

  const content = document.createElement('div');
  content.className = 'modal-content museum-life-detail';

  const events = life.events || [];
  const chainColor = (type) => {
    const map = { GRIEF: '#ff4466', LOVE: '#ff66aa', DREAD: '#9944ff', WONDER: '#44aaff', RAGE: '#ff6600', GRACE: '#aaaaaa' };
    return map[type] || '#666666';
  };

  content.innerHTML = `
    <h2>${life.name || 'Unknown Soul'}</h2>
    <div class="life-detail-grid">
      <div class="detail-row"><span class="detail-label">Era:</span><span class="detail-value">${(life.era || 'Unknown').replace('_', ' ')}</span></div>
      <div class="detail-row"><span class="detail-label">Year:</span><span class="detail-value">${life.year || '?'}</span></div>
      <div class="detail-row"><span class="detail-label">Location:</span><span class="detail-value">${life.location?.city || '?'}, ${life.location?.country || ''}</span></div>
      <div class="detail-row"><span class="detail-label">Health:</span><span class="detail-value">${life.health || 'unknown'}</span></div>
      <div class="detail-row"><span class="detail-label">Social Class:</span><span class="detail-value">${life.socialClass || 'unknown'}</span></div>
      <div class="detail-row"><span class="detail-label">Gender:</span><span class="detail-value">${life.genderPresentation || 'ambiguous'}</span></div>
      <div class="detail-row"><span class="detail-label">Age at Death:</span><span class="detail-value">${life.age || 0}</span></div>
      ${life.dominantChain ? `<div class="detail-row"><span class="detail-label">Chain Theme:</span><span class="detail-value" style="color:${chainColor(life.dominantChain)}">${life.dominantChain}</span></div>` : ''}
      ${life.deathCause ? `<div class="detail-row"><span class="detail-label">Death Cause:</span><span class="detail-value">${life.deathCause}</span></div>` : ''}
    </div>
    ${events.length > 0 ? `
      <div class="life-events-section">
        <h3>Life Events</h3>
        <div class="life-events-timeline">
          ${events.map((e, idx) => `
            <div class="life-event-item ${e.isDeathEvent ? 'death-event' : ''}">
              <span class="event-age">Age ${e.age || '?'}</span>
              <span class="event-title">${e.title || 'Unknown event'}</span>
              ${e.cascadeTags && e.cascadeTags.length > 0 ? `<div class="event-tags">${e.cascadeTags.map(t => `<span class="event-tag">${t}</span>`).join('')}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
    ${life.fragments && life.fragments.length > 0 ? `
      <div class="life-fragments-section">
        <h3>Fragments Extracted</h3>
        <div class="life-fragments-grid">
          ${life.fragments.map(f => `
            <div class="fragment-card small">
              <div class="fragment-type-badge">${f.type}</div>
              <div class="fragment-value">"${f.value}"</div>
              ${f.isAnchor ? '<div class="fragment-anchor-badge">â˜…</div>' : ''}
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
    ${life.chainRecap ? `
      <div class="life-chain-section">
        <h3>Chain Recap</h3>
        <div class="chain-recap-display" style="border-left: 3px solid ${chainColor(life.chainRecap.type)}">
          <div class="chain-recap-title">${life.chainRecap.type} CHAIN â ” ${life.chainRecap.label || ''}</div>
          ${(life.chainRecap.events || []).map(e => `<div class="chain-event-line">${e.title || 'Event'}</div>`).join('')}
        </div>
      </div>
    ` : ''}
    <button class="btn-close-modal" data-close-life-detail>Close</button>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  requestAnimationFrame(() => modal.classList.add('visible'));

  modal.querySelector('[data-close-life-detail]').addEventListener('click', () => {
    modal.classList.remove('visible');
    setTimeout(() => modal.remove(), 300);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('visible');
      setTimeout(() => modal.remove(), 300);
    }
  });
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ANIMATION FUNCTIONS â ” Soul Cycle
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/* 1. Event Text Typewriter */
let _activeTypewriter = null;
let _advancingEvent = false;
export const typewriterEffect = (element, text, speed = 40, onComplete, eventObj = null) => {
  if (!element || !text) return;

  if (eventObj) {
    triggerEventNarration(eventObj);
  }

  const marker = `tw-${Date.now()}-${Math.random()}`;
  element.dataset.typewriterMarker = marker;

  if (_activeTypewriter && _activeTypewriter.element === element) {
    _activeTypewriter.skipped = true;
    if (_activeTypewriter.cleanup) _activeTypewriter.cleanup();
  } else if (_activeTypewriter && _activeTypewriter.element !== element) {
    _activeTypewriter.skipped = true;
    if (_activeTypewriter.cleanup) _activeTypewriter.cleanup();
  }

  element.textContent = '';
  element.classList.add('typewriter-text');

  const skipHint = document.createElement('div');
  skipHint.className = 'typewriter-skip-hint';
  skipHint.textContent = 'Space to skip';
  element.parentElement.appendChild(skipHint);

  let skipped = false;

  const cleanup = () => {
    document.removeEventListener('keydown', skipHandler);
    skipHint.remove();
  };

  const reveal = (currentIndex) => {
    if (element.dataset.typewriterMarker !== marker) return;
    if (skipped) {
      element.textContent = text;
      element.classList.add('skip');
      element.classList.remove('typewriter-text');
      if (onComplete) onComplete();
      cleanup();
      if (_activeTypewriter && _activeTypewriter.element === element) _activeTypewriter = null;
      return;
    }
    if (currentIndex < text.length) {
      if (element.dataset.typewriterMarker !== marker) return;
      element.textContent += text[currentIndex];
      _activeTypewriter = { element, skipped: false, cleanup, marker };
      setTimeout(() => reveal(currentIndex + 1), speed + Math.random() * 10);
    } else {
      element.classList.remove('typewriter-text');
      if (onComplete) onComplete();
      cleanup();
      if (_activeTypewriter && _activeTypewriter.element === element) _activeTypewriter = null;
    }
  };

  const skipHandler = (e) => {
    if ((e.code === 'Space' || e.code === 'Enter') && !skipped) {
      skipped = true;
      skipNarration();
      document.removeEventListener('keydown', skipHandler);
    }
  };

  document.addEventListener('keydown', skipHandler);
  _activeTypewriter = { element, skipped: false, cleanup, marker };

  setTimeout(() => skipHint.classList.add('visible'), text.length * speed * 0.5);

  reveal(0);

  return () => {
    skipped = true;
    cleanup();
    _activeTypewriter = null;
  };
};

/* 2. Fragment Extraction Float-Up */
export const animateFragmentExtraction = (fragment, startElement, targetElement, duration = 2000) => {
  const startRect = startElement.getBoundingClientRect();
  const targetRect = targetElement.getBoundingClientRect();

  const fragmentEl = document.createElement('div');
  fragmentEl.className = 'fragment-extracting';
  fragmentEl.textContent = fragment.value;
  fragmentEl.style.left = `${startRect.left + startRect.width / 2}px`;
  fragmentEl.style.top = `${startRect.top}px`;
  document.body.appendChild(fragmentEl);

  let startTime = null;
  let trailInterval = null;

  const createTrail = (x, y) => {
    const trail = document.createElement('div');
    trail.className = 'glow-trail';
    trail.style.left = `${x + Math.random() * 10 - 5}px`;
    trail.style.top = `${y + Math.random() * 10 - 5}px`;
    fragmentEl.appendChild(trail);
    setTimeout(() => trail.remove(), 300);
  };

  trailInterval = setInterval(() => {
    const rect = fragmentEl.getBoundingClientRect();
    createTrail(rect.left, rect.top);
  }, 50);

  const animate = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);

    const easeOut = 1 - Math.pow(1 - progress, 3);
    const xOffset = (targetRect.left + targetRect.width / 2 - startRect.left - startRect.width / 2) * easeOut;
    const yOffset = (targetRect.top - startRect.top) * easeOut;

    fragmentEl.style.transform = `translateX(${xOffset}px) translateY(${yOffset}px)`;
    fragmentEl.style.opacity = progress < 0.8 ? 1 : 1 - (progress - 0.8) / 0.2;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      clearInterval(trailInterval);
      fragmentEl.remove();
    }
  };

  requestAnimationFrame(animate);
};

/* 3. Death Rewind */
export const animateDeathRewind = (eventElement, onComplete) => {
  const vignette = document.createElement('div');
  vignette.className = 'death-rewind-overlay';
  document.body.appendChild(vignette);

  if (eventElement) {
    eventElement.classList.add('death-rewind-text');
  }

  setTimeout(() => {
    vignette.remove();
    if (eventElement) eventElement.classList.remove('death-rewind-text');
    if (onComplete) onComplete();
  }, 800);
};

/* 4. Soul Fingerprint Reveal */
export const animateFingerprintReveal = (containerElement, dotCount = 12) => {
  if (!containerElement) return;

  containerElement.classList.add('assembling');
  const dots = containerElement.querySelectorAll('.fingerprint-dot');

  dots.forEach((dot, i) => {
    dot.style.animationDelay = `${i * 0.1}s`;
    dot.classList.add('fingerprint-dot');

    const shimmer = document.createElement('div');
    shimmer.className = 'shimmer';
    shimmer.style.animationDelay = `${i * 0.1 + 0.2}s`;
    dot.style.position = 'relative';
    dot.appendChild(shimmer);
  });

  setTimeout(() => {
    containerElement.classList.remove('assembling');
    dots.forEach(dot => {
      dot.classList.remove('fingerprint-dot');
      const shimmer = dot.querySelector('.shimmer');
      if (shimmer) shimmer.remove();
    });
  }, dotCount * 100 + 600);
};

/* 5. Consequence Crack */
export const animateConsequenceCracks = () => {
  const container = document.createElement('div');
  container.className = 'consequence-crack-container';
  document.body.appendChild(container);

  const crackCount = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < crackCount; i++) {
    const crack = document.createElement('div');
    crack.className = `consequence-crack crack-offset-${i + 1}`;
    container.appendChild(crack);
  }

  setTimeout(() => container.remove(), 2000);
};

/* 6. Life Phase Transition */
export const animatePhaseTransition = (phaseName, onComplete) => {
  const flash = document.createElement('div');
  flash.className = 'phase-transition-flash';
  flash.innerHTML = `<div class="phase-name">${phaseName.replace('_', ' ')}</div>`;
  document.body.appendChild(flash);

  setTimeout(() => {
    flash.remove();
    if (onComplete) onComplete();
  }, 1000);
};

/* 7. Anchor Glow Pulse */
export const animateAnchorGlow = (anchorElement, isPromoted = false) => {
  if (!anchorElement) return;

  anchorElement.classList.add('anchor-glow-pulse');
  if (isPromoted) {
    anchorElement.classList.add('promoted');
  }

  setTimeout(() => {
    anchorElement.classList.remove('anchor-glow-pulse', 'promoted');
  }, 3000);
};

/* 8. Achievement Unlock */
export const animateAchievementUnlock = (achievement) => {
  const badge = document.createElement('div');
  badge.className = 'achievement-unlock';
  badge.innerHTML = `
    <div class="shimmer-effect"></div>
    <div class="badge-icon">${achievement.icon || 'â˜…'}</div>
    <div class="badge-label">${achievement.label}</div>
  `;
  document.body.appendChild(badge);

  setTimeout(() => badge.remove(), 2500);
};

/* 8b. Achievement Notifications - staggered display for multiple achievements */
export const showAchievementNotifications = (achievements) => {
  if (!achievements || achievements.length === 0) return;
  achievements.forEach((achievement, index) => {
    setTimeout(() => {
      animateAchievementUnlock(achievement);
    }, index * 1200);
  });
};

/* 9. Era Transition Dissolve */
export const animateEraDissolve = (era, onComplete) => {
  const overlay = document.createElement('div');
  overlay.className = `era-dissolve-overlay era-${era}`;
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.remove();
    if (onComplete) onComplete();
  }, 2000);
};

/* 10. Limbo Particle Swirl - Enhanced spiral pattern with soul thread */
export const drawLimboParticlesSwirl = (ctx, width, height, time) => {
  const particleCount = 40;
  const centerX = width / 2;
  const centerY = height / 2;

  const threadLength = 120;
  const threadTargetY = height + 30;

  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX, threadTargetY);
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
  ctx.lineWidth = 2;
  ctx.stroke();

  for (let i = 0; i < threadLength; i++) {
    const t = i / threadLength;
    const wobbleX = Math.sin(i * 0.3 + time * 0.002) * (4 + t * 6);
    const x = centerX + wobbleX;
    const y = centerY + t * (height * 0.7);
    const alpha = 0.4 * (1 - t * 0.5);
    const size = 2.5 - t * 1.5;

    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.5, size), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(212, 175, 55, ${alpha})`;
    ctx.fill();
  }

  for (let i = 0; i < particleCount; i++) {
    const seed = i * 137.5;
    const spiralAngle = (time * 0.001 + seed * 0.01) % (Math.PI * 20);
    const spiralRadius = 20 + (i / particleCount) * (Math.min(width, height) * 0.4);
    const x = centerX + Math.cos(spiralAngle) * spiralRadius * (1 + 0.2 * Math.sin(time * 0.002 + seed));
    const y = centerY + Math.sin(spiralAngle) * spiralRadius * (1 + 0.2 * Math.cos(time * 0.002 + seed));
    const size = 2 + Math.sin(seed + time * 0.002) * 2;
    const alpha = 0.3 + Math.sin(seed * 2 + time * 0.003) * 0.2;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(155, 89, 182, ${alpha})`;
    ctx.fill();

    if (i % 3 === 0) {
      ctx.beginPath();
      ctx.arc(x + Math.cos(spiralAngle + Math.PI) * 5, y + Math.sin(spiralAngle + Math.PI) * 5, size * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 175, 55, ${alpha * 0.6})`;
      ctx.fill();
    }
  }
};

/* 11. Draw Soul Fingerprint Dots - for canvas-based fingerprint */
export const drawSoulFingerprintDots = (ctx, x, y, count, radius, time, progress = 1) => {
  const visibleCount = Math.floor(count * progress);

  for (let i = 0; i < visibleCount; i++) {
    const angle = (i / count) * Math.PI * 2 + time * 0.001;
    const dotX = x + Math.cos(angle) * radius;
    const dotY = y + Math.sin(angle) * radius;
    const shimmer = Math.sin(time * 0.005 + i) * 0.3 + 0.7;

    ctx.beginPath();
    ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(212, 175, 55, ${shimmer})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(212, 175, 55, ${shimmer * 0.5})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
};

/* 12. Animate soul fingerprint on canvas */
export const animateSoulFingerprintCanvas = (canvas, fragments, onComplete) => {
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(canvas.width, canvas.height) * 0.35;

  let progress = 0;
  const duration = 1500;
  let startTime = null;

  const animate = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    progress = Math.min(elapsed / duration, 1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const types = ['tone', 'fear', 'love', 'warning'];
    const colors = ['#d4af37', '#c0392b', '#9b59b6', '#e67e22'];

    types.forEach((type, typeIndex) => {
      const typeFragments = fragments.filter(f => f.type === type);
      const count = Math.min(typeFragments.length, 8);
      const typeRadius = radius + typeIndex * 25;

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2 + timestamp * 0.0005;
        const dotX = centerX + Math.cos(angle) * typeRadius;
        const dotY = centerY + Math.sin(angle) * typeRadius;
        const shimmer = Math.sin(timestamp * 0.003 + i + typeIndex) * 0.3 + 0.7;
        const dotProgress = progress * count - i;

        if (dotProgress > 0) {
          const alpha = Math.min(dotProgress, shimmer);
          ctx.beginPath();
          ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
          ctx.fillStyle = colors[typeIndex].replace(')', `, ${alpha})`).replace('rgb', 'rgba').replace('#', 'rgba(').replace(/([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i, (m, r, g, b) => `${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}`);
          ctx.fillStyle = `rgba(${parseInt(colors[typeIndex].slice(1, 3), 16)}, ${parseInt(colors[typeIndex].slice(3, 5), 16)}, ${parseInt(colors[typeIndex].slice(5, 7), 16)}, ${alpha})`;
          ctx.fill();
        }
      }
    });

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else if (onComplete) {
      onComplete();
    }
  };

  requestAnimationFrame(animate);
};
