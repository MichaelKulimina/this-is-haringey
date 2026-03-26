export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Event {
  id: string;
  submission_id: string | null;
  event_name: string;
  short_description: string;
  full_description: string | null;
  image_url: string | null;
  image_thumb_url: string | null;
  category_id: string;
  category?: Category;
  event_date_start: string;
  event_date_end: string | null;
  start_time: string;
  end_time: string | null;
  venue_name: string;
  venue_address: string;
  neighbourhood: string | null;
  ticket_price: string;
  ticket_url: string | null;
  organiser_name: string;
  accessibility_info: string | null;
  borough_of_culture: boolean;
  status: "published" | "withdrawn";
  published_at: string;
  created_at: string;
  updated_at: string;
}

// Category slugs → accent colour mapping for placeholder tiles
export const CATEGORY_COLOURS: Record<string, string> = {
  "arts-culture": "bg-cat-arts",
  music: "bg-cat-music",
  community: "bg-cat-community",
  "food-drink": "bg-cat-food",
  "learning-talks": "bg-cat-learning",
};

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "arts-culture":
    "Exhibitions, theatre, dance, film screenings, and public art installations across Haringey.",
  music:
    "Live gigs, festivals, open mic nights, community choirs, and DJ events.",
  community:
    "Markets, fairs, street parties, faith and cultural celebrations, and volunteering events.",
  "food-drink":
    "Pop-ups, food markets, supper clubs, tastings, and food festivals.",
  "learning-talks":
    "Workshops, panel discussions, heritage walks, children's activities, and lectures.",
};

// Static Haringey neighbourhoods for area filter
export const HARINGEY_AREAS = [
  "Tottenham",
  "Wood Green",
  "Crouch End",
  "Hornsey",
  "Muswell Hill",
  "Stroud Green",
  "Bruce Grove",
  "Seven Sisters",
];
