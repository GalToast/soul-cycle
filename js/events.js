// ═══════════════════════════════════════════════════════════
// SOUL CYCLE — Event System
// Extracted from index.html — all event data and logic
// ═══════════════════════════════════════════════════════════

import { state, getLifePhase, CHAIN_COLORS, ERAS, FRAGMENT_TYPE_ICONS, MORTALITY_CURVE, LIFE_PHASES, EVENT_POOLS, DEATH_EVENTS, CRISIS_CHOICES, CRITICAL_INTENSITY, DEFAULT_CHOICE_TIMEOUT, SPEED_MAP } from './game.js';
import { generateLifeTheme, detectChain, extractFragments, applyFragmentEffects, showChainRecapOnDeath } from './main.js';
import { checkAndUnlockAchievements } from './world.js';

// ── Event Data ──
export const EVENT_POOL = EVENT_POOLS;

export { DEATH_EVENTS };

// ── Event Tick / Selection ──
export function eventTick(lifeState, soulFragments, cascadeTags = []) {
  const age = lifeState.age;
  const mortalityRate = getMortalityRate(age);
  const phase = getLifePhase(age);
  let nextTickYears;
  if (age <= 4) nextTickYears = 1;
  else if (age <= 14) nextTickYears = 3;
  else if (age <= 24) nextTickYears = 2;
  else if (age <= 64) nextTickYears = 3;
  else if (age <= 84) nextTickYears = 2;
  else nextTickYears = 1;

  const deathProbability = (mortalityRate / 1000) * nextTickYears;
  const died = Math.random() < deathProbability;

  if (died) {
    const eligibleDeaths = DEATH_EVENTS.filter(d => d.eras.includes(lifeState.era) && d.phases.includes(phase));
    const deathEvent = eligibleDeaths.length > 0 ? eligibleDeaths[Math.floor(Math.random() * eligibleDeaths.length)] : DEATH_EVENTS.find(d => d.eras.includes(lifeState.era));
    const deathCause = deathEvent ? deathEvent.title : 'Unknown causes';
    return { ageReached: age + nextTickYears, died: true, deathCause, event: deathEvent ? { ...deathEvent, description: resolveTemplate(deathEvent.description, { name: lifeState.name || 'You', location: lifeState.location || 'here', era: lifeState.era, phase, anchor: lifeState.anchor || '' }) } : null, nextTickYears };
  }

  if (Math.random() > 0.75) {
    return { ageReached: age + nextTickYears, died: false, deathCause: null, event: null, nextTickYears };
  }

  const event = selectNextEvent(lifeState, soulFragments, cascadeTags);
  if (!event) {
    return { ageReached: age + nextTickYears, died: false, deathCause: null, event: null, nextTickYears };
  }

  const resolvedEvent = { ...event, description: resolveTemplate(event.description, { name: lifeState.name || 'You', location: lifeState.location || 'here', era: lifeState.era, phase, anchor: lifeState.anchor || '' }) };
  return { ageReached: age + nextTickYears, died: false, deathCause: null, event: resolvedEvent, nextTickYears };
}

export function selectNextEvent(lifeState, soulFragments, cascadeTags = []) {
  const phase = getLifePhase(lifeState.age);
  const era = lifeState.era;
  const pool = EVENT_POOLS[era];
  if (!pool || pool.length === 0) return null;

  const eligible = pool.filter(e => e.eras.includes(era) && e.phases.includes(phase) && Math.random() < e.triggerProbability);
  if (eligible.length === 0) {
    const relaxed = pool.filter(e => e.eras.includes(era) && e.phases.includes(phase));
    if (relaxed.length === 0) return null;
    return weightedRandom(relaxed.map(e => ({ item: e, weight: e.weight })))?.item || null;
  }

  const scored = eligible.map(event => {
    let score = event.weight;
    if (event.cascadeTags && cascadeTags.length > 0) {
      const matchingTags = event.cascadeTags.filter(t => cascadeTags.includes(t));
      score += matchingTags.length * 2;
    }
    if (soulFragments && soulFragments.influences) {
      for (const influence of soulFragments.influences) {
        if (event.cascadeTags && event.cascadeTags.includes(influence.tag)) score += influence.weight * 1.5;
        if (influence.category && event.category === influence.category) score += influence.weight;
      }
    }
    return { event, score };
  });

  return weightedRandom(scored.map(s => ({ item: s.event, weight: s.score })))?.item || null;
}

