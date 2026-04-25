import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
