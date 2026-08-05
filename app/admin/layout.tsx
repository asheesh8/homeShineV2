import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#182638",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "HomeSHINE Field App",
  description: "Field assessment app for HomeSHINE exterior care",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HomeSHINE",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function FieldAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