function resolveTemplate(text, vars) {
  if (!text) return '';
  return text.replace(/\{(name|location|era|phase|anchor)\}/g, (match, key) => vars[key] !== undefined ? vars[key] : match);
}

function weightedRandom(items) {
  if (items.length === 0) return null;
  if (items.length === 1) return items[0];
  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
  let random = Math.random() * totalWeight;
  for (const item of items) { random -= (item.weight || 1); if (random <= 0) return item; }
  return items[items.length - 1];
}

function getMortalityRate(age) {
  const bucket = MORTALITY_CURVE.find(b => age >= b.minAge && age <= b.maxAge);
  return bucket ? bucket.rate : 80.0;
}

// ── Display / Choice Functions ──
export function displayEvent(event) {
  if (!event) return;

  const eventTitle = document.getElementById('event-title');
  const eventProse = document.getElementById('event-prose');
  if (!eventTitle || !eventProse) return;

  eventTitle.className = 'chain-active';

  const chainType = getChainTypeForEvent(event);
  if (chainType) {
    eventTitle.classList.add(`event-chain-${chainType.toLowerCase()}`);
    eventTitle.classList.add('chain-active');
  }

  eventTitle.innerHTML = (chainType ? '<span class="chain-icon">⚭</span>' : '') + event.title;
  eventProse.textContent = event.description;
  eventTitle.style.display = 'block';
  eventProse.style.display = 'block';

  if (event.cascadeTags) {
    state.cascadeTags = event.cascadeTags;
  }
}

export function showEventChoices(event) {
  if (!event || !event.choices) return;
}

function getChainTypeForTag(tag) {
  if (!tag) return null;
  const t = tag.toLowerCase();
  const CHAIN_TAG_MAP = {
    GRIEF: ['grief', 'sadness', 'sorrow', 'mourning', 'loss', 'despair', 'melancholy'],
    LOVE: ['connection', 'tenderness', 'love', 'affection', 'devotion', 'passion', 'romance'],
    DREAD: ['dread', 'vertigo', 'fear', 'terror', 'anxiety', 'panic', 'horror'],
    WONDER: ['wonder', 'awe', 'discovery', 'curiosity', 'marvel'],
    RAGE: ['rage', 'anger', 'betrayal', 'fury', 'wrath', 'resentment'],
    GRACE: ['grace', 'resignation', 'acceptance', 'peace', 'surrender'],
  };
  for (const [chainType, tags] of Object.entries(CHAIN_TAG_MAP)) {
    if (tags.some(ct => t.includes(ct))) return chainType;
  }
  return null;
}

function getChainTypeForEvent(event) {
  if (!event || !event.cascadeTags || event.cascadeTags.length === 0) return null;
  for (const tag of event.cascadeTags) {
    const chainType = getChainTypeForTag(tag);
    if (chainType) return chainType;
  }
  return null;
}

// ── Divine Sign System ──
export async function awaitDivineSign(era, phase) {
  return new Promise(resolve => setTimeout(() => {
    const signs = [
      'The sky fractures. A new path opens.',
      'Something ancient stirs and reaches toward you.',
      'The threads of fate shimmer. A sign appears.',
      'A presence brushes against your awareness.',
      'The world holds its breath. A sign emerges.',
    ];
    resolve(signs[Math.floor(Math.random() * signs.length)]);
  }, 1500));
}

export function showDivineToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;top:20%;left:50%;transform:translateX(-50%);background:#0e0e16;border:1px solid #ffaa00;border-radius:8px;padding:16px 24px;color:#ffaa00;font-family:var(--font-mono);font-size:0.85rem;z-index:300;text-align:center;animation:fadeIn 0.5s ease;';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.5s ease forwards';
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

