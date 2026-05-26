const { detectEmotionalIntent, tryEmotionalRouting } = require("../src/emotionalRouting");
const { resolveMenuAction } = require("../src/menus");

const cases = [
  ["я устала", "fatigue", "light"],
  ["мне тревожно", "anxiety", "light"],
  ["нет сил", "low_energy", "light"],
  ["хочу расслабиться", "need_relaxation", "light"],
  ["шаршадым", "fatigue", "light"],
  ["мазам жоқ", "anxiety", "light"],
  ["уайымдап жүрмін", "anxiety", "light"],
  ["энергия жоқ", "low_energy", "light"],
  ["мне плохо", "heavy_distress", "heavy"],
  ["жылағым келеді", "heavy_distress", "heavy"]
];

for (const [text, intent, tier] of cases) {
  const d = detectEmotionalIntent(text);
  if (!d || d.intent !== intent || d.tier !== tier) {
    console.error("FAIL detect", text, d);
    process.exit(1);
  }
}

const { getSession } = require("../src/sessionStore");
const session = getSession("emo-test");

const ru = tryEmotionalRouting("я устала", "ru", session);
if (
  !ru ||
  !/Понимаю/.test(ru.outbound.reply) ||
  !/EarthFlow|5 континент/i.test(ru.outbound.reply) ||
  !/1️⃣ Мягко записаться/.test(ru.outbound.reply) ||
  /Выберите.*практику/i.test(ru.outbound.reply)
) {
  console.error("FAIL ru outbound", ru?.outbound?.reply?.slice(0, 200));
  process.exit(1);
}

const anxiety = tryEmotionalRouting("мне тревожно", "ru", session);
if (
  !anxiety ||
  !/Access Bars/.test(anxiety.outbound.reply) ||
  !/EarthFlow/.test(anxiety.outbound.reply) ||
  /Выберите.*практику/i.test(anxiety.outbound.reply)
) {
  console.error("FAIL anxiety outbound");
  process.exit(1);
}

const kz = tryEmotionalRouting("шаршадым", "kz", session);
if (!kz || !/Түсінемін/.test(kz.outbound.reply) || !/1️⃣ Жұмсақ жазылу/.test(kz.outbound.reply)) {
  console.error("FAIL kz outbound");
  process.exit(1);
}

const heavy = tryEmotionalRouting("мне плохо", "ru", session);
if (!heavy || heavy.menuContext !== "recommendation_card" || !/Мне очень жаль/.test(heavy.outbound.reply)) {
  console.error("FAIL heavy");
  process.exit(1);
}

if (resolveMenuAction(null, "2", "welcome_feeling") !== "__intent_anxiety__") {
  console.error("FAIL welcome_feeling digit 2", resolveMenuAction(null, "2", "welcome_feeling"));
  process.exit(1);
}

if (resolveMenuAction(null, "2", "main") === "booking") {
  console.log("OK main digit 2 is booking (use welcome_feeling context for emotions)");
}

if (
  resolveMenuAction(null, "Тревога или напряжение", "welcome_feeling") !==
  "__intent_anxiety__"
) {
  console.error("FAIL welcome label anxiety");
  process.exit(1);
}

if (resolveMenuAction(null, "3", "emotional_heavy") !== "admin_contact") {
  console.error("FAIL emotional_heavy digit 3");
  process.exit(1);
}

console.log("emotional routing OK");
