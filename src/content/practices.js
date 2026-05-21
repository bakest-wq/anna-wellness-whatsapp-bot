const { SERVICES } = require("../knowledge");

const PRACTICE_PICKER = [
  {
    id: "five",
    route: "practice_five",
    buttonId: "btn_practice_five",
    labelRu: "Массаж «5 континентов»",
    labelKz: "«5 континент» массажы"
  },
  {
    id: "five_fire",
    route: "practice_five_fire",
    buttonId: "btn_practice_five_fire",
    labelRu: "5 континентов с огнём",
    labelKz: "5 континент отпен"
  },
  {
    id: "five_bamboo",
    route: "practice_five_bamboo",
    buttonId: "btn_practice_five_bamboo",
    labelRu: "5 континентов с бамбуковыми банками",
    labelKz: "5 континент бамбук/банка"
  },
  {
    id: "mukaino",
    route: "practice_mukaino",
    buttonId: "btn_practice_mukaino",
    labelRu: "Mukaino M-Test",
    labelKz: "Mukaino M-Test"
  },
  {
    id: "breath",
    route: "practice_breath",
    buttonId: "btn_practice_breath",
    labelRu: "Дыхательная практика",
    labelKz: "Дем алу практикасы"
  },
  {
    id: "earthflow",
    route: "practice_earthflow",
    buttonId: "btn_practice_earthflow",
    labelRu: "EarthFlow",
    labelKz: "EarthFlow"
  },
  {
    id: "bars",
    route: "practice_bars",
    buttonId: "btn_practice_bars",
    labelRu: "Access Bars",
    labelKz: "Access Bars"
  }
];

const PRACTICE_ROUTES = PRACTICE_PICKER.map((p) => p.route);

