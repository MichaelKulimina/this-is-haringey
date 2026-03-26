import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import MapEmbed from "@/components/MapEmbed";
import SubscriptionWidget from "@/components/SubscriptionWidget";
import { getEventById, getCategories } from "@/lib/events";
import { CATEGORY_COLOURS } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return { title: "Event not found" };

  return {
    title: event.event_name,
    description: event.short_description,
    openGraph: event.image_url
      ? { images: [{ url: event.image_url }] }
      : undefined,
  };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours, 10);
  const suffix = h >= 12 ? "pm" : "am";
  const displayHour = h % 12 || 12;
  return `${displayHour}${minutes !== "00" ? `:${minutes}` : ""}${suffix}`;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [event, categories] = await Promise.all([
    getEventById(id),
    getCategories(),
  ]);

  if (!event) notFound();

  const categorySlug = event.category?.slug ?? "";
  const placeholderColour = CATEGORY_COLOURS[categorySlug] ?? "bg-primary-light";

  return (
    <div>
      {/* Borough of Culture banner */}
      {event.borough_of_culture && (
        <div className="bg-boc text-white text-center py-2.5 px-4 text-sm font-medium">
          This is an official Borough of Culture 2027 event
        </div>
      )}

      {/* Hero image */}
      <div className="w-full">
        <div className="relative w-full aspect-video max-w-[900px] mx-auto overflow-hidden">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.event_name}
              fill
              sizes="(max-width: 900px) 100vw, 900px"
              className="object-cover"
              priority
            />
          ) : (
            <div
              className={`w-full h-full ${placeholderColour} flex items-center justify-center`}
            >
              <span className="text-white/80 font-medium text-lg">
                {event.category?.name ?? "Event"}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-foreground transition-colors">
            What&apos;s On
          </Link>
          {event.category && (
            <>
              <span>·</span>
              <Link
                href={`/${event.category.slug}`}
                className="hover:text-foreground transition-colors"
              >
                {event.category.name}
              </Link>
            </>
          )}
        </nav>

        {/* Event header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-3">
            {event.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary">
                {event.category.name}
              </span>
            )}
            {event.borough_of_culture && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-boc-light text-boc">
                BoC 2027
              </span>
            )}
            {event.ticket_price.toLowerCase().trim() === "free" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Free
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground leading-tight mb-4">
            {event.event_name}
          </h1>

          <div className="flex flex-wrap gap-4 text-sm text-muted">
            <span>
              📅 {formatDate(event.event_date_start)}
              {event.event_date_end &&
                event.event_date_end !== event.event_date_start &&
                ` – ${formatDate(event.event_date_end)}`}
            </span>
            <span>
              🕐 {formatTime(event.start_time)}
              {event.end_time && ` – ${formatTime(event.end_time)}`}
            </span>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: description */}
          <div className="lg:col-span-2 space-y-6">
            <p className="text-muted leading-relaxed">{event.short_description}</p>

            {event.full_description && (
              <div
                className="prose prose-sm max-w-none text-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: event.full_description }}
              />
            )}

            {event.accessibility_info && (
              <div className="p-4 bg-background rounded-lg border border-border">
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  ♿ Accessibility
                </h3>
                <p className="text-sm text-muted">{event.accessibility_info}</p>
              </div>
            )}
          </div>

          {/* Right: venue + booking */}
          <div className="space-y-5">
            {/* Venue card */}
            <div className="p-4 bg-surface border border-border rounded-lg space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">📍 Venue</h3>
                <p className="text-sm text-foreground mt-1">{event.venue_name}</p>
                <p className="text-sm text-muted">{event.venue_address}</p>
                {event.neighbourhood && (
                  <p className="text-xs text-muted mt-0.5">{event.neighbourhood}</p>
                )}
              </div>
              <MapEmbed address={event.venue_address} />
            </div>

            {/* Ticket/price */}
            <div className="p-4 bg-surface border border-border rounded-lg">
              <h3 className="text-sm font-semibold text-foreground mb-2">🎟 Tickets</h3>
              <p className="text-sm text-foreground mb-3">{event.ticket_price}</p>
              {event.ticket_url && (
                <a
                  href={event.ticket_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center px-4 py-2.5 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-dark transition-colors"
                >
                  Book tickets ↗
                </a>
              )}
            </div>

            {/* Organiser */}
            <div className="p-4 bg-surface border border-border rounded-lg">
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Organised by
              </h3>
              <p className="text-sm text-muted">{event.organiser_name}</p>
            </div>
          </div>
        </div>

        {/* Subscription widget */}
        <div className="mt-16 max-w-2xl">
          <Suspense>
            <SubscriptionWidget
              categories={categories}
              defaultCategoryId={event.category_id}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
