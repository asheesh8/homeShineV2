import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "HomeSHINE Field App",
  description: "Simple field assessment app for HomeSHINE",
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
