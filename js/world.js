/**
 * SOUL-CYCLE — World Reactivity System
 *
 * Tracks how soul fragments, anchors, and life events create
 * "echoes" and "ripples" in the world, and how the world
 * reacts back through complexity scoring, memory bleed,
 * resonance pairs, and mortality peaks.
 */

// ─── Data Constants ─────────────────────────────────────────────────────────

export const ERA_NARRATIVE_BEATS = {
  ANCIENT: {
    beats: [
      { age: 0, type: 'birth', intensity: 0.3, phrase: 'A soul enters the mortal curve' },
      { age: 7, type: 'first_word', intensity: 0.2, phrase: 'The name that shapes a lifetime' },
      { age: 13, type: 'awakening', intensity: 0.4, phrase: 'The world reveals its edges' },
      { age: 18, type: 'bond', intensity: 0.5, phrase: 'Someone becomes essential' },
      { age: 25, type: 'loss', intensity: 0.6, phrase: 'The first great absence' },
      { age: 35, type: 'purpose', intensity: 0.5, phrase: 'A calling crystallizes' },
      { age: 50, type: 'legacy', intensity: 0.4, phrase: 'What you leave behind' },
      { age: 65, type: 'reflection', intensity: 0.5, phrase: 'The shape of the journey seen' },
      { age: 80, type: 'release', intensity: 0.6, phrase: 'The letting go begins' },
    ],
    keyTags: ['grief', 'dread', 'connection', 'wonder', 'resignation'],
  },
  MEDIEVAL: {
    beats: [
      { age: 0, type: 'birth', intensity: 0.3, phrase: 'Baptized into the sacred covenant' },
      { age: 7, type: 'faith', intensity: 0.4, phrase: 'The church bells mark time and fate' },
      { age: 14, type: 'apprenticeship', intensity: 0.5, phrase: 'A trade becomes identity' },
      { age: 20, type: 'plague', intensity: 0.7, phrase: 'Death walks through the village' },
      { age: 30, type: 'love', intensity: 0.5, phrase: 'In the shadow of the abbey' },
      { age: 45, type: 'loss', intensity: 0.6, phrase: 'Children buried before parents' },
      { age: 60, type: 'grace', intensity: 0.5, phrase: 'Faith softens into acceptance' },
      { age: 75, type: 'resignation', intensity: 0.6, phrase: 'The plague took the rest' },
    ],
    keyTags: ['grief', 'grace', 'resignation', 'faith', 'dread'],
  },
  EARLY_MODERN: {
    beats: [
      { age: 0, type: 'birth', intensity: 0.3, phrase: 'Enlightenment dawns on the new world' },
      { age: 12, type: 'reason', intensity: 0.4, phrase: 'The old gods begin to falter' },
      { age: 18, type: 'departure', intensity: 0.5, phrase: 'The colonies call across the water' },
      { age: 28, type: 'betrayal', intensity: 0.6, phrase: 'The revolution eats its children' },
      { age: 40, type: 'discovery', intensity: 0.5, phrase: 'New horizons reshape the known' },
      { age: 55, type: 'alchemy', intensity: 0.4, phrase: 'Transformation of self and world' },
      { age: 70, type: 'memory', intensity: 0.5, phrase: 'The weight of what was built' },
      { age: 85, type: 'dissolution', intensity: 0.6, phrase: 'Old world, new world, no world' },
    ],
    keyTags: ['betrayal', 'discovery', 'vertigo', 'rage', 'awe'],
  },
  INDUSTRIAL: {
    beats: [
      { age: 0, type: 'birth', intensity: 0.3, phrase: 'Born into the smoke and piston' },
      { age: 10, type: 'factory', intensity: 0.6, phrase: 'The machines shape the hands' },
      { age: 20, type: 'union', intensity: 0.5, phrase: 'Voices join against the din' },
      { age: 30, type: 'war', intensity: 0.8, phrase: 'The trenches remember everything' },
      { age: 45, type: 'loss', intensity: 0.7, phrase: 'The fallen stay fallen' },
      { age: 60, type: 'recovery', intensity: 0.4, phrase: 'From ashes, something new' },
      { age: 75, type: 'legacy', intensity: 0.5, phrase: 'The workers who became the world' },
    ],
    keyTags: ['dread', 'grief', 'rage', 'connection', 'numbness'],
  },
  MODERN: {
    beats: [
      { age: 0, type: 'birth', intensity: 0.3, phrase: 'Screened into existence' },
      { age: 10, type: 'connection', intensity: 0.5, phrase: 'The network becomes the self' },
      { age: 20, type: 'alienation', intensity: 0.6, phrase: 'The screens watch back' },
      { age: 30, type: 'diagnosis', intensity: 0.5, phrase: 'The body reveals its limits' },
      { age: 45, type: 'loss', intensity: 0.6, phrase: 'The layoff, the divorce, the silence' },
      { age: 55, type: 'clarity', intensity: 0.4, phrase: 'What the noise was hiding' },
      { age: 70, type: 'connection', intensity: 0.5, phrase: 'The grandchildren and the photos' },
      { age: 85, type: 'grace', intensity: 0.6, phrase: 'Permission to stop running' },
    ],
    keyTags: ['isolation', 'connection', 'dread', 'vertigo', 'grace'],
  },
  NEAR_FUTURE: {
    beats: [
      { age: 0, type: 'birth', intensity: 0.3, phrase: 'Algorithmically tagged at birth' },
      { age: 12, type: 'algorithm', intensity: 0.5, phrase: 'The AI tutor knows too much' },
      { age: 25, type: 'climate', intensity: 0.7, phrase: 'The relocation notice arrives' },
      { age: 35, type: 'denial', intensity: 0.6, phrase: 'The system denies what the body knows' },
      { age: 50, type: 'neural', intensity: 0.5, phrase: 'The link opens new doors and closes others' },
      { age: 65, type: 'adaptation', intensity: 0.5, phrase: 'You become what you were against' },
      { age: 80, type: 'surrender', intensity: 0.6, phrase: 'The algorithm was right' },
    ],
    keyTags: ['dread', 'disorientation', 'rage', 'dissolution', 'awe'],
  },
  FAR_FUTURE: {
    beats: [
      { age: 0, type: 'birth', intensity: 0.3, phrase: 'Vat-grown or natural, the soul is the same' },
      { age: 20, type: 'enhancement', intensity: 0.5, phrase: 'The gene therapy works' },
      { age: 35, type: 'upload', intensity: 0.6, phrase: 'You choose the digital path' },
      { age: 50, type: 'connection', intensity: 0.5, phrase: 'The AI companion knows your grief' },
      { age: 65, type: 'signal', intensity: 0.7, phrase: 'The signal from the deep array arrives' },
      { age: 80, type: 'integration', intensity: 0.6, phrase: 'Human, posthuman, both, neither' },
      { age: 95, type: 'transcendence', intensity: 0.7, phrase: 'The substrate releases what it held' },
    ],
    keyTags: ['awe', 'vertigo', 'dissolution', 'connection', 'grace'],
  },
};

export const MORTALITY_PEAK_PHRASES = {
  infant_critical: [
    'The early years hold no guarantees',
    'Infant mortality shapes the curve',
    'The first breath is not promised',
  ],
  adolescent_rise: [
    'The mortality curve bends upward',
    'Reckless years bring new risks',
    'The body tests its limits',
  ],
  middle_age_acceleration: [
    'The midlife mortality spike approaches',
    'The curve steepens imperceptibly',
    'Years accumulate like interest on a debt',
  ],
  senior_critical: [
    'The final mortality peak approaches',
    'Every year becomes a negotiation',
    'The curve approaches infinity',
  ],
  ancient_extreme: [
    'The probability of ending grows certainty',
    'Outliers become the norm',
    'The curve has no ceiling here',
  ],
  peak_moment: [
    'A mortality peak is reached',
    'The probability of ending aligns with the moment',
    'The world reminds the soul of its terms',
  ],
};

