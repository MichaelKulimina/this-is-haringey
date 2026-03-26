import { createClient } from "@/lib/supabase/server";
import { Event, Category } from "@/lib/types";

interface EventFilters {
  category?: string;   // category slug
  date?: string;       // "this-week" | "this-month" | "next-3-months"
  area?: string;       // neighbourhood (lowercase)
  q?: string;          // text search
  categoryId?: string; // explicit category UUID (for category pages)
}

function getDateRange(filter: string): { gte: string; lte: string } | null {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  if (filter === "this-week") {
    const end = new Date(now);
    end.setDate(end.getDate() + 7);
    return { gte: today, lte: end.toISOString().split("T")[0] };
  }
  if (filter === "this-month") {
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { gte: today, lte: end.toISOString().split("T")[0] };
  }
  if (filter === "next-3-months") {
    const end = new Date(now);
    end.setMonth(end.getMonth() + 3);
    return { gte: today, lte: end.toISOString().split("T")[0] };
  }
  return null;
}

export async function getPublishedEvents(filters: EventFilters = {}): Promise<Event[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  let query = supabase
    .from("events")
    .select("*, category:categories(id, name, slug)")
    .eq("status", "published")
    .gte("event_date_start", today)
    .order("event_date_start", { ascending: true });

  // Category filter — by slug (home page) or direct ID (category page)
  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  } else if (filters.category) {
    // Resolve slug to ID via join — filter on the joined category slug
    query = query.eq("category.slug", filters.category);
  }

  // Date range filter
  if (filters.date) {
    const range = getDateRange(filters.date);
    if (range) {
      query = query.gte("event_date_start", range.gte).lte("event_date_start", range.lte);
    }
  }

  // Area filter (neighbourhood, case-insensitive)
  if (filters.area) {
    query = query.ilike("neighbourhood", filters.area);
  }

  // Text search across event name and short description
  if (filters.q) {
    query = query.or(
      `event_name.ilike.%${filters.q}%,short_description.ilike.%${filters.q}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching events:", error.message);
    return [];
  }

  return (data ?? []) as Event[];
}

export async function getEventById(id: string): Promise<Event | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*, category:categories(id, name, slug)")
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (error || !data) return null;
  return data as Event;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  return (data ?? []) as Category[];
}
