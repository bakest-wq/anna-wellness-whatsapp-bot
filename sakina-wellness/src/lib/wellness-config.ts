/* eslint-disable @typescript-eslint/no-require-imports */
import type { LucideIcon } from "lucide-react";

const shared = require("../../shared/sakina-wellness.config.js") as typeof import("../../shared/sakina-wellness.config");

export type SharedService = (typeof shared.SERVICES)[number];
export type SharedPackage = (typeof shared.PACKAGES)[number];

export const WELLNESS_BRAND = shared.BRAND;
export const WA_MESSAGES = shared.WA_MESSAGES;
export const SHARED_SERVICES = shared.SERVICES;
export const SHARED_PACKAGES = shared.PACKAGES;
export const WHATSAPP_PHONE = shared.WHATSAPP_PHONE;

export { shared };

export type ServiceWithIcon = SharedService & {
  icon?: LucideIcon;
};
