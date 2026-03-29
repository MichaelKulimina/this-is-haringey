import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "How This Is Haringey uses cookies and similar technologies.",
};

const LAST_UPDATED = "30 March 2026";

export default function CookiePolicyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      {/* Page header */}
      <div className="mb-10">
        <p className="text-xs font-semibold tracking-[0.10em] uppercase text-primary mb-3">
          Legal
        </p>
        <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-foreground mb-3">
          Cookie Policy
        </h1>
        <p className="text-sm text-muted">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="space-y-10 text-[15px] text-foreground leading-relaxed">

        {/* 1 */}
        <section>
          <h2 className="text-xl font-bold tracking-[-0.02em] text-foreground mb-3">
            1. What are cookies?
          </h2>
          <p className="text-muted">
            Cookies are small text files placed on your device by websites you
            visit. They are used to make websites work properly, remember your
            preferences, and understand how a site is being used. You can
            control and delete cookies through your browser settings at any time.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-xl font-bold tracking-[-0.02em] text-foreground mb-3">
            2. Cookies we use
          </h2>
          <p className="text-muted mb-5">
            This Is Haringey uses only the cookies that are strictly necessary
            to operate the platform. We do not use advertising cookies,
            cross-site tracking cookies, or any third-party analytics cookies.
          </p>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-background border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-foreground">
                    Cookie
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">
                    Purpose
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-3 text-foreground font-mono text-xs align-top">
                    sb-[ref]-auth-token
                  </td>
                  <td className="px-4 py-3 text-muted align-top whitespace-nowrap">
                    Strictly necessary
                  </td>
                  <td className="px-4 py-3 text-muted align-top">
                    Keeps event organisers and administrators signed in to their
                    accounts. Without this cookie, you would be logged out on
                    every page load.
                  </td>
                  <td className="px-4 py-3 text-muted align-top whitespace-nowrap">
                    Session / up to 7 days
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-foreground font-mono text-xs align-top">
                    tih-cookie-consent
                  </td>
                  <td className="px-4 py-3 text-muted align-top">
                    Functional
                  </td>
                  <td className="px-4 py-3 text-muted align-top">
                    Remembers your cookie preference so the consent banner is
                    not shown on every visit. Stored in your browser&apos;s
                    localStorage (not a cookie), so it is not sent to our
                    servers.
                  </td>
                  <td className="px-4 py-3 text-muted align-top">
                    Persistent
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-xl font-bold tracking-[-0.02em] text-foreground mb-3">
            3. Analytics
          </h2>
          <p className="text-muted">
            This Is Haringey uses first-party, server-side analytics only. When
            you visit a page, we log the page path and referring source (if any)
            to our own database. This data is anonymous — we do not log your IP
            address and no analytics cookies are set. Your browsing on this site
            is not tracked across other websites.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-xl font-bold tracking-[-0.02em] text-foreground mb-3">
            4. How to manage cookies
          </h2>
          <p className="text-muted mb-4">
            You can control cookies through your browser settings. Note that
            disabling the session cookie (<code className="text-foreground bg-background px-1 py-0.5 rounded text-xs font-mono border border-border">sb-[ref]-auth-token</code>) will log you out of any organiser or admin account.
          </p>
          <p className="text-muted mb-4">
            Instructions for managing cookies in common browsers:
          </p>
          <ul className="space-y-2 text-muted">
            {[
              {
                name: "Google Chrome",
                url: "https://support.google.com/chrome/answer/95647",
              },
              {
                name: "Mozilla Firefox",
                url: "https://support.mozilla.org/kb/clear-cookies-and-site-data-firefox",
              },
              {
                name: "Apple Safari",
                url: "https://support.apple.com/guide/safari/manage-cookies-sfri11471",
              },
              {
                name: "Microsoft Edge",
                url: "https://support.microsoft.com/microsoft-edge/delete-cookies-in-microsoft-edge",
              },
            ].map(({ name, url }) => (
              <li key={name}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {name} ↗
                </a>
              </li>
            ))}
          </ul>
          <p className="text-muted mt-4">
            To reset your cookie preference on this site, clear your
            browser&apos;s localStorage for thisisharingey.co.uk and reload the
            page. The consent banner will reappear.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-xl font-bold tracking-[-0.02em] text-foreground mb-3">
            5. Changes to this policy
          </h2>
          <p className="text-muted">
            We may update this Cookie Policy if our use of cookies changes. The
            date at the top of this page reflects the most recent version.
          </p>
        </section>

        {/* Back link */}
        <div className="pt-2 border-t border-border">
          <p className="text-sm text-muted">
            For full details on how we handle personal data, see our{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            . Questions?{" "}
            <a
              href="mailto:hello@thisisharingey.co.uk"
              className="text-primary hover:underline"
            >
              hello@thisisharingey.co.uk
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
