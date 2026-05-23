const fs = require("fs");
const path = require("path");

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");

let cache = {};
let dirty = false;
let saveTimer = null;

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadAll() {
  ensureDir();
  if (!fs.existsSync(SESSIONS_FILE)) {
    cache = {};
    return;
  }
  try {
    cache = JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf8"));
  } catch {
    cache = {};
  }
}

function scheduleSave() {
  dirty = true;
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    if (!dirty) return;
    ensureDir();
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(cache, null, 2), "utf8");
    dirty = false;
    saveTimer = null;
  }, 400);
}

function defaultSession() {
  return {
    language: "ru",
    history: [],
    booking: null,
    concierge: null,
    lastPracticeId: null,
    profile: { name: "", phone: "", visits: 0 },
    lastIntent: null,
    menuContext: "main",
    updatedAt: new Date().toISOString()
  };
}

function getSession(userId) {
  if (!cache[userId]) {
    cache[userId] = defaultSession();
    scheduleSave();
  }
  return cache[userId];
}

function updateSession(userId, patch) {
  const session = getSession(userId);
  Object.assign(session, patch, { updatedAt: new Date().toISOString() });
  cache[userId] = session;
  scheduleSave();
  return session;
}

loadAll();

module.exports = {
  getSession,
  updateSession,
  loadAll
};
