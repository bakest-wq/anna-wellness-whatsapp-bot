"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Plus, X } from "lucide-react";
import { AdminBookingSlotPicker } from "@/components/admin/admin-booking-slot-picker";
import { WELLNESS_PACKAGES } from "@/lib/packages";
import { WELLNESS_SERVICES } from "@/lib/services";
import type { BookingRow } from "@/lib/admin/types";
import { cn } from "@/lib/cn";

const EMPTY_FORM = {
  clientName: "",
  phone: "",
  serviceId: "",
  packageId: "",
  date: "",
  time: "",
  notes: "",
};

type AdminCreateBookingModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (booking: BookingRow) => void;
};

export function AdminCreateBookingModal({
  open,
  onClose,
  onCreated,
}: AdminCreateBookingModalProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setSubmitError(null);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const resetForm = useCallback(() => {
    setForm(EMPTY_FORM);
    setSubmitError(null);
  }, []);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  }, [isSubmitting, onClose, resetForm]);

  const canSubmit =
    form.clientName.trim().length >= 2 &&
    form.phone.replace(/\D/g, "").length >= 10 &&
    form.serviceId &&
    form.date &&
    form.time &&
    !isSubmitting;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: form.clientName.trim(),
          phone: form.phone.trim(),
          serviceId: form.serviceId,
          packageId: form.packageId || null,
          date: form.date,
          time: form.time,
          notes: form.notes.trim() || null,
        }),
      });

      const result = (await response.json().catch(() => null)) as {
        booking?: BookingRow;
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(result?.error ?? "Не удалось сохранить запись.");
      }

      if (!result?.booking) {
        throw new Error("Запись сохранена, но ответ сервера неполный.");
      }

      onCreated(result.booking);
      resetForm();
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Не удалось сохранить запись.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="admin-create-overlay"
      role="presentation"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="admin-create-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="admin-create-dialog__header">
          <div>
            <p className="text-gold text-[10px] font-semibold uppercase tracking-[0.22em]">
              Новая запись
            </p>
            <h2 id={titleId} className="font-display mt-1 text-[1.45rem] text-[#3D3830]">
              Добавить запись
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="admin-create-close"
            aria-label="Закрыть"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="admin-create-form">
          <div className="admin-create-fields">
            <label className="admin-create-field">
              <span className="admin-create-field__label">Имя клиента</span>
              <input
                type="text"
                value={form.clientName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, clientName: e.target.value }))
                }
                placeholder="Как к вам обращаться"
                autoComplete="name"
                className="admin-create-input"
                required
              />
            </label>

            <label className="admin-create-field">
              <span className="admin-create-field__label">WhatsApp / телефон</span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="+7 700 000 00 00"
                autoComplete="tel"
                className="admin-create-input"
                required
              />
            </label>

            <label className="admin-create-field">
              <span className="admin-create-field__label">Практика</span>
              <select
                value={form.serviceId}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    serviceId: e.target.value,
                    time: "",
                  }))
                }
                className="admin-create-input admin-create-select"
                required
              >
                <option value="">Выберите практику</option>
                {WELLNESS_SERVICES.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.title} · {service.duration}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-create-field">
              <span className="admin-create-field__label">
                Пакет <span className="text-soft font-normal">(необязательно)</span>
              </span>
              <select
                value={form.packageId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, packageId: e.target.value }))
                }
                className="admin-create-input admin-create-select"
              >
                <option value="">Без пакета</option>
                {WELLNESS_PACKAGES.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </option>
                ))}
              </select>
            </label>

            <AdminBookingSlotPicker
              serviceId={form.serviceId || null}
              date={form.date}
              time={form.time}
              onDateChange={(date) =>
                setForm((f) => ({ ...f, date, time: "" }))
              }
              onTimeChange={(time) => setForm((f) => ({ ...f, time }))}
            />

            <label className="admin-create-field">
              <span className="admin-create-field__label">
                Заметки <span className="text-soft font-normal">(необязательно)</span>
              </span>
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Пожелания, особенности, откуда узнали…"
                rows={3}
                className="admin-create-input admin-create-textarea"
              />
            </label>
          </div>

          {submitError && (
            <p className="admin-create-error mt-4" role="alert">
              {submitError}
            </p>
          )}

          <div className="admin-create-actions">
            <button
              type="button"
              onClick={handleClose}
              className="admin-create-btn admin-create-btn--ghost"
              disabled={isSubmitting}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "admin-create-btn admin-create-btn--primary",
                !canSubmit && "admin-create-btn--disabled",
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Сохраняем…
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" strokeWidth={2} />
                  Сохранить запись
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

export function AdminAddBookingButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("admin-add-booking-btn", className)}
    >
      <Plus className="h-5 w-5" strokeWidth={2} />
      Добавить запись
    </button>
  );
}
