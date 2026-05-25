export type InternationalPractice = {
  id: string;
  name: string;
  year: string;
  certificateSrc: string;
  certificateAlt: string;
  isLead?: boolean;
};

export const CERTIFICATES_HEADLINE =
  "Международные практики и обучение";

/** Same order as WELLNESS_CERTIFICATES — Mukaino Method first */
export const INTERNATIONAL_PRACTICES: InternationalPractice[] = [
  {
    id: "mukaino-m-test",
    name: "Mukaino Method",
    year: "2025",
    certificateSrc: "/images/certificates/mukaino-method.jpg",
    certificateAlt: "Сертификат Mukaino Method",
    isLead: true,
  },
  {
    id: "gaiatouch",
    name: "GAIAtouch",
    year: "2024",
    certificateSrc: "/images/certificates/gaiatouch.jpg",
    certificateAlt: "Сертификат GAIAtouch — Anna Murzabayeva",
  },
  {
    id: "access-bars",
    name: "Access Bars",
    year: "2024",
    certificateSrc: "/images/certificates/access-bars.jpg",
    certificateAlt: "Сертификат Access Bars Practitioner",
  },
  {
    id: "massage-5-continents",
    name: "Massage des 5 Continents",
    year: "2024",
    certificateSrc: "/images/certificates/massage-5-continents.jpg",
    certificateAlt: "Диплом Massage des 5 Continents",
  },
  {
    id: "earthflow",
    name: "EarthFlow",
    year: "2024",
    certificateSrc: "/images/certificates/earthflow.jpg",
    certificateAlt: "Сертификат EarthFlow",
  },
];
