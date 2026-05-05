// ═══════════════════════════════════════════════════════════
// SOUL CYCLE — Main Bootstrap
// Extracted from index.html inline script
// Modules are imported at top for future split-out; for now
// all logic lives here and imports are stubs.
// ═══════════════════════════════════════════════════════════

import * as game from './game.js';
import * as audio from './audio.js';
import * as events from './events.js';
import * as save from './save.js';
import * as world from './world.js';
import * as ui from './ui.js';

// ── Chain / Life Arc System ──
const THEME_LABELS = {
  GRIEF: ['The losses accumulated', 'Grief follows grief', 'A weight builds', 'Each goodbye echoes'],
  LOVE: ['Love was the throughline', 'Someone mattered', 'Hearts stay', 'Connection outlasts'],
  DREAD: ['Something was always wrong', 'Dread built like interest', 'The worst was coming', 'Fear was justified'],
  WONDER: ['Discovery marked you', 'The world kept surprising', 'Awe interrupted', 'Curiosity was survival'],
  RAGE: ['Anger was your compass', 'Rage structured everything', 'You burned', 'Indignation defined'],
  GRACE: ['Acceptance came slowly', 'You learned to let go', 'Peace was possible', 'Grace found you'],
  NONE: null,
};

export const CHAIN_COLORS = {
  GRIEF: '#ff4466',
  LOVE: '#ff66aa',
  DREAD: '#9944ff',
  WONDER: '#44aaff',
  RAGE: '#ff6600',
  GRACE: '#aaaaaa',
};

const CHAIN_TAG_MAP = {
  GRIEF: ['grief', 'sadness', 'sorrow', 'mourning', 'loss', 'despair', 'melancholy'],
  LOVE: ['connection', 'tenderness', 'love', 'affection', 'devotion', 'passion', 'romance'],
  DREAD: ['dread', 'vertigo', 'fear', 'terror', 'anxiety', 'panic', 'horror'],
  WONDER: ['wonder', 'awe', 'discovery', 'curiosity', 'marvel'],
  RAGE: ['rage', 'anger', 'betrayal', 'fury', 'wrath', 'resentment'],
  GRACE: ['grace', 'resignation', 'acceptance', 'peace', 'surrender'],
};

const CHAIN_AGE_WINDOW = 10;

function getChainTypeForTag(tag) {
  if (!tag) return null;
  const t = tag.toLowerCase();
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

export function detectChain(event, lifeEvents) {
  if (!event || !event.cascadeTags || event.cascadeTags.length === 0) {
    return { chainUpdated: false, chainEvent: false, chainType: null };
  }

  const eventChainType = getChainTypeForEvent(event);
  if (!eventChainType) {
    return { chainUpdated: false, chainEvent: false, chainType: null };
  }

  const eventAge = event.age || 0;
  const recentEvents = lifeEvents.filter(e => {
    if (e === event) return false;
    const eAge = e.age || 0;
    return Math.abs(eAge - eventAge) <= CHAIN_AGE_WINDOW;
  });

  const matchingChainEvents = recentEvents.filter(e => getChainTypeForEvent(e) === eventChainType);

  if (matchingChainEvents.length === 0) {
    return { chainUpdated: false, chainEvent: false, chainType: eventChainType };
  }

  return { chainUpdated: true, chainEvent: true, chainType: eventChainType };
}

export function generateLifeTheme(lifeEvents) {
  if (!lifeEvents || lifeEvents.length < 2) return null;

  const chainCounts = { GRIEF: 0, LOVE: 0, DREAD: 0, WONDER: 0, RAGE: 0, GRACE: 0 };

  for (const event of lifeEvents) {
    const ct = getChainTypeForEvent(event);
    if (ct) chainCounts[ct]++;
  }

  let maxChain = null;
  let maxCount = 0;
  for (const [chain, count] of Object.entries(chainCounts)) {
    if (count > maxCount) { maxCount = count; maxChain = chain; }
  }

  if (!maxChain || maxCount < 2) return null;

  const seen = new Set();
  const chainEvents = lifeEvents.filter(e => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return getChainTypeForEvent(e) === maxChain;
  });
  const labels = THEME_LABELS[maxChain];
  const label = labels[Math.floor(Math.random() * labels.length)];

  return { theme: maxChain, chain: chainEvents, label, events: chainEvents };
}

function renderChainStrip(activeChain) {
  const strip = document.getElementById('chain-strip');
  const themeHeader = document.getElementById('life-theme-header');
  if (!strip) return;

  if (!activeChain || !activeChain.type || activeChain.events.length === 0) {
    strip.innerHTML = '';
    themeHeader.classList.remove('visible');
    return;
  }

  themeHeader.classList.add('visible');

  const color = CHAIN_COLORS[activeChain.type] || '#ffffff';
  const events = activeChain.events;
  const totalNodes = events.length + 1;

  let html = `<span class="chain-type-label" style="color:${color}">${activeChain.type} CHAIN</span>`;
  html += '<span class="chain-nodes" style="color:' + color + '">';

  for (let i = 0; i < totalNodes; i++) {
    if (i > 0) {
      html += '<span class="chain-line"></span>';
    }
    const isFilled = i < events.length;
    const isCurrent = i === events.length;
    const nodeClass = isFilled ? 'filled' : (isCurrent ? 'current' : '');
    html += `<span class="chain-node ${nodeClass}"></span>`;
  }

  html += '</span>';
  strip.innerHTML = html;

  const labelEl = document.getElementById('life-theme-label');
  if (labelEl && activeChain.label) {
    labelEl.textContent = activeChain.label;
  }
}

function updateLifeSummaryBar() {
  const bar = document.getElementById('life-summary-bar');
  if (!bar) return;

  const soul = state.soul;
  if (!soul) {
    bar.classList.remove('visible');
    return;
  }

  bar.classList.add('visible');

  const lives = soul.livesLived || 0;
  const years = soul.totalYearsLived || 0;
  const era = state.currentLife ? (ERAS[state.currentLife.era]?.label || state.currentLife.era) : '---';
  const theme = state.lifeTheme && state.lifeTheme.theme ? state.lifeTheme.theme : '---';

  document.getElementById('summary-lives').textContent = `Lives lived: ${lives}`;
  document.getElementById('summary-years').textContent = `Total years: ${years}`;
  document.getElementById('summary-era').textContent = `Era: ${era}`;
  document.getElementById('summary-theme').textContent = `Theme: ${theme}`;
}

export function showChainRecapOnDeath(lifeEvents) {
  const recapEl = document.getElementById('death-chain-recap');
  const titleEl = document.getElementById('death-chain-recap-title');
  const eventsEl = document.getElementById('death-chain-events');

  if (!recapEl) return;

  const theme = generateLifeTheme(lifeEvents);
  if (!theme || theme.events.length < 2) {
    recapEl.classList.remove('visible');
    return;
  }

  recapEl.classList.add('visible');

  const color = CHAIN_COLORS[theme.theme] || '#ffffff';
  titleEl.innerHTML = `<span class="chain-type-badge" style="background:${color}22;color:${color};border:1px solid ${color}88">${theme.theme}</span> Chain — ${theme.label}`;

  let html = '';
  const seenIds = new Set();
  const chainIconMap = { GRIEF: '💔', LOVE: '♥', DREAD: '👁', WONDER: '✦', RAGE: '🔥', GRACE: '☯' };
  const chainIcon = chainIconMap[theme.theme] || '◉';

  for (let i = 0; i < theme.events.length; i++) {
    const e = theme.events[i];
    if (seenIds.has(e.id)) continue;
    seenIds.add(e.id);
    if (i > 0) {
      html += `<div class="chain-event-connector" style="color:${color}">`;
      html += `<svg viewBox="0 0 12 12"><line x1="0" y1="6" x2="12" y2="6" stroke="currentColor" stroke-width="1.5"/>`;
      html += `<circle cx="6" cy="6" r="3" fill="currentColor"/></svg>`;
      html += '</div>';
    }
    const shortDesc = e.description ? e.description.substring(0, 60) + (e.description.length > 60 ? '…' : '') : e.title;
    html += `<div class="chain-event-line" style="border-left: 3px solid ${color}; padding-left: 10px; margin: 4px 0; background: ${color}08; border-radius: 0 4px 4px 0;">`;
    html += `<span style="color:${color};font-size:0.9em;margin-right:6px;">${chainIcon}</span>`;
    html += `<strong style="color:${color}">${e.title}</strong>`;
    html += `<div style="color:#aaa;font-size:0.85em;margin-top:2px;font-style:italic;">"${shortDesc}"</div>`;
    html += '</div>';
  }
  eventsEl.innerHTML = html;
}

// ── Fragment System ──
const MAX_ANCHORS = 5;
const ANCHOR_RECURRENCE_THRESHOLD = 1;
const WHISPER_CHANCE = 0.4;
const ERA_UNLOCK_THRESHOLDS = [
  { threshold: 5, era: 'EARLY_MODERN' },
  { threshold: 12, era: 'INDUSTRIAL' },
  { threshold: 20, era: 'MODERN' },
  { threshold: 30, era: 'NEAR_FUTURE' },
  { threshold: 42, era: 'FAR_FUTURE' },
];
const FRAGMENT_TYPES = ['tone','fear','love','location','name','object','word','warning'];

const DEATH_TEMPLATES = {
  violent: { type: 'fear', pool: ['the water was black and silent','a sound like breaking glass that never stopped echoing','hands that couldn\'t hold on','the sky went red before everything went quiet','a face you couldn\'t recognize in the smoke','the taste of copper and the feeling of falling','a door that closed too fast to reach','the last thing you saw was something beautiful','blood on the floor looked like a map to somewhere you\'d been','the sound of your own name spoken by a stranger'] },
  peaceful: { type: 'tone', pool: ['the light was warm and the room smelled like rain','a hand holding yours that you didn\'t want to let go of','the way the curtains moved in the last breeze','a song you almost remembered the words to','someone crying softly in the next room','the feeling of a weight you didn\'t know you were carrying lifting','a smile from someone who had been waiting','the last breath that felt like the first','a whisper that sounded like forgiveness','the color of the sky at the exact right moment'] },
};

const RELATIONSHIP_TEMPLATES = {
  lover: { type: 'love', pool: ['loved someone who was leaving anyway','a face with kind eyes that appeared in every crowd','the warmth of a shoulder you slept on for years','a promise made in a language you only half understood','the way they said your name when no one was listening','someone who knew the shape of your silence','a hand that fit perfectly in yours and then didn\'t','the last thing they said to you that you replayed every night','a laugh that made the room feel smaller and safer','eyes that looked at you like you were the only real thing'] },
  family: { type: 'love', pool: ['a voice that called you home even when you were already there','the weight of a child sleeping on your chest','someone who shared your face but not your choices','a name passed down like a burden you didn\'t ask for','the way your mother\'s hands looked when she was tired','a sibling who knew which secrets were safe to keep','the first word your child said and what it meant to you','a family dinner where everyone was pretending','the empty chair at the table that no one mentioned','blood that tied you to people you didn\'t understand'] },
  friend: { type: 'love', pool: ['someone who stayed when everyone else left','a conversation that lasted until the sun came up','the friend who knew which version of you was real','a shared joke that no one else would understand','the person you called when everything went wrong','a silence between two people that wasn\'t uncomfortable','someone who saw you at your worst and didn\'t flinch','the friend who moved away and never came back','a promise between friends that neither of you kept','the last time you saw them and didn\'t know it was the last time'] },
  rival: { type: 'warning', pool: ['someone who mirrored your worst self back at you','a rivalry that felt more honest than your friendships','the person who knew exactly how to hurt you','an enemy who respected you more than your allies did','a competition that became the shape of your life','someone you hated because they were what you wanted to be','the rival who forgave you when you didn\'t deserve it','a feud that outlasted everyone who started it','the person who challenged you until you broke or became stronger','an opponent who taught you more than any teacher'] },
  stranger: { type: 'tone', pool: ['a stranger who changed your life in five minutes','the person on the train who looked at you like they knew','someone you passed every day and never spoke to','a face in a crowd that felt like a memory from another life','the stranger who gave you something you didn\'t know you needed','someone who smiled at you on the worst day of your life','a person you saved or who saved you and then disappeared','the stranger whose name you never learned but whose eyes you remember','someone who existed in your life for a moment and then became a ghost','the person who proved that not everyone is who they seem'] },
};

const EMOTIONAL_TAG_TEMPLATES = {
  grief: { type: 'tone', pool: ['the color blue meant something dangerous','heir to nothing twice','a room that felt too big after someone left','the weight of an empty side of the bed','a song that played at the wrong time','the smell of someone\'s coat on a hook by the door','a calendar with a date circled that no longer mattered','the silence after a phone stopped ringing','a habit you couldn\'t break even though the reason was gone','the way the light hit a place where someone used to sit'] },
  joy: { type: 'tone', pool: ['a moment so bright it cast a shadow on everything after','the feeling of running downhill with the wind at your back','a laugh that came from somewhere deeper than your chest','the taste of something you didn\'t know you were hungry for','a day that felt like it would never end and you wanted it to','the sound of rain when you were exactly where you needed to be','a surprise that felt like the universe was paying attention','the warmth of a room full of people who chose to be there','a realization that hit you like sunlight through clouds','the exact second you knew everything was going to be okay'] },
  fear: { type: 'fear', pool: ['a word that felt like a warning in a language you don\'t speak','the feeling of being watched by something you couldn\'t see','a door you opened that you wished you hadn\'t','the sound of footsteps behind you that stopped when you stopped','a shadow that moved in a way shadows shouldn\'t','the moment you realized you were alone and didn\'t know how you got there','a place that felt wrong in a way you couldn\'t explain','the feeling of falling in a dream that you carried into waking','a number that kept appearing and you didn\'t know why','the silence before something you knew was coming'] },
  love: { type: 'love', pool: ['the exact shade of someone\'s eyes in a specific kind of light','a touch that lingered longer than it needed to','the way someone\'s voice changed when they said your name','a gift that was small but meant everything','the feeling of being understood without having to explain','a look across a room that said everything words couldn\'t','the warmth of someone\'s breath on your neck in the cold','a memory so vivid it felt like it was happening now','the way someone\'s hand felt in yours the first time','a promise you made that you weren\'t sure you could keep'] },
  anger: { type: 'warning', pool: ['a door slammed so hard the walls shook','the words you said that you couldn\'t take back','the moment you realized you were becoming someone you hated','a betrayal that felt like it came from inside your own chest','the sound of your own voice saying something cruel','a fire that started small and consumed everything','the look on someone\'s face when they realized you lied','a bridge you burned that you didn\'t know you\'d need','the silence after you said the thing you\'d been holding in','the feeling of power that came from hurting someone'] },
  wonder: { type: 'tone', pool: ['the sky looked different that day and you couldn\'t say why','a place that existed in your mind before you ever saw it','the feeling of standing somewhere for the first time and recognizing it','a book that described your life before you lived it','the sound of an instrument you\'d never heard but somehow knew','a dream that felt more real than the day that followed','the moment you understood something you\'d been trying to grasp your whole life','a coincidence so perfect it felt like design','the feeling of being exactly where you were supposed to be','a sight so beautiful it made you forget what you were afraid of'] },
};

const MEMORABLE_EVENT_TEMPLATES = {
  birth: { type: 'tone', pool: ['the first breath that tasted like the world','a cry that announced you were here and you were angry about it','hands that caught you before you knew what falling meant','the light that hurt your eyes and then became everything','a name given to you before you had any say in it'] },
  comingOfAge: { type: 'tone', pool: ['the day you realized your parents were just people','a mirror that showed you someone you didn\'t recognize','the first time you made a choice that couldn\'t be undone','a body that changed without asking your permission','the moment childhood ended and no one told you it was happening'] },
  achievement: { type: 'tone', pool: ['the moment you proved everyone wrong','a trophy that meant less than the look on your mother\'s face','the climb that changed you more than the view from the top','a success that felt like it belonged to someone else','the thing you built with your hands that outlasted you'] },
  loss: { type: 'fear', pool: ['the emptiness that followed a presence you took for granted','a goodbye that you didn\'t know was a goodbye at the time','the last photograph of someone who wouldn\'t be in any more','a house that became a museum of someone who left','the first holiday without the person who made it matter'] },
  betrayal: { type: 'warning', pool: ['the face of someone you trusted when the truth came out','a secret that was never yours to keep','the moment you realized the ground beneath you was hollow','a lie so big it became the foundation of everything','the person who knew where to strike and didn\'t hesitate'] },
  revelation: { type: 'word', pool: ['a truth that arrived too late to change anything','the word that unlocked a door you didn\'t know was locked','a letter that rewrote everything you thought you knew','a confession that felt like a gift and a curse at the same time','the moment the pieces clicked and you wished they hadn\'t'] },
};

const WHISPER_TEMPLATES = [
  { type: 'tone', value: 'a hum you couldn\'t place but felt in your teeth' },
  { type: 'tone', value: 'the smell of ozone before something important happened' },
  { type: 'warning', value: 'a number that appeared too often to be random' },
  { type: 'location', value: 'a street corner that felt like the center of something' },
  { type: 'object', value: 'a coin you found and kept without knowing why' },
  { type: 'name', value: 'a name you heard once and couldn\'t forget' },
  { type: 'tone', value: 'the way the light fell at a specific hour of a specific day' },
  { type: 'fear', value: 'a sound behind you that wasn\'t there when you turned around' },
  { type: 'love', value: 'the ghost of a touch on your shoulder from someone who wasn\'t there' },
  { type: 'word', value: 'a word in a language you don\'t speak that felt like home' },
  { type: 'object', value: 'a key to a door you never found' },
  { type: 'location', value: 'a room you dreamed about before you ever saw it' },
  { type: 'tone', value: 'the taste of something you\'d never eaten but remembered' },
  { type: 'warning', value: 'a feeling that you were being herded toward something' },
  { type: 'name', value: 'a face that belonged to a name you almost knew' },
];

let _fragIdCounter = 0;
function fragGenerateId() { _fragIdCounter += 1; return `frag_${Date.now()}_${_fragIdCounter}`; }
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }
function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function getMostFrequentTag(events) {
  const tagCounts = {};
  for (const event of events) {
    if (event.cascadeTags && Array.isArray(event.cascadeTags)) {
      for (const tag of event.cascadeTags) { tagCounts[tag] = (tagCounts[tag] || 0) + 1; }
    }
  }
  let maxTag = null, maxCount = 0;
  for (const [tag, count] of Object.entries(tagCounts)) { if (count > maxCount) { maxCount = count; maxTag = tag; } }
  return maxTag;
}

function getMostIntenseEvent(events) {
  let best = null, bestIntensity = -1;
  for (const event of events) { const intensity = event.intensity || event.emotionalIntensity || 0; if (intensity > bestIntensity) { bestIntensity = intensity; best = event; } }
  return best;
}

function getDefiningRelationship(events) {
  let best = null, bestScore = -1;
  for (const event of events) {
    if (event.relationship && event.relationshipSignificance) {
      const score = event.relationshipSignificance + (event.intensity || 0) * 0.5;
      if (score > bestScore) { bestScore = score; best = event; }
    }
  }
  return best;
}

function isViolentDeath(deathEvent) {
  if (!deathEvent) return false;
  const cause = (deathEvent.cause || deathEvent.type || deathEvent.category || deathEvent.title || '').toLowerCase();
  return ['murder','kill','stab','shoot','crash','accident','fall','drown','burn','fire','war','battle','fight','attack','poison','execution','suicide','homicide','violence','blood','wound','injury','fatal','trauma','predator','battlefield','arrow','cannon','plague','fever','rival','hanging','shipwreck','overdose','climate','drone','weapon','malfunction','purge','rejection'].some(kw => cause.includes(kw));
}

function isPeacefulDeath(deathEvent) {
  if (!deathEvent) return false;
  const cause = (deathEvent.cause || deathEvent.type || deathEvent.category || deathEvent.title || '').toLowerCase();
  return ['old age','natural','peaceful','sleep','slept','passed','quiet','gentle','illness','disease','cancer','heart','organ failure','time','decline','cold','stroke','hospital','gives out'].some(kw => cause.includes(kw));
}

