import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Countdown-dle",
  description: "The definitive daily Countdown word game challenge",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
