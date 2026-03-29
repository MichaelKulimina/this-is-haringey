import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import FilterBar from "@/components/FilterBar";
import EventGrid from "@/components/EventGrid";
import SubscriptionWidget from "@/components/SubscriptionWidget";
import { getPublishedEvents, getCategories } from "@/lib/events";
import { CATEGORY_DESCRIPTIONS } from "@/lib/types";

// Only match the 5 known category slugs — everything else returns 404
const VALID_SLUGS = [
  "arts-culture",
  "music",
  "community",
  "food-drink",
  "learning-talks",
];

export function generateStaticParams() {
  return VALID_SLUGS.map((slug) => ({ category: slug }));
}

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ date?: string; area?: string; q?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === category);
  if (!cat) return { title: "Not found" };
  return {
    title: `${cat.name} Events in Haringey`,
    description: CATEGORY_DESCRIPTIONS[category] ?? `Discover ${cat.name} events in Haringey.`,
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category: slug } = await params;
  const filters = await searchParams;

  // Guard: return 404 for any slug not in the known list
  if (!VALID_SLUGS.includes(slug)) notFound();

  const [categories, ] = await Promise.all([getCategories()]);
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();

  const events = await getPublishedEvents({
    categoryId: cat.id,
    date: filters.date,
    area: filters.area,
    q: filters.q,
  });

  const description = CATEGORY_DESCRIPTIONS[slug] ?? "";

  return (
    <>
      {/* Category header strip — Ink background (DLS approved) */}
      <div className="bg-ink py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-[-0.04em] leading-[1.05] mb-2">
            {cat.name}
          </h1>
          <p className="text-white/70 text-sm max-w-xl">{description}</p>
        </div>
      </div>

      {/* Filters (date + area only — category tab locked) */}
      <Suspense>
        <FilterBar categories={categories} lockedCategoryId={cat.id} />
      </Suspense>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <p className="text-sm text-muted">
            {events.length > 0
              ? `${events.length} upcoming event${events.length === 1 ? "" : "s"}`
              : "No upcoming events"}
          </p>
        </div>

        <EventGrid events={events} />

        <div className="mt-16">
          <SubscriptionWidget
            categories={categories}
            defaultCategoryId={cat.id}
          />
        </div>
      </div>
    </>
  );
}