export const RESONANCE_PAIRS = [
  { tag1: 'grief', tag2: 'grace', resonance: 0.8, phrase: 'Loss softens into acceptance' },
  { tag1: 'dread', tag2: 'vertigo', resonance: 0.7, phrase: 'Fear spirals into disorientation' },
  { tag1: 'wonder', tag2: 'awe', resonance: 0.9, phrase: 'Curiosity becomes reverence' },
  { tag1: 'rage', tag2: 'betrayal', resonance: 0.75, phrase: 'Anger born of broken trust' },
  { tag1: 'connection', tag2: 'tenderness', resonance: 0.85, phrase: 'Bonds deepen into care' },
  { tag1: 'loss', tag2: 'resignation', resonance: 0.7, phrase: 'Grief settles into acceptance' },
  { tag1: 'isolation', tag2: 'dissolution', resonance: 0.65, phrase: 'Alone becomes forgotten' },
  { tag1: 'numbness', tag2: 'disorientation', resonance: 0.6, phrase: 'Detachment creates fog' },
  { tag1: 'faith', tag2: 'grace', resonance: 0.8, phrase: 'Belief finds its reward' },
  { tag1: 'awakening', tag2: 'clarity', resonance: 0.75, phrase: 'Vision clears into truth' },
  { tag1: 'triumph', tag2: 'legacy', resonance: 0.7, phrase: 'Victory outlasts the victor' },
  { tag1: 'longing', tag2: 'anchor', resonance: 0.6, phrase: 'Yearning finds its mooring' },
];

export const ACHIEVEMENT_DEFS = {
  gone_too_soon: {
    id: 'gone_too_soon',
    name: 'Gone Too Soon',
    description: 'Die before age 5',
    icon: '⚰',
    tier: 'bronze',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'lifespan' && deathEvent && deathEvent.age < 5,
    reward: null,
    category: 'lifespan',
  },
  centurian: {
    id: 'centurian',
    name: 'Centurian',
    description: 'Live to age 80 or beyond',
    icon: '👴',
    tier: 'silver',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'lifespan' && deathEvent && deathEvent.age >= 80,
    reward: { type: 'bonus_fragment_slot' },
    category: 'lifespan',
  },
  methuselah: {
    id: 'methuselah',
    name: 'Methuselah',
    description: 'Live to age 100 or beyond',
    icon: '🧓',
    tier: 'gold',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'lifespan' && deathEvent && deathEvent.age >= 100,
    reward: { type: 'bonus_fragment_slot' },
    category: 'lifespan',
  },
  ancient_of_days: {
    id: 'ancient_of_days',
    name: 'Ancient of Days',
    description: 'Live to age 110 or beyond',
    icon: '🌳',
    tier: 'platinum',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'lifespan' && deathEvent && deathEvent.age >= 110,
    reward: { type: 'unlock_era', era: 'FAR_FUTURE' },
    category: 'lifespan',
  },
  fragment_awakening: {
    id: 'fragment_awakening',
    name: 'Fragment Awakening',
    description: 'Collect your first fragment',
    icon: '💎',
    tier: 'bronze',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'fragment' && soul.fragments?.length >= 1,
    reward: null,
    category: 'fragment',
  },
  memory_keeper: {
    id: 'memory_keeper',
    name: 'Memory Keeper',
    description: 'Collect 10 fragments',
    icon: '📚',
    tier: 'silver',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'fragment' && soul.fragments?.length >= 10,
    reward: { type: 'bonus_fragment_slot' },
    category: 'fragment',
  },
  fragment_collector: {
    id: 'fragment_collector',
    name: 'Fragment Collector',
    description: 'Collect 25 fragments',
    icon: '🏛️',
    tier: 'gold',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'fragment' && soul.fragments?.length >= 25,
    reward: { type: 'bonus_fragment_slot' },
    category: 'fragment',
  },
  archive_of_lives: {
    id: 'archive_of_lives',
    name: 'Archive of Lives',
    description: 'Collect 50 fragments',
    icon: '🗄️',
    tier: 'platinum',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'fragment' && soul.fragments?.length >= 50,
    reward: { type: 'unlock_era', era: 'FAR_FUTURE' },
    category: 'fragment',
  },
  anchor_born: {
    id: 'anchor_born',
    name: 'Anchor Born',
    description: 'Form your first anchor',
    icon: '⚓',
    tier: 'bronze',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'anchor' && soul.anchors?.length >= 1,
    reward: null,
    category: 'anchor',
  },
  trinity_of_echoes: {
    id: 'trinity_of_echoes',
    name: 'Trinity of Echoes',
    description: 'Form 3 anchors',
    icon: '🔱',
    tier: 'silver',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'anchor' && soul.anchors?.length >= 3,
    reward: { type: 'bonus_fragment_slot' },
    category: 'anchor',
  },
  constellation_of_echoes: {
    id: 'constellation_of_echoes',
    name: 'Constellation of Echoes',
    description: 'Form 5 anchors',
    icon: '✨',
    tier: 'gold',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'anchor' && soul.anchors?.length >= 5,
    reward: { type: 'special_anchor_type' },
    category: 'anchor',
  },
  era_hopper: {
    id: 'era_hopper',
    name: 'Era Hopper',
    description: 'Live in 4 different eras',
    icon: '🗺️',
    tier: 'silver',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'era' && (soul.unlockedEras?.length || 0) >= 4,
    reward: null,
    category: 'era',
  },
  era_walker: {
    id: 'era_walker',
    name: 'Era Walker',
    description: 'Live in all 7 eras',
    icon: '🌍',
    tier: 'gold',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'era' && (soul.unlockedEras?.length || 0) >= 7,
    reward: { type: 'unlock_era', era: 'FAR_FUTURE' },
    category: 'era',
  },
  omnitemporal: {
    id: 'omnitemporal',
    name: 'Omnitemporal',
    description: 'Witness every era across your journeys',
    icon: '🌎',
    tier: 'platinum',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'era' && (soul.unlockedEras?.length || 0) >= 7 && soul.livesLived >= 10,
    reward: { type: 'special_title', title: 'Omnitemporal Wanderer' },
    category: 'era',
  },
  storm_survivor: {
    id: 'storm_survivor',
    name: 'Storm Survivor',
    description: 'Survive 5 crises',
    icon: '⛈️',
    tier: 'bronze',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'crisis' && (soul.metaStats?.crisesSurvived || 0) >= 5,
    reward: null,
    category: 'crisis',
  },
  crisis_forger: {
    id: 'crisis_forger',
    name: 'Crisis Forger',
    description: 'Survive 10 crises',
    icon: '⚡',
    tier: 'silver',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'crisis' && (soul.metaStats?.crisesSurvived || 0) >= 10,
    reward: { type: 'bonus_fragment_slot' },
    category: 'crisis',
  },
  unbreakable: {
    id: 'unbreakable',
    name: 'Unbreakable',
    description: 'Survive 25 crises',
    icon: '🛡️',
    tier: 'gold',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'crisis' && (soul.metaStats?.crisesSurvived || 0) >= 25,
    reward: { type: 'bonus_fragment_slot' },
    category: 'crisis',
  },
  grief_weaver: {
    id: 'grief_weaver',
    name: 'Grief Weaver',
    description: 'Complete a grief chain of 5+ events',
    icon: '💔',
    tier: 'silver',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'chain' && countChainType(lifeEvents, 'GRIEF') >= 5,
    reward: null,
    category: 'chain',
  },
  love_weaver: {
    id: 'love_weaver',
    name: 'Love Weaver',
    description: 'Complete a love chain of 5+ events',
    icon: '❤️',
    tier: 'silver',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'chain' && countChainType(lifeEvents, 'LOVE') >= 5,
    reward: null,
    category: 'chain',
  },
  dread_weaver: {
    id: 'dread_weaver',
    name: 'Dread Weaver',
    description: 'Complete a dread chain of 5+ events',
    icon: '👁️',
    tier: 'silver',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'chain' && countChainType(lifeEvents, 'DREAD') >= 5,
    reward: null,
    category: 'chain',
  },
  wonder_weaver: {
    id: 'wonder_weaver',
    name: 'Wonder Weaver',
    description: 'Complete a wonder chain of 5+ events',
    icon: '✨',
    tier: 'silver',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'chain' && countChainType(lifeEvents, 'WONDER') >= 5,
    reward: null,
    category: 'chain',
  },
  rage_weaver: {
    id: 'rage_weaver',
    name: 'Rage Weaver',
    description: 'Complete a rage chain of 5+ events',
    icon: '🔥',
    tier: 'silver',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'chain' && countChainType(lifeEvents, 'RAGE') >= 5,
    reward: null,
    category: 'chain',
  },
  grace_weaver: {
    id: 'grace_weaver',
    name: 'Grace Weaver',
    description: 'Complete a grace chain of 5+ events',
    icon: '🕊️',
    tier: 'silver',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'chain' && countChainType(lifeEvents, 'GRACE') >= 5,
    reward: { type: 'bonus_fragment_slot' },
    category: 'chain',
  },
  chain_master: {
    id: 'chain_master',
    name: 'Chain Master',
    description: 'Complete chains of 5+ events in all 6 emotional categories',
    icon: '🔮',
    tier: 'platinum',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'chain' &&
      countChainType(lifeEvents, 'GRIEF') >= 5 &&
      countChainType(lifeEvents, 'LOVE') >= 5 &&
      countChainType(lifeEvents, 'DREAD') >= 5 &&
      countChainType(lifeEvents, 'WONDER') >= 5 &&
      countChainType(lifeEvents, 'RAGE') >= 5 &&
      countChainType(lifeEvents, 'GRACE') >= 5,
    reward: { type: 'special_title', title: 'Master of All Chains' },
    category: 'chain',
  },
  speedrunner: {
    id: 'speedrunner',
    name: 'Speedrunner',
    description: 'Accumulate 10 fragments in under 5 lives',
    icon: '🚀',
    tier: 'gold',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'speedrunner' && soul.livesLived < 5 && (soul.fragments?.length || 0) >= 10,
    reward: { type: 'bonus_fragment_slot' },
    category: 'speedrunner',
  },
  swift_collector: {
    id: 'swift_collector',
    name: 'Swift Collector',
    description: 'Accumulate 25 fragments in under 10 lives',
    icon: '💨',
    tier: 'platinum',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'speedrunner' && soul.livesLived < 10 && (soul.fragments?.length || 0) >= 25,
    reward: { type: 'special_title', title: 'Swift Soul' },
    category: 'speedrunner',
  },
  gentle_release: {
    id: 'gentle_release',
    name: 'Gentle Release',
    description: 'Die of old age',
    icon: '😌',
    tier: 'bronze',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'peaceful' && isPeacefulDeath(deathEvent),
    reward: null,
    category: 'peaceful',
  },
  violent_passage: {
    id: 'violent_passage',
    name: 'Violent Passage',
    description: 'Die violently',
    icon: '⚔️',
    tier: 'bronze',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'peaceful' && isViolentDeath(deathEvent),
    reward: null,
    category: 'peaceful',
  },
  complexity_ascendant: {
    id: 'complexity_ascendant',
    name: 'Complexity Ascendant',
    description: 'Reach 50 complexity',
    icon: '🔮',
    tier: 'gold',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'special' && getSoulComplexityScore(soul) >= 50,
    reward: { type: 'bonus_fragment_slot' },
    category: 'special',
  },
  memory_bleedthrough: {
    id: 'memory_bleedthrough',
    name: 'Memory Bleedthrough',
    description: 'Fragments from past lives resonate in the present',
    icon: '🩸',
    tier: 'silver',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'special' && (soul.metaStats?.memoryBleeds || 0) >= 3,
    reward: null,
    category: 'special',
  },
  resonance_master: {
    id: 'resonance_master',
    name: 'Resonance Master',
    description: 'Create 2 resonance pairs',
    icon: '🎭',
    tier: 'gold',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'special' && (soul.metaStats?.resonancePairs || 0) >= 2,
    reward: { type: 'bonus_fragment_slot' },
    category: 'special',
  },
  peak_survivor: {
    id: 'peak_survivor',
    name: 'Peak Survivor',
    description: 'Survive a mortality peak',
    icon: '🏔️',
    tier: 'silver',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'special' && (soul.metaStats?.peaksSurvived || 0) >= 1,
    reward: null,
    category: 'special',
  },
  meta_achiever: {
    id: 'meta_achiever',
    name: 'Achiever',
    description: 'Unlock 10 achievements',
    icon: '🏆',
    tier: 'platinum',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'special' && (soul.achievementsUnlocked?.length || 0) >= 10,
    reward: { type: 'special_title', title: 'Achievement Seeker' },
    category: 'special',
  },
  soul_pool_complete: {
    id: 'soul_pool_complete',
    name: 'Soul Pool Complete',
    description: 'Ten fragments create a world',
    icon: '🌍',
    tier: 'silver',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'fragment' && soul.fragments?.length >= 10,
    reward: null,
    category: 'fragment',
  },
  life_theme_crystallized: {
    id: 'life_theme_crystallized',
    name: 'Life Theme Crystallized',
    description: 'A throughline emerges from chaos',
    icon: '💫',
    tier: 'bronze',
    condition: (soul, lifeEvents, deathEvent, category) => category === 'chain' && lifeEvents.length >= 5,
    reward: null,
    category: 'chain',
  },
};

