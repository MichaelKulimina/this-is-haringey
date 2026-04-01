import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { headers } from "next/headers";
import PageTracker from "@/components/PageTracker";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "This Is Haringey",
    template: "%s | This Is Haringey",
  },
  description:
    "Discover events in Haringey — arts, music, food, community and more. Supporting Haringey Borough of Culture 2027.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://thisisharingey.co.uk"
  ),
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "This Is Haringey",
    // Default OG image — inherited by all pages without a specific image.
    // Pages that define their own openGraph.images will override this.
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
};

function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Inline logotype — DLS § 2 */}
        <Link href="/" className="flex flex-col leading-none select-none">
          <span className="text-[11px] font-semibold tracking-[0.20em] uppercase text-primary">
            This Is
          </span>
          <span className="text-[22px] font-extrabold tracking-[-0.04em] text-foreground">
            Haringey<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/submit"
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-md bg-primary text-white text-sm font-semibold tracking-[-0.01em] hover:bg-primary-dark transition-colors"
          >
            Submit an event
          </Link>
          <Link
            href="/organiser/login"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          {/* Brand */}
          <div>
            <div className="flex flex-col leading-none select-none mb-2">
              <span className="text-[10px] font-semibold tracking-[0.20em] uppercase text-primary">
                This Is
              </span>
              <span className="text-lg font-extrabold tracking-[-0.04em] text-foreground">
                Haringey<span className="text-primary">.</span>
              </span>
            </div>
            <p className="text-sm text-muted">
              Your guide to events in the London Borough of Haringey
            </p>
            <p className="text-sm text-boc mt-1 font-medium">
              Part of Haringey Borough of Culture 2027
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/submit" className="hover:text-foreground transition-colors">
              Submit an event
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="hover:text-foreground transition-colors">
              Cookie Policy
            </Link>
            <Link href="/admin" className="hover:text-foreground transition-colors">
              Admin
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-border pt-6 flex items-center justify-between gap-4">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} This Is Haringey. All rights reserved.
          </p>
          <a
            href="https://kulimina.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 opacity-60 hover:opacity-90 transition-opacity shrink-0 no-underline"
          >
            <span className="text-[10px] text-muted tracking-wide">Powered by</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/kulimina-wordmark.png" alt="KULIMINA" className="h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''
  const isComingSoon = pathname === '/coming-soon'

  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        {/* Skip-to-content — WCAG 2.1 AA 2.4.1 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-surface focus:text-foreground focus:rounded-md focus:border focus:border-border focus:shadow-md focus:text-sm focus:font-medium"
        >
          Skip to main content
        </a>
        <PageTracker />
        {!isComingSoon && <Nav />}
        <main id="main-content" className="flex-1">{children}</main>
        {!isComingSoon && <Footer />}
        {!isComingSoon && <CookieConsent />}
      </body>
    </html>
  );
}