const PRACTICE_DETAILS = {
  five: {
    ru: {
      title: "Массаж «5 континентов» 🌿",
      what: "Глубокий wellness-ритуал для тела: мягкие и динамичные техники, внимание к разным зонам — как «путешествие» по ощущениям, без спешки.",
      forWho:
        "Подойдёт, если хочется глубоко выдохнуть, отпустить зажимы, восстановиться после напряжённого периода или просто подарить себе время тишины.",
      effect:
        "Часто отмечают: тепло и расслабление в теле, лёгкость, ощущение «перезагрузки», более спокойный сон и мягкое внутреннее состояние. Это не лечение — бережная забота о самочувствии.",
      duration: "2–2,5 часа",
      price: "30 000 ₸",
      closing:
        "Хотите записаться на эту практику или узнать противопоказания? Можно просто отправить цифру 🌿"
    },
    kz: {
      title: "«5 континент» массажы 🌿",
      what: "Дене үшін терең wellness-ритуал: жұмсақ және динамикалық техникалар, әр аймаққа абайлап назар — асықпай.",
      forWho:
        "Терең дем алғыңыз келсе, бұлшықет кернеуін жібергіңіз келсе, шаршаған кезеңнен кейін қалпына келгіңіз келсе — жақсы таңдау.",
      effect:
        "Көбісі: денеде жылу мен босаңсу, жеңілдік, ішкі тыныштық сезімін айтады. Бұл емдеу емес — жайлы күйге жұмсақ қамқорлық.",
      duration: "2–2,5 сағат",
      price: "30 000 ₸",
      closing:
        "Жазылғыңыз келе ме, әлде қарсы көрсетілімді білгіңіз келе ме? Санды жіберіңіз 🌿"
    }
  },
  five_fire: {
    ru: {
      title: "«5 континентов» с огнём 🌿",
      what: "Вариант ритуала «5 континентов» с мягкой огненной терапией: тепло помогает телу глубже расслабиться, сохраняя бережный темп.",
      forWho:
        "Если тянет к теплу, хочется «растопить» внутреннее напряжение и почувствовать уют — при отсутствии противопоказаний к тепловым практикам.",
      effect:
        "Часто — глубокое расслабление, тепло, мягкость в теле, спокойнее дыхание и состояние. Не обещаем лечение — только восстановление ресурса.",
      duration: "2–2,5 часа",
      price: "35 000 ₸",
      closing:
        "Хотите записаться или уточнить противопоказания? Напишите цифру 🌿"
    },
    kz: {
      title: "«5 континент» отпен 🌿",
      what: "Оттымен жұмсақ терапия қосылған нұсқа: дене тереңірек босаңсыйды, темп абайлы.",
      forWho: "Жылу ұнайтындарға, ішкі кернеуді жіберіп, жайлы сезім іздегендерге — қарсы көрсетілім жоқ болса.",
      effect: "Көбіне — терең босаңсу, жылу, тыныш күй. Емдеу емес — қуатты жұмсақ қалпына келтіру.",
      duration: "2–2,5 сағат",
      price: "35 000 ₸",
      closing: "Жазылу немесе қарсы көрсетілім? Санды жіберіңіз 🌿"
    }
  },
  five_bamboo: {
    ru: {
      title: "«5 континентов» с бамбуковыми банками 🌿",
      what: "Ритуал «5 континентов» с бамбуковыми банками: мягкое воздействие, внимание к глубоким слоям мышц, спокойный ритм.",
      forWho:
        "Если нравится ощущение «проработки» без резкости, хочется снять зажимы и почувствовать лёгкость в спине и теле.",
      effect:
        "Нередко — разгрузка в мышцах, тепло, расслабление, лучшее самочувствие на следующий день. Это wellness, не медицинское лечение.",
      duration: "2–2,5 часа",
      price: "33 000 ₸",
      closing:
        "Записаться на сеанс или узнать противопоказания? Можно цифрой 🌿"
    },
    kz: {
      title: "«5 континент» бамбук/банка 🌿",
      what: "Бамбук пен банкалармен: жұмсақ әсер, терең қабаттарға абайлап назар.",
      forWho: "Жұмсақ «терең жұмыс» ұнайтындарға, кернеуді жібергіңіз келсе.",
      effect: "Көбіне — бұлшықетте жеңілдік, жылу, босаңсу. Wellness, емдеу емес.",
      duration: "2–2,5 сағат",
      price: "33 000 ₸",
      closing: "Жазылу немесе қарсы көрсетілім? Санды жіберіңіз 🌿"
    }
  },
  mukaino: {
    ru: {
      title: "Mukaino M-Test 🌿",
      what:
        "Mukaino M-Test — это японская система оценки состояния тела через движения.\n\nВо время сеанса мастер просит клиента выполнить мягкие тестовые движения и наблюдает, где есть ограничение, напряжение или дискомфорт.\n\nПосле этого проводится мягкая коррекция с использованием Microcorn — специальных стимуляторов, которые крепятся на активные точки без прокола кожи.",
      forWho:
        "Подойдёт, если хочется бережно лучше почувствовать тело, понять зоны напряжения и спокойно выбрать следующий формат практики.",
      effect:
        "Сеанс помогает телу мягко расслабиться, улучшить подвижность и снизить ощущение напряжения.\n\nЭто не медицинская диагностика и не лечение заболеваний.",
      duration: "30–40 минут",
      price: "10 000 ₸",
      closing:
        "Хотите записаться на Mukaino M-Test или узнать подробнее, как проходит сеанс? 🌿"
    },
    kz: {
      title: "Mukaino M-Test 🌿",
      what:
        "Mukaino M-Test — дене күйін қозғалыс арқылы бағалаудың жапон жүйесі.\n\nСеанс кезінде шебер клиенттен жұмсақ сынақ қозғалыстарын орындауды сұрайды және шектеу, кернеу немесе ыңғайсыздық қайда екенін бақылайды.\n\nСодан кейін Microcorn — теріге тесілмей белсенді нүктелерге бекітілетін арнайы стимуляторлармен жұмсақ түзету жүргізіледі.",
      forWho:
        "Денені абайлап сезінгіңіз, кернеу аймақтарын түсінгіңіз және келесі практика форматын тыныш таңдағыңыз келсе.",
      effect:
        "Сеанс дененің жұмсақ босануына, қозғалыс жақсаруына және кернеу сезімінің азаюына көмектесуі мүмкін.\n\nБұл медициналық диагностика емес және ауруларды емдеу емес.",
      duration: "30–40 минут",
      price: "10 000 ₸",
      closing:
        "Mukaino M-Test-ке жазылғыңыз келе ме, әлде сеанс қалай өтетінін толығырақ білгіңіз келе ме? 🌿"
    }
  },
  breath: {
    ru: {
      title: "Дыхательная практика «Дыхание Жизни» 🌬️",
      what: "Глубокая дыхательная практика в безопасном пространстве: настройка, дыхание по технике, мягкое завершение.",
      forWho:
        "При усталости, тревожности, эмоциональной перегрузке — когда хочется тишины и внутреннего выдоха.",
      effect:
        "Многие чувствуют: расслабление, лёгкость, спокойнее мысли, мягче сон. Мы не лечим болезни — поддерживаем состояние.",
      duration: "60–90 минут",
      price: "20 000 ₸",
      closing:
        "Хотите записаться на «Дыхание Жизни» или узнать противопоказания? Можно цифрой 🌿"
    },
    kz: {
      title: "«Өмір демі» дем алу практикасы 🌬️",
      what: "Терең дем алу: баптау, техника бойынша дем алу, жұмсақ аяқтау — қауіпсіз кеңістікте.",
      forWho: "Шаршағанда, мазасыздықта, эмоциялық шаршағанда — тыныштық пен ішкі дем алу керек болса.",
      effect: "Көбіне — босаңсу, жеңілдік, тыныш ой. Ауруды емдемейміз — күйді қолдаймыз.",
      duration: "60–90 минут",
      price: "20 000 ₸",
      closing: "Жазылу немесе қарсы көрсетілім? Санды жіберіңіз 🌿"
    }
  },
  earthflow: {
    ru: {
      title: "EarthFlow 🌿",
      what: "Практика мягкого энергетического баланса и восстановления — спокойный темп, внимание к телу и состоянию.",
      forWho:
        "Если хочется «собраться», почувствовать опору и внутреннюю ясность без интенсивного воздействия.",
      effect:
        "Часто — спокойствие, лёгкость, ощущение обновления. Это wellness-поддержка, не медицинское обещание.",
      duration: "1 час",
      price: "20 000 ₸",
      closing:
        "Записаться на EarthFlow или узнать противопоказания? Напишите цифру 🌿"
    },
    kz: {
      title: "EarthFlow 🌿",
      what: "Энергиялық баланс пен қалпына келудің жұмсақ практикасы — асықпай, дене мен күйге назар.",
      forWho: "Ішкі тіректік пен анықтық іздегендерге — қатты әсерсіз.",
      effect: "Көбіне — тыныштық, жеңілдік, жаңарған сезім. Wellness, емдеу емес.",
      duration: "1 сағат",
      price: "20 000 ₸",
      closing: "Жазылу немесе қарсы көрсетілім? Санды жіберіңіз 🌿"
    }
  },
  bars: {
    ru: {
      title: "Access Bars 🌿",
      what: "Мягкая прикосновительная практика для расслабления нервной системы и внутреннего покоя.",
      forWho:
        "Когда много мыслей, сложно выключиться, хочется тишины и мягкого расслабления без активной нагрузки.",
      effect:
        "Нередко — глубокий отдых, спокойнее голова, легче засыпать. Не обещаем излечение — бережно поддерживаем.",
      duration: "1 час",
      price: "15 000 ₸",
      closing:
        "Хотите записаться на Access Bars или узнать противопоказания? Можно цифрой 🌿"
    },
    kz: {
      title: "Access Bars 🌿",
      what: "Жұмсақ түртіп практика: жүйке жүйесін босаңсыту, ішкі тыныштық.",
      forWho: "Ой көп болса, өшірілмей жатса, тыныш босаңсу керек болса.",
      effect: "Көбіне — терең дем алу, тыныш ой, жақсырақ ұйқы. Емдеу уәдесі жоқ — абайлап қолдаймыз.",
      duration: "1 сағат",
      price: "15 000 ₸",
      closing: "Жазылу немесе қарсы көрсетілім? Санды жіберіңіз 🌿"
    }
  }
};

