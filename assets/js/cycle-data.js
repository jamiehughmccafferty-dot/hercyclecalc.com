/* ============================================================
 * HerCycleCalc, domain data & constants
 *
 * Single source of truth for the cycle / pregnancy / early-years
 * knowledge the calculators draw on. Content is general,
 * evidence-informed and educational, NOT medical advice.
 *
 * UK context: appointment schedule mirrors the typical NHS antenatal
 * pathway. Verify against nhs.uk before relying on dates.
 * ============================================================ */
window.HC_DATA = (function () {
  const GESTATION_DAYS = 280;   // 40 weeks from LMP (Naegele's rule)
  const LUTEAL_DEFAULT = 14;    // days from ovulation to next period
  const CYCLE_DEFAULT  = 28;
  const FERTILE_BEFORE = 5;     // sperm can survive ~5 days
  const FERTILE_AFTER  = 1;     // egg viable ~24h after ovulation

  /* Week-by-week size comparison + a short development note.
     Indexed by gestational week (LMP-based). Weeks 4-40. */
  const WEEKS = {
    4:  { size: 'Poppy seed',     dev: 'The embryo is implanting and the placenta is starting to form.' },
    5:  { size: 'Sesame seed',    dev: 'The neural tube, baby\'s brain and spinal cord, begins to develop.' },
    6:  { size: 'Lentil',         dev: 'A tiny heart starts to beat and facial features begin forming.' },
    7:  { size: 'Blueberry',      dev: 'Arm and leg buds appear; the brain is growing quickly.' },
    8:  { size: 'Raspberry',      dev: 'Fingers and toes are forming and baby is starting to move.' },
    9:  { size: 'Cherry',         dev: 'Essential organs are in place; baby is now officially a foetus.' },
    10: { size: 'Strawberry',     dev: 'Vital organs are working and tiny nails begin to form.' },
    11: { size: 'Lime',           dev: 'Baby can stretch and tumble; bones are starting to harden.' },
    12: { size: 'Plum',           dev: 'Reflexes develop and the digestive system begins to practise.' },
    13: { size: 'Lemon',          dev: 'Vocal cords form and fingerprints appear. End of the first trimester.' },
    14: { size: 'Peach',          dev: 'Baby can squint, frown and grasp; the body is catching up with the head.' },
    15: { size: 'Apple',          dev: 'Baby can sense light and is forming taste buds.' },
    16: { size: 'Avocado',        dev: 'You may start to feel tiny flutters as muscles strengthen.' },
    17: { size: 'Pomegranate',    dev: 'A protective coating (vernix) starts to develop on the skin.' },
    18: { size: 'Sweet potato',   dev: 'Ears are in position and baby may hear muffled sounds.' },
    19: { size: 'Mango',          dev: 'A waxy vernix and fine hair (lanugo) protect baby\'s skin.' },
    20: { size: 'Banana',         dev: 'Halfway there. The anomaly scan checks growth and development.' },
    21: { size: 'Carrot',         dev: 'Baby\'s movements are becoming more coordinated.' },
    22: { size: 'Papaya',         dev: 'Features look more defined; baby is developing a sense of touch.' },
    23: { size: 'Grapefruit',     dev: 'Baby is putting on weight and the lungs are developing.' },
    24: { size: 'Corn cob',       dev: 'A milestone of viability; the inner ear is now fully formed.' },
    25: { size: 'Swede',          dev: 'Baby is gaining baby fat and the skin is becoming less translucent.' },
    26: { size: 'Lettuce',        dev: 'Eyes begin to open and baby responds to sound.' },
    27: { size: 'Cauliflower',    dev: 'Baby has regular sleep and wake cycles. Start of the third trimester.' },
    28: { size: 'Aubergine',      dev: 'Baby can blink and the brain is developing rapidly.' },
    29: { size: 'Butternut squash', dev: 'Bones are fully formed but still soft; muscles are maturing.' },
    30: { size: 'Cabbage',        dev: 'Baby\'s grip strengthens and eyesight continues to develop.' },
    31: { size: 'Coconut',        dev: 'Baby can turn their head and is gaining weight steadily.' },
    32: { size: 'Squash',         dev: 'Practising breathing movements; toenails are now visible.' },
    33: { size: 'Pineapple',      dev: 'The skull stays soft and flexible, ready for birth.' },
    34: { size: 'Cantaloupe',     dev: 'Lungs are nearly mature; baby may move into a head-down position.' },
    35: { size: 'Honeydew melon', dev: 'Kidneys are fully developed and the liver is processing waste.' },
    36: { size: 'Romaine lettuce', dev: 'Baby is likely head-down and gaining around 28g a day.' },
    37: { size: 'Chard',          dev: 'Considered early term; baby is rehearsing for life outside.' },
    38: { size: 'Leek',           dev: 'Organs are ready; baby continues to add a layer of fat.' },
    39: { size: 'Mini watermelon', dev: 'Full term. Baby\'s brain and lungs continue to mature.' },
    40: { size: 'Small pumpkin',  dev: 'Your due date. Only about 1 in 20 babies arrive exactly on it.' }
  };

  function weekInfo(week) {
    const w = Math.max(4, Math.min(40, Math.round(week)));
    return Object.assign({ week: w }, WEEKS[w] || WEEKS[40]);
  }

  function trimester(week) {
    if (week < 13) return 1;
    if (week < 27) return 2;
    return 3;
  }

  /* Typical UK (NHS) antenatal pathway + key prep milestones.
     `week` is gestational week. type: appointment | scan | development | todo */
  const PREGNANCY_MILESTONES = [
    { week: 6,  type: 'todo',        title: 'Contact your GP or midwife', body: 'Register your pregnancy so your antenatal care can be booked. Start a daily 400µg folic acid supplement if you haven\'t already.' },
    { week: 8,  type: 'appointment', title: 'Booking appointment', body: 'Your first proper midwife appointment (usually weeks 8-12): health history, blood tests and lots of information.' },
    { week: 12, type: 'scan',        title: 'Dating scan', body: 'The 12-week scan confirms your due date and checks baby\'s development. Combined screening may be offered.' },
    { week: 16, type: 'appointment', title: '16-week check', body: 'A shorter midwife appointment to review test results and check your wellbeing.' },
    { week: 20, type: 'scan',        title: 'Anomaly scan', body: 'A detailed 20-week scan checking baby\'s growth and development. You may be able to find out the sex.' },
    { week: 24, type: 'development', title: 'Viability milestone', body: 'Around now baby reaches an important developmental milestone. Start thinking about your maternity leave plans.' },
    { week: 25, type: 'appointment', title: '25-week check (first baby)', body: 'An extra appointment if this is your first pregnancy, measuring your bump and baby\'s growth.' },
    { week: 28, type: 'appointment', title: '28-week check', body: 'Blood tests, anti-D if your blood type is Rhesus negative, and a glucose check if needed.' },
    { week: 31, type: 'appointment', title: '31-week check', body: 'Reviewing results and baby\'s growth. A good time to start your birth plan.' },
    { week: 34, type: 'appointment', title: '34-week check', body: 'Information about labour and birth. Your hospital bag can start coming together.' },
    { week: 36, type: 'appointment', title: '36-week check', body: 'Baby\'s position is checked. Feeding and newborn care are discussed.' },
    { week: 38, type: 'appointment', title: '38-week check', body: 'Now full term. Final preparations, car seat fitted, bag packed, plan in place.' },
    { week: 40, type: 'development', title: 'Your due date', body: 'Most babies arrive within a week or two either side. Keep an eye on baby\'s movements.' },
    { week: 41, type: 'appointment', title: '41-week check', body: 'A membrane sweep may be offered and induction discussed if baby hasn\'t arrived.' }
  ];

  /* Early-years stages, keyed by age range in days from birth.
     Milestones are typical ranges, every child develops differently. */
  const EARLY_YEARS = [
    { fromDays: 0,    toDays: 41,   label: 'Newborn (0-6 weeks)',       milestones: ['Focuses on faces ~20-30cm away', 'Startle (Moro) reflex', 'Cluster feeding and frequent naps', 'First social smiles emerging near 6 weeks'] },
    { fromDays: 42,   toDays: 90,   label: '6 weeks, 3 months',        milestones: ['Smiles socially and coos', 'Holds head up during tummy time', 'Follows objects with eyes', 'Starting to find a rhythm'] },
    { fromDays: 91,   toDays: 180,  label: '3-6 months',              milestones: ['Laughs and babbles', 'Reaches for and grabs toys', 'Rolls over', 'May start showing interest in food'] },
    { fromDays: 181,  toDays: 270,  label: '6-9 months',              milestones: ['Sits without support', 'Weaning onto solid foods', 'Responds to their name', 'Passes objects between hands'] },
    { fromDays: 271,  toDays: 365,  label: '9-12 months',             milestones: ['Crawls or shuffles', 'Pulls up to stand', 'Waves and claps', 'First words may appear'] },
    { fromDays: 366,  toDays: 547,  label: '12-18 months',            milestones: ['First independent steps', 'Says several single words', 'Points to show you things', 'Drinks from a cup'] },
    { fromDays: 548,  toDays: 730,  label: '18 months, 2 years',       milestones: ['Walks confidently and climbs', 'Vocabulary growing quickly', 'Begins simple pretend play', 'Feeds self with a spoon'] },
    { fromDays: 731,  toDays: 1095, label: '2-3 years',               milestones: ['Two- to three-word sentences', 'Runs and kicks a ball', 'Begins toilet training', 'Plays alongside other children'] },
    { fromDays: 1096, toDays: 1460, label: '3-4 years',               milestones: ['Speaks in longer sentences', 'Draws simple shapes', 'Shares and takes turns', 'May start nursery or pre-school'] },
    { fromDays: 1461, toDays: 1825, label: '4-5 years',               milestones: ['Tells short stories', 'Hops and balances on one foot', 'Dresses with little help', 'Getting ready for school'] }
  ];

  function earlyStage(ageDays) {
    return EARLY_YEARS.find(s => ageDays >= s.fromDays && ageDays <= s.toDays) || EARLY_YEARS[EARLY_YEARS.length - 1];
  }

  /* Baby shopping timeline, grouped by phase, anchored to gestational week.
     `category` maps to the affiliate registry for relevant picks. */
  const SHOPPING = [
    { fromWeek: 0,  toWeek: 13,  phase: 'First trimester', sub: 'No rush, focus on you', category: 'pregnancy',
      items: ['Pregnancy multivitamin with folic acid', 'A good water bottle', 'Comfortable, non-wired bras', 'A pregnancy book or app you trust'] },
    { fromWeek: 13, toWeek: 27,  phase: 'Second trimester', sub: 'The comfortable planning window', category: 'pregnancy',
      items: ['Maternity clothes and supportive leggings', 'Pregnancy pillow', 'Start researching pushchairs and car seats', 'Bump-friendly skincare'] },
    { fromWeek: 27, toWeek: 35,  phase: 'Early third trimester', sub: 'Buy the big items now', category: 'nursery',
      items: ['Cot or crib and a new mattress', 'Pushchair / travel system', 'Car seat (have it fitted)', 'Nappies, wipes and a changing mat', 'Baby monitor'] },
    { fromWeek: 35, toWeek: 41,  phase: 'Nesting & hospital bag', sub: 'Ready for baby', category: 'newborn',
      items: ['Hospital bag for you and baby', 'Newborn vests, sleepsuits and a going-home outfit', 'Muslins, bibs and burp cloths', 'Feeding kit (bottles or nursing essentials)', 'First-size nappies'] }
  ];

  return {
    GESTATION_DAYS, LUTEAL_DEFAULT, CYCLE_DEFAULT, FERTILE_BEFORE, FERTILE_AFTER,
    WEEKS, weekInfo, trimester,
    PREGNANCY_MILESTONES, EARLY_YEARS, earlyStage, SHOPPING
  };
})();
