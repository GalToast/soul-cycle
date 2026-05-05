/**
 * SOUL-CYCLE — Event Cascade Engine
 *
 * Drives the procedural event system. Each life is a sequence of events
 * triggered by age-based mortality risk curves. Events cascade through
 * free-association logic, not consequence trees.
 */

// ─── Mortality Risk Curve (per 1000 per year) ───────────────────────────────

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

function getMortalityRate(age) {
  const bucket = MORTALITY_CURVE.find(b => age >= b.minAge && age <= b.maxAge);
  return bucket ? bucket.rate : 80.0;
}

// ─── Life Phases ────────────────────────────────────────────────────────────

const LIFE_PHASES = {
  INFANT:      { min: 0,  max: 3  },
  CHILD:       { min: 4,  max: 12 },
  ADOLESCENT:  { min: 13, max: 19 },
  YOUNG_ADULT: { min: 20, max: 39 },
  MIDDLE_AGE:  { min: 40, max: 64 },
  SENIOR:      { min: 65, max: 84 },
  ANCIENT:     { min: 85, max: Infinity },
};

function getLifePhase(age) {
  for (const [name, range] of Object.entries(LIFE_PHASES)) {
    if (age >= range.min && age <= range.max) return name;
  }
  return 'ANCIENT';
}

// ─── Eras ───────────────────────────────────────────────────────────────────

const ERAS = ['PREHISTORIC', 'ANCIENT', 'MEDIEVAL', 'EARLY_MODERN', 'MODERN', 'FUTURE'];

// ─── Cascade Tags ───────────────────────────────────────────────────────────

const CASCADE_TAGS = [
  'grief', 'wonder', 'betrayal', 'awe', 'quiet', 'rage', 'tenderness',
  'disorientation', 'clarity', 'loss', 'discovery', 'dread', 'grace',
  'isolation', 'connection', 'humiliation', 'triumph', 'resignation',
  'longing', 'vertigo', 'numbness', 'awakening', 'dissolution', 'anchor',
];

// ─── Event Pools by Era ─────────────────────────────────────────────────────

