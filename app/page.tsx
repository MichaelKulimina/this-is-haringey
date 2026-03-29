import type { Metadata } from "next";
import { Suspense } from "react";
import HeroSection from "@/components/HeroSection";
import FilterBar from "@/components/FilterBar";
import EventGrid from "@/components/EventGrid";
import SubscriptionWidget from "@/components/SubscriptionWidget";
import { getPublishedEvents, getCategories } from "@/lib/events";

export const metadata: Metadata = {
  title: "What's On in Haringey",
  description:
    "Discover upcoming events in Haringey — arts, music, community, food, and learning. Your guide to what's happening in the borough.",
  twitter: {
    card: "summary_large_image",
  },
};

interface HomePageProps {
  searchParams: Promise<{
    category?: string;
    date?: string;
    area?: string;
    q?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const [events, categories] = await Promise.all([
    getPublishedEvents({
      category: params.category,
      date: params.date,
      area: params.area,
      q: params.q,
    }),
    getCategories(),
  ]);

  return (
    <>
      <Suspense>
        <HeroSection />
      </Suspense>

      <Suspense>
        <FilterBar categories={categories} />
      </Suspense>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-foreground">
            {events.length > 0
              ? `${events.length} upcoming event${events.length === 1 ? "" : "s"}`
              : "Upcoming events"}
          </h2>
        </div>

        <EventGrid events={events} />

        <div className="mt-16">
          <SubscriptionWidget categories={categories} />
        </div>
      </div>
    </>
  );
}
