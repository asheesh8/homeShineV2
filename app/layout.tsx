import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0C1218",
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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
