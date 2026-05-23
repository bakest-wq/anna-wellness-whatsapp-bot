import type { WellnessService } from "@/lib/services";
import { getServiceById } from "@/lib/services";

/** Core practices used in the emotional booking journey */
export const JOURNEY_PRACTICE_IDS = [
  "earthflow",
  "access-bars",
  "mukaino-m-test",
  "breathing-practice",
  "massage-5-continents",
] as const;

export type JourneyPracticeId = (typeof JOURNEY_PRACTICE_IDS)[number];

export type WellnessFeelingId =
  | "fatigue"
  | "body-tension"
  | "emotional-exhaustion"
  | "anxiety"
  | "want-relax"
  | "no-energy"
  | "want-recovery"
  | "inner-calm";

export type WellnessFeeling = {
  id: WellnessFeelingId;
  label: string;
  hint: string;
};

export const WELLNESS_FEELINGS: WellnessFeeling[] = [
  {
    id: "fatigue",
    label: "Усталость",
    hint: "Тело просит отдыха и бережного восстановления",
  },
  {
    id: "body-tension",
    label: "Напряжение в теле",
    hint: "Зажимы, тяжесть — хочется мягко отпустить",
  },
  {
    id: "emotional-exhaustion",
    label: "Эмоциональное истощение",
    hint: "Внутри пусто, нужна тишина и забота",
  },
  {
    id: "anxiety",
    label: "Тревожность",
    hint: "Ум не замолкает, хочется спокойствия",
  },
  {
    id: "want-relax",
    label: "Хочу расслабиться",
    hint: "Без суеты — только тепло и выдох",
  },
  {
    id: "no-energy",
    label: "Нет энергии",
    hint: "Хочется мягко вернуть силы и ясность",
  },
  {
    id: "want-recovery",
    label: "Хочу восстановиться",
    hint: "Глубокая перезагрузка тела и состояния",
  },
  {
    id: "inner-calm",
    label: "Хочу внутреннее спокойствие",
    hint: "Тишина внутри, ровное дыхание, покой",
  },
];

/** Service IDs recommended per feeling (ordered by relevance, max 3 shown) */
export const FEELING_SERVICE_MAP: Record<WellnessFeelingId, JourneyPracticeId[]> = {
  fatigue: ["massage-5-continents", "breathing-practice", "access-bars"],
  "body-tension": ["massage-5-continents", "earthflow", "mukaino-m-test"],
  "emotional-exhaustion": [
    "breathing-practice",
    "access-bars",
    "earthflow",
  ],
  anxiety: ["breathing-practice", "access-bars", "earthflow"],
  "want-relax": ["massage-5-continents", "breathing-practice", "access-bars"],
  "no-energy": ["breathing-practice", "earthflow", "mukaino-m-test"],
  "want-recovery": ["massage-5-continents", "earthflow", "breathing-practice"],
  "inner-calm": ["breathing-practice", "access-bars", "earthflow"],
};

export const FEELING_RECOMMENDATION_INTROS: Record<WellnessFeelingId, string> = {
  fatigue:
    "Мы подобрали практики, которые мягко возвращают силы — без спешки и перегруза.",
  "body-tension":
    "Эти ритуалы помогают телу отпустить напряжение и снова почувствовать лёгкость.",
  "emotional-exhaustion":
    "Бережное пространство, где можно выдохнуть и наполниться изнутри.",
  anxiety:
    "Практики, которые успокаивают нервную систему и возвращают ритм дыхания.",
  "want-relax":
    "Тихий путь к глубокому расслаблению — тело, ум и сердце в покое.",
  "no-energy":
    "Мягкое восстановление ресурса: заземление, дыхание и ясность.",
  "want-recovery":
    "Глубокое восстановление — когда хочется почувствовать себя заново.",
  "inner-calm":
    "Практики для внутренней тишины, опоры и спокойного присутствия.",
};

const SERVICE_REASONS: Record<
  JourneyPracticeId,
  Partial<Record<WellnessFeelingId, string>>
> = {
  earthflow: {
    "body-tension": "Мягко заземляет и снимает зажимы в теле",
    anxiety: "Возвращает ощущение опоры и внутреннего покоя",
    "no-energy": "Восстанавливает связь с телом без усилия",
    "want-recovery": "Помогает вернуть баланс и центр",
    "inner-calm": "Тихая практика заземления и присутствия",
    "emotional-exhaustion": "Мягко возвращает к себе и к телу",
  },
  "access-bars": {
    anxiety: "Освобождает ум от тревожного напряжения",
    "emotional-exhaustion": "Пространство тишины для нервной системы",
    fatigue: "Лёгкая глубокая перезагрузка без перегруза",
    "want-relax": "Ум отпускает суету, остаётся покой",
    "inner-calm": "Мягко успокаивает мысли и внутренний шум",
  },
  "mukaino-m-test": {
    "body-tension": "Помогает услышать, где тело хранит напряжение",
    "no-energy": "Мягкая диагностика и пробуждение ресурса",
    "want-recovery": "Тело находит свой естественный ритм",
    fatigue: "Бережно настраивает тело на восстановление",
  },
  "breathing-practice": {
    anxiety: "Успокаивает дыхание и возвращает ясность",
    "emotional-exhaustion": "Наполняет внутренним светом и теплом",
    "no-energy": "Мягко возвращает жизненную силу",
    "inner-calm": "Ритм тишины — глубокое внутреннее спокойствие",
    fatigue: "Восстанавливает дыхание и лёгкость",
    "want-relax": "Погружает в мягкий, глубокий выдох",
    "want-recovery": "Поддерживает восстановление через дыхание",
  },
  "massage-5-continents": {
    "body-tension": "Глубокое расслабление всего тела",
    "want-recovery": "Полное восстановление и состояние покоя",
    fatigue: "Путешествие в глубокий, целостный отдых",
    "want-relax": "Ритуал тихой роскоши и полного расслабления",
    "inner-calm": "Тепло и забота, которые укутывают тело",
  },
};

export function getFeelingById(id: string): WellnessFeeling | undefined {
  return WELLNESS_FEELINGS.find((f) => f.id === id);
}

export function getFeelingRecommendationIntro(
  feelingId: WellnessFeelingId,
): string {
  return (
    FEELING_RECOMMENDATION_INTROS[feelingId] ??
    "Мы подобрали практики бережно — выберите ту, что откликается."
  );
}

export function getRecommendedServices(
  feelingId: WellnessFeelingId,
): (WellnessService & { reason: string })[] {
  const ids = FEELING_SERVICE_MAP[feelingId] ?? [];

  return ids
    .map((id) => {
      const service = getServiceById(id);
      if (!service) return null;
      const reason =
        SERVICE_REASONS[id]?.[feelingId] ??
        "Подобрано с заботой под ваше состояние сегодня";
      return { ...service, reason };
    })
    .filter((s): s is WellnessService & { reason: string } => s !== null);
}
