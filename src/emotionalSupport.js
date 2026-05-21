const { examplesForPrompt } = require("./content/emotionalExamples");

const DISTRESS_PATTERNS = [
  /\b(устал|устала|усталость|выгоран|выгорела|истощен|измотан|нет\s+сил|без\s+сил|сил\s+нет)/i,
  /\b(тревог|тревож|паник|мазасыз|үрей)/i,
  /\b(депресс|подавлен|тяжело|тяжёло|плохо\s+мне|накрывает|пусто\s+внутри)/i,
  /\b(стресс|давит|напряжен|напряжён|күйзеліс|қинал|ауыр\s+күй)/i,
  /\b(груст|плач|одинок|жалғыз|безнадеж|шаршадым|шаршаған)/i,
  /\b(эмоциональн|внутренн.*тяжел|ішкі.*ауыр|күйім|морально)/i,
  /\b(не\s+могу|не\s+знаю\s+что|боюсь|қорқамын|қиналып)/i
];

const EXPLICIT_BOOKING =
  /\b(записаться|запишите|запись|забронир|жазылғым\s+келеді|жазылу\s+керек|хочу\s+запис)/i;

function detectEmotionalDistress(text) {
  const t = String(text || "").trim();
  if (t.length < 4) return false;
  return DISTRESS_PATTERNS.some((re) => re.test(t));
}

function isExplicitBookingRequest(text) {
  return EXPLICIT_BOOKING.test(String(text || ""));
}

function pickVariant(language, key) {
  const pool = SUPPORT_REPLIES[language === "kz" ? "kz" : "ru"];
  const items = pool[key] || pool.general;
  return items[Math.floor(Math.random() * items.length)];
}

const SUPPORT_REPLIES = {
  ru: {
    general: [
      `Слышу вас 🤍\n\nЗдесь можно не спешить.\n\nЕсли захотите — мягко подскажу о пространстве и практиках.`,
      `Понимаю, сейчас может быть непросто 🌿\n\nSakina Wellness — спокойное место для восстановления внутреннего состояния. Бережно, мягко, в вашем ритме.`,
      `Спасибо, что написали 🤍\n\nМы не лечим и не ставим диагнозы — только спокойно поддерживаем тело и состояние.\n\nМожно просто побыть в переписке — это тоже нормально.`
    ],
    anxiety: [
      `Тревога может очень выматывать 🤍\n\nУ нас тихое пространство, где можно мягко выдохнуть и восстановиться — без спешки и без давления.`,
      `Понимаю вас 🌿\n\nМожно не спешить. Когда почувствуете готовность — спокойно расскажу о дыхательных практиках и расслаблении.`
    ],
    burnout: [
      `Выгорание — это правда тяжело 🤍\n\nЗдесь бережно относятся к внутреннему состоянию. Можно не решать всё сразу.`,
      `Слышу усталость 🌿\n\nИногда достаточно просто знать, что есть место для восстановления — без обязательств.`
    ],
    heaviness: [
      `Когда внутри тяжело — важно сначала почувствовать безопасность 🤍\n\nМы рядом спокойно, без продаж и без спешки.`,
      `Ваше состояние понятно 🌿\n\nВ Sakina Wellness можно мягко позаботиться о теле и внутреннем покое — когда будете готовы.`
    ],
    withBookingHint: [
      `Слышу вас 🤍 Сначала — спокойствие и безопасность.\n\nКогда почувствуете готовность, бережно подберём практику и время. Можно не спешить 🌿`,
      `Понимаю 🌿\n\nЗапись не обязательна прямо сейчас. Если захотите — мягко помогу, без давления.`
    ]
  },
  kz: {
    general: [
      `Естіп тұрмын 🤍\n\nМұнда асықпай болады.`,
      `Қазір қиын болуы мүмкін — түсінемін 🌿\n\nБізде ішкі күйді қалпына келтіруге арналған жайлы кеңістік бар. Абайлап, жұмсақ.`
    ],
    anxiety: [
      `Мазасыздық шаршадырады 🤍\n\nБізде тыныш орта бар — асықпай, қысымсыз.`,
      `Түсінемін 🌿\n\nДайын болғанда — тыныс алу және босаңсыту туралы жұмсақ айтып беремін.`
    ],
    burnout: [
      `Күйзеліс шынымен ауыр 🤍\n\nМұнда ішкі күйге абайлап қарайды. Барлығын бірден шешудің қажеті жоқ.`,
      `Шаршағаныңызды естідім 🌿\n\nКейде тек қауіпсіз орын бар екенін білу жеткілікті.`
    ],
    heaviness: [
      `Ішіңіз ауыр болса — алдымен қауіпсіздік маңызды 🤍\n\nБіз асықпай, сатусыз жанасымыз.`,
      `Күйіңізді түсінемін 🌿\n\nДайын болғанда — дене мен ішкі тыныштыққа жұмсақ қамқорлық.`
    ],
    withBookingHint: [
      `Естіп тұрмын 🤍 Алдымен — тыныштық.\n\nДайын болғанда — практика мен уақытты абайлап таңдаймыз 🌿`
    ]
  }
};

function classifyDistress(text) {
  const t = String(text || "").toLowerCase();
  if (/тревог|мазасыз|паник|үрей/.test(t)) return "anxiety";
  if (/выгоран|устал|шарша|истощ|күйзеліс/.test(t)) return "burnout";
  if (/тяжел|тяжёл|депресс|плохо|ауыр|груст|пусто/.test(t)) return "heaviness";
  return "general";
}

function getEmotionalSupportReply(text, language, options = {}) {
  const lang = language === "kz" ? "kz" : "ru";
  const kind = classifyDistress(text);
  let key = kind;

  if (options.explicitBooking || isExplicitBookingRequest(text)) {
    key = "withBookingHint";
  }

  return pickVariant(lang, key);
}

function getSoftPriceReply(language) {
  return language === "kz"
    ? `Абайлап айтып беремін 🌿

«5 континент» — 30 000 ₸ · отпен — 35 000 ₸ · бамбук — 33 000 ₸
Тыныс алу / EarthFlow — 20 000 ₸ · Access Bars — 15 000 ₸

Егер қазір ауыр болса — жазылусыз да болады. Мұнда асықпай болады 🤍`
    : `Спокойно подскажу 🌿

«5 континентов» — 30 000 ₸ · с огнём — 35 000 ₸ · с бамбуком — 33 000 ₸
«Дыхание Жизни» / EarthFlow — 20 000 ₸ · Access Bars — 15 000 ₸

Если сейчас тяжело — можно без записи 🤍`;
}

function shouldHoldSales(session) {
  return Boolean(session?.emotionalHold);
}

function markEmotionalHold(session) {
  session.emotionalHold = true;
  session.emotionalHoldUntil = Date.now() + 30 * 60 * 1000;
}

function clearEmotionalHoldIfExpired(session) {
  if (session?.emotionalHoldUntil && Date.now() > session.emotionalHoldUntil) {
    session.emotionalHold = false;
    session.emotionalHoldUntil = null;
  }
}

module.exports = {
  detectEmotionalDistress,
  isExplicitBookingRequest,
  getEmotionalSupportReply,
  getSoftPriceReply,
  shouldHoldSales,
  markEmotionalHold,
  clearEmotionalHoldIfExpired,
  examplesForPrompt
};