// ── Crisis Spike Functions ──
export function spikeCrisisIntensity(era) {
  const spikes = {
    ANCIENT: ['The gods demand a sacrifice.', 'The oracle speaks your name.', 'The temple falls silent.'],
    MEDIEVAL: ['The bells toll for you.', 'The plague has found you.', 'War comes to your door.'],
    EARLY_MODERN: ['The witch hunters approach.', 'The inquisition has noticed you.', 'Revolution stirs in the streets.'],
    INDUSTRIAL: ['The factory spews poison.', 'War calls you to the trenches.', 'The machines grow hungry.'],
    MODERN: ['The screens flicker with your name.', 'A diagnosis arrives.', 'Society has marked you.'],
    NEAR_FUTURE: ['The algorithm has decided.', 'The climate shifts against you.', 'The drones search for you.'],
    FAR_FUTURE: ['The substrate destabilizes.', 'The upload threatens to corrupt.', 'The synthetic bodies fail.'],
  };
  return (spikes[era] || spikes['ANCIENT'])[Math.floor(Math.random() * 3)];
}

// ── Consequence Functions ──
export function addConsequence(event, consequenceTag) {
  if (!event.cascadeTags) event.cascadeTags = [];
  event.cascadeTags.push(consequenceTag);
  state.cascadeTags = [...new Set([...state.cascadeTags, consequenceTag])];
}

export function triggerConsequenceEscalation(event) {
  if (!event || !event.cascadeTags) return;
  const escalationMap = {
    grief: 'rage', dread: 'vertigo', connection: 'tenderness',
    anchor: 'resignation', wonder: 'awe', awakening: 'disorientation'
  };
  const newTags = event.cascadeTags.map(t => escalationMap[t] || t);
  event.cascadeTags = [...new Set(newTags)];
  state.cascadeTags = [...new Set([...state.cascadeTags, ...newTags])];
}

export function resolveCrisisChoice(choiceKey, event) {
  const choiceMap = { A: 'intervene', B: 'pray', C: 'watch' };
  const choiceId = choiceMap[choiceKey];
  if (!choiceId) return resolveCrisisChoice('C', event);

  const choice = CRISIS_CHOICES[choiceId];
  const roll = Math.random();
  const successThreshold = choice.outcomes.success.probability;
  const isSuccess = roll < successThreshold;
  const outcome = isSuccess ? choice.outcomes.success : choice.outcomes.failure;

  event.isCrisisHandled = true;

  if (outcome.effect.deathChance && Math.random() < outcome.effect.deathChance) {
    triggerImmediateDeath(outcome.effect.cascadeTags || []);
    return;
  }

  if (outcome.effect.cascadeTags && outcome.effect.cascadeTags.length > 0) {
    state.cascadeTags = [...new Set([...state.cascadeTags, ...choice.cascadeBias, ...outcome.effect.cascadeTags])];
  } else if (choice.cascadeBias) {
    state.cascadeTags = [...new Set([...state.cascadeTags, ...choice.cascadeBias])];
  }

  if (outcome.effect.emotionalShift) {
    state.emotionalShift = (state.emotionalShift || 0) + outcome.effect.emotionalShift;
  }

  if (state.soul?.metaStats) {
    state.soul.metaStats.crisesSurvived = (state.soul.metaStats.crisesSurvived || 0) + 1;
  }
}

