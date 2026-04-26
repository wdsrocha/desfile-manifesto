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
  title: "Desfile Manifesto Amazonense",
  description:
    "Desfile aberto em Manaus, dia 26 de abril, na Faixa Liberada da Av. Getúlio Vargas — dentro da Semana Fashion Revolution. Aprovado em edital do Ministério da Cultura, segue para a 6ª Teia de Cultura Nacional, em Aracruz (ES), entre 19 e 24 de maio.",
  openGraph: {
    title: "Desfile Manifesto Amazonense",
    description:
      "26 de abril, na Faixa Liberada da Av. Getúlio Vargas, dentro da Semana Fashion Revolution.",
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
