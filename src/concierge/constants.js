/** Reusable flow definitions — template-ready for multi-business */

const EMOTIONS = [
  { id: "fatigue", buttonId: "btn_ce_fatigue", labelRu: "Усталость", labelKz: "Шаршағандық" },
  { id: "anxiety", buttonId: "btn_ce_anxiety", labelRu: "Тревожность", labelKz: "Мазасыздық" },
  {
    id: "body_tension",
    buttonId: "btn_ce_tension",
    labelRu: "Напряжение в теле",
    labelKz: "Денедегі кернеу"
  },
  { id: "no_energy", buttonId: "btn_ce_no_energy", labelRu: "Нет энергии", labelKz: "Қуат жоқ" },
  {
    id: "emotional_exhaustion",
    buttonId: "btn_ce_exhaustion",
    labelRu: "Эмоциональное истощение",
    labelKz: "Эмоциялық шаршау"
  },
  {
    id: "want_relax",
    buttonId: "btn_ce_relax",
    labelRu: "Хочу расслабиться",
    labelKz: "Босанғым келеді"
  },
  {
    id: "want_peace",
    buttonId: "btn_ce_peace",
    labelRu: "Хочу внутреннее спокойствие",
    labelKz: "Ішкі тыныштық қалайм"
  }
];

const OUTCOMES = [
  {
    id: "deep_relax",
    buttonId: "btn_co_deep_relax",
    labelRu: "Глубокое расслабление",
    labelKz: "Терең босаңсу"
  },
  {
    id: "recovery",
    buttonId: "btn_co_recovery",
    labelRu: "Восстановление",
    labelKz: "Қалпына келу"
  },
  {
    id: "body_lightness",
    buttonId: "btn_co_lightness",
    labelRu: "Лёгкость в теле",
    labelKz: "Денеде жеңілдік"
  },
  { id: "calm", buttonId: "btn_co_calm", labelRu: "Спокойствие", labelKz: "Тыныштық" },
  { id: "recharge", buttonId: "btn_co_recharge", labelRu: "Перезагрузка", labelKz: "Жаңарту" },
  {
    id: "more_energy",
    buttonId: "btn_co_energy",
    labelRu: "Больше энергии",
    labelKz: "Көбірек қуат"
  }
];

const CARD_ACTIONS = [
  {
    id: "detail",
    route: "concierge_detail",
    buttonId: "btn_concierge_detail",
    labelRu: "🌿 Подробнее",
    labelKz: "🌿 Толығырақ"
  },
  {
    id: "book",
    route: "concierge_book",
    buttonId: "btn_concierge_book",
    labelRu: "📅 Записаться",
    labelKz: "📅 Жазылу"
  },
  {
    id: "other",
    route: "concierge_other",
    buttonId: "btn_concierge_other",
    labelRu: "↩️ Другие практики",
    labelKz: "↩️ Басқа практикалар"
  }
];

const PRACTICE_ID_TO_ROUTE = {
  five: "practice_five",
  five_fire: "practice_five_fire",
  five_bamboo: "practice_five_bamboo",
  mukaino: "practice_mukaino",
  breath: "practice_breath",
  earthflow: "practice_earthflow",
  bars: "practice_bars"
};

/** «Для чего чаще выбирают» — эмоционально, без мед. обещаний */
const WHY_CHOSEN = {
  five: {
    ru: "когда хочется глубоко выдохнуть и мягко восстановиться",
    kz: "терең дем алу және жұмсақ қалпына келу керек болса"
  },
  five_fire: {
    ru: "когда тянет к теплу и глубокому расслаблению",
    kz: "жылу мен терең босану ұнайтындарға"
  },
  five_bamboo: {
    ru: "когда важно снять зажимы и почувствовать лёгкость в теле",
    kz: "кернеуді жіберіп, денеде жеңілдік сезінгіңіз келсе"
  },
  mukaino: {
    ru: "когда хочется бережно понять тело и выбрать свой ритм",
    kz: "денені абайлап түсініп, өз ритміңізді табқыңыз келсе"
  },
  breath: {
    ru: "когда нужен внутренний выдох и эмоциональная перезагрузка",
    kz: "ішкі дем алу және эмоциялық жаңарту керек болса"
  },
  earthflow: {
    ru: "когда хочется спокойствия, опоры и мягкого баланса",
    kz: "тыныштық, тірек және жұмсақ баланс іздегенде"
  },
  bars: {
    ru: "когда много мыслей и хочется тихого отдыха для нервной системы",
    kz: "ой көп, жүйке жүйесіне тыныш дем алу керек болса"
  }
};

const DISPLAY_NAMES = {
  five: { ru: "Массаж «5 континентов»", kz: "«5 континент» массажы" },
  five_fire: { ru: "«5 континентов» с огнём", kz: "«5 континент» отпен" },
  five_bamboo: {
    ru: "«5 континентов» с бамбуковыми банками",
    kz: "«5 континент» бамбук/банка"
  },
  mukaino: { ru: "Mukaino M-Test", kz: "Mukaino M-Test" },
  breath: { ru: "Дыхательная практика «Дыхание Жизни»", kz: "«Өмір демі» практикасы" },
  earthflow: { ru: "EarthFlow", kz: "EarthFlow" },
  bars: { ru: "Access Bars", kz: "Access Bars" }
};

module.exports = {
  EMOTIONS,
  OUTCOMES,
  CARD_ACTIONS,
  PRACTICE_ID_TO_ROUTE,
  WHY_CHOSEN,
  DISPLAY_NAMES
};
