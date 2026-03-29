import { ImageResponse } from "next/og";
import { CATEGORY_DESCRIPTIONS } from "@/lib/types";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Category-specific accent colours for the OG image background tint
const CATEGORY_ACCENTS: Record<string, { bg: string; text: string }> = {
  "arts-culture":   { bg: "#F0EDE6", text: "#555555" },
  "music":          { bg: "#F0EDE6", text: "#555555" },
  "community":      { bg: "#EEF3EF", text: "#3D5240" },
  "food-drink":     { bg: "#FDF5F1", text: "#B84520" },
  "learning-talks": { bg: "#F0EDE6", text: "#555555" },
};

const CATEGORY_NAMES: Record<string, string> = {
  "arts-culture":   "Arts & Culture",
  "music":          "Music",
  "community":      "Community",
  "food-drink":     "Food & Drink",
  "learning-talks": "Learning & Talks",
};

async function loadFont(weight: 600 | 700 | 800): Promise<ArrayBuffer> {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      },
    }
  ).then((r) => r.text());

  const match = css.match(/src:\s*url\(([^)]+)\)/);
  if (!match) throw new Error("Could not parse font URL from Google Fonts CSS");

  return fetch(match[1]).then((r) => r.arrayBuffer());
}

interface Props {
  params: Promise<{ category: string }>;
}

export default async function Image({ params }: Props) {
  const { category: slug } = await params;

  const categoryName = CATEGORY_NAMES[slug] ?? slug;
  const description =
    CATEGORY_DESCRIPTIONS[slug] ??
    `Discover ${categoryName} events happening across Haringey.`;
  const accent = CATEGORY_ACCENTS[slug] ?? { bg: "#F0EDE6", text: "#555555" };

  const [semiBoldData, boldData, extraBoldData] = await Promise.all([
    loadFont(600),
    loadFont(700),
    loadFont(800),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#F7F5F0",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 72px",
          fontFamily: "Inter",
          position: "relative",
        }}
      >
        {/* Terracotta accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "6px",
            height: "100%",
            backgroundColor: "#E05A2B",
          }}
        />

        {/* Logo — top */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <span
            style={{
              fontSize: "18px",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#E05A2B",
              lineHeight: 1,
            }}
          >
            This Is
          </span>
          <span
            style={{
              fontSize: "40px",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "#1A1A1A",
              lineHeight: 1.05,
            }}
          >
            Haringey<span style={{ color: "#E05A2B" }}>.</span>
          </span>
        </div>

        {/* Category + headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Category pill */}
          <div
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              backgroundColor: accent.bg,
              color: accent.text,
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              padding: "6px 14px",
              borderRadius: "9999px",
            }}
          >
            {categoryName}
          </div>

          <p
            style={{
              fontSize: "48px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#1A1A1A",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {categoryName} events in Haringey.
          </p>

          <p
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: "#555555",
              margin: 0,
              lineHeight: 1.4,
              maxWidth: "800px",
            }}
          >
            {description}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <span
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#E05A2B",
              letterSpacing: "-0.01em",
            }}
          >
            thisisharingey.co.uk
          </span>
          <span
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#5B21B6",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Borough of Culture 2027
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: semiBoldData, style: "normal", weight: 600 },
        { name: "Inter", data: boldData, style: "normal", weight: 700 },
        { name: "Inter", data: extraBoldData, style: "normal", weight: 800 },
      ],
    }
  );
}
