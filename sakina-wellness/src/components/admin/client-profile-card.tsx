"use client";

import { ArrowLeft, MessageCircle, User } from "lucide-react";
import { ClientNotesField } from "@/components/admin/client-notes-field";
import { StatusBadge } from "@/components/admin/status-badge";
import { StatusSelect } from "@/components/admin/status-select";
import { WhatsAppQuickReplies } from "@/components/admin/whatsapp-quick-replies";
import { getBookingTimeRange } from "@/lib/admin/schedule-utils";
import type { ClientProfile } from "@/lib/admin/clients";
import { formatClientPhoneDisplay } from "@/lib/admin/phone";
import { buildWhatsAppUrl, normalizePhoneForWhatsApp } from "@/lib/admin/whatsapp";
import type { BookingRow, BookingStatus } from "@/lib/admin/types";
import { formatBookingDate } from "@/lib/booking-flow";
import { cn } from "@/lib/cn";

type ClientProfileCardProps = {
  client: ClientProfile;
  updatingId: string | null;
  onStatusChange: (bookingId: string, status: BookingStatus) => void;
  onNotesSaved: (phoneKey: string, notes: string, updatedAt: string) => void;
  onBack?: () => void;
  showBack?: boolean;
};

export function ClientProfileCard({
  client,
  updatingId,
  onStatusChange,
  onNotesSaved,
  onBack,
  showBack = false,
}: ClientProfileCardProps) {
  const whatsappHref = buildWhatsAppUrl(
    client.phoneKey,
    `Здравствуйте, ${client.name}!`,
  );

  return (
    <article className="admin-client-profile admin-panel rounded-[1.5rem] p-4 sm:p-6">
      {showBack && onBack && (
        <button
          type="button"
          onClick={onBack}
          className="text-soft mb-4 inline-flex items-center gap-1.5 text-[13px] transition-colors hover:text-[#5F735B]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          К списку клиентов
        </button>
      )}

      <header className="flex flex-col gap-4 border-b border-[#EDE4D4]/80 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#9CAA8F]/15 text-[#5F735B]">
            <User className="h-6 w-6" strokeWidth={1.25} />
          </div>
          <div>
            <h2 className="font-display text-[1.5rem] text-[#3D3830] sm:text-[1.75rem]">
              {client.name}
            </h2>
            <p className="text-muted mt-1 text-[15px]">
              {formatClientPhoneDisplay(normalizePhoneForWhatsApp(client.phoneKey))}
            </p>
            <p className="text-soft mt-0.5 text-[13px]">{client.phoneDisplay}</p>
          </div>
        </div>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline-gold inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 text-[14px] font-semibold"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
          WhatsApp
        </a>
      </header>

      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatItem label="Визитов" value={String(client.totalVisits)} />
        <StatItem
          label="Последний визит"
          value={client.lastVisitLabel ?? "—"}
        />
        <StatItem
          label="Любимая практика"
          value={client.favoriteService ?? "—"}
          className="col-span-2 sm:col-span-2"
        />
      </dl>

      <div className="mt-6">
        <ClientNotesField
          phoneKey={client.phoneKey}
          initialNotes={client.notes}
          initialUpdatedAt={client.notesUpdatedAt}
          onSaved={(notes, updatedAt) =>
            onNotesSaved(client.phoneKey, notes, updatedAt)
          }
        />
      </div>

      <section className="mt-8">
        <h3 className="font-display text-[1.2rem] text-[#3D3830]">
          История записей
        </h3>
        <p className="text-soft mt-1 text-[13px]">
          {client.bookings.length}{" "}
          {client.bookings.length === 1 ? "запись" : "записей"} в CRM
        </p>

        <ul className="mt-4 space-y-3">
          {client.bookings.map((booking) => (
            <ClientBookingHistoryItem
              key={booking.id}
              booking={booking}
              isUpdating={updatingId === booking.id}
              onStatusChange={(status) => onStatusChange(booking.id, status)}
            />
          ))}
        </ul>
      </section>
    </article>
  );
}

function StatItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#EDE4D4]/80 bg-[#FFF9F3]/60 px-3 py-3",
        className,
      )}
    >
      <dt className="text-soft text-[10px] font-semibold uppercase tracking-[0.16em]">
        {label}
      </dt>
      <dd className="mt-1 text-[14px] font-medium leading-snug text-[#3D3830]">
        {value}
      </dd>
    </div>
  );
}

function ClientBookingHistoryItem({
  booking,
  isUpdating,
  onStatusChange,
}: {
  booking: BookingRow;
  isUpdating: boolean;
  onStatusChange: (status: BookingStatus) => void;
}) {
  const timeRange = getBookingTimeRange(booking);

  return (
    <li className="rounded-xl border border-[#EDE4D4]/85 bg-[#FFF9F3]/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-[#3D3830]">{booking.service_title}</p>
          <p className="text-muted mt-1 text-[14px]">
            {formatBookingDate(booking.preferred_date)} · {timeRange}
          </p>
          {booking.package_name && (
            <p className="text-gold mt-1 text-[12px]">{booking.package_name}</p>
          )}
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="mt-3">
        <StatusSelect
          value={booking.status}
          isUpdating={isUpdating}
          onChange={onStatusChange}
        />
      </div>

      <div className="mt-3 border-t border-[#EDE4D4]/70 pt-3">
        <WhatsAppQuickReplies booking={booking} compact />
      </div>
    </li>
  );
}