function getServiceMeta(id) {
  return SERVICES.find((s) => s.id === id);
}

const ROUTE_TO_PRACTICE_ID = {
  practice_five: "five",
  practice_five_fire: "five_fire",
  practice_five_bamboo: "five_bamboo",
  practice_mukaino: "mukaino",
  practice_breath: "breath",
  practice_earthflow: "earthflow",
  practice_bars: "bars"
};

function getServiceNameByPracticeId(practiceId) {
  const svc = SERVICES.find((s) => s.id === practiceId);
  return svc?.name || practiceId;
}

function getPracticesPickerIntro(language) {
  const lang = language === "kz" ? "kz" : "ru";
  return lang === "kz"
    ? "Қай практика туралы толығырақ білгіңіз келеді? 🌿"
    : "О какой практике хотите узнать подробнее? 🌿";
}

function getBookingServiceIntro(language) {
  const lang = language === "kz" ? "kz" : "ru";
  return lang === "kz"
    ? "Қуанышпен 🤍\nПрактиканы таңдаңызшы:"
    : "С удовольствием 🤍\nВыберите, пожалуйста, практику:";
}

function getPracticePickerMenuBlock(language) {
  const lang = language === "kz" ? "kz" : "ru";
  const labelKey = lang === "kz" ? "labelKz" : "labelRu";
  const lines = PRACTICE_PICKER.map((p, i) => `${i + 1}️⃣ ${p[labelKey]}`).join("\n");
  const backLabel = lang === "kz" ? "Артқа" : "Назад";
  const footer = lang === "kz" ? "Санды жіберіңіз 🌿" : "Можно просто отправить цифру 🌿";

  return `${lines}\n8️⃣ ${backLabel}\n\n${footer}`;
}

