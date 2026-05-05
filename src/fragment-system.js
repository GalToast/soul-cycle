/**
 * SOUL-CYCLE — Fragment System
 *
 * Extracts narrative residue from completed lives into the soul's memory pool.
 * Manages anchors, tonal tags, and persistent identity across lives.
 */

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_ANCHORS = 5;
const ANCHOR_RECURRENCE_THRESHOLD = 2;
const WHISPER_CHANCE = 0.4;

const ERA_UNLOCK_THRESHOLDS = [
  { threshold: 3, era: 'EARLY_MODERN' },
  { threshold: 7, era: 'INDUSTRIAL' },
  { threshold: 12, era: 'MODERN' },
  { threshold: 18, era: 'NEAR_FUTURE' },
  { threshold: 25, era: 'FAR_FUTURE' },
];

const FRAGMENT_TYPES = Object.freeze([
  'tone',
  'fear',
  'love',
  'location',
  'name',
  'object',
  'word',
  'warning',
]);

// ─── Fragment Templates ──────────────────────────────────────────────────────

const DEATH_TEMPLATES = {
  violent: {
    type: 'fear',
    pool: [
      'the water was black and silent',
      'a sound like breaking glass that never stopped echoing',
      'hands that couldn\'t hold on',
      'the sky went red before everything went quiet',
      'a face you couldn\'t recognize in the smoke',
      'the taste of copper and the feeling of falling',
      'a door that closed too fast to reach',
      'the last thing you saw was something beautiful',
      'blood on the floor looked like a map to somewhere you\'d been',
      'the sound of your own name spoken by a stranger',
    ],
  },
  peaceful: {
    type: 'tone',
    pool: [
      'the light was warm and the room smelled like rain',
      'a hand holding yours that you didn\'t want to let go of',
      'the way the curtains moved in the last breeze',
      'a song you almost remembered the words to',
      'someone crying softly in the next room',
      'the feeling of a weight you didn\'t know you were carrying lifting',
      'a smile from someone who had been waiting',
      'the last breath that felt like the first',
      'a whisper that sounded like forgiveness',
      'the color of the sky at the exact right moment',
    ],
  },
};

const RELATIONSHIP_TEMPLATES = {
  lover: {
    type: 'love',
    pool: [
      'loved someone who was leaving anyway',
      'a face with kind eyes that appeared in every crowd',
      'the warmth of a shoulder you slept on for years',
      'a promise made in a language you only half understood',
      'the way they said your name when no one else was listening',
      'someone who knew the shape of your silence',
      'a hand that fit perfectly in yours and then didn\'t',
      'the last thing they said to you that you replayed every night',
      'a laugh that made the room feel smaller and safer',
      'eyes that looked at you like you were the only real thing',
    ],
  },
  family: {
    type: 'love',
    pool: [
      'a voice that called you home even when you were already there',
      'the weight of a child sleeping on your chest',
      'someone who shared your face but not your choices',
      'a name passed down like a burden you didn\'t ask for',
      'the way your mother\'s hands looked when she was tired',
      'a sibling who knew which secrets were safe to keep',
      'the first word your child said and what it meant to you',
      'a family dinner where everyone was pretending',
      'the empty chair at the table that no one mentioned',
      'blood that tied you to people you didn\'t understand',
    ],
  },
  friend: {
    type: 'love',
    pool: [
      'someone who stayed when everyone else left',
      'a conversation that lasted until the sun came up',
      'the friend who knew which version of you was real',
      'a shared joke that no one else would understand',
      'the person you called when everything went wrong',
      'a silence between two people that wasn\'t uncomfortable',
      'someone who saw you at your worst and didn\'t flinch',
      'the friend who moved away and never came back',
      'a promise between friends that neither of you kept',
      'the last time you saw them and didn\'t know it was the last time',
    ],
  },
  rival: {
    type: 'warning',
    pool: [
      'someone who mirrored your worst self back at you',
      'a rivalry that felt more honest than your friendships',
      'the person who knew exactly how to hurt you',
      'an enemy who respected you more than your allies did',
      'a competition that became the shape of your life',
      'someone you hated because they were what you wanted to be',
      'the rival who forgave you when you didn\'t deserve it',
      'a feud that outlasted everyone who started it',
      'the person who challenged you until you broke or became stronger',
      'an opponent who taught you more than any teacher',
    ],
  },
  stranger: {
    type: 'tone',
    pool: [
      'a stranger who changed your life in five minutes',
      'the person on the train who looked at you like they knew',
      'someone you passed every day and never spoke to',
      'a face in a crowd that felt like a memory from another life',
      'the stranger who gave you something you didn\'t know you needed',
      'someone who smiled at you on the worst day of your life',
      'a person you saved or who saved you and then disappeared',
      'the stranger whose name you never learned but whose eyes you remember',
      'someone who existed in your life for a moment and then became a ghost',
      'the person who proved that not everyone is who they seem',
    ],
  },
};

