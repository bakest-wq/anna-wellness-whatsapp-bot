"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { ClientProfileCard } from "@/components/admin/client-profile-card";
import {
  buildClientProfiles,
  type ClientNoteRecord,
  type ClientProfile,
} from "@/lib/admin/clients";
import { formatClientPhoneDisplay } from "@/lib/admin/phone";
import type { BookingRow, BookingStatus } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

type ClientsViewProps = {
  bookings: BookingRow[];
  clientNotes: Record<string, ClientNoteRecord>;
  updatingId: string | null;
  onStatusChange: (bookingId: string, status: BookingStatus) => void;
  onClientNotesChange: (
    phoneKey: string,
    notes: string,
    updatedAt: string,
  ) => void;
};

export function ClientsView({
  bookings,
  clientNotes,
  updatingId,
  onStatusChange,
  onClientNotesChange,
}: ClientsViewProps) {
  const [search, setSearch] = useState("");
  const [selectedPhoneKey, setSelectedPhoneKey] = useState<string | null>(null);

  const profiles = useMemo(
    () => buildClientProfiles(bookings, clientNotes),
    [bookings, clientNotes],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return profiles;

    return profiles.filter((client) => {
      const phone = client.phoneDisplay.toLowerCase();
      const formatted = formatClientPhoneDisplay(client.phoneKey).toLowerCase();
      return (
        client.name.toLowerCase().includes(q) ||
        phone.includes(q) ||
        formatted.includes(q) ||
        client.phoneKey.includes(q.replace(/\D/g, ""))
      );
    });
  }, [profiles, search]);

  const selectedClient = useMemo(
    () =>
      selectedPhoneKey
        ? profiles.find((c) => c.phoneKey === selectedPhoneKey) ?? null
        : null,
    [profiles, selectedPhoneKey],
  );

  if (profiles.length === 0) {
    return (
      <div className="admin-panel rounded-[1.5rem] px-6 py-14 text-center">
        <Users
          className="mx-auto h-10 w-10 text-[#9CAA8F]"
          strokeWidth={1.25}
        />
        <p className="font-display mt-4 text-[1.35rem] text-[#3D3830]">
          Клиентов пока нет
        </p>
        <p className="text-muted mt-3 text-[15px] font-light">
          После первых заявок с сайта здесь появятся карточки гостей.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-clients">
      <p className="text-muted max-w-lg text-[14px] font-light leading-relaxed">
        Гости Sakina Wellness — история визитов, заметки и быстрый WhatsApp.
      </p>

      <label className="relative mt-6 block max-w-md">
        <Search
          className="text-soft pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
          strokeWidth={1.5}
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Имя или телефон"
          className="booking-input w-full pl-11"
        />
      </label>

      <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-6">
        <div
          className={cn(
            "space-y-3",
            selectedClient && "hidden lg:block",
          )}
        >
          <p className="text-soft text-[11px] font-semibold uppercase tracking-[0.18em]">
            {filtered.length}{" "}
            {filtered.length === 1 ? "клиент" : "клиентов"}
          </p>
          <ul className="max-h-[min(70vh,720px)] space-y-2 overflow-y-auto pr-1">
            {filtered.map((client) => (
              <ClientListItem
                key={client.phoneKey}
                client={client}
                isSelected={selectedPhoneKey === client.phoneKey}
                onSelect={() => setSelectedPhoneKey(client.phoneKey)}
              />
            ))}
          </ul>
          {filtered.length === 0 && (
            <p className="text-muted py-8 text-center text-[15px]">
              Ничего не найдено
            </p>
          )}
        </div>

        <div
          className={cn(
            !selectedClient && "hidden lg:flex lg:items-center lg:justify-center",
          )}
        >
          {selectedClient ? (
            <div className="w-full">
              <ClientProfileCard
                client={selectedClient}
                updatingId={updatingId}
                onStatusChange={onStatusChange}
                onNotesSaved={onClientNotesChange}
                showBack
                onBack={() => setSelectedPhoneKey(null)}
              />
            </div>
          ) : (
            <div className="admin-panel hidden w-full rounded-[1.5rem] px-8 py-16 text-center lg:block">
              <p className="font-display text-[1.25rem] text-[#3D3830]">
                Выберите клиента
              </p>
              <p className="text-muted mt-2 text-[14px] font-light">
                Откройте карточку слева, чтобы увидеть историю и заметки
              </p>
            </div>
          )}
        </div>

        {selectedClient && (
          <div className="mt-4 lg:hidden">
            <ClientProfileCard
              client={selectedClient}
              updatingId={updatingId}
              onStatusChange={onStatusChange}
              onNotesSaved={onClientNotesChange}
              showBack
              onBack={() => setSelectedPhoneKey(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ClientListItem({
  client,
  isSelected,
  onSelect,
}: {
  client: ClientProfile;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "admin-client-list-item w-full rounded-xl border px-4 py-3.5 text-left transition-all duration-300",
          isSelected
            ? "border-[#5F735B]/40 bg-[#9CAA8F]/15 shadow-sm"
            : "border-[#EDE4D4]/90 bg-[#FFF9F3]/60 hover:border-[#C4A574]/35",
        )}
      >
        <p className="font-medium text-[#3D3830]">{client.name}</p>
        <p className="text-soft mt-0.5 text-[12px]">
          {formatClientPhoneDisplay(client.phoneKey)}
        </p>
        <div className="text-soft mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
          <span>{client.totalVisits} визитов</span>
          {client.lastVisitLabel && (
            <span>· {client.lastVisitLabel}</span>
          )}
        </div>
        {client.favoriteService && (
          <p className="text-gold mt-1.5 truncate text-[11px]">
            {client.favoriteService}
          </p>
        )}
        {client.notes.trim() && (
          <p className="text-muted mt-2 line-clamp-2 text-[12px] italic">
            {client.notes.trim()}
          </p>
        )}
      </button>
    </li>
  );
}
