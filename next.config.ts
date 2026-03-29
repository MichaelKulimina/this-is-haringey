import type { NextConfig } from "next";

// Content Security Policy — Phase 7 (Section 12.5)
// 'unsafe-inline' in script-src is required by Next.js App Router for inline
// hydration scripts. A nonce-based approach would be stricter but requires
// middleware complexity out of scope here.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://ykrgaigbnlqzvhquybdy.supabase.co",
  "connect-src 'self' https://ykrgaigbnlqzvhquybdy.supabase.co wss://ykrgaigbnlqzvhquybdy.supabase.co https://api.stripe.com",
  "frame-src https://js.stripe.com https://hooks.stripe.com https://www.openstreetmap.org",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ykrgaigbnlqzvhquybdy.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // sharp uses native binaries — must not be bundled by webpack
  serverExternalPackages: ["sharp"],

  // Security headers — applied to all routes (Section 12.5)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevents this site being embedded in iframes elsewhere (clickjacking)
          { key: "X-Frame-Options", value: "DENY" },
          // Prevents browsers guessing content types from response bodies
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Sends full URL as referrer only to same origin; origin-only cross-origin
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Restricts access to sensitive browser APIs
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Content Security Policy — restricts which resources can load
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
