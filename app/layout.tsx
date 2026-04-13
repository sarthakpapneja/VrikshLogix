import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { CookieConsent } from "@/components/compliance/cookie-consent";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VrikshLogix — Forest-to-Finish EUDR Compliance",
    template: "%s | VrikshLogix",
  },
  description:
    "Enterprise EUDR compliance platform for Indian wood handicraft exporters. Achieve 100% supply chain traceability from forest plot to export with polygon geolocation and automated DDS submission.",
  keywords: [
    "EUDR compliance",
    "timber traceability",
    "wood handicraft export",
    "Saharanpur",
    "Form-T permit",
    "Article 10 Risk Assessment",
    "Article 12 Public Disclosure",
    "Forest-to-Finish"
  ],
  alternates: {
    canonical: "https://vrikshlogix.app",
  },
  openGraph: {
    title: "VrikshLogix — Forest-to-Finish EUDR Compliance",
    description:
      "Digital EUDR compliance for Saharanpur wood exporters. Achieve absolute timber traceability before the December 2026 deadline.",
    type: "website",
    siteName: "VrikshLogix",
    url: "https://vrikshlogix.app",
    locale: "en_IN",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1b3022" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f0d" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body 
        className={`${plexSans.variable} ${plexMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
          <CookieConsent />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
