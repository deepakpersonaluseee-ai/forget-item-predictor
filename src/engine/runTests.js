import { calculateForgottenRiskScore, rankChecklistItems } from './predictionEngine.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n=============================================');
console.log('🧪 RUNNING PREDICTION ENGINE UNIT TESTS');
console.log('=============================================\n');

// Mock Context Baseline
const baseContext = {
  currentDayOfWeek: 2, // Tuesday
  todayWeather: {
    condition: 'sunny',
    temp: 72,
    rainChance: 5,
  },
  upcomingCalendarEvents: [
    { id: 'e1', title: 'Weekly Team Standup', time: '10:00 AM', location: 'Zoom', category: 'work' },
  ],
  historicalForgetRates: {},
  riskThreshold: 16.0,
};

// Test 1: No Context Match (Low score, unflagged)
console.log('Test 1: Low-priority item with no context match');
const casualItem = {
  id: 'book',
  name: 'Paperback Novel',
  category: 'personal',
  icon: '📖',
  baseWeight: 3.0,
  packed: false,
  isFlagged: false,
  score: 0,
  flagReason: '',
};
const res1 = calculateForgottenRiskScore(casualItem, baseContext);
assert(res1.score === 3.0, `Score should equal baseWeight * 1.0 (expected 3.0, got ${res1.score})`);
assert(res1.isFlagged === false, `Item should not be flagged (got ${res1.isFlagged})`);

// Test 2: Manually Boosted Critical Weight (Keys / Meds - high base weight)
console.log('\nTest 2: High base weight essential item (Prescription Meds)');
const medsItem = {
  id: 'meds',
  name: 'Prescription Medication',
  category: 'health',
  icon: '💊',
  baseWeight: 9.5,
  recurringDays: [2], // today
  packed: false,
  isFlagged: false,
  score: 0,
  flagReason: '',
};
const res2 = calculateForgottenRiskScore(medsItem, baseContext);
// baseContrib = 9.5 * 1.0, dayContrib = 9.5 * 1.4 = 13.3. Total = 22.8
assert(res2.score >= 20.0, `Essential daily item score should be high (expected >= 20.0, got ${res2.score})`);
assert(res2.isFlagged === true, `Essential daily item should be flagged (got ${res2.isFlagged})`);

// Test 3: Weather Context Match (Rain forecast triggers Umbrella)
console.log('\nTest 3: Single strong context match (Rain -> Umbrella)');
const rainyContext = {
  ...baseContext,
  todayWeather: {
    condition: 'rainy',
    temp: 64,
    rainChance: 85,
  },
};
const umbrella = {
  id: 'umbrella',
  name: 'Compact Umbrella',
  category: 'weather',
  icon: '☂️',
  baseWeight: 5.0,
  weatherConditionMatch: 'rain',
  packed: false,
  isFlagged: false,
  score: 0,
  flagReason: '',
};
const res3 = calculateForgottenRiskScore(umbrella, rainyContext);
// base = 5.0, weather = 5.0 * 2.8 = 14.0. Total = 19.0
assert(res3.score === 19.0, `Umbrella in rain should score 19.0 (got ${res3.score})`);
assert(res3.isFlagged === true, `Umbrella in rain should be flagged (got ${res3.isFlagged})`);
assert(res3.flagReason.includes('Rain predicted'), `Reason should mention rain (got "${res3.flagReason}")`);

// Test 4: Calendar Keyword Match (Gym class -> Gym Bag)
console.log('\nTest 4: Calendar event match (Gym Session -> Gym Bag)');
const gymCalendarContext = {
  ...baseContext,
  upcomingCalendarEvents: [
    { id: 'e2', title: 'HIIT & Gym — Leg Day', time: '6:00 PM', location: 'Equinox', category: 'fitness' },
  ],
};
const gymBag = {
  id: 'gym-bag',
  name: 'Gym Bag & Sneakers',
  category: 'fitness',
  icon: '👟',
  baseWeight: 6.0,
  calendarKeywordMatch: ['gym', 'workout', 'fitness'],
  packed: false,
  isFlagged: false,
  score: 0,
  flagReason: '',
};
const res4 = calculateForgottenRiskScore(gymBag, gymCalendarContext);
// base = 6.0, calendar = 6.0 * 3.0 = 18.0. Total = 24.0
assert(res4.score === 24.0, `Gym bag with calendar event should score 24.0 (got ${res4.score})`);
assert(res4.isFlagged === true, `Gym bag should be flagged (got ${res4.isFlagged})`);
assert(res4.flagReason.includes('Gym'), `Reason should mention calendar event (got "${res4.flagReason}")`);

// Test 5: Multiple Stacked Matches (Laptop Charger: Work day + Client meeting + Past forgotten history)
console.log('\nTest 5: Multiple stacked context signals (Day + Calendar + Past Forgets)');
const stackedContext = {
  ...baseContext,
  currentDayOfWeek: 2,
  upcomingCalendarEvents: [
    { id: 'e3', title: 'Critical Client Pitch', time: '2:00 PM', location: 'Downtown', category: 'work' },
  ],
  historicalForgetRates: {
    charger: 2, // forgot 2 times before
  },
};
const charger = {
  id: 'charger',
  name: 'USB-C Laptop Charger',
  category: 'tech',
  icon: '🔌',
  baseWeight: 7.0,
  recurringDays: [1, 2, 3, 4, 5],
  calendarKeywordMatch: ['client', 'pitch', 'presentation'],
  packed: false,
  isFlagged: false,
  score: 0,
  flagReason: '',
};
const res5 = calculateForgottenRiskScore(charger, stackedContext);
// base = 7.0, day = 7.0 * 1.4 = 9.8, calendar = 7.0 * 3.0 = 21.0, hist = 7.0 * 1.2 = 8.4. Total = 46.2
assert(res5.score >= 40.0, `Stacked signals should yield a high risk score >= 40 (got ${res5.score})`);
assert(res5.isFlagged === true, `Charger should be high priority flagged (got ${res5.isFlagged})`);

// Test 6: Real-time Re-ranking sorting verification
console.log('\nTest 6: Real-time re-ranking of item collection');
const itemsList = [casualItem, umbrella, gymBag, charger];
const ranked = rankChecklistItems(itemsList, {
  ...rainyContext,
  upcomingCalendarEvents: [
    { id: 'e2', title: 'HIIT & Gym — Leg Day', time: '6:00 PM', location: 'Equinox', category: 'fitness' },
    { id: 'e3', title: 'Critical Client Pitch', time: '2:00 PM', location: 'Downtown', category: 'work' },
  ],
  historicalForgetRates: { charger: 2 },
});
assert(ranked[0].id === 'charger', `Highest risk item should be first (expected 'charger', got '${ranked[0].id}')`);
assert(ranked[ranked.length - 1].id === 'book', `Lowest risk item should be last (expected 'book', got '${ranked[ranked.length - 1].id}')`);

console.log(`\n=============================================`);
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log(`=============================================\n`);

if (failed > 0) {
  process.exit(1);
}
