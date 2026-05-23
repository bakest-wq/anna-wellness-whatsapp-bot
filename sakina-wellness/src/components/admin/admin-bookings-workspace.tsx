"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { AdminBookingList } from "@/components/admin/admin-booking-list";
import {
  AdminAddBookingButton,
  AdminCreateBookingModal,
} from "@/components/admin/admin-create-booking-modal";
import { AdminStatsRow } from "@/components/admin/admin-stats-row";
import { AdminTabs, type AdminTab } from "@/components/admin/admin-tabs";
import { ClientsView } from "@/components/admin/clients-view";
import { ScheduleView } from "@/components/admin/schedule-view";
import type { ClientNoteRecord } from "@/lib/admin/clients";
import {
  getAdminTabCounts,
  getNewBookings,
  getTodayBookings,
  getTomorrowBookings,
} from "@/lib/admin/dashboard-tabs";
import type { BookingRow, BookingStatus } from "@/lib/admin/types";

type AdminBookingsWorkspaceProps = {
  initialBookings: BookingRow[];
  initialClientNotes: Record<string, ClientNoteRecord>;
};

export function AdminBookingsWorkspace({
  initialBookings,
  initialClientNotes,
}: AdminBookingsWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("today");
  const [bookings, setBookings] = useState(initialBookings);
  const [clientNotes, setClientNotes] = useState(initialClientNotes);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 4500);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const tabCounts = useMemo(() => getAdminTabCounts(bookings), [bookings]);

  const newBookings = useMemo(() => getNewBookings(bookings), [bookings]);
  const todayBookings = useMemo(() => {
    const today = getTodayBookings(bookings);
    const newIds = new Set(newBookings.map((b) => b.id));
    return newBookings.length > 0
      ? today.filter((b) => !newIds.has(b.id))
      : today;
  }, [bookings, newBookings]);
  const tomorrowBookings = useMemo(
    () => getTomorrowBookings(bookings),
    [bookings],
  );

  const updateStatus = useCallback(
    async (bookingId: string, status: BookingStatus) => {
      setUpdatingId(bookingId);
      setStatusError(null);

      try {
        const response = await fetch(`/api/admin/bookings/${bookingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });

        const result = (await response.json().catch(() => null)) as {
          booking?: BookingRow;
          error?: string;
        } | null;

        if (!response.ok) {
          throw new Error(result?.error ?? "Не удалось обновить статус.");
        }

        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? { ...b, ...(result?.booking ?? {}), status }
              : b,
          ),
        );
      } catch (error) {
        setStatusError(
          error instanceof Error
            ? error.message
            : "Не удалось обновить статус.",
        );
      } finally {
        setUpdatingId(null);
      }
    },
    [],
  );

  const handleClientNotesChange = useCallback(
    (phoneKey: string, notes: string, updatedAt: string) => {
      setClientNotes((prev) => ({
        ...prev,
        [phoneKey]: { notes, updatedAt },
      }));
    },
    [],
  );

  const handleBookingCreated = useCallback((booking: BookingRow) => {
    setBookings((prev) => [booking, ...prev]);
    setSuccessMessage("Запись добавлена");
  }, []);

  return (
    <div className="admin-workspace">
      <AdminStatsRow bookings={bookings} />

      <div className="mt-4">
        <AdminAddBookingButton onClick={() => setCreateModalOpen(true)} />
      </div>

      {successMessage && (
        <div
          className="admin-success-banner mt-4"
          role="status"
          aria-live="polite"
        >
          <Check className="h-5 w-5 shrink-0" strokeWidth={2} />
          <span>{successMessage}</span>
        </div>
      )}

      <AdminCreateBookingModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleBookingCreated}
      />

      <div className="mt-5">
        <AdminTabs
          active={activeTab}
          counts={tabCounts}
          onChange={setActiveTab}
        />
      </div>

      {statusError && (
        <p className="admin-alert mt-5" role="alert">
          {statusError}
        </p>
      )}

      <div className="mt-6">
        {activeTab === "today" && (
          <section aria-label="Записи на сегодня" className="space-y-6">
            {newBookings.length > 0 && (
              <div>
                <h2 className="admin-section-label">Новые заявки</h2>
                <AdminBookingList
                  bookings={newBookings}
                  updatingId={updatingId}
                  onStatusChange={updateStatus}
                  emptyTitle=""
                  emptyHint=""
                />
              </div>
            )}
            <div>
              {newBookings.length > 0 && (
                <h2 className="admin-section-label">Сегодня</h2>
              )}
              <AdminBookingList
                bookings={todayBookings}
                updatingId={updatingId}
                onStatusChange={updateStatus}
                showVisitDate={false}
                emptyTitle="На сегодня записей нет"
                emptyHint="Отдохните или проверьте новые заявки выше."
              />
            </div>
          </section>
        )}

        {activeTab === "tomorrow" && (
          <section aria-label="Записи на завтра">
            <AdminBookingList
              bookings={tomorrowBookings}
              updatingId={updatingId}
              onStatusChange={updateStatus}
              showVisitDate={false}
              emptyTitle="На завтра записей нет"
              emptyHint="Свободный день — слоты видны в календаре."
            />
          </section>
        )}

        {activeTab === "calendar" && (
          <section aria-label="Календарь расписания">
            <ScheduleView
              bookings={bookings}
              updatingId={updatingId}
              statusError={statusError}
              onStatusChange={updateStatus}
            />
          </section>
        )}

        {activeTab === "clients" && (
          <section aria-label="Клиенты">
            <ClientsView
              bookings={bookings}
              clientNotes={clientNotes}
              updatingId={updatingId}
              onStatusChange={updateStatus}
              onClientNotesChange={handleClientNotesChange}
            />
          </section>
        )}
      </div>
    </div>
  );
}
