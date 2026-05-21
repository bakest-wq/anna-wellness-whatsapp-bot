function getTypingDelayMs() {
  const min = Number(process.env.TYPING_DELAY_MIN_MS || 1000);
  const max = Number(process.env.TYPING_DELAY_MAX_MS || 2000);
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withTypingPause(sendTyping, ms) {
  if (sendTyping) {
    try {
      await sendTyping(ms);
    } catch (_) {}
  }
  await delay(ms);
}

module.exports = {
  getTypingDelayMs,
  delay,
  withTypingPause
};
