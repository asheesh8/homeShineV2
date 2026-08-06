import type { Metadata, Viewport } from "next";
import { Inter, Libre_Baskerville, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "./site.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

// Matches the certificate the field app issues (lib/field-app-documents.ts).
const serif = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#050a12",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "HomeSHINE — Soft Washing & Power Washing in Chittenden County, VT",
    template: "%s — HomeSHINE",
  },
  description:
    "Soft washing and power washing for Vermont homes. We match the method to the surface so roofs, siding, and wood get chemistry — not force.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
