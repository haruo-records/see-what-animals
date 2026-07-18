import type { Metadata } from "next";
import "./globals.css";
import { sans, serif, jp } from "./fonts";
import { siteSettings } from "@/data/site-settings";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";

export const metadata: Metadata = {
  metadataBase: new URL(siteSettings.siteUrl),
  title: {
    default: `${siteSettings.brandName} — ${siteSettings.tagline}`,
    template: `%s — ${siteSettings.brandName}`,
  },
  description:
    "See What? is a place to see before naming. Observe an unfamiliar form, leave what you saw, and see how differently others saw it.",
  applicationName: siteSettings.brandName,
  openGraph: {
    type: "website",
    siteName: siteSettings.brandName,
    title: `${siteSettings.brandName} — ${siteSettings.tagline}`,
    description: "A project for looking before naming.",
    url: siteSettings.siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteSettings.brandName} — ${siteSettings.tagline}`,
    description: "A project for looking before naming.",
  },
  robots: { index: true, follow: true },
  /**
   * No `icons` key on purpose. `app/favicon.ico`, `app/icon.svg` and
   * `app/apple-icon.png` are Next.js file conventions — Next hashes them and
   * injects the <link> tags itself. Declaring them here as well would produce
   * duplicate, unhashed tags.
   */
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteSettings.brandName,
  url: siteSettings.siteUrl,
  description: "A project for looking before naming.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${jp.variable}`}>
      <body className="min-h-screen font-sans">
        {/* Google Analytics 4 (gtag.js) — loaded once for every page. */}
        <GoogleAnalytics />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-charcoal focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </body>
    </html>
  );
}
