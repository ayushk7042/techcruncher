# TechCruncher web

Public news site and newsroom admin panel for TechCruncher, built with Next.js (App Router), TypeScript and Tailwind CSS. It talks to the Express API in [`../admin.techcruncher.com`](../admin.techcruncher.com).

The visual system follows [`../DESIGN_LANGUAGE.md`](../DESIGN_LANGUAGE.md): square corners, rules instead of boxes, one accent colour, condensed Archivo headlines, JetBrains Mono micro-type.

## Getting started

```bash
cp .env.example .env.local   # point NEXT_PUBLIC_API_BASE_URL at the API
npm install
npm run dev                  # http://localhost:5199
```

The API must be running (`cd ../admin.techcruncher.com && npm run dev`). Its CORS setup already accepts any `localhost` origin outside production.

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server on port 5199 |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint (Next core-web-vitals + TypeScript rules) |
| `npm run typecheck` | `tsc --noEmit` |

### Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | API base including `/api`, e.g. `https://admin.techcruncher.com/api` |
| `NEXT_PUBLIC_SITE_URL` | Public origin, used for canonical URLs, share links, `sitemap.xml` |
| `NEXT_PUBLIC_AD_PLACEHOLDER` | `true` shows dashed boxes where no ad is booked |

## Structure

```
src/
  app/
    (site)/            public routes: home, news/[slug], category/[slug], latest, trending,
                       popular, videos, gallery, search, tag/[slug], author/[name],
                       bookmarks, about, contact, newsletter, privacy, terms, sitemap
    admin/login        sign-in
    admin/(panel)/     dashboard, news, categories, tags, media, import, homepage, ads,
                       contacts, subscribers (guarded by AdminShell)
    sitemap.ts, robots.ts
  components/
    site/              public UI (header, footer, cards, feeds, article, home bands)
    admin/             panel UI; ui.tsx and controls.tsx hold shared primitives
    ui/                SmartImage, Skeleton, SocialIcon
  lib/
    api/client.ts      fetch wrapper, ApiError, auth header, 401 event
    api/public.ts      unauthenticated endpoints (server + browser)
    api/admin.ts       authenticated endpoints
    api/server-data.ts cached server loaders that degrade to empty data
    article-html.ts    sanitises article HTML, converts legacy content blocks, builds the TOC
    home.ts            merges the auto feed with homepage curation into bands
  hooks/               theme, bookmarks, localStorage values, URL state, hydration
  config/site.ts       brand name, socials, desks, API base URL
  types/api.ts         every API shape in one place
```

## How it maps to the API

| Area | Endpoints |
| --- | --- |
| Home | `GET /news/homefeed`, `GET /homepage` (manual rails override the auto feed), `GET /news/list` |
| Article | `GET /news/:slug` (counts a view), `GET /news/related/:slug`, `POST /news/:slug/like`, `POST /news/:slug/share` |
| Listings | `GET /news/list` with `category`, `subCategory`, `tag` (id), `author`, `search`, `sort`, `dateFrom` |
| Navigation | `GET /categories?withCounts=true`, `GET /categories/:slug`, `GET /tags`, `GET /news/search` |
| Ads | `GET /ads/serve?position=&device=&category=`, impression and click tracking |
| Reader actions | `POST /newsletter/subscribe`, `POST /newsletter/unsubscribe`, `POST /contact` |
| Admin | `/auth/login`, `/dashboard`, `/auto-news/run`, full CRUD + bulk on `/news`, `/categories`, `/tags`, `/media`, `/ads`, `/homepage`, `/contact`, `/newsletter`, `/import` |

Admin sessions store the JWT in `localStorage`; any 401 signs the editor out. Editors without `canPublish` / `canDelete` see those actions disabled.

## Rendering notes

- Public pages are server-rendered with ISR (`revalidate` 60–300 s). Articles are fetched with `no-store` so each visit is counted once.
- Filters, sort and pagination live in the query string and update without a server round trip; the first page is server-rendered for SEO.
- Reading list, likes, recent searches, theme and reader preferences are stored only in the browser.
