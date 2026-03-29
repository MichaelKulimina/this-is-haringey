import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How This Is Haringey collects, uses, and protects your personal data.",
};

const LAST_UPDATED = "30 March 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      {/* Page header */}
      <div className="mb-10">
        <p className="text-xs font-semibold tracking-[0.10em] uppercase text-primary mb-3">
          Legal
        </p>
        <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-foreground mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="prose-content space-y-10 text-[15px] text-foreground leading-relaxed">

        {/* 1 */}
        <section>
          <h2 className="text-xl font-bold tracking-[-0.02em] text-foreground mb-3">
            1. Who we are
          </h2>
          <p className="text-muted">
            This Is Haringey is a community events directory for the London
            Borough of Haringey, operated as part of the Borough of Culture 2027
            programme. If you have any questions about this policy or how we
            handle your data, please contact us at{" "}
            <a
              href="mailto:hello@thisisharingey.co.uk"
              className="text-primary hover:underline"
            >
              hello@thisisharingey.co.uk
            </a>
            .
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-xl font-bold tracking-[-0.02em] text-foreground mb-3">
            2. What data we collect
          </h2>
          <div className="space-y-4 text-muted">
            <div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                Event organisers
              </h3>
              <p>
                When you submit an event, we collect your name, email address,
                and the details of your event. Payment is handled directly by
                Stripe — we do not store card numbers or full payment details.
                We retain only the Stripe payment reference for our records.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                Subscribers
              </h3>
              <p>
                When you sign up for our weekly digest, we collect your email
                address and the event categories you choose to follow.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                Visitors
              </h3>
              <p>
                When you browse the site, we log the page path and referrer
                source as anonymous analytics data. We do not collect your IP
                address or set any analytics cookies. This data cannot be used
                to identify you personally.
              </p>
            </div>
          </div>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-xl font-bold tracking-[-0.02em] text-foreground mb-3">
            3. Lawful basis for processing
          </h2>
          <div className="space-y-3 text-muted">
            <p>
              <span className="text-foreground font-medium">Organisers:</span>{" "}
              We process your data to fulfil the contract when you submit and
              pay for an event listing.
            </p>
            <p>
              <span className="text-foreground font-medium">Subscribers:</span>{" "}
              We process your email address based on your explicit consent, given
              when you tick the consent checkbox and confirm your email address.
            </p>
            <p>
              <span className="text-foreground font-medium">Visitors:</span>{" "}
              Anonymous page analytics are processed under our legitimate
              interest in understanding how the site is used — no cookies are
              set and no personal data is collected.
            </p>
          </div>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-xl font-bold tracking-[-0.02em] text-foreground mb-3">
            4. How we use your data
          </h2>
          <ul className="list-disc list-outside pl-5 space-y-2 text-muted">
            <li>
              To publish your event listing on the site and in category digest
              emails
            </li>
            <li>
              To send you confirmation, approval, and status update emails about
              your submission
            </li>
            <li>
              To send subscribers their chosen weekly digest every Friday
            </li>
            <li>
              To maintain records for fraud prevention and chargeback evidence
              (organiser name, email, IP address at time of submission, and
              Stripe payment ID)
            </li>
            <li>
              To understand how the site is used and improve it over time
              (anonymous analytics only)
            </li>
          </ul>
          <p className="text-muted mt-4">
            We will never sell your data, share it with third parties for
            marketing purposes, or use it for any purpose not listed here.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-xl font-bold tracking-[-0.02em] text-foreground mb-3">
            5. Third-party processors
          </h2>
          <p className="text-muted mb-4">
            We share your data with the following processors only to the extent
            necessary to operate the platform:
          </p>
          <div className="space-y-3 text-muted">
            <div className="p-4 rounded-lg bg-background border border-border">
              <p className="font-medium text-foreground">Stripe</p>
              <p className="text-sm mt-0.5">
                Processes listing fee payments. Stripe stores billing details
                securely under their own privacy policy. Data held in EU/UK
                data centres.{" "}
                <a
                  href="https://stripe.com/gb/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Stripe Privacy Policy ↗
                </a>
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background border border-border">
              <p className="font-medium text-foreground">Resend</p>
              <p className="text-sm mt-0.5">
                Delivers transactional emails (submission confirmations) and
                weekly digest emails to subscribers. Your email address is
                shared with Resend solely for delivery.{" "}
                <a
                  href="https://resend.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Resend Privacy Policy ↗
                </a>
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background border border-border">
              <p className="font-medium text-foreground">Supabase</p>
              <p className="text-sm mt-0.5">
                Hosts our database and authentication system. All personal data
                is stored on Supabase&apos;s infrastructure.{" "}
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Supabase Privacy Policy ↗
                </a>
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background border border-border">
              <p className="font-medium text-foreground">Vercel</p>
              <p className="text-sm mt-0.5">
                Hosts the website. Vercel processes request logs as part of
                standard hosting infrastructure.{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Vercel Privacy Policy ↗
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* 6 */}
        <section>
          <h2 className="text-xl font-bold tracking-[-0.02em] text-foreground mb-3">
            6. How long we keep your data
          </h2>
          <div className="space-y-3 text-muted">
            <p>
              <span className="text-foreground font-medium">
                Payment records:
              </span>{" "}
              7 years, as required by HMRC for financial records.
            </p>
            <p>
              <span className="text-foreground font-medium">
                Event submission records:
              </span>{" "}
              2 years from the date of submission.
            </p>
            <p>
              <span className="text-foreground font-medium">
                Subscriber records:
              </span>{" "}
              Until you unsubscribe, plus 30 days.
            </p>
            <p>
              <span className="text-foreground font-medium">
                Anonymous visitor analytics:
              </span>{" "}
              Rolling 90-day window.
            </p>
          </div>
        </section>

        {/* 7 */}
        <section>
          <h2 className="text-xl font-bold tracking-[-0.02em] text-foreground mb-3">
            7. Your rights
          </h2>
          <p className="text-muted mb-4">
            Under UK GDPR, you have the right to:
          </p>
          <ul className="list-disc list-outside pl-5 space-y-2 text-muted">
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data (see Section 8)</li>
            <li>Restrict how we process your data</li>
            <li>
              Withdraw consent at any time (for subscribers — unsubscribing
              withdraws consent)
            </li>
            <li>Lodge a complaint with the ICO at ico.org.uk</li>
          </ul>
          <p className="text-muted mt-4">
            To exercise any of these rights, email{" "}
            <a
              href="mailto:hello@thisisharingey.co.uk"
              className="text-primary hover:underline"
            >
              hello@thisisharingey.co.uk
            </a>
            . We will respond within 30 days.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="text-xl font-bold tracking-[-0.02em] text-foreground mb-3">
            8. Requesting data deletion
          </h2>
          <div className="space-y-3 text-muted">
            <p>
              <span className="text-foreground font-medium">Organisers:</span>{" "}
              You can request deletion of your account and personal data by
              emailing us. Your event listings will be anonymised (the organiser
              name replaced with &ldquo;Anonymous&rdquo;) rather than deleted,
              so that the event record itself is preserved. Payment records are
              subject to the 7-year HMRC retention requirement and cannot be
              deleted before that period.
            </p>
            <p>
              <span className="text-foreground font-medium">Subscribers:</span>{" "}
              You can unsubscribe at any time using the link in any digest email,
              or via the{" "}
              <Link href="/manage-preferences" className="text-primary hover:underline">
                manage preferences
              </Link>{" "}
              page. To have your email address permanently erased from our
              records, email{" "}
              <a
                href="mailto:hello@thisisharingey.co.uk"
                className="text-primary hover:underline"
              >
                hello@thisisharingey.co.uk
              </a>
              .
            </p>
          </div>
        </section>

        {/* 9 */}
        <section>
          <h2 className="text-xl font-bold tracking-[-0.02em] text-foreground mb-3">
            9. Cookies
          </h2>
          <p className="text-muted">
            For information about cookies and how to manage them, please see our{" "}
            <Link href="/cookies" className="text-primary hover:underline">
              Cookie Policy
            </Link>
            .
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="text-xl font-bold tracking-[-0.02em] text-foreground mb-3">
            10. Changes to this policy
          </h2>
          <p className="text-muted">
            We may update this Privacy Policy from time to time. The date at the
            top of this page will always reflect the most recent version. For
            significant changes, we will notify organiser account holders by
            email.
          </p>
        </section>

        {/* 11 */}
        <section>
          <h2 className="text-xl font-bold tracking-[-0.02em] text-foreground mb-3">
            11. Contact
          </h2>
          <p className="text-muted">
            Questions about this policy or how we handle your data:{" "}
            <a
              href="mailto:hello@thisisharingey.co.uk"
              className="text-primary hover:underline"
            >
              hello@thisisharingey.co.uk
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
