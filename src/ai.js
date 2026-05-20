const { buildSystemPrompt } = require("./prompt");
const { SALON } = require("./knowledge");

function polishReply(text, language) {
  let reply = String(text || "").trim();
  if (!reply) {
    return language === "kz"
      ? "Сізді тыңдап тұрмын 🌿 Қалай көмектесе аламын?"
      : "Слушаю вас 🌿 Чем могу помочь?";
  }

  reply = reply
    .replace(/я\s+(бот|ии|искусственный\s+интеллект|ai|нейросеть)/gi, "я")
    .replace(/мы\s+вас\s+вылечим/gi, "мы поможем вам восстановить ресурс")
    .replace(/гарантируем\s+лечение/gi, "подберём комфортный формат");

  if (reply.length > 520) {
    const parts = reply.split(/(?<=[.!?])\s+/);
    reply = parts.slice(0, 3).join(" ");
  }

  if (!reply.includes("?")) {
    reply +=
      language === "kz"
        ? "\n\nЖазылғыңыз келе ме, әлде тағы сұрақ бар ма?"
        : "\n\nХотите записаться или подсказать ещё что-то?";
  }

  return reply;
}

async function getAiReply({ openai, model, text, language, history, intent, profile }) {
  const context = [];
  if (profile?.name) context.push(`Имя клиента: ${profile.name}`);
  if (intent) context.push(`Намерение: ${intent}`);
  context.push(`Мастер: ${SALON.master}`);

  const messages = [
    { role: "system", content: buildSystemPrompt() },
    ...history.slice(-8).map((h) => ({ role: h.role, content: h.content })),
    {
      role: "user",
      content: `${context.join("\n")}\nЯзык: ${language}\nСообщение: ${text}\n\nОтвет: 2–4 коротких предложения, тепло, уверенно, на «вы». Без медицинских обещаний.`
    }
  ];

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.4,
    max_tokens: 140,
    messages
  });

  return polishReply(completion.choices?.[0]?.message?.content, language);
}

module.exports = { getAiReply, polishReply };