function triggerImmediateDeath(cascadeTags) {
  const deathEvent = {
    id: 'death_crisis_' + Date.now(),
    title: 'The crisis claimed you',
    description: 'You stepped too close to the fire and it took you.',
    cascadeTags: cascadeTags || ['grief', 'vertigo'],
    category: 'violence',
    era: state.currentLife.era,
    age: state.currentAge,
    isDeathEvent: true,
  };

  state.isAlive = false;
  state.deathEvent = deathEvent;
  clearInterval(state.tickInterval);
  state.tickInterval = null;

  state.lifeEvents.push({ ...deathEvent, age: state.currentAge });
  state.eventMarkers.push({ age: state.currentAge, rate: getMortalityRate(Math.min(state.currentAge, 100)) });

  const chainResult = detectChain(deathEvent, state.lifeEvents);
  if (chainResult.chainEvent) {
    if (!state.activeChain) {
      state.activeChain = { type: chainResult.chainType, events: [], color: CHAIN_COLORS[chainResult.chainType] };
    }
    if (!state.activeChain.events.find(ev => ev.id === deathEvent.id)) {
      state.activeChain.events.push(deathEvent);
    }
  }

  if (state.lifeEvents.length >= 2) {
    state.lifeTheme = generateLifeTheme(state.lifeEvents);
  }

  const { newFragments } = extractFragments(state.lifeEvents, deathEvent, state.soul);
  applyFragmentEffects(state.soul, newFragments);

  const newAchievements = checkAndUnlockAchievements(state.soul, state.lifeEvents, deathEvent);
  if (newAchievements.length > 0) {
    setTimeout(() => window.showAchievementNotifications(newAchievements), 800);
  }

  window.updateUI();
  window.showFragments(newFragments);
  window.drawCurve();

  setTimeout(() => showDeathOverlay(deathEvent), 500);
}

// ── Internal Helpers ──

function showDeathOverlay(deathEvent) {
  const life = state.currentLife;
  const deathOverlay = document.getElementById('death-overlay');
  if (!deathOverlay) return;
  document.getElementById('death-cause').textContent = deathEvent?.title || 'Unknown causes';
  document.getElementById('death-summary').textContent = deathEvent?.description || '';
  document.getElementById('death-age').textContent = `age ${state.currentAge}`;
  document.getElementById('death-era').textContent = `${ERAS[life.era]?.label || life.era} • ${life.year}`;
  document.getElementById('death-life-num').textContent = `life #${state.soul.livesLived + 1}`;
  deathOverlay.classList.add('visible');
  showChainRecapOnDeath(state.lifeEvents);

  const app = document.getElementById('app');
  const lifeViewport = document.getElementById('life-viewport');
  if (app) app.classList.add('shake');
  if (lifeViewport) lifeViewport.classList.add('red-flash');
  setTimeout(() => {
    if (app) app.classList.remove('shake');
    if (lifeViewport) lifeViewport.classList.remove('red-flash');
  }, 600);
}

// ── Crisis Overlay ──
let crisisPendingResolve = null;

export function showCrisisPrompt(event, choices) {
  const overlay = document.getElementById('crisis-overlay');
  const causeEl = document.getElementById('crisis-cause');
  const choicesEl = document.getElementById('crisis-choices');
  const timerFill = document.getElementById('crisis-timer-fill');
  const timerText = document.getElementById('crisis-timer-text');
  if (!overlay || !causeEl) return;

  const displayCause = event.description || event.title || 'A crisis unfolds.';
  causeEl.textContent = displayCause;

  choicesEl.innerHTML = '';
  const choiceOrder = ['A', 'B', 'C'];
  const choiceIds = ['intervene', 'pray', 'watch'];

  choiceOrder.forEach((key, i) => {
    const choice = CRISIS_CHOICES[choiceIds[i]];
    const btn = document.createElement('button');
    btn.className = 'crisis-choice';
    btn.dataset.key = key;
    btn.innerHTML = `
      <span class="choice-key">${key}</span>
      <span class="choice-content">
        <div class="choice-label">${choice.label} — ${choice.subtitle}</div>
        <div class="choice-risk">Risk: ${choice.riskDescriptions.join(', ')}</div>
      </span>
    `;
    btn.addEventListener('click', () => handleCrisisChoice(key));
    choicesEl.appendChild(btn);
  });

  overlay.classList.add('visible');

  let remaining = DEFAULT_CHOICE_TIMEOUT;
  const interval = setInterval(() => {
    remaining -= 100;
    const pct = (remaining / DEFAULT_CHOICE_TIMEOUT) * 100;
    if (timerFill) timerFill.style.width = pct + '%';
    if (timerText) timerText.textContent = `You have ${Math.ceil(remaining / 1000)} second${Math.ceil(remaining / 1000) !== 1 ? 's' : ''}...`;

    if (remaining <= 0) {
      clearInterval(interval);
      handleCrisisChoice('C');
    }
  }, 100);

  state.crisisPending = { event, interval, resolve: crisisPendingResolve };
}

