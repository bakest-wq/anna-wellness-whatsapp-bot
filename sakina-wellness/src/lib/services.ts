import type { LucideIcon } from "lucide-react";
import {
  Brain,
  Flame,
  Flower2,
  Globe2,
  Layers,
  Leaf,
  Wind,
} from "lucide-react";

import {
  formatServiceDurationLabel,
  getServiceDurationMinutes,
} from "@/lib/service-duration";

export type WellnessService = {
  id: string;
  title: string;
  essence: string;
  description: string;
  price: string;
  /** Display label, e.g. "2,5 часа" */
  duration: string;
  /** Minutes used for scheduling */
  durationMinutes: number;
  icon: LucideIcon;
};

function withDuration(
  service: Omit<WellnessService, "durationMinutes">,
): WellnessService {
  const durationMinutes = getServiceDurationMinutes(service.id);
  return {
    ...service,
    durationMinutes,
    duration: formatServiceDurationLabel(durationMinutes),
  };
}

const WELLNESS_SERVICES_BASE = [
  {
    id: "massage-5-continents",
    title: "Массаж «5 континентов»",
    essence: "Путешествие глубокого покоя",
    description:
      "Глубокое расслабление тела, нервной системы и эмоционального напряжения.",
    price: "30 000 ₸",
    duration: "2,5 часа",
    icon: Globe2,
  },
  {
    id: "massage-fire",
    title: "«5 континентов» с огнём",
    essence: "Тепло, которое восстанавливает",
    description:
      "Тепловая практика для глубокого расслабления и восстановления внутренней энергии.",
    price: "35 000 ₸",
    duration: "2,5 часа",
    icon: Flame,
  },
  {
    id: "massage-bamboo",
    title: "«5 континентов» с бамбуковыми банками",
    essence: "Освобождение и лёгкость тела",
    description:
      "Комбинация массажа и вакуумной терапии для снятия зажимов и улучшения циркуляции.",
    price: "33 000 ₸",
    duration: "2,5 часа",
    icon: Layers,
  },
  {
    id: "mukaino-m-test",
    title: "Mukaino M-Test",
    essence: "Услышать тело без слов",
    description:
      "Диагностика через движение и мягкая работа с энергетическими блоками тела.",
    price: "10 000 ₸",
    duration: "40 минут",
    icon: Flower2,
  },
  {
    id: "breathing-practice",
    title: "Дыхательная практика «Дыхание Жизни»",
    essence: "Ритм тишины и вдоха",
    description:
      "Практика для снижения стресса, наполнения энергией и внутреннего успокоения.",
    price: "20 000 ₸",
    duration: "1,5 часа",
    icon: Wind,
  },
  {
    id: "earthflow",
    title: "EarthFlow",
    essence: "Заземление и внутренний центр",
    description:
      "Практика заземления, соединения с телом и восстановления внутреннего баланса.",
    price: "20 000 ₸",
    duration: "1 час",
    icon: Leaf,
  },
  {
    id: "access-bars",
    title: "Access Bars",
    essence: "Пространство для ясности ума",
    description:
      "Мягкая техника расслабления для освобождения от ментального напряжения и перегрузки.",
    price: "15 000 ₸",
    duration: "1 час",
    icon: Brain,
  },
] as const satisfies Omit<WellnessService, "durationMinutes">[];

export const WELLNESS_SERVICES: WellnessService[] =
  WELLNESS_SERVICES_BASE.map(withDuration);

export function getServiceById(id: string): WellnessService | undefined {
  return WELLNESS_SERVICES.find((s) => s.id === id);
}
