# Soul Cycle — Module Structure

## Overview

Soul Cycle is built as a single-page ES module application. The `index.html` shell loads `js/main.js` as a module, which bootstraps everything. All CSS is inline in `index.html`; a supplemental `css/main.css` exists for legacy/gov-app compatibility.

## Module Map

```
index.html (shell + inline CSS)
    └── js/main.js          ← Bootstrap; imports all other modules
            ├── js/game.js   ← Core engine: state, eras, names, J-curve math, phase logic
            ├── js/ui.js    ← DOM, canvas, modals, toasts, overlays
            ├── js/events.js ← Event pools, crisis decisions, cascade triggers
            ├── js/world.js  ← Era data/lore, achievements, soul browser, limbo screen
            ├── js/audio.js  ← Web Audio API cues + original soundtrack playback
            └── js/save.js   ← localStorage serialization, slot management
```

The older `src/` files are retained as engine prototypes and design reference. The live GitHub Pages demo runs from `index.html` and `js/`.

## Module Responsibilities

### game.js
The central state store and engine. Exports `state` (the singleton game state object). Contains:
- Era definitions and year ranges
- J-curve mortality risk data
- Life phase thresholds (INFANT → ANCIENT)
- Name generators (era-specific first/last name pools)
- Body condition and social class distributions
- Speed control constants and timing utilities

**No DOM, no audio, no event content.**

### ui.js
All DOM manipulation and canvas rendering. Imports `state` from `game.js` and `generateSoulAboutPanel` from `world.js`. Responsible for:
- Canvas J-curve drawing and tooltip
- Life viewport updates (event title/prose/meta)
- Crisis overlay rendering and choice handling
- Whisper panel animation and dismissal
- Death card display
- Museum modal tabs and content panels
- Achievement toasts
- Title screen and tutorial
- All `getElementById` / `innerHTML` / `classList` mutations

### events.js
Event content and cascade logic. Imports from `game.js` (state, phases, curves), `main.js` (chain/fragment helpers), and `world.js` (achievements). Contains:
- EVENT_POOLS (structured event data grouped by era and phase)
- CRISIS_CHOICES and crisis timer logic
- DEATH_EVENTS by cause/risk level
- Event cascade scheduling and phase transitions

### world.js
Era lore, achievements, soul browser, and limbo/upgrade overlays. Contains:
- Achievement definitions (bronze/silver/gold/platinum tiers)
- `checkAndUnlockAchievements()` function
- `generateSoulAboutPanel()` — the soul fingerprint renderer
- Era stat unlock data

### audio.js
Web Audio API procedural sound plus original AI-generated soundtrack playback from `assets/music/`. Ambient drone per era, heartbeat during crisis, fragment chime on whisper.

### save.js
localStorage read/write. Slots for saved souls, autosave on life-end, load on startup.

### main.js
Bootstrap and cross-cutting UI logic. Imports all other modules as `*`. Contains:
- Chain/life-arc detection and labels
- Fragment extraction on death (`extractFragments`)
- Fragment effect application on new life (`applyFragmentEffects`)
- UI event handlers (crisis keys A/B/C, whisper keys Y/N, speed buttons)
- Title screen and NEW LIFE orchestration
- Integration between `events.js` event-firing and `ui.js` DOM updates

## Data Flow

```
index.html loads js/main.js as type="module"
    main.js imports all modules
    main.js calls game.init() → state = new GameState()
    main.js calls ui.init(state)
    main.js wires event listeners
    user clicks NEW LIFE → events.startLife() → ui.updateLifecycle()
    events fire on interval (based on speed) → ui.renderEvent()
    crisis fires → ui.showCrisisOverlay() → user picks A/B/C
    whisper fires → ui.showWhisperPanel() → user picks Y/N
    life ends → events.extractFragments() → game.state persists to save.js
    user clicks NEW LIFE → new cycle begins with persisted state
```

## Key State Shapes

### `state` (from game.js)
```js
{
  currentLife: { era, name, age, phase, events[], resources, chain },
  soul: { fragments[], anchors[], livesLived, totalYears },
  unlocks: { eras: [], achievements: [] },
  settings: { speed, sound }
}
```

## GitHub Pages Notes

- `.nojekyll` in root prevents Jekyll from processing files (required for `_` prefixed dirs and `js/` module loading)
- `_config.yml` sets theme; only needed if using Jekyll themes
- All JS/CSS is inline in `index.html` OR in separate `js/` and `css/` dirs; both work with GitHub Pages
- ES module loading requires files be served as `text/javascript` — GitHub Pages does this correctly by default
