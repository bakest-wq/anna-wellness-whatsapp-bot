const BUSINESS_INTENT_RE =
  /(запис|брон|свободн|цена|стоим|прайс|сколько|адрес|где\s+вы|как\s+доехать|earth\s*flow|эртфлоу|access\s*bars|барс|континент|массаж|завтра|послезавтра|сегодня|ертең|бүгін|сағат|мекенжай|баға|жазыл|устал|нет\s+сил|тревог|тревож|напряж|расслаб|шарша|мазасыз)/i;

function hasBusinessIntent(text) {
  return BUSINESS_INTENT_RE.test(String(text || ""));
}

module.exports = { hasBusinessIntent };