const CHAIN_TAG_MAP = {
  GRIEF: ['grief', 'sadness', 'sorrow', 'mourning', 'loss', 'despair', 'melancholy'],
  LOVE: ['connection', 'tenderness', 'love', 'affection', 'devotion', 'passion', 'romance'],
  DREAD: ['dread', 'vertigo', 'fear', 'terror', 'anxiety', 'panic', 'horror'],
  WONDER: ['wonder', 'awe', 'discovery', 'curiosity', 'marvel'],
  RAGE: ['rage', 'anger', 'betrayal', 'fury', 'wrath', 'resentment'],
  GRACE: ['grace', 'resignation', 'acceptance', 'peace', 'surrender'],
};

function countChainType(lifeEvents, chainType) {
  const tags = CHAIN_TAG_MAP[chainType] || [];
  let maxCount = 0;
  let currentCount = 0;
  for (const event of lifeEvents) {
    if (!event || !event.cascadeTags) continue;
    const hasChainTag = event.cascadeTags.some(t => tags.includes(t.toLowerCase()));
    if (hasChainTag) {
      currentCount++;
      maxCount = Math.max(maxCount, currentCount);
    } else {
      currentCount = 0;
    }
  }
  return maxCount;
}

function isViolentDeath(deathEvent) {
  if (!deathEvent) return false;
  const cause = (deathEvent.cause || deathEvent.type || deathEvent.category || deathEvent.title || '').toLowerCase();
  return ['murder', 'kill', 'stab', 'shoot', 'crash', 'accident', 'fall', 'drown', 'burn', 'fire', 'war', 'battle', 'fight', 'attack', 'poison', 'execution', 'suicide', 'homicide', 'violence', 'blood', 'wound', 'injury', 'fatal', 'trauma', 'predator', 'battlefield', 'arrow', 'cannon', 'plague', 'fever', 'rival', 'hanging', 'shipwreck', 'overdose', 'climate', 'drone', 'weapon', 'malfunction', 'purge', 'rejection'].some(kw => cause.includes(kw));
}

function isPeacefulDeath(deathEvent) {
  if (!deathEvent) return false;
  const cause = (deathEvent.cause || deathEvent.type || deathEvent.category || deathEvent.title || '').toLowerCase();
  return ['old age', 'natural', 'peaceful', 'sleep', 'slept', 'passed', 'quiet', 'gentle', 'illness', 'disease', 'cancer', 'heart', 'organ failure', 'time', 'decline', 'cold', 'stroke', 'hospital', 'gives out'].some(kw => cause.includes(kw));
}

