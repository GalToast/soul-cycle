/**
 * SOUL-CYCLE â ” Game Engine
 *
 * Core state, loop, era system, roll utilities, name generators,
 * risk appetite, speed control, and life phase management.
 * No DOM manipulation (ui.js), no audio logic (audio.js), no event data (events.js).
 */

// â” â” â”  Constants â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” 

const ERA_ORDER = [
  'ANCIENT', 'MEDIEVAL', 'EARLY_MODERN', 'INDUSTRIAL',
  'MODERN', 'NEAR_FUTURE', 'FAR_FUTURE',
];

const ERA_DATA = {
  ANCIENT: {
    id: 'ANCIENT', label: 'Ancient', yearRange: [-3000, 499],
    eventSignature: 'The gods are real here, and they are cruel.',
    locationPool: [{ region: 'Mesopotamia', city: 'Uruk', country: 'Sumer', weight: 12 },{ region: 'Nile Valley', city: 'Memphis', country: 'Egypt', weight: 14 },{ region: 'Aegean', city: 'Athens', country: 'Greece', weight: 13 },{ region: 'Italian Peninsula', city: 'Rome', country: 'Roman Republic/Empire', weight: 15 },{ region: 'Persian Plateau', city: 'Persepolis', country: 'Achaemenid Persia', weight: 9 }],
    firstNamePool: { male: [{ name: 'Gilgamesh', weight: 3 },{ name: 'Ramses', weight: 4 },{ name: 'Alexander', weight: 4 },{ name: 'Julius', weight: 4 },{ name: 'Marcus', weight: 3 },{ name: 'Constantine', weight: 3 },{ name: 'Ashoka', weight: 3 },{ name: 'Attila', weight: 3 }], female: [{ name: 'Nefertiti', weight: 4 },{ name: 'Cleopatra', weight: 4 },{ name: 'Hatshepsut', weight: 3 },{ name: 'Helen', weight: 3 },{ name: 'Sappho', weight: 3 },{ name: 'Zenobia', weight: 2 },{ name: 'Boudicca', weight: 3 }] },
    lastNamePool: [{ name: 'of Rome', weight: 5 },{ name: 'of Athens', weight: 4 },{ name: 'of Babylon', weight: 3 },{ name: 'the Great', weight: 2 },{ name: '', weight: 10 }],
    bodyConditions: [{ condition: 'robust', weight: 15 },{ condition: 'healthy', weight: 55 },{ condition: 'sickly', weight: 20 },{ condition: 'disabled', weight: 10 }],
    socialClasses: [{ cls: 'slave', weight: 25 },{ cls: 'peasant', weight: 35 },{ cls: 'artisan', weight: 12 },{ cls: 'merchant', weight: 10 },{ cls: 'soldier', weight: 8 },{ cls: 'noble', weight: 4 },{ cls: 'ruler', weight: 1 }],
  },
  MEDIEVAL: {
    id: 'MEDIEVAL', label: 'Medieval', yearRange: [500, 1499],
    eventSignature: 'The plague is always somewhere. Faith is the only shield.',
    locationPool: [{ region: 'British Isles', city: 'London', country: 'England', weight: 12 },{ region: 'Frankish Lands', city: 'Paris', country: 'France', weight: 13 },{ region: 'Italian Peninsula', city: 'Venice', country: 'Venetian Republic', weight: 11 },{ region: 'Byzantine', city: 'Constantinople', country: 'Byzantine Empire', weight: 12 },{ region: 'Middle East', city: 'Baghdad', country: 'Abbasid Caliphate', weight: 10 },{ region: 'East Asia', city: "Chang'an", country: 'Tang China', weight: 10 }],
    firstNamePool: { male: [{ name: 'William', weight: 5 },{ name: 'Henry', weight: 5 },{ name: 'John', weight: 5 },{ name: 'Robert', weight: 5 },{ name: 'Louis', weight: 4 },{ name: 'Charles', weight: 4 },{ name: 'Saladin', weight: 3 },{ name: 'Ali', weight: 3 }], female: [{ name: 'Eleanor', weight: 4 },{ name: 'Isabella', weight: 4 },{ name: 'Margaret', weight: 4 },{ name: 'Mary', weight: 5 },{ name: 'Fatima', weight: 3 },{ name: 'Mariam', weight: 3 }] },
    lastNamePool: [{ name: 'of York', weight: 3 },{ name: 'of Normandy', weight: 3 },{ name: 'Smith', weight: 4 },{ name: 'Taylor', weight: 3 },{ name: '', weight: 10 }],
    bodyConditions: [{ condition: 'robust', weight: 12 },{ condition: 'healthy', weight: 50 },{ condition: 'sickly', weight: 25 },{ condition: 'disabled', weight: 13 }],
    socialClasses: [{ cls: 'serf', weight: 35 },{ cls: 'peasant', weight: 20 },{ cls: 'artisan', weight: 12 },{ cls: 'merchant', weight: 10 },{ cls: 'knight', weight: 7 },{ cls: 'clergy', weight: 8 },{ cls: 'noble', weight: 3 }],
  },
  EARLY_MODERN: {
    id: 'EARLY_MODERN', label: 'Early Modern', yearRange: [1500, 1849],
    eventSignature: 'The world is being mapped. Old gods die, new machines are born.',
    locationPool: [{ region: 'British Isles', city: 'London', country: 'England/Britain', weight: 14 },{ region: 'Frankish Lands', city: 'Paris', country: 'France', weight: 13 },{ region: 'Ottoman', city: 'Istanbul', country: 'Ottoman Empire', weight: 12 },{ region: 'Low Countries', city: 'Amsterdam', country: 'Dutch Republic', weight: 10 },{ region: 'East Asia', city: 'Beijing', country: 'Ming/Qing China', weight: 10 },{ region: 'East Asia', city: 'Edo', country: 'Tokugawa Japan', weight: 9 }],
    firstNamePool: { male: [{ name: 'William', weight: 5 },{ name: 'John', weight: 5 },{ name: 'George', weight: 4 },{ name: 'Charles', weight: 4 },{ name: 'Louis', weight: 3 },{ name: 'Napoleon', weight: 3 },{ name: 'Peter', weight: 3 }], female: [{ name: 'Elizabeth', weight: 5 },{ name: 'Mary', weight: 4 },{ name: 'Catherine', weight: 4 },{ name: 'Maria', weight: 4 },{ name: 'Marie', weight: 4 },{ name: 'Charlotte', weight: 3 }] },
    lastNamePool: [{ name: 'Smith', weight: 4 },{ name: 'Johnson', weight: 3 },{ name: 'MÃ¼ller', weight: 3 },{ name: 'Schmidt', weight: 3 },{ name: 'Rossi', weight: 2 },{ name: '', weight: 5 }],
    bodyConditions: [{ condition: 'robust', weight: 14 },{ condition: 'healthy', weight: 53 },{ condition: 'sickly', weight: 22 },{ condition: 'disabled', weight: 11 }],
    socialClasses: [{ cls: 'peasant', weight: 25 },{ cls: 'laborer', weight: 18 },{ cls: 'artisan', weight: 14 },{ cls: 'merchant', weight: 13 },{ cls: 'soldier', weight: 8 },{ cls: 'aristocrat', weight: 5 }],
  },
  INDUSTRIAL: {
    id: 'INDUSTRIAL', label: 'Industrial', yearRange: [1850, 1949],
    eventSignature: 'Smoke fills the sky. The machines are hungry and so is war.',
    locationPool: [{ region: 'British Isles', city: 'Manchester', country: 'England', weight: 14 },{ region: 'American Northeast', city: 'New York', country: 'United States', weight: 13 },{ region: 'German Lands', city: 'Berlin', country: 'German Empire', weight: 12 },{ region: 'French Republic', city: 'Paris', country: 'France', weight: 11 },{ region: 'Russian Empire', city: 'Moscow', country: 'Russian Empire', weight: 10 },{ region: 'Japan', city: 'Tokyo', country: 'Meiji Japan', weight: 8 }],
    firstNamePool: { male: [{ name: 'John', weight: 6 },{ name: 'William', weight: 5 },{ name: 'Charles', weight: 4 },{ name: 'George', weight: 4 },{ name: 'James', weight: 4 },{ name: 'Karl', weight: 3 },{ name: 'Friedrich', weight: 3 }], female: [{ name: 'Mary', weight: 5 },{ name: 'Elizabeth', weight: 4 },{ name: 'Anna', weight: 4 },{ name: 'Margaret', weight: 4 },{ name: 'Emma', weight: 4 },{ name: 'Marie', weight: 3 }] },
    lastNamePool: [{ name: 'Smith', weight: 5 },{ name: 'MÃ¼ller', weight: 4 },{ name: 'Dubois', weight: 3 },{ name: 'Ivanov', weight: 3 },{ name: 'Tanaka', weight: 3 },{ name: '', weight: 5 }],
    bodyConditions: [{ condition: 'robust', weight: 18 },{ condition: 'healthy', weight: 55 },{ condition: 'sickly', weight: 20 },{ condition: 'disabled', weight: 7 }],
    socialClasses: [{ cls: 'factory worker', weight: 25 },{ cls: 'laborer', weight: 18 },{ cls: 'clerk', weight: 14 },{ cls: 'artisan', weight: 12 },{ cls: 'merchant', weight: 10 },{ cls: 'industrialist', weight: 3 },{ cls: 'aristocrat', weight: 3 }],
  },
  MODERN: {
    id: 'MODERN', label: 'Modern', yearRange: [1950, 2019],
    eventSignature: 'You live longer. You die alone. The screens watch you back.',
    locationPool: [{ region: 'American Northeast', city: 'New York', country: 'United States', weight: 12 },{ region: 'Western Europe', city: 'London', country: 'United Kingdom', weight: 11 },{ region: 'East Asia', city: 'Tokyo', country: 'Japan', weight: 10 },{ region: 'South Asia', city: 'Mumbai', country: 'India', weight: 9 },{ region: 'Latin America', city: 'Mexico City', country: 'Mexico', weight: 9 },{ region: 'Middle East', city: 'Istanbul', country: 'Turkey', weight: 8 }],
    firstNamePool: { male: [{ name: 'James', weight: 5 },{ name: 'John', weight: 5 },{ name: 'Robert', weight: 4 },{ name: 'Michael', weight: 5 },{ name: 'David', weight: 4 },{ name: 'William', weight: 4 },{ name: 'Raj', weight: 3 },{ name: 'Wei', weight: 3 }], female: [{ name: 'Mary', weight: 4 },{ name: 'Jennifer', weight: 4 },{ name: 'Linda', weight: 4 },{ name: 'Patricia', weight: 3 },{ name: 'Elizabeth', weight: 4 },{ name: 'Priya', weight: 3 },{ name: 'Mei', weight: 3 }] },
    lastNamePool: [{ name: 'Smith', weight: 4 },{ name: 'Johnson', weight: 3 },{ name: 'Williams', weight: 3 },{ name: 'Brown', weight: 3 },{ name: 'Singh', weight: 3 },{ name: 'Wang', weight: 3 },{ name: '', weight: 6 }],
    bodyConditions: [{ condition: 'robust', weight: 15 },{ condition: 'healthy', weight: 55 },{ condition: 'sickly', weight: 22 },{ condition: 'disabled', weight: 8 }],
    socialClasses: [{ cls: 'working class', weight: 22 },{ cls: 'clerk', weight: 20 },{ cls: 'professional', weight: 18 },{ cls: 'service worker', weight: 15 },{ cls: 'executive', weight: 8 },{ cls: 'wealthy', weight: 5 }],
  },
  NEAR_FUTURE: {
    id: 'NEAR_FUTURE', label: 'Near Future', yearRange: [2020, 2069],
    eventSignature: 'The climate is shifting. The algorithms decide. You adapt or break.',
    locationPool: [{ region: 'American Southwest', city: 'Phoenix', country: 'United States', weight: 10 },{ region: 'East Asia', city: 'Seoul', country: 'South Korea', weight: 10 },{ region: 'South Asia', city: 'Bangalore', country: 'India', weight: 10 },{ region: 'Western Europe', city: 'Amsterdam', country: 'Netherlands', weight: 9 },{ region: 'East Africa', city: 'Nairobi', country: 'Kenya', weight: 8 },{ region: 'East Asia', city: 'Shanghai', country: 'China', weight: 10 }],
    firstNamePool: { male: [{ name: 'Kai', weight: 4 },{ name: 'Marcus', weight: 3 },{ name: 'Raj', weight: 4 },{ name: 'Dmitri', weight: 3 },{ name: 'Sven', weight: 3 },{ name: 'Yusuf', weight: 3 }], female: [{ name: 'Aisha', weight: 4 },{ name: 'Lin', weight: 4 },{ name: 'Zara', weight: 3 },{ name: 'Emma', weight: 3 },{ name: 'Yuki', weight: 3 },{ name: 'Fatima', weight: 3 }] },
    lastNamePool: [{ name: '', weight: 5 },{ name: 'Chen', weight: 4 },{ name: 'Okonkwo', weight: 3 },{ name: 'MÃ¼ller', weight: 3 },{ name: 'Singh', weight: 3 },{ name: 'Yamamoto', weight: 3 }],
    bodyConditions: [{ condition: 'robust', weight: 12 },{ condition: 'healthy', weight: 50 },{ condition: 'sickly', weight: 28 },{ condition: 'disabled', weight: 10 }],
    socialClasses: [{ cls: 'gig worker', weight: 20 },{ cls: 'service worker', weight: 18 },{ cls: 'clerk', weight: 15 },{ cls: 'technician', weight: 14 },{ cls: 'engineer', weight: 10 },{ cls: 'executive', weight: 5 }],
  },
  FAR_FUTURE: {
    id: 'FAR_FUTURE', label: 'Far Future', yearRange: [2070, 2200],
    eventSignature: 'Death is optional now. But meaning is not.',
    locationPool: [{ region: 'Orbital', city: 'Haven-1', country: 'Luna Colony', weight: 12 },{ region: 'North America', city: 'Atlantis City', country: 'Atlantic Federation', weight: 11 },{ region: 'East Asia', city: 'Neo Tokyo', country: 'Eastern Coalition', weight: 10 },{ region: 'Mars', city: 'Olympus', country: 'Mars Republic', weight: 10 },{ region: 'Europe', city: 'New Paris', country: 'Atlantic Federation', weight: 9 },{ region: 'Space', city: 'Station Kronos', country: 'Deep Space Authority', weight: 7 }],
    firstNamePool: { male: [{ name: 'Kai', weight: 5 },{ name: 'Zephyr', weight: 4 },{ name: 'Nova', weight: 4 },{ name: 'Orion', weight: 4 },{ name: 'Atlas', weight: 3 },{ name: 'Luna', weight: 3 }], female: [{ name: 'Aria', weight: 5 },{ name: 'Stella', weight: 4 },{ name: 'Nova', weight: 4 },{ name: 'Luna', weight: 4 },{ name: 'Athena', weight: 3 },{ name: 'Vega', weight: 3 }] },
    lastNamePool: [{ name: '', weight: 6 },{ name: 'of the Void', weight: 3 },{ name: 'of the Belt', weight: 3 },{ name: 'Chen', weight: 4 },{ name: 'Okonkwo', weight: 3 },{ name: 'MÃ¼ller', weight: 3 }],
    bodyConditions: [{ condition: 'enhanced', weight: 20 },{ condition: 'robust', weight: 25 },{ condition: 'healthy', weight: 45 },{ condition: 'sickly', weight: 10 }],
    socialClasses: [{ cls: 'colonist', weight: 18 },{ cls: 'crew', weight: 15 },{ cls: 'engineer', weight: 14 },{ cls: 'scientist', weight: 12 },{ cls: 'administrator', weight: 8 },{ cls: 'director', weight: 5 }],
  },
};

