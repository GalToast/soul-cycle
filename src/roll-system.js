/**
 * SOUL-CYCLE Roll System
 * Generates a new life: era, year, location, body attributes, and starting circumstances.
 */

// ─── Era Definitions ─────────────────────────────────────────────────────────

const ERAS = {
  ANCIENT: {
    id: 'ANCIENT',
    label: 'Ancient',
    yearRange: [-3000, 499],
    eventSignature: 'The gods are real here, and they are cruel.',
    locationPool: [
      { region: 'Mesopotamia', city: 'Uruk', country: 'Sumer', weight: 12 },
      { region: 'Mesopotamia', city: 'Babylon', country: 'Babylonia', weight: 10 },
      { region: 'Nile Valley', city: 'Memphis', country: 'Egypt', weight: 14 },
      { region: 'Nile Valley', city: 'Thebes', country: 'Egypt', weight: 11 },
      { region: 'Nile Valley', city: 'Alexandria', country: 'Egypt', weight: 9 },
      { region: 'Indus Valley', city: 'Mohenjo-daro', country: 'Indus Civilization', weight: 8 },
      { region: 'Indus Valley', city: 'Harappa', country: 'Indus Civilization', weight: 7 },
      { region: 'Yellow River', city: 'Anyang', country: 'Shang China', weight: 9 },
      { region: 'Yellow River', city: 'Haojing', country: 'Zhou China', weight: 8 },
      { region: 'Aegean', city: 'Knossos', country: 'Minoan Crete', weight: 7 },
      { region: 'Aegean', city: 'Athens', country: 'Greece', weight: 13 },
      { region: 'Aegean', city: 'Sparta', country: 'Greece', weight: 10 },
      { region: 'Aegean', city: 'Corinth', country: 'Greece', weight: 8 },
      { region: 'Italian Peninsula', city: 'Rome', country: 'Roman Republic/Empire', weight: 15 },
      { region: 'Italian Peninsula', city: 'Pompeii', country: 'Roman Empire', weight: 6 },
      { region: 'Anatolia', city: 'Troy', country: 'Hittite/Luwian', weight: 7 },
      { region: 'Anatolia', city: 'Ephesus', country: 'Greek/Roman', weight: 8 },
      { region: 'Persian Plateau', city: 'Persepolis', country: 'Achaemenid Persia', weight: 9 },
      { region: 'Persian Plateau', city: 'Susa', country: 'Achaemenid Persia', weight: 7 },
      { region: 'Mesoamerica', city: 'San Lorenzo', country: 'Olmec', weight: 6 },
      { region: 'Mesoamerica', city: 'Teotihuacan', country: 'Teotihuacan', weight: 8 },
      { region: 'Andean', city: 'Caral', country: 'Norte Chico', weight: 5 },
      { region: 'British Isles', city: 'Londinium', country: 'Roman Britain', weight: 7 },
      { region: 'British Isles', city: 'Camulodunum', country: 'Celtic Britain', weight: 6 },
      { region: 'Germanic Lands', city: 'Teutoburg', country: 'Germanic Tribes', weight: 5 },
    ],
    firstNamePool: {
      male: [
        { name: 'Gilgamesh', weight: 3 }, { name: 'Enkidu', weight: 2 }, { name: 'Hammurabi', weight: 2 },
        { name: 'Sargon', weight: 2 }, { name: 'Narmer', weight: 2 }, { name: 'Khufu', weight: 3 },
        { name: 'Ramses', weight: 4 }, { name: 'Thutmose', weight: 2 }, { name: 'Akhenaten', weight: 2 },
        { name: 'Tutankhamun', weight: 1 }, { name: 'Ashurbanipal', weight: 2 }, { name: 'Nebuchadnezzar', weight: 3 },
        { name: 'Cyrus', weight: 3 }, { name: 'Darius', weight: 3 }, { name: 'Xerxes', weight: 2 },
        { name: 'Leonidas', weight: 3 }, { name: 'Pericles', weight: 3 }, { name: 'Socrates', weight: 3 },
        { name: 'Plato', weight: 2 }, { name: 'Aristotle', weight: 2 }, { name: 'Alexander', weight: 4 },
        { name: 'Julius', weight: 4 }, { name: 'Augustus', weight: 3 }, { name: 'Marcus', weight: 3 },
        { name: 'Tiberius', weight: 2 }, { name: 'Nero', weight: 2 }, { name: 'Trajan', weight: 2 },
        { name: 'Hadrian', weight: 2 }, { name: 'Constantine', weight: 3 }, { name: 'Hannibal', weight: 3 },
        { name: 'Scipio', weight: 2 }, { name: 'Cicero', weight: 2 }, { name: 'Virgil', weight: 2 },
        { name: 'Sun', weight: 2 }, { name: 'Wu', weight: 2 }, { name: 'Zheng', weight: 2 },
        { name: 'Qin', weight: 2 }, { name: 'Liu', weight: 2 }, { name: 'Ashoka', weight: 3 },
        { name: 'Chandragupta', weight: 2 }, { name: 'Brennus', weight: 1 }, { name: 'Vercingetorix', weight: 2 },
        { name: 'Boudicca', weight: 2 }, { name: 'Alaric', weight: 2 }, { name: 'Attila', weight: 3 },
      ],
      female: [
        { name: 'Nefertiti', weight: 4 }, { name: 'Cleopatra', weight: 4 }, { name: 'Hatshepsut', weight: 3 },
        { name: 'Nefertari', weight: 2 }, { name: 'Isis', weight: 2 }, { name: 'Semiramis', weight: 2 },
        { name: 'Helen', weight: 3 }, { name: 'Penelope', weight: 2 }, { name: 'Andromache', weight: 2 },
        { name: 'Medea', weight: 2 }, { name: 'Athena', weight: 2 }, { name: 'Artemisia', weight: 2 },
        { name: 'Aspasia', weight: 2 }, { name: 'Sappho', weight: 3 }, { name: 'Hypatia', weight: 2 },
        { name: 'Livia', weight: 2 }, { name: 'Agrippina', weight: 2 }, { name: 'Berenice', weight: 2 },
        { name: 'Zenobia', weight: 2 }, { name: 'Boudicca', weight: 3 }, { name: 'Fulvia', weight: 1 },
        { name: 'Octavia', weight: 2 }, { name: 'Cornelia', weight: 2 }, { name: 'Lucretia', weight: 2 },
        { name: 'Dido', weight: 2 }, { name: 'Medb', weight: 1 }, { name: 'Fu', weight: 2 },
        { name: 'Jiang', weight: 1 }, { name: 'Lü', weight: 1 }, { name: 'Wu', weight: 2 },
      ],
    },
    lastNamePool: [
      { name: 'of Uruk', weight: 3 }, { name: 'of Babylon', weight: 3 }, { name: 'of Memphis', weight: 3 },
      { name: 'of Thebes', weight: 3 }, { name: 'of Athens', weight: 4 }, { name: 'of Sparta', weight: 3 },
      { name: 'of Rome', weight: 5 }, { name: 'of Alexandria', weight: 3 }, { name: 'of Persepolis', weight: 2 },
      { name: 'of Troy', weight: 2 }, { name: 'of Carthage', weight: 2 }, { name: 'of Nineveh', weight: 2 },
      { name: 'the Younger', weight: 2 }, { name: 'the Elder', weight: 2 }, { name: 'the Great', weight: 2 },
      { name: 'son of Ra', weight: 1 }, { name: 'beloved of Isis', weight: 1 }, { name: 'chosen of Zeus', weight: 1 },
      { name: 'of the House of Atreus', weight: 1 }, { name: 'of the Julio-Claudians', weight: 1 },
      { name: '', weight: 8 }, // many ancient people had no surname
    ],
    bodyConditions: [
      { condition: 'robust', weight: 15 },
      { condition: 'healthy', weight: 55 },
      { condition: 'sickly', weight: 20 },
      { condition: 'disabled', weight: 10 },
    ],
    socialClasses: [
      { cls: 'slave', weight: 25 },
      { cls: 'peasant', weight: 35 },
      { cls: 'artisan', weight: 12 },
      { cls: 'merchant', weight: 10 },
      { cls: 'soldier', weight: 8 },
      { cls: 'clergy', weight: 5 },
      { cls: 'noble', weight: 4 },
      { cls: 'ruler', weight: 1 },
    ],
  },

  MEDIEVAL: {
    id: 'MEDIEVAL',
    label: 'Medieval',
    yearRange: [500, 1499],
    eventSignature: 'The plague is always somewhere. Faith is the only shield.',
    locationPool: [
      { region: 'British Isles', city: 'London', country: 'England', weight: 12 },
      { region: 'British Isles', city: 'York', country: 'England', weight: 7 },
      { region: 'British Isles', city: 'Edinburgh', country: 'Scotland', weight: 6 },
      { region: 'British Isles', city: 'Dublin', country: 'Ireland', weight: 5 },
      { region: 'Frankish Lands', city: 'Paris', country: 'France', weight: 13 },
      { region: 'Frankish Lands', city: 'Lyon', country: 'France', weight: 6 },
      { region: 'Frankish Lands', city: 'Marseille', country: 'France', weight: 5 },
      { region: 'Germanic Lands', city: 'Cologne', country: 'Holy Roman Empire', weight: 8 },
      { region: 'Germanic Lands', city: 'Prague', country: 'Bohemia', weight: 7 },
      { region: 'Germanic Lands', city: 'Vienna', country: 'Austria', weight: 7 },
      { region: 'Iberian Peninsula', city: 'Córdoba', country: 'Al-Andalus', weight: 10 },
      { region: 'Iberian Peninsula', city: 'Toledo', country: 'Castile', weight: 7 },
      { region: 'Iberian Peninsula', city: 'Barcelona', country: 'Aragon', weight: 7 },
      { region: 'Iberian Peninsula', city: 'Granada', country: 'Nasrid Kingdom', weight: 6 },
      { region: 'Italian Peninsula', city: 'Venice', country: 'Venetian Republic', weight: 11 },
      { region: 'Italian Peninsula', city: 'Florence', country: 'Florentine Republic', weight: 10 },
      { region: 'Italian Peninsula', city: 'Rome', country: 'Papal States', weight: 9 },
      { region: 'Italian Peninsula', city: 'Milan', country: 'Duchy of Milan', weight: 7 },
      { region: 'Italian Peninsula', city: 'Naples', country: 'Kingdom of Naples', weight: 6 },
      { region: 'Scandinavia', city: 'Stockholm', country: 'Sweden', weight: 5 },
      { region: 'Scandinavia', city: 'Oslo', country: 'Norway', weight: 4 },
      { region: 'Scandinavia', city: 'Copenhagen', country: 'Denmark', weight: 5 },
      { region: 'Eastern Europe', city: 'Kraków', country: 'Poland', weight: 7 },
      { region: 'Eastern Europe', city: 'Moscow', country: 'Muscovy', weight: 7 },
      { region: 'Eastern Europe', city: 'Novgorod', country: 'Novgorod Republic', weight: 5 },
      { region: 'Eastern Europe', city: 'Kiev', country: 'Kievan Rus', weight: 6 },
      { region: 'Byzantine', city: 'Constantinople', country: 'Byzantine Empire', weight: 12 },
      { region: 'Byzantine', city: 'Thessalonica', country: 'Byzantine Empire', weight: 5 },
      { region: 'Middle East', city: 'Baghdad', country: 'Abbasid Caliphate', weight: 10 },
      { region: 'Middle East', city: 'Damascus', country: 'Mamluk/Ayyubid', weight: 8 },
      { region: 'Middle East', city: 'Jerusalem', country: 'Crusader/Ayyubid', weight: 7 },
      { region: 'Middle East', city: 'Cairo', country: 'Mamluk Sultanate', weight: 9 },
      { region: 'West Africa', city: 'Timbuktu', country: 'Mali Empire', weight: 6 },
      { region: 'West Africa', city: 'Gao', country: 'Songhai Empire', weight: 5 },
      { region: 'East Africa', city: 'Kilwa', country: 'Swahili Coast', weight: 4 },
      { region: 'South Asia', city: 'Delhi', country: 'Delhi Sultanate', weight: 8 },
      { region: 'South Asia', city: 'Vijayanagara', country: 'Vijayanagara Empire', weight: 6 },
      { region: 'East Asia', city: "Chang'an", country: 'Tang China', weight: 10 },
      { region: 'East Asia', city: 'Kaifeng', country: 'Song China', weight: 8 },
      { region: 'East Asia', city: 'Hangzhou', country: 'Song China', weight: 7 },
      { region: 'East Asia', city: 'Beijing', country: 'Yuan/Ming China', weight: 8 },
      { region: 'East Asia', city: 'Kyoto', country: 'Japan', weight: 8 },
      { region: 'East Asia', city: 'Kamakura', country: 'Japan', weight: 5 },
      { region: 'Southeast Asia', city: 'Angkor', country: 'Khmer Empire', weight: 6 },
      { region: 'Southeast Asia', city: 'Ayutthaya', country: 'Siam', weight: 5 },
      { region: 'Mesoamerica', city: 'Tenochtitlan', country: 'Aztec Empire', weight: 8 },
      { region: 'Mesoamerica', city: 'Chichen Itza', country: 'Maya', weight: 5 },
      { region: 'Andean', city: 'Cusco', country: 'Inca Empire', weight: 7 },
    ],
    firstNamePool: {
      male: [
        { name: 'William', weight: 5 }, { name: 'Richard', weight: 4 }, { name: 'Henry', weight: 5 },
        { name: 'Edward', weight: 4 }, { name: 'John', weight: 5 }, { name: 'Thomas', weight: 4 },
        { name: 'Robert', weight: 5 }, { name: 'Hugh', weight: 3 }, { name: 'Geoffrey', weight: 3 },
        { name: 'Roger', weight: 3 }, { name: 'Philip', weight: 3 }, { name: 'Louis', weight: 4 },
        { name: 'Charles', weight: 4 }, { name: 'Francis', weight: 3 }, { name: 'Peter', weight: 3 },
        { name: 'James', weight: 3 }, { name: 'Michael', weight: 3 }, { name: 'Simon', weight: 2 },
        { name: 'Matthew', weight: 2 }, { name: 'Andrew', weight: 2 }, { name: 'Stephen', weight: 3 },
        { name: 'Arthur', weight: 3 }, { name: 'Gawain', weight: 2 }, { name: 'Lancelot', weight: 2 },
        { name: 'Tristan', weight: 2 }, { name: 'Percival', weight: 1 }, { name: 'Galahad', weight: 1 },
        { name: 'Roland', weight: 2 }, { name: 'Oliver', weight: 2 }, { name: 'Godfrey', weight: 2 },
        { name: 'Baldwin', weight: 2 }, { name: 'Frederick', weight: 3 }, { name: 'Otto', weight: 2 },
        { name: 'Sigurd', weight: 2 }, { name: 'Ragnar', weight: 2 }, { name: 'Leif', weight: 2 },
        { name: 'Harald', weight: 2 }, { name: 'Sven', weight: 2 }, { name: 'Cnut', weight: 2 },
        { name: 'Vlad', weight: 2 }, { name: 'Boris', weight: 2 }, { name: 'Yaroslav', weight: 2 },
        { name: 'Saladin', weight: 3 }, { name: 'Tariq', weight: 2 }, { name: 'Omar', weight: 2 },
        { name: 'Yusuf', weight: 2 }, { name: 'Harun', weight: 2 }, { name: 'Ali', weight: 3 },
        { name: 'Rajendra', weight: 2 }, { name: 'Prithvi', weight: 2 }, { name: 'Ashoka', weight: 2 },
        { name: 'Zhao', weight: 2 }, { name: 'Li', weight: 2 }, { name: 'Wang', weight: 2 },
        { name: 'Yoritomo', weight: 2 }, { name: 'Yoshitsune', weight: 2 }, { name: 'Nobunaga', weight: 2 },
      ],
      female: [
        { name: 'Eleanor', weight: 4 }, { name: 'Isabella', weight: 4 }, { name: 'Margaret', weight: 4 },
        { name: 'Joan', weight: 3 }, { name: 'Matilda', weight: 3 }, { name: 'Catherine', weight: 3 },
        { name: 'Mary', weight: 5 }, { name: 'Anne', weight: 3 }, { name: 'Elizabeth', weight: 3 },
        { name: 'Alice', weight: 3 }, { name: 'Agnes', weight: 2 }, { name: 'Beatrice', weight: 3 },
        { name: 'Clara', weight: 2 }, { name: 'Hildegard', weight: 2 }, { name: 'Juliana', weight: 2 },
        { name: 'Marguerite', weight: 2 }, { name: 'Blanche', weight: 2 }, { name: 'Adela', weight: 2 },
        { name: 'Rosamund', weight: 2 }, { name: 'Guinevere', weight: 2 }, { name: 'Iseult', weight: 2 },
        { name: 'Marian', weight: 2 }, { name: 'Bridget', weight: 2 }, { name: 'Hilda', weight: 2 },
        { name: 'Freya', weight: 2 }, { name: 'Astrid', weight: 2 }, { name: 'Ingrid', weight: 2 },
        { name: 'Fatima', weight: 3 }, { name: 'Aisha', weight: 2 }, { name: 'Zaynab', weight: 2 },
        { name: 'Mariam', weight: 3 }, { name: 'Khadija', weight: 2 }, { name: 'Razia', weight: 2 },
        { name: 'Lakshmi', weight: 2 }, { name: 'Parvati', weight: 2 }, { name: 'Meera', weight: 2 },
        { name: 'Xiu', weight: 2 }, { name: 'Mei', weight: 2 }, { name: 'Lan', weight: 2 },
        { name: 'Tomoe', weight: 2 }, { name: 'Murasaki', weight: 2 }, { name: 'Shizuka', weight: 2 },
      ],
    },
    lastNamePool: [
      { name: 'of York', weight: 3 }, { name: 'of Lancaster', weight: 3 }, { name: 'of Aquitaine', weight: 2 },
      { name: 'of Normandy', weight: 3 }, { name: 'of Anjou', weight: 2 }, { name: 'of Burgundy', weight: 2 },
      { name: 'the Conqueror', weight: 1 }, { name: 'the Lionheart', weight: 1 }, { name: 'the Fair', weight: 2 },
      { name: 'the Bold', weight: 2 }, { name: 'the Pious', weight: 1 }, { name: 'the Wise', weight: 2 },
      { name: 'Smith', weight: 4 }, { name: 'Miller', weight: 3 }, { name: 'Baker', weight: 3 },
      { name: 'Cooper', weight: 2 }, { name: 'Taylor', weight: 3 }, { name: 'Fletcher', weight: 2 },
      { name: 'Carter', weight: 2 }, { name: 'Fisher', weight: 2 }, { name: 'Shepherd', weight: 2 },
      { name: 'Black', weight: 2 }, { name: 'White', weight: 2 }, { name: 'Brown', weight: 2 },
      { name: 'Young', weight: 2 }, { name: 'Long', weight: 1 }, { name: 'Short', weight: 1 },
      { name: 'al-Baghdadi', weight: 2 }, { name: 'al-Andalusi', weight: 2 }, { name: 'ibn Sina', weight: 1 },
      { name: 'ibn Rushd', weight: 1 }, { name: 'al-Khwarizmi', weight: 1 },
      { name: '', weight: 10 },
    ],
    bodyConditions: [
      { condition: 'robust', weight: 12 },
      { condition: 'healthy', weight: 50 },
      { condition: 'sickly', weight: 25 },
      { condition: 'disabled', weight: 13 },
    ],
    socialClasses: [
      { cls: 'serf', weight: 35 },
      { cls: 'peasant', weight: 20 },
      { cls: 'artisan', weight: 12 },
      { cls: 'merchant', weight: 10 },
      { cls: 'knight', weight: 7 },
      { cls: 'clergy', weight: 8 },
      { cls: 'monk', weight: 4 },
      { cls: 'noble', weight: 3 },
      { cls: 'royalty', weight: 1 },
    ],
  },

  EARLY_MODERN: {
    id: 'EARLY_MODERN',
    label: 'Early Modern',
    yearRange: [1500, 1849],
    eventSignature: 'The world is being mapped. Old gods die, new machines are born.',
    locationPool: [
      { region: 'British Isles', city: 'London', country: 'England/Britain', weight: 14 },
      { region: 'British Isles', city: 'Edinburgh', country: 'Scotland', weight: 6 },
      { region: 'British Isles', city: 'Dublin', country: 'Ireland', weight: 5 },
      { region: 'Frankish Lands', city: 'Paris', country: 'France', weight: 13 },
      { region: 'Frankish Lands', city: 'Versailles', country: 'France', weight: 5 },
      { region: 'Frankish Lands', city: 'Lyon', country: 'France', weight: 5 },
      { region: 'Germanic Lands', city: 'Berlin', country: 'Prussia', weight: 8 },
      { region: 'Germanic Lands', city: 'Vienna', country: 'Austrian Empire', weight: 8 },
      { region: 'Germanic Lands', city: 'Munich', country: 'Bavaria', weight: 5 },
      { region: 'Iberian Peninsula', city: 'Madrid', country: 'Spain', weight: 10 },
      { region: 'Iberian Peninsula', city: 'Seville', country: 'Spain', weight: 7 },
      { region: 'Iberian Peninsula', city: 'Lisbon', country: 'Portugal', weight: 8 },
      { region: 'Italian Peninsula', city: 'Venice', country: 'Venetian Republic', weight: 7 },
      { region: 'Italian Peninsula', city: 'Florence', country: 'Grand Duchy of Tuscany', weight: 7 },
      { region: 'Italian Peninsula', city: 'Rome', country: 'Papal States', weight: 8 },
      { region: 'Italian Peninsula', city: 'Naples', country: 'Kingdom of Naples', weight: 5 },
      { region: 'Low Countries', city: 'Amsterdam', country: 'Dutch Republic', weight: 10 },
      { region: 'Low Countries', city: 'Antwerp', country: 'Spanish/Austrian Netherlands', weight: 7 },
      { region: 'Low Countries', city: 'Brussels', country: 'Spanish/Austrian Netherlands', weight: 5 },
      { region: 'Eastern Europe', city: 'Warsaw', country: 'Polish-Lithuanian Commonwealth', weight: 6 },
      { region: 'Eastern Europe', city: 'St. Petersburg', country: 'Russian Empire', weight: 8 },
      { region: 'Eastern Europe', city: 'Moscow', country: 'Russian Empire', weight: 7 },
      { region: 'Ottoman', city: 'Istanbul', country: 'Ottoman Empire', weight: 12 },
      { region: 'Ottoman', city: 'Cairo', country: 'Ottoman Egypt', weight: 6 },
      { region: 'Ottoman', city: 'Damascus', country: 'Ottoman Syria', weight: 5 },
      { region: 'Ottoman', city: 'Baghdad', country: 'Ottoman Iraq', weight: 4 },
      { region: 'Persian', city: 'Isfahan', country: 'Safavid Persia', weight: 6 },
      { region: 'Persian', city: 'Tehran', country: 'Qajar Persia', weight: 4 },
      { region: 'South Asia', city: 'Delhi', country: 'Mughal Empire', weight: 8 },
      { region: 'South Asia', city: 'Agra', country: 'Mughal Empire', weight: 6 },
      { region: 'South Asia', city: 'Calcutta', country: 'British India', weight: 6 },
      { region: 'South Asia', city: 'Bombay', country: 'British India', weight: 5 },
      { region: 'South Asia', city: 'Madras', country: 'British India', weight: 4 },
      { region: 'East Asia', city: 'Beijing', country: 'Ming/Qing China', weight: 10 },
      { region: 'East Asia', city: 'Shanghai', country: 'Qing China', weight: 6 },
      { region: 'East Asia', city: 'Edo', country: 'Tokugawa Japan', weight: 9 },
      { region: 'East Asia', city: 'Osaka', country: 'Tokugawa Japan', weight: 5 },
      { region: 'East Asia', city: 'Seoul', country: 'Joseon Korea', weight: 6 },
      { region: 'Southeast Asia', city: 'Batavia', country: 'Dutch East Indies', weight: 5 },
      { region: 'Southeast Asia', city: 'Ayutthaya', country: 'Siam', weight: 4 },
      { region: 'Americas', city: 'Mexico City', country: 'New Spain', weight: 8 },
      { region: 'Americas', city: 'Lima', country: 'Viceroyalty of Peru', weight: 6 },
      { region: 'Americas', city: 'Boston', country: 'British America', weight: 6 },
      { region: 'Americas', city: 'Philadelphia', country: 'United States', weight: 6 },
      { region: 'Americas', city: 'New York', country: 'United States', weight: 7 },
      { region: 'Americas', city: 'Charleston', country: 'United States', weight: 4 },
      { region: 'Americas', city: 'Rio de Janeiro', country: 'Portuguese Brazil', weight: 6 },
      { region: 'Americas', city: 'Salvador', country: 'Portuguese Brazil', weight: 4 },
      { region: 'Africa', city: 'Cape Town', country: 'Dutch/British Cape', weight: 4 },
      { region: 'Africa', city: 'Lagos', country: 'Yorubaland', weight: 4 },
      { region: 'Africa', city: 'Addis Ababa', country: 'Ethiopia', weight: 3 },
    ],
    firstNamePool: {
      male: [
        { name: 'William', weight: 5 }, { name: 'James', weight: 4 }, { name: 'John', weight: 5 },
        { name: 'George', weight: 4 }, { name: 'Charles', weight: 4 }, { name: 'Edward', weight: 3 },
        { name: 'Henry', weight: 3 }, { name: 'Thomas', weight: 4 }, { name: 'Robert', weight: 4 },
        { name: 'Richard', weight: 3 }, { name: 'Joseph', weight: 3 }, { name: 'Benjamin', weight: 3 },
        { name: 'Samuel', weight: 3 }, { name: 'Daniel', weight: 3 }, { name: 'Alexander', weight: 3 },
        { name: 'Napoleon', weight: 3 }, { name: 'Louis', weight: 3 }, { name: 'Frederick', weight: 3 },
        { name: 'Peter', weight: 3 }, { name: 'Catherine', weight: 2 }, { name: 'Maximilian', weight: 2 },
        { name: 'Wolfgang', weight: 2 }, { name: 'Ludwig', weight: 2 }, { name: 'Johann', weight: 3 },
        { name: 'Franz', weight: 2 }, { name: 'Karl', weight: 2 }, { name: 'Heinrich', weight: 2 },
        { name: 'Michel', weight: 2 }, { name: 'Jean', weight: 3 }, { name: 'Pierre', weight: 3 },
        { name: 'François', weight: 2 }, { name: 'Henri', weight: 2 }, { name: 'René', weight: 2 },
        { name: 'Voltaire', weight: 1 }, { name: 'Rousseau', weight: 1 }, { name: 'Diderot', weight: 1 },
        { name: 'Akbar', weight: 2 }, { name: 'Shah', weight: 2 }, { name: 'Aurangzeb', weight: 2 },
        { name: 'Qianlong', weight: 2 }, { name: 'Kangxi', weight: 2 }, { name: 'Ieyasu', weight: 2 },
        { name: 'Hideyoshi', weight: 1 }, { name: 'Toussaint', weight: 2 }, { name: 'Simon', weight: 2 },
      ],
      female: [
        { name: 'Elizabeth', weight: 5 }, { name: 'Mary', weight: 4 }, { name: 'Anne', weight: 4 },
        { name: 'Victoria', weight: 3 }, { name: 'Catherine', weight: 4 }, { name: 'Maria', weight: 4 },
        { name: 'Marie', weight: 4 }, { name: 'Charlotte', weight: 3 }, { name: 'Sophia', weight: 3 },
        { name: 'Louise', weight: 2 }, { name: 'Margaret', weight: 3 }, { name: 'Sarah', weight: 3 },
        { name: 'Rebecca', weight: 2 }, { name: 'Hannah', weight: 2 }, { name: 'Abigail', weight: 2 },
        { name: 'Martha', weight: 2 }, { name: 'Dorothy', weight: 2 }, { name: 'Frances', weight: 2 },
        { name: 'Jane', weight: 3 }, { name: 'Emily', weight: 3 }, { name: 'Claire', weight: 2 },
        { name: 'Isabelle', weight: 2 }, { name: 'Gabrielle', weight: 2 }, { name: 'Antoinette', weight: 2 },
        { name: 'Josephine', weight: 2 }, { name: 'Eleanor', weight: 2 }, { name: 'Beatrice', weight: 2 },
        { name: 'Jahanara', weight: 1 }, { name: 'Mumtaz', weight: 2 }, { name: 'Nur', weight: 1 },
        { name: 'Xi', weight: 2 }, { name: 'Ying', weight: 2 }, { name: 'Hua', weight: 2 },
        { name: 'Chiyo', weight: 2 }, { name: 'Haruko', weight: 2 }, { name: 'Sachiko', weight: 2 },
      ],
    },
    lastNamePool: [
      { name: 'Smith', weight: 4 }, { name: 'Johnson', weight: 3 }, { name: 'Williams', weight: 3 },
      { name: 'Brown', weight: 3 }, { name: 'Jones', weight: 3 }, { name: 'Taylor', weight: 3 },
      { name: 'Davies', weight: 2 }, { name: 'Wilson', weight: 2 }, { name: 'Evans', weight: 2 },
      { name: 'Thomas', weight: 2 }, { name: 'Roberts', weight: 2 }, { name: 'Walker', weight: 2 },
      { name: 'Wright', weight: 2 }, { name: 'Robinson', weight: 2 }, { name: 'Thompson', weight: 2 },
      { name: 'White', weight: 2 }, { name: 'Harris', weight: 2 }, { name: 'Martin', weight: 2 },
      { name: 'Dupont', weight: 2 }, { name: 'Laurent', weight: 2 }, { name: 'Moreau', weight: 2 },
      { name: 'Bernard', weight: 2 }, { name: 'Müller', weight: 3 }, { name: 'Schmidt', weight: 3 },
      { name: 'Schneider', weight: 2 }, { name: 'Fischer', weight: 2 }, { name: 'Weber', weight: 2 },
      { name: 'Meyer', weight: 2 }, { name: 'Wagner', weight: 2 }, { name: 'Becker', weight: 2 },
      { name: 'Rossi', weight: 2 }, { name: 'Ferrari', weight: 2 }, { name: 'Bianchi', weight: 2 },
      { name: 'Romano', weight: 2 }, { name: 'Colombo', weight: 1 }, { name: 'Ricci', weight: 1 },
      { name: '', weight: 5 },
    ],
    bodyConditions: [
      { condition: 'robust', weight: 14 },
      { condition: 'healthy', weight: 53 },
      { condition: 'sickly', weight: 22 },
      { condition: 'disabled', weight: 11 },
    ],
    socialClasses: [
      { cls: 'peasant', weight: 25 },
      { cls: 'laborer', weight: 18 },
      { cls: 'artisan', weight: 14 },
      { cls: 'merchant', weight: 13 },
      { cls: 'clergy', weight: 6 },
      { cls: 'soldier', weight: 8 },
      { cls: 'aristocrat', weight: 5 },
      { cls: 'intellectual', weight: 4 },
      { cls: 'enslaved', weight: 7 },
    ],
  },

  INDUSTRIAL: {
    id: 'INDUSTRIAL',
    label: 'Industrial',
    yearRange: [1850, 1949],
    eventSignature: 'Smoke fills the sky. The machines are hungry and so is war.',
    locationPool: [
      { region: 'British Isles', city: 'London', country: 'United Kingdom', weight: 14 },
      { region: 'British Isles', city: 'Manchester', country: 'United Kingdom', weight: 8 },
      { region: 'British Isles', city: 'Birmingham', country: 'United Kingdom', weight: 6 },
      { region: 'British Isles', city: 'Glasgow', country: 'United Kingdom', weight: 6 },
      { region: 'British Isles', city: 'Liverpool', country: 'United Kingdom', weight: 5 },
      { region: 'British Isles', city: 'Dublin', country: 'Ireland', weight: 4 },
      { region: 'Frankish Lands', city: 'Paris', country: 'France', weight: 12 },
      { region: 'Frankish Lands', city: 'Lyon', country: 'France', weight: 5 },
      { region: 'Frankish Lands', city: 'Marseille', country: 'France', weight: 5 },
      { region: 'Germanic Lands', city: 'Berlin', country: 'Germany', weight: 11 },
      { region: 'Germanic Lands', city: 'Munich', country: 'Germany', weight: 6 },
      { region: 'Germanic Lands', city: 'Hamburg', country: 'Germany', weight: 6 },
      { region: 'Germanic Lands', city: 'Dresden', country: 'Germany', weight: 4 },
      { region: 'Germanic Lands', city: 'Vienna', country: 'Austria-Hungary', weight: 8 },
      { region: 'Germanic Lands', city: 'Budapest', country: 'Austria-Hungary', weight: 6 },
      { region: 'Iberian Peninsula', city: 'Madrid', country: 'Spain', weight: 7 },
      { region: 'Iberian Peninsula', city: 'Barcelona', country: 'Spain', weight: 6 },
      { region: 'Iberian Peninsula', city: 'Lisbon', country: 'Portugal', weight: 4 },
      { region: 'Italian Peninsula', city: 'Rome', country: 'Italy', weight: 7 },
      { region: 'Italian Peninsula', city: 'Milan', country: 'Italy', weight: 7 },
      { region: 'Italian Peninsula', city: 'Turin', country: 'Italy', weight: 5 },
      { region: 'Italian Peninsula', city: 'Naples', country: 'Italy', weight: 5 },
      { region: 'Eastern Europe', city: 'Warsaw', country: 'Poland/Russian Empire', weight: 5 },
      { region: 'Eastern Europe', city: 'Moscow', country: 'Russian Empire/USSR', weight: 8 },
      { region: 'Eastern Europe', city: 'St. Petersburg', country: 'Russian Empire/USSR', weight: 7 },
      { region: 'Eastern Europe', city: 'Kiev', country: 'Russian Empire/USSR', weight: 4 },
      { region: 'Ottoman', city: 'Istanbul', country: 'Ottoman Empire/Turkey', weight: 7 },
      { region: 'Scandinavia', city: 'Stockholm', country: 'Sweden', weight: 4 },
      { region: 'Scandinavia', city: 'Oslo', country: 'Norway', weight: 3 },
      { region: 'Scandinavia', city: 'Copenhagen', country: 'Denmark', weight: 4 },
      { region: 'Americas', city: 'New York', country: 'United States', weight: 13 },
      { region: 'Americas', city: 'Chicago', country: 'United States', weight: 9 },
      { region: 'Americas', city: 'Philadelphia', country: 'United States', weight: 6 },
      { region: 'Americas', city: 'Boston', country: 'United States', weight: 6 },
      { region: 'Americas', city: 'Detroit', country: 'United States', weight: 6 },
      { region: 'Americas', city: 'Pittsburgh', country: 'United States', weight: 5 },
      { region: 'Americas', city: 'San Francisco', country: 'United States', weight: 6 },
      { region: 'Americas', city: 'Los Angeles', country: 'United States', weight: 7 },
      { region: 'Americas', city: 'New Orleans', country: 'United States', weight: 4 },
      { region: 'Americas', city: 'Mexico City', country: 'Mexico', weight: 7 },
      { region: 'Americas', city: 'Buenos Aires', country: 'Argentina', weight: 6 },
      { region: 'Americas', city: 'São Paulo', country: 'Brazil', weight: 6 },
      { region: 'Americas', city: 'Rio de Janeiro', country: 'Brazil', weight: 5 },
      { region: 'Americas', city: 'Havana', country: 'Cuba', weight: 4 },
      { region: 'East Asia', city: 'Tokyo', country: 'Japan', weight: 10 },
      { region: 'East Asia', city: 'Osaka', country: 'Japan', weight: 6 },
      { region: 'East Asia', city: 'Shanghai', country: 'China', weight: 8 },
      { region: 'East Asia', city: 'Beijing', country: 'China', weight: 6 },
      { region: 'East Asia', city: 'Seoul', country: 'Korea/Japan', weight: 4 },
      { region: 'South Asia', city: 'Calcutta', country: 'British India', weight: 6 },
      { region: 'South Asia', city: 'Bombay', country: 'British India', weight: 6 },
      { region: 'South Asia', city: 'Madras', country: 'British India', weight: 4 },
      { region: 'South Asia', city: 'Delhi', country: 'British India', weight: 5 },
      { region: 'Southeast Asia', city: 'Singapore', country: 'British Straits Settlements', weight: 5 },
      { region: 'Southeast Asia', city: 'Batavia', country: 'Dutch East Indies', weight: 4 },
      { region: 'Southeast Asia', city: 'Manila', country: 'Spanish/American Philippines', weight: 4 },
      { region: 'Africa', city: 'Cairo', country: 'Egypt', weight: 6 },
      { region: 'Africa', city: 'Cape Town', country: 'South Africa', weight: 4 },
      { region: 'Africa', city: 'Lagos', country: 'Nigeria', weight: 4 },
      { region: 'Africa', city: 'Nairobi', country: 'British East Africa', weight: 3 },
      { region: 'Oceania', city: 'Sydney', country: 'Australia', weight: 6 },
      { region: 'Oceania', city: 'Melbourne', country: 'Australia', weight: 5 },
      { region: 'Oceania', city: 'Auckland', country: 'New Zealand', weight: 3 },
    ],
    firstNamePool: {
      male: [
        { name: 'John', weight: 5 }, { name: 'William', weight: 5 }, { name: 'James', weight: 4 },
        { name: 'George', weight: 4 }, { name: 'Charles', weight: 3 }, { name: 'Robert', weight: 4 },
        { name: 'Thomas', weight: 3 }, { name: 'Henry', weight: 3 }, { name: 'Edward', weight: 3 },
        { name: 'Arthur', weight: 3 }, { name: 'Albert', weight: 3 }, { name: 'Frederick', weight: 2 },
        { name: 'Walter', weight: 2 }, { name: 'Harry', weight: 3 }, { name: 'Jack', weight: 3 },
        { name: 'Joseph', weight: 3 }, { name: 'Samuel', weight: 2 }, { name: 'David', weight: 3 },
        { name: 'Michael', weight: 3 }, { name: 'Richard', weight: 2 }, { name: 'Frank', weight: 3 },
        { name: 'Carl', weight: 2 }, { name: 'Otto', weight: 2 }, { name: 'Friedrich', weight: 2 },
        { name: 'Hans', weight: 2 }, { name: 'Karl', weight: 2 }, { name: 'Heinrich', weight: 2 },
        { name: 'Pierre', weight: 2 }, { name: 'Jean', weight: 2 }, { name: 'Louis', weight: 2 },
        { name: 'Marcel', weight: 2 }, { name: 'Henri', weight: 2 }, { name: 'Gustave', weight: 1 },
        { name: 'Vladimir', weight: 2 }, { name: 'Josef', weight: 2 }, { name: 'Boris', weight: 2 },
        { name: 'Nikolai', weight: 2 }, { name: 'Ivan', weight: 2 }, { name: 'Sergei', weight: 2 },
        { name: 'Hiroshi', weight: 2 }, { name: 'Takeshi', weight: 2 }, { name: 'Kenji', weight: 2 },
        { name: 'Wei', weight: 2 }, { name: 'Ming', weight: 2 }, { name: 'Zhi', weight: 2 },
        { name: 'Raj', weight: 2 }, { name: 'Arjun', weight: 1 }, { name: 'Mahatma', weight: 1 },
      ],
      female: [
        { name: 'Mary', weight: 5 }, { name: 'Elizabeth', weight: 4 }, { name: 'Margaret', weight: 4 },
        { name: 'Dorothy', weight: 3 }, { name: 'Helen', weight: 3 }, { name: 'Ruth', weight: 3 },
        { name: 'Florence', weight: 2 }, { name: 'Edith', weight: 2 }, { name: 'Clara', weight: 2 },
        { name: 'Alice', weight: 3 }, { name: 'Emma', weight: 3 }, { name: 'Grace', weight: 2 },
        { name: 'Rose', weight: 3 }, { name: 'Lily', weight: 2 }, { name: 'Violet', weight: 2 },
        { name: 'Irene', weight: 2 }, { name: 'Beatrice', weight: 2 }, { name: 'Mabel', weight: 1 },
        { name: 'Martha', weight: 2 }, { name: 'Sarah', weight: 3 }, { name: 'Anna', weight: 3 },
        { name: 'Marie', weight: 3 }, { name: 'Louise', weight: 2 }, { name: 'Jeanne', weight: 2 },
        { name: 'Simone', weight: 2 }, { name: 'Colette', weight: 1 }, { name: 'Hélène', weight: 2 },
        { name: 'Greta', weight: 2 }, { name: 'Ingrid', weight: 2 }, { name: 'Astrid', weight: 1 },
        { name: 'Natasha', weight: 2 }, { name: 'Olga', weight: 2 }, { name: 'Tatiana', weight: 2 },
        { name: 'Yuki', weight: 2 }, { name: 'Sakura', weight: 2 }, { name: 'Haruko', weight: 1 },
        { name: 'Mei', weight: 2 }, { name: 'Lan', weight: 2 }, { name: 'Xiu', weight: 2 },
        { name: 'Priya', weight: 2 }, { name: 'Lakshmi', weight: 1 }, { name: 'Sita', weight: 1 },
      ],
    },
    lastNamePool: [
      { name: 'Smith', weight: 5 }, { name: 'Johnson', weight: 4 }, { name: 'Williams', weight: 4 },
      { name: 'Brown', weight: 4 }, { name: 'Jones', weight: 4 }, { name: 'Miller', weight: 3 },
      { name: 'Davis', weight: 3 }, { name: 'Wilson', weight: 3 }, { name: 'Taylor', weight: 3 },
      { name: 'Anderson', weight: 2 }, { name: 'Thomas', weight: 3 }, { name: 'Jackson', weight: 2 },
      { name: 'White', weight: 3 }, { name: 'Harris', weight: 2 }, { name: 'Martin', weight: 2 },
      { name: 'Thompson', weight: 2 }, { name: 'Robinson', weight: 2 }, { name: 'Clark', weight: 2 },
      { name: 'Müller', weight: 3 }, { name: 'Schmidt', weight: 3 }, { name: 'Schneider', weight: 2 },
      { name: 'Fischer', weight: 2 }, { name: 'Weber', weight: 2 }, { name: 'Meyer', weight: 2 },
      { name: 'Wagner', weight: 2 }, { name: 'Becker', weight: 2 }, { name: 'Hoffmann', weight: 2 },
      { name: 'Dubois', weight: 2 }, { name: 'Laurent', weight: 2 }, { name: 'Moreau', weight: 2 },
      { name: 'Bernard', weight: 2 }, { name: 'Petit', weight: 2 }, { name: 'Robert', weight: 2 },
      { name: 'Ivanov', weight: 2 }, { name: 'Smirnov', weight: 2 }, { name: 'Kuznetsov', weight: 1 },
      { name: 'Tanaka', weight: 2 }, { name: 'Suzuki', weight: 2 }, { name: 'Sato', weight: 2 },
      { name: 'Wang', weight: 3 }, { name: 'Li', weight: 3 }, { name: 'Zhang', weight: 2 },
      { name: 'Patel', weight: 2 }, { name: 'Singh', weight: 2 }, { name: 'Sharma', weight: 2 },
    ],
    bodyConditions: [
      { condition: 'robust', weight: 13 },
      { condition: 'healthy', weight: 52 },
      { condition: 'sickly', weight: 23 },
      { condition: 'disabled', weight: 12 },
    ],
    socialClasses: [
      { cls: 'factory worker', weight: 22 },
      { cls: 'laborer', weight: 15 },
      { cls: 'farmer', weight: 12 },
      { cls: 'artisan', weight: 8 },
      { cls: 'merchant', weight: 10 },
      { cls: 'clerk', weight: 8 },
      { cls: 'soldier', weight: 8 },
      { cls: 'professional', weight: 6 },
      { cls: 'aristocrat', weight: 3 },
      { cls: 'servant', weight: 8 },
    ],
  },

  MODERN: {
    id: 'MODERN',
    label: 'Modern',
    yearRange: [1950, 2019],
    eventSignature: 'You live longer. You die alone. The screens watch you back.',
    locationPool: [
      { region: 'North America', city: 'New York', country: 'United States', weight: 12 },
      { region: 'North America', city: 'Los Angeles', country: 'United States', weight: 10 },
      { region: 'North America', city: 'Chicago', country: 'United States', weight: 7 },
      { region: 'North America', city: 'Houston', country: 'United States', weight: 5 },
      { region: 'North America', city: 'San Francisco', country: 'United States', weight: 7 },
      { region: 'North America', city: 'Seattle', country: 'United States', weight: 5 },
      { region: 'North America', city: 'Miami', country: 'United States', weight: 5 },
      { region: 'North America', city: 'Boston', country: 'United States', weight: 5 },
      { region: 'North America', city: 'Toronto', country: 'Canada', weight: 6 },
      { region: 'North America', city: 'Vancouver', country: 'Canada', weight: 4 },
      { region: 'North America', city: 'Montreal', country: 'Canada', weight: 4 },
      { region: 'North America', city: 'Mexico City', country: 'Mexico', weight: 8 },
      { region: 'Europe', city: 'London', country: 'United Kingdom', weight: 10 },
      { region: 'Europe', city: 'Paris', country: 'France', weight: 9 },
      { region: 'Europe', city: 'Berlin', country: 'Germany', weight: 7 },
      { region: 'Europe', city: 'Rome', country: 'Italy', weight: 6 },
      { region: 'Europe', city: 'Madrid', country: 'Spain', weight: 5 },
      { region: 'Europe', city: 'Amsterdam', country: 'Netherlands', weight: 5 },
      { region: 'Europe', city: 'Vienna', country: 'Austria', weight: 4 },
      { region: 'Europe', city: 'Stockholm', country: 'Sweden', weight: 3 },
      { region: 'Europe', city: 'Moscow', country: 'Russia/USSR', weight: 7 },
      { region: 'Europe', city: 'Warsaw', country: 'Poland', weight: 4 },
      { region: 'Europe', city: 'Prague', country: 'Czech Republic', weight: 3 },
      { region: 'Europe', city: 'Athens', country: 'Greece', weight: 3 },
      { region: 'Europe', city: 'Dublin', country: 'Ireland', weight: 3 },
      { region: 'Europe', city: 'Lisbon', country: 'Portugal', weight: 3 },
      { region: 'Asia', city: 'Tokyo', country: 'Japan', weight: 10 },
      { region: 'Asia', city: 'Shanghai', country: 'China', weight: 9 },
      { region: 'Asia', city: 'Beijing', country: 'China', weight: 8 },
      { region: 'Asia', city: 'Seoul', country: 'South Korea', weight: 6 },
      { region: 'Asia', city: 'Mumbai', country: 'India', weight: 7 },
      { region: 'Asia', city: 'Delhi', country: 'India', weight: 6 },
      { region: 'Asia', city: 'Bangalore', country: 'India', weight: 4 },
      { region: 'Asia', city: 'Singapore', country: 'Singapore', weight: 4 },
      { region: 'Asia', city: 'Bangkok', country: 'Thailand', weight: 5 },
      { region: 'Asia', city: 'Jakarta', country: 'Indonesia', weight: 5 },
      { region: 'Asia', city: 'Manila', country: 'Philippines', weight: 4 },
      { region: 'Asia', city: 'Ho Chi Minh City', country: 'Vietnam', weight: 4 },
      { region: 'Asia', city: 'Istanbul', country: 'Turkey', weight: 6 },
      { region: 'Asia', city: 'Dubai', country: 'UAE', weight: 4 },
      { region: 'Asia', city: 'Tehran', country: 'Iran', weight: 4 },
      { region: 'South America', city: 'São Paulo', country: 'Brazil', weight: 7 },
      { region: 'South America', city: 'Rio de Janeiro', country: 'Brazil', weight: 5 },
      { region: 'South America', city: 'Buenos Aires', country: 'Argentina', weight: 5 },
      { region: 'South America', city: 'Lima', country: 'Peru', weight: 4 },
      { region: 'South America', city: 'Bogotá', country: 'Colombia', weight: 4 },
      { region: 'South America', city: 'Santiago', country: 'Chile', weight: 4 },
      { region: 'Africa', city: 'Lagos', country: 'Nigeria', weight: 6 },
      { region: 'Africa', city: 'Cairo', country: 'Egypt', weight: 6 },
      { region: 'Africa', city: 'Johannesburg', country: 'South Africa', weight: 5 },
      { region: 'Africa', city: 'Nairobi', country: 'Kenya', weight: 4 },
      { region: 'Africa', city: 'Addis Ababa', country: 'Ethiopia', weight: 3 },
      { region: 'Africa', city: 'Casablanca', country: 'Morocco', weight: 3 },
      { region: 'Oceania', city: 'Sydney', country: 'Australia', weight: 6 },
      { region: 'Oceania', city: 'Melbourne', country: 'Australia', weight: 5 },
      { region: 'Oceania', city: 'Auckland', country: 'New Zealand', weight: 3 },
      { region: 'Oceania', city: 'Wellington', country: 'New Zealand', weight: 2 },
    ],
    firstNamePool: {
      male: [
        { name: 'James', weight: 5 }, { name: 'John', weight: 4 }, { name: 'Robert', weight: 4 },
        { name: 'Michael', weight: 5 }, { name: 'David', weight: 4 }, { name: 'William', weight: 4 },
        { name: 'Richard', weight: 3 }, { name: 'Joseph', weight: 3 }, { name: 'Thomas', weight: 3 },
        { name: 'Christopher', weight: 4 }, { name: 'Daniel', weight: 4 }, { name: 'Matthew', weight: 4 },
        { name: 'Anthony', weight: 3 }, { name: 'Mark', weight: 3 }, { name: 'Steven', weight: 3 },
        { name: 'Paul', weight: 3 }, { name: 'Andrew', weight: 3 }, { name: 'Joshua', weight: 3 },
        { name: 'Kenneth', weight: 2 }, { name: 'Kevin', weight: 2 }, { name: 'Brian', weight: 2 },
        { name: 'Timothy', weight: 2 }, { name: 'Ryan', weight: 3 }, { name: 'Jason', weight: 3 },
        { name: 'Justin', weight: 2 }, { name: 'Brandon', weight: 2 }, { name: 'Tyler', weight: 2 },
        { name: 'Liam', weight: 3 }, { name: 'Noah', weight: 2 }, { name: 'Ethan', weight: 2 },
        { name: 'Mohammed', weight: 3 }, { name: 'Ahmed', weight: 3 }, { name: 'Ali', weight: 3 },
        { name: 'Wei', weight: 3 }, { name: 'Jun', weight: 2 }, { name: 'Yuki', weight: 2 },
        { name: 'Raj', weight: 2 }, { name: 'Arjun', weight: 2 }, { name: 'Carlos', weight: 3 },
        { name: 'Miguel', weight: 2 }, { name: 'Diego', weight: 2 }, { name: 'Santiago', weight: 2 },
      ],
      female: [
        { name: 'Mary', weight: 4 }, { name: 'Patricia', weight: 3 }, { name: 'Jennifer', weight: 4 },
        { name: 'Linda', weight: 3 }, { name: 'Elizabeth', weight: 4 }, { name: 'Barbara', weight: 3 },
        { name: 'Susan', weight: 3 }, { name: 'Jessica', weight: 4 }, { name: 'Sarah', weight: 4 },
        { name: 'Karen', weight: 3 }, { name: 'Lisa', weight: 3 }, { name: 'Nancy', weight: 2 },
        { name: 'Betty', weight: 2 }, { name: 'Margaret', weight: 2 }, { name: 'Sandra', weight: 2 },
        { name: 'Ashley', weight: 3 }, { name: 'Emily', weight: 4 }, { name: 'Emma', weight: 4 },
        { name: 'Olivia', weight: 3 }, { name: 'Sophia', weight: 3 }, { name: 'Ava', weight: 2 },
        { name: 'Isabella', weight: 3 }, { name: 'Mia', weight: 2 }, { name: 'Charlotte', weight: 2 },
        { name: 'Amelia', weight: 2 }, { name: 'Harper', weight: 2 }, { name: 'Evelyn', weight: 2 },
        { name: 'Fatima', weight: 3 }, { name: 'Aisha', weight: 2 }, { name: 'Yasmin', weight: 2 },
        { name: 'Mei', weight: 3 }, { name: 'Yuki', weight: 2 }, { name: 'Sakura', weight: 2 },
        { name: 'Priya', weight: 3 }, { name: 'Ananya', weight: 2 }, { name: 'Deepa', weight: 2 },
        { name: 'Sofia', weight: 3 }, { name: 'Valentina', weight: 2 }, { name: 'Camila', weight: 2 },
        { name: 'Lucia', weight: 2 }, { name: 'Maria', weight: 4 }, { name: 'Ana', weight: 3 },
      ],
    },
    lastNamePool: [
      { name: 'Smith', weight: 4 }, { name: 'Johnson', weight: 4 }, { name: 'Williams', weight: 4 },
      { name: 'Brown', weight: 4 }, { name: 'Jones', weight: 3 }, { name: 'Garcia', weight: 4 },
      { name: 'Miller', weight: 3 }, { name: 'Davis', weight: 3 }, { name: 'Rodriguez', weight: 3 },
      { name: 'Martinez', weight: 3 }, { name: 'Hernandez', weight: 2 }, { name: 'Lopez', weight: 3 },
      { name: 'Gonzalez', weight: 2 }, { name: 'Wilson', weight: 3 }, { name: 'Anderson', weight: 2 },
      { name: 'Thomas', weight: 3 }, { name: 'Taylor', weight: 3 }, { name: 'Moore', weight: 2 },
      { name: 'Jackson', weight: 2 }, { name: 'Martin', weight: 3 }, { name: 'Lee', weight: 4 },
      { name: 'Wang', weight: 4 }, { name: 'Zhang', weight: 3 }, { name: 'Li', weight: 4 },
      { name: 'Liu', weight: 3 }, { name: 'Chen', weight: 3 }, { name: 'Yang', weight: 2 },
      { name: 'Kim', weight: 4 }, { name: 'Park', weight: 3 }, { name: 'Choi', weight: 2 },
      { name: 'Singh', weight: 3 }, { name: 'Patel', weight: 3 }, { name: 'Kumar', weight: 2 },
      { name: 'Tanaka', weight: 2 }, { name: 'Suzuki', weight: 2 }, { name: 'Sato', weight: 2 },
      { name: 'Müller', weight: 2 }, { name: 'Schmidt', weight: 2 }, { name: 'Schneider', weight: 1 },
      { name: 'Dubois', weight: 2 }, { name: 'Martin', weight: 2 }, { name: 'Bernard', weight: 2 },
      { name: 'Silva', weight: 3 }, { name: 'Santos', weight: 2 }, { name: 'Oliveira', weight: 2 },
      { name: 'Ali', weight: 2 }, { name: 'Ahmed', weight: 2 }, { name: 'Hassan', weight: 2 },
    ],
    bodyConditions: [
      { condition: 'robust', weight: 15 },
      { condition: 'healthy', weight: 55 },
      { condition: 'sickly', weight: 20 },
      { condition: 'disabled', weight: 10 },
    ],
    socialClasses: [
      { cls: 'working class', weight: 22 },
      { cls: 'service worker', weight: 15 },
      { cls: 'middle class', weight: 25 },
      { cls: 'professional', weight: 12 },
      { cls: 'technician', weight: 8 },
      { cls: 'creative', weight: 5 },
      { cls: 'executive', weight: 4 },
      { cls: 'unemployed', weight: 5 },
      { cls: 'informal worker', weight: 4 },
    ],
  },

  NEAR_FUTURE: {
    id: 'NEAR_FUTURE',
    label: 'Near Future',
    yearRange: [2020, 2069],
    eventSignature: 'The climate is shifting. The algorithms decide. You adapt or break.',
    locationPool: [
      { region: 'North America', city: 'New York', country: 'United States', weight: 10 },
      { region: 'North America', city: 'Los Angeles', country: 'United States', weight: 8 },
      { region: 'North America', city: 'San Francisco', country: 'United States', weight: 8 },
      { region: 'North America', city: 'Seattle', country: 'United States', weight: 6 },
      { region: 'North America', city: 'Austin', country: 'United States', weight: 5 },
      { region: 'North America', city: 'Miami', country: 'United States', weight: 5 },
      { region: 'North America', city: 'Toronto', country: 'Canada', weight: 6 },
      { region: 'North America', city: 'Vancouver', country: 'Canada', weight: 5 },
      { region: 'North America', city: 'Mexico City', country: 'Mexico', weight: 7 },
      { region: 'Europe', city: 'London', country: 'United Kingdom', weight: 8 },
      { region: 'Europe', city: 'Berlin', country: 'Germany', weight: 7 },
      { region: 'Europe', city: 'Paris', country: 'France', weight: 7 },
      { region: 'Europe', city: 'Amsterdam', country: 'Netherlands', weight: 5 },
      { region: 'Europe', city: 'Stockholm', country: 'Sweden', weight: 4 },
      { region: 'Europe', city: 'Copenhagen', country: 'Denmark', weight: 4 },
      { region: 'Europe', city: 'Zurich', country: 'Switzerland', weight: 4 },
      { region: 'Europe', city: 'Barcelona', country: 'Spain', weight: 5 },
      { region: 'Europe', city: 'Warsaw', country: 'Poland', weight: 4 },
      { region: 'Europe', city: 'Tallinn', country: 'Estonia', weight: 3 },
      { region: 'Asia', city: 'Tokyo', country: 'Japan', weight: 8 },
      { region: 'Asia', city: 'Shanghai', country: 'China', weight: 9 },
      { region: 'Asia', city: 'Beijing', country: 'China', weight: 7 },
      { region: 'Asia', city: 'Shenzhen', country: 'China', weight: 7 },
      { region: 'Asia', city: 'Singapore', country: 'Singapore', weight: 6 },
      { region: 'Asia', city: 'Seoul', country: 'South Korea', weight: 6 },
      { region: 'Asia', city: 'Bangalore', country: 'India', weight: 6 },
      { region: 'Asia', city: 'Mumbai', country: 'India', weight: 5 },
      { region: 'Asia', city: 'Dhaka', country: 'Bangladesh', weight: 4 },
      { region: 'Asia', city: 'Jakarta', country: 'Indonesia', weight: 5 },
      { region: 'Asia', city: 'Manila', country: 'Philippines', weight: 4 },
      { region: 'Asia', city: 'Dubai', country: 'UAE', weight: 5 },
      { region: 'South America', city: 'São Paulo', country: 'Brazil', weight: 6 },
      { region: 'South America', city: 'Buenos Aires', country: 'Argentina', weight: 4 },
      { region: 'South America', city: 'Santiago', country: 'Chile', weight: 4 },
      { region: 'Africa', city: 'Lagos', country: 'Nigeria', weight: 7 },
      { region: 'Africa', city: 'Nairobi', country: 'Kenya', weight: 5 },
      { region: 'Africa', city: 'Cape Town', country: 'South Africa', weight: 4 },
      { region: 'Africa', city: 'Addis Ababa', country: 'Ethiopia', weight: 4 },
      { region: 'Africa', city: 'Kigali', country: 'Rwanda', weight: 3 },
      { region: 'Oceania', city: 'Sydney', country: 'Australia', weight: 5 },
      { region: 'Oceania', city: 'Melbourne', country: 'Australia', weight: 4 },
      { region: 'Climate Zone', city: 'New Jakarta', country: 'Relocated Indonesia', weight: 3 },
      { region: 'Climate Zone', city: 'New Orleans Seawall', country: 'United States', weight: 3 },
      { region: 'Climate Zone', city: 'Phoenix Arcology', country: 'United States', weight: 3 },
      { region: 'Climate Zone', city: 'Dhaka Floating District', country: 'Bangladesh', weight: 3 },
      { region: 'Climate Zone', city: 'Sahara Solar City', country: 'Morocco', weight: 2 },
    ],
    firstNamePool: {
      male: [
        { name: 'Liam', weight: 5 }, { name: 'Noah', weight: 4 }, { name: 'Oliver', weight: 4 },
        { name: 'Elijah', weight: 3 }, { name: 'James', weight: 3 }, { name: 'William', weight: 3 },
        { name: 'Benjamin', weight: 3 }, { name: 'Lucas', weight: 3 }, { name: 'Henry', weight: 2 },
        { name: 'Alexander', weight: 3 }, { name: 'Daniel', weight: 3 }, { name: 'Ethan', weight: 2 },
        { name: 'Aiden', weight: 2 }, { name: 'Mateo', weight: 3 }, { name: 'Diego', weight: 2 },
        { name: 'Santiago', weight: 2 }, { name: 'Kai', weight: 3 }, { name: 'Rio', weight: 2 },
        { name: 'Zion', weight: 2 }, { name: 'Atlas', weight: 2 }, { name: 'Orion', weight: 2 },
        { name: 'Phoenix', weight: 2 }, { name: 'Asher', weight: 2 }, { name: 'Leo', weight: 3 },
        { name: 'Wei', weight: 3 }, { name: 'Jun', weight: 2 }, { name: 'Hao', weight: 2 },
        { name: 'Ravi', weight: 2 }, { name: 'Arjun', weight: 2 }, { name: 'Aarav', weight: 2 },
        { name: 'Yuki', weight: 2 }, { name: 'Haruto', weight: 2 }, { name: 'Min-jun', weight: 2 },
        { name: 'Amir', weight: 3 }, { name: 'Omar', weight: 2 }, { name: 'Youssef', weight: 2 },
        { name: 'Kwame', weight: 2 }, { name: 'Tendai', weight: 2 }, { name: 'Zuberi', weight: 1 },
      ],
      female: [
        { name: 'Olivia', weight: 5 }, { name: 'Emma', weight: 4 }, { name: 'Charlotte', weight: 4 },
        { name: 'Amelia', weight: 3 }, { name: 'Ava', weight: 3 }, { name: 'Sophia', weight: 3 },
        { name: 'Isabella', weight: 3 }, { name: 'Mia', weight: 3 }, { name: 'Harper', weight: 2 },
        { name: 'Evelyn', weight: 2 }, { name: 'Luna', weight: 3 }, { name: 'Nova', weight: 2 },
        { name: 'Aurora', weight: 2 }, { name: 'Willow', weight: 2 }, { name: 'Iris', weight: 2 },
        { name: 'Sage', weight: 2 }, { name: 'Freya', weight: 2 }, { name: 'Aria', weight: 3 },
        { name: 'Zara', weight: 2 }, { name: 'Maya', weight: 3 }, { name: 'Leila', weight: 2 },
        { name: 'Amara', weight: 2 }, { name: 'Nia', weight: 2 }, { name: 'Zuri', weight: 2 },
        { name: 'Mei', weight: 3 }, { name: 'Yuna', weight: 2 }, { name: 'Hana', weight: 2 },
        { name: 'Priya', weight: 2 }, { name: 'Ananya', weight: 2 }, { name: 'Diya', weight: 2 },
        { name: 'Sakura', weight: 2 }, { name: 'Aiko', weight: 2 }, { name: 'Ji-woo', weight: 2 },
        { name: 'Fatima', weight: 3 }, { name: 'Aisha', weight: 2 }, { name: 'Yasmin', weight: 2 },
        { name: 'Nala', weight: 2 }, { name: 'Imani', weight: 2 }, { name: 'Zahra', weight: 2 },
      ],
    },
    lastNamePool: [
      { name: 'Smith', weight: 3 }, { name: 'Garcia', weight: 3 }, { name: 'Chen', weight: 4 },
      { name: 'Wang', weight: 3 }, { name: 'Kim', weight: 3 }, { name: 'Singh', weight: 3 },
      { name: 'Patel', weight: 2 }, { name: 'Rodriguez', weight: 3 }, { name: 'Martinez', weight: 2 },
      { name: 'Johnson', weight: 2 }, { name: 'Williams', weight: 2 }, { name: 'Brown', weight: 2 },
      { name: 'Lee', weight: 3 }, { name: 'Zhang', weight: 2 }, { name: 'Liu', weight: 2 },
      { name: 'Park', weight: 2 }, { name: 'Tanaka', weight: 2 }, { name: 'Suzuki', weight: 1 },
      { name: 'Ali', weight: 2 }, { name: 'Ahmed', weight: 2 }, { name: 'Hassan', weight: 2 },
      { name: 'Müller', weight: 2 }, { name: 'Schmidt', weight: 1 }, { name: 'Dubois', weight: 1 },
      { name: 'Silva', weight: 2 }, { name: 'Santos', weight: 2 }, { name: 'Oliveira', weight: 1 },
      { name: 'Okafor', weight: 2 }, { name: 'Mwangi', weight: 2 }, { name: 'Nkosi', weight: 1 },
      { name: 'Tanaka-Chen', weight: 1 }, { name: 'Patel-Smith', weight: 1 }, { name: 'Kim-Garcia', weight: 1 },
      { name: 'Singh-Williams', weight: 1 }, { name: 'Wang-Müller', weight: 1 },
    ],
    bodyConditions: [
      { condition: 'enhanced', weight: 8 },
      { condition: 'robust', weight: 18 },
      { condition: 'healthy', weight: 45 },
      { condition: 'sickly', weight: 18 },
      { condition: 'disabled', weight: 11 },
    ],
    socialClasses: [
      { cls: 'precariat', weight: 18 },
      { cls: 'gig worker', weight: 15 },
      { cls: 'technician', weight: 12 },
      { cls: 'knowledge worker', weight: 15 },
      { cls: 'creative', weight: 8 },
      { cls: 'AI overseer', weight: 5 },
      { cls: 'corporate', weight: 8 },
      { cls: 'basic income recipient', weight: 10 },
      { cls: 'off-grid', weight: 5 },
      { cls: 'climate refugee', weight: 4 },
    ],
  },

  FAR_FUTURE: {
    id: 'FAR_FUTURE',
    label: 'Far Future',
    yearRange: [2070, 2200],
    eventSignature: 'Death is optional now. But meaning is not.',
    locationPool: [
      { region: 'Earth', city: 'Neo-Tokyo', country: 'Japanese Federation', weight: 8 },
      { region: 'Earth', city: 'Shanghai Arcology', country: 'Asian Coalition', weight: 8 },
      { region: 'Earth', city: 'New Lagos', country: 'African Union', weight: 7 },
      { region: 'Earth', city: 'London Reclaimed', country: 'European Commonwealth', weight: 6 },
      { region: 'Earth', city: 'Amazon Bioreserve', country: 'South American Alliance', weight: 5 },
      { region: 'Earth', city: 'Sahara Solar Belt', country: 'African Union', weight: 5 },
      { region: 'Earth', city: 'Arctic Research Hub', country: 'Global Science Authority', weight: 4 },
      { region: 'Earth', city: 'Mumbai Vertical', country: 'Indian Subcontinent', weight: 6 },
      { region: 'Earth', city: 'Cairo Oasis', country: 'North African Federation', weight: 4 },
      { region: 'Earth', city: 'Pacific Floating City', country: 'Oceanic States', weight: 5 },
      { region: 'Earth', city: 'Geneva Consensus', country: 'Global Governance Zone', weight: 4 },
      { region: 'Earth', city: 'Singapore Nexus', country: 'Asian Coalition', weight: 5 },
      { region: 'Orbital', city: 'L5 Stanford Torus', country: 'Orbital Habitats', weight: 6 },
      { region: 'Orbital', city: 'Lagrange Station', country: 'Orbital Habitats', weight: 5 },
      { region: 'Orbital', city: 'O\'Neill Cylinder Alpha', country: 'Orbital Habitats', weight: 5 },
      { region: 'Orbital', city: 'Bernal Sphere Beta', country: 'Orbital Habitats', weight: 4 },
      { region: 'Lunar', city: 'Tranquility Base', country: 'Lunar Authority', weight: 5 },
      { region: 'Lunar', city: 'Shackleton Crater', country: 'Lunar Authority', weight: 4 },
      { region: 'Lunar', city: 'Tycho Underground', country: 'Lunar Authority', weight: 3 },
      { region: 'Martian', city: 'Olympus Mons Colony', country: 'Mars Republic', weight: 5 },
      { region: 'Martian', city: 'Valles Marineris', country: 'Mars Republic', weight: 4 },
      { region: 'Martian', city: 'Cydonia Research', country: 'Mars Republic', weight: 3 },
      { region: 'Martian', city: 'Hellas Basin', country: 'Mars Republic', weight: 3 },
      { region: 'Belt', city: 'Ceres Station', country: 'Belt Alliance', weight: 4 },
      { region: 'Belt', city: 'Vesta Mining Hub', country: 'Belt Alliance', weight: 3 },
      { region: 'Belt', city: 'Pallas Free Port', country: 'Belt Alliance', weight: 3 },
      { region: 'Deep Space', city: 'Generation Ship Exodus', country: 'Interstellar Project', weight: 3 },
      { region: 'Deep Space', city: 'Proxima Relay', country: 'Interstellar Project', weight: 2 },
      { region: 'Virtual', city: 'Consensus Reality', country: 'Digital Commons', weight: 4 },
      { region: 'Virtual', city: 'Dreamspace', country: 'Private Server', weight: 3 },
      { region: 'Virtual', city: 'The Archive', country: 'Post-Mortal Zone', weight: 3 },
    ],
    firstNamePool: {
      male: [
        { name: 'Kai', weight: 4 }, { name: 'Neo', weight: 3 }, { name: 'Zion', weight: 3 },
        { name: 'Atlas', weight: 3 }, { name: 'Orion', weight: 3 }, { name: 'Phoenix', weight: 3 },
        { name: 'Nova', weight: 2 }, { name: 'Axel', weight: 2 }, { name: 'Cyrus', weight: 2 },
        { name: 'Dante', weight: 2 }, { name: 'Elio', weight: 2 }, { name: 'Felix', weight: 2 },
        { name: 'Hugo', weight: 2 }, { name: 'Ion', weight: 2 }, { name: 'Jax', weight: 2 },
        { name: 'Kael', weight: 2 }, { name: 'Lux', weight: 2 }, { name: 'Milo', weight: 2 },
        { name: 'Nyx', weight: 2 }, { name: 'Onyx', weight: 2 }, { name: 'Quill', weight: 1 },
        { name: 'Rune', weight: 2 }, { name: 'Sol', weight: 2 }, { name: 'Titan', weight: 2 },
        { name: 'Unit-7', weight: 1 }, { name: 'Vega', weight: 2 }, { name: 'Xen', weight: 1 },
        { name: 'Yael', weight: 2 }, { name: 'Zero', weight: 2 }, { name: 'Aion', weight: 2 },
        { name: 'Echo', weight: 2 }, { name: 'Flux', weight: 1 }, { name: 'Helix', weight: 1 },
        { name: 'Wei-7', weight: 1 }, { name: 'Chen-Prime', weight: 1 }, { name: 'Singh-9', weight: 1 },
      ],
      female: [
        { name: 'Nova', weight: 4 }, { name: 'Luna', weight: 3 }, { name: 'Aurora', weight: 3 },
        { name: 'Iris', weight: 3 }, { name: 'Lyra', weight: 3 }, { name: 'Stella', weight: 3 },
        { name: 'Vega', weight: 3 }, { name: 'Aria', weight: 3 }, { name: 'Echo', weight: 2 },
        { name: 'Freya', weight: 2 }, { name: 'Gaia', weight: 2 }, { name: 'Hera', weight: 2 },
        { name: 'Io', weight: 2 }, { name: 'Juno', weight: 2 }, { name: 'Kira', weight: 2 },
        { name: 'Lyra', weight: 2 }, { name: 'Maya', weight: 2 }, { name: 'Nyx', weight: 2 },
        { name: 'Opal', weight: 2 }, { name: 'Quinn', weight: 2 }, { name: 'Rhea', weight: 2 },
        { name: 'Sage', weight: 2 }, { name: 'Thea', weight: 2 }, { name: 'Uma', weight: 2 },
        { name: 'Vesper', weight: 2 }, { name: 'Winter', weight: 2 }, { name: 'Xia', weight: 2 },
        { name: 'Yara', weight: 2 }, { name: 'Zara', weight: 2 }, { name: 'Astra', weight: 2 },
        { name: 'Cleo', weight: 2 }, { name: 'Dawn', weight: 2 }, { name: 'Ember', weight: 2 },
        { name: 'Unit-3', weight: 1 }, { name: 'Mei-Prime', weight: 1 }, { name: 'Singh-7', weight: 1 },
      ],
    },
    lastNamePool: [
      { name: 'of Earth', weight: 3 }, { name: 'of Mars', weight: 3 }, { name: 'of the Belt', weight: 3 },
      { name: 'Prime', weight: 2 }, { name: 'Genesis', weight: 2 }, { name: 'Origin', weight: 2 },
      { name: 'Stellar', weight: 2 }, { name: 'Void', weight: 2 }, { name: 'Nexus', weight: 2 },
      { name: 'Nova', weight: 2 }, { name: 'Echo', weight: 2 }, { name: 'Flux', weight: 1 },
      { name: 'Helix', weight: 2 }, { name: 'Quantum', weight: 1 }, { name: 'Synth', weight: 1 },
      { name: 'Chen-7', weight: 2 }, { name: 'Wang-Prime', weight: 1 }, { name: 'Kim-9', weight: 1 },
      { name: 'Singh-3', weight: 2 }, { name: 'Patel-5', weight: 1 }, { name: 'Garcia-11', weight: 1 },
      { name: 'Unit-7', weight: 1 }, { name: 'Clone-Batch-Alpha', weight: 1 }, { name: 'Uploaded', weight: 1 },
      { name: '', weight: 10 },
    ],
    bodyConditions: [
      { condition: 'enhanced', weight: 25 },
      { condition: 'synthetic', weight: 10 },
      { condition: 'robust', weight: 20 },
      { condition: 'healthy', weight: 25 },
      { condition: 'sickly', weight: 10 },
      { condition: 'disabled', weight: 5 },
      { condition: 'uploaded', weight: 5 },
    ],
    socialClasses: [
      { cls: 'posthuman', weight: 15 },
      { cls: 'enhanced citizen', weight: 15 },
      { cls: 'baseline human', weight: 12 },
      { cls: 'AI construct', weight: 10 },
      { cls: 'synthetic worker', weight: 10 },
      { cls: 'orbital elite', weight: 8 },
      { cls: 'earth dweller', weight: 10 },
      { cls: 'belt miner', weight: 8 },
      { cls: 'uploaded consciousness', weight: 5 },
      { cls: 'wildzone scavenger', weight: 4 },
      { cls: 'consensus participant', weight: 3 },
    ],
  },
};

