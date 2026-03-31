/**
 * Bare layout for the coming-soon page.
 * Intentionally excludes Nav, Footer, and CookieConsent so nothing
 * in the global shell can intercept clicks on the coming-soon overlay.
 */
export default function ComingSoonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
