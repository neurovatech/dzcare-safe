import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/Analytics";
import CartDrawer from "@/components/CartDrawer";
import FloatingContact from "@/components/FloatingContact";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JsonLd, { localBusinessLd, websiteLd } from "@/components/JsonLd";
import { site } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Best Phone Repair Service Center in Dhaka`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "phone repair Dhaka",
    "mobile repair Bangladesh",
    "iPhone repair Dhaka",
    "Samsung service center Dhaka",
    "screen replacement Dhaka",
    "battery replacement",
    "mobile servicing center",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: "/",
    title: `${site.name} — Premium Phone Repair in Dhaka`,
    description: site.description,
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.FACEBOOK_DOMAIN_VERIFICATION
      ? { "facebook-domain-verification": process.env.FACEBOOK_DOMAIN_VERIFICATION }
      : undefined,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#fffbf6",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white font-sans text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <FloatingContact />
        <CartDrawer />
        <JsonLd data={localBusinessLd} />
        <JsonLd data={websiteLd} />
        <Analytics />
      </body>
    </html>
  );
}
