export type WellnessPackage = {
  id: string;
  name: string;
  tagline: string;
  includes: string[];
  result: string;
  price: string;
  featured?: boolean;
};

export const WELLNESS_PACKAGES: WellnessPackage[] = [
  {
    id: "sakina-relax",
    name: "Sakina Relax",
    tagline: "Мягкое погружение в покой",
    includes: [
      "Массаж «5 континентов»",
      "Дыхательная практика «Дыхание Жизни»",
    ],
    result:
      "Глубокое расслабление, снятие напряжения, мягкое восстановление энергии.",
    price: "45 000 ₸",
  },
  {
    id: "sakina-reset",
    name: "Sakina Reset",
    tagline: "Перезагрузка и заземление",
    includes: ["«5 континентов» с бамбуковыми банками", "EarthFlow"],
    result:
      "Перезагрузка тела, заземление, освобождение от накопленной усталости.",
    price: "48 000 ₸",
  },
  {
    id: "sakina-deep",
    name: "Sakina Deep",
    tagline: "Глубина тела и ума",
    includes: ["«5 континентов» с огнём", "Access Bars"],
    result:
      "Глубокое расслабление тела и ума, ощущение внутренней лёгкости.",
    price: "47 000 ₸",
  },
  {
    id: "sakina-balance",
    name: "Sakina Balance",
    tagline: "Возвращение к центру",
    includes: [
      "Mukaino M-Test",
      "Дыхательная практика «Дыхание Жизни»",
      "EarthFlow",
    ],
    result:
      "Диагностика состояния, дыхательное восстановление и возвращение внутреннего баланса.",
    price: "45 000 ₸",
  },
  {
    id: "sakina-premium-journey",
    name: "Sakina Premium Journey",
    tagline: "Полная wellness-перезагрузка",
    includes: [
      "Массаж «5 континентов»",
      "Mukaino M-Test",
      "EarthFlow",
      "Access Bars",
    ],
    result:
      "Полная wellness-перезагрузка: тело, дыхание, энергия и внутреннее спокойствие.",
    price: "75 000 ₸",
    featured: true,
  },
];

export function getPackageById(id: string): WellnessPackage | undefined {
  return WELLNESS_PACKAGES.find((p) => p.id === id);
}
