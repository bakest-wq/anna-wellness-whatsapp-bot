/**
 * Session storage — in-memory Map с адаптером для будущего Redis / Postgres.
 */

const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS) || 24 * 60 * 60 * 1000;
const FLOW_INACTIVITY_MS =
  Number(process.env.FLOW_INACTIVITY_MS) || 30 * 60 * 1000;

/** @typedef {import('./sessionMemory').SessionRecord} SessionRecord */

class MemorySessionAdapter {
  constructor() {
    /** @type {Map<string, SessionRecord>} */
    this.map = new Map();
  }

  async get(chatId) {
    return this.map.get(chatId) ?? null;
  }

  async set(chatId, session) {
    this.map.set(chatId, session);
  }

  async delete(chatId) {
    this.map.delete(chatId);
  }
}

/** @type {MemorySessionAdapter} */
let adapter = new MemorySessionAdapter();

/**
 * Подмена хранилища (Redis/Postgres) без смены API.
 * @param {{ get: (id: string) => Promise<SessionRecord|null>, set: (id: string, s: SessionRecord) => Promise<void>, delete?: (id: string) => Promise<void> }} next
 */
function setSessionAdapter(next) {
  adapter = next;
}

function createDefaultSession(chatId) {
  return {
    chatId,
    language: "ru",
    currentFlow: null,
    currentStep: null,
    selectedPractice: null,
    selectedPracticeTitle: null,
    emotionalState: null,
    desiredOutcome: null,
    recommendedPractice: null,
    bookingDate: null,
    bookingTime: null,
    clientName: null,
    clientPhone: null,
    contraindications: null,
    bookingComment: null,
    source: "whatsapp",
    lastIntent: null,
    updatedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    lastFlowActivityAt: null,
    flowStartedAt: null,
    history: [],
    profile: { name: "", phone: "", visits: 0 },
    menuContext: "main",
    emotionalHold: false,
    emotionalHoldUntil: null,
    lastPracticeId: null,
    recommendationFlow: false
  };
}

function logSessionUpdate(chatId, session, changedKeys = []) {
  console.log("SESSION UPDATE:");
  console.log("chatId:", chatId);
  console.log("currentFlow:", session.currentFlow);
  console.log("currentStep:", session.currentStep);
  console.log("selectedPractice:", session.selectedPractice);
  if (changedKeys.length) {
    console.log("changed:", changedKeys.join(", "));
  }
}

function normalizeLegacySession(raw, chatId) {
  const base = createDefaultSession(chatId);
  if (!raw || typeof raw !== "object") return base;

  const session = { ...base, ...raw, chatId };

  // Только явный currentFlow — НЕ восстанавливать booking из orphan booking.active
  if (raw.currentFlow === "booking") {
    const d = raw.booking?.data || {};
    session.currentStep = raw.currentStep || raw.booking?.step || session.currentStep;
    session.selectedPractice =
      session.selectedPractice || d.serviceId || null;
    session.selectedPracticeTitle =
      session.selectedPracticeTitle || d.service || null;
    session.bookingDate = session.bookingDate || d.day || null;
    session.bookingTime = session.bookingTime || d.time || null;
    session.clientName = session.clientName || d.name || null;
    session.clientPhone = session.clientPhone || d.phone || null;
    session.contraindications =
      session.contraindications || d.contraindications || null;
    session.bookingComment = session.bookingComment || d.comment || null;
    session.flowStartedAt =
      session.flowStartedAt ||
      (raw.booking?.startedAt
        ? new Date(raw.booking.startedAt).toISOString()
        : session.updatedAt);
  } else if (raw.booking?.active) {
    delete session.booking;
  }

  if (raw.currentFlow === "concierge") {
    session.currentStep = raw.concierge.step || "emotion";
    session.emotionalState = raw.concierge.emotion || session.emotionalState;
    session.desiredOutcome = raw.concierge.outcome || session.desiredOutcome;
    session.recommendedPractice = raw.concierge.practiceId || session.recommendedPractice;
  }

  delete session.booking;
  delete session.concierge;

  if (session.currentFlow !== "booking" && session.currentFlow !== "concierge") {
    session.currentStep = null;
    session.waitingForTime = false;
    session.waitingForDate = false;
    session.waitingForPhone = false;
    session.pendingStep = null;
    if (!session.currentFlow) {
      session.selectedPractice = null;
      session.selectedPracticeTitle = null;
      session.bookingDate = null;
      session.bookingTime = null;
      session.contraindications = null;
      session.bookingComment = null;
    }
  }

  return session;
}

