"use client";

import Image from "next/image";
import Link from "next/link";
import { Event, CATEGORY_COLOURS, CATEGORY_TAG_COLOURS } from "@/lib/types";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00"); // treat as local date
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours, 10);
  const suffix = h >= 12 ? "pm" : "am";
  const displayHour = h % 12 || 12;
  return `${displayHour}${minutes !== "00" ? `:${minutes}` : ""}${suffix}`;
}

function isThisWeek(dateStr: string): boolean {
  const now = new Date();
  const event = new Date(dateStr + "T00:00:00");
  const diffMs = event.getTime() - now.setHours(0, 0, 0, 0);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays < 7;
}

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const categorySlug = event.category?.slug ?? "";
  const placeholderColour = CATEGORY_COLOURS[categorySlug] ?? "bg-primary-light";
  const isFree = event.ticket_price.toLowerCase().trim() === "free";
  const thisWeek = isThisWeek(event.event_date_start);

  const tagColours = CATEGORY_TAG_COLOURS[categorySlug];

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block bg-surface rounded-lg border border-border overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-150"
    >
      {/* Image / Placeholder */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        {event.image_thumb_url ? (
          <Image
            src={event.image_thumb_url}
            alt={event.event_name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div
            className={`w-full h-full ${placeholderColour} flex items-center justify-center`}
          >
            <span className="text-white/80 font-medium text-sm px-4 text-center">
              {event.category?.name ?? "Event"}
            </span>
          </div>
        )}

        {/* Status badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {event.borough_of_culture && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-boc text-white">
              <span className="hidden sm:inline">Borough of Culture 2027</span>
              <span className="sm:hidden">BoC 2027</span>
            </span>
          )}
          {thisWeek && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-badge-thisweek text-white">
              This week
            </span>
          )}
          {isFree && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-badge-free text-white">
              Free
            </span>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        {/* Category tag — DLS Label spec */}
        {event.category && tagColours && (
          <span
            className="inline-block text-[11px] font-semibold tracking-[0.10em] uppercase px-2.5 py-1 rounded-full mb-2"
            style={{ backgroundColor: tagColours.bg, color: tagColours.text }}
          >
            {event.category.name}
          </span>
        )}

        {/* H3 — DLS: 700, −0.02em, 1.2 line-height */}
        <h3 className="font-bold text-foreground leading-[1.2] tracking-[-0.02em] line-clamp-2 mb-2">
          {event.event_name}
        </h3>

        <div className="space-y-1 text-sm text-muted">
          <p>
            {formatDate(event.event_date_start)}
            {" · "}
            {formatTime(event.start_time)}
            {event.end_time && ` – ${formatTime(event.end_time)}`}
          </p>
          <p className="truncate">{event.venue_name}</p>
        </div>
      </div>
    </Link>
  );
}
