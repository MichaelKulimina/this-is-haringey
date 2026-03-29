import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "This Is Haringey is a community events directory for the London Borough of Haringey, supporting Borough of Culture 2027.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

      {/* Hero */}
      <div className="mb-12">
        <p className="text-xs font-semibold tracking-[0.10em] uppercase text-primary mb-4">
          About us
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.04em] text-foreground leading-[1.05] mb-5">
          A single place for everything happening in Haringey.
        </h1>
        <p className="text-lg text-muted leading-relaxed max-w-2xl">
          From N4 to N22 — arts in Crouch End, music in Tottenham, community
          events in Wood Green, food markets in Muswell Hill. This Is Haringey
          brings it all together.
        </p>
      </div>

      {/* What we are */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-[-0.03em] text-foreground mb-4">
          What we are
        </h2>
        <div className="space-y-4 text-muted leading-relaxed">
          <p>
            This Is Haringey is a free-to-browse events directory for the London
            Borough of Haringey. We list events from community organisations,
            independent venues, artists, local businesses, and public bodies
            across the borough — arts, music, food, learning, outdoor events,
            and more.
          </p>
          <p>
            Every listing is reviewed by our team before it goes live. We keep
            things local, relevant, and genuinely useful — no national chains,
            no out-of-borough noise.
          </p>
        </div>
      </section>

      {/* Why we built it */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-[-0.03em] text-foreground mb-4">
          Why we built it
        </h2>
        <div className="space-y-4 text-muted leading-relaxed">
          <p>
            Haringey has an extraordinary amount going on. But for years, events
            were scattered across dozens of Facebook groups, Instagram pages,
            noticeboards, and neighbourhood newsletters — all competing for
            attention with no central home.
          </p>
          <p>
            Community organisations and independent venues doing brilliant work
            were struggling to reach the people who&rsquo;d love what they do.
            Haringey residents were missing out on things happening around the
            corner.
          </p>
          <p>
            This Is Haringey is our answer to that. One trusted destination,
            searchable by area and category, with a free weekly digest for
            people who want to stay connected.
          </p>
        </div>
      </section>

      {/* Borough of Culture */}
      <section className="mb-12">
        <div className="bg-boc-light rounded-xl p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-[0.10em] uppercase text-boc mb-3">
            Borough of Culture 2027
          </p>
          <h2 className="text-xl font-bold tracking-[-0.03em] text-foreground mb-3">
            Haringey. London&rsquo;s Borough of Culture 2027.
          </h2>
          <p className="text-muted leading-relaxed">
            In 2027, Haringey becomes London&rsquo;s Borough of Culture — a
            year-long celebration of the arts, creativity, and community across
            the borough. This Is Haringey is proud to support that programme,
            giving official Borough of Culture events extra visibility and
            helping connect residents with what&rsquo;s happening on their
            doorstep.
          </p>
          <p className="text-muted leading-relaxed mt-3">
            Look out for the{" "}
            <span className="inline-flex items-center text-[11px] font-semibold tracking-[0.10em] uppercase px-2 py-0.5 rounded-full bg-boc-light text-boc border border-boc/20">
              BoC 2027
            </span>{" "}
            badge on event listings.
          </p>
        </div>
      </section>

      {/* List your event */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-[-0.03em] text-foreground mb-4">
          List your event
        </h2>
        <div className="space-y-4 text-muted leading-relaxed">
          <p>
            Listings are open to any event taking place in the London Borough of
            Haringey. There&rsquo;s a one-off fee of £10 per listing — this
            helps us keep the platform running and the quality high. Events are
            reviewed and typically go live within 3 business days.
          </p>
          <p>
            Free listings are available for registered charities, CICs, and
            Haringey Council partners.{" "}
            <a
              href="mailto:hello@thisisharingey.co.uk"
              className="text-primary hover:underline"
            >
              Get in touch
            </a>{" "}
            to find out more.
          </p>
        </div>
        <div className="mt-6">
          <Link
            href="/submit"
            className="inline-flex items-center px-5 py-3 rounded-md bg-primary text-white text-sm font-semibold tracking-[-0.01em] hover:bg-primary-dark transition-colors"
          >
            Submit an event →
          </Link>
        </div>
      </section>

      {/* Get in touch */}
      <section>
        <h2 className="text-2xl font-bold tracking-[-0.03em] text-foreground mb-4">
          Get in touch
        </h2>
        <p className="text-muted leading-relaxed">
          Questions, partnerships, or anything else — we&rsquo;d love to hear
          from you.
        </p>
        <p className="mt-3">
          <a
            href="mailto:hello@thisisharingey.co.uk"
            className="text-primary font-medium hover:underline"
          >
            hello@thisisharingey.co.uk
          </a>
        </p>
      </section>
    </div>
  );
}
