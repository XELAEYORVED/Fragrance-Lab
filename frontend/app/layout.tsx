import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fragrance Lab — Les parfums du monde et leurs dupes",
  description:
    "Trouvez votre parfum idéal, comparez ses notes et découvrez ses alternatives moins chères.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-line px-6 py-10 text-xs text-muted">
          <p className="mx-auto max-w-6xl leading-relaxed">
            Fragrance Lab est un comparateur indépendant, sans lien avec les marques citées. Les
            noms de marques et de parfums servent uniquement à identifier les produits comparés.
          </p>
        </footer>
      </body>
    </html>
  );
}