export function hideCrisisPrompt() {
  const overlay = document.getElementById('crisis-overlay');
  if (overlay) overlay.classList.remove('visible');

  if (state.crisisPending && state.crisisPending.interval) {
    clearInterval(state.crisisPending.interval);
  }
  state.crisisPending = null;
}

export function handleCrisisChoice(key) {
  if (!state.crisisPending) return;
  const { event } = state.crisisPending;
  hideCrisisPrompt();
  resolveCrisisChoice(key, event);
  state.isPaused = false;
  window.updateUI();
  window.drawCurve();
}

export function isCrisisEvent(event) {
  if (!event) return false;
  const intensity = event.intensity || event.emotionalIntensity || 0;
  const hasChoices = event.choices && event.choices.length > 0;
  return (
    (intensity >= CRITICAL_INTENSITY || event.crisisTag) &&
    !event.isDeathEvent &&
    !event.isCrisisHandled &&
    hasChoices
  );
}

// ── Whisper System ──
export function getWhisperFrequency(soulState, currentPhase) {
  const fragmentCount = soulState.fragments ? soulState.fragments.length : 0;
  let freq = Math.min(0.1 * fragmentCount, 0.5);
  if (soulState.anchors) freq += soulState.anchors.length * 0.05;
  const era = state.currentLife ? state.currentLife.era : 'ANCIENT';
  if (era === 'ANCIENT' || era === 'MEDIEVAL') freq *= 1.3;
  if (era === 'MODERN' || era === 'NEAR_FUTURE' || era === 'FAR_FUTURE') freq *= 1.15;
  if (currentPhase === 'MIDDLE_AGE' || currentPhase === 'SENIOR' || currentPhase === 'ANCIENT') freq *= 1.4;
  if (currentPhase === 'INFANT' || currentPhase === 'CHILD') freq *= 0.5;
  return freq;
}

function selectWhisperingFragment(soulState, currentEra, recentFragmentIds) {
  const eligible = soulState.fragments.filter(f => {
    if (recentFragmentIds.includes(f.id)) return false;
    if (f.strength < 0.2) return false;
    if (f.origin && f.origin.era === currentEra) return true;
    return f.strength > 0.4;
  });
  if (eligible.length === 0) return null;

  const weights = eligible.map(f => {
    let w = f.strength;
    if (f.origin && f.origin.era === currentEra) w *= 1.5;
    if (f.isAnchor) w *= 1.3;
    const lifeNum = f.origin?.lifeId?.split('_').pop() || 0;
    if ((soulState.livesLived || 0) - parseInt(lifeNum) <= 3) w *= 1.4;
    return w;
  });
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * totalWeight;
  for (let i = 0; i < eligible.length; i++) {
    r -= weights[i];
    if (r <= 0) return eligible[i];
  }
  return eligible[0];
}

export function generateWhisperEvent(fragment, era, currentAge) {
  const biasTags = fragment.cascadeTags || [];
  const typeBias = fragment.type === 'fear' ? ['dread', 'danger', 'threat'] :
                  fragment.type === 'love' ? ['connection', 'tenderness', 'longing'] :
                  fragment.type === 'tone' ? ['melancholy', 'resignation', 'wonder'] :
                  ['fate', 'coincidence', 'sign'];

  const pool = EVENT_POOLS[era] || EVENT_POOLS['ANCIENT'] || [];
  const eligibleEvents = pool.filter(e =>
    e.cascadeTags && e.cascadeTags.some(t => [...biasTags, ...typeBias].includes(t))
  );

  if (eligibleEvents.length > 0) {
    const chosen = pickRandom(eligibleEvents);
    return {
      id: `whisper_${Date.now()}`,
      title: chosen.title,
      era,
      age: currentAge,
      category: 'whisper',
      intensity: 0.3,
      cascadeTags: [...(chosen.cascadeTags || []), ...(fragment.cascadeTags || []), fragment.type],
      description: resolveTemplate(chosen.description, { name: state.currentLife?.name || 'You', location: state.currentLife?.location?.city || 'here', era, phase: getLifePhase(currentAge), anchor: '' }),
      isWhisperEvent: true,
      sourceFragmentId: fragment.id,
    };
  }

  return createWhisperEvent(fragment, era, currentAge);
}

