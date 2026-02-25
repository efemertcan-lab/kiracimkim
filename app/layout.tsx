import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kiracımkim – Güvenilir Kiracı Referans Sistemi",
  description:
    "Eski ev sahiplerinizden referans toplayın, yeni ev sahiplerine tek bir linkle gönderin. Güvenilir kiracı profilinizi oluşturun.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
