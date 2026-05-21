/** @deprecated Re-exports from menus.js — use menus module directly */
const menus = require("./menus");

module.exports = {
  BUTTON_IDS: {
    PRICE: menus.ITEMS.price.id,
    BOOKING: menus.ITEMS.booking.id,
    ADDRESS: menus.ITEMS.address.id,
    CONTRA: menus.ITEMS.contra.id,
    PRACTICES: menus.ITEMS.practices.id,
    SESSION: menus.ITEMS.session.id,
    BACK: menus.ITEMS.back.id
  },
  MENU_ITEMS: menus.getContextItems("main"),
  getInteractiveMenuBlock: (lang) => menus.buildMenuBlock(lang, "main", { fullBody: true }),
  getQuickMenuBlock: (lang) => menus.buildMenuBlock(lang, "default"),
  getInteractiveMenuParts: (lang) => [menus.buildMenuBlock(lang, "main", { fullBody: true })],
  getTextMenuFallback: menus.getTextMenuFallback,
  resolveButtonIntent: menus.resolveMenuAction,
  resolveNumericMenu: (text) => menus.resolveMenuAction(text, text, "main")
};
