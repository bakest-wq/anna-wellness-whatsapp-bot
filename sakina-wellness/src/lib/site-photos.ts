import { ANNA_PHOTOS } from "./anna-photos";

/**
 * Editorial atmosphere photography — public/images/photos/
 */
export const SITE_PHOTOS = {
  hero: ANNA_PHOTOS.portrait,
  portrait: ANNA_PHOTOS.portrait,
  heroVisual: ANNA_PHOTOS.handsWorking,
  heroRoom: "/images/photos/room.jpg",
  heroHands: ANNA_PHOTOS.handsWorking,
  quoteBackground: "/images/photos/therapy-atmosphere.jpg",
  atmosphere: {
    hands: ANNA_PHOTOS.handsWorking,
    candle: "/images/photos/candle.jpg",
    room: "/images/photos/room.jpg",
    detail: "/images/photos/hands-detail.jpg",
  },
} as const;

export const ATMOSPHERE_ALT = {
  hands: "Бережная работа руками во время сеанса",
  candle: "Тёплый свет свечи в кабинете",
  room: "Тихое пространство Sakina Wellness",
  detail: "Детали практики — внимание к телу",
} as const;

/** @deprecated Legacy sanctuary/home components */
export const ATMOSPHERE_EDITORIAL = [
  { id: "hands", src: SITE_PHOTOS.atmosphere.hands, alt: ATMOSPHERE_ALT.hands },
  { id: "candle", src: SITE_PHOTOS.atmosphere.candle, alt: ATMOSPHERE_ALT.candle },
  { id: "room", src: SITE_PHOTOS.atmosphere.room, alt: ATMOSPHERE_ALT.room },
  { id: "detail", src: SITE_PHOTOS.atmosphere.detail, alt: ATMOSPHERE_ALT.detail },
] as const;

export const ATMOSPHERE_PHOTOS = ATMOSPHERE_EDITORIAL.map((p) => ({
  src: p.src,
  alt: p.alt,
  caption: "",
}));
