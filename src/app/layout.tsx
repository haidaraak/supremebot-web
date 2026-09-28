import type { Metadata, Viewport } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { I18nProvider } from "@/i18n/I18nProvider";
import { ThemeProvider, setInitialTheme } from "@/lib/theme";
import { Cursor3D } from "@/components/ui/Cursor3D";
import { MotionProvider } from "@/components/motion/MotionProvider";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://supremex.zip"),
  title: {
    default: "SupremeBot — Authorized Stress Testing Platform",
    template: "%s · SupremeBot",
  },
  description:
    "SupremeBot is a professional load-testing platform with a REST API, layer 4 and layer 7 methods, real-time monitoring and precise controls — for authorized stress testing of your own infrastructure.",
  applicationName: "SupremeBot",
  keywords: [
    "load testing",
    "stress testing",
    "layer 4",
    "layer 7",
    "load test platform",
    "authorized testing",
  ],
  authors: [{ name: "SupremeBot" }],
  openGraph: {
    type: "website",
    siteName: "SupremeBot",
    title: "SupremeBot — Authorized Stress Testing Platform",
    description:
      "Authorized layer 4 and layer 7 stress testing with live telemetry, precise controls and an API built for automation.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SupremeBot — Authorized Stress Testing Platform",
    description:
      "Authorized layer 4 and layer 7 stress testing with live telemetry and an API built for automation.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f4f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0708" },
  ],
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-scroll-behavior lets Next 16 suppress smooth scrolling during route
    // transitions instead of fighting it.
    <html lang="en" dir="ltr" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/*
          Apply the stored theme before hydration so the palette is correct on
          the first paint. themeColor above also tracks the active scheme.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("supreme-theme");var l=window.matchMedia("(prefers-color-scheme: light)").matches;document.documentElement.dataset.theme=t||(l?"light":"dark");}catch(e){document.documentElement.dataset.theme="dark";}`,
          }}
        />
      </head>
      <body
        className={`${archivo.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <MotionProvider>
            <AuthProvider>
              <I18nProvider>{children}</I18nProvider>
            </AuthProvider>
          </MotionProvider>
        </ThemeProvider>
        <Cursor3D />
        {/* Film grain over the whole app. Breaks the gradient banding that
            makes large dark surfaces read as flat. One fixed layer, no scroll
            cost, and it sits under the cursor so it never softens text. */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[9998] opacity-[var(--grain-opacity)] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </body>
    </html>
  );
}
