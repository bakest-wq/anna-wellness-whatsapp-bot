import {
  buildConciergeBookingMessage,
  type ConciergeBookingPayload,
} from "@/lib/booking-flow";

export type BookingSubmission = {
  serviceId: string;
  serviceTitle: string;
  packageId: string | null;
  packageName: string | null;
  skipPackage: boolean;
  date: string;
  time: string;
  clientName: string;
  phone: string;
};

export type AdminBookingSubmission = BookingSubmission & {
  notes: string | null;
};

export type BookingRecord = {
  service_id: string;
  service_title: string;
  package_id: string | null;
  package_name: string | null;
  preferred_date: string;
  preferred_time: string;
  client_name: string;
  phone: string;
  whatsapp_message: string;
  status: "new" | "confirmed";
  source: "website" | "admin";
};

function buildBookingMessage(
  submission: BookingSubmission,
  notes: string | null,
  prefix?: string,
): string {
  const payload: ConciergeBookingPayload = {
    serviceTitle: submission.serviceTitle,
    packageName: submission.skipPackage ? null : submission.packageName,
    date: submission.date,
    time: submission.time,
    clientName: submission.clientName,
    phone: submission.phone,
  };

  const lines = prefix ? [prefix, ""] : [];
  lines.push(buildConciergeBookingMessage(payload));

  const trimmedNotes = notes?.trim();
  if (trimmedNotes) {
    lines.push("", `Примечания: ${trimmedNotes}`);
  }

  return lines.join("\n");
}

export function toBookingRecord(submission: BookingSubmission): BookingRecord {
  return {
    service_id: submission.serviceId,
    service_title: submission.serviceTitle,
    package_id: submission.skipPackage ? null : submission.packageId,
    package_name: submission.skipPackage ? null : submission.packageName,
    preferred_date: submission.date,
    preferred_time: submission.time,
    client_name: submission.clientName,
    phone: submission.phone,
    whatsapp_message: buildBookingMessage(submission, null),
    status: "new",
    source: "website",
  };
}

export function toAdminBookingRecord(
  submission: AdminBookingSubmission,
): BookingRecord {
  return {
    service_id: submission.serviceId,
    service_title: submission.serviceTitle,
    package_id: submission.skipPackage ? null : submission.packageId,
    package_name: submission.skipPackage ? null : submission.packageName,
    preferred_date: submission.date,
    preferred_time: submission.time,
    client_name: submission.clientName,
    phone: submission.phone,
    whatsapp_message: buildBookingMessage(
      submission,
      submission.notes,
      "Запись создана в панели администратора.",
    ),
    status: "confirmed",
    source: "admin",
  };
}