const LIFE_PHASES = {
  INFANT:      { min: 0,  max: 3  },
  CHILD:       { min: 4,  max: 12 },
  ADOLESCENT:  { min: 13, max: 19 },
  YOUNG_ADULT: { min: 20, max: 39 },
  MIDDLE_AGE:  { min: 40, max: 64 },
  SENIOR:      { min: 65, max: 84 },
  ANCIENT:     { min: 85, max: Infinity },
};

const PHASE_COLORS = {
  INFANT: '#a8d5ff', CHILD: '#7ec8a4', ADOLESCENT: '#f4a261',
  YOUNG_ADULT: '#e76f51', MIDDLE_AGE: '#c77dff', SENIOR: '#8ecae6', ANCIENT: '#ffd166',
};

const RISK_LEVELS = {
  MINIMAL:  { label: 'Minimal',  multiplier: 0.2  },
  LOW:      { label: 'Low',      multiplier: 0.5  },
  MODERATE: { label: 'Moderate', multiplier: 1.0  },
  HIGH:     { label: 'High',     multiplier: 1.8  },
  EXTREME:  { label: 'Extreme',  multiplier: 3.0  },
};

const MORTALITY_CURVE = [
  { minAge: 0,   maxAge: 0,   rate: 5.6 },
  { minAge: 1,   maxAge: 4,   rate: 0.25 },
  { minAge: 5,   maxAge: 14,  rate: 0.11 },
  { minAge: 15,  maxAge: 24,  rate: 0.40 },
  { minAge: 25,  maxAge: 34,  rate: 0.50 },
  { minAge: 35,  maxAge: 44,  rate: 1.0 },
  { minAge: 45,  maxAge: 54,  rate: 2.0 },
  { minAge: 55,  maxAge: 64,  rate: 4.0 },
  { minAge: 65,  maxAge: 74,  rate: 9.0 },
  { minAge: 75,  maxAge: 84,  rate: 20.0 },
  { minAge: 85,  maxAge: 94,  rate: 45.0 },
  { minAge: 95,  maxAge: Infinity, rate: 80.0 },
];

