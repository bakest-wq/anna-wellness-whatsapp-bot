/** Booking duration in minutes (used for overlap and working-hours checks) */
export const SERVICE_DURATION_MINUTES: Record<string, number> = {
  "massage-5-continents": 150,
  "massage-fire": 150,
  "massage-bamboo": 150,
  "mukaino-m-test": 40,
  "breathing-practice": 90,
  earthflow: 60,
  "access-bars": 60,
};

const DEFAULT_DURATION_MINUTES = 60;

export function getServiceDurationMinutes(serviceId: string): number {
  return SERVICE_DURATION_MINUTES[serviceId] ?? DEFAULT_DURATION_MINUTES;
}

export function formatServiceDurationLabel(minutes: number): string {
  if (minutes % 60 === 0 && minutes >= 60) {
    const hours = minutes / 60;
    if (hours === 1) return "1 час";
    if (hours < 5) return `${hours} часа`;
    return `${hours} часов`;
  }

  if (minutes === 90) return "1,5 часа";
  if (minutes === 150) return "2,5 часа";

  if (minutes < 60) return `${minutes} минут`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return formatServiceDurationLabel(hours * 60);
  return `${hours} ч ${rest} мин`;
}

export function isKnownServiceId(serviceId: string): boolean {
  return serviceId in SERVICE_DURATION_MINUTES;
}
