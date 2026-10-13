// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SAVE.JS â ” Soul Cycle persistence layer
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const SAVE_KEYS = {
  SOUL:       'soulcycle_soul',
  SETTINGS:   'soulcycle_settings',
  INPROGRESS: 'soulcycle_inprogress',
  RECORDS:    'soulcycle_lifetime_records',
};

const ERA_ORDER = ['ANCIENT','MEDIEVAL','EARLY_MODERN','INDUSTRIAL','MODERN','NEAR_FUTURE','FAR_FUTURE'];

// â” â”  Low-level storage â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” 
function getItem(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function setItem(key, val) {
  try { localStorage.setItem(key, val); } catch { /* storage full or unavailable */ }
}
function removeItem(key) {
  try { localStorage.removeItem(key); } catch { /* unavailable */ }
}

// â” â”  Save / Load â ” Soul State â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” 
function saveSoulState(soul) {
  if (!soul) return;
  setItem(SAVE_KEYS.SOUL, JSON.stringify(soul));
}

function loadSoulState() {
  const raw = getItem(SAVE_KEYS.SOUL);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// â” â”  Save / Load â ” In-progress life â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” 
// Called on startLife() to enable auto-resume on next load.
// Called when life ends normally (death) to clear in-progress.
function saveInProgressLife(stateObj) {
  if (!stateObj) return;
  const snapshot = {
    soul:           stateObj.soul,
    currentLife:    stateObj.currentLife,
    lifeEvents:      stateObj.lifeEvents,
    currentAge:      stateObj.currentAge,
    phase:          stateObj.phase,
    isAlive:        stateObj.isAlive,
    cascadeTags:    stateObj.cascadeTags,
    lifeTheme:      stateObj.lifeTheme,
    activeChain:    stateObj.activeChain,
    whisperCooldown: stateObj.whisperCooldown,
    recentFragmentIds: stateObj.recentFragmentIds,
    connection:     stateObj.connection,
    vitality:       stateObj.vitality,
    momentum:       stateObj.momentum,
    eventMarkers:   stateObj.eventMarkers,
    speed:          stateObj.speed || 'normal',
    savedAt:        Date.now(),
  };
  setItem(SAVE_KEYS.INPROGRESS, JSON.stringify(snapshot));
}

function loadInProgressLife() {
  const raw = getItem(SAVE_KEYS.INPROGRESS);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function clearInProgressLife() {
  removeItem(SAVE_KEYS.INPROGRESS);
}

// â” â”  Save / Load â ” Settings â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” 
function saveSettings(settings) {
  setItem(SAVE_KEYS.SETTINGS, JSON.stringify(settings));
}

function loadSettings() {
  const raw = getItem(SAVE_KEYS.SETTINGS);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

// â” â”  Save on Death â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” 
function saveOnDeath(stateObj, deathEvent, newFragments) {
  if (!stateObj || !stateObj.soul) return;

  // Always persist the updated soul
  saveSoulState(stateObj.soul);

  // Merge death info into lifetime records
  const records = getLifetimeRecords(stateObj);
  setItem(SAVE_KEYS.RECORDS, JSON.stringify(records));

  // Clear in-progress life since this one is done
  clearInProgressLife();
}

// â” â”  Lifetime Records â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” 
// Aggregated across all lives â ” achievements, totals, eras
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
      erasUnlocked: ['ANCIENT','MEDIEVAL'],
      longestLife: 0,
      oldestAge: 0,
      mostViolentDeath: null,
      mostPeacefulDeath: null,
      fragmentTypeCounts: {},
      chainAppearances: {},
      recordUpdatedAt: Date.now(),
    };
  }

  const meta = soul.metaStats || {};
  const longestLifeEntry = findLongestLifeEntry(soul);

  const chainAppearances = {};
  for (const frag of (soul.fragments || [])) {
    for (const tag of (frag.cascadeTags || [])) {
      chainAppearances[tag] = (chainAppearances[tag] || 0) + 1;
    }
  }

  const fragmentTypeCounts = {};
  for (const frag of (soul.fragments || [])) {
    fragmentTypeCounts[frag.type] = (fragmentTypeCounts[frag.type] || 0) + 1;
  }

  return {
    totalDeaths:     meta.totalDeaths || 0,
    violentDeaths:   meta.violentDeaths || 0,
    peacefulDeaths:  meta.peacefulDeaths || 0,
    lovesLost:       meta.lovesLost || 0,
    childrenBorn:    meta.childrenBorn || 0,
    totalLives:      soul.livesLived || 0,
    totalFragments:  soul.fragments ? soul.fragments.length : 0,
    totalAnchors:    soul.anchors ? soul.anchors.length : 0,
    totalYears:      soul.totalYearsLived || 0,
    erasUnlocked:    soul.unlockedEras || ['ANCIENT','MEDIEVAL'],
    longestLife:    longestLifeEntry ? longestLifeEntry.age : 0,
    oldestAge:       longestLifeEntry ? longestLifeEntry.age : 0,
    mostViolentDeath: meta.mostViolentDeath || null,
    mostPeacefulDeath: meta.mostPeacefulDeath || null,
    fragmentTypeCounts,
    chainAppearances,
    recordUpdatedAt: Date.now(),
  };
}

function findLongestLifeEntry(soul) {
  // When we have a history of lives we can use that.
  // For now, use metaStats if populated with per-life data.
  if (soul._lifeHistory && soul._lifeHistory.length > 0) {
    return soul._lifeHistory.reduce((best, cur) =>
      (cur.age > best.age) ? cur : best, soul._lifeHistory[0]);
  }
  return null;
}

// â” â”  Export / Import â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” 
function exportSoulToBase64(soul) {
  if (!soul) return '';
  try {
    const json = JSON.stringify(soul);
    return btoa(unescape(encodeURIComponent(json)));
  } catch {
    return '';
  }
}

function importSoulFromBase64(b64) {
  if (!b64 || typeof b64 !== 'string') return null;
  try {
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// â” â”  Clear All Saves (WIPE SOUL) â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” 
function clearAllSaves() {
  removeItem(SAVE_KEYS.SOUL);
  removeItem(SAVE_KEYS.SETTINGS);
  removeItem(SAVE_KEYS.INPROGRESS);
  removeItem(SAVE_KEYS.RECORDS);
}

// â” â”  Check for In-Progress Life (auto-resume) â” â” â” â” â” â” â” â” â” â” â” â” â” â” 
// Returns the saved life state if there is an interrupted life,
// or null if no resume is available.
function checkForInProgressLife() {
  const saved = loadInProgressLife();
  if (!saved) return null;
  // Only offer resume if the life was actually in progress
  if (saved.isAlive === true && saved.currentLife && saved.currentAge > 0) {
    return saved;
  }
  // Clean up stale incomplete entry
  if (saved.isAlive === false || !saved.currentLife) {
    clearInProgressLife();
    return null;
  }
  return null;
}

// â” â”  Resume helpers â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” 
function resumeLife(stateObj, saved) {
  if (!stateObj || !saved) return false;

  stateObj.soul           = saved.soul;
  stateObj.currentLife    = saved.currentLife;
  stateObj.lifeEvents    = saved.lifeEvents || [];
  stateObj.currentAge    = saved.currentAge || 0;
  stateObj.phase         = saved.phase || 'INFANT';
  stateObj.isAlive       = saved.isAlive;
  stateObj.cascadeTags   = saved.cascadeTags || [];
  stateObj.lifeTheme     = saved.lifeTheme || null;
  stateObj.activeChain   = saved.activeChain || null;
  stateObj.whisperCooldown = saved.whisperCooldown || 0;
  stateObj.recentFragmentIds = saved.recentFragmentIds || [];
  stateObj.connection    = saved.connection || 1;
  stateObj.vitality      = saved.vitality || 1;
  stateObj.momentum     = saved.momentum || 1;
  stateObj.eventMarkers = saved.eventMarkers || [];
  stateObj.speed        = saved.speed || 'normal';
  stateObj.whisperTimer = null;
  stateObj.whisperTimeLeft = 8000;
  stateObj.currentWhisper = null;
  stateObj.deathEvent    = null;
  stateObj.isPaused      = false;
  stateObj.animProgress  = 0;
  stateObj.crisisPending = null;

  return true;
}

// â” â”  Exports â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” 
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SAVE_KEYS,
    getItem, setItem, removeItem,
    saveSoulState, loadSoulState,
    saveInProgressLife, loadInProgressLife, clearInProgressLife,
    saveSettings, loadSettings,
    saveOnDeath,
    getLifetimeRecords,
    exportSoulToBase64, importSoulFromBase64,
    clearAllSaves,
    checkForInProgressLife,
    resumeLife,
  };
}