const EMOTIONAL_TAG_TEMPLATES = {
  grief: {
    type: 'tone',
    pool: [
      'the color blue meant something dangerous',
      'heir to nothing twice',
      'a room that felt too big after someone left',
      'the weight of an empty side of the bed',
      'a song that played at the wrong time',
      'the smell of someone\'s coat on a hook by the door',
      'a calendar with a date circled that no longer mattered',
      'the silence after a phone stopped ringing',
      'a habit you couldn\'t break even though the reason was gone',
      'the way the light hit a place where someone used to sit',
    ],
  },
  joy: {
    type: 'tone',
    pool: [
      'a moment so bright it cast a shadow on everything after',
      'the feeling of running downhill with the wind at your back',
      'a laugh that came from somewhere deeper than your chest',
      'the taste of something you didn\'t know you were hungry for',
      'a day that felt like it would never end and you wanted it to',
      'the sound of rain when you were exactly where you needed to be',
      'a surprise that felt like the universe was paying attention',
      'the warmth of a room full of people who chose to be there',
      'a realization that hit you like sunlight through clouds',
      'the exact second you knew everything was going to be okay',
    ],
  },
  fear: {
    type: 'fear',
    pool: [
      'a word that felt like a warning in a language you don\'t speak',
      'the feeling of being watched by something you couldn\'t see',
      'a door you opened that you wished you hadn\'t',
      'the sound of footsteps behind you that stopped when you stopped',
      'a shadow that moved in a way shadows shouldn\'t',
      'the moment you realized you were alone and didn\'t know how you got there',
      'a place that felt wrong in a way you couldn\'t explain',
      'the feeling of falling in a dream that you carried into waking',
      'a number that kept appearing and you didn\'t know why',
      'the silence before something you knew was coming',
    ],
  },
  love: {
    type: 'love',
    pool: [
      'the exact shade of someone\'s eyes in a specific kind of light',
      'a touch that lingered longer than it needed to',
      'the way someone\'s voice changed when they said your name',
      'a gift that was small but meant everything',
      'the feeling of being understood without having to explain',
      'a look across a room that said everything words couldn\'t',
      'the warmth of someone\'s breath on your neck in the cold',
      'a memory so vivid it felt like it was happening now',
      'the way someone\'s hand felt in yours the first time',
      'a promise you made that you weren\'t sure you could keep',
    ],
  },
  anger: {
    type: 'warning',
    pool: [
      'a door slammed so hard the walls shook',
      'the words you said that you couldn\'t take back',
      'the moment you realized you were becoming someone you hated',
      'a betrayal that felt like it came from inside your own chest',
      'the sound of your own voice saying something cruel',
      'a fire that started small and consumed everything',
      'the look on someone\'s face when they realized you lied',
      'a bridge you burned that you didn\'t know you\'d need',
      'the silence after you said the thing you\'d been holding in',
      'the feeling of power that came from hurting someone',
    ],
  },
  wonder: {
    type: 'tone',
    pool: [
      'the sky looked different that day and you couldn\'t say why',
      'a place that existed in your mind before you ever saw it',
      'the feeling of standing somewhere for the first time and recognizing it',
      'a book that described your life before you lived it',
      'the sound of an instrument you\'d never heard but somehow knew',
      'a dream that felt more real than the day that followed',
      'the moment you understood something you\'d been trying to grasp your whole life',
      'a coincidence so perfect it felt like design',
      'the feeling of being exactly where you were supposed to be',
      'a sight so beautiful it made you forget what you were afraid of',
    ],
  },
};

