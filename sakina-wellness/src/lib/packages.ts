import { SHARED_PACKAGES } from "@/lib/wellness-config";

export type WellnessPackage = (typeof SHARED_PACKAGES)[number];

export const WELLNESS_PACKAGES: WellnessPackage[] = [...SHARED_PACKAGES];

export function getPackageById(id: string): WellnessPackage | undefined {
  return WELLNESS_PACKAGES.find((p) => p.id === id);
}
