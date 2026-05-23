const shared = require("../shared/sakina-wellness.config");
const { BRAND } = require("./brand");

const WELLNESS = {
  brand: shared.BRAND.name,
  master: shared.BRAND.master,
  address: shared.BRAND.addressFull,
  schedule: shared.BRAND.schedule,
  lastBooking: shared.BRAND.lastBooking,
  tagline: BRAND.subtitle,
  website: shared.BRAND.website,
  whatsappPhone: shared.WHATSAPP_PHONE
};

const SERVICES = shared.SERVICES.map((s) => ({
  id: s.botId,
  siteId: s.siteId,
  name: s.title,
  duration: s.duration,
  price: s.price,
  essence: s.essence,
  description: s.description
}));

const PACKAGES = shared.PACKAGES;

const FAQ = {
  fiveContinents: {
    ru: [
      "Глубокая wellness-практика: мягкие и динамичные техники по всему телу.",
      "Длительность 2–2,5 часа. Помогает телу мягко расслабиться и восстановить ресурс."
    ],
    kz: [
      "Терең wellness-практика: денеге жұмсақ және динамикалық техникалар.",
      "Ұзақтығы 2–2,5 сағат. Босаңсытуға және қуатты қалпына келтіруге көмектеседі."
    ]
  },
  mukaino: {
    ru: "Mukaino M-Test — оценка тела через движение и мягкая коррекция Microcorn. 40 минут.",
    kz: "Mukaino M-Test — қозғалыс арқылы дене күйін бағалау. 40 минут."
  },
  contraindications: {
    ru: "При беременности, высокой температуре или острых состояниях лучше предварительно согласовать формат.",
    kz: "Жүктілік, жоғары температура немесе өткір жағдайларда алдымен форматты кеңесу ұтымды."
  },
  fiveComparison: {
    ru: "Сравнение вариантов «5 континентов» — по запросу, бережно и без спешки.",
    kz: "«5 континент» нұсқалары — сұрағанда абайлап түсіндіреміз."
  },
  breathingLife: {
    ru: "«Дыхание Жизни» — полное описание практики по запросу.",
    kz: "«Өмір демі» — сұрағанда толық түсіндіреміз."
  },
  breathingGayaEarthflow: {
    ru: "Gaya Touch и EarthFlow — по запросу.",
    kz: "Gaya Touch және EarthFlow — сұрағанда."
  }
};

function servicesListText(language) {
  return SERVICES.map((s) => `• ${s.name} — ${s.price}, ${s.duration}`).join("\n");
}

function packagesListText(language) {
  if (language === "kz") {
    return PACKAGES.map((p) => `• ${p.name} — ${p.price}`).join("\n");
  }
  return PACKAGES.map((p) => `• ${p.name} — ${p.price}\n  ${p.tagline}`).join("\n\n");
}

function knowledgeForPrompt() {
  const servicesText = SERVICES.map(
    (s, i) => `${i + 1}. ${s.name} — ${s.duration} — ${s.price}`
  ).join("\n");
  const packagesText = PACKAGES.map((p) => `- ${p.name}: ${p.price}`).join("\n");

  return `
Бренд: ${WELLNESS.brand} — premium wellness studio (не салон красоты).
Сайт: ${WELLNESS.website}
Стиль: безопасное пространство, мягкая поддержка, восстановление внутреннего состояния.
Мастер: ${WELLNESS.master}
Адрес: ${WELLNESS.address}
График: ${WELLNESS.schedule}
Последняя запись: ${WELLNESS.lastBooking}

Практики:
${servicesText}

Wellness-пакеты:
${packagesText}
`.trim();
}

module.exports = {
  WELLNESS,
  SALON: WELLNESS,
  SERVICES,
  PACKAGES,
  FAQ,
  servicesListText,
  packagesListText,
  knowledgeForPrompt,
  sharedConfig: shared
};
