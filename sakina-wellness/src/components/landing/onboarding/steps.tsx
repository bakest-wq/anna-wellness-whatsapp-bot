"use client";

import { motion } from "framer-motion";
import {
  Activity,
  BatteryLow,
  Calendar,
  Check,
  CloudMoon,
  Heart,
  Leaf,
  Loader2,
  MessageCircle,
  Moon,
  Sparkles,
  Sun,
  User,
  Waves,
  Wind,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  OnboardingQuestion,
  OnboardingStepShell,
} from "@/components/landing/onboarding/shared";
import { easeLuxury } from "@/components/landing/motion";
import {
  BOOKING_TIME_PERIOD_GROUPS,
  formatBookingDate,
  getMinBookingDate,
} from "@/lib/booking-flow";
import { SLOT_MESSAGES, type SlotBlockReason } from "@/lib/booking-schedule";
import { getServiceById } from "@/lib/services";
import {
  getFeelingById,
  getFeelingRecommendationIntro,
  getRecommendedServices,
  WELLNESS_FEELINGS,
  type WellnessFeelingId,
} from "@/lib/wellness-feelings";
import type { WellnessService } from "@/lib/services";
import { cn } from "@/lib/cn";

const FEELING_ICONS: Record<WellnessFeelingId, LucideIcon> = {
  fatigue: Moon,
  "body-tension": Activity,
  "emotional-exhaustion": Heart,
  anxiety: Wind,
  "want-relax": CloudMoon,
  "no-energy": BatteryLow,
  "want-recovery": Sun,
  "inner-calm": Waves,
};

export function StepFeeling({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: WellnessFeelingId) => void;
}) {
  return (
    <OnboardingStepShell stepKey="feeling">
      <OnboardingQuestion
        eyebrow="Ваше состояние сейчас"
        title="Что вы сейчас чувствуете?"
        hint="Выберите то, что откликается — мы мягко подберём практику под вас"
      />
      <ul className="onboarding-feeling-list">
        {WELLNESS_FEELINGS.map((feeling, i) => {
          const Icon = FEELING_ICONS[feeling.id];
          const isSelected = selectedId === feeling.id;

          return (
            <motion.li
              key={feeling.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.45, ease: easeLuxury }}
            >
              <button
                type="button"
                onClick={() => onSelect(feeling.id)}
                className={cn(
                  "onboarding-feeling-card",
                  isSelected && "onboarding-feeling-card--selected",
                )}
              >
                <span className="onboarding-feeling-card__icon">
                  <Icon className="h-5 w-5" strokeWidth={1.35} />
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="onboarding-feeling-card__label">
                    {feeling.label}
                  </span>
                  <span className="onboarding-feeling-card__hint">
                    {feeling.hint}
                  </span>
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </OnboardingStepShell>
  );
}

export function StepPractices({
  feelingId,
  selectedServiceId,
  onSelect,
}: {
  feelingId: WellnessFeelingId | null;
  selectedServiceId: string | null;
  onSelect: (id: string) => void;
}) {
  const feeling = feelingId ? getFeelingById(feelingId) : null;
  const services = feelingId ? getRecommendedServices(feelingId) : [];
  const intro = feelingId ? getFeelingRecommendationIntro(feelingId) : null;

  return (
    <OnboardingStepShell stepKey={`practices-${feelingId}`}>
      <OnboardingQuestion
        eyebrow="Вам может подойти"
        title="Практики для вашего состояния"
        hint={
          intro ??
          (feeling
            ? `Для «${feeling.label.toLowerCase()}» мы подобрали бережные ритуалы.`
            : "Выберите практику, которая откликается")
        }
      />

      {feeling && (
        <p className="onboarding-feeling-pill" aria-label="Выбранное состояние">
          <Leaf className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
          {feeling.label}
        </p>
      )}

      <ul className="onboarding-practice-list">
        {services.map((service, i) => (
          <PracticeCard
            key={service.id}
            service={service}
            reason={service.reason}
            index={i}
            isTopPick={i === 0}
            isSelected={selectedServiceId === service.id}
            onSelect={() => onSelect(service.id)}
          />
        ))}
      </ul>
    </OnboardingStepShell>
  );
}

function PracticeCard({
  service,
  reason,
  index,
  isTopPick,
  isSelected,
  onSelect,
}: {
  service: WellnessService;
  reason: string;
  index: number;
  isTopPick: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const Icon = service.icon;

  return (
    <motion.li
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.55, ease: easeLuxury }}
    >
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "onboarding-practice-card",
          isSelected && "onboarding-practice-card--selected",
          isTopPick && "onboarding-practice-card--featured",
        )}
      >
        {isTopPick && (
          <span className="onboarding-practice-card__badge">
            <Sparkles className="h-3 w-3" strokeWidth={1.5} aria-hidden />
            Вам может подойти
          </span>
        )}
        <div className="onboarding-practice-card__row">
          <div className="onboarding-practice-card__icon">
            <Icon className="h-6 w-6" strokeWidth={1.25} />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="onboarding-practice-card__title">{service.title}</p>
            <p className="onboarding-practice-card__essence">{service.essence}</p>
            <p className="onboarding-practice-card__reason">{reason}</p>
            <p className="onboarding-practice-card__meta">
              {service.duration} · {service.price}
            </p>
          </div>
        </div>
      </button>
    </motion.li>
  );
}

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

