export type WellnessCertificate = {
  id: string;
  practiceName: string;
  trainingLabel: string;
  year: string;
  imageSrc: string;
  imageAlt: string;
  /** Newest training — shown first and featured in layout */
  isLead?: boolean;
};

export const CERTIFICATE_BADGES = [
  "Certified Practitioner",
  "International Wellness Training",
] as const;

/** Newest first — Mukaino Method leads the section */
export const WELLNESS_CERTIFICATES: WellnessCertificate[] = [
  {
    id: "mukaino-method",
    practiceName: "Mukaino Method",
    trainingLabel: "Mukaino M-Test · клиническое применение и диагностика",
    year: "2025",
    imageSrc: "/images/certificates/mukaino-method.jpg",
    imageAlt: "Сертификат Mukaino Method Basic Course",
    isLead: true,
  },
  {
    id: "gaiatouch",
    practiceName: "GAIAtouch",
    trainingLabel: "Международная телесная практика прикосновения",
    year: "2024",
    imageSrc: "/images/certificates/gaiatouch.jpg",
    imageAlt: "Сертификат GAIAtouch",
  },
  {
    id: "access-bars",
    practiceName: "Access Bars",
    trainingLabel: "Access Consciousness · Bars Practitioner",
    year: "2024",
    imageSrc: "/images/certificates/access-bars.jpg",
    imageAlt: "Сертификат Access Bars Practitioner",
  },
  {
    id: "massage-5-continents",
    practiceName: "Massage des 5 Continents",
    trainingLabel: "Международная программа массажа",
    year: "2024",
    imageSrc: "/images/certificates/massage-5-continents.jpg",
    imageAlt: "Диплом Massage des 5 Continents",
  },
  {
    id: "earthflow",
    practiceName: "EarthFlow",
    trainingLabel: "Практика заземления и внутреннего центра",
    year: "2024",
    imageSrc: "/images/certificates/earthflow.jpg",
    imageAlt: "Сертификат EarthFlow",
  },
];
