import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-serif",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Manifesto — Desfile de Moda",
  description:
    "Manifesto: um desfile-celebração que reúne marcas autorais, modelos e criativos em uma noite editorial única.",
  openGraph: {
    title: "Manifesto — Desfile de Moda",
    description:
      "Manifesto: um desfile-celebração que reúne marcas autorais, modelos e criativos.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${cormorant.variable} ${inter.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
