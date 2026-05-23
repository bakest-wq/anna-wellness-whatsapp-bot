"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ChevronLeft, Loader2, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { OnboardingProgress } from "@/components/landing/onboarding/shared";
import {
  ConfirmationScreen,
  StepContact,
  StepDateTime,
  StepFeeling,
  StepPractices,
  StepReview,
} from "@/components/landing/onboarding/steps";
import { FadeUp, easeLuxury } from "@/components/landing/motion";
import { useBooking } from "@/components/landing/booking-context";
import {
  ONBOARDING_STEP_COUNT,
  buildConciergeBookingUrl,
} from "@/lib/booking-flow";
import { buildWhatsAppConciergeUrl } from "@/lib/whatsapp";
import { getFeelingById } from "@/lib/wellness-feelings";
import type { WellnessFeelingId } from "@/lib/wellness-feelings";
import { getServiceById } from "@/lib/services";
import { cn } from "@/lib/cn";

type FormState = {
  feelingId: WellnessFeelingId | null;
  serviceId: string | null;
  date: string;
  time: string;
  name: string;
  phone: string;
};

const initialForm: FormState = {
  feelingId: null,
  serviceId: null,
  date: "",
  time: "",
  name: "",
  phone: "",
};

export function OnboardingBookingFlow() {
  const { selectedServiceId, selectService } = useBooking();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const service = form.serviceId ? getServiceById(form.serviceId) : null;
  const serviceTitle = service?.title ?? null;
  const feelingLabel = form.feelingId
    ? getFeelingById(form.feelingId)?.label ?? null
    : null;

  const updateForm = useCallback((patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    if (selectedServiceId && !form.serviceId) {
      updateForm({ serviceId: selectedServiceId });
      setStep(2);
    }
  }, [selectedServiceId, form.serviceId, updateForm]);

  const canProceed = useMemo(() => {
    switch (step) {
      case 0:
        return !!form.feelingId;
      case 1:
        return !!form.serviceId;
      case 2:
        return !!form.date && !!form.time;
      case 3:
        return (
          form.name.trim().length >= 2 &&
          form.phone.replace(/\D/g, "").length >= 10
        );
      case 4:
        return true;
      default:
        return false;
    }
  }, [step, form]);

  const goNext = () => {
    if (!canProceed || isSubmitting) return;
    if (step === 1 && form.serviceId) selectService(form.serviceId);
    setStep((s) => Math.min(s + 1, ONBOARDING_STEP_COUNT - 1));
  };

  const goBack = () => {
    if (isSubmitting) return;
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleFeelingSelect = (id: WellnessFeelingId) => {
    updateForm({ feelingId: id, serviceId: null, time: "" });
  };

  const handleServiceSelect = (id: string) => {
    updateForm({ serviceId: id, time: "" });
    selectService(id);
  };

  const handleSubmit = async () => {
    if (
      !form.serviceId ||
      !serviceTitle ||
      !form.date ||
      !form.time ||
      !form.name ||
      !form.phone ||
      isSubmitting
    ) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      serviceTitle,
      packageName: null as string | null,
      date: form.date,
      time: form.time,
      clientName: form.name.trim(),
      phone: form.phone.trim(),
    };

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: form.serviceId,
          serviceTitle,
          packageId: null,
          packageName: null,
          skipPackage: true,
          date: form.date,
          time: form.time,
          clientName: payload.clientName,
          phone: payload.phone,
        }),
      });

      const result = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(
          result?.error ??
            (response.status === 409
              ? "Это время уже занято. Выберите другой слот."
              : "Не удалось сохранить заявку."),
        );
      }

      const url = buildConciergeBookingUrl(payload);
      setWhatsappUrl(url);
      setSubmitted(true);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Не удалось сохранить заявку.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFlow = () => {
    setForm(initialForm);
    setStep(0);
    setSubmitted(false);
    setWhatsappUrl(null);
    setSubmitError(null);
    setIsSubmitting(false);
  };

  if (submitted && whatsappUrl) {
    return (
      <section
        id="booking"
        className="onboarding-section onboarding-section--confirmation"
      >
        <div className="onboarding-container">
          <ConfirmationScreen
            whatsappUrl={whatsappUrl}
            clientName={form.name.trim()}
            onReset={resetFlow}
          />
        </div>
      </section>
    );
  }

  const isLastStep = step === ONBOARDING_STEP_COUNT - 1;

  return (
    <section id="booking" className="onboarding-section luxury-section">
      <div className="onboarding-ambient" aria-hidden />
      <div className="onboarding-container">
        <FadeUp className="onboarding-intro">
          <p className="onboarding-intro__eyebrow">
            <Sparkles className="inline h-3.5 w-3.5 opacity-70" strokeWidth={1.5} />
            <span>Путь к восстановлению</span>
          </p>
          <h2 className="onboarding-intro__title">Запись в Sakina Wellness</h2>
          <p className="onboarding-intro__hint">
            Несколько тихих шагов — мы услышим, что вам сейчас нужно, и подберём
            практику.
          </p>
          <a
            href={buildWhatsAppConciergeUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="onboarding-intro__wa-link mt-5 inline-flex text-[14px] font-medium text-[#5F735B] underline-offset-4 hover:underline"
          >
            🌿 Или подобрать практику в WhatsApp
          </a>
        </FadeUp>

        <div className="onboarding-card">
          <AnimatePresence>
            {isSubmitting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="onboarding-overlay"
                aria-hidden
              />
            )}
          </AnimatePresence>

          <OnboardingProgress current={step} />

          <div className="onboarding-card__body">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <StepFeeling
                  selectedId={form.feelingId}
                  onSelect={handleFeelingSelect}
                />
              )}
              {step === 1 && (
                <StepPractices
                  feelingId={form.feelingId}
                  selectedServiceId={form.serviceId}
                  onSelect={handleServiceSelect}
                />
              )}
              {step === 2 && (
                <StepDateTime
                  serviceId={form.serviceId}
                  date={form.date}
                  time={form.time}
                  onDateChange={(date) => updateForm({ date, time: "" })}
                  onTimeChange={(time) => updateForm({ time })}
                />
              )}
              {step === 3 && (
                <StepContact
                  name={form.name}
                  phone={form.phone}
                  onNameChange={(name) => updateForm({ name })}
                  onPhoneChange={(phone) => updateForm({ phone })}
                />
              )}
              {step === 4 && (
                <StepReview
                  feelingLabel={feelingLabel}
                  serviceTitle={serviceTitle}
                  date={form.date}
                  time={form.time}
                  name={form.name.trim()}
                />
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="onboarding-alert mt-5 flex items-start gap-3"
                role="alert"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} />
                <p>{submitError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="onboarding-nav">
            {step > 0 && (
              <button
                type="button"
                onClick={goBack}
                disabled={isSubmitting}
                className="onboarding-cta onboarding-cta--ghost flex-1"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
                Назад
              </button>
            )}
            {!isLastStep ? (
              <button
                type="button"
                onClick={goNext}
                disabled={!canProceed || isSubmitting}
                className={cn(
                  "onboarding-cta onboarding-cta--primary flex-1",
                  (!canProceed || isSubmitting) && "onboarding-cta--disabled",
                )}
              >
                Продолжить
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed || isSubmitting}
                className={cn(
                  "onboarding-cta onboarding-cta--primary flex-1",
                  isSubmitting && "onboarding-cta--disabled",
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Сохраняем…
                  </>
                ) : (
                  "Записаться"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