export function checkAndUnlockAchievements(soulState, lifeEvents, deathEvent) {
  if (!soulState) return [];
  if (!soulState.achievementsUnlocked) soulState.achievementsUnlocked = [];
  if (!soulState.achievementNotifications) soulState.achievementNotifications = [];

  const newlyUnlocked = [];
  const categories = ['lifespan', 'fragment', 'anchor', 'era', 'crisis', 'chain', 'speedrunner', 'peaceful', 'special'];

  for (const [id, def] of Object.entries(ACHIEVEMENT_DEFS)) {
    if (soulState.achievementsUnlocked.includes(id)) continue;

    for (const category of categories) {
      try {
        if (def.condition(soulState, lifeEvents, deathEvent, category)) {
          soulState.achievementsUnlocked.push(id);
          const notification = {
            id,
            name: def.name,
            description: def.description,
            icon: def.icon,
            tier: def.tier,
            reward: def.reward,
            timestamp: Date.now(),
          };
          soulState.achievementNotifications.push(notification);
          newlyUnlocked.push(notification);
          applyAchievementReward(soulState, def.reward);
          break;
        }
      } catch (e) {
        // Skip on error
      }
    }
  }

  return newlyUnlocked;
}

function applyAchievementReward(soulState, reward) {
  if (!reward) return;

  switch (reward.type) {
    case 'bonus_fragment_slot':
      if (!soulState.bonusFragmentSlots) soulState.bonusFragmentSlots = 0;
      soulState.bonusFragmentSlots += 1;
      break;
    case 'unlock_era':
      if (reward.era && soulState.unlockedEras && !soulState.unlockedEras.includes(reward.era)) {
        soulState.unlockedEras.push(reward.era);
      }
      break;
    case 'special_anchor_type':
      if (!soulState.specialUnlocks) soulState.specialUnlocks = {};
      soulState.specialUnlocks.enhancedAnchor = true;
      break;
    case 'special_title':
      if (!soulState.specialUnlocks) soulState.specialUnlocks = {};
      soulState.specialUnlocks.title = reward.title;
      break;
  }
}

export function popAchievementNotification(soulState) {
  if (!soulState || !soulState.achievementNotifications || soulState.achievementNotifications.length === 0) {
    return null;
  }
  return soulState.achievementNotifications.shift();
}

export function getAchievementStats(soulState) {
  if (!soulState) return { total: 0, unlocked: 0, byTier: {}, byCategory: {} };
  const total = Object.keys(ACHIEVEMENT_DEFS).length;
  const unlocked = soulState.achievementsUnlocked?.length || 0;
  const byTier = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
  const byCategory = {};

  for (const id of soulState.achievementsUnlocked || []) {
    const def = ACHIEVEMENT_DEFS[id];
    if (def) {
      byTier[def.tier] = (byTier[def.tier] || 0) + 1;
      byCategory[def.category] = (byCategory[def.category] || 0) + 1;
    }
  }

  return { total, unlocked, byTier, byCategory };
}

// ─── Complexity Score ───────────────────────────────────────────────────────

export function getSoulComplexityScore(soulState) {
  if (!soulState) return 0;

  let score = 0;

  const fragmentCount = soulState.fragments?.length || 0;
  score += fragmentCount * 2;

  const anchorCount = soulState.anchors?.length || 0;
  score += anchorCount * 5;

  const livesCount = soulState.livesLived || 0;
  score += livesCount * 3;

  const yearsCount = soulState.totalYearsLived || 0;
  score += Math.floor(yearsCount / 10);

  if (soulState.metaStats) {
    const { violentDeaths = 0, peacefulDeaths = 0, lovesLost = 0 } = soulState.metaStats;
    score += violentDeaths * 4;
    score += peacefulDeaths * 2;
    score += lovesLost * 3;
  }

  const eraCount = soulState.unlockedEras?.length || 2;
  score += eraCount * 2;

  return Math.min(score, 100);
}

export function getUnlockedErasFromComplexity(complexityScore) {
  const baseEras = ['ANCIENT', 'MEDIEVAL'];
  const allEras = ['ANCIENT', 'MEDIEVAL', 'EARLY_MODERN', 'INDUSTRIAL', 'MODERN', 'NEAR_FUTURE', 'FAR_FUTURE'];

  if (complexityScore < 5) return baseEras;
  if (complexityScore < 10) return allEras.slice(0, 3);
  if (complexityScore < 20) return allEras.slice(0, 4);
  if (complexityScore < 35) return allEras.slice(0, 5);
  if (complexityScore < 50) return allEras.slice(0, 6);
  return allEras;
}

// ─── World Echoes ──────────────────────────────────────────────────────────

export function getFragmentWorldEchoes(soulState, currentEra) {
  const echoes = [];

  if (!soulState?.fragments) return echoes;

  for (const fragment of soulState.fragments) {
    const strength = fragment.strength || 0;
    if (strength < 0.3) continue;

    const eraMatch = fragment.origin?.era === currentEra;
    const isAnchor = fragment.isAnchor || false;

    const echo = {
      fragmentId: fragment.id,
      type: fragment.type,
      value: fragment.value,
      intensity: strength * (eraMatch ? 1.5 : 1.0),
      isAnchor,
      echoRadius: isAnchor ? 3 : Math.floor(strength * 2),
      cascadeTags: fragment.cascadeTags || [],
      phrase: buildEchoPhrase(fragment, currentEra),
    };

    echoes.push(echo);
  }

  return echoes.sort((a, b) => b.intensity - a.intensity);
}

function buildEchoPhrase(fragment, currentEra) {
  const typePhrases = {
    tone: 'A tonal echo reverberates through the era',
    fear: 'Fear leaves its mark on the world',
    love: 'Love creates ripples of connection',
    location: 'A place echoes with past significance',
    name: 'A name surfaces from the collective memory',
    object: 'An object resonates across time',
    word: 'A word carries persistent weight',
    warning: 'A warning echoes through the ages',
  };

  const base = typePhrases[fragment.type] || 'A fragment leaves its mark';
  if (fragment.isAnchor) return `★ ${base} [ANCHOR]`;
  return base;
}

export function getAnchorWorldEchos(soulState) {
  const echos = [];

  if (!soulState?.anchors) return echos;

  for (const anchor of soulState.anchors) {
    const echo = {
      anchorId: anchor.id,
      value: anchor.value,
      type: anchor.type,
      strength: anchor.strength || 0.5,
      worldReactivity: calculateAnchorWorldReactivity(anchor),
      phrase: `★ ANCHOR: "${anchor.value}"`,
      echoRange: 3,
      resonanceBoost: 0.2,
    };

    echos.push(echo);
  }

  return echos.sort((a, b) => b.strength - a.strength);
}

function calculateAnchorWorldReactivity(anchor) {
  let reactivity = anchor.strength || 0;

  if (anchor.cascadeTags) {
    if (anchor.cascadeTags.includes('grief')) reactivity *= 1.2;
    if (anchor.cascadeTags.includes('love')) reactivity *= 1.15;
    if (anchor.cascadeTags.includes('rage')) reactivity *= 1.1;
  }

  return Math.min(reactivity, 1.0);
}

export function getConsequenceWorldRipples(soulState, lifeEvents) {
  const ripples = [];

  if (!lifeEvents || lifeEvents.length === 0) return ripples;

  for (let i = 0; i < lifeEvents.length; i++) {
    const event = lifeEvents[i];
    if (!event?.cascadeTags || event.cascadeTags.length === 0) continue;

    const intensity = event.intensity || event.emotionalIntensity || 0.5;
    const age = event.age || 0;

    const ripple = {
      eventId: event.id,
      title: event.title,
      cascadeTags: event.cascadeTags,
      intensity,
      age,
      rippleRadius: calculateRippleRadius(event),
      worldConsequence: calculateWorldConsequence(event),
      phrase: buildRipplePhrase(event),
    };

    ripples.push(ripple);
  }

  return ripples.sort((a, b) => b.intensity - a.intensity);
}

function calculateRippleRadius(event) {
  let radius = 1;

  if (event.cascadeTags.includes('grief')) radius += 1;
  if (event.cascadeTags.includes('rage')) radius += 1;
  if (event.cascadeTags.includes('betrayal')) radius += 2;
  if (event.cascadeTags.includes('connection')) radius += 1;

  const intensity = event.intensity || event.emotionalIntensity || 0.5;
  radius += Math.floor(intensity * 2);

  return Math.min(radius, 5);
}

