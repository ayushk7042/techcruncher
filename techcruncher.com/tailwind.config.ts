import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.25rem", lg: "1.5rem", xl: "2rem" },
      // Full width below lg. The design doc lists sm/md as "100%", which Tailwind
      // would emit as an invalid `@media (min-width: 100%)`, so they are omitted.
      screens: { lg: "1160px", xl: "1320px", "2xl": "1440px" },
    },
    extend: {
      colors: {
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        paper: "rgb(var(--paper) / <alpha-value>)",
        raise: "rgb(var(--raise) / <alpha-value>)",
        line: {
          DEFAULT: "rgb(var(--line) / <alpha-value>)",
          strong: "rgb(var(--line-strong) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          soft: "rgb(var(--ink-soft) / <alpha-value>)",
          mute: "rgb(var(--ink-mute) / <alpha-value>)",
          50: "#fafafa", 100: "#f4f4f5", 200: "#e4e4e7", 300: "#d4d4d8", 400: "#a1a1aa",
          500: "#71717a", 600: "#52525b", 700: "#3f3f46", 800: "#27272a", 900: "#18181b",
          950: "#09090b",
        },
        brand: {
          50: "#fff2ee", 100: "#ffe0d6", 200: "#ffbda8", 300: "#ff9271", 400: "#ff6740",
          500: "#ff3b14", 600: "#eb2600", 700: "#c01f00", 800: "#991a00", 900: "#7a1700",
          950: "#420b00",
        },
        accent: "rgb(var(--accent) / <alpha-value>)",
        flame: "rgb(var(--accent) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--paper) / <alpha-value>)",
          soft: "rgb(var(--canvas) / <alpha-value>)",
        },
      },
      fontFamily: {
        // next/font exposes each self-hosted family as a CSS variable.
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["var(--font-archivo)", "Archivo", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-archivo)", "Archivo", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: { "2xs": ["0.625rem", { lineHeight: "0.875rem" }] },
      letterSpacing: { eyebrow: "0.1em" },
      borderRadius: {
        none: "0px", sm: "0px", DEFAULT: "0px", md: "0px", lg: "0px",
        xl: "0px", "2xl": "0px", "3xl": "0px", full: "9999px",
      },
      boxShadow: {
        card: "none",
        "card-hover": "none",
        pop: "6px 6px 0 0 rgb(var(--ink) / 0.10)",
        glow: "none",
        flame: "none",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        marquee: {
          from: { transform: "translate3d(0, 0, 0)" },
          to: { transform: "translate3d(-50%, 0, 0)" },
        },
        progress: { from: { transform: "scaleX(0)" }, to: { transform: "scaleX(1)" } },
        "slow-zoom": { from: { transform: "scale(1)" }, to: { transform: "scale(1.05)" } },
      },
      animation: {
        "fade-up": "fade-up .3s ease-out both",
        shimmer: "shimmer 1.4s infinite",
        marquee: "marquee 46s linear infinite",
        "marquee-slow": "marquee 64s linear infinite",
        progress: "progress 7s linear forwards",
        "slow-zoom": "slow-zoom 7s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