// ─── Era Unlock Logic ────────────────────────────────────────────────────────

const ERA_ORDER = [
  'ANCIENT', 'MEDIEVAL', 'EARLY_MODERN', 'INDUSTRIAL',
  'MODERN', 'NEAR_FUTURE', 'FAR_FUTURE',
];

/**
 * Determine which eras are unlocked based on fragment count.
 * Blank-slate souls (0 fragments) are heavily weighted to ANCIENT/MEDIEVAL.
 * More fragments = more access to later eras.
 * At 10+ fragments, all eras unlocked.
 */
function getUnlockedEras(fragmentCount) {
  if (fragmentCount >= 10) {
    return ERA_ORDER.slice(); // all unlocked
  }

  // Base unlock: each fragment unlocks one additional era tier
  const unlockedCount = Math.max(2, Math.min(fragmentCount + 2, ERA_ORDER.length));
  return ERA_ORDER.slice(0, unlockedCount);
}

/**
 * Build weighted era pool based on fragment count.
 * Heavily biases toward early eras for low-fragment souls.
 */
function buildEraWeights(fragmentCount) {
  const unlocked = getUnlockedEras(fragmentCount);
  const weights = [];

  for (const eraId of ERA_ORDER) {
    if (!unlocked.includes(eraId)) {
      continue;
    }

    const eraIndex = ERA_ORDER.indexOf(eraId);
    let weight;

    if (fragmentCount === 0) {
      // Blank-slate: 70% ANCIENT, 25% MEDIEVAL, 5% EARLY_MODERN
      if (eraId === 'ANCIENT') weight = 70;
      else if (eraId === 'MEDIEVAL') weight = 25;
      else if (eraId === 'EARLY_MODERN') weight = 5;
      else weight = 0;
    } else if (fragmentCount < 5) {
      // Low fragments: still biased early, but some spread
      weight = Math.max(1, 20 - eraIndex * 4);
    } else if (fragmentCount < 10) {
      // Mid fragments: moderate bias toward middle eras
      const midPoint = Math.floor(ERA_ORDER.length / 2);
      const distanceFromMid = Math.abs(eraIndex - midPoint);
      weight = Math.max(1, 10 - distanceFromMid * 2);
    } else {
      // 10+ fragments: all eras equally likely
      weight = 10;
    }

    if (weight > 0) {
      weights.push({ eraId, weight });
    }
  }

  return weights;
}

