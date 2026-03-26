import { Event } from "@/lib/types";
import EventCard from "./EventCard";

interface EventGridProps {
  events: Event[];
}

export default function EventGrid({ events }: EventGridProps) {
  if (events.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="text-5xl mb-4">🎭</div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No events found
        </h3>
        <p className="text-muted max-w-sm mx-auto">
          Check back soon — more are being added every week. Or try adjusting
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