function createWhisperEvent(fragment, era, currentAge) {
  const templates = {
    tone: `The whisper "${fragment.value}" becomes a memory you can't place.`,
    fear: `A chill follows you. ${fragment.value}.`,
    love: `You think of ${fragment.value}. Someone should be here for this.`,
    location: `You find yourself walking toward ${fragment.value}. You don't remember deciding to go.`,
    word: `The word ${fragment.value} keeps surfacing. You don't know why.`,
    object: `Something about ${fragment.value} pulls at you.`,
    warning: `${fragment.value}. You feel it in your chest before you understand it.`,
  };
  const template = templates[fragment.type] || templates.tone;
  return {
    id: `whisper_${Date.now()}`,
    title: 'Fragment Resonates',
    era,
    age: currentAge,
    category: 'whisper',
    intensity: 0.3,
    cascadeTags: [...(fragment.cascadeTags || []), fragment.type],
    description: template,
    isWhisperEvent: true,
    sourceFragmentId: fragment.id,
  };
}

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function showWhisperPanel(fragment) {
  const panel = document.getElementById('whisper-panel');
  if (!panel) return;

  const isAnchor = fragment.isAnchor;
  panel.className = `whisper-panel visible${isAnchor ? ' anchor-whisper' : ''}`;

  const iconEl = document.getElementById('whisper-icon');
  const labelEl = document.getElementById('whisper-label');
  const anchorBadge = document.getElementById('whisper-anchor-badge');
  const valueEl = document.getElementById('whisper-value');
  const actBtn = document.getElementById('whisper-act-btn');
  const timerFill = document.getElementById('whisper-timer-fill');

  if (iconEl) iconEl.textContent = FRAGMENT_TYPE_ICONS[fragment.type] || '♪';
  if (labelEl) labelEl.textContent = isAnchor ? 'An anchor fragment resonates...' : 'Fragment whispers...';
  if (anchorBadge) anchorBadge.style.display = isAnchor ? 'inline' : 'none';
  if (valueEl) valueEl.textContent = `"${fragment.value}"`;

  if (actBtn) {
    actBtn.textContent = isAnchor ? 'Embrace' : 'Act';
    actBtn.className = `whisper-btn act${isAnchor ? ' embrace' : ''}`;
  }

  panel.style.display = 'block';

  state.whisperTimeLeft = 8000;
  if (timerFill) timerFill.style.width = '100%';

  if (state.whisperTimer) clearInterval(state.whisperTimer);
  state.whisperTimer = setInterval(() => {
    state.whisperTimeLeft -= 100;
    const pct = (state.whisperTimeLeft / 8000) * 100;
    if (timerFill) timerFill.style.width = `${Math.max(0, pct)}%`;
    if (state.whisperTimeLeft <= 0) {
      handleWhisperIgnore();
    }
  }, 100);
}

export function hideWhisperPanel() {
  const panel = document.getElementById('whisper-panel');
  if (!panel) return;
  panel.classList.remove('visible');
  panel.style.display = 'none';
  if (state.whisperTimer) {
    clearInterval(state.whisperTimer);
    state.whisperTimer = null;
  }
}

