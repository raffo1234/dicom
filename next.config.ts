import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://img.freepik.com/free-vector/**"),
      new URL(
        "https://bzhqohtiptcvesotbvgh.supabase.co/storage/v1/object/public/**"
      ),
      new URL("https://lh3.googleusercontent.com/**"),
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "200mb",
    },
  },
};

export default nextConfig;
