import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { business } from "@/content/business";
import { siteUrl } from "@/lib/site-url";
import { geologica, tektur } from "./fonts";
import "./globals.css";

const description = "LEGO машин, уул уурхайн RC техник, цэргийн загвар, frame, diecast: Brickzone хобби дэлгүүр. Улаанбаатар, орон нутагт хүргэлттэй, QPay-ээр төлнө.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${business.name}: LEGO, RC, MOC загварын дэлгүүр`, template: `%s · ${business.name}` },
  description,
  openGraph: { type: "website", locale: "mn_MN", siteName: business.name, description, images: [{ url: "/images/banners/50972.webp", width: 1254, height: 593 }] },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#1b1d22" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mn" className={`${tektur.variable} ${geologica.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-brick focus:px-4 focus:py-2 focus:text-white">
          Үндсэн агуулга руу
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