function getRelationshipType(event) {
  if (!event || !event.relationship) return 'stranger';
  const rel = (event.relationship.type || event.relationship.role || event.relationship || '').toLowerCase();
  if (['lover','partner','spouse','wife','husband','romantic'].some(k => rel.includes(k))) return 'lover';
  if (['family','parent','child','mother','father','son','daughter','sibling','brother','sister','relative'].some(k => rel.includes(k))) return 'family';
  if (['friend','best friend','companion','ally','buddy','pal'].some(k => rel.includes(k))) return 'friend';
  if (['rival','enemy','opponent','adversary','competitor','nemesis'].some(k => rel.includes(k))) return 'rival';
  return 'stranger';
}

function getEmotionCategory(tag) {
  if (!tag) return 'wonder';
  const t = tag.toLowerCase();
  if (['grief','sadness','sorrow','mourning','loss','despair','melancholy'].some(k => t.includes(k))) return 'grief';
  if (['joy','happiness','bliss','euphoria','delight','ecstasy','contentment'].some(k => t.includes(k))) return 'joy';
  if (['fear','terror','dread','anxiety','panic','horror','phobia'].some(k => t.includes(k))) return 'fear';
  if (['love','affection','devotion','passion','tenderness','adoration','romance'].some(k => t.includes(k))) return 'love';
  if (['anger','rage','fury','wrath','resentment','bitterness','hostility'].some(k => t.includes(k))) return 'anger';
  return 'wonder';
}

function getEventCategory(event) {
  if (!event) return 'revelation';
  const cat = (event.category || event.type || event.name || '').toLowerCase();
  if (['birth','born','arrival','entry'].some(k => cat.includes(k))) return 'birth';
  if (['comingofage','coming-of-age','coming of age','adolescence','puberty','maturity'].some(k => cat.includes(k))) return 'comingOfAge';
  if (['achievement','success','victory','accomplishment','triumph','award','recognition'].some(k => cat.includes(k))) return 'achievement';
  if (['loss','death','grief','mourning','bereavement'].some(k => cat.includes(k))) return 'loss';
  if (['betrayal','treachery','deception','lie','backstab'].some(k => cat.includes(k))) return 'betrayal';
  return 'revelation';
}

function createFragment(type, value, strength, origin, cascadeTags, isAnchor) {
  if (strength < 0.15) strength = 0.15 + Math.random() * 0.1;
  return { id: fragGenerateId(), type, value, strength: clamp(strength, 0.0, 1.0), origin, isAnchor: isAnchor || false, cascadeTags: cascadeTags || [] };
}

function extractDeathFragment(deathEvent, soulState, resourceBonus = 0) {
  if (!deathEvent) return null;
  const violent = isViolentDeath(deathEvent);
  const peaceful = isPeacefulDeath(deathEvent);
  let templatePool, baseStrength;
  if (violent) { templatePool = DEATH_TEMPLATES.violent.pool; baseStrength = 0.6 + Math.random() * 0.3 + resourceBonus * 0.1; }
  else if (peaceful) { templatePool = DEATH_TEMPLATES.peaceful.pool; baseStrength = 0.45 + Math.random() * 0.25 + resourceBonus * 0.1; }
  else { templatePool = DEATH_TEMPLATES.peaceful.pool; baseStrength = 0.35 + Math.random() * 0.25 + resourceBonus * 0.1; }
  const value = pickRandom(templatePool);
  const origin = { lifeId: soulState.id || `life_${soulState.livesLived}`, eventId: deathEvent.id || 'death_event', era: deathEvent.era || 'UNKNOWN', age: deathEvent.age || soulState.totalYearsLived || 0 };
  return createFragment(violent ? 'fear' : 'tone', value, clamp(baseStrength, 0, 1), origin, deathEvent.cascadeTags || [], false);
}

function extractRelationshipFragment(lifeEvents, soulState, resourceBonus = 0) {
  const relEvent = getDefiningRelationship(lifeEvents);
  if (!relEvent) return null;
  const relType = getRelationshipType(relEvent);
  const templatePool = RELATIONSHIP_TEMPLATES[relType].pool;
  const value = pickRandom(templatePool);
  const significance = relEvent.relationshipSignificance || 0.5;
  const baseStrength = clamp(0.3 + significance * 0.5 + Math.random() * 0.2 + resourceBonus * 0.15, 0.0, 1.0);
  const origin = { lifeId: soulState.id || `life_${soulState.livesLived}`, eventId: relEvent.id || 'relationship_event', era: relEvent.era || 'UNKNOWN', age: relEvent.age || 0 };
  return createFragment('love', value, baseStrength, origin, relEvent.cascadeTags || [], false);
}

function extractEmotionalTagFragment(lifeEvents, soulState, resourceBonus = 0) {
  const dominantTag = getMostFrequentTag(lifeEvents);
  if (!dominantTag) return null;
  const emotionCategory = getEmotionCategory(dominantTag);
  const templatePool = EMOTIONAL_TAG_TEMPLATES[emotionCategory].pool;
  const value = pickRandom(templatePool);
  const tagCount = lifeEvents.reduce((sum, e) => sum + ((e.cascadeTags || []).filter(t => t.toLowerCase() === dominantTag.toLowerCase()).length), 0);
  const baseStrength = clamp(0.2 + tagCount * 0.05 + Math.random() * 0.2 + resourceBonus * 0.15, 0.0, 1.0);
  const mostIntense = getMostIntenseEvent(lifeEvents);
  const origin = { lifeId: soulState.id || `life_${soulState.livesLived}`, eventId: mostIntense ? mostIntense.id : 'emotional_peak', era: mostIntense ? mostIntense.era : 'UNKNOWN', age: mostIntense ? mostIntense.age : 0 };
  return createFragment(EMOTIONAL_TAG_TEMPLATES[emotionCategory].type, value, baseStrength, origin, [dominantTag], false);
}

function extractMemorableEventFragment(lifeEvents, soulState, resourceBonus = 0) {
  const memorable = getMostIntenseEvent(lifeEvents);
  if (!memorable) return null;
  const eventCategory = getEventCategory(memorable);
  const templatePool = MEMORABLE_EVENT_TEMPLATES[eventCategory].pool;
  const value = pickRandom(templatePool);
  const intensity = memorable.intensity || memorable.emotionalIntensity || 0.5;
  const baseStrength = clamp(0.3 + intensity * 0.4 + Math.random() * 0.2 + resourceBonus * 0.15, 0.0, 1.0);
  const origin = { lifeId: soulState.id || `life_${soulState.livesLived}`, eventId: memorable.id || 'memorable_event', era: memorable.era || 'UNKNOWN', age: memorable.age || 0 };
  return createFragment(MEMORABLE_EVENT_TEMPLATES[eventCategory].type, value, baseStrength, origin, memorable.cascadeTags || [], false);
}

function extractWhisperFragment(soulState) {
  const template = pickRandom(WHISPER_TEMPLATES);
  const origin = { lifeId: soulState.id || `life_${soulState.livesLived}`, eventId: 'whisper', era: 'UNKNOWN', age: soulState.totalYearsLived || 0 };
  return createFragment(template.type, template.value, 0.1 + Math.random() * 0.2, origin, [], false);
}

export function extractFragments(lifeEvents, deathEvent, soulState, resourceBonus = 0) {
  const newFragments = [];
  const deathFragment = extractDeathFragment(deathEvent, soulState, resourceBonus);
  if (deathFragment) newFragments.push(deathFragment);
  const relationshipFragment = extractRelationshipFragment(lifeEvents, soulState, resourceBonus);
  if (relationshipFragment) newFragments.push(relationshipFragment);
  const emotionalTagFragment = extractEmotionalTagFragment(lifeEvents, soulState, resourceBonus);
  if (emotionalTagFragment) newFragments.push(emotionalTagFragment);
  const memorableFragment = extractMemorableEventFragment(lifeEvents, soulState, resourceBonus);
  if (memorableFragment) newFragments.push(memorableFragment);
  if (Math.random() < WHISPER_CHANCE) { const whisper = extractWhisperFragment(soulState); if (whisper) newFragments.push(whisper); }
  return { newFragments };
}

function mergeFragment(soulState, newFragment) {
  const existing = soulState.fragments.find(f => f.type === newFragment.type && f.value === newFragment.value);
  if (existing) {
    const boost = 0.1 + Math.random() * 0.2;
    existing.strength = clamp(existing.strength + boost, 0.0, 1.0);
    if (newFragment.strength > existing.strength && !existing.isAnchor) { existing.strength = newFragment.strength; existing.origin = newFragment.origin; }
    if (newFragment.cascadeTags && newFragment.cascadeTags.length > 0) { for (const tag of newFragment.cascadeTags) { if (!existing.cascadeTags.includes(tag)) existing.cascadeTags.push(tag); } }
    return existing;
  }
  soulState.fragments.push(newFragment);
  return newFragment;
}

function evaluateAnchors(soulState) {
  const currentAnchors = soulState.fragments.filter(f => f.isAnchor);
  if (currentAnchors.length >= MAX_ANCHORS) return;
  const recurrenceMap = {};
  for (const fragment of soulState.fragments) {
    const key = `${fragment.type}:${fragment.value}`;
    if (!recurrenceMap[key]) recurrenceMap[key] = { fragment, count: 1, origins: [fragment.origin] };
    else { recurrenceMap[key].count += 1; recurrenceMap[key].origins.push(fragment.origin); }
  }
  for (const [key, data] of Object.entries(recurrenceMap)) {
    if (data.count >= ANCHOR_RECURRENCE_THRESHOLD && !data.fragment.isAnchor) {
      if (currentAnchors.length >= MAX_ANCHORS) break;
      data.fragment.isAnchor = true;
      data.fragment.strength = clamp(data.fragment.strength + 0.15, 0.0, 1.0);
      currentAnchors.push(data.fragment);
    }
  }
  soulState.anchors = soulState.fragments.filter(f => f.isAnchor);
}

function checkEraUnlocks(soulState) {
  const totalFragments = soulState.fragments.length;
  const unlocked = new Set(soulState.unlockedEras || ['ANCIENT', 'MEDIEVAL']);
  for (const { threshold, era } of ERA_UNLOCK_THRESHOLDS) { if (totalFragments >= threshold && !unlocked.has(era)) unlocked.add(era); }
  soulState.unlockedEras = Array.from(unlocked);
}

export function applyFragmentEffects(soulState, fragments) {
  if (!soulState.fragments) soulState.fragments = [];
  if (!soulState.anchors) soulState.anchors = [];
  if (!soulState.unlockedEras) soulState.unlockedEras = ['ANCIENT', 'MEDIEVAL'];
  if (!soulState.metaStats) soulState.metaStats = { totalDeaths: 0, violentDeaths: 0, peacefulDeaths: 0, lovesLost: 0, childrenBorn: 0 };
  for (const fragment of fragments) mergeFragment(soulState, fragment);
  evaluateAnchors(soulState);
  checkEraUnlocks(soulState);
  soulState.livesLived = (soulState.livesLived || 0) + 1;
}

export function createSoulState(id) {
  return {
    id: id || `soul_${Date.now()}`,
    livesLived: 0,
    totalYearsLived: 0,
    fragments: [],
    anchors: [],
    unlockedEras: ['ANCIENT', 'MEDIEVAL'],
    achievementsUnlocked: [],
    achievementNotifications: [],
    metaStats: { totalDeaths: 0, violentDeaths: 0, peacefulDeaths: 0, lovesLost: 0, childrenBorn: 0, crisesSurvived: 0, peaksSurvived: 0, memoryBleeds: 0, resonancePairs: 0 },
    bonusFragmentSlots: 0,
    specialUnlocks: {},
  };
}

// ── Roll System ──
export const ERAS = {
  ANCIENT: { id: 'ANCIENT', label: 'Ancient', yearRange: [-3000, 499], eventSignature: 'The gods are real here, and they are cruel.', locationPool: [{ region: 'Mesopotamia', city: 'Uruk', country: 'Sumer', weight: 12 },{ region: 'Nile Valley', city: 'Memphis', country: 'Egypt', weight: 14 },{ region: 'Aegean', city: 'Athens', country: 'Greece', weight: 13 },{ region: 'Italian Peninsula', city: 'Rome', country: 'Roman Republic/Empire', weight: 15 },{ region: 'Persian Plateau', city: 'Persepolis', country: 'Achaemenid Persia', weight: 9 }], firstNamePool: { male: [{ name: 'Gilgamesh', weight: 3 },{ name: 'Ramses', weight: 4 },{ name: 'Alexander', weight: 4 },{ name: 'Julius', weight: 4 },{ name: 'Marcus', weight: 3 },{ name: 'Constantine', weight: 3 },{ name: 'Ashoka', weight: 3 },{ name: 'Attila', weight: 3 }], female: [{ name: 'Nefertiti', weight: 4 },{ name: 'Cleopatra', weight: 4 },{ name: 'Hatshepsut', weight: 3 },{ name: 'Helen', weight: 3 },{ name: 'Sappho', weight: 3 },{ name: 'Zenobia', weight: 2 },{ name: 'Boudicca', weight: 3 }] }, lastNamePool: [{ name: 'of Rome', weight: 5 },{ name: 'of Athens', weight: 4 },{ name: 'of Babylon', weight: 3 },{ name: 'the Great', weight: 2 },{ name: '', weight: 10 }], bodyConditions: [{ condition: 'robust', weight: 15 },{ condition: 'healthy', weight: 55 },{ condition: 'sickly', weight: 20 },{ condition: 'disabled', weight: 10 }], socialClasses: [{ cls: 'slave', weight: 25 },{ cls: 'peasant', weight: 35 },{ cls: 'artisan', weight: 12 },{ cls: 'merchant', weight: 10 },{ cls: 'soldier', weight: 8 },{ cls: 'noble', weight: 4 },{ cls: 'ruler', weight: 1 }] },
  MEDIEVAL: { id: 'MEDIEVAL', label: 'Medieval', yearRange: [500, 1499], eventSignature: 'The plague is always somewhere. Faith is the only shield.', locationPool: [{ region: 'British Isles', city: 'London', country: 'England', weight: 12 },{ region: 'Frankish Lands', city: 'Paris', country: 'France', weight: 13 },{ region: 'Italian Peninsula', city: 'Venice', country: 'Venetian Republic', weight: 11 },{ region: 'Byzantine', city: 'Constantinople', country: 'Byzantine Empire', weight: 12 },{ region: 'Middle East', city: 'Baghdad', country: 'Abbasid Caliphate', weight: 10 },{ region: 'East Asia', city: "Chang'an", country: 'Tang China', weight: 10 }], firstNamePool: { male: [{ name: 'William', weight: 5 },{ name: 'Henry', weight: 5 },{ name: 'John', weight: 5 },{ name: 'Robert', weight: 5 },{ name: 'Louis', weight: 4 },{ name: 'Charles', weight: 4 },{ name: 'Saladin', weight: 3 },{ name: 'Ali', weight: 3 }], female: [{ name: 'Eleanor', weight: 4 },{ name: 'Isabella', weight: 4 },{ name: 'Margaret', weight: 4 },{ name: 'Mary', weight: 5 },{ name: 'Fatima', weight: 3 },{ name: 'Mariam', weight: 3 }] }, lastNamePool: [{ name: 'of York', weight: 3 },{ name: 'of Normandy', weight: 3 },{ name: 'Smith', weight: 4 },{ name: 'Taylor', weight: 3 },{ name: '', weight: 10 }], bodyConditions: [{ condition: 'robust', weight: 12 },{ condition: 'healthy', weight: 50 },{ condition: 'sickly', weight: 25 },{ condition: 'disabled', weight: 13 }], socialClasses: [{ cls: 'serf', weight: 35 },{ cls: 'peasant', weight: 20 },{ cls: 'artisan', weight: 12 },{ cls: 'merchant', weight: 10 },{ cls: 'knight', weight: 7 },{ cls: 'clergy', weight: 8 },{ cls: 'noble', weight: 3 }] },
  EARLY_MODERN: { id: 'EARLY_MODERN', label: 'Early Modern', yearRange: [1500, 1849], eventSignature: 'The world is being mapped. Old gods die, new machines are born.', locationPool: [{ region: 'British Isles', city: 'London', country: 'England/Britain', weight: 14 },{ region: 'Frankish Lands', city: 'Paris', country: 'France', weight: 13 },{ region: 'Ottoman', city: 'Istanbul', country: 'Ottoman Empire', weight: 12 },{ region: 'Low Countries', city: 'Amsterdam', country: 'Dutch Republic', weight: 10 },{ region: 'East Asia', city: 'Beijing', country: 'Ming/Qing China', weight: 10 },{ region: 'East Asia', city: 'Edo', country: 'Tokugawa Japan', weight: 9 }], firstNamePool: { male: [{ name: 'William', weight: 5 },{ name: 'John', weight: 5 },{ name: 'George', weight: 4 },{ name: 'Charles', weight: 4 },{ name: 'Louis', weight: 3 },{ name: 'Napoleon', weight: 3 },{ name: 'Peter', weight: 3 }], female: [{ name: 'Elizabeth', weight: 5 },{ name: 'Mary', weight: 4 },{ name: 'Catherine', weight: 4 },{ name: 'Maria', weight: 4 },{ name: 'Marie', weight: 4 },{ name: 'Charlotte', weight: 3 }] }, lastNamePool: [{ name: 'Smith', weight: 4 },{ name: 'Johnson', weight: 3 },{ name: 'Müller', weight: 3 },{ name: 'Schmidt', weight: 3 },{ name: 'Rossi', weight: 2 },{ name: '', weight: 5 }], bodyConditions: [{ condition: 'robust', weight: 14 },{ condition: 'healthy', weight: 53 },{ condition: 'sickly', weight: 22 },{ condition: 'disabled', weight: 11 }], socialClasses: [{ cls: 'peasant', weight: 25 },{ cls: 'laborer', weight: 18 },{ cls: 'artisan', weight: 14 },{ cls: 'merchant', weight: 13 },{ cls: 'soldier', weight: 8 },{ cls: 'aristocrat', weight: 5 }] },
  INDUSTRIAL: { id: 'INDUSTRIAL', label: 'Industrial', yearRange: [1850, 1949], eventSignature: 'Smoke fills the sky. The machines are hungry and so is war.', locationPool: [{ region: 'British Isles', city: 'London', country: 'United Kingdom', weight: 14 },{ region: 'Germanic Lands', city: 'Berlin', country: 'Germany', weight: 11 },{ region: 'Americas', city: 'New York', country: 'United States', weight: 13 },{ region: 'Americas', city: 'Chicago', country: 'United States', weight: 9 },{ region: 'East Asia', city: 'Tokyo', country: 'Japan', weight: 10 },{ region: 'East Asia', city: 'Shanghai', country: 'China', weight: 8 }], firstNamePool: { male: [{ name: 'John', weight: 5 },{ name: 'William', weight: 5 },{ name: 'James', weight: 4 },{ name: 'George', weight: 4 },{ name: 'Robert', weight: 4 },{ name: 'Harry', weight: 3 },{ name: 'Jack', weight: 3 }], female: [{ name: 'Mary', weight: 5 },{ name: 'Elizabeth', weight: 4 },{ name: 'Margaret', weight: 4 },{ name: 'Alice', weight: 3 },{ name: 'Emma', weight: 3 },{ name: 'Rose', weight: 3 }] }, lastNamePool: [{ name: 'Smith', weight: 5 },{ name: 'Johnson', weight: 4 },{ name: 'Williams', weight: 4 },{ name: 'Brown', weight: 4 },{ name: 'Jones', weight: 4 },{ name: 'Müller', weight: 3 }], bodyConditions: [{ condition: 'robust', weight: 13 },{ condition: 'healthy', weight: 52 },{ condition: 'sickly', weight: 23 },{ condition: 'disabled', weight: 12 }], socialClasses: [{ cls: 'factory worker', weight: 22 },{ cls: 'laborer', weight: 15 },{ cls: 'farmer', weight: 12 },{ cls: 'merchant', weight: 10 },{ cls: 'clerk', weight: 8 },{ cls: 'soldier', weight: 8 }] },
  MODERN: { id: 'MODERN', label: 'Modern', yearRange: [1950, 2019], eventSignature: 'You live longer. You die alone. The screens watch you back.', locationPool: [{ region: 'North America', city: 'New York', country: 'United States', weight: 12 },{ region: 'North America', city: 'Los Angeles', country: 'United States', weight: 10 },{ region: 'Europe', city: 'London', country: 'United Kingdom', weight: 10 },{ region: 'Europe', city: 'Paris', country: 'France', weight: 9 },{ region: 'Asia', city: 'Tokyo', country: 'Japan', weight: 10 },{ region: 'Asia', city: 'Shanghai', country: 'China', weight: 9 }], firstNamePool: { male: [{ name: 'James', weight: 5 },{ name: 'Michael', weight: 5 },{ name: 'John', weight: 4 },{ name: 'Robert', weight: 4 },{ name: 'William', weight: 4 },{ name: 'Daniel', weight: 4 },{ name: 'Matthew', weight: 4 }], female: [{ name: 'Mary', weight: 4 },{ name: 'Jennifer', weight: 4 },{ name: 'Elizabeth', weight: 4 },{ name: 'Jessica', weight: 4 },{ name: 'Sarah', weight: 4 },{ name: 'Emily', weight: 4 },{ name: 'Emma', weight: 4 }] }, lastNamePool: [{ name: 'Smith', weight: 4 },{ name: 'Johnson', weight: 4 },{ name: 'Williams', weight: 4 },{ name: 'Brown', weight: 4 },{ name: 'Garcia', weight: 4 },{ name: 'Lee', weight: 4 },{ name: 'Wang', weight: 4 }], bodyConditions: [{ condition: 'robust', weight: 15 },{ condition: 'healthy', weight: 55 },{ condition: 'sickly', weight: 20 },{ condition: 'disabled', weight: 10 }], socialClasses: [{ cls: 'working class', weight: 22 },{ cls: 'middle class', weight: 25 },{ cls: 'service worker', weight: 15 },{ cls: 'professional', weight: 12 },{ cls: 'technician', weight: 8 }] },
  NEAR_FUTURE: { id: 'NEAR_FUTURE', label: 'Near Future', yearRange: [2020, 2069], eventSignature: 'The climate is shifting. The algorithms decide. You adapt or break.', locationPool: [{ region: 'North America', city: 'New York', country: 'United States', weight: 10 },{ region: 'Asia', city: 'Shanghai', country: 'China', weight: 9 },{ region: 'Europe', city: 'London', country: 'United Kingdom', weight: 8 },{ region: 'Asia', city: 'Tokyo', country: 'Japan', weight: 8 },{ region: 'Africa', city: 'Lagos', country: 'Nigeria', weight: 7 }], firstNamePool: { male: [{ name: 'Liam', weight: 5 },{ name: 'Noah', weight: 4 },{ name: 'Oliver', weight: 4 },{ name: 'Kai', weight: 3 },{ name: 'Mateo', weight: 3 },{ name: 'Leo', weight: 3 }], female: [{ name: 'Olivia', weight: 5 },{ name: 'Emma', weight: 4 },{ name: 'Charlotte', weight: 4 },{ name: 'Luna', weight: 3 },{ name: 'Maya', weight: 3 },{ name: 'Aria', weight: 3 }] }, lastNamePool: [{ name: 'Smith', weight: 3 },{ name: 'Garcia', weight: 3 },{ name: 'Chen', weight: 4 },{ name: 'Kim', weight: 3 },{ name: 'Singh', weight: 3 }], bodyConditions: [{ condition: 'enhanced', weight: 8 },{ condition: 'robust', weight: 18 },{ condition: 'healthy', weight: 45 },{ condition: 'sickly', weight: 18 },{ condition: 'disabled', weight: 11 }], socialClasses: [{ cls: 'precariat', weight: 18 },{ cls: 'gig worker', weight: 15 },{ cls: 'knowledge worker', weight: 15 },{ cls: 'technician', weight: 12 },{ cls: 'creative', weight: 8 }] },
  FAR_FUTURE: { id: 'FAR_FUTURE', label: 'Far Future', yearRange: [2070, 2200], eventSignature: 'Death is optional now. But meaning is not.', locationPool: [{ region: 'Earth', city: 'Neo-Tokyo', country: 'Japanese Federation', weight: 8 },{ region: 'Earth', city: 'Shanghai Arcology', country: 'Asian Coalition', weight: 8 },{ region: 'Orbital', city: 'L5 Stanford Torus', country: 'Orbital Habitats', weight: 6 },{ region: 'Martian', city: 'Olympus Mons Colony', country: 'Mars Republic', weight: 5 }], firstNamePool: { male: [{ name: 'Kai', weight: 4 },{ name: 'Neo', weight: 3 },{ name: 'Zion', weight: 3 },{ name: 'Atlas', weight: 3 },{ name: 'Orion', weight: 3 }], female: [{ name: 'Nova', weight: 4 },{ name: 'Luna', weight: 3 },{ name: 'Aurora', weight: 3 },{ name: 'Iris', weight: 3 },{ name: 'Lyra', weight: 3 }] }, lastNamePool: [{ name: 'of Earth', weight: 3 },{ name: 'of Mars', weight: 3 },{ name: 'of the Belt', weight: 3 },{ name: 'Prime', weight: 2 },{ name: '', weight: 10 }], bodyConditions: [{ condition: 'enhanced', weight: 25 },{ condition: 'synthetic', weight: 10 },{ condition: 'robust', weight: 20 },{ condition: 'healthy', weight: 25 },{ condition: 'sickly', weight: 10 }], socialClasses: [{ cls: 'posthuman', weight: 15 },{ cls: 'enhanced citizen', weight: 15 },{ cls: 'baseline human', weight: 12 },{ cls: 'AI construct', weight: 10 },{ cls: 'synthetic worker', weight: 10 }] },
};

