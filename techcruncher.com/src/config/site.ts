/**
 * Everything brand-specific lives here so the site can be renamed or re-pointed
 * without touching components.
 */
export const site = {
  name: "TechCruncher",
  tagline: "What comes next",
  title: "TechCruncher — Reporting on what comes next",
  description:
    "Independent reporting, reviews and analysis on the technology, business and culture shaping what comes next.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:5199").replace(/\/+$/, ""),
  desk: "TechCruncher Desk",
  newsletterReaders: "25,000",
  socials: [
    { label: "Facebook", href: "https://facebook.com/techcruncher", icon: "facebook" },
    { label: "X", href: "https://x.com/techcruncher", icon: "x" },
    { label: "Instagram", href: "https://instagram.com/techcruncher", icon: "instagram" },
    { label: "YouTube", href: "https://youtube.com/@techcruncher", icon: "youtube" },
    { label: "LinkedIn", href: "https://linkedin.com/company/techcruncher", icon: "linkedin" },
  ],
  desks: [
    { label: "General enquiries", email: "hello@techcruncher.com", note: "Questions, feedback and corrections." },
    { label: "Story tips", email: "tips@techcruncher.com", note: "Something we should look into? Tell us." },
    { label: "Advertising", email: "partners@techcruncher.com", note: "Sponsorships and booked placements." },
  ],
} as const;

export type SocialIcon = (typeof site.socials)[number]["icon"];

/** Primary section navigation in the masthead, drawer and footer. */
export const sections = [
  { label: "Latest", href: "/latest" },
  { label: "Trending", href: "/trending" },
  { label: "Most read", href: "/popular" },
  { label: "Video", href: "/videos" },
  { label: "Photography", href: "/gallery" },
] as const;

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7000/api").replace(
  /\/+$/,
  "",
);

export const AD_PLACEHOLDER = process.env.NEXT_PUBLIC_AD_PLACEHOLDER === "true";

/**
 * Lives here rather than in the theme hook: the root layout inlines it into the
 * pre-paint script, and a value imported from a "use client" module is only a
 * client reference on the server.
 */
export const THEME_STORAGE_KEY = "tc-theme";
