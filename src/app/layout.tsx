import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistem Pemantauan Pengurusan Risiko",
  description:
    "Sistem berpusat untuk merekod, menyemak dan memantau risiko serta tindakan kawalan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms">
      <body>{children}</body>
    </html>
  );
}