const MEMORABLE_EVENT_TEMPLATES = {
  birth: {
    type: 'tone',
    pool: [
      'the first breath that tasted like the world',
      'a cry that announced you were here and you were angry about it',
      'hands that caught you before you knew what falling meant',
      'the light that hurt your eyes and then became everything',
      'a name given to you before you had any say in it',
    ],
  },
  comingOfAge: {
    type: 'tone',
    pool: [
      'the day you realized your parents were just people',
      'a mirror that showed you someone you didn\'t recognize',
      'the first time you made a choice that couldn\'t be undone',
      'a body that changed without asking your permission',
      'the moment childhood ended and no one told you it was happening',
    ],
  },
  achievement: {
    type: 'tone',
    pool: [
      'the moment you proved everyone wrong',
      'a trophy that meant less than the look on your mother\'s face',
      'the climb that changed you more than the view from the top',
      'a success that felt like it belonged to someone else',
      'the thing you built with your hands that outlasted you',
    ],
  },
  loss: {
    type: 'fear',
    pool: [
      'the emptiness that followed a presence you took for granted',
      'a goodbye that you didn\'t know was a goodbye at the time',
      'the last photograph of someone who wouldn\'t be in any more',
      'a house that became a museum of someone who left',
      'the first holiday without the person who made it matter',
    ],
  },
  betrayal: {
    type: 'warning',
    pool: [
      'the face of someone you trusted when the truth came out',
      'a secret that was never yours to keep',
      'the moment you realized the ground beneath you was hollow',
      'a lie so big it became the foundation of everything',
      'the person who knew where to strike and didn\'t hesitate',
    ],
  },
  revelation: {
    type: 'word',
    pool: [
      'a truth that arrived too late to change anything',
      'the word that unlocked a door you didn\'t know was locked',
      'a letter that rewrote everything you thought you knew',
      'a confession that felt like a gift and a curse at the same time',
      'the moment the pieces clicked and you wished they hadn\'t',
    ],
  },
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

// ─── Utilities ───────────────────────────────────────────────────────────────

let _idCounter = 0;

function generateId() {
  _idCounter += 1;
  return `frag_${Date.now()}_${_idCounter}`;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getMostFrequentTag(events) {
  const tagCounts = {};
  for (const event of events) {
    if (event.cascadeTags && Array.isArray(event.cascadeTags)) {
      for (const tag of event.cascadeTags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
  }
  let maxTag = null;
  let maxCount = 0;
  for (const [tag, count] of Object.entries(tagCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxTag = tag;
    }
  }
  return maxTag;
}

function getMostIntenseEvent(events) {
  let best = null;
  let bestIntensity = -1;
  for (const event of events) {
    const intensity = event.intensity || event.emotionalIntensity || 0;
    if (intensity > bestIntensity) {
      bestIntensity = intensity;
      best = event;
    }
  }
  return best;
}

function getDefiningRelationship(events) {
  let best = null;
  let bestScore = -1;
  for (const event of events) {
    if (event.relationship && event.relationshipSignificance) {
      const score = event.relationshipSignificance + (event.intensity || 0) * 0.5;
      if (score > bestScore) {
        bestScore = score;
        best = event;
      }
    }
  }
  return best;
}

function isViolentDeath(deathEvent) {
  if (!deathEvent) return false;
  const cause = (deathEvent.cause || deathEvent.type || deathEvent.category || '').toLowerCase();
  const violentKeywords = [
    'murder', 'kill', 'stab', 'shoot', 'crash', 'accident', 'fall',
    'drown', 'burn', 'fire', 'war', 'battle', 'fight', 'attack',
    'poison', 'execution', 'suicide', 'homicide', 'violence',
    'blood', 'wound', 'injury', 'fatal', 'trauma',
  ];
  return violentKeywords.some((kw) => cause.includes(kw));
}

function isPeacefulDeath(deathEvent) {
  if (!deathEvent) return false;
  const cause = (deathEvent.cause || deathEvent.type || deathEvent.category || '').toLowerCase();
  const peacefulKeywords = [
    'old age', 'natural', 'peaceful', 'sleep', 'slept',
    'passed', 'quiet', 'gentle', 'illness', 'disease',
    'cancer', 'heart', 'organ failure', 'time',
  ];
  return peacefulKeywords.some((kw) => cause.includes(kw));
}

function getRelationshipType(event) {
  if (!event || !event.relationship) return 'stranger';
  const rel = (event.relationship.type || event.relationship.role || event.relationship || '').toLowerCase();
  if (['lover', 'partner', 'spouse', 'wife', 'husband', 'romantic', 'significant other'].some((k) => rel.includes(k))) return 'lover';
  if (['family', 'parent', 'child', 'mother', 'father', 'son', 'daughter', 'sibling', 'brother', 'sister', 'relative'].some((k) => rel.includes(k))) return 'family';
  if (['friend', 'best friend', 'companion', 'ally', 'buddy', 'pal'].some((k) => rel.includes(k))) return 'friend';
  if (['rival', 'enemy', 'opponent', 'adversary', 'competitor', 'nemesis'].some((k) => rel.includes(k))) return 'rival';
  return 'stranger';
}

function getEmotionCategory(tag) {
  if (!tag) return 'wonder';
  const t = tag.toLowerCase();
  if (['grief', 'sadness', 'sorrow', 'mourning', 'loss', 'despair', 'melancholy'].some((k) => t.includes(k))) return 'grief';
  if (['joy', 'happiness', 'bliss', 'euphoria', 'delight', 'ecstasy', 'contentment'].some((k) => t.includes(k))) return 'joy';
  if (['fear', 'terror', 'dread', 'anxiety', 'panic', 'horror', 'phobia'].some((k) => t.includes(k))) return 'fear';
  if (['love', 'affection', 'devotion', 'passion', 'tenderness', 'adoration', 'romance'].some((k) => t.includes(k))) return 'love';
  if (['anger', 'rage', 'fury', 'wrath', 'resentment', 'bitterness', 'hostility'].some((k) => t.includes(k))) return 'anger';
  return 'wonder';
}

function getEventCategory(event) {
  if (!event) return 'revelation';
  const cat = (event.category || event.type || event.name || '').toLowerCase();
  if (['birth', 'born', 'arrival', 'entry'].some((k) => cat.includes(k))) return 'birth';
  if (['comingofage', 'coming-of-age', 'coming of age', 'adolescence', 'puberty', 'maturity'].some((k) => cat.includes(k))) return 'comingOfAge';
  if (['achievement', 'success', 'victory', 'accomplishment', 'triumph', 'award', 'recognition'].some((k) => cat.includes(k))) return 'achievement';
  if (['loss', 'death', 'grief', 'mourning', 'bereavement'].some((k) => cat.includes(k))) return 'loss';
  if (['betrayal', 'treachery', 'deception', 'lie', 'backstab'].some((k) => cat.includes(k))) return 'betrayal';
  return 'revelation';
}

// ─── Fragment Creation ───────────────────────────────────────────────────────

function createFragment(type, value, strength, origin, cascadeTags, isAnchor) {
  return {
    id: generateId(),
    type,
    value,
    strength: clamp(strength, 0.0, 1.0),
    origin,
    isAnchor: isAnchor || false,
    cascadeTags: cascadeTags || [],
  };
}

function extractDeathFragment(deathEvent, soulState) {
  if (!deathEvent) return null;

  const violent = isViolentDeath(deathEvent);
  const peaceful = isPeacefulDeath(deathEvent);

  let templatePool;
  let baseStrength;

  if (violent) {
    templatePool = DEATH_TEMPLATES.violent.pool;
    baseStrength = 0.5 + Math.random() * 0.3;
  } else if (peaceful) {
    templatePool = DEATH_TEMPLATES.peaceful.pool;
    baseStrength = 0.4 + Math.random() * 0.3;
  } else {
    templatePool = DEATH_TEMPLATES.peaceful.pool;
    baseStrength = 0.3 + Math.random() * 0.3;
  }

  const value = pickRandom(templatePool);
  const origin = {
    lifeId: soulState.id || `life_${soulState.livesLived}`,
    eventId: deathEvent.id || 'death_event',
    era: deathEvent.era || 'UNKNOWN',
    age: deathEvent.age || soulState.totalYearsLived || 0,
  };

  const cascadeTags = deathEvent.cascadeTags || [];
  const type = violent ? 'fear' : 'tone';

  return createFragment(type, value, baseStrength, origin, cascadeTags, false);
}

function extractRelationshipFragment(lifeEvents, soulState) {
  const relEvent = getDefiningRelationship(lifeEvents);
  if (!relEvent) return null;

  const relType = getRelationshipType(relEvent);
  const templatePool = RELATIONSHIP_TEMPLATES[relType].pool;
  const value = pickRandom(templatePool);

  const significance = relEvent.relationshipSignificance || 0.5;
  const baseStrength = clamp(0.3 + significance * 0.5 + Math.random() * 0.2, 0.0, 1.0);

  const origin = {
    lifeId: soulState.id || `life_${soulState.livesLived}`,
    eventId: relEvent.id || 'relationship_event',
    era: relEvent.era || 'UNKNOWN',
    age: relEvent.age || 0,
  };

  const cascadeTags = relEvent.cascadeTags || [];

  return createFragment('love', value, baseStrength, origin, cascadeTags, false);
}

function extractEmotionalTagFragment(lifeEvents, soulState) {
  const dominantTag = getMostFrequentTag(lifeEvents);
  if (!dominantTag) return null;

  const emotionCategory = getEmotionCategory(dominantTag);
  const templatePool = EMOTIONAL_TAG_TEMPLATES[emotionCategory].pool;
  const value = pickRandom(templatePool);

  const tagCount = lifeEvents.reduce((sum, e) => {
    return sum + ((e.cascadeTags || []).filter((t) => t.toLowerCase() === dominantTag.toLowerCase()).length);
  }, 0);

  const baseStrength = clamp(0.2 + tagCount * 0.05 + Math.random() * 0.2, 0.0, 1.0);

  const mostIntense = getMostIntenseEvent(lifeEvents);
  const origin = {
    lifeId: soulState.id || `life_${soulState.livesLived}`,
    eventId: mostIntense ? mostIntense.id : 'emotional_peak',
    era: mostIntense ? mostIntense.era : 'UNKNOWN',
    age: mostIntense ? mostIntense.age : 0,
  };

  return createFragment(
    EMOTIONAL_TAG_TEMPLATES[emotionCategory].type,
    value,
    baseStrength,
    origin,
    [dominantTag],
    false
  );
}

function extractMemorableEventFragment(lifeEvents, soulState) {
  const memorable = getMostIntenseEvent(lifeEvents);
  if (!memorable) return null;

  const eventCategory = getEventCategory(memorable);
  const templatePool = MEMORABLE_EVENT_TEMPLATES[eventCategory].pool;
  const value = pickRandom(templatePool);

  const intensity = memorable.intensity || memorable.emotionalIntensity || 0.5;
  const baseStrength = clamp(0.3 + intensity * 0.4 + Math.random() * 0.2, 0.0, 1.0);

  const origin = {
    lifeId: soulState.id || `life_${soulState.livesLived}`,
    eventId: memorable.id || 'memorable_event',
    era: memorable.era || 'UNKNOWN',
    age: memorable.age || 0,
  };

  const cascadeTags = memorable.cascadeTags || [];
  const type = MEMORABLE_EVENT_TEMPLATES[eventCategory].type;

  return createFragment(type, value, baseStrength, origin, cascadeTags, false);
}

function extractWhisperFragment(soulState) {
  const template = pickRandom(WHISPER_TEMPLATES);
  const baseStrength = 0.1 + Math.random() * 0.2;

  const origin = {
    lifeId: soulState.id || `life_${soulState.livesLived}`,
    eventId: 'whisper',
    era: 'UNKNOWN',
    age: soulState.totalYearsLived || 0,
  };

  return createFragment(template.type, template.value, baseStrength, origin, [], false);
}

// ─── Core Functions ──────────────────────────────────────────────────────────

/**
 * Extract narrative fragments from a completed life.
 *
 * @param {Array} lifeEvents - All events from the completed life
 * @param {Object} deathEvent - The death/ending event
 * @param {Object} soulState - Current soul state
 * @returns {{ newFragments: Array, metaUpdate: Object }}
 */
function extractFragments(lifeEvents, deathEvent, soulState) {
  const newFragments = [];
  const metaUpdate = {
    totalDeaths: (soulState.metaStats?.totalDeaths || 0) + 1,
    violentDeaths: soulState.metaStats?.violentDeaths || 0,
    peacefulDeaths: soulState.metaStats?.peacefulDeaths || 0,
    lovesLost: soulState.metaStats?.lovesLost || 0,
    childrenBorn: soulState.metaStats?.childrenBorn || 0,
  };

  if (isViolentDeath(deathEvent)) {
    metaUpdate.violentDeaths += 1;
  } else if (isPeacefulDeath(deathEvent)) {
    metaUpdate.peacefulDeaths += 1;
  }

  for (const event of lifeEvents) {
    const cat = (event.category || event.type || '').toLowerCase();
    if (['love', 'romance', 'relationship', 'partner', 'lover'].some((k) => cat.includes(k)) && event.ended) {
      metaUpdate.lovesLost += 1;
    }
    if (['birth', 'child', 'baby', 'born'].some((k) => cat.includes(k))) {
      metaUpdate.childrenBorn += 1;
    }
  }

  const deathFragment = extractDeathFragment(deathEvent, soulState);
  if (deathFragment) newFragments.push(deathFragment);

  const relationshipFragment = extractRelationshipFragment(lifeEvents, soulState);
  if (relationshipFragment) newFragments.push(relationshipFragment);

  const emotionalTagFragment = extractEmotionalTagFragment(lifeEvents, soulState);
  if (emotionalTagFragment) newFragments.push(emotionalTagFragment);

  const memorableFragment = extractMemorableEventFragment(lifeEvents, soulState);
  if (memorableFragment) newFragments.push(memorableFragment);

  if (Math.random() < WHISPER_CHANCE) {
    const whisper = extractWhisperFragment(soulState);
    if (whisper) newFragments.push(whisper);
  }

  return { newFragments, metaUpdate };
}

/**
 * Merge a single new fragment into the soul's existing pool.
 * Returns the merged fragment (may be existing or new).
 */
function mergeFragment(soulState, newFragment) {
  const existing = soulState.fragments.find(
    (f) => f.type === newFragment.type && f.value === newFragment.value
  );

  if (existing) {
    const boost = 0.1 + Math.random() * 0.2;
    existing.strength = clamp(existing.strength + boost, 0.0, 1.0);

    if (newFragment.strength > existing.strength && !existing.isAnchor) {
      existing.strength = newFragment.strength;
      existing.origin = newFragment.origin;
    }

    if (newFragment.cascadeTags && newFragment.cascadeTags.length > 0) {
      for (const tag of newFragment.cascadeTags) {
        if (!existing.cascadeTags.includes(tag)) {
          existing.cascadeTags.push(tag);
        }
      }
    }

    return existing;
  }

  soulState.fragments.push(newFragment);
  return newFragment;
}

/**
 * Evaluate and promote anchors.
 * An anchor is created when a fragment (by type+value) appears in 2+ lives.
 */
function evaluateAnchors(soulState) {
  const currentAnchors = soulState.fragments.filter((f) => f.isAnchor);
  if (currentAnchors.length >= MAX_ANCHORS) return;

  const recurrenceMap = {};
  for (const fragment of soulState.fragments) {
    const key = `${fragment.type}:${fragment.value}`;
    if (!recurrenceMap[key]) {
      recurrenceMap[key] = { fragment, count: 1, origins: [fragment.origin] };
    } else {
      recurrenceMap[key].count += 1;
      recurrenceMap[key].origins.push(fragment.origin);
    }
  }

  for (const [key, data] of Object.entries(recurrenceMap)) {
    if (data.count >= ANCHOR_RECURRENCE_THRESHOLD && !data.fragment.isAnchor) {
      if (currentAnchors.length >= MAX_ANCHORS) break;

      data.fragment.isAnchor = true;
      data.fragment.strength = clamp(data.fragment.strength + 0.15, 0.0, 1.0);
      currentAnchors.push(data.fragment);
    }
  }

  soulState.anchors = soulState.fragments.filter((f) => f.isAnchor);
}

/**
 * Check and unlock eras based on total fragment count.
 */
function checkEraUnlocks(soulState) {
  const totalFragments = soulState.fragments.length;
  const unlocked = new Set(soulState.unlockedEras || ['ANCIENT', 'MEDIEVAL']);

  for (const { threshold, era } of ERA_UNLOCK_THRESHOLDS) {
    if (totalFragments >= threshold && !unlocked.has(era)) {
      unlocked.add(era);
    }
  }

  soulState.unlockedEras = Array.from(unlocked);
}

/**
 * Apply fragment effects to the soul state.
 * Merges fragments, updates anchors, checks era unlocks.
 *
 * @param {Object} soulState - The soul state to mutate
 * @param {Array} fragments - New fragments to apply
 */
function applyFragmentEffects(soulState, fragments) {
  if (!soulState.fragments) soulState.fragments = [];
  if (!soulState.anchors) soulState.anchors = [];
  if (!soulState.unlockedEras) soulState.unlockedEras = ['ANCIENT', 'MEDIEVAL'];
  if (!soulState.metaStats) {
    soulState.metaStats = {
      totalDeaths: 0,
      violentDeaths: 0,
      peacefulDeaths: 0,
      lovesLost: 0,
      childrenBorn: 0,
    };
  }

  for (const fragment of fragments) {
    mergeFragment(soulState, fragment);
  }

  evaluateAnchors(soulState);
  checkEraUnlocks(soulState);

  soulState.livesLived = (soulState.livesLived || 0) + 1;
}

/**
 * Get fragment influence bias for a given category.
 * Returns a number from -1 to +1.
 *
 * @param {Object} soulState - Current soul state
 * @param {string} category - One of: 'fear', 'love', 'tone', 'warning', 'location', 'name', 'object', 'word'
 * @returns {number} Bias multiplier from -1 to +1
 */
function getFragmentInfluence(soulState, category) {
  if (!soulState.fragments || soulState.fragments.length === 0) return 0;

  const relevant = soulState.fragments.filter((f) => f.type === category);
  if (relevant.length === 0) return 0;

  let totalWeight = 0;
  let totalStrength = 0;

  for (const fragment of relevant) {
    if (fragment.strength > 0.5) {
      const weight = fragment.strength - 0.5;
      totalWeight += weight;
      totalStrength += weight;
    }
  }

  if (totalStrength === 0) return 0;

  let bias = totalWeight / totalStrength;

  if (category === 'fear') {
    const fearCount = relevant.filter((f) => f.strength > 0.5).length;
    if (fearCount > 3) {
      bias = -bias * 0.3 + bias * 0.7;
    }
  }

  if (category === 'love') {
    bias = clamp(bias * 1.2, -1, 1);
  }

  return clamp(bias * 2 - 1, -1, 1);
}

/**
 * Get all fragments above a strength threshold.
 *
 * @param {Object} soulState
 * @param {number} minStrength - Minimum strength (default 0.5)
 * @returns {Array} Filtered fragments
 */
function getActiveFragments(soulState, minStrength) {
  const threshold = minStrength !== undefined ? minStrength : 0.5;
  return (soulState.fragments || []).filter((f) => f.strength >= threshold);
}

/**
 * Get anchor fragments only.
 *
 * @param {Object} soulState
 * @returns {Array} Anchor fragments
 */
function getAnchors(soulState) {
  return soulState.anchors || (soulState.fragments || []).filter((f) => f.isAnchor);
}

/**
 * Create a fresh soul state.
 *
 * @param {string} id - Optional soul identifier
 * @returns {Object} Initial soul state
 */
function createSoulState(id) {
  return {
    id: id || `soul_${Date.now()}`,
    livesLived: 0,
    totalYearsLived: 0,
    fragments: [],
    anchors: [],
    unlockedEras: ['ANCIENT', 'MEDIEVAL'],
    metaStats: {
      totalDeaths: 0,
      violentDeaths: 0,
      peacefulDeaths: 0,
      lovesLost: 0,
      childrenBorn: 0,
    },
  };
}

/**
 * Fade non-anchor fragments over time (between lives).
 * Reduces strength of non-anchor fragments by a decay factor.
 *
 * @param {Object} soulState
 * @param {number} decayFactor - Amount to reduce (default 0.05)
 */
function fadeFragments(soulState, decayFactor) {
  const decay = decayFactor !== undefined ? decayFactor : 0.05;
  const toRemove = [];

  for (const fragment of soulState.fragments) {
    if (!fragment.isAnchor) {
      fragment.strength = clamp(fragment.strength - decay, 0.0, 1.0);
      if (fragment.strength <= 0.0) {
        toRemove.push(fragment.id);
      }
    }
  }

  if (toRemove.length > 0) {
    soulState.fragments = soulState.fragments.filter((f) => !toRemove.includes(f.id));
    soulState.anchors = soulState.fragments.filter((f) => f.isAnchor);
  }
}

/**
 * Get a summary of the soul's fragment composition.
 *
 * @param {Object} soulState
 * @returns {Object} Summary stats
 */
function getFragmentSummary(soulState) {
  const fragments = soulState.fragments || [];
  const byType = {};
  const byStrength = { low: 0, medium: 0, high: 0 };

  for (const f of fragments) {
    byType[f.type] = (byType[f.type] || 0) + 1;
    if (f.strength < 0.33) byStrength.low += 1;
    else if (f.strength < 0.66) byStrength.medium += 1;
    else byStrength.high += 1;
  }

  return {
    total: fragments.length,
    anchors: (soulState.anchors || []).length,
    byType,
    byStrength,
    unlockedEras: soulState.unlockedEras || [],
    metaStats: soulState.metaStats || {},
  };
}

/**
 * Check if a fragment with matching type+value exists.
 *
 * @param {Object} soulState
 * @param {string} type
 * @param {string} value
 * @returns {Object|null} Existing fragment or null
 */
function findFragment(soulState, type, value) {
  return (soulState.fragments || []).find(
    (f) => f.type === type && f.value === value
  ) || null;
}

/**
 * Remove a fragment by id. Cannot remove anchors.
 *
 * @param {Object} soulState
 * @param {string} fragmentId
 * @returns {boolean} True if removed
 */
function removeFragment(soulState, fragmentId) {
  const idx = (soulState.fragments || []).findIndex((f) => f.id === fragmentId);
  if (idx === -1) return false;

  const fragment = soulState.fragments[idx];
  if (fragment.isAnchor) return false;

  soulState.fragments.splice(idx, 1);
  soulState.anchors = soulState.fragments.filter((f) => f.isAnchor);
  return true;
}

/**
 * Get the dominant emotional tone of the soul based on fragment cascade tags.
 *
 * @param {Object} soulState
 * @returns {string|null} Most common cascade tag
 */
function getDominantEmotion(soulState) {
  const tagCounts = {};
  for (const fragment of soulState.fragments || []) {
    for (const tag of fragment.cascadeTags || []) {
      tagCounts[tag] = (tagCounts[tag] || 0) + Math.floor(fragment.strength * 10);
    }
  }

  let dominant = null;
  let maxScore = 0;
  for (const [tag, score] of Object.entries(tagCounts)) {
    if (score > maxScore) {
      maxScore = score;
      dominant = tag;
    }
  }
  return dominant;
}

// ─── Module Exports ──────────────────────────────────────────────────────────

module.exports = {
  extractFragments,
  applyFragmentEffects,
  getFragmentInfluence,
  getActiveFragments,
  getAnchors,
  createSoulState,
  fadeFragments,
  getFragmentSummary,
  findFragment,
  removeFragment,
  getDominantEmotion,
  mergeFragment,
  evaluateAnchors,
  checkEraUnlocks,
  FRAGMENT_TYPES,
  MAX_ANCHORS,
  WHISPER_CHANCE,
  ERA_UNLOCK_THRESHOLDS,
};
