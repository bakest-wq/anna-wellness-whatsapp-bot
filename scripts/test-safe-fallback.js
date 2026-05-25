const assert = require("node:assert/strict");

const {
  shouldSendMaintenanceToUser,
  isRecoverableBotError,
  isGreetingOrMenuInteraction,
  resolveWebhookRecoveryPlan,
  buildSafeMenuOutbound
} = require("../src/safeFallback");
const { getSession } = require("../src/sessionStore");

function test(name, fn) {
  try {
    fn();
    console.log("ok -", name);
  } catch (err) {
    console.error("FAIL -", name, err.message);
    process.exitCode = 1;
  }
}

test("TypeError must NOT trigger maintenance", () => {
  const err = new TypeError("Cannot read property 'x' of undefined");
  assert.equal(shouldSendMaintenanceToUser(err), false);
  assert.equal(isRecoverableBotError(err), true);
});

test("OpenAI unavailable may trigger maintenance as last resort", () => {
  const err = new Error("OpenAI API key invalid");
  err.status = 401;
  assert.equal(shouldSendMaintenanceToUser(err), true);
});

test("Greetings never trigger maintenance", () => {
  const err = new Error("route failed");
  assert.equal(
    shouldSendMaintenanceToUser(err, { incomingText: "Здравствуйте" }),
    false
  );
  assert.equal(isGreetingOrMenuInteraction("Салем"), true);
  assert.equal(isGreetingOrMenuInteraction("Привет"), true);
});

test("resolveWebhookRecoveryPlan prefers menu for greetings", () => {
  const session = getSession("safe-fallback-test");
  const plan = resolveWebhookRecoveryPlan(new Error("router broke"), session, "ru", {
    incomingText: "Здравствуйте"
  });
  assert.equal(plan.forceMenu, true);
  assert.equal(plan.sendMaintenance, false);
  assert.match(plan.menuOutbound.reply, /Sakina Wellness|Здравствуйте/);
});

test("buildSafeMenuOutbound returns welcome, not maintenance", () => {
  const session = getSession("safe-fallback-test-2");
  const outbound = buildSafeMenuOutbound(session, "ru");
  assert.match(outbound.reply, /Sakina Wellness/);
  assert.doesNotMatch(outbound.reply, /небольшая пауза/i);
});

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("safe-fallback tests OK");