function calculateWorldConsequence(event) {
  let consequence = 0;

  if (event.category === 'violence') consequence += 2;
  if (event.category === 'relationship') consequence += 1;
  if (event.crisisTag) consequence += 2;
  if (event.isDeathEvent) consequence += 3;

  return Math.min(consequence, 10);
}

function buildRipplePhrase(event) {
  const intensity = event.intensity || event.emotionalIntensity || 0.5;
  if (intensity >= 0.8) return `◆ MAJOR CONSEQUENCE: ${event.title}`;
  if (intensity >= 0.5) return `◇ consequence ripples from: ${event.title}`;
  return `· small ripple from: ${event.title}`;
}

// ─── Memory Bleed ──────────────────────────────────────────────────────────

export function getMemoryBleed(soulState, currentLife) {
  const bleed = {
    crossLifeFragments: [],
    bleedingAnchors: [],
    eraBleedthrough: [],
    phrase: '',
  };

  if (!soulState?.fragments || !currentLife) return bleed;

  const currentEra = currentLife.era;
  const currentLifeId = currentLife.id || `life_${soulState.livesLived}`;

  for (const fragment of soulState.fragments) {
    if (!fragment.origin) continue;

    const originLifeId = fragment.origin.lifeId || '';
    if (originLifeId === currentLifeId) continue;

    const bleedEntry = {
      fragmentId: fragment.id,
      value: fragment.value,
      type: fragment.type,
      originLife: originLifeId,
      originEra: fragment.origin.era,
      originAge: fragment.origin.age,
      bleedIntensity: fragment.strength * 0.5,
      phrase: `Fragment from ${fragment.origin.era} bleeds through`,
    };

    if (fragment.isAnchor) {
      bleed.bleedingAnchors.push({ ...bleedEntry, anchorResonance: fragment.strength });
    } else {
      bleed.crossLifeFragments.push(bleedEntry);
    }
  }

  const erasWithBleed = new Set([
    ...bleed.crossLifeFragments.map(f => f.originEra),
    ...bleed.bleedingAnchors.map(a => a.originEra),
  ]);

  bleed.eraBleedthrough = Array.from(erasWithBleed);

  const totalBleed = bleed.crossLifeFragments.length + bleed.bleedingAnchors.length;
  if (totalBleed === 0) {
    bleed.phrase = 'No memory bleed detected';
  } else if (totalBleed < 3) {
    bleed.phrase = 'Faint memories seep through from past lives';
  } else if (totalBleed < 6) {
    bleed.phrase = 'Memory bleed is significant — past and present blur';
  } else {
    bleed.phrase = 'Strong memory bleed — the soul carries much from before';
  }

  return bleed;
}

// ─── Resonance Pairs ────────────────────────────────────────────────────────

export function checkResonancePairs(soulState) {
  const resonanceEvents = [];
  const pairHits = [];

  if (!soulState?.fragments) return { resonanceEvents, pairHits };

  const tagCounts = {};
  for (const fragment of soulState.fragments) {
    if (fragment.cascadeTags) {
      for (const tag of fragment.cascadeTags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + fragment.strength;
      }
    }
  }

  for (const pair of RESONANCE_PAIRS) {
    const tag1Count = tagCounts[pair.tag1] || 0;
    const tag2Count = tagCounts[pair.tag2] || 0;

    if (tag1Count > 0 && tag2Count > 0) {
      const combinedStrength = Math.min(tag1Count + tag2Count, 2);
      if (combinedStrength >= pair.resonance * 1.5) {
        pairHits.push({
          tag1: pair.tag1,
          tag2: pair.tag2,
          resonance: pair.resonance,
          combinedStrength,
          phrase: pair.phrase,
          isActive: true,
        });
      }
    }
  }

  return { resonanceEvents, pairHits };
}

// ─── Memory Chain ──────────────────────────────────────────────────────────

export function createMemoryChainEntry(soulState, lifeEvents, chainType) {
  if (!chainType || !lifeEvents || lifeEvents.length === 0) return null;

  const chainEvents = lifeEvents.filter(e => {
    if (!e?.cascadeTags) return false;
    return e.cascadeTags.some(t => {
      const tLower = t.toLowerCase();
      const chainTags = {
        GRIEF: ['grief', 'sadness', 'sorrow', 'mourning', 'loss', 'despair', 'melancholy'],
        LOVE: ['connection', 'tenderness', 'love', 'affection', 'devotion', 'passion', 'romance'],
        DREAD: ['dread', 'vertigo', 'fear', 'terror', 'anxiety', 'panic', 'horror'],
        WONDER: ['wonder', 'awe', 'discovery', 'curiosity', 'marvel'],
        RAGE: ['rage', 'anger', 'betrayal', 'fury', 'wrath', 'resentment'],
        GRACE: ['grace', 'resignation', 'acceptance', 'peace', 'surrender'],
      };
      return chainTags[chainType]?.some(ct => tLower.includes(ct));
    });
  });

  if (chainEvents.length < 2) return null;

  return {
    chainType,
    events: chainEvents.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      age: e.age,
      era: e.era,
      cascadeTags: e.cascadeTags,
      intensity: e.intensity || e.emotionalIntensity || 0.5,
    })),
    motif: identifyChainMotif(chainType, chainEvents),
    phrase: buildChainPhrase(chainType, chainEvents.length),
  };
}

function identifyChainMotif(chainType, events) {
  const motifs = {
    GRIEF: ['accumulation', 'echo', 'absence', 'weight'],
    LOVE: ['connection', 'warmth', 'devotion', 'loss'],
    DREAD: ['buildup', 'anticipation', 'inevitability', 'shadow'],
    WONDER: ['discovery', 'awe', 'curiosity', 'revelation'],
    RAGE: ['explosion', 'justification', 'destruction', 'partition'],
    GRACE: ['release', 'acceptance', 'peace', 'transcendence'],
  };

  const possibleMotifs = motifs[chainType] || ['pattern'];
  return possibleMotifs[events.length % possibleMotifs.length];
}

function buildChainPhrase(chainType, eventCount) {
  const phrases = {
    GRIEF: `A grief chain of ${eventCount} events`,
    LOVE: `A love chain of ${eventCount} events`,
    DREAD: `A dread chain of ${eventCount} events`,
    WONDER: `A wonder chain of ${eventCount} events`,
    RAGE: `A rage chain of ${eventCount} events`,
    GRACE: `A grace chain of ${eventCount} events`,
  };

  return phrases[chainType] || `A chain of ${eventCount} events`;
}

export function getMemoryChainMotifs(soulState, lifeEvents) {
  const motifs = [];
  const chainTypes = ['GRIEF', 'LOVE', 'DREAD', 'WONDER', 'RAGE', 'GRACE'];

  for (const chainType of chainTypes) {
    const chain = createMemoryChainEntry(soulState, lifeEvents, chainType);
    if (chain) {
      motifs.push({
        type: chainType,
        motif: chain.motif,
        eventCount: chain.events.length,
        phrase: chain.phrase,
      });
    }
  }

  return motifs;
}

// ─── Life Theme Bias ────────────────────────────────────────────────────────

export function getLifeThemeBias(lifeEvents) {
  if (!lifeEvents || lifeEvents.length < 3) return null;

  const tagScores = {};

  for (const event of lifeEvents) {
    if (!event?.cascadeTags) continue;
    const intensity = event.intensity || event.emotionalIntensity || 0.5;

    for (const tag of event.cascadeTags) {
      tagScores[tag] = (tagScores[tag] || 0) + intensity;
    }
  }

  let maxTag = null;
  let maxScore = 0;

  for (const [tag, score] of Object.entries(tagScores)) {
    if (score > maxScore) {
      maxScore = score;
      maxTag = tag;
    }
  }

  if (!maxTag || maxScore < 1.5) return null;

  const themeMap = {
    grief: 'GRIEF', sadness: 'GRIEF', loss: 'GRIEF', mourning: 'GRIEF',
    love: 'LOVE', connection: 'LOVE', tenderness: 'LOVE', affection: 'LOVE',
    dread: 'DREAD', fear: 'DREAD', terror: 'DREAD', vertigo: 'DREAD',
    wonder: 'WONDER', awe: 'WONDER', discovery: 'WONDER', curiosity: 'WONDER',
    rage: 'RAGE', anger: 'RAGE', betrayal: 'RAGE', fury: 'RAGE',
    grace: 'GRACE', acceptance: 'GRACE', peace: 'GRACE', resignation: 'GRACE',
  };

  const bias = themeMap[maxTag.toLowerCase()] || 'WONDER';

  return {
    bias,
    dominantTag: maxTag,
    score: maxScore,
    phrase: `Life biased toward ${bias.toLowerCase()}`,
    label: getThemeLabel(bias),
  };
}

