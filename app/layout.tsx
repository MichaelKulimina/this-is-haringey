import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

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
  },
};

function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Wordmark */}
        <Link
          href="/"
          className="text-lg font-semibold text-foreground tracking-tight hover:text-primary transition-colors"
        >
          This Is Haringey
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/submit"
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Submit an event
          </Link>
          <Link
            href="/organiser/login"
            className="text-sm text-muted hover:text-foreground transition-colors"
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
            <p className="font-semibold text-foreground">This Is Haringey</p>
            <p className="text-sm text-muted mt-1">
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
          </nav>
        </div>

        <p className="text-xs text-muted mt-8 border-t border-border pt-6">
          © {new Date().getFullYear()} This Is Haringey. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