function getPracticesPickerReply(language) {
  return {
    text: getPracticesPickerIntro(language),
    menuContext: "practices_picker"
  };
}

function formatPracticeDetail(id, language) {
  const lang = language === "kz" ? "kz" : "ru";
  const d = PRACTICE_DETAILS[id]?.[lang] || PRACTICE_DETAILS[id]?.ru;
  if (!d) return null;

  const meta = getServiceMeta(id);
  const duration = d.duration || meta?.duration || "";
  const price = d.price || meta?.price || "";

  if (lang === "kz") {
    return `${d.title}

Бұл не: ${d.what}

Кімге жақсы: ${d.forWho}

Қандай әсер сезілуі мүмкін: ${d.effect}

Ұзақтығы: ${duration}
Құны: ${price}

${d.closing}`;
  }

  return `${d.title}

Что это: ${d.what}

Для кого подходит: ${d.forWho}

Какой эффект можно почувствовать: ${d.effect}

Длительность: ${duration}
Стоимость: ${price}

${d.closing}`;
}

function getPracticeDetailReply(routeName, language) {
  const map = {
    practice_five: "five",
    practice_five_fire: "five_fire",
    practice_five_bamboo: "five_bamboo",
    practice_mukaino: "mukaino",
    practice_breath: "breath",
    practice_earthflow: "earthflow",
    practice_bars: "bars"
  };
  const practiceId = map[routeName];
  const text = formatPracticeDetail(practiceId, language);
  if (!text) return null;
  return { text, menuContext: "after_practice_detail" };
}

function resolvePracticePickerChoice(text, buttonId) {
  if (buttonId) {
    const byBtn = PRACTICE_PICKER.find((p) => p.buttonId === buttonId);
    if (byBtn) return byBtn.route;
    if (buttonId === "btn_practices_back") return "back";
  }

  const raw = String(text || "").trim();
  const digit = raw.match(/^([1-8])[️⃣]?\s*$/u) || raw.match(/^([1-8])$/);
  if (digit) {
    const n = Number(digit[1]);
    if (n === 8) return "back";
    const item = PRACTICE_PICKER[n - 1];
    return item?.route || null;
  }

  const norm = raw
    .toLowerCase()
    .replace(/^[\s🌿1-8️⃣]+/u, "")
    .trim();
  for (const p of PRACTICE_PICKER) {
    if (
      norm.includes(p.labelRu.toLowerCase()) ||
      norm.includes(p.labelKz.toLowerCase()) ||
      norm === p.id
    ) {
      return p.route;
    }
  }

  return null;
}

function resolveBookingServiceChoice(text, buttonId) {
  const route = resolvePracticePickerChoice(text, buttonId);
  if (route === "back") return { cancelled: true };
  if (route && ROUTE_TO_PRACTICE_ID[route]) {
    return { practiceId: ROUTE_TO_PRACTICE_ID[route] };
  }

  const raw = String(text || "").trim().toLowerCase();
  if (/access\s*bars|accessbars|барс/i.test(raw)) {
    return { practiceId: "bars" };
  }

  for (const p of PRACTICE_PICKER) {
    const ru = p.labelRu.toLowerCase();
    const kz = p.labelKz.toLowerCase();
    if (raw.includes(ru) || raw.includes(kz) || raw === p.id) {
      return { practiceId: p.id };
    }
  }

  return null;
}

function registerPracticeLabels(labelMap, normalizeLabel) {
  for (const p of PRACTICE_PICKER) {
    labelMap[normalizeLabel(p.labelRu)] = p.route;
    labelMap[normalizeLabel(p.labelKz)] = p.route;
  }
  labelMap["дыхательная практика"] = "practice_breath";
  labelMap["дем алу практикасы"] = "practice_breath";
  labelMap["5 континентов с огнём"] = "practice_five_fire";
  labelMap["5 континент"] = "practice_five";
  labelMap["другие практики"] = "practices";
  labelMap["басқа практикалар"] = "practices";
}

module.exports = {
  PRACTICE_PICKER,
  PRACTICE_ROUTES,
  ROUTE_TO_PRACTICE_ID,
  getPracticesPickerIntro,
  getBookingServiceIntro,
  getPracticePickerMenuBlock,
  getPracticesPickerReply,
  getPracticeDetailReply,
  resolvePracticePickerChoice,
  resolveBookingServiceChoice,
  getServiceNameByPracticeId,
  registerPracticeLabels,
  formatPracticeDetail
};
