# TheTrendSnap — "Premium Editorial / Tech Wire" Design Language

A complete, implementation-level specification of the redesigned public frontend
(`thetrendsnap.com`). Hand this file to an engineer or an AI and it should be possible to rebuild
the site so it looks and behaves exactly like the original: every token, every class string, every
button, every page layout.

Stack assumed: **React 18 + TypeScript + Vite + Tailwind CSS 3.4 + react-router-dom 6 +
@tanstack/react-query 5 + lucide-react (icons) + DOMPurify**. All styling is Tailwind utility
classes plus a small set of component classes defined in `src/index.css`. Class strings in this
document are exact — copy them verbatim.

---

## 0. The idea in one paragraph

A **technology wire**, not a lifestyle magazine: dense, mechanical, high contrast. Cold zinc
neutrals, **one** signal accent (orange-red `#ff3b14`), **hard 0px corners everywhere**, and
**rules instead of boxes** — a 2px ink rule opens a section, a 1px ink rule opens a card, a 1px
light line divides rows. Nothing floats on a soft shadow. Headlines are a **semi-condensed heavy
grotesque (Archivo at 88% width)**, UI micro-type is **uppercase tracked monospace (JetBrains
Mono)**, body/UI text is **Inter**. Colour is almost absent: the accent is reserved for live state,
hover, active indicators, rank numerals and links, so when it appears it means something.

### Core rules (never break these)

1. **Border radius is 0** on everything. The Tailwind scale is overridden so `rounded-sm`,
   `rounded-lg`, `rounded-2xl` etc. all resolve to `0px`. Only `rounded-full` stays round, and it
   is used only for avatars, the bookmark-count dot and the circular video play buttons.
2. **No soft shadows.** `shadow-card`, `shadow-card-hover`, `shadow-glow`, `shadow-flame` are
   `none`. The only shadow is `shadow-pop` = `6px 6px 0 0 rgb(var(--ink) / 0.10)` — a hard offset
   shadow for dropdowns and menus.
3. **Structure is drawn with rules**: `rule-strong` (2px ink top border) opens sections and
   sidebar modules; `rule-card` (1px ink top border) opens each card's text block; `divide-line`
   separates list rows; `border-b-2 border-ink` closes page headers and the sticky masthead.
4. **One accent colour** (`accent`). Category labels are monochrome (`text-ink-soft`), never
   colour-coded.
5. **Micro-type is always mono, uppercase, 10–11px, tracked 0.1em** (`eyebrow`, `meta`,
   `link-muted`, `chip`, `btn`).
6. **Headlines are always `.headline`** (Archivo, bold, 1.06 line-height, −0.02em tracking,
   `font-stretch: 88%`). Big standing titles are additionally `uppercase`.
7. **Separators are a slash** `/` in `text-line-strong`, never bullets or pipes (the only
   exception is the search typeahead which uses `•`).
8. Numbers use `tabular-nums`; ranks and indices are zero-padded to two digits (`01`, `02` …).

---

## 1. Setup

### 1.1 `index.html`

```html
<!doctype html>
<html lang="en" class="scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/favicon.svg" />
    <meta name="theme-color" content="#f5f5f6" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#09090b" media="(prefers-color-scheme: dark)" />
    <title>TheTrendSnap — Reporting on what comes next</title>
    <meta
      name="description"
      content="Independent reporting, reviews and analysis on the technology, business and culture shaping what comes next."
    />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
      rel="stylesheet"
    />
    <script>
      // Applied before paint so the first frame is never the wrong theme.
      (function () {
        try {
          // ?theme=dark|light lets us share (and screenshot) either palette.
          var forced = new URLSearchParams(location.search).get("theme");
          if (forced === "dark" || forced === "light") {
            localStorage.setItem("tts-theme", forced);
          }
          var stored = localStorage.getItem("tts-theme");
          var dark =
            stored === "dark" ||
            (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
          if (dark) document.documentElement.classList.add("dark");
        } catch (e) {}
      })();
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Important: Archivo must be loaded with the **`wdth` axis (62..125)** — the condensed look depends on
`font-stretch` working.

Theme: class-based (`darkMode: "class"`), key `tts-theme` in `localStorage`, values
`"dark" | "light"`. The theme hook toggles the `dark` class on `<html>` and writes the key.

### 1.2 `tailwind.config.js` (verbatim)

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.25rem", lg: "1.5rem", xl: "2rem" },
      screens: { sm: "100%", md: "100%", lg: "1160px", xl: "1320px", "2xl": "1440px" },
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
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["Archivo", "Inter", "system-ui", "sans-serif"],
        serif: ["Archivo", "Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
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
```

### 1.3 `src/index.css` — public site part (verbatim)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --canvas: 245 245 246;   /* page ground */
    --paper: 255 255 255;    /* panels, sheets, menus */
    --raise: 238 238 241;    /* inset fills: wells, thumbs, skeletons */
    --line: 219 219 224;
    --line-strong: 186 186 194;
    --ink: 10 10 12;         /* primary text and every structural rule */
    --ink-soft: 82 82 91;
    --ink-mute: 128 128 138;
    --accent: 255 59 20;     /* signal */
    --surface: var(--paper);
    --surface-soft: var(--canvas);
    --text: var(--ink);
    --muted: var(--ink-soft);
  }

  .dark {
    --canvas: 9 9 11;
    --paper: 19 19 22;
    --raise: 30 30 35;
    --line: 41 41 47;
    --line-strong: 66 66 75;
    --ink: 250 250 252;
    --ink-soft: 161 161 172;
    --ink-mute: 115 115 126;
    --accent: 255 92 54;
    --surface: var(--paper);
    --surface-soft: var(--canvas);
    --text: var(--ink);
    --muted: var(--ink-soft);
  }

  html { -webkit-text-size-adjust: 100%; }

  body {
    @apply bg-canvas text-ink antialiased;
    font-feature-settings: "cv11", "ss01", "tnum";
  }

  h1, h2, h3, h4 { text-wrap: balance; }
  p { text-wrap: pretty; }

  :focus-visible {
    @apply outline-none ring-2 ring-accent ring-offset-2;
    --tw-ring-offset-color: rgb(var(--canvas));
  }

  ::selection {
    background: rgb(var(--accent));
    color: #fff;
  }
}

@layer components {
  /* ---- Structure ---- */
  .glass-masthead { @apply border-b-2 border-ink bg-canvas/90 backdrop-blur-xl; }
  .rule-strong    { @apply border-t-2 border-ink; }   /* opens a section */
  .rule-card      { @apply border-t border-ink; }     /* opens a card / module */

  /* ---- Type roles ---- */
  .headline {
    @apply font-display font-bold leading-[1.06] tracking-[-0.02em] text-ink;
    font-stretch: 88%;
  }
  .eyebrow {
    @apply font-mono text-[10px] font-medium uppercase leading-none tracking-eyebrow text-ink-mute;
  }
  .eyebrow-accent { @apply eyebrow text-accent; }
  .meta { @apply font-mono text-[11px] leading-none text-ink-mute; }
  .link-muted {
    @apply font-mono text-[11px] font-medium uppercase tracking-eyebrow text-ink-soft transition-colors hover:text-accent;
  }
  .chip {
    @apply inline-flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase leading-none tracking-eyebrow;
  }
  .chip-live {
    @apply inline-flex items-center gap-1.5 bg-accent px-1.5 py-1 font-mono text-[10px] font-bold uppercase leading-none tracking-eyebrow text-white;
  }

  /* ---- Controls ---- */
  .btn {
    @apply inline-flex items-center justify-center gap-2 font-mono text-[11px] font-medium uppercase tracking-eyebrow transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50;
  }
  .btn-primary { @apply btn bg-ink text-canvas hover:bg-accent; }
  .btn-outline { @apply btn border border-ink text-ink hover:bg-ink hover:text-canvas; }
  .filter-pill {
    @apply whitespace-nowrap border border-line px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-eyebrow text-ink-soft transition-colors hover:border-ink hover:text-ink;
  }
  .filter-pill-active { @apply border-ink bg-ink text-canvas hover:border-ink hover:text-canvas; }

  /* ---- Media ---- */
  .clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
  .clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .clamp-4 { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }

  .skeleton { @apply relative overflow-hidden bg-raise; }
  .skeleton::after {
    content: "";
    @apply absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/45 to-transparent dark:via-white/[.05];
  }
}

/* ---- Article body: UI sans at 18/1.62, capped at 70ch ---- */
.article-body { @apply text-[18px] leading-[1.62] text-ink-soft; --measure: 70ch; }
.article-body > * { max-width: var(--measure); }
.article-body > * + * { @apply mt-[1.1em]; }
.article-body h2 {
  @apply mb-1 mt-11 font-display text-[26px] font-bold leading-[1.1] tracking-[-0.02em] text-ink sm:text-[30px];
  font-stretch: 88%;
}
.article-body h3 {
  @apply mb-1 mt-8 font-display text-[20px] font-bold leading-tight tracking-[-0.015em] text-ink sm:text-[22px];
  font-stretch: 88%;
}
.article-body h4 { @apply mb-1 mt-6 font-mono text-[12px] font-medium uppercase tracking-eyebrow text-ink-mute; }
.article-body h2, .article-body h3 { scroll-margin-top: 7rem; }
.article-body a {
  @apply font-medium text-ink underline decoration-accent decoration-2 underline-offset-[3px] transition-colors hover:text-accent;
}
.article-body strong { @apply font-semibold text-ink; }
.article-body ul { @apply list-none space-y-1.5 pl-0; }
.article-body ul > li { @apply relative pl-5; }
.article-body ul > li::before { content: ""; @apply absolute left-0 top-[0.62em] h-1.5 w-1.5 bg-accent; }
.article-body ol { @apply list-decimal space-y-1.5 pl-6 marker:font-mono marker:text-[13px] marker:text-accent; }
.article-body blockquote {
  @apply my-7 border-l-2 border-accent py-0.5 pl-5 font-display text-[21px] font-medium leading-[1.25] tracking-[-0.015em] text-ink;
  font-stretch: 88%;
}
.article-body blockquote p { @apply text-inherit; }
.article-body img { max-width: 100%; }
.article-body figure { max-width: none; @apply my-7; }
.article-body img[data-linked="false"] { cursor: zoom-in; }
.article-body a img { cursor: pointer; transition: opacity 0.2s ease; }
.article-body a:hover img { opacity: 0.9; }
.article-body a:has(img) { position: relative; display: inline-block; }
.article-body figure figcaption {
  @apply mt-2 border-l-2 border-line pl-3 font-mono text-[11px] leading-relaxed text-ink-mute;
  max-width: var(--measure);
}
.article-body pre { max-width: none; @apply overflow-x-auto bg-ink-950 p-4 font-mono text-[13px] leading-relaxed text-ink-100; }
.article-body code { @apply bg-raise px-1.5 py-0.5 font-mono text-[0.84em] text-ink; }
.article-body pre code { @apply bg-transparent p-0 text-ink-100; }
.article-body table { max-width: none; @apply w-full border-collapse text-left text-[14px]; }
.article-body th, .article-body td { @apply border-b border-line px-3 py-2; }
.article-body th { @apply border-b-2 border-ink font-mono text-[10px] font-medium uppercase tracking-eyebrow text-ink; }
.article-body hr { @apply my-9 border-0; height: 2px; background: rgb(var(--ink)); }
.article-body .table-scroll { @apply overflow-x-auto; max-width: none; }
.article-body iframe { max-width: none; @apply aspect-video w-full; }

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

