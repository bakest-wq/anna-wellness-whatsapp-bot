const whatsappPath = require.resolve("../src/whatsapp");
const realWhatsapp = require(whatsappPath);
const sent = [];

require.cache[whatsappPath].exports = {
  ...realWhatsapp,
  sendWhatsApp: async ({ to, text }) => {
    sent.push({ to, text });
    return { ok: true };
  },
  sendOutboundMessages: async ({ to, messages }) => {
    for (const message of messages) {
      sent.push({ to, text: message.text || `[${message.type}]` });
    }
  },
  tryInteractiveButtonsOnly: async () => ({ mode: "skipped" })
};

const { processIncomingMessage } = require("../src/incomingMessage");

const logger = {
  info() {},
  warn() {},
  error() {},
  debug() {}
};

function greenTextWebhook(userId, text, idMessage) {
  const chatId = `${userId}@c.us`;
  return {
    typeWebhook: "incomingMessageReceived",
    idMessage,
    senderData: { sender: chatId, chatId },
    messageData: {
      typeMessage: "textMessage",
      textMessageData: { textMessage: text }
    }
  };
}

async function run() {
  const userId = `770000${Date.now()}`;
  const common = {
    waConfig: { provider: "green" },
    openai: null,
    model: "",
    notifyAdmin: async () => {}
  };

  await processIncomingMessage({
    body: greenTextWebhook(userId, "Здравствуйте", `${userId}-1`),
    ...common
  });
  await processIncomingMessage({
    body: greenTextWebhook(userId, "1", `${userId}-2`),
    ...common
  });
  await processIncomingMessage({
    body: greenTextWebhook(userId, "1", `${userId}-3`),
    ...common
  });

  if (sent.length !== 3) {
    console.error("Expected 3 outgoing messages, got", sent.length);
    console.error(sent.map((m) => m.text?.slice(0, 120)));
    process.exit(1);
  }

  const booking = sent[2].text || "";
  if (!/день|удобн|запис|сеанс/i.test(booking)) {
    console.error("Expected booking start after primary recommendation action, got", booking);
    process.exit(1);
  }

  console.log("incoming recommendation flow OK");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
