import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "This Is Haringey — Events in the London Borough of Haringey";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Load Inter from Google Fonts at request time.
// We request TTF via a legacy user-agent so the response is parseable by
// the OG image runtime (which doesn't support WOFF2).
async function loadFont(weight: 600 | 700 | 800): Promise<ArrayBuffer> {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}`,
    {
      headers: {
        // Request a format the OG runtime can handle
        "User-Agent":
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      },
    }
  ).then((r) => r.text());

  // Extract the first font URL from the CSS (Latin subset)
  const match = css.match(/src:\s*url\(([^)]+)\)/);
  if (!match) throw new Error("Could not parse font URL from Google Fonts CSS");

  return fetch(match[1]).then((r) => r.arrayBuffer());
}

export default async function Image() {
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
        {/* Terracotta accent bar — top left */}
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

        {/* Logo — top section */}
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
              fontSize: "56px",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "#1A1A1A",
              lineHeight: 1.05,
            }}
          >
            Haringey
            <span style={{ color: "#E05A2B" }}>.</span>
          </span>
        </div>

        {/* Main message — centre */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <p
            style={{
              fontSize: "44px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#1A1A1A",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Discover what&apos;s on in Haringey.
          </p>
          <p
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#555555",
              letterSpacing: "0",
              margin: 0,
            }}
          >
            Arts · Music · Community · Food &amp; Drink · Learning
          </p>
        </div>

        {/* Footer — site URL + BoC */}
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
