import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fragrance Lab — Les parfums du monde et leurs dupes",
  description:
    "Trouvez votre parfum idéal, comparez ses notes et découvrez ses alternatives moins chères.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <div className="ambient" aria-hidden>
          <span />
          <span />
          <span />
          <span />
        </div>
        <Header />
        <div className="flex-1">{children}</div>
        <footer className="px-4 pb-6">
          <p className="glass mx-auto max-w-6xl rounded-3xl px-6 py-5 text-xs leading-relaxed text-muted">
            Fragrance Lab est un comparateur indépendant, sans lien avec les marques citées. Les
            noms de marques et de parfums servent uniquement à identifier les produits comparés.
          </p>
        </footer>
      </body>
    </html>
  );
}
