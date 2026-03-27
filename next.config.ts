import type { NextConfig } from "next";

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
};

export default nextConfig;