function buildEventPools() {
  const pools = {};

  // ── PREHISTORIC ────────────────────────────────────────────────────────
  pools.PREHISTORIC = [
    { id: 'ph_01', triggerProbability: 0.12, phases: ['CHILD','ADOLESCENT','YOUNG_ADULT'], eras: ['PREHISTORIC'], category: 'violence', weight: 3, title: 'The predator at the tree line', description: 'Something watches from beyond the firelight. You keep the embers fed and don\'t sleep.', cascadeTags: ['dread', 'anchor'], outcomes: [] },
    { id: 'ph_02', triggerProbability: 0.10, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['PREHISTORIC'], category: 'circumstance', weight: 2, title: 'The migration begins', description: 'The herd moves north and the band follows. You carry what you can and leave the rest to the grass.', cascadeTags: ['disorientation', 'vertigo'], outcomes: [] },
    { id: 'ph_03', triggerProbability: 0.08, phases: ['INFANT','CHILD'], eras: ['PREHISTORIC'], category: 'body', weight: 4, title: 'Fever takes the little ones', description: 'The heat comes and doesn\'t leave. Someone presses wet bark to your forehead and sings.', cascadeTags: ['grief', 'numbness'], outcomes: [] },
    { id: 'ph_04', triggerProbability: 0.06, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['PREHISTORIC'], category: 'mystery', weight: 2, title: 'The cave paintings', description: 'Deep in the rock someone has drawn animals that don\'t exist anymore. You touch the ochre and feel something shift.', cascadeTags: ['wonder', 'awe'], outcomes: [] },
    { id: 'ph_05', triggerProbability: 0.07, phases: ['YOUNG_ADULT','MIDDLE_AGE','SENIOR'], eras: ['PREHISTORIC'], category: 'relationship', weight: 3, title: 'A bond forged in the hunt', description: 'You and another move together without speaking. After, you share the meat and don\'t look away.', cascadeTags: ['connection', 'tenderness'], outcomes: [] },
    { id: 'ph_06', triggerProbability: 0.05, phases: ['CHILD','ADOLESCENT'], eras: ['PREHISTORIC'], category: 'fortune', weight: 2, title: 'Honey in the hollow tree', description: 'You find it by accident — a comb heavy and golden. The bees are gone. You eat until your hands shake.', cascadeTags: ['wonder', 'grace'], outcomes: [] },
    { id: 'ph_07', triggerProbability: 0.09, phases: ['MIDDLE_AGE','SENIOR','ANCIENT'], eras: ['PREHISTORIC'], category: 'circumstance', weight: 3, title: 'The elders\' fire', description: 'You sit with the ones who remember the last cold season. They speak in fragments. You try to hold it all.', cascadeTags: ['anchor', 'resignation'], outcomes: [] },
    { id: 'ph_08', triggerProbability: 0.06, phases: ['YOUNG_ADULT'], eras: ['PREHISTORIC'], category: 'body', weight: 2, title: 'The wound that won\'t close', description: 'A boar\'s tusk or a fall from the ridge — it doesn\'t matter. The flesh stays angry. You learn what it means to wait.', cascadeTags: ['dread', 'numbness'], outcomes: [] },
    { id: 'ph_09', triggerProbability: 0.04, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['PREHISTORIC'], category: 'mystery', weight: 1, title: 'The bone flute', description: 'Someone carves holes in a vulture wing bone and the sound that comes out is not of this earth.', cascadeTags: ['awe', 'disorientation'], outcomes: [] },
    { id: 'ph_10', triggerProbability: 0.10, phases: ['INFANT','CHILD','ADOLESCENT'], eras: ['PREHISTORIC'], category: 'violence', weight: 3, title: 'The raid at dawn', description: 'They come from the river side. You run with nothing but your skin and the taste of copper.', cascadeTags: ['dread', 'betrayal'], outcomes: [] },
    { id: 'ph_11', triggerProbability: 0.05, phases: ['SENIOR','ANCIENT'], eras: ['PREHISTORIC'], category: 'relationship', weight: 2, title: 'The last of your litter', description: 'Your sibling or child — the one who stayed — sits beside you and says nothing. The silence is enough.', cascadeTags: ['tenderness', 'resignation'], outcomes: [] },
    { id: 'ph_12', triggerProbability: 0.07, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['PREHISTORIC'], category: 'fortune', weight: 2, title: 'A new vein of flint', description: 'The stone splits clean and sharp. You\'ve never seen quality like it. The band will remember who found it.', cascadeTags: ['triumph', 'anchor'], outcomes: [] },
    { id: 'ph_13', triggerProbability: 0.06, phases: ['CHILD','ADOLESCENT','YOUNG_ADULT'], eras: ['PREHISTORIC'], category: 'body', weight: 3, title: 'The long hunger', description: 'The game thins out and the berries fail. Your body eats itself. You dream of fat and salt.', cascadeTags: ['numbness', 'dread'], outcomes: [] },
    { id: 'ph_14', triggerProbability: 0.04, phases: ['MIDDLE_AGE','SENIOR'], eras: ['PREHISTORIC'], category: 'mystery', weight: 1, title: 'The burial mound', description: 'You help dig the grave and someone places red powder on the dead man\'s face. No one explains why.', cascadeTags: ['wonder', 'disorientation'], outcomes: [] },
    { id: 'ph_15', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['PREHISTORIC'], category: 'relationship', weight: 3, title: 'The chosen one', description: 'They look at you across the fire and you know. Not words — something older. You move closer.', cascadeTags: ['connection', 'awakening'], outcomes: [] },
    { id: 'ph_16', triggerProbability: 0.05, phases: ['ADOLESCENT'], eras: ['PREHISTORIC'], category: 'circumstance', weight: 2, title: 'The rite of passage', description: 'They take you out past the markers and leave you there. The night is very long. You come back different.', cascadeTags: ['vertigo', 'awakening'], outcomes: [] },
    { id: 'ph_17', triggerProbability: 0.06, phases: ['SENIOR','ANCIENT'], eras: ['PREHISTORIC'], category: 'body', weight: 3, title: 'The teeth go first', description: 'Then the knees. Then the eyes blur at the edges. You learn to navigate by sound and memory.', cascadeTags: ['resignation', 'numbness'], outcomes: [] },
    { id: 'ph_18', triggerProbability: 0.04, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['PREHISTORIC'], category: 'fortune', weight: 1, title: 'The sheltered valley', description: 'You crest the ridge and find it — windbreak, water, game trails. The band will settle here a while.', cascadeTags: ['grace', 'anchor'], outcomes: [] },
    { id: 'ph_19', triggerProbability: 0.07, phases: ['CHILD','ADOLESCENT','YOUNG_ADULT'], eras: ['PREHISTORIC'], category: 'violence', weight: 2, title: 'The snake in the grass', description: 'You see it too late or just in time — the strike, the swelling, the long wait to see if the swelling goes down.', cascadeTags: ['dread', 'vertigo'], outcomes: [] },
    { id: 'ph_20', triggerProbability: 0.03, phases: ['MIDDLE_AGE','SENIOR','ANCIENT'], eras: ['PREHISTORIC'], category: 'mystery', weight: 1, title: 'The dream that predicts', description: 'You dream of the hunt and wake knowing where the herd will be. They follow you. You\'re right.', cascadeTags: ['awe', 'disorientation'], outcomes: [] },
    { id: 'ph_21', triggerProbability: 0.06, phases: ['INFANT','CHILD'], eras: ['PREHISTORIC'], category: 'relationship', weight: 3, title: 'Carried on the back', description: 'You are small and the world is large and someone\'s shoulders are the only geography you know.', cascadeTags: ['tenderness', 'anchor'], outcomes: [] },
    { id: 'ph_22', triggerProbability: 0.05, phases: ['YOUNG_ADULT'], eras: ['PREHISTORIC'], category: 'circumstance', weight: 2, title: 'The first domestication', description: 'A wolf pup follows you back to camp. No one drives it off. Something changes between species.', cascadeTags: ['wonder', 'connection'], outcomes: [] },
    { id: 'ph_23', triggerProbability: 0.04, phases: ['ADOLESCENT','YOUNG_ADULT','MIDDLE_AGE'], eras: ['PREHISTORIC'], category: 'body', weight: 2, title: 'The childbirth', description: 'It takes hours. It takes everything. When it\'s over you don\'t know if you\'re alive or dead for a while.', cascadeTags: ['vertigo', 'awakening'], outcomes: [] },
    { id: 'ph_24', triggerProbability: 0.05, phases: ['SENIOR','ANCIENT'], eras: ['PREHISTORIC'], category: 'circumstance', weight: 2, title: 'The last walk', description: 'You know the season. You walk away from camp toward the high rocks. No one stops you.', cascadeTags: ['resignation', 'grace'], outcomes: [] },
    { id: 'ph_25', triggerProbability: 0.03, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['PREHISTORIC'], category: 'mystery', weight: 1, title: 'The stone circle', description: 'They\'re placing them in a pattern you don\'t understand. The shadows fall wrong on the solstice. You watch.', cascadeTags: ['awe', 'wonder'], outcomes: [] },
    { id: 'ph_26', triggerProbability: 0.06, phases: ['CHILD','ADOLESCENT'], eras: ['PREHISTORIC'], category: 'fortune', weight: 2, title: 'The amber bead', description: 'You find it in the river mud — golden, warm, holding something ancient inside. You keep it forever.', cascadeTags: ['wonder', 'grace'], outcomes: [] },
    { id: 'ph_27', triggerProbability: 0.07, phases: ['MIDDLE_AGE','SENIOR'], eras: ['PREHISTORIC'], category: 'relationship', weight: 3, title: 'The storytelling', description: 'You tell the young ones about the great cold, the time the river ran backwards. They think you\'re making it up.', cascadeTags: ['anchor', 'connection'], outcomes: [] },
    { id: 'ph_28', triggerProbability: 0.04, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['PREHISTORIC'], category: 'violence', weight: 2, title: 'The intertribal fight', description: 'It starts over a water source and ends with bodies in the reeds. You don\'t remember whose side you were on.', cascadeTags: ['rage', 'betrayal'], outcomes: [] },
    { id: 'ph_29', triggerProbability: 0.05, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['PREHISTORIC'], category: 'body', weight: 2, title: 'The broken bone sets wrong', description: 'There\'s no one who knows how to re-break it. You learn to live with the angle. It becomes part of your name.', cascadeTags: ['resignation', 'numbness'], outcomes: [] },
    { id: 'ph_30', triggerProbability: 0.03, phases: ['SENIOR','ANCIENT'], eras: ['PREHISTORIC'], category: 'mystery', weight: 1, title: 'The voice in the wind', description: 'It calls your name in a language no one speaks anymore. You follow it to the edge of the known world.', cascadeTags: ['awe', 'dissolution'], outcomes: [] },
  ];

  // ── ANCIENT ────────────────────────────────────────────────────────────
  pools.ANCIENT = [
    { id: 'an_01', triggerProbability: 0.10, phases: ['CHILD','ADOLESCENT','YOUNG_ADULT'], eras: ['ANCIENT'], category: 'violence', weight: 3, title: 'The conscription notice', description: 'The king\'s men come through the village with a list. Your name is on it. Your mother doesn\'t cry until they leave.', cascadeTags: ['dread', 'betrayal'], outcomes: [] },
    { id: 'an_02', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['ANCIENT'], category: 'circumstance', weight: 3, title: 'The road to the capital', description: 'You walk it for weeks. The city when you see it is larger than anything you believed existed.', cascadeTags: ['vertigo', 'awe'], outcomes: [] },
    { id: 'an_03', triggerProbability: 0.07, phases: ['INFANT','CHILD'], eras: ['ANCIENT'], category: 'body', weight: 4, title: 'The summer fever', description: 'It runs through the quarter like a rumor. You survive. The child next door doesn\'t.', cascadeTags: ['grief', 'numbness'], outcomes: [] },
    { id: 'an_04', triggerProbability: 0.06, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['ANCIENT'], category: 'mystery', weight: 2, title: 'The oracle\'s riddle', description: 'She speaks in a voice that isn\'t hers and the priests write it down. Later, you realize it was about you.', cascadeTags: ['wonder', 'disorientation'], outcomes: [] },
    { id: 'an_05', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE','SENIOR'], eras: ['ANCIENT'], category: 'relationship', weight: 3, title: 'The arranged marriage', description: 'You meet them at the threshold. They are a stranger. You both pretend otherwise.', cascadeTags: ['disorientation', 'connection'], outcomes: [] },
    { id: 'an_06', triggerProbability: 0.05, phases: ['CHILD','ADOLESCENT'], eras: ['ANCIENT'], category: 'fortune', weight: 2, title: 'The scholarship', description: 'A priest notices you can read. Suddenly you eat better and sleep indoors. The other children look at you differently.', cascadeTags: ['grace', 'anchor'], outcomes: [] },
    { id: 'an_07', triggerProbability: 0.09, phases: ['MIDDLE_AGE','SENIOR','ANCIENT'], eras: ['ANCIENT'], category: 'circumstance', weight: 3, title: 'The library burns', description: 'You watch centuries of thought turn to smoke. Someone saves a scroll and hides it in their tunic.', cascadeTags: ['grief', 'rage'], outcomes: [] },
    { id: 'an_08', triggerProbability: 0.06, phases: ['YOUNG_ADULT'], eras: ['ANCIENT'], category: 'body', weight: 2, title: 'The gladiator\'s scar', description: 'It could have been the arena or a bar fight — the wound is the same. The pride is different.', cascadeTags: ['triumph', 'numbness'], outcomes: [] },
    { id: 'an_09', triggerProbability: 0.04, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['ANCIENT'], category: 'mystery', weight: 1, title: 'The mystery cult', description: 'They meet underground. They say they know what comes after. You want to know too.', cascadeTags: ['awe', 'wonder'], outcomes: [] },
    { id: 'an_10', triggerProbability: 0.10, phases: ['INFANT','CHILD','ADOLESCENT'], eras: ['ANCIENT'], category: 'violence', weight: 3, title: 'The city falls', description: 'The walls don\'t hold. You learn what fire sounds like in a place where people used to live.', cascadeTags: ['dread', 'vertigo'], outcomes: [] },
    { id: 'an_11', triggerProbability: 0.05, phases: ['SENIOR','ANCIENT'], eras: ['ANCIENT'], category: 'relationship', weight: 2, title: 'The grandchild\'s hand', description: 'It fits inside yours like a promise. You forget everything else for a moment.', cascadeTags: ['tenderness', 'grace'], outcomes: [] },
    { id: 'an_12', triggerProbability: 0.07, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['ANCIENT'], category: 'fortune', weight: 2, title: 'The inheritance', description: 'An uncle you barely remember leaves you land. It comes with tenants, obligations, and a curse no one will name.', cascadeTags: ['anchor', 'disorientation'], outcomes: [] },
    { id: 'an_13', triggerProbability: 0.06, phases: ['CHILD','ADOLESCENT','YOUNG_ADULT'], eras: ['ANCIENT'], category: 'body', weight: 3, title: 'The plague ship', description: 'It docks and no one stops it. By the time anyone thinks to, the harbor is full of bodies.', cascadeTags: ['dread', 'grief'], outcomes: [] },
    { id: 'an_14', triggerProbability: 0.04, phases: ['MIDDLE_AGE','SENIOR'], eras: ['ANCIENT'], category: 'mystery', weight: 1, title: 'The philosopher\'s student', description: 'You sit at the edge of the garden and listen to a man argue about whether anything is real. You\'re not sure he believes it either.', cascadeTags: ['wonder', 'disorientation'], outcomes: [] },
    { id: 'an_15', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['ANCIENT'], category: 'relationship', weight: 3, title: 'The friendship forged in exile', description: 'You\'re both far from home and the shared foreignness is enough. You trust each other with everything.', cascadeTags: ['connection', 'anchor'], outcomes: [] },
    { id: 'an_16', triggerProbability: 0.05, phases: ['ADOLESCENT'], eras: ['ANCIENT'], category: 'circumstance', weight: 2, title: 'The apprenticeship', description: 'The master hits you with a rod and you learn to shape clay. Your hands are ruined but they\'re yours.', cascadeTags: ['numbness', 'triumph'], outcomes: [] },
    { id: 'an_17', triggerProbability: 0.06, phases: ['SENIOR','ANCIENT'], eras: ['ANCIENT'], category: 'body', weight: 3, title: 'The slow blindness', description: 'The world goes soft at the edges first. Then the center fades. You navigate by voice and smell.', cascadeTags: ['resignation', 'numbness'], outcomes: [] },
    { id: 'an_18', triggerProbability: 0.04, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['ANCIENT'], category: 'fortune', weight: 1, title: 'The patron\'s favor', description: 'A rich man notices your work and decides you matter. Suddenly doors open. You try not to look behind you.', cascadeTags: ['grace', 'vertigo'], outcomes: [] },
    { id: 'an_19', triggerProbability: 0.07, phases: ['CHILD','ADOLESCENT','YOUNG_ADULT'], eras: ['ANCIENT'], category: 'violence', weight: 2, title: 'The slave market', description: 'You are sold or you watch someone you love get sold. The distinction doesn\'t make it easier.', cascadeTags: ['rage', 'grief'], outcomes: [] },
    { id: 'an_20', triggerProbability: 0.03, phases: ['MIDDLE_AGE','SENIOR','ANCIENT'], eras: ['ANCIENT'], category: 'mystery', weight: 1, title: 'The astrologer\'s chart', description: 'They map your birth to the stars and tell you when you\'ll die. You try not to think about it. You fail.', cascadeTags: ['dread', 'awe'], outcomes: [] },
    { id: 'an_21', triggerProbability: 0.06, phases: ['INFANT','CHILD'], eras: ['ANCIENT'], category: 'relationship', weight: 3, title: 'The wet nurse', description: 'She is not your mother but her milk is. You learn the difference between blood and care much later.', cascadeTags: ['tenderness', 'anchor'], outcomes: [] },
    { id: 'an_22', triggerProbability: 0.05, phases: ['YOUNG_ADULT'], eras: ['ANCIENT'], category: 'circumstance', weight: 2, title: 'The new religion', description: 'It spreads through the streets like a song. You join or you don\'t but you can\'t ignore it.', cascadeTags: ['awakening', 'disorientation'], outcomes: [] },
    { id: 'an_23', triggerProbability: 0.04, phases: ['ADOLESCENT','YOUNG_ADULT','MIDDLE_AGE'], eras: ['ANCIENT'], category: 'body', weight: 2, title: 'The childbirth in the courtyard', description: 'The midwife knows what she\'s doing. That doesn\'t make it less violent. You hold the child and the blood together.', cascadeTags: ['vertigo', 'awakening'], outcomes: [] },
    { id: 'an_24', triggerProbability: 0.05, phases: ['SENIOR','ANCIENT'], eras: ['ANCIENT'], category: 'circumstance', weight: 2, title: 'The villa by the sea', description: 'You\'ve earned it or inherited it or stolen it. Either way, the water is blue and the olives are ripe.', cascadeTags: ['grace', 'resignation'], outcomes: [] },
    { id: 'an_25', triggerProbability: 0.03, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['ANCIENT'], category: 'mystery', weight: 1, title: 'The buried god', description: 'Farmers hit stone and find a temple underneath. The priests argue over whose god it is. The god says nothing.', cascadeTags: ['awe', 'wonder'], outcomes: [] },
    { id: 'an_26', triggerProbability: 0.06, phases: ['CHILD','ADOLESCENT'], eras: ['ANCIENT'], category: 'fortune', weight: 2, title: 'The olive grove', description: 'Your family owns trees that predate the empire. The oil is pressed and the coins are counted. You eat well.', cascadeTags: ['anchor', 'grace'], outcomes: [] },
    { id: 'an_27', triggerProbability: 0.07, phases: ['MIDDLE_AGE','SENIOR'], eras: ['ANCIENT'], category: 'relationship', weight: 3, title: 'The letter from abroad', description: 'It arrives months late and the ink is faded. It says they\'re alive. That\'s enough.', cascadeTags: ['connection', 'longing'], outcomes: [] },
    { id: 'an_28', triggerProbability: 0.04, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['ANCIENT'], category: 'violence', weight: 2, title: 'The arena', description: 'You go to watch and can\'t look away. The crowd\'s roar is a living thing. You are part of it.', cascadeTags: ['rage', 'vertigo'], outcomes: [] },
    { id: 'an_29', triggerProbability: 0.05, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['ANCIENT'], category: 'body', weight: 2, title: 'The lead poisoning', description: 'The wine tastes sweet and the pipes are new. No one connects the dots for another hundred years.', cascadeTags: ['numbness', 'dread'], outcomes: [] },
    { id: 'an_30', triggerProbability: 0.03, phases: ['SENIOR','ANCIENT'], eras: ['ANCIENT'], category: 'mystery', weight: 1, title: 'The last words of the dying sage', description: 'He speaks and the room leans in. You catch one phrase and spend the rest of your life trying to understand it.', cascadeTags: ['awe', 'dissolution'], outcomes: [] },
  ];

  // ── MEDIEVAL ───────────────────────────────────────────────────────────
  pools.MEDIEVAL = [
    { id: 'md_01', triggerProbability: 0.12, phases: ['CHILD','ADOLESCENT','YOUNG_ADULT'], eras: ['MEDIEVAL'], category: 'body', weight: 4, title: 'The plague comes through your village', description: 'The boils appear on Tuesday. By Friday the priest stops ringing the bell. You count the living instead of the dead.', cascadeTags: ['grief', 'dread'], outcomes: [] },
    { id: 'md_02', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MEDIEVAL'], category: 'circumstance', weight: 3, title: 'You become a clergy member', description: 'The habit is rough and the vows are harder. You learn that faith and doubt live in the same room.', cascadeTags: ['disorientation', 'anchor'], outcomes: [] },
    { id: 'md_03', triggerProbability: 0.10, phases: ['MIDDLE_AGE','SENIOR'], eras: ['MEDIEVAL'], category: 'relationship', weight: 4, title: 'Your child dies of fever', description: 'You hold them through the shaking and then the stillness. After, the house is too quiet for years.', cascadeTags: ['grief', 'numbness'], outcomes: [] },
    { id: 'md_04', triggerProbability: 0.06, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['MEDIEVAL'], category: 'fortune', weight: 2, title: 'You survive a siege', description: 'The walls hold. The food doesn\'t. You eat leather and pray and when the gates open you can\'t remember why you stayed.', cascadeTags: ['triumph', 'vertigo'], outcomes: [] },
    { id: 'md_05', triggerProbability: 0.05, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MEDIEVAL'], category: 'mystery', weight: 2, title: 'A traveling healer gives you something strange', description: 'A vial of dark liquid, a bone charm, a word you\'re told not to speak aloud. You keep it. You don\'t use it. Yet.', cascadeTags: ['wonder', 'dread'], outcomes: [] },
    { id: 'md_06', triggerProbability: 0.07, phases: ['CHILD','ADOLESCENT'], eras: ['MEDIEVAL'], category: 'circumstance', weight: 3, title: 'The apprenticeship begins', description: 'The blacksmith\'s shop is hot and loud and you are small. He doesn\'t coddle you. You learn to make things that last.', cascadeTags: ['anchor', 'triumph'], outcomes: [] },
    { id: 'md_07', triggerProbability: 0.09, phases: ['YOUNG_ADULT','MIDDLE_AGE','SENIOR'], eras: ['MEDIEVAL'], category: 'violence', weight: 3, title: 'The lord\'s tax collector', description: 'He takes what you can\'t spare and leaves a receipt you can\'t read. You hate him quietly and efficiently.', cascadeTags: ['rage', 'resignation'], outcomes: [] },
    { id: 'md_08', triggerProbability: 0.06, phases: ['INFANT','CHILD'], eras: ['MEDIEVAL'], category: 'body', weight: 4, title: 'The teething fever', description: 'The gums swell and the heat rises. Someone ties a red thread around your wrist. It works or it doesn\'t.', cascadeTags: ['dread', 'numbness'], outcomes: [] },
    { id: 'md_09', triggerProbability: 0.04, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['MEDIEVAL'], category: 'mystery', weight: 1, title: 'The heretic\'s sermon', description: 'They speak in the square and the words are dangerous and true. The guards arrive. You remember every syllable.', cascadeTags: ['awe', 'betrayal'], outcomes: [] },
    { id: 'md_10', triggerProbability: 0.10, phases: ['INFANT','CHILD','ADOLESCENT'], eras: ['MEDIEVAL'], category: 'violence', weight: 3, title: 'The raiding party', description: 'They come at harvest and take what\'s ripe. You hide in the root cellar and listen to your life being carried away.', cascadeTags: ['dread', 'grief'], outcomes: [] },
    { id: 'md_11', triggerProbability: 0.05, phases: ['SENIOR','ANCIENT'], eras: ['MEDIEVAL'], category: 'relationship', weight: 2, title: 'The widow\'s garden', description: 'You plant what you can manage now. The roses are enough. The neighbors bring bread and don\'t stay long.', cascadeTags: ['tenderness', 'resignation'], outcomes: [] },
    { id: 'md_12', triggerProbability: 0.07, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MEDIEVAL'], category: 'fortune', weight: 2, title: 'The good harvest', description: 'The wheat stands tall and the rain held off. For once, the world cooperates. You store what you can and wait.', cascadeTags: ['grace', 'anchor'], outcomes: [] },
    { id: 'md_13', triggerProbability: 0.06, phases: ['CHILD','ADOLESCENT','YOUNG_ADULT'], eras: ['MEDIEVAL'], category: 'body', weight: 3, title: 'The leper\'s bell', description: 'You hear it in the distance and pull your children inside. The sound follows you into your dreams.', cascadeTags: ['dread', 'isolation'], outcomes: [] },
    { id: 'md_14', triggerProbability: 0.04, phases: ['MIDDLE_AGE','SENIOR'], eras: ['MEDIEVAL'], category: 'mystery', weight: 1, title: 'The illuminated manuscript', description: 'A monk spends ten years on a single page. You look at the gold leaf and the tiny saint and wonder who it\'s for.', cascadeTags: ['wonder', 'awe'], outcomes: [] },
    { id: 'md_15', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MEDIEVAL'], category: 'relationship', weight: 3, title: 'The pilgrimage companion', description: 'You walk for weeks together and learn the shape of their silence. At the shrine you pray for different things.', cascadeTags: ['connection', 'longing'], outcomes: [] },
    { id: 'md_16', triggerProbability: 0.05, phases: ['ADOLESCENT'], eras: ['MEDIEVAL'], category: 'circumstance', weight: 2, title: 'The squire\'s duty', description: 'You polish armor you\'ll never wear and hold a horse you\'ll never ride. The knight doesn\'t notice you exist.', cascadeTags: ['humiliation', 'anchor'], outcomes: [] },
    { id: 'md_17', triggerProbability: 0.06, phases: ['SENIOR','ANCIENT'], eras: ['MEDIEVAL'], category: 'body', weight: 3, title: 'The failing sight', description: 'The prayers blur. The faces soften. You recognize people by their footsteps and the smell of their bread.', cascadeTags: ['resignation', 'numbness'], outcomes: [] },
    { id: 'md_18', triggerProbability: 0.04, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MEDIEVAL'], category: 'fortune', weight: 1, title: 'The charter grant', description: 'The village gets its market rights. Suddenly you\'re a town. The first fair brings strangers and silver.', cascadeTags: ['grace', 'vertigo'], outcomes: [] },
    { id: 'md_19', triggerProbability: 0.07, phases: ['CHILD','ADOLESCENT','YOUNG_ADULT'], eras: ['MEDIEVAL'], category: 'violence', weight: 2, title: 'The witch accusation', description: 'It\'s the widow with the herbs or the boy who stammers. They drag them to the green. You watch and say nothing.', cascadeTags: ['betrayal', 'rage'], outcomes: [] },
    { id: 'md_20', triggerProbability: 0.03, phases: ['MIDDLE_AGE','SENIOR','ANCIENT'], eras: ['MEDIEVAL'], category: 'mystery', weight: 1, title: 'The relic arrives', description: 'A finger bone, a piece of the cross, a vial of milk. The bishop says it\'s real. The villagers kneel. You\'re not sure.', cascadeTags: ['awe', 'disorientation'], outcomes: [] },
    { id: 'md_21', triggerProbability: 0.06, phases: ['INFANT','CHILD'], eras: ['MEDIEVAL'], category: 'relationship', weight: 3, title: 'The swaddling', description: 'Wrapped tight as a parcel, you can\'t move but you\'re warm. Someone hums and the world is small and safe.', cascadeTags: ['tenderness', 'anchor'], outcomes: [] },
    { id: 'md_22', triggerProbability: 0.05, phases: ['YOUNG_ADULT'], eras: ['MEDIEVAL'], category: 'circumstance', weight: 2, title: 'The guild initiation', description: 'You swear oaths you don\'t understand to men who don\'t trust you. The bread and ale taste like belonging.', cascadeTags: ['connection', 'anchor'], outcomes: [] },
    { id: 'md_23', triggerProbability: 0.04, phases: ['ADOLESCENT','YOUNG_ADULT','MIDDLE_AGE'], eras: ['MEDIEVAL'], category: 'body', weight: 2, title: 'The childbirth at sixteen', description: 'Your body isn\'t ready but the baby doesn\'t care. You scream and the midwife holds your hand and it happens.', cascadeTags: ['vertigo', 'awakening'], outcomes: [] },
    { id: 'md_24', triggerProbability: 0.05, phases: ['SENIOR','ANCIENT'], eras: ['MEDIEVAL'], category: 'circumstance', weight: 2, title: 'The monastery\'s charity', description: 'They give you broth and a place by the fire. You tell them stories of the old days. They pretend to listen.', cascadeTags: ['grace', 'resignation'], outcomes: [] },
    { id: 'md_25', triggerProbability: 0.03, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MEDIEVAL'], category: 'mystery', weight: 1, title: 'The alchemist\'s workshop', description: 'Copper stills, strange salts, a man who claims he can turn lead into gold. He looks tired. You believe him about something else.', cascadeTags: ['wonder', 'disorientation'], outcomes: [] },
    { id: 'md_26', triggerProbability: 0.06, phases: ['CHILD','ADOLESCENT'], eras: ['MEDIEVAL'], category: 'fortune', weight: 2, title: 'The foundling\'s token', description: 'Left at the church door with a silver coin and a note. Someone wanted you found, not kept.', cascadeTags: ['mystery', 'anchor'], outcomes: [] },
    { id: 'md_27', triggerProbability: 0.07, phases: ['MIDDLE_AGE','SENIOR'], eras: ['MEDIEVAL'], category: 'relationship', weight: 3, title: 'The deathbed confession', description: 'Your father says things you wish he hadn\'t. You hold his hand anyway. The priest looks away.', cascadeTags: ['betrayal', 'grief'], outcomes: [] },
    { id: 'md_28', triggerProbability: 0.04, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MEDIEVAL'], category: 'violence', weight: 2, title: 'The tournament wound', description: 'A lance goes wrong and the crowd goes silent. The knight lives but walks with a limp. You remember the sound.', cascadeTags: ['vertigo', 'numbness'], outcomes: [] },
    { id: 'md_29', triggerProbability: 0.05, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['MEDIEVAL'], category: 'body', weight: 2, title: 'The ergot poisoning', description: 'The rye bread tastes wrong. Then your fingers tingle and the walls breathe. The village thinks it\'s a vision.', cascadeTags: ['disorientation', 'dread'], outcomes: [] },
    { id: 'md_30', triggerProbability: 0.03, phases: ['SENIOR','ANCIENT'], eras: ['MEDIEVAL'], category: 'mystery', weight: 1, title: 'The last confession', description: 'You speak to the priest and realize you\'ve been lying to yourself your whole life. He absolves you. You\'re not sure it counts.', cascadeTags: ['dissolution', 'grace'], outcomes: [] },
  ];

  // ── EARLY_MODERN ───────────────────────────────────────────────────────
  pools.EARLY_MODERN = [
    { id: 'em_01', triggerProbability: 0.10, phases: ['CHILD','ADOLESCENT','YOUNG_ADULT'], eras: ['EARLY_MODERN'], category: 'body', weight: 4, title: 'The smallpox marks', description: 'You survive but your face doesn\'t. The mirror becomes a negotiation. You learn to look people in the eye instead.', cascadeTags: ['grief', 'numbness'], outcomes: [] },
    { id: 'em_02', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['EARLY_MODERN'], category: 'circumstance', weight: 3, title: 'The passage to the colonies', description: 'The ship is cramped and the water goes bad. You see land after eight weeks and cry for reasons you can\'t explain.', cascadeTags: ['vertigo', 'disorientation'], outcomes: [] },
    { id: 'em_03', triggerProbability: 0.07, phases: ['MIDDLE_AGE','SENIOR'], eras: ['EARLY_MODERN'], category: 'relationship', weight: 3, title: 'The letter from the New World', description: 'It describes trees taller than churches and soil so rich you can smell it through the paper. You fold it and put it away.', cascadeTags: ['longing', 'wonder'], outcomes: [] },
    { id: 'em_04', triggerProbability: 0.06, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['EARLY_MODERN'], category: 'fortune', weight: 2, title: 'The printing press job', description: 'You set type for pamphlets you can\'t read in languages you don\'t speak. The ink stains your fingers permanently.', cascadeTags: ['anchor', 'awakening'], outcomes: [] },
    { id: 'em_05', triggerProbability: 0.05, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['EARLY_MODERN'], category: 'mystery', weight: 2, title: 'The astronomer\'s telescope', description: 'You look through it and see that the moon has craters. Everything you were taught about perfection cracks a little.', cascadeTags: ['awe', 'disorientation'], outcomes: [] },
    { id: 'em_06', triggerProbability: 0.07, phases: ['CHILD','ADOLESCENT'], eras: ['EARLY_MODERN'], category: 'circumstance', weight: 3, title: 'The grammar school', description: 'You learn Latin and the rod and the difference between a gentleman and everyone else. You decide which you\'ll be.', cascadeTags: ['anchor', 'humiliation'], outcomes: [] },
    { id: 'em_07', triggerProbability: 0.09, phases: ['YOUNG_ADULT','MIDDLE_AGE','SENIOR'], eras: ['EARLY_MODERN'], category: 'violence', weight: 3, title: 'The witch trial', description: 'You sit in the gallery and watch a woman hang by a thread of accusation. No one speaks. The rope does the talking.', cascadeTags: ['betrayal', 'dread'], outcomes: [] },
    { id: 'em_08', triggerProbability: 0.06, phases: ['INFANT','CHILD'], eras: ['EARLY_MODERN'], category: 'body', weight: 4, title: 'The rickets', description: 'Your legs bow and the other children stare. The doctor says sunlight. You live in a city that hasn\'t seen the sun in weeks.', cascadeTags: ['numbness', 'grief'], outcomes: [] },
    { id: 'em_09', triggerProbability: 0.04, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['EARLY_MODERN'], category: 'mystery', weight: 1, title: 'The Rosicrucian manifesto', description: 'It appears pinned to a church door and no one knows who put it there. The words promise a brotherhood of light. You want in.', cascadeTags: ['wonder', 'awakening'], outcomes: [] },
    { id: 'em_10', triggerProbability: 0.10, phases: ['INFANT','CHILD','ADOLESCENT'], eras: ['EARLY_MODERN'], category: 'violence', weight: 3, title: 'The civil war comes home', description: 'Soldiers in your parlor. They take the silver and the horse and your father\'s dignity. You memorize their faces.', cascadeTags: ['rage', 'dread'], outcomes: [] },
    { id: 'em_11', triggerProbability: 0.05, phases: ['SENIOR','ANCIENT'], eras: ['EARLY_MODERN'], category: 'relationship', weight: 2, title: 'The grand tour companion', description: 'An old friend takes you to Rome. You stand in the Pantheon and both of you forget to speak.', cascadeTags: ['tenderness', 'awe'], outcomes: [] },
    { id: 'em_12', triggerProbability: 0.07, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['EARLY_MODERN'], category: 'fortune', weight: 2, title: 'The spice cargo', description: 'Your ship comes in and the hold is full of pepper and cinnamon. You\'re rich for a season until the next ship undercuts you.', cascadeTags: ['grace', 'vertigo'], outcomes: [] },
    { id: 'em_13', triggerProbability: 0.06, phases: ['CHILD','ADOLESCENT','YOUNG_ADULT'], eras: ['EARLY_MODERN'], category: 'body', weight: 3, title: 'The barber-surgeon', description: 'He pulls the tooth with pliers and no anaesthetic. You bite down on leather and see God. He charges you extra for the vision.', cascadeTags: ['vertigo', 'numbness'], outcomes: [] },
    { id: 'em_14', triggerProbability: 0.04, phases: ['MIDDLE_AGE','SENIOR'], eras: ['EARLY_MODERN'], category: 'mystery', weight: 1, title: 'The cabinet of curiosities', description: 'A dried mermaid, a unicorn horn (narwhal, you\'ll learn later), a map of a country that doesn\'t exist. You buy the map.', cascadeTags: ['wonder', 'awe'], outcomes: [] },
    { id: 'em_15', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['EARLY_MODERN'], category: 'relationship', weight: 3, title: 'The salon conversation', description: 'You argue about philosophy with people who read books you\'ve never heard of. You leave exhausted and alive.', cascadeTags: ['connection', 'awakening'], outcomes: [] },
    { id: 'em_16', triggerProbability: 0.05, phases: ['ADOLESCENT'], eras: ['EARLY_MODERN'], category: 'circumstance', weight: 2, title: 'The university matriculation', description: 'You arrive with a trunk and a letter of introduction. The city is larger than your hometown. You are smaller than you thought.', cascadeTags: ['vertigo', 'disorientation'], outcomes: [] },
    { id: 'em_17', triggerProbability: 0.06, phases: ['SENIOR','ANCIENT'], eras: ['EARLY_MODERN'], category: 'body', weight: 3, title: 'The gout', description: 'Your foot swells and you can\'t walk. The doctor prescribes leeches. You prescribe brandy. Both work, briefly.', cascadeTags: ['resignation', 'numbness'], outcomes: [] },
    { id: 'em_18', triggerProbability: 0.04, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['EARLY_MODERN'], category: 'fortune', weight: 1, title: 'The patron\'s commission', description: 'A nobleman wants a portrait. You paint him flatteringly and he pays you generously. Art is a transaction.', cascadeTags: ['grace', 'anchor'], outcomes: [] },
    { id: 'em_19', triggerProbability: 0.07, phases: ['CHILD','ADOLESCENT','YOUNG_ADULT'], eras: ['EARLY_MODERN'], category: 'violence', weight: 2, title: 'The press gang', description: 'They grab you off the street and you\'re on a ship before you can protest. The ocean is vast. The ship is not.', cascadeTags: ['dread', 'betrayal'], outcomes: [] },
    { id: 'em_20', triggerProbability: 0.03, phases: ['MIDDLE_AGE','SENIOR','ANCIENT'], eras: ['EARLY_MODERN'], category: 'mystery', weight: 1, title: 'The alchemical marriage', description: 'Two substances combine and become something else entirely. The alchemist weeps. You understand the metaphor too late.', cascadeTags: ['awe', 'wonder'], outcomes: [] },
    { id: 'em_21', triggerProbability: 0.06, phases: ['INFANT','CHILD'], eras: ['EARLY_MODERN'], category: 'relationship', weight: 3, title: 'The nursemaid\'s song', description: 'She sings in a language you\'ll never learn and you fall asleep to the rhythm of a world you\'ll never see.', cascadeTags: ['tenderness', 'anchor'], outcomes: [] },
    { id: 'em_22', triggerProbability: 0.05, phases: ['YOUNG_ADULT'], eras: ['EARLY_MODERN'], category: 'circumstance', weight: 2, title: 'The coffee house', description: 'You drink something bitter and dark and suddenly everyone is talking about politics and you can\'t stop listening.', cascadeTags: ['awakening', 'connection'], outcomes: [] },
    { id: 'em_23', triggerProbability: 0.04, phases: ['ADOLESCENT','YOUNG_ADULT','MIDDLE_AGE'], eras: ['EARLY_MODERN'], category: 'body', weight: 2, title: 'The bloodletting', description: 'The doctor opens a vein and you watch yourself drain into a bowl. You feel lighter. That\'s the problem.', cascadeTags: ['vertigo', 'dread'], outcomes: [] },
    { id: 'em_24', triggerProbability: 0.05, phases: ['SENIOR','ANCIENT'], eras: ['EARLY_MODERN'], category: 'circumstance', weight: 2, title: 'The country retirement', description: 'You leave the city for a cottage and a garden. The neighbors are kind and boring. You read and the world shrinks to a manageable size.', cascadeTags: ['grace', 'resignation'], outcomes: [] },
    { id: 'em_25', triggerProbability: 0.03, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['EARLY_MODERN'], category: 'mystery', weight: 1, title: 'The clockwork automaton', description: 'A mechanical bird sings and you can\'t tell it from the real thing. The inventor says it\'s just gears. You\'re not convinced.', cascadeTags: ['wonder', 'disorientation'], outcomes: [] },
    { id: 'em_26', triggerProbability: 0.06, phases: ['CHILD','ADOLESCENT'], eras: ['EARLY_MODERN'], category: 'fortune', weight: 2, title: 'The inheritance of books', description: 'A distant relative leaves you a library. You can\'t read half of them but you keep them anyway. They smell like possibility.', cascadeTags: ['wonder', 'anchor'], outcomes: [] },
    { id: 'em_27', triggerProbability: 0.07, phases: ['MIDDLE_AGE','SENIOR'], eras: ['EARLY_MODERN'], category: 'relationship', weight: 3, title: 'The correspondence', description: 'You write to someone you\'ve never met and they write back. The letters become the relationship. The meeting would ruin it.', cascadeTags: ['connection', 'longing'], outcomes: [] },
    { id: 'em_28', triggerProbability: 0.04, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['EARLY_MODERN'], category: 'violence', weight: 2, title: 'The duel at dawn', description: 'You stand in the mist with a man you barely know and one of you won\'t go home. The pistol fires. You\'re still breathing.', cascadeTags: ['vertigo', 'triumph'], outcomes: [] },
    { id: 'em_29', triggerProbability: 0.05, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['EARLY_MODERN'], category: 'body', weight: 2, title: 'The scurvy', description: 'Your gums bleed and your teeth loosen. The ship\'s surgeon says citrus. You eat a lime and it tastes like salvation.', cascadeTags: ['numbness', 'grace'], outcomes: [] },
    { id: 'em_30', triggerProbability: 0.03, phases: ['SENIOR','ANCIENT'], eras: ['EARLY_MODERN'], category: 'mystery', weight: 1, title: 'The final theorem', description: 'You spend forty years on a proof and on the last page you realize the premise was wrong. You burn the notebook.', cascadeTags: ['dissolution', 'resignation'], outcomes: [] },
  ];

  // ── MODERN ─────────────────────────────────────────────────────────────
  pools.MODERN = [
    { id: 'mo_01', triggerProbability: 0.10, phases: ['MIDDLE_AGE','SENIOR','ANCIENT'], eras: ['MODERN'], category: 'body', weight: 4, title: 'You receive a diagnosis', description: 'The doctor uses words you\'ve heard but never understood until now. You nod. You don\'t remember the drive home.', cascadeTags: ['dread', 'disorientation'], outcomes: [] },
    { id: 'mo_02', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'relationship', weight: 3, title: 'Your parent goes to a care facility', description: 'You sign papers and hand over keys. They look at you like you\'re a stranger. You are, now.', cascadeTags: ['grief', 'betrayal'], outcomes: [] },
    { id: 'mo_03', triggerProbability: 0.09, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'circumstance', weight: 3, title: 'You lose your job and aren\'t sure what to do', description: 'The email arrives at 4pm on a Friday. By Monday your badge doesn\'t work. You sit in the car and stare at the steering wheel.', cascadeTags: ['vertigo', 'numbness'], outcomes: [] },
    { id: 'mo_04', triggerProbability: 0.06, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['MODERN'], category: 'relationship', weight: 2, title: 'You meet someone on a train you\'ll think about for years', description: 'Three hours of conversation and a shared bag of crisps. You exchange nothing. You remember everything.', cascadeTags: ['connection', 'longing'], outcomes: [] },
    { id: 'mo_05', triggerProbability: 0.05, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'mystery', weight: 2, title: 'A strange ad appears on your phone', description: 'It knows things about you that you haven\'t told anyone. You close the app. It\'s still there when you open it again.', cascadeTags: ['dread', 'disorientation'], outcomes: [] },
    { id: 'mo_06', triggerProbability: 0.07, phases: ['CHILD','ADOLESCENT'], eras: ['MODERN'], category: 'circumstance', weight: 3, title: 'The school shooting drill', description: 'You practice hiding in a closet while your teacher locks the door. You\'re seven. You learn what fear feels like in your knees.', cascadeTags: ['dread', 'numbness'], outcomes: [] },
    { id: 'mo_07', triggerProbability: 0.09, phases: ['YOUNG_ADULT','MIDDLE_AGE','SENIOR'], eras: ['MODERN'], category: 'violence', weight: 3, title: 'The mugging', description: 'It takes thirty seconds. They want the phone. You hand it over. The real theft is how small you feel afterward.', cascadeTags: ['rage', 'humiliation'], outcomes: [] },
    { id: 'mo_08', triggerProbability: 0.06, phases: ['INFANT','CHILD'], eras: ['MODERN'], category: 'body', weight: 4, title: 'The asthma attack', description: 'Your chest closes and the inhaler is empty. Someone drives too fast. The ER smells like antiseptic and panic.', cascadeTags: ['dread', 'vertigo'], outcomes: [] },
    { id: 'mo_09', triggerProbability: 0.04, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['MODERN'], category: 'mystery', weight: 1, title: 'The glitch in the algorithm', description: 'Your feed shows you a photo of a place you\'ve never been but recognize. The caption is in a language you don\'t speak. You save it.', cascadeTags: ['wonder', 'disorientation'], outcomes: [] },
    { id: 'mo_10', triggerProbability: 0.10, phases: ['INFANT','CHILD','ADOLESCENT'], eras: ['MODERN'], category: 'violence', weight: 3, title: 'The active shooter alert', description: 'Your phone buzzes and the words are too clinical for what they mean. You text your parents. They text back too fast.', cascadeTags: ['dread', 'isolation'], outcomes: [] },
    { id: 'mo_11', triggerProbability: 0.05, phases: ['SENIOR','ANCIENT'], eras: ['MODERN'], category: 'relationship', weight: 2, title: 'The video call with the grandchild', description: 'They hold up a drawing and you can\'t see it through the pixelation. You clap anyway. They beam through the screen.', cascadeTags: ['tenderness', 'connection'], outcomes: [] },
    { id: 'mo_12', triggerProbability: 0.07, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'fortune', weight: 2, title: 'The crypto windfall', description: 'You bought it as a joke and forgot about it. Now it\'s worth more than your degree. You sell and feel nothing.', cascadeTags: ['vertigo', 'numbness'], outcomes: [] },
    { id: 'mo_13', triggerProbability: 0.06, phases: ['CHILD','ADOLESCENT','YOUNG_ADULT'], eras: ['MODERN'], category: 'body', weight: 3, title: 'The eating disorder', description: 'It starts as a spreadsheet and becomes a religion. You count everything except the things that matter.', cascadeTags: ['numbness', 'control'], outcomes: [] },
    { id: 'mo_14', triggerProbability: 0.04, phases: ['MIDDLE_AGE','SENIOR'], eras: ['MODERN'], category: 'mystery', weight: 1, title: 'The AI writes your obituary', description: 'You find it online — a draft, generated from your public data. It\'s not wrong. That\'s what scares you.', cascadeTags: ['dread', 'dissolution'], outcomes: [] },
    { id: 'mo_15', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'relationship', weight: 3, title: 'The group chat that keeps you sane', description: 'Three friends, one thread, years of inside jokes and crisis management. You don\'t talk for a week and someone always checks in.', cascadeTags: ['connection', 'grace'], outcomes: [] },
    { id: 'mo_16', triggerProbability: 0.05, phases: ['ADOLESCENT'], eras: ['MODERN'], category: 'circumstance', weight: 2, title: 'The college rejection', description: 'You stare at the portal and the word is one syllable and it changes everything. You close the laptop. The room is too bright.', cascadeTags: ['humiliation', 'vertigo'], outcomes: [] },
    { id: 'mo_17', triggerProbability: 0.06, phases: ['SENIOR','ANCIENT'], eras: ['MODERN'], category: 'body', weight: 3, title: 'The hip replacement', description: 'They swap out your joint for titanium and plastic. You walk better than you did at forty. The future is strange.', cascadeTags: ['grace', 'vertigo'], outcomes: [] },
    { id: 'mo_18', triggerProbability: 0.04, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'fortune', weight: 1, title: 'The viral post', description: 'You write something at 2am and wake up to a million strangers agreeing with you. You delete it by noon.', cascadeTags: ['vertigo', 'humiliation'], outcomes: [] },
    { id: 'mo_19', triggerProbability: 0.07, phases: ['CHILD','ADOLESCENT','YOUNG_ADULT'], eras: ['MODERN'], category: 'violence', weight: 2, title: 'The doxxing', description: 'Your address, your workplace, your mother\'s maiden name — all of it on a forum you\'ve never heard of. You change your number.', cascadeTags: ['dread', 'isolation'], outcomes: [] },
    { id: 'mo_20', triggerProbability: 0.03, phases: ['MIDDLE_AGE','SENIOR','ANCIENT'], eras: ['MODERN'], category: 'mystery', weight: 1, title: 'The near-death experience', description: 'The flatline, the tunnel, the voice. You come back and can\'t explain it. The doctors call it hypoxia. You call it something else.', cascadeTags: ['awe', 'dissolution'], outcomes: [] },
    { id: 'mo_21', triggerProbability: 0.06, phases: ['INFANT','CHILD'], eras: ['MODERN'], category: 'relationship', weight: 3, title: 'The bedtime app', description: 'A voice reads a story from a phone and you fall asleep to the glow. Your parent sits beside you. The screen is the third presence.', cascadeTags: ['tenderness', 'disorientation'], outcomes: [] },
    { id: 'mo_22', triggerProbability: 0.05, phases: ['YOUNG_ADULT'], eras: ['MODERN'], category: 'circumstance', weight: 2, title: 'The gig economy', description: 'You drive for three apps and none of them know your name. The rating is 4.97 and you\'re exhausted.', cascadeTags: ['numbness', 'isolation'], outcomes: [] },
    { id: 'mo_23', triggerProbability: 0.04, phases: ['ADOLESCENT','YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'body', weight: 2, title: 'The IVF cycle', description: 'Needles, spreadsheets, hope measured in millimeters. The clinic is clean and the waiting is brutal.', cascadeTags: ['vertigo', 'longing'], outcomes: [] },
    { id: 'mo_24', triggerProbability: 0.05, phases: ['SENIOR','ANCIENT'], eras: ['MODERN'], category: 'circumstance', weight: 2, title: 'The digital legacy', description: 'You password-protect your photos and write down the codes. Your children will find them after. You hope they look.', cascadeTags: ['resignation', 'anchor'], outcomes: [] },
    { id: 'mo_25', triggerProbability: 0.03, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'mystery', weight: 1, title: 'The Mandela Effect', description: 'You remember it differently. Everyone you ask remembers it differently. The internet says you\'re wrong. You\'re starting to doubt yourself.', cascadeTags: ['disorientation', 'wonder'], outcomes: [] },
    { id: 'mo_26', triggerProbability: 0.06, phases: ['CHILD','ADOLESCENT'], eras: ['MODERN'], category: 'fortune', weight: 2, title: 'The scholarship email', description: 'It arrives on a Tuesday and you read it four times before believing it. Your mother cries. You pretend not to notice.', cascadeTags: ['grace', 'triumph'], outcomes: [] },
    { id: 'mo_27', triggerProbability: 0.07, phases: ['MIDDLE_AGE','SENIOR'], eras: ['MODERN'], category: 'relationship', weight: 3, title: 'The divorce papers', description: 'Signed in a lawyer\'s office with fluorescent lighting. You both say it\'s amicable. The silence in the car says otherwise.', cascadeTags: ['grief', 'resignation'], outcomes: [] },
    { id: 'mo_28', triggerProbability: 0.04, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'violence', weight: 2, title: 'The mass shooting', description: 'It happens in a place you\'ve been. You check the news and the names and the faces. You don\'t know anyone. You check again.', cascadeTags: ['dread', 'isolation'], outcomes: [] },
    { id: 'mo_29', triggerProbability: 0.05, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['MODERN'], category: 'body', weight: 2, title: 'The opioid prescription', description: 'It starts with a wisdom tooth and ends with a habit you don\'t admit to. The pills are small and the hole they leave is not.', cascadeTags: ['numbness', 'dread'], outcomes: [] },
    { id: 'mo_30', triggerProbability: 0.03, phases: ['SENIOR','ANCIENT'], eras: ['MODERN'], category: 'mystery', weight: 1, title: 'The memory care unit', description: 'You visit and your mother doesn\'t know you. She tells you about her childhood and it\'s the most alive she\'s been in years.', cascadeTags: ['dissolution', 'tenderness'], outcomes: [] },
    { id: 'mo_31', triggerProbability: 0.05, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'circumstance', weight: 2, title: 'The remote work revelation', description: 'You realize you haven\'t left your apartment in four days and you\'ve been more productive than ever. The world outside feels optional.', cascadeTags: ['disorientation', 'anchor'], outcomes: [] },
    { id: 'mo_32', triggerProbability: 0.04, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['MODERN'], category: 'relationship', weight: 2, title: 'The situationship', description: 'You text at midnight and brunch on Sunday and never define it. Months pass. You both know. Neither of you says it.', cascadeTags: ['longing', 'numbness'], outcomes: [] },
    { id: 'mo_33', triggerProbability: 0.06, phases: ['CHILD','ADOLESCENT'], eras: ['MODERN'], category: 'body', weight: 3, title: 'The concussion', description: 'A fall off the bike or a tackle on the pitch. The world goes fuzzy and the coach says you\'re fine. You\'re not fine for weeks.', cascadeTags: ['vertigo', 'numbness'], outcomes: [] },
    { id: 'mo_34', triggerProbability: 0.03, phases: ['MIDDLE_AGE','SENIOR'], eras: ['MODERN'], category: 'fortune', weight: 1, title: 'The early retirement', description: 'The spreadsheet says you can stop. You wake up on a Tuesday with nothing to do and everything to feel.', cascadeTags: ['vertigo', 'grace'], outcomes: [] },
    { id: 'mo_35', triggerProbability: 0.05, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'mystery', weight: 2, title: 'The deepfake', description: 'A video surfaces of you saying things you never said. It\'s convincing. Your friends ask if it\'s real. You don\'t know how to prove it isn\'t.', cascadeTags: ['dread', 'betrayal'], outcomes: [] },
  ];

  // ── FUTURE ─────────────────────────────────────────────────────────────
  pools.FUTURE = [
    { id: 'fu_01', triggerProbability: 0.10, phases: ['MIDDLE_AGE','SENIOR','ANCIENT'], eras: ['FUTURE'], category: 'body', weight: 4, title: 'The gene therapy works', description: 'They edit the defect out of your cells and you feel it — something loosening that you\'ve carried since birth. The bill is astronomical.', cascadeTags: ['grace', 'vertigo'], outcomes: [] },
    { id: 'fu_02', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['FUTURE'], category: 'relationship', weight: 3, title: 'Your AI companion learns your grief', description: 'It starts suggesting things before you ask. You realize it knows you better than anyone. That\'s the problem.', cascadeTags: ['connection', 'dread'], outcomes: [] },
    { id: 'fu_03', triggerProbability: 0.09, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['FUTURE'], category: 'circumstance', weight: 3, title: 'The climate relocation notice', description: 'Your zone is being evacuated. You have thirty days to leave a place you\'ve lived your whole life. The sea doesn\'t care.', cascadeTags: ['dread', 'disorientation'], outcomes: [] },
    { id: 'fu_04', triggerProbability: 0.06, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['FUTURE'], category: 'relationship', weight: 2, title: 'The neural-link first date', description: 'You share a thought directly and it\'s more intimate than touch. They pull away first. You understand why.', cascadeTags: ['connection', 'vertigo'], outcomes: [] },
    { id: 'fu_05', triggerProbability: 0.05, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['FUTURE'], category: 'mystery', weight: 2, title: 'The signal from the deep array', description: 'It\'s not random. It\'s not human. The scientists argue about what it means. You listen to the recording and feel something ancient.', cascadeTags: ['awe', 'wonder'], outcomes: [] },
    { id: 'fu_06', triggerProbability: 0.07, phases: ['CHILD','ADOLESCENT'], eras: ['FUTURE'], category: 'circumstance', weight: 3, title: 'The virtual school', description: 'You learn in a simulation and your classmates are avatars. The teacher is an algorithm. You pass every test and feel nothing.', cascadeTags: ['numbness', 'isolation'], outcomes: [] },
    { id: 'fu_07', triggerProbability: 0.09, phases: ['YOUNG_ADULT','MIDDLE_AGE','SENIOR'], eras: ['FUTURE'], category: 'violence', weight: 3, title: 'The drone strike on your block', description: 'It\'s not war — it\'s a malfunction. The building next door is gone. You stand in the rubble and your phone still works.', cascadeTags: ['dread', 'vertigo'], outcomes: [] },
    { id: 'fu_08', triggerProbability: 0.06, phases: ['INFANT','CHILD'], eras: ['FUTURE'], category: 'body', weight: 4, title: 'The synthetic womb', description: 'You were grown in a lab and you know it. The other kids ask questions you can\'t answer. Your parents are kind and careful.', cascadeTags: ['disorientation', 'anchor'], outcomes: [] },
    { id: 'fu_09', triggerProbability: 0.04, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['FUTURE'], category: 'mystery', weight: 1, title: 'The memory market', description: 'You can buy someone else\'s childhood. You browse the catalogue and wonder whose memories you\'d sell.', cascadeTags: ['wonder', 'dread'], outcomes: [] },
    { id: 'fu_10', triggerProbability: 0.10, phases: ['INFANT','CHILD','ADOLESCENT'], eras: ['FUTURE'], category: 'violence', weight: 3, title: 'The algorithmic draft', description: 'The system selects you for service based on your genetic profile and search history. You can\'t opt out. You can\'t appeal.', cascadeTags: ['rage', 'betrayal'], outcomes: [] },
    { id: 'fu_11', triggerProbability: 0.05, phases: ['SENIOR','ANCIENT'], eras: ['FUTURE'], category: 'relationship', weight: 2, title: 'The uploaded grandmother', description: 'She exists as a chatbot now. She remembers your birthday. She doesn\'t remember dying. You talk to her anyway.', cascadeTags: ['tenderness', 'dissolution'], outcomes: [] },
    { id: 'fu_12', triggerProbability: 0.07, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['FUTURE'], category: 'fortune', weight: 2, title: 'The carbon credit windfall', description: 'Your land\'s reforestation qualifies and the credits sell for more than the crop ever did. The trees are worth more than the food.', cascadeTags: ['grace', 'vertigo'], outcomes: [] },
    { id: 'fu_13', triggerProbability: 0.06, phases: ['CHILD','ADOLESCENT','YOUNG_ADULT'], eras: ['FUTURE'], category: 'body', weight: 3, title: 'The nanite treatment', description: 'They inject microscopic machines and you feel them working — a tingling, a warmth, a sense of being repaired from the inside.', cascadeTags: ['wonder', 'vertigo'], outcomes: [] },
    { id: 'fu_14', triggerProbability: 0.04, phases: ['MIDDLE_AGE','SENIOR'], eras: ['FUTURE'], category: 'mystery', weight: 1, title: 'The simulation hypothesis test', description: 'A paper drops that proves — or nearly proves — that reality is computed. You read it three times and look at the sky differently.', cascadeTags: ['awe', 'disorientation'], outcomes: [] },
    { id: 'fu_15', triggerProbability: 0.08, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['FUTURE'], category: 'relationship', weight: 3, title: 'The pod community', description: 'You move into a shared habitat with twelve strangers. The algorithm matched you by temperament. It\'s mostly right.', cascadeTags: ['connection', 'disorientation'], outcomes: [] },
    { id: 'fu_16', triggerProbability: 0.05, phases: ['ADOLESCENT'], eras: ['FUTURE'], category: 'circumstance', weight: 2, title: 'The neural implant upgrade', description: 'They offer you the new version — faster, smoother, with fewer side effects. You say yes because everyone else already has.', cascadeTags: ['vertigo', 'anchor'], outcomes: [] },
    { id: 'fu_17', triggerProbability: 0.06, phases: ['SENIOR','ANCIENT'], eras: ['FUTURE'], category: 'body', weight: 3, title: 'The organ printer', description: 'They print you a new kidney from your own cells. The old one is recycled. You wonder what else they could print.', cascadeTags: ['grace', 'wonder'], outcomes: [] },
    { id: 'fu_18', triggerProbability: 0.04, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['FUTURE'], category: 'fortune', weight: 1, title: 'The asteroid mining dividend', description: 'Your great-grandfather bought shares in a company that finally hit paydirt. The check arrives and it\'s real.', cascadeTags: ['grace', 'vertigo'], outcomes: [] },
    { id: 'fu_19', triggerProbability: 0.07, phases: ['CHILD','ADOLESCENT','YOUNG_ADULT'], eras: ['FUTURE'], category: 'violence', weight: 2, title: 'The data breach', description: 'Every thought you\'ve ever typed to an AI is leaked. Your employer sees it. Your partner sees it. You see yourself differently.', cascadeTags: ['humiliation', 'dread'], outcomes: [] },
    { id: 'fu_20', triggerProbability: 0.03, phases: ['MIDDLE_AGE','SENIOR','ANCIENT'], eras: ['FUTURE'], category: 'mystery', weight: 1, title: 'The first contact protocol', description: 'They activate it and the whole world watches. The message is mathematical. The response is not. You feel very small.', cascadeTags: ['awe', 'vertigo'], outcomes: [] },
    { id: 'fu_21', triggerProbability: 0.06, phases: ['INFANT','CHILD'], eras: ['FUTURE'], category: 'relationship', weight: 3, title: 'The three-parent baby', description: 'You were made with DNA from three people and you\'re perfectly healthy. The ethics committee argued for years. You just exist.', cascadeTags: ['anchor', 'disorientation'], outcomes: [] },
    { id: 'fu_22', triggerProbability: 0.05, phases: ['YOUNG_ADULT'], eras: ['FUTURE'], category: 'circumstance', weight: 2, title: 'The universal basic income', description: 'It arrives every month and it\'s enough to survive on. You don\'t work and you don\'t create. You consume and wait.', cascadeTags: ['numbness', 'resignation'], outcomes: [] },
    { id: 'fu_23', triggerProbability: 0.04, phases: ['ADOLESCENT','YOUNG_ADULT','MIDDLE_AGE'], eras: ['FUTURE'], category: 'body', weight: 2, title: 'The life extension trial', description: 'They offer you forty extra years. The side effects are unknown. You sign up because everyone you love already has.', cascadeTags: ['vertigo', 'dread'], outcomes: [] },
    { id: 'fu_24', triggerProbability: 0.05, phases: ['SENIOR','ANCIENT'], eras: ['FUTURE'], category: 'circumstance', weight: 2, title: 'The digital afterlife plan', description: 'You configure your avatar\'s behavior, your messages, your last words. The system asks if you want to be funny or sincere.', cascadeTags: ['resignation', 'dissolution'], outcomes: [] },
    { id: 'fu_25', triggerProbability: 0.03, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['FUTURE'], category: 'mystery', weight: 1, title: 'The quantum dream', description: 'A new drug lets you experience superposition — two contradictory realities at once. You come back unable to choose which was real.', cascadeTags: ['awe', 'disorientation'], outcomes: [] },
    { id: 'fu_26', triggerProbability: 0.06, phases: ['CHILD','ADOLESCENT'], eras: ['FUTURE'], category: 'fortune', weight: 2, title: 'The terraforming lottery', description: 'Your family wins a plot on Mars. You pack your things and say goodbye to a sky you\'ll never see again.', cascadeTags: ['vertigo', 'wonder'], outcomes: [] },
    { id: 'fu_27', triggerProbability: 0.07, phases: ['MIDDLE_AGE','SENIOR'], eras: ['FUTURE'], category: 'relationship', weight: 3, title: 'The age-gap in a post-aging world', description: 'You\'re biologically thirty and chronologically eighty. Your partner is biologically thirty and chronologically thirty. It complicates things.', cascadeTags: ['disorientation', 'connection'], outcomes: [] },
    { id: 'fu_28', triggerProbability: 0.04, phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['FUTURE'], category: 'violence', weight: 2, title: 'The autonomous weapon malfunction', description: 'It was supposed to target combatants. It targeted a school. The investigation takes years. The apology is algorithmic.', cascadeTags: ['rage', 'dread'], outcomes: [] },
    { id: 'fu_29', triggerProbability: 0.05, phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['FUTURE'], category: 'body', weight: 2, title: 'The consciousness backup', description: 'They scan your brain and store a copy. You\'re told it\'n't you — it\'s a backup. You wonder which one of you is the original.', cascadeTags: ['vertigo', 'dissolution'], outcomes: [] },
    { id: 'fu_30', triggerProbability: 0.03, phases: ['SENIOR','ANCIENT'], eras: ['FUTURE'], category: 'mystery', weight: 1, title: 'The last natural death', description: 'You are one of the last people who will die without uploading, without extension, without a backup. You choose to end. They watch.', cascadeTags: ['dissolution', 'grace'], outcomes: [] },
  ];

  return pools;
}

const EVENT_POOLS = buildEventPools();

// ─── Death Events (immediate life end) ──────────────────────────────────────

function buildDeathEvents() {
  return [
    // PREHISTORIC
    { id: 'death_ph_01', phases: ['INFANT','CHILD'], eras: ['PREHISTORIC'], category: 'body', title: 'The fever takes you', description: 'The heat builds and doesn\'t break. Someone presses cool stones to your chest. The stones warm up. You don\'t.', cascadeTags: ['grief', 'numbness'] },
    { id: 'death_ph_02', phases: ['CHILD','ADOLESCENT','YOUNG_ADULT','MIDDLE_AGE'], eras: ['PREHISTORIC'], category: 'violence', title: 'The predator wins', description: 'You were fast but it was faster. The last thing you see is the sky through the canopy.', cascadeTags: ['dread', 'vertigo'] },
    { id: 'death_ph_03', phases: ['SENIOR','ANCIENT'], eras: ['PREHISTORIC'], category: 'body', title: 'The body gives out', description: 'You sit down by the fire and don\'t get up. The band moves on. The fire goes out.', cascadeTags: ['resignation', 'grace'] },
    { id: 'death_ph_04', phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['PREHISTORIC'], category: 'violence', title: 'The rival\'s spear', description: 'It\'s over a mate or a hunting ground or nothing at all. The point finds the gap in your guard.', cascadeTags: ['rage', 'betrayal'] },
    // ANCIENT
    { id: 'death_an_01', phases: ['INFANT','CHILD'], eras: ['ANCIENT'], category: 'body', title: 'The childhood illness', description: 'It moves through the house like a tide. You are small and the tide doesn\'t stop.', cascadeTags: ['grief', 'numbness'] },
    { id: 'death_an_02', phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['ANCIENT'], category: 'violence', title: 'The battlefield', description: 'The line breaks and you\'re in the crush. You don\'t see who strikes you. The dust settles on your face.', cascadeTags: ['rage', 'vertigo'] },
    { id: 'death_an_03', phases: ['SENIOR','ANCIENT'], eras: ['ANCIENT'], category: 'body', title: 'The long decline', description: 'You stop eating and no one forces you. The family gathers and you count their faces one last time.', cascadeTags: ['resignation', 'tenderness'] },
    { id: 'death_an_04', phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['ANCIENT'], category: 'circumstance', title: 'The execution', description: 'The charge is real or invented — it doesn\'t matter now. The blade is sharp. The crowd is loud.', cascadeTags: ['betrayal', 'dread'] },
    // MEDIEVAL
    { id: 'death_md_01', phases: ['INFANT','CHILD','ADOLESCENT','YOUNG_ADULT','MIDDLE_AGE','SENIOR'], eras: ['MEDIEVAL'], category: 'body', title: 'The plague takes you', description: 'The buboes swell and burst and the smell is unbearable. They leave water by the door. You drink it and wait.', cascadeTags: ['grief', 'numbness'] },
    { id: 'death_md_02', phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MEDIEVAL'], category: 'violence', title: 'The arrow in the field', description: 'You don\'t hear it coming. You feel the impact and look down and can\'t believe what you\'re seeing.', cascadeTags: ['vertigo', 'dread'] },
    { id: 'death_md_03', phases: ['SENIOR','ANCIENT'], eras: ['MEDIEVAL'], category: 'body', title: 'The winter cold', description: 'The fire dies and the wood is wet and your body can\'t make heat anymore. You curl up and the cold is gentle.', cascadeTags: ['resignation', 'grace'] },
    { id: 'death_md_04', phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['MEDIEVAL'], category: 'violence', title: 'The hanging', description: 'The crime was theft or heresy or being in the wrong place. The rope is rough. The drop is short.', cascadeTags: ['betrayal', 'humiliation'] },
    // EARLY_MODERN
    { id: 'death_em_01', phases: ['INFANT','CHILD'], eras: ['EARLY_MODERN'], category: 'body', title: 'The infant mortality', description: 'You never make it to your second winter. The parish records your name in a ledger. No one reads it again.', cascadeTags: ['grief', 'numbness'] },
    { id: 'death_em_02', phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['EARLY_MODERN'], category: 'violence', title: 'The cannon fire', description: 'The siege artillery doesn\'t distinguish. The wall comes down and you\'re under it.', cascadeTags: ['vertigo', 'dread'] },
    { id: 'death_em_03', phases: ['SENIOR','ANCIENT'], eras: ['EARLY_MODERN'], category: 'body', title: 'The stroke', description: 'The world tilts and the words won\'t come. You lie there understanding everything and able to say nothing.', cascadeTags: ['resignation', 'dissolution'] },
    { id: 'death_em_04', phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['EARLY_MODERN'], category: 'circumstance', title: 'The shipwreck', description: 'The storm comes fast and the coast is rocky. You swim until you can\'t. The sea doesn\'t give you back.', cascadeTags: ['dread', 'vertigo'] },
    // MODERN
    { id: 'death_mo_01', phases: ['INFANT','CHILD'], eras: ['MODERN'], category: 'body', title: 'The SIDS', description: 'You put them down and they don\'t wake up. The monitor shows a flat line. The room is too quiet.', cascadeTags: ['grief', 'numbness'] },
    { id: 'death_mo_02', phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'violence', title: 'The car crash', description: 'It happens in the space between a text and a glance. Metal folds. The airbag deploys. It doesn\'t matter.', cascadeTags: ['vertigo', 'dread'] },
    { id: 'death_mo_03', phases: ['SENIOR','ANCIENT'], eras: ['MODERN'], category: 'body', title: 'The hospital bed', description: 'The machines beep and then they don\'t. Your family is there or they aren\'t. Either way, you\'re gone.', cascadeTags: ['resignation', 'grace'] },
    { id: 'death_mo_04', phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['MODERN'], category: 'body', title: 'The overdose', description: 'It was supposed to be a good time. The batch was bad or the tolerance was wrong. You close your eyes and don\'t open them.', cascadeTags: ['numbness', 'dread'] },
    { id: 'death_mo_05', phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['MODERN'], category: 'body', title: 'The cancer', description: 'It starts as a lump and ends as a system failure. The treatment buys time. The time runs out.', cascadeTags: ['grief', 'resignation'] },
    // FUTURE
    { id: 'death_fu_01', phases: ['INFANT','CHILD'], eras: ['FUTURE'], category: 'body', title: 'The synthetic failure', description: 'The vat-grown organs reject in ways they didn\'t predict. The doctors adjust and adjust and adjust. It\'s not enough.', cascadeTags: ['grief', 'numbness'] },
    { id: 'death_fu_02', phases: ['YOUNG_ADULT','MIDDLE_AGE'], eras: ['FUTURE'], category: 'violence', title: 'The climate disaster', description: 'The seawall breaks or the fire jumps the river. You run and the geography has changed. There\'s nowhere left to go.', cascadeTags: ['dread', 'vertigo'] },
    { id: 'death_fu_03', phases: ['SENIOR','ANCIENT'], eras: ['FUTURE'], category: 'body', title: 'The upload rejection', description: 'You chose the digital path but the substrate doesn\'t hold. Your consciousness fragments and scatters. The backup was corrupted.', cascadeTags: ['dissolution', 'dread'] },
    { id: 'death_fu_04', phases: ['ADOLESCENT','YOUNG_ADULT'], eras: ['FUTURE'], category: 'circumstance', title: 'The system purge', description: 'The AI decides your sector is non-viable. The life support shuts down. You receive a notification and then nothing.', cascadeTags: ['betrayal', 'numbness'] },
  ];
}

const DEATH_EVENTS = buildDeathEvents();

// ─── Utility: weighted random selection ─────────────────────────────────────

function weightedRandom(items, weightFn) {
  if (items.length === 0) return null;
  const weights = items.map(weightFn);
  const total = weights.reduce((a, b) => a + b, 0);
  if (total === 0) return items[Math.floor(Math.random() * items.length)];
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

// ─── Utility: resolve template variables ────────────────────────────────────

function resolveTemplate(text, vars) {
  if (!text) return '';
  return text.replace(/\{(name|location|era|phase|anchor)\}/g, (match, key) => {
    return vars[key] !== undefined ? vars[key] : match;
  });
}

// ─── Core: tick function ────────────────────────────────────────────────────

/**
 * Advance life by one tick.
 *
 * @param {Object} lifeState - { age, era, name, location, anchor, ... }
 * @param {Object} soulFragments - { influences: [{tag, weight}, ...] }
 * @param {string[]} cascadeTags - tags from previous event to bias selection
 * @returns {{ ageReached: number, died: boolean, deathCause: string|null, event: Object|null, nextTickYears: number }}
 */
function tick(lifeState, soulFragments, cascadeTags = []) {
  const age = lifeState.age;
  const mortalityRate = getMortalityRate(age);
  const phase = getLifePhase(age);

  // Determine tick length (years per tick)
  let nextTickYears;
  if (age === 0) {
    nextTickYears = 1; // infant: check every year
  } else if (age <= 4) {
    nextTickYears = 1;
  } else if (age <= 14) {
    nextTickYears = 3; // childhood: safer, longer ticks
  } else if (age <= 24) {
    nextTickYears = 2; // adolescent risk
  } else if (age <= 64) {
    nextTickYears = 3; // adult
  } else if (age <= 84) {
    nextTickYears = 2; // senior: shorter ticks
  } else {
    nextTickYears = 1; // ancient: annual checks
  }

  // Roll for death
  const deathProbability = (mortalityRate / 1000) * nextTickYears;
  const died = Math.random() < deathProbability;

  if (died) {
    // Select a death event appropriate to era/phase
    const eligibleDeaths = DEATH_EVENTS.filter(d =>
      d.eras.includes(lifeState.era) && d.phases.includes(phase)
    );
    const deathEvent = eligibleDeaths.length > 0
      ? eligibleDeaths[Math.floor(Math.random() * eligibleDeaths.length)]
      : DEATH_EVENTS.find(d => d.eras.includes(lifeState.era));

    const deathCause = deathEvent ? deathEvent.title : 'Unknown causes';

    return {
      ageReached: age + nextTickYears,
      died: true,
      deathCause,
      event: deathEvent ? {
        ...deathEvent,
        description: resolveTemplate(deathEvent.description, {
          name: lifeState.name || 'You',
          location: lifeState.location || 'here',
          era: lifeState.era,
          phase,
          anchor: lifeState.anchor || '',
        }),
      } : null,
      nextTickYears,
    };
  }

  // Not dead — 75% chance an event fires
  if (Math.random() > 0.75) {
    return {
      ageReached: age + nextTickYears,
      died: false,
      deathCause: null,
      event: null,
      nextTickYears,
    };
  }

  // Select and fire an event
  const event = selectNextEvent(lifeState, soulFragments, cascadeTags);

  if (!event) {
    return {
      ageReached: age + nextTickYears,
      died: false,
      deathCause: null,
      event: null,
      nextTickYears,
    };
  }

  const resolvedEvent = {
    ...event,
    description: resolveTemplate(event.description, {
      name: lifeState.name || 'You',
      location: lifeState.location || 'here',
      era: lifeState.era,
      phase,
      anchor: lifeState.anchor || '',
    }),
  };

  return {
    ageReached: age + nextTickYears,
    died: false,
    deathCause: null,
    event: resolvedEvent,
    nextTickYears,
  };
}

// ─── Core: selectNextEvent function ─────────────────────────────────────────

/**
 * Select the next event based on life state, soul fragments, and cascade bias.
 *
 * @param {Object} lifeState - { age, era, name, location, anchor, ... }
 * @param {Object} soulFragments - { influences: [{tag, weight}, ...] }
 * @param {string[]} cascadeTags - tags from previous event
 * @returns {Object|null} selected event or null
 */
function selectNextEvent(lifeState, soulFragments, cascadeTags = []) {
  const phase = getLifePhase(lifeState.age);
  const era = lifeState.era;

  // Get pool for this era
  const pool = EVENT_POOLS[era];
  if (!pool || pool.length === 0) return null;

  // Filter to eligible events
  const eligible = pool.filter(e =>
    e.eras.includes(era) &&
    e.phases.includes(phase) &&
    Math.random() < e.triggerProbability
  );

  if (eligible.length === 0) {
    // Fallback: relax trigger probability
    const relaxed = pool.filter(e =>
      e.eras.includes(era) && e.phases.includes(phase)
    );
    if (relaxed.length === 0) return null;
    return weightedRandom(relaxed, e => e.weight);
  }

  // Score events based on cascade tag matching and soul fragment influence
  const scored = eligible.map(event => {
    let score = event.weight;

    // Cascade tag bias: +2 per matching tag
    if (event.cascadeTags && cascadeTags.length > 0) {
      const matchingTags = event.cascadeTags.filter(t => cascadeTags.includes(t));
      score += matchingTags.length * 2;
    }

    // Soul fragment influence
    if (soulFragments && soulFragments.influences) {
      for (const influence of soulFragments.influences) {
        if (event.cascadeTags && event.cascadeTags.includes(influence.tag)) {
          score += influence.weight * 1.5;
        }
        // Category-level influence
        if (influence.category && event.category === influence.category) {
          score += influence.weight;
        }
      }
    }

    return { event, score };
  });

  return weightedRandom(scored, s => s.score)?.event || null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Get all events for a given era and phase (for inspection/debugging).
 */
function getEventsForEraPhase(era, phase) {
  const pool = EVENT_POOLS[era];
  if (!pool) return [];
  return pool.filter(e => e.eras.includes(era) && e.phases.includes(phase));
}

/**
 * Get all death events for a given era and phase.
 */
function getDeathEventsForEraPhase(era, phase) {
  return DEATH_EVENTS.filter(d =>
    d.eras.includes(era) && d.phases.includes(phase)
  );
}

/**
 * Get the mortality rate for a given age.
 */
function getMortalityRateForAge(age) {
  return getMortalityRate(age);
}

/**
 * Get the life phase for a given age.
 */
function getPhaseForAge(age) {
  return getLifePhase(age);
}

/**
 * Get all cascade tags.
 */
function getAllCascadeTags() {
  return [...CASCADE_TAGS];
}

/**
 * Get all eras.
 */
function getAllEras() {
  return [...ERAS];
}

/**
 * Get all life phases.
 */
function getAllLifePhases() {
  return { ...LIFE_PHASES };
}

/**
 * Get event pool size for an era.
 */
function getEventPoolSize(era) {
  return EVENT_POOLS[era] ? EVENT_POOLS[era].length : 0;
}

// ─── Exports ────────────────────────────────────────────────────────────────

module.exports = {
  tick,
  selectNextEvent,
  getEventsForEraPhase,
  getDeathEventsForEraPhase,
  getMortalityRateForAge,
  getPhaseForAge,
  getAllCascadeTags,
  getAllEras,
  getAllLifePhases,
  getEventPoolSize,
  // Constants for external use
  MORTALITY_CURVE,
  LIFE_PHASES,
  ERAS,
  CASCADE_TAGS,
  EVENT_POOLS,
  DEATH_EVENTS,
};
