const {
  getMenuTextBlock,
  resolveMenuAction,
  messageAlreadyHasMenu,
  MAIN_MENU_TEXT
} = require("../src/menus");

const ru = getMenuTextBlock("ru", "main");
const kz = getMenuTextBlock("kz", "main");

if (ru !== MAIN_MENU_TEXT.ru) {
  console.error("RU menu mismatch");
  process.exit(1);
}
if (kz !== MAIN_MENU_TEXT.kz) {
  console.error("KZ menu mismatch");
  process.exit(1);
}

const ruRoutes = [1, 2, 3, 4, 5, 6].map((n) =>
  resolveMenuAction(null, String(n), "main")
);
const expected = [
  "concierge",
  "booking",
  "price",
  "address",
  "contraindications",
  "practices"
];
if (JSON.stringify(ruRoutes) !== JSON.stringify(expected)) {
  console.error("RU numeric routes", ruRoutes);
  process.exit(1);
}

const kz1 = resolveMenuAction(null, "1", "main");
if (kz1 !== "concierge") {
  console.error("KZ digit 1", kz1);
  process.exit(1);
}

if (!messageAlreadyHasMenu(ru)) {
  console.error("messageAlreadyHasMenu failed");
  process.exit(1);
}

console.log("main menu OK");
console.log(ru.slice(0, 80) + "...");