The same file also contains an **admin panel** block (`.adm-card`, `.adm-input`, `.adm-btn*`,
`.adm-table`, `.rte` …) that intentionally uses the old rounded/brand styling and is namespaced
`adm-` so it never leaks into the public site. It is not part of this design language; keep
whatever the admin already uses.

---

## 2. Colour

### 2.1 Tokens

All colours are CSS variables stored as space-separated RGB so Tailwind opacity modifiers work
(`bg-canvas/90`, `text-canvas/60`).

| Token | Role | Light | Dark |
|---|---|---|---|
| `canvas` | page ground, masthead, drawer | `245 245 246` `#f5f5f6` | `9 9 11` `#09090b` |
| `paper` | dropdowns, menus, search field, scroll buttons | `255 255 255` `#ffffff` | `19 19 22` `#131316` |
| `raise` | image wells, skeletons, hover fill, inline code | `238 238 241` `#eeeef1` | `30 30 35` `#1e1e23` |
| `line` | 1px dividers, pill borders | `219 219 224` `#dbdbe0` | `41 41 47` `#29292f` |
| `line-strong` | slash separators, idle rank numerals, newsletter underline | `186 186 194` `#babac2` | `66 66 75` `#42424b` |
| `ink` | primary text, every structural rule, primary button fill | `10 10 12` `#0a0a0c` | `250 250 252` `#fafafc` |
| `ink-soft` | body copy, excerpts, idle nav, category chips | `82 82 91` `#52525b` | `161 161 172` `#a1a1ac` |
| `ink-mute` | meta, eyebrows, placeholders, timestamps | `128 128 138` `#80808a` | `115 115 126` `#73737e` |
| `accent` | the signal | `255 59 20` `#ff3b14` | `255 92 54` `#ff5c36` |