function getThemeLabel(bias) {
  const labels = {
    GRIEF: 'The weight of accumulated loss',
    LOVE: 'Connection as throughline',
    DREAD: 'Anticipation of the worst',
    WONDER: 'Discovery as compass',
    RAGE: 'Indignation as structure',
    GRACE: 'Acceptance as goal',
  };
  return labels[bias] || 'An undefined theme';
}

// ─── World Reactivity Application ─────────────────────────────────────────

export function applyWorldReactivityToEvent(event, soulState, worldState) {
  if (!event) return event;

  const reactivity = {
    echoBoost: 0,
    tagAmplification: [],
    consequenceModifier: 1.0,
    phrase: '',
  };

  const echoes = getFragmentWorldEchoes(soulState, event.era);
  const matchingEchoes = echoes.filter(e =>
    event.cascadeTags?.some(t => e.cascadeTags.includes(t))
  );

  if (matchingEchoes.length > 0) {
    reactivity.echoBoost = matchingEchoes.reduce((sum, e) => sum + e.intensity, 0) * 0.1;
    reactivity.consequenceModifier += matchingEchoes.length * 0.1;
    reactivity.phrase = `World reacts: ${matchingEchoes.length} fragment echo(es) influence this moment`;
  }

  const anchors = getAnchorWorldEchos(soulState);
  const anchorMatches = anchors.filter(a =>
    event.cascadeTags?.some(t => a.cascadeTags?.includes(t))
  );

  if (anchorMatches.length > 0) {
    reactivity.tagAmplification.push(...anchorMatches.map(a => a.value));
    reactivity.phrase += ` ★ Anchor resonance detected`;
  }

  const { pairHits } = checkResonancePairs(soulState);
  const activePairs = pairHits.filter(p =>
    event.cascadeTags?.some(t => t === p.tag1 || t === p.tag2)
  );

  if (activePairs.length > 0) {
    reactivity.consequenceModifier *= 1 + (activePairs.length * 0.05);
  }

  if (event.intensity !== undefined) {
    event.intensity = Math.min(1.0, event.intensity + reactivity.echoBoost);
  }

  return event;
}

// ─── Mortality Peak System ─────────────────────────────────────────────────

export function checkMortalityPeak(age, era, soulState) {
  const peakThresholds = {
    infant: age >= 0 && age <= 4,
    adolescent: age >= 15 && age <= 24,
    middle: age >= 45 && age <= 54,
    senior: age >= 75 && age <= 84,
    ancient: age >= 95,
  };

  const activePeaks = [];

  for (const [peakName, isActive] of Object.entries(peakThresholds)) {
    if (isActive) {
      const complexity = getSoulComplexityScore(soulState);
      const peakSeverity = calculatePeakSeverity(peakName, age, complexity);

      activePeaks.push({
        name: peakName,
        age,
        era,
        severity: peakSeverity,
        phrases: MORTALITY_PEAK_PHRASES[`${peakName}_critical`] || MORTALITY_PEAK_PHRASES.peak_moment,
        worldReactivity: peakSeverity,
      });
    }
  }

  return activePeaks;
}

function calculatePeakSeverity(peakName, age, complexity) {
  let severity = 0.5;

  switch (peakName) {
    case 'infant':
      severity = 0.3 + (complexity * 0.01);
      break;
    case 'adolescent':
      severity = 0.4 + (complexity * 0.01);
      break;
    case 'middle':
      severity = 0.6 + (complexity * 0.005);
      break;
    case 'senior':
      severity = 0.8 + (complexity * 0.003);
      break;
    case 'ancient':
      severity = 0.95;
      break;
  }

  return Math.min(severity, 1.0);
}

export function handleMortalityPeakYes(peak, soulState) {
  const result = {
    survived: true,
    phrase: `Mortality peak ${peak.name} at age ${peak.age} — survived`,
    rewards: {
      complexityBonus: Math.floor(peak.severity * 3),
      fragmentStrengthBonus: peak.severity * 0.1,
    },
  };

  if (soulState?.metaStats) {
    soulState.metaStats.peaksSurvived = (soulState.metaStats.peaksSurvived || 0) + 1;
  }

  return result;
}

export function handleMortalityPeakNo(peak, soulState) {
  const result = {
    survived: false,
    phrase: `Mortality peak ${peak.name} at age ${peak.age} — not survived`,
    consequences: {
      complexityLoss: Math.floor(peak.severity * 2),
      memoryBleedIncrease: peak.severity * 0.2,
    },
  };

  return result;
}

// ─── UI Update Functions ───────────────────────────────────────────────────

export function updateBittersweetIndicator(lifeEvents, soulState) {
  let bittersweetScore = 0;
  let joyCount = 0;
  let griefCount = 0;

  for (const event of lifeEvents || []) {
    const intensity = event.intensity || event.emotionalIntensity || 0.5;

    if (event.cascadeTags?.some(t => ['joy', 'triumph', 'connection', 'grace'].includes(t))) {
      joyCount++;
      bittersweetScore += intensity;
    }

    if (event.cascadeTags?.some(t => ['grief', 'loss', 'betrayal', 'rage'].includes(t))) {
      griefCount++;
      bittersweetScore -= intensity * 0.5;
    }
  }

  const ratio = joyCount + griefCount > 0
    ? Math.abs(joyCount - griefCount) / (joyCount + griefCount)
    : 0;

  let classification;
  if (bittersweetScore > 2) classification = 'joy_heavy';
  else if (bittersweetScore < -2) classification = 'grief_heavy';
  else if (ratio < 0.3) classification = 'bittersweet_balanced';
  else classification = 'neutral';

  return {
    score: bittersweetScore,
    joyCount,
    griefCount,
    ratio,
    classification,
    phrase: buildBittersweetPhrase(bittersweetScore, classification),
  };
}

function buildBittersweetPhrase(score, classification) {
  if (classification === 'joy_heavy') return 'Life tilted toward joy';
  if (classification === 'grief_heavy') return 'Grief dominated the journey';
  if (classification === 'bittersweet_balanced') return 'Joy and grief in equal measure';
  return 'The emotional balance remains unclear';
}

export function updateConsequenceVignette(lifeEvents) {
  const vignettes = [];

  if (!lifeEvents || lifeEvents.length === 0) return vignettes;

  const majorEvents = lifeEvents.filter(e => {
    const intensity = e.intensity || e.emotionalIntensity || 0;
    return intensity >= 0.6 || e.crisisTag || e.isDeathEvent;
  });

  for (const event of majorEvents.slice(-5)) {
    vignettes.push({
      id: event.id,
      title: event.title,
      description: event.description,
      age: event.age,
      era: event.era,
      consequence: calculateConsequenceLevel(event),
      phrase: buildVignettePhrase(event),
    });
  }

  return vignettes;
}

function calculateConsequenceLevel(event) {
  let level = 'minor';
  const intensity = event.intensity || event.emotionalIntensity || 0.5;

  if (event.isDeathEvent) level = 'terminal';
  else if (event.crisisTag) level = 'major';
  else if (intensity >= 0.8) level = 'significant';
  else if (intensity >= 0.6) level = 'moderate';

  return level;
}

