import { Event } from "@/lib/types";
import EventCard from "./EventCard";

interface EventGridProps {
  events: Event[];
}

export default function EventGrid({ events }: EventGridProps) {
  if (events.length === 0) {
    return (
      <div className="py-20 text-center">
        {/* Calendar icon — Lucide style, 1.5px stroke */}
        <svg
          className="mx-auto mb-4 text-muted"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="9" y1="16" x2="9.01" y2="16" />
          <line x1="15" y1="16" x2="15.01" y2="16" />
        </svg>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Nothing here yet
        </h3>
        <p className="text-muted max-w-sm mx-auto">
          Check back soon — more events are added every week. Try adjusting
          your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