/**
 * Неактивный flow >30 мин — сброс FSM, данные клиента сохраняются.
 */
function applyFlowInactivityTimeout(session) {
  if (!session?.currentFlow) return session;

  const ref =
    session.lastFlowActivityAt || session.flowStartedAt || session.lastUpdatedAt;
  if (!ref) return session;

  const idle = Date.now() - new Date(ref).getTime();
  if (idle < FLOW_INACTIVITY_MS) return session;

  console.log("FLOW INACTIVITY RESET (>30min):", session.chatId);
  console.log("CURRENT FLOW:", session.currentFlow);

  session.currentFlow = null;
  session.currentStep = null;
  session.emotionalState = null;
  session.desiredOutcome = null;
  session.recommendedPractice = null;
  session.flowStartedAt = null;
  session.waitingForTime = false;
  session.waitingForDate = false;
  session.waitingForPhone = false;
  session.pendingStep = null;
  session.menuContext = "main";

  session.lastUpdatedAt = new Date().toISOString();
  return session;
}

/**
 * Сброс flow после 24ч: язык и имя сохраняются.
 */
function applySessionExpiry(session) {
  if (!session?.updatedAt) return session;

  const age = Date.now() - new Date(session.updatedAt).getTime();
  if (age < SESSION_TTL_MS) return session;

  const keptLanguage = session.language || "ru";
  const keptName =
    session.clientName || session.profile?.name || null;
  const keptPhone =
    session.clientPhone || session.profile?.phone || null;

  session.currentFlow = null;
  session.currentStep = null;
  session.selectedPractice = null;
  session.selectedPracticeTitle = null;
  session.emotionalState = null;
  session.desiredOutcome = null;
  session.recommendedPractice = null;
  session.bookingDate = null;
  session.bookingTime = null;
  session.contraindications = null;
  session.bookingComment = null;
  session.flowStartedAt = null;
  session.emotionalHold = false;
  session.emotionalHoldUntil = null;
  session.menuContext = "main";

  session.language = keptLanguage;
  session.clientName = keptName;
  session.clientPhone = keptPhone;
  if (keptName && session.profile) session.profile.name = keptName;
  if (keptPhone && session.profile) session.profile.phone = keptPhone;

  session.updatedAt = new Date().toISOString();
  console.log("SESSION EXPIRED (>24h):", session.chatId);
  return session;
}

function getFromStore(chatId) {
  if (adapter.map) return adapter.map.get(chatId) ?? null;
  return null;
}

function getSession(chatId) {
  const existing = getFromStore(chatId);
  let session = normalizeLegacySession(existing, chatId);

  if (!existing) {
    if (adapter.map) adapter.map.set(chatId, session);
    logSessionUpdate(chatId, session, ["init"]);
    return session;
  }

  session = applySessionExpiry(session);
  session = applyFlowInactivityTimeout(session);
  if (adapter.map) adapter.map.set(chatId, session);
  return session;
}

function patchSession(chatId, patch, options = {}) {
  const session = getSession(chatId);
  const keys = Object.keys(patch);
  const now = new Date().toISOString();
  Object.assign(session, patch, {
    updatedAt: now,
    lastUpdatedAt: now
  });
  if (adapter.map) adapter.map.set(chatId, session);
  if (!options.silent) {
    logSessionUpdate(chatId, session, keys);
  }
  return session;
}

/** @deprecated используйте patchSession */
function updateSession(chatId, patch) {
  return patchSession(chatId, patch);
}

function touchFlowActivity(session) {
  if (session.currentFlow) {
    session.lastFlowActivityAt = new Date().toISOString();
  }
}

function saveSession(chatId, session, changedKeys = []) {
  const now = new Date().toISOString();
  session.updatedAt = now;
  session.lastUpdatedAt = now;
  touchFlowActivity(session);
  if (adapter.map) adapter.map.set(chatId, session);
  logSessionUpdate(chatId, session, changedKeys);
  return session;
}

function loadAll() {
  /* no-op: in-memory only; для file-адаптера можно восстановить map */
}

module.exports = {
  SESSION_TTL_MS,
  FLOW_INACTIVITY_MS,
  createDefaultSession,
  getSession,
  patchSession,
  updateSession,
  saveSession,
  touchFlowActivity,
  applySessionExpiry,
  applyFlowInactivityTimeout,
  logSessionUpdate,
  setSessionAdapter,
  MemorySessionAdapter,
  loadAll
};