Static ramps (don't flip with theme): `ink-50…950` (Tailwind zinc) and `brand-50…950`
(accent ramp, `brand-500 = #ff3b14`). They are used for fixed-dark surfaces: the hero slider
(`bg-ink-950`), modal backdrops (`bg-ink-950/95`), code blocks (`bg-ink-950 text-ink-100`), and the
hover colour of links on dark (`hover:text-brand-300` = `#ff9271`).

Note: because `ink` inverts in dark mode, `bg-ink text-canvas` surfaces (the "long read" band, the
brand newsletter, primary buttons, filter-pill-active) become **light-on-dark in light mode and
dark-on-light in dark mode**. That inversion is intentional.

### 2.2 Where the accent is allowed

- `chip-live` labels ("Breaking", "Top story", tile badges) — the only filled label.
- Hover state of every headline link, `link-muted`, footer link, and `btn-primary` (fills accent).
- Active indicators: 2px underline under the active section nav link, 1px under the active
  category, underline decoration on active sort/period/type toggles, TOC active left border.
- Rank numerals (`01`–`05` in Most-read rails, podium `01`–`03`), section index numbers.
- Reading progress bar, slider timing bar, heat bars in Trending/Most read.
- Article body: link underlines, `ul` square bullets, `ol` markers, blockquote left border.
- Selection background, focus ring.
- Logo signal block and footer wordmark full stop.
- Newsletter `accent` variant (the one full-colour surface), "Now covering" label on the tape,
  "Read the story" button on the long-read band, video play squares, current pagination page.
- Error text (form errors use `text-accent`, there is no separate red).

Never colour categories; `accentFor()` returns the same monochrome set for every category
(`{ text: "text-ink-soft", bg: "bg-raise", dot: "bg-accent" }`).

---

## 3. Typography

### 3.1 Families

| Tailwind | Font | Use |
|---|---|---|
| `font-sans` (default) | Inter 400/500/600/700 | UI text, excerpts, article body |
| `font-display` (and `font-serif` alias) | Archivo, variable width, 400–900 | headlines via `.headline` |
| `font-mono` | JetBrains Mono 400/500/700 | every label, meta, button, counter |

Body gets `font-feature-settings: "cv11", "ss01", "tnum"` and `antialiased`.

### 3.2 Roles

| Class | Spec |
|---|---|
| `.headline` | Archivo bold, `leading-[1.06]`, `tracking-[-0.02em]`, `font-stretch: 88%`, `text-ink` |
| `.eyebrow` | mono 10px medium uppercase, `leading-none`, `tracking-[0.1em]`, `text-ink-mute` |
| `.eyebrow-accent` | eyebrow in `text-accent` |
| `.meta` | mono 11px, `leading-none`, `text-ink-mute` (not uppercase) |
| `.link-muted` | mono 11px medium uppercase tracked, `text-ink-soft`, hover `text-accent` |
| `.chip` | mono 10px medium uppercase tracked, inline-flex, `gap-1.5` |
| `.chip-live` | chip + `bg-accent px-1.5 py-1 font-bold text-white` |

Wordmarks use Archivo **extrabold** uppercase at `font-stretch: 80%` (set inline via
`style={{ fontStretch: "80%" }}`) with `tracking-[-0.035em]`.

### 3.3 Type scale (every size used)

| Context | Size |
|---|---|
| Hero slider H1 | `text-[32px] sm:text-[48px] lg:text-[64px]` |
| PageHeader H1 (uppercase) | `text-[38px] sm:text-[52px] lg:text-[60px]` |
| Article H1 | `text-[34px] sm:text-[46px] lg:text-[56px]` (not uppercase), `max-w-5xl` |
| Footer wordmark (uppercase, 80% width) | `text-[38px] sm:text-[46px]` |
| 404 H1 | `text-[34px] sm:text-[44px]` |
| Long-read H2 | `text-[30px] sm:text-[40px]` |
| Empty/Error state title (uppercase) | `text-[28px] sm:text-[34px]` |
| Latest lead headline | `text-[28px] sm:text-[34px]` |
| Newsletter headline | `text-[26px] sm:text-[32px]` (compact: `text-[20px]`) |
| SectionHeader title / "You might also like" | `text-[24px] sm:text-[28px]` |
| Video hero title | `text-[26px] sm:text-[30px]` |
| ArticleCard lead | `text-[28px]` |
| WideRow | `text-[22px]` (dense `text-[19px]`) |
| "Written by" author name, gallery viewer title | `text-[22px]` |
| Popular row view count | `text-[21px]` |
| Mobile drawer section links (uppercase) | `text-[20px]` |
| Categories page name | `text-[20px]` |
| ArticleCard default, podium, CategoryGrid name, desk titles | `text-[19px]` |
| Latest day-row headline, stat numbers, video modal title, house ad | `text-[18px]` |
| TileCard / flyout header / tape topic / leaderboard row / prev-next | `text-[17px]` |
| TileCard compact | `text-[15.5px]` |
| VideoCard, deals, further reading | `text-[16px]` |
| ListRow / RankRow / Up next / Most shared | `text-[15px]` |
| Flyout item, search result | `text-[14px]` |
| Slider tab headline | `text-[13.5px]` |
| Standfirst (article) / search page input / "why trending" | `text-[17px]` |
| Lead excerpts, long-read dek, slider dek | `text-[15px]` |
| Excerpt / subtitle / description copy | `text-[13.5px]` |
| Footer blurb, author bio, sources | `text-[14px]` |
| Small UI text (nav category, drawer topics, link lists, captions) | `text-[13px]` |
| Dateline headline | `text-[12.5px]` |
| Micro (eyebrow/chip) | `text-[10px]`; meta / link-muted / btn / pill: `text-[11px]` |

Line-height for prose: `leading-relaxed`. Paragraph copy width caps: `max-w-sm`, `max-w-md`,
`max-w-xl`, `max-w-2xl`, `max-w-3xl` depending on context.

---

## 4. Shape, rules, elevation

- Radius: 0 everywhere (see config). `rounded-full` only for: author avatars, the bookmark dot in
  the header, circular play buttons on the Video page.
- Shadow: `shadow-pop` only (hard 6px offset, ink at 10%) — used by the "All topics" dropdown,
  search suggestions, category flyout.
- Rules vocabulary:
  - `border-b-2 border-ink` — under the sticky masthead (`glass-masthead`), under every PageHeader,
    top of footer (`border-t-2`), mobile drawer header.
  - `rule-strong` (`border-t-2 border-ink`) — top of every SectionHeader, sidebar module ("Rail"),
    article appended section, ArticleFeed toolbar, plain newsletter, empty/error states.
  - `rule-card` (`border-t border-ink`) — top of each card's text block, PanelHeader.
  - `border-b border-ink` — Latest day-group header, podium rank header, TOC title, archive heads.
  - `border-y border-line` — byline bar, share bar, lists wrapped top and bottom.
  - `divide-y divide-line` — all vertical lists of rows.
  - `border-y-2 border-ink` — the editorial fallback "house ad" strip.
- Hover on bordered rows: `hover:border-ink` (border darkens from line to ink).

---

## 5. Layout

### 5.1 Container

`container` = centred, side padding 16px → 20px (sm) → 24px (lg) → 32px (xl); max width 100%
up to md, **1160px** at lg, **1320px** at xl, **1440px** at 2xl.

### 5.2 Grid conventions

- Main + sidebar: `grid gap-9 lg:grid-cols-12 lg:gap-10` with `lg:col-span-8` / `lg:col-span-4`
  (home latest uses `gap-10`). Always `min-w-0` on columns.
- Sticky sidebars: `space-y-9 lg:sticky lg:top-28`.
- Card grids: `grid gap-x-6 gap-y-9`; listing default columns `sm:grid-cols-2 lg:grid-cols-4`.
- Content pages (About/Contact/Newsletter): `container grid gap-14 py-14 lg:grid-cols-12 lg:gap-20`.
- Page body under a PageHeader: `container py-9`.
- Home stack: `container space-y-12 py-10 sm:space-y-14 sm:py-12`.
- Gallery wall: `grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4`.

### 5.3 "No orphan cells" rule

Grid column count never exceeds item count, and bands are trimmed to whole rows:

```ts
function columnsFor(count: number, wide = false): string {
  if (wide && count >= 6) return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6";
  if (count >= 4) return "grid-cols-2 lg:grid-cols-4";
  if (count === 3) return "grid-cols-2 sm:grid-cols-3";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2";
  return "grid-cols-1";
}
```

---

## 6. Motion

| Thing | Spec |
|---|---|
| Card image hover | `transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]` (list thumbs: `duration-500 group-hover:scale-[1.04]`; big leads `duration-[900ms]` + `scale-[1.02]`/`[1.03]`) |
| Headline hover | `transition-colors group-hover:text-accent` (whole card is a `group`) |
| Arrow nudge | `transition-transform duration-200 group-hover:translate-x-0.5` |
| Buttons | `transition-colors duration-150` |
| Image load | img starts `opacity-0`, becomes `opacity-100` (`transition-all duration-500`) over a shimmer skeleton |
| Skeleton shimmer | `shimmer 1.4s infinite`, white/45 band (white/5 in dark) |
| Masthead shrink | dateline `h-8 → h-0` + fade, bar `h-[60px] sm:h-[66px] → h-[52px]`, `transition-[height,opacity] duration-300`, trigger `scrollY > 32` |
| Hero slide | crossfade `transition-opacity duration-700 ease-out`, live image `animate-slow-zoom` (scale 1→1.05 over 7s), copy `animate-fade-up` |
| Slider timing bar | `animate-progress` (scaleX 0→1, `origin-left`), duration = interval 7000ms |
| Topic tape | `animate-marquee` 46s linear infinite, paused on hover |
| Flyout | open delay 110ms, close delay 160ms |
| Reading progress | `transition-[width] duration-150` |
| Reduced motion | all animations/transitions collapse to 0.01ms; slider starts stopped |

---

## 7. Icons

`lucide-react`, stroke default. Sizes: `h-3 w-3` (inline arrows in link-muted, chevrons),
`h-3.5 w-3.5` (search, small actions), `h-4 w-4` (share/like/save, scroll chevrons, socials),
`h-[18px] w-[18px]` (header actions), `h-5 w-5` (menu/close). Always `aria-hidden="true"`.
Icons used: `ArrowRight`, `ArrowUpRight`, `Bookmark`, `BookmarkCheck`, `Check`, `ChevronDown`,
`ChevronLeft`, `ChevronRight`, `Clock3`, `ExternalLink`, `Facebook`, `Heart`, `ImageOff`,
`Instagram`, `Link2`, `Linkedin`, `Loader2` (`animate-spin`), `Menu`, `Moon`, `Pause`, `Play`
(`fill-current`), `RefreshCw`, `Search`, `Share2`, `Sun`, `TrendingUp`, `Twitter`, `X`, `Youtube`.
Cards carry **no** meta icons (no clock/eye glyphs).

---

## 8. Buttons & controls — every variant

| Name | Exact classes | Where |
|---|---|---|
| Primary | `btn-primary` + size, e.g. `h-8 px-3.5` (header Subscribe), `h-11 px-6` (404, video "Read the full story"), `h-11 w-full` (drawer), `h-12 px-8` (contact submit), `h-11 px-6 mt-2` (error boundary) | ink fill, canvas text, hover accent fill |
| Outline | `btn-outline h-10 px-5` (states), `btn-outline h-11 px-6` (404), `btn-outline mt-12 h-12 w-full` (Load more) | 1px ink border, hover inverts |
| Accent on dark | `btn h-10 bg-accent px-5 text-white hover:bg-white hover:text-ink` | Long-read "Read the story" |
| Ghost on dark | `btn h-10 shrink-0 border border-white/30 px-5 text-white hover:border-white hover:bg-white hover:text-ink` | Video modal "Read the story" |
| Header icon button | `flex h-8 w-8 items-center justify-center text-ink-soft transition-colors hover:bg-raise hover:text-ink` | menu, search, theme, bookmarks |
| Share icon button | `inline-flex h-9 w-9 items-center justify-center rounded-sm text-ink-mute transition-colors hover:bg-raise hover:text-ink` | ShareBar |
| Like / Save toggle | `inline-flex h-9 items-center gap-2 rounded-sm border px-3.5 text-[13px] font-medium transition-colors` + idle `border-line text-ink-soft hover:border-ink hover:text-ink`; liked `border-accent text-accent` (heart `fill-current`); saved `border-ink bg-ink text-canvas` | ShareBar |
| Slider control | `flex h-9 w-9 items-center justify-center bg-white/10 text-white backdrop-blur transition-colors hover:bg-accent` (group `gap-px`) | Pause/Play, Prev, Next |
| Rail scroll arrow | `absolute left-0|right-0 z-20 flex h-7 w-7 items-center justify-center rounded-sm border border-line bg-paper text-ink-soft transition-colors hover:border-ink hover:text-ink` | CategoryStrip |
| Social square | `flex h-8 w-8 items-center justify-center border border-line text-ink-soft transition-colors hover:border-ink hover:bg-ink hover:text-canvas` | Footer |
| Filter pill | `filter-pill` / active adds `filter-pill-active`; count `<span className="ml-1.5 tabular-nums opacity-45">` | FilterBar, search suggestions, article topics |
| Sort text toggle | `font-mono text-[11px] uppercase tracking-eyebrow transition-colors` + active `text-ink underline decoration-accent decoration-2 underline-offset-[5px]` / idle `text-ink-mute hover:text-ink` | ArticleFeed |
| Period text toggle | `text-[13px] transition-colors` + active `font-semibold text-ink underline decoration-accent decoration-2 underline-offset-[6px]` / idle `text-ink-mute hover:text-ink` | Most read |
| Type toggle (Serif/Sans) | `transition-colors` + active `font-medium text-ink underline decoration-accent decoration-2 underline-offset-4` / idle `hover:text-ink`, inside `meta` row | Article |
| Size toggle (A A A) | `leading-none transition-colors` + `text-[12px]`/`[14px]`/`[16px]`; active `font-semibold text-ink` | Article |
| Pagination | base `inline-flex h-9 min-w-9 items-center justify-center px-3 font-mono text-[11px] uppercase tracking-eyebrow transition-colors`; current `bg-accent text-white`; other `text-ink-soft hover:bg-raise hover:text-ink`; Prev/Next `text-ink-soft hover:text-accent disabled:cursor-not-allowed disabled:opacity-30`; gap `…` in `px-1 text-ink-mute`; nav `mt-10 flex flex-wrap items-center justify-center gap-1 border-t border-line pt-5`; window ±1 around current + first + last | ArticleFeed |
| Browse trigger | `inline-flex h-9 items-center gap-1.5 pr-3.5 font-mono text-[11px] font-medium uppercase tracking-eyebrow text-ink transition-colors hover:text-accent` + `ChevronDown h-3 w-3` rotating 180° when open | Section rail "All topics" |
| Newsletter submit | text-button inside underline field: `inline-flex h-10 shrink-0 items-center gap-2 px-1 font-mono text-[11px] font-medium uppercase tracking-eyebrow transition-colors disabled:opacity-60` | Newsletter |
| Search page submit | `h-12 shrink-0 text-[13px] font-semibold text-ink transition-colors hover:text-accent` | Search page |
| Article CTA block | `mt-12 flex h-12 items-center justify-center gap-2 px-6 text-center text-[13px] font-semibold transition-colors` + solid `bg-ink text-canvas hover:bg-accent` or ghost `border border-line-strong text-ink hover:border-ink`, trailing `ArrowRight h-4 w-4` | Article |
| Modal close | `absolute right-4 top-4 rounded-sm p-2 text-white/70 transition-colors hover:text-white` (`right-5 top-5` in gallery/video) | Lightbox, viewers |
| Search clear | `rounded-sm p-1 text-ink-mute transition-colors hover:text-ink` | SearchBox |
| Skip link | `sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-canvas` | Layout |
| ⌘K hint | `hidden shrink-0 rounded-sm border border-line px-1.5 py-0.5 font-sans text-[10px] font-medium text-ink-mute lg:block` | SearchBox |

Labels on buttons are short and sentence-case in source ("Subscribe", "Try again", "Load more
stories") and render uppercase because `.btn` is uppercase mono.

---

## 9. Links

- `link-muted` — all "See all / View all / Leaderboard / About / Contact" style links.
- Section "action" link: `link-muted group inline-flex shrink-0 items-center gap-1.5` + `ArrowRight
  h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5`.
- Footer / sitemap / list links: `text-[13px] text-ink-soft transition-colors hover:text-accent`
  (sitemap `block py-3 text-[14px]`).
- Inline prose link: underline `decoration-accent decoration-2 underline-offset-[3px]`, text-ink,
  hover text-accent. Mailto links on Contact: `decoration-[1.5px]`.
- Breadcrumbs: in `meta`, `Home / Section / Page` with `/` in `text-line-strong`; links
  `transition-colors hover:text-accent` (article page uses `hover:text-ink`); current crumb
  `text-ink-soft`.

---

## 10. Components

### 10.1 Logo

```tsx
<Link to="/" aria-label="TheTrendSnap — home"
      className="group inline-flex flex-col justify-center leading-none">
  <span className="flex items-center gap-2">
    <span aria-hidden="true"
      className="block shrink-0 bg-accent transition-transform duration-200 group-hover:scale-y-[1.15] h-5 w-[3px]" />
      {/* compact: h-4 w-[3px] */}
    <span className="font-display font-extrabold uppercase tracking-[-0.035em] text-[21px] text-ink"
          style={{ fontStretch: "80%" }}>TheTrendSnap</span>   {/* compact: text-[18px] */}
  </span>
  {/* not compact only */}
  <span className="eyebrow mt-1.5 hidden pl-[11px] sm:block text-ink-mute">What comes next</span>
</Link>
```

A 3px-wide accent bar + condensed uppercase wordmark + mono tagline indented to align with the
wordmark. `tone="light"` swaps to `text-white` / `text-white/50`. Compact when the masthead is
scrolled and in the mobile drawer.

### 10.2 Header (sticky, three bands)

`<header className="sticky top-0 z-50 glass-masthead">` (canvas at 90% + `backdrop-blur-xl` +
2px ink bottom rule).

**Band 1 — Dateline** (lg+ only; collapses on scroll):
`hidden overflow-hidden border-b border-line transition-[height,opacity] duration-300 lg:block` +
`h-8 opacity-100` / scrolled `h-0 opacity-0`. Inside `container flex h-8 items-center
justify-between gap-6`:
- left: today's date `meta shrink-0`, format `Thursday, September 11, 2026`
  (`weekday long, month long, day numeric, year numeric`).
- centre: `chip-live shrink-0` "Breaking" + the single most urgent headline
  (`breaking[0] || trending[0] || latest[0]`) as `truncate text-[12.5px] font-medium text-ink
  hover:text-accent`. One headline, never a scrolling ticker.
- right: `link-muted` "About", "Contact" (`gap-5`).

**Band 2 — Masthead** `container` > `flex items-center gap-3 lg:gap-8` height
`h-[60px] sm:h-[66px]` → scrolled `h-[52px]`:
1. Mobile menu icon button (`-ml-2 lg:hidden`, `Menu h-5 w-5`).
2. Logo (compact when scrolled).
3. Section nav (lg+): `gap-5`, links Latest `/latest`, Trending `/trending`, Most read `/popular`,
   Video `/videos`, Photography `/gallery`. Link class:
   `relative whitespace-nowrap py-1 font-mono text-[11px] font-medium uppercase tracking-eyebrow
   transition-colors` + idle `text-ink-soft hover:text-ink` / active `text-ink` plus a 2px accent
   bar `after:absolute after:inset-x-0 after:-bottom-1 after:h-[2px] after:bg-accent after:content-['']`.
4. SearchBox (md+): `ml-auto hidden w-full max-w-[240px] md:block xl:max-w-[280px]`.
5. Actions `ml-auto flex shrink-0 items-center gap-1 md:ml-0`: mobile search toggle (`md:hidden`),
   theme toggle (Moon in light / Sun in dark), bookmarks link with a `absolute right-1 top-1 h-1.5
   w-1.5 rounded-full bg-accent` dot when the reading list is non-empty, and
   `btn-primary ml-2 hidden h-8 px-3.5 sm:inline-flex` "Subscribe" → `/newsletter`.
6. Mobile search row (below md, toggled): `pb-3 md:hidden` with an autofocused SearchBox.

**Band 3 — Section rail** `border-t border-line` > `container flex items-center gap-3`:
- "All topics" browse trigger + dropdown (below).
- vertical divider `h-4 w-px shrink-0 bg-line`.
- CategoryStrip (categories with `showInMenu !== false`).

**Browse dropdown**: `absolute left-0 top-10 z-50 w-[min(680px,92vw)] overflow-hidden border-2
border-ink bg-paper shadow-pop`.
- Head: `flex items-baseline justify-between border-b border-line px-4 py-2.5` → `eyebrow text-ink`
  "Every topic" + `meta` "{n} sections".
- Grid: `grid max-h-[60vh] grid-cols-2 overflow-y-auto sm:grid-cols-3`; each cell
  `flex items-baseline justify-between gap-2 border-b border-r border-line px-4 py-2 text-[13px]
  transition-colors` idle `text-ink-soft hover:bg-raise hover:text-ink`, active `bg-raise
  font-semibold text-ink`; name `clamp-1`, count `meta shrink-0 tabular-nums`.
- Foot: `link-muted block px-4 py-2.5 text-center` "Browse all topics" → `/categories`.
- Closes on outside mousedown, Escape, and route change.

**Mobile drawer** (`fixed inset-0 z-[60] lg:hidden`): backdrop `absolute inset-0 bg-ink-950/50`;
panel `absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-canvas`.
- Top: `flex items-center justify-between border-b-2 border-ink px-5 py-3.5` compact Logo + close X.
- Body `flex-1 overflow-y-auto px-5 py-5`: SearchBox; `eyebrow mt-7` "Sections"; nav
  `mt-3 border-t border-line` of links `headline block border-b border-line py-2.5 text-[20px]
  uppercase transition-colors` (active `text-accent`, else `text-ink hover:text-accent`);
  `eyebrow mt-7` "Topics"; list of rows `flex items-baseline justify-between gap-3 border-b
  border-line py-2 text-[14px]` (active `font-semibold text-accent`, else `text-ink-soft
  hover:text-ink`) with `meta` counts; `btn-primary mt-6 h-11 w-full` "Subscribe to the newsletter".
- Body scroll is locked while open.

### 10.3 CategoryStrip (horizontal rail)

Wrapper `relative flex min-w-0 flex-1 items-center`. Track `no-scrollbar flex min-w-0 flex-1
cursor-grab items-stretch gap-5 overflow-x-auto scroll-smooth active:cursor-grabbing`.
Edge fades `pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-canvas
to-transparent` (right: `bg-gradient-to-l`), hidden (`opacity-0`) at the respective end; arrow
buttons appear only when scrollable in that direction and scroll by 260px smoothly. Vertical wheel
scrolls sideways; mouse drag scrolls (a drag > 4px suppresses the click); touch uses native
scroll. Re-measures with ResizeObserver and after `document.fonts.ready`.

Each item (CategoryFlyout trigger): `relative flex items-center whitespace-nowrap py-2.5
text-[13px] font-medium transition-colors`, idle `text-ink-soft hover:text-ink`, open/active
`text-ink`, active adds a **1px** accent underline `after:absolute after:inset-x-0 after:bottom-0
after:h-px after:bg-accent`. Label = `category.shortLabel || category.name`.

### 10.4 CategoryFlyout (mega-menu on hover/focus, lg+)

Fixed-position panel (so the scrolling rail never clips it), width 560px, placed at the trigger's
`bottom + 6px`, left clamped to the viewport (12px margin):
`fixed z-[60] hidden overflow-hidden rounded-sm border border-line bg-paper shadow-pop lg:block`.
- Head `flex items-center justify-between gap-3 border-b border-line px-5 py-3`: `headline
  text-[17px]` name + `meta clamp-1 mt-0.5` description (fallback "Latest {name} coverage");
  right "View all ({count}) →" in `inline-flex shrink-0 items-center gap-1.5 text-[12px]
  font-semibold text-ink-soft hover:text-accent`, count `tabular-nums text-ink-mute`.
- Body `grid grid-cols-2 gap-x-5 gap-y-4 p-5` of 4 latest stories: `group flex gap-3`, square
  thumb `w-16`, `headline clamp-2 block text-[14px] group-hover:text-accent`, then
  `mt-1.5 flex items-center gap-1.5 text-[11px] text-ink-mute` "Sep 11, 2026 / 4 min read".
  Loading: 4× (`Skeleton h-16 w-16` + two text bars). Empty: `meta col-span-2 py-4 text-center`
  "No stories published in {name} yet."
- Foot `meta clamp-1 border-t border-line px-4 py-2.5` with `eyebrow mr-1.5 text-ink-soft` "Latest"
  + first story's excerpt (90 chars).
- Data is fetched only once hovered (lazy), then cached.

### 10.5 SearchBox (typeahead)

Field: `flex items-center gap-2 rounded-sm border border-line bg-paper px-3 transition-colors
duration-150 focus-within:border-ink` + height `h-9` (md) / `h-11` (lg). Contents: `Search
h-3.5 w-3.5 text-ink-mute`, input `min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none
placeholder:text-ink-mute [&::-webkit-search-cancel-button]:hidden`, placeholder
"Search stories, reviews, guides…", then either a clear X (when typing) or the `⌘K` kbd (lg+).
⌘K / Ctrl+K focuses it from anywhere. Debounce 260ms; results appear at ≥2 chars; ↑/↓/Enter
keyboard navigation; Escape closes.

Dropdown: `absolute right-0 top-[calc(100%+8px)] z-50 w-[min(400px,88vw)] overflow-hidden
rounded-sm border border-line bg-paper shadow-pop`.
- Empty field: `p-4` with `eyebrow mb-2 flex items-center gap-1.5` + `Clock3` "Recent" (last 5
  searches from localStorage `tts-recent-searches`) as `filter-pill`s, then `TrendingUp` "Popular
  topics" (first 4 categories) as `filter-pill`s, `flex flex-wrap gap-1.5`.
- Searching: `meta flex items-center gap-2 px-5 py-5` spinner "Searching…".
- Results: `max-h-[52vh] divide-y divide-line overflow-y-auto`; each row `flex w-full items-start
  gap-3 px-4 py-3 text-left transition-colors` (active/hover `bg-raise`), `w-12` square thumb,
  `clamp-2 block font-display text-[14px] font-medium leading-snug text-ink` title, meta line
  `mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-mute` = `eyebrow` category • date
  • "N min". Footer button `flex w-full items-center justify-center gap-1.5 border-t border-line
  px-4 py-3 text-[12px] font-semibold text-ink-soft hover:text-accent` "See all results for “q” →".
- No match: `px-5 py-5 text-[13px] text-ink-mute` "No articles match “q”."

### 10.6 Footer

`<footer className="mt-16 border-t-2 border-ink">`
1. Top band `border-b border-line` > `container grid gap-9 py-10 lg:grid-cols-12 lg:gap-12`:
   - `lg:col-span-5`: wordmark `headline text-[38px] uppercase sm:text-[46px]`
     (`fontStretch: 80%`) "TheTrendSnap" + `<span className="text-accent">.</span>`; blurb
     `mt-4 max-w-sm text-[14px] leading-relaxed text-ink-soft` ("Independent reporting on the
     technology, business and culture shaping what comes next — written plainly, sourced openly,
     corrected in public."); social squares `mt-6 flex flex-wrap gap-1.5` (Facebook, X, Instagram,
     YouTube, LinkedIn).
   - `lg:col-span-7`: `NewsletterCard variant="plain"`.
2. Link columns `container grid gap-8 py-9 sm:grid-cols-2 lg:grid-cols-4`: "Editorial" (Latest,
   Trending, Most read, Photography, Video, Reading list), "Topics" (first 6 categories), "Company"
   (About us, Contact, Newsletter, Privacy policy, Terms of use, Sitemap), "Following" (up to 10
   tags, falling back to categories, as an inline wrap `flex flex-wrap gap-x-4 gap-y-2`). Headings
   `eyebrow`; lists `mt-3.5 space-y-2`; links `text-[13px] text-ink-soft hover:text-accent`.
3. Colophon `border-t border-line` > `container flex flex-col items-center justify-between gap-2
   py-5 sm:flex-row`: `meta` "© {year} TheTrendSnap. All rights reserved." and `meta` "Sponsored
   placements are labelled and never shape our reporting."

### 10.7 Layout shell

```tsx
<div className="flex min-h-screen flex-col bg-canvas">
  <ScrollToTop />         {/* scroll to top on pathname change unless there is a hash */}
  <SkipLink />            {/* "Skip to content" → #main */}
  <Header />
  <main id="main" className="flex-1 {hasSticky && 'pb-24 lg:pb-0'}"><Outlet /></main>
  <Footer />
  {/* mobile sticky ad only when booked */}
  <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:hidden">
    <div className="pointer-events-auto container border-t border-line bg-canvas/95 py-2 backdrop-blur">
      <AdSlot position="mobile-sticky-bottom" ratio="aspect-[320/50]" label={false} />
    </div>
  </div>
</div>
```

Route-level loading fallback: `container space-y-8 py-14` with `Skeleton h-12 w-80`,
`Skeleton h-4 w-96`, and `grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3` of six
`Skeleton h-72`.

### 10.8 PageHeader (standing head of every listing/static route)

```tsx
<header className="border-b-2 border-ink">
  <div className="container pb-5 pt-5 sm:pb-6 sm:pt-6">
    <nav aria-label="Breadcrumb" className="meta mb-4 flex flex-wrap items-center gap-1.5">
      Home / Crumb / Current
    </nav>
    <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
      <div className="min-w-0">
        <p className="eyebrow-accent mb-2">{eyebrow}</p>
        <h1 className="headline text-[38px] uppercase sm:text-[52px] lg:text-[60px]">{title}</h1>
      </div>
      <p className="max-w-sm pb-1.5 text-[13.5px] leading-relaxed text-ink-soft">{description}</p>
    </div>
    {children /* filter bars, counts, avatar, search field */}
  </div>
</header>
```

Title and description share one band: huge uppercase condensed title on the left, the short
standfirst bottom-aligned to its baseline on the right.

### 10.9 SectionHeader (home bands)

```tsx
<div className="rule-strong mb-6 pt-2.5">
  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5">
    <div className="flex min-w-0 items-baseline gap-4">
      <span className="font-mono text-[11px] font-medium tabular-nums text-accent">01</span>
      <div className="min-w-0">
        <p className="eyebrow mb-1.5">{kicker}</p>
        <h2 className="headline text-[24px] sm:text-[28px]">{title}</h2>
      </div>
    </div>
    <Link className="link-muted group inline-flex shrink-0 items-center gap-1.5">
      {action} <ArrowRight className="h-3 w-3 ... group-hover:translate-x-0.5" />
    </Link>
  </div>
  <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink-soft">{subtitle}</p>
</div>
```

Numbered bands (01 Featured, 02 Latest, 03 Video, 04 Topics, 05 More) — the number is wayfinding.

### 10.10 Module headers (sidebar "Rail", appended "Section", PanelHeader)

- Rail / sidebar module: `rule-strong flex items-baseline justify-between gap-3 pt-2` →
  `h2.eyebrow text-ink` title + optional `link-muted` action; content `divide-y divide-line`.
- Simple module heading: `h2.eyebrow rule-strong pt-2 text-ink`.
- Article appended Section: `section.mt-10` → `rule-strong flex items-baseline justify-between
  gap-4 pt-2` (eyebrow title + `meta` note) → `div.mt-5` content.
- PanelHeader: `flex items-baseline justify-between gap-3 rule-card px-4 py-2.5` → `eyebrow flex
  items-center gap-2 text-ink` (+ optional icon) + `link-muted shrink-0 whitespace-nowrap`.
- Archive / day-group header: `flex items-baseline justify-between gap-4 border-b border-ink pb-2.5`
  (eyebrow text-ink + meta count).

### 10.11 CategoryChip

- `soft`/`plain` (default): `chip text-ink-soft` (+ `transition-colors hover:text-accent` when
  linked). Plain tracked small caps — no fill.
- `solid` (on photography): `chip rounded-sm bg-black/55 px-2 py-1 text-white backdrop-blur-sm`.
- Category name fallback "News"; href `/category/{slug}` or `/latest`.

### 10.12 ArticleMeta (the meta line on every card)

`flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] leading-none` + `text-ink-mute`
(or `text-white/70` for `tone="light"`). Parts in order: **Author** (`font-medium`, optional) /
**date** (`<time>`, "Sep 11, 2026") / **"N min read"** / **"12.3K reads"** (optional, views > 0).
Separator `/` in `text-line-strong` travels with the item before it (each part is
`flex items-center gap-x-2 whitespace-nowrap`), so wrapped lines never start with a slash.
`compact` keeps only the first two parts. No icons.

### 10.13 Card family

All cards are `group` so hovering anywhere turns the headline accent and zooms the image. Cards
are **not boxes**: picture, then a 1px ink rule, then text.

**ArticleCard** (default grid unit)
```tsx
<article className="group flex h-full flex-col">
  <Link className="block" tabIndex={-1} aria-hidden="true">
    <SmartImage ratio="aspect-[4/3]" width={720}
      imgClassName="transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]" />
  </Link>
  <div className="rule-card mt-3 flex flex-1 flex-col pt-2.5">
    <CategoryChip className="w-fit" />
    <h3 className="headline mt-2 text-[19px]">          {/* lead: text-[28px] */}
      <Link className="clamp-3 transition-colors group-hover:text-accent">{title}</Link>
    </h3>
    <p className="clamp-2 mt-2 leading-relaxed text-ink-soft text-[13.5px]">{excerpt 120}</p>
       {/* lead: max-w-2xl text-[15px], excerpt 180 */}
    <ArticleMeta className="mt-3" showAuthor />
  </div>
</article>
```
`size="lead"` = double-width opening cell (`col-span-2`, `aspect-[16/9]`).

**ArticleTileCard** (dense grids): image `width 800`, optional `chip-live pointer-events-none
absolute left-0 top-0` badge on the image; text block `rule-card mt-2.5 flex flex-1 flex-col
pt-2.5`; headline `text-[17px]` (compact `text-[15.5px]`) `clamp-3`; optional excerpt
`clamp-2 mt-2 text-[13px] leading-relaxed text-ink-soft`; meta `mt-auto pt-2.5 compact` (pinned to
the bottom so rows align).

**ArticleListRow** (sidebars): `group relative flex items-start gap-3 py-3.5` (dense `py-2.5`);
square thumb `w-[72px]` (`duration-500 scale-[1.04]` hover); chip; `headline mt-1.5 text-[15px]`
`clamp-2`; the headline link contains `<span className="absolute inset-0" />` so the whole row is
clickable; meta `mt-1.5 compact`.

**ArticleRankRow** (leaderboards): `group relative flex items-baseline gap-3.5 py-3.5` (dense
`py-3`); rank `w-6 shrink-0 select-none font-mono text-[15px] font-medium leading-none
tabular-nums text-accent` zero-padded `01`; chip; `headline mt-1.5 text-[15px]` clamp-2 with the
full-row overlay link; meta `mt-1.5 showViews compact`.

**ArticleWideRow** (long single-column lists): `group relative flex flex-col gap-4 sm:flex-row
sm:items-start py-5` (dense `py-4`); image `sm:w-[200px]` (dense `sm:w-[152px]`) `aspect-[4/3]`
on the left; chip; `headline mt-1.5 text-[22px]` (dense `[19px]`) clamp-2; excerpt `clamp-2 mt-2
text-[13.5px] leading-relaxed text-ink-soft` (170 / dense 125 chars); meta `mt-2.5 showAuthor
showViews`.

**ArticleVideoCard**: `aspect-video` image with a centred **square** play badge `flex h-10 w-10
items-center justify-center bg-accent text-white transition-transform duration-300
group-hover:scale-105` (`Play ml-0.5 h-3.5 w-3.5 fill-current`); `rule-card mt-2.5 ... pt-2.5`;
`headline mt-2 text-[16px]` clamp-2; meta `mt-auto pt-2.5 compact`.

### 10.14 SmartImage

Wrapper `relative isolate overflow-hidden bg-raise {ratio} rounded-sm(=0)` (`fill` variant:
`absolute inset-0 h-full w-full`). While loading: `absolute inset-0 skeleton`. Image `relative
h-full w-full transition-all duration-500 object-cover object-center`, `opacity-0 → 100` on load,
lazy unless `priority` (then `loading="eager"` + `fetchpriority="high"`). `fit="contain"` adds a
blurred backdrop copy (`absolute inset-0 h-full w-full scale-125 object-cover opacity-60
blur-2xl`) so there are never letterbox bars. Error/empty: `absolute inset-0 flex flex-col
items-center justify-center gap-2 bg-raise text-ink-mute` with `ImageOff h-5 w-5` and an `eyebrow`
"TheTrendSnap". Optional overlay `bg-gradient-to-t from-black/75 via-black/25 to-transparent`.
Cloudinary URLs are resized to 2× the CSS width (`f_auto,q_auto:best,dpr_auto,w_{2x},c_limit`,
capped 2400).

Ratios used: cards `aspect-[4/3]`, leads `aspect-[16/9]`, article lead `aspect-[16/9]
lg:aspect-[2/1]`, thumbs `aspect-square`, video `aspect-video`.

### 10.15 HeroSlider (home opener, full-bleed)

`section.relative.isolate.overflow-hidden.bg-ink-950.text-white`, `aria-roledescription="carousel"`.
Up to 5 slides (hero + rail stories), interval **7000ms**.

- Frame `relative h-[440px] sm:h-[520px] lg:h-[620px]`; every slide is `absolute inset-0
  transition-opacity duration-700 ease-out` (live `opacity-100`, others `pointer-events-none
  opacity-0`); image `fill`, `rounded-none`, width 1920, live one `animate-slow-zoom`.
- Scrims: `absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/75 to-ink-950/15` and (lg)
  `bg-gradient-to-r from-ink-950/85 via-ink-950/25 to-transparent`.
- Whole frame is a link (`absolute inset-0 z-10`, `tabIndex -1`).
- Copy `pointer-events-none absolute inset-x-0 bottom-0 z-10` > `container pb-6` > `max-w-3xl
  animate-fade-up` (re-keyed per slide):
  `chip-live` "Top story" + `chip text-white/70` category (`gap-3`);
  `headline mt-3.5 text-[32px] text-white sm:text-[48px] lg:text-[64px]` (link
  `pointer-events-auto hover:text-brand-300`);
  `clamp-2 mt-3 max-w-2xl text-[15px] leading-relaxed text-white/70` excerpt (180);
  `meta mt-4 ... text-white/55` = author (`text-white/80`) / date / N min read.
- Controls top-right `absolute right-0 top-0 z-20 flex items-center gap-px p-3 sm:p-4`: Pause/Play,
  Prev, Next (slider control buttons, §8).
- Tab strip `relative z-20 border-t border-white/15 bg-ink-950` > `container` > `ul.no-scrollbar
  flex overflow-x-auto`; each `li.relative min-w-[200px] flex-1 border-r border-white/10
  last:border-r-0`, with a timing bar `absolute inset-x-0 top-0 h-[2px] origin-left bg-accent`
  (live+running: `animate-progress`; live+paused: full; others: scaleX(0)). Tab button `flex w-full
  items-start gap-3 px-4 py-3.5 text-left` (live `bg-white/[0.07]`, else `hover:bg-white/[0.04]`):
  `meta` number `01` (live `text-accent`, else `text-white/35`), `chip block` category (`text-white/60`
  / `/35`), `headline clamp-2 mt-1.5 block text-[13.5px]` title (`text-white` / `text-white/60`).
- Behaviour: pauses on hover, on focus within, when the tab is hidden, and when reduced motion is
  preferred (starts stopped); visible pause button; ← / → keys; swipe > 48px on touch.
- Skeleton: `Skeleton h-[440px] w-full sm:h-[520px] lg:h-[620px]` + `grid grid-cols-2 gap-px
  lg:grid-cols-5` of five `Skeleton h-[76px]`.

### 10.16 TopicTape (marquee band under the slider)

```tsx
<section aria-label="Sections we cover" className="group overflow-hidden bg-ink text-canvas">
  <div className="flex items-stretch">
    <p className="eyebrow relative z-10 flex shrink-0 items-center bg-accent px-4 text-white">Now covering</p>
    <ul className="flex w-max animate-marquee items-center py-3 group-hover:[animation-play-state:paused]">
      {/* list rendered twice; the second copy aria-hidden + tabIndex -1 */}
      <li className="flex items-center">
        <span aria-hidden="true" className="px-4 font-mono text-[13px] text-accent">/</span>
        <Link className="headline whitespace-nowrap text-[17px] uppercase text-canvas/75 transition-colors hover:text-canvas">{name}</Link>
      </li>
    </ul>
  </div>
</section>
```
Hidden when fewer than 3 categories.

### 10.17 CategoryGrid ("Browse by topic" — typographic index, no images)

`SectionHeader index={4} title="Browse by topic" kicker="The index" action="All topics"` then
`grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3` of rows: `group flex items-baseline justify-between
gap-4 border-b border-line py-3 transition-colors hover:border-ink`; name `headline clamp-1 block
text-[19px] group-hover:text-accent`; description `clamp-1 mt-1 block text-[12px] text-ink-mute`;
right `meta flex shrink-0 items-baseline gap-2 tabular-nums` count + `ArrowUpRight h-3.5 w-3.5
self-center opacity-0 group-hover:opacity-100`.

### 10.18 NewsletterCard (3 variants × 3 layouts)

Copy is always: eyebrow **"The daily brief"**, headline **"The stories that matter, in two
minutes."**, body **"One email each weekday. Free, and one click to leave."**, placeholder
`your@email.com`, button **Subscribe** → **Subscribed** (with Check), default note **"Join 25,000
readers. No spam, ever."**, errors "Enter a valid email address." / "Subscription failed. Please
try again.", success "You're subscribed. Watch your inbox."

| Variant | Surface | Eyebrow | Headline | Body | Field underline | Input | Button |
|---|---|---|---|---|---|---|---|
| `plain` | `rule-strong pt-4` on page | `text-accent` | ink | `text-ink-soft` | `border-line-strong focus-within:border-accent` | `text-ink placeholder:text-ink-mute` | `text-ink hover:text-accent` |
| `brand` | `bg-ink p-6 text-canvas sm:p-9` | `text-accent` | `text-canvas` | `text-canvas/60` | `border-canvas/25 focus-within:border-accent` | `text-canvas placeholder:text-canvas/40` | `text-canvas hover:text-accent` |
| `accent` | `bg-accent p-6 text-white sm:p-9` | `text-white/70` | `text-white` | `text-white/75` | `border-white/40 focus-within:border-white` | `text-white placeholder:text-white/55` | `text-white hover:text-ink` |

Structure: eyebrow → `headline mt-2.5 text-[26px] sm:text-[32px]` (compact `text-[20px]`) →
`mt-2 text-[13px] leading-relaxed` body → form `mt-5`: a **single underline field** `flex
items-center gap-0 border-b-2 transition-colors` containing input `h-10 w-full min-w-0 flex-1
bg-transparent text-[15px] outline-none` and the text-button submit → note `meta mt-2.5
min-h-[14px]` (error in `text-accent`, `role="alert"`).
Layouts: `stack` (default), `row` (`flex flex-col gap-7 lg:flex-row lg:items-end
lg:justify-between`, copy `max-w-md`, form `w-full lg:mt-0 lg:max-w-md`), `compact` (`pt-3.5` on
plain / `p-5` on inverted, smaller headline). No boxed inputs, no icons, no gradients.

### 10.19 AdSlot

Booked: `aside.w-full` with `eyebrow mb-2 text-center` "Advertisement" (unless `label={false}`) and
`overflow-hidden border border-line bg-raise` frame; image creatives use `SmartImage fit="contain"
rounded-none` at a fixed ratio so layout never shifts; link hover `opacity-90`;
`rel="noopener noreferrer sponsored"`. Unbooked: renders **nothing** (so spacing must live on
parents), or with `VITE_AD_PLACEHOLDER=true` a dashed box `eyebrow flex items-center justify-center
border border-dashed border-line-strong bg-raise` "Ad zone / {position}", or with
`editorialFallback` a house strip `border-y-2 border-ink py-3.5` ("From TheTrendSnap" eyebrow-accent,
`headline mt-1.5 text-[18px]` "The daily brief: what happened, and what it means, in two
minutes.", `link-muted text-ink` "Subscribe free →").
Ratios: default `aspect-[970/140]`, home-mid `aspect-[1200/200]`, article-inline
`aspect-[970/180]`, sidebar `aspect-[300/250]`, sticky sidebar `aspect-[300/600]`, mobile sticky
`aspect-[320/50]`.

### 10.20 Skeletons

`Skeleton` = `div.skeleton` (raise fill + shimmer). `CardSkeleton`: `space-y-2.5` → `aspect-[4/3]
w-full`, `mt-3 h-2.5 w-16`, `h-4 w-full`, `h-4 w-2/3`, `h-2.5 w-24`. Compact: `flex gap-3 py-3` →
`h-14 w-16` thumb + `h-2.5 w-16`, `h-3.5 w-full`, `h-3.5 w-3/4`. `ListSkeleton` = compact rows in
`divide-y divide-line` or cards in `grid gap-6 sm:grid-cols-2 lg:grid-cols-4`.

### 10.21 Empty / Error states

```tsx
<div className="rule-strong py-12 text-center sm:py-16">
  <p className="eyebrow-accent">{"No results" | "Something went wrong"}</p>
  <h3 className="headline mx-auto mt-3 max-w-lg text-[28px] uppercase sm:text-[34px]">{title}</h3>
  <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-ink-soft">{message}</p>
  <div className="mt-6 flex justify-center">
    <button className="btn-outline h-10 px-5"><RefreshCw className="h-3.5 w-3.5" />Try again</button>
  </div>
</div>
```
Defaults — Error: "This didn't load" / "The connection to our newsroom dropped. It's usually
momentary." (action "Try again" or "Back to the homepage"). Empty: "Nothing here yet" / "New
stories are published every day — check back soon." (action "Browse the latest" → `/latest`).
One heavy rule, one condensed line, exactly one way forward.

**ErrorBoundary**: `flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6
text-center` → `headline text-[30px]` "Something broke on our side" → `max-w-md text-[14px]
leading-relaxed text-ink-soft` "The page failed to render. Reloading usually fixes it." →
`btn-primary mt-2 h-11 px-6` "Reload page".

### 10.22 FilterBar

`no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1` of `filter-pill` buttons (first = "All
topics" or a page-specific all-label), active `filter-pill-active`, `aria-pressed`, optional count.
Placed inside PageHeader children with `mt-6`.

### 10.23 ArticleFeed (shared paginated grid)

Toolbar `rule-strong mb-7 flex flex-wrap items-end justify-between gap-x-8 gap-y-3 pt-2.5` with an
optional header on the left and, on the right, `eyebrow hidden sm:inline` "Sort" + text toggles
Latest / Most read / Oldest / A–Z (`gap-4 pb-0.5`). Grid `grid gap-x-6 gap-y-9
sm:grid-cols-2 lg:grid-cols-4` of `ArticleCard` (first 3 priority), 16 per page, an in-feed ad
spanning the row after the 8th card (`sm:col-span-2 lg:col-span-4`, `aspect-[970/140]`), grid dims
to `opacity-50` while refetching. Then Pagination and `meta mt-3.5 text-center` "1–16 of 120
stories". Changing page smooth-scrolls to top; changing filters resets to page 1.

### 10.24 Forms

- **Underlined fields** (Contact): `h-11 w-full border-b border-line bg-transparent text-[15px]
  text-ink outline-none transition-colors placeholder:text-ink-mute focus:border-ink`; textarea adds
  `h-auto py-3 leading-relaxed`, `rows={7}`. Labels `eyebrow mb-1 block` ("Your name *").
  Fields stack `space-y-8`; name/email share `grid gap-8 sm:grid-cols-2`.
- **Search page field**: form `mt-8 flex max-w-xl items-end gap-4 border-b border-line-strong
  focus-within:border-ink`; `Search h-4 w-4 text-ink-mute`; input `h-12 w-full min-w-0
  bg-transparent text-[17px] text-ink outline-none placeholder:text-ink-mute`; text submit.
- Feedback text `text-[13px]`, error `text-accent`, success `text-ink-soft`.
- No boxed/rounded inputs anywhere on the public site except the header SearchBox (a 1px square box).

### 10.25 Article-page components

- **ReadingProgress**: `fixed inset-x-0 top-0 z-[60] h-[2px] bg-transparent` with a `h-full
  bg-accent transition-[width] duration-150` fill, `role="progressbar"`; progress measured over the
  body element (height − 40% of viewport).
- **ShareBar**: `flex flex-wrap items-center justify-between gap-3 border-y border-line py-2.5`;
  left Like (heart + compact count) and Save/Saved toggles; right `eyebrow mr-1 hidden sm:inline`
  "Share" + icon buttons X, Facebook, LinkedIn, Copy link (turns to `Check text-accent` for 2s),
  native Share (`sm:hidden`, when supported). Share popups open 640×520.
- **TableOfContents** (desktop sidebar, ≥2 headings): `eyebrow border-b border-ink pb-3 text-ink`
  "In this story"; `ol.mt-3 max-h-[52vh] space-y-0.5 overflow-y-auto`; items `block border-l-2
  py-1.5 pl-3 text-[13px] leading-snug transition-colors` (h3 `pl-6`), active `border-accent
  font-medium text-ink`, idle `border-line text-ink-mute hover:border-ink hover:text-ink`.
  IntersectionObserver `rootMargin: "-120px 0px -70% 0px"`; click scrolls to `offsetTop - 128`.
  Mobile: `details.mt-7 border-y border-line py-2.5 lg:hidden` with `summary.cursor-pointer
  text-[13px] font-medium text-ink` "In this story (n)".
- **Lightbox**: `fixed inset-0 z-[95] flex flex-col items-center justify-center bg-ink-950/95 p-4`;
  image `max-h-[85vh] max-w-full object-contain`; caption `mt-4 max-w-2xl text-center text-[13px]
  leading-relaxed text-white/60`; Escape/backdrop closes; body scroll locked. Only unlinked images
  open it (`cursor: zoom-in`); linked images follow their link.
- **Byline bar**: `mt-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-y
  border-line py-3`; avatar `h-9 w-9 rounded-full bg-ink font-mono text-[11px] font-medium
  text-canvas` (photo or initials); name `text-[13px] font-medium text-ink` (+ designation
  `ml-2 font-normal text-ink-mute`); `meta mt-1.5` "Sep 11, 2026, 3:04 PM / 6 min read / Updated
  Sep 12, 2026"; right-aligned stats `dl.meta flex gap-x-5` of `dd.font-medium tabular-nums
  text-ink-soft` + `dt` ("12K reads", "340 likes", "58 shares", only non-zero).

---

## 11. Page blueprints

### 11.1 Home `/`

Top to bottom (answers: biggest story → what else now → one long read → what others read):

1. **HeroSlider** full-bleed (hero + 2–4 rail stories).
2. **TopicTape** full-bleed.
3. `container space-y-12 py-10 sm:space-y-14 sm:py-12`:
   1. `AdSlot home-top`.
   2. **01 Featured reporting** (kicker "Chosen by our editors", action "See all" → `/trending`).
      With exactly 5 stories: `grid-cols-2 lg:grid-cols-3`, first card `col-span-2` lead
      (`aspect-[16/9]`, `text-[28px]`); otherwise `columnsFor(n)`; ≤2 stories use 16:9.
      Count = 5 / 3 / 2 depending on supply (≥16 / ≥10 / less).
   3. **The long read** band: `bg-ink px-6 py-9 sm:px-10 sm:py-11` → `grid items-center gap-8
      lg:grid-cols-12 lg:gap-10`; left `lg:col-span-7`: `eyebrow-accent` "The long read",
      `headline mt-3 text-[30px] text-canvas sm:text-[40px]` (hover `text-brand-300`), `clamp-3
      mt-4 max-w-xl text-[15px] leading-relaxed text-canvas/60` excerpt (210), then accent
      "Read the story" button + `meta text-canvas/45` "Author / Category / N min read"; right
      `lg:col-span-5` 4:3 image (900ms zoom).
   4. `AdSlot home-mid aspect-[1200/200]`.
   5. `grid gap-10 lg:grid-cols-12`: left `lg:col-span-8` **02 Latest reporting** (action "View
      all") as 6 dense `ArticleWideRow`s in `divide-y divide-line border-b border-line`; right
      `lg:col-span-4` sticky rail: **Most read** (`rule-strong` eyebrow + "Leaderboard" link, 5
      dense RankRows), **Editors' picks** (4 dense ListRows), plain compact newsletter, sidebar ad
      (`hidden lg:block`). If Latest is empty the rail spans 12 columns as a `columnsFor` grid.
   6. **03 On video** (kicker "Watch", action "All video") — only articles with real videos, up to 4
      VideoCards.
   7. **04 Browse by topic** — CategoryGrid.
   8. Accent newsletter, `layout="row"`.
   9. **05 More from the newsroom** (kicker "Also today", action "Browse the archive") —
      `ArticleTileCard compact`, trimmed to whole rows of 6/4/2, `columnsFor(n, true)`.
   10. `AdSlot home-bottom`.
   Every band claims stories from one deduplicated pool, so no story appears twice (except Most
   read, which is a ranking).

### 11.2 Article `/article/:slug`

`ReadingProgress`, then `container py-7 sm:py-8`:
- `AdSlot article-top mb-8`.
- Standing head (full width): breadcrumb (`meta`, Home / Category / Subcategory); row `mt-5 flex
  flex-wrap items-center gap-x-4 gap-y-2` = `eyebrow-accent` category link + `h-3 w-px bg-line`
  divider + `eyebrow` flags ("Breaking / Featured / Editors' pick / Trending"); H1; standfirst
  `mt-4 max-w-3xl text-[17px] leading-relaxed text-ink-soft` (subtitle, else 240-char excerpt);
  byline bar; optional place line `meta mt-3` ("Destination / Region / Country").
- Lead figure `mt-8`, `aspect-[16/9] lg:aspect-[2/1]`, width 1600, priority; caption `meta mt-2
  flex flex-wrap items-baseline justify-between gap-3` (caption left, "Photograph: {credit}" right).
- `mt-9 grid gap-9 lg:grid-cols-12 lg:gap-10`:
  - `article.lg:col-span-8`: ShareBar → reading controls `meta mt-3.5 flex flex-wrap items-center
    justify-end gap-x-5 gap-y-2` ("Type Serif Sans", "Size A A A") → mobile TOC → body
    `div#article-body.mt-8` rendering `.article-body` (sanitised HTML; tables wrapped in
    `.table-scroll`; h2/h3 get ids). Size classes: Sans `font-sans !text-[17px]`, large
    `!text-[21px]`, larger `!text-[23px]`. (The Serif option applies a `font-editorial-serif`
    class that is not defined in the Tailwind config, so in practice the body stays Inter 18px; to
    make Serif real, add a `fontFamily['editorial-serif']` entry.)
    Then: per-article ad code, `AdSlot article-inline my-10 aspect-[970/180]`, and appended
    Sections, each with the rule-strong eyebrow heading:
    - "Mentioned in this story" (deals): rows `group flex items-center gap-4 py-4` in `divide-y
      divide-line border-y border-line`, `h-14 w-14` product image, `headline clamp-2 text-[16px]`
      title, `meta` price, `link-muted` "Get deal ↗".
    - "Watch": `grid gap-8 sm:grid-cols-2` of `aspect-video` iframes/videos + caption
      (`text-[13px]`, title `font-medium text-ink`, "Watch on {provider}" link).
    - "Gallery" (note "{n} photographs"): `grid grid-cols-2 gap-4 sm:grid-cols-3` square images,
      zoom-in cursor, `meta mt-2` caption.
    - CTA block, external/sponsored links (`text-[13px] font-medium text-ink-soft
      hover:text-accent`, `ExternalLink` icon).
    - "Further reading": rows `group flex items-baseline justify-between gap-4 py-3.5` with
      `headline text-[16px]` + nudging `ArrowRight`.
    - "Topics in this story": `filter-pill` links (tags → `/tag/slug`, keywords → search).
    - "Sources & attribution": "Originally reported by **X**." + URL list `meta break-all underline
      decoration-line-strong underline-offset-2 hover:text-accent`.
    - "Written by": `h-14 w-14 rounded-full bg-ink font-mono text-[15px]` avatar, `headline
      text-[22px]` name, `eyebrow mt-1.5` designation, `mt-3 max-w-xl text-[14px]` bio, links row
      `mt-4 flex flex-wrap gap-x-6 text-[12.5px] font-medium` ("More from this author", Email,
      socials in `capitalize text-ink-mute`).
    - Prev/Next: `mt-10 grid gap-px border-y border-line sm:grid-cols-2`; each `group py-5` with
      `eyebrow` "Previous story"/"Next story" + `headline clamp-2 mt-2 block text-[17px]`; next is
      right-aligned with `sm:border-l sm:pl-8`.
    - `AdSlot article-bottom mt-10`.
  - `aside.lg:col-span-4` sticky `space-y-9 lg:top-28`: TOC (lg), "Editors' related picks", "Most
    read" (RankRows, "Leaderboard"), plain compact newsletter, `AdSlot sidebar-sticky
    aspect-[300/600]`, "More in {Category}" (ListRows, "View all").
- "You might also like": `mt-14` → `rule-strong pt-2.5` + `headline text-[24px] sm:text-[28px]`
  → `mt-6 grid grid-cols-2 gap-x-6 gap-y-9 lg:grid-cols-4` of `ArticleCard showExcerpt={false}`.
- 404 → EmptyState "This story isn't here" / "It may have been moved, renamed or unpublished."

### 11.3 Listing pages (all use PageHeader + `container py-9`)

| Route | Eyebrow / Title / Description | Header children | Body |
|---|---|---|---|
| `/category/:slug` | "Topic" / {name} / {description or "Everything we publish about {name}."} | `eyebrow mt-8` "{n} stories published" | `AdSlot category-top mb-12` + ArticleFeed |
| `/categories` | "Directory" / "Topics" / "Pick a subject and read everything we have published on it." | — | `grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3` rows `group flex gap-5 border-b border-line py-6 hover:border-ink`, optional `w-[76px]` square cover (only if set), `headline clamp-1 text-[20px]` + hover ArrowUpRight, `clamp-2 mt-2 text-[13.5px]` description, `eyebrow mt-3` "{n} stories" |
| `/latest` | "The feed" / "Latest" / "Everything our editors publish, newest first — filed by the day it ran." | FilterBar (with counts) | 8/4 grid. Lead: 16:9 image + `eyebrow-accent` "Just published" \| chip, `headline mt-3.5 text-[28px] sm:text-[34px]`, excerpt `text-[15px]`, `meta` "By Author / date / N min read" (`mb-14`). Then day groups (Today / Yesterday / This week / "Sep 3, 2026") each with a `border-b border-ink` header and rows `group relative flex gap-5 py-5` — text left (chip, `headline text-[18px]` clamp-2, `clamp-1` excerpt, meta with author+views) and a `w-[104px] sm:w-[132px]` 4:3 thumb **on the right**. "Load more stories {n} of {total}" outline button appends. Rail: "Publishing pace" (`dl` rows label `text-[13.5px] text-ink-soft` / value `headline text-[18px] tabular-nums`, plus "Total published"), "Jump to a topic" (8 links with counts), newsletter, ad |
| `/trending` | "Right now" / "Trending" / "Ranked by how much readers are viewing, liking and sharing each story." | FilterBar ("Everything") | Podium `grid gap-x-6 gap-y-9 md:grid-cols-3`: each card starts with `mb-4 flex items-baseline gap-3 border-b border-ink pb-2` = `font-mono text-[26px] font-medium tabular-nums text-accent` "01" + `eyebrow` "12K heat", then 4:3 image, chip, `headline text-[19px]`, `meta` "N reads / N min read". Leaderboard (8 cols): "The full leaderboard", rows `group relative flex items-baseline gap-5 py-5` with idle rank `font-mono text-[16px] text-line-strong group-hover:text-accent`, chip, `headline text-[17px]`, **heat bar** (`h-px w-full max-w-[220px] bg-line` track, `h-px bg-accent` fill, min 6%) + `meta` value, `w-[104px]` thumb (sm+). Rail: "Hottest topics" (rank, name, value, 1px bar), "Most shared", ad. Footer note: `mt-16 border-t border-ink pt-6` `eyebrow-accent` "Why this is trending" + `text-[17px]` title link and `text-ink-soft` excerpt. Heat = views + likes×4 + shares×6 |
| `/popular` | "Reader favourites" / "Most read" / "Ranked purely by how many people actually read each story." | `mt-8 space-y-4`: row `flex flex-wrap items-center gap-6` = `eyebrow` "Period" + text toggles All time / This month / This week + `meta ml-auto` "{views} reads across {n} stories"; FilterBar | Podium like Trending (right side `text-[12px] tabular-nums text-ink-mute` "N reads"). "The rest of the top 30" rows with a right column `headline text-[21px] tabular-nums` count + `eyebrow mt-1` "reads". Rail: "Where readers spend time" bars, "Story of the period", newsletter, ad |
| `/videos` | "Watch" / "Video" / "Explainers, reviews and interviews attached to our reporting." | FilterBar ("All video") | Player band `grid gap-10 lg:grid-cols-12 lg:gap-12`: 8 cols = `bg-black` aspect-video iframe/video, `eyebrow-accent` category, `headline mt-3 text-[26px] sm:text-[30px]`, caption, `meta` date / provider / duration, `btn-primary h-11 px-6` "Read the full story" + "Watch on {provider}". 4 cols "Up next": rows `group flex w-full items-start gap-4 py-4` with `w-[112px]` 16:9 thumb + circular `h-7 w-7 rounded-full bg-canvas/90 text-ink` play. Archive "Every video" (`border-b border-ink pb-3` + `meta` "{n} clips") `mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4`, circular `h-11 w-11` play, duration badge `absolute bottom-2 right-2 bg-black/70 px-1.5 py-0.5 text-[11px] tabular-nums text-white`, "Open the article" link. Player modal `fixed inset-0 z-[95] ... bg-ink-950/95 p-4 sm:p-8`, `max-w-4xl`, autoplay, `eyebrow text-white/45` category + `headline text-[18px] text-white` + ghost-on-dark button |
| `/gallery` | "Picture desk" / "Photography" / "Images from every published story. Open one to read the story behind it." | FilterBar ("All photographs") | `eyebrow mb-6` "{n} photographs from {m} stories"; wall `grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4` of square `rounded-none` images, hover `opacity-85`, no captions/chrome. Viewer: image `max-h-[72vh]`, `eyebrow text-white/45` category, `headline mt-3 text-[22px] text-white hover:text-accent` title, caption `text-white/55`, row "Read the story" (`hover:text-brand-300`) · date `text-white/40` · "Open link ↗" |
| `/search?q=` | "Search" / "Results for “q”" or "Search" / "Find reporting, reviews and guides across every topic we cover." | underlined search form | ArticleFeed or EmptyState "What are you looking for?" |
| `/author/:name` | "Author" / {name} / "Every story filed by {name} for TheTrendSnap." | `mt-8 h-14 w-14 rounded-full bg-ink text-[16px] font-semibold text-canvas` initials | ArticleFeed |
| `/tag/:slug` | "Tag" / {label} / "Everything we have published about {label}." | — | ArticleFeed |
| `/bookmarks` | "Saved" / "Reading list" / "Stories you saved, kept privately in this browser and never sent to us." | — | `grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3` ArticleCards; empty "Nothing saved yet" / "Press Save on any story and it will appear here." |

### 11.4 Static pages

- **About**: PageHeader "Our story" / "About TheTrendSnap"; `container grid gap-14 py-14
  lg:grid-cols-12 lg:gap-20`; `article-body lg:col-span-8` prose (h2 "What we publish", "How we
  work", "Get in touch"); aside "By the numbers" `dl` rows (`eyebrow` label + `headline mt-1.5
  text-[18px]` value: Published / Seven days a week, Coverage / News / Reviews / Guides, Newsletter /
  25,000 subscribers, Corrections / Marked in public, on the story) + plain newsletter.
- **Privacy** ("Legal" / "Privacy policy") and **Terms** ("Legal" / "Terms of use"):
  `container py-14` + `article-body`.
- **Sitemap** ("Index" / "Sitemap"): `container grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-3
  lg:gap-16` of rule-strong lists (Reading / Topics / Company).
- **Newsletter** ("Free, every weekday" / "The daily brief"): 7 cols `NewsletterCard
  variant="brand"` + 5 cols `article-body` "What you get" list.
- **Contact** ("Get in touch" / "Contact"): 7-col underlined form ("Send a message", `btn-primary
  h-12 px-8` "Send message") + 5-col "Desks" `dl` (General enquiries hello@, Story tips tips@,
  Advertising partners@, Newsroom "Remote-first, publishing worldwide"), each `headline
  text-[19px]` + accent-underlined mailto + `text-[13px] text-ink-mute` note.
- **404**: `container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center` →
  `eyebrow-accent` "Error 404" → `headline mt-5 max-w-lg text-[34px] sm:text-[44px]` "This page
  went off the record" → `mt-4 max-w-md text-[14px]` copy → `mt-9 flex gap-4` primary "Back to the
  homepage" + outline "Browse the latest" (both `h-11 px-6`).

---

## 12. Voice & copy

Plain, confident, newsroom register. Short labels, sentence case in source (rendered uppercase by
mono classes). Examples to reuse: "Top story", "Breaking", "Now covering", "The long read", "Read
the story", "Chosen by our editors", "Featured reporting", "Latest reporting", "Most read",
"Leaderboard", "Editors' picks", "On video", "Browse by topic", "The index", "More from the
newsroom", "Also today", "Browse the archive", "Just published", "Publishing pace", "Jump to a
topic", "In this story", "Written by", "You might also like", "Sources & attribution",
"Mentioned in this story", "Further reading", "Topics in this story", "Previous story" / "Next
story", "Every topic", "Browse all topics", "Reading list", "What comes next" (tagline).
Fallback author: "TheTrendSnap Desk". Read time: "N min read" (200 wpm, min 1). Dates:
`Sep 11, 2026` (`month short, day numeric, year numeric`); with time `Sep 11, 2026, 3:04 PM`.
Large numbers compact: `12.3K`.

---

## 13. Accessibility & behaviour checklist

- Focus ring everywhere: 2px accent ring, 2px offset in canvas colour (`:focus-visible`).
- Skip link to `#main`; landmark `nav`s have `aria-label`s (Sections, Topics, Breadcrumb,
  Pagination, On this page).
- Card images are duplicated links with `tabIndex={-1} aria-hidden="true"`; the headline is the
  real link. Row components use an `absolute inset-0` span inside the headline link for full-row
  clicks.
- Toggles use `aria-pressed`; current page/tab use `aria-current`; dropdowns `aria-expanded`.
- Escape closes every menu, drawer, flyout, dialog; dialogs lock body scroll; backdrops close on
  click.
- Carousel: pause button, pauses on hover/focus/hidden tab, reduced-motion aware, arrow keys, swipe.
- `prefers-reduced-motion` collapses all animation.
- Sponsored links carry `rel="sponsored"`; external links `noopener noreferrer`.

---

## 14. Do / Don't

**Do**: square corners · rules to structure · one accent · mono uppercase micro-type ·
condensed bold headlines · generous but tight `gap-x-6 gap-y-9` grids · `divide-y divide-line`
lists · slash separators · zero-padded rank numerals in accent · hover = accent headline + 3%
image zoom · inverted `bg-ink` bands for emphasis · typographic indexes instead of borrowed cover
images.

**Don't**: rounded cards or pills · soft/blurred shadows · gradients as decoration (only image
scrims and rail edge-fades) · colour-coded categories · icons in card meta · bullet separators ·
filled segmented button groups for sort (use underlined text toggles) · boxed form fields (use a
single underline) · scrolling headline tickers · empty grid cells or orphan cards · more than one
accent colour.