export function handleWhisperAct() {
  if (!state.currentWhisper) return;
  const fragment = state.currentWhisper;

  hideWhisperPanel();

  const whisperEvent = generateWhisperEvent(fragment, state.currentLife.era, state.currentAge);

  const eventWithAge = { ...whisperEvent, age: state.currentAge, era: state.currentLife.era };
  state.lifeEvents.push(eventWithAge);
  displayEvent(whisperEvent);

  state.eventMarkers.push({ age: state.currentAge, rate: getMortalityRate(Math.min(state.currentAge, 100)) });

  const chainResult = detectChain(eventWithAge, state.lifeEvents);
  if (chainResult.chainEvent) {
    if (!state.activeChain || state.activeChain.type !== chainResult.chainType) {
      state.activeChain = { type: chainResult.chainType, events: [], color: CHAIN_COLORS[chainResult.chainType] };
    }
    if (!state.activeChain.events.find(ev => ev.id === eventWithAge.id)) {
      state.activeChain.events.push(eventWithAge);
    }
    if (state.activeChain.events.length >= 2) {
      state.lifeTheme = generateLifeTheme(state.lifeEvents);
    }
  }

  window.renderChainStrip(state.activeChain);
  window.updateLifeSummaryBar();

  if (!state.recentFragmentIds.includes(fragment.id)) {
    state.recentFragmentIds.push(fragment.id);
  }
  if (state.recentFragmentIds.length > 8) {
    state.recentFragmentIds = state.recentFragmentIds.slice(-8);
  }

  state.currentWhisper = null;
  state.whisperCooldown = 20 + Math.floor(Math.random() * 21);
}

export function handleWhisperIgnore() {
  if (!state.currentWhisper) return;
  const fragment = state.currentWhisper;

  hideWhisperPanel();

  if (fragment.isAnchor) {
    if (state.soul && state.soul.emotionalShift !== undefined) {
      state.soul.emotionalShift = Math.max(-1, state.soul.emotionalShift - 0.05);
    } else if (state.soul) {
      state.soul.emotionalShift = -0.05;
    }
  }

  state.currentWhisper = null;
  state.whisperCooldown = 20 + Math.floor(Math.random() * 21);
}

// ── Resource Effects ──
const RESOURCE_BUILDERS = {
  connection: ['marriage','birth','child','reunion','forgiveness','friendship','adoption','love','wedding','ceremony','bond'],
  vitality: ['recovery','health','healing','rest','birth','survival','robust','strong','vitality'],
  momentum: ['achievement','breakthrough','clarity','purpose','discovery','triumph','success','victory']
};

const RESOURCE_DEPLETERS = {
  connection: ['betrayal','loss','death','estrangement','divorce','abandonment','rival','blood','war','enemy','hate'],
  vitality: ['plague','illness','injury','trauma','poison','starvation','fever','exhaustion','sick','weak','wound'],
  momentum: ['confusion','failure','doubt','aimlessness','lost','aimless','confused','迷','fail']
};

export function modifyResourcesForEvent(event) {
  if (!event || !event.cascadeTags) return;
  const tags = event.cascadeTags.map(t => t.toLowerCase());

  for (const [resource, keywords] of Object.entries(RESOURCE_BUILDERS)) {
    for (const kw of keywords) {
      if (tags.some(t => t.includes(kw))) {
        state[resource] = Math.min(3, state[resource] + 1);
      }
    }
  }
  for (const [resource, keywords] of Object.entries(RESOURCE_DEPLETERS)) {
    for (const kw of keywords) {
      if (tags.some(t => t.includes(kw))) {
        state[resource] = Math.max(0, state[resource] - 1);
      }
    }
  }
  window.updateResourceDisplay();
}

// ── Init Event System ──
export function initEventSystem(gameState) {
  document.addEventListener('keydown', handleGlobalKeydown);

  document.getElementById('crisis-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'crisis-overlay') {
      handleCrisisChoice('C');
    }
  });
}

function handleGlobalKeydown(e) {
  if (state.currentWhisper) {
    if (e.key === 'y' || e.key === 'Y') {
      handleWhisperAct();
    } else if (e.key === 'n' || e.key === 'N') {
      handleWhisperIgnore();
    }
    return;
  }

  if (state.crisisPending) {
    const key = e.key.toUpperCase();
    if (['A', 'B', 'C'].includes(key)) {
      e.preventDefault();
      handleCrisisChoice(key);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCrisisChoice('C');
    }
  }
}