// ─── Weighted Random Selection ───────────────────────────────────────────────

function weightedRandom(items) {
  if (items.length === 0) return null;
  if (items.length === 1) return items[0];

  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= (item.weight || 1);
    if (random <= 0) return item;
  }

  return items[items.length - 1];
}

function weightedRandomFromPool(pool) {
  return weightedRandom(pool);
}

// ─── Name Generation ─────────────────────────────────────────────────────────

function generateName(era, genderPresentation) {
  const eraData = ERAS[era];
  if (!eraData) return { firstName: 'Unknown', lastName: '' };

  // Determine which name pool to use
  let poolKey;
  if (genderPresentation === 'male') {
    poolKey = 'male';
  } else if (genderPresentation === 'female') {
    poolKey = 'female';
  } else {
    // ambiguous or multiple: pick randomly
    poolKey = Math.random() < 0.5 ? 'male' : 'female';
  }

  const firstNamePool = eraData.firstNamePool[poolKey] || eraData.firstNamePool.male;
  const firstNameEntry = weightedRandomFromPool(firstNamePool);
  const firstName = firstNameEntry ? firstNameEntry.name : 'Unknown';

  const lastNamePool = eraData.lastNamePool;
  const lastNameEntry = weightedRandomFromPool(lastNamePool);
  const lastName = lastNameEntry ? lastNameEntry.name : '';

  return { firstName, lastName };
}