const CHAIN_COLORS = {
  GRIEF: '#ff4466', LOVE: '#ff66aa', DREAD: '#9944ff',
  WONDER: '#44aaff', RAGE: '#ff6600', GRACE: '#aaaaaa',
};

const FRAGMENT_TYPE_ICONS = {
  tone: 'â™ª', fear: 'âš ', love: 'â™¥', location: 'â—Ž', name: 'â—ˆ', object: 'â—†',
};

const CRITICAL_INTENSITY = 0.7;
const DEFAULT_CHOICE_TIMEOUT = 4000;
const SPEED_MAP = { slow: 1000, normal: 400, fast: 100 };

const ERAS = ERA_DATA;

const EVENT_POOLS = {
  PREHISTORIC: [
    { id: 'ph_01', triggerProbability: 0.12, phases: ['CHILD','ADOLESCENT','YOUNG_ADULT'], eras: ['PREHISTORIC'], category: 'violence', weight: 3, title: 'The predator at the tree line', description: 'Something watches from beyond the firelight. You keep the embers fed and don\'t sleep.', cascadeTags: ['dread','anchor'] },
    { id: 'ph_03', triggerProbability: 0.08, phases: ['INFANT','CHILD'], eras: ['PREHISTORIC'], category: 'body', weight: 4, title: 'Fever takes the little ones', description: 'The heat comes and doesn\'t leave. Someone presses wet bark to your forehead and sings.', cascadeTags: ['grief','numbness'] },
    { id: 'ph_04', triggerProbability: 0.06, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['PREHISTORIC'], category: 'mystery', weight: 2, title: 'The cave paintings', description: 'Deep in the rock someone has drawn animals that don\'t exist anymore. You touch the ochre and feel something shift.', cascadeTags: ['wonder','awe'] },
    { id: 'ph_05', triggerProbability: 0.07, phases: ['YOUNG_ADULT','MIDDLE_AGE','SENIOR'], eras: ['PREHISTORIC'], category: 'relationship', weight: 3, title: 'A bond forged in the hunt', description: 'You and another move together without speaking. After, you share the meat and don\'t look away.', cascadeTags: ['connection','tenderness'] },
    { id: 'ph_07', triggerProbability: 0.09, phases: ['MIDDLE_AGE','SENIOR','ANCIENT'], eras: ['PREHISTORIC'], category: 'circumstance', weight: 3, title: 'The elders\' fire', description: 'You sit with the ones who remember the last cold season. They speak in fragments. You try to hold it all.', cascadeTags: ['anchor','resignation'] },
    { id: 'ph_15', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['PREHISTORIC'], category: 'relationship', weight: 3, title: 'The chosen one', description: 'They look at you across the fire and you know. Not words â ” something older. You move closer.', cascadeTags: ['connection','awakening'] },
  ],
  ANCIENT: [
    { id: 'an_01', triggerProbability: 0.12, phases: ['CHILD','ADOLESCENT'], eras: ['ANCIENT'], category: 'body', weight: 4, title: 'The childhood illness', description: 'It moves through the house like a tide. You are small and the tide doesn\'t stop.', cascadeTags: ['grief','numbness'] },
    { id: 'an_02', triggerProbability: 0.10, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['ANCIENT'], category: 'violence', weight: 4, title: 'The battlefield call', description: 'They line up across the field. You are holding a spear and the sky is the same color as the blood.', cascadeTags: ['rage','vertigo'] },
    { id: 'an_03', triggerProbability: 0.08, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['ANCIENT'], category: 'relationship', weight: 4, title: 'First love in the olive grove', description: 'The olives fall. Someone\'s hand finds yours. You learn that joy has a specific weight.', cascadeTags: ['love','awakening'] },
    { id: 'an_04', triggerProbability: 0.09, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['ANCIENT'], category: 'faith', weight: 3, title: 'The temple at dusk', description: 'The priests speak of gods who demand sacrifice. You wonder which god would sacrifice you.', cascadeTags: ['dread','wonder'] },
    { id: 'an_05', triggerProbability: 0.07, phases: ['CHILD','ADOLESCENT'], eras: ['ANCIENT'], category: 'relationship', weight: 3, title: 'The older sibling', description: 'They carry you on their back when you cannot walk. They show you which berries will kill you. They leave.', cascadeTags: ['grief','anchor'] },
    { id: 'an_06', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['ANCIENT'], category: 'circumstance', weight: 3, title: 'The drought', description: 'The river drops. The animals leave. Someone proposes a thing that will define you.', cascadeTags: ['desperation','choice'] },
    { id: 'an_07', triggerProbability: 0.06, phases: ['MIDDLE_AGE','SENIOR'], eras: ['ANCIENT'], category: 'body', weight: 2, title: 'The body remembers', description: 'You feel it in the joints first. The body knows things the mind tries to forget.', cascadeTags: ['resignation','grace'] },
  ],
  MEDIEVAL: [
    { id: 'med_01', triggerProbability: 0.12, phases: ['CHILD','ADOLESCENT'], eras: ['MEDIEVAL'], category: 'body', weight: 4, title: 'The Black Death comes', description: 'They ring the church bells for the ones who die in the night. You stop counting.', cascadeTags: ['grief','numbness'] },
    { id: 'med_02', triggerProbability: 0.10, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['MEDIEVAL'], category: 'faith', weight: 4, title: 'The monastery door closes', description: 'You take vows. The silence settles into your bones like winter.', cascadeTags: ['resignation','grace'] },
    { id: 'med_03', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MEDIEVAL'], category: 'relationship', weight: 3, title: 'The tournament', description: 'You ride in armor painted with your family\'s colors. Someone watches from the stands.', cascadeTags: ['pride','connection'] },
    { id: 'med_04', triggerProbability: 0.09, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['MEDIEVAL'], category: 'violence', weight: 4, title: 'The siege', description: 'The walls have held for months. The grain is gone. The engineers are adjusting their calculations.', cascadeTags: ['dread','desperation'] },
    { id: 'med_05', triggerProbability: 0.07, phases: ['CHILD','ADOLESCENT'], eras: ['MEDIEVAL'], category: 'circumstance', weight: 3, title: 'The village burns', description: 'You run. You don\'t look back. Later you will not remember the faces.', cascadeTags: ['grief','anchor'] },
    { id: 'med_06', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MEDIEVAL'], category: 'relationship', weight: 3, title: 'The guild apprentice', description: 'You learn the craft from someone whose hands know more than words. They become the measure of all things.', cascadeTags: ['connection','identity'] },
  ],
  EARLY_MODERN: [
    { id: 'em_01', triggerProbability: 0.10, phases: ['CHILD','ADOLESCENT'], eras: ['EARLY_MODERN'], category: 'circumstance', weight: 3, title: 'The printing press', description: 'You learn to set type. Each letter is a small revolution.', cascadeTags: ['wonder','discovery'] },
    { id: 'em_02', triggerProbability: 0.09, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['EARLY_MODERN'], category: 'faith', weight: 4, title: 'The reformation', description: 'The old certainties crack. You must choose which wall to stand behind.', cascadeTags: ['dread','choice'] },
    { id: 'em_03', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['EARLY_MODERN'], category: 'relationship', weight: 3, title: 'The salon', description: 'Someone has gathered people who think. You are one of them. This feels like the future.', cascadeTags: ['connection','wonder'] },
    { id: 'em_04', triggerProbability: 0.10, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['EARLY_MODERN'], category: 'violence', weight: 4, title: 'The witch trial', description: 'They point. You see the accusation is about power, not truth. You stay silent or speak.', cascadeTags: ['dread','rage'] },
    { id: 'em_05', triggerProbability: 0.07, phases: ['CHILD'], eras: ['EARLY_MODERN'], category: 'body', weight: 3, title: 'The smallpox scar', description: 'You survive the fever. The marks become part of you. You learn to look at faces differently.', cascadeTags: ['resignation','identity'] },
  ],
  INDUSTRIAL: [
    { id: 'ind_01', triggerProbability: 0.12, phases: ['CHILD','ADOLESCENT'], eras: ['INDUSTRIAL'], category: 'circumstance', weight: 4, title: 'The factory floor', description: 'Your hands learn the rhythm of the machine. The noise becomes a language.', cascadeTags: ['desperation','identity'] },
    { id: 'ind_02', triggerProbability: 0.09, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['INDUSTRIAL'], category: 'relationship', weight: 3, title: 'The labor organizer', description: 'You stand in a hall with others who have nothing but each other. Someone is always watching.', cascadeTags: ['rage','connection'] },
    { id: 'ind_03', triggerProbability: 0.10, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['INDUSTRIAL'], category: 'faith', weight: 4, title: 'The socialist meeting', description: 'Someone speaks about a world without classes. You feel something you cannot name.', cascadeTags: ['wonder','awakening'] },
    { id: 'ind_04', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['INDUSTRIAL'], category: 'body', weight: 3, title: 'The mine collapse', description: 'The dark is absolute. You press your hand against the earth and bargain with anything that will listen.', cascadeTags: ['dread','desperation'] },
    { id: 'ind_05', triggerProbability: 0.07, phases: ['SENIOR','ANCIENT'], eras: ['INDUSTRIAL'], category: 'circumstance', weight: 2, title: 'The old machine', description: 'You watch the new generation work the machine you built. Something in you aches.', cascadeTags: ['resignation','grace'] },
  ],
  MODERN: [
    { id: 'mod_01', triggerProbability: 0.10, phases: ['CHILD','ADOLESCENT'], eras: ['MODERN'], category: 'relationship', weight: 4, title: 'The television family', description: 'You grow up inside a box that tells you who to be. You find the edges of the box.', cascadeTags: ['identity','wonder'] },
    { id: 'mod_02', triggerProbability: 0.09, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['MODERN'], category: 'faith', weight: 3, title: 'The cult or the cause', description: 'They ask for everything. You give it. Something breaks or something opens.', cascadeTags: ['dread','choice'] },
    { id: 'mod_03', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'relationship', weight: 3, title: 'The divorce papers', description: 'You sign. The house becomes a ghost story you both agree not to tell.', cascadeTags: ['grief','resignation'] },
    { id: 'mod_04', triggerProbability: 0.10, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['MODERN'], category: 'circumstance', weight: 4, title: 'The hospital corridor', description: 'Someone lies behind a door that keeps you out. You wait. You learn what time actually is.', cascadeTags: ['grief','grace'] },
    { id: 'mod_05', triggerProbability: 0.07, phases: ['CHILD','ADOLESCENT'], eras: ['MODERN'], category: 'body', weight: 3, title: 'The cancer diagnosis', description: 'You learn your body is a sentence with a period at the end. The period moves closer.', cascadeTags: ['dread','acceptance'] },
    { id: 'mod_06', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'relationship', weight: 3, title: 'The friend who overdoses', description: 'They leave a shape on the floor that used to be a person you knew. You go to the funeral.', cascadeTags: ['grief','numbness'] },
  ],
  NEAR_FUTURE: [
    { id: 'nf_01', triggerProbability: 0.10, phases: ['CHILD','ADOLESCENT'], eras: ['NEAR_FUTURE'], category: 'circumstance', weight: 4, title: 'The climate refugee camp', description: 'The water is wrong and the sky is the wrong color. You wait for something to change.', cascadeTags: ['dread','desperation'] },
    { id: 'nf_02', triggerProbability: 0.09, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['NEAR_FUTURE'], category: 'technology', weight: 4, title: 'The neural interface', description: 'You go online without a screen. The information is beautiful and you cannot stop.', cascadeTags: ['wonder','addiction'] },
    { id: 'nf_03', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['NEAR_FUTURE'], category: 'relationship', weight: 3, title: 'The algorithm match', description: 'Someone is selected for you. The algorithm is 73% confident. The first date is awkward.', cascadeTags: ['connection','disorientation'] },
    { id: 'nf_04', triggerProbability: 0.10, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['NEAR_FUTURE'], category: 'body', weight: 4, title: 'The gene therapy', description: 'You opt in. The cells in your body learn a new language. You feel the change before you understand it.', cascadeTags: ['wonder','identity'] },
  ],
  FAR_FUTURE: [
    { id: 'ff_01', triggerProbability: 0.09, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['FAR_FUTURE'], category: 'technology', weight: 4, title: 'The memory transfer', description: 'You wake up in a new body with someone else\'s memories. You learn to tell the difference.', cascadeTags: ['identity','wonder'] },
    { id: 'ff_02', triggerProbability: 0.08, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['FAR_FUTURE'], category: 'relationship', weight: 3, title: 'The clone sibling', description: 'Someone on the station has your exact genome. You meet them. They are not you.', cascadeTags: ['connection','identity'] },
    { id: 'ff_03', triggerProbability: 0.10, phases: ['MIDDLE_AGE','SENIOR'], eras: ['FAR_FUTURE'], category: 'circumstance', weight: 4, title: 'The cryo-revival', description: 'You wake from the ice. Everything you knew is in a museum. You must begin again.', cascadeTags: ['disorientation','grace'] },
    { id: 'ff_04', triggerProbability: 0.07, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['FAR_FUTURE'], category: 'faith', weight: 3, title: 'The void prayer', description: 'You step into the airlock and look at the stars. You are very small. You are still here.', cascadeTags: ['wonder','resignation'] },
  ],
};

const DEATH_EVENTS = [
  { id: 'death_ph_01', phases: ['INFANT','CHILD'], eras: ['PREHISTORIC'], category: 'body', title: 'The fever takes you', description: 'The heat builds and doesn\'t break. Someone presses cool stones to your chest. The stones warm up. You don\'t.', cascadeTags: ['grief','numbness'] },
  { id: 'death_ph_02', phases: ['CHILD','ADOLESCENT','YOUNG_ADULT','MIDDLE_AGE'], eras: ['PREHISTORIC'], category: 'violence', title: 'The predator wins', description: 'You were fast but it was faster. The last thing you see is the sky through the canopy.', cascadeTags: ['dread','vertigo'] },
  { id: 'death_ph_03', phases: ['SENIOR','ANCIENT'], eras: ['PREHISTORIC'], category: 'body', title: 'The body gives out', description: 'You sit down by the fire and don\'t get up. The band moves on. The fire goes out.', cascadeTags: ['resignation','grace'] },
  { id: 'death_an_01', phases: ['INFANT','CHILD'], eras: ['ANCIENT'], category: 'body', title: 'The childhood illness', description: 'It moves through the house like a tide. You are small and the tide doesn\'t stop.', cascadeTags: ['grief','numbness'] },
  { id: 'death_an_02', phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['ANCIENT'], category: 'violence', title: 'The battlefield', description: 'The line breaks and you\'re in the crush. You don\'t see who strikes you. The dust settles on your face.', cascadeTags: ['rage','vertigo'] },
  { id: 'death_an_03', phases: ['SENIOR','ANCIENT'], eras: ['ANCIENT'], category: 'body', title: 'The long fade', description: 'You feel the thread thin. You have enough time to let go of each thing. One by one.', cascadeTags: ['resignation','grace'] },
  { id: 'death_med_01', phases: ['INFANT','CHILD'], eras: ['MEDIEVAL'], category: 'body', title: 'The plague takes you', description: 'The swellings appear. The prayers fail. You become one more name in a long list.', cascadeTags: ['grief','numbness'] },
  { id: 'death_med_02', phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MEDIEVAL'], category: 'violence', title: 'The war claims you', description: 'The army moves through you. You become part of the number that will be counted later.', cascadeTags: ['rage','vertigo'] },
  { id: 'death_med_03', phases: ['SENIOR','ANCIENT'], eras: ['MEDIEVAL'], category: 'body', title: 'The monastery death', description: 'You have outlived most things. The only sound left is the wind through the stone.', cascadeTags: ['resignation','grace'] },
  { id: 'death_em_01', phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['EARLY_MODERN'], category: 'body', title: 'The wasting illness', description: 'You fade like a letter in rain. The doctor comes weekly. Then not at all.', cascadeTags: ['grief','resignation'] },
  { id: 'death_em_02', phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['EARLY_MODERN'], category: 'violence', title: 'The duel', description: 'You stand in a field before dawn. Your second is afraid. You are calm.', cascadeTags: ['rage','vertigo'] },
  { id: 'death_em_03', phases: ['SENIOR','ANCIENT'], eras: ['EARLY_MODERN'], category: 'faith', title: 'The priest\'s peace', description: 'You ask for absolution. The priest grants it. You feel the weight lift.', cascadeTags: ['resignation','grace'] },
  { id: 'death_ind_01', phases: ['CHILD','ADOLESCENT'], eras: ['INDUSTRIAL'], category: 'body', title: 'The factory accident', description: 'The machine does not stop. You are part of the machine now.', cascadeTags: ['grief','numbness'] },
  { id: 'death_ind_02', phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['INDUSTRIAL'], category: 'violence', title: 'The war ends you', description: 'You survive the trenches only to fall in the last hour of the last day.', cascadeTags: ['rage','vertigo'] },
  { id: 'death_ind_03', phases: ['SENIOR','ANCIENT'], eras: ['INDUSTRIAL'], category: 'circumstance', title: 'The pension\'s end', description: 'You outlive the system that was meant to carry you. You adapt or you fall.', cascadeTags: ['resignation','grace'] },
  { id: 'death_mod_01', phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'body', title: 'The diagnosis', description: 'They give you a number of years. You spend them learning what matters.', cascadeTags: ['resignation','grace'] },
  { id: 'death_mod_02', phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['MODERN'], category: 'violence', title: 'The accident', description: 'The world is moving too fast and then it stops and you are outside it.', cascadeTags: ['dread','vertigo'] },
  { id: 'death_mod_03', phases: ['SENIOR','ANCIENT'], eras: ['MODERN'], category: 'relationship', title: 'The last visit', description: 'You are alone in a room that smells like nothing. Someone calls. You are loved.', cascadeTags: ['resignation','grace'] },
  { id: 'death_nf_01', phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['NEAR_FUTURE'], category: 'technology', title: 'The system failure', description: 'The AI makes a call about your body. It does not ask permission.', cascadeTags: ['dread','numbness'] },
  { id: 'death_nf_02', phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['NEAR_FUTURE'], category: 'body', title: 'The climate event', description: 'The storm is bigger than the models predicted. You are in the part that was not modeled.', cascadeTags: ['dread','vertigo'] },
  { id: 'death_ff_01', phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['FAR_FUTURE'], category: 'body', title: 'The consciousness transfer fails', description: 'The upload never completes. You are aware of the gap where you should continue.', cascadeTags: ['dread','numbness'] },
  { id: 'death_ff_02', phases: ['SENIOR','ANCIENT'], eras: ['FAR_FUTURE'], category: 'circumstance', title: 'The transit accident', description: 'The pod misses its target. You become a number in a very long list of lost things.', cascadeTags: ['dread','vertigo'] },
  { id: 'death_ff_03', phases: ['YOUNG_ADULT','MIDDLE_AGE','SENIOR','ANCIENT'], eras: ['FAR_FUTURE'], category: 'faith', title: 'The voluntary exit', description: 'You choose to end. The door opens onto the stars. You have been paying attention.', cascadeTags: ['grace','acceptance'] },
];

const CRISIS_CHOICES = {
  intervene: {
    key: 'A', label: 'Intervene', subtitle: 'You act directly and accept the consequences.',
    riskDescriptions: ['Success possible', 'May accelerate outcome', 'High energy cost'],
    outcomes: {
      success: { probability: 0.45, cascadeTags: ['bravery', 'recovery'], emotionalShift: 0.15, description: 'Your action shifts the outcome. You feel capable.' },
      failure: { probability: 0.55, cascadeTags: ['injury', 'loss'], emotionalShift: -0.2, deathChance: 0.15, description: 'The intervention fails and you are caught in the consequences.' },
    },
    cascadeBias: ['courage', 'action'],
  },
  pray: {
    key: 'B', label: 'Pray', subtitle: 'You submit to a higher power and hope.',
    riskDescriptions: ['Passively accept', 'May invite intervention', 'Low personal cost'],
    outcomes: {
      success: { probability: 0.35, cascadeTags: ['faith', 'serenity'], emotionalShift: 0.1, description: 'Something answers. Or you find the strength within.' },
      failure: { probability: 0.65, cascadeTags: ['abandonment', 'doubt'], emotionalShift: -0.1, description: 'The silence is louder than before.' },
    },
    cascadeBias: ['faith', 'resignation'],
  },
  watch: {
    key: 'C', label: 'Watch', subtitle: 'You observe without acting. The crisis passes or it doesn\'t.',
    riskDescriptions: ['No intervention', 'May resolve on its own', 'Minimal engagement'],
    outcomes: {
      success: { probability: 0.55, cascadeTags: ['acceptance', 'stillness'], emotionalShift: 0.05, description: 'The crisis passes and you learn something about letting go.' },
      failure: { probability: 0.45, cascadeTags: ['regret', 'passivity'], emotionalShift: -0.05, description: 'You wonder if you should have done something. The wondering stays.' },
    },
    cascadeBias: ['stillness', 'observation'],
  },
};

// â” â” â”  State â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” 

let state = {
  soul: null,
  life: null,
  currentPhase: 'INFANT',
  age: 0,
  year: 0,
  era: 'ANCIENT',
  ticksThisLife: 0,
  isRunning: false,
  isPaused: false,
  speed: 1,
  riskAppetite: 'MODERATE',
  events: [],
  pendingDecisions: null,
  narrationEnabled: true,
};

// â” â” â”  State Initialization â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” 

export function createSoulState(id) {
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

export function createLifeState() {
  return {
    id: `life_${Date.now()}`,
    name: '',
    era: 'ANCIENT',
    year: 0,
    age: 0,
    location: { city: '', region: '', country: '' },
    genderPresentation: 'male',
    health: 'healthy',
    socialClass: 'unknown',
    phase: 'INFANT',
    isAlive: true,
    events: [],
    decisions: [],
    anchor: null,
  };
}

// â” â” â”  Game Loop â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” 

export function gameTick() {
  if (!state.isRunning || state.isPaused || !state.life || !state.life.isAlive) {
    return;
  }

  state.ticksThisLife += 1;
  state.age += 1;
  state.year += 1;
  state.life.age = state.age;
  state.life.year = state.year;

  const newPhase = getLifePhase(state.age);
  if (newPhase !== state.currentPhase) {
    state.currentPhase = newPhase;
    state.life.phase = newPhase;
  }

  const baseRate = getMortalityRate(state.age);
  const riskMultiplier = getRiskLevel(state.riskAppetite);
  const mortalityChance = (baseRate / 1000) * riskMultiplier;

  if (Math.random() < mortalityChance) {
    dieNow();
    return;
  }
}

// â” â” â”  Risk Appetite â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” 

export function adjustRiskAppetite(delta) {
  const levels = ['MINIMAL', 'LOW', 'MODERATE', 'HIGH', 'EXTREME'];
  const currentIdx = levels.indexOf(state.riskAppetite);
  const newIdx = Math.max(0, Math.min(levels.length - 1, currentIdx + delta));
  state.riskAppetite = levels[newIdx];
  return state.riskAppetite;
}

export function getRiskLevel(riskAppetite) {
  const level = RISK_LEVELS[riskAppetite] || RISK_LEVELS.MODERATE;
  return level.multiplier;
}

export function getRiskLabel(riskAppetite) {
  const level = RISK_LEVELS[riskAppetite] || RISK_LEVELS.MODERATE;
  return level.label;
}

// â” â” â”  Speed Control â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” 

export function setSpeed(speed) {
  state.speed = Math.max(0.25, Math.min(8, speed));
  return state.speed;
}

export function getSpeed() {
  return state.speed;
}

// â” â” â”  Era System â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” 

export function getEraForSoul(soulState) {
  const fragmentCount = soulState.fragments ? soulState.fragments.length : 0;
  const unlocked = getUnlockedEras(fragmentCount);

  const eraWeights = buildEraWeightsInternal(fragmentCount);
  const totalWeight = eraWeights.reduce((sum, e) => sum + e.weight, 0);
  let random = Math.random() * totalWeight;

  for (const { eraId, weight } of eraWeights) {
    random -= weight;
    if (random <= 0) return eraId;
  }

  return unlocked.length > 0 ? unlocked[0] : 'ANCIENT';
}

export function getUnlockedEras(fragmentCount) {
  if (fragmentCount >= 10) {
    return ERA_ORDER.slice();
  }

  const unlockedCount = Math.max(2, Math.min(fragmentCount + 2, ERA_ORDER.length));
  return ERA_ORDER.slice(0, unlockedCount);
}

export function getEraData(eraId) {
  return ERA_DATA[eraId] || ERA_DATA.ANCIENT;
}

export function getEraYearRange(eraId) {
  const data = ERA_DATA[eraId];
  return data ? data.yearRange : [0, 100];
}

export function getEraSignature(eraId) {
  const data = ERA_DATA[eraId];
  return data ? data.eventSignature : 'The world turns without you.';
}

export function getAllEras() {
  return ERA_ORDER.map(id => ERA_DATA[id]);
}

function buildEraWeightsInternal(fragmentCount) {
  const unlocked = getUnlockedEras(fragmentCount);
  const weights = [];

  for (let i = 0; i < ERA_ORDER.length; i++) {
    const eraId = ERA_ORDER[i];
    if (!unlocked.includes(eraId)) continue;

    let weight;

    if (fragmentCount === 0) {
      if (eraId === 'ANCIENT') weight = 70;
      else if (eraId === 'MEDIEVAL') weight = 25;
      else if (eraId === 'EARLY_MODERN') weight = 5;
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

// â” â” â”  Roll Utilities â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” 

export function rollDice(sides = 6, count = 1) {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
}

export function pickRandom(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffleArray(arr) {
  const result = arr ? arr.slice() : [];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return result;
}

// â” â” â”  Life Phase System â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” 

export function getLifePhase(age) {
  for (const [name, range] of Object.entries(LIFE_PHASES)) {
    if (age >= range.min && age <= range.max) return name;
  }
  return 'ANCIENT';
}

export function getPhaseColor(phase) {
  return PHASE_COLORS[phase] || '#ffffff';
}

export function getPhaseRange(phase) {
  return LIFE_PHASES[phase] || { min: 0, max: Infinity };
}

export function isPhaseEnd(age, phase) {
  const range = LIFE_PHASES[phase];
  if (!range) return false;
  if (phase === 'ANCIENT') return false;
  return age >= range.max;
}

// â” â” â”  Mortality â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” 

function getMortalityRate(age) {
  const bucket = MORTALITY_CURVE.find(b => age >= b.minAge && age <= b.maxAge);
  return bucket ? bucket.rate : 80.0;
}

// â” â” â”  Module Init â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” 

export function init() {
  state.soul = createSoulState();
  state.speed = 1;
  state.riskAppetite = 'MODERATE';
  state.isRunning = false;
  state.isPaused = false;
}

export function update() {
  if (!state.isRunning || state.isPaused) return;
  gameTick();
}

// â” â” â”  Exports â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” 

export { ERA_ORDER, ERA_DATA, LIFE_PHASES, PHASE_COLORS, RISK_LEVELS, MORTALITY_CURVE, CHAIN_COLORS, FRAGMENT_TYPE_ICONS, CRITICAL_INTENSITY, DEFAULT_CHOICE_TIMEOUT, SPEED_MAP, ERAS, EVENT_POOLS, DEATH_EVENTS, CRISIS_CHOICES };
export { state };