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

const ru = tryEmotionalRouting("я устала", "ru");
if (!ru || !/Понимаю вас/.test(ru.outbound.reply) || !/1️⃣ 🌸/.test(ru.outbound.reply)) {
  console.error("FAIL ru outbound");
  process.exit(1);
}

const kz = tryEmotionalRouting("шаршадым", "kz");
if (!kz || !/Түсінемін/.test(kz.outbound.reply) || !/Практика таңдауға/.test(kz.outbound.reply)) {
  console.error("FAIL kz outbound");
  process.exit(1);
}

const heavy = tryEmotionalRouting("мне плохо", "ru");
if (!heavy || heavy.menuContext !== "emotional_heavy" || !/Мне очень жаль/.test(heavy.outbound.reply)) {
  console.error("FAIL heavy");
  process.exit(1);
}

if (resolveMenuAction(null, "2", "emotional_light") !== "practices") {
  console.error("FAIL emotional_light digit 2");
  process.exit(1);
}

if (resolveMenuAction(null, "3", "emotional_heavy") !== "admin_contact") {
  console.error("FAIL emotional_heavy digit 3");
  process.exit(1);
}

console.log("emotional routing OK");
