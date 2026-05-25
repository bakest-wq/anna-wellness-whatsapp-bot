const { buildSystemPrompt } = require("./prompt");
const { WELLNESS } = require("./knowledge");
const { BRAND } = require("./brand");
const { detectEmotionalDistress } = require("./emotionalSupport");
const { normalizeLanguage, hasKazakhScript } = require("./language");

const SALES_CLOSERS =
  /запис|жазыл|практик.*ближе|какая\s+практика|стоит\s+попробовать|рекомендую\s+массаж/i;

function polishReply(text, language, options = {}) {
  const lang = normalizeLanguage(language);
  let reply = String(text || "").trim();
  const emotional = options.emotional || options.holdSales;

  if (!reply) {
    return emotional || lang === "kz"
      ? "Естіп тұрмын 🤍 Мұнда асықпай болады — қалай қолдау көрсете аламын?"
      : "Слушаю вас 🤍 Здесь можно не спешить — чем мягко подсказать?";
  }

  if (lang === "ru" && hasKazakhScript(reply)) {
    reply =
      "Слушаю вас 🤍 Здесь можно не спешить — чем мягко подсказать о практиках или записи?";
  }

  if (
    lang === "kz" &&
    !hasKazakhScript(reply) &&
    /\b(здравствуйте|слушаю|спасибо|пожалуйста|записаться|цены|адрес|противопоказания|практик)\b/i.test(
      reply
    )
  ) {
    reply = "Естіп тұрмын 🤍 Мұнда асықпай болады — қалай қолдау көрсете аламын?";
  }

  reply = reply
    .replace(/я\s+(бот|ии|искусственный\s+интеллект|ai|нейросеть)/gi, "")
    .replace(/мы\s+вас\s+вылечим/gi, "мы мягко поддерживаем восстановление")
    .replace(/вылечим\s+депресс/gi, "поддержим состояние")
    .replace(/гарантируем\s+лечение/gi, "подберём бережный формат")
    .replace(/обязательно\s+запиш/gi, "когда будете готовы")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (emotional && SALES_CLOSERS.test(reply)) {
    reply = reply
      .replace(SALES_CLOSERS, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  if (reply.length > 340) {
    const parts = reply.split(/(?<=[.!?])\s+/);
    reply = parts.slice(0, 2).join(" ");
  }

  if (!reply.includes("?") && !emotional) {
    reply += lang === "kz" ? "\n\nҚалай қолдау көрсете аламын?" : "\n\nЧем мягко подсказать?";
  }

  return reply;
}

async function getAiReply({ openai, model, text, language, history, intent, profile, emotional }) {
  const lang = normalizeLanguage(language);
  const context = [];
  if (profile?.name) context.push(`Имя: ${profile.name}`);
  if (emotional) {
    context.push(
      "ВАЖНО: клиент в уязвимом состоянии. Только поддержка и безопасность. Без продаж и записи."
    );
  }
  context.push(`${BRAND.name} · бережное wellness-пространство`);
  context.push(`Мастер: ${WELLNESS.master}`);

  const langInstruction =
    lang === "kz"
      ? "Жауап ТЕК қазақша. Орысша сөз қолданбаңыз."
      : "Ответ СТРОГО на русском. Казахские слова не используйте.";

  const userInstruction = emotional
    ? `${context.join("\n")}\n${langInstruction}\nСообщение: ${text}\n\nОтвет: 1–2 короткие тёплые фразы. Понимание + безопасность. Без массажа и записи.`
    : `${context.join("\n")}\n${langInstruction}\nСообщение: ${text}\n\nОтвет: 1–3 короткие спокойные фразы. Без давления.`;

  const messages = [
    { role: "system", content: buildSystemPrompt(lang) },
    ...history.slice(-6).map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: userInstruction }
  ];

  if (!openai?.chat?.completions?.create) {
    const err = new Error("OpenAI client unavailable");
    err.code = "openai_unavailable";
    throw err;
  }

  const completion = await openai.chat.completions.create({
    model,
    temperature: emotional ? 0.65 : 0.5,
    max_tokens: emotional ? 100 : 110,
    messages
  });

  return polishReply(completion.choices?.[0]?.message?.content, lang, {
    emotional: emotional || detectEmotionalDistress(text),
    holdSales: emotional
  });
}

module.exports = { getAiReply, polishReply };
