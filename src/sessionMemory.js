const { getServiceNameByPracticeId } = require("./content/practices");
const { getBookingServiceIntro } = require("./content/practices");

const BOOKING_STEPS = ["service", "day", "time", "name", "phone", "contraindications"];

const SOFT_RESET_PATTERNS =
  /^(назад|back|главное\s*меню|меню|menu|басты\s*меню|сначала|заново|начать\s+заново|стоп)$/i;

function isSoftResetCommand(text) {
  const t = String(text || "").trim();
  if (SOFT_RESET_PATTERNS.test(t)) return true;
  return false;
}

function isBookingFlowActive(session) {
  return session?.currentFlow === "booking";
}

function isConciergeFlowActive(session) {
  return session?.currentFlow === "concierge";
}

function hasActiveFlow(session) {
  return isBookingFlowActive(session) || isConciergeFlowActive(session);
}

function isBookingComplete(session) {
  return Boolean(
    session.selectedPractice &&
      session.bookingDate &&
      session.bookingTime &&
      session.clientName &&
      session.clientPhone &&
      session.contraindications
  );
}

/**
 * Следующий недостающий шаг записи (не повторяет заполненное).
 */
function getNextMissingBookingStep(session) {
  if (!session.selectedPractice) return "service";
  if (!session.bookingDate) return "day";
  if (!session.bookingTime) return "time";
  if (!session.clientName) return "name";
  if (!session.clientPhone) return "phone";
  if (!session.contraindications) return "contraindications";
  return "complete";
}

function syncCurrentStep(session) {
  if (session.currentFlow !== "booking") return session.currentStep;
  session.currentStep = getNextMissingBookingStep(session);
  return session.currentStep;
}

function prefillClientFromProfile(session) {
  if (!session.clientName && session.profile?.name) {
    session.clientName = session.profile.name;
  }
  if (!session.clientPhone && session.profile?.phone) {
    session.clientPhone = session.profile.phone;
  }
}

function clearBookingFields(session) {
  session.selectedPractice = null;
  session.selectedPracticeTitle = null;
  session.bookingDate = null;
  session.bookingTime = null;
  session.contraindications = null;
  session.bookingComment = null;
  session.flowStartedAt = null;
}

function clearConciergeFields(session) {
  session.emotionalState = null;
  session.desiredOutcome = null;
  session.recommendedPractice = null;
}

/**
 * Мягкий сброс: главное меню, данные клиента и черновик записи (<24ч) сохраняются.
 */
function softResetFlow(session) {
  session.currentFlow = null;
  session.currentStep = null;
  session.menuContext = "main";
  session.emotionalHold = false;
  session.emotionalHoldUntil = null;
  clearConciergeFields(session);
  return session;
}

/**
 * Полный сброс сценария + очистка черновика записи.
 */
function hardResetFlow(session) {
  softResetFlow(session);
  clearBookingFields(session);
  session.lastPracticeId = null;
  return session;
}

function hasResumableBooking(session) {
  if (session.currentFlow) return false;
  if (!session.selectedPractice) return false;
  return !isBookingComplete(session);
}

function getResumeStepLabel(step, language) {
  const lang = language === "kz" ? "kz" : "ru";
  const labels = {
    ru: {
      service: "выборе практики",
      day: "выборе дня",
      time: "выборе времени",
      name: "вашем имени",
      phone: "номере телефона",
      contraindications: "особенностях здоровья"
    },
    kz: {
      service: "практика таңдауында",
      day: "күн таңдауында",
      time: "уақыт таңдауында",
      name: "атыңызда",
      phone: "телефон нөмірінде",
      contraindications: "денсаулық ерекшеліктерінде"
    }
  };
  return labels[lang][step] || labels.ru[step];
}

function startBookingFlow(session, options = {}) {
  const { language, practiceId, packageName, source, resetDraft = false } = options;

  if (resetDraft) {
    clearBookingFields(session);
  }

  session.currentFlow = "booking";
  session.language = language || session.language || "ru";
  const now = new Date().toISOString();
  session.flowStartedAt = session.flowStartedAt || now;
  session.lastFlowActivityAt = now;
  if (source) session.source = source;

  if (practiceId) {
    session.selectedPractice = practiceId;
    session.selectedPracticeTitle = getServiceNameByPracticeId(practiceId);
    session.lastPracticeId = practiceId;
  }

  if (packageName) {
    session.bookingComment = `Пакет: ${packageName}`;
    if (!session.selectedPracticeTitle) {
      session.selectedPracticeTitle = packageName;
    }
  }

  prefillClientFromProfile(session);
  syncCurrentStep(session);
  return session;
}

function startConciergeFlow(session, language) {
  session.currentFlow = "concierge";
  session.currentStep = "emotion";
  session.language = language || session.language || "ru";
  const now = new Date().toISOString();
  session.flowStartedAt = now;
  session.lastFlowActivityAt = now;
  clearConciergeFields(session);
  return session;
}

/** Совместимость: вложенный booking для flowControl */
function syncLegacyBookingMirror(session) {
  if (!isBookingFlowActive(session)) {
    session.booking = null;
    return;
  }

  syncCurrentStep(session);
  session.booking = {
    active: true,
    step: session.currentStep,
    language: session.language,
    startedAt: session.flowStartedAt
      ? new Date(session.flowStartedAt).getTime()
      : Date.now(),
    data: {
      serviceId: session.selectedPractice || "",
      service: session.selectedPracticeTitle || "",
      day: session.bookingDate || "",
      time: session.bookingTime || "",
      name: session.clientName || "",
      phone: session.clientPhone || "",
      contraindications: session.contraindications || "",
      comment: session.bookingComment || ""
    }
  };
}

function syncLegacyConciergeMirror(session) {
  if (!isConciergeFlowActive(session)) {
    session.concierge = null;
    return;
  }

  session.concierge = {
    active: true,
    step: session.currentStep || "emotion",
    emotion: session.emotionalState,
    outcome: session.desiredOutcome,
    practiceId: session.recommendedPractice,
    language: session.language,
    startedAt: session.flowStartedAt
      ? new Date(session.flowStartedAt).getTime()
      : Date.now()
  };
}

function syncLegacyMirrors(session) {
  syncLegacyBookingMirror(session);
  syncLegacyConciergeMirror(session);
}

function completeBookingFlow(session) {
  clearBookingFields(session);
  session.currentFlow = null;
  session.currentStep = null;
  session.menuContext = "main";
  return session;
}

function getSessionSnapshotForLead(session) {
  return {
    serviceId: session.selectedPractice,
    service: session.selectedPracticeTitle,
    day: session.bookingDate,
    time: session.bookingTime,
    name: session.clientName,
    phone: session.clientPhone,
    contraindications: session.contraindications,
    comment: session.bookingComment,
    source: session.source || "whatsapp"
  };
}

module.exports = {
  BOOKING_STEPS,
  isSoftResetCommand,
  isBookingFlowActive,
  isConciergeFlowActive,
  hasActiveFlow,
  isBookingComplete,
  getNextMissingBookingStep,
  syncCurrentStep,
  prefillClientFromProfile,
  clearBookingFields,
  clearConciergeFields,
  softResetFlow,
  hardResetFlow,
  hasResumableBooking,
  getResumeStepLabel,
  startBookingFlow,
  startConciergeFlow,
  syncLegacyBookingMirror,
  syncLegacyConciergeMirror,
  syncLegacyMirrors,
  getSessionSnapshotForLead,
  getBookingServiceIntro,
  completeBookingFlow
};
