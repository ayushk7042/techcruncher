import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The old Vite dev server was reached through these hostnames.
  allowedDevOrigins: ["techcruncher.com", "www.techcruncher.com"],
  async redirects() {
    return [
      // The design language names the article route /article/:slug; /news/:slug
      // is canonical because that is what the previous site already published.
      { source: "/article/:slug", destination: "/news/:slug", permanent: true },
      { source: "/admin", destination: "/admin/dashboard", permanent: false },
    ];
  },
};

export default nextConfig;
