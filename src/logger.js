const fs = require("fs");
const path = require("path");

const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), "logs");
const LOG_FILE = process.env.LOG_FILE || path.join(LOG_DIR, "app.log");

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function formatLine(level, message, meta) {
  const ts = new Date().toISOString();
  const metaText = meta ? ` ${JSON.stringify(meta)}` : "";
  return `[${ts}] [${level}] ${message}${metaText}\n`;
}

function write(level, message, meta) {
  try {
    ensureLogDir();
    fs.appendFileSync(LOG_FILE, formatLine(level, message, meta), "utf8");
  } catch (err) {
    console.error("Logger write failed:", err.message);
  }
}

const logger = {
  info(message, meta) {
    console.log(message, meta || "");
    write("INFO", message, meta);
  },
  warn(message, meta) {
    console.warn(message, meta || "");
    write("WARN", message, meta);
  },
  error(message, meta) {
    console.error(message, meta || "");
    write("ERROR", message, meta);
  },
  debug(message, meta) {
    if (process.env.LOG_LEVEL === "debug") {
      console.debug(message, meta || "");
      write("DEBUG", message, meta);
    }
  }
};

module.exports = { logger, LOG_FILE };
