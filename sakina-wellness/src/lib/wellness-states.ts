import type { LucideIcon } from "lucide-react";
import {
  CircleDot,
  Feather,
  Flame,
  Moon,
  Sunrise,
  Waves,
} from "lucide-react";

export type WellnessState = {
  id: string;
  title: string;
  feeling: string;
  practice: string;
  serviceId: string;
  icon: LucideIcon;
};

export const WELLNESS_STATES: WellnessState[] = [
  {
    id: "calm",
    title: "Спокойствие",
    feeling: "Тишина внутри, ровное дыхание, мягкий покой",
    practice: "Дыхательная практика «Дыхание Жизни»",
    serviceId: "breathing-practice",
    icon: Moon,
  },
  {
    id: "lightness",
    title: "Лёгкость",
    feeling: "Свобода в теле, воздушность, отпущенное напряжение",
    practice: "«5 континентов» с бамбуковыми банками",
    serviceId: "massage-bamboo",
    icon: Feather,
  },
  {
    id: "deep-relax",
    title: "Глубокое расслабление",
    feeling: "Тепло, которое растворяет усталость до самых глубин",
    practice: "Массаж «5 континентов»",
    serviceId: "massage-5-continents",
    icon: Waves,
  },
  {
    id: "balance",
    title: "Внутренний баланс",
    feeling: "Центр, ясность и гармония между телом и эмоциями",
    practice: "EarthFlow",
    serviceId: "earthflow",
    icon: CircleDot,
  },
  {
    id: "feminine-energy",
    title: "Женская энергия",
    feeling: "Мягкость, сила, раскрытие и внутренний свет",
    practice: "«5 континентов» с огнём",
    serviceId: "massage-fire",
    icon: Flame,
  },
  {
    id: "recharge",
    title: "Перезагрузка",
    feeling: "Новый ресурс, обновление, забота о себе целиком",
    practice: "Access Bars",
    serviceId: "access-bars",
    icon: Sunrise,
  },
];
