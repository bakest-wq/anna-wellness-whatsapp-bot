const SALON = {
  master: "Анна Абдулрашидовна",
  address: "Актобе, район Батыс, Ораз Татеулы 15",
  schedule: "09:00–22:00",
  lastBooking: "20:00"
};

const SERVICES = [
  { id: "five", name: "Массаж «5 континентов»", duration: "2–2,5 часа", price: "30 000 ₸" },
  { id: "five_fire", name: "«5 континентов» с огнём", duration: "2–2,5 часа", price: "35 000 ₸" },
  { id: "five_bamboo", name: "«5 континентов» с бамбуковыми банками", duration: "2–2,5 часа", price: "33 000 ₸" },
  { id: "mukaino", name: "Mukaino M-Test", duration: "30–40 минут", price: "10 000 ₸" },
  { id: "breath", name: "Дыхательная практика", duration: "1 час", price: "20 000 ₸" },
  { id: "earthflow", name: "EarthFlow", duration: "1 час", price: "20 000 ₸" },
  { id: "bars", name: "Access Bars", duration: "1 час", price: "15 000 ₸" }
];

const FAQ = {
  fiveContinents: {
    ru: [
      "Глубокая wellness-практика: мягкие и динамичные техники по всему телу.",
      "Длительность 2–2,5 часа. Помогает расслабиться и восстановить ресурс.",
      "Не является лечением и не заменяет консультацию врача."
    ],
    kz: [
      "Терең wellness-практика: денеге жұмсақ және динамикалық техникалар.",
      "Ұзақтығы 2–2,5 сағат. Босаңсытуға және қуатты қалпына келтіруге көмектеседі.",
      "Емдеу емес және дәрігер кеңесін алмастырмайды."
    ]
  },
  mukaino: {
    ru: "Mukaino M-Test — мягкая оценка движения и баланса, 30–40 минут. Помогает подобрать практику.",
    kz: "Mukaino M-Test — қозғалыс пен баланстың жұмсақ бағасы, 30–40 минут. Практиканы таңдауға көмектеседі."
  },
  contraindications: {
    ru: "При беременности, высокой температуре, острых состояниях или серьёзных заболеваниях лучше предварительно проконсультироваться со специалистом.",
    kz: "Жүктілік, жоғары температура, өткір жағдайлар немесе ауыр ауруларда алдымен маманмен кеңесу ұтымды."
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
Мастер: ${SALON.master}
Адрес: ${SALON.address}
График: ${SALON.schedule}
Последняя запись: ${SALON.lastBooking}

Услуги:
${servicesText}
`.trim();
}

module.exports = {
  SALON,
  SERVICES,
  FAQ,
  servicesListText,
  knowledgeForPrompt
};