function buildVignettePhrase(event) {
  const level = calculateConsequenceLevel(event);
  const phrases = {
    terminal: `◆ ${event.title} — the end came`,
    major: `◇ ${event.title} — a turning point`,
    significant: `· ${event.title} — left its mark`,
    moderate: `· ${event.title} — ripples outward`,
    minor: `- ${event.title}`,
  };

  return phrases[level] || `- ${event.title}`;
}

// ─── World State ───────────────────────────────────────────────────────────

export function createWorldState(soulState, lifeEvents, currentLife) {
  return {
    complexity: getSoulComplexityScore(soulState),
    unlockedEras: getUnlockedErasFromComplexity(getSoulComplexityScore(soulState)),
    fragmentEchoes: getFragmentWorldEchoes(soulState, currentLife?.era),
    anchorEchoes: getAnchorWorldEchos(soulState),
    consequenceRipples: getConsequenceWorldRipples(soulState, lifeEvents),
    memoryBleed: getMemoryBleed(soulState, currentLife),
    resonancePairs: checkResonancePairs(soulState),
    chainMotifs: getMemoryChainMotifs(soulState, lifeEvents),
    lifeThemeBias: getLifeThemeBias(lifeEvents),
    bittersweet: updateBittersweetIndicator(lifeEvents, soulState),
    consequenceVignettes: updateConsequenceVignette(lifeEvents),
    worldPhrase: generateWorldPhrase(soulState, lifeEvents),
  };
}

function generateWorldPhrase(soulState, lifeEvents) {
  const complexity = getSoulComplexityScore(soulState);
  const motifs = getMemoryChainMotifs(soulState, lifeEvents);
  const { pairHits } = checkResonancePairs(soulState);

  if (complexity >= 80) return 'The world has been thoroughly shaped by this soul';
  if (motifs.length >= 4) return 'Multiple life themes have carved their patterns into the world';
  if (pairHits.length >= 3) return 'Resonance pairs create harmonics across the soul\'s journey';
  if (complexity >= 50) return 'The soul\'s complexity grows into world-altering force';
  if (complexity >= 20) return 'The world begins to remember this soul';
  return 'The soul begins leaving echoes in the world';
}

// ─── Soul Description System ───────────────────────────────────────────────

export function generateSoulSignature(soulState) {
  if (!soulState) return 'A nameless soul, unmoored and without history.';

  const lives = soulState.livesLived || 0;
  const years = soulState.totalYearsLived || 0;
  const fragments = soulState.fragments || [];
  const anchors = soulState.anchors || [];
  const unlockedEras = soulState.unlockedEras || ['ANCIENT', 'MEDIEVAL'];
  const metaStats = soulState.metaStats || {};

  const fragmentTypeCounts = {};
  for (const f of fragments) {
    fragmentTypeCounts[f.type] = (fragmentTypeCounts[f.type] || 0) + 1;
  }
  const dominantTypes = Object.entries(fragmentTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([type]) => type);

  const metaphorMap = {
    tone: 'woven from silence and the memory of bells',
    fear: 'knotted from the fiber of things that lurk in peripheral vision',
    love: 'tied in the shape of hands that held on and those that let go',
    location: 'threaded with the cartography of places that no longer exist',
    name: 'etched with names whispered in dark rooms',
    object: 'assembled from objects that outlived their purpose',
    word: 'written in a language whose grammar shifts when you look away',
    warning: 'scarred with warnings that arrived too late',
  };

  const dominantMetaphor = dominantTypes.length > 0
    ? dominantTypes.map(t => metaphorMap[t] || 'a texture of uncertain origin').join('; ')
    : 'an untempered essence still finding its shape';

  const eraAffinity = getEraAffinity(unlockedEras, fragments);

  const livesClause = lives === 1
    ? 'one life'
    : `${lives} lives`;

  const yearsClause = years < 100
    ? `${years} years`
    : `${Math.floor(years / 100)} centuries and ${years % 100} years`;

  let anchorClause = '';
  if (anchors.length > 0) {
    const anchorThemes = anchors.map(a => {
      const tag = (a.cascadeTags && a.cascadeTags.length > 0) ? a.cascadeTags[0] : 'weight';
      return tag;
    });
    const uniqueThemes = [...new Set(anchorThemes)];
    if (uniqueThemes.length === 1) {
      anchorClause = `, carrying ${uniqueThemes[0]} like a wound that teaches`;
    } else {
      anchorClause = `, ${uniqueThemes.slice(0, 2).join(' and ')} anchored in the flesh like habits`;
    }
  }

  const patternNote = detectNotablePattern(metaStats, soulState);
  const scarTissue = buildScarTissue(metaStats, fragments);

  let signature = `A soul ${livesClause} old, ${yearsClause} of memory. ${capitalize(dominantMetaphor)}.`;
  signature += `\nThis soul has wandered through ${unlockedEras.length} eras, and the ${eraAffinity} era feels like home.`;
  if (anchorClause) signature += `\nBuilt from ${anchors.length} anchor${anchors.length !== 1 ? 's' : ''}${anchorClause}.`;
  if (patternNote) signature += ` ${patternNote}.`;
  if (scarTissue) signature += ` ${scarTissue}`;

  return signature;
}

function getEraAffinity(unlockedEras, fragments) {
  const eraOrder = ['ANCIENT', 'MEDIEVAL', 'EARLY_MODERN', 'INDUSTRIAL', 'MODERN', 'NEAR_FUTURE', 'FAR_FUTURE'];
  const eraWeights = {};
  for (const era of unlockedEras) eraWeights[era] = 1;
  for (const f of fragments) {
    if (f.origin && f.origin.era && eraWeights[f.origin.era] !== undefined) {
      eraWeights[f.origin.era] = (eraWeights[f.origin.era] || 1) + f.strength;
    }
  }
  let bestEra = unlockedEras[0] || 'ANCIENT';
  let bestScore = 0;
  for (const [era, score] of Object.entries(eraWeights)) {
    if (score > bestScore) { bestScore = score; bestEra = era; }
  }
  const eraLabels = {
    ANCIENT: 'Ancient',
    MEDIEVAL: 'medieval',
    EARLY_MODERN: 'early modern',
    INDUSTRIAL: 'industrial',
    MODERN: 'modern',
    NEAR_FUTURE: 'near-future',
    FAR_FUTURE: 'far-future',
  };
  return eraLabels[bestEra] || bestEra.toLowerCase();
}

function detectNotablePattern(metaStats, soulState) {
  const lives = soulState?.livesLived || 0;
  const years = soulState?.totalYearsLived || 0;
  const violentDeaths = metaStats?.violentDeaths || 0;
  const peacefulDeaths = metaStats?.peacefulDeaths || 0;

  if (lives >= 5 && violentDeaths > peacefulDeaths * 2) {
    return 'It has a habit of ending badly';
  }
  if (lives >= 3 && years / lives < 30) {
    return 'The deaths keep coming early';
  }
  if (lives >= 4 && peacefulDeaths > violentDeaths) {
    return 'It dies quietly, as if the world has agreed to let it go';
  }
  if (soulState?.metaStats?.lovesLost > 3) {
    return 'Connection has been a repeating wound';
  }
  return null;
}

function buildScarTissue(metaStats, fragments) {
  const scars = [];
  const violentDeaths = metaStats?.violentDeaths || 0;
  const lovesLost = metaStats?.lovesLost || 0;

  if (violentDeaths >= 2) scars.push(`violence has left ${violentDeaths} distinct scars`);
  if (lovesLost >= 2) scars.push(`love has been lost ${lovesLost} times in ways that echo`);
  if (scars.length === 0) return null;
  return 'Unresolved consequences have become ' + scars.join(' and ') + '.';
}

