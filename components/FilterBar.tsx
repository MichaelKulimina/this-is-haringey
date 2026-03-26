"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Category, HARINGEY_AREAS } from "@/lib/types";

const DATE_OPTIONS = [
  { value: "", label: "All dates" },
  { value: "this-week", label: "This week" },
  { value: "this-month", label: "This month" },
  { value: "next-3-months", label: "Next 3 months" },
];

interface FilterBarProps {
  categories: Category[];
  lockedCategoryId?: string; // set on category pages — tab is pre-selected and non-interactive
}

export default function FilterBar({ categories, lockedCategoryId }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") ?? "";
  const currentDate = searchParams.get("date") ?? "";
  const currentArea = searchParams.get("area") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="bg-surface border-b border-border sticky top-16 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Category pills */}
          {!lockedCategoryId && (
            <div className="flex flex-wrap gap-2 flex-1">
              <button
                onClick={() => updateParam("category", "")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !currentCategory
                    ? "bg-primary text-white"
                    : "bg-background text-muted hover:bg-primary-light hover:text-primary"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateParam("category", cat.slug)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    currentCategory === cat.slug
                      ? "bg-primary text-white"
                      : "bg-background text-muted hover:bg-primary-light hover:text-primary"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Date + Area dropdowns */}
          <div className="flex gap-2 flex-shrink-0">
            <select
              value={currentDate}
              onChange={(e) => updateParam("date", e.target.value)}
              className="text-sm border border-border rounded-full px-3 py-1.5 bg-background text-muted hover:border-primary focus:outline-none focus:border-primary transition-colors"
            >
              {DATE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={currentArea}
              onChange={(e) => updateParam("area", e.target.value)}
              className="text-sm border border-border rounded-full px-3 py-1.5 bg-background text-muted hover:border-primary focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">All areas</option>
              {HARINGEY_AREAS.map((area) => (
                <option key={area} value={area.toLowerCase()}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