export function StepDateTime({
  serviceId,
  date,
  time,
  onDateChange,
  onTimeChange,
}: {
  serviceId: string | null;
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}) {
  const service = serviceId ? getServiceById(serviceId) : null;
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
          durationLabel: result?.durationLabel ?? service?.duration ?? "",
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
  }, [date, serviceId, service?.duration]);

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
    <OnboardingStepShell stepKey={`datetime-${date}-${serviceId}`}>
      <OnboardingQuestion
        eyebrow="Ваш ритуал"
        title="Когда вам удобно прийти?"
        hint={
          service
            ? `${service.title} · ${service.duration} — выберите день и тихое время`
            : "Выберите дату и свободное время"
        }
      />

      <label className="onboarding-field mt-6 block">
        <span className="onboarding-field__label">Дата визита</span>
        <div className="relative">
          <Calendar
            className="text-soft pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2"
            strokeWidth={1.25}
          />
          <input
            type="date"
            value={date}
            min={getMinBookingDate()}
            onChange={(e) => onDateChange(e.target.value)}
            className="onboarding-input onboarding-input--with-icon"
          />
        </div>
        {date && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="onboarding-date-preview"
          >
            {formatBookingDate(date)}
          </motion.p>
        )}
      </label>

      {date && (
        <div className="mt-8">
          <p className="onboarding-field__label mb-3">Свободное время</p>

          {isLoading && (
            <div className="onboarding-loading" role="status">
              <Loader2 className="h-6 w-6 animate-spin text-[#5F735B]" />
              <span>Проверяем расписание…</span>
            </div>
          )}

          {!isLoading && loadError && (
            <p className="onboarding-alert">{loadError}</p>
          )}

          {!isLoading && !loadError && availability?.allUnavailable && (
            <p className="onboarding-empty-inline">
              {availability.onlyOutsideHours
                ? "На эту дату нет подходящего интервала. Попробуйте другой день."
                : "На эту дату все слоты заняты. Выберите другую дату."}
            </p>
          )}

          {!isLoading &&
            !loadError &&
            availability &&
            !availability.allUnavailable && (
              <div className="space-y-5">
                {BOOKING_TIME_PERIOD_GROUPS.map((period) => (
                  <div key={period.id}>
                    <p className="onboarding-slot-period">
                      {period.label} · {period.hint}
                    </p>
                    <div className="onboarding-slot-grid">
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
                              "onboarding-slot",
                              time === slot && "onboarding-slot--selected",
                              disabled && "onboarding-slot--disabled",
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
        </div>
      )}
    </OnboardingStepShell>
  );
}

export function StepContact({
  name,
  phone,
  onNameChange,
  onPhoneChange,
}: {
  name: string;
  phone: string;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
}) {
  return (
    <OnboardingStepShell stepKey="contact">
      <OnboardingQuestion
        title="Как с вами связаться?"
        hint="Anna напишет в WhatsApp, чтобы бережно подтвердить вашу запись"
      />
      <div className="mt-6 space-y-5">
        <label className="onboarding-field block">
          <span className="onboarding-field__label">Ваше имя</span>
          <div className="relative">
            <User
              className="text-soft pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2"
              strokeWidth={1.25}
            />
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Как к вам обращаться"
              autoComplete="given-name"
              className="onboarding-input onboarding-input--with-icon"
            />
          </div>
        </label>
        <label className="onboarding-field block">
          <span className="onboarding-field__label">WhatsApp</span>
          <div className="relative">
            <MessageCircle
              className="text-soft pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2"
              strokeWidth={1.25}
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="+7 700 000 00 00"
              autoComplete="tel"
              className="onboarding-input onboarding-input--with-icon"
            />
          </div>
        </label>
      </div>
    </OnboardingStepShell>
  );
}

export function StepReview({
  feelingLabel,
  serviceTitle,
  date,
  time,
  name,
}: {
  feelingLabel: string | null;
  serviceTitle: string | null;
  date: string;
  time: string;
  name: string;
}) {
  const rows = useMemo(
    () =>
      [
        feelingLabel && { label: "Состояние", value: feelingLabel },
        { label: "Практика", value: serviceTitle },
        { label: "Дата", value: formatBookingDate(date) },
        { label: "Время", value: time },
        { label: "Имя", value: name },
      ].filter(Boolean) as { label: string; value: string | null }[],
    [feelingLabel, serviceTitle, date, time, name],
  );

  return (
    <OnboardingStepShell stepKey="review">
      <OnboardingQuestion
        title="Ваша запись почти готова"
        hint="Проверьте детали — мы сохраним заявку и откроем WhatsApp для Anna"
      />
      <dl className="onboarding-review mt-6">
        {rows.map((row) => (
          <div key={row.label} className="onboarding-review__row">
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </OnboardingStepShell>
  );
}

export function ConfirmationScreen({
  whatsappUrl,
  clientName,
  onReset,
}: {
  whatsappUrl: string;
  clientName: string;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.75, ease: easeLuxury }}
      className="onboarding-confirmation"
    >
      <div className="onboarding-confirmation__glow" aria-hidden />
      <div className="onboarding-confirmation__card">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.15 }}
          className="onboarding-confirmation__icon"
        >
          <Check className="h-9 w-9" strokeWidth={1.35} />
        </motion.div>
        <p className="onboarding-confirmation__eyebrow">Sakina Wellness</p>
        <h2 className="onboarding-confirmation__title">
          {clientName ? `${clientName}, ` : ""}
          вы на шаг ближе к покою
        </h2>
        <p className="onboarding-confirmation__text">
          Ваша заявка принята с теплом и вниманием. Откройте WhatsApp — Anna
          ответит и подтвердит время вашей практики.
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="onboarding-cta onboarding-cta--primary mt-8"
        >
          <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
          Написать в WhatsApp
        </a>
        <button
          type="button"
          onClick={onReset}
          className="onboarding-cta onboarding-cta--ghost mt-3 w-full"
        >
          Новая запись
        </button>
      </div>
    </motion.div>
  );
}