function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function generateLifeEulogy(life) {
  if (!life) return 'A life of unknown span, lost to silence.';
  const years = life.age || life.yearsLived || 0;
  const era = life.era || 'UNKNOWN';
  const cause = life.deathCause || (life.deathEvent ? life.deathEvent.title : null);
  const events = life.events || [];

  if (years === 0) return 'A life that barely drew breath and was gone.';

  let eulogy = `A life of ${years} year${years !== 1 ? 's' : ''}`;

  const tagCounts = {};
  for (const e of events) {
    if (e.cascadeTags) {
      for (const t of e.cascadeTags) {
        tagCounts[t] = (tagCounts[t] || 0) + (e.intensity || 0.5);
      }
    }
  }
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([t]) => t);

  const lifeDescriptors = {
    grief: 'marked by an absence that never filled',
    love: 'defined by bonds that outlasted their objects',
    dread: 'shadowed by something that never named itself',
    wonder: 'colored by discovery in unexpected places',
    rage: 'structured around a fire that burned everything',
    grace: 'softened by acceptance earned the hard way',
    connection: 'held together by the weight of others',
    loss: 'reaching for what slipped away',
    betrayal: 'taught the cost of misplaced trust',
    anchor: 'finding its shape around something unbreakable',
  };

  if (topTags.length > 0) {
    const desc = lifeDescriptors[topTags[0]] || lifeDescriptors[topTags[1]] || null;
    if (desc) eulogy += `, ${desc}`;
  }

  if (cause) {
    const shortCause = cause.replace(/^The /, '').replace(/\s+take[s]?\s+you$/, '').replace(/\s+comes?\s+through$/, '');
    eulogy += `, ending in ${shortCause.toLowerCase()}.`;
  } else {
    eulogy += '.';
  }

  return eulogy;
}

export function generateEraProhecy(era, fragments) {
  if (era !== 'ANCIENT') return null;
  if (!fragments || fragments.length === 0) return null;

  const prophecies = [
    'The thread you carry will pull at the seams of what is to come. The Fates are listening.',
    'You have walked between worlds before. The door will open again — but not for free.',
    'The echoes of your past lives have reached the ears of those who decide fate. They are not pleased.',
    'What was broken in you has not healed. It has become a map. Others will follow it.',
    'The souls who came before you left marks on the architecture of the world. You will leave deeper ones.',
    'The gods have noted your name. It appears in ledgers they do not show each other.',
    'You will outlive the empires you are about to build and those you have already let fall.',
    'The pattern in your suffering has a shape the universe recognizes. It will call you back.',
    'Something ancient stirs at the mention of your soul\'s composition. It has been waiting.',
    'The oracles speak of a soul that bends the thread it walks on. They do not agree on the direction.',
  ];

  const strongFragments = fragments.filter(f => f.strength > 0.5);
  const fragmentHint = strongFragments.length > 0
    ? ` ${capitalize(strongFragments[0].value)}.`
    : '';

  const base = prophecies[Math.floor(Math.random() * prophecies.length)];
  return base + fragmentHint;
}

export function generateAnchorNarrative(anchor) {
  if (!anchor) return 'An anchor of unknown origin, holding nothing and everything.';

  const value = anchor.value || 'something unnamed';
  const type = anchor.type || 'tone';
  const strength = anchor.strength || 0.5;
  const tags = anchor.cascadeTags || [];
  const origin = anchor.origin || {};

  const typeMeanings = {
    tone: 'a sound that once meant everything and now means nothing and now means everything again',
    fear: 'the echo of something that frightened you before you had words for fright',
    love: 'a shape left by someone who mattered — the ghost of their outline pressed into your outline',
    location: 'a place that exists only in the space between your rib bones',
    name: 'a sound that calls up a face you cannot quite surface',
    object: 'a thing you held when the world was solid, and its weight taught you what solid meant',
    word: 'a word that became a door and the key and the locking mechanism all at once',
    warning: 'a signal from a future that has not arrived yet but is already pulling you toward it',
  };

  const strengthDescriptor = strength > 0.8 ? ' It is load-bearing.' :
    strength > 0.5 ? ' It holds more than it should.' :
    ' It holds, barely.';

  const tagDescriptor = tags.length > 0
    ? ` The tags say ${tags.join(', ')}.` : '';

  const originDescriptor = origin.era && origin.era !== 'UNKNOWN'
    ? ` This anchor first formed in the ${origin.era.toLowerCase().replace('_', ' ')} era.` : '';

  const narrative = `${capitalize(value)}${originDescriptor} It is ${typeMeanings[type] || 'a meaning that refuses to be named'}.${strengthDescriptor}${tagDescriptor}`;
  return narrative;
}

export function generateMemoryBleedText(lives, currentPhase) {
  if (!lives || lives < 2) return null;

  const bleedLines = [
    'You\'ve been here before. The light was different but the fear was the same.',
    'This moment has a shape you recognize from a life you don\'t remember living.',
    'Your hands know what to do before your mind catches up.',
    'You feel like you\'ve said this, or something like it, a hundred times before.',
    'The geometry of this room matches a room from a dream you woke from crying.',
    'Someone is about to say the thing they are about to say. You already know the shape of their mouth.',
    'The air tastes like a memory the body keeps and the mind forgot.',
    'You came here once already. The first time you died.',
    'This is the part where something breaks. You know this the way you know your own name.',
    'The echoes of other lives press against the membrane of this one.',
    'You pause, and in the pause is a whole other life you never finished.',
    'The light through the window is the same light through a window you can\'t place.',
    'Someone calls your name and for a moment you answer to a different self.',
    'The fear is old. Older than this body. It remembers what your mind forgets.',
    'This crossroads has appeared before. Each time you choose differently. Each time the same.',
  ];

  const phaseModifiers = {
    INFANT: ' You are very small and the world is very large and something vast is looking at you.',
    CHILD: ' You don\'t understand yet. The déjà vu is a word you haven\'t learned yet.',
    ADOLESCENT: ' You question whether this is real. You\'re right to question.',
    YOUNG_ADULT: ' You have just enough experience to know something is wrong. Not enough to name it.',
    MIDDLE_AGE: ' You stop and look around. You\'ve been here. You are sure.',
    SENIOR: ' You smile because you finally understand. It\'s too late to change anything.',
    ANCIENT: ' The weight of all the other times presses down. You barely notice anymore.',
  };

  const modifier = phaseModifiers[currentPhase] || '';
  const line = bleedLines[Math.floor(Math.random() * bleedLines.length)];
  return line + modifier;
}

export function getSoulDominantEmotion(soulState) {
  if (!soulState?.fragments || soulState.fragments.length === 0) return 'wonder';

  const tagScores = {};
  for (const f of soulState.fragments) {
    if (f.cascadeTags) {
      for (const t of f.cascadeTags) {
        tagScores[t] = (tagScores[t] || 0) + f.strength;
      }
    }
  }
  let maxTag = null, maxScore = 0;
  for (const [tag, score] of Object.entries(tagScores)) {
    if (score > maxScore) { maxScore = score; maxTag = tag; }
  }

  const emotionMap = {
    grief: 'grief', sadness: 'grief', sorrow: 'grief', loss: 'grief', mourning: 'grief',
    love: 'love', connection: 'love', tenderness: 'love', affection: 'love',
    dread: 'dread', fear: 'dread', terror: 'dread', vertigo: 'dread',
    wonder: 'wonder', awe: 'wonder', discovery: 'wonder', curiosity: 'wonder',
    rage: 'rage', anger: 'rage', betrayal: 'rage', fury: 'rage',
    grace: 'grace', acceptance: 'grace', peace: 'grace', resignation: 'grace',
  };

  return emotionMap[maxTag?.toLowerCase()] || 'wonder';
}

export function generateSoulAboutPanel(soulState) {
  if (!soulState) return null;

  const signature = generateSoulSignature(soulState);
  const dominantEmotion = getSoulDominantEmotion(soulState);
  const complexity = getSoulComplexityScore(soulState);
  const eraAffinity = getEraAffinity(soulState.unlockedEras || [], soulState.fragments || []);
  const lives = soulState.livesLived || 0;
  const years = soulState.totalYearsLived || 0;
  const anchors = soulState.anchors || [];
  const metaStats = soulState.metaStats || {};

  const patternNote = detectNotablePattern(metaStats, soulState) || 'No distinct pattern detected.';

  return {
    signature,
    dominantEmotion,
    complexity,
    eraAffinity,
    patternNote,
    lives,
    years,
    anchorCount: anchors.length,
  };
}