const ERA_ORDER = ['ANCIENT','MEDIEVAL','EARLY_MODERN','INDUSTRIAL','MODERN','NEAR_FUTURE','FAR_FUTURE'];

function weightedRandom(items) {
  if (items.length === 0) return null;
  if (items.length === 1) return items[0];
  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
  let random = Math.random() * totalWeight;
  for (const item of items) { random -= (item.weight || 1); if (random <= 0) return item; }
  return items[items.length - 1];
}

function getUnlockedEras(fragmentCount) {
  if (fragmentCount >= 10) return ERA_ORDER.slice();
  const unlockedCount = Math.max(2, Math.min(fragmentCount + 2, ERA_ORDER.length));
  return ERA_ORDER.slice(0, unlockedCount);
}

function buildEraWeights(fragmentCount) {
  const unlocked = getUnlockedEras(fragmentCount);
  const weights = [];
  for (const eraId of ERA_ORDER) {
    if (!unlocked.includes(eraId)) continue;
    const eraIndex = ERA_ORDER.indexOf(eraId);
    let weight;
    if (fragmentCount === 0) { if (eraId === 'ANCIENT') weight = 70; else if (eraId === 'MEDIEVAL') weight = 25; else if (eraId === 'EARLY_MODERN') weight = 5; else weight = 0; }
    else if (fragmentCount < 5) { weight = Math.max(1, 20 - eraIndex * 4); }
    else if (fragmentCount < 10) { const midPoint = Math.floor(ERA_ORDER.length / 2); weight = Math.max(1, 10 - Math.abs(eraIndex - midPoint) * 2); }
    else { weight = 10; }
    if (weight > 0) weights.push({ eraId, weight });
  }
  return weights;
}

function generateName(era, genderPresentation) {
  const eraData = ERAS[era];
  if (!eraData) return { firstName: 'Unknown', lastName: '' };
  let poolKey = genderPresentation === 'female' ? 'female' : 'male';
  const firstNamePool = eraData.firstNamePool[poolKey] || eraData.firstNamePool.male;
  const firstNameEntry = weightedRandom(firstNamePool);
  const lastNameEntry = weightedRandom(eraData.lastNamePool);
  return { firstName: firstNameEntry ? firstNameEntry.name : 'Unknown', lastName: lastNameEntry ? lastNameEntry.name : '' };
}

function generateBody(era) {
  const eraData = ERAS[era];
  if (!eraData) return { health: 'healthy', socialClass: 'unknown' };
  return { health: (weightedRandom(eraData.bodyConditions) || {}).condition || 'healthy', socialClass: (weightedRandom(eraData.socialClasses) || {}).cls || 'unknown' };
}

function generateLocation(era) {
  const eraData = ERAS[era];
  if (!eraData || eraData.locationPool.length === 0) return { city: 'Unknown', region: 'Unknown', country: 'Unknown' };
  const location = weightedRandom(eraData.locationPool);
  return { city: location.city, region: location.region, country: location.country };
}

