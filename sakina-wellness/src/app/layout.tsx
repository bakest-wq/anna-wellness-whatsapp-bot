import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope, Pinyon_Script } from "next/font/google";
import {
  SITE_DESCRIPTION,
  SITE_LOGO_ALT,
  SITE_LOGO_PATH,
  SITE_NAME,
  SITE_TITLE,
} from "@/lib/brand";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const displaySerif = Cormorant_Garamond({
  variable: "--font-display-serif",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600"],
});

const sansUi = Manrope({
  variable: "--font-sans-ui",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600"],
});

const scriptAccent = Pinyon_Script({
  variable: "--font-script-accent",
  subsets: ["latin"],
  weight: ["400"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_TITLE}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_TITLE,
  icons: {
    icon: [{ url: SITE_LOGO_PATH, type: "image/png", sizes: "any" }],
    apple: [{ url: SITE_LOGO_PATH, type: "image/png", sizes: "180x180" }],
    shortcut: SITE_LOGO_PATH,
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: siteUrl,
    siteName: SITE_TITLE,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: SITE_LOGO_PATH,
        alt: SITE_LOGO_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [SITE_LOGO_PATH],
  },
  appleWebApp: {
    capable: true,
    title: SITE_TITLE,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF7F2" },
    { media: "(prefers-color-scheme: dark)", color: "#2C2620" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${displaySerif.variable} ${sansUi.variable} ${scriptAccent.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#FAF7F2] text-[#3D3830] [-webkit-font-smoothing:antialiased] [text-rendering:optimizeLegibility]">
        {children}
      </body>
    </html>
  );
}
