"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  BOOKING_TIME_PERIOD_GROUPS,
  formatBookingDate,
  getMinBookingDate,
} from "@/lib/booking-flow";
import { SLOT_MESSAGES, type SlotBlockReason } from "@/lib/booking-schedule";
import { cn } from "@/lib/cn";

type SlotAvailability = {
  durationLabel: string;
  bookedSlots: string[];
  outsideHoursSlots: string[];
  availableSlots: string[];
  allUnavailable: boolean;
  onlyOutsideHours: boolean;
};

function getSlotBlockReason(
  slot: string,
  availability: SlotAvailability,
): SlotBlockReason | null {
  if (availability.bookedSlots.includes(slot)) return "booked";
  if (availability.outsideHoursSlots.includes(slot)) return "outside_hours";
  return null;
}

type AdminBookingSlotPickerProps = {
  serviceId: string | null;
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
};

export function AdminBookingSlotPicker({
  serviceId,
  date,
  time,
  onDateChange,
  onTimeChange,
}: AdminBookingSlotPickerProps) {
  const [availability, setAvailability] = useState<SlotAvailability | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!date || !serviceId) {
      setAvailability(null);
      setLoadError(null);
      return;
    }

    const controller = new AbortController();

    async function fetchAvailability() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const params = new URLSearchParams({
          date,
          serviceId: serviceId as string,
        });
        const response = await fetch(
          `/api/bookings/availability?${params.toString()}`,
          { signal: controller.signal },
        );

        const result = (await response.json().catch(() => null)) as
          | (SlotAvailability & { error?: string })
          | null;

        if (!response.ok) {
          throw new Error(
            result?.error ?? "Не удалось загрузить расписание.",
          );
        }

        setAvailability({
          durationLabel: result?.durationLabel ?? "",
          bookedSlots: result?.bookedSlots ?? [],
          outsideHoursSlots: result?.outsideHoursSlots ?? [],
          availableSlots: result?.availableSlots ?? [],
          allUnavailable: result?.allUnavailable ?? false,
          onlyOutsideHours: result?.onlyOutsideHours ?? false,
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        setAvailability(null);
        setLoadError(
          error instanceof Error
            ? error.message
            : "Не удалось загрузить расписание.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    fetchAvailability();
    return () => controller.abort();
  }, [date, serviceId]);

  useEffect(() => {
    if (
      availability &&
      time &&
      !availability.availableSlots.includes(time)
    ) {
      onTimeChange("");
    }
  }, [availability, time, onTimeChange]);

  return (
    <div className="admin-create-fields__group">
      <label className="admin-create-field">
        <span className="admin-create-field__label">Дата визита</span>
        <input
          type="date"
          value={date}
          min={getMinBookingDate()}
          onChange={(e) => onDateChange(e.target.value)}
          className="admin-create-input"
          required
        />
        {date && (
          <span className="admin-create-field__hint">
            {formatBookingDate(date)}
          </span>
        )}
      </label>

      {date && serviceId && (
        <div className="admin-create-slots">
          <p className="admin-create-field__label">Время</p>
          {availability?.durationLabel && (
            <p className="admin-create-field__hint mb-2">
              Длительность: {availability.durationLabel}
            </p>
          )}

          {isLoading && (
            <div className="admin-create-loading" role="status">
              <Loader2 className="h-5 w-5 animate-spin text-[#5F735B]" />
              <span>Проверяем расписание…</span>
            </div>
          )}

          {!isLoading && loadError && (
            <p className="admin-create-error">{loadError}</p>
          )}

          {!isLoading && !loadError && availability?.allUnavailable && (
            <p className="admin-create-empty">
              {availability.onlyOutsideHours
                ? "На эту дату нет подходящего интервала. Выберите другой день."
                : "На эту дату все слоты заняты."}
            </p>
          )}

          {!isLoading &&
            !loadError &&
            availability &&
            !availability.allUnavailable && (
              <div className="space-y-4">
                {BOOKING_TIME_PERIOD_GROUPS.map((period) => (
                  <div key={period.id}>
                    <p className="admin-create-slot-period">
                      {period.label} · {period.hint}
                    </p>
                    <div className="admin-create-slot-grid">
                      {period.slots.map((slot) => {
                        const blockReason = getSlotBlockReason(
                          slot,
                          availability,
                        );
                        const disabled = blockReason !== null;

                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={disabled}
                            title={
                              blockReason
                                ? SLOT_MESSAGES[blockReason]
                                : undefined
                            }
                            onClick={() => onTimeChange(slot)}
                            className={cn(
                              "admin-create-slot",
                              time === slot && "admin-create-slot--selected",
                              disabled && "admin-create-slot--disabled",
                            )}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

          {!serviceId && (
            <p className="admin-create-field__hint">
              Сначала выберите практику
            </p>
          )}
        </div>
      )}
    </div>
  );
}