// ─── Body Generation ─────────────────────────────────────────────────────────

function generateBody(era, genderPresentation) {
  const eraData = ERAS[era];
  if (!eraData) {
    return {
      health: 'healthy',
      socialClass: 'unknown',
    };
  }

  const healthEntry = weightedRandomFromPool(eraData.bodyConditions);
  const classEntry = weightedRandomFromPool(eraData.socialClasses);

  return {
    health: healthEntry ? healthEntry.condition : 'healthy',
    socialClass: classEntry ? classEntry.cls : 'unknown',
  };
}

// ─── Location Generation ─────────────────────────────────────────────────────

function generateLocation(era) {
  const eraData = ERAS[era];
  if (!eraData || eraData.locationPool.length === 0) {
    return { city: 'Unknown', region: 'Unknown', country: 'Unknown' };
  }

  const location = weightedRandomFromPool(eraData.locationPool);
  return {
    city: location.city,
    region: location.region,
    country: location.country,
  };
}

// ─── Year Generation ─────────────────────────────────────────────────────────

function generateYear(era) {
  const eraData = ERAS[era];
  if (!eraData) return 2000;

  const [min, max] = eraData.yearRange;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Anchor System ───────────────────────────────────────────────────────────

const ANCHOR_TYPES = ['name', 'city', 'profession', 'face_description'];

const ANCHOR_VALUES = {
  name: [
    'the same name you had before', 'a name you almost remember', 'a name that feels familiar',
    'the name your mother whispered', 'a name carved in stone', 'the name on your first grave',
    'the name you chose yourself', 'the name they called you in the dream',
  ],
  city: [
    'the city you always return to', 'the city that burned', 'the city by the sea',
    'the city of bridges', 'the city that never slept', 'the city under glass',
    'the city that sank', 'the city built on bones',
  ],
  profession: [
    'the work your hands remember', 'the craft passed down through lives',
    'the trade that follows you', 'the calling you cannot refuse',
    'the work you did before you knew why',
  ],
  face_description: [
    'the face you see in every crowd', 'the face from the painting',
    'the face that haunts your sleep', 'the face you trusted once',
    'the face you betrayed', 'the face that forgave you',
  ],
};

/**
 * Determine if this life should have an anchor.
 * ~15% base chance, higher if soul already has anchors.
 */
function shouldGenerateAnchor(soulState) {
  const baseChance = 0.15;
  const existingAnchors = soulState.anchors || [];
  const anchorBonus = existingAnchors.length * 0.1; // +10% per existing anchor
  return Math.random() < Math.min(baseChance + anchorBonus, 0.6);
}

/**
 * Generate an anchor for this life.
 * If soul has existing anchors, try to continue one.
 */
function generateAnchor(soulState, generatedLife) {
  const existingAnchors = soulState.anchors || [];

  // If there are existing anchors, 60% chance to continue one, 40% chance to create a new one
  if (existingAnchors.length > 0 && Math.random() < 0.6) {
    const existing = existingAnchors[Math.floor(Math.random() * existingAnchors.length)];
    // Continue this anchor with slightly increased strength
    return {
      type: existing.type,
      value: existing.value,
      strength: Math.min(existing.strength + 0.1, 1.0),
    };
  }

  // Generate a new anchor
  const type = ANCHOR_TYPES[Math.floor(Math.random() * ANCHOR_TYPES.length)];
  const values = ANCHOR_VALUES[type];
  const value = values[Math.floor(Math.random() * values.length)];
  const strength = 0.3 + Math.random() * 0.5; // 0.3 to 0.8

  // For 'name' anchors, use the generated name
  if (type === 'name') {
    return {
      type: 'name',
      value: generatedLife.name,
      strength,
    };
  }

  // For 'city' anchors, use the generated city
  if (type === 'city') {
    return {
      type: 'city',
      value: generatedLife.location.city,
      strength,
    };
  }

  return { type, value, strength };
}

// ─── Main Roll Function ──────────────────────────────────────────────────────

/**
 * Roll a new life for a soul.
 *
 * @param {Object} soulState - Current state of the soul
 * @param {number} soulState.fragments - Number of memory fragments collected
 * @param {Array} soulState.anchors - Existing anchors from previous lives
 * @returns {Object} The rolled life
 */
function rollSoulLife(soulState) {
  const fragmentCount = soulState.fragments || 0;

  // 1. Select era based on fragment count
  const eraWeights = buildEraWeights(fragmentCount);
  const eraEntry = weightedRandom(eraWeights);
  const era = eraEntry ? eraEntry.eraId : 'ANCIENT';

  // 2. Generate year within era range
  const year = generateYear(era);

  // 3. Generate location
  const location = generateLocation(era);

  // 4. Generate gender presentation
  const genderOptions = ['male', 'female', 'ambiguous', 'multiple'];
  const genderWeights = [40, 40, 12, 8];
  let genderRandom = Math.random() * 100;
  let genderPresentation = 'male';
  let cumulative = 0;
  for (let i = 0; i < genderOptions.length; i++) {
    cumulative += genderWeights[i];
    if (genderRandom <= cumulative) {
      genderPresentation = genderOptions[i];
      break;
    }
  }

  // 5. Generate name
  const { firstName, lastName } = generateName(era, genderPresentation);
  const fullName = lastName ? `${firstName} ${lastName}` : firstName;

  // 6. Generate body attributes
  const body = generateBody(era, genderPresentation);

  // 7. Build life object
  const life = {
    era,
    year,
    location,
    name: fullName,
    genderPresentation,
    health: body.health,
    socialClass: body.socialClass,
  };

  // 8. Determine anchor
  const anchor = shouldGenerateAnchor(soulState) ? generateAnchor(soulState, life) : null;

  // 9. Determine if era was unlocked (for feedback)
  const unlockedEras = getUnlockedEras(fragmentCount);
  const eraUnlocked = unlockedEras.includes(era);

  return {
    life,
    anchor,
    eraUnlocked,
  };
}

// ─── Era Signature ───────────────────────────────────────────────────────────

function getEraSignature(era) {
  const eraData = ERAS[era];
  return eraData ? eraData.eventSignature : 'The world turns without you.';
}

// ─── Era Info ────────────────────────────────────────────────────────────────

function getEraInfo(era) {
  const eraData = ERAS[era];
  if (!eraData) return null;

  return {
    id: eraData.id,
    label: eraData.label,
    yearRange: eraData.yearRange,
    eventSignature: eraData.eventSignature,
    locationCount: eraData.locationPool.length,
  };
}

function getAllEraInfo() {
  return ERA_ORDER.map(eraId => getEraInfo(eraId));
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  rollSoulLife,
  getEraSignature,
  getEraInfo,
  getAllEraInfo,
  getUnlockedEras,
  buildEraWeights,
  generateName,
  generateBody,
  generateLocation,
  generateYear,
  generateAnchor,
  shouldGenerateAnchor,
  weightedRandom,
  ERAS,
  ERA_ORDER,
};
