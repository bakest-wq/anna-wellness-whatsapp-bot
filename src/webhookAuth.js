const crypto = require("crypto");

function timingSafeEqual(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function verifyWhatsAppCloudSignature(rawBody, signatureHeader, appSecret) {
  if (!appSecret) return { ok: true, skipped: true };
  if (!signatureHeader) return { ok: false, reason: "missing_signature" };

  const expected =
    "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");

  const ok = timingSafeEqual(expected, signatureHeader);
  return { ok, reason: ok ? "valid" : "invalid_signature" };
}

function verifyGreenWebhook(req, secret) {
  if (!secret) return { ok: true, skipped: true };

  const headerToken = req.headers["x-green-webhook-token"] || req.headers["authorization"];
  const queryToken = req.query?.token;
  const provided = String(headerToken || queryToken || "")
    .replace(/^Bearer\s+/i, "")
    .trim();

  if (!provided) return { ok: false, reason: "missing_token" };
  const ok = timingSafeEqual(provided, secret);
  return { ok, reason: ok ? "valid" : "invalid_token" };
}

module.exports = {
  verifyWhatsAppCloudSignature,
  verifyGreenWebhook
};
