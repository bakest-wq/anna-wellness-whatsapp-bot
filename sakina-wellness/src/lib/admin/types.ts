export const BOOKING_STATUSES = [
  "new",
  "confirmed",
  "completed",
  "cancelled",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export type BookingRow = {
  id: string;
  created_at: string;
  service_id: string;
  service_title: string;
  package_id: string | null;
  package_name: string | null;
  preferred_date: string;
  preferred_time: string;
  client_name: string;
  phone: string;
  whatsapp_message: string;
  status: string;
  source: string;
};

export type BookingAnalytics = {
  total: number;
  newCount: number;
  confirmedCount: number;
  popularService: string | null;
};
