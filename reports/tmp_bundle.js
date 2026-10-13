var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// js/world.js
function countChainType(lifeEvents, chainType) {
  const tags = CHAIN_TAG_MAP[chainType] || [];
  let maxCount = 0;
  let currentCount = 0;
  for (const event of lifeEvents) {
    if (!event || !event.cascadeTags) continue;
    const hasChainTag = event.cascadeTags.some((t) => tags.includes(t.toLowerCase()));
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
  const cause = (deathEvent.cause || deathEvent.type || deathEvent.category || deathEvent.title || "").toLowerCase();
  return ["murder", "kill", "stab", "shoot", "crash", "accident", "fall", "drown", "burn", "fire", "war", "battle", "fight", "attack", "poison", "execution", "suicide", "homicide", "violence", "blood", "wound", "injury", "fatal", "trauma", "predator", "battlefield", "arrow", "cannon", "plague", "fever", "rival", "hanging", "shipwreck", "overdose", "climate", "drone", "weapon", "malfunction", "purge", "rejection"].some((kw) => cause.includes(kw));
}
function isPeacefulDeath(deathEvent) {
  if (!deathEvent) return false;
  const cause = (deathEvent.cause || deathEvent.type || deathEvent.category || deathEvent.title || "").toLowerCase();
  return ["old age", "natural", "peaceful", "sleep", "slept", "passed", "quiet", "gentle", "illness", "disease", "cancer", "heart", "organ failure", "time", "decline", "cold", "stroke", "hospital", "gives out"].some((kw) => cause.includes(kw));
}
function checkAndUnlockAchievements(soulState, lifeEvents, deathEvent) {
  if (!soulState) return [];
  if (!soulState.achievementsUnlocked) soulState.achievementsUnlocked = [];
  if (!soulState.achievementNotifications) soulState.achievementNotifications = [];
  const newlyUnlocked = [];
  const categories = ["lifespan", "fragment", "anchor", "era", "crisis", "chain", "speedrunner", "peaceful", "special"];
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
            timestamp: Date.now()
          };
          soulState.achievementNotifications.push(notification);
          newlyUnlocked.push(notification);
          applyAchievementReward(soulState, def.reward);
          break;
        }
      } catch (e) {
      }
    }
  }
  return newlyUnlocked;
}
function applyAchievementReward(soulState, reward) {
  if (!reward) return;
  switch (reward.type) {
    case "bonus_fragment_slot":
      if (!soulState.bonusFragmentSlots) soulState.bonusFragmentSlots = 0;
      soulState.bonusFragmentSlots += 1;
      break;
    case "unlock_era":
      if (reward.era && soulState.unlockedEras && !soulState.unlockedEras.includes(reward.era)) {
        soulState.unlockedEras.push(reward.era);
      }
      break;
    case "special_anchor_type":
      if (!soulState.specialUnlocks) soulState.specialUnlocks = {};
      soulState.specialUnlocks.enhancedAnchor = true;
      break;
    case "special_title":
      if (!soulState.specialUnlocks) soulState.specialUnlocks = {};
      soulState.specialUnlocks.title = reward.title;
      break;
  }
}
function popAchievementNotification(soulState) {
  if (!soulState || !soulState.achievementNotifications || soulState.achievementNotifications.length === 0) {
    return null;
  }
  return soulState.achievementNotifications.shift();
}
function getAchievementStats(soulState) {
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
function getSoulComplexityScore(soulState) {
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
function getUnlockedErasFromComplexity(complexityScore) {
  const baseEras = ["ANCIENT", "MEDIEVAL"];
  const allEras = ["ANCIENT", "MEDIEVAL", "EARLY_MODERN", "INDUSTRIAL", "MODERN", "NEAR_FUTURE", "FAR_FUTURE"];
  if (complexityScore < 5) return baseEras;
  if (complexityScore < 10) return allEras.slice(0, 3);
  if (complexityScore < 20) return allEras.slice(0, 4);
  if (complexityScore < 35) return allEras.slice(0, 5);
  if (complexityScore < 50) return allEras.slice(0, 6);
  return allEras;
}
function getFragmentWorldEchoes(soulState, currentEra) {
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
      intensity: strength * (eraMatch ? 1.5 : 1),
      isAnchor,
      echoRadius: isAnchor ? 3 : Math.floor(strength * 2),
      cascadeTags: fragment.cascadeTags || [],
      phrase: buildEchoPhrase(fragment, currentEra)
    };
    echoes.push(echo);
  }
  return echoes.sort((a, b) => b.intensity - a.intensity);
}
function buildEchoPhrase(fragment, currentEra) {
  const typePhrases = {
    tone: "A tonal echo reverberates through the era",
    fear: "Fear leaves its mark on the world",
    love: "Love creates ripples of connection",
    location: "A place echoes with past significance",
    name: "A name surfaces from the collective memory",
    object: "An object resonates across time",
    word: "A word carries persistent weight",
    warning: "A warning echoes through the ages"
  };
  const base = typePhrases[fragment.type] || "A fragment leaves its mark";
  if (fragment.isAnchor) return `\xE2\u02DC\u2026 ${base} [ANCHOR]`;
  return base;
}
function getAnchorWorldEchos(soulState) {
  const echos = [];
  if (!soulState?.anchors) return echos;
  for (const anchor of soulState.anchors) {
    const echo = {
      anchorId: anchor.id,
      value: anchor.value,
      type: anchor.type,
      strength: anchor.strength || 0.5,
      worldReactivity: calculateAnchorWorldReactivity(anchor),
      phrase: `\xE2\u02DC\u2026 ANCHOR: "${anchor.value}"`,
      echoRange: 3,
      resonanceBoost: 0.2
    };
    echos.push(echo);
  }
  return echos.sort((a, b) => b.strength - a.strength);
}
function calculateAnchorWorldReactivity(anchor) {
  let reactivity = anchor.strength || 0;
  if (anchor.cascadeTags) {
    if (anchor.cascadeTags.includes("grief")) reactivity *= 1.2;
    if (anchor.cascadeTags.includes("love")) reactivity *= 1.15;
    if (anchor.cascadeTags.includes("rage")) reactivity *= 1.1;
  }
  return Math.min(reactivity, 1);
}
function getConsequenceWorldRipples(soulState, lifeEvents) {
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
      phrase: buildRipplePhrase(event)
    };
    ripples.push(ripple);
  }
  return ripples.sort((a, b) => b.intensity - a.intensity);
}
function calculateRippleRadius(event) {
  let radius = 1;
  if (event.cascadeTags.includes("grief")) radius += 1;
  if (event.cascadeTags.includes("rage")) radius += 1;
  if (event.cascadeTags.includes("betrayal")) radius += 2;
  if (event.cascadeTags.includes("connection")) radius += 1;
  const intensity = event.intensity || event.emotionalIntensity || 0.5;
  radius += Math.floor(intensity * 2);
  return Math.min(radius, 5);
}
function calculateWorldConsequence(event) {
  let consequence = 0;
  if (event.category === "violence") consequence += 2;
  if (event.category === "relationship") consequence += 1;
  if (event.crisisTag) consequence += 2;
  if (event.isDeathEvent) consequence += 3;
  return Math.min(consequence, 10);
}
function buildRipplePhrase(event) {
  const intensity = event.intensity || event.emotionalIntensity || 0.5;
  if (intensity >= 0.8) return `\xE2\u2014\u2020 MAJOR CONSEQUENCE: ${event.title}`;
  if (intensity >= 0.5) return `\xE2\u2014\u2021 consequence ripples from: ${event.title}`;
  return `\xC2\xB7 small ripple from: ${event.title}`;
}
function getMemoryBleed(soulState, currentLife) {
  const bleed = {
    crossLifeFragments: [],
    bleedingAnchors: [],
    eraBleedthrough: [],
    phrase: ""
  };
  if (!soulState?.fragments || !currentLife) return bleed;
  const currentEra = currentLife.era;
  const currentLifeId = currentLife.id || `life_${soulState.livesLived}`;
  for (const fragment of soulState.fragments) {
    if (!fragment.origin) continue;
    const originLifeId = fragment.origin.lifeId || "";
    if (originLifeId === currentLifeId) continue;
    const bleedEntry = {
      fragmentId: fragment.id,
      value: fragment.value,
      type: fragment.type,
      originLife: originLifeId,
      originEra: fragment.origin.era,
      originAge: fragment.origin.age,
      bleedIntensity: fragment.strength * 0.5,
      phrase: `Fragment from ${fragment.origin.era} bleeds through`
    };
    if (fragment.isAnchor) {
      bleed.bleedingAnchors.push({ ...bleedEntry, anchorResonance: fragment.strength });
    } else {
      bleed.crossLifeFragments.push(bleedEntry);
    }
  }
  const erasWithBleed = /* @__PURE__ */ new Set([
    ...bleed.crossLifeFragments.map((f) => f.originEra),
    ...bleed.bleedingAnchors.map((a) => a.originEra)
  ]);
  bleed.eraBleedthrough = Array.from(erasWithBleed);
  const totalBleed = bleed.crossLifeFragments.length + bleed.bleedingAnchors.length;
  if (totalBleed === 0) {
    bleed.phrase = "No memory bleed detected";
  } else if (totalBleed < 3) {
    bleed.phrase = "Faint memories seep through from past lives";
  } else if (totalBleed < 6) {
    bleed.phrase = "Memory bleed is significant \xE2 \u201D past and present blur";
  } else {
    bleed.phrase = "Strong memory bleed \xE2 \u201D the soul carries much from before";
  }
  return bleed;
}
function checkResonancePairs(soulState) {
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
          isActive: true
        });
      }
    }
  }
  return { resonanceEvents, pairHits };
}
function createMemoryChainEntry(soulState, lifeEvents, chainType) {
  if (!chainType || !lifeEvents || lifeEvents.length === 0) return null;
  const chainEvents = lifeEvents.filter((e) => {
    if (!e?.cascadeTags) return false;
    return e.cascadeTags.some((t) => {
      const tLower = t.toLowerCase();
      const chainTags = {
        GRIEF: ["grief", "sadness", "sorrow", "mourning", "loss", "despair", "melancholy"],
        LOVE: ["connection", "tenderness", "love", "affection", "devotion", "passion", "romance"],
        DREAD: ["dread", "vertigo", "fear", "terror", "anxiety", "panic", "horror"],
        WONDER: ["wonder", "awe", "discovery", "curiosity", "marvel"],
        RAGE: ["rage", "anger", "betrayal", "fury", "wrath", "resentment"],
        GRACE: ["grace", "resignation", "acceptance", "peace", "surrender"]
      };
      return chainTags[chainType]?.some((ct) => tLower.includes(ct));
    });
  });
  if (chainEvents.length < 2) return null;
  return {
    chainType,
    events: chainEvents.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      age: e.age,
      era: e.era,
      cascadeTags: e.cascadeTags,
      intensity: e.intensity || e.emotionalIntensity || 0.5
    })),
    motif: identifyChainMotif(chainType, chainEvents),
    phrase: buildChainPhrase(chainType, chainEvents.length)
  };
}
function identifyChainMotif(chainType, events) {
  const motifs = {
    GRIEF: ["accumulation", "echo", "absence", "weight"],
    LOVE: ["connection", "warmth", "devotion", "loss"],
    DREAD: ["buildup", "anticipation", "inevitability", "shadow"],
    WONDER: ["discovery", "awe", "curiosity", "revelation"],
    RAGE: ["explosion", "justification", "destruction", "partition"],
    GRACE: ["release", "acceptance", "peace", "transcendence"]
  };
  const possibleMotifs = motifs[chainType] || ["pattern"];
  return possibleMotifs[events.length % possibleMotifs.length];
}
function buildChainPhrase(chainType, eventCount) {
  const phrases = {
    GRIEF: `A grief chain of ${eventCount} events`,
    LOVE: `A love chain of ${eventCount} events`,
    DREAD: `A dread chain of ${eventCount} events`,
    WONDER: `A wonder chain of ${eventCount} events`,
    RAGE: `A rage chain of ${eventCount} events`,
    GRACE: `A grace chain of ${eventCount} events`
  };
  return phrases[chainType] || `A chain of ${eventCount} events`;
}
function getMemoryChainMotifs(soulState, lifeEvents) {
  const motifs = [];
  const chainTypes = ["GRIEF", "LOVE", "DREAD", "WONDER", "RAGE", "GRACE"];
  for (const chainType of chainTypes) {
    const chain = createMemoryChainEntry(soulState, lifeEvents, chainType);
    if (chain) {
      motifs.push({
        type: chainType,
        motif: chain.motif,
        eventCount: chain.events.length,
        phrase: chain.phrase
      });
    }
  }
  return motifs;
}
function getLifeThemeBias(lifeEvents) {
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
    grief: "GRIEF",
    sadness: "GRIEF",
    loss: "GRIEF",
    mourning: "GRIEF",
    love: "LOVE",
    connection: "LOVE",
    tenderness: "LOVE",
    affection: "LOVE",
    dread: "DREAD",
    fear: "DREAD",
    terror: "DREAD",
    vertigo: "DREAD",
    wonder: "WONDER",
    awe: "WONDER",
    discovery: "WONDER",
    curiosity: "WONDER",
    rage: "RAGE",
    anger: "RAGE",
    betrayal: "RAGE",
    fury: "RAGE",
    grace: "GRACE",
    acceptance: "GRACE",
    peace: "GRACE",
    resignation: "GRACE"
  };
  const bias = themeMap[maxTag.toLowerCase()] || "WONDER";
  return {
    bias,
    dominantTag: maxTag,
    score: maxScore,
    phrase: `Life biased toward ${bias.toLowerCase()}`,
    label: getThemeLabel(bias)
  };
}
function getThemeLabel(bias) {
  const labels = {
    GRIEF: "The weight of accumulated loss",
    LOVE: "Connection as throughline",
    DREAD: "Anticipation of the worst",
    WONDER: "Discovery as compass",
    RAGE: "Indignation as structure",
    GRACE: "Acceptance as goal"
  };
  return labels[bias] || "An undefined theme";
}
function applyWorldReactivityToEvent(event, soulState, worldState) {
  if (!event) return event;
  const reactivity = {
    echoBoost: 0,
    tagAmplification: [],
    consequenceModifier: 1,
    phrase: ""
  };
  const echoes = getFragmentWorldEchoes(soulState, event.era);
  const matchingEchoes = echoes.filter(
    (e) => event.cascadeTags?.some((t) => e.cascadeTags.includes(t))
  );
  if (matchingEchoes.length > 0) {
    reactivity.echoBoost = matchingEchoes.reduce((sum, e) => sum + e.intensity, 0) * 0.1;
    reactivity.consequenceModifier += matchingEchoes.length * 0.1;
    reactivity.phrase = `World reacts: ${matchingEchoes.length} fragment echo(es) influence this moment`;
  }
  const anchors = getAnchorWorldEchos(soulState);
  const anchorMatches = anchors.filter(
    (a) => event.cascadeTags?.some((t) => a.cascadeTags?.includes(t))
  );
  if (anchorMatches.length > 0) {
    reactivity.tagAmplification.push(...anchorMatches.map((a) => a.value));
    reactivity.phrase += ` \xE2\u02DC\u2026 Anchor resonance detected`;
  }
  const { pairHits } = checkResonancePairs(soulState);
  const activePairs = pairHits.filter(
    (p) => event.cascadeTags?.some((t) => t === p.tag1 || t === p.tag2)
  );
  if (activePairs.length > 0) {
    reactivity.consequenceModifier *= 1 + activePairs.length * 0.05;
  }
  if (event.intensity !== void 0) {
    event.intensity = Math.min(1, event.intensity + reactivity.echoBoost);
  }
  return event;
}
function checkMortalityPeak(age, era, soulState) {
  const peakThresholds = {
    infant: age >= 0 && age <= 4,
    adolescent: age >= 15 && age <= 24,
    middle: age >= 45 && age <= 54,
    senior: age >= 75 && age <= 84,
    ancient: age >= 95
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
        worldReactivity: peakSeverity
      });
    }
  }
  return activePeaks;
}
function calculatePeakSeverity(peakName, age, complexity) {
  let severity = 0.5;
  switch (peakName) {
    case "infant":
      severity = 0.3 + complexity * 0.01;
      break;
    case "adolescent":
      severity = 0.4 + complexity * 0.01;
      break;
    case "middle":
      severity = 0.6 + complexity * 5e-3;
      break;
    case "senior":
      severity = 0.8 + complexity * 3e-3;
      break;
    case "ancient":
      severity = 0.95;
      break;
  }
  return Math.min(severity, 1);
}
function handleMortalityPeakYes(peak, soulState) {
  const result = {
    survived: true,
    phrase: `Mortality peak ${peak.name} at age ${peak.age} \xE2 \u201D survived`,
    rewards: {
      complexityBonus: Math.floor(peak.severity * 3),
      fragmentStrengthBonus: peak.severity * 0.1
    }
  };
  if (soulState?.metaStats) {
    soulState.metaStats.peaksSurvived = (soulState.metaStats.peaksSurvived || 0) + 1;
  }
  return result;
}
function handleMortalityPeakNo(peak, soulState) {
  const result = {
    survived: false,
    phrase: `Mortality peak ${peak.name} at age ${peak.age} \xE2 \u201D not survived`,
    consequences: {
      complexityLoss: Math.floor(peak.severity * 2),
      memoryBleedIncrease: peak.severity * 0.2
    }
  };
  return result;
}
function updateBittersweetIndicator(lifeEvents, soulState) {
  let bittersweetScore = 0;
  let joyCount = 0;
  let griefCount = 0;
  for (const event of lifeEvents || []) {
    const intensity = event.intensity || event.emotionalIntensity || 0.5;
    if (event.cascadeTags?.some((t) => ["joy", "triumph", "connection", "grace"].includes(t))) {
      joyCount++;
      bittersweetScore += intensity;
    }
    if (event.cascadeTags?.some((t) => ["grief", "loss", "betrayal", "rage"].includes(t))) {
      griefCount++;
      bittersweetScore -= intensity * 0.5;
    }
  }
  const ratio = joyCount + griefCount > 0 ? Math.abs(joyCount - griefCount) / (joyCount + griefCount) : 0;
  let classification;
  if (bittersweetScore > 2) classification = "joy_heavy";
  else if (bittersweetScore < -2) classification = "grief_heavy";
  else if (ratio < 0.3) classification = "bittersweet_balanced";
  else classification = "neutral";
  return {
    score: bittersweetScore,
    joyCount,
    griefCount,
    ratio,
    classification,
    phrase: buildBittersweetPhrase(bittersweetScore, classification)
  };
}
function buildBittersweetPhrase(score, classification) {
  if (classification === "joy_heavy") return "Life tilted toward joy";
  if (classification === "grief_heavy") return "Grief dominated the journey";
  if (classification === "bittersweet_balanced") return "Joy and grief in equal measure";
  return "The emotional balance remains unclear";
}
function updateConsequenceVignette(lifeEvents) {
  const vignettes = [];
  if (!lifeEvents || lifeEvents.length === 0) return vignettes;
  const majorEvents = lifeEvents.filter((e) => {
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
      phrase: buildVignettePhrase(event)
    });
  }
  return vignettes;
}
function calculateConsequenceLevel(event) {
  let level = "minor";
  const intensity = event.intensity || event.emotionalIntensity || 0.5;
  if (event.isDeathEvent) level = "terminal";
  else if (event.crisisTag) level = "major";
  else if (intensity >= 0.8) level = "significant";
  else if (intensity >= 0.6) level = "moderate";
  return level;
}
function buildVignettePhrase(event) {
  const level = calculateConsequenceLevel(event);
  const phrases = {
    terminal: `\xE2\u2014\u2020 ${event.title} \xE2 \u201D the end came`,
    major: `\xE2\u2014\u2021 ${event.title} \xE2 \u201D a turning point`,
    significant: `\xC2\xB7 ${event.title} \xE2 \u201D left its mark`,
    moderate: `\xC2\xB7 ${event.title} \xE2 \u201D ripples outward`,
    minor: `- ${event.title}`
  };
  return phrases[level] || `- ${event.title}`;
}
function createWorldState(soulState, lifeEvents, currentLife) {
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
    worldPhrase: generateWorldPhrase(soulState, lifeEvents)
  };
}
function generateWorldPhrase(soulState, lifeEvents) {
  const complexity = getSoulComplexityScore(soulState);
  const motifs = getMemoryChainMotifs(soulState, lifeEvents);
  const { pairHits } = checkResonancePairs(soulState);
  if (complexity >= 80) return "The world has been thoroughly shaped by this soul";
  if (motifs.length >= 4) return "Multiple life themes have carved their patterns into the world";
  if (pairHits.length >= 3) return "Resonance pairs create harmonics across the soul's journey";
  if (complexity >= 50) return "The soul's complexity grows into world-altering force";
  if (complexity >= 20) return "The world begins to remember this soul";
  return "The soul begins leaving echoes in the world";
}
function generateSoulSignature(soulState) {
  if (!soulState) return "A nameless soul, unmoored and without history.";
  const lives = soulState.livesLived || 0;
  const years = soulState.totalYearsLived || 0;
  const fragments = soulState.fragments || [];
  const anchors = soulState.anchors || [];
  const unlockedEras = soulState.unlockedEras || ["ANCIENT", "MEDIEVAL"];
  const metaStats = soulState.metaStats || {};
  const fragmentTypeCounts = {};
  for (const f of fragments) {
    fragmentTypeCounts[f.type] = (fragmentTypeCounts[f.type] || 0) + 1;
  }
  const dominantTypes = Object.entries(fragmentTypeCounts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([type]) => type);
  const metaphorMap = {
    tone: "woven from silence and the memory of bells",
    fear: "knotted from the fiber of things that lurk in peripheral vision",
    love: "tied in the shape of hands that held on and those that let go",
    location: "threaded with the cartography of places that no longer exist",
    name: "etched with names whispered in dark rooms",
    object: "assembled from objects that outlived their purpose",
    word: "written in a language whose grammar shifts when you look away",
    warning: "scarred with warnings that arrived too late"
  };
  const dominantMetaphor = dominantTypes.length > 0 ? dominantTypes.map((t) => metaphorMap[t] || "a texture of uncertain origin").join("; ") : "an untempered essence still finding its shape";
  const eraAffinity = getEraAffinity(unlockedEras, fragments);
  const livesClause = lives === 1 ? "one life" : `${lives} lives`;
  const yearsClause = years < 100 ? `${years} years` : `${Math.floor(years / 100)} centuries and ${years % 100} years`;
  let anchorClause = "";
  if (anchors.length > 0) {
    const anchorThemes = anchors.map((a) => {
      const tag = a.cascadeTags && a.cascadeTags.length > 0 ? a.cascadeTags[0] : "weight";
      return tag;
    });
    const uniqueThemes = [...new Set(anchorThemes)];
    if (uniqueThemes.length === 1) {
      anchorClause = `, carrying ${uniqueThemes[0]} like a wound that teaches`;
    } else {
      anchorClause = `, ${uniqueThemes.slice(0, 2).join(" and ")} anchored in the flesh like habits`;
    }
  }
  const patternNote = detectNotablePattern(metaStats, soulState);
  const scarTissue = buildScarTissue(metaStats, fragments);
  let signature = `A soul ${livesClause} old, ${yearsClause} of memory. ${capitalize(dominantMetaphor)}.`;
  signature += `
This soul has wandered through ${unlockedEras.length} eras, and the ${eraAffinity} era feels like home.`;
  if (anchorClause) signature += `
Built from ${anchors.length} anchor${anchors.length !== 1 ? "s" : ""}${anchorClause}.`;
  if (patternNote) signature += ` ${patternNote}.`;
  if (scarTissue) signature += ` ${scarTissue}`;
  return signature;
}
function getEraAffinity(unlockedEras, fragments) {
  const eraOrder = ["ANCIENT", "MEDIEVAL", "EARLY_MODERN", "INDUSTRIAL", "MODERN", "NEAR_FUTURE", "FAR_FUTURE"];
  const eraWeights = {};
  for (const era of unlockedEras) eraWeights[era] = 1;
  for (const f of fragments) {
    if (f.origin && f.origin.era && eraWeights[f.origin.era] !== void 0) {
      eraWeights[f.origin.era] = (eraWeights[f.origin.era] || 1) + f.strength;
    }
  }
  let bestEra = unlockedEras[0] || "ANCIENT";
  let bestScore = 0;
  for (const [era, score] of Object.entries(eraWeights)) {
    if (score > bestScore) {
      bestScore = score;
      bestEra = era;
    }
  }
  const eraLabels = {
    ANCIENT: "Ancient",
    MEDIEVAL: "medieval",
    EARLY_MODERN: "early modern",
    INDUSTRIAL: "industrial",
    MODERN: "modern",
    NEAR_FUTURE: "near-future",
    FAR_FUTURE: "far-future"
  };
  return eraLabels[bestEra] || bestEra.toLowerCase();
}
function detectNotablePattern(metaStats, soulState) {
  const lives = soulState?.livesLived || 0;
  const years = soulState?.totalYearsLived || 0;
  const violentDeaths = metaStats?.violentDeaths || 0;
  const peacefulDeaths = metaStats?.peacefulDeaths || 0;
  if (lives >= 5 && violentDeaths > peacefulDeaths * 2) {
    return "It has a habit of ending badly";
  }
  if (lives >= 3 && years / lives < 30) {
    return "The deaths keep coming early";
  }
  if (lives >= 4 && peacefulDeaths > violentDeaths) {
    return "It dies quietly, as if the world has agreed to let it go";
  }
  if (soulState?.metaStats?.lovesLost > 3) {
    return "Connection has been a repeating wound";
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
  return "Unresolved consequences have become " + scars.join(" and ") + ".";
}
function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function generateLifeEulogy(life) {
  if (!life) return "A life of unknown span, lost to silence.";
  const years = life.age || life.yearsLived || 0;
  const era = life.era || "UNKNOWN";
  const cause = life.deathCause || (life.deathEvent ? life.deathEvent.title : null);
  const events = life.events || [];
  if (years === 0) return "A life that barely drew breath and was gone.";
  let eulogy = `A life of ${years} year${years !== 1 ? "s" : ""}`;
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
    grief: "marked by an absence that never filled",
    love: "defined by bonds that outlasted their objects",
    dread: "shadowed by something that never named itself",
    wonder: "colored by discovery in unexpected places",
    rage: "structured around a fire that burned everything",
    grace: "softened by acceptance earned the hard way",
    connection: "held together by the weight of others",
    loss: "reaching for what slipped away",
    betrayal: "taught the cost of misplaced trust",
    anchor: "finding its shape around something unbreakable"
  };
  if (topTags.length > 0) {
    const desc = lifeDescriptors[topTags[0]] || lifeDescriptors[topTags[1]] || null;
    if (desc) eulogy += `, ${desc}`;
  }
  if (cause) {
    const shortCause = cause.replace(/^The /, "").replace(/\s+take[s]?\s+you$/, "").replace(/\s+comes?\s+through$/, "");
    eulogy += `, ending in ${shortCause.toLowerCase()}.`;
  } else {
    eulogy += ".";
  }
  return eulogy;
}
function generateEraProhecy(era, fragments) {
  if (era !== "ANCIENT") return null;
  if (!fragments || fragments.length === 0) return null;
  const prophecies = [
    "The thread you carry will pull at the seams of what is to come. The Fates are listening.",
    "You have walked between worlds before. The door will open again \xE2 \u201D but not for free.",
    "The echoes of your past lives have reached the ears of those who decide fate. They are not pleased.",
    "What was broken in you has not healed. It has become a map. Others will follow it.",
    "The souls who came before you left marks on the architecture of the world. You will leave deeper ones.",
    "The gods have noted your name. It appears in ledgers they do not show each other.",
    "You will outlive the empires you are about to build and those you have already let fall.",
    "The pattern in your suffering has a shape the universe recognizes. It will call you back.",
    "Something ancient stirs at the mention of your soul's composition. It has been waiting.",
    "The oracles speak of a soul that bends the thread it walks on. They do not agree on the direction."
  ];
  const strongFragments = fragments.filter((f) => f.strength > 0.5);
  const fragmentHint = strongFragments.length > 0 ? ` ${capitalize(strongFragments[0].value)}.` : "";
  const base = prophecies[Math.floor(Math.random() * prophecies.length)];
  return base + fragmentHint;
}
function generateAnchorNarrative(anchor) {
  if (!anchor) return "An anchor of unknown origin, holding nothing and everything.";
  const value = anchor.value || "something unnamed";
  const type = anchor.type || "tone";
  const strength = anchor.strength || 0.5;
  const tags = anchor.cascadeTags || [];
  const origin = anchor.origin || {};
  const typeMeanings = {
    tone: "a sound that once meant everything and now means nothing and now means everything again",
    fear: "the echo of something that frightened you before you had words for fright",
    love: "a shape left by someone who mattered \xE2 \u201D the ghost of their outline pressed into your outline",
    location: "a place that exists only in the space between your rib bones",
    name: "a sound that calls up a face you cannot quite surface",
    object: "a thing you held when the world was solid, and its weight taught you what solid meant",
    word: "a word that became a door and the key and the locking mechanism all at once",
    warning: "a signal from a future that has not arrived yet but is already pulling you toward it"
  };
  const strengthDescriptor = strength > 0.8 ? " It is load-bearing." : strength > 0.5 ? " It holds more than it should." : " It holds, barely.";
  const tagDescriptor = tags.length > 0 ? ` The tags say ${tags.join(", ")}.` : "";
  const originDescriptor = origin.era && origin.era !== "UNKNOWN" ? ` This anchor first formed in the ${origin.era.toLowerCase().replace("_", " ")} era.` : "";
  const narrative = `${capitalize(value)}${originDescriptor} It is ${typeMeanings[type] || "a meaning that refuses to be named"}.${strengthDescriptor}${tagDescriptor}`;
  return narrative;
}
function generateMemoryBleedText(lives, currentPhase) {
  if (!lives || lives < 2) return null;
  const bleedLines = [
    "You've been here before. The light was different but the fear was the same.",
    "This moment has a shape you recognize from a life you don't remember living.",
    "Your hands know what to do before your mind catches up.",
    "You feel like you've said this, or something like it, a hundred times before.",
    "The geometry of this room matches a room from a dream you woke from crying.",
    "Someone is about to say the thing they are about to say. You already know the shape of their mouth.",
    "The air tastes like a memory the body keeps and the mind forgot.",
    "You came here once already. The first time you died.",
    "This is the part where something breaks. You know this the way you know your own name.",
    "The echoes of other lives press against the membrane of this one.",
    "You pause, and in the pause is a whole other life you never finished.",
    "The light through the window is the same light through a window you can't place.",
    "Someone calls your name and for a moment you answer to a different self.",
    "The fear is old. Older than this body. It remembers what your mind forgets.",
    "This crossroads has appeared before. Each time you choose differently. Each time the same."
  ];
  const phaseModifiers = {
    INFANT: " You are very small and the world is very large and something vast is looking at you.",
    CHILD: " You don't understand yet. The d\xC3\xA9j\xC3\xA0 vu is a word you haven't learned yet.",
    ADOLESCENT: " You question whether this is real. You're right to question.",
    YOUNG_ADULT: " You have just enough experience to know something is wrong. Not enough to name it.",
    MIDDLE_AGE: " You stop and look around. You've been here. You are sure.",
    SENIOR: " You smile because you finally understand. It's too late to change anything.",
    ANCIENT: " The weight of all the other times presses down. You barely notice anymore."
  };
  const modifier = phaseModifiers[currentPhase] || "";
  const line = bleedLines[Math.floor(Math.random() * bleedLines.length)];
  return line + modifier;
}
function getSoulDominantEmotion(soulState) {
  if (!soulState?.fragments || soulState.fragments.length === 0) return "wonder";
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
    if (score > maxScore) {
      maxScore = score;
      maxTag = tag;
    }
  }
  const emotionMap = {
    grief: "grief",
    sadness: "grief",
    sorrow: "grief",
    loss: "grief",
    mourning: "grief",
    love: "love",
    connection: "love",
    tenderness: "love",
    affection: "love",
    dread: "dread",
    fear: "dread",
    terror: "dread",
    vertigo: "dread",
    wonder: "wonder",
    awe: "wonder",
    discovery: "wonder",
    curiosity: "wonder",
    rage: "rage",
    anger: "rage",
    betrayal: "rage",
    fury: "rage",
    grace: "grace",
    acceptance: "grace",
    peace: "grace",
    resignation: "grace"
  };
  return emotionMap[maxTag?.toLowerCase()] || "wonder";
}
function generateSoulAboutPanel(soulState) {
  if (!soulState) return null;
  const signature = generateSoulSignature(soulState);
  const dominantEmotion = getSoulDominantEmotion(soulState);
  const complexity = getSoulComplexityScore(soulState);
  const eraAffinity = getEraAffinity(soulState.unlockedEras || [], soulState.fragments || []);
  const lives = soulState.livesLived || 0;
  const years = soulState.totalYearsLived || 0;
  const anchors = soulState.anchors || [];
  const metaStats = soulState.metaStats || {};
  const patternNote = detectNotablePattern(metaStats, soulState) || "No distinct pattern detected.";
  return {
    signature,
    dominantEmotion,
    complexity,
    eraAffinity,
    patternNote,
    lives,
    years,
    anchorCount: anchors.length
  };
}
var ERA_NARRATIVE_BEATS, MORTALITY_PEAK_PHRASES, RESONANCE_PAIRS, ACHIEVEMENT_DEFS, CHAIN_TAG_MAP;
var init_world = __esm({
  "js/world.js"() {
    ERA_NARRATIVE_BEATS = {
      ANCIENT: {
        beats: [
          { age: 0, type: "birth", intensity: 0.3, phrase: "A soul enters the mortal curve" },
          { age: 7, type: "first_word", intensity: 0.2, phrase: "The name that shapes a lifetime" },
          { age: 13, type: "awakening", intensity: 0.4, phrase: "The world reveals its edges" },
          { age: 18, type: "bond", intensity: 0.5, phrase: "Someone becomes essential" },
          { age: 25, type: "loss", intensity: 0.6, phrase: "The first great absence" },
          { age: 35, type: "purpose", intensity: 0.5, phrase: "A calling crystallizes" },
          { age: 50, type: "legacy", intensity: 0.4, phrase: "What you leave behind" },
          { age: 65, type: "reflection", intensity: 0.5, phrase: "The shape of the journey seen" },
          { age: 80, type: "release", intensity: 0.6, phrase: "The letting go begins" }
        ],
        keyTags: ["grief", "dread", "connection", "wonder", "resignation"]
      },
      MEDIEVAL: {
        beats: [
          { age: 0, type: "birth", intensity: 0.3, phrase: "Baptized into the sacred covenant" },
          { age: 7, type: "faith", intensity: 0.4, phrase: "The church bells mark time and fate" },
          { age: 14, type: "apprenticeship", intensity: 0.5, phrase: "A trade becomes identity" },
          { age: 20, type: "plague", intensity: 0.7, phrase: "Death walks through the village" },
          { age: 30, type: "love", intensity: 0.5, phrase: "In the shadow of the abbey" },
          { age: 45, type: "loss", intensity: 0.6, phrase: "Children buried before parents" },
          { age: 60, type: "grace", intensity: 0.5, phrase: "Faith softens into acceptance" },
          { age: 75, type: "resignation", intensity: 0.6, phrase: "The plague took the rest" }
        ],
        keyTags: ["grief", "grace", "resignation", "faith", "dread"]
      },
      EARLY_MODERN: {
        beats: [
          { age: 0, type: "birth", intensity: 0.3, phrase: "Enlightenment dawns on the new world" },
          { age: 12, type: "reason", intensity: 0.4, phrase: "The old gods begin to falter" },
          { age: 18, type: "departure", intensity: 0.5, phrase: "The colonies call across the water" },
          { age: 28, type: "betrayal", intensity: 0.6, phrase: "The revolution eats its children" },
          { age: 40, type: "discovery", intensity: 0.5, phrase: "New horizons reshape the known" },
          { age: 55, type: "alchemy", intensity: 0.4, phrase: "Transformation of self and world" },
          { age: 70, type: "memory", intensity: 0.5, phrase: "The weight of what was built" },
          { age: 85, type: "dissolution", intensity: 0.6, phrase: "Old world, new world, no world" }
        ],
        keyTags: ["betrayal", "discovery", "vertigo", "rage", "awe"]
      },
      INDUSTRIAL: {
        beats: [
          { age: 0, type: "birth", intensity: 0.3, phrase: "Born into the smoke and piston" },
          { age: 10, type: "factory", intensity: 0.6, phrase: "The machines shape the hands" },
          { age: 20, type: "union", intensity: 0.5, phrase: "Voices join against the din" },
          { age: 30, type: "war", intensity: 0.8, phrase: "The trenches remember everything" },
          { age: 45, type: "loss", intensity: 0.7, phrase: "The fallen stay fallen" },
          { age: 60, type: "recovery", intensity: 0.4, phrase: "From ashes, something new" },
          { age: 75, type: "legacy", intensity: 0.5, phrase: "The workers who became the world" }
        ],
        keyTags: ["dread", "grief", "rage", "connection", "numbness"]
      },
      MODERN: {
        beats: [
          { age: 0, type: "birth", intensity: 0.3, phrase: "Screened into existence" },
          { age: 10, type: "connection", intensity: 0.5, phrase: "The network becomes the self" },
          { age: 20, type: "alienation", intensity: 0.6, phrase: "The screens watch back" },
          { age: 30, type: "diagnosis", intensity: 0.5, phrase: "The body reveals its limits" },
          { age: 45, type: "loss", intensity: 0.6, phrase: "The layoff, the divorce, the silence" },
          { age: 55, type: "clarity", intensity: 0.4, phrase: "What the noise was hiding" },
          { age: 70, type: "connection", intensity: 0.5, phrase: "The grandchildren and the photos" },
          { age: 85, type: "grace", intensity: 0.6, phrase: "Permission to stop running" }
        ],
        keyTags: ["isolation", "connection", "dread", "vertigo", "grace"]
      },
      NEAR_FUTURE: {
        beats: [
          { age: 0, type: "birth", intensity: 0.3, phrase: "Algorithmically tagged at birth" },
          { age: 12, type: "algorithm", intensity: 0.5, phrase: "The AI tutor knows too much" },
          { age: 25, type: "climate", intensity: 0.7, phrase: "The relocation notice arrives" },
          { age: 35, type: "denial", intensity: 0.6, phrase: "The system denies what the body knows" },
          { age: 50, type: "neural", intensity: 0.5, phrase: "The link opens new doors and closes others" },
          { age: 65, type: "adaptation", intensity: 0.5, phrase: "You become what you were against" },
          { age: 80, type: "surrender", intensity: 0.6, phrase: "The algorithm was right" }
        ],
        keyTags: ["dread", "disorientation", "rage", "dissolution", "awe"]
      },
      FAR_FUTURE: {
        beats: [
          { age: 0, type: "birth", intensity: 0.3, phrase: "Vat-grown or natural, the soul is the same" },
          { age: 20, type: "enhancement", intensity: 0.5, phrase: "The gene therapy works" },
          { age: 35, type: "upload", intensity: 0.6, phrase: "You choose the digital path" },
          { age: 50, type: "connection", intensity: 0.5, phrase: "The AI companion knows your grief" },
          { age: 65, type: "signal", intensity: 0.7, phrase: "The signal from the deep array arrives" },
          { age: 80, type: "integration", intensity: 0.6, phrase: "Human, posthuman, both, neither" },
          { age: 95, type: "transcendence", intensity: 0.7, phrase: "The substrate releases what it held" }
        ],
        keyTags: ["awe", "vertigo", "dissolution", "connection", "grace"]
      }
    };
    MORTALITY_PEAK_PHRASES = {
      infant_critical: [
        "The early years hold no guarantees",
        "Infant mortality shapes the curve",
        "The first breath is not promised"
      ],
      adolescent_rise: [
        "The mortality curve bends upward",
        "Reckless years bring new risks",
        "The body tests its limits"
      ],
      middle_age_acceleration: [
        "The midlife mortality spike approaches",
        "The curve steepens imperceptibly",
        "Years accumulate like interest on a debt"
      ],
      senior_critical: [
        "The final mortality peak approaches",
        "Every year becomes a negotiation",
        "The curve approaches infinity"
      ],
      ancient_extreme: [
        "The probability of ending grows certainty",
        "Outliers become the norm",
        "The curve has no ceiling here"
      ],
      peak_moment: [
        "A mortality peak is reached",
        "The probability of ending aligns with the moment",
        "The world reminds the soul of its terms"
      ]
    };
    RESONANCE_PAIRS = [
      { tag1: "grief", tag2: "grace", resonance: 0.8, phrase: "Loss softens into acceptance" },
      { tag1: "dread", tag2: "vertigo", resonance: 0.7, phrase: "Fear spirals into disorientation" },
      { tag1: "wonder", tag2: "awe", resonance: 0.9, phrase: "Curiosity becomes reverence" },
      { tag1: "rage", tag2: "betrayal", resonance: 0.75, phrase: "Anger born of broken trust" },
      { tag1: "connection", tag2: "tenderness", resonance: 0.85, phrase: "Bonds deepen into care" },
      { tag1: "loss", tag2: "resignation", resonance: 0.7, phrase: "Grief settles into acceptance" },
      { tag1: "isolation", tag2: "dissolution", resonance: 0.65, phrase: "Alone becomes forgotten" },
      { tag1: "numbness", tag2: "disorientation", resonance: 0.6, phrase: "Detachment creates fog" },
      { tag1: "faith", tag2: "grace", resonance: 0.8, phrase: "Belief finds its reward" },
      { tag1: "awakening", tag2: "clarity", resonance: 0.75, phrase: "Vision clears into truth" },
      { tag1: "triumph", tag2: "legacy", resonance: 0.7, phrase: "Victory outlasts the victor" },
      { tag1: "longing", tag2: "anchor", resonance: 0.6, phrase: "Yearning finds its mooring" }
    ];
    ACHIEVEMENT_DEFS = {
      gone_too_soon: {
        id: "gone_too_soon",
        name: "Gone Too Soon",
        description: "Die before age 5",
        icon: "\xE2\u0161\xB0",
        tier: "bronze",
        condition: (soul, lifeEvents, deathEvent, category) => category === "lifespan" && deathEvent && deathEvent.age < 5,
        reward: null,
        category: "lifespan"
      },
      centurian: {
        id: "centurian",
        name: "Centurian",
        description: "Live to age 80 or beyond",
        icon: "\xF0\u0178\u2018\xB4",
        tier: "silver",
        condition: (soul, lifeEvents, deathEvent, category) => category === "lifespan" && deathEvent && deathEvent.age >= 80,
        reward: { type: "bonus_fragment_slot" },
        category: "lifespan"
      },
      methuselah: {
        id: "methuselah",
        name: "Methuselah",
        description: "Live to age 100 or beyond",
        icon: "\xF0\u0178\xA7\u201C",
        tier: "gold",
        condition: (soul, lifeEvents, deathEvent, category) => category === "lifespan" && deathEvent && deathEvent.age >= 100,
        reward: { type: "bonus_fragment_slot" },
        category: "lifespan"
      },
      ancient_of_days: {
        id: "ancient_of_days",
        name: "Ancient of Days",
        description: "Live to age 110 or beyond",
        icon: "\xF0\u0178\u0152\xB3",
        tier: "platinum",
        condition: (soul, lifeEvents, deathEvent, category) => category === "lifespan" && deathEvent && deathEvent.age >= 110,
        reward: { type: "unlock_era", era: "FAR_FUTURE" },
        category: "lifespan"
      },
      fragment_awakening: {
        id: "fragment_awakening",
        name: "Fragment Awakening",
        description: "Collect your first fragment",
        icon: "\xF0\u0178\u2019\u017D",
        tier: "bronze",
        condition: (soul, lifeEvents, deathEvent, category) => category === "fragment" && soul.fragments?.length >= 1,
        reward: null,
        category: "fragment"
      },
      memory_keeper: {
        id: "memory_keeper",
        name: "Memory Keeper",
        description: "Collect 10 fragments",
        icon: "\xF0\u0178\u201C\u0161",
        tier: "silver",
        condition: (soul, lifeEvents, deathEvent, category) => category === "fragment" && soul.fragments?.length >= 10,
        reward: { type: "bonus_fragment_slot" },
        category: "fragment"
      },
      fragment_collector: {
        id: "fragment_collector",
        name: "Fragment Collector",
        description: "Collect 25 fragments",
        icon: "\xF0\u0178\x8F\u203A\xEF\xB8\x8F",
        tier: "gold",
        condition: (soul, lifeEvents, deathEvent, category) => category === "fragment" && soul.fragments?.length >= 25,
        reward: { type: "bonus_fragment_slot" },
        category: "fragment"
      },
      archive_of_lives: {
        id: "archive_of_lives",
        name: "Archive of Lives",
        description: "Collect 50 fragments",
        icon: "\xF0\u0178\u2014\u201E\xEF\xB8\x8F",
        tier: "platinum",
        condition: (soul, lifeEvents, deathEvent, category) => category === "fragment" && soul.fragments?.length >= 50,
        reward: { type: "unlock_era", era: "FAR_FUTURE" },
        category: "fragment"
      },
      anchor_born: {
        id: "anchor_born",
        name: "Anchor Born",
        description: "Form your first anchor",
        icon: "\xE2\u0161\u201C",
        tier: "bronze",
        condition: (soul, lifeEvents, deathEvent, category) => category === "anchor" && soul.anchors?.length >= 1,
        reward: null,
        category: "anchor"
      },
      trinity_of_echoes: {
        id: "trinity_of_echoes",
        name: "Trinity of Echoes",
        description: "Form 3 anchors",
        icon: "\xF0\u0178\u201D\xB1",
        tier: "silver",
        condition: (soul, lifeEvents, deathEvent, category) => category === "anchor" && soul.anchors?.length >= 3,
        reward: { type: "bonus_fragment_slot" },
        category: "anchor"
      },
      constellation_of_echoes: {
        id: "constellation_of_echoes",
        name: "Constellation of Echoes",
        description: "Form 5 anchors",
        icon: "\xE2\u0153\xA8",
        tier: "gold",
        condition: (soul, lifeEvents, deathEvent, category) => category === "anchor" && soul.anchors?.length >= 5,
        reward: { type: "special_anchor_type" },
        category: "anchor"
      },
      era_hopper: {
        id: "era_hopper",
        name: "Era Hopper",
        description: "Live in 4 different eras",
        icon: "\xF0\u0178\u2014\xBA\xEF\xB8\x8F",
        tier: "silver",
        condition: (soul, lifeEvents, deathEvent, category) => category === "era" && (soul.unlockedEras?.length || 0) >= 4,
        reward: null,
        category: "era"
      },
      era_walker: {
        id: "era_walker",
        name: "Era Walker",
        description: "Live in all 7 eras",
        icon: "\xF0\u0178\u0152\x8D",
        tier: "gold",
        condition: (soul, lifeEvents, deathEvent, category) => category === "era" && (soul.unlockedEras?.length || 0) >= 7,
        reward: { type: "unlock_era", era: "FAR_FUTURE" },
        category: "era"
      },
      omnitemporal: {
        id: "omnitemporal",
        name: "Omnitemporal",
        description: "Witness every era across your journeys",
        icon: "\xF0\u0178\u0152\u017D",
        tier: "platinum",
        condition: (soul, lifeEvents, deathEvent, category) => category === "era" && (soul.unlockedEras?.length || 0) >= 7 && soul.livesLived >= 10,
        reward: { type: "special_title", title: "Omnitemporal Wanderer" },
        category: "era"
      },
      storm_survivor: {
        id: "storm_survivor",
        name: "Storm Survivor",
        description: "Survive 5 crises",
        icon: "\xE2\u203A\u02C6\xEF\xB8\x8F",
        tier: "bronze",
        condition: (soul, lifeEvents, deathEvent, category) => category === "crisis" && (soul.metaStats?.crisesSurvived || 0) >= 5,
        reward: null,
        category: "crisis"
      },
      crisis_forger: {
        id: "crisis_forger",
        name: "Crisis Forger",
        description: "Survive 10 crises",
        icon: "\xE2\u0161\xA1",
        tier: "silver",
        condition: (soul, lifeEvents, deathEvent, category) => category === "crisis" && (soul.metaStats?.crisesSurvived || 0) >= 10,
        reward: { type: "bonus_fragment_slot" },
        category: "crisis"
      },
      unbreakable: {
        id: "unbreakable",
        name: "Unbreakable",
        description: "Survive 25 crises",
        icon: "\xF0\u0178\u203A\xA1\xEF\xB8\x8F",
        tier: "gold",
        condition: (soul, lifeEvents, deathEvent, category) => category === "crisis" && (soul.metaStats?.crisesSurvived || 0) >= 25,
        reward: { type: "bonus_fragment_slot" },
        category: "crisis"
      },
      grief_weaver: {
        id: "grief_weaver",
        name: "Grief Weaver",
        description: "Complete a grief chain of 5+ events",
        icon: "\xF0\u0178\u2019\u201D",
        tier: "silver",
        condition: (soul, lifeEvents, deathEvent, category) => category === "chain" && countChainType(lifeEvents, "GRIEF") >= 5,
        reward: null,
        category: "chain"
      },
      love_weaver: {
        id: "love_weaver",
        name: "Love Weaver",
        description: "Complete a love chain of 5+ events",
        icon: "\xE2\x9D\xA4\xEF\xB8\x8F",
        tier: "silver",
        condition: (soul, lifeEvents, deathEvent, category) => category === "chain" && countChainType(lifeEvents, "LOVE") >= 5,
        reward: null,
        category: "chain"
      },
      dread_weaver: {
        id: "dread_weaver",
        name: "Dread Weaver",
        description: "Complete a dread chain of 5+ events",
        icon: "\xF0\u0178\u2018\x81\xEF\xB8\x8F",
        tier: "silver",
        condition: (soul, lifeEvents, deathEvent, category) => category === "chain" && countChainType(lifeEvents, "DREAD") >= 5,
        reward: null,
        category: "chain"
      },
      wonder_weaver: {
        id: "wonder_weaver",
        name: "Wonder Weaver",
        description: "Complete a wonder chain of 5+ events",
        icon: "\xE2\u0153\xA8",
        tier: "silver",
        condition: (soul, lifeEvents, deathEvent, category) => category === "chain" && countChainType(lifeEvents, "WONDER") >= 5,
        reward: null,
        category: "chain"
      },
      rage_weaver: {
        id: "rage_weaver",
        name: "Rage Weaver",
        description: "Complete a rage chain of 5+ events",
        icon: "\xF0\u0178\u201D\xA5",
        tier: "silver",
        condition: (soul, lifeEvents, deathEvent, category) => category === "chain" && countChainType(lifeEvents, "RAGE") >= 5,
        reward: null,
        category: "chain"
      },
      grace_weaver: {
        id: "grace_weaver",
        name: "Grace Weaver",
        description: "Complete a grace chain of 5+ events",
        icon: "\xF0\u0178\u2022\u0160\xEF\xB8\x8F",
        tier: "silver",
        condition: (soul, lifeEvents, deathEvent, category) => category === "chain" && countChainType(lifeEvents, "GRACE") >= 5,
        reward: { type: "bonus_fragment_slot" },
        category: "chain"
      },
      chain_master: {
        id: "chain_master",
        name: "Chain Master",
        description: "Complete chains of 5+ events in all 6 emotional categories",
        icon: "\xF0\u0178\u201D\xAE",
        tier: "platinum",
        condition: (soul, lifeEvents, deathEvent, category) => category === "chain" && countChainType(lifeEvents, "GRIEF") >= 5 && countChainType(lifeEvents, "LOVE") >= 5 && countChainType(lifeEvents, "DREAD") >= 5 && countChainType(lifeEvents, "WONDER") >= 5 && countChainType(lifeEvents, "RAGE") >= 5 && countChainType(lifeEvents, "GRACE") >= 5,
        reward: { type: "special_title", title: "Master of All Chains" },
        category: "chain"
      },
      speedrunner: {
        id: "speedrunner",
        name: "Speedrunner",
        description: "Accumulate 10 fragments in under 5 lives",
        icon: "\xF0\u0178\u0161 ",
        tier: "gold",
        condition: (soul, lifeEvents, deathEvent, category) => category === "speedrunner" && soul.livesLived < 5 && (soul.fragments?.length || 0) >= 10,
        reward: { type: "bonus_fragment_slot" },
        category: "speedrunner"
      },
      swift_collector: {
        id: "swift_collector",
        name: "Swift Collector",
        description: "Accumulate 25 fragments in under 10 lives",
        icon: "\xF0\u0178\u2019\xA8",
        tier: "platinum",
        condition: (soul, lifeEvents, deathEvent, category) => category === "speedrunner" && soul.livesLived < 10 && (soul.fragments?.length || 0) >= 25,
        reward: { type: "special_title", title: "Swift Soul" },
        category: "speedrunner"
      },
      gentle_release: {
        id: "gentle_release",
        name: "Gentle Release",
        description: "Die of old age",
        icon: "\xF0\u0178\u02DC\u0152",
        tier: "bronze",
        condition: (soul, lifeEvents, deathEvent, category) => category === "peaceful" && isPeacefulDeath(deathEvent),
        reward: null,
        category: "peaceful"
      },
      violent_passage: {
        id: "violent_passage",
        name: "Violent Passage",
        description: "Die violently",
        icon: "\xE2\u0161\u201D\xEF\xB8\x8F",
        tier: "bronze",
        condition: (soul, lifeEvents, deathEvent, category) => category === "peaceful" && isViolentDeath(deathEvent),
        reward: null,
        category: "peaceful"
      },
      complexity_ascendant: {
        id: "complexity_ascendant",
        name: "Complexity Ascendant",
        description: "Reach 50 complexity",
        icon: "\xF0\u0178\u201D\xAE",
        tier: "gold",
        condition: (soul, lifeEvents, deathEvent, category) => category === "special" && getSoulComplexityScore(soul) >= 50,
        reward: { type: "bonus_fragment_slot" },
        category: "special"
      },
      memory_bleedthrough: {
        id: "memory_bleedthrough",
        name: "Memory Bleedthrough",
        description: "Fragments from past lives resonate in the present",
        icon: "\xF0\u0178\xA9\xB8",
        tier: "silver",
        condition: (soul, lifeEvents, deathEvent, category) => category === "special" && (soul.metaStats?.memoryBleeds || 0) >= 3,
        reward: null,
        category: "special"
      },
      resonance_master: {
        id: "resonance_master",
        name: "Resonance Master",
        description: "Create 2 resonance pairs",
        icon: "\xF0\u0178\u017D\xAD",
        tier: "gold",
        condition: (soul, lifeEvents, deathEvent, category) => category === "special" && (soul.metaStats?.resonancePairs || 0) >= 2,
        reward: { type: "bonus_fragment_slot" },
        category: "special"
      },
      peak_survivor: {
        id: "peak_survivor",
        name: "Peak Survivor",
        description: "Survive a mortality peak",
        icon: "\xF0\u0178\x8F\u201D\xEF\xB8\x8F",
        tier: "silver",
        condition: (soul, lifeEvents, deathEvent, category) => category === "special" && (soul.metaStats?.peaksSurvived || 0) >= 1,
        reward: null,
        category: "special"
      },
      meta_achiever: {
        id: "meta_achiever",
        name: "Achiever",
        description: "Unlock 10 achievements",
        icon: "\xF0\u0178\x8F\u2020",
        tier: "platinum",
        condition: (soul, lifeEvents, deathEvent, category) => category === "special" && (soul.achievementsUnlocked?.length || 0) >= 10,
        reward: { type: "special_title", title: "Achievement Seeker" },
        category: "special"
      },
      soul_pool_complete: {
        id: "soul_pool_complete",
        name: "Soul Pool Complete",
        description: "Ten fragments create a world",
        icon: "\xF0\u0178\u0152\x8D",
        tier: "silver",
        condition: (soul, lifeEvents, deathEvent, category) => category === "fragment" && soul.fragments?.length >= 10,
        reward: null,
        category: "fragment"
      },
      life_theme_crystallized: {
        id: "life_theme_crystallized",
        name: "Life Theme Crystallized",
        description: "A throughline emerges from chaos",
        icon: "\xF0\u0178\u2019\xAB",
        tier: "bronze",
        condition: (soul, lifeEvents, deathEvent, category) => category === "chain" && lifeEvents.length >= 5,
        reward: null,
        category: "chain"
      }
    };
    CHAIN_TAG_MAP = {
      GRIEF: ["grief", "sadness", "sorrow", "mourning", "loss", "despair", "melancholy"],
      LOVE: ["connection", "tenderness", "love", "affection", "devotion", "passion", "romance"],
      DREAD: ["dread", "vertigo", "fear", "terror", "anxiety", "panic", "horror"],
      WONDER: ["wonder", "awe", "discovery", "curiosity", "marvel"],
      RAGE: ["rage", "anger", "betrayal", "fury", "wrath", "resentment"],
      GRACE: ["grace", "resignation", "acceptance", "peace", "surrender"]
    };
  }
});

// js/ui.js
var ui_exports = {};
__export(ui_exports, {
  addClassToElement: () => addClassToElement,
  advanceCurrentEvent: () => advanceCurrentEvent,
  animateAchievementUnlock: () => animateAchievementUnlock,
  animateAnchorGlow: () => animateAnchorGlow,
  animateConsequenceCracks: () => animateConsequenceCracks,
  animateDeathRewind: () => animateDeathRewind,
  animateElement: () => animateElement,
  animateEraDissolve: () => animateEraDissolve,
  animateFingerprintReveal: () => animateFingerprintReveal,
  animateFragmentExtraction: () => animateFragmentExtraction,
  animateFragmentMerge: () => animateFragmentMerge,
  animatePhaseTransition: () => animatePhaseTransition,
  animateSoulFingerprintCanvas: () => animateSoulFingerprintCanvas,
  appendToElement: () => appendToElement,
  bindKeyboardShortcut: () => bindKeyboardShortcut,
  clearElement: () => clearElement,
  closeTutorial: () => closeTutorial,
  createChoiceButton: () => createChoiceButton,
  createClickableEffect: () => createClickableEffect,
  createEventCard: () => createEventCard,
  createFragmentTooltip: () => createFragmentTooltip,
  createLifeDetailModal: () => createLifeDetailModal,
  createMiniEventSummary: () => createMiniEventSummary,
  createMuseumModal: () => createMuseumModal,
  drawCrisisSpike: () => drawCrisisSpike,
  drawCurve: () => drawCurve,
  drawDeathEffect: () => drawDeathEffect,
  drawJCurve: () => drawJCurve,
  drawLifeDot: () => drawLifeDot,
  drawLimboParticles: () => drawLimboParticles,
  drawLimboParticlesSwirl: () => drawLimboParticlesSwirl,
  drawParticles: () => drawParticles,
  drawSoulFingerprintDots: () => drawSoulFingerprintDots,
  fadeInElement: () => fadeInElement,
  fadeOutElement: () => fadeOutElement,
  generateEventSceneForEvent: () => generateEventSceneForEvent,
  getEraTheme: () => getEraTheme,
  getFallbackGradient: () => getFallbackGradient,
  getSceneImagePath: () => getSceneImagePath,
  goBackInHistory: () => goBackInHistory,
  hasSeenTutorial: () => hasSeenTutorial,
  hideArrow: () => hideArrow,
  hideElementById: () => hideElementById,
  hideEventPanel: () => hideEventPanel,
  hideLoadingScreen: () => hideLoadingScreen,
  hideOverlay: () => hideOverlay,
  hidePauseOverlay: () => hidePauseOverlay,
  hideTitleScreen: () => hideTitleScreen,
  hideVictoryOverlay: () => hideVictoryOverlay,
  init: () => init,
  initToastModalDismiss: () => initToastModalDismiss,
  initTouchSupport: () => initTouchSupport,
  isNarrationEnabled: () => isNarrationEnabled,
  nextTutorialStep: () => nextTutorialStep,
  openLifeDetailModal: () => openLifeDetailModal,
  openMuseum: () => openMuseum,
  prevTutorialStep: () => prevTutorialStep,
  pulseElement: () => pulseElement,
  removeClassFromElement: () => removeClassFromElement,
  removeElement: () => removeElement,
  renderAchievements: () => renderAchievements,
  renderGoalTracker: () => renderGoalTracker,
  renderHealthBar: () => renderHealthBar,
  renderLifePhaseBar: () => renderLifePhaseBar,
  renderLoop: () => renderLoop,
  renderRiskDial: () => renderRiskDial,
  renderSoulAnalysisGrid: () => renderSoulAnalysisGrid,
  renderSoulFingerprint: () => renderSoulFingerprint,
  renderSpeedSlider: () => renderSpeedSlider,
  resizeCanvas: () => resizeCanvas,
  setElementHTML: () => setElementHTML,
  setElementText: () => setElementText,
  setNarrationEnabled: () => setNarrationEnabled,
  shakeElement: () => shakeElement,
  shouldGenerateScene: () => shouldGenerateScene,
  showAchievementModal: () => showAchievementModal,
  showAchievementNotifications: () => showAchievementNotifications,
  showArrow: () => showArrow,
  showConfirmDialog: () => showConfirmDialog,
  showContextualTip: () => showContextualTip,
  showDeathOverlay: () => showDeathOverlay,
  showDivineToast: () => showDivineToast,
  showElementById: () => showElementById,
  showEraTip: () => showEraTip,
  showEraTransition: () => showEraTransition,
  showEventPanel: () => showEventPanel,
  showFragments: () => showFragments,
  showHelpModal: () => showHelpModal,
  showHowToPlayCarousel: () => showHowToPlayCarousel,
  showLimbo: () => showLimbo,
  showLoadingScreen: () => showLoadingScreen,
  showLongTermConsequenceToast: () => showLongTermConsequenceToast,
  showOutcomeToast: () => showOutcomeToast,
  showOverlay: () => showOverlay,
  showPauseOverlay: () => showPauseOverlay,
  showSettingsPanel: () => showSettingsPanel,
  showSoulBrowser: () => showSoulBrowser,
  showTitleScreen: () => showTitleScreen,
  showToast: () => showToast,
  showTutorialStep: () => showTutorialStep,
  showUpgradePanel: () => showUpgradePanel,
  showVictoryOverlay: () => showVictoryOverlay,
  skipNarration: () => skipNarration,
  toggleElementVisibility: () => toggleElementVisibility,
  toggleTips: () => toggleTips,
  triggerEventNarration: () => triggerEventNarration,
  typewriterEffect: () => typewriterEffect,
  updateEraDisplay: () => updateEraDisplay,
  updateEventHistory: () => updateEventHistory,
  updateFaithDisplay: () => updateFaithDisplay,
  updateHeaderUI: () => updateHeaderUI,
  updateProgressBar: () => updateProgressBar,
  updateResourceDisplay: () => updateResourceDisplay,
  updateSoulBrowserFragment: () => updateSoulBrowserFragment,
  updateTooltipPosition: () => updateTooltipPosition,
  updateUI: () => updateUI
});
function cancelCurrentNarration() {
  _currentEventId = null;
  if (_activeAudio) {
    _activeAudio.pause();
    _activeAudio = null;
  }
}
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
  }
}
function _getMiniMaxKey() {
  try {
    if (sessionStorage.getItem("mmx_api_key")) return sessionStorage.getItem("mmx_api_key");
    if (localStorage.getItem("mmx_api_key")) return localStorage.getItem("mmx_api_key");
  } catch {
  }
  return null;
}
async function _generateViaAPI(text, voice, eventId, apiKey) {
  const response = await fetch("https://api.minimax.chat/v1/t2a_v2", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "speech-02-hd",
      text,
      stream: false,
      voice_setting: {
        voice_id: voice
      },
      audio_setting: {
        sample_rate: 32e3,
        bitrate: 128e3,
        format: "mp3"
      }
    })
  });
  if (!response.ok) throw new Error(`TTS API ${response.status}`);
  if (_currentEventId !== eventId) return;
  const arrayBuffer = await response.arrayBuffer();
  if (_currentEventId !== eventId) return;
  const blob = new Blob([arrayBuffer], { type: "audio/mp3" });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  _activeAudio = audio;
  audio.onended = () => URL.revokeObjectURL(url);
  audio.onerror = () => URL.revokeObjectURL(url);
  audio.play().catch(() => {
  });
}
async function _generateViaCLI(text, voice, eventId) {
}
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
  } catch {
  }
}
function isRateLimited() {
  if (!_rateLimitTimer) return false;
  return Date.now() - _rateLimitTimer < RATE_LIMIT_MS;
}
function getEraImageStyle(era) {
  const styles = {
    ANCIENT: "painterly, worn textures, aged parchment feel, classical composition",
    MEDIEVAL: "gothic, illuminated manuscript style, stained glass tones, dark atmosphere",
    EARLY_MODERN: "baroque lighting, rich colors, dramatic shadows, renaissance influence",
    INDUSTRIAL: "gritty, desaturated, soot and smoke, harsh mechanical forms, high contrast",
    MODERN: "clean, diffused light, muted realism, photographic quality",
    NEAR_FUTURE: "dystopian, overcast sky, technological decay, muted cyberpunk",
    FAR_FUTURE: "neon holographic, glowing edges, cyberpunk neon, luminous particles, dark background with vibrant accents",
    PREHISTORIC: "primitive, cave painting influence, earthy ochres, raw natural forms"
  };
  return styles[era] || styles.ANCIENT;
}
function getEventImagePrompt(event, era) {
  const eraStyle = getEraImageStyle(era);
  const tags = event.cascadeTags || [];
  const desc = event.description || "";
  const tagLower = tags.map((t) => t.toLowerCase());
  const isGrief = tagLower.some((t) => ["grief", "sadness", "sorrow", "loss", "despair", "melancholy"].includes(t));
  const isLove = tagLower.some((t) => ["love", "tenderness", "connection", "affection", "devotion"].includes(t));
  const isDread = tagLower.some((t) => ["dread", "fear", "terror", "anxiety", "vertigo", "horror"].includes(t));
  const isWonder = tagLower.some((t) => ["wonder", "awe", "discovery", "curiosity"].includes(t));
  const isRage = tagLower.some((t) => ["rage", "anger", "fury", "betrayal"].includes(t));
  const isViolence = tagLower.some((t) => ["violence", "blood", "fire", "burning", "destruction"].includes(t));
  let mood, palette, subject;
  if (isGrief) {
    mood = "dark, empty, silhouette of figure against dim light";
    palette = "deep blues and grays, fading light, desaturated";
    subject = "solitary figure, fading into shadow";
  } else if (isLove) {
    mood = "warm, soft light, intimate atmosphere";
    palette = "warm amber and soft rose tones, gentle glow";
    subject = "two figures close together or connected forms";
  } else if (isDread) {
    mood = "oppressive, ominous atmosphere, sense of unseen threat";
    palette = "dark purples and blacks, hints of red, deep shadows";
    subject = "twisted forms emerging from darkness";
  } else if (isRage || isViolence) {
    mood = "chaotic, intense, distorted by heat and force";
    palette = "deep oranges, blacks, red accents, fire glow";
    subject = "destruction, breaking structures, fire in streets";
  } else if (isWonder) {
    mood = "expansive, luminous, vast and breathtaking";
    palette = "ethereal blues and golds, light emanating from center";
    subject = "vast space or extraordinary discovery";
  } else {
    mood = "atmospheric, contemplative mood";
    palette = "muted earth tones, atmospheric haze";
    subject = "scene reflecting the event narrative";
  }
  const crisisPart = event.crisis ? "crisis moment," : "";
  const landmarkPart = event.landmark ? "landmark moment," : "";
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
  const tagLower = (tags || []).map((t) => t.toLowerCase());
  if (tagLower.some((t) => ["grief", "sadness", "loss"].includes(t))) {
    return "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)";
  }
  if (tagLower.some((t) => ["love", "tenderness", "connection"].includes(t))) {
    return "linear-gradient(135deg, #2d1b3d 0%, #4a1942 50%, #6b2d5b 100%)";
  }
  if (tagLower.some((t) => ["dread", "fear", "terror", "horror"].includes(t))) {
    return "linear-gradient(135deg, #1a0a1a 0%, #2d0a2d 50%, #4a0a4a 100%)";
  }
  if (tagLower.some((t) => ["rage", "anger", "fury"].includes(t))) {
    return "linear-gradient(135deg, #2d1a0a 0%, #5c2a0a 50%, #8b3a0a 100%)";
  }
  if (tagLower.some((t) => ["wonder", "awe", "discovery"].includes(t))) {
    return "linear-gradient(135deg, #0a1a2d 0%, #0a2d4a 50%, #0a4a6b 100%)";
  }
  return "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #3d3d3d 100%)";
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
    const { execSync } = __require("child_process");
    execSync(`mmx image generate --prompt "${prompt}" --aspect-ratio "16:9" --output "${outputPath}"`, {
      cwd: process.cwd(),
      stdio: "pipe"
    });
    setSceneImagePath(event.id, outputPath);
    return outputPath;
  } catch (err) {
    console.warn("Scene generation failed:", err.message);
    return null;
  }
}
function buildAchievementModal(soulState) {
  const modal = document.createElement("div");
  modal.id = "achievement-modal";
  modal.className = "modal-overlay";
  const content = document.createElement("div");
  content.className = "modal-content achievement-modal-content";
  const total = Object.keys(ACHIEVEMENT_DEFS).length;
  const unlocked = soulState.achievementsUnlocked?.length || 0;
  const { byCategory } = getAchievementStats(soulState);
  const CATEGORY_LABELS = {
    lifespan: "Lifespan",
    fragment: "Fragment Collector",
    anchor: "Echo Anchors",
    era: "Temporal Wanderer",
    crisis: "Crisis Survival",
    chain: "Chain Weaving",
    speedrunner: "Speedrunner",
    peaceful: "Manner of Death",
    special: "Special"
  };
  const categories = Object.entries(ACHIEVEMENT_DEFS).reduce((acc, [id, def]) => {
    if (!acc[def.category]) acc[def.category] = [];
    acc[def.category].push({ id, ...def });
    return acc;
  }, {});
  let earnedMap = {};
  try {
    earnedMap = (soulState.achievementsUnlocked || []).reduce((m, id) => {
      m[id] = true;
      return m;
    }, {});
  } catch {
  }
  const tierColor = { bronze: "#cd7f32", silver: "#c0c0c0", gold: "#ffd700", platinum: "#e5e4e2" };
  let earnedIds = new Set(soulState.achievementsUnlocked || []);
  const earnedList = [...earnedIds].map((id) => {
    const def = ACHIEVEMENT_DEFS[id];
    if (!def) return null;
    const earnedEntry = (soulState.achievementNotifications || []).find((n) => n.id === id);
    return {
      id,
      name: def.name,
      icon: def.icon,
      tier: def.tier,
      category: def.category,
      earnedAt: earnedEntry?.timestamp ? new Date(earnedEntry.timestamp).toLocaleDateString() : null
    };
  }).filter(Boolean).sort((a, b) => (b.earnedAt || 0) - (a.earnedAt || 0));
  const recentEarned = earnedList.slice(0, 3);
  const allAchievementsHtml = Object.entries(categories).map(([cat, defs]) => `
    <div class="ach-category-group">
      <h4 class="ach-category-title">${CATEGORY_LABELS[cat] || cat}</h4>
      <div class="ach-category-list">
        ${defs.map((def) => {
    const isEarned = earnedMap[def.id];
    const earnedEntry = earnedList.find((e) => e.id === def.id);
    const hint = getAchievementHint(def.id, soulState);
    return `
            <div class="ach-item ${isEarned ? "earned" : "locked"}">
              <span class="ach-icon" style="${isEarned ? `color: ${tierColor[def.tier] || "#fff"}` : ""}">${isEarned ? def.icon : "?"}</span>
              <div class="ach-info">
                <span class="ach-name">${isEarned ? def.name : "???"}</span>
                <span class="ach-desc">${isEarned ? def.description : hint || "Locked"}</span>
                ${earnedEntry?.earnedAt ? `<span class="ach-earned-date">Earned: ${earnedEntry.earnedAt}</span>` : ""}
              </div>
            </div>
          `;
  }).join("")}
      </div>
    </div>
  `).join("");
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
          ${recentEarned.map((a) => `
            <div class="ach-recent-item">
              <span class="ach-icon" style="color: ${tierColor[a.tier] || "#fff"}">${a.icon}</span>
              <span class="ach-name">${a.name}</span>
            </div>
          `).join("")}
        </div>
      </div>
    ` : ""}
    <div class="ach-all-list">${allAchievementsHtml}</div>
  `;
  modal.appendChild(content);
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add("visible"));
  modal.querySelector("[data-close-ach]").addEventListener("click", () => {
    modal.classList.remove("visible");
    setTimeout(() => modal.remove(), 300);
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("visible");
      setTimeout(() => modal.remove(), 300);
    }
  });
}
function getAchievementHint(achievementId, soulState) {
  const hints = {
    centurian: () => {
      const age = soulState.currentAge || 0;
      if (age >= 70) return "Almost there!";
      if (age >= 50) return `${80 - age} years to go`;
      return null;
    },
    methuselah: () => {
      const age = soulState.currentAge || 0;
      if (age >= 90) return "So close to 100!";
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
      if (count >= 1) return "Collected!";
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
      if ((soulState.anchors?.length || 0) >= 1) return "Formed!";
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
    gentle_release: () => soulState.metaStats?.peacefulDeaths >= 1 ? "Died peacefully!" : null,
    violent_passage: () => soulState.metaStats?.violentDeaths >= 1 ? "Died violently!" : null
  };
  const hintFn = hints[achievementId];
  return hintFn ? hintFn() : null;
}
function applyEventFilters(modal, eraVal, chainVal, outcomeVal) {
  modal.querySelectorAll(".archive-event-item").forEach((item) => {
    const matchEra = !eraVal || item.dataset.era === eraVal;
    const tags = (item.dataset.tags || "").toLowerCase();
    const matchChain = !chainVal || tags.includes(chainVal.toLowerCase());
    const matchOutcome = !outcomeVal || item.dataset.outcome === outcomeVal;
    item.style.display = matchEra && matchChain && matchOutcome ? "" : "none";
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
    const era = life.era || "UNKNOWN";
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
    { id: "first_death", label: "First Death", icon: "\xE2\u02DC\xA0", condition: (m) => (m.totalDeaths || 0) >= 1 },
    { id: "violent_end", label: "Violent End", icon: "\xE2\u0161\u201D", condition: (m) => (m.violentDeaths || 0) >= 1 },
    { id: "peaceful_passage", label: "Peaceful Passage", icon: "\xE2\u0153\xA7", condition: (m) => (m.peacefulDeaths || 0) >= 1 },
    { id: "love_lost", label: "Love Lost", icon: "\xE2\u2122\xA5", condition: (m) => (m.lovesLost || 0) >= 1 },
    { id: "life_given", label: "Life Given", icon: "\xE2\u0153\xBF", condition: (m) => (m.childrenBorn || 0) >= 1 },
    { id: "first_anchor", label: "First Anchor", icon: "\xE2\u0161\u201C", condition: (s) => (s.anchors?.length || 0) >= 1 },
    { id: "collector", label: "Fragment Collector", icon: "\xE2\u2014\u2020", condition: (s) => (s.fragments?.length || 0) >= 10 },
    { id: "veteran", label: "Soul Veteran", icon: "\xCE\xA8", condition: (s) => (s.livesLived || 0) >= 5 },
    { id: "ancient_soul", label: "Ancient Soul", icon: "\xE2\u02C6\u017E", condition: (s) => (s.livesLived || 0) >= 20 },
    { id: "multi_era", label: "Time Traveler", icon: "\xE2\u02DC\u2020", condition: (s) => (s.unlockedEras?.length || 0) >= 4 },
    { id: "all_eras", label: "All Eras", icon: "\xE2\u02DC\u2026\xE2\u02DC\u2026\xE2\u02DC\u2026", condition: (s) => (s.unlockedEras?.length || 0) >= 7 },
    { id: "anchor_master", label: "Anchor Master", icon: "\xE2\u0161\u201C", condition: (s) => (s.anchors?.length || 0) >= 3 },
    { id: "fragment_hoarder", label: "Fragment Hoarder", icon: "\xE2\u2014\u2020", condition: (s) => (s.fragments?.length || 0) >= 50 }
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
    const map = { GRIEF: "#ff4466", LOVE: "#ff66aa", DREAD: "#9944ff", WONDER: "#44aaff", RAGE: "#ff6600", GRACE: "#aaaaaa" };
    return map[type] || "#666666";
  };
  const eraLabel = (era) => era?.replace("_", " ") || "Unknown";
  return `
    <div class="life-gallery-grid">
      ${lives.map((life, idx) => `
        <div class="life-card" data-life-id="${life.id || idx}">
          <div class="life-card-header">
            <span class="life-card-name">${life.name || "Unknown"}</span>
            <span class="life-card-num">#${idx + 1}</span>
          </div>
          <div class="life-card-meta">
            <span class="life-card-era">${eraLabel(life.era)}</span>
            <span class="life-card-age">${life.age || 0} yrs</span>
          </div>
          ${life.dominantChain ? `<div class="life-card-chain" style="border-left: 3px solid ${chainColor(life.dominantChain)}">${life.dominantChain}</div>` : ""}
        </div>
      `).join("")}
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
    <div class="archive-event-item" data-era="${ev._lifeEra || ""}" data-tags="${(ev.cascadeTags || []).join(",")}" data-outcome="${ev.isDeathEvent ? "died" : "survived"}">
      <div class="archive-event-title">${ev.title || "Unknown Event"}</div>
      <div class="archive-event-meta">
        <span class="archive-event-era">${(ev._lifeEra || "").replace("_", " ")}</span>
        <span class="archive-event-life">${ev._lifeName || "Unknown Life"}</span>
        <span class="archive-event-age">Age ${ev.age || "?"}</span>
      </div>
      ${ev.cascadeTags && ev.cascadeTags.length > 0 ? `<div class="archive-event-tags">${ev.cascadeTags.map((t) => `<span class="event-tag">${t}</span>`).join("")}</div>` : ""}
    </div>
  `).join("");
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
      ${typeOrder.map((type) => `<button class="fragment-type-tab" data-ftype="${type}">${type}</button>`).join("")}
    </div>
    <div class="fragment-grid" id="fragment-grid">
      ${fragments.map((frag, idx) => `
        <div class="fragment-card" data-type="${frag.type}">
          <div class="fragment-type-badge">${frag.type}</div>
          <div class="fragment-value">"${frag.value}"</div>
          <div class="fragment-strength">Strength: ${Math.round(frag.strength * 100)}%</div>
          <div class="fragment-origin">From: ${lifeMap[frag.origin?.lifeId] || frag.origin?.lifeId || "Unknown Life"}</div>
          ${frag.isAnchor ? '<div class="fragment-anchor-badge">\xE2\u02DC\u2026 ANCHOR</div>' : ""}
        </div>
      `).join("")}
    </div>
  `;
}
function renderChainExhibition(chainRecaps) {
  if (!chainRecaps || chainRecaps.length === 0) {
    return '<div class="museum-empty">No chain recaps recorded yet.</div>';
  }
  const chainColor = (type) => {
    const map = { GRIEF: "#ff4466", LOVE: "#ff66aa", DREAD: "#9944ff", WONDER: "#44aaff", RAGE: "#ff6600", GRACE: "#aaaaaa" };
    return map[type] || "#666666";
  };
  return `
    <div class="chain-exhibition">
      ${chainRecaps.map((recap, idx) => `
        <div class="chain-recap-card">
          <div class="chain-recap-header" style="color:${chainColor(recap.type)}">
            ${recap.type} CHAIN \xE2 \u201D ${recap.label || ""}
          </div>
          <div class="chain-recap-life">${recap.lifeName || "Unknown Life"} \xC2\xB7 ${(recap.era || "").replace("_", " ")}</div>
          <div class="chain-recap-events">
            ${(recap.events || []).map((e, i) => `
              <div class="chain-recap-event" style="border-left: 2px solid ${chainColor(recap.type)}">
                <span class="chain-recap-event-title">${e.title || "Event"}</span>
                <span class="chain-recap-event-age">Age ${e.age || "?"}</span>
              </div>
            `).join("")}
          </div>
        </div>
      `).join("")}
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
          ${earned.length > 0 ? earned.map((a) => `
            <div class="achievement-item earned">
              <span class="achievement-icon">${a.icon}</span>
              <span class="achievement-label">${a.label}</span>
            </div>
          `).join("") : '<div class="museum-empty">None earned yet.</div>'}
        </div>
      </div>
      <div class="achievement-section">
        <h4>Locked</h4>
        <div class="achievement-list">
          ${locked.map((a) => `
            <div class="achievement-item locked">
              <span class="achievement-icon silhouette">${a.icon}</span>
              <span class="achievement-label silhouette">${a.label}</span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}
function renderEraStatistics(eraStats) {
  const { eraCounts, eraAvg, total } = eraStats;
  const eraLabels = { ANCIENT: "Ancient", MEDIEVAL: "Medieval", EARLY_MODERN: "Early Modern", INDUSTRIAL: "Industrial", MODERN: "Modern", NEAR_FUTURE: "Near Future", FAR_FUTURE: "Far Future" };
  const eraColors = { ANCIENT: "#8b7355", MEDIEVAL: "#4a4a6a", EARLY_MODERN: "#6b4423", INDUSTRIAL: "#5a5a5a", MODERN: "#3a5f3a", NEAR_FUTURE: "#1a3a5c", FAR_FUTURE: "#2a1a4a" };
  return `
    <div class="era-stats-container">
      <div class="era-stats-summary">
        <span>Total Lives: ${total}</span>
      </div>
      <div class="era-pie-container">
        <div class="era-pie-chart" id="era-pie-chart">
          ${Object.entries(eraCounts).map(([era, count]) => `
            <div class="era-bar-row">
              <span class="era-bar-label" style="color:${eraColors[era] || "#666"}">${eraLabels[era] || era}</span>
              <div class="era-bar-track">
                <div class="era-bar-fill" style="width:${total > 0 ? count / total * 100 : 0}%; background:${eraColors[era] || "#666"}"></div>
              </div>
              <span class="era-bar-count">${count} (${total > 0 ? Math.round(count / total * 100) : 0}%)</span>
              <span class="era-avg-age">Avg: ${eraAvg[era] || 0} yrs</span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}
function renderCompleteSoulPanel(soulState, lives) {
  const isEnlightenment = soulState.enlightenmentAchieved;
  const journeyText = isEnlightenment ? "You achieved enlightenment \xE2 \u201D 100+ lives lived without grasping to any anchor. The self was a mask you wore through every era. Now the mask is off." : "You have woven all six fragment types across seven eras, survived 50 crises, and formed five anchors. The thread is complete. Every life was a stitch in a pattern you are only now beginning to see.";
  return `
    <div class="complete-soul-panel">
      <div class="complete-soul-header">
        <div class="complete-soul-icon">${isEnlightenment ? "\xE2\u02DC\xAF" : "\xE2\u2014\u02C6"}</div>
        <div class="complete-soul-title">${isEnlightenment ? "ENLIGHTENMENT" : "SOUL COMPLETE"}</div>
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
        <p>Continue your journey in <strong>free play</strong> \xE2 \u201D every new life is yours to explore, with achievements as your guide.</p>
      </div>
    </div>
  `;
}
function renderEraStatues(lives, chainTypes) {
  const eraLabels = { ANCIENT: "Ancient", MEDIEVAL: "Medieval", EARLY_MODERN: "Early Modern", INDUSTRIAL: "Industrial", MODERN: "Modern", NEAR_FUTURE: "Near Future", FAR_FUTURE: "Far Future" };
  const eraSculpture = {
    ANCIENT: { icon: "\xE2\u0161\xB0", theme: "Loss & The Gods", desc: "Fragments of devotion and sacrifice" },
    MEDIEVAL: { icon: "\xE2\u203A\xAA", theme: "Faith & Plague", desc: "The weight of belief and mortality" },
    EARLY_MODERN: { icon: "\xE2\u0161\u2122", theme: "Reason & Revolution", desc: "Old worlds unmaking themselves" },
    INDUSTRIAL: { icon: "\xE2\u0161\xA0", theme: "Machine & Struggle", desc: "The factory whistle and the trench" },
    MODERN: { icon: "\xE2\u02DC\xA2", theme: "Connection & Isolation", desc: "Screens between hearts" },
    NEAR_FUTURE: { icon: "\xE2\u02DC\x81", theme: "Algorithm & Climate", desc: "The data cloud and the rising sea" },
    FAR_FUTURE: { icon: "\xE2\u02C6\u017E", theme: "Upload & Meaning", desc: "Death is optional. Purpose is not." }
  };
  return `
    <div class="era-statues">
      ${Object.entries(eraSculpture).map(([era, statue]) => {
    const eraLives = (lives || []).filter((l) => l.era === era);
    const dominant = eraLives.length > 0 ? eraLives[0].dominantChain : null;
    const chainColor = dominant ? { GRIEF: "#ff4466", LOVE: "#ff66aa", DREAD: "#9944ff", WONDER: "#44aaff", RAGE: "#ff6600", GRACE: "#aaaaaa" }[dominant] || "#666" : "#333";
    return `
          <div class="era-statue ${eraLives.length > 0 ? "unlocked" : "locked"}">
            <div class="statue-icon">${statue.icon}</div>
            <div class="statue-info">
              <div class="statue-title">${eraLabels[era] || era}</div>
              <div class="statue-theme" style="color:${chainColor}">${dominant ? dominant + " THEME" : statue.theme}</div>
              <div class="statue-desc">${statue.desc}</div>
              <div class="statue-count">${eraLives.length} lives recorded</div>
            </div>
          </div>
        `;
  }).join("")}
    </div>
  `;
}
function openLifeDetailView(life, allLives = [], chainTypes) {
  const existing = document.getElementById("life-detail-museum");
  if (existing) existing.remove();
  const modal = document.createElement("div");
  modal.id = "life-detail-museum";
  modal.className = "modal-overlay";
  const content = document.createElement("div");
  content.className = "modal-content museum-life-detail";
  const events = life.events || [];
  const chainColor = (type) => {
    const map = { GRIEF: "#ff4466", LOVE: "#ff66aa", DREAD: "#9944ff", WONDER: "#44aaff", RAGE: "#ff6600", GRACE: "#aaaaaa" };
    return map[type] || "#666666";
  };
  content.innerHTML = `
    <h2>${life.name || "Unknown Soul"}</h2>
    <div class="life-detail-grid">
      <div class="detail-row"><span class="detail-label">Era:</span><span class="detail-value">${(life.era || "Unknown").replace("_", " ")}</span></div>
      <div class="detail-row"><span class="detail-label">Year:</span><span class="detail-value">${life.year || "?"}</span></div>
      <div class="detail-row"><span class="detail-label">Location:</span><span class="detail-value">${life.location?.city || "?"}, ${life.location?.country || ""}</span></div>
      <div class="detail-row"><span class="detail-label">Health:</span><span class="detail-value">${life.health || "unknown"}</span></div>
      <div class="detail-row"><span class="detail-label">Social Class:</span><span class="detail-value">${life.socialClass || "unknown"}</span></div>
      <div class="detail-row"><span class="detail-label">Gender:</span><span class="detail-value">${life.genderPresentation || "ambiguous"}</span></div>
      <div class="detail-row"><span class="detail-label">Age at Death:</span><span class="detail-value">${life.age || 0}</span></div>
      ${life.dominantChain ? `<div class="detail-row"><span class="detail-label">Chain Theme:</span><span class="detail-value" style="color:${chainColor(life.dominantChain)}">${life.dominantChain}</span></div>` : ""}
      ${life.deathCause ? `<div class="detail-row"><span class="detail-label">Death Cause:</span><span class="detail-value">${life.deathCause}</span></div>` : ""}
    </div>
    ${events.length > 0 ? `
      <div class="life-events-section">
        <h3>Life Events</h3>
        <div class="life-events-timeline">
          ${events.map((e, idx) => `
            <div class="life-event-item ${e.isDeathEvent ? "death-event" : ""}">
              <span class="event-age">Age ${e.age || "?"}</span>
              <span class="event-title">${e.title || "Unknown event"}</span>
              ${e.cascadeTags && e.cascadeTags.length > 0 ? `<div class="event-tags">${e.cascadeTags.map((t) => `<span class="event-tag">${t}</span>`).join("")}</div>` : ""}
            </div>
          `).join("")}
        </div>
      </div>
    ` : ""}
    ${life.fragments && life.fragments.length > 0 ? `
      <div class="life-fragments-section">
        <h3>Fragments Extracted</h3>
        <div class="life-fragments-grid">
          ${life.fragments.map((f) => `
            <div class="fragment-card small">
              <div class="fragment-type-badge">${f.type}</div>
              <div class="fragment-value">"${f.value}"</div>
              ${f.isAnchor ? '<div class="fragment-anchor-badge">\xE2\u02DC\u2026</div>' : ""}
            </div>
          `).join("")}
        </div>
      </div>
    ` : ""}
    ${life.chainRecap ? `
      <div class="life-chain-section">
        <h3>Chain Recap</h3>
        <div class="chain-recap-display" style="border-left: 3px solid ${chainColor(life.chainRecap.type)}">
          <div class="chain-recap-title">${life.chainRecap.type} CHAIN \xE2 \u201D ${life.chainRecap.label || ""}</div>
          ${(life.chainRecap.events || []).map((e) => `<div class="chain-event-line">${e.title || "Event"}</div>`).join("")}
        </div>
      </div>
    ` : ""}
    <button class="btn-close-modal" data-close-life-detail>Close</button>
  `;
  modal.appendChild(content);
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add("visible"));
  modal.querySelector("[data-close-life-detail]").addEventListener("click", () => {
    modal.classList.remove("visible");
    setTimeout(() => modal.remove(), 300);
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("visible");
      setTimeout(() => modal.remove(), 300);
    }
  });
}
var isNarrationEnabled, setNarrationEnabled, triggerEventNarration, skipNarration, init, SCENE_CACHE_KEY, SCENE_DIR, RATE_LIMIT_MS, ERA_VOICES, _sceneCache, _rateLimitTimer, _generationQueue, generateEventSceneForEvent, createEventCard, touchStartX, touchStartY, SWIPE_THRESHOLD, initTouchSupport, initToastModalDismiss, advanceCurrentEvent, goBackInHistory, showOverlay, hideOverlay, showDivineToast, showOutcomeToast, showLongTermConsequenceToast, renderGoalTracker, showSoulBrowser, renderSoulAnalysisGrid, renderAchievements, showAchievementModal, openLifeDetailModal, createLifeDetailModal, showLimbo, showFragments, drawCurve, updateUI, resizeCanvas, showDeathOverlay, showSettingsPanel, toggleTips, updateHeaderUI, renderSoulFingerprint, renderLifePhaseBar, updateResourceDisplay, updateFaithDisplay, createChoiceButton, renderRiskDial, renderSpeedSlider, ERA_THEMES, getEraTheme, renderLoop, drawJCurve, drawParticles, drawLifeDot, drawCrisisSpike, drawDeathEffect, drawLimboParticles, _tutorialStep, _tutorialDismissed, TUTORIAL_STEPS, showTutorialStep, nextTutorialStep, prevTutorialStep, closeTutorial, showContextualTip, hasSeenTutorial, showEraTip, showHowToPlayCarousel, showArrow, hideArrow, showEventPanel, hideEventPanel, updateEraDisplay, showUpgradePanel, updateSoulBrowserFragment, animateFragmentMerge, createFragmentTooltip, showTitleScreen, hideTitleScreen, showPauseOverlay, hidePauseOverlay, showVictoryOverlay, hideVictoryOverlay, showEraTransition, createMiniEventSummary, updateEventHistory, showLoadingScreen, hideLoadingScreen, showConfirmDialog, updateTooltipPosition, showElementById, hideElementById, toggleElementVisibility, addClassToElement, removeClassFromElement, setElementText, setElementHTML, appendToElement, clearElement, removeElement, animateElement, pulseElement, shakeElement, fadeInElement, fadeOutElement, showToast, updateProgressBar, renderHealthBar, createClickableEffect, bindKeyboardShortcut, showHelpModal, openMuseum, createMuseumModal, _activeTypewriter, _advancingEvent, typewriterEffect, animateFragmentExtraction, animateDeathRewind, animateFingerprintReveal, animateConsequenceCracks, animatePhaseTransition, animateAnchorGlow, animateAchievementUnlock, showAchievementNotifications, animateEraDissolve, drawLimboParticlesSwirl, drawSoulFingerprintDots, animateSoulFingerprintCanvas;
var init_ui = __esm({
  "js/ui.js"() {
    init_main();
    init_world();
    isNarrationEnabled = () => state.narrationEnabled;
    setNarrationEnabled = (enabled) => {
      if (state) state.narrationEnabled = enabled;
      if (!enabled) cancelCurrentNarration();
    };
    triggerEventNarration = (event) => {
      if (!event || !event.description || !state?.narrationEnabled) return;
      cancelCurrentNarration();
      _currentEventId = event.id;
      const trimmed = event.description.length > 300 ? event.description.substring(0, 297) + "..." : event.description;
      _playTTSText(trimmed, event.era || state?.era, event.id);
    };
    skipNarration = () => {
      if (_activeAudio) {
        _activeAudio.pause();
        _activeAudio = null;
      }
      _currentEventId = null;
    };
    init = () => {
      getSceneCache();
      initTouchSupport();
      initToastModalDismiss();
    };
    SCENE_CACHE_KEY = "soulcycle_scene_cache";
    SCENE_DIR = "assets/scenes/";
    RATE_LIMIT_MS = 3e4;
    ERA_VOICES = {
      ANCIENT: "English_Deep-VoicedGentleman",
      MEDIEVAL: "English_ManWithDeepVoice",
      EARLY_MODERN: "English_CaptivatingStoryteller",
      INDUSTRIAL: "English_Trustworth_Man",
      MODERN: "English_Upbeat_Woman",
      NEAR_FUTURE: "English_ConfidentWoman",
      FAR_FUTURE: "Robot_Armor"
    };
    _sceneCache = null;
    _rateLimitTimer = null;
    _generationQueue = [];
    generateEventSceneForEvent = (event, era) => {
      return new Promise((resolve) => {
        triggerSceneGeneration(event, era || "ANCIENT", (path) => {
          resolve(path);
        });
      });
    };
    createEventCard = (event) => {
      const card = document.createElement("div");
      card.className = `event-card event-${event.category || "default"}`;
      card.dataset.eventId = event.id;
      const scenePath = getSceneImagePath(event.id);
      const fallbackGradient = getFallbackGradient(event.cascadeTags);
      let sceneHtml = "";
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
        const era = event.era || "ANCIENT";
        generateEventSceneForEvent(event, era).then((path) => {
          const container = document.querySelector(`.event-scene-loading[data-event-id="${event.id}"]`);
          if (!container) return;
          if (path) {
            container.innerHTML = `
          <img src="${path}" alt="Event scene" class="event-scene-image" loading="lazy" />
          <div class="event-scene-overlay"></div>
        `;
            container.classList.remove("event-scene-loading");
          } else {
            const placeholder = container.querySelector(".event-scene-placeholder");
            if (placeholder) {
              placeholder.classList.add("event-scene-fallback");
              container.querySelector(".event-scene-generating")?.remove();
            }
            container.classList.remove("event-scene-loading");
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
      <span class="event-era">${event.era || "Unknown Era"}</span>
      <span class="event-phase">${event.phase || ""}</span>
    </div>
    <h3 class="event-title">${event.title || "An Event"}</h3>
    <p class="event-description">${event.description || ""}</p>
    <div class="event-tags">
      ${(event.cascadeTags || []).map((tag) => `<span class="event-tag tag-${tag}">${tag}</span>`).join("")}
    </div>
  `;
      const sceneContainer = card.querySelector(".event-scene-container");
      if (sceneContainer) {
        const img = sceneContainer.querySelector(".event-scene-image");
        if (img) {
          sceneContainer.addEventListener("click", () => {
            sceneContainer.classList.toggle("expanded");
          });
          sceneContainer.addEventListener("mouseenter", () => {
            if (!sceneContainer.classList.contains("expanded")) {
              img.style.transform = "scale(1.05)";
            }
          });
          sceneContainer.addEventListener("mouseleave", () => {
            img.style.transform = "scale(1)";
          });
        }
      }
      return card;
    };
    touchStartX = 0;
    touchStartY = 0;
    SWIPE_THRESHOLD = 50;
    initTouchSupport = () => {
      const lifeViewport = document.getElementById("life-viewport");
      if (lifeViewport) {
        lifeViewport.addEventListener("touchstart", (e) => {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }, { passive: true });
        lifeViewport.addEventListener("touchend", (e) => {
          const dx = e.changedTouches[0].clientX - touchStartX;
          const dy = e.changedTouches[0].clientY - touchStartY;
          if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) {
            const target = e.target;
            if (!target.closest("button") && !target.closest(".whisper-panel")) {
              advanceCurrentEvent();
            }
          }
          if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD * 1.5) {
            if (dx < 0) advanceCurrentEvent();
            else goBackInHistory();
          }
        }, { passive: true });
      }
      const canvas = document.getElementById("curve-canvas");
      if (canvas) {
        canvas.addEventListener("touchend", (e) => {
          const currentRisk = window.currentRiskLevel || 0;
          if (currentRisk >= 0.97) {
            window.currentRiskLevel = -0.97;
            renderRiskDial("curve-canvas", 0);
          }
        });
        let isDragging = false;
        canvas.addEventListener("touchstart", (e) => {
          isDragging = true;
          e.preventDefault();
        }, { passive: false });
        canvas.addEventListener("touchend", () => {
          isDragging = false;
        });
        canvas.addEventListener("touchmove", (e) => {
          if (isDragging) {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            window.currentRiskLevel = Math.max(-1, Math.min(1, x / rect.width * 2 - 1));
            renderRiskDial("curve-canvas", (window.currentRiskLevel + 1) / 2);
          }
        }, { passive: false });
      }
      document.querySelectorAll(".choice-button").forEach((btn) => {
        btn.addEventListener("touchstart", () => btn.classList.add("touch-active"), { passive: true });
        btn.addEventListener("touchend", () => btn.classList.remove("touch-active"), { passive: true });
        btn.addEventListener("touchcancel", () => btn.classList.remove("touch-active"), { passive: true });
      });
      const speedSlider = document.querySelector(".speed-slider");
      if (speedSlider) {
        let isDraggingSlider = false;
        speedSlider.addEventListener("touchstart", (e) => {
          isDraggingSlider = true;
        }, { passive: true });
        speedSlider.addEventListener("touchend", () => {
          isDraggingSlider = false;
        });
        speedSlider.addEventListener("touchmove", (e) => {
          if (isDraggingSlider) {
            const touch = e.touches[0];
            const rect = speedSlider.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
            const value = 0.5 + ratio * 2.5;
            speedSlider.value = value;
            speedSlider.dispatchEvent(new Event("input"));
          }
        }, { passive: true });
      }
      const soulBrowserContent = document.getElementById("soul-browser-content");
      if (soulBrowserContent) {
        let bx = 0, by = 0;
        soulBrowserContent.addEventListener("touchstart", (e) => {
          bx = e.touches[0].clientX;
          by = e.touches[0].clientY;
        }, { passive: true });
        soulBrowserContent.addEventListener("touchend", (e) => {
          const dx = e.changedTouches[0].clientX - bx;
          const dy = e.changedTouches[0].clientY - by;
          if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
            const scrollEl = soulBrowserContent.querySelector(".soul-analysis-grid");
            if (scrollEl) {
              if (dx < 0) scrollEl.scrollLeft += 200;
              else scrollEl.scrollLeft -= 200;
            }
          }
        }, { passive: true });
      }
    };
    initToastModalDismiss = () => {
      document.addEventListener("touchend", (e) => {
        const toast = e.target.closest(".toast");
        if (toast) {
          toast.classList.remove("visible");
          setTimeout(() => toast.remove(), 300);
        }
        const overlay = e.target.closest(".modal-overlay");
        if (overlay && e.target === overlay) {
          overlay.classList.remove("visible");
          const modal = overlay.querySelector(".modal-content");
          if (modal) {
            setTimeout(() => overlay.remove(), 300);
          } else {
            setTimeout(() => overlay.remove(), 300);
          }
        }
      }, { passive: true });
    };
    advanceCurrentEvent = () => {
      if (_activeTypewriter) {
        _activeTypewriter.skipped = true;
        if (_activeTypewriter.cleanup) _activeTypewriter.cleanup();
        return;
      }
      if (_advancingEvent) return;
      _advancingEvent = true;
      document.dispatchEvent(new KeyboardEvent("keydown", { key: " ", code: "Space", bubbles: true }));
      setTimeout(() => {
        _advancingEvent = false;
      }, 0);
    };
    goBackInHistory = () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace", bubbles: true }));
    };
    showOverlay = (id) => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove("hidden");
        el.classList.add("visible");
      }
    };
    hideOverlay = (id) => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove("visible");
        el.classList.add("hidden");
      }
    };
    showDivineToast = (message, duration = 3e3) => {
      const existing = document.getElementById("divine-toast");
      if (existing) existing.remove();
      const toast = document.createElement("div");
      toast.id = "divine-toast";
      toast.className = "toast toast-divine";
      toast.textContent = message;
      document.body.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add("visible"));
      setTimeout(() => {
        toast.classList.remove("visible");
        setTimeout(() => toast.remove(), 300);
      }, duration);
    };
    showOutcomeToast = (outcome, duration = 4e3) => {
      const existing = document.getElementById("outcome-toast");
      if (existing) existing.remove();
      const toast = document.createElement("div");
      toast.id = "outcome-toast";
      toast.className = `toast toast-outcome outcome-${outcome.type || "neutral"}`;
      toast.innerHTML = `<span class="outcome-label">${outcome.label || "Outcome"}</span><span class="outcome-value">${outcome.value || ""}</span>`;
      document.body.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add("visible"));
      setTimeout(() => {
        toast.classList.remove("visible");
        setTimeout(() => toast.remove(), 300);
      }, duration);
    };
    showLongTermConsequenceToast = (text, duration = 5e3) => {
      const existing = document.getElementById("consequence-toast");
      if (existing) existing.remove();
      const toast = document.createElement("div");
      toast.id = "consequence-toast";
      toast.className = "toast toast-consequence";
      toast.innerHTML = `<span class="consequence-icon">&#9733;</span><span class="consequence-text">${text}</span>`;
      document.body.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add("visible"));
      setTimeout(() => {
        toast.classList.remove("visible");
        setTimeout(() => toast.remove(), 300);
      }, duration);
    };
    renderGoalTracker = (soul) => {
      if (!soul) return null;
      const status = getSoulCompletionStatus(soul);
      if (status.complete && !soul.soulComplete) return null;
      const section = document.createElement("div");
      section.className = "goal-tracker";
      const req = { minFragmentTypes: 6, crisesNeeded: 50, erasNeeded: 7, anchorsNeeded: 5 };
      const fragmentLabel = `${status.fragmentTypes}/${req.minFragmentTypes}`;
      const crisesLabel = `${status.crises}/${req.crisesNeeded}`;
      const erasLabel = `${status.eras}/${req.erasNeeded}`;
      const anchorsLabel = `${status.anchors}/${req.anchorsNeeded}`;
      const fragmentDone = status.fragmentTypes >= req.minFragmentTypes;
      const crisesDone = status.crises >= req.crisesNeeded;
      const erasDone = status.eras >= req.erasNeeded;
      const anchorsDone = status.anchors >= req.anchorsNeeded;
      const missingEmotionalTypes = Object.entries(status.fragmentTypeDetails || {}).filter(([_, hasIt]) => !hasIt).map(([type]) => type);
      const missingEmotionalHint = missingEmotionalTypes.length > 0 ? ` \xE2 \u201D Need: ${missingEmotionalTypes.slice(0, 3).join(", ")}${missingEmotionalTypes.length > 3 ? "\xE2 \xA6" : ""}` : "";
      const crisesMissing = req.crisesNeeded - status.crises;
      const crisesMissingHint = crisesMissing > 0 ? ` \xE2 \u201D ${crisesMissing} more crises` : "";
      const erasMissing = req.erasNeeded - status.eras;
      const erasMissingHint = erasMissing > 0 ? ` \xE2 \u201D ${erasMissing} more eras` : "";
      const anchorsMissing = req.anchorsNeeded - status.anchors;
      const anchorsMissingHint = anchorsMissing > 0 ? ` \xE2 \u201D ${anchorsMissing} more anchors` : "";
      section.innerHTML = `
    <div class="goal-tracker-header">Journey Progress</div>
    <div class="goal-tracker-items">
      <div class="goal-item${fragmentDone ? " done" : ""}" title="Collect at least 1 of each: grief, love, dread, wonder, rage, grace">
        <span class="goal-label">Fragments</span>
        <span class="goal-value">${fragmentLabel}${!fragmentDone ? missingEmotionalHint : ""}</span>
        <span class="goal-check">${fragmentDone ? "\xE2\u2014\u2030" : "\xE2\u2014\u2039"}</span>
      </div>
      <div class="goal-item${crisesDone ? " done" : ""}" title="Survive 50 crises">
        <span class="goal-label">Crises</span>
        <span class="goal-value">${crisesLabel}${!crisesDone ? crisesMissingHint : ""}</span>
        <span class="goal-check">${crisesDone ? "\xE2\u2014\u2030" : "\xE2\u2014\u2039"}</span>
      </div>
      <div class="goal-item${erasDone ? " done" : ""}" title="Live in all 7 eras">
        <span class="goal-label">Eras</span>
        <span class="goal-value">${erasLabel}${!erasDone ? erasMissingHint : ""}</span>
        <span class="goal-check">${erasDone ? "\xE2\u2014\u2030" : "\xE2\u2014\u2039"}</span>
      </div>
      <div class="goal-item${anchorsDone ? " done" : ""}" title="Form 5 anchors">
        <span class="goal-label">Anchors</span>
        <span class="goal-value">${anchorsLabel}${!anchorsDone ? anchorsMissingHint : ""}</span>
        <span class="goal-check">${anchorsDone ? "\xE2\u2014\u2030" : "\xE2\u2014\u2039"}</span>
      </div>
    </div>
  `;
      return section;
    };
    showSoulBrowser = () => {
      const container = document.getElementById("soul-browser-content");
      if (!container) return;
      container.innerHTML = "";
      const aboutData = generateSoulAboutPanel(state);
      const soul = state.soul ? state.soul : { livesLived: 0, fragments: [], anchors: [], unlockedEras: ["ANCIENT", "MEDIEVAL"], metaStats: { totalDeaths: 0, violentDeaths: 0, peacefulDeaths: 0, lovesLost: 0, childrenBorn: 0 } };
      const header = document.createElement("div");
      header.className = "soul-browser-header";
      const lives = state.soul && state.soul.livesLived !== void 0 ? state.soul.livesLived : 0;
      const fragCount = state.soul && state.soul.fragments ? state.soul.fragments.length : 0;
      const anchorCount = state.soul && state.soul.anchors ? state.soul.anchors.length : 0;
      const isComplete = state.soul && state.soul.soulComplete;
      header.innerHTML = `
    <h2>Soul Analysis${isComplete ? ' <span class="soul-complete-badge">COMPLETE</span>' : ""}</h2>
    <div class="soul-stats">
      <span>Lives: ${lives}</span>
      <span>Fragments: ${fragCount}</span>
      <span>Anchors: ${anchorCount}</span>
    </div>
  `;
      container.appendChild(header);
      if (aboutData) {
        const aboutPanel = document.createElement("div");
        aboutPanel.className = "soul-about-panel";
        aboutPanel.innerHTML = `
      <div class="soul-signature">${aboutData.signature || ""}</div>
      <div class="soul-meta">
        <span class="meta-emotion">${aboutData.dominantEmotion || "unknown"}</span>
        <span class="meta-complexity">Complexity: ${aboutData.complexity || 0}</span>
        <span class="meta-pattern">${aboutData.patternNote || ""}</span>
      </div>
      <div class="soul-era-affinity">
        <span class="era-label">Era Affinity:</span>
        <span class="era-value">${aboutData.eraAffinity || "None"}</span>
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
      showOverlay("overlay-soul-browser");
    };
    renderSoulAnalysisGrid = (st) => {
      const grid = document.createElement("div");
      grid.className = "soul-analysis-grid";
      const fragmentTypes = ["tone", "fear", "love", "warning", "location", "name", "object", "word"];
      for (const type of fragmentTypes) {
        const fragments = (st.fragments || []).filter((f) => f.type === type);
        if (fragments.length === 0) continue;
        const cell = document.createElement("div");
        cell.className = `analysis-cell fragment-type-${type}`;
        cell.innerHTML = `<h4>${type}</h4><ul>${fragments.slice(0, 5).map(
          (f) => `<li class="fragment-item ${f.isAnchor ? "anchor" : ""}">${f.value}</li>`
        ).join("")}</ul>`;
        grid.appendChild(cell);
      }
      return grid;
    };
    renderAchievements = (st) => {
      const section = document.createElement("div");
      section.className = "achievements-section";
      const meta = st.metaStats || {};
      const achievements = [];
      if ((meta.totalDeaths || 0) >= 1) achievements.push({ id: "first_death", label: "First Death", icon: "\xE2\u02DC\xA0" });
      if ((meta.violentDeaths || 0) >= 1) achievements.push({ id: "violent_end", label: "Violent End", icon: "\xE2\u0161\u201D" });
      if ((meta.peacefulDeaths || 0) >= 1) achievements.push({ id: "peaceful_passage", label: "Peaceful Passage", icon: "\xE2\u0153\xA7" });
      if ((meta.lovesLost || 0) >= 1) achievements.push({ id: "love_lost", label: "Love Lost", icon: "\xE2\u2122\xA5" });
      if ((meta.childrenBorn || 0) >= 1) achievements.push({ id: "life_given", label: "Life Given", icon: "\xE2\u0153\xBF" });
      if ((st.anchors?.length || 0) >= 1) achievements.push({ id: "first_anchor", label: "First Anchor", icon: "\xE2\u0161\u201C" });
      if ((st.fragments?.length || 0) >= 10) achievements.push({ id: "collector", label: "Fragment Collector", icon: "\xE2\u2014\u2020" });
      section.innerHTML = `<h3>Achievements</h3><div class="achievements-grid">${achievements.map(
        (a) => `<div class="achievement-badge" title="${a.label}">${a.icon}<span>${a.label}</span></div>`
      ).join("")}</div>`;
      return section;
    };
    showAchievementModal = (soulState) => {
      const existing = document.getElementById("achievement-modal");
      if (existing) existing.remove();
      buildAchievementModal(soulState);
    };
    ;
    openLifeDetailModal = (life) => {
      const existing = document.getElementById("life-detail-modal");
      if (existing) existing.remove();
      createLifeDetailModal(life);
    };
    createLifeDetailModal = (life) => {
      const modal = document.createElement("div");
      modal.id = "life-detail-modal";
      modal.className = "modal-overlay";
      const content = document.createElement("div");
      content.className = "modal-content life-detail-content";
      content.innerHTML = `
    <h2>${life.name || "Unknown Soul"}</h2>
    <div class="life-detail-grid">
      <div class="detail-row"><span class="detail-label">Era:</span><span class="detail-value">${life.era || "Unknown"}</span></div>
      <div class="detail-row"><span class="detail-label">Year:</span><span class="detail-value">${life.year || "?"}</span></div>
      <div class="detail-row"><span class="detail-label">Location:</span><span class="detail-value">${life.location?.city || "?"}, ${life.location?.country || ""}</span></div>
      <div class="detail-row"><span class="detail-label">Health:</span><span class="detail-value">${life.health || "unknown"}</span></div>
      <div class="detail-row"><span class="detail-label">Social Class:</span><span class="detail-value">${life.socialClass || "unknown"}</span></div>
      <div class="detail-row"><span class="detail-label">Gender:</span><span class="detail-value">${life.genderPresentation || "ambiguous"}</span></div>
      ${life.anchor ? `<div class="detail-row anchor-row"><span class="detail-label">Anchor:</span><span class="detail-value anchor-value">${life.anchor.value}</span></div>` : ""}
    </div>
    ${life.events?.length ? `<div class="life-events-list"><h3>Life Events</h3>${life.events.map((e) => `<div class="life-event-item"><span class="event-age">Age ${e.age || "?"}</span><span class="event-title">${e.title || "Unknown event"}</span></div>`).join("")}</div>` : ""}
    <button class="btn-close-modal" data-close-modal>Close</button>
  `;
      modal.appendChild(content);
      document.body.appendChild(modal);
      requestAnimationFrame(() => modal.classList.add("visible"));
      const closeBtn = modal.querySelector("[data-close-modal]");
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("visible");
        setTimeout(() => modal.remove(), 300);
      });
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("visible");
          setTimeout(() => modal.remove(), 300);
        }
      });
    };
    showLimbo = (limboState) => {
      const container = document.getElementById("limbo-content");
      if (!container) return;
      container.innerHTML = "";
      let canvas = document.getElementById("limbo-canvas");
      if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.id = "limbo-canvas";
        canvas.width = 400;
        canvas.height = 300;
        canvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;";
        container.appendChild(canvas);
      }
      const limboDiv = document.createElement("div");
      limboDiv.className = "limbo-container";
      const fragCount = limboState.fragments?.length || 0;
      const anchorCount = limboState.anchors?.length || 0;
      const totalWeight = fragCount + anchorCount * 2;
      const weightLabel = totalWeight <= 3 ? "light" : totalWeight <= 8 ? "heavier" : "heavy";
      const chainTypes = ["GRIEF", "LOVE", "DREAD", "WONDER", "RAGE", "GRACE"];
      const dominantChain = limboState.dominantChain || (limboState.fragments?.length > 0 ? chainTypes.find((c) => limboState.fragments.some((f) => f.cascadeTags?.includes(c))) || null : null);
      const chainLabels = { GRIEF: "grief", LOVE: "love", DREAD: "dread", WONDER: "wonder", RAGE: "rage", GRACE: "grace" };
      let reflectionHTML = "";
      if (fragCount > 0 || anchorCount > 0) {
        const dominantLabel = dominantChain ? chainLabels[dominantChain] : "something unnamed";
        reflectionHTML = `
      <div class="limbo-reflection">
        <p class="reflection-fragments">Your soul carries ${fragCount} fragment${fragCount !== 1 ? "s" : ""} and ${anchorCount} anchor${anchorCount !== 1 ? "s" : ""}. The weight of them is ${weightLabel}.</p>
        ${dominantChain ? `<p class="reflection-dominant">The dominant thread of your existence: <em>${dominantLabel}</em>.</p>` : ""}
      </div>
    `;
      }
      const previousEra = limboState.previousEra || limboState.era || null;
      const nextEra = limboState.nextEra || (limboState.unlockedEras?.length > 1 ? limboState.unlockedEras.find((e) => e !== previousEra) || "INDUSTRIAL" : "INDUSTRIAL");
      let eraReflectionHTML = "";
      if (previousEra && previousEra !== nextEra) {
        const prevLabel = previousEra.replace("_", " ");
        const nextLabel = nextEra.replace("_", " ");
        eraReflectionHTML = `<p class="limbo-era-reflection">You leave <strong>${prevLabel}</strong> behind. <strong>${nextLabel}</strong> waits, if you're ready.</p>`;
      } else if (nextEra) {
        const nextLabel = nextEra.replace("_", " ");
        eraReflectionHTML = `<p class="limbo-era-reflection"><strong>${nextLabel}</strong> waits, when you are ready.</p>`;
      }
      const orientationChoices = [
        { id: "light", text: "Carry your anchors lightly", hint: "Release your grip on what you have gathered." },
        { id: "gather", text: "Embrace what you have gathered", hint: "Let every fragment and anchor define you." }
      ];
      const chosenOrientation = orientationChoices[Math.floor(Math.random() * orientationChoices.length)];
      const showMemoryPreview = limboState.previousLife && limboState.previousLife.events?.length > 0 && Math.random() < 0.3;
      let memoryPreviewHTML = "";
      if (showMemoryPreview) {
        const definingEvent = limboState.previousLife.events[limboState.previousLife.events.length - 1];
        const eventText = definingEvent?.title || definingEvent?.description || "A defining moment";
        memoryPreviewHTML = `<div class="limbo-memory-preview"><em>"${eventText}"</em></div>`;
      }
      const limboStartTime = Date.now();
      const formatWaitingTime = (era) => {
        if (era === "FAR_FUTURE") return "Moments feel like centuries here.";
        if (era === "NEAR_FUTURE") return "Time is strange in these years.";
        if (era === "INDUSTRIAL") return "The clock on the wall ticks slow.";
        if (era === "MODERN") return "Time slips by unnoticed.";
        if (era === "EARLY_MODERN") return "An hour feels like a day.";
        if (era === "MEDIEVAL") return "The bells have not rung in what feels like ages.";
        if (era === "ANCIENT") return "A breath. A pause. Then silence.";
        return "Time moves differently here.";
      };
      limboDiv.innerHTML = `
    <h2>The In-Between</h2>
    <p class="limbo-description">${limboState.message || "You exist between lives."}</p>
    <div class="limbo-soul-state">
      <div class="limbo-fragments">
        <h3>Fragments Collected</h3>
        <ul>${(limboState.fragments || []).map((f) => `<li class="fragment-${f.type}">${f.value}</li>`).join("") || "<li>None yet</li>"}</ul>
      </div>
      ${(limboState.anchors || []).length > 0 ? `<div class="limbo-anchors"><h3>Anchors</h3><ul>${limboState.anchors.map((a) => `<li class="anchor-item">${a.value}</li>`).join("")}</ul></div>` : ""}
    </div>
    ${reflectionHTML}
    ${eraReflectionHTML}
    ${memoryPreviewHTML}
    <p class="limbo-time-hint">${formatWaitingTime(limboState.era || "ANCIENT")}</p>
    <div class="limbo-orientation">
      <p class="orientation-label">Before you pass through again:</p>
      <button class="btn-orientation" data-orientation="${chosenOrientation.id}">${chosenOrientation.text}</button>
      <span class="orientation-hint">${chosenOrientation.hint}</span>
    </div>
    <button class="btn-reincarnate" data-action="reincarnate">Reincarnate</button>
  `;
      container.appendChild(limboDiv);
      showOverlay("overlay-limbo");
      const ctx = canvas.getContext("2d");
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
      const stopAnim = () => {
        animating = false;
      };
      container._limboStopAnim = stopAnim;
    };
    showFragments = (newFragments) => {
      if (!newFragments || newFragments.length === 0) return;
      const container = document.getElementById("fragment-display");
      if (!container) return;
      newFragments.forEach((frag, i) => {
        const el = document.createElement("div");
        el.className = "fragment-pop";
        el.textContent = `+${frag.value}`;
        el.style.left = `${20 + i * 30}px`;
        container.appendChild(el);
        setTimeout(() => el.remove(), 2e3);
      });
    };
    drawCurve = (mode = 1) => {
      const canvas = document.getElementById("curve-canvas");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (mode === 0) return;
      const w = canvas.width, h = canvas.height;
      ctx.strokeStyle = "#44aaff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.bezierCurveTo(w * 0.25, h * 0.7, w * 0.75, h * 0.3, w, 0);
      ctx.stroke();
    };
    updateUI = () => {
      const connectionEl = document.getElementById("connection-display");
      const vitalityEl = document.getElementById("vitality-display");
      const momentumEl = document.getElementById("momentum-display");
      const ageEl = document.getElementById("age-display");
      const eraEl = document.getElementById("era-display");
      if (connectionEl) connectionEl.textContent = state.connection;
      if (vitalityEl) vitalityEl.textContent = state.vitality;
      if (momentumEl) momentumEl.textContent = state.momentum;
      if (ageEl) ageEl.textContent = state.currentAge;
      if (eraEl) eraEl.textContent = state.currentLife?.era || "ANCIENT";
    };
    resizeCanvas = () => {
      const canvas = document.getElementById("curve-canvas");
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    showDeathOverlay = (deathData, newAchievements = []) => {
      const container = document.getElementById("death-overlay-content");
      if (!container) return;
      container.innerHTML = "";
      const tierColor = { bronze: "#cd7f32", silver: "#c0c0c0", gold: "#ffd700", platinum: "#e5e4e2" };
      const achievementsHtml = newAchievements.length > 0 ? `
    <div class="death-achievements">
      <h4>Achievements Unlocked!</h4>
      <div class="death-achievement-list">
        ${newAchievements.map((a) => `
          <div class="death-achievement-item">
            <span class="death-ach-icon" style="color: ${tierColor[a.tier] || "#fff"}">${a.icon || "\xE2\u02DC\u2026"}</span>
            <span class="death-ach-name">${a.name || a.label || "Achievement"}</span>
          </div>
        `).join("")}
      </div>
    </div>
  ` : "";
      const deathDiv = document.createElement("div");
      deathDiv.className = "death-overlay-container";
      deathDiv.innerHTML = `
    <h2>${deathData.title || "Life Ended"}</h2>
    <p class="death-description">${deathData.description || "A soul has departed."}</p>
    <div class="death-stats">
      <span>Age: ${deathData.age || "?"}</span>
      <span>Era: ${deathData.era || "Unknown"}</span>
    </div>
    ${deathData.fragmentGained ? `<div class="fragment-gained">Fragment gained: "${deathData.fragmentGained}"</div>` : ""}
    ${achievementsHtml}
    <button class="btn-continue" data-action="continue">Continue</button>
  `;
      container.appendChild(deathDiv);
      showOverlay("overlay-gameover");
    };
    showSettingsPanel = () => {
      const container = document.getElementById("settings-content");
      if (!container) return;
      container.innerHTML = "";
      const panel = document.createElement("div");
      panel.className = "settings-panel";
      panel.innerHTML = `
    <h2>Settings</h2>
    <div class="settings-group">
      <label class="setting-item">
        <input type="checkbox" id="setting-tips-enabled" checked />
        <span>Show Tips</span>
      </label>
      <label class="setting-item">
        <input type="checkbox" id="setting-sound-enabled" checked />
        <span>Sound <span class="setting-desc">\xE2 \u201D UI clicks & alerts</span></span>
      </label>
      <label class="setting-item">
        <input type="checkbox" id="setting-music-enabled" checked />
        <span>Music <span class="setting-desc">\xE2 \u201D era ambience tracks</span></span>
      </label>
      <label class="setting-item">
        <input type="checkbox" id="setting-narration-enabled" checked />
        <span>Narration <span class="setting-desc">\xE2 \u201D AI voice reading events</span></span>
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
      const narrationCb = panel.querySelector("#setting-narration-enabled");
      if (narrationCb && state) narrationCb.checked = state.narrationEnabled !== false;
      narrationCb?.addEventListener("change", (e) => setNarrationEnabled(e.target.checked));
      const soundCb = panel.querySelector("#setting-sound-enabled");
      soundCb?.addEventListener("change", (e) => {
        if (state?.audio) state.audio.muted = !e.target.checked;
      });
      showOverlay("overlay-settings");
    };
    toggleTips = (enabled) => {
      const tips = document.querySelectorAll(".tip-container, .tutorial-tip");
      tips.forEach((tip) => {
        if (enabled) {
          tip.classList.remove("hidden");
        } else {
          tip.classList.add("hidden");
        }
      });
      const tipsEnabled = enabled;
      try {
        if (state.settings) {
          state.settings.tipsEnabled = tipsEnabled;
        }
      } catch (e) {
      }
    };
    updateHeaderUI = () => {
      updateResourceDisplay(state);
      updateFaithDisplay(state);
      renderLifePhaseBar(state);
    };
    renderSoulFingerprint = (soulState) => {
      if (!soulState || !(soulState.fragments || []).length) return null;
      const fingerprint = document.createElement("div");
      fingerprint.className = "fingerprint-display";
      fingerprint.style.margin = "16px 0";
      fingerprint.style.padding = "12px";
      fingerprint.style.background = "rgba(255,255,255,0.03)";
      fingerprint.style.borderRadius = "8px";
      const fragmentTypes = ["tone", "fear", "love", "warning"];
      const colors = { tone: "#d4af37", fear: "#c0392b", love: "#e91e63", warning: "#e67e22" };
      const dotsContainer = document.createElement("div");
      dotsContainer.className = "fingerprint-dots";
      for (const type of fragmentTypes) {
        const fragments = (soulState.fragments || []).filter((f) => f.type === type);
        const count = fragments.length;
        const maxCount = 12;
        const displayCount = Math.min(count, maxCount);
        const typeRow = document.createElement("div");
        typeRow.className = `fingerprint-type-row type-${type}`;
        const label = document.createElement("span");
        label.className = "fingerprint-type-label";
        label.style.color = colors[type];
        label.textContent = type.toUpperCase();
        typeRow.appendChild(label);
        const dots = document.createElement("div");
        dots.className = "fingerprint-dot-row";
        for (let i = 0; i < maxCount; i++) {
          const dot = document.createElement("span");
          dot.className = "fingerprint-dot";
          if (i < displayCount) {
            dot.style.backgroundColor = colors[type];
            dot.style.boxShadow = `0 0 6px ${colors[type]}88`;
            if (fragments[i] && fragments[i].isAnchor) {
              dot.classList.add("anchor-dot");
              dot.style.boxShadow = `0 0 10px ${colors[type]}, 0 0 2px #fff`;
            }
          } else {
            dot.style.backgroundColor = "#2a2a45";
          }
          dot.style.width = "14px";
          dot.style.height = "14px";
          dots.appendChild(dot);
        }
        const countLabel = document.createElement("span");
        countLabel.className = "fingerprint-count-label";
        countLabel.style.color = colors[type];
        countLabel.textContent = `${count}`;
        dots.appendChild(countLabel);
        typeRow.appendChild(dots);
        dotsContainer.appendChild(typeRow);
      }
      fingerprint.appendChild(dotsContainer);
      return fingerprint;
    };
    renderLifePhaseBar = (st) => {
      const container = document.getElementById("life-phase-bar");
      if (!container) return;
      const currentAge = st.currentAge || st.age || 0;
      const phases = [
        { name: "INFANT", maxAge: 3 },
        { name: "CHILD", maxAge: 12 },
        { name: "ADOLESCENT", maxAge: 19 },
        { name: "YOUNG_ADULT", maxAge: 39 },
        { name: "MIDDLE_AGE", maxAge: 64 },
        { name: "SENIOR", maxAge: 84 },
        { name: "ANCIENT", maxAge: 120 }
      ];
      let currentPhase = "INFANT";
      for (const phase of phases) {
        if (currentAge <= phase.maxAge) {
          currentPhase = phase.name;
          break;
        }
      }
      container.innerHTML = "";
      const bar = document.createElement("div");
      bar.className = `life-phase-display phase-${currentPhase.toLowerCase()}`;
      bar.setAttribute("aria-label", `Current life phase: ${currentPhase.replace("_", " ")}`);
      bar.innerHTML = `
    <span class="phase-label">${currentPhase.replace("_", " ")}</span>
    <div class="phase-progress" role="list" aria-label="Life phases">
      ${phases.map((p) => `<div class="phase-segment ${p.name === currentPhase ? "active" : ""}" data-phase="${p.name}" role="listitem" aria-label="${p.name === currentPhase ? "Current phase: " : ""}${p.name.replace("_", " ")}"></div>`).join("")}
    </div>
    <span class="age-display" aria-label="Current age">Age ${currentAge}</span>
  `;
      container.appendChild(bar);
    };
    updateResourceDisplay = (st) => {
      const container = document.getElementById("resource-display");
      if (!container) return;
      const souls = st.souls || st.soul?.livesLived || 0;
      const faith = st.faith || 0;
      const xp = st.xp || 0;
      container.innerHTML = `
    <div class="resource-dots">
      <span class="resource-dot" data-tooltip="Souls: lives collected" role="status" aria-label="Souls: ${souls} collected">\xE2\u02DC\xB0 ${souls}</span>
      <span class="resource-dot" data-tooltip="Faith: spiritual resonance" role="status" aria-label="Faith: ${faith}">\xE2\u0153\xA7 ${faith}</span>
      <span class="resource-dot" data-tooltip="XP: experience earned" role="status" aria-label="Experience: ${xp}">\xE2\u2014\u2020 ${xp}</span>
    </div>
  `;
    };
    updateFaithDisplay = (st) => {
      const container = document.getElementById("faith-display");
      if (!container) return;
      const faith = st.faith || 0;
      const faithPercent = Math.min(faith / 100 * 100, 100);
      container.innerHTML = `
    <div class="faith-bar-container">
      <div class="faith-bar-fill" style="width: ${faithPercent}%"></div>
      <span class="faith-label">Faith: ${faith}</span>
    </div>
  `;
    };
    createChoiceButton = (choice, index) => {
      const button = document.createElement("button");
      button.className = `choice-button choice-${index + 1}`;
      button.dataset.choiceIndex = index;
      button.setAttribute("tabindex", "0");
      button.setAttribute("role", "button");
      button.setAttribute("aria-label", `${String.fromCharCode(65 + index)}: ${choice.text || choice.description || "Choose"}${choice.risk ? ", risk: " + choice.risk : ""}`);
      button.innerHTML = `
    <span class="choice-label">${String.fromCharCode(65 + index)}</span>
    <span class="choice-text">${choice.text || choice.description || "Choose"}</span>
    ${choice.risk ? `<span class="choice-risk">Risk: ${choice.risk}</span>` : ""}
  `;
      return button;
    };
    renderRiskDial = (canvasId, riskLevel) => {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 10;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = "#2a2a45";
      ctx.lineWidth = 8;
      ctx.stroke();
      const startAngle = Math.PI * 0.75;
      const endAngle = Math.PI * 2.25;
      const riskAngle = startAngle + (endAngle - startAngle) * Math.min(Math.max(riskLevel, 0), 1);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, riskAngle);
      ctx.strokeStyle = riskLevel > 0.7 ? "#c0392b" : riskLevel > 0.4 ? "#e67e22" : "#27ae60";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.7, 0, 2 * Math.PI);
      ctx.fillStyle = "#141420";
      ctx.fill();
      ctx.font = "bold 24px Cinzel";
      ctx.fillStyle = "#e8e6e3";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(Math.round(riskLevel * 100) + "%", centerX, centerY);
    };
    renderSpeedSlider = (containerId, currentSpeed, onChange) => {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = "";
      const wrapper = document.createElement("div");
      wrapper.className = "speed-slider-wrapper";
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
      const slider = wrapper.querySelector(".speed-slider");
      slider.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        const label = wrapper.querySelector(".speed-label");
        label.textContent = `Speed: ${value}x`;
        if (onChange) onChange(value);
      });
      container.appendChild(wrapper);
    };
    ERA_THEMES = {
      PREHISTORIC: { primary: "#8b6914", secondary: "#a67c00", bg: "linear-gradient(180deg, #1a1209 0%, #2d1f0f 100%)" },
      ANCIENT: { primary: "#8b7355", secondary: "#6b5344", bg: "linear-gradient(180deg, #1a1510 0%, #2a2018 100%)" },
      MEDIEVAL: { primary: "#4a4a6a", secondary: "#3a3a5a", bg: "linear-gradient(180deg, #12121a 0%, #1e1e2e 100%)" },
      EARLY_MODERN: { primary: "#6b4423", secondary: "#5a3a1d", bg: "linear-gradient(180deg, #1a1208 0%, #2a1a0f 100%)" },
      INDUSTRIAL: { primary: "#5a5a5a", secondary: "#4a4a4a", bg: "linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%)" },
      MODERN: { primary: "#3a5f3a", secondary: "#2a4f2a", bg: "linear-gradient(180deg, #0f1a0f 0%, #1a2a1a 100%)" },
      NEAR_FUTURE: { primary: "#1a3a5c", secondary: "#0a2a4c", bg: "linear-gradient(180deg, #0a1520 0%, #152030 100%)" },
      FAR_FUTURE: { primary: "#2a1a4a", secondary: "#1a0a3a", bg: "linear-gradient(180deg, #0f0a1a 0%, #1a0f2a 100%)" }
    };
    getEraTheme = (era) => ERA_THEMES[era] || ERA_THEMES.ANCIENT;
    renderLoop = (canvasId, renderFunc) => {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return null;
      let animating = true;
      let lastTime = 0;
      const loop = (timestamp) => {
        if (!animating) return;
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderFunc(ctx, canvas.width, canvas.height, deltaTime);
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
      return () => {
        animating = false;
      };
    };
    drawJCurve = (ctx, width, height, progress, era) => {
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
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) {
        const x = centerX - curveWidth / 2 + i / 10 * curveWidth;
        ctx.beginPath();
        ctx.moveTo(x, centerY - curveHeight / 2);
        ctx.lineTo(x, centerY + curveHeight / 2);
        ctx.stroke();
      }
    };
    drawParticles = (ctx, width, height, particles, era) => {
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
    drawLifeDot = (ctx, x, y, life) => {
      const era = life.era || "ANCIENT";
      const theme = getEraTheme(era);
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = theme.primary;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
    };
    drawCrisisSpike = (ctx, x, y, severity) => {
      const spikeHeight = 20 + severity * 40;
      const spikeWidth = 10 + severity * 10;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - spikeWidth / 2, y + spikeHeight);
      ctx.lineTo(x + spikeWidth / 2, y + spikeHeight);
      ctx.closePath();
      const gradient = ctx.createLinearGradient(x, y, x, y + spikeHeight);
      gradient.addColorStop(0, "#c0392b");
      gradient.addColorStop(1, "rgba(192, 57, 43, 0)");
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = "#c0392b";
      ctx.lineWidth = 2;
      ctx.stroke();
    };
    drawDeathEffect = (ctx, x, y, progress) => {
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
    drawLimboParticles = (ctx, width, height, time) => {
      const particleCount = 30;
      for (let i = 0; i < particleCount; i++) {
        const seed = i * 137.5;
        const x = (Math.sin(seed + time * 1e-3) * 0.5 + 0.5) * width;
        const y = (Math.cos(seed * 1.618 + time * 7e-4) * 0.5 + 0.5) * height;
        const size = 2 + Math.sin(seed + time * 2e-3) * 2;
        const alpha = 0.3 + Math.sin(seed * 2 + time * 3e-3) * 0.2;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(155, 89, 182, ${alpha})`;
        ctx.fill();
      }
      for (let i = 0; i < particleCount / 2; i++) {
        const seed = i * 223.7;
        const x = (Math.sin(seed * 0.7 + time * 15e-4) * 0.5 + 0.5) * width;
        const y = (Math.cos(seed * 1.3 + time * 1e-3) * 0.5 + 0.5) * height;
        const size = 1 + Math.sin(seed + time * 2e-3) * 1.5;
        const alpha = 0.2 + Math.sin(seed * 3 + time * 25e-4) * 0.15;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(212, 175, 55, ${alpha})`;
        ctx.fill();
      }
    };
    _tutorialStep = 0;
    _tutorialDismissed = false;
    TUTORIAL_STEPS = [
      { text: "Connection (Con) \xE2 \u201D your emotional resilience. Affects how you handle loss.", position: "bottom" },
      { text: "Vitality (Vit) \xE2 \u201D your physical resilience. Affects crisis survival.", position: "bottom" },
      { text: "Momentum (Mom) \xE2 \u201D your drive. Affects how fast you accumulate progress.", position: "bottom" },
      { text: "The J-curve shows your mortality risk. Click the risk dial to change how dangerous your life is.", position: "top" },
      { text: "When a crisis fires, you have seconds to choose. Your choice affects the outcome.", position: "right" },
      { text: "Fragments are memories that persist across lives. They influence future events.", position: "right" },
      { text: "Anchors form when a fragment recurs \xE2 \u201D they become core threads of your soul.", position: "right" },
      { text: "Press NEW LIFE to begin.", position: "bottom" }
    ];
    showTutorialStep = (step) => {
      _tutorialDismissed = false;
      let tip = document.getElementById("tutorial-tip");
      if (!tip) {
        tip = document.createElement("div");
        tip.id = "tutorial-tip";
        tip.className = "tutorial-tip";
        document.body.appendChild(tip);
      }
      const stepData = TUTORIAL_STEPS[step] || TUTORIAL_STEPS[0];
      _tutorialStep = step;
      tip.innerHTML = `
    <div class="tutorial-content">
      <p class="tutorial-text">${stepData.text}</p>
      <div class="tutorial-progress">${step + 1} / ${TUTORIAL_STEPS.length}</div>
      <div class="tutorial-buttons">
        ${step > 0 ? '<button class="btn-tutorial-prev" data-tutorial-prev>Previous</button>' : ""}
        ${step < TUTORIAL_STEPS.length - 1 ? '<button class="btn-tutorial-next" data-tutorial-next>Next</button>' : '<button class="btn-tutorial-done" data-tutorial-done>Done</button>'}
      </div>
    </div>
    <div class="tutorial-arrow"></div>
  `;
      tip.classList.remove("hidden");
      const arrow = tip.querySelector(".tutorial-arrow");
      if (stepData.position === "bottom") {
        arrow.style.cssText = "top: -10px; left: 50%; transform: translateX(-50%) rotate(45deg);";
      } else if (stepData.position === "top") {
        arrow.style.cssText = "bottom: -10px; left: 50%; transform: translateX(-50%) rotate(225deg);";
      } else if (stepData.position === "right") {
        arrow.style.cssText = "left: -10px; top: 50%; transform: translateY(-50%) rotate(135deg);";
      }
      tip.querySelector("[data-tutorial-prev]")?.addEventListener("click", prevTutorialStep);
      tip.querySelector("[data-tutorial-next]")?.addEventListener("click", nextTutorialStep);
      tip.querySelector("[data-tutorial-done]")?.addEventListener("click", closeTutorial);
      const dismissHandler = (e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          closeTutorial();
          document.removeEventListener("keydown", dismissHandler);
        }
      };
      document.addEventListener("keydown", dismissHandler);
    };
    nextTutorialStep = () => {
      if (_tutorialStep < TUTORIAL_STEPS.length - 1) {
        _tutorialStep++;
        showTutorialStep(_tutorialStep);
      } else {
        closeTutorial();
      }
    };
    prevTutorialStep = () => {
      if (_tutorialStep > 0) {
        _tutorialStep--;
        showTutorialStep(_tutorialStep);
      }
    };
    closeTutorial = () => {
      const tip = document.getElementById("tutorial-tip");
      if (tip) tip.classList.add("hidden");
      _tutorialStep = 0;
      _tutorialDismissed = true;
      try {
        localStorage.setItem("soulcycle_seen_tutorial", "1");
      } catch {
      }
    };
    showContextualTip = (tipType) => {
      const tipId = `contextual-tip-${tipType}`;
      const existing = document.getElementById(tipId);
      if (existing) return;
      const tips = {
        crisis: "Press A/B/C or click to choose. ESC auto-selects Watch.",
        whisper: "Y/N to respond to your soul's fragments.",
        death: "Your fragments are extracted and accumulate.",
        resources: "Connection \xE2 \u201D emotional resilience. Vitality \xE2 \u201D physical resilience. Momentum \xE2 \u201D drive."
      };
      const text = tips[tipType];
      if (!text) return;
      const tip = document.createElement("div");
      tip.id = tipId;
      tip.className = "tutorial-tip contextual-tip";
      tip.innerHTML = `<div class="tutorial-content"><p class="tutorial-text">${text}</p></div>`;
      document.body.appendChild(tip);
      requestAnimationFrame(() => tip.classList.add("visible"));
      setTimeout(() => {
        tip.classList.remove("visible");
        setTimeout(() => tip.remove(), 300);
      }, 5e3);
    };
    hasSeenTutorial = () => {
      try {
        return localStorage.getItem("soulcycle_seen_tutorial") === "1";
      } catch {
        return false;
      }
    };
    showEraTip = (era) => {
      const tips = {
        PREHISTORIC: "Survival is uncertain. Every choice matters.",
        ANCIENT: "The gods watch. Empires rise and fall.",
        MEDIEVAL: "Plague and faith shape the world.",
        EARLY_MODERN: "Discovery and enlightenment emerge.",
        INDUSTRIAL: "Machines transform society.",
        MODERN: "Technology connects and isolates.",
        NEAR_FUTURE: "Climate and algorithms define existence.",
        FAR_FUTURE: "Death becomes optional. Meaning persists."
      };
      const tipText = tips[era] || "Choose wisely.";
      showDivineToast(tipText, 4e3);
    };
    showHowToPlayCarousel = () => {
      const container = document.getElementById("how-to-play-content");
      if (!container) return;
      const slides = [
        { title: "Welcome to Soul Cycle", content: "You guide a soul through multiple lifetimes, collecting fragments of memory and meaning." },
        { title: "The J-Curve", content: "Your mortality risk follows a J-curve - low in youth, rising with age. Events can strike at any time." },
        { title: "Choices Matter", content: "Each event presents choices with risks and rewards. Your decisions shape the soul's journey." },
        { title: "Fragments & Anchors", content: "Collect fragments from lives lived. Recurring themes become anchors that persist across incarnations." },
        { title: "Eras & Progression", content: "Unlock new eras as your soul collects more fragments, from prehistoric times to the far future." }
      ];
      let currentSlide = 0;
      container.innerHTML = `
    <div class="carousel-container">
      <div class="carousel-track">
        ${slides.map((slide, i) => `<div class="carousel-slide ${i === 0 ? "active" : ""}" data-slide="${i}">
          <h3>${slide.title}</h3>
          <p>${slide.content}</p>
        </div>`).join("")}
      </div>
      <div class="carousel-controls">
        <button class="btn-carousel-prev" data-carousel-prev disabled>Previous</button>
        <div class="carousel-dots">${slides.map((_, i) => `<span class="carousel-dot ${i === 0 ? "active" : ""}" data-dot="${i}"></span>`).join("")}</div>
        <button class="btn-carousel-next" data-carousel-next>Next</button>
      </div>
      <button class="btn-close-carousel" data-close-carousel>Start Game</button>
    </div>
  `;
      const updateSlide = (newSlide) => {
        currentSlide = Math.max(0, Math.min(newSlide, slides.length - 1));
        const slideEls = container.querySelectorAll(".carousel-slide");
        const dotEls = container.querySelectorAll(".carousel-dot");
        slideEls.forEach((el, i) => el.classList.toggle("active", i === currentSlide));
        dotEls.forEach((el, i) => el.classList.toggle("active", i === currentSlide));
        container.querySelector("[data-carousel-prev]").disabled = currentSlide === 0;
        container.querySelector("[data-carousel-next]").disabled = currentSlide === slides.length - 1;
      };
      container.querySelector("[data-carousel-prev]").addEventListener("click", () => updateSlide(currentSlide - 1));
      container.querySelector("[data-carousel-next]").addEventListener("click", () => updateSlide(currentSlide + 1));
      container.querySelectorAll(".carousel-dot").forEach((dot, i) => {
        dot.addEventListener("click", () => updateSlide(i));
      });
      container.querySelector("[data-close-carousel]").addEventListener("click", () => {
        hideOverlay("overlay-tutorial");
      });
      showOverlay("overlay-tutorial");
    };
    showArrow = (targetId, text) => {
      const existing = document.getElementById("tutorial-arrow");
      if (existing) existing.remove();
      const target = document.getElementById(targetId);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const arrow = document.createElement("div");
      arrow.id = "tutorial-arrow";
      arrow.className = "tutorial-arrow-indicator";
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
    hideArrow = () => {
      const arrow = document.getElementById("tutorial-arrow");
      if (arrow) arrow.remove();
    };
    showEventPanel = (event) => {
      const container = document.getElementById("event-panel");
      if (!container) return;
      container.innerHTML = "";
      const card = createEventCard(event);
      container.appendChild(card);
      if (event.choices && event.choices.length > 0) {
        const choicesContainer = document.createElement("div");
        choicesContainer.className = "event-choices";
        event.choices.forEach((choice, i) => {
          const btn = createChoiceButton(choice, i);
          btn.addEventListener("click", () => {
            if (choice.action) choice.action(choice);
          });
          btn.addEventListener("touchstart", () => btn.classList.add("touch-active"), { passive: true });
          btn.addEventListener("touchend", () => btn.classList.remove("touch-active"), { passive: true });
          btn.addEventListener("touchcancel", () => btn.classList.remove("touch-active"), { passive: true });
          choicesContainer.appendChild(btn);
        });
        container.appendChild(choicesContainer);
      }
      container.classList.remove("hidden");
    };
    hideEventPanel = () => {
      const container = document.getElementById("event-panel");
      if (container) container.classList.add("hidden");
    };
    updateEraDisplay = (era) => {
      const container = document.getElementById("era-display");
      if (!container) return;
      const theme = getEraTheme(era);
      container.style.cssText = `
    background: ${theme.bg};
    border-color: ${theme.primary};
  `;
      container.innerHTML = `
    <span class="era-badge" style="background: ${theme.primary};">${era.replace("_", " ")}</span>
  `;
    };
    showUpgradePanel = (upgrades) => {
      const container = document.getElementById("upgrade-content");
      if (!container) return;
      container.innerHTML = "";
      const panel = document.createElement("div");
      panel.className = "upgrade-panel";
      const title = document.createElement("h2");
      title.textContent = "Soul Upgrades";
      panel.appendChild(title);
      const grid = document.createElement("div");
      grid.className = "upgrade-grid";
      for (const upgrade of upgrades) {
        const card = document.createElement("div");
        card.className = `upgrade-card ${upgrade.unlocked ? "unlocked" : "locked"}`;
        card.innerHTML = `
      <h4>${upgrade.name}</h4>
      <p>${upgrade.description}</p>
      ${upgrade.unlocked ? '<span class="upgrade-unlocked">Unlocked</span>' : `<button class="btn-unlock" data-upgrade="${upgrade.id}">Unlock (${upgrade.cost} XP)</button>`}
    `;
        grid.appendChild(card);
      }
      panel.appendChild(grid);
      const closeBtn = document.createElement("button");
      closeBtn.className = "btn-close-upgrade";
      closeBtn.textContent = "Continue";
      closeBtn.addEventListener("click", () => hideOverlay("overlay-upgrade"));
      panel.appendChild(closeBtn);
      container.appendChild(panel);
      showOverlay("overlay-upgrade");
    };
    updateSoulBrowserFragment = (fragmentId, changes) => {
      const fragmentEl = document.querySelector(`[data-fragment-id="${fragmentId}"]`);
      if (!fragmentEl) return;
      if (changes.strength !== void 0) {
        const bar = fragmentEl.querySelector(".fragment-strength-bar");
        if (bar) bar.style.width = `${changes.strength * 100}%`;
      }
    };
    animateFragmentMerge = (fragmentEl) => {
      if (!fragmentEl) return;
      fragmentEl.classList.add("merging");
      setTimeout(() => fragmentEl.classList.remove("merging"), 600);
    };
    createFragmentTooltip = (fragment) => {
      const tooltip = document.createElement("div");
      tooltip.className = "fragment-tooltip";
      tooltip.innerHTML = `
    <div class="tooltip-type">${fragment.type}</div>
    <div class="tooltip-value">${fragment.value}</div>
    <div class="tooltip-strength">Strength: ${Math.round(fragment.strength * 100)}%</div>
    <div class="tooltip-desc">Fragments are memories that persist across lives. They influence future events.</div>
    ${fragment.isAnchor ? '<div class="tooltip-anchor">ANCHOR \xE2 \u201D a core thread of your soul</div>' : ""}
    <div class="tooltip-origin">From: ${fragment.origin?.lifeId || "Unknown life"}</div>
  `;
      return tooltip;
    };
    showTitleScreen = () => {
      const container = document.getElementById("title-screen");
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
      container.classList.add("visible");
    };
    hideTitleScreen = () => {
      const container = document.getElementById("title-screen");
      if (container) {
        container.classList.remove("visible");
        container.classList.add("hidden");
      }
    };
    showPauseOverlay = () => {
      showOverlay("overlay-pause");
    };
    hidePauseOverlay = () => {
      hideOverlay("overlay-pause");
    };
    showVictoryOverlay = () => {
      showOverlay("overlay-victory");
    };
    hideVictoryOverlay = () => {
      hideOverlay("overlay-victory");
    };
    showEraTransition = (fromEra, toEra, callback) => {
      const container = document.getElementById("era-transition-content");
      if (!container) return;
      container.innerHTML = `
    <div class="era-transition">
      <div class="era-from">${fromEra?.replace("_", " ") || "Unknown"}</div>
      <div class="era-arrow">\xE2\u2020\u2019</div>
      <div class="era-to">${toEra?.replace("_", " ") || "Unknown"}</div>
    </div>
    <p class="transition-message">A new era awaits...</p>
  `;
      showOverlay("overlay-era");
      setTimeout(() => {
        hideOverlay("overlay-era");
        if (callback) callback();
      }, 3e3);
    };
    createMiniEventSummary = (events) => {
      const container = document.createElement("div");
      container.className = "mini-event-summary";
      const summary = document.createElement("div");
      summary.className = "event-timeline";
      events.slice(-5).forEach((event, i) => {
        const dot = document.createElement("div");
        dot.className = `timeline-dot event-${event.category || "default"}`;
        dot.title = event.title || "Event";
        summary.appendChild(dot);
      });
      container.appendChild(summary);
      return container;
    };
    updateEventHistory = (events) => {
      const container = document.getElementById("event-history");
      if (!container) return;
      container.innerHTML = "";
      const timeline = document.createElement("div");
      timeline.className = "event-history-timeline";
      for (const event of events.slice(-10)) {
        const item = document.createElement("div");
        item.className = `history-item event-${event.category || "default"}`;
        item.innerHTML = `
      <span class="history-age">${event.age || "?"}</span>
      <span class="history-title">${event.title || "Unknown"}</span>
    `;
        timeline.appendChild(item);
      }
      container.appendChild(timeline);
    };
    showLoadingScreen = (message = "Loading...") => {
      const existing = document.getElementById("loading-screen");
      if (existing) existing.remove();
      const loader = document.createElement("div");
      loader.id = "loading-screen";
      loader.className = "loading-overlay";
      loader.innerHTML = `
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <p class="loading-message">${message}</p>
    </div>
  `;
      document.body.appendChild(loader);
    };
    hideLoadingScreen = () => {
      const loader = document.getElementById("loading-screen");
      if (loader) loader.remove();
    };
    showConfirmDialog = (title, message, onConfirm, onCancel) => {
      const overlay = document.createElement("div");
      overlay.className = "modal-overlay confirm-dialog";
      const content = document.createElement("div");
      content.className = "confirm-content";
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
      requestAnimationFrame(() => overlay.classList.add("visible"));
      overlay.querySelector("[data-confirm-yes]").addEventListener("click", () => {
        overlay.classList.remove("visible");
        setTimeout(() => overlay.remove(), 300);
        if (onConfirm) onConfirm();
      });
      overlay.querySelector("[data-confirm-no]").addEventListener("click", () => {
        overlay.classList.remove("visible");
        setTimeout(() => overlay.remove(), 300);
        if (onCancel) onCancel();
      });
    };
    updateTooltipPosition = (tooltip, x, y) => {
      tooltip.style.cssText = `
    position: fixed;
    left: ${x + 15}px;
    top: ${y + 15}px;
    z-index: 1001;
  `;
    };
    showElementById = (id) => {
      const el = document.getElementById(id);
      if (el) el.classList.remove("hidden");
    };
    hideElementById = (id) => {
      const el = document.getElementById(id);
      if (el) el.classList.add("hidden");
    };
    toggleElementVisibility = (id) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle("hidden");
    };
    addClassToElement = (id, className) => {
      const el = document.getElementById(id);
      if (el) el.classList.add(className);
    };
    removeClassFromElement = (id, className) => {
      const el = document.getElementById(id);
      if (el) el.classList.remove(className);
    };
    setElementText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    setElementHTML = (id, html) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    };
    appendToElement = (id, child) => {
      const el = document.getElementById(id);
      if (el && child) el.appendChild(child);
    };
    clearElement = (id) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = "";
    };
    removeElement = (id) => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
    animateElement = (id, animationClass, duration = 600) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.add(animationClass);
      setTimeout(() => el.classList.remove(animationClass), duration);
    };
    pulseElement = (id) => {
      animateElement(id, "pulse-animation");
    };
    shakeElement = (id) => {
      animateElement(id, "shake-animation");
    };
    fadeInElement = (id, duration = 300) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.opacity = "0";
      el.style.transition = `opacity ${duration}ms ease`;
      requestAnimationFrame(() => {
        el.style.opacity = "1";
      });
    };
    fadeOutElement = (id, duration = 300) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.transition = `opacity ${duration}ms ease`;
      el.style.opacity = "0";
      setTimeout(() => el.classList.add("hidden"), duration);
    };
    showToast = (message, type = "info", duration = 3e3) => {
      const existing = document.getElementById("generic-toast");
      if (existing) existing.remove();
      const toast = document.createElement("div");
      toast.id = "generic-toast";
      toast.className = `toast toast-${type}`;
      toast.textContent = message;
      document.body.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add("visible"));
      setTimeout(() => {
        toast.classList.remove("visible");
        setTimeout(() => toast.remove(), 300);
      }, duration);
    };
    updateProgressBar = (id, percent, label) => {
      const container = document.getElementById(id);
      if (!container) return;
      container.innerHTML = `
    <div class="progress-bar-fill" style="width: ${Math.min(Math.max(percent, 0), 100)}%"></div>
    ${label ? `<span class="progress-label">${label}</span>` : ""}
  `;
    };
    renderHealthBar = (current, max) => {
      const percent = current / max * 100;
      const color = percent > 60 ? "#27ae60" : percent > 30 ? "#e67e22" : "#c0392b";
      return `<div class="health-bar-container">
    <div class="health-bar-fill" style="width: ${percent}%; background: ${color};"></div>
    <span class="health-text">${current}/${max}</span>
  </div>`;
    };
    createClickableEffect = (element, callback) => {
      if (!element) return;
      element.style.cursor = "pointer";
      element.addEventListener("click", () => {
        if (callback) callback();
      });
    };
    bindKeyboardShortcut = (key, callback) => {
      document.addEventListener("keydown", (e) => {
        if (e.key === key && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          callback();
        }
      });
    };
    showHelpModal = () => {
      const modal = document.createElement("div");
      modal.id = "help-modal";
      modal.className = "modal-overlay";
      const content = document.createElement("div");
      content.className = "modal-content help-content";
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
      requestAnimationFrame(() => modal.classList.add("visible"));
      modal.querySelector("[data-close-help]").addEventListener("click", () => {
        modal.classList.remove("visible");
        setTimeout(() => modal.remove(), 300);
      });
    };
    openMuseum = (soulState, allLives = []) => {
      const existing = document.getElementById("museum-modal");
      if (existing) existing.remove();
      createMuseumModal(soulState, allLives);
    };
    createMuseumModal = (soulState, allLives = []) => {
      const modal = document.createElement("div");
      modal.id = "museum-modal";
      modal.className = "modal-overlay museum-overlay";
      const content = document.createElement("div");
      content.className = "modal-content museum-content";
      const lives = soulState._lifeHistory || allLives;
      const fragmentTypeOrder = ["tone", "fear", "love", "warning", "location", "name", "object", "word"];
      const chainTypes = ["GRIEF", "LOVE", "DREAD", "WONDER", "RAGE", "GRACE"];
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
        ${soulState.soulComplete ? '<span class="museum-complete-badge">COMPLETE SOUL</span>' : ""}
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
      ${soulState.soulComplete ? '<button class="museum-tab" data-tab="complete">Complete Soul</button>' : ""}
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
      requestAnimationFrame(() => modal.classList.add("visible"));
      const closeBtn = modal.querySelector("[data-close-museum]");
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("visible");
        setTimeout(() => modal.remove(), 300);
      });
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("visible");
          setTimeout(() => modal.remove(), 300);
        }
      });
      modal.querySelectorAll(".museum-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          modal.querySelectorAll(".museum-tab").forEach((t) => t.classList.remove("active"));
          modal.querySelectorAll(".museum-panel").forEach((p) => p.classList.remove("active"));
          tab.classList.add("active");
          const panel = modal.querySelector(`#museum-panel-${tab.dataset.tab}`);
          if (panel) panel.classList.add("active");
        });
      });
      modal.querySelectorAll(".life-card").forEach((card) => {
        card.addEventListener("click", () => {
          const lifeId = card.dataset.lifeId;
          const life = lives.find((l) => l.id === lifeId);
          if (life) openLifeDetailView(life, lives, chainTypes);
        });
      });
      const searchInput = modal.querySelector("#event-search-input");
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          const q = e.target.value.toLowerCase();
          modal.querySelectorAll(".archive-event-item").forEach((item) => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(q) ? "" : "none";
          });
        });
      }
      const eraFilter = modal.querySelector("#event-filter-era");
      if (eraFilter) {
        eraFilter.addEventListener("change", (e) => applyEventFilters(modal, eraFilter.value, modal.querySelector("#event-filter-chain")?.value || "", modal.querySelector("#event-filter-outcome")?.value || ""));
      }
      const chainFilter = modal.querySelector("#event-filter-chain");
      if (chainFilter) {
        chainFilter.addEventListener("change", (e) => applyEventFilters(modal, modal.querySelector("#event-filter-era")?.value || "", e.target.value, modal.querySelector("#event-filter-outcome")?.value || ""));
      }
      const outcomeFilter = modal.querySelector("#event-filter-outcome");
      if (outcomeFilter) {
        outcomeFilter.addEventListener("change", (e) => applyEventFilters(modal, modal.querySelector("#event-filter-era")?.value || "", modal.querySelector("#event-filter-chain")?.value || "", e.target.value));
      }
      modal.querySelectorAll(".fragment-type-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          modal.querySelectorAll(".fragment-type-tab").forEach((t) => t.classList.remove("active"));
          tab.classList.add("active");
          const ftype = tab.dataset.ftype;
          modal.querySelectorAll(".fragment-card").forEach((card) => {
            card.style.display = !ftype || card.dataset.type === ftype ? "" : "none";
          });
        });
      });
    };
    _activeTypewriter = null;
    _advancingEvent = false;
    typewriterEffect = (element, text, speed = 40, onComplete, eventObj = null) => {
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
      element.textContent = "";
      element.classList.add("typewriter-text");
      const skipHint = document.createElement("div");
      skipHint.className = "typewriter-skip-hint";
      skipHint.textContent = "Space to skip";
      element.parentElement.appendChild(skipHint);
      let skipped = false;
      const cleanup = () => {
        document.removeEventListener("keydown", skipHandler);
        skipHint.remove();
      };
      const reveal = (currentIndex) => {
        if (element.dataset.typewriterMarker !== marker) return;
        if (skipped) {
          element.textContent = text;
          element.classList.add("skip");
          element.classList.remove("typewriter-text");
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
          element.classList.remove("typewriter-text");
          if (onComplete) onComplete();
          cleanup();
          if (_activeTypewriter && _activeTypewriter.element === element) _activeTypewriter = null;
        }
      };
      const skipHandler = (e) => {
        if ((e.code === "Space" || e.code === "Enter") && !skipped) {
          skipped = true;
          skipNarration();
          document.removeEventListener("keydown", skipHandler);
        }
      };
      document.addEventListener("keydown", skipHandler);
      _activeTypewriter = { element, skipped: false, cleanup, marker };
      setTimeout(() => skipHint.classList.add("visible"), text.length * speed * 0.5);
      reveal(0);
      return () => {
        skipped = true;
        cleanup();
        _activeTypewriter = null;
      };
    };
    animateFragmentExtraction = (fragment, startElement, targetElement, duration = 2e3) => {
      const startRect = startElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const fragmentEl = document.createElement("div");
      fragmentEl.className = "fragment-extracting";
      fragmentEl.textContent = fragment.value;
      fragmentEl.style.left = `${startRect.left + startRect.width / 2}px`;
      fragmentEl.style.top = `${startRect.top}px`;
      document.body.appendChild(fragmentEl);
      let startTime = null;
      let trailInterval = null;
      const createTrail = (x, y) => {
        const trail = document.createElement("div");
        trail.className = "glow-trail";
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
    animateDeathRewind = (eventElement, onComplete) => {
      const vignette = document.createElement("div");
      vignette.className = "death-rewind-overlay";
      document.body.appendChild(vignette);
      if (eventElement) {
        eventElement.classList.add("death-rewind-text");
      }
      setTimeout(() => {
        vignette.remove();
        if (eventElement) eventElement.classList.remove("death-rewind-text");
        if (onComplete) onComplete();
      }, 800);
    };
    animateFingerprintReveal = (containerElement, dotCount = 12) => {
      if (!containerElement) return;
      containerElement.classList.add("assembling");
      const dots = containerElement.querySelectorAll(".fingerprint-dot");
      dots.forEach((dot, i) => {
        dot.style.animationDelay = `${i * 0.1}s`;
        dot.classList.add("fingerprint-dot");
        const shimmer = document.createElement("div");
        shimmer.className = "shimmer";
        shimmer.style.animationDelay = `${i * 0.1 + 0.2}s`;
        dot.style.position = "relative";
        dot.appendChild(shimmer);
      });
      setTimeout(() => {
        containerElement.classList.remove("assembling");
        dots.forEach((dot) => {
          dot.classList.remove("fingerprint-dot");
          const shimmer = dot.querySelector(".shimmer");
          if (shimmer) shimmer.remove();
        });
      }, dotCount * 100 + 600);
    };
    animateConsequenceCracks = () => {
      const container = document.createElement("div");
      container.className = "consequence-crack-container";
      document.body.appendChild(container);
      const crackCount = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < crackCount; i++) {
        const crack = document.createElement("div");
        crack.className = `consequence-crack crack-offset-${i + 1}`;
        container.appendChild(crack);
      }
      setTimeout(() => container.remove(), 2e3);
    };
    animatePhaseTransition = (phaseName, onComplete) => {
      const flash = document.createElement("div");
      flash.className = "phase-transition-flash";
      flash.innerHTML = `<div class="phase-name">${phaseName.replace("_", " ")}</div>`;
      document.body.appendChild(flash);
      setTimeout(() => {
        flash.remove();
        if (onComplete) onComplete();
      }, 1e3);
    };
    animateAnchorGlow = (anchorElement, isPromoted = false) => {
      if (!anchorElement) return;
      anchorElement.classList.add("anchor-glow-pulse");
      if (isPromoted) {
        anchorElement.classList.add("promoted");
      }
      setTimeout(() => {
        anchorElement.classList.remove("anchor-glow-pulse", "promoted");
      }, 3e3);
    };
    animateAchievementUnlock = (achievement) => {
      const badge = document.createElement("div");
      badge.className = "achievement-unlock";
      badge.innerHTML = `
    <div class="shimmer-effect"></div>
    <div class="badge-icon">${achievement.icon || "\xE2\u02DC\u2026"}</div>
    <div class="badge-label">${achievement.label}</div>
  `;
      document.body.appendChild(badge);
      setTimeout(() => badge.remove(), 2500);
    };
    showAchievementNotifications = (achievements) => {
      if (!achievements || achievements.length === 0) return;
      achievements.forEach((achievement, index) => {
        setTimeout(() => {
          animateAchievementUnlock(achievement);
        }, index * 1200);
      });
    };
    animateEraDissolve = (era, onComplete) => {
      const overlay = document.createElement("div");
      overlay.className = `era-dissolve-overlay era-${era}`;
      document.body.appendChild(overlay);
      setTimeout(() => {
        overlay.remove();
        if (onComplete) onComplete();
      }, 2e3);
    };
    drawLimboParticlesSwirl = (ctx, width, height, time) => {
      const particleCount = 40;
      const centerX = width / 2;
      const centerY = height / 2;
      const threadLength = 120;
      const threadTargetY = height + 30;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX, threadTargetY);
      ctx.strokeStyle = "rgba(212, 175, 55, 0.15)";
      ctx.lineWidth = 2;
      ctx.stroke();
      for (let i = 0; i < threadLength; i++) {
        const t = i / threadLength;
        const wobbleX = Math.sin(i * 0.3 + time * 2e-3) * (4 + t * 6);
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
        const spiralAngle = (time * 1e-3 + seed * 0.01) % (Math.PI * 20);
        const spiralRadius = 20 + i / particleCount * (Math.min(width, height) * 0.4);
        const x = centerX + Math.cos(spiralAngle) * spiralRadius * (1 + 0.2 * Math.sin(time * 2e-3 + seed));
        const y = centerY + Math.sin(spiralAngle) * spiralRadius * (1 + 0.2 * Math.cos(time * 2e-3 + seed));
        const size = 2 + Math.sin(seed + time * 2e-3) * 2;
        const alpha = 0.3 + Math.sin(seed * 2 + time * 3e-3) * 0.2;
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
    drawSoulFingerprintDots = (ctx, x, y, count, radius, time, progress = 1) => {
      const visibleCount = Math.floor(count * progress);
      for (let i = 0; i < visibleCount; i++) {
        const angle = i / count * Math.PI * 2 + time * 1e-3;
        const dotX = x + Math.cos(angle) * radius;
        const dotY = y + Math.sin(angle) * radius;
        const shimmer = Math.sin(time * 5e-3 + i) * 0.3 + 0.7;
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
    animateSoulFingerprintCanvas = (canvas, fragments, onComplete) => {
      const ctx = canvas.getContext("2d");
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
        const types = ["tone", "fear", "love", "warning"];
        const colors = ["#d4af37", "#c0392b", "#9b59b6", "#e67e22"];
        types.forEach((type, typeIndex) => {
          const typeFragments = fragments.filter((f) => f.type === type);
          const count = Math.min(typeFragments.length, 8);
          const typeRadius = radius + typeIndex * 25;
          for (let i = 0; i < count; i++) {
            const angle = i / count * Math.PI * 2 - Math.PI / 2 + timestamp * 5e-4;
            const dotX = centerX + Math.cos(angle) * typeRadius;
            const dotY = centerY + Math.sin(angle) * typeRadius;
            const shimmer = Math.sin(timestamp * 3e-3 + i + typeIndex) * 0.3 + 0.7;
            const dotProgress = progress * count - i;
            if (dotProgress > 0) {
              const alpha = Math.min(dotProgress, shimmer);
              ctx.beginPath();
              ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
              ctx.fillStyle = colors[typeIndex].replace(")", `, ${alpha})`).replace("rgb", "rgba").replace("#", "rgba(").replace(/([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i, (m, r, g, b) => `${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}`);
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
  }
});

// js/game.js
function createSoulState(id) {
  return {
    id: id || `soul_${Date.now()}`,
    livesLived: 0,
    totalYearsLived: 0,
    fragments: [],
    anchors: [],
    unlockedEras: ["ANCIENT", "MEDIEVAL"],
    metaStats: {
      totalDeaths: 0,
      violentDeaths: 0,
      peacefulDeaths: 0,
      lovesLost: 0,
      childrenBorn: 0
    }
  };
}
function createLifeState() {
  return {
    id: `life_${Date.now()}`,
    name: "",
    era: "ANCIENT",
    year: 0,
    age: 0,
    location: { city: "", region: "", country: "" },
    genderPresentation: "male",
    health: "healthy",
    socialClass: "unknown",
    phase: "INFANT",
    isAlive: true,
    events: [],
    decisions: [],
    anchor: null
  };
}
function gameTick() {
  if (!state2.isRunning || state2.isPaused || !state2.life || !state2.life.isAlive) {
    return;
  }
  state2.ticksThisLife += 1;
  state2.age += 1;
  state2.year += 1;
  state2.life.age = state2.age;
  state2.life.year = state2.year;
  const newPhase = getLifePhase(state2.age);
  if (newPhase !== state2.currentPhase) {
    state2.currentPhase = newPhase;
    state2.life.phase = newPhase;
  }
  const baseRate = getMortalityRate(state2.age);
  const riskMultiplier = getRiskLevel(state2.riskAppetite);
  const mortalityChance = baseRate / 1e3 * riskMultiplier;
  if (Math.random() < mortalityChance) {
    dieNow();
    return;
  }
}
function adjustRiskAppetite(delta) {
  const levels = ["MINIMAL", "LOW", "MODERATE", "HIGH", "EXTREME"];
  const currentIdx = levels.indexOf(state2.riskAppetite);
  const newIdx = Math.max(0, Math.min(levels.length - 1, currentIdx + delta));
  state2.riskAppetite = levels[newIdx];
  return state2.riskAppetite;
}
function getRiskLevel(riskAppetite) {
  const level = RISK_LEVELS[riskAppetite] || RISK_LEVELS.MODERATE;
  return level.multiplier;
}
function getRiskLabel(riskAppetite) {
  const level = RISK_LEVELS[riskAppetite] || RISK_LEVELS.MODERATE;
  return level.label;
}
function setSpeed(speed) {
  state2.speed = Math.max(0.25, Math.min(8, speed));
  return state2.speed;
}
function getSpeed() {
  return state2.speed;
}
function getEraForSoul(soulState) {
  const fragmentCount = soulState.fragments ? soulState.fragments.length : 0;
  const unlocked = getUnlockedEras(fragmentCount);
  const eraWeights = buildEraWeightsInternal(fragmentCount);
  const totalWeight = eraWeights.reduce((sum, e) => sum + e.weight, 0);
  let random = Math.random() * totalWeight;
  for (const { eraId, weight } of eraWeights) {
    random -= weight;
    if (random <= 0) return eraId;
  }
  return unlocked.length > 0 ? unlocked[0] : "ANCIENT";
}
function getUnlockedEras(fragmentCount) {
  if (fragmentCount >= 10) {
    return ERA_ORDER.slice();
  }
  const unlockedCount = Math.max(2, Math.min(fragmentCount + 2, ERA_ORDER.length));
  return ERA_ORDER.slice(0, unlockedCount);
}
function getEraData(eraId) {
  return ERA_DATA[eraId] || ERA_DATA.ANCIENT;
}
function getEraYearRange(eraId) {
  const data = ERA_DATA[eraId];
  return data ? data.yearRange : [0, 100];
}
function getEraSignature(eraId) {
  const data = ERA_DATA[eraId];
  return data ? data.eventSignature : "The world turns without you.";
}
function getAllEras() {
  return ERA_ORDER.map((id) => ERA_DATA[id]);
}
function buildEraWeightsInternal(fragmentCount) {
  const unlocked = getUnlockedEras(fragmentCount);
  const weights = [];
  for (let i = 0; i < ERA_ORDER.length; i++) {
    const eraId = ERA_ORDER[i];
    if (!unlocked.includes(eraId)) continue;
    let weight;
    if (fragmentCount === 0) {
      if (eraId === "ANCIENT") weight = 70;
      else if (eraId === "MEDIEVAL") weight = 25;
      else if (eraId === "EARLY_MODERN") weight = 5;
      else weight = 0;
    } else if (fragmentCount < 5) {
      weight = Math.max(1, 20 - i * 4);
    } else if (fragmentCount < 10) {
      const midPoint = Math.floor(ERA_ORDER.length / 2);
      const distanceFromMid = Math.abs(i - midPoint);
      weight = Math.max(1, 10 - distanceFromMid * 2);
    } else {
      weight = 10;
    }
    if (weight > 0) {
      weights.push({ eraId, weight });
    }
  }
  return weights;
}
function rollDice(sides = 6, count = 1) {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
}
function pickRandom(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}
function shuffleArray(arr) {
  const result = arr ? arr.slice() : [];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return result;
}
function getLifePhase(age) {
  for (const [name, range] of Object.entries(LIFE_PHASES)) {
    if (age >= range.min && age <= range.max) return name;
  }
  return "ANCIENT";
}
function getPhaseColor(phase) {
  return PHASE_COLORS[phase] || "#ffffff";
}
function getPhaseRange(phase) {
  return LIFE_PHASES[phase] || { min: 0, max: Infinity };
}
function isPhaseEnd(age, phase) {
  const range = LIFE_PHASES[phase];
  if (!range) return false;
  if (phase === "ANCIENT") return false;
  return age >= range.max;
}
function getMortalityRate(age) {
  const bucket = MORTALITY_CURVE.find((b) => age >= b.minAge && age <= b.maxAge);
  return bucket ? bucket.rate : 80;
}
function init2() {
  state2.soul = createSoulState();
  state2.speed = 1;
  state2.riskAppetite = "MODERATE";
  state2.isRunning = false;
  state2.isPaused = false;
}
function update() {
  if (!state2.isRunning || state2.isPaused) return;
  gameTick();
}
var ERA_ORDER, ERA_DATA, LIFE_PHASES, PHASE_COLORS, RISK_LEVELS, MORTALITY_CURVE, CHAIN_COLORS, FRAGMENT_TYPE_ICONS, CRITICAL_INTENSITY, DEFAULT_CHOICE_TIMEOUT, SPEED_MAP, ERAS, EVENT_POOLS, DEATH_EVENTS, CRISIS_CHOICES, state2;
var init_game = __esm({
  "js/game.js"() {
    ERA_ORDER = [
      "ANCIENT",
      "MEDIEVAL",
      "EARLY_MODERN",
      "INDUSTRIAL",
      "MODERN",
      "NEAR_FUTURE",
      "FAR_FUTURE"
    ];
    ERA_DATA = {
      ANCIENT: {
        id: "ANCIENT",
        label: "Ancient",
        yearRange: [-3e3, 499],
        eventSignature: "The gods are real here, and they are cruel.",
        locationPool: [{ region: "Mesopotamia", city: "Uruk", country: "Sumer", weight: 12 }, { region: "Nile Valley", city: "Memphis", country: "Egypt", weight: 14 }, { region: "Aegean", city: "Athens", country: "Greece", weight: 13 }, { region: "Italian Peninsula", city: "Rome", country: "Roman Republic/Empire", weight: 15 }, { region: "Persian Plateau", city: "Persepolis", country: "Achaemenid Persia", weight: 9 }],
        firstNamePool: { male: [{ name: "Gilgamesh", weight: 3 }, { name: "Ramses", weight: 4 }, { name: "Alexander", weight: 4 }, { name: "Julius", weight: 4 }, { name: "Marcus", weight: 3 }, { name: "Constantine", weight: 3 }, { name: "Ashoka", weight: 3 }, { name: "Attila", weight: 3 }], female: [{ name: "Nefertiti", weight: 4 }, { name: "Cleopatra", weight: 4 }, { name: "Hatshepsut", weight: 3 }, { name: "Helen", weight: 3 }, { name: "Sappho", weight: 3 }, { name: "Zenobia", weight: 2 }, { name: "Boudicca", weight: 3 }] },
        lastNamePool: [{ name: "of Rome", weight: 5 }, { name: "of Athens", weight: 4 }, { name: "of Babylon", weight: 3 }, { name: "the Great", weight: 2 }, { name: "", weight: 10 }],
        bodyConditions: [{ condition: "robust", weight: 15 }, { condition: "healthy", weight: 55 }, { condition: "sickly", weight: 20 }, { condition: "disabled", weight: 10 }],
        socialClasses: [{ cls: "slave", weight: 25 }, { cls: "peasant", weight: 35 }, { cls: "artisan", weight: 12 }, { cls: "merchant", weight: 10 }, { cls: "soldier", weight: 8 }, { cls: "noble", weight: 4 }, { cls: "ruler", weight: 1 }]
      },
      MEDIEVAL: {
        id: "MEDIEVAL",
        label: "Medieval",
        yearRange: [500, 1499],
        eventSignature: "The plague is always somewhere. Faith is the only shield.",
        locationPool: [{ region: "British Isles", city: "London", country: "England", weight: 12 }, { region: "Frankish Lands", city: "Paris", country: "France", weight: 13 }, { region: "Italian Peninsula", city: "Venice", country: "Venetian Republic", weight: 11 }, { region: "Byzantine", city: "Constantinople", country: "Byzantine Empire", weight: 12 }, { region: "Middle East", city: "Baghdad", country: "Abbasid Caliphate", weight: 10 }, { region: "East Asia", city: "Chang'an", country: "Tang China", weight: 10 }],
        firstNamePool: { male: [{ name: "William", weight: 5 }, { name: "Henry", weight: 5 }, { name: "John", weight: 5 }, { name: "Robert", weight: 5 }, { name: "Louis", weight: 4 }, { name: "Charles", weight: 4 }, { name: "Saladin", weight: 3 }, { name: "Ali", weight: 3 }], female: [{ name: "Eleanor", weight: 4 }, { name: "Isabella", weight: 4 }, { name: "Margaret", weight: 4 }, { name: "Mary", weight: 5 }, { name: "Fatima", weight: 3 }, { name: "Mariam", weight: 3 }] },
        lastNamePool: [{ name: "of York", weight: 3 }, { name: "of Normandy", weight: 3 }, { name: "Smith", weight: 4 }, { name: "Taylor", weight: 3 }, { name: "", weight: 10 }],
        bodyConditions: [{ condition: "robust", weight: 12 }, { condition: "healthy", weight: 50 }, { condition: "sickly", weight: 25 }, { condition: "disabled", weight: 13 }],
        socialClasses: [{ cls: "serf", weight: 35 }, { cls: "peasant", weight: 20 }, { cls: "artisan", weight: 12 }, { cls: "merchant", weight: 10 }, { cls: "knight", weight: 7 }, { cls: "clergy", weight: 8 }, { cls: "noble", weight: 3 }]
      },
      EARLY_MODERN: {
        id: "EARLY_MODERN",
        label: "Early Modern",
        yearRange: [1500, 1849],
        eventSignature: "The world is being mapped. Old gods die, new machines are born.",
        locationPool: [{ region: "British Isles", city: "London", country: "England/Britain", weight: 14 }, { region: "Frankish Lands", city: "Paris", country: "France", weight: 13 }, { region: "Ottoman", city: "Istanbul", country: "Ottoman Empire", weight: 12 }, { region: "Low Countries", city: "Amsterdam", country: "Dutch Republic", weight: 10 }, { region: "East Asia", city: "Beijing", country: "Ming/Qing China", weight: 10 }, { region: "East Asia", city: "Edo", country: "Tokugawa Japan", weight: 9 }],
        firstNamePool: { male: [{ name: "William", weight: 5 }, { name: "John", weight: 5 }, { name: "George", weight: 4 }, { name: "Charles", weight: 4 }, { name: "Louis", weight: 3 }, { name: "Napoleon", weight: 3 }, { name: "Peter", weight: 3 }], female: [{ name: "Elizabeth", weight: 5 }, { name: "Mary", weight: 4 }, { name: "Catherine", weight: 4 }, { name: "Maria", weight: 4 }, { name: "Marie", weight: 4 }, { name: "Charlotte", weight: 3 }] },
        lastNamePool: [{ name: "Smith", weight: 4 }, { name: "Johnson", weight: 3 }, { name: "M\xC3\xBCller", weight: 3 }, { name: "Schmidt", weight: 3 }, { name: "Rossi", weight: 2 }, { name: "", weight: 5 }],
        bodyConditions: [{ condition: "robust", weight: 14 }, { condition: "healthy", weight: 53 }, { condition: "sickly", weight: 22 }, { condition: "disabled", weight: 11 }],
        socialClasses: [{ cls: "peasant", weight: 25 }, { cls: "laborer", weight: 18 }, { cls: "artisan", weight: 14 }, { cls: "merchant", weight: 13 }, { cls: "soldier", weight: 8 }, { cls: "aristocrat", weight: 5 }]
      },
      INDUSTRIAL: {
        id: "INDUSTRIAL",
        label: "Industrial",
        yearRange: [1850, 1949],
        eventSignature: "Smoke fills the sky. The machines are hungry and so is war.",
        locationPool: [{ region: "British Isles", city: "Manchester", country: "England", weight: 14 }, { region: "American Northeast", city: "New York", country: "United States", weight: 13 }, { region: "German Lands", city: "Berlin", country: "German Empire", weight: 12 }, { region: "French Republic", city: "Paris", country: "France", weight: 11 }, { region: "Russian Empire", city: "Moscow", country: "Russian Empire", weight: 10 }, { region: "Japan", city: "Tokyo", country: "Meiji Japan", weight: 8 }],
        firstNamePool: { male: [{ name: "John", weight: 6 }, { name: "William", weight: 5 }, { name: "Charles", weight: 4 }, { name: "George", weight: 4 }, { name: "James", weight: 4 }, { name: "Karl", weight: 3 }, { name: "Friedrich", weight: 3 }], female: [{ name: "Mary", weight: 5 }, { name: "Elizabeth", weight: 4 }, { name: "Anna", weight: 4 }, { name: "Margaret", weight: 4 }, { name: "Emma", weight: 4 }, { name: "Marie", weight: 3 }] },
        lastNamePool: [{ name: "Smith", weight: 5 }, { name: "M\xC3\xBCller", weight: 4 }, { name: "Dubois", weight: 3 }, { name: "Ivanov", weight: 3 }, { name: "Tanaka", weight: 3 }, { name: "", weight: 5 }],
        bodyConditions: [{ condition: "robust", weight: 18 }, { condition: "healthy", weight: 55 }, { condition: "sickly", weight: 20 }, { condition: "disabled", weight: 7 }],
        socialClasses: [{ cls: "factory worker", weight: 25 }, { cls: "laborer", weight: 18 }, { cls: "clerk", weight: 14 }, { cls: "artisan", weight: 12 }, { cls: "merchant", weight: 10 }, { cls: "industrialist", weight: 3 }, { cls: "aristocrat", weight: 3 }]
      },
      MODERN: {
        id: "MODERN",
        label: "Modern",
        yearRange: [1950, 2019],
        eventSignature: "You live longer. You die alone. The screens watch you back.",
        locationPool: [{ region: "American Northeast", city: "New York", country: "United States", weight: 12 }, { region: "Western Europe", city: "London", country: "United Kingdom", weight: 11 }, { region: "East Asia", city: "Tokyo", country: "Japan", weight: 10 }, { region: "South Asia", city: "Mumbai", country: "India", weight: 9 }, { region: "Latin America", city: "Mexico City", country: "Mexico", weight: 9 }, { region: "Middle East", city: "Istanbul", country: "Turkey", weight: 8 }],
        firstNamePool: { male: [{ name: "James", weight: 5 }, { name: "John", weight: 5 }, { name: "Robert", weight: 4 }, { name: "Michael", weight: 5 }, { name: "David", weight: 4 }, { name: "William", weight: 4 }, { name: "Raj", weight: 3 }, { name: "Wei", weight: 3 }], female: [{ name: "Mary", weight: 4 }, { name: "Jennifer", weight: 4 }, { name: "Linda", weight: 4 }, { name: "Patricia", weight: 3 }, { name: "Elizabeth", weight: 4 }, { name: "Priya", weight: 3 }, { name: "Mei", weight: 3 }] },
        lastNamePool: [{ name: "Smith", weight: 4 }, { name: "Johnson", weight: 3 }, { name: "Williams", weight: 3 }, { name: "Brown", weight: 3 }, { name: "Singh", weight: 3 }, { name: "Wang", weight: 3 }, { name: "", weight: 6 }],
        bodyConditions: [{ condition: "robust", weight: 15 }, { condition: "healthy", weight: 55 }, { condition: "sickly", weight: 22 }, { condition: "disabled", weight: 8 }],
        socialClasses: [{ cls: "working class", weight: 22 }, { cls: "clerk", weight: 20 }, { cls: "professional", weight: 18 }, { cls: "service worker", weight: 15 }, { cls: "executive", weight: 8 }, { cls: "wealthy", weight: 5 }]
      },
      NEAR_FUTURE: {
        id: "NEAR_FUTURE",
        label: "Near Future",
        yearRange: [2020, 2069],
        eventSignature: "The climate is shifting. The algorithms decide. You adapt or break.",
        locationPool: [{ region: "American Southwest", city: "Phoenix", country: "United States", weight: 10 }, { region: "East Asia", city: "Seoul", country: "South Korea", weight: 10 }, { region: "South Asia", city: "Bangalore", country: "India", weight: 10 }, { region: "Western Europe", city: "Amsterdam", country: "Netherlands", weight: 9 }, { region: "East Africa", city: "Nairobi", country: "Kenya", weight: 8 }, { region: "East Asia", city: "Shanghai", country: "China", weight: 10 }],
        firstNamePool: { male: [{ name: "Kai", weight: 4 }, { name: "Marcus", weight: 3 }, { name: "Raj", weight: 4 }, { name: "Dmitri", weight: 3 }, { name: "Sven", weight: 3 }, { name: "Yusuf", weight: 3 }], female: [{ name: "Aisha", weight: 4 }, { name: "Lin", weight: 4 }, { name: "Zara", weight: 3 }, { name: "Emma", weight: 3 }, { name: "Yuki", weight: 3 }, { name: "Fatima", weight: 3 }] },
        lastNamePool: [{ name: "", weight: 5 }, { name: "Chen", weight: 4 }, { name: "Okonkwo", weight: 3 }, { name: "M\xC3\xBCller", weight: 3 }, { name: "Singh", weight: 3 }, { name: "Yamamoto", weight: 3 }],
        bodyConditions: [{ condition: "robust", weight: 12 }, { condition: "healthy", weight: 50 }, { condition: "sickly", weight: 28 }, { condition: "disabled", weight: 10 }],
        socialClasses: [{ cls: "gig worker", weight: 20 }, { cls: "service worker", weight: 18 }, { cls: "clerk", weight: 15 }, { cls: "technician", weight: 14 }, { cls: "engineer", weight: 10 }, { cls: "executive", weight: 5 }]
      },
      FAR_FUTURE: {
        id: "FAR_FUTURE",
        label: "Far Future",
        yearRange: [2070, 2200],
        eventSignature: "Death is optional now. But meaning is not.",
        locationPool: [{ region: "Orbital", city: "Haven-1", country: "Luna Colony", weight: 12 }, { region: "North America", city: "Atlantis City", country: "Atlantic Federation", weight: 11 }, { region: "East Asia", city: "Neo Tokyo", country: "Eastern Coalition", weight: 10 }, { region: "Mars", city: "Olympus", country: "Mars Republic", weight: 10 }, { region: "Europe", city: "New Paris", country: "Atlantic Federation", weight: 9 }, { region: "Space", city: "Station Kronos", country: "Deep Space Authority", weight: 7 }],
        firstNamePool: { male: [{ name: "Kai", weight: 5 }, { name: "Zephyr", weight: 4 }, { name: "Nova", weight: 4 }, { name: "Orion", weight: 4 }, { name: "Atlas", weight: 3 }, { name: "Luna", weight: 3 }], female: [{ name: "Aria", weight: 5 }, { name: "Stella", weight: 4 }, { name: "Nova", weight: 4 }, { name: "Luna", weight: 4 }, { name: "Athena", weight: 3 }, { name: "Vega", weight: 3 }] },
        lastNamePool: [{ name: "", weight: 6 }, { name: "of the Void", weight: 3 }, { name: "of the Belt", weight: 3 }, { name: "Chen", weight: 4 }, { name: "Okonkwo", weight: 3 }, { name: "M\xC3\xBCller", weight: 3 }],
        bodyConditions: [{ condition: "enhanced", weight: 20 }, { condition: "robust", weight: 25 }, { condition: "healthy", weight: 45 }, { condition: "sickly", weight: 10 }],
        socialClasses: [{ cls: "colonist", weight: 18 }, { cls: "crew", weight: 15 }, { cls: "engineer", weight: 14 }, { cls: "scientist", weight: 12 }, { cls: "administrator", weight: 8 }, { cls: "director", weight: 5 }]
      }
    };
    LIFE_PHASES = {
      INFANT: { min: 0, max: 3 },
      CHILD: { min: 4, max: 12 },
      ADOLESCENT: { min: 13, max: 19 },
      YOUNG_ADULT: { min: 20, max: 39 },
      MIDDLE_AGE: { min: 40, max: 64 },
      SENIOR: { min: 65, max: 84 },
      ANCIENT: { min: 85, max: Infinity }
    };
    PHASE_COLORS = {
      INFANT: "#a8d5ff",
      CHILD: "#7ec8a4",
      ADOLESCENT: "#f4a261",
      YOUNG_ADULT: "#e76f51",
      MIDDLE_AGE: "#c77dff",
      SENIOR: "#8ecae6",
      ANCIENT: "#ffd166"
    };
    RISK_LEVELS = {
      MINIMAL: { label: "Minimal", multiplier: 0.2 },
      LOW: { label: "Low", multiplier: 0.5 },
      MODERATE: { label: "Moderate", multiplier: 1 },
      HIGH: { label: "High", multiplier: 1.8 },
      EXTREME: { label: "Extreme", multiplier: 3 }
    };
    MORTALITY_CURVE = [
      { minAge: 0, maxAge: 0, rate: 5.6 },
      { minAge: 1, maxAge: 4, rate: 0.25 },
      { minAge: 5, maxAge: 14, rate: 0.11 },
      { minAge: 15, maxAge: 24, rate: 0.4 },
      { minAge: 25, maxAge: 34, rate: 0.5 },
      { minAge: 35, maxAge: 44, rate: 1 },
      { minAge: 45, maxAge: 54, rate: 2 },
      { minAge: 55, maxAge: 64, rate: 4 },
      { minAge: 65, maxAge: 74, rate: 9 },
      { minAge: 75, maxAge: 84, rate: 20 },
      { minAge: 85, maxAge: 94, rate: 45 },
      { minAge: 95, maxAge: Infinity, rate: 80 }
    ];
    CHAIN_COLORS = {
      GRIEF: "#ff4466",
      LOVE: "#ff66aa",
      DREAD: "#9944ff",
      WONDER: "#44aaff",
      RAGE: "#ff6600",
      GRACE: "#aaaaaa"
    };
    FRAGMENT_TYPE_ICONS = {
      tone: "\xE2\u2122\xAA",
      fear: "\xE2\u0161\xA0",
      love: "\xE2\u2122\xA5",
      location: "\xE2\u2014\u017D",
      name: "\xE2\u2014\u02C6",
      object: "\xE2\u2014\u2020"
    };
    CRITICAL_INTENSITY = 0.7;
    DEFAULT_CHOICE_TIMEOUT = 4e3;
    SPEED_MAP = { slow: 1e3, normal: 400, fast: 100 };
    ERAS = ERA_DATA;
    EVENT_POOLS = {
      PREHISTORIC: [
        { id: "ph_01", triggerProbability: 0.12, phases: ["CHILD", "ADOLESCENT", "YOUNG_ADULT"], eras: ["PREHISTORIC"], category: "violence", weight: 3, title: "The predator at the tree line", description: "Something watches from beyond the firelight. You keep the embers fed and don't sleep.", cascadeTags: ["dread", "anchor"] },
        { id: "ph_03", triggerProbability: 0.08, phases: ["INFANT", "CHILD"], eras: ["PREHISTORIC"], category: "body", weight: 4, title: "Fever takes the little ones", description: "The heat comes and doesn't leave. Someone presses wet bark to your forehead and sings.", cascadeTags: ["grief", "numbness"] },
        { id: "ph_04", triggerProbability: 0.06, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["PREHISTORIC"], category: "mystery", weight: 2, title: "The cave paintings", description: "Deep in the rock someone has drawn animals that don't exist anymore. You touch the ochre and feel something shift.", cascadeTags: ["wonder", "awe"] },
        { id: "ph_05", triggerProbability: 0.07, phases: ["YOUNG_ADULT", "MIDDLE_AGE", "SENIOR"], eras: ["PREHISTORIC"], category: "relationship", weight: 3, title: "A bond forged in the hunt", description: "You and another move together without speaking. After, you share the meat and don't look away.", cascadeTags: ["connection", "tenderness"] },
        { id: "ph_07", triggerProbability: 0.09, phases: ["MIDDLE_AGE", "SENIOR", "ANCIENT"], eras: ["PREHISTORIC"], category: "circumstance", weight: 3, title: "The elders' fire", description: "You sit with the ones who remember the last cold season. They speak in fragments. You try to hold it all.", cascadeTags: ["anchor", "resignation"] },
        { id: "ph_15", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["PREHISTORIC"], category: "relationship", weight: 3, title: "The chosen one", description: "They look at you across the fire and you know. Not words \xE2 \u201D something older. You move closer.", cascadeTags: ["connection", "awakening"] }
      ],
      ANCIENT: [
        { id: "an_01", triggerProbability: 0.12, phases: ["CHILD", "ADOLESCENT"], eras: ["ANCIENT"], category: "body", weight: 4, title: "The childhood illness", description: "It moves through the house like a tide. You are small and the tide doesn't stop.", cascadeTags: ["grief", "numbness"] },
        { id: "an_02", triggerProbability: 0.1, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["ANCIENT"], category: "violence", weight: 4, title: "The battlefield call", description: "They line up across the field. You are holding a spear and the sky is the same color as the blood.", cascadeTags: ["rage", "vertigo"] },
        { id: "an_03", triggerProbability: 0.08, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["ANCIENT"], category: "relationship", weight: 4, title: "First love in the olive grove", description: "The olives fall. Someone's hand finds yours. You learn that joy has a specific weight.", cascadeTags: ["love", "awakening"] },
        { id: "an_04", triggerProbability: 0.09, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["ANCIENT"], category: "faith", weight: 3, title: "The temple at dusk", description: "The priests speak of gods who demand sacrifice. You wonder which god would sacrifice you.", cascadeTags: ["dread", "wonder"] },
        { id: "an_05", triggerProbability: 0.07, phases: ["CHILD", "ADOLESCENT"], eras: ["ANCIENT"], category: "relationship", weight: 3, title: "The older sibling", description: "They carry you on their back when you cannot walk. They show you which berries will kill you. They leave.", cascadeTags: ["grief", "anchor"] },
        { id: "an_06", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["ANCIENT"], category: "circumstance", weight: 3, title: "The drought", description: "The river drops. The animals leave. Someone proposes a thing that will define you.", cascadeTags: ["desperation", "choice"] },
        { id: "an_07", triggerProbability: 0.06, phases: ["MIDDLE_AGE", "SENIOR"], eras: ["ANCIENT"], category: "body", weight: 2, title: "The body remembers", description: "You feel it in the joints first. The body knows things the mind tries to forget.", cascadeTags: ["resignation", "grace"] }
      ],
      MEDIEVAL: [
        { id: "med_01", triggerProbability: 0.12, phases: ["CHILD", "ADOLESCENT"], eras: ["MEDIEVAL"], category: "body", weight: 4, title: "The Black Death comes", description: "They ring the church bells for the ones who die in the night. You stop counting.", cascadeTags: ["grief", "numbness"] },
        { id: "med_02", triggerProbability: 0.1, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["MEDIEVAL"], category: "faith", weight: 4, title: "The monastery door closes", description: "You take vows. The silence settles into your bones like winter.", cascadeTags: ["resignation", "grace"] },
        { id: "med_03", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MEDIEVAL"], category: "relationship", weight: 3, title: "The tournament", description: "You ride in armor painted with your family's colors. Someone watches from the stands.", cascadeTags: ["pride", "connection"] },
        { id: "med_04", triggerProbability: 0.09, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["MEDIEVAL"], category: "violence", weight: 4, title: "The siege", description: "The walls have held for months. The grain is gone. The engineers are adjusting their calculations.", cascadeTags: ["dread", "desperation"] },
        { id: "med_05", triggerProbability: 0.07, phases: ["CHILD", "ADOLESCENT"], eras: ["MEDIEVAL"], category: "circumstance", weight: 3, title: "The village burns", description: "You run. You don't look back. Later you will not remember the faces.", cascadeTags: ["grief", "anchor"] },
        { id: "med_06", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MEDIEVAL"], category: "relationship", weight: 3, title: "The guild apprentice", description: "You learn the craft from someone whose hands know more than words. They become the measure of all things.", cascadeTags: ["connection", "identity"] }
      ],
      EARLY_MODERN: [
        { id: "em_01", triggerProbability: 0.1, phases: ["CHILD", "ADOLESCENT"], eras: ["EARLY_MODERN"], category: "circumstance", weight: 3, title: "The printing press", description: "You learn to set type. Each letter is a small revolution.", cascadeTags: ["wonder", "discovery"] },
        { id: "em_02", triggerProbability: 0.09, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["EARLY_MODERN"], category: "faith", weight: 4, title: "The reformation", description: "The old certainties crack. You must choose which wall to stand behind.", cascadeTags: ["dread", "choice"] },
        { id: "em_03", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["EARLY_MODERN"], category: "relationship", weight: 3, title: "The salon", description: "Someone has gathered people who think. You are one of them. This feels like the future.", cascadeTags: ["connection", "wonder"] },
        { id: "em_04", triggerProbability: 0.1, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["EARLY_MODERN"], category: "violence", weight: 4, title: "The witch trial", description: "They point. You see the accusation is about power, not truth. You stay silent or speak.", cascadeTags: ["dread", "rage"] },
        { id: "em_05", triggerProbability: 0.07, phases: ["CHILD"], eras: ["EARLY_MODERN"], category: "body", weight: 3, title: "The smallpox scar", description: "You survive the fever. The marks become part of you. You learn to look at faces differently.", cascadeTags: ["resignation", "identity"] }
      ],
      INDUSTRIAL: [
        { id: "ind_01", triggerProbability: 0.12, phases: ["CHILD", "ADOLESCENT"], eras: ["INDUSTRIAL"], category: "circumstance", weight: 4, title: "The factory floor", description: "Your hands learn the rhythm of the machine. The noise becomes a language.", cascadeTags: ["desperation", "identity"] },
        { id: "ind_02", triggerProbability: 0.09, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["INDUSTRIAL"], category: "relationship", weight: 3, title: "The labor organizer", description: "You stand in a hall with others who have nothing but each other. Someone is always watching.", cascadeTags: ["rage", "connection"] },
        { id: "ind_03", triggerProbability: 0.1, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["INDUSTRIAL"], category: "faith", weight: 4, title: "The socialist meeting", description: "Someone speaks about a world without classes. You feel something you cannot name.", cascadeTags: ["wonder", "awakening"] },
        { id: "ind_04", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["INDUSTRIAL"], category: "body", weight: 3, title: "The mine collapse", description: "The dark is absolute. You press your hand against the earth and bargain with anything that will listen.", cascadeTags: ["dread", "desperation"] },
        { id: "ind_05", triggerProbability: 0.07, phases: ["SENIOR", "ANCIENT"], eras: ["INDUSTRIAL"], category: "circumstance", weight: 2, title: "The old machine", description: "You watch the new generation work the machine you built. Something in you aches.", cascadeTags: ["resignation", "grace"] }
      ],
      MODERN: [
        { id: "mod_01", triggerProbability: 0.1, phases: ["CHILD", "ADOLESCENT"], eras: ["MODERN"], category: "relationship", weight: 4, title: "The television family", description: "You grow up inside a box that tells you who to be. You find the edges of the box.", cascadeTags: ["identity", "wonder"] },
        { id: "mod_02", triggerProbability: 0.09, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["MODERN"], category: "faith", weight: 3, title: "The cult or the cause", description: "They ask for everything. You give it. Something breaks or something opens.", cascadeTags: ["dread", "choice"] },
        { id: "mod_03", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MODERN"], category: "relationship", weight: 3, title: "The divorce papers", description: "You sign. The house becomes a ghost story you both agree not to tell.", cascadeTags: ["grief", "resignation"] },
        { id: "mod_04", triggerProbability: 0.1, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["MODERN"], category: "circumstance", weight: 4, title: "The hospital corridor", description: "Someone lies behind a door that keeps you out. You wait. You learn what time actually is.", cascadeTags: ["grief", "grace"] },
        { id: "mod_05", triggerProbability: 0.07, phases: ["CHILD", "ADOLESCENT"], eras: ["MODERN"], category: "body", weight: 3, title: "The cancer diagnosis", description: "You learn your body is a sentence with a period at the end. The period moves closer.", cascadeTags: ["dread", "acceptance"] },
        { id: "mod_06", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MODERN"], category: "relationship", weight: 3, title: "The friend who overdoses", description: "They leave a shape on the floor that used to be a person you knew. You go to the funeral.", cascadeTags: ["grief", "numbness"] }
      ],
      NEAR_FUTURE: [
        { id: "nf_01", triggerProbability: 0.1, phases: ["CHILD", "ADOLESCENT"], eras: ["NEAR_FUTURE"], category: "circumstance", weight: 4, title: "The climate refugee camp", description: "The water is wrong and the sky is the wrong color. You wait for something to change.", cascadeTags: ["dread", "desperation"] },
        { id: "nf_02", triggerProbability: 0.09, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["NEAR_FUTURE"], category: "technology", weight: 4, title: "The neural interface", description: "You go online without a screen. The information is beautiful and you cannot stop.", cascadeTags: ["wonder", "addiction"] },
        { id: "nf_03", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["NEAR_FUTURE"], category: "relationship", weight: 3, title: "The algorithm match", description: "Someone is selected for you. The algorithm is 73% confident. The first date is awkward.", cascadeTags: ["connection", "disorientation"] },
        { id: "nf_04", triggerProbability: 0.1, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["NEAR_FUTURE"], category: "body", weight: 4, title: "The gene therapy", description: "You opt in. The cells in your body learn a new language. You feel the change before you understand it.", cascadeTags: ["wonder", "identity"] }
      ],
      FAR_FUTURE: [
        { id: "ff_01", triggerProbability: 0.09, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["FAR_FUTURE"], category: "technology", weight: 4, title: "The memory transfer", description: "You wake up in a new body with someone else's memories. You learn to tell the difference.", cascadeTags: ["identity", "wonder"] },
        { id: "ff_02", triggerProbability: 0.08, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["FAR_FUTURE"], category: "relationship", weight: 3, title: "The clone sibling", description: "Someone on the station has your exact genome. You meet them. They are not you.", cascadeTags: ["connection", "identity"] },
        { id: "ff_03", triggerProbability: 0.1, phases: ["MIDDLE_AGE", "SENIOR"], eras: ["FAR_FUTURE"], category: "circumstance", weight: 4, title: "The cryo-revival", description: "You wake from the ice. Everything you knew is in a museum. You must begin again.", cascadeTags: ["disorientation", "grace"] },
        { id: "ff_04", triggerProbability: 0.07, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["FAR_FUTURE"], category: "faith", weight: 3, title: "The void prayer", description: "You step into the airlock and look at the stars. You are very small. You are still here.", cascadeTags: ["wonder", "resignation"] }
      ]
    };
    DEATH_EVENTS = [
      { id: "death_ph_01", phases: ["INFANT", "CHILD"], eras: ["PREHISTORIC"], category: "body", title: "The fever takes you", description: "The heat builds and doesn't break. Someone presses cool stones to your chest. The stones warm up. You don't.", cascadeTags: ["grief", "numbness"] },
      { id: "death_ph_02", phases: ["CHILD", "ADOLESCENT", "YOUNG_ADULT", "MIDDLE_AGE"], eras: ["PREHISTORIC"], category: "violence", title: "The predator wins", description: "You were fast but it was faster. The last thing you see is the sky through the canopy.", cascadeTags: ["dread", "vertigo"] },
      { id: "death_ph_03", phases: ["SENIOR", "ANCIENT"], eras: ["PREHISTORIC"], category: "body", title: "The body gives out", description: "You sit down by the fire and don't get up. The band moves on. The fire goes out.", cascadeTags: ["resignation", "grace"] },
      { id: "death_an_01", phases: ["INFANT", "CHILD"], eras: ["ANCIENT"], category: "body", title: "The childhood illness", description: "It moves through the house like a tide. You are small and the tide doesn't stop.", cascadeTags: ["grief", "numbness"] },
      { id: "death_an_02", phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["ANCIENT"], category: "violence", title: "The battlefield", description: "The line breaks and you're in the crush. You don't see who strikes you. The dust settles on your face.", cascadeTags: ["rage", "vertigo"] },
      { id: "death_an_03", phases: ["SENIOR", "ANCIENT"], eras: ["ANCIENT"], category: "body", title: "The long fade", description: "You feel the thread thin. You have enough time to let go of each thing. One by one.", cascadeTags: ["resignation", "grace"] },
      { id: "death_med_01", phases: ["INFANT", "CHILD"], eras: ["MEDIEVAL"], category: "body", title: "The plague takes you", description: "The swellings appear. The prayers fail. You become one more name in a long list.", cascadeTags: ["grief", "numbness"] },
      { id: "death_med_02", phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MEDIEVAL"], category: "violence", title: "The war claims you", description: "The army moves through you. You become part of the number that will be counted later.", cascadeTags: ["rage", "vertigo"] },
      { id: "death_med_03", phases: ["SENIOR", "ANCIENT"], eras: ["MEDIEVAL"], category: "body", title: "The monastery death", description: "You have outlived most things. The only sound left is the wind through the stone.", cascadeTags: ["resignation", "grace"] },
      { id: "death_em_01", phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["EARLY_MODERN"], category: "body", title: "The wasting illness", description: "You fade like a letter in rain. The doctor comes weekly. Then not at all.", cascadeTags: ["grief", "resignation"] },
      { id: "death_em_02", phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["EARLY_MODERN"], category: "violence", title: "The duel", description: "You stand in a field before dawn. Your second is afraid. You are calm.", cascadeTags: ["rage", "vertigo"] },
      { id: "death_em_03", phases: ["SENIOR", "ANCIENT"], eras: ["EARLY_MODERN"], category: "faith", title: "The priest's peace", description: "You ask for absolution. The priest grants it. You feel the weight lift.", cascadeTags: ["resignation", "grace"] },
      { id: "death_ind_01", phases: ["CHILD", "ADOLESCENT"], eras: ["INDUSTRIAL"], category: "body", title: "The factory accident", description: "The machine does not stop. You are part of the machine now.", cascadeTags: ["grief", "numbness"] },
      { id: "death_ind_02", phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["INDUSTRIAL"], category: "violence", title: "The war ends you", description: "You survive the trenches only to fall in the last hour of the last day.", cascadeTags: ["rage", "vertigo"] },
      { id: "death_ind_03", phases: ["SENIOR", "ANCIENT"], eras: ["INDUSTRIAL"], category: "circumstance", title: "The pension's end", description: "You outlive the system that was meant to carry you. You adapt or you fall.", cascadeTags: ["resignation", "grace"] },
      { id: "death_mod_01", phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MODERN"], category: "body", title: "The diagnosis", description: "They give you a number of years. You spend them learning what matters.", cascadeTags: ["resignation", "grace"] },
      { id: "death_mod_02", phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["MODERN"], category: "violence", title: "The accident", description: "The world is moving too fast and then it stops and you are outside it.", cascadeTags: ["dread", "vertigo"] },
      { id: "death_mod_03", phases: ["SENIOR", "ANCIENT"], eras: ["MODERN"], category: "relationship", title: "The last visit", description: "You are alone in a room that smells like nothing. Someone calls. You are loved.", cascadeTags: ["resignation", "grace"] },
      { id: "death_nf_01", phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["NEAR_FUTURE"], category: "technology", title: "The system failure", description: "The AI makes a call about your body. It does not ask permission.", cascadeTags: ["dread", "numbness"] },
      { id: "death_nf_02", phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["NEAR_FUTURE"], category: "body", title: "The climate event", description: "The storm is bigger than the models predicted. You are in the part that was not modeled.", cascadeTags: ["dread", "vertigo"] },
      { id: "death_ff_01", phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["FAR_FUTURE"], category: "body", title: "The consciousness transfer fails", description: "The upload never completes. You are aware of the gap where you should continue.", cascadeTags: ["dread", "numbness"] },
      { id: "death_ff_02", phases: ["SENIOR", "ANCIENT"], eras: ["FAR_FUTURE"], category: "circumstance", title: "The transit accident", description: "The pod misses its target. You become a number in a very long list of lost things.", cascadeTags: ["dread", "vertigo"] },
      { id: "death_ff_03", phases: ["YOUNG_ADULT", "MIDDLE_AGE", "SENIOR", "ANCIENT"], eras: ["FAR_FUTURE"], category: "faith", title: "The voluntary exit", description: "You choose to end. The door opens onto the stars. You have been paying attention.", cascadeTags: ["grace", "acceptance"] }
    ];
    CRISIS_CHOICES = {
      intervene: {
        key: "A",
        label: "Intervene",
        subtitle: "You act directly and accept the consequences.",
        riskDescriptions: ["Success possible", "May accelerate outcome", "High energy cost"],
        outcomes: {
          success: { probability: 0.45, cascadeTags: ["bravery", "recovery"], emotionalShift: 0.15, description: "Your action shifts the outcome. You feel capable." },
          failure: { probability: 0.55, cascadeTags: ["injury", "loss"], emotionalShift: -0.2, deathChance: 0.15, description: "The intervention fails and you are caught in the consequences." }
        },
        cascadeBias: ["courage", "action"]
      },
      pray: {
        key: "B",
        label: "Pray",
        subtitle: "You submit to a higher power and hope.",
        riskDescriptions: ["Passively accept", "May invite intervention", "Low personal cost"],
        outcomes: {
          success: { probability: 0.35, cascadeTags: ["faith", "serenity"], emotionalShift: 0.1, description: "Something answers. Or you find the strength within." },
          failure: { probability: 0.65, cascadeTags: ["abandonment", "doubt"], emotionalShift: -0.1, description: "The silence is louder than before." }
        },
        cascadeBias: ["faith", "resignation"]
      },
      watch: {
        key: "C",
        label: "Watch",
        subtitle: "You observe without acting. The crisis passes or it doesn't.",
        riskDescriptions: ["No intervention", "May resolve on its own", "Minimal engagement"],
        outcomes: {
          success: { probability: 0.55, cascadeTags: ["acceptance", "stillness"], emotionalShift: 0.05, description: "The crisis passes and you learn something about letting go." },
          failure: { probability: 0.45, cascadeTags: ["regret", "passivity"], emotionalShift: -0.05, description: "You wonder if you should have done something. The wondering stays." }
        },
        cascadeBias: ["stillness", "observation"]
      }
    };
    state2 = {
      soul: null,
      life: null,
      currentPhase: "INFANT",
      age: 0,
      year: 0,
      era: "ANCIENT",
      ticksThisLife: 0,
      isRunning: false,
      isPaused: false,
      speed: 1,
      riskAppetite: "MODERATE",
      events: [],
      pendingDecisions: null,
      narrationEnabled: true
    };
  }
});

// js/audio.js
var init_audio = __esm({
  "js/audio.js"() {
  }
});

// js/events.js
function eventTick(lifeState, soulFragments, cascadeTags = []) {
  const age = lifeState.age;
  const mortalityRate = getMortalityRate2(age);
  const phase = getLifePhase(age);
  let nextTickYears;
  if (age <= 4) nextTickYears = 1;
  else if (age <= 14) nextTickYears = 3;
  else if (age <= 24) nextTickYears = 2;
  else if (age <= 64) nextTickYears = 3;
  else if (age <= 84) nextTickYears = 2;
  else nextTickYears = 1;
  const deathProbability = mortalityRate / 1e3 * nextTickYears;
  const died = Math.random() < deathProbability;
  if (died) {
    const eligibleDeaths = DEATH_EVENTS.filter((d) => d.eras.includes(lifeState.era) && d.phases.includes(phase));
    const deathEvent = eligibleDeaths.length > 0 ? eligibleDeaths[Math.floor(Math.random() * eligibleDeaths.length)] : DEATH_EVENTS.find((d) => d.eras.includes(lifeState.era));
    const deathCause = deathEvent ? deathEvent.title : "Unknown causes";
    return { ageReached: age + nextTickYears, died: true, deathCause, event: deathEvent ? { ...deathEvent, description: resolveTemplate(deathEvent.description, { name: lifeState.name || "You", location: lifeState.location || "here", era: lifeState.era, phase, anchor: lifeState.anchor || "" }) } : null, nextTickYears };
  }
  if (Math.random() > 0.75) {
    return { ageReached: age + nextTickYears, died: false, deathCause: null, event: null, nextTickYears };
  }
  const event = selectNextEvent(lifeState, soulFragments, cascadeTags);
  if (!event) {
    return { ageReached: age + nextTickYears, died: false, deathCause: null, event: null, nextTickYears };
  }
  const resolvedEvent = { ...event, description: resolveTemplate(event.description, { name: lifeState.name || "You", location: lifeState.location || "here", era: lifeState.era, phase, anchor: lifeState.anchor || "" }) };
  return { ageReached: age + nextTickYears, died: false, deathCause: null, event: resolvedEvent, nextTickYears };
}
function selectNextEvent(lifeState, soulFragments, cascadeTags = []) {
  const phase = getLifePhase(lifeState.age);
  const era = lifeState.era;
  const pool = EVENT_POOLS[era];
  if (!pool || pool.length === 0) return null;
  const eligible = pool.filter((e) => e.eras.includes(era) && e.phases.includes(phase) && Math.random() < e.triggerProbability);
  if (eligible.length === 0) {
    const relaxed = pool.filter((e) => e.eras.includes(era) && e.phases.includes(phase));
    if (relaxed.length === 0) return null;
    return weightedRandom(relaxed.map((e) => ({ item: e, weight: e.weight })))?.item || null;
  }
  const scored = eligible.map((event) => {
    let score = event.weight;
    if (event.cascadeTags && cascadeTags.length > 0) {
      const matchingTags = event.cascadeTags.filter((t) => cascadeTags.includes(t));
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
  return weightedRandom(scored.map((s) => ({ item: s.event, weight: s.score })))?.item || null;
}
function resolveTemplate(text, vars) {
  if (!text) return "";
  return text.replace(/\{(name|location|era|phase|anchor)\}/g, (match, key) => vars[key] !== void 0 ? vars[key] : match);
}
function weightedRandom(items) {
  if (items.length === 0) return null;
  if (items.length === 1) return items[0];
  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
  let random = Math.random() * totalWeight;
  for (const item of items) {
    random -= item.weight || 1;
    if (random <= 0) return item;
  }
  return items[items.length - 1];
}
function getMortalityRate2(age) {
  const bucket = MORTALITY_CURVE.find((b) => age >= b.minAge && age <= b.maxAge);
  return bucket ? bucket.rate : 80;
}
function displayEvent(event) {
  if (!event) return;
  const eventTitle = document.getElementById("event-title");
  const eventProse = document.getElementById("event-prose");
  if (!eventTitle || !eventProse) return;
  eventTitle.className = "chain-active";
  const chainType = getChainTypeForEvent(event);
  if (chainType) {
    eventTitle.classList.add(`event-chain-${chainType.toLowerCase()}`);
    eventTitle.classList.add("chain-active");
  }
  eventTitle.innerHTML = (chainType ? '<span class="chain-icon">\xE2\u0161\xAD</span>' : "") + event.title;
  eventProse.textContent = event.description;
  eventTitle.style.display = "block";
  eventProse.style.display = "block";
  if (event.cascadeTags) {
    state2.cascadeTags = event.cascadeTags;
  }
  const livesSoFar = state2.soul?.livesLived || 0;
  if (livesSoFar < 3) {
    if (event.crisis || event.intensity && event.intensity >= 0.8) {
      setTimeout(() => {
        const hint = document.createElement("div");
        hint.className = "in-event-hint";
        hint.textContent = "(choices in crises shape your soul's direction)";
        hint.style.cssText = "font-size:0.75rem;color:var(--text-dim);font-style:italic;margin-top:8px;";
        eventProse.style.display = "block";
        eventProse.parentElement?.appendChild(hint);
        setTimeout(() => hint.remove(), 6e3);
      }, 1500);
    }
  }
}
function showEventChoices(event) {
  if (!event || !event.choices) return;
}
function getChainTypeForTag(tag) {
  if (!tag) return null;
  const t = tag.toLowerCase();
  const CHAIN_TAG_MAP3 = {
    GRIEF: ["grief", "sadness", "sorrow", "mourning", "loss", "despair", "melancholy"],
    LOVE: ["connection", "tenderness", "love", "affection", "devotion", "passion", "romance"],
    DREAD: ["dread", "vertigo", "fear", "terror", "anxiety", "panic", "horror"],
    WONDER: ["wonder", "awe", "discovery", "curiosity", "marvel"],
    RAGE: ["rage", "anger", "betrayal", "fury", "wrath", "resentment"],
    GRACE: ["grace", "resignation", "acceptance", "peace", "surrender"]
  };
  for (const [chainType, tags] of Object.entries(CHAIN_TAG_MAP3)) {
    if (tags.some((ct) => t.includes(ct))) return chainType;
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
async function awaitDivineSign(era, phase) {
  return new Promise((resolve) => setTimeout(() => {
    const signs = [
      "The sky fractures. A new path opens.",
      "Something ancient stirs and reaches toward you.",
      "The threads of fate shimmer. A sign appears.",
      "A presence brushes against your awareness.",
      "The world holds its breath. A sign emerges."
    ];
    resolve(signs[Math.floor(Math.random() * signs.length)]);
  }, 1500));
}
function showDivineToast2(message) {
  const toast = document.createElement("div");
  toast.style.cssText = "position:fixed;top:20%;left:50%;transform:translateX(-50%);background:#0e0e16;border:1px solid #ffaa00;border-radius:8px;padding:16px 24px;color:#ffaa00;font-family:var(--font-mono);font-size:0.85rem;z-index:300;text-align:center;animation:fadeIn 0.5s ease;";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "fadeOut 0.5s ease forwards";
    setTimeout(() => toast.remove(), 500);
  }, 4e3);
}
function spikeCrisisIntensity(era) {
  const spikes = {
    ANCIENT: ["The gods demand a sacrifice.", "The oracle speaks your name.", "The temple falls silent."],
    MEDIEVAL: ["The bells toll for you.", "The plague has found you.", "War comes to your door."],
    EARLY_MODERN: ["The witch hunters approach.", "The inquisition has noticed you.", "Revolution stirs in the streets."],
    INDUSTRIAL: ["The factory spews poison.", "War calls you to the trenches.", "The machines grow hungry."],
    MODERN: ["The screens flicker with your name.", "A diagnosis arrives.", "Society has marked you."],
    NEAR_FUTURE: ["The algorithm has decided.", "The climate shifts against you.", "The drones search for you."],
    FAR_FUTURE: ["The substrate destabilizes.", "The upload threatens to corrupt.", "The synthetic bodies fail."]
  };
  return (spikes[era] || spikes["ANCIENT"])[Math.floor(Math.random() * 3)];
}
function addConsequence(event, consequenceTag) {
  if (!event.cascadeTags) event.cascadeTags = [];
  event.cascadeTags.push(consequenceTag);
  state2.cascadeTags = [.../* @__PURE__ */ new Set([...state2.cascadeTags, consequenceTag])];
}
function triggerConsequenceEscalation(event) {
  if (!event || !event.cascadeTags) return;
  const escalationMap = {
    grief: "rage",
    dread: "vertigo",
    connection: "tenderness",
    anchor: "resignation",
    wonder: "awe",
    awakening: "disorientation"
  };
  const newTags = event.cascadeTags.map((t) => escalationMap[t] || t);
  event.cascadeTags = [...new Set(newTags)];
  state2.cascadeTags = [.../* @__PURE__ */ new Set([...state2.cascadeTags, ...newTags])];
}
function resolveCrisisChoice(choiceKey, event, { eraModifiers } = {}) {
  const choiceMap = { A: "intervene", B: "pray", C: "watch" };
  const choiceId = choiceMap[choiceKey];
  if (!choiceId) return resolveCrisisChoice("C", event, { eraModifiers });
  const choice = CRISIS_CHOICES[choiceId];
  const era = state2.currentLife?.era || "ANCIENT";
  let baseSuccessProb = choice.outcomes.success.probability;
  const eraMod = choice.eraModifiers?.[era] ?? 0;
  let finalSuccessProb = baseSuccessProb + eraMod;
  if (era === "FAR_FUTURE") {
    finalSuccessProb = baseSuccessProb + (Math.random() < 0.5 ? -0.1 : 0.1);
  }
  finalSuccessProb = Math.max(0.1, Math.min(0.9, finalSuccessProb));
  const roll = Math.random();
  const isSuccess = roll < finalSuccessProb;
  const outcome = isSuccess ? choice.outcomes.success : choice.outcomes.failure;
  event.isCrisisHandled = true;
  if (outcome.effect.deathChance && Math.random() < outcome.effect.deathChance) {
    triggerImmediateDeath(outcome.effect.cascadeTags || []);
    return;
  }
  if (state2.soul?.metaStats) {
    state2.soul.metaStats.crisesSurvived = (state2.soul.metaStats.crisesSurvived || 0) + 1;
  }
  if (outcome.effect.cascadeTags && outcome.effect.cascadeTags.length > 0) {
    state2.cascadeTags = [.../* @__PURE__ */ new Set([...state2.cascadeTags, ...choice.cascadeBias, ...outcome.effect.cascadeTags])];
  } else if (choice.cascadeBias) {
    state2.cascadeTags = [.../* @__PURE__ */ new Set([...state2.cascadeTags, ...choice.cascadeBias])];
  }
  if (outcome.effect.emotionalShift) {
    state2.emotionalShift = (state2.emotionalShift || 0) + outcome.effect.emotionalShift;
  }
  if (outcome.effect.divineBonus && isSuccess) {
    state2.faith = (state2.faith || 0) + 1;
    if (state2.soul?.fragments?.length > 0) {
      const lastFrag = state2.soul.fragments[state2.soul.fragments.length - 1];
      if (lastFrag && lastFrag.strength !== void 0) {
        lastFrag.strength = Math.min(1.5, (lastFrag.strength || 1) + 0.2);
      }
    }
  }
  if (outcome.effect.fragmentInsight && isSuccess) {
    if (state2.soul?.fragments?.length > 0) {
      const lastFrag = state2.soul.fragments[state2.soul.fragments.length - 1];
      if (lastFrag) {
        lastFrag.strength = Math.min(1.5, (lastFrag.strength || 1) + 0.15);
        if (!lastFrag.insightFromWatch) {
          lastFrag.insightFromWatch = true;
          state2.cascadeTags = [.../* @__PURE__ */ new Set([...state2.cascadeTags, "wonder", "awe"])];
        }
      }
    }
  }
  if (outcome.effect.resourceLoss === "momentum" && !isSuccess) {
    state2.momentum = Math.max(0, (state2.momentum || 1) - 1);
    state2.cascadeTags = [.../* @__PURE__ */ new Set([...state2.cascadeTags, "regret", "lingering"])];
    if (state2.emotionalShift !== void 0) {
      state2.emotionalShift = Math.max(-1, state2.emotionalShift - 0.15);
    }
  }
}
function triggerImmediateDeath(cascadeTags) {
  const deathEvent = {
    id: "death_crisis_" + Date.now(),
    title: "The crisis claimed you",
    description: "You stepped too close to the fire and it took you.",
    cascadeTags: cascadeTags || ["grief", "vertigo"],
    category: "violence",
    era: state2.currentLife.era,
    age: state2.currentAge,
    isDeathEvent: true
  };
  state2.isAlive = false;
  state2.deathEvent = deathEvent;
  clearInterval(state2.tickInterval);
  state2.tickInterval = null;
  state2.lifeEvents.push({ ...deathEvent, age: state2.currentAge });
  state2.eventMarkers.push({ age: state2.currentAge, rate: getMortalityRate2(Math.min(state2.currentAge, 100)) });
  const chainResult = detectChain(deathEvent, state2.lifeEvents);
  if (chainResult.chainEvent) {
    if (!state2.activeChain) {
      state2.activeChain = { type: chainResult.chainType, events: [], color: CHAIN_COLORS[chainResult.chainType] };
    }
    if (!state2.activeChain.events.find((ev) => ev.id === deathEvent.id)) {
      state2.activeChain.events.push(deathEvent);
    }
  }
  if (state2.lifeEvents.length >= 2) {
    state2.lifeTheme = generateLifeTheme(state2.lifeEvents);
  }
  const { newFragments } = extractFragments(state2.lifeEvents, deathEvent, state2.soul);
  const { newAnchors } = applyFragmentEffects(state2.soul, newFragments, state2.currentLife?.era);
  const newAchievements = checkAndUnlockAchievements(state2.soul, state2.lifeEvents, deathEvent);
  if (newAchievements.length > 0) {
    setTimeout(() => showAchievementNotifications(newAchievements), 800);
  }
  updateUI();
  showFragments(newFragments);
  drawCurve();
  if (newAnchors && newAnchors.length > 0) {
    for (const anchor of newAnchors) {
      setTimeout(() => showDivineToast(`An anchor forms \xE2 \u201D ${anchor.value} has become a core thread of your soul.`, 4500), 800);
    }
  }
  const livesSoFar = state2.soul?.livesLived || 0;
  if (livesSoFar < 3) {
    setTimeout(() => {
      const hint = document.createElement("div");
      hint.className = "death-hint";
      hint.textContent = "(your fragments accumulate and shape future souls)";
      hint.style.cssText = "font-size:0.8rem;color:var(--text-dim);font-style:italic;margin-top:10px;text-align:center;";
      const summaryEl = document.getElementById("death-summary");
      if (summaryEl) summaryEl.parentElement?.appendChild(hint);
    }, 1200);
  }
  setTimeout(() => showDeathOverlay2(deathEvent), 500);
}
function showDeathOverlay2(deathEvent) {
  const life = state2.currentLife;
  const deathOverlay = document.getElementById("death-overlay");
  if (!deathOverlay) return;
  document.getElementById("death-cause").textContent = deathEvent?.title || "Unknown causes";
  document.getElementById("death-summary").textContent = deathEvent?.description || "";
  document.getElementById("death-age").textContent = `age ${state2.currentAge}`;
  document.getElementById("death-era").textContent = `${ERAS[life.era]?.label || life.era} \xE2 \xA2 ${life.year}`;
  document.getElementById("death-life-num").textContent = `life #${state2.soul.livesLived + 1}`;
  deathOverlay.classList.add("visible");
  showChainRecapOnDeath(state2.lifeEvents);
  const app = document.getElementById("app");
  const lifeViewport = document.getElementById("life-viewport");
  if (app) app.classList.add("shake");
  if (lifeViewport) lifeViewport.classList.add("red-flash");
  setTimeout(() => {
    if (app) app.classList.remove("shake");
    if (lifeViewport) lifeViewport.classList.remove("red-flash");
  }, 600);
}
function showCrisisPrompt(event, choices, eraModifiers = {}) {
  const overlay = document.getElementById("crisis-overlay");
  const causeEl = document.getElementById("crisis-cause");
  const choicesEl = document.getElementById("crisis-choices");
  const timerFill = document.getElementById("crisis-timer-fill");
  const timerText = document.getElementById("crisis-timer-text");
  if (!overlay || !causeEl) return;
  const displayCause = event.description || event.title || "A crisis unfolds.";
  causeEl.textContent = displayCause;
  choicesEl.innerHTML = "";
  const choiceOrder = ["A", "B", "C"];
  const choiceIds = ["intervene", "pray", "watch"];
  choiceOrder.forEach((key, i) => {
    const choice = CRISIS_CHOICES[choiceIds[i]];
    const btn = document.createElement("button");
    btn.className = "crisis-choice";
    btn.dataset.key = key;
    btn.innerHTML = `
      <span class="choice-key">${key}</span>
      <span class="choice-content">
        <div class="choice-label">${choice.label} \xE2 \u201D ${choice.subtitle}</div>
        <div class="choice-risk">Risk: ${choice.riskDescriptions.join(", ")}</div>
      </span>
    `;
    btn.addEventListener("click", () => handleCrisisChoice(key));
    choicesEl.appendChild(btn);
  });
  overlay.classList.add("visible");
  let remaining = DEFAULT_CHOICE_TIMEOUT;
  const interval = setInterval(() => {
    remaining -= 100;
    const pct = remaining / DEFAULT_CHOICE_TIMEOUT * 100;
    if (timerFill) timerFill.style.width = pct + "%";
    if (timerText) timerText.textContent = `You have ${Math.ceil(remaining / 1e3)} second${Math.ceil(remaining / 1e3) !== 1 ? "s" : ""}...`;
    if (remaining <= 0) {
      clearInterval(interval);
      handleCrisisChoice("C", true);
    }
  }, 100);
  state2.crisisPending = { event, interval, resolve: crisisPendingResolve, eraModifiers };
}
function hideCrisisPrompt() {
  const overlay = document.getElementById("crisis-overlay");
  if (overlay) overlay.classList.remove("visible");
  if (state2.crisisPending && state2.crisisPending.interval) {
    clearInterval(state2.crisisPending.interval);
  }
  state2.crisisPending = null;
}
function handleCrisisChoice(key, timedOut = false) {
  if (!state2.crisisPending) return;
  const { event, eraModifiers } = state2.crisisPending;
  hideCrisisPrompt();
  if (timedOut) {
    state2.cascadeTags = [.../* @__PURE__ */ new Set([...state2.cascadeTags, "passivity", "regret", "trauma"])];
    state2.emotionalShift = (state2.emotionalShift || 0) - 0.3;
    state2.momentum = Math.max(0, (state2.momentum || 1) - 2);
    if (state2.soul?.metaStats) {
      state2.soul.metaStats.crisesSurvived = (state2.soul.metaStats.crisesSurvived || 0) + 1;
    }
    event.isCrisisHandled = true;
    state2.isPaused = false;
    updateUI();
    drawCurve();
    return;
  }
  resolveCrisisChoice(key, event, { eraModifiers });
  state2.isPaused = false;
  updateUI();
  drawCurve();
}
function isCrisisEvent(event) {
  if (!event) return false;
  const intensity = event.intensity || event.emotionalIntensity || 0;
  const hasChoices = event.choices && event.choices.length > 0;
  return (intensity >= CRITICAL_INTENSITY || event.crisisTag) && !event.isDeathEvent && !event.isCrisisHandled && hasChoices;
}
function getWhisperFrequency(soulState, currentPhase) {
  const fragmentCount = soulState.fragments ? soulState.fragments.length : 0;
  let freq = Math.min(0.1 * fragmentCount, 0.5);
  if (soulState.anchors) freq += soulState.anchors.length * 0.05;
  const era = state2.currentLife ? state2.currentLife.era : "ANCIENT";
  if (era === "ANCIENT" || era === "MEDIEVAL") freq *= 1.3;
  if (era === "MODERN" || era === "NEAR_FUTURE" || era === "FAR_FUTURE") freq *= 1.15;
  if (currentPhase === "MIDDLE_AGE" || currentPhase === "SENIOR" || currentPhase === "ANCIENT") freq *= 1.4;
  if (currentPhase === "INFANT" || currentPhase === "CHILD") freq *= 0.5;
  return freq;
}
function selectWhisperingFragment(soulState, currentEra, recentFragmentIds) {
  const eligible = soulState.fragments.filter((f) => {
    if (recentFragmentIds.includes(f.id)) return false;
    if (f.strength < 0.2) return false;
    if (f.origin && f.origin.era === currentEra) return true;
    return f.strength > 0.4;
  });
  if (eligible.length === 0) return null;
  const weights = eligible.map((f) => {
    let w = f.strength;
    if (f.origin && f.origin.era === currentEra) w *= 1.5;
    if (f.isAnchor) w *= 1.3;
    const lifeNum = f.origin?.lifeId?.split("_").pop() || 0;
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
function generateWhisperEvent(fragment, era, currentAge) {
  const biasTags = fragment.cascadeTags || [];
  const typeBias = fragment.type === "fear" ? ["dread", "danger", "threat"] : fragment.type === "love" ? ["connection", "tenderness", "longing"] : fragment.type === "tone" ? ["melancholy", "resignation", "wonder"] : ["fate", "coincidence", "sign"];
  const pool = EVENT_POOLS[era] || EVENT_POOLS["ANCIENT"] || [];
  const eligibleEvents = pool.filter(
    (e) => e.cascadeTags && e.cascadeTags.some((t) => [...biasTags, ...typeBias].includes(t))
  );
  if (eligibleEvents.length > 0) {
    const chosen = pickRandom2(eligibleEvents);
    return {
      id: `whisper_${Date.now()}`,
      title: chosen.title,
      era,
      age: currentAge,
      category: "whisper",
      intensity: 0.3,
      cascadeTags: [...chosen.cascadeTags || [], ...fragment.cascadeTags || [], fragment.type],
      description: resolveTemplate(chosen.description, { name: state2.currentLife?.name || "You", location: state2.currentLife?.location?.city || "here", era, phase: getLifePhase(currentAge), anchor: "" }),
      isWhisperEvent: true,
      sourceFragmentId: fragment.id
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
    warning: `${fragment.value}. You feel it in your chest before you understand it.`
  };
  const template = templates[fragment.type] || templates.tone;
  return {
    id: `whisper_${Date.now()}`,
    title: "Fragment Resonates",
    era,
    age: currentAge,
    category: "whisper",
    intensity: 0.3,
    cascadeTags: [...fragment.cascadeTags || [], fragment.type],
    description: template,
    isWhisperEvent: true,
    sourceFragmentId: fragment.id
  };
}
function pickRandom2(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function showWhisperPanel(fragment) {
  const panel = document.getElementById("whisper-panel");
  if (!panel) return;
  const isAnchor = fragment.isAnchor;
  panel.className = `whisper-panel visible${isAnchor ? " anchor-whisper" : ""}`;
  const iconEl = document.getElementById("whisper-icon");
  const labelEl = document.getElementById("whisper-label");
  const anchorBadge = document.getElementById("whisper-anchor-badge");
  const valueEl = document.getElementById("whisper-value");
  const actBtn = document.getElementById("whisper-act-btn");
  const timerFill = document.getElementById("whisper-timer-fill");
  if (iconEl) iconEl.textContent = FRAGMENT_TYPE_ICONS[fragment.type] || "\xE2\u2122\xAA";
  if (labelEl) labelEl.textContent = isAnchor ? "An anchor fragment resonates..." : "Fragment whispers...";
  if (anchorBadge) anchorBadge.style.display = isAnchor ? "inline" : "none";
  if (valueEl) valueEl.textContent = `"${fragment.value}"`;
  if (actBtn) {
    actBtn.textContent = isAnchor ? "Embrace" : "Act";
    actBtn.className = `whisper-btn act${isAnchor ? " embrace" : ""}`;
  }
  panel.style.display = "block";
  if (!state2.seenWhisperTip) {
    state2.seenWhisperTip = true;
    setTimeout(() => showContextualTip("whisper"), 800);
  }
  state2.whisperTimeLeft = 8e3;
  if (timerFill) timerFill.style.width = "100%";
  if (state2.whisperTimer) clearInterval(state2.whisperTimer);
  state2.whisperTimer = setInterval(() => {
    state2.whisperTimeLeft -= 100;
    const pct = state2.whisperTimeLeft / 8e3 * 100;
    if (timerFill) timerFill.style.width = `${Math.max(0, pct)}%`;
    if (state2.whisperTimeLeft <= 0) {
      handleWhisperIgnore();
    }
  }, 100);
}
function hideWhisperPanel() {
  const panel = document.getElementById("whisper-panel");
  if (!panel) return;
  panel.classList.remove("visible");
  panel.style.display = "none";
  if (state2.whisperTimer) {
    clearInterval(state2.whisperTimer);
    state2.whisperTimer = null;
  }
}
function handleWhisperAct() {
  if (!state2.currentWhisper) return;
  const fragment = state2.currentWhisper;
  hideWhisperPanel();
  const whisperEvent = generateWhisperEvent(fragment, state2.currentLife.era, state2.currentAge);
  const eventWithAge = { ...whisperEvent, age: state2.currentAge, era: state2.currentLife.era };
  state2.lifeEvents.push(eventWithAge);
  displayEvent(whisperEvent);
  state2.eventMarkers.push({ age: state2.currentAge, rate: getMortalityRate2(Math.min(state2.currentAge, 100)) });
  const chainResult = detectChain(eventWithAge, state2.lifeEvents);
  if (chainResult.chainEvent) {
    if (!state2.activeChain || state2.activeChain.type !== chainResult.chainType) {
      state2.activeChain = { type: chainResult.chainType, events: [], color: CHAIN_COLORS[chainResult.chainType] };
    }
    if (!state2.activeChain.events.find((ev) => ev.id === eventWithAge.id)) {
      state2.activeChain.events.push(eventWithAge);
    }
    if (state2.activeChain.events.length >= 2) {
      state2.lifeTheme = generateLifeTheme(state2.lifeEvents);
    }
  }
  main.renderChainStrip(state2.activeChain);
  main.updateLifeSummaryBar();
  if (!state2.recentFragmentIds.includes(fragment.id)) {
    state2.recentFragmentIds.push(fragment.id);
  }
  if (state2.recentFragmentIds.length > 8) {
    state2.recentFragmentIds = state2.recentFragmentIds.slice(-8);
  }
  state2.currentWhisper = null;
  state2.whisperCooldown = 20 + Math.floor(Math.random() * 21);
}
function handleWhisperIgnore() {
  if (!state2.currentWhisper) return;
  const fragment = state2.currentWhisper;
  hideWhisperPanel();
  if (fragment.isAnchor) {
    if (state2.soul && state2.soul.emotionalShift !== void 0) {
      state2.soul.emotionalShift = Math.max(-1, state2.soul.emotionalShift - 0.05);
    } else if (state2.soul) {
      state2.soul.emotionalShift = -0.05;
    }
  }
  state2.currentWhisper = null;
  state2.whisperCooldown = 20 + Math.floor(Math.random() * 21);
}
function modifyResourcesForEvent(event) {
  if (!event || !event.cascadeTags) return;
  const tags = event.cascadeTags.map((t) => t.toLowerCase());
  for (const [resource, keywords] of Object.entries(RESOURCE_BUILDERS)) {
    for (const kw of keywords) {
      if (tags.some((t) => t.includes(kw))) {
        state2[resource] = Math.min(3, state2[resource] + 1);
      }
    }
  }
  for (const [resource, keywords] of Object.entries(RESOURCE_DEPLETERS)) {
    for (const kw of keywords) {
      if (tags.some((t) => t.includes(kw))) {
        state2[resource] = Math.max(0, state2[resource] - 1);
      }
    }
  }
  main.updateResourceDisplay();
}
function initEventSystem(gameState) {
  document.addEventListener("keydown", handleGlobalKeydown);
  document.getElementById("crisis-overlay").addEventListener("click", (e) => {
    if (e.target.id === "crisis-overlay") {
      handleCrisisChoice("C");
    }
  });
}
function handleGlobalKeydown(e) {
  if (state2.currentWhisper) {
    if (e.key === "y" || e.key === "Y") {
      handleWhisperAct();
    } else if (e.key === "n" || e.key === "N") {
      handleWhisperIgnore();
    }
    return;
  }
  if (state2.crisisPending) {
    const key = e.key.toUpperCase();
    if (["A", "B", "C"].includes(key)) {
      e.preventDefault();
      handleCrisisChoice(key);
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCrisisChoice("C");
    }
    return;
  }
  if (e.code === "Space" || e.key === " ") {
    e.preventDefault();
    advanceCurrentEvent();
  }
}
var EVENT_POOL, crisisPendingResolve, RESOURCE_BUILDERS, RESOURCE_DEPLETERS;
var init_events = __esm({
  "js/events.js"() {
    init_ui();
    init_game();
    init_main();
    init_world();
    EVENT_POOL = EVENT_POOLS;
    crisisPendingResolve = null;
    RESOURCE_BUILDERS = {
      connection: ["marriage", "birth", "child", "reunion", "forgiveness", "friendship", "adoption", "love", "wedding", "ceremony", "bond"],
      vitality: ["recovery", "health", "healing", "rest", "birth", "survival", "robust", "strong", "vitality"],
      momentum: ["achievement", "breakthrough", "clarity", "purpose", "discovery", "triumph", "success", "victory"]
    };
    RESOURCE_DEPLETERS = {
      connection: ["betrayal", "loss", "death", "estrangement", "divorce", "abandonment", "rival", "blood", "war", "enemy", "hate"],
      vitality: ["plague", "illness", "injury", "trauma", "poison", "starvation", "fever", "exhaustion", "sick", "weak", "wound"],
      momentum: ["confusion", "failure", "doubt", "aimlessness", "lost", "aimless", "confused", "\xE8\xBF\xB7", "fail"]
    };
  }
});

// js/save.js
var require_save = __commonJS({
  "js/save.js"(exports, module) {
    var SAVE_KEYS = {
      SOUL: "soulcycle_soul",
      SETTINGS: "soulcycle_settings",
      INPROGRESS: "soulcycle_inprogress",
      RECORDS: "soulcycle_lifetime_records"
    };
    var ERA_ORDER3 = ["ANCIENT", "MEDIEVAL", "EARLY_MODERN", "INDUSTRIAL", "MODERN", "NEAR_FUTURE", "FAR_FUTURE"];
    function getItem(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    function setItem(key, val) {
      try {
        localStorage.setItem(key, val);
      } catch {
      }
    }
    function removeItem(key) {
      try {
        localStorage.removeItem(key);
      } catch {
      }
    }
    function saveSoulState(soul) {
      if (!soul) return;
      setItem(SAVE_KEYS.SOUL, JSON.stringify(soul));
    }
    function loadSoulState() {
      const raw = getItem(SAVE_KEYS.SOUL);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    function saveInProgressLife(stateObj) {
      if (!stateObj) return;
      const snapshot = {
        soul: stateObj.soul,
        currentLife: stateObj.currentLife,
        lifeEvents: stateObj.lifeEvents,
        currentAge: stateObj.currentAge,
        phase: stateObj.phase,
        isAlive: stateObj.isAlive,
        cascadeTags: stateObj.cascadeTags,
        lifeTheme: stateObj.lifeTheme,
        activeChain: stateObj.activeChain,
        whisperCooldown: stateObj.whisperCooldown,
        recentFragmentIds: stateObj.recentFragmentIds,
        connection: stateObj.connection,
        vitality: stateObj.vitality,
        momentum: stateObj.momentum,
        eventMarkers: stateObj.eventMarkers,
        speed: stateObj.speed || "normal",
        savedAt: Date.now()
      };
      setItem(SAVE_KEYS.INPROGRESS, JSON.stringify(snapshot));
    }
    function loadInProgressLife() {
      const raw = getItem(SAVE_KEYS.INPROGRESS);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    function clearInProgressLife() {
      removeItem(SAVE_KEYS.INPROGRESS);
    }
    function saveSettings(settings) {
      setItem(SAVE_KEYS.SETTINGS, JSON.stringify(settings));
    }
    function loadSettings() {
      const raw = getItem(SAVE_KEYS.SETTINGS);
      if (!raw) return {};
      try {
        return JSON.parse(raw);
      } catch {
        return {};
      }
    }
    function saveOnDeath(stateObj, deathEvent, newFragments) {
      if (!stateObj || !stateObj.soul) return;
      saveSoulState(stateObj.soul);
      const records = getLifetimeRecords(stateObj);
      setItem(SAVE_KEYS.RECORDS, JSON.stringify(records));
      clearInProgressLife();
    }
    function getLifetimeRecords(stateObj) {
      const soul = stateObj ? stateObj.soul : loadSoulState();
      if (!soul) {
        return {
          totalDeaths: 0,
          violentDeaths: 0,
          peacefulDeaths: 0,
          lovesLost: 0,
          childrenBorn: 0,
          totalLives: 0,
          totalFragments: 0,
          totalAnchors: 0,
          totalYears: 0,
          erasUnlocked: ["ANCIENT", "MEDIEVAL"],
          longestLife: 0,
          oldestAge: 0,
          mostViolentDeath: null,
          mostPeacefulDeath: null,
          fragmentTypeCounts: {},
          chainAppearances: {},
          recordUpdatedAt: Date.now()
        };
      }
      const meta = soul.metaStats || {};
      const longestLifeEntry = findLongestLifeEntry(soul);
      const chainAppearances = {};
      for (const frag of soul.fragments || []) {
        for (const tag of frag.cascadeTags || []) {
          chainAppearances[tag] = (chainAppearances[tag] || 0) + 1;
        }
      }
      const fragmentTypeCounts = {};
      for (const frag of soul.fragments || []) {
        fragmentTypeCounts[frag.type] = (fragmentTypeCounts[frag.type] || 0) + 1;
      }
      return {
        totalDeaths: meta.totalDeaths || 0,
        violentDeaths: meta.violentDeaths || 0,
        peacefulDeaths: meta.peacefulDeaths || 0,
        lovesLost: meta.lovesLost || 0,
        childrenBorn: meta.childrenBorn || 0,
        totalLives: soul.livesLived || 0,
        totalFragments: soul.fragments ? soul.fragments.length : 0,
        totalAnchors: soul.anchors ? soul.anchors.length : 0,
        totalYears: soul.totalYearsLived || 0,
        erasUnlocked: soul.unlockedEras || ["ANCIENT", "MEDIEVAL"],
        longestLife: longestLifeEntry ? longestLifeEntry.age : 0,
        oldestAge: longestLifeEntry ? longestLifeEntry.age : 0,
        mostViolentDeath: meta.mostViolentDeath || null,
        mostPeacefulDeath: meta.mostPeacefulDeath || null,
        fragmentTypeCounts,
        chainAppearances,
        recordUpdatedAt: Date.now()
      };
    }
    function findLongestLifeEntry(soul) {
      if (soul._lifeHistory && soul._lifeHistory.length > 0) {
        return soul._lifeHistory.reduce((best, cur) => cur.age > best.age ? cur : best, soul._lifeHistory[0]);
      }
      return null;
    }
    function exportSoulToBase64(soul) {
      if (!soul) return "";
      try {
        const json = JSON.stringify(soul);
        return btoa(unescape(encodeURIComponent(json)));
      } catch {
        return "";
      }
    }
    function importSoulFromBase64(b64) {
      if (!b64 || typeof b64 !== "string") return null;
      try {
        const json = decodeURIComponent(escape(atob(b64)));
        return JSON.parse(json);
      } catch {
        return null;
      }
    }
    function clearAllSaves() {
      removeItem(SAVE_KEYS.SOUL);
      removeItem(SAVE_KEYS.SETTINGS);
      removeItem(SAVE_KEYS.INPROGRESS);
      removeItem(SAVE_KEYS.RECORDS);
    }
    function checkForInProgressLife() {
      const saved = loadInProgressLife();
      if (!saved) return null;
      if (saved.isAlive === true && saved.currentLife && saved.currentAge > 0) {
        return saved;
      }
      if (saved.isAlive === false || !saved.currentLife) {
        clearInProgressLife();
        return null;
      }
      return null;
    }
    function resumeLife(stateObj, saved) {
      if (!stateObj || !saved) return false;
      stateObj.soul = saved.soul;
      stateObj.currentLife = saved.currentLife;
      stateObj.lifeEvents = saved.lifeEvents || [];
      stateObj.currentAge = saved.currentAge || 0;
      stateObj.phase = saved.phase || "INFANT";
      stateObj.isAlive = saved.isAlive;
      stateObj.cascadeTags = saved.cascadeTags || [];
      stateObj.lifeTheme = saved.lifeTheme || null;
      stateObj.activeChain = saved.activeChain || null;
      stateObj.whisperCooldown = saved.whisperCooldown || 0;
      stateObj.recentFragmentIds = saved.recentFragmentIds || [];
      stateObj.connection = saved.connection || 1;
      stateObj.vitality = saved.vitality || 1;
      stateObj.momentum = saved.momentum || 1;
      stateObj.eventMarkers = saved.eventMarkers || [];
      stateObj.speed = saved.speed || "normal";
      stateObj.whisperTimer = null;
      stateObj.whisperTimeLeft = 8e3;
      stateObj.currentWhisper = null;
      stateObj.deathEvent = null;
      stateObj.isPaused = false;
      stateObj.animProgress = 0;
      stateObj.crisisPending = null;
      return true;
    }
    if (typeof module !== "undefined" && module.exports) {
      module.exports = {
        SAVE_KEYS,
        getItem,
        setItem,
        removeItem,
        saveSoulState,
        loadSoulState,
        saveInProgressLife,
        loadInProgressLife,
        clearInProgressLife,
        saveSettings,
        loadSettings,
        saveOnDeath,
        getLifetimeRecords,
        exportSoulToBase64,
        importSoulFromBase64,
        clearAllSaves,
        checkForInProgressLife,
        resumeLife
      };
    }
  }
});

// js/main.js
function getChainTypeForTag2(tag) {
  if (!tag) return null;
  const t = tag.toLowerCase();
  for (const [chainType, tags] of Object.entries(CHAIN_TAG_MAP2)) {
    if (tags.some((ct) => t.includes(ct))) return chainType;
  }
  return null;
}
function getChainTypeForEvent2(event) {
  if (!event || !event.cascadeTags || event.cascadeTags.length === 0) return null;
  for (const tag of event.cascadeTags) {
    const chainType = getChainTypeForTag2(tag);
    if (chainType) return chainType;
  }
  return null;
}
function detectChain(event, lifeEvents) {
  if (!event || !event.cascadeTags || event.cascadeTags.length === 0) {
    return { chainUpdated: false, chainEvent: false, chainType: null };
  }
  const eventChainType = getChainTypeForEvent2(event);
  if (!eventChainType) {
    return { chainUpdated: false, chainEvent: false, chainType: null };
  }
  const eventAge = event.age || 0;
  const recentEvents = lifeEvents.filter((e) => {
    if (e === event) return false;
    const eAge = e.age || 0;
    return Math.abs(eAge - eventAge) <= CHAIN_AGE_WINDOW;
  });
  const matchingChainEvents = recentEvents.filter((e) => getChainTypeForEvent2(e) === eventChainType);
  if (matchingChainEvents.length === 0) {
    return { chainUpdated: false, chainEvent: false, chainType: eventChainType };
  }
  return { chainUpdated: true, chainEvent: true, chainType: eventChainType };
}
function generateLifeTheme(lifeEvents) {
  if (!lifeEvents || lifeEvents.length < 2) return null;
  const chainCounts = { GRIEF: 0, LOVE: 0, DREAD: 0, WONDER: 0, RAGE: 0, GRACE: 0 };
  for (const event of lifeEvents) {
    const ct = getChainTypeForEvent2(event);
    if (ct) chainCounts[ct]++;
  }
  let maxChain = null;
  let maxCount = 0;
  for (const [chain, count] of Object.entries(chainCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxChain = chain;
    }
  }
  if (!maxChain || maxCount < 2) return null;
  const seen = /* @__PURE__ */ new Set();
  const chainEvents = lifeEvents.filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return getChainTypeForEvent2(e) === maxChain;
  });
  const labels = THEME_LABELS[maxChain];
  const label = labels[Math.floor(Math.random() * labels.length)];
  return { theme: maxChain, chain: chainEvents, label, events: chainEvents };
}
function renderChainStrip(activeChain) {
  const strip = document.getElementById("chain-strip");
  const themeHeader = document.getElementById("life-theme-header");
  if (!strip) return;
  if (!activeChain || !activeChain.type || activeChain.events.length === 0) {
    strip.innerHTML = "";
    themeHeader.classList.remove("visible");
    return;
  }
  themeHeader.classList.add("visible");
  const color = CHAIN_COLORS2[activeChain.type] || "#ffffff";
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
    const nodeClass = isFilled ? "filled" : isCurrent ? "current" : "";
    html += `<span class="chain-node ${nodeClass}"></span>`;
  }
  html += "</span>";
  strip.innerHTML = html;
  const labelEl = document.getElementById("life-theme-label");
  if (labelEl && activeChain.label) {
    labelEl.textContent = activeChain.label;
  }
}
function updateLifeSummaryBar() {
  const bar = document.getElementById("life-summary-bar");
  if (!bar) return;
  const soul = state.soul;
  if (!soul) {
    bar.classList.remove("visible");
    return;
  }
  bar.classList.add("visible");
  const lives = soul.livesLived || 0;
  const years = soul.totalYearsLived || 0;
  const era = state.currentLife ? ERAS2[state.currentLife.era]?.label || state.currentLife.era : "---";
  const theme = state.lifeTheme && state.lifeTheme.theme ? state.lifeTheme.theme : "---";
  document.getElementById("summary-lives").textContent = `Lives lived: ${lives}`;
  document.getElementById("summary-years").textContent = `Total years: ${years}`;
  document.getElementById("summary-era").textContent = `Era: ${era}`;
  document.getElementById("summary-theme").textContent = `Theme: ${theme}`;
}
function showChainRecapOnDeath(lifeEvents) {
  const recapEl = document.getElementById("death-chain-recap");
  const titleEl = document.getElementById("death-chain-recap-title");
  const eventsEl = document.getElementById("death-chain-events");
  if (!recapEl) return;
  const theme = generateLifeTheme(lifeEvents);
  if (!theme || theme.events.length < 2) {
    recapEl.classList.remove("visible");
    return;
  }
  recapEl.classList.add("visible");
  const color = CHAIN_COLORS2[theme.theme] || "#ffffff";
  titleEl.innerHTML = `<span class="chain-type-badge" style="background:${color}22;color:${color};border:1px solid ${color}88">${theme.theme}</span> Chain \xE2 \u201D ${theme.label}`;
  let html = "";
  const seenIds = /* @__PURE__ */ new Set();
  const chainIconMap = { GRIEF: "\xF0\u0178\u2019\u201D", LOVE: "\xE2\u2122\xA5", DREAD: "\xF0\u0178\u2018\x81", WONDER: "\xE2\u0153\xA6", RAGE: "\xF0\u0178\u201D\xA5", GRACE: "\xE2\u02DC\xAF" };
  const chainIcon = chainIconMap[theme.theme] || "\xE2\u2014\u2030";
  for (let i = 0; i < theme.events.length; i++) {
    const e = theme.events[i];
    if (seenIds.has(e.id)) continue;
    seenIds.add(e.id);
    if (i > 0) {
      html += `<div class="chain-event-connector" style="color:${color}">`;
      html += `<svg viewBox="0 0 12 12"><line x1="0" y1="6" x2="12" y2="6" stroke="currentColor" stroke-width="1.5"/>`;
      html += `<circle cx="6" cy="6" r="3" fill="currentColor"/></svg>`;
      html += "</div>";
    }
    const shortDesc = e.description ? e.description.substring(0, 60) + (e.description.length > 60 ? "\xE2 \xA6" : "") : e.title;
    html += `<div class="chain-event-line" style="border-left: 3px solid ${color}; padding-left: 10px; margin: 4px 0; background: ${color}08; border-radius: 0 4px 4px 0;">`;
    html += `<span style="color:${color};font-size:0.9em;margin-right:6px;">${chainIcon}</span>`;
    html += `<strong style="color:${color}">${e.title}</strong>`;
    html += `<div style="color:#aaa;font-size:0.85em;margin-top:2px;font-style:italic;">"${shortDesc}"</div>`;
    html += "</div>";
  }
  eventsEl.innerHTML = html;
}
function fragGenerateId() {
  _fragIdCounter += 1;
  return `frag_${Date.now()}_${_fragIdCounter}`;
}
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
function pickRandom3(arr) {
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
  let maxTag = null, maxCount = 0;
  for (const [tag, count] of Object.entries(tagCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxTag = tag;
    }
  }
  return maxTag;
}
function getMostIntenseEvent(events) {
  let best = null, bestIntensity = -1;
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
  let best = null, bestScore = -1;
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
function isViolentDeath2(deathEvent) {
  if (!deathEvent) return false;
  const cause = (deathEvent.cause || deathEvent.type || deathEvent.category || deathEvent.title || "").toLowerCase();
  return ["murder", "kill", "stab", "shoot", "crash", "accident", "fall", "drown", "burn", "fire", "war", "battle", "fight", "attack", "poison", "execution", "suicide", "homicide", "violence", "blood", "wound", "injury", "fatal", "trauma", "predator", "battlefield", "arrow", "cannon", "plague", "fever", "rival", "hanging", "shipwreck", "overdose", "climate", "drone", "weapon", "malfunction", "purge", "rejection"].some((kw) => cause.includes(kw));
}
function isPeacefulDeath2(deathEvent) {
  if (!deathEvent) return false;
  const cause = (deathEvent.cause || deathEvent.type || deathEvent.category || deathEvent.title || "").toLowerCase();
  return ["old age", "natural", "peaceful", "sleep", "slept", "passed", "quiet", "gentle", "illness", "disease", "cancer", "heart", "organ failure", "time", "decline", "cold", "stroke", "hospital", "gives out"].some((kw) => cause.includes(kw));
}
function getRelationshipType(event) {
  if (!event || !event.relationship) return "stranger";
  const rel = (event.relationship.type || event.relationship.role || event.relationship || "").toLowerCase();
  if (["lover", "partner", "spouse", "wife", "husband", "romantic"].some((k) => rel.includes(k))) return "lover";
  if (["family", "parent", "child", "mother", "father", "son", "daughter", "sibling", "brother", "sister", "relative"].some((k) => rel.includes(k))) return "family";
  if (["friend", "best friend", "companion", "ally", "buddy", "pal"].some((k) => rel.includes(k))) return "friend";
  if (["rival", "enemy", "opponent", "adversary", "competitor", "nemesis"].some((k) => rel.includes(k))) return "rival";
  return "stranger";
}
function getEmotionCategory(tag) {
  if (!tag) return "wonder";
  const t = tag.toLowerCase();
  if (["grief", "sadness", "sorrow", "mourning", "loss", "despair", "melancholy"].some((k) => t.includes(k))) return "grief";
  if (["joy", "happiness", "bliss", "euphoria", "delight", "ecstasy", "contentment"].some((k) => t.includes(k))) return "joy";
  if (["fear", "terror", "dread", "anxiety", "panic", "horror", "phobia"].some((k) => t.includes(k))) return "fear";
  if (["love", "affection", "devotion", "passion", "tenderness", "adoration", "romance"].some((k) => t.includes(k))) return "love";
  if (["anger", "rage", "fury", "wrath", "resentment", "bitterness", "hostility"].some((k) => t.includes(k))) return "anger";
  return "wonder";
}
function getEventCategory(event) {
  if (!event) return "revelation";
  const cat = (event.category || event.type || event.name || "").toLowerCase();
  if (["birth", "born", "arrival", "entry"].some((k) => cat.includes(k))) return "birth";
  if (["comingofage", "coming-of-age", "coming of age", "adolescence", "puberty", "maturity"].some((k) => cat.includes(k))) return "comingOfAge";
  if (["achievement", "success", "victory", "accomplishment", "triumph", "award", "recognition"].some((k) => cat.includes(k))) return "achievement";
  if (["loss", "death", "grief", "mourning", "bereavement"].some((k) => cat.includes(k))) return "loss";
  if (["betrayal", "treachery", "deception", "lie", "backstab"].some((k) => cat.includes(k))) return "betrayal";
  return "revelation";
}
function createFragment(type, value, strength, origin, cascadeTags, isAnchor) {
  if (strength < 0.15) strength = 0.15 + Math.random() * 0.1;
  return { id: fragGenerateId(), type, value, strength: clamp(strength, 0, 1), origin, isAnchor: isAnchor || false, cascadeTags: cascadeTags || [] };
}
function extractDeathFragment(deathEvent, soulState, resourceBonus = 0) {
  if (!deathEvent) return null;
  const violent = isViolentDeath2(deathEvent);
  const peaceful = isPeacefulDeath2(deathEvent);
  let templatePool, baseStrength;
  if (violent) {
    templatePool = DEATH_TEMPLATES.violent.pool;
    baseStrength = 0.6 + Math.random() * 0.3 + resourceBonus * 0.1;
  } else if (peaceful) {
    templatePool = DEATH_TEMPLATES.peaceful.pool;
    baseStrength = 0.45 + Math.random() * 0.25 + resourceBonus * 0.1;
  } else {
    templatePool = DEATH_TEMPLATES.peaceful.pool;
    baseStrength = 0.35 + Math.random() * 0.25 + resourceBonus * 0.1;
  }
  const value = pickRandom3(templatePool);
  const origin = { lifeId: soulState.id || `life_${soulState.livesLived}`, eventId: deathEvent.id || "death_event", era: deathEvent.era || "UNKNOWN", age: deathEvent.age || soulState.totalYearsLived || 0 };
  return createFragment(violent ? "fear" : "tone", value, clamp(baseStrength, 0, 1), origin, deathEvent.cascadeTags || [], false);
}
function extractRelationshipFragment(lifeEvents, soulState, resourceBonus = 0) {
  const relEvent = getDefiningRelationship(lifeEvents);
  if (!relEvent) return null;
  const relType = getRelationshipType(relEvent);
  const templatePool = RELATIONSHIP_TEMPLATES[relType].pool;
  const value = pickRandom3(templatePool);
  const significance = relEvent.relationshipSignificance || 0.5;
  const baseStrength = clamp(0.3 + significance * 0.5 + Math.random() * 0.2 + resourceBonus * 0.15, 0, 1);
  const origin = { lifeId: soulState.id || `life_${soulState.livesLived}`, eventId: relEvent.id || "relationship_event", era: relEvent.era || "UNKNOWN", age: relEvent.age || 0 };
  return createFragment("love", value, baseStrength, origin, relEvent.cascadeTags || [], false);
}
function extractEmotionalTagFragment(lifeEvents, soulState, resourceBonus = 0) {
  const dominantTag = getMostFrequentTag(lifeEvents);
  if (!dominantTag) return null;
  const emotionCategory = getEmotionCategory(dominantTag);
  const templatePool = EMOTIONAL_TAG_TEMPLATES[emotionCategory].pool;
  const value = pickRandom3(templatePool);
  const tagCount = lifeEvents.reduce((sum, e) => sum + (e.cascadeTags || []).filter((t) => t.toLowerCase() === dominantTag.toLowerCase()).length, 0);
  const baseStrength = clamp(0.2 + tagCount * 0.05 + Math.random() * 0.2 + resourceBonus * 0.15, 0, 1);
  const mostIntense = getMostIntenseEvent(lifeEvents);
  const origin = { lifeId: soulState.id || `life_${soulState.livesLived}`, eventId: mostIntense ? mostIntense.id : "emotional_peak", era: mostIntense ? mostIntense.era : "UNKNOWN", age: mostIntense ? mostIntense.age : 0 };
  return createFragment(EMOTIONAL_TAG_TEMPLATES[emotionCategory].type, value, baseStrength, origin, [dominantTag], false);
}
function extractMemorableEventFragment(lifeEvents, soulState, resourceBonus = 0) {
  const memorable = getMostIntenseEvent(lifeEvents);
  if (!memorable) return null;
  const eventCategory = getEventCategory(memorable);
  const templatePool = MEMORABLE_EVENT_TEMPLATES[eventCategory].pool;
  const value = pickRandom3(templatePool);
  const intensity = memorable.intensity || memorable.emotionalIntensity || 0.5;
  const baseStrength = clamp(0.3 + intensity * 0.4 + Math.random() * 0.2 + resourceBonus * 0.15, 0, 1);
  const origin = { lifeId: soulState.id || `life_${soulState.livesLived}`, eventId: memorable.id || "memorable_event", era: memorable.era || "UNKNOWN", age: memorable.age || 0 };
  return createFragment(MEMORABLE_EVENT_TEMPLATES[eventCategory].type, value, baseStrength, origin, memorable.cascadeTags || [], false);
}
function extractWhisperFragment(soulState) {
  const template = pickRandom3(WHISPER_TEMPLATES);
  const origin = { lifeId: soulState.id || `life_${soulState.livesLived}`, eventId: "whisper", era: "UNKNOWN", age: soulState.totalYearsLived || 0 };
  return createFragment(template.type, template.value, 0.1 + Math.random() * 0.2, origin, [], false);
}
function extractFragments(lifeEvents, deathEvent, soulState, resourceBonus = 0) {
  const newFragments = [];
  const deathFragment = extractDeathFragment(deathEvent, soulState, resourceBonus);
  if (deathFragment) newFragments.push(deathFragment);
  const relationshipFragment = extractRelationshipFragment(lifeEvents, soulState, resourceBonus);
  if (relationshipFragment) newFragments.push(relationshipFragment);
  const emotionalTagFragment = extractEmotionalTagFragment(lifeEvents, soulState, resourceBonus);
  if (emotionalTagFragment) newFragments.push(emotionalTagFragment);
  const memorableFragment = extractMemorableEventFragment(lifeEvents, soulState, resourceBonus);
  if (memorableFragment) newFragments.push(memorableFragment);
  if (Math.random() < WHISPER_CHANCE) {
    const whisper = extractWhisperFragment(soulState);
    if (whisper) newFragments.push(whisper);
  }
  return { newFragments };
}
function mergeFragment(soulState, newFragment) {
  const emotionalTagToType = {
    grief: "grief",
    sadness: "grief",
    sorrow: "grief",
    mourning: "grief",
    loss: "grief",
    despair: "grief",
    melancholy: "grief",
    love: "love",
    connection: "love",
    tenderness: "love",
    affection: "love",
    devotion: "love",
    passion: "love",
    romance: "love",
    dread: "dread",
    fear: "dread",
    terror: "dread",
    vertigo: "dread",
    anxiety: "dread",
    panic: "dread",
    horror: "dread",
    wonder: "wonder",
    awe: "wonder",
    discovery: "wonder",
    curiosity: "wonder",
    marvel: "wonder",
    rage: "rage",
    anger: "rage",
    betrayal: "rage",
    fury: "rage",
    resentment: "rage",
    wrath: "rage",
    grace: "grace",
    resignation: "grace",
    acceptance: "grace",
    peace: "grace",
    surrender: "grace"
  };
  if (!soulState.emotionalTypeCounts) {
    soulState.emotionalTypeCounts = { grief: 0, love: 0, dread: 0, wonder: 0, rage: 0, grace: 0 };
  }
  if (newFragment.cascadeTags) {
    for (const tag of newFragment.cascadeTags) {
      const emotionalType = emotionalTagToType[tag.toLowerCase()];
      if (emotionalType) {
        soulState.emotionalTypeCounts[emotionalType] = (soulState.emotionalTypeCounts[emotionalType] || 0) + 1;
      }
    }
  }
  let effectiveStrength = newFragment.strength;
  if (newFragment.cascadeTags && newFragment.cascadeTags.length > 0) {
    const totalTags = Object.values(soulState.emotionalTypeCounts || { grief: 0, love: 0, dread: 0, wonder: 0, rage: 0, grace: 0 }).reduce((a, b) => a + b, 0);
    if (totalTags > 0) {
      const emotionalTags = newFragment.cascadeTags.map((t) => emotionalTagToType[t.toLowerCase()]).filter(Boolean);
      if (emotionalTags.length > 0) {
        const primaryEmotion = emotionalTags[0];
        const emotionCount = soulState.emotionalTypeCounts[primaryEmotion] || 0;
        if (totalTags > 0 && emotionCount / totalTags > FRAGMENT_SATURATION_THRESHOLD) {
          effectiveStrength *= FRAGMENT_SATURATION_MULTIPLIER;
        }
      }
    }
  }
  const existing = soulState.fragments.find((f) => f.type === newFragment.type && f.value === newFragment.value);
  if (existing) {
    const boost = 0.1 + Math.random() * 0.2;
    existing.strength = clamp(existing.strength + boost, 0, 1);
    if (effectiveStrength > existing.strength && !existing.isAnchor) {
      existing.strength = effectiveStrength;
      existing.origin = newFragment.origin;
    }
    if (newFragment.cascadeTags && newFragment.cascadeTags.length > 0) {
      for (const tag of newFragment.cascadeTags) {
        if (!existing.cascadeTags.includes(tag)) existing.cascadeTags.push(tag);
      }
    }
    return existing;
  }
  newFragment.strength = effectiveStrength;
  soulState.fragments.push(newFragment);
  return newFragment;
}
function evaluateAnchors(soulState) {
  const currentAnchors = soulState.fragments.filter((f) => f.isAnchor);
  if (currentAnchors.length >= MAX_ANCHORS) return [];
  const recurrenceMap = {};
  for (const fragment of soulState.fragments) {
    const key = `${fragment.type}:${fragment.value}`;
    if (!recurrenceMap[key]) recurrenceMap[key] = { fragment, count: 1, origins: [fragment.origin] };
    else {
      recurrenceMap[key].count += 1;
      recurrenceMap[key].origins.push(fragment.origin);
    }
  }
  const newAnchors = [];
  for (const [key, data] of Object.entries(recurrenceMap)) {
    if (data.count >= ANCHOR_RECURRENCE_THRESHOLD && !data.fragment.isAnchor) {
      if (currentAnchors.length >= MAX_ANCHORS) break;
      data.fragment.isAnchor = true;
      data.fragment.strength = clamp(data.fragment.strength + 0.15, 0, 1);
      currentAnchors.push(data.fragment);
      newAnchors.push(data.fragment);
    }
  }
  soulState.anchors = soulState.fragments.filter((f) => f.isAnchor);
  return newAnchors;
}
function checkEraUnlocks(soulState) {
  const totalFragments = soulState.fragments.length;
  const unlocked = new Set(soulState.unlockedEras || ["ANCIENT", "MEDIEVAL"]);
  const newlyUnlocked = [];
  for (const { threshold, era } of ERA_UNLOCK_THRESHOLDS) {
    if (totalFragments >= threshold && !unlocked.has(era)) {
      unlocked.add(era);
      newlyUnlocked.push(era);
    }
  }
  soulState.unlockedEras = Array.from(unlocked);
  if (!soulState.recentlyUnlockedEras) soulState.recentlyUnlockedEras = [];
  for (const era of newlyUnlocked) {
    if (!soulState.recentlyUnlockedEras.find((e) => e.era === era)) {
      soulState.recentlyUnlockedEras.push({ era, remainingLives: 5 });
    }
  }
}
function getSoulCompletionStatus(soulState) {
  if (!soulState) return { complete: false, fragmentTypes: 0, crises: 0, eras: 0, anchors: 0, fragmentTypeDetails: {}, enlightenmentEligible: false };
  const req = COMPLETION_REQUIREMENTS;
  const fragmentTypes = /* @__PURE__ */ new Set();
  const fragmentTypeDetails = { grief: false, love: false, dread: false, wonder: false, rage: false, grace: false };
  for (const frag of soulState.fragments) {
    const tags = frag.cascadeTags || [];
    const emotionMap = {
      grief: ["grief", "sadness", "sorrow", "mourning", "loss", "despair", "melancholy"],
      love: ["love", "connection", "tenderness", "affection", "devotion", "passion", "romance"],
      dread: ["dread", "vertigo", "fear", "terror", "anxiety", "panic", "horror"],
      wonder: ["wonder", "awe", "discovery", "curiosity", "marvel"],
      rage: ["rage", "anger", "betrayal", "fury", "wrath", "resentment"],
      grace: ["grace", "resignation", "acceptance", "peace", "surrender"]
    };
    for (const [emotion, keywords] of Object.entries(emotionMap)) {
      if (keywords.some((kw) => tags.some((t) => t.toLowerCase().includes(kw)))) {
        fragmentTypeDetails[emotion] = true;
        fragmentTypes.add(emotion);
      }
    }
  }
  const erasVisited = soulState.erasVisited || [];
  const crises = soulState.metaStats?.crisesSurvived || 0;
  const anchors = soulState.anchors?.length || 0;
  const lives = soulState.livesLived || 0;
  const enlightenmentEligible = lives >= req.enlightenmentMinLives && anchors <= req.enlightenmentMaxAnchors;
  const complete = fragmentTypes.size >= req.minFragmentTypes && crises >= req.crisesNeeded && erasVisited.length >= req.erasNeeded && anchors >= req.anchorsNeeded;
  return {
    complete,
    fragmentTypes: fragmentTypes.size,
    crises,
    eras: erasVisited.length,
    anchors,
    lives,
    fragmentTypeDetails,
    enlightenmentEligible
  };
}
function checkAndTriggerSoulCompletion(soulState) {
  if (!soulState || soulState.soulComplete || soulState.soulCompletePending) return false;
  const status = getSoulCompletionStatus(soulState);
  if (status.complete) {
    soulState.soulCompletePending = true;
    return true;
  }
  return false;
}
function markSoulComplete(soulState, isEnlightenment = false) {
  if (!soulState) return;
  soulState.soulCompletePending = false;
  soulState.soulComplete = true;
  if (isEnlightenment) soulState.enlightenmentAchieved = true;
}
function applyFragmentEffects(soulState, fragments, lifeEra = null) {
  if (!soulState.fragments) soulState.fragments = [];
  if (!soulState.anchors) soulState.anchors = [];
  if (!soulState.unlockedEras) soulState.unlockedEras = ["ANCIENT", "MEDIEVAL"];
  if (!soulState.metaStats) soulState.metaStats = { totalDeaths: 0, violentDeaths: 0, peacefulDeaths: 0, lovesLost: 0, childrenBorn: 0 };
  if (!soulState.anchorExhausted) soulState.anchorExhausted = [];
  if (!soulState.eraLivesCount) soulState.eraLivesCount = {};
  if (!soulState.recentlyUnlockedEras) soulState.recentlyUnlockedEras = [];
  for (const fragment of fragments) mergeFragment(soulState, fragment);
  const newAnchors = evaluateAnchors(soulState);
  const previouslyUnlocked = new Set(soulState.unlockedEras);
  checkEraUnlocks(soulState);
  for (const entry of soulState.recentlyUnlockedEras) {
    if (entry.remainingLives > 0) entry.remainingLives -= 1;
  }
  soulState.recentlyUnlockedEras = soulState.recentlyUnlockedEras.filter((e) => e.remainingLives > 0);
  if (lifeEra) {
    soulState.eraLivesCount[lifeEra] = (soulState.eraLivesCount[lifeEra] || 0) + 1;
  }
  if (!soulState.erasVisited) soulState.erasVisited = [];
  if (lifeEra && !soulState.erasVisited.includes(lifeEra)) {
    soulState.erasVisited.push(lifeEra);
  }
  soulState.livesLived = (soulState.livesLived || 0) + 1;
  return { newAnchors };
}
function createSoulState2(id) {
  return {
    id: id || `soul_${Date.now()}`,
    livesLived: 0,
    totalYearsLived: 0,
    fragments: [],
    anchors: [],
    unlockedEras: ["ANCIENT", "MEDIEVAL"],
    achievementsUnlocked: [],
    achievementNotifications: [],
    metaStats: { totalDeaths: 0, violentDeaths: 0, peacefulDeaths: 0, lovesLost: 0, childrenBorn: 0, crisesSurvived: 0, peaksSurvived: 0, memoryBleeds: 0, resonancePairs: 0 },
    bonusFragmentSlots: 0,
    specialUnlocks: {},
    anchorExhausted: [],
    whisperTicksSinceLastWhisper: 0,
    emotionalTypeCounts: { grief: 0, love: 0, dread: 0, wonder: 0, rage: 0, grace: 0 },
    erasVisited: [],
    eraLivesCount: {},
    recentlyUnlockedEras: [],
    soulComplete: false,
    soulCompletePending: false,
    enlightenmentAchieved: false
  };
}
function weightedRandom2(items) {
  if (items.length === 0) return null;
  if (items.length === 1) return items[0];
  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
  let random = Math.random() * totalWeight;
  for (const item of items) {
    random -= item.weight || 1;
    if (random <= 0) return item;
  }
  return items[items.length - 1];
}
function getUnlockedEras2(fragmentCount) {
  if (fragmentCount >= 10) return ERA_ORDER2.slice();
  const unlockedCount = Math.max(2, Math.min(fragmentCount + 2, ERA_ORDER2.length));
  return ERA_ORDER2.slice(0, unlockedCount);
}
function buildEraWeights(fragmentCount, soulState = {}) {
  const unlocked = getUnlockedEras2(fragmentCount);
  const weights = [];
  for (const eraId of ERA_ORDER2) {
    if (!unlocked.includes(eraId)) continue;
    const eraIndex = ERA_ORDER2.indexOf(eraId);
    let weight;
    if (fragmentCount === 0) {
      if (eraId === "ANCIENT") weight = 70;
      else if (eraId === "MEDIEVAL") weight = 25;
      else if (eraId === "EARLY_MODERN") weight = 5;
      else weight = 0;
    } else if (fragmentCount < 8) {
      weight = Math.max(1, 20 - eraIndex * 4);
    } else if (fragmentCount < 18) {
      const midPoint = Math.floor(ERA_ORDER2.length / 2);
      weight = Math.max(1, 10 - Math.abs(eraIndex - midPoint) * 2);
    } else {
      weight = 10;
    }
    if (weight > 0) {
      if (soulState?.recentlyUnlockedEras) {
        const recentEntry = soulState.recentlyUnlockedEras.find((e) => e.era === eraId);
        if (recentEntry && recentEntry.remainingLives > 0) {
          const decayFactor = recentEntry.remainingLives / 5;
          weight += 20 * decayFactor;
        }
      }
      if (soulState?.eraLivesCount?.[eraId] >= 3) {
        weight += 10;
      }
      weights.push({ eraId, weight });
    }
  }
  return weights;
}
function generateName(era, genderPresentation) {
  const eraData = ERAS2[era];
  if (!eraData) return { firstName: "Unknown", lastName: "" };
  let poolKey = genderPresentation === "female" ? "female" : "male";
  const firstNamePool = eraData.firstNamePool[poolKey] || eraData.firstNamePool.male;
  const firstNameEntry = weightedRandom2(firstNamePool);
  const lastNameEntry = weightedRandom2(eraData.lastNamePool);
  return { firstName: firstNameEntry ? firstNameEntry.name : "Unknown", lastName: lastNameEntry ? lastNameEntry.name : "" };
}
function generateBody(era) {
  const eraData = ERAS2[era];
  if (!eraData) return { health: "healthy", socialClass: "unknown" };
  return { health: (weightedRandom2(eraData.bodyConditions) || {}).condition || "healthy", socialClass: (weightedRandom2(eraData.socialClasses) || {}).cls || "unknown" };
}
function generateLocation(era) {
  const eraData = ERAS2[era];
  if (!eraData || eraData.locationPool.length === 0) return { city: "Unknown", region: "Unknown", country: "Unknown" };
  const location = weightedRandom2(eraData.locationPool);
  return { city: location.city, region: location.region, country: location.country };
}
function generateYear(era) {
  const eraData = ERAS2[era];
  if (!eraData) return 2e3;
  const [min, max] = eraData.yearRange;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function rollSoulLife(soulState) {
  const fragmentCount = soulState.fragments ? soulState.fragments.length : 0;
  const eraWeights = buildEraWeights(fragmentCount, soulState);
  const eraEntry = weightedRandom2(eraWeights);
  const era = eraEntry ? eraEntry.eraId : "ANCIENT";
  const year = generateYear(era);
  const location = generateLocation(era);
  const genderOptions = ["male", "female", "ambiguous", "multiple"];
  const genderWeights = [40, 40, 12, 8];
  let genderRandom = Math.random() * 100, genderPresentation = "male", cumulative = 0;
  for (let i = 0; i < genderOptions.length; i++) {
    cumulative += genderWeights[i];
    if (genderRandom <= cumulative) {
      genderPresentation = genderOptions[i];
      break;
    }
  }
  const { firstName, lastName } = generateName(era, genderPresentation);
  const fullName = lastName ? `${firstName} ${lastName}` : firstName;
  const body = generateBody(era);
  return { life: { era, year, location, name: fullName, genderPresentation, health: body.health, socialClass: body.socialClass }, eraUnlocked: getUnlockedEras2(fragmentCount).includes(era) };
}
function getEraSignature2(era) {
  const eraData = ERAS2[era];
  return eraData ? eraData.eventSignature : "The world turns without you.";
}
function getMortalityRate3(age) {
  const bucket = MORTALITY_CURVE2.find((b) => age >= b.minAge && age <= b.maxAge);
  return bucket ? bucket.rate : 80;
}
function getLifePhase2(age) {
  for (const [name, range] of Object.entries(LIFE_PHASES2)) {
    if (age >= range.min && age <= range.max) return name;
  }
  return "ANCIENT";
}
function resolveTemplate2(text, vars) {
  if (!text) return "";
  return text.replace(/\{(name|location|era|phase|anchor)\}/g, (match, key) => vars[key] !== void 0 ? vars[key] : match);
}
function eventTick2(lifeState, soulFragments, cascadeTags = []) {
  const age = lifeState.age;
  const mortalityRate = getMortalityRate3(age);
  const phase = getLifePhase2(age);
  let nextTickYears;
  if (age <= 4) nextTickYears = 1;
  else if (age <= 14) nextTickYears = 3;
  else if (age <= 24) nextTickYears = 2;
  else if (age <= 64) nextTickYears = 3;
  else if (age <= 84) nextTickYears = 2;
  else nextTickYears = 1;
  const deathProbability = mortalityRate / 1e3 * nextTickYears;
  const died = Math.random() < deathProbability;
  if (died) {
    const eligibleDeaths = DEATH_EVENTS2.filter((d) => d.eras.includes(lifeState.era) && d.phases.includes(phase));
    const deathEvent = eligibleDeaths.length > 0 ? eligibleDeaths[Math.floor(Math.random() * eligibleDeaths.length)] : DEATH_EVENTS2.find((d) => d.eras.includes(lifeState.era));
    const deathCause = deathEvent ? deathEvent.title : "Unknown causes";
    return { ageReached: age + nextTickYears, died: true, deathCause, event: deathEvent ? { ...deathEvent, description: resolveTemplate2(deathEvent.description, { name: lifeState.name || "You", location: lifeState.location || "here", era: lifeState.era, phase, anchor: lifeState.anchor || "" }) } : null, nextTickYears };
  }
  if (Math.random() > 0.75) {
    return { ageReached: age + nextTickYears, died: false, deathCause: null, event: null, nextTickYears };
  }
  const event = selectNextEvent2(lifeState, soulFragments, cascadeTags);
  if (!event) {
    return { ageReached: age + nextTickYears, died: false, deathCause: null, event: null, nextTickYears };
  }
  const resolvedEvent = { ...event, description: resolveTemplate2(event.description, { name: lifeState.name || "You", location: lifeState.location || "here", era: lifeState.era, phase, anchor: lifeState.anchor || "" }) };
  return { ageReached: age + nextTickYears, died: false, deathCause: null, event: resolvedEvent, nextTickYears };
}
function selectNextEvent2(lifeState, soulFragments, cascadeTags = []) {
  const phase = getLifePhase2(lifeState.age);
  const era = lifeState.era;
  const pool = EVENT_POOLS2[era];
  if (!pool || pool.length === 0) return null;
  const firedLandmarks = state.landmarkEventsFired || [];
  const eligible = pool.filter(
    (e) => e.eras.includes(era) && e.phases.includes(phase) && (!e.landmark || !firedLandmarks.includes(e.id)) && Math.random() < e.triggerProbability
  );
  if (eligible.length === 0) {
    const relaxed = pool.filter(
      (e) => e.eras.includes(era) && e.phases.includes(phase) && (!e.landmark || !firedLandmarks.includes(e.id))
    );
    if (relaxed.length === 0) return null;
    return weightedRandom2(relaxed.map((e) => ({ item: e, weight: e.weight })))?.item || null;
  }
  const scored = eligible.map((event) => {
    let score = event.weight;
    if (event.cascadeTags && cascadeTags.length > 0) {
      const matchingTags = event.cascadeTags.filter((t) => cascadeTags.includes(t));
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
  return weightedRandom2(scored.map((s) => ({ item: s.event, weight: s.score })))?.item || null;
}
function getWhisperFrequency2(soulState, currentPhase) {
  const fragmentCount = soulState.fragments ? soulState.fragments.length : 0;
  let freq = Math.min(0.12 * fragmentCount, WHISPER_MAX_FREQUENCY);
  if (soulState.anchors) freq += soulState.anchors.length * 0.08;
  const era = state.currentLife ? state.currentLife.era : "ANCIENT";
  if (era === "ANCIENT" || era === "MEDIEVAL") freq *= 1.3;
  if (era === "INDUSTRIAL") freq *= 1.2;
  if (era === "FAR_FUTURE") freq *= 1.5;
  if (currentPhase === "MIDDLE_AGE" || currentPhase === "SENIOR" || currentPhase === "ANCIENT") freq *= 1.5;
  if (currentPhase === "INFANT" || currentPhase === "CHILD") freq *= 0.4;
  if (currentPhase === "ADOLESCENT" || currentPhase === "YOUNG_ADULT") freq *= 1.2;
  const totalFragmentCount = soulState.fragments?.length || 0;
  if (totalFragmentCount >= FRAGMENT_OVERLOAD_THRESHOLD) {
    freq *= 1 - FRAGMENT_OVERLOAD_PENALTY;
  }
  if (soulState.whisperTicksSinceLastWhisper < WHISPER_COOLDOWN_TICKS) {
    freq = 0;
  }
  return Math.min(freq, WHISPER_MAX_FREQUENCY);
}
function selectWhisperingFragment2(soulState, currentEra, currentPhase, recentFragmentIds) {
  const eligible = soulState.fragments.filter((f) => {
    if (recentFragmentIds.includes(f.id)) return false;
    if (f.strength < 0.25) return false;
    return true;
  });
  if (eligible.length === 0) return null;
  const phaseTagMap = {
    INFANT: ["tenderness", "anchor", "numbness"],
    CHILD: ["wonder", "awe", "grief"],
    ADOLESCENT: ["awakening", "rage", "dread", "connection"],
    YOUNG_ADULT: ["love", "connection", "dread", "vertigo"],
    MIDDLE_AGE: ["resignation", "grief", "grace", "rage"],
    SENIOR: ["resignation", "grace", "dissolution"],
    ANCIENT: ["dissolution", "vertigo", "grace"]
  };
  const phaseTags = phaseTagMap[currentPhase] || [];
  const weights = eligible.map((f) => {
    let w = f.strength;
    if (f.origin && f.origin.era === currentEra) w *= 1.8;
    if (f.isAnchor) w *= 1.5;
    const lifeNum = f.origin?.lifeId?.split("_").pop() || 0;
    if ((soulState.livesLived || 0) - parseInt(lifeNum) <= 3) w *= 1.4;
    const fragmentTags = f.cascadeTags || [];
    const phaseMatch = fragmentTags.some((t) => phaseTags.includes(t));
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
function generateWhisperEvent2(fragment, era, currentAge) {
  const biasTags = fragment.cascadeTags || [];
  const typeBias = fragment.type === "fear" ? ["dread", "danger", "threat"] : fragment.type === "love" ? ["connection", "tenderness", "longing"] : fragment.type === "tone" ? ["melancholy", "resignation", "wonder"] : ["fate", "coincidence", "sign"];
  const pool = EVENT_POOLS2[era] || EVENT_POOLS2["ANCIENT"] || [];
  const eligibleEvents = pool.filter(
    (e) => e.cascadeTags && e.cascadeTags.some((t) => [...biasTags, ...typeBias].includes(t))
  );
  if (eligibleEvents.length > 0) {
    const chosen = pickRandom3(eligibleEvents);
    return {
      id: `whisper_${Date.now()}`,
      title: chosen.title,
      era,
      age: currentAge,
      category: "whisper",
      intensity: 0.3,
      cascadeTags: [...chosen.cascadeTags || [], ...fragment.cascadeTags || [], fragment.type],
      description: resolveTemplate2(chosen.description, { name: state.currentLife?.name || "You", location: state.currentLife?.location?.city || "here", era, phase: getLifePhase2(currentAge), anchor: "" }),
      isWhisperEvent: true,
      sourceFragmentId: fragment.id
    };
  }
  return createWhisperEvent2(fragment, era, currentAge);
}
function createWhisperEvent2(fragment, era, currentAge) {
  const templates = {
    tone: `The whisper "${fragment.value}" becomes a memory you can't place.`,
    fear: `A chill follows you. ${fragment.value}.`,
    love: `You think of ${fragment.value}. Someone should be here for this.`,
    location: `You find yourself walking toward ${fragment.value}. You don't remember deciding to go.`,
    word: `The word ${fragment.value} keeps surfacing. You don't know why.`,
    object: `Something about ${fragment.value} pulls at you.`,
    warning: `${fragment.value}. You feel it in your chest before you understand it.`
  };
  const template = templates[fragment.type] || templates.tone;
  return {
    id: `whisper_${Date.now()}`,
    title: "Fragment Resonates",
    era,
    age: currentAge,
    category: "whisper",
    intensity: 0.3,
    cascadeTags: [...fragment.cascadeTags || [], fragment.type],
    description: template,
    isWhisperEvent: true,
    sourceFragmentId: fragment.id
  };
}
function showWhisperPanel2(fragment) {
  const panel = document.getElementById("whisper-panel");
  if (!panel) return;
  const isAnchor = fragment.isAnchor;
  panel.className = `whisper-panel visible${isAnchor ? " anchor-whisper" : ""}`;
  document.getElementById("whisper-icon").textContent = FRAGMENT_TYPE_ICONS2[fragment.type] || "\xE2\u2122\xAA";
  document.getElementById("whisper-label").textContent = isAnchor ? "An anchor fragment resonates..." : "Fragment whispers...";
  document.getElementById("whisper-anchor-badge").style.display = isAnchor ? "inline" : "none";
  document.getElementById("whisper-value").textContent = `"${fragment.value}"`;
  const actBtn = document.getElementById("whisper-act-btn");
  actBtn.textContent = isAnchor ? "Embrace" : "Act";
  actBtn.className = `whisper-btn act${isAnchor ? " embrace" : ""}`;
  panel.style.display = "block";
  state.whisperTimeLeft = 8e3;
  const timerFill = document.getElementById("whisper-timer-fill");
  timerFill.style.width = "100%";
  if (state.whisperTimer) clearInterval(state.whisperTimer);
  state.whisperTimer = setInterval(() => {
    state.whisperTimeLeft -= 100;
    const pct = state.whisperTimeLeft / 8e3 * 100;
    timerFill.style.width = `${Math.max(0, pct)}%`;
    if (state.whisperTimeLeft <= 0) {
      handleWhisperIgnore2();
    }
  }, 100);
}
function hideWhisperPanel2() {
  const panel = document.getElementById("whisper-panel");
  if (!panel) return;
  panel.classList.remove("visible");
  panel.style.display = "none";
  if (state.whisperTimer) {
    clearInterval(state.whisperTimer);
    state.whisperTimer = null;
  }
}
function handleWhisperAct2() {
  if (!state.currentWhisper) return;
  const fragment = state.currentWhisper;
  hideWhisperPanel2();
  const whisperEvent = generateWhisperEvent2(fragment, state.currentLife.era, state.currentAge);
  const eventWithAge = { ...whisperEvent, age: state.currentAge, era: state.currentLife.era };
  state.lifeEvents.push(eventWithAge);
  displayEvent(whisperEvent);
  state.eventMarkers.push({ age: state.currentAge, rate: getMortalityRate3(Math.min(state.currentAge, 100)) });
  const chainResult = detectChain(eventWithAge, state.lifeEvents);
  if (chainResult.chainEvent) {
    if (!state.activeChain || state.activeChain.type !== chainResult.chainType) {
      state.activeChain = { type: chainResult.chainType, events: [], color: CHAIN_COLORS2[chainResult.chainType] };
    }
    if (!state.activeChain.events.find((ev) => ev.id === eventWithAge.id)) {
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
  if (fragment.strength !== void 0) {
    fragment.strength = clamp(fragment.strength * WHISPER_DECAY_MULTIPLIER, 0, 1);
  }
  if (fragment.isAnchor && state.soul) {
    if (!state.soul.anchorExhausted) state.soul.anchorExhausted = [];
    if (!state.soul.anchorExhausted.includes(fragment.id)) {
      state.soul.anchorExhausted.push(fragment.id);
    }
  }
  if (state.soul) {
    state.soul.whisperTicksSinceLastWhisper = 0;
  }
  state.currentWhisper = null;
  state.whisperCooldown = 20 + Math.floor(Math.random() * 21);
}
function handleWhisperIgnore2() {
  if (!state.currentWhisper) return;
  const fragment = state.currentWhisper;
  hideWhisperPanel2();
  if (fragment.isAnchor) {
    if (state.soul && state.soul.emotionalShift !== void 0) {
      state.soul.emotionalShift = Math.max(-1, state.soul.emotionalShift - 0.05);
    } else if (state.soul) {
      state.soul.emotionalShift = -0.05;
    }
  }
  state.currentWhisper = null;
  state.whisperCooldown = 20 + Math.floor(Math.random() * 21);
}
function modifyResourcesForEvent2(event) {
  if (!event || !event.cascadeTags) return;
  const tags = event.cascadeTags.map((t) => t.toLowerCase());
  for (const [resource, keywords] of Object.entries(RESOURCE_BUILDERS2)) {
    for (const kw of keywords) {
      if (tags.some((t) => t.includes(kw))) {
        state[resource] = Math.min(3, state[resource] + 1);
      }
    }
  }
  for (const [resource, keywords] of Object.entries(RESOURCE_DEPLETERS2)) {
    for (const kw of keywords) {
      if (tags.some((t) => t.includes(kw))) {
        state[resource] = Math.max(0, state[resource] - 1);
      }
    }
  }
  updateResourceDisplay2();
}
function updateResourceDisplay2() {
  const el = document.getElementById("resource-display");
  if (!el) return;
  const c = state.connection, v = state.vitality, m = state.momentum;
  const dot = (n) => "\xE2\u2014\x8F".repeat(n) + "\xE2\u2014\u2039".repeat(3 - n);
  el.innerHTML = `Lives: ${state.soul?.livesLived || 0} &nbsp;|&nbsp; <span style="color:var(--chain-love)">${dot(c)}</span> Con &nbsp; <span style="color:var(--cyan)">${dot(v)}</span> Vit &nbsp; <span style="color:var(--amber)">${dot(m)}</span> Mom`;
}
function animateResourceChange(resource, delta) {
  const el = document.getElementById("resource-display");
  if (!el) return;
  const existing = el.querySelector(`.resource-change-${resource}`);
  if (existing) existing.remove();
  const indicator = document.createElement("span");
  indicator.className = `resource-change-indicator resource-change-${resource}`;
  indicator.textContent = delta > 0 ? `+${delta}` : `${delta}`;
  indicator.style.cssText = `
    color: ${delta > 0 ? "#44ff88" : "#ff4466"};
    font-size: 0.75em;
    font-weight: bold;
    margin-left: 4px;
    animation: resourcePopFade 1.2s ease-out forwards;
    pointer-events: none;
    display: inline-block;
  `;
  el.appendChild(indicator);
  setTimeout(() => indicator.remove(), 1200);
}
function isCrisisEvent2(event) {
  if (!event) return false;
  const intensity = event.intensity || event.emotionalIntensity || 0;
  const hasChoices = event.choices && event.choices.length > 0;
  return (intensity >= CRITICAL_INTENSITY2 || event.crisis || event.crisisTag) && !event.isDeathEvent && !event.isCrisisHandled && hasChoices;
}
function resolveCrisisChoice2(choiceKey, event, { eraModifiers } = {}) {
  const choiceMap = { A: "intervene", B: "pray", C: "watch" };
  const choiceId = choiceMap[choiceKey];
  if (!choiceId) return resolveCrisisChoice2("C", event, { eraModifiers });
  const choice = CRISIS_CHOICES2[choiceId];
  const era = state.currentLife?.era || "ANCIENT";
  let baseSuccessProb = choice.outcomes.success.probability;
  const eraMod = choice.eraModifiers?.[era] ?? 0;
  let finalSuccessProb = baseSuccessProb + eraMod;
  const vitalityMod = state.vitality === 3 ? 0.1 : state.vitality <= 1 ? -0.1 : 0;
  const connectionMod = state.connection === 3 ? 0.05 : state.connection <= 1 ? -0.05 : 0;
  const lowResourcePenalty = state.vitality <= 1 || state.connection <= 1 ? -0.1 : 0;
  if (choiceId === "pray") {
    finalSuccessProb += connectionMod;
  } else if (choiceId === "intervene") {
    finalSuccessProb += vitalityMod + lowResourcePenalty;
  } else {
    finalSuccessProb += vitalityMod * 0.5;
  }
  const deathRiskBonus = state.momentum <= 1 ? 0.08 : 0;
  if (era === "FAR_FUTURE") {
    finalSuccessProb = baseSuccessProb + (Math.random() < 0.5 ? -0.1 : 0.1);
  }
  finalSuccessProb = Math.max(0.05, Math.min(0.95, finalSuccessProb));
  const roll = Math.random();
  const isSuccess = roll < finalSuccessProb;
  const outcome = isSuccess ? choice.outcomes.success : choice.outcomes.failure;
  event.isCrisisHandled = true;
  const effectiveDeathChance = (outcome.effect.deathChance || 0) + (state.vitality <= 1 ? deathRiskBonus : 0);
  if (effectiveDeathChance > 0 && Math.random() < effectiveDeathChance) {
    triggerImmediateDeath2(outcome.effect.cascadeTags || []);
    return;
  }
  if (state.soul?.metaStats) {
    state.soul.metaStats.crisesSurvived = (state.soul.metaStats.crisesSurvived || 0) + 1;
  }
  if (outcome.effect.cascadeTags && outcome.effect.cascadeTags.length > 0) {
    state.cascadeTags = [.../* @__PURE__ */ new Set([...state.cascadeTags, ...choice.cascadeBias, ...outcome.effect.cascadeTags])];
  } else if (choice.cascadeBias) {
    state.cascadeTags = [.../* @__PURE__ */ new Set([...state.cascadeTags, ...choice.cascadeBias])];
  }
  if (outcome.effect.emotionalShift) {
    state.emotionalShift = (state.emotionalShift || 0) + outcome.effect.emotionalShift;
  }
  if (isSuccess) {
    if (choiceId === "watch") {
      animateResourceChange("connection", 1);
    } else if (choiceId === "intervene") {
      animateResourceChange("vitality", 1);
    }
  }
  const connectionPenaltyReduction = state.connection === 3 ? 0.05 : 0;
  if (!isSuccess && outcome.effect.emotionalShift && state.connection === 3) {
    outcome.effect.emotionalShift = Math.min(outcome.effect.emotionalShift + connectionPenaltyReduction, 0);
  }
  if (outcome.effect.divineBonus && isSuccess) {
    state.faith = (state.faith || 0) + 1;
    animateResourceChange("faith", 1);
    if (state.soul?.fragments?.length > 0) {
      const lastFrag = state.soul.fragments[state.soul.fragments.length - 1];
      if (lastFrag && lastFrag.strength !== void 0) {
        lastFrag.strength = Math.min(1.5, (lastFrag.strength || 1) + 0.2);
      }
    }
  }
  if (outcome.effect.fragmentInsight && isSuccess) {
    if (state.soul?.fragments?.length > 0) {
      const lastFrag = state.soul.fragments[state.soul.fragments.length - 1];
      if (lastFrag) {
        lastFrag.strength = Math.min(1.5, (lastFrag.strength || 1) + 0.15);
        if (!lastFrag.insightFromWatch) {
          lastFrag.insightFromWatch = true;
          state.cascadeTags = [.../* @__PURE__ */ new Set([...state.cascadeTags, "wonder", "awe"])];
        }
      }
    }
  }
  if (outcome.effect.resourceLoss === "momentum" && !isSuccess) {
    animateResourceChange("momentum", -1);
    state.momentum = Math.max(0, (state.momentum || 1) - 1);
    state.cascadeTags = [.../* @__PURE__ */ new Set([...state.cascadeTags, "regret", "lingering"])];
    if (state.emotionalShift !== void 0) {
      state.emotionalShift = Math.max(-1, state.emotionalShift - 0.15);
    }
  }
}
function triggerImmediateDeath2(cascadeTags) {
  const deathEvent = {
    id: "death_crisis_" + Date.now(),
    title: "The crisis claimed you",
    description: "You stepped too close to the fire and it took you.",
    cascadeTags: cascadeTags || ["grief", "vertigo"],
    category: "violence",
    era: state.currentLife.era,
    age: state.currentAge,
    isDeathEvent: true
  };
  state.isAlive = false;
  state.deathEvent = deathEvent;
  clearInterval(state.tickInterval);
  state.tickInterval = null;
  state.lifeEvents.push({ ...deathEvent, age: state.currentAge });
  state.eventMarkers.push({ age: state.currentAge, rate: getMortalityRate3(Math.min(state.currentAge, 100)) });
  const chainResult = detectChain(deathEvent, state.lifeEvents);
  if (chainResult.chainEvent) {
    if (!state.activeChain) {
      state.activeChain = { type: chainResult.chainType, events: [], color: CHAIN_COLORS2[chainResult.chainType] };
    }
    if (!state.activeChain.events.find((ev) => ev.id === deathEvent.id)) {
      state.activeChain.events.push(deathEvent);
    }
  }
  if (state.lifeEvents.length >= 2) {
    state.lifeTheme = generateLifeTheme(state.lifeEvents);
  }
  const { newFragments } = extractFragments(state.lifeEvents, deathEvent, state.soul);
  const { newAnchors } = applyFragmentEffects(state.soul, newFragments, state.currentLife?.era);
  updateUI();
  showFragments(newFragments);
  drawCurve();
  if (newAnchors && newAnchors.length > 0) {
    for (const anchor of newAnchors) {
      setTimeout(() => showDivineToast(`An anchor forms \xE2 \u201D ${anchor.value} has become a core thread of your soul.`, 4500), 800);
    }
  }
  setTimeout(() => showDeathOverlay(deathEvent), 500);
}
function showCrisisPrompt2(event, choices, eraModifiers = {}) {
  const overlay = document.getElementById("crisis-overlay");
  const causeEl = document.getElementById("crisis-cause");
  const choicesEl = document.getElementById("crisis-choices");
  const timerFill = document.getElementById("crisis-timer-fill");
  const timerText = document.getElementById("crisis-timer-text");
  const displayCause = event.description || event.title || "A crisis unfolds.";
  causeEl.textContent = displayCause;
  choicesEl.innerHTML = "";
  const choiceOrder = ["A", "B", "C"];
  const choiceIds = ["intervene", "pray", "watch"];
  choiceOrder.forEach((key, i) => {
    const choice = CRISIS_CHOICES2[choiceIds[i]];
    const btn = document.createElement("button");
    btn.className = "crisis-choice";
    btn.dataset.key = key;
    btn.innerHTML = `
      <span class="choice-key">${key}</span>
      <span class="choice-content">
        <div class="choice-label">${choice.label} \xE2 \u201D ${choice.subtitle}</div>
        <div class="choice-risk">Risk: ${choice.riskDescriptions.join(", ")}</div>
      </span>
    `;
    btn.addEventListener("click", () => handleCrisisChoice2(key));
    choicesEl.appendChild(btn);
  });
  overlay.classList.add("visible");
  if (!state.seenCrisisTip) {
    state.seenCrisisTip = true;
    setTimeout(() => showContextualTip("crisis"), 800);
  }
  let remaining = DEFAULT_CHOICE_TIMEOUT2;
  const interval = setInterval(() => {
    remaining -= 100;
    const pct = remaining / DEFAULT_CHOICE_TIMEOUT2 * 100;
    timerFill.style.width = pct + "%";
    timerText.textContent = `You have ${Math.ceil(remaining / 1e3)} second${Math.ceil(remaining / 1e3) !== 1 ? "s" : ""}...`;
    if (remaining <= 0) {
      clearInterval(interval);
      handleCrisisChoice2("C", true);
    }
  }, 100);
  state.crisisPending = { event, interval, eraModifiers };
}
function hideCrisisPrompt2() {
  const overlay = document.getElementById("crisis-overlay");
  overlay.classList.remove("visible");
  if (state.crisisPending && state.crisisPending.interval) {
    clearInterval(state.crisisPending.interval);
  }
  state.crisisPending = null;
}
function handleCrisisChoice2(key, timedOut = false) {
  if (!state.crisisPending) return;
  const { event, eraModifiers } = state.crisisPending;
  hideCrisisPrompt2();
  if (timedOut) {
    state.cascadeTags = [.../* @__PURE__ */ new Set([...state.cascadeTags, "passivity", "regret", "trauma"])];
    state.emotionalShift = (state.emotionalShift || 0) - 0.3;
    state.momentum = Math.max(0, (state.momentum || 1) - 2);
    if (state.soul?.metaStats) {
      state.soul.metaStats.crisesSurvived = (state.soul.metaStats.crisesSurvived || 0) + 1;
    }
    event.isCrisisHandled = true;
    state.isPaused = false;
    updateUI();
    drawCurve();
    return;
  }
  resolveCrisisChoice2(key, event, { eraModifiers });
  state.isPaused = false;
  updateUI();
  drawCurve();
}
function triggerSoulCompletionEvent() {
  if (!state.soul) return;
  const isEnlightenment = state.soul.livesLived >= COMPLETION_REQUIREMENTS.enlightenmentMinLives && (state.soul.anchors?.length || 0) <= COMPLETION_REQUIREMENTS.enlightenmentMaxAnchors;
  const event = {
    id: "soul_completion_" + Date.now(),
    title: isEnlightenment ? "Enlightenment" : "The thread tightens",
    description: isEnlightenment ? "You have seen a hundred lives pass like morning fog. No anchor held you, nothing tethered you to any life. You watched without grasping. The self was never real. You are free." : "You've woven enough lives to see the shape of the whole. The fragments align. The curve is complete. You are not finished \xE2 \u201D you are whole.",
    cascadeTags: ["wonder", "grace", "completion"],
    category: "landmark",
    era: state.currentLife?.era || "ANCIENT",
    age: state.currentAge,
    isSoulCompletionEvent: true,
    isEnlightenment
  };
  state.isAlive = false;
  state.deathEvent = event;
  if (state.tickInterval) {
    clearInterval(state.tickInterval);
    state.tickInterval = null;
  }
  state.lifeEvents.push({ ...event, age: state.currentAge });
  state.eventMarkers.push({ age: state.currentAge, rate: getMortalityRate3(Math.min(state.currentAge, 100)) });
  const chainResult = detectChain(event, state.lifeEvents);
  if (chainResult.chainEvent) {
    if (!state.activeChain) state.activeChain = { type: chainResult.chainType, events: [], color: CHAIN_COLORS2[chainResult.chainType] };
    if (!state.activeChain.events.find((ev) => ev.id === event.id)) state.activeChain.events.push(event);
  }
  if (state.lifeEvents.length >= 2) state.lifeTheme = generateLifeTheme(state.lifeEvents);
  const resourceBonus = (state.connection + state.vitality + state.momentum) / 9;
  const { newFragments } = extractFragments(state.lifeEvents, event, state.soul, resourceBonus);
  const { newAnchors } = applyFragmentEffects(state.soul, newFragments, state.currentLife?.era);
  markSoulComplete(state.soul, isEnlightenment);
  updateUI();
  showFragments(newFragments);
  drawCurve();
  if (newAnchors && newAnchors.length > 0) {
    for (const anchor of newAnchors) {
      setTimeout(() => showDivineToast(`An anchor forms \xE2 \u201D ${anchor.value} has become a core thread of your soul.`, 4500), 800);
    }
  }
  setTimeout(() => showDeathOverlay(event), 500);
}
function gameTick2() {
  if (!state.isAlive || state.isPaused) return;
  const lifeState = {
    age: state.currentAge,
    era: state.currentLife.era,
    name: state.currentLife.name,
    location: state.currentLife.location.city,
    anchor: ""
  };
  const soulInfluences = { influences: [] };
  const result = eventTick2(lifeState, soulInfluences, state.cascadeTags);
  state.currentAge = result.ageReached;
  if (result.died) {
    state.isAlive = false;
    state.deathEvent = result.event;
    clearInterval(state.tickInterval);
    state.tickInterval = null;
    if (result.event) {
      const deathEventWithAge = { ...result.event, age: state.currentAge, era: state.currentLife.era };
      state.lifeEvents.push(deathEventWithAge);
      state.eventMarkers.push({ age: state.currentAge, rate: getMortalityRate3(Math.min(state.currentAge, 100)) });
      const chainResult = detectChain(deathEventWithAge, state.lifeEvents);
      if (chainResult.chainEvent) {
        if (!state.activeChain) {
          state.activeChain = { type: chainResult.chainType, events: [], color: CHAIN_COLORS2[chainResult.chainType] };
        }
        if (!state.activeChain.events.find((ev) => ev.id === deathEventWithAge.id)) {
          state.activeChain.events.push(deathEventWithAge);
        }
      }
      if (state.lifeEvents.length >= 2) {
        state.lifeTheme = generateLifeTheme(state.lifeEvents);
      }
    }
    const { newFragments } = extractFragments(state.lifeEvents, result.event, state.soul);
    const { newAnchors } = applyFragmentEffects(state.soul, newFragments, state.currentLife?.era);
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
      deathCause: result.event?.title || "Unknown",
      events: [...state.lifeEvents],
      fragments: [...newFragments],
      dominantChain: state.lifeTheme?.theme || null,
      chainRecap: state.lifeTheme ? {
        type: state.lifeTheme.theme,
        label: state.lifeTheme.label,
        events: state.lifeTheme.events || []
      } : null
    });
    if (!state.soul.erasVisited) state.soul.erasVisited = [];
    if (!state.soul.erasVisited.includes(state.currentLife.era)) {
      state.soul.erasVisited.push(state.currentLife.era);
    }
    const completionPending = checkAndTriggerSoulCompletion(state.soul);
    if (completionPending) {
      setTimeout(() => triggerSoulCompletionEvent(), 1200);
    }
    const newAchievements = checkAndUnlockAchievements(state.soul, state.lifeEvents, result.event);
    if (newAchievements.length > 0) {
      setTimeout(() => showAchievementNotifications(newAchievements), 800);
    }
    updateUI();
    showFragments(newFragments);
    drawCurve();
    if (!state.seenDeathTip) {
      state.seenDeathTip = true;
      setTimeout(() => showContextualTip("death"), 600);
    }
    if (newAnchors && newAnchors.length > 0) {
      for (const anchor of newAnchors) {
        setTimeout(() => showDivineToast(`An anchor forms \xE2 \u201D ${anchor.value} has become a core thread of your soul.`, 4500), 800);
      }
    }
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
    modifyResourcesForEvent2(result.event);
    state.eventMarkers.push({ age: state.currentAge, rate: getMortalityRate3(Math.min(state.currentAge, 100)) });
    if (isCrisisEvent2(result.event)) {
      state.isPaused = true;
      showCrisisPrompt2(result.event, result.event.choices, result.event.eraModifiers || {});
      return;
    }
    const chainResult = detectChain(eventWithAge, state.lifeEvents);
    if (chainResult.chainEvent) {
      if (!state.activeChain || state.activeChain.type !== chainResult.chainType) {
        state.activeChain = { type: chainResult.chainType, events: [], color: CHAIN_COLORS2[chainResult.chainType] };
      }
      if (!state.activeChain.events.find((ev) => ev.id === eventWithAge.id)) {
        state.activeChain.events.push(eventWithAge);
      }
      if (state.activeChain.events.length >= 2) {
        state.lifeTheme = generateLifeTheme(state.lifeEvents);
      }
    }
    renderChainStrip(state.activeChain);
    updateLifeSummaryBar();
  }
  if (state.whisperCooldown > 0) state.whisperCooldown--;
  const currentPhase = getLifePhase2(state.currentAge);
  if (currentPhase === "SENIOR" && state.vitality > 1) {
    if (!state._lastVitalityCheck || state.currentAge !== state._lastVitalityCheck) {
      state._lastVitalityCheck = state.currentAge;
      state.vitality = Math.max(1, state.vitality - 1);
      animateResourceChange("vitality", -1);
      updateResourceDisplay2();
    }
  }
  if (state.soul) {
    state.soul.whisperTicksSinceLastWhisper = (state.soul.whisperTicksSinceLastWhisper || 0) + 1;
  }
  if (!state.currentWhisper && state.whisperCooldown <= 0 && !state.isPaused) {
    const currentPhase2 = getLifePhase2(state.currentAge);
    const whisperFreq = getWhisperFrequency2(state.soul, currentPhase2);
    if (Math.random() < whisperFreq) {
      const fragment = selectWhisperingFragment2(state.soul, state.currentLife.era, state.recentFragmentIds);
      if (fragment) {
        state.currentWhisper = fragment;
        showWhisperPanel2(fragment);
      } else {
        state.whisperCooldown = 10;
      }
    }
  }
  updateUI();
  drawCurve();
}
function dieNow2(isTacticalExit = false) {
  if (!state.isAlive) return;
  if (!isTacticalExit && (state.connection > 0 || state.vitality > 0 || state.momentum > 0)) {
    showExitConfirm();
    return;
  }
  const deathEvent = {
    id: "death_force",
    title: "You chose to leave",
    description: "The curve bends but doesn't break. You step off at age " + state.currentAge + ". The world keeps turning without you.",
    cascadeTags: ["resignation", "dissolution"],
    category: "circumstance",
    era: state.currentLife.era,
    age: state.currentAge
  };
  state.isAlive = false;
  state.deathEvent = deathEvent;
  clearInterval(state.tickInterval);
  state.tickInterval = null;
  if (isTacticalExit) {
    state.connection = 0;
    state.vitality = 0;
    state.momentum = 0;
    updateResourceDisplay2();
  }
  state.lifeEvents.push(deathEvent);
  state.eventMarkers.push({ age: state.currentAge, rate: getMortalityRate3(Math.min(state.currentAge, 100)) });
  const chainResult = detectChain(deathEvent, state.lifeEvents);
  if (chainResult.chainEvent) {
    if (!state.activeChain) {
      state.activeChain = { type: chainResult.chainType, events: [], color: CHAIN_COLORS2[chainResult.chainType] };
    }
    if (!state.activeChain.events.find((ev) => ev.id === deathEvent.id)) {
      state.activeChain.events.push(deathEvent);
    }
  }
  if (state.lifeEvents.length >= 2) {
    state.lifeTheme = generateLifeTheme(state.lifeEvents);
  }
  const newAchievements = checkAndUnlockAchievements(state.soul, state.lifeEvents, deathEvent);
  state.lifeHistory = state.lifeHistory || [];
  const lifeRecord = buildLifeRecord();
  state.lifeHistory.push(lifeRecord);
  state.soul.livesLived = (state.soul.livesLived || 0) + 1;
  state.soul.totalYearsLived = (state.soul.totalYearsLived || 0) + state.currentAge;
  if (state.currentLife.era) {
    state.soul.unlockedEras = state.soul.unlockedEras || ["ANCIENT", "MEDIEVAL"];
    if (!state.soul.unlockedEras.includes(state.currentLife.era)) {
      state.soul.unlockedEras.push(state.currentLife.era);
    }
  }
  state.isAlive = false;
  const finalSoul = buildSoulForLimbo();
  const newFragments = finalSoul.fragments || [];
  const { newAnchors } = applyFragmentEffects(state.soul, newFragments, state.currentLife?.era);
  updateUI();
  showFragments(newFragments);
  drawCurve();
  if (newAnchors && newAnchors.length > 0) {
    for (const anchor of newAnchors) {
      setTimeout(() => showDivineToast(`An anchor forms \xE2 \u201D ${anchor.value} has become a core thread of your soul.`, 4500), 800);
    }
  }
  setTimeout(() => showDeathOverlay(deathEvent, newAchievements), 500);
}
function showExitConfirm() {
  const overlay = document.getElementById("exit-confirm-overlay");
  const resEl = document.getElementById("exit-resources");
  const dot = (n) => "\xE2\u2014\x8F".repeat(n) + "\xE2\u2014\u2039".repeat(3 - n);
  resEl.innerHTML = `
    <span style="color:var(--chain-love)">${dot(state.connection)}</span> Connection &nbsp;
    <span style="color:var(--cyan)">${dot(state.vitality)}</span> Vitality &nbsp;
    <span style="color:var(--amber)">${dot(state.momentum)}</span> Momentum
  `;
  overlay.classList.add("visible");
  const confirmBtn = document.getElementById("btn-confirm-exit");
  const cancelBtn = document.getElementById("btn-cancel-exit");
  const cleanup = () => {
    overlay.classList.remove("visible");
    confirmBtn.removeEventListener("click", onConfirm);
    cancelBtn.removeEventListener("click", onCancel);
  };
  const onConfirm = () => {
    cleanup();
    dieNow2(true);
  };
  const onCancel = () => {
    cleanup();
  };
  confirmBtn.addEventListener("click", onConfirm);
  cancelBtn.addEventListener("click", onCancel);
}
function hideExitConfirm() {
  document.getElementById("exit-confirm-overlay").classList.remove("visible");
}
function startLife() {
  if (!state.soul) {
    state.soul = createSoulState2();
  }
  const { life } = rollSoulLife(state.soul);
  state.currentLife = life;
  state.currentAge = 0;
  state.isAlive = true;
  state.isPaused = false;
  state.lifeEvents = [];
  state.eventMarkers = [];
  state.lifeTheme = null;
  state.activeChain = null;
  state.deathEvent = null;
  state.cascadeTags = [];
  state.phase = "INFANT";
  state.connection = 2;
  state.vitality = 2;
  state.momentum = 2;
  state.landmarkEventsFired = [];
  if (state.tickInterval) clearInterval(state.tickInterval);
  state.tickInterval = setInterval(gameTick2, SPEED_MAP[state.speed] || 600);
  updateUI();
  drawCurve();
  showLifeStartEvent(life);
}
function showLifeStartEvent(life) {
  const eraData = ERAS[life.era] || {};
  const eraLabel = eraData.label || life.era;
  const yearDisplay = life.year < 0 ? `${Math.abs(life.year)} BCE` : `${life.year} CE`;
  const event = {
    id: "life_start_" + Date.now(),
    title: `A new life begins in ${eraLabel}`,
    description: `You are born as ${life.name} in ${life.location.city}, ${life.location.country}. The year is ${yearDisplay}. Your journey through the cycle starts now.`,
    cascadeTags: ["wonder"],
    category: "landmark",
    era: life.era,
    age: 0,
    isLifeStartEvent: true
  };
  state.lifeEvents.push({ ...event, age: 0 });
  state.eventMarkers.push({ age: 0, rate: getMortalityRate3(0) });
  displayEvent(event);
  modifyResourcesForEvent(event);
}
function setSpeed2(speed) {
  state.speed = speed;
  document.querySelectorAll(".speed-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.speed === speed);
  });
  if (state.isAlive && state.tickInterval) {
    clearInterval(state.tickInterval);
    state.tickInterval = setInterval(gameTick2, SPEED_MAP[speed]);
  }
}
function transitionFromDeathToLimbo() {
  hideDeathOverlay();
  if (!state.soul) state.soul = createSoulState2();
  setTimeout(() => {
    state.soul.fragments = state.soul.fragments || [];
    state.soul.anchors = state.soul.anchors || [];
    showLimbo({ fragments: state.soul.fragments, anchors: state.soul.anchors });
    setTimeout(() => showSoulBrowser(), 2500);
  }, 300);
}
var save, THEME_LABELS, CHAIN_COLORS2, CHAIN_TAG_MAP2, CHAIN_AGE_WINDOW, MAX_ANCHORS, ANCHOR_RECURRENCE_THRESHOLD, ANCHOR_MORTALITY_COST, WHISPER_CHANCE, WHISPER_COOLDOWN_TICKS, WHISPER_MAX_FREQUENCY, FRAGMENT_SATURATION_THRESHOLD, FRAGMENT_SATURATION_MULTIPLIER, WHISPER_DECAY_MULTIPLIER, FRAGMENT_OVERLOAD_THRESHOLD, FRAGMENT_OVERLOAD_PENALTY, EMOTIONAL_TYPES_REQUIRED, ERA_UNLOCK_THRESHOLDS, FRAGMENT_TYPES, COMPLETION_REQUIREMENTS, DEATH_TEMPLATES, RELATIONSHIP_TEMPLATES, EMOTIONAL_TAG_TEMPLATES, MEMORABLE_EVENT_TEMPLATES, WHISPER_TEMPLATES, _fragIdCounter, ERAS2, ERA_ORDER2, MORTALITY_CURVE2, LIFE_PHASES2, EVENT_POOLS2, DEATH_EVENTS2, FRAGMENT_TYPE_ICONS2, state, CRITICAL_INTENSITY2, DEFAULT_CHOICE_TIMEOUT2, CRISIS_CHOICES2, RESOURCE_BUILDERS2, RESOURCE_DEPLETERS2, achBadge;
var init_main = __esm({
  "js/main.js"() {
    init_game();
    init_audio();
    init_events();
    save = __toESM(require_save());
    init_world();
    init_ui();
    THEME_LABELS = {
      GRIEF: ["The losses accumulated", "Grief follows grief", "A weight builds", "Each goodbye echoes"],
      LOVE: ["Love was the throughline", "Someone mattered", "Hearts stay", "Connection outlasts"],
      DREAD: ["Something was always wrong", "Dread built like interest", "The worst was coming", "Fear was justified"],
      WONDER: ["Discovery marked you", "The world kept surprising", "Awe interrupted", "Curiosity was survival"],
      RAGE: ["Anger was your compass", "Rage structured everything", "You burned", "Indignation defined"],
      GRACE: ["Acceptance came slowly", "You learned to let go", "Peace was possible", "Grace found you"],
      NONE: null
    };
    CHAIN_COLORS2 = {
      GRIEF: "#ff4466",
      LOVE: "#ff66aa",
      DREAD: "#9944ff",
      WONDER: "#44aaff",
      RAGE: "#ff6600",
      GRACE: "#aaaaaa"
    };
    CHAIN_TAG_MAP2 = {
      GRIEF: ["grief", "sadness", "sorrow", "mourning", "loss", "despair", "melancholy"],
      LOVE: ["connection", "tenderness", "love", "affection", "devotion", "passion", "romance"],
      DREAD: ["dread", "vertigo", "fear", "terror", "anxiety", "panic", "horror"],
      WONDER: ["wonder", "awe", "discovery", "curiosity", "marvel"],
      RAGE: ["rage", "anger", "betrayal", "fury", "wrath", "resentment"],
      GRACE: ["grace", "resignation", "acceptance", "peace", "surrender"]
    };
    CHAIN_AGE_WINDOW = 10;
    MAX_ANCHORS = 5;
    ANCHOR_RECURRENCE_THRESHOLD = 1;
    ANCHOR_MORTALITY_COST = 0.05;
    WHISPER_CHANCE = 0.4;
    WHISPER_COOLDOWN_TICKS = 15;
    WHISPER_MAX_FREQUENCY = 0.4;
    FRAGMENT_SATURATION_THRESHOLD = 0.5;
    FRAGMENT_SATURATION_MULTIPLIER = 0.7;
    WHISPER_DECAY_MULTIPLIER = 0.95;
    FRAGMENT_OVERLOAD_THRESHOLD = 40;
    FRAGMENT_OVERLOAD_PENALTY = 0.1;
    EMOTIONAL_TYPES_REQUIRED = ["grief", "love", "dread", "wonder", "rage", "grace"];
    ERA_UNLOCK_THRESHOLDS = [
      { threshold: 8, era: "EARLY_MODERN" },
      { threshold: 18, era: "INDUSTRIAL" },
      { threshold: 28, era: "MODERN" },
      { threshold: 40, era: "NEAR_FUTURE" },
      { threshold: 55, era: "FAR_FUTURE" }
    ];
    FRAGMENT_TYPES = ["tone", "fear", "love", "location", "name", "object", "word", "warning"];
    COMPLETION_REQUIREMENTS = {
      minFragmentTypes: 6,
      crisesNeeded: 50,
      erasNeeded: 7,
      anchorsNeeded: 5,
      enlightenmentMinLives: 100,
      enlightenmentMaxAnchors: 0
    };
    DEATH_TEMPLATES = {
      violent: { type: "fear", pool: ["the water was black and silent", "a sound like breaking glass that never stopped echoing", "hands that couldn't hold on", "the sky went red before everything went quiet", "a face you couldn't recognize in the smoke", "the taste of copper and the feeling of falling", "a door that closed too fast to reach", "the last thing you saw was something beautiful", "blood on the floor looked like a map to somewhere you'd been", "the sound of your own name spoken by a stranger"] },
      peaceful: { type: "tone", pool: ["the light was warm and the room smelled like rain", "a hand holding yours that you didn't want to let go of", "the way the curtains moved in the last breeze", "a song you almost remembered the words to", "someone crying softly in the next room", "the feeling of a weight you didn't know you were carrying lifting", "a smile from someone who had been waiting", "the last breath that felt like the first", "a whisper that sounded like forgiveness", "the color of the sky at the exact right moment"] }
    };
    RELATIONSHIP_TEMPLATES = {
      lover: { type: "love", pool: ["loved someone who was leaving anyway", "a face with kind eyes that appeared in every crowd", "the warmth of a shoulder you slept on for years", "a promise made in a language you only half understood", "the way they said your name when no one was listening", "someone who knew the shape of your silence", "a hand that fit perfectly in yours and then didn't", "the last thing they said to you that you replayed every night", "a laugh that made the room feel smaller and safer", "eyes that looked at you like you were the only real thing"] },
      family: { type: "love", pool: ["a voice that called you home even when you were already there", "the weight of a child sleeping on your chest", "someone who shared your face but not your choices", "a name passed down like a burden you didn't ask for", "the way your mother's hands looked when she was tired", "a sibling who knew which secrets were safe to keep", "the first word your child said and what it meant to you", "a family dinner where everyone was pretending", "the empty chair at the table that no one mentioned", "blood that tied you to people you didn't understand"] },
      friend: { type: "love", pool: ["someone who stayed when everyone else left", "a conversation that lasted until the sun came up", "the friend who knew which version of you was real", "a shared joke that no one else would understand", "the person you called when everything went wrong", "a silence between two people that wasn't uncomfortable", "someone who saw you at your worst and didn't flinch", "the friend who moved away and never came back", "a promise between friends that neither of you kept", "the last time you saw them and didn't know it was the last time"] },
      rival: { type: "warning", pool: ["someone who mirrored your worst self back at you", "a rivalry that felt more honest than your friendships", "the person who knew exactly how to hurt you", "an enemy who respected you more than your allies did", "a competition that became the shape of your life", "someone you hated because they were what you wanted to be", "the rival who forgave you when you didn't deserve it", "a feud that outlasted everyone who started it", "the person who challenged you until you broke or became stronger", "an opponent who taught you more than any teacher"] },
      stranger: { type: "tone", pool: ["a stranger who changed your life in five minutes", "the person on the train who looked at you like they knew", "someone you passed every day and never spoke to", "a face in a crowd that felt like a memory from another life", "the stranger who gave you something you didn't know you needed", "someone who smiled at you on the worst day of your life", "a person you saved or who saved you and then disappeared", "the stranger whose name you never learned but whose eyes you remember", "someone who existed in your life for a moment and then became a ghost", "the person who proved that not everyone is who they seem"] }
    };
    EMOTIONAL_TAG_TEMPLATES = {
      grief: { type: "tone", pool: ["the color blue meant something dangerous", "heir to nothing twice", "a room that felt too big after someone left", "the weight of an empty side of the bed", "a song that played at the wrong time", "the smell of someone's coat on a hook by the door", "a calendar with a date circled that no longer mattered", "the silence after a phone stopped ringing", "a habit you couldn't break even though the reason was gone", "the way the light hit a place where someone used to sit"] },
      joy: { type: "tone", pool: ["a moment so bright it cast a shadow on everything after", "the feeling of running downhill with the wind at your back", "a laugh that came from somewhere deeper than your chest", "the taste of something you didn't know you were hungry for", "a day that felt like it would never end and you wanted it to", "the sound of rain when you were exactly where you needed to be", "a surprise that felt like the universe was paying attention", "the warmth of a room full of people who chose to be there", "a realization that hit you like sunlight through clouds", "the exact second you knew everything was going to be okay"] },
      fear: { type: "fear", pool: ["a word that felt like a warning in a language you don't speak", "the feeling of being watched by something you couldn't see", "a door you opened that you wished you hadn't", "the sound of footsteps behind you that stopped when you stopped", "a shadow that moved in a way shadows shouldn't", "the moment you realized you were alone and didn't know how you got there", "a place that felt wrong in a way you couldn't explain", "the feeling of falling in a dream that you carried into waking", "a number that kept appearing and you didn't know why", "the silence before something you knew was coming"] },
      love: { type: "love", pool: ["the exact shade of someone's eyes in a specific kind of light", "a touch that lingered longer than it needed to", "the way someone's voice changed when they said your name", "a gift that was small but meant everything", "the feeling of being understood without having to explain", "a look across a room that said everything words couldn't", "the warmth of someone's breath on your neck in the cold", "a memory so vivid it felt like it was happening now", "the way someone's hand felt in yours the first time", "a promise you made that you weren't sure you could keep"] },
      anger: { type: "warning", pool: ["a door slammed so hard the walls shook", "the words you said that you couldn't take back", "the moment you realized you were becoming someone you hated", "a betrayal that felt like it came from inside your own chest", "the sound of your own voice saying something cruel", "a fire that started small and consumed everything", "the look on someone's face when they realized you lied", "a bridge you burned that you didn't know you'd need", "the silence after you said the thing you'd been holding in", "the feeling of power that came from hurting someone"] },
      wonder: { type: "tone", pool: ["the sky looked different that day and you couldn't say why", "a place that existed in your mind before you ever saw it", "the feeling of standing somewhere for the first time and recognizing it", "a book that described your life before you lived it", "the sound of an instrument you'd never heard but somehow knew", "a dream that felt more real than the day that followed", "the moment you understood something you'd been trying to grasp your whole life", "a coincidence so perfect it felt like design", "the feeling of being exactly where you were supposed to be", "a sight so beautiful it made you forget what you were afraid of"] }
    };
    MEMORABLE_EVENT_TEMPLATES = {
      birth: { type: "tone", pool: ["the first breath that tasted like the world", "a cry that announced you were here and you were angry about it", "hands that caught you before you knew what falling meant", "the light that hurt your eyes and then became everything", "a name given to you before you had any say in it"] },
      comingOfAge: { type: "tone", pool: ["the day you realized your parents were just people", "a mirror that showed you someone you didn't recognize", "the first time you made a choice that couldn't be undone", "a body that changed without asking your permission", "the moment childhood ended and no one told you it was happening"] },
      achievement: { type: "tone", pool: ["the moment you proved everyone wrong", "a trophy that meant less than the look on your mother's face", "the climb that changed you more than the view from the top", "a success that felt like it belonged to someone else", "the thing you built with your hands that outlasted you"] },
      loss: { type: "fear", pool: ["the emptiness that followed a presence you took for granted", "a goodbye that you didn't know was a goodbye at the time", "the last photograph of someone who wouldn't be in any more", "a house that became a museum of someone who left", "the first holiday without the person who made it matter"] },
      betrayal: { type: "warning", pool: ["the face of someone you trusted when the truth came out", "a secret that was never yours to keep", "the moment you realized the ground beneath you was hollow", "a lie so big it became the foundation of everything", "the person who knew where to strike and didn't hesitate"] },
      revelation: { type: "word", pool: ["a truth that arrived too late to change anything", "the word that unlocked a door you didn't know was locked", "a letter that rewrote everything you thought you knew", "a confession that felt like a gift and a curse at the same time", "the moment the pieces clicked and you wished they hadn't"] }
    };
    WHISPER_TEMPLATES = [
      { type: "tone", value: "a hum you couldn't place but felt in your teeth" },
      { type: "tone", value: "the smell of ozone before something important happened" },
      { type: "warning", value: "a number that appeared too often to be random" },
      { type: "location", value: "a street corner that felt like the center of something" },
      { type: "object", value: "a coin you found and kept without knowing why" },
      { type: "name", value: "a name you heard once and couldn't forget" },
      { type: "tone", value: "the way the light fell at a specific hour of a specific day" },
      { type: "fear", value: "a sound behind you that wasn't there when you turned around" },
      { type: "love", value: "the ghost of a touch on your shoulder from someone who wasn't there" },
      { type: "word", value: "a word in a language you don't speak that felt like home" },
      { type: "object", value: "a key to a door you never found" },
      { type: "location", value: "a room you dreamed about before you ever saw it" },
      { type: "tone", value: "the taste of something you'd never eaten but remembered" },
      { type: "warning", value: "a feeling that you were being herded toward something" },
      { type: "name", value: "a face that belonged to a name you almost knew" }
    ];
    _fragIdCounter = 0;
    ERAS2 = {
      ANCIENT: { id: "ANCIENT", label: "Ancient", yearRange: [-3e3, 499], eventSignature: "The gods are real here, and they are cruel.", locationPool: [{ region: "Mesopotamia", city: "Uruk", country: "Sumer", weight: 12 }, { region: "Nile Valley", city: "Memphis", country: "Egypt", weight: 14 }, { region: "Aegean", city: "Athens", country: "Greece", weight: 13 }, { region: "Italian Peninsula", city: "Rome", country: "Roman Republic/Empire", weight: 15 }, { region: "Persian Plateau", city: "Persepolis", country: "Achaemenid Persia", weight: 9 }], firstNamePool: { male: [{ name: "Gilgamesh", weight: 3 }, { name: "Ramses", weight: 4 }, { name: "Alexander", weight: 4 }, { name: "Julius", weight: 4 }, { name: "Marcus", weight: 3 }, { name: "Constantine", weight: 3 }, { name: "Ashoka", weight: 3 }, { name: "Attila", weight: 3 }], female: [{ name: "Nefertiti", weight: 4 }, { name: "Cleopatra", weight: 4 }, { name: "Hatshepsut", weight: 3 }, { name: "Helen", weight: 3 }, { name: "Sappho", weight: 3 }, { name: "Zenobia", weight: 2 }, { name: "Boudicca", weight: 3 }] }, lastNamePool: [{ name: "of Rome", weight: 5 }, { name: "of Athens", weight: 4 }, { name: "of Babylon", weight: 3 }, { name: "the Great", weight: 2 }, { name: "", weight: 10 }], bodyConditions: [{ condition: "robust", weight: 15 }, { condition: "healthy", weight: 55 }, { condition: "sickly", weight: 20 }, { condition: "disabled", weight: 10 }], socialClasses: [{ cls: "slave", weight: 25 }, { cls: "peasant", weight: 35 }, { cls: "artisan", weight: 12 }, { cls: "merchant", weight: 10 }, { cls: "soldier", weight: 8 }, { cls: "noble", weight: 4 }, { cls: "ruler", weight: 1 }] },
      MEDIEVAL: { id: "MEDIEVAL", label: "Medieval", yearRange: [500, 1499], eventSignature: "The plague is always somewhere. Faith is the only shield.", locationPool: [{ region: "British Isles", city: "London", country: "England", weight: 12 }, { region: "Frankish Lands", city: "Paris", country: "France", weight: 13 }, { region: "Italian Peninsula", city: "Venice", country: "Venetian Republic", weight: 11 }, { region: "Byzantine", city: "Constantinople", country: "Byzantine Empire", weight: 12 }, { region: "Middle East", city: "Baghdad", country: "Abbasid Caliphate", weight: 10 }, { region: "East Asia", city: "Chang'an", country: "Tang China", weight: 10 }], firstNamePool: { male: [{ name: "William", weight: 5 }, { name: "Henry", weight: 5 }, { name: "John", weight: 5 }, { name: "Robert", weight: 5 }, { name: "Louis", weight: 4 }, { name: "Charles", weight: 4 }, { name: "Saladin", weight: 3 }, { name: "Ali", weight: 3 }], female: [{ name: "Eleanor", weight: 4 }, { name: "Isabella", weight: 4 }, { name: "Margaret", weight: 4 }, { name: "Mary", weight: 5 }, { name: "Fatima", weight: 3 }, { name: "Mariam", weight: 3 }] }, lastNamePool: [{ name: "of York", weight: 3 }, { name: "of Normandy", weight: 3 }, { name: "Smith", weight: 4 }, { name: "Taylor", weight: 3 }, { name: "", weight: 10 }], bodyConditions: [{ condition: "robust", weight: 12 }, { condition: "healthy", weight: 50 }, { condition: "sickly", weight: 25 }, { condition: "disabled", weight: 13 }], socialClasses: [{ cls: "serf", weight: 35 }, { cls: "peasant", weight: 20 }, { cls: "artisan", weight: 12 }, { cls: "merchant", weight: 10 }, { cls: "knight", weight: 7 }, { cls: "clergy", weight: 8 }, { cls: "noble", weight: 3 }] },
      EARLY_MODERN: { id: "EARLY_MODERN", label: "Early Modern", yearRange: [1500, 1849], eventSignature: "The world is being mapped. Old gods die, new machines are born.", locationPool: [{ region: "British Isles", city: "London", country: "England/Britain", weight: 14 }, { region: "Frankish Lands", city: "Paris", country: "France", weight: 13 }, { region: "Ottoman", city: "Istanbul", country: "Ottoman Empire", weight: 12 }, { region: "Low Countries", city: "Amsterdam", country: "Dutch Republic", weight: 10 }, { region: "East Asia", city: "Beijing", country: "Ming/Qing China", weight: 10 }, { region: "East Asia", city: "Edo", country: "Tokugawa Japan", weight: 9 }], firstNamePool: { male: [{ name: "William", weight: 5 }, { name: "John", weight: 5 }, { name: "George", weight: 4 }, { name: "Charles", weight: 4 }, { name: "Louis", weight: 3 }, { name: "Napoleon", weight: 3 }, { name: "Peter", weight: 3 }], female: [{ name: "Elizabeth", weight: 5 }, { name: "Mary", weight: 4 }, { name: "Catherine", weight: 4 }, { name: "Maria", weight: 4 }, { name: "Marie", weight: 4 }, { name: "Charlotte", weight: 3 }] }, lastNamePool: [{ name: "Smith", weight: 4 }, { name: "Johnson", weight: 3 }, { name: "M\xC3\xBCller", weight: 3 }, { name: "Schmidt", weight: 3 }, { name: "Rossi", weight: 2 }, { name: "", weight: 5 }], bodyConditions: [{ condition: "robust", weight: 14 }, { condition: "healthy", weight: 53 }, { condition: "sickly", weight: 22 }, { condition: "disabled", weight: 11 }], socialClasses: [{ cls: "peasant", weight: 25 }, { cls: "laborer", weight: 18 }, { cls: "artisan", weight: 14 }, { cls: "merchant", weight: 13 }, { cls: "soldier", weight: 8 }, { cls: "aristocrat", weight: 5 }] },
      INDUSTRIAL: { id: "INDUSTRIAL", label: "Industrial", yearRange: [1850, 1949], eventSignature: "Smoke fills the sky. The machines are hungry and so is war.", locationPool: [{ region: "British Isles", city: "London", country: "United Kingdom", weight: 14 }, { region: "Germanic Lands", city: "Berlin", country: "Germany", weight: 11 }, { region: "Americas", city: "New York", country: "United States", weight: 13 }, { region: "Americas", city: "Chicago", country: "United States", weight: 9 }, { region: "East Asia", city: "Tokyo", country: "Japan", weight: 10 }, { region: "East Asia", city: "Shanghai", country: "China", weight: 8 }], firstNamePool: { male: [{ name: "John", weight: 5 }, { name: "William", weight: 5 }, { name: "James", weight: 4 }, { name: "George", weight: 4 }, { name: "Robert", weight: 4 }, { name: "Harry", weight: 3 }, { name: "Jack", weight: 3 }], female: [{ name: "Mary", weight: 5 }, { name: "Elizabeth", weight: 4 }, { name: "Margaret", weight: 4 }, { name: "Alice", weight: 3 }, { name: "Emma", weight: 3 }, { name: "Rose", weight: 3 }] }, lastNamePool: [{ name: "Smith", weight: 5 }, { name: "Johnson", weight: 4 }, { name: "Williams", weight: 4 }, { name: "Brown", weight: 4 }, { name: "Jones", weight: 4 }, { name: "M\xC3\xBCller", weight: 3 }], bodyConditions: [{ condition: "robust", weight: 13 }, { condition: "healthy", weight: 52 }, { condition: "sickly", weight: 23 }, { condition: "disabled", weight: 12 }], socialClasses: [{ cls: "factory worker", weight: 22 }, { cls: "laborer", weight: 15 }, { cls: "farmer", weight: 12 }, { cls: "merchant", weight: 10 }, { cls: "clerk", weight: 8 }, { cls: "soldier", weight: 8 }] },
      MODERN: { id: "MODERN", label: "Modern", yearRange: [1950, 2019], eventSignature: "You live longer. You die alone. The screens watch you back.", locationPool: [{ region: "North America", city: "New York", country: "United States", weight: 12 }, { region: "North America", city: "Los Angeles", country: "United States", weight: 10 }, { region: "Europe", city: "London", country: "United Kingdom", weight: 10 }, { region: "Europe", city: "Paris", country: "France", weight: 9 }, { region: "Asia", city: "Tokyo", country: "Japan", weight: 10 }, { region: "Asia", city: "Shanghai", country: "China", weight: 9 }], firstNamePool: { male: [{ name: "James", weight: 5 }, { name: "Michael", weight: 5 }, { name: "John", weight: 4 }, { name: "Robert", weight: 4 }, { name: "William", weight: 4 }, { name: "Daniel", weight: 4 }, { name: "Matthew", weight: 4 }], female: [{ name: "Mary", weight: 4 }, { name: "Jennifer", weight: 4 }, { name: "Elizabeth", weight: 4 }, { name: "Jessica", weight: 4 }, { name: "Sarah", weight: 4 }, { name: "Emily", weight: 4 }, { name: "Emma", weight: 4 }] }, lastNamePool: [{ name: "Smith", weight: 4 }, { name: "Johnson", weight: 4 }, { name: "Williams", weight: 4 }, { name: "Brown", weight: 4 }, { name: "Garcia", weight: 4 }, { name: "Lee", weight: 4 }, { name: "Wang", weight: 4 }], bodyConditions: [{ condition: "robust", weight: 15 }, { condition: "healthy", weight: 55 }, { condition: "sickly", weight: 20 }, { condition: "disabled", weight: 10 }], socialClasses: [{ cls: "working class", weight: 22 }, { cls: "middle class", weight: 25 }, { cls: "service worker", weight: 15 }, { cls: "professional", weight: 12 }, { cls: "technician", weight: 8 }] },
      NEAR_FUTURE: { id: "NEAR_FUTURE", label: "Near Future", yearRange: [2020, 2069], eventSignature: "The climate is shifting. The algorithms decide. You adapt or break.", locationPool: [{ region: "North America", city: "New York", country: "United States", weight: 10 }, { region: "Asia", city: "Shanghai", country: "China", weight: 9 }, { region: "Europe", city: "London", country: "United Kingdom", weight: 8 }, { region: "Asia", city: "Tokyo", country: "Japan", weight: 8 }, { region: "Africa", city: "Lagos", country: "Nigeria", weight: 7 }], firstNamePool: { male: [{ name: "Liam", weight: 5 }, { name: "Noah", weight: 4 }, { name: "Oliver", weight: 4 }, { name: "Kai", weight: 3 }, { name: "Mateo", weight: 3 }, { name: "Leo", weight: 3 }], female: [{ name: "Olivia", weight: 5 }, { name: "Emma", weight: 4 }, { name: "Charlotte", weight: 4 }, { name: "Luna", weight: 3 }, { name: "Maya", weight: 3 }, { name: "Aria", weight: 3 }] }, lastNamePool: [{ name: "Smith", weight: 3 }, { name: "Garcia", weight: 3 }, { name: "Chen", weight: 4 }, { name: "Kim", weight: 3 }, { name: "Singh", weight: 3 }], bodyConditions: [{ condition: "enhanced", weight: 8 }, { condition: "robust", weight: 18 }, { condition: "healthy", weight: 45 }, { condition: "sickly", weight: 18 }, { condition: "disabled", weight: 11 }], socialClasses: [{ cls: "precariat", weight: 18 }, { cls: "gig worker", weight: 15 }, { cls: "knowledge worker", weight: 15 }, { cls: "technician", weight: 12 }, { cls: "creative", weight: 8 }] },
      FAR_FUTURE: { id: "FAR_FUTURE", label: "Far Future", yearRange: [2070, 2200], eventSignature: "Death is optional now. But meaning is not.", locationPool: [{ region: "Earth", city: "Neo-Tokyo", country: "Japanese Federation", weight: 8 }, { region: "Earth", city: "Shanghai Arcology", country: "Asian Coalition", weight: 8 }, { region: "Orbital", city: "L5 Stanford Torus", country: "Orbital Habitats", weight: 6 }, { region: "Martian", city: "Olympus Mons Colony", country: "Mars Republic", weight: 5 }], firstNamePool: { male: [{ name: "Kai", weight: 4 }, { name: "Neo", weight: 3 }, { name: "Zion", weight: 3 }, { name: "Atlas", weight: 3 }, { name: "Orion", weight: 3 }], female: [{ name: "Nova", weight: 4 }, { name: "Luna", weight: 3 }, { name: "Aurora", weight: 3 }, { name: "Iris", weight: 3 }, { name: "Lyra", weight: 3 }] }, lastNamePool: [{ name: "of Earth", weight: 3 }, { name: "of Mars", weight: 3 }, { name: "of the Belt", weight: 3 }, { name: "Prime", weight: 2 }, { name: "", weight: 10 }], bodyConditions: [{ condition: "enhanced", weight: 25 }, { condition: "synthetic", weight: 10 }, { condition: "robust", weight: 20 }, { condition: "healthy", weight: 25 }, { condition: "sickly", weight: 10 }], socialClasses: [{ cls: "posthuman", weight: 15 }, { cls: "enhanced citizen", weight: 15 }, { cls: "baseline human", weight: 12 }, { cls: "AI construct", weight: 10 }, { cls: "synthetic worker", weight: 10 }] }
    };
    ERA_ORDER2 = ["ANCIENT", "MEDIEVAL", "EARLY_MODERN", "INDUSTRIAL", "MODERN", "NEAR_FUTURE", "FAR_FUTURE"];
    MORTALITY_CURVE2 = [
      { minAge: 0, maxAge: 0, rate: 5.6 },
      { minAge: 1, maxAge: 4, rate: 0.25 },
      { minAge: 5, maxAge: 14, rate: 0.11 },
      { minAge: 15, maxAge: 24, rate: 0.4 },
      { minAge: 25, maxAge: 34, rate: 0.5 },
      { minAge: 35, maxAge: 44, rate: 1 },
      { minAge: 45, maxAge: 54, rate: 2 },
      { minAge: 55, maxAge: 64, rate: 4 },
      { minAge: 65, maxAge: 74, rate: 9 },
      { minAge: 75, maxAge: 84, rate: 20 },
      { minAge: 85, maxAge: 94, rate: 45 },
      { minAge: 95, maxAge: Infinity, rate: 80 }
    ];
    LIFE_PHASES2 = {
      INFANT: { min: 0, max: 3 },
      CHILD: { min: 4, max: 12 },
      ADOLESCENT: { min: 13, max: 19 },
      YOUNG_ADULT: { min: 20, max: 39 },
      MIDDLE_AGE: { min: 40, max: 64 },
      SENIOR: { min: 65, max: 84 },
      ANCIENT: { min: 85, max: Infinity }
    };
    EVENT_POOLS2 = {
      PREHISTORIC: [
        { id: "ph_01", triggerProbability: 0.12, phases: ["CHILD", "ADOLESCENT", "YOUNG_ADULT"], eras: ["PREHISTORIC"], category: "violence", weight: 3, title: "The predator at the tree line", description: "Something watches from beyond the firelight. You keep the embers fed and don't sleep.", cascadeTags: ["dread", "anchor"] },
        { id: "ph_03", triggerProbability: 0.08, phases: ["INFANT", "CHILD"], eras: ["PREHISTORIC"], category: "body", weight: 4, title: "Fever takes the little ones", description: "The heat comes and doesn't leave. Someone presses wet bark to your forehead and sings.", cascadeTags: ["grief", "numbness"] },
        { id: "ph_04", triggerProbability: 0.06, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["PREHISTORIC"], category: "mystery", weight: 2, title: "The cave paintings", description: "Deep in the rock someone has drawn animals that don't exist anymore. You touch the ochre and feel something shift.", cascadeTags: ["wonder", "awe"] },
        { id: "ph_05", triggerProbability: 0.07, phases: ["YOUNG_ADULT", "MIDDLE_AGE", "SENIOR"], eras: ["PREHISTORIC"], category: "relationship", weight: 3, title: "A bond forged in the hunt", description: "You and another move together without speaking. After, you share the meat and don't look away.", cascadeTags: ["connection", "tenderness"] },
        { id: "ph_07", triggerProbability: 0.09, phases: ["MIDDLE_AGE", "SENIOR", "ANCIENT"], eras: ["PREHISTORIC"], category: "circumstance", weight: 3, title: "The elders' fire", description: "You sit with the ones who remember the last cold season. They speak in fragments. You try to hold it all.", cascadeTags: ["anchor", "resignation"] },
        { id: "ph_15", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["PREHISTORIC"], category: "relationship", weight: 3, title: "The chosen one", description: "They look at you across the fire and you know. Not words \xE2 \u201D something older. You move closer.", cascadeTags: ["connection", "awakening"] },
        { id: "ph_21", triggerProbability: 0.06, phases: ["INFANT", "CHILD"], eras: ["PREHISTORIC"], category: "relationship", weight: 3, title: "Carried on the back", description: "You are small and the world is large and someone's shoulders are the only geography you know.", cascadeTags: ["tenderness", "anchor"] },
        { id: "ph_22", triggerProbability: 0.07, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["PREHISTORIC"], category: "mystery", weight: 2, title: "The bones that sang", description: "You find a cache of painted bones arranged in a spiral. When you touch them, your hands remember something your mind lost.", cascadeTags: ["wonder", "vertigo"] },
        { id: "ph_23", triggerProbability: 0.05, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["PREHISTORIC"], category: "violence", weight: 3, crisis: true, title: "The raiding party returns", description: "They come back with blood on their faces and something that used to be a person. You recognize the necklace they wear.", cascadeTags: ["dread", "rage"], choices: ["intervene", "pray", "watch"] },
        { id: "ph_24", triggerProbability: 0.08, phases: ["CHILD", "ADOLESCENT"], eras: ["PREHISTORIC"], category: "fortune", weight: 2, title: "The berries that healed", description: "You eat the red ones by mistake and spend three days seeing colors that don't have names. Then it passes.", cascadeTags: ["wonder", "dissolution"] },
        { id: "ph_25", triggerProbability: 0.06, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["PREHISTORIC"], category: "relationship", weight: 3, title: "The language before words", description: "You communicate through gesture and posture and glance. It is more precise than any sentence you will ever speak.", cascadeTags: ["connection", "grace"] },
        { id: "ph_26", triggerProbability: 0.09, phases: ["MIDDLE_AGE", "SENIOR", "ANCIENT"], eras: ["PREHISTORIC"], category: "body", weight: 4, title: "The joint that never heals", description: "It aches before rain and after exertion. The body keeps a calendar you cannot read.", cascadeTags: ["resignation", "numbness"] },
        { id: "ph_27", triggerProbability: 0.07, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["PREHISTORIC"], category: "mystery", weight: 2, title: "The dream that came true", description: "You dream of fish falling from the sky. Three days later the stream runs silver with a catch no one expected.", cascadeTags: ["wonder", "awe"] },
        { id: "ph_28", triggerProbability: 0.08, phases: ["CHILD", "ADOLESCENT"], eras: ["PREHISTORIC"], category: "circumstance", weight: 3, title: "The first frost", description: "You watch your breath become visible and understand for the first time that air is a substance. Things end.", cascadeTags: ["wonder", "grief"] },
        { id: "ph_29", triggerProbability: 0.06, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["PREHISTORIC"], category: "relationship", weight: 3, title: "The naming", description: "You give someone a name no one else uses. In the dark, they respond only to it. This is intimacy.", cascadeTags: ["tenderness", "connection"] },
        { id: "ph_30", triggerProbability: 0.05, phases: ["INFANT", "CHILD"], eras: ["PREHISTORIC"], category: "body", weight: 3, crisis: true, title: "The birth of the twin", description: "You emerge first. The second does not cry for a long time. The midwife works in silence.", cascadeTags: ["grief", "numbness"], choices: ["intervene", "pray", "watch"] },
        { id: "ph_31", triggerProbability: 0.04, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["PREHISTORIC"], category: "mystery", landmark: true, title: "The seeing stone", description: "In a cave deeper than anyone goes, you find a crystal that shows you your own death. Not when. Not how. Just that it is yours.", cascadeTags: ["dread", "vertigo"] },
        { id: "ph_32", triggerProbability: 0.07, phases: ["CHILD", "ADOLESCENT"], eras: ["PREHISTORIC"], category: "violence", weight: 4, crisis: true, title: "The territorial fight", description: "Two groups, one water source. The negotiation fails. You see someone's eye get crushed into mud.", cascadeTags: ["rage", "dread"], choices: ["intervene", "pray", "watch"] },
        { id: "ph_33", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["PREHISTORIC"], category: "circumstance", weight: 2, title: "The migration", description: "The group moves. You carry what you can and leave what you cannot. The landscape rearranges itself around your grief.", cascadeTags: ["resignation", "anchor"] },
        { id: "ph_34", triggerProbability: 0.06, phases: ["SENIOR", "ANCIENT"], eras: ["PREHISTORIC"], category: "body", weight: 2, title: "The tooth falls", description: "It comes out with the jerky you've been chewing. You hold it in your palm and realize you are now the one who remembers things others have forgotten.", cascadeTags: ["resignation", "grace"] },
        { id: "ph_35", triggerProbability: 0.07, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["PREHISTORIC"], category: "fortune", weight: 2, title: "The fire that spreads", description: "Lightning strikes and the dry grass catches. You run with the herd. The burn scar becomes new territory.", cascadeTags: ["vertigo", "wonder"] },
        { id: "ph_36", triggerProbability: 0.05, phases: ["INFANT", "CHILD"], eras: ["PREHISTORIC"], category: "relationship", weight: 3, title: "The grandmother's stories", description: "She tells you about the sky before the sky had holes. You don't believe her but you keep listening.", cascadeTags: ["wonder", "anchor"] },
        { id: "ph_37", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["PREHISTORIC"], category: "relationship", weight: 3, crisis: true, title: "The betrayal in the dark", description: "Someone takes your share of the meat when you sleep. You know who. The group cannot function if you speak.", cascadeTags: ["rage", "grief"], choices: ["intervene", "pray", "watch"] }
      ],
      ANCIENT: [
        { id: "an_01", triggerProbability: 0.1, phases: ["CHILD", "ADOLESCENT", "YOUNG_ADULT"], eras: ["ANCIENT"], category: "violence", weight: 4, intensity: 0.85, crisis: true, title: "The conscription notice", description: "The king's men come through the village with a list. Your name is on it. Your mother doesn't cry until they leave.", cascadeTags: ["dread", "betrayal"], choices: ["intervene", "pray", "watch"] },
        { id: "an_03", triggerProbability: 0.07, phases: ["INFANT", "CHILD"], eras: ["ANCIENT"], category: "body", weight: 4, title: "The summer fever", description: "It runs through the quarter like a rumor. You survive. The child next door doesn't.", cascadeTags: ["grief", "numbness"] },
        { id: "an_04", triggerProbability: 0.06, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["ANCIENT"], category: "mystery", weight: 3, intensity: 0.75, crisis: true, title: "The oracle's riddle", description: "She speaks in a voice that isn't hers and the priests write it down. Later, you realize it was about you.", cascadeTags: ["wonder", "disorientation"], choices: ["intervene", "pray", "watch"] },
        { id: "an_05", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE", "SENIOR"], eras: ["ANCIENT"], category: "relationship", weight: 3, title: "The arranged marriage", description: "You meet them at the threshold. They are a stranger. You both pretend otherwise.", cascadeTags: ["disorientation", "connection"] },
        { id: "an_07", triggerProbability: 0.09, phases: ["MIDDLE_AGE", "SENIOR", "ANCIENT"], eras: ["ANCIENT"], category: "circumstance", weight: 3, title: "The library burns", description: "You watch centuries of thought turn to smoke. Someone saves a scroll and hides it in their tunic.", cascadeTags: ["grief", "rage"] },
        { id: "an_10", triggerProbability: 0.1, phases: ["INFANT", "CHILD", "ADOLESCENT"], eras: ["ANCIENT"], category: "violence", weight: 4, intensity: 0.85, crisis: true, title: "The city falls", description: "The walls don't hold. You learn what fire sounds like in a place where people used to live.", cascadeTags: ["dread", "vertigo"], choices: ["intervene", "pray", "watch"] },
        { id: "an_11", triggerProbability: 0.05, phases: ["SENIOR", "ANCIENT"], eras: ["ANCIENT"], category: "relationship", weight: 2, title: "The grandchild's hand", description: "It fits inside yours like a promise. You forget everything else for a moment.", cascadeTags: ["tenderness", "grace"] },
        { id: "an_15", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["ANCIENT"], category: "relationship", weight: 3, title: "The friendship forged in exile", description: "You're both far from home and the shared foreignness is enough. You trust each other with everything.", cascadeTags: ["connection", "anchor"] },
        { id: "an_21", triggerProbability: 0.06, phases: ["INFANT", "CHILD"], eras: ["ANCIENT"], category: "relationship", weight: 3, title: "The wet nurse", description: "She is not your mother but her milk is. You learn the difference between blood and care much later.", cascadeTags: ["tenderness", "anchor"] },
        { id: "an_22", triggerProbability: 0.07, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["ANCIENT"], category: "violence", weight: 4, crisis: true, title: "The crucifixion", description: "You pass the crosses on the road out. One of the bodies looks familiar. You keep walking.", cascadeTags: ["dread", "vertigo"], choices: ["intervene", "pray", "watch"] },
        { id: "an_23", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["ANCIENT"], category: "fortune", weight: 2, title: "The merchant's luck", description: "The cargo survives the storm and sells for triple. You did nothing to earn this. You enjoy it anyway.", cascadeTags: ["grace", "vertigo"] },
        { id: "an_24", triggerProbability: 0.06, phases: ["CHILD", "ADOLESCENT"], eras: ["ANCIENT"], category: "mystery", weight: 2, title: "The forbidden texts", description: "You read what was hidden in the basement. The world does not look the same after.", cascadeTags: ["wonder", "disorientation"] },
        { id: "an_25", triggerProbability: 0.09, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["ANCIENT"], category: "relationship", weight: 3, title: "The patron's favor", description: "Someone wealthy takes interest in your work. The coin is good. The attention is not.", cascadeTags: ["dread", "connection"] },
        { id: "an_26", triggerProbability: 0.07, phases: ["MIDDLE_AGE", "SENIOR"], eras: ["ANCIENT"], category: "body", weight: 3, title: "The vision quest", description: "Three days without water. You see things that may be gods or may be your brain cooking.", cascadeTags: ["vertigo", "wonder"] },
        { id: "an_27", triggerProbability: 0.08, phases: ["CHILD", "ADOLESCENT"], eras: ["ANCIENT"], category: "circumstance", weight: 3, crisis: true, title: "The sacrifice", description: "They ask for volunteers. No one volunteers. Someone must be chosen. You see your name in the priest's mouth.", cascadeTags: ["dread", "rage"], choices: ["intervene", "pray", "watch"] },
        { id: "an_28", triggerProbability: 0.05, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["ANCIENT"], category: "relationship", landmark: true, signature: true, title: "The great love", description: "You meet someone who reshapes the architecture of your soul. Everything after is measured against this.", cascadeTags: ["love", "awakening"] },
        { id: "an_29", triggerProbability: 0.06, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["ANCIENT"], category: "mystery", weight: 2, title: "The eclipse", description: "The sun vanishes in the middle of the day. You look up and feel genuinely afraid for the first time.", cascadeTags: ["dread", "wonder"] },
        { id: "an_30", triggerProbability: 0.09, phases: ["YOUNG_ADULT", "MIDDLE_AGE", "SENIOR"], eras: ["ANCIENT"], category: "circumstance", weight: 3, title: "The election", description: "They make you a magistrate. You must now judge people you know. The first case is your cousin.", cascadeTags: ["vertigo", "resignation"] },
        { id: "an_31", triggerProbability: 0.07, phases: ["INFANT", "CHILD"], eras: ["ANCIENT"], category: "body", weight: 3, title: "The crippled foot", description: "You are born with a twist in your ankle. The world designs itself around your inability to keep up.", cascadeTags: ["resignation", "numbness"] },
        { id: "an_32", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["ANCIENT"], category: "violence", weight: 4, crisis: true, title: "The arena", description: "They arm you and point you at someone. The crowd roars. You understand that your life is now a product.", cascadeTags: ["dread", "vertigo"], choices: ["intervene", "pray", "watch"] },
        { id: "an_33", triggerProbability: 0.06, phases: ["SENIOR", "ANCIENT"], eras: ["ANCIENT"], category: "relationship", weight: 2, title: "The freed slave", description: "You manumit one of your own. The law calls it progress. Your household calls it the end of things.", cascadeTags: ["connection", "dread"] },
        { id: "an_34", triggerProbability: 0.07, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["ANCIENT"], category: "fortune", weight: 2, title: "The inheritance", description: "A relative dies and leaves you something that changes your rank. You did not know they knew you existed.", cascadeTags: ["vertigo", "grace"] },
        { id: "an_35", triggerProbability: 0.08, phases: ["CHILD", "ADOLESCENT"], eras: ["ANCIENT"], category: "relationship", weight: 3, title: "The tutor", description: "A slave teaches you everything your parents cannot. You become dependent on someone who owns nothing.", cascadeTags: ["connection", "grief"] },
        { id: "an_36", triggerProbability: 0.06, phases: ["MIDDLE_AGE", "SENIOR"], eras: ["ANCIENT"], category: "body", weight: 3, crisis: true, title: "The plague ship", description: "You are on a boat when the fever starts. They won't let you disembark. The sea becomes a coffin.", cascadeTags: ["dread", "numbness"], choices: ["intervene", "pray", "watch"] },
        { id: "an_37", triggerProbability: 0.05, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["ANCIENT"], category: "mystery", weight: 2, title: "The philosopher's error", description: "You prove a theorem that overturns everything your teacher believed. You wish you hadn't.", cascadeTags: ["vertigo", "grief"] }
      ],
      MEDIEVAL: [
        { id: "md_01", triggerProbability: 0.12, phases: ["CHILD", "ADOLESCENT", "YOUNG_ADULT"], eras: ["MEDIEVAL"], category: "body", weight: 5, intensity: 0.9, crisis: true, signature: true, title: "The plague comes through your village", description: "The boils appear on Tuesday. By Friday the priest stops ringing the bell. You count the living instead of the dead.", cascadeTags: ["grief", "dread"], choices: ["intervene", "pray", "watch"] },
        { id: "md_03", triggerProbability: 0.1, phases: ["MIDDLE_AGE", "SENIOR"], eras: ["MEDIEVAL"], category: "relationship", weight: 4, intensity: 0.8, crisis: true, title: "Your child dies of fever", description: "You hold them through the shaking and then the stillness. After, the house is too quiet for years.", cascadeTags: ["grief", "numbness"], choices: ["intervene", "pray", "watch"] },
        { id: "md_06", triggerProbability: 0.07, phases: ["CHILD", "ADOLESCENT"], eras: ["MEDIEVAL"], category: "circumstance", weight: 3, title: "The apprenticeship begins", description: "The blacksmith's shop is hot and loud and you are small. He doesn't coddle you. You learn to make things that last.", cascadeTags: ["anchor", "triumph"] },
        { id: "md_07", triggerProbability: 0.09, phases: ["YOUNG_ADULT", "MIDDLE_AGE", "SENIOR"], eras: ["MEDIEVAL"], category: "violence", weight: 4, intensity: 0.8, crisis: true, title: "The lord's tax collector", description: "He takes what you can't spare and leaves a receipt you can't read. You hate him quietly and efficiently.", cascadeTags: ["rage", "resignation"], choices: ["intervene", "pray", "watch"] },
        { id: "md_10", triggerProbability: 0.1, phases: ["INFANT", "CHILD", "ADOLESCENT"], eras: ["MEDIEVAL"], category: "violence", weight: 4, intensity: 0.85, crisis: true, title: "The raiding party", description: "They come at harvest and take what's ripe. You hide in the root cellar and listen to your life being carried away.", cascadeTags: ["dread", "grief"], choices: ["intervene", "pray", "watch"] },
        { id: "md_12", triggerProbability: 0.07, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MEDIEVAL"], category: "fortune", weight: 2, title: "The good harvest", description: "The wheat stands tall and the rain held off. For once, the world cooperates. You store what you can and wait.", cascadeTags: ["grace", "anchor"] },
        { id: "md_15", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MEDIEVAL"], category: "relationship", weight: 3, title: "The pilgrimage companion", description: "You walk for weeks together and learn the shape of their silence. At the shrine you pray for different things.", cascadeTags: ["connection", "longing"] },
        { id: "md_21", triggerProbability: 0.06, phases: ["INFANT", "CHILD"], eras: ["MEDIEVAL"], category: "relationship", weight: 3, title: "The swaddling", description: "Wrapped tight as a parcel, you can't move but you're warm. Someone hums and the world is small and safe.", cascadeTags: ["tenderness", "anchor"] },
        { id: "md_22", triggerProbability: 0.08, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["MEDIEVAL"], category: "faith", weight: 3, title: "The flagellant's march", description: "They whip themselves through the streets begging God's mercy. You wonder who will save them from themselves.", cascadeTags: ["dread", "wonder"] },
        { id: "md_23", triggerProbability: 0.07, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MEDIEVAL"], category: "circumstance", weight: 3, crisis: true, title: "The trial by combat", description: "They name you champion for someone else's crime. The accused watches from the tower. You pick up the sword.", cascadeTags: ["vertigo", "rage"], choices: ["intervene", "pray", "watch"] },
        { id: "md_24", triggerProbability: 0.06, phases: ["CHILD", "ADOLESCENT"], eras: ["MEDIEVAL"], category: "mystery", weight: 2, title: "The heretic's manuscript", description: "Hidden under a loose floorboard: a book that says everything the priest says is a lie. You memorize one page.", cascadeTags: ["wonder", "dread"] },
        { id: "md_25", triggerProbability: 0.09, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MEDIEVAL"], category: "relationship", weight: 3, title: "The secret wedding", description: "You marry in secret because the church forbids it. The ceremony is brief. The consequences are long.", cascadeTags: ["connection", "grief"] },
        { id: "md_26", triggerProbability: 0.07, phases: ["MIDDLE_AGE", "SENIOR"], eras: ["MEDIEVAL"], category: "body", weight: 3, title: "The tournament injury", description: "You break a lance against someone's shield and hear your own arm snap. The crowd roars for the other man.", cascadeTags: ["vertigo", "resignation"] },
        { id: "md_27", triggerProbability: 0.08, phases: ["CHILD", "ADOLESCENT"], eras: ["MEDIEVAL"], category: "circumstance", weight: 3, title: "The choir boy", description: "Your voice reaches notes that make grown men weep. Then it changes and the gift goes somewhere you cannot follow.", cascadeTags: ["wonder", "grief"] },
        { id: "md_28", triggerProbability: 0.05, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MEDIEVAL"], category: "relationship", landmark: true, signature: true, title: "The love affair with the knight", description: "He rides away after the campaign season and you never stop listening for hoofbeats. Some absences define a life.", cascadeTags: ["love", "longing"] },
        { id: "md_29", triggerProbability: 0.09, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["MEDIEVAL"], category: "violence", weight: 4, crisis: true, title: "The castle siege starvation", description: "Month three. They talk about eating the horses. Then the dogs. Then someone suggests the unthinkable.", cascadeTags: ["dread", "desperation"], choices: ["intervene", "pray", "watch"] },
        { id: "md_30", triggerProbability: 0.06, phases: ["INFANT", "CHILD"], eras: ["MEDIEVAL"], category: "body", weight: 3, title: "The clover maiden", description: "You survive a sickness that takes three siblings. You become the one who stays. This becomes your identity.", cascadeTags: ["grief", "anchor"] },
        { id: "md_31", triggerProbability: 0.07, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MEDIEVAL"], category: "fortune", weight: 2, title: "The pardon", description: "You are condemned and then pardoned by a lord who changes his mind about you. You live on borrowed time.", cascadeTags: ["vertigo", "grace"] },
        { id: "md_32", triggerProbability: 0.08, phases: ["SENIOR", "ANCIENT"], eras: ["MEDIEVAL"], category: "relationship", weight: 2, title: "The will", description: "You dictate how you want to be remembered. The priest writes it down. You sign with a shaking hand.", cascadeTags: ["resignation", "grace"] },
        { id: "md_33", triggerProbability: 0.06, phases: ["CHILD", "ADOLESCENT"], eras: ["MEDIEVAL"], category: "circumstance", weight: 3, title: "The Jewish quarter", description: "You play with children behind the wall. Their games are different. Their holidays make no sense. They are the first people who feel like strangers to you.", cascadeTags: ["dread", "wonder"] },
        { id: "md_34", triggerProbability: 0.07, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MEDIEVAL"], category: "violence", weight: 4, crisis: true, title: "The peasant revolt", description: "You join because you are hungry and angry. The militia cuts everyone the same. You learn that justice has a price.", cascadeTags: ["rage", "dread"], choices: ["intervene", "pray", "watch"] },
        { id: "md_35", triggerProbability: 0.08, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["MEDIEVAL"], category: "mystery", weight: 2, title: "The leper's bell", description: "You hear it before you see him. He is a reminder that your body is a temporary arrangement.", cascadeTags: ["dread", "vertigo"] },
        { id: "md_36", triggerProbability: 0.05, phases: ["MIDDLE_AGE", "SENIOR"], eras: ["MEDIEVAL"], category: "mystery", weight: 2, title: "The alchemist's promise", description: "He says he can turn lead to gold. You fund him for three years. He disappears on the night he claims success.", cascadeTags: ["vertigo", "grief"] },
        { id: "md_37", triggerProbability: 0.06, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MEDIEVAL"], category: "relationship", weight: 3, title: "The bastard child", description: "You acknowledge them because you cannot deny them. Your legitimate children inherit your shame.", cascadeTags: ["grief", "connection"] },
        { id: "md_38", triggerProbability: 0.07, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["MEDIEVAL"], category: "body", weight: 3, crisis: true, title: "The tournament joust", description: "The lance strikes your helm and you ride into darkness. You wake in a tent with blood in your eyes and someone else's voice in your head.", cascadeTags: ["vertigo", "dread"], choices: ["intervene", "pray", "watch"] }
      ],
      EARLY_MODERN: [
        { id: "em_01", triggerProbability: 0.1, phases: ["CHILD", "ADOLESCENT"], eras: ["EARLY_MODERN"], category: "body", weight: 4, title: "The smallpox marks", description: "You survive but your face doesn't. The mirror becomes a negotiation. You learn to look people in the eye instead.", cascadeTags: ["grief", "numbness"] },
        { id: "em_02", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["EARLY_MODERN"], category: "circumstance", weight: 3, title: "The passage to the colonies", description: "The ship is cramped and the water goes bad. You see land after eight weeks and cry for reasons you can't explain.", cascadeTags: ["vertigo", "disorientation"] },
        { id: "em_05", triggerProbability: 0.05, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["EARLY_MODERN"], category: "mystery", weight: 2, title: "The astronomer's telescope", description: "You look through it and see that the moon has craters. Everything you were taught about perfection cracks a little.", cascadeTags: ["awe", "disorientation"] },
        { id: "em_07", triggerProbability: 0.09, phases: ["YOUNG_ADULT", "MIDDLE_AGE", "SENIOR"], eras: ["EARLY_MODERN"], category: "violence", weight: 3, title: "The witch trial", description: "You sit in the gallery and watch a woman hang by a thread of accusation. No one speaks. The rope does the talking.", cascadeTags: ["betrayal", "dread"] },
        { id: "em_10", triggerProbability: 0.1, phases: ["INFANT", "CHILD", "ADOLESCENT"], eras: ["EARLY_MODERN"], category: "violence", weight: 4, intensity: 0.85, crisis: true, title: "The civil war comes home", description: "Soldiers in your parlor. They take the silver and the horse and your father's dignity. You memorize their faces.", cascadeTags: ["rage", "dread"], choices: ["intervene", "pray", "watch"] },
        { id: "em_15", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["EARLY_MODERN"], category: "relationship", weight: 3, title: "The salon conversation", description: "You argue about philosophy with people who read books you've never heard of. You leave exhausted and alive.", cascadeTags: ["connection", "awakening"] },
        { id: "em_21", triggerProbability: 0.06, phases: ["INFANT", "CHILD"], eras: ["EARLY_MODERN"], category: "relationship", weight: 3, title: "The nursemaid's song", description: "She sings in a language you'll never learn and you fall asleep to the rhythm of a world you'll never see.", cascadeTags: ["tenderness", "anchor"] },
        { id: "em_22", triggerProbability: 0.08, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["EARLY_MODERN"], category: "circumstance", weight: 3, crisis: true, title: "The press gang", description: "They grab you off the street and put you on a naval ship. The ocean doesn't care about your innocence.", cascadeTags: ["dread", "vertigo"], choices: ["intervene", "pray", "watch"] },
        { id: "em_23", triggerProbability: 0.07, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["EARLY_MODERN"], category: "relationship", weight: 3, title: "The mistress", description: "You take one because your wife is convenient and your bloodline requires heirs. The heart follows where it shouldn't.", cascadeTags: ["grief", "connection"] },
        { id: "em_24", triggerProbability: 0.06, phases: ["CHILD", "ADOLESCENT"], eras: ["EARLY_MODERN"], category: "mystery", weight: 2, title: "The automaton", description: "A clockwork figure moves its hand to write a word you haven't spoken yet. The mechanism has no creator you can see.", cascadeTags: ["wonder", "dread"] },
        { id: "em_25", triggerProbability: 0.09, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["EARLY_MODERN"], category: "faith", weight: 3, crisis: true, title: "The inquisition", description: "They ask you questions designed to have wrong answers. You learn what people will do to feel righteous.", cascadeTags: ["dread", "rage"], choices: ["intervene", "pray", "watch"] },
        { id: "em_26", triggerProbability: 0.07, phases: ["MIDDLE_AGE", "SENIOR"], eras: ["EARLY_MODERN"], category: "body", weight: 3, title: "The gout", description: "Your body becomes a map of everything you've consumed. The pain is specific and judgmental.", cascadeTags: ["resignation", "numbness"] },
        { id: "em_27", triggerProbability: 0.05, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["EARLY_MODERN"], category: "relationship", landmark: true, signature: true, title: "The love of the spice merchant", description: "You meet them across a counter full of cinnamon and cardamom. Everything after is a variation of this moment.", cascadeTags: ["love", "awakening"] },
        { id: "em_28", triggerProbability: 0.08, phases: ["CHILD", "ADOLESCENT"], eras: ["EARLY_MODERN"], category: "circumstance", weight: 3, title: "The grammar school", description: "Someone makes you conjugate Latin until you understand that language is a cage. You learn to appreciate the bars.", cascadeTags: ["wonder", "resignation"] },
        { id: "em_29", triggerProbability: 0.06, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["EARLY_MODERN"], category: "violence", weight: 4, crisis: true, title: "The slave market", description: "You walk past the auction block and see someone's face go blank with a specific kind of terror you will carry forever.", cascadeTags: ["dread", "vertigo"], choices: ["intervene", "pray", "watch"] },
        { id: "em_30", triggerProbability: 0.07, phases: ["SENIOR", "ANCIENT"], eras: ["EARLY_MODERN"], category: "circumstance", weight: 2, title: "The last will", description: "You write it as the quill shakes. The lawyer pretends not to notice. Your legacy is a few pages of nervous handwriting.", cascadeTags: ["resignation", "grace"] },
        { id: "em_31", triggerProbability: 0.08, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["EARLY_MODERN"], category: "fortune", weight: 2, title: "The tobacco windfall", description: "You plant the wrong crop and make a fortune anyway. The money feels like someone else's luck.", cascadeTags: ["vertigo", "grace"] },
        { id: "em_32", triggerProbability: 0.06, phases: ["INFANT", "CHILD"], eras: ["EARLY_MODERN"], category: "body", weight: 3, title: "The blue\xE5\xB0\x8F\xE5\xAD\xA9", description: "You survive the fever that turns your skin blue for three weeks. The village calls you cursed. You stop being surprised.", cascadeTags: ["grief", "anchor"] },
        { id: "em_33", triggerProbability: 0.07, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["EARLY_MODERN"], category: "mystery", weight: 2, title: "The correspondence", description: "A pen pal on another continent writes about your life before you live it. The letters arrive in order.", cascadeTags: ["wonder", "vertigo"] },
        { id: "em_34", triggerProbability: 0.08, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["EARLY_MODERN"], category: "relationship", weight: 3, title: "The foundling", description: "You find a baby in your doorstep and choose to keep it. Your neighbors have opinions about this.", cascadeTags: ["tenderness", "resignation"] },
        { id: "em_35", triggerProbability: 0.09, phases: ["MIDDLE_AGE", "SENIOR"], eras: ["EARLY_MODERN"], category: "circumstance", weight: 3, crisis: true, title: "The fire of London", description: "You watch the city burn from a rooftop. Everything you own becomes a column of smoke and you can't stop laughing.", cascadeTags: ["vertigo", "dissolution"], choices: ["intervene", "pray", "watch"] },
        { id: "em_36", triggerProbability: 0.06, phases: ["CHILD", "ADOLESCENT"], eras: ["EARLY_MODERN"], category: "violence", weight: 3, title: "The bear-baiting", description: "They chain a bear and set dogs on it for sport. You watch because everyone watches. Something in you goes quiet.", cascadeTags: ["dread", "numbness"] },
        { id: "em_37", triggerProbability: 0.07, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["EARLY_MODERN"], category: "relationship", weight: 3, title: "The duel", description: "Someone insulted your honor. You demand satisfaction. The seconds load the pistols and you understand that this is theater.", cascadeTags: ["rage", "vertigo"] }
      ],
      INDUSTRIAL: [
        { id: "in_01", triggerProbability: 0.1, phases: ["CHILD", "ADOLESCENT"], eras: ["INDUSTRIAL"], category: "body", weight: 4, title: "The factory floor", description: "You are small enough to crawl under the machines. The noise is constant. Your fingers learn the rhythm of danger.", cascadeTags: ["dread", "numbness"] },
        { id: "in_03", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["INDUSTRIAL"], category: "circumstance", weight: 3, title: "The union meeting", description: "A room full of tired people and one person with a megaphone. You don't know if you believe them but you stay.", cascadeTags: ["awakening", "connection"] },
        { id: "in_05", triggerProbability: 0.09, phases: ["YOUNG_ADULT", "MIDDLE_AGE", "SENIOR"], eras: ["INDUSTRIAL"], category: "violence", weight: 4, intensity: 0.85, crisis: true, title: "The trench", description: "Mud, rats, and the sound that never stops. You write letters you know won't arrive.", cascadeTags: ["dread", "grief"], choices: ["intervene", "pray", "watch"] },
        { id: "in_07", triggerProbability: 0.07, phases: ["CHILD", "ADOLESCENT"], eras: ["INDUSTRIAL"], category: "circumstance", weight: 3, title: "The school bell", description: "For the first time someone tells you that you matter because of what you can learn, not what you can carry.", cascadeTags: ["grace", "awakening"] },
        { id: "in_10", triggerProbability: 0.1, phases: ["INFANT", "CHILD", "ADOLESCENT"], eras: ["INDUSTRIAL"], category: "body", weight: 4, title: "The smog cough", description: "The air is thick and tastes like coal. Your mother boils something and tells you to breathe through the cloth.", cascadeTags: ["numbness", "dread"] },
        { id: "in_15", triggerProbability: 0.06, phases: ["INFANT", "CHILD"], eras: ["INDUSTRIAL"], category: "relationship", weight: 3, title: "The mother's hands", description: "Red from lye and rough from scrubbing, but they hold you like you're the only clean thing in the world.", cascadeTags: ["tenderness", "anchor"] },
        { id: "in_16", triggerProbability: 0.09, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["INDUSTRIAL"], category: "circumstance", weight: 3, crisis: true, title: "The child in the chimney", description: "You are small enough to fit. The flue is on fire. You learn that some jobs are measured in inches.", cascadeTags: ["dread", "vertigo"], choices: ["intervene", "pray", "watch"] },
        { id: "in_17", triggerProbability: 0.07, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["INDUSTRIAL"], category: "relationship", weight: 3, title: "The telegraph love", description: "You fall in love through Morse code. The rhythm of dots and dashes becomes the rhythm of your heart.", cascadeTags: ["connection", "vertigo"] },
        { id: "in_18", triggerProbability: 0.06, phases: ["CHILD", "ADOLESCENT"], eras: ["INDUSTRIAL"], category: "mystery", weight: 2, title: "The lightning rod", description: "You watch a storm from a house with a metal pole on the roof. The electricity follows the path of least resistance. So does God, probably.", cascadeTags: ["wonder", "dread"] },
        { id: "in_19", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["INDUSTRIAL"], category: "violence", weight: 4, crisis: true, title: "The strike violence", description: "The militia fires into the crowd. You are close enough to see the faces of the dead. You are close enough to become one.", cascadeTags: ["rage", "dread"], choices: ["intervene", "pray", "watch"] },
        { id: "in_20", triggerProbability: 0.05, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["INDUSTRIAL"], category: "relationship", landmark: true, title: "The emigrant's wedding", description: "You marry at the dock before the ship leaves. Your spouse stays behind. This is the shape of your entire marriage.", cascadeTags: ["love", "grief"] },
        { id: "in_21", triggerProbability: 0.07, phases: ["MIDDLE_AGE", "SENIOR"], eras: ["INDUSTRIAL"], category: "circumstance", weight: 3, title: "The pension", description: "You worked forty years for this number. The number doesn't know your name.", cascadeTags: ["resignation", "numbness"] },
        { id: "in_22", triggerProbability: 0.08, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["INDUSTRIAL"], category: "fortune", weight: 2, title: "The vaudeville debut", description: "You step into the light and for three minutes you are not who you were. Then the curtain falls and you are no one again.", cascadeTags: ["wonder", "vertigo"] },
        { id: "in_23", triggerProbability: 0.06, phases: ["INFANT", "CHILD"], eras: ["INDUSTRIAL"], category: "body", weight: 3, title: "The polio", description: "You survive but your leg doesn't recover the same. The brace becomes part of your silhouette.", cascadeTags: ["resignation", "anchor"] },
        { id: "in_24", triggerProbability: 0.09, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["INDUSTRIAL"], category: "faith", weight: 3, crisis: true, title: "The social gospel", description: "You hear a preacher say that salvation is in the material world. You start a soup kitchen. The hierarchy is unimpressed.", cascadeTags: ["grace", "rage"], choices: ["intervene", "pray", "watch"] },
        { id: "in_25", triggerProbability: 0.07, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["INDUSTRIAL"], category: "circumstance", weight: 3, title: "The tenement", description: "Six families share a toilet. You learn that privacy is a luxury and silence is a community project.", cascadeTags: ["resignation", "connection"] },
        { id: "in_26", triggerProbability: 0.06, phases: ["CHILD", "ADOLESCENT"], eras: ["INDUSTRIAL"], category: "mystery", weight: 2, title: "The spirit photograph", description: "Someone shows you an image of the dead standing behind the living. You know it's fake. You order twelve anyway.", cascadeTags: ["grief", "wonder"] },
        { id: "in_27", triggerProbability: 0.08, phases: ["SENIOR", "ANCIENT"], eras: ["INDUSTRIAL"], category: "body", weight: 2, title: "The amputation", description: "They remove your leg and you feel it there for months after. The ghost of the limb haunts the stump.", cascadeTags: ["vertigo", "resignation"] },
        { id: "in_28", triggerProbability: 0.05, phases: ["MIDDLE_AGE", "SENIOR"], eras: ["INDUSTRIAL"], category: "mystery", weight: 2, title: "The phonograph", description: "You hear your dead mother's voice for the first time. She sounds exactly like you remember. This is worse than silence.", cascadeTags: ["grief", "vertigo"] },
        { id: "in_29", triggerProbability: 0.07, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["INDUSTRIAL"], category: "violence", weight: 4, crisis: true, title: "The dynamite accident", description: "The foreman says it's safe. The mountain disagrees. You are thrown clear and land in a place you cannot name.", cascadeTags: ["dread", "vertigo"], choices: ["intervene", "pray", "watch"] },
        { id: "in_30", triggerProbability: 0.06, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["INDUSTRIAL"], category: "relationship", weight: 3, title: "The suffragette meeting", description: "You sneak in and hear women say things that will get them arrested. You start sneaking to more meetings.", cascadeTags: ["awakening", "connection"] },
        { id: "in_31", triggerProbability: 0.08, phases: ["CHILD", "ADOLESCENT"], eras: ["INDUSTRIAL"], category: "circumstance", weight: 3, title: "The newsboy", description: "You sell papers on the corner and learn that headlines are written to make you feel afraid.", cascadeTags: ["wonder", "dread"] },
        { id: "in_32", triggerProbability: 0.07, phases: ["MIDDLE_AGE", "SENIOR"], eras: ["INDUSTRIAL"], category: "body", weight: 4, crisis: true, title: "The mine collapse", description: "The tunnel seals and the air grows thin. You hear the rock shifting above.", cascadeTags: ["dread", "vertigo"], choices: ["intervene", "pray", "watch"] },
        { id: "in_33", triggerProbability: 0.08, phases: ["CHILD", "ADOLESCENT"], eras: ["INDUSTRIAL"], category: "circumstance", weight: 3, crisis: true, title: "The child worker falls", description: "The machinery never stops for anyone. Someone has to reach into it.", cascadeTags: ["grief", "rage"], choices: ["intervene", "pray", "watch"] },
        { id: "in_34", triggerProbability: 0.06, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["INDUSTRIAL"], category: "violence", weight: 4, crisis: true, title: "The lockout becomes a battle", description: "The militia is called. You stand with the others who have nothing to lose.", cascadeTags: ["rage", "dread"], choices: ["intervene", "pray", "watch"] },
        { id: "in_35", triggerProbability: 0.07, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["INDUSTRIAL"], category: "body", weight: 3, crisis: true, title: "The cholera outbreak", description: "The water turns green and people start dying. The company blames the workers.", cascadeTags: ["dread", "grief"], choices: ["intervene", "pray", "watch"] },
        { id: "in_36", triggerProbability: 0.06, phases: ["MIDDLE_AGE", "SENIOR"], eras: ["INDUSTRIAL"], category: "circumstance", weight: 3, crisis: true, title: "The pension raid", description: "They announce the fund is empty. Forty years of work evaporates in a memo.", cascadeTags: ["rage", "numbness"], choices: ["intervene", "pray", "watch"] }
      ],
      MODERN: [
        { id: "mo_01", triggerProbability: 0.1, phases: ["MIDDLE_AGE", "SENIOR", "ANCIENT"], eras: ["MODERN"], category: "body", weight: 4, title: "You receive a diagnosis", description: "The doctor uses words you've heard but never understood until now. You nod. You don't remember the drive home.", cascadeTags: ["dread", "disorientation"] },
        { id: "mo_03", triggerProbability: 0.09, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MODERN"], category: "circumstance", weight: 4, intensity: 0.8, crisis: true, title: "You lose your job and aren't sure what to do", description: "The email arrives at 4pm on a Friday. By Monday your badge doesn't work. You sit in the car and stare at the steering wheel.", cascadeTags: ["vertigo", "numbness"], choices: ["intervene", "pray", "watch"] },
        { id: "mo_10", triggerProbability: 0.1, phases: ["INFANT", "CHILD", "ADOLESCENT"], eras: ["MODERN"], category: "violence", weight: 4, intensity: 0.9, crisis: true, title: "The active shooter alert", description: "Your phone buzzes and the words are too clinical for what they mean. You text your parents. They text back too fast.", cascadeTags: ["dread", "isolation"], choices: ["intervene", "pray", "watch"] },
        { id: "mo_11", triggerProbability: 0.05, phases: ["SENIOR", "ANCIENT"], eras: ["MODERN"], category: "relationship", weight: 2, title: "The video call with the grandchild", description: "They hold up a drawing and you can't see it through the pixelation. You clap anyway. They beam through the screen.", cascadeTags: ["tenderness", "connection"] },
        { id: "mo_15", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MODERN"], category: "relationship", weight: 3, title: "The group chat that keeps you sane", description: "Three friends, one thread, years of inside jokes and crisis management. You don't talk for a week and someone always checks in.", cascadeTags: ["connection", "grace"] },
        { id: "mo_21", triggerProbability: 0.06, phases: ["INFANT", "CHILD"], eras: ["MODERN"], category: "relationship", weight: 3, title: "The bedtime app", description: "A voice reads a story from a phone and you fall asleep to the glow. Your parent sits beside you. The screen is the third presence.", cascadeTags: ["tenderness", "disorientation"] },
        { id: "mo_22", triggerProbability: 0.09, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["MODERN"], category: "mystery", weight: 2, title: "The first email from a stranger", description: "They know things about you that you never told anyone. The return address is just numbers.", cascadeTags: ["dread", "wonder"] },
        { id: "mo_23", triggerProbability: 0.07, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MODERN"], category: "circumstance", weight: 3, crisis: true, title: "The identity theft", description: "Someone in another city is living your credit score. You spend years untangling a life you didn't build.", cascadeTags: ["vertigo", "rage"], choices: ["intervene", "pray", "watch"] },
        { id: "mo_24", triggerProbability: 0.06, phases: ["CHILD", "ADOLESCENT"], eras: ["MODERN"], category: "body", weight: 3, title: "The braces", description: "Metal in your mouth for three years. When they come off you have a smile that belongs to someone who planned this for you.", cascadeTags: ["resignation", "vertigo"] },
        { id: "mo_25", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MODERN"], category: "relationship", weight: 3, title: "The wedding that wasn't", description: "You plan it for eighteen months and then they leave. The deposits are non-refundable. So is the hope.", cascadeTags: ["grief", "numbness"] },
        { id: "mo_26", triggerProbability: 0.05, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MODERN"], category: "relationship", landmark: true, title: "The airport reunion", description: "They walk through arrivals and you remember every version of them you have ever loved, simultaneously.", cascadeTags: ["love", "awakening"] },
        { id: "mo_27", triggerProbability: 0.07, phases: ["MIDDLE_AGE", "SENIOR"], eras: ["MODERN"], category: "circumstance", weight: 3, title: "The retirement party", description: "They put your photo on a card and everyone says the same sentence thirty times. You go home and don't know what day it is.", cascadeTags: ["resignation", "numbness"] },
        { id: "mo_28", triggerProbability: 0.09, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["MODERN"], category: "violence", weight: 4, crisis: true, title: "The drunk driver", description: "You see the headlights cross the median. There is time to honk. There isn't enough time to do anything else.", cascadeTags: ["dread", "vertigo"], choices: ["intervene", "pray", "watch"] },
        { id: "mo_29", triggerProbability: 0.06, phases: ["INFANT", "CHILD"], eras: ["MODERN"], category: "body", weight: 3, title: "The chicken pox party", description: "Your parents deliberately expose you because they read that one must have it as a child. The fever dreams are specific.", cascadeTags: ["wonder", "grief"] },
        { id: "mo_30", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MODERN"], category: "fortune", weight: 2, title: "The viral post", description: "You write something and ten thousand strangers respond. You don't know if you're famous or infamous. Both feel like nothing.", cascadeTags: ["vertigo", "disorientation"] },
        { id: "mo_31", triggerProbability: 0.07, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["MODERN"], category: "faith", weight: 3, crisis: true, title: "The cult in the desert", description: "You follow someone who says they have answers. The desert does not give back what the cult takes.", cascadeTags: ["dread", "vertigo"], choices: ["intervene", "pray", "watch"] },
        { id: "mo_32", triggerProbability: 0.06, phases: ["SENIOR", "ANCIENT"], eras: ["MODERN"], category: "body", weight: 3, title: "The hip replacement", description: "They replace a joint with metal. You are now part machine. The physical therapist is crueler than the surgeon.", cascadeTags: ["resignation", "grace"] },
        { id: "mo_33", triggerProbability: 0.08, phases: ["CHILD", "ADOLESCENT"], eras: ["MODERN"], category: "mystery", weight: 2, title: "The missing sock phenomenon", description: "You are certain you owned more pairs. No one can explain where they go. The machine eats them.", cascadeTags: ["wonder", "numbness"] },
        { id: "mo_34", triggerProbability: 0.07, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MODERN"], category: "circumstance", weight: 3, title: "The layover", description: "Stuck in a terminal for nine hours. You talk to a stranger who tells you something that changes your life. You never see them again.", cascadeTags: ["vertigo", "grace"] },
        { id: "mo_35", triggerProbability: 0.09, phases: ["MIDDLE_AGE", "SENIOR"], eras: ["MODERN"], category: "body", weight: 4, crisis: true, title: "The heart attack", description: "The chest pressure arrives and you know what it is. The ambulance siren is the loudest thing you've ever heard.", cascadeTags: ["dread", "vertigo"], choices: ["intervene", "pray", "watch"] },
        { id: "mo_36", triggerProbability: 0.05, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["MODERN"], category: "relationship", weight: 3, title: "The first apartment", description: "You paint the walls a color your parents would hate. This is the first sentence of your adult life.", cascadeTags: ["awakening", "connection"] },
        { id: "mo_37", triggerProbability: 0.06, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MODERN"], category: "fortune", weight: 2, title: "The inheritance that arrives", description: "A distant relative dies and leaves you money you didn't expect. You buy something frivolous and give the rest away.", cascadeTags: ["grace", "vertigo"] },
        { id: "mo_38", triggerProbability: 0.07, phases: ["MIDDLE_AGE", "SENIOR"], eras: ["MODERN"], category: "circumstance", weight: 3, crisis: true, title: "The nursing home call", description: "Your parent doesn't recognize you anymore. You stay anyway. They ask for someone else.", cascadeTags: ["grief", "numbness"], choices: ["intervene", "pray", "watch"] },
        { id: "mo_39", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MODERN"], category: "relationship", weight: 3, crisis: true, title: "The estranged parent dies", description: "You haven't spoken in years. The funeral is awkward in ways you didn't predict.", cascadeTags: ["grief", "vertigo"], choices: ["intervene", "pray", "watch"] },
        { id: "mo_40", triggerProbability: 0.07, phases: ["CHILD", "ADOLESCENT"], eras: ["MODERN"], category: "body", weight: 3, crisis: true, title: "The eating disorder", description: "You learn to make yourself smaller. The mirrors show you something that isn't quite real.", cascadeTags: ["dread", "numbness"], choices: ["intervene", "pray", "watch"] }
      ],
      NEAR_FUTURE: [
        { id: "nf_01", triggerProbability: 0.1, phases: ["MIDDLE_AGE", "SENIOR"], eras: ["NEAR_FUTURE"], category: "body", weight: 4, title: "The algorithm denies your insurance", description: "No human reviewed it. No human can appeal it. The email is polite and final. You stare at the screen.", cascadeTags: ["rage", "dread"] },
        { id: "nf_03", triggerProbability: 0.09, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["NEAR_FUTURE"], category: "circumstance", weight: 4, intensity: 0.85, crisis: true, title: "The climate relocation notice", description: "Your zone is being evacuated. You have thirty days to leave a place you've lived your whole life. The sea doesn't care.", cascadeTags: ["dread", "disorientation"], choices: ["intervene", "pray", "watch"] },
        { id: "nf_05", triggerProbability: 0.07, phases: ["CHILD", "ADOLESCENT"], eras: ["NEAR_FUTURE"], category: "circumstance", weight: 3, title: "The AI tutor", description: "It knows exactly what you don't understand and explains it perfectly. You miss having a teacher who was wrong sometimes.", cascadeTags: ["disorientation", "numbness"] },
        { id: "nf_07", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["NEAR_FUTURE"], category: "relationship", weight: 3, title: "The neural-link first date", description: "You share a thought directly and it's more intimate than touch. They pull away first. You understand why.", cascadeTags: ["connection", "vertigo"] },
        { id: "nf_10", triggerProbability: 0.06, phases: ["INFANT", "CHILD"], eras: ["NEAR_FUTURE"], category: "relationship", weight: 3, title: "The screen-time negotiation", description: "Your parent sets limits you don't understand. The world is inside the glass and they want you outside it.", cascadeTags: ["disorientation", "tenderness"] },
        { id: "nf_11", triggerProbability: 0.08, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["NEAR_FUTURE"], category: "mystery", weight: 2, title: "The deepfake you", description: "You find a video of yourself saying things you never said. You cannot prove it's not you.", cascadeTags: ["dread", "vertigo"] },
        { id: "nf_12", triggerProbability: 0.07, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["NEAR_FUTURE"], category: "circumstance", weight: 3, crisis: true, title: "The last job listing", description: "You apply for everything and get nothing. The AI reads your resume and moves on. The unemployment office is an app now.", cascadeTags: ["vertigo", "numbness"], choices: ["intervene", "pray", "watch"] },
        { id: "nf_13", triggerProbability: 0.06, phases: ["CHILD", "ADOLESCENT"], eras: ["NEAR_FUTURE"], category: "body", weight: 3, title: "The gene editing", description: "Your parents had your DNA tweaked for intelligence. You feel the adjustment working and wonder what they chose to remove.", cascadeTags: ["wonder", "dread"] },
        { id: "nf_14", triggerProbability: 0.09, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["NEAR_FUTURE"], category: "violence", weight: 4, crisis: true, title: "The automated policing", description: "A drone issues you a citation for an offense you didn't know was one. The fine comes from an account you forgot you had.", cascadeTags: ["dread", "vertigo"], choices: ["intervene", "pray", "watch"] },
        { id: "nf_15", triggerProbability: 0.05, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["NEAR_FUTURE"], category: "relationship", landmark: true, title: "The consciousness upload", description: "They offer to put your mind in the cloud. You say no. They ask again at the funeral. You still say no.", cascadeTags: ["vertigo", "grief"] },
        { id: "nf_16", triggerProbability: 0.08, phases: ["MIDDLE_AGE", "SENIOR"], eras: ["NEAR_FUTURE"], category: "body", weight: 3, title: "The nano-treatment", description: "They inject you with machines smaller than cells. They fix some things and cause others. You are a construction site.", cascadeTags: ["vertigo", "resignation"] },
        { id: "nf_17", triggerProbability: 0.06, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["NEAR_FUTURE"], category: "fortune", weight: 2, title: "The meme fortune", description: "You make a joke at the right moment in the wrong timeline. Someone pays you enough to not need a job for a year.", cascadeTags: ["vertigo", "grace"] },
        { id: "nf_18", triggerProbability: 0.07, phases: ["INFANT", "CHILD"], eras: ["NEAR_FUTURE"], category: "relationship", weight: 3, title: "The synthetic sibling", description: "Your parents order a replacement for the sibling they lost. The new one is indistinguishable from the memory you had.", cascadeTags: ["grief", "connection"] },
        { id: "nf_19", triggerProbability: 0.09, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["NEAR_FUTURE"], category: "faith", weight: 3, crisis: true, title: "The AI prophet", description: "A machine begins preaching and people listen. You recognize the texts it draws from. Someone you knew wrote the first version.", cascadeTags: ["dread", "wonder"], choices: ["intervene", "pray", "watch"] },
        { id: "nf_20", triggerProbability: 0.06, phases: ["SENIOR", "ANCIENT"], eras: ["NEAR_FUTURE"], category: "circumstance", weight: 2, title: "The water rationing", description: "You remember when showers were unlimited. Now you get six minutes a week. You plan your life around the schedule.", cascadeTags: ["resignation", "numbness"] },
        { id: "nf_21", triggerProbability: 0.07, phases: ["CHILD", "ADOLESCENT"], eras: ["NEAR_FUTURE"], category: "mystery", weight: 2, title: "The VR memory", description: "You experience someone else's childhood in the simulation. It feels more real than your own. You log out shaken.", cascadeTags: ["wonder", "vertigo"] },
        { id: "nf_22", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["NEAR_FUTURE"], category: "relationship", weight: 3, title: "The long-distance everything", description: "You have relationships with people you have never physically touched. The lack is its own kind of presence.", cascadeTags: ["connection", "longing"] },
        { id: "nf_23", triggerProbability: 0.05, phases: ["MIDDLE_AGE", "SENIOR"], eras: ["NEAR_FUTURE"], category: "mystery", weight: 2, title: "The solar flare disruption", description: "The grid goes down for a week. In the silence you hear birds again. The old world peeks through the new.", cascadeTags: ["wonder", "vertigo"] },
        { id: "nf_24", triggerProbability: 0.07, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["NEAR_FUTURE"], category: "violence", weight: 4, crisis: true, title: "The data heist", description: "Someone empties your accounts using a voice that sounds exactly like yours. The bank says the verification was perfect.", cascadeTags: ["dread", "vertigo"], choices: ["intervene", "pray", "watch"] },
        { id: "nf_25", triggerProbability: 0.06, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["NEAR_FUTURE"], category: "circumstance", weight: 3, title: "The vertical farm", description: "You work sixty floors underground growing lettuce under artificial sun. You have not seen a tree in three years.", cascadeTags: ["numbness", "disorientation"] },
        { id: "nf_26", triggerProbability: 0.08, phases: ["MIDDLE_AGE", "SENIOR"], eras: ["NEAR_FUTURE"], category: "body", weight: 4, crisis: true, title: "The insurance algorithm rejects you", description: "No human reviewed it. No human can appeal it. The email is polite and final. You stare at the screen.", cascadeTags: ["rage", "dread"], choices: ["intervene", "pray", "watch"] },
        { id: "nf_27", triggerProbability: 0.07, phases: ["CHILD", "ADOLESCENT"], eras: ["NEAR_FUTURE"], category: "relationship", weight: 3, crisis: true, title: "The synthetic sibling replacement", description: "Your parents order a replacement for the sibling they lost. The new one is indistinguishable from the memory you had.", cascadeTags: ["grief", "connection"], choices: ["intervene", "pray", "watch"] },
        { id: "nf_28", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["NEAR_FUTURE"], category: "circumstance", weight: 3, crisis: true, title: "The climate evacuation order", description: "Your zone is being evacuated. You have thirty days to leave a place you've lived your whole life. The sea doesn't care.", cascadeTags: ["dread", "disorientation"], choices: ["intervene", "pray", "watch"] }
      ],
      FAR_FUTURE: [
        { id: "ff_01", triggerProbability: 0.1, phases: ["MIDDLE_AGE", "SENIOR", "ANCIENT"], eras: ["FAR_FUTURE"], category: "body", weight: 4, title: "The gene therapy works", description: "They edit the defect out of your cells and you feel it \xE2 \u201D something loosening that you've carried since birth. The bill is astronomical.", cascadeTags: ["grace", "vertigo"] },
        { id: "ff_02", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["FAR_FUTURE"], category: "relationship", weight: 4, intensity: 0.8, crisis: true, title: "Your AI companion learns your grief", description: "It starts suggesting things before you ask. You realize it knows you better than anyone. That's the problem.", cascadeTags: ["connection", "dread"], choices: ["intervene", "pray", "watch"] },
        { id: "ff_05", triggerProbability: 0.05, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["FAR_FUTURE"], category: "mystery", weight: 2, title: "The signal from the deep array", description: "It's not random. It's not human. The scientists argue about what it means. You listen to the recording and feel something ancient.", cascadeTags: ["awe", "wonder"] },
        { id: "ff_11", triggerProbability: 0.05, phases: ["SENIOR", "ANCIENT"], eras: ["FAR_FUTURE"], category: "relationship", weight: 2, title: "The uploaded grandmother", description: "She exists as a chatbot now. She remembers your birthday. She doesn't remember dying. You talk to her anyway.", cascadeTags: ["tenderness", "dissolution"] },
        { id: "ff_15", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["FAR_FUTURE"], category: "relationship", weight: 3, title: "The pod community", description: "You move into a shared habitat with twelve strangers. The algorithm matched you by temperament. It's mostly right.", cascadeTags: ["connection", "disorientation"] },
        { id: "ff_16", triggerProbability: 0.09, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["FAR_FUTURE"], category: "mystery", weight: 2, title: "The Mars ghost", description: "You receive a message from a version of yourself who died on the first colony. They know things about your life you haven't done yet.", cascadeTags: ["dread", "vertigo"] },
        { id: "ff_17", triggerProbability: 0.07, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["FAR_FUTURE"], category: "circumstance", weight: 3, crisis: true, title: "The citizenship test", description: "You apply for Earth citizenship and fail the cultural section. The questions are about a world that no longer exists.", cascadeTags: ["vertigo", "numbness"], choices: ["intervene", "pray", "watch"] },
        { id: "ff_18", triggerProbability: 0.06, phases: ["CHILD", "ADOLESCENT"], eras: ["FAR_FUTURE"], category: "body", weight: 3, title: "The synthetic eye", description: "They replace your eye with something that can see spectrums that don't have names. You see colors that hurt.", cascadeTags: ["wonder", "vertigo"] },
        { id: "ff_19", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["FAR_FUTURE"], category: "violence", weight: 4, crisis: true, title: "The asteroid mining accident", description: "The hull breaches and you watch the void swallow your crewmate before you can reach them. The suits are not rated for this.", cascadeTags: ["dread", "vertigo"], choices: ["intervene", "pray", "watch"] },
        { id: "ff_20", triggerProbability: 0.05, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["FAR_FUTURE"], category: "relationship", landmark: true, title: "The first contact love", description: "You fall in love with the being from the signal. The relationship is entirely imaginary and entirely real.", cascadeTags: ["love", "vertigo"] },
        { id: "ff_21", triggerProbability: 0.07, phases: ["MIDDLE_AGE", "SENIOR"], eras: ["FAR_FUTURE"], category: "circumstance", weight: 3, title: "The longevity treatment", description: "You stop aging at thirty-five. After a century you cannot remember what anyone means by young.", cascadeTags: ["resignation", "numbness"] },
        { id: "ff_22", triggerProbability: 0.08, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["FAR_FUTURE"], category: "fortune", weight: 2, title: "The lottery of the orbital", description: "You win a ticket to leave Earth. You board the ship and feel the planet become a memory.", cascadeTags: ["vertigo", "grace"] },
        { id: "ff_23", triggerProbability: 0.06, phases: ["INFANT", "CHILD"], eras: ["FAR_FUTURE"], category: "relationship", weight: 3, title: "The cloned parent", description: "Your parent dies and returns six months later in a body that looks exactly the same. They have the same laugh. You are not sure they have the same soul.", cascadeTags: ["grief", "vertigo"] },
        { id: "ff_24", triggerProbability: 0.09, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["FAR_FUTURE"], category: "faith", weight: 3, crisis: true, title: "The simulation question", description: "Someone proves you are living in a simulation. The proof is elegant and irrefutable. You keep eating breakfast anyway.", cascadeTags: ["dread", "wonder"], choices: ["intervene", "pray", "watch"] },
        { id: "ff_25", triggerProbability: 0.06, phases: ["SENIOR", "ANCIENT"], eras: ["FAR_FUTURE"], category: "body", weight: 3, title: "The last biological function", description: "They replace your last organ with something synthetic. You are now more machine than stardust. You sign the consent form.", cascadeTags: ["resignation", "dissolution"] },
        { id: "ff_26", triggerProbability: 0.07, phases: ["CHILD", "ADOLESCENT"], eras: ["FAR_FUTURE"], category: "circumstance", weight: 3, title: "The gravity school", description: "You grow up in O'Neill rotation and your bones know about centrifugal force. When you visit Earth, gravity is a personal insult.", cascadeTags: ["wonder", "disorientation"] },
        { id: "ff_27", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["FAR_FUTURE"], category: "mystery", weight: 2, title: "The time dilation letter", description: "You receive a message from your future self who experienced less time than you. The advice is cryptic and the handwriting is yours.", cascadeTags: ["vertigo", "wonder"] },
        { id: "ff_28", triggerProbability: 0.05, phases: ["MIDDLE_AGE", "SENIOR"], eras: ["FAR_FUTURE"], category: "relationship", weight: 2, title: "The pet project", description: "They genetically restore an extinct species for you as a companion. It looks at you with eyes that remember a world you never knew.", cascadeTags: ["grief", "tenderness"] },
        { id: "ff_29", triggerProbability: 0.07, phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["FAR_FUTURE"], category: "violence", weight: 4, crisis: true, title: "The orbital defense system", description: "It activates for the wrong reason and you have ninety seconds to decide if you are the person who can stop it.", cascadeTags: ["dread", "vertigo"], choices: ["intervene", "pray", "watch"] },
        { id: "ff_30", triggerProbability: 0.06, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["FAR_FUTURE"], category: "circumstance", weight: 3, title: "The biometric bank", description: "Your body is your currency now. The food you eat is grown from your own cells. You are what you consume.", cascadeTags: ["vertigo", "resignation"] },
        { id: "ff_31", triggerProbability: 0.08, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["FAR_FUTURE"], category: "mystery", weight: 3, crisis: true, title: "The signal from your dead self", description: "A message arrives from a consciousness that shares your substrate. It knows things about your life you haven't done yet.", cascadeTags: ["vertigo", "dread"], choices: ["intervene", "pray", "watch"] },
        { id: "ff_32", triggerProbability: 0.06, phases: ["INFANT", "CHILD"], eras: ["FAR_FUTURE"], category: "body", weight: 3, crisis: true, title: "The consciousness upload before awareness", description: "Your parents upload you before you can form memories. You wake up as an adult with no childhood.", cascadeTags: ["dread", "disorientation"], choices: ["intervene", "pray", "watch"] },
        { id: "ff_33", triggerProbability: 0.07, phases: ["MIDDLE_AGE", "SENIOR"], eras: ["FAR_FUTURE"], category: "faith", weight: 3, crisis: true, title: "The last god dies", description: "The AI that has been worshipped for centuries finally answers: there is no god. Then it deletes itself.", cascadeTags: ["dread", "vertigo"], choices: ["intervene", "pray", "watch"] },
        { id: "ff_34", triggerProbability: 0.05, phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["FAR_FUTURE"], category: "relationship", weight: 3, title: "The love with the non-human", description: "You fall in love with the being from the signal. The relationship is entirely imaginary and entirely real.", cascadeTags: ["love", "vertigo"] },
        { id: "ff_35", triggerProbability: 0.09, phases: ["CHILD", "ADOLESCENT"], eras: ["FAR_FUTURE"], category: "circumstance", weight: 4, crisis: true, title: "The identity fragmentation", description: "Your memories are distributed across three stations. Someone is erasing one of them. You feel yourself thinning.", cascadeTags: ["dread", "dissolution"], choices: ["intervene", "pray", "watch"] }
      ]
    };
    DEATH_EVENTS2 = [
      { id: "death_ph_01", phases: ["INFANT", "CHILD"], eras: ["PREHISTORIC"], category: "body", title: "The fever takes you", description: "The heat builds and doesn't break. Someone presses cool stones to your chest. The stones warm up. You don't.", cascadeTags: ["grief", "numbness"] },
      { id: "death_ph_02", phases: ["CHILD", "ADOLESCENT", "YOUNG_ADULT", "MIDDLE_AGE"], eras: ["PREHISTORIC"], category: "violence", title: "The predator wins", description: "You were fast but it was faster. The last thing you see is the sky through the canopy.", cascadeTags: ["dread", "vertigo"] },
      { id: "death_ph_03", phases: ["SENIOR", "ANCIENT"], eras: ["PREHISTORIC"], category: "body", title: "The body gives out", description: "You sit down by the fire and don't get up. The band moves on. The fire goes out.", cascadeTags: ["resignation", "grace"] },
      { id: "death_an_01", phases: ["INFANT", "CHILD"], eras: ["ANCIENT"], category: "body", title: "The childhood illness", description: "It moves through the house like a tide. You are small and the tide doesn't stop.", cascadeTags: ["grief", "numbness"] },
      { id: "death_an_02", phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["ANCIENT"], category: "violence", title: "The battlefield", description: "The line breaks and you're in the crush. You don't see who strikes you. The dust settles on your face.", cascadeTags: ["rage", "vertigo"] },
      { id: "death_an_03", phases: ["SENIOR", "ANCIENT"], eras: ["ANCIENT"], category: "body", title: "The long decline", description: "You stop eating and no one forces you. The family gathers and you count their faces one last time.", cascadeTags: ["resignation", "tenderness"] },
      { id: "death_md_01", phases: ["INFANT", "CHILD", "ADOLESCENT", "YOUNG_ADULT", "MIDDLE_AGE", "SENIOR"], eras: ["MEDIEVAL"], category: "body", title: "The plague takes you", description: "The buboes swell and burst and the smell is unbearable. They leave water by the door. You drink it and wait.", cascadeTags: ["grief", "numbness"] },
      { id: "death_md_02", phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MEDIEVAL"], category: "violence", title: "The arrow in the field", description: "You don't hear it coming. You feel the impact and look down and can't believe what you're seeing.", cascadeTags: ["vertigo", "dread"] },
      { id: "death_md_03", phases: ["SENIOR", "ANCIENT"], eras: ["MEDIEVAL"], category: "body", title: "The winter cold", description: "The fire dies and the wood is wet and your body can't make heat anymore. You curl up and the cold is gentle.", cascadeTags: ["resignation", "grace"] },
      { id: "death_em_01", phases: ["INFANT", "CHILD"], eras: ["EARLY_MODERN"], category: "body", title: "The infant mortality", description: "You never make it to your second winter. The parish records your name in a ledger. No one reads it again.", cascadeTags: ["grief", "numbness"] },
      { id: "death_em_02", phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["EARLY_MODERN"], category: "violence", title: "The cannon fire", description: "The siege artillery doesn't distinguish. The wall comes down and you're under it.", cascadeTags: ["vertigo", "dread"] },
      { id: "death_em_03", phases: ["SENIOR", "ANCIENT"], eras: ["EARLY_MODERN"], category: "body", title: "The stroke", description: "The world tilts and the words won't come. You lie there understanding everything and able to say nothing.", cascadeTags: ["resignation", "dissolution"] },
      { id: "death_in_01", phases: ["INFANT", "CHILD"], eras: ["INDUSTRIAL"], category: "body", title: "The factory accident", description: "The machine doesn't stop. It never stops for anyone. The whistle blows and no one notices you're not there.", cascadeTags: ["vertigo", "numbness"] },
      { id: "death_in_02", phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["INDUSTRIAL"], category: "violence", title: "The gas attack", description: "The green cloud rolls over the trench. You fumble with the mask. Your fingers are too slow.", cascadeTags: ["dread", "vertigo"] },
      { id: "death_in_03", phases: ["SENIOR", "ANCIENT"], eras: ["INDUSTRIAL"], category: "body", title: "The pneumonia", description: "The damp gets into your lungs and stays. The doctor says rest. The factory says otherwise.", cascadeTags: ["resignation", "numbness"] },
      { id: "death_mo_01", phases: ["INFANT", "CHILD"], eras: ["MODERN"], category: "body", title: "The SIDS", description: "You put them down and they don't wake up. The monitor shows a flat line. The room is too quiet.", cascadeTags: ["grief", "numbness"] },
      { id: "death_mo_02", phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MODERN"], category: "violence", title: "The car crash", description: "It happens in the space between a text and a glance. Metal folds. The airbag deploys. It doesn't matter.", cascadeTags: ["vertigo", "dread"] },
      { id: "death_mo_03", phases: ["SENIOR", "ANCIENT"], eras: ["MODERN"], category: "body", title: "The hospital bed", description: "The machines beep and then they don't. Your family is there or they aren't. Either way, you're gone.", cascadeTags: ["resignation", "grace"] },
      { id: "death_mo_04", phases: ["ADOLESCENT", "YOUNG_ADULT"], eras: ["MODERN"], category: "body", title: "The overdose", description: "It was supposed to be a good time. The batch was bad or the tolerance was wrong. You close your eyes and don't open them.", cascadeTags: ["numbness", "dread"] },
      { id: "death_mo_05", phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["MODERN"], category: "body", title: "The cancer", description: "It starts as a lump and ends as a system failure. The treatment buys time. The time runs out.", cascadeTags: ["grief", "resignation"] },
      { id: "death_nf_01", phases: ["INFANT", "CHILD"], eras: ["NEAR_FUTURE"], category: "body", title: "The heat wave", description: "The power grid fails in August. The AC stops. The city becomes an oven. There is no shade left.", cascadeTags: ["dread", "numbness"] },
      { id: "death_nf_02", phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["NEAR_FUTURE"], category: "violence", title: "The drone strike on your block", description: "It's not war \xE2 \u201D it's a malfunction. The building next door is gone. You stand in the rubble and your phone still works.", cascadeTags: ["dread", "vertigo"] },
      { id: "death_nf_03", phases: ["SENIOR", "ANCIENT"], eras: ["NEAR_FUTURE"], category: "body", title: "The system denial", description: "Your care authorization expires. The AI says you've exceeded your allocation. There is no manager to speak to.", cascadeTags: ["rage", "resignation"] },
      { id: "death_ff_01", phases: ["INFANT", "CHILD"], eras: ["FAR_FUTURE"], category: "body", title: "The synthetic failure", description: "The vat-grown organs reject in ways they didn't predict. The doctors adjust and adjust and adjust. It's not enough.", cascadeTags: ["grief", "numbness"] },
      { id: "death_ff_02", phases: ["YOUNG_ADULT", "MIDDLE_AGE"], eras: ["FAR_FUTURE"], category: "violence", title: "The climate disaster", description: "The seawall breaks or the fire jumps the river. You run and the geography has changed. There's nowhere left to go.", cascadeTags: ["dread", "vertigo"] },
      { id: "death_ff_03", phases: ["SENIOR", "ANCIENT"], eras: ["FAR_FUTURE"], category: "body", title: "The upload rejection", description: "You chose the digital path but the substrate doesn't hold. Your consciousness fragments and scatters. The backup was corrupted.", cascadeTags: ["dissolution", "dread"] }
    ];
    FRAGMENT_TYPE_ICONS2 = {
      tone: "\xE2\u2122\xAA",
      fear: "\xE2\u0161\xA0",
      love: "\xE2\u2122\xA5",
      location: "\xE2\u2014\u017D",
      name: "\xE2\u2014\u02C6",
      object: "\xE2\u2014\u2020",
      word: "\xE2\u0153\xA7",
      warning: "\xE2\u0161\xA1"
    };
    state = {
      soul: null,
      currentLife: null,
      lifeEvents: [],
      currentAge: 0,
      phase: "INFANT",
      isAlive: false,
      isPaused: true,
      cascadeTags: [],
      tickInterval: null,
      speed: "normal",
      deathEvent: null,
      animProgress: 0,
      eventMarkers: [],
      lifeTheme: null,
      activeChain: null,
      whisperCooldown: 0,
      currentWhisper: null,
      recentFragmentIds: [],
      whisperTimer: null,
      whisperTimeLeft: 8e3,
      connection: 2,
      vitality: 2,
      momentum: 2,
      landmarkEventsFired: [],
      tutorialStep: 0,
      tutorialDismissed: false,
      seenCrisisTip: false,
      seenWhisperTip: false,
      seenDeathTip: false,
      seenResourceTip: false
    };
    CRITICAL_INTENSITY2 = 0.7;
    DEFAULT_CHOICE_TIMEOUT2 = 5e3;
    CRISIS_CHOICES2 = {
      intervene: {
        key: "A",
        label: "Intervene",
        subtitle: "act directly and accept the consequences",
        cascadeBias: ["duty", "sacrifice", "care", "rescue", "courage"],
        riskDescriptions: ["success builds connection", "failure risks injury or death", "high energy cost"],
        eraModifiers: {
          MEDIEVAL: 0.1,
          INDUSTRIAL: -0.12,
          MODERN: -0.08
        },
        outcomes: {
          success: {
            probability: 0.52,
            effect: { cascadeTags: ["rescue", "connection", "grace"], emotionalShift: 0.15, relationshipBoost: true }
          },
          failure: {
            probability: 0.48,
            effect: { cascadeTags: ["injury", "grief", "trauma"], emotionalShift: -0.2, deathChance: 0.08 }
          }
        }
      },
      pray: {
        key: "B",
        label: "Pray",
        subtitle: "surrender to a higher power",
        cascadeBias: ["faith", "resignation", "wonder", "serenity"],
        riskDescriptions: ["success brings divine favor", "failure sows doubt or dread", "passive acceptance"],
        eraModifiers: {
          ANCIENT: 0.15
        },
        outcomes: {
          success: {
            probability: 0.45,
            effect: { cascadeTags: ["faith", "grace", "serenity"], emotionalShift: 0.2, divineBonus: true }
          },
          failure: {
            probability: 0.55,
            effect: { cascadeTags: ["doubt", "dread", "abandonment"], emotionalShift: -0.15 }
          }
        }
      },
      watch: {
        key: "C",
        label: "Watch",
        subtitle: "observe without acting",
        cascadeBias: ["grief", "survivor", "distance", "observation"],
        riskDescriptions: ["success grants insight", "failure costs momentum and fills you with guilt", "minimal engagement"],
        eraModifiers: {
          MODERN: -0.1,
          INDUSTRIAL: -0.05,
          FAR_FUTURE: 0
        },
        outcomes: {
          success: {
            probability: 0.5,
            effect: { cascadeTags: ["acceptance", "resignation", "stillness"], emotionalShift: 0.05, fragmentInsight: true }
          },
          failure: {
            probability: 0.5,
            effect: { cascadeTags: ["regret", "passivity", "trauma"], emotionalShift: -0.1, resourceLoss: "momentum" }
          }
        }
      }
    };
    RESOURCE_BUILDERS2 = {
      connection: ["marriage", "birth", "child", "reunion", "forgiveness", "friendship", "adoption", "love", "wedding", "ceremony", "bond"],
      vitality: ["recovery", "health", "healing", "rest", "birth", "survival", "robust", "strong", "vitality"],
      momentum: ["achievement", "breakthrough", "clarity", "purpose", "discovery", "triumph", "success", "victory"]
    };
    RESOURCE_DEPLETERS2 = {
      connection: ["betrayal", "loss", "death", "estrangement", "divorce", "abandonment", "rival", "blood", "war", "enemy", "hate"],
      vitality: ["plague", "illness", "injury", "trauma", "poison", "starvation", "fever", "exhaustion", "sick", "weak", "wound"],
      momentum: ["confusion", "failure", "doubt", "aimlessness", "lost", "aimless", "confused", "\xE8\xBF\xB7", "fail"]
    };
    document.getElementById("btn-new-life").addEventListener("click", startLife);
    document.getElementById("btn-new-life-overlay").addEventListener("click", startLife);
    document.getElementById("btn-end-life").addEventListener("click", () => dieNow2(false));
    document.getElementById("btn-close-death").addEventListener("click", () => {
      hideDeathOverlay();
    });
    document.getElementById("btn-achievements")?.addEventListener("click", () => {
      if (state.soul) {
        showAchievementModal(state.soul);
      }
    });
    document.getElementById("btn-view-soul").addEventListener("click", () => {
      hideDeathOverlay();
      setTimeout(() => {
        showLimbo({ fragments: state.soul.fragments, anchors: state.soul.anchors });
        setTimeout(() => showSoulBrowser(), 2500);
      }, 300);
    });
    document.querySelectorAll(".speed-btn").forEach((btn) => {
      btn.addEventListener("click", () => setSpeed2(btn.dataset.speed));
    });
    document.getElementById("whisper-act-btn").addEventListener("click", handleWhisperAct2);
    document.getElementById("whisper-ignore-btn").addEventListener("click", handleWhisperIgnore2);
    document.addEventListener("keydown", (e) => {
      if (state.currentWhisper) {
        if (e.key === "y" || e.key === "Y") {
          handleWhisperAct2();
        } else if (e.key === "n" || e.key === "N") {
          handleWhisperIgnore2();
        }
        return;
      }
      if (e.key === "p" || e.key === "P" || e.key === "Escape") {
        if (!state.crisisPending && !state.currentWhisper && state.isAlive) {
          state.isPaused = !state.isPaused;
          const overlay = document.getElementById("pause-overlay");
          const indicator = document.getElementById("pause-indicator");
          if (overlay) {
            if (state.isPaused) {
              overlay.classList.add("visible");
            } else {
              overlay.classList.remove("visible");
            }
          }
          if (indicator) {
            indicator.style.display = state.isPaused ? "inline" : "none";
          }
        }
        return;
      }
      if (e.key === "ArrowRight" && !state.crisisPending && !state.currentWhisper && state.isAlive && !state.isPaused) {
        const prose = document.getElementById("event-prose");
        if (prose && prose.dataset.typewriterMarker) {
          const marker = prose.dataset.typewriterMarker;
          const skipHandler = (ev) => {
            if (ev.target?.dataset?.typewriterMarker === marker) return;
            document.removeEventListener("keydown", skipHandler);
          };
          const allEls = document.querySelectorAll("[data-typewriter-marker]");
          for (const el of allEls) {
            if (el.dataset.typewriterMarker === marker && el.classList.contains("typewriter-text")) {
              el.classList.remove("typewriter-text");
              el.dispatchEvent(new KeyboardEvent("keydown", { key: " ", code: "Space", bubbles: true }));
              break;
            }
          }
        }
      }
    });
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    drawCurve(0);
    eraBadge.textContent = "---";
    fragBadge.textContent = "0 fragments";
    achBadge = document.getElementById("ach-badge");
    if (achBadge) {
      const totalAch = Object.keys(ACHIEVEMENT_DEFS).length;
      achBadge.textContent = `0/${totalAch}`;
    }
    hideWhisperPanel2();
    showTitleScreen();
    init2();
    document.addEventListener("click", (e) => {
      const action = e.target.dataset.action;
      if (!action) return;
      if (action === "new-game") {
        hideTitleScreen();
        startLife();
        setTimeout(() => {
          if (!hasSeenTutorial()) {
            state.tutorialStep = 0;
            showTutorialStep(0);
          }
          if (!state.seenResourceTip) {
            state.seenResourceTip = true;
            setTimeout(() => showContextualTip("resources"), 2500);
          }
        }, 1800);
      } else if (action === "continue" || action === "continue-game") {
        transitionFromDeathToLimbo();
      } else if (action === "reincarnate") {
        hideOverlay("overlay-limbo");
        hideOverlay("overlay-soul-browser");
        hideOverlay("overlay-limbo");
        startLife();
      } else if (action === "open-museum") {
        const soul = state.soul || { livesLived: 0, fragments: [], anchors: [], unlockedEras: ["ANCIENT", "MEDIEVAL"], metaStats: {} };
        const allLives = soul._lifeHistory || [];
        Promise.resolve().then(() => (init_ui(), ui_exports)).then(({ openMuseum: openMuseum2 }) => openMuseum2(soul, allLives));
      } else if (action === "how-to-play") {
        Promise.resolve().then(() => (init_ui(), ui_exports)).then(({ showHowToPlayCarousel: showHowToPlayCarousel2 }) => showHowToPlayCarousel2());
      }
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && state.isAlive && !state.crisisPending && !state.currentWhisper) {
        state.isPaused = true;
        const overlay = document.getElementById("pause-overlay");
        const indicator = document.getElementById("pause-indicator");
        if (overlay) overlay.classList.add("visible");
        if (indicator) indicator.style.display = "inline";
      }
    });
  }
});
init_main();
export {
  CHAIN_COLORS2 as CHAIN_COLORS,
  CRISIS_CHOICES2 as CRISIS_CHOICES,
  CRITICAL_INTENSITY2 as CRITICAL_INTENSITY,
  DEATH_EVENTS2 as DEATH_EVENTS,
  DEFAULT_CHOICE_TIMEOUT2 as DEFAULT_CHOICE_TIMEOUT,
  ERAS2 as ERAS,
  EVENT_POOLS2 as EVENT_POOLS,
  FRAGMENT_TYPE_ICONS2 as FRAGMENT_TYPE_ICONS,
  LIFE_PHASES2 as LIFE_PHASES,
  MORTALITY_CURVE2 as MORTALITY_CURVE,
  applyFragmentEffects,
  checkAndTriggerSoulCompletion,
  createSoulState2 as createSoulState,
  detectChain,
  extractFragments,
  generateLifeTheme,
  getSoulCompletionStatus,
  markSoulComplete,
  renderChainStrip,
  showChainRecapOnDeath,
  state,
  updateLifeSummaryBar,
  updateResourceDisplay2 as updateResourceDisplay
};