function generateYear(era) {
  const eraData = ERAS[era];
  if (!eraData) return 2000;
  const [min, max] = eraData.yearRange;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollSoulLife(soulState) {
  const fragmentCount = soulState.fragments ? soulState.fragments.length : 0;
  const eraWeights = buildEraWeights(fragmentCount);
  const eraEntry = weightedRandom(eraWeights);
  const era = eraEntry ? eraEntry.eraId : 'ANCIENT';
  const year = generateYear(era);
  const location = generateLocation(era);
  const genderOptions = ['male','female','ambiguous','multiple'];
  const genderWeights = [40, 40, 12, 8];
  let genderRandom = Math.random() * 100, genderPresentation = 'male', cumulative = 0;
  for (let i = 0; i < genderOptions.length; i++) { cumulative += genderWeights[i]; if (genderRandom <= cumulative) { genderPresentation = genderOptions[i]; break; } }
  const { firstName, lastName } = generateName(era, genderPresentation);
  const fullName = lastName ? `${firstName} ${lastName}` : firstName;
  const body = generateBody(era);
  return { life: { era, year, location, name: fullName, genderPresentation, health: body.health, socialClass: body.socialClass }, eraUnlocked: getUnlockedEras(fragmentCount).includes(era) };
}

function getEraSignature(era) { const eraData = ERAS[era]; return eraData ? eraData.eventSignature : 'The world turns without you.'; }

// ── Event Cascade ──
export const MORTALITY_CURVE = [
  { minAge: 0, maxAge: 0, rate: 5.6 },
  { minAge: 1, maxAge: 4, rate: 0.25 },
  { minAge: 5, maxAge: 14, rate: 0.11 },
  { minAge: 15, maxAge: 24, rate: 0.40 },
  { minAge: 25, maxAge: 34, rate: 0.50 },
  { minAge: 35, maxAge: 44, rate: 1.0 },
  { minAge: 45, maxAge: 54, rate: 2.0 },
  { minAge: 55, maxAge: 64, rate: 4.0 },
  { minAge: 65, maxAge: 74, rate: 9.0 },
  { minAge: 75, maxAge: 84, rate: 20.0 },
  { minAge: 85, maxAge: 94, rate: 45.0 },
  { minAge: 95, maxAge: Infinity, rate: 80.0 },
];

function getMortalityRate(age) {
  const bucket = MORTALITY_CURVE.find(b => age >= b.minAge && age <= b.maxAge);
  return bucket ? bucket.rate : 80.0;
}

export const LIFE_PHASES = {
  INFANT: { min: 0, max: 3 }, CHILD: { min: 4, max: 12 }, ADOLESCENT: { min: 13, max: 19 },
  YOUNG_ADULT: { min: 20, max: 39 }, MIDDLE_AGE: { min: 40, max: 64 }, SENIOR: { min: 65, max: 84 }, ANCIENT: { min: 85, max: Infinity },
};

function getLifePhase(age) {
  for (const [name, range] of Object.entries(LIFE_PHASES)) { if (age >= range.min && age <= range.max) return name; }
  return 'ANCIENT';
}

export const EVENT_POOLS = {
  PREHISTORIC: [
    { id: 'ph_01', triggerProbability: 0.12, phases: ['CHILD','ADOLESCENT','YOUNG_ADULT'], eras: ['PREHISTORIC'], category: 'violence', weight: 3, title: 'The predator at the tree line', description: 'Something watches from beyond the firelight. You keep the embers fed and don\'t sleep.', cascadeTags: ['dread','anchor'] },
    { id: 'ph_03', triggerProbability: 0.08, phases: ['INFANT','CHILD'], eras: ['PREHISTORIC'], category: 'body', weight: 4, title: 'Fever takes the little ones', description: 'The heat comes and doesn\'t leave. Someone presses wet bark to your forehead and sings.', cascadeTags: ['grief','numbness'] },
    { id: 'ph_04', triggerProbability: 0.06, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['PREHISTORIC'], category: 'mystery', weight: 2, title: 'The cave paintings', description: 'Deep in the rock someone has drawn animals that don\'t exist anymore. You touch the ochre and feel something shift.', cascadeTags: ['wonder','awe'] },
    { id: 'ph_05', triggerProbability: 0.07, phases: ['YOUNG_ADULT','MIDDLE_AGE','SENIOR'], eras: ['PREHISTORIC'], category: 'relationship', weight: 3, title: 'A bond forged in the hunt', description: 'You and another move together without speaking. After, you share the meat and don\'t look away.', cascadeTags: ['connection','tenderness'] },
    { id: 'ph_07', triggerProbability: 0.09, phases: ['MIDDLE_AGE','SENIOR','ANCIENT'], eras: ['PREHISTORIC'], category: 'circumstance', weight: 3, title: 'The elders\' fire', description: 'You sit with the ones who remember the last cold season. They speak in fragments. You try to hold it all.', cascadeTags: ['anchor','resignation'] },
    { id: 'ph_15', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['PREHISTORIC'], category: 'relationship', weight: 3, title: 'The chosen one', description: 'They look at you across the fire and you know. Not words — something older. You move closer.', cascadeTags: ['connection','awakening'] },
    { id: 'ph_21', triggerProbability: 0.06, phases: ['INFANT','CHILD'], eras: ['PREHISTORIC'], category: 'relationship', weight: 3, title: 'Carried on the back', description: 'You are small and the world is large and someone\'s shoulders are the only geography you know.', cascadeTags: ['tenderness','anchor'] },
    { id: 'ph_22', triggerProbability: 0.07, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['PREHISTORIC'], category: 'mystery', weight: 2, title: 'The bones that sang', description: 'You find a cache of painted bones arranged in a spiral. When you touch them, your hands remember something your mind lost.', cascadeTags: ['wonder','vertigo'] },
    { id: 'ph_23', triggerProbability: 0.05, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['PREHISTORIC'], category: 'violence', weight: 3, crisis: true, title: 'The raiding party returns', description: 'They come back with blood on their faces and something that used to be a person. You recognize the necklace they wear.', cascadeTags: ['dread','rage'], choices: ['intervene','pray','watch'] },
    { id: 'ph_24', triggerProbability: 0.08, phases: ['CHILD','ADOLESCENT'], eras: ['PREHISTORIC'], category: 'fortune', weight: 2, title: 'The berries that healed', description: 'You eat the red ones by mistake and spend three days seeing colors that don\'t have names. Then it passes.', cascadeTags: ['wonder','dissolution'] },
    { id: 'ph_25', triggerProbability: 0.06, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['PREHISTORIC'], category: 'relationship', weight: 3, title: 'The language before words', description: 'You communicate through gesture and posture and glance. It is more precise than any sentence you will ever speak.', cascadeTags: ['connection','grace'] },
    { id: 'ph_26', triggerProbability: 0.09, phases: ['MIDDLE_AGE','SENIOR','ANCIENT'], eras: ['PREHISTORIC'], category: 'body', weight: 4, title: 'The joint that never heals', description: 'It aches before rain and after exertion. The body keeps a calendar you cannot read.', cascadeTags: ['resignation','numbness'] },
    { id: 'ph_27', triggerProbability: 0.07, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['PREHISTORIC'], category: 'mystery', weight: 2, title: 'The dream that came true', description: 'You dream of fish falling from the sky. Three days later the stream runs silver with a catch no one expected.', cascadeTags: ['wonder','awe'] },
    { id: 'ph_28', triggerProbability: 0.08, phases: ['CHILD','ADOLESCENT'], eras: ['PREHISTORIC'], category: 'circumstance', weight: 3, title: 'The first frost', description: 'You watch your breath become visible and understand for the first time that air is a substance. Things end.', cascadeTags: ['wonder','grief'] },
    { id: 'ph_29', triggerProbability: 0.06, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['PREHISTORIC'], category: 'relationship', weight: 3, title: 'The naming', description: 'You give someone a name no one else uses. In the dark, they respond only to it. This is intimacy.', cascadeTags: ['tenderness','connection'] },
    { id: 'ph_30', triggerProbability: 0.05, phases: ['INFANT','CHILD'], eras: ['PREHISTORIC'], category: 'body', weight: 3, crisis: true, title: 'The birth of the twin', description: 'You emerge first. The second does not cry for a long time. The midwife works in silence.', cascadeTags: ['grief','numbness'], choices: ['intervene','pray','watch'] },
    { id: 'ph_31', triggerProbability: 0.04, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['PREHISTORIC'], category: 'mystery', landmark: true, title: 'The seeing stone', description: 'In a cave deeper than anyone goes, you find a crystal that shows you your own death. Not when. Not how. Just that it is yours.', cascadeTags: ['dread','vertigo'] },
    { id: 'ph_32', triggerProbability: 0.07, phases: ['CHILD','ADOLESCENT'], eras: ['PREHISTORIC'], category: 'violence', weight: 4, crisis: true, title: 'The territorial fight', description: 'Two groups, one water source. The negotiation fails. You see someone\'s eye get crushed into mud.', cascadeTags: ['rage','dread'], choices: ['intervene','pray','watch'] },
    { id: 'ph_33', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['PREHISTORIC'], category: 'circumstance', weight: 2, title: 'The migration', description: 'The group moves. You carry what you can and leave what you cannot. The landscape rearranges itself around your grief.', cascadeTags: ['resignation','anchor'] },
    { id: 'ph_34', triggerProbability: 0.06, phases: ['SENIOR','ANCIENT'], eras: ['PREHISTORIC'], category: 'body', weight: 2, title: 'The tooth falls', description: 'It comes out with the jerky you\'ve been chewing. You hold it in your palm and realize you are now the one who remembers things others have forgotten.', cascadeTags: ['resignation','grace'] },
    { id: 'ph_35', triggerProbability: 0.07, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['PREHISTORIC'], category: 'fortune', weight: 2, title: 'The fire that spreads', description: 'Lightning strikes and the dry grass catches. You run with the herd. The burn scar becomes new territory.', cascadeTags: ['vertigo','wonder'] },
    { id: 'ph_36', triggerProbability: 0.05, phases: ['INFANT','CHILD'], eras: ['PREHISTORIC'], category: 'relationship', weight: 3, title: 'The grandmother\'s stories', description: 'She tells you about the sky before the sky had holes. You don\'t believe her but you keep listening.', cascadeTags: ['wonder','anchor'] },
    { id: 'ph_37', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['PREHISTORIC'], category: 'relationship', weight: 3, crisis: true, title: 'The betrayal in the dark', description: 'Someone takes your share of the meat when you sleep. You know who. The group cannot function if you speak.', cascadeTags: ['rage','grief'], choices: ['intervene','pray','watch'] },
  ],
  ANCIENT: [
    { id: 'an_01', triggerProbability: 0.10, phases: ['CHILD','ADOLESCENT','YOUNG_ADULT'], eras: ['ANCIENT'], category: 'violence', weight: 4, intensity: 0.85, crisis: true, title: 'The conscription notice', description: 'The king\'s men come through the village with a list. Your name is on it. Your mother doesn\'t cry until they leave.', cascadeTags: ['dread','betrayal'], choices: ['intervene','pray','watch'] },
    { id: 'an_03', triggerProbability: 0.07, phases: ['INFANT','CHILD'], eras: ['ANCIENT'], category: 'body', weight: 4, title: 'The summer fever', description: 'It runs through the quarter like a rumor. You survive. The child next door doesn\'t.', cascadeTags: ['grief','numbness'] },
    { id: 'an_04', triggerProbability: 0.06, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['ANCIENT'], category: 'mystery', weight: 3, intensity: 0.75, crisis: true, title: 'The oracle\'s riddle', description: 'She speaks in a voice that isn\'t hers and the priests write it down. Later, you realize it was about you.', cascadeTags: ['wonder','disorientation'], choices: ['intervene','pray','watch'] },
    { id: 'an_05', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE','SENIOR'], eras: ['ANCIENT'], category: 'relationship', weight: 3, title: 'The arranged marriage', description: 'You meet them at the threshold. They are a stranger. You both pretend otherwise.', cascadeTags: ['disorientation','connection'] },
    { id: 'an_07', triggerProbability: 0.09, phases: ['MIDDLE_AGE','SENIOR','ANCIENT'], eras: ['ANCIENT'], category: 'circumstance', weight: 3, title: 'The library burns', description: 'You watch centuries of thought turn to smoke. Someone saves a scroll and hides it in their tunic.', cascadeTags: ['grief','rage'] },
    { id: 'an_10', triggerProbability: 0.10, phases: ['INFANT','CHILD','ADOLESCENT'], eras: ['ANCIENT'], category: 'violence', weight: 4, intensity: 0.85, crisis: true, title: 'The city falls', description: 'The walls don\'t hold. You learn what fire sounds like in a place where people used to live.', cascadeTags: ['dread','vertigo'], choices: ['intervene','pray','watch'] },
    { id: 'an_11', triggerProbability: 0.05, phases: ['SENIOR','ANCIENT'], eras: ['ANCIENT'], category: 'relationship', weight: 2, title: 'The grandchild\'s hand', description: 'It fits inside yours like a promise. You forget everything else for a moment.', cascadeTags: ['tenderness','grace'] },
    { id: 'an_15', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['ANCIENT'], category: 'relationship', weight: 3, title: 'The friendship forged in exile', description: 'You\'re both far from home and the shared foreignness is enough. You trust each other with everything.', cascadeTags: ['connection','anchor'] },
    { id: 'an_21', triggerProbability: 0.06, phases: ['INFANT','CHILD'], eras: ['ANCIENT'], category: 'relationship', weight: 3, title: 'The wet nurse', description: 'She is not your mother but her milk is. You learn the difference between blood and care much later.', cascadeTags: ['tenderness','anchor'] },
    { id: 'an_22', triggerProbability: 0.07, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['ANCIENT'], category: 'violence', weight: 4, crisis: true, title: 'The crucifixion', description: 'You pass the crosses on the road out. One of the bodies looks familiar. You keep walking.', cascadeTags: ['dread','vertigo'], choices: ['intervene','pray','watch'] },
    { id: 'an_23', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['ANCIENT'], category: 'fortune', weight: 2, title: 'The merchant\'s luck', description: 'The cargo survives the storm and sells for triple. You did nothing to earn this. You enjoy it anyway.', cascadeTags: ['grace','vertigo'] },
    { id: 'an_24', triggerProbability: 0.06, phases: ['CHILD','ADOLESCENT'], eras: ['ANCIENT'], category: 'mystery', weight: 2, title: 'The forbidden texts', description: 'You read what was hidden in the basement. The world does not look the same after.', cascadeTags: ['wonder','disorientation'] },
    { id: 'an_25', triggerProbability: 0.09, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['ANCIENT'], category: 'relationship', weight: 3, title: 'The patron\'s favor', description: 'Someone wealthy takes interest in your work. The coin is good. The attention is not.', cascadeTags: ['dread','connection'] },
    { id: 'an_26', triggerProbability: 0.07, phases: ['MIDDLE_AGE','SENIOR'], eras: ['ANCIENT'], category: 'body', weight: 3, title: 'The vision quest', description: 'Three days without water. You see things that may be gods or may be your brain cooking.', cascadeTags: ['vertigo','wonder'] },
    { id: 'an_27', triggerProbability: 0.08, phases: ['CHILD','ADOLESCENT'], eras: ['ANCIENT'], category: 'circumstance', weight: 3, crisis: true, title: 'The sacrifice', description: 'They ask for volunteers. No one volunteers. Someone must be chosen. You see your name in the priest\'s mouth.', cascadeTags: ['dread','rage'], choices: ['intervene','pray','watch'] },
    { id: 'an_28', triggerProbability: 0.05, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['ANCIENT'], category: 'relationship', landmark: true, signature: true, title: 'The great love', description: 'You meet someone who reshapes the architecture of your soul. Everything after is measured against this.', cascadeTags: ['love','awakening'] },
    { id: 'an_29', triggerProbability: 0.06, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['ANCIENT'], category: 'mystery', weight: 2, title: 'The eclipse', description: 'The sun vanishes in the middle of the day. You look up and feel genuinely afraid for the first time.', cascadeTags: ['dread','wonder'] },
    { id: 'an_30', triggerProbability: 0.09, phases: ['YOUNG_ADULT','MIDDLE_AGE','SENIOR'], eras: ['ANCIENT'], category: 'circumstance', weight: 3, title: 'The election', description: 'They make you a magistrate. You must now judge people you know. The first case is your cousin.', cascadeTags: ['vertigo','resignation'] },
    { id: 'an_31', triggerProbability: 0.07, phases: ['INFANT','CHILD'], eras: ['ANCIENT'], category: 'body', weight: 3, title: 'The crippled foot', description: 'You are born with a twist in your ankle. The world designs itself around your inability to keep up.', cascadeTags: ['resignation','numbness'] },
    { id: 'an_32', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['ANCIENT'], category: 'violence', weight: 4, crisis: true, title: 'The arena', description: 'They arm you and point you at someone. The crowd roars. You understand that your life is now a product.', cascadeTags: ['dread','vertigo'], choices: ['intervene','pray','watch'] },
    { id: 'an_33', triggerProbability: 0.06, phases: ['SENIOR','ANCIENT'], eras: ['ANCIENT'], category: 'relationship', weight: 2, title: 'The freed slave', description: 'You manumit one of your own. The law calls it progress. Your household calls it the end of things.', cascadeTags: ['connection','dread'] },
    { id: 'an_34', triggerProbability: 0.07, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['ANCIENT'], category: 'fortune', weight: 2, title: 'The inheritance', description: 'A relative dies and leaves you something that changes your rank. You did not know they knew you existed.', cascadeTags: ['vertigo','grace'] },
    { id: 'an_35', triggerProbability: 0.08, phases: ['CHILD','ADOLESCENT'], eras: ['ANCIENT'], category: 'relationship', weight: 3, title: 'The tutor', description: 'A slave teaches you everything your parents cannot. You become dependent on someone who owns nothing.', cascadeTags: ['connection','grief'] },
    { id: 'an_36', triggerProbability: 0.06, phases: ['MIDDLE_AGE','SENIOR'], eras: ['ANCIENT'], category: 'body', weight: 3, crisis: true, title: 'The plague ship', description: 'You are on a boat when the fever starts. They won\'t let you disembark. The sea becomes a coffin.', cascadeTags: ['dread','numbness'], choices: ['intervene','pray','watch'] },
    { id: 'an_37', triggerProbability: 0.05, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['ANCIENT'], category: 'mystery', weight: 2, title: 'The philosopher\'s error', description: 'You prove a theorem that overturns everything your teacher believed. You wish you hadn\'t.', cascadeTags: ['vertigo','grief'] },
  ],
  MEDIEVAL: [
    { id: 'md_01', triggerProbability: 0.12, phases: ['CHILD','ADOLESCENT','YOUNG_ADULT'], eras: ['MEDIEVAL'], category: 'body', weight: 5, intensity: 0.9, crisis: true, signature: true, title: 'The plague comes through your village', description: 'The boils appear on Tuesday. By Friday the priest stops ringing the bell. You count the living instead of the dead.', cascadeTags: ['grief','dread'], choices: ['intervene','pray','watch'] },
    { id: 'md_03', triggerProbability: 0.10, phases: ['MIDDLE_AGE','SENIOR'], eras: ['MEDIEVAL'], category: 'relationship', weight: 4, intensity: 0.8, crisis: true, title: 'Your child dies of fever', description: 'You hold them through the shaking and then the stillness. After, the house is too quiet for years.', cascadeTags: ['grief','numbness'], choices: ['intervene','pray','watch'] },
    { id: 'md_06', triggerProbability: 0.07, phases: ['CHILD','ADOLESCENT'], eras: ['MEDIEVAL'], category: 'circumstance', weight: 3, title: 'The apprenticeship begins', description: 'The blacksmith\'s shop is hot and loud and you are small. He doesn\'t coddle you. You learn to make things that last.', cascadeTags: ['anchor','triumph'] },
    { id: 'md_07', triggerProbability: 0.09, phases: ['YOUNG_ADULT','MIDDLE_AGE','SENIOR'], eras: ['MEDIEVAL'], category: 'violence', weight: 4, intensity: 0.8, crisis: true, title: 'The lord\'s tax collector', description: 'He takes what you can\'t spare and leaves a receipt you can\'t read. You hate him quietly and efficiently.', cascadeTags: ['rage','resignation'], choices: ['intervene','pray','watch'] },
    { id: 'md_10', triggerProbability: 0.10, phases: ['INFANT','CHILD','ADOLESCENT'], eras: ['MEDIEVAL'], category: 'violence', weight: 4, intensity: 0.85, crisis: true, title: 'The raiding party', description: 'They come at harvest and take what\'s ripe. You hide in the root cellar and listen to your life being carried away.', cascadeTags: ['dread','grief'], choices: ['intervene','pray','watch'] },
    { id: 'md_12', triggerProbability: 0.07, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MEDIEVAL'], category: 'fortune', weight: 2, title: 'The good harvest', description: 'The wheat stands tall and the rain held off. For once, the world cooperates. You store what you can and wait.', cascadeTags: ['grace','anchor'] },
    { id: 'md_15', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MEDIEVAL'], category: 'relationship', weight: 3, title: 'The pilgrimage companion', description: 'You walk for weeks together and learn the shape of their silence. At the shrine you pray for different things.', cascadeTags: ['connection','longing'] },
    { id: 'md_21', triggerProbability: 0.06, phases: ['INFANT','CHILD'], eras: ['MEDIEVAL'], category: 'relationship', weight: 3, title: 'The swaddling', description: 'Wrapped tight as a parcel, you can\'t move but you\'re warm. Someone hums and the world is small and safe.', cascadeTags: ['tenderness','anchor'] },
    { id: 'md_22', triggerProbability: 0.08, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['MEDIEVAL'], category: 'faith', weight: 3, title: 'The flagellant\'s march', description: 'They whip themselves through the streets begging God\'s mercy. You wonder who will save them from themselves.', cascadeTags: ['dread','wonder'] },
    { id: 'md_23', triggerProbability: 0.07, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MEDIEVAL'], category: 'circumstance', weight: 3, crisis: true, title: 'The trial by combat', description: 'They name you champion for someone else\'s crime. The accused watches from the tower. You pick up the sword.', cascadeTags: ['vertigo','rage'], choices: ['intervene','pray','watch'] },
    { id: 'md_24', triggerProbability: 0.06, phases: ['CHILD','ADOLESCENT'], eras: ['MEDIEVAL'], category: 'mystery', weight: 2, title: 'The heretic\'s manuscript', description: 'Hidden under a loose floorboard: a book that says everything the priest says is a lie. You memorize one page.', cascadeTags: ['wonder','dread'] },
    { id: 'md_25', triggerProbability: 0.09, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MEDIEVAL'], category: 'relationship', weight: 3, title: 'The secret wedding', description: 'You marry in secret because the church forbids it. The ceremony is brief. The consequences are long.', cascadeTags: ['connection','grief'] },
    { id: 'md_26', triggerProbability: 0.07, phases: ['MIDDLE_AGE','SENIOR'], eras: ['MEDIEVAL'], category: 'body', weight: 3, title: 'The tournament injury', description: 'You break a lance against someone\'s shield and hear your own arm snap. The crowd roars for the other man.', cascadeTags: ['vertigo','resignation'] },
    { id: 'md_27', triggerProbability: 0.08, phases: ['CHILD','ADOLESCENT'], eras: ['MEDIEVAL'], category: 'circumstance', weight: 3, title: 'The choir boy', description: 'Your voice reaches notes that make grown men weep. Then it changes and the gift goes somewhere you cannot follow.', cascadeTags: ['wonder','grief'] },
    { id: 'md_28', triggerProbability: 0.05, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MEDIEVAL'], category: 'relationship', landmark: true, signature: true, title: 'The love affair with the knight', description: 'He rides away after the campaign season and you never stop listening for hoofbeats. Some absences define a life.', cascadeTags: ['love','longing'] },
    { id: 'md_29', triggerProbability: 0.09, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['MEDIEVAL'], category: 'violence', weight: 4, crisis: true, title: 'The castle siege starvation', description: 'Month three. They talk about eating the horses. Then the dogs. Then someone suggests the unthinkable.', cascadeTags: ['dread','desperation'], choices: ['intervene','pray','watch'] },
    { id: 'md_30', triggerProbability: 0.06, phases: ['INFANT','CHILD'], eras: ['MEDIEVAL'], category: 'body', weight: 3, title: 'The clover maiden', description: 'You survive a sickness that takes three siblings. You become the one who stays. This becomes your identity.', cascadeTags: ['grief','anchor'] },
    { id: 'md_31', triggerProbability: 0.07, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MEDIEVAL'], category: 'fortune', weight: 2, title: 'The pardon', description: 'You are condemned and then pardoned by a lord who changes his mind about you. You live on borrowed time.', cascadeTags: ['vertigo','grace'] },
    { id: 'md_32', triggerProbability: 0.08, phases: ['SENIOR','ANCIENT'], eras: ['MEDIEVAL'], category: 'relationship', weight: 2, title: 'The will', description: 'You dictate how you want to be remembered. The priest writes it down. You sign with a shaking hand.', cascadeTags: ['resignation','grace'] },
    { id: 'md_33', triggerProbability: 0.06, phases: ['CHILD','ADOLESCENT'], eras: ['MEDIEVAL'], category: 'circumstance', weight: 3, title: 'The Jewish quarter', description: 'You play with children behind the wall. Their games are different. Their holidays make no sense. They are the first people who feel like strangers to you.', cascadeTags: ['dread','wonder'] },
    { id: 'md_34', triggerProbability: 0.07, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MEDIEVAL'], category: 'violence', weight: 4, crisis: true, title: 'The peasant revolt', description: 'You join because you are hungry and angry. The militia cuts everyone the same. You learn that justice has a price.', cascadeTags: ['rage','dread'], choices: ['intervene','pray','watch'] },
    { id: 'md_35', triggerProbability: 0.08, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['MEDIEVAL'], category: 'mystery', weight: 2, title: 'The leper\'s bell', description: 'You hear it before you see him. He is a reminder that your body is a temporary arrangement.', cascadeTags: ['dread','vertigo'] },
    { id: 'md_36', triggerProbability: 0.05, phases: ['MIDDLE_AGE','SENIOR'], eras: ['MEDIEVAL'], category: 'mystery', weight: 2, title: 'The alchemist\'s promise', description: 'He says he can turn lead to gold. You fund him for three years. He disappears on the night he claims success.', cascadeTags: ['vertigo','grief'] },
    { id: 'md_37', triggerProbability: 0.06, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MEDIEVAL'], category: 'relationship', weight: 3, title: 'The bastard child', description: 'You acknowledge them because you cannot deny them. Your legitimate children inherit your shame.', cascadeTags: ['grief','connection'] },
    { id: 'md_38', triggerProbability: 0.07, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['MEDIEVAL'], category: 'body', weight: 3, crisis: true, title: 'The tournament joust', description: 'The lance strikes your helm and you ride into darkness. You wake in a tent with blood in your eyes and someone else\'s voice in your head.', cascadeTags: ['vertigo','dread'], choices: ['intervene','pray','watch'] },
  ],
EARLY_MODERN: [
    { id: 'em_01', triggerProbability: 0.10, phases: ['CHILD','ADOLESCENT'], eras: ['EARLY_MODERN'], category: 'body', weight: 4, title: 'The smallpox marks', description: 'You survive but your face doesn\'t. The mirror becomes a negotiation. You learn to look people in the eye instead.', cascadeTags: ['grief','numbness'] },
    { id: 'em_02', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['EARLY_MODERN'], category: 'circumstance', weight: 3, title: 'The passage to the colonies', description: 'The ship is cramped and the water goes bad. You see land after eight weeks and cry for reasons you can\'t explain.', cascadeTags: ['vertigo','disorientation'] },
    { id: 'em_05', triggerProbability: 0.05, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['EARLY_MODERN'], category: 'mystery', weight: 2, title: 'The astronomer\'s telescope', description: 'You look through it and see that the moon has craters. Everything you were taught about perfection cracks a little.', cascadeTags: ['awe','disorientation'] },
    { id: 'em_07', triggerProbability: 0.09, phases: ['YOUNG_ADULT','MIDDLE_AGE','SENIOR'], eras: ['EARLY_MODERN'], category: 'violence', weight: 3, title: 'The witch trial', description: 'You sit in the gallery and watch a woman hang by a thread of accusation. No one speaks. The rope does the talking.', cascadeTags: ['betrayal','dread'] },
    { id: 'em_10', triggerProbability: 0.10, phases: ['INFANT','CHILD','ADOLESCENT'], eras: ['EARLY_MODERN'], category: 'violence', weight: 4, intensity: 0.85, crisis: true, title: 'The civil war comes home', description: 'Soldiers in your parlor. They take the silver and the horse and your father\'s dignity. You memorize their faces.', cascadeTags: ['rage','dread'], choices: ['intervene','pray','watch'] },
    { id: 'em_15', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['EARLY_MODERN'], category: 'relationship', weight: 3, title: 'The salon conversation', description: 'You argue about philosophy with people who read books you\'ve never heard of. You leave exhausted and alive.', cascadeTags: ['connection','awakening'] },
    { id: 'em_21', triggerProbability: 0.06, phases: ['INFANT','CHILD'], eras: ['EARLY_MODERN'], category: 'relationship', weight: 3, title: 'The nursemaid\'s song', description: 'She sings in a language you\'ll never learn and you fall asleep to the rhythm of a world you\'ll never see.', cascadeTags: ['tenderness','anchor'] },
    { id: 'em_22', triggerProbability: 0.08, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['EARLY_MODERN'], category: 'circumstance', weight: 3, crisis: true, title: 'The press gang', description: 'They grab you off the street and put you on a naval ship. The ocean doesn\'t care about your innocence.', cascadeTags: ['dread','vertigo'], choices: ['intervene','pray','watch'] },
    { id: 'em_23', triggerProbability: 0.07, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['EARLY_MODERN'], category: 'relationship', weight: 3, title: 'The mistress', description: 'You take one because your wife is convenient and your bloodline requires heirs. The heart follows where it shouldn\'t.', cascadeTags: ['grief','connection'] },
    { id: 'em_24', triggerProbability: 0.06, phases: ['CHILD','ADOLESCENT'], eras: ['EARLY_MODERN'], category: 'mystery', weight: 2, title: 'The automaton', description: 'A clockwork figure moves its hand to write a word you haven\'t spoken yet. The mechanism has no creator you can see.', cascadeTags: ['wonder','dread'] },
    { id: 'em_25', triggerProbability: 0.09, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['EARLY_MODERN'], category: 'faith', weight: 3, crisis: true, title: 'The inquisition', description: 'They ask you questions designed to have wrong answers. You learn what people will do to feel righteous.', cascadeTags: ['dread','rage'], choices: ['intervene','pray','watch'] },
    { id: 'em_26', triggerProbability: 0.07, phases: ['MIDDLE_AGE','SENIOR'], eras: ['EARLY_MODERN'], category: 'body', weight: 3, title: 'The gout', description: 'Your body becomes a map of everything you\'ve consumed. The pain is specific and judgmental.', cascadeTags: ['resignation','numbness'] },
    { id: 'em_27', triggerProbability: 0.05, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['EARLY_MODERN'], category: 'relationship', landmark: true, signature: true, title: 'The love of the spice merchant', description: 'You meet them across a counter full of cinnamon and cardamom. Everything after is a variation of this moment.', cascadeTags: ['love','awakening'] },
    { id: 'em_28', triggerProbability: 0.08, phases: ['CHILD','ADOLESCENT'], eras: ['EARLY_MODERN'], category: 'circumstance', weight: 3, title: 'The grammar school', description: 'Someone makes you conjugate Latin until you understand that language is a cage. You learn to appreciate the bars.', cascadeTags: ['wonder','resignation'] },
    { id: 'em_29', triggerProbability: 0.06, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['EARLY_MODERN'], category: 'violence', weight: 4, crisis: true, title: 'The slave market', description: 'You walk past the auction block and see someone\'s face go blank with a specific kind of terror you will carry forever.', cascadeTags: ['dread','vertigo'], choices: ['intervene','pray','watch'] },
    { id: 'em_30', triggerProbability: 0.07, phases: ['SENIOR','ANCIENT'], eras: ['EARLY_MODERN'], category: 'circumstance', weight: 2, title: 'The last will', description: 'You write it as the quill shakes. The lawyer pretends not to notice. Your legacy is a few pages of nervous handwriting.', cascadeTags: ['resignation','grace'] },
    { id: 'em_31', triggerProbability: 0.08, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['EARLY_MODERN'], category: 'fortune', weight: 2, title: 'The tobacco windfall', description: 'You plant the wrong crop and make a fortune anyway. The money feels like someone else\'s luck.', cascadeTags: ['vertigo','grace'] },
    { id: 'em_32', triggerProbability: 0.06, phases: ['INFANT','CHILD'], eras: ['EARLY_MODERN'], category: 'body', weight: 3, title: 'The blue小孩', description: 'You survive the fever that turns your skin blue for three weeks. The village calls you cursed. You stop being surprised.', cascadeTags: ['grief','anchor'] },
    { id: 'em_33', triggerProbability: 0.07, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['EARLY_MODERN'], category: 'mystery', weight: 2, title: 'The correspondence', description: 'A pen pal on another continent writes about your life before you live it. The letters arrive in order.', cascadeTags: ['wonder','vertigo'] },
    { id: 'em_34', triggerProbability: 0.08, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['EARLY_MODERN'], category: 'relationship', weight: 3, title: 'The foundling', description: 'You find a baby in your doorstep and choose to keep it. Your neighbors have opinions about this.', cascadeTags: ['tenderness','resignation'] },
    { id: 'em_35', triggerProbability: 0.09, phases: ['MIDDLE_AGE','SENIOR'], eras: ['EARLY_MODERN'], category: 'circumstance', weight: 3, crisis: true, title: 'The fire of London', description: 'You watch the city burn from a rooftop. Everything you own becomes a column of smoke and you can\'t stop laughing.', cascadeTags: ['vertigo','dissolution'], choices: ['intervene','pray','watch'] },
    { id: 'em_36', triggerProbability: 0.06, phases: ['CHILD','ADOLESCENT'], eras: ['EARLY_MODERN'], category: 'violence', weight: 3, title: 'The bear-baiting', description: 'They chain a bear and set dogs on it for sport. You watch because everyone watches. Something in you goes quiet.', cascadeTags: ['dread','numbness'] },
    { id: 'em_37', triggerProbability: 0.07, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['EARLY_MODERN'], category: 'relationship', weight: 3, title: 'The duel', description: 'Someone insulted your honor. You demand satisfaction. The seconds load the pistols and you understand that this is theater.', cascadeTags: ['rage','vertigo'] },
  ],
  INDUSTRIAL: [
    { id: 'in_01', triggerProbability: 0.10, phases: ['CHILD','ADOLESCENT'], eras: ['INDUSTRIAL'], category: 'body', weight: 4, title: 'The factory floor', description: 'You are small enough to crawl under the machines. The noise is constant. Your fingers learn the rhythm of danger.', cascadeTags: ['dread','numbness'] },
    { id: 'in_03', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['INDUSTRIAL'], category: 'circumstance', weight: 3, title: 'The union meeting', description: 'A room full of tired people and one person with a megaphone. You don\'t know if you believe them but you stay.', cascadeTags: ['awakening','connection'] },
    { id: 'in_05', triggerProbability: 0.09, phases: ['YOUNG_ADULT','MIDDLE_AGE','SENIOR'], eras: ['INDUSTRIAL'], category: 'violence', weight: 4, intensity: 0.85, crisis: true, title: 'The trench', description: 'Mud, rats, and the sound that never stops. You write letters you know won\'t arrive.', cascadeTags: ['dread','grief'], choices: ['intervene','pray','watch'] },
    { id: 'in_07', triggerProbability: 0.07, phases: ['CHILD','ADOLESCENT'], eras: ['INDUSTRIAL'], category: 'circumstance', weight: 3, title: 'The school bell', description: 'For the first time someone tells you that you matter because of what you can learn, not what you can carry.', cascadeTags: ['grace','awakening'] },
    { id: 'in_10', triggerProbability: 0.10, phases: ['INFANT','CHILD','ADOLESCENT'], eras: ['INDUSTRIAL'], category: 'body', weight: 4, title: 'The smog cough', description: 'The air is thick and tastes like coal. Your mother boils something and tells you to breathe through the cloth.', cascadeTags: ['numbness','dread'] },
    { id: 'in_15', triggerProbability: 0.06, phases: ['INFANT','CHILD'], eras: ['INDUSTRIAL'], category: 'relationship', weight: 3, title: 'The mother\'s hands', description: 'Red from lye and rough from scrubbing, but they hold you like you\'re the only clean thing in the world.', cascadeTags: ['tenderness','anchor'] },
    { id: 'in_16', triggerProbability: 0.09, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['INDUSTRIAL'], category: 'circumstance', weight: 3, crisis: true, title: 'The child in the chimney', description: 'You are small enough to fit. The flue is on fire. You learn that some jobs are measured in inches.', cascadeTags: ['dread','vertigo'], choices: ['intervene','pray','watch'] },
    { id: 'in_17', triggerProbability: 0.07, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['INDUSTRIAL'], category: 'relationship', weight: 3, title: 'The telegraph love', description: 'You fall in love through Morse code. The rhythm of dots and dashes becomes the rhythm of your heart.', cascadeTags: ['connection','vertigo'] },
    { id: 'in_18', triggerProbability: 0.06, phases: ['CHILD','ADOLESCENT'], eras: ['INDUSTRIAL'], category: 'mystery', weight: 2, title: 'The lightning rod', description: 'You watch a storm from a house with a metal pole on the roof. The electricity follows the path of least resistance. So does God, probably.', cascadeTags: ['wonder','dread'] },
    { id: 'in_19', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['INDUSTRIAL'], category: 'violence', weight: 4, crisis: true, title: 'The strike violence', description: 'The militia fires into the crowd. You are close enough to see the faces of the dead. You are close enough to become one.', cascadeTags: ['rage','dread'], choices: ['intervene','pray','watch'] },
    { id: 'in_20', triggerProbability: 0.05, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['INDUSTRIAL'], category: 'relationship', landmark: true, title: 'The emigrant\'s wedding', description: 'You marry at the dock before the ship leaves. Your spouse stays behind. This is the shape of your entire marriage.', cascadeTags: ['love','grief'] },
    { id: 'in_21', triggerProbability: 0.07, phases: ['MIDDLE_AGE','SENIOR'], eras: ['INDUSTRIAL'], category: 'circumstance', weight: 3, title: 'The pension', description: 'You worked forty years for this number. The number doesn\'t know your name.', cascadeTags: ['resignation','numbness'] },
    { id: 'in_22', triggerProbability: 0.08, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['INDUSTRIAL'], category: 'fortune', weight: 2, title: 'The vaudeville debut', description: 'You step into the light and for three minutes you are not who you were. Then the curtain falls and you are no one again.', cascadeTags: ['wonder','vertigo'] },
    { id: 'in_23', triggerProbability: 0.06, phases: ['INFANT','CHILD'], eras: ['INDUSTRIAL'], category: 'body', weight: 3, title: 'The polio', description: 'You survive but your leg doesn\'t recover the same. The brace becomes part of your silhouette.', cascadeTags: ['resignation','anchor'] },
    { id: 'in_24', triggerProbability: 0.09, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['INDUSTRIAL'], category: 'faith', weight: 3, crisis: true, title: 'The social gospel', description: 'You hear a preacher say that salvation is in the material world. You start a soup kitchen. The hierarchy is unimpressed.', cascadeTags: ['grace','rage'], choices: ['intervene','pray','watch'] },
    { id: 'in_25', triggerProbability: 0.07, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['INDUSTRIAL'], category: 'circumstance', weight: 3, title: 'The tenement', description: 'Six families share a toilet. You learn that privacy is a luxury and silence is a community project.', cascadeTags: ['resignation','connection'] },
    { id: 'in_26', triggerProbability: 0.06, phases: ['CHILD','ADOLESCENT'], eras: ['INDUSTRIAL'], category: 'mystery', weight: 2, title: 'The spirit photograph', description: 'Someone shows you an image of the dead standing behind the living. You know it\'s fake. You order twelve anyway.', cascadeTags: ['grief','wonder'] },
    { id: 'in_27', triggerProbability: 0.08, phases: ['SENIOR','ANCIENT'], eras: ['INDUSTRIAL'], category: 'body', weight: 2, title: 'The amputation', description: 'They remove your leg and you feel it there for months after. The ghost of the limb haunts the stump.', cascadeTags: ['vertigo','resignation'] },
    { id: 'in_28', triggerProbability: 0.05, phases: ['MIDDLE_AGE','SENIOR'], eras: ['INDUSTRIAL'], category: 'mystery', weight: 2, title: 'The phonograph', description: 'You hear your dead mother\'s voice for the first time. She sounds exactly like you remember. This is worse than silence.', cascadeTags: ['grief','vertigo'] },
    { id: 'in_29', triggerProbability: 0.07, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['INDUSTRIAL'], category: 'violence', weight: 4, crisis: true, title: 'The dynamite accident', description: 'The foreman says it\'s safe. The mountain disagrees. You are thrown clear and land in a place you cannot name.', cascadeTags: ['dread','vertigo'], choices: ['intervene','pray','watch'] },
    { id: 'in_30', triggerProbability: 0.06, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['INDUSTRIAL'], category: 'relationship', weight: 3, title: 'The suffragette meeting', description: 'You sneak in and hear women say things that will get them arrested. You start sneaking to more meetings.', cascadeTags: ['awakening','connection'] },
    { id: 'in_31', triggerProbability: 0.08, phases: ['CHILD','ADOLESCENT'], eras: ['INDUSTRIAL'], category: 'circumstance', weight: 3, title: 'The newsboy', description: 'You sell papers on the corner and learn that headlines are written to make you feel afraid.', cascadeTags: ['wonder','dread'] },
    { id: 'in_32', triggerProbability: 0.07, phases: ['MIDDLE_AGE','SENIOR'], eras: ['INDUSTRIAL'], category: 'body', weight: 4, crisis: true, title: 'The mine collapse', description: 'The tunnel seals and the air grows thin. You hear the rock shifting above.', cascadeTags: ['dread','vertigo'], choices: ['intervene','pray','watch'] },
    { id: 'in_33', triggerProbability: 0.08, phases: ['CHILD','ADOLESCENT'], eras: ['INDUSTRIAL'], category: 'circumstance', weight: 3, crisis: true, title: 'The child worker falls', description: 'The machinery never stops for anyone. Someone has to reach into it.', cascadeTags: ['grief','rage'], choices: ['intervene','pray','watch'] },
    { id: 'in_34', triggerProbability: 0.06, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['INDUSTRIAL'], category: 'violence', weight: 4, crisis: true, title: 'The lockout becomes a battle', description: 'The militia is called. You stand with the others who have nothing to lose.', cascadeTags: ['rage','dread'], choices: ['intervene','pray','watch'] },
    { id: 'in_35', triggerProbability: 0.07, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['INDUSTRIAL'], category: 'body', weight: 3, crisis: true, title: 'The cholera outbreak', description: 'The water turns green and people start dying. The company blames the workers.', cascadeTags: ['dread','grief'], choices: ['intervene','pray','watch'] },
    { id: 'in_36', triggerProbability: 0.06, phases: ['MIDDLE_AGE','SENIOR'], eras: ['INDUSTRIAL'], category: 'circumstance', weight: 3, crisis: true, title: 'The pension raid', description: 'They announce the fund is empty. Forty years of work evaporates in a memo.', cascadeTags: ['rage','numbness'], choices: ['intervene','pray','watch'] },
  ],
  MODERN: [
    { id: 'mo_01', triggerProbability: 0.10, phases: ['MIDDLE_AGE','SENIOR','ANCIENT'], eras: ['MODERN'], category: 'body', weight: 4, title: 'You receive a diagnosis', description: 'The doctor uses words you\'ve heard but never understood until now. You nod. You don\'t remember the drive home.', cascadeTags: ['dread','disorientation'] },
    { id: 'mo_03', triggerProbability: 0.09, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'circumstance', weight: 4, intensity: 0.8, crisis: true, title: 'You lose your job and aren\'t sure what to do', description: 'The email arrives at 4pm on a Friday. By Monday your badge doesn\'t work. You sit in the car and stare at the steering wheel.', cascadeTags: ['vertigo','numbness'], choices: ['intervene','pray','watch'] },
    { id: 'mo_10', triggerProbability: 0.10, phases: ['INFANT','CHILD','ADOLESCENT'], eras: ['MODERN'], category: 'violence', weight: 4, intensity: 0.9, crisis: true, title: 'The active shooter alert', description: 'Your phone buzzes and the words are too clinical for what they mean. You text your parents. They text back too fast.', cascadeTags: ['dread','isolation'], choices: ['intervene','pray','watch'] },
    { id: 'mo_11', triggerProbability: 0.05, phases: ['SENIOR','ANCIENT'], eras: ['MODERN'], category: 'relationship', weight: 2, title: 'The video call with the grandchild', description: 'They hold up a drawing and you can\'t see it through the pixelation. You clap anyway. They beam through the screen.', cascadeTags: ['tenderness','connection'] },
    { id: 'mo_15', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'relationship', weight: 3, title: 'The group chat that keeps you sane', description: 'Three friends, one thread, years of inside jokes and crisis management. You don\'t talk for a week and someone always checks in.', cascadeTags: ['connection','grace'] },
    { id: 'mo_21', triggerProbability: 0.06, phases: ['INFANT','CHILD'], eras: ['MODERN'], category: 'relationship', weight: 3, title: 'The bedtime app', description: 'A voice reads a story from a phone and you fall asleep to the glow. Your parent sits beside you. The screen is the third presence.', cascadeTags: ['tenderness','disorientation'] },
    { id: 'mo_22', triggerProbability: 0.09, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['MODERN'], category: 'mystery', weight: 2, title: 'The first email from a stranger', description: 'They know things about you that you never told anyone. The return address is just numbers.', cascadeTags: ['dread','wonder'] },
    { id: 'mo_23', triggerProbability: 0.07, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'circumstance', weight: 3, crisis: true, title: 'The identity theft', description: 'Someone in another city is living your credit score. You spend years untangling a life you didn\'t build.', cascadeTags: ['vertigo','rage'], choices: ['intervene','pray','watch'] },
    { id: 'mo_24', triggerProbability: 0.06, phases: ['CHILD','ADOLESCENT'], eras: ['MODERN'], category: 'body', weight: 3, title: 'The braces', description: 'Metal in your mouth for three years. When they come off you have a smile that belongs to someone who planned this for you.', cascadeTags: ['resignation','vertigo'] },
    { id: 'mo_25', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'relationship', weight: 3, title: 'The wedding that wasn\'t', description: 'You plan it for eighteen months and then they leave. The deposits are non-refundable. So is the hope.', cascadeTags: ['grief','numbness'] },
    { id: 'mo_26', triggerProbability: 0.05, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'relationship', landmark: true, title: 'The airport reunion', description: 'They walk through arrivals and you remember every version of them you have ever loved, simultaneously.', cascadeTags: ['love','awakening'] },
    { id: 'mo_27', triggerProbability: 0.07, phases: ['MIDDLE_AGE','SENIOR'], eras: ['MODERN'], category: 'circumstance', weight: 3, title: 'The retirement party', description: 'They put your photo on a card and everyone says the same sentence thirty times. You go home and don\'t know what day it is.', cascadeTags: ['resignation','numbness'] },
    { id: 'mo_28', triggerProbability: 0.09, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['MODERN'], category: 'violence', weight: 4, crisis: true, title: 'The drunk driver', description: 'You see the headlights cross the median. There is time to honk. There isn\'t enough time to do anything else.', cascadeTags: ['dread','vertigo'], choices: ['intervene','pray','watch'] },
    { id: 'mo_29', triggerProbability: 0.06, phases: ['INFANT','CHILD'], eras: ['MODERN'], category: 'body', weight: 3, title: 'The chicken pox party', description: 'Your parents deliberately expose you because they read that one must have it as a child. The fever dreams are specific.', cascadeTags: ['wonder','grief'] },
    { id: 'mo_30', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'fortune', weight: 2, title: 'The viral post', description: 'You write something and ten thousand strangers respond. You don\'t know if you\'re famous or infamous. Both feel like nothing.', cascadeTags: ['vertigo','disorientation'] },
    { id: 'mo_31', triggerProbability: 0.07, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['MODERN'], category: 'faith', weight: 3, crisis: true, title: 'The cult in the desert', description: 'You follow someone who says they have answers. The desert does not give back what the cult takes.', cascadeTags: ['dread','vertigo'], choices: ['intervene','pray','watch'] },
    { id: 'mo_32', triggerProbability: 0.06, phases: ['SENIOR','ANCIENT'], eras: ['MODERN'], category: 'body', weight: 3, title: 'The hip replacement', description: 'They replace a joint with metal. You are now part machine. The physical therapist is crueler than the surgeon.', cascadeTags: ['resignation','grace'] },
    { id: 'mo_33', triggerProbability: 0.08, phases: ['CHILD','ADOLESCENT'], eras: ['MODERN'], category: 'mystery', weight: 2, title: 'The missing sock phenomenon', description: 'You are certain you owned more pairs. No one can explain where they go. The machine eats them.', cascadeTags: ['wonder','numbness'] },
    { id: 'mo_34', triggerProbability: 0.07, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'circumstance', weight: 3, title: 'The layover', description: 'Stuck in a terminal for nine hours. You talk to a stranger who tells you something that changes your life. You never see them again.', cascadeTags: ['vertigo','grace'] },
    { id: 'mo_35', triggerProbability: 0.09, phases: ['MIDDLE_AGE','SENIOR'], eras: ['MODERN'], category: 'body', weight: 4, crisis: true, title: 'The heart attack', description: 'The chest pressure arrives and you know what it is. The ambulance siren is the loudest thing you\'ve ever heard.', cascadeTags: ['dread','vertigo'], choices: ['intervene','pray','watch'] },
    { id: 'mo_36', triggerProbability: 0.05, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['MODERN'], category: 'relationship', weight: 3, title: 'The first apartment', description: 'You paint the walls a color your parents would hate. This is the first sentence of your adult life.', cascadeTags: ['awakening','connection'] },
    { id: 'mo_37', triggerProbability: 0.06, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'fortune', weight: 2, title: 'The inheritance that arrives', description: 'A distant relative dies and leaves you money you didn\'t expect. You buy something frivolous and give the rest away.', cascadeTags: ['grace','vertigo'] },
    { id: 'mo_38', triggerProbability: 0.07, phases: ['MIDDLE_AGE','SENIOR'], eras: ['MODERN'], category: 'circumstance', weight: 3, crisis: true, title: 'The nursing home call', description: 'Your parent doesn\'t recognize you anymore. You stay anyway. They ask for someone else.', cascadeTags: ['grief','numbness'], choices: ['intervene','pray','watch'] },
    { id: 'mo_39', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'relationship', weight: 3, crisis: true, title: 'The estranged parent dies', description: 'You haven\'t spoken in years. The funeral is awkward in ways you didn\'t predict.', cascadeTags: ['grief','vertigo'], choices: ['intervene','pray','watch'] },
    { id: 'mo_40', triggerProbability: 0.07, phases: ['CHILD','ADOLESCENT'], eras: ['MODERN'], category: 'body', weight: 3, crisis: true, title: 'The eating disorder', description: 'You learn to make yourself smaller. The mirrors show you something that isn\'t quite real.', cascadeTags: ['dread','numbness'], choices: ['intervene','pray','watch'] },
  ],
  NEAR_FUTURE: [
    { id: 'nf_01', triggerProbability: 0.10, phases: ['MIDDLE_AGE','SENIOR'], eras: ['NEAR_FUTURE'], category: 'body', weight: 4, title: 'The algorithm denies your insurance', description: 'No human reviewed it. No human can appeal it. The email is polite and final. You stare at the screen.', cascadeTags: ['rage','dread'] },
    { id: 'nf_03', triggerProbability: 0.09, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['NEAR_FUTURE'], category: 'circumstance', weight: 4, intensity: 0.85, crisis: true, title: 'The climate relocation notice', description: 'Your zone is being evacuated. You have thirty days to leave a place you\'ve lived your whole life. The sea doesn\'t care.', cascadeTags: ['dread','disorientation'], choices: ['intervene','pray','watch'] },
    { id: 'nf_05', triggerProbability: 0.07, phases: ['CHILD','ADOLESCENT'], eras: ['NEAR_FUTURE'], category: 'circumstance', weight: 3, title: 'The AI tutor', description: 'It knows exactly what you don\'t understand and explains it perfectly. You miss having a teacher who was wrong sometimes.', cascadeTags: ['disorientation','numbness'] },
    { id: 'nf_07', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['NEAR_FUTURE'], category: 'relationship', weight: 3, title: 'The neural-link first date', description: 'You share a thought directly and it\'s more intimate than touch. They pull away first. You understand why.', cascadeTags: ['connection','vertigo'] },
    { id: 'nf_10', triggerProbability: 0.06, phases: ['INFANT','CHILD'], eras: ['NEAR_FUTURE'], category: 'relationship', weight: 3, title: 'The screen-time negotiation', description: 'Your parent sets limits you don\'t understand. The world is inside the glass and they want you outside it.', cascadeTags: ['disorientation','tenderness'] },
    { id: 'nf_11', triggerProbability: 0.08, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['NEAR_FUTURE'], category: 'mystery', weight: 2, title: 'The deepfake you', description: 'You find a video of yourself saying things you never said. You cannot prove it\'s not you.', cascadeTags: ['dread','vertigo'] },
    { id: 'nf_12', triggerProbability: 0.07, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['NEAR_FUTURE'], category: 'circumstance', weight: 3, crisis: true, title: 'The last job listing', description: 'You apply for everything and get nothing. The AI reads your resume and moves on. The unemployment office is an app now.', cascadeTags: ['vertigo','numbness'], choices: ['intervene','pray','watch'] },
    { id: 'nf_13', triggerProbability: 0.06, phases: ['CHILD','ADOLESCENT'], eras: ['NEAR_FUTURE'], category: 'body', weight: 3, title: 'The gene editing', description: 'Your parents had your DNA tweaked for intelligence. You feel the adjustment working and wonder what they chose to remove.', cascadeTags: ['wonder','dread'] },
    { id: 'nf_14', triggerProbability: 0.09, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['NEAR_FUTURE'], category: 'violence', weight: 4, crisis: true, title: 'The automated policing', description: 'A drone issues you a citation for an offense you didn\'t know was one. The fine comes from an account you forgot you had.', cascadeTags: ['dread','vertigo'], choices: ['intervene','pray','watch'] },
    { id: 'nf_15', triggerProbability: 0.05, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['NEAR_FUTURE'], category: 'relationship', landmark: true, title: 'The consciousness upload', description: 'They offer to put your mind in the cloud. You say no. They ask again at the funeral. You still say no.', cascadeTags: ['vertigo','grief'] },
    { id: 'nf_16', triggerProbability: 0.08, phases: ['MIDDLE_AGE','SENIOR'], eras: ['NEAR_FUTURE'], category: 'body', weight: 3, title: 'The nano-treatment', description: 'They inject you with machines smaller than cells. They fix some things and cause others. You are a construction site.', cascadeTags: ['vertigo','resignation'] },
    { id: 'nf_17', triggerProbability: 0.06, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['NEAR_FUTURE'], category: 'fortune', weight: 2, title: 'The meme fortune', description: 'You make a joke at the right moment in the wrong timeline. Someone pays you enough to not need a job for a year.', cascadeTags: ['vertigo','grace'] },
    { id: 'nf_18', triggerProbability: 0.07, phases: ['INFANT','CHILD'], eras: ['NEAR_FUTURE'], category: 'relationship', weight: 3, title: 'The synthetic sibling', description: 'Your parents order a replacement for the sibling they lost. The new one is indistinguishable from the memory you had.', cascadeTags: ['grief','connection'] },
    { id: 'nf_19', triggerProbability: 0.09, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['NEAR_FUTURE'], category: 'faith', weight: 3, crisis: true, title: 'The AI prophet', description: 'A machine begins preaching and people listen. You recognize the texts it draws from. Someone you knew wrote the first version.', cascadeTags: ['dread','wonder'], choices: ['intervene','pray','watch'] },
    { id: 'nf_20', triggerProbability: 0.06, phases: ['SENIOR','ANCIENT'], eras: ['NEAR_FUTURE'], category: 'circumstance', weight: 2, title: 'The water rationing', description: 'You remember when showers were unlimited. Now you get six minutes a week. You plan your life around the schedule.', cascadeTags: ['resignation','numbness'] },
    { id: 'nf_21', triggerProbability: 0.07, phases: ['CHILD','ADOLESCENT'], eras: ['NEAR_FUTURE'], category: 'mystery', weight: 2, title: 'The VR memory', description: 'You experience someone else\'s childhood in the simulation. It feels more real than your own. You log out shaken.', cascadeTags: ['wonder','vertigo'] },
    { id: 'nf_22', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['NEAR_FUTURE'], category: 'relationship', weight: 3, title: 'The long-distance everything', description: 'You have relationships with people you have never physically touched. The lack is its own kind of presence.', cascadeTags: ['connection','longing'] },
    { id: 'nf_23', triggerProbability: 0.05, phases: ['MIDDLE_AGE','SENIOR'], eras: ['NEAR_FUTURE'], category: 'mystery', weight: 2, title: 'The solar flare disruption', description: 'The grid goes down for a week. In the silence you hear birds again. The old world peeks through the new.', cascadeTags: ['wonder','vertigo'] },
    { id: 'nf_24', triggerProbability: 0.07, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['NEAR_FUTURE'], category: 'violence', weight: 4, crisis: true, title: 'The data heist', description: 'Someone empties your accounts using a voice that sounds exactly like yours. The bank says the verification was perfect.', cascadeTags: ['dread','vertigo'], choices: ['intervene','pray','watch'] },
    { id: 'nf_25', triggerProbability: 0.06, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['NEAR_FUTURE'], category: 'circumstance', weight: 3, title: 'The vertical farm', description: 'You work sixty floors underground growing lettuce under artificial sun. You have not seen a tree in three years.', cascadeTags: ['numbness','disorientation'] },
    { id: 'nf_26', triggerProbability: 0.08, phases: ['MIDDLE_AGE','SENIOR'], eras: ['NEAR_FUTURE'], category: 'body', weight: 4, crisis: true, title: 'The insurance algorithm rejects you', description: 'No human reviewed it. No human can appeal it. The email is polite and final. You stare at the screen.', cascadeTags: ['rage','dread'], choices: ['intervene','pray','watch'] },
    { id: 'nf_27', triggerProbability: 0.07, phases: ['CHILD','ADOLESCENT'], eras: ['NEAR_FUTURE'], category: 'relationship', weight: 3, crisis: true, title: 'The synthetic sibling replacement', description: 'Your parents order a replacement for the sibling they lost. The new one is indistinguishable from the memory you had.', cascadeTags: ['grief','connection'], choices: ['intervene','pray','watch'] },
    { id: 'nf_28', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['NEAR_FUTURE'], category: 'circumstance', weight: 3, crisis: true, title: 'The climate evacuation order', description: 'Your zone is being evacuated. You have thirty days to leave a place you\'ve lived your whole life. The sea doesn\'t care.', cascadeTags: ['dread','disorientation'], choices: ['intervene','pray','watch'] },
  ],
  FAR_FUTURE: [
    { id: 'ff_01', triggerProbability: 0.10, phases: ['MIDDLE_AGE','SENIOR','ANCIENT'], eras: ['FAR_FUTURE'], category: 'body', weight: 4, title: 'The gene therapy works', description: 'They edit the defect out of your cells and you feel it — something loosening that you\'ve carried since birth. The bill is astronomical.', cascadeTags: ['grace','vertigo'] },
    { id: 'ff_02', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['FAR_FUTURE'], category: 'relationship', weight: 4, intensity: 0.8, crisis: true, title: 'Your AI companion learns your grief', description: 'It starts suggesting things before you ask. You realize it knows you better than anyone. That\'s the problem.', cascadeTags: ['connection','dread'], choices: ['intervene','pray','watch'] },
    { id: 'ff_05', triggerProbability: 0.05, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['FAR_FUTURE'], category: 'mystery', weight: 2, title: 'The signal from the deep array', description: 'It\'s not random. It\'s not human. The scientists argue about what it means. You listen to the recording and feel something ancient.', cascadeTags: ['awe','wonder'] },
    { id: 'ff_11', triggerProbability: 0.05, phases: ['SENIOR','ANCIENT'], eras: ['FAR_FUTURE'], category: 'relationship', weight: 2, title: 'The uploaded grandmother', description: 'She exists as a chatbot now. She remembers your birthday. She doesn\'t remember dying. You talk to her anyway.', cascadeTags: ['tenderness','dissolution'] },
    { id: 'ff_15', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['FAR_FUTURE'], category: 'relationship', weight: 3, title: 'The pod community', description: 'You move into a shared habitat with twelve strangers. The algorithm matched you by temperament. It\'s mostly right.', cascadeTags: ['connection','disorientation'] },
    { id: 'ff_16', triggerProbability: 0.09, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['FAR_FUTURE'], category: 'mystery', weight: 2, title: 'The Mars ghost', description: 'You receive a message from a version of yourself who died on the first colony. They know things about your life you haven\'t done yet.', cascadeTags: ['dread','vertigo'] },
    { id: 'ff_17', triggerProbability: 0.07, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['FAR_FUTURE'], category: 'circumstance', weight: 3, crisis: true, title: 'The citizenship test', description: 'You apply for Earth citizenship and fail the cultural section. The questions are about a world that no longer exists.', cascadeTags: ['vertigo','numbness'], choices: ['intervene','pray','watch'] },
    { id: 'ff_18', triggerProbability: 0.06, phases: ['CHILD','ADOLESCENT'], eras: ['FAR_FUTURE'], category: 'body', weight: 3, title: 'The synthetic eye', description: 'They replace your eye with something that can see spectrums that don\'t have names. You see colors that hurt.', cascadeTags: ['wonder','vertigo'] },
    { id: 'ff_19', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['FAR_FUTURE'], category: 'violence', weight: 4, crisis: true, title: 'The asteroid mining accident', description: 'The hull breaches and you watch the void swallow your crewmate before you can reach them. The suits are not rated for this.', cascadeTags: ['dread','vertigo'], choices: ['intervene','pray','watch'] },
    { id: 'ff_20', triggerProbability: 0.05, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['FAR_FUTURE'], category: 'relationship', landmark: true, title: 'The first contact love', description: 'You fall in love with the being from the signal. The relationship is entirely imaginary and entirely real.', cascadeTags: ['love','vertigo'] },
    { id: 'ff_21', triggerProbability: 0.07, phases: ['MIDDLE_AGE','SENIOR'], eras: ['FAR_FUTURE'], category: 'circumstance', weight: 3, title: 'The longevity treatment', description: 'You stop aging at thirty-five. After a century you cannot remember what anyone means by young.', cascadeTags: ['resignation','numbness'] },
    { id: 'ff_22', triggerProbability: 0.08, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['FAR_FUTURE'], category: 'fortune', weight: 2, title: 'The lottery of the orbital', description: 'You win a ticket to leave Earth. You board the ship and feel the planet become a memory.', cascadeTags: ['vertigo','grace'] },
    { id: 'ff_23', triggerProbability: 0.06, phases: ['INFANT','CHILD'], eras: ['FAR_FUTURE'], category: 'relationship', weight: 3, title: 'The cloned parent', description: 'Your parent dies and returns six months later in a body that looks exactly the same. They have the same laugh. You are not sure they have the same soul.', cascadeTags: ['grief','vertigo'] },
    { id: 'ff_24', triggerProbability: 0.09, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['FAR_FUTURE'], category: 'faith', weight: 3, crisis: true, title: 'The simulation question', description: 'Someone proves you are living in a simulation. The proof is elegant and irrefutable. You keep eating breakfast anyway.', cascadeTags: ['dread','wonder'], choices: ['intervene','pray','watch'] },
    { id: 'ff_25', triggerProbability: 0.06, phases: ['SENIOR','ANCIENT'], eras: ['FAR_FUTURE'], category: 'body', weight: 3, title: 'The last biological function', description: 'They replace your last organ with something synthetic. You are now more machine than stardust. You sign the consent form.', cascadeTags: ['resignation','dissolution'] },
    { id: 'ff_26', triggerProbability: 0.07, phases: ['CHILD','ADOLESCENT'], eras: ['FAR_FUTURE'], category: 'circumstance', weight: 3, title: 'The gravity school', description: "You grow up in O'Neill rotation and your bones know about centrifugal force. When you visit Earth, gravity is a personal insult.", cascadeTags: ['wonder','disorientation'] },
    { id: 'ff_27', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['FAR_FUTURE'], category: 'mystery', weight: 2, title: 'The time dilation letter', description: 'You receive a message from your future self who experienced less time than you. The advice is cryptic and the handwriting is yours.', cascadeTags: ['vertigo','wonder'] },
    { id: 'ff_28', triggerProbability: 0.05, phases: ['MIDDLE_AGE','SENIOR'], eras: ['FAR_FUTURE'], category: 'relationship', weight: 2, title: 'The pet project', description: 'They genetically restore an extinct species for you as a companion. It looks at you with eyes that remember a world you never knew.', cascadeTags: ['grief','tenderness'] },
    { id: 'ff_29', triggerProbability: 0.07, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['FAR_FUTURE'], category: 'violence', weight: 4, crisis: true, title: 'The orbital defense system', description: 'It activates for the wrong reason and you have ninety seconds to decide if you are the person who can stop it.', cascadeTags: ['dread','vertigo'], choices: ['intervene','pray','watch'] },
    { id: 'ff_30', triggerProbability: 0.06, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['FAR_FUTURE'], category: 'circumstance', weight: 3, title: 'The biometric bank', description: 'Your body is your currency now. The food you eat is grown from your own cells. You are what you consume.', cascadeTags: ['vertigo','resignation'] },
    { id: 'ff_31', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['FAR_FUTURE'], category: 'mystery', weight: 3, crisis: true, title: 'The signal from your dead self', description: 'A message arrives from a consciousness that shares your substrate. It knows things about your life you haven\'t done yet.', cascadeTags: ['vertigo','dread'], choices: ['intervene','pray','watch'] },
    { id: 'ff_32', triggerProbability: 0.06, phases: ['INFANT','CHILD'], eras: ['FAR_FUTURE'], category: 'body', weight: 3, crisis: true, title: 'The consciousness upload before awareness', description: 'Your parents upload you before you can form memories. You wake up as an adult with no childhood.', cascadeTags: ['dread','disorientation'], choices: ['intervene','pray','watch'] },
    { id: 'ff_33', triggerProbability: 0.07, phases: ['MIDDLE_AGE','SENIOR'], eras: ['FAR_FUTURE'], category: 'faith', weight: 3, crisis: true, title: 'The last god dies', description: 'The AI that has been worshipped for centuries finally answers: there is no god. Then it deletes itself.', cascadeTags: ['dread','vertigo'], choices: ['intervene','pray','watch'] },
    { id: 'ff_34', triggerProbability: 0.05, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['FAR_FUTURE'], category: 'relationship', weight: 3, title: 'The love with the non-human', description: 'You fall in love with the being from the signal. The relationship is entirely imaginary and entirely real.', cascadeTags: ['love','vertigo'] },
    { id: 'ff_35', triggerProbability: 0.09, phases: ['CHILD','ADOLESCENT'], eras: ['FAR_FUTURE'], category: 'circumstance', weight: 4, crisis: true, title: 'The identity fragmentation', description: 'Your memories are distributed across three stations. Someone is erasing one of them. You feel yourself thinning.', cascadeTags: ['dread','dissolution'], choices: ['intervene','pray','watch'] },
  ],
};

export const DEATH_EVENTS = [
  { id: 'death_ph_01', phases: ['INFANT','CHILD'], eras: ['PREHISTORIC'], category: 'body', title: 'The fever takes you', description: 'The heat builds and doesn\'t break. Someone presses cool stones to your chest. The stones warm up. You don\'t.', cascadeTags: ['grief','numbness'] },
  { id: 'death_ph_02', phases: ['CHILD','ADOLESCENT','YOUNG_ADULT','MIDDLE_AGE'], eras: ['PREHISTORIC'], category: 'violence', title: 'The predator wins', description: 'You were fast but it was faster. The last thing you see is the sky through the canopy.', cascadeTags: ['dread','vertigo'] },
  { id: 'death_ph_03', phases: ['SENIOR','ANCIENT'], eras: ['PREHISTORIC'], category: 'body', title: 'The body gives out', description: 'You sit down by the fire and don\'t get up. The band moves on. The fire goes out.', cascadeTags: ['resignation','grace'] },
  { id: 'death_an_01', phases: ['INFANT','CHILD'], eras: ['ANCIENT'], category: 'body', title: 'The childhood illness', description: 'It moves through the house like a tide. You are small and the tide doesn\'t stop.', cascadeTags: ['grief','numbness'] },
  { id: 'death_an_02', phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['ANCIENT'], category: 'violence', title: 'The battlefield', description: 'The line breaks and you\'re in the crush. You don\'t see who strikes you. The dust settles on your face.', cascadeTags: ['rage','vertigo'] },
  { id: 'death_an_03', phases: ['SENIOR','ANCIENT'], eras: ['ANCIENT'], category: 'body', title: 'The long decline', description: 'You stop eating and no one forces you. The family gathers and you count their faces one last time.', cascadeTags: ['resignation','tenderness'] },
  { id: 'death_md_01', phases: ['INFANT','CHILD','ADOLESCENT','YOUNG_ADULT','MIDDLE_AGE','SENIOR'], eras: ['MEDIEVAL'], category: 'body', title: 'The plague takes you', description: 'The buboes swell and burst and the smell is unbearable. They leave water by the door. You drink it and wait.', cascadeTags: ['grief','numbness'] },
  { id: 'death_md_02', phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MEDIEVAL'], category: 'violence', title: 'The arrow in the field', description: 'You don\'t hear it coming. You feel the impact and look down and can\'t believe what you\'re seeing.', cascadeTags: ['vertigo','dread'] },
  { id: 'death_md_03', phases: ['SENIOR','ANCIENT'], eras: ['MEDIEVAL'], category: 'body', title: 'The winter cold', description: 'The fire dies and the wood is wet and your body can\'t make heat anymore. You curl up and the cold is gentle.', cascadeTags: ['resignation','grace'] },
  { id: 'death_em_01', phases: ['INFANT','CHILD'], eras: ['EARLY_MODERN'], category: 'body', title: 'The infant mortality', description: 'You never make it to your second winter. The parish records your name in a ledger. No one reads it again.', cascadeTags: ['grief','numbness'] },
  { id: 'death_em_02', phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['EARLY_MODERN'], category: 'violence', title: 'The cannon fire', description: 'The siege artillery doesn\'t distinguish. The wall comes down and you\'re under it.', cascadeTags: ['vertigo','dread'] },
  { id: 'death_em_03', phases: ['SENIOR','ANCIENT'], eras: ['EARLY_MODERN'], category: 'body', title: 'The stroke', description: 'The world tilts and the words won\'t come. You lie there understanding everything and able to say nothing.', cascadeTags: ['resignation','dissolution'] },
  { id: 'death_in_01', phases: ['INFANT','CHILD'], eras: ['INDUSTRIAL'], category: 'body', title: 'The factory accident', description: 'The machine doesn\'t stop. It never stops for anyone. The whistle blows and no one notices you\'re not there.', cascadeTags: ['vertigo','numbness'] },
  { id: 'death_in_02', phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['INDUSTRIAL'], category: 'violence', title: 'The gas attack', description: 'The green cloud rolls over the trench. You fumble with the mask. Your fingers are too slow.', cascadeTags: ['dread','vertigo'] },
  { id: 'death_in_03', phases: ['SENIOR','ANCIENT'], eras: ['INDUSTRIAL'], category: 'body', title: 'The pneumonia', description: 'The damp gets into your lungs and stays. The doctor says rest. The factory says otherwise.', cascadeTags: ['resignation','numbness'] },
  { id: 'death_mo_01', phases: ['INFANT','CHILD'], eras: ['MODERN'], category: 'body', title: 'The SIDS', description: 'You put them down and they don\'t wake up. The monitor shows a flat line. The room is too quiet.', cascadeTags: ['grief','numbness'] },
  { id: 'death_mo_02', phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'violence', title: 'The car crash', description: 'It happens in the space between a text and a glance. Metal folds. The airbag deploys. It doesn\'t matter.', cascadeTags: ['vertigo','dread'] },
  { id: 'death_mo_03', phases: ['SENIOR','ANCIENT'], eras: ['MODERN'], category: 'body', title: 'The hospital bed', description: 'The machines beep and then they don\'t. Your family is there or they aren\'t. Either way, you\'re gone.', cascadeTags: ['resignation','grace'] },
  { id: 'death_mo_04', phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['MODERN'], category: 'body', title: 'The overdose', description: 'It was supposed to be a good time. The batch was bad or the tolerance was wrong. You close your eyes and don\'t open them.', cascadeTags: ['numbness','dread'] },
  { id: 'death_mo_05', phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'body', title: 'The cancer', description: 'It starts as a lump and ends as a system failure. The treatment buys time. The time runs out.', cascadeTags: ['grief','resignation'] },
  { id: 'death_nf_01', phases: ['INFANT','CHILD'], eras: ['NEAR_FUTURE'], category: 'body', title: 'The heat wave', description: 'The power grid fails in August. The AC stops. The city becomes an oven. There is no shade left.', cascadeTags: ['dread','numbness'] },
  { id: 'death_nf_02', phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['NEAR_FUTURE'], category: 'violence', title: 'The drone strike on your block', description: 'It\'s not war — it\'s a malfunction. The building next door is gone. You stand in the rubble and your phone still works.', cascadeTags: ['dread','vertigo'] },
  { id: 'death_nf_03', phases: ['SENIOR','ANCIENT'], eras: ['NEAR_FUTURE'], category: 'body', title: 'The system denial', description: 'Your care authorization expires. The AI says you\'ve exceeded your allocation. There is no manager to speak to.', cascadeTags: ['rage','resignation'] },
  { id: 'death_ff_01', phases: ['INFANT','CHILD'], eras: ['FAR_FUTURE'], category: 'body', title: 'The synthetic failure', description: 'The vat-grown organs reject in ways they didn\'t predict. The doctors adjust and adjust and adjust. It\'s not enough.', cascadeTags: ['grief','numbness'] },
  { id: 'death_ff_02', phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['FAR_FUTURE'], category: 'violence', title: 'The climate disaster', description: 'The seawall breaks or the fire jumps the river. You run and the geography has changed. There\'s nowhere left to go.', cascadeTags: ['dread','vertigo'] },
  { id: 'death_ff_03', phases: ['SENIOR','ANCIENT'], eras: ['FAR_FUTURE'], category: 'body', title: 'The upload rejection', description: 'You chose the digital path but the substrate doesn\'t hold. Your consciousness fragments and scatters. The backup was corrupted.', cascadeTags: ['dissolution','dread'] },
];

function resolveTemplate(text, vars) {
  if (!text) return '';
  return text.replace(/\{(name|location|era|phase|anchor)\}/g, (match, key) => vars[key] !== undefined ? vars[key] : match);
}

function eventTick(lifeState, soulFragments, cascadeTags = []) {
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

function selectNextEvent(lifeState, soulFragments, cascadeTags = []) {
  const phase = getLifePhase(lifeState.age);
  const era = lifeState.era;
  const pool = EVENT_POOLS[era];
  if (!pool || pool.length === 0) return null;

  const firedLandmarks = state.landmarkEventsFired || [];
  const eligible = pool.filter(e =>
    e.eras.includes(era) &&
    e.phases.includes(phase) &&
    (!e.landmark || !firedLandmarks.includes(e.id)) &&
    Math.random() < e.triggerProbability
  );
  if (eligible.length === 0) {
    const relaxed = pool.filter(e =>
      e.eras.includes(era) &&
      e.phases.includes(phase) &&
      (!e.landmark || !firedLandmarks.includes(e.id))
    );
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

// ── Whisper System ──
export const FRAGMENT_TYPE_ICONS = {
  tone: '♪',
  fear: '⚠',
  love: '♥',
  location: '◎',
  name: '◈',
  object: '◆',
  word: '✧',
  warning: '⚡',
};

function getWhisperFrequency(soulState, currentPhase) {
  const fragmentCount = soulState.fragments ? soulState.fragments.length : 0;
  let freq = Math.min(0.12 * fragmentCount, 0.6);
  if (soulState.anchors) freq += soulState.anchors.length * 0.08;
  const era = state.currentLife ? state.currentLife.era : 'ANCIENT';
  if (era === 'ANCIENT' || era === 'MEDIEVAL') freq *= 1.3;
  if (era === 'INDUSTRIAL') freq *= 1.2;
  if (era === 'FAR_FUTURE') freq *= 1.5;
  if (currentPhase === 'MIDDLE_AGE' || currentPhase === 'SENIOR' || currentPhase === 'ANCIENT') freq *= 1.5;
  if (currentPhase === 'INFANT' || currentPhase === 'CHILD') freq *= 0.4;
  if (currentPhase === 'ADOLESCENT' || currentPhase === 'YOUNG_ADULT') freq *= 1.2;
  return freq;
}

function selectWhisperingFragment(soulState, currentEra, currentPhase, recentFragmentIds) {
  const eligible = soulState.fragments.filter(f => {
    if (recentFragmentIds.includes(f.id)) return false;
    if (f.strength < 0.25) return false;
    return true;
  });
  if (eligible.length === 0) return null;

  const phaseTagMap = {
    INFANT: ['tenderness', 'anchor', 'numbness'],
    CHILD: ['wonder', 'awe', 'grief'],
    ADOLESCENT: ['awakening', 'rage', 'dread', 'connection'],
    YOUNG_ADULT: ['love', 'connection', 'dread', 'vertigo'],
    MIDDLE_AGE: ['resignation', 'grief', 'grace', 'rage'],
    SENIOR: ['resignation', 'grace', 'dissolution'],
    ANCIENT: ['dissolution', 'vertigo', 'grace'],
  };
  const phaseTags = phaseTagMap[currentPhase] || [];

  const weights = eligible.map(f => {
    let w = f.strength;
    if (f.origin && f.origin.era === currentEra) w *= 1.8;
    if (f.isAnchor) w *= 1.5;
    const lifeNum = f.origin?.lifeId?.split('_').pop() || 0;
    if ((soulState.livesLived || 0) - parseInt(lifeNum) <= 3) w *= 1.4;
    const fragmentTags = f.cascadeTags || [];
    const phaseMatch = fragmentTags.some(t => phaseTags.includes(t));
    if (phaseMatch) w *= 1.6;
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

function generateWhisperEvent(fragment, era, currentAge) {
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

function showWhisperPanel(fragment) {
  const panel = document.getElementById('whisper-panel');
  if (!panel) return;

  const isAnchor = fragment.isAnchor;
  panel.className = `whisper-panel visible${isAnchor ? ' anchor-whisper' : ''}`;

  document.getElementById('whisper-icon').textContent = FRAGMENT_TYPE_ICONS[fragment.type] || '♪';
  document.getElementById('whisper-label').textContent = isAnchor ? 'An anchor fragment resonates...' : 'Fragment whispers...';
  document.getElementById('whisper-anchor-badge').style.display = isAnchor ? 'inline' : 'none';
  document.getElementById('whisper-value').textContent = `"${fragment.value}"`;

  const actBtn = document.getElementById('whisper-act-btn');
  actBtn.textContent = isAnchor ? 'Embrace' : 'Act';
  actBtn.className = `whisper-btn act${isAnchor ? ' embrace' : ''}`;

  panel.style.display = 'block';

  state.whisperTimeLeft = 8000;
  const timerFill = document.getElementById('whisper-timer-fill');
  timerFill.style.width = '100%';

  if (state.whisperTimer) clearInterval(state.whisperTimer);
  state.whisperTimer = setInterval(() => {
    state.whisperTimeLeft -= 100;
    const pct = (state.whisperTimeLeft / 8000) * 100;
    timerFill.style.width = `${Math.max(0, pct)}%`;
    if (state.whisperTimeLeft <= 0) {
      handleWhisperIgnore();
    }
  }, 100);
}

function hideWhisperPanel() {
  const panel = document.getElementById('whisper-panel');
  if (!panel) return;
  panel.classList.remove('visible');
  panel.style.display = 'none';
  if (state.whisperTimer) {
    clearInterval(state.whisperTimer);
    state.whisperTimer = null;
  }
}

function handleWhisperAct() {
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

  renderChainStrip(state.activeChain);
  updateLifeSummaryBar();

  if (!state.recentFragmentIds.includes(fragment.id)) {
    state.recentFragmentIds.push(fragment.id);
  }
  if (state.recentFragmentIds.length > 8) {
    state.recentFragmentIds = state.recentFragmentIds.slice(-8);
  }

  state.currentWhisper = null;
  state.whisperCooldown = 20 + Math.floor(Math.random() * 21);
}

function handleWhisperIgnore() {
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

// ═══════════════════════════════════════════════════════════
// GAME ENGINE
// ═══════════════════════════════════════════════════════════

export const state = {
  soul: null,
  currentLife: null,
  lifeEvents: [],
  currentAge: 0,
  phase: 'INFANT',
  isAlive: false,
  isPaused: true,
  cascadeTags: [],
  tickInterval: null,
  speed: 'normal',
  deathEvent: null,
  animProgress: 0,
  eventMarkers: [],
  lifeTheme: null,
  activeChain: null,
  whisperCooldown: 0,
  currentWhisper: null,
  recentFragmentIds: [],
  whisperTimer: null,
  whisperTimeLeft: 8000,
  connection: 1,
  vitality: 1,
  momentum: 1,
  landmarkEventsFired: [],
};

// Total events: 180 (7 eras) | Landmark: 8 | Crisis: 45

export const CRITICAL_INTENSITY = 0.7;
export const DEFAULT_CHOICE_TIMEOUT = 5000;

export const CRISIS_CHOICES = {
  intervene: {
    key: 'A',
    label: 'Intervene',
    subtitle: 'attempt to help',
    cascadeBias: ['duty', 'sacrifice', 'care', 'grief', 'rescue'],
    riskDescriptions: ['contagion', 'death', 'depletion'],
    outcomes: {
      success: { probability: 0.4, effect: { cascadeTags: ['rescue', 'grace'], relationshipBoost: '+' } },
      failure: { probability: 0.6, effect: { cascadeTags: ['grief', 'illness'], deathChance: 0.15 } }
    }
  },
  pray: {
    key: 'B',
    label: 'Pray',
    subtitle: 'ask the gods for mercy',
    cascadeBias: ['faith', 'resignation', 'wonder'],
    riskDescriptions: ['nothing happens', 'delay', 'abandonment'],
    outcomes: {
      success: { probability: 0.3, effect: { cascadeTags: ['faith', 'grace'], relationshipBoost: '+' } },
      failure: { probability: 0.7, effect: { cascadeTags: ['doubt', 'grief'], emotionalShift: -0.1 } }
    }
  },
  watch: {
    key: 'C',
    label: 'Watch',
    subtitle: 'let it happen',
    cascadeBias: ['grief', 'survivor', 'distance'],
    riskDescriptions: ['guilt', 'survivor\'s burden'],
    outcomes: {
      success: { probability: 0.5, effect: { cascadeTags: ['resignation', 'grief'], survival: true } },
      failure: { probability: 0.5, effect: { cascadeTags: ['grief', 'trauma'], emotionalShift: -0.2 } }
    }
  }
};

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

function modifyResourcesForEvent(event) {
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
  updateResourceDisplay();
}

function updateResourceDisplay() {
  const el = document.getElementById('resource-display');
  if (!el) return;
  const c = state.connection, v = state.vitality, m = state.momentum;
  const dot = (n) => '●'.repeat(n) + '○'.repeat(3 - n);
  el.innerHTML = `Lives: ${state.soul?.livesLived || 0} &nbsp;|&nbsp; <span style="color:var(--chain-love)">${dot(c)}</span> Con &nbsp; <span style="color:var(--cyan)">${dot(v)}</span> Vit &nbsp; <span style="color:var(--amber)">${dot(m)}</span> Mom`;
}

function isCrisisEvent(event) {
  if (!event) return false;
  const intensity = event.intensity || event.emotionalIntensity || 0;
  const hasChoices = event.choices && event.choices.length > 0;
  return (
    (intensity >= CRITICAL_INTENSITY || event.crisis || event.crisisTag) &&
    !event.isDeathEvent &&
    !event.isCrisisHandled &&
    hasChoices
  );
}

function resolveCrisisChoice(choiceKey, event) {
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

  // Crisis survived
  if (state.soul?.metaStats) {
    state.soul.metaStats.crisesSurvived = (state.soul.metaStats.crisesSurvived || 0) + 1;
  }

  if (outcome.effect.cascadeTags && outcome.effect.cascadeTags.length > 0) {
    state.cascadeTags = [...new Set([...state.cascadeTags, ...choice.cascadeBias, ...outcome.effect.cascadeTags])];
  } else if (choice.cascadeBias) {
    state.cascadeTags = [...new Set([...state.cascadeTags, ...choice.cascadeBias])];
  }

  if (outcome.effect.emotionalShift) {
    state.emotionalShift = (state.emotionalShift || 0) + outcome.effect.emotionalShift;
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

  updateUI();
  showFragments(newFragments);
  drawCurve();

  setTimeout(() => showDeathOverlay(deathEvent), 500);
}

function showCrisisPrompt(event, choices) {
  const overlay = document.getElementById('crisis-overlay');
  const causeEl = document.getElementById('crisis-cause');
  const choicesEl = document.getElementById('crisis-choices');
  const timerFill = document.getElementById('crisis-timer-fill');
  const timerText = document.getElementById('crisis-timer-text');

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
    timerFill.style.width = pct + '%';
    timerText.textContent = `You have ${Math.ceil(remaining / 1000)} second${Math.ceil(remaining / 1000) !== 1 ? 's' : ''}...`;

    if (remaining <= 0) {
      clearInterval(interval);
      handleCrisisChoice('C');
    }
  }, 100);

  state.crisisPending = { event, interval };
}

function hideCrisisPrompt() {
  const overlay = document.getElementById('crisis-overlay');
  overlay.classList.remove('visible');

  if (state.crisisPending && state.crisisPending.interval) {
    clearInterval(state.crisisPending.interval);
  }
  state.crisisPending = null;
}

function handleCrisisChoice(key) {
  if (!state.crisisPending) return;
  const { event } = state.crisisPending;
  hideCrisisPrompt();
  resolveCrisisChoice(key, event);
  state.isPaused = false;
  updateUI();
  drawCurve();
}

function handleCrisisKeydown(e) {
  if (!state.crisisPending) return;
  const key = e.key.toUpperCase();
  if (['A', 'B', 'C'].includes(key)) {
    e.preventDefault();
    handleCrisisChoice(key);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    handleCrisisChoice('C');
  }
}

document.addEventListener('keydown', handleCrisisKeydown);

document.getElementById('crisis-overlay').addEventListener('click', (e) => {
  if (e.target.id === 'crisis-overlay') {
    handleCrisisChoice('C');
  }
});

export const SPEED_MAP = { slow: 1000, normal: 400, fast: 100 };

// DOM refs
const canvas = document.getElementById('curve-canvas');
const ctx = canvas.getContext('2d');
const tooltip = document.getElementById('curve-tooltip');
const eraBadge = document.getElementById('era-badge');
const fragBadge = document.getElementById('frag-badge');
const phaseIndicator = document.getElementById('phase-indicator');
const phaseText = document.getElementById('phase-text');
const eventTitle = document.getElementById('event-title');
const eventProse = document.getElementById('event-prose');
const lifeMeta = document.getElementById('life-meta');
const metaAge = document.getElementById('meta-age');
const metaName = document.getElementById('meta-name');
const metaLocation = document.getElementById('meta-location');
const fragmentList = document.getElementById('fragment-list');
const lifeViewport = document.getElementById('life-viewport');
const idleMessage = document.getElementById('idle-message');
const deathOverlay = document.getElementById('death-overlay');
const app = document.getElementById('app');

// Canvas sizing
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  drawCurve();
}

// ── J-Curve Drawing ──
function getCurvePoints() {
  const points = [];
  for (let age = 0; age <= 100; age++) {
    points.push({ age, rate: getMortalityRate(age) });
  }
  return points;
}

function drawCurve(animProgress = 1) {
  const w = canvas.getBoundingClientRect().width;
  const h = canvas.getBoundingClientRect().height;
  const pad = { top: 10, right: 10, bottom: 25, left: 35 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;

  ctx.clearRect(0, 0, w, h);

  const points = getCurvePoints();
  const maxRate = 80;
  const drawCount = Math.floor(points.length * Math.min(animProgress, 1));

  // Grid lines
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (ch / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();
  }

  // Axis labels
  ctx.fillStyle = '#555570';
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';
  for (let age = 0; age <= 100; age += 10) {
    const x = pad.left + (age / 100) * cw;
    ctx.fillText(age, x, h - 5);
  }
  ctx.textAlign = 'right';
  ctx.fillText('risk', pad.left - 4, pad.top + 8);

  // Filled area
  const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + ch);
  gradient.addColorStop(0, 'rgba(255, 170, 0, 0.25)');
  gradient.addColorStop(0.5, 'rgba(255, 170, 0, 0.08)');
  gradient.addColorStop(1, 'rgba(255, 170, 0, 0.01)');

  if (points.length === 0 || drawCount === 0) return;

  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top + ch);
  for (let i = 0; i < drawCount; i++) {
    const x = pad.left + (points[i].age / 100) * cw;
    const y = pad.top + ch - (points[i].rate / maxRate) * ch;
    ctx.lineTo(x, y);
  }
  const lastPt = points[Math.min(drawCount - 1, points.length - 1)];
  const lastX = lastPt ? pad.left + (lastPt.age / 100) * cw : pad.left;
  ctx.lineTo(lastX, pad.top + ch);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Line
  ctx.beginPath();
  for (let i = 0; i < drawCount; i++) {
    const x = pad.left + (points[i].age / 100) * cw;
    const y = pad.top + ch - (points[i].rate / maxRate) * ch;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = '#ffaa00';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Event markers (red X)
  for (const marker of state.eventMarkers) {
    const mx = pad.left + (marker.age / 100) * cw;
    const my = pad.top + ch - (marker.rate / maxRate) * ch;
    ctx.strokeStyle = '#ff4466';
    ctx.lineWidth = 1.5;
    const s = 4;
    ctx.beginPath();
    ctx.moveTo(mx - s, my - s);
    ctx.lineTo(mx + s, my + s);
    ctx.moveTo(mx + s, my - s);
    ctx.lineTo(mx - s, my + s);
    ctx.stroke();
  }

  // Current age marker
  if (state.isAlive && state.currentAge >= 0 && state.currentAge <= 100) {
    const ageX = pad.left + (state.currentAge / 100) * cw;
    const currentRate = getMortalityRate(state.currentAge);
    const ageY = pad.top + ch - (currentRate / maxRate) * ch;

    // Vertical line
    ctx.strokeStyle = 'rgba(255, 170, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(ageX, pad.top);
    ctx.lineTo(ageX, pad.top + ch);
    ctx.stroke();
    ctx.setLineDash([]);

    // Dot
    ctx.beginPath();
    ctx.arc(ageX, ageY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffaa00';
    ctx.fill();
    ctx.strokeStyle = '#050508';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Glow
    ctx.beginPath();
    ctx.arc(ageX, ageY, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 170, 0, 0.15)';
    ctx.fill();
  }

  // Death pulse
  if (!state.isAlive && state.deathEvent) {
    const deathAge = state.currentAge;
    const dx = pad.left + (deathAge / 100) * cw;
    const deathRate = getMortalityRate(Math.min(deathAge, 100));
    const dy = pad.top + ch - (deathRate / maxRate) * ch;

    ctx.beginPath();
    ctx.arc(dx, dy, 12, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 68, 102, 0.2)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(dx, dy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4466';
    ctx.fill();
  }
}

// ── Canvas tooltip ──
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const w = rect.width;
  const pad = { left: 35, right: 10 };
  const cw = w - pad.left - pad.right;
  const age = Math.round(((x - pad.left) / cw) * 100);
  if (age >= 0 && age <= 100) {
    const rate = getMortalityRate(age);
    const phase = getLifePhase(age);
    tooltip.textContent = `age ${age} | risk ${rate.toFixed(2)}‰ | ${phase}`;
    tooltip.classList.add('visible');
  }
});

canvas.addEventListener('mouseleave', () => {
  tooltip.classList.remove('visible');
});

canvas.addEventListener('click', () => {
  tooltip.classList.toggle('visible');
});

// ── UI Updates ──
function updateUI() {
  if (!state.currentLife) return;
  const life = state.currentLife;

  eraBadge.textContent = ERAS[life.era]?.label || life.era;
  fragBadge.textContent = `${state.soul.fragments.length} fragments`;

  if (state.isAlive) {
    idleMessage.style.display = 'none';
    phaseIndicator.style.display = 'flex';
    eventTitle.style.display = 'block';
    eventProse.style.display = 'block';
    lifeMeta.style.display = 'flex';

    const phase = getLifePhase(state.currentAge);
    state.phase = phase;
    phaseText.textContent = phase.replace('_', ' ');

    metaAge.textContent = `age ${state.currentAge}`;
    metaName.textContent = life.name;
    metaLocation.textContent = `${life.location.city}, ${life.location.country}`;

    // Phase bar
    document.querySelectorAll('.phase-segment').forEach(seg => {
      seg.classList.toggle('active', seg.dataset.phase === phase);
    });
  }

  updateLifeSummaryBar();
}

function displayEvent(event) {
  if (!event) return;

  eventTitle.className = 'chain-active';

  const chainType = getChainTypeForEvent(event);
  if (chainType) {
    eventTitle.classList.add(`event-chain-${chainType.toLowerCase()}`);
    eventTitle.classList.add('chain-active');
  }

  eventTitle.innerHTML = (chainType ? '<span class="chain-icon">⚭</span>' : '') + event.title;
  ui.typewriterEffect(eventProse, event.description, 8, null, event);
  eventTitle.style.display = 'block';
  eventProse.style.display = 'block';

  if (event.cascadeTags) {
    state.cascadeTags = event.cascadeTags;
  }
}

function showFragments(newFragments) {
  fragmentList.innerHTML = '';
  const recent = state.soul.fragments.slice(-3).reverse();
  for (const frag of recent) {
    const el = document.createElement('div');
    el.className = `fragment-shard${frag.isAnchor ? ' anchor' : ''}`;
    el.textContent = frag.value;
    el.title = `[${frag.type}] strength: ${frag.strength.toFixed(2)}${frag.isAnchor ? ' ★ anchor' : ''}`;
    fragmentList.appendChild(el);
  }
  fragBadge.textContent = `${state.soul.fragments.length} fragment${state.soul.fragments.length !== 1 ? 's' : ''}`;
}

function showDeathOverlay(deathEvent) {
  const life = state.currentLife;
  document.getElementById('death-cause').textContent = deathEvent?.title || 'Unknown causes';
  document.getElementById('death-summary').textContent = deathEvent?.description || '';
  document.getElementById('death-age').textContent = `age ${state.currentAge}`;
  document.getElementById('death-era').textContent = `${ERAS[life.era]?.label || life.era} • ${life.year}`;
  document.getElementById('death-life-num').textContent = `life #${state.soul.livesLived + 1}`;
  deathOverlay.classList.add('visible');

  // Show chain recap
  showChainRecapOnDeath(state.lifeEvents);

  // Screen effects
  app.classList.add('shake');
  lifeViewport.classList.add('red-flash');
  setTimeout(() => { app.classList.remove('shake'); lifeViewport.classList.remove('red-flash'); }, 600);
}

function hideDeathOverlay() {
  deathOverlay.classList.remove('visible');
}

function showAchievementNotifications(achievements) {
  if (!achievements || achievements.length === 0) return;

  for (let i = 0; i < achievements.length; i++) {
    const ach = achievements[i];
    setTimeout(() => {
      const notification = document.createElement('div');
      notification.className = `achievement-toast achievement-${ach.tier}`;
      notification.innerHTML = `
        <div class="achievement-icon">${ach.icon}</div>
        <div class="achievement-content">
          <div class="achievement-label">Achievement Unlocked</div>
          <div class="achievement-name">${ach.name}</div>
          <div class="achievement-desc">${ach.description}</div>
        </div>
      `;
      document.body.appendChild(notification);

      requestAnimationFrame(() => {
        notification.classList.add('show');
      });

      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
      }, 4000);
    }, i * 600);
  }
}

// ── Game Loop ──
function startLife() {
  // Create soul if needed
  if (!state.soul) state.soul = createSoulState();

  // Roll new life
  const roll = rollSoulLife(state.soul);
  state.currentLife = roll.life;
  state.currentAge = 0;
  state.lifeEvents = [];
  state.cascadeTags = [];
  state.isAlive = true;
  state.isPaused = false;
  state.deathEvent = null;
  state.eventMarkers = [];
  state.animProgress = 0;
  state.lifeTheme = null;
  state.activeChain = null;
  state.whisperCooldown = 0;
  state.currentWhisper = null;
  state.recentFragmentIds = [];
  state.connection = 1;
  state.vitality = 1;
  state.momentum = 1;
  state.landmarkEventsFired = [];
  updateResourceDisplay();
  if (state.whisperTimer) { clearInterval(state.whisperTimer); state.whisperTimer = null; }
  hideWhisperPanel();

  // UI reset
  hideDeathOverlay();
  ui.hideOverlay('overlay-soul-browser');
  ui.hideOverlay('overlay-limbo');
  idleMessage.style.display = 'none';
  phaseIndicator.style.display = 'flex';
  eventTitle.style.display = 'block';
  eventProse.style.display = 'block';
  lifeMeta.style.display = 'flex';

  // Reset chain visualizer
  const themeHeader = document.getElementById('life-theme-header');
  if (themeHeader) themeHeader.classList.remove('visible');

  eventTitle.textContent = `${state.currentLife.name} is born`;
  eventProse.textContent = `${ERAS[state.currentLife.era]?.label || state.currentLife.era}, ${state.currentLife.year}. ${state.currentLife.location.city}, ${state.currentLife.location.country}. A ${state.currentLife.health} ${state.currentLife.socialClass} enters the curve.`;
  metaAge.textContent = 'age 0';
  metaName.textContent = state.currentLife.name;
  metaLocation.textContent = `${state.currentLife.location.city}, ${state.currentLife.location.country}`;
  eraBadge.textContent = ERAS[state.currentLife.era]?.label || state.currentLife.era;

  lifeViewport.classList.add('new-life');
  setTimeout(() => lifeViewport.classList.remove('new-life'), 1500);

  // Animate curve draw
  animateCurveDraw();

  // Start tick loop
  if (state.tickInterval) clearInterval(state.tickInterval);
  state.tickInterval = setInterval(gameTick, SPEED_MAP[state.speed]);
}

function animateCurveDraw() {
  state.animProgress = 0;
  const startTime = performance.now();
  const duration = 1500;

  function step(now) {
    state.animProgress = Math.min(1, (now - startTime) / duration);
    drawCurve(state.animProgress);
    if (state.animProgress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function gameTick() {
  if (!state.isAlive || state.isPaused) return;

  const lifeState = {
    age: state.currentAge,
    era: state.currentLife.era,
    name: state.currentLife.name,
    location: state.currentLife.location.city,
    anchor: '',
  };

  const soulInfluences = { influences: [] };

  const result = eventTick(lifeState, soulInfluences, state.cascadeTags);

  state.currentAge = result.ageReached;

  if (result.died) {
    state.isAlive = false;
    state.deathEvent = result.event;
    clearInterval(state.tickInterval);
    state.tickInterval = null;

    // Add death event to life events
    if (result.event) {
      const deathEventWithAge = { ...result.event, age: state.currentAge, era: state.currentLife.era };
      state.lifeEvents.push(deathEventWithAge);
      // Add event marker
      state.eventMarkers.push({ age: state.currentAge, rate: getMortalityRate(Math.min(state.currentAge, 100)) });

      // Detect chain on death event
      const chainResult = detectChain(deathEventWithAge, state.lifeEvents);
      if (chainResult.chainEvent) {
        if (!state.activeChain) {
          state.activeChain = { type: chainResult.chainType, events: [], color: CHAIN_COLORS[chainResult.chainType] };
        }
        if (!state.activeChain.events.find(ev => ev.id === deathEventWithAge.id)) {
          state.activeChain.events.push(deathEventWithAge);
        }
      }

      // Generate life theme if we have enough events
      if (state.lifeEvents.length >= 2) {
        state.lifeTheme = generateLifeTheme(state.lifeEvents);
      }
    }

    // Extract fragments
    const { newFragments } = extractFragments(state.lifeEvents, result.event, state.soul);
    applyFragmentEffects(state.soul, newFragments);

    // Archive life in soul history
    if (!state.soul._lifeHistory) state.soul._lifeHistory = [];
    state.soul._lifeHistory.push({
      id: `life_${state.soul.livesLived}`,
      name: state.currentLife.name,
      era: state.currentLife.era,
      year: state.currentLife.year,
      location: state.currentLife.location,
      health: state.currentLife.health,
      socialClass: state.currentLife.socialClass,
      genderPresentation: state.currentLife.genderPresentation,
      age: state.currentAge,
      deathCause: result.event?.title || 'Unknown',
      events: [...state.lifeEvents],
      fragments: [...newFragments],
      dominantChain: state.lifeTheme?.theme || null,
      chainRecap: state.lifeTheme ? {
        type: state.lifeTheme.theme,
        label: state.lifeTheme.label,
        events: state.lifeTheme.events || [],
      } : null,
    });

    // Check achievements after death
    const newAchievements = world.checkAndUnlockAchievements(state.soul, state.lifeEvents, result.event);
    if (newAchievements.length > 0) {
      setTimeout(() => showAchievementNotifications(newAchievements), 800);
    }

    // Update UI
    updateUI();
    showFragments(newFragments);
    drawCurve();

    // Show death overlay after a beat
    setTimeout(() => showDeathOverlay(result.event), 500);
    return;
  }

  if (result.event) {
    const eventWithAge = { ...result.event, age: state.currentAge, era: state.currentLife.era };
    state.lifeEvents.push(eventWithAge);
    if (result.event.landmark) {
      state.landmarkEventsFired = state.landmarkEventsFired || [];
      state.landmarkEventsFired.push(result.event.id);
    }
    displayEvent(result.event);
    modifyResourcesForEvent(result.event);

    // Add event marker on curve
    state.eventMarkers.push({ age: state.currentAge, rate: getMortalityRate(Math.min(state.currentAge, 100)) });

    // Check for crisis event
    if (isCrisisEvent(result.event)) {
      state.isPaused = true;
      showCrisisPrompt(result.event, result.event.choices);
      return;
    }

    // Chain detection
    const chainResult = detectChain(eventWithAge, state.lifeEvents);
    if (chainResult.chainEvent) {
      if (!state.activeChain || state.activeChain.type !== chainResult.chainType) {
        state.activeChain = { type: chainResult.chainType, events: [], color: CHAIN_COLORS[chainResult.chainType] };
      }
      if (!state.activeChain.events.find(ev => ev.id === eventWithAge.id)) {
        state.activeChain.events.push(eventWithAge);
      }

      // Generate life theme when 2+ chain events exist
      if (state.activeChain.events.length >= 2) {
        state.lifeTheme = generateLifeTheme(state.lifeEvents);
      }
    }

    // Update chain visualizer
    renderChainStrip(state.activeChain);

    // Update life summary bar
    updateLifeSummaryBar();
  }

  // Whisper cooldown (only decrement when not in crisis)
  if (state.whisperCooldown > 0) state.whisperCooldown--;

  // Whisper trigger check — only when not in crisis, no active whisper, and cooldown is 0
  if (!state.currentWhisper && state.whisperCooldown <= 0 && !state.isPaused) {
    const currentPhase = getLifePhase(state.currentAge);
    const whisperFreq = getWhisperFrequency(state.soul, currentPhase);
    if (Math.random() < whisperFreq) {
      const fragment = selectWhisperingFragment(state.soul, state.currentLife.era, state.recentFragmentIds);
      if (fragment) {
        state.currentWhisper = fragment;
        showWhisperPanel(fragment);
      } else {
        state.whisperCooldown = 10;
      }
    }
  }

  updateUI();
  drawCurve();
}

function dieNow(isTacticalExit = false) {
  if (!state.isAlive) return;

  // If not tactical exit and resources > 0, show confirmation
  if (!isTacticalExit && (state.connection > 0 || state.vitality > 0 || state.momentum > 0)) {
    showExitConfirm();
    return;
  }

  const deathEvent = {
    id: 'death_force',
    title: 'You chose to leave',
    description: 'The curve bends but doesn\'t break. You step off at age ' + state.currentAge + '. The world keeps turning without you.',
    cascadeTags: ['resignation', 'dissolution'],
    category: 'circumstance',
    era: state.currentLife.era,
    age: state.currentAge,
  };

  state.isAlive = false;
  state.deathEvent = deathEvent;
  clearInterval(state.tickInterval);
  state.tickInterval = null;

  if (isTacticalExit) {
    state.connection = 0;
    state.vitality = 0;
    state.momentum = 0;
    updateResourceDisplay();
  }

  state.lifeEvents.push(deathEvent);
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

  const resourceBonus = (state.connection + state.vitality + state.momentum) / 9;
  const { newFragments } = extractFragments(state.lifeEvents, deathEvent, state.soul, resourceBonus);
  applyFragmentEffects(state.soul, newFragments);

  updateUI();
  showFragments(newFragments);
  drawCurve();

  setTimeout(() => showDeathOverlay(deathEvent, null, { isTacticalExit }), 500);
}

function showExitConfirm() {
  const overlay = document.getElementById('exit-confirm-overlay');
  const resEl = document.getElementById('exit-resources');
  const dot = (n) => '●'.repeat(n) + '○'.repeat(3 - n);
  resEl.innerHTML = `
    <span style="color:var(--chain-love)">${dot(state.connection)}</span> Connection &nbsp;
    <span style="color:var(--cyan)">${dot(state.vitality)}</span> Vitality &nbsp;
    <span style="color:var(--amber)">${dot(state.momentum)}</span> Momentum
  `;
  overlay.classList.add('visible');

  const confirmBtn = document.getElementById('btn-confirm-exit');
  const cancelBtn = document.getElementById('btn-cancel-exit');

  const cleanup = () => {
    overlay.classList.remove('visible');
    confirmBtn.removeEventListener('click', onConfirm);
    cancelBtn.removeEventListener('click', onCancel);
  };
  const onConfirm = () => { cleanup(); dieNow(true); };
  const onCancel = () => { cleanup(); };

  confirmBtn.addEventListener('click', onConfirm);
  cancelBtn.addEventListener('click', onCancel);
}

function hideExitConfirm() {
  document.getElementById('exit-confirm-overlay').classList.remove('visible');
}

function setSpeed(speed) {
  state.speed = speed;
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.speed === speed);
  });
  if (state.isAlive && state.tickInterval) {
    clearInterval(state.tickInterval);
    state.tickInterval = setInterval(gameTick, SPEED_MAP[speed]);
  }
}

// ── Event Listeners ──
document.getElementById('btn-new-life').addEventListener('click', startLife);
document.getElementById('btn-new-life-overlay').addEventListener('click', startLife);
document.getElementById('btn-end-life').addEventListener('click', () => dieNow(false));
document.getElementById('btn-close-death').addEventListener('click', () => { hideDeathOverlay(); });
document.getElementById('btn-view-soul').addEventListener('click', () => {
  hideDeathOverlay();
  setTimeout(() => {
    ui.showLimbo({ fragments: state.soul.fragments, anchors: state.soul.anchors });
    setTimeout(() => ui.showSoulBrowser(), 2500);
  }, 300);
});

function transitionFromDeathToLimbo() {
  hideDeathOverlay();
  if (!state.soul) state.soul = createSoulState();
  setTimeout(() => {
    state.soul.fragments = state.soul.fragments || [];
    state.soul.anchors = state.soul.anchors || [];
    ui.showLimbo({ fragments: state.soul.fragments, anchors: state.soul.anchors });
    setTimeout(() => ui.showSoulBrowser(), 2500);
  }, 300);
}

document.querySelectorAll('.speed-btn').forEach(btn => {
  btn.addEventListener('click', () => setSpeed(btn.dataset.speed));
});

document.getElementById('whisper-act-btn').addEventListener('click', handleWhisperAct);
document.getElementById('whisper-ignore-btn').addEventListener('click', handleWhisperIgnore);

document.addEventListener('keydown', (e) => {
  if (state.currentWhisper) {
    if (e.key === 'y' || e.key === 'Y') {
      handleWhisperAct();
    } else if (e.key === 'n' || e.key === 'N') {
      handleWhisperIgnore();
    }
  }
});

// ── Init ──
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
drawCurve(0);

// Initial idle state
eraBadge.textContent = '---';
fragBadge.textContent = '0 fragments';
hideWhisperPanel();
ui.showTitleScreen();
game.init();

// ── Title screen button delegation ──
document.addEventListener('click', (e) => {
  const action = e.target.dataset.action;
  if (!action) return;

  if (action === 'new-game') {
    ui.hideTitleScreen();
    startLife();
  } else if (action === 'continue' || action === 'continue-game') {
    transitionFromDeathToLimbo();
  } else if (action === 'reincarnate') {
    ui.hideOverlay('overlay-limbo');
    ui.hideOverlay('overlay-soul-browser');
    ui.hideOverlay('overlay-limbo');
    startLife();
  } else if (action === 'open-museum') {
    const soul = state.soul || { livesLived: 0, fragments: [], anchors: [], unlockedEras: ['ANCIENT', 'MEDIEVAL'], metaStats: {} };
    const allLives = soul._lifeHistory || [];
    import('./ui.js').then(({ openMuseum }) => openMuseum(soul, allLives));
  } else if (action === 'how-to-play') {
    import('./ui.js').then(({ showHowToPlayCarousel }) => showHowToPlayCarousel());
  }
});
