const seen = new Map();
const TTL_MS = 60 * 60 * 1000;

function cleanup() {
  const now = Date.now();
  for (const [id, ts] of seen.entries()) {
    if (now - ts > TTL_MS) seen.delete(id);
  }
}

function isDuplicate(messageId) {
  if (!messageId) return false;
  cleanup();
  if (seen.has(messageId)) return true;
  seen.set(messageId, Date.now());
  return false;
}

module.exports = { isDuplicate };
