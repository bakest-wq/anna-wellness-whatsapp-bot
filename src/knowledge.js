const { BRAND } = require("./brand");

const WELLNESS = {
  brand: BRAND.name,
  master: "Анна Абдулрашидовна",
  address: "Актобе, район Батыс, Ораз Татеулы 15",
  schedule: "09:00–22:00",
  lastBooking: "20:00",
  tagline: BRAND.subtitle
};

const SERVICES = [
  { id: "five", name: "Массаж «5 континентов»", duration: "2–2,5 часа", price: "30 000 ₸" },
  { id: "five_fire", name: "«5 континентов» с огнём", duration: "2–2,5 часа", price: "35 000 ₸" },
  { id: "five_bamboo", name: "«5 континентов» с бамбуковыми банками", duration: "2–2,5 часа", price: "33 000 ₸" },
  { id: "mukaino", name: "Mukaino M-Test", duration: "30–40 минут", price: "10 000 ₸" },
  {
    id: "breath",
    name: "Дыхательная практика «Дыхание Жизни»",
    duration: "60–90 минут",
    price: "20 000 ₸"
  },
  { id: "earthflow", name: "EarthFlow", duration: "1 час", price: "20 000 ₸" },
  { id: "bars", name: "Access Bars", duration: "1 час", price: "15 000 ₸" }
];

const FAQ = {
  fiveContinents: {
    ru: [
      "Глубокая wellness-практика: мягкие и динамичные техники по всему телу.",
      "Длительность 2–2,5 часа. Помогает расслабиться и восстановить ресурс.",
      "Помогает телу мягко расслабиться и восстановить ресурс."
    ],
    kz: [
      "Терең wellness-практика: денеге жұмсақ және динамикалық техникалар.",
      "Ұзақтығы 2–2,5 сағат. Босаңсытуға және қуатты қалпына келтіруге көмектеседі.",
      "Дененің жұмсақ босануына және қуатты қалпына келуіне көмектеседі."
    ]
  },
  mukaino: {
    ru: "Mukaino M-Test — японская система оценки тела через движения и мягкую коррекцию Microcorn. 30–40 минут.",
    kz: "Mukaino M-Test — қозғалыс арқылы дене күйін бағалау және Microcorn түзетуі. 30–40 минут."
  },
  contraindications: {
    ru: "При беременности, высокой температуре, острых состояниях или серьёзных заболеваниях лучше предварительно проконсультироваться со специалистом.",
    kz: "Жүктілік, жоғары температура, өткір жағдайлар немесе ауыр ауруларда алдымен маманмен кеңесу ұтымды."
  },
  fiveComparison: {
    ru: "Подробное сравнение: огненная терапия vs бамбук и банки — по запросу клиента.",
    kz: "Оттымен терапиясы мен бамбук/банкалар айырмашылығы — сұрағанда толық түсіндіреміз."
  },
  breathingLife: {
    ru: "«Дыхание Жизни» — полное описание практики по запросу клиента.",
    kz: "«Өмір демі» практикасы — сұрағанда толық түсіндіреміз."
  },
  breathingGayaEarthflow: {
    ru: "«Дыхание Жизни» + Gaya Touch + EarthFlow — полное описание по запросу.",
    kz: "Gaya Touch және EarthFlow — сұрағанда толық түсіндіреміз."
  }
};

function servicesListText(language) {
  if (language === "kz") {
    return SERVICES.map((s) => `• ${s.name} — ${s.price}, ${s.duration}`).join("\n");
  }
  return SERVICES.map((s) => `• ${s.name} — ${s.price}, ${s.duration}`).join("\n");
}

function knowledgeForPrompt() {
  const servicesText = SERVICES.map(
    (s, i) => `${i + 1}. ${s.name} — ${s.duration} — ${s.price}`
  ).join("\n");

  return `
Бренд: ${WELLNESS.brand} — premium wellness studio (не салон красоты).
Стиль: безопасное пространство, мягкая поддержка, восстановление внутреннего состояния. Не продавать при усталости/тревоге.
Мастер: ${WELLNESS.master}
Адрес: ${WELLNESS.address}
График: ${WELLNESS.schedule}
Последняя запись: ${WELLNESS.lastBooking}

Практики и ритуалы:
${servicesText}
`.trim();
}

module.exports = {
  WELLNESS,
  SALON: WELLNESS,
  SERVICES,
  FAQ,
  servicesListText,
  knowledgeForPrompt
};
