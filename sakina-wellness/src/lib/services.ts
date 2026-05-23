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

import { SHARED_SERVICES } from "@/lib/wellness-config";
import {
  formatServiceDurationLabel,
  getServiceDurationMinutes,
} from "@/lib/service-duration";

export type WellnessService = {
  id: string;
  botId: string;
  title: string;
  essence: string;
  description: string;
  price: string;
  duration: string;
  durationMinutes: number;
  icon: LucideIcon;
};

const ICON_BY_SITE_ID: Record<string, LucideIcon> = {
  "massage-5-continents": Globe2,
  "massage-fire": Flame,
  "massage-bamboo": Layers,
  "mukaino-m-test": Flower2,
  "breathing-practice": Wind,
  earthflow: Leaf,
  "access-bars": Brain,
};

export const WELLNESS_SERVICES: WellnessService[] = SHARED_SERVICES.map((s) => {
  const durationMinutes =
    s.durationMinutes ?? getServiceDurationMinutes(s.siteId);
  return {
    id: s.siteId,
    botId: s.botId,
    title: s.title,
    essence: s.essence,
    description: s.description,
    price: s.price,
    durationMinutes,
    duration: formatServiceDurationLabel(durationMinutes),
    icon: ICON_BY_SITE_ID[s.siteId] ?? Globe2,
  };
});

export function getServiceById(id: string): WellnessService | undefined {
  return WELLNESS_SERVICES.find((s) => s.id === id);
}

export function getServiceByBotId(botId: string): WellnessService | undefined {
  return WELLNESS_SERVICES.find((s) => s.botId === botId);
